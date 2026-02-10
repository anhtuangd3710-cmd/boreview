import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';
import {
  withPublicRateLimit,
  SAFE_POST_FIELDS,
  toSafePost,
  withCacheHeaders
} from '@/lib/api-middleware';

// ============================================
// GET /api/posts - Public API with rate limiting
// Only returns safe fields (no internal IDs, emails)
// ============================================
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Max 50 per request
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'latest';

    const skip = (page - 1) * limit;

    // Only allow published posts for public API
    const where: Record<string, unknown> = {
      published: true, // Always filter by published
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        // Don't search in content for public API (performance)
      ];
    }

    if (category) {
      where.categories = {
        some: { slug: category },
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Determine sort order
    let orderBy: Record<string, string> = { publishedAt: 'desc' };
    if (sort === 'views') {
      orderBy = { views: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { publishedAt: 'asc' };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: SAFE_POST_FIELDS, // Only select safe fields
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Transform to safe format
    const safePosts = posts.map(toSafePost);

    const response = NextResponse.json({
      posts: safePosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    // Add cache headers for CDN
    return withCacheHeaders(response, {
      maxAge: 60, // Cache for 60 seconds
      staleWhileRevalidate: 300, // Stale while revalidate for 5 minutes
    });
  },
  { rateLimit: 'public' }
);

// ============================================
// POST /api/posts - Admin only (create post)
// Protected with session + role check
// ============================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, youtubeUrl, thumbnail, published, featured, categories, tags } = body;

    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: 'Title, content, and excerpt are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true });
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        youtubeUrl,
        thumbnail,
        published: published || false,
        featured: featured || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        categories: categories?.length
          ? { connect: categories.map((id: string) => ({ id })) }
          : undefined,
        tags: tags?.length
          ? { connect: tags.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } }, // Don't expose email
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

