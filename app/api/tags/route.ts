import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET /api/tags - Public with rate limiting and caching
export const GET = withPublicRateLimit(
  async () => {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to safe format (no internal IDs)
    const safeTags = tags.map(t => ({
      name: t.name,
      slug: t.slug,
      postCount: t._count.posts,
    }));

    const response = NextResponse.json(safeTags);

    // Cache for 5 minutes
    return withCacheHeaders(response, { maxAge: 300, staleWhileRevalidate: 600 });
  },
  { rateLimit: 'public' }
);

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

