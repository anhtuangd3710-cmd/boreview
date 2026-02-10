import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET /api/categories - Public with rate limiting and caching
export const GET = withPublicRateLimit(
  async () => {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to safe format (no internal IDs)
    const safeCategories = categories.map(c => ({
      name: c.name,
      slug: c.slug,
      postCount: c._count.posts,
    }));

    const response = NextResponse.json(safeCategories);

    // Cache for 5 minutes (categories don't change often)
    return withCacheHeaders(response, { maxAge: 300, staleWhileRevalidate: 600 });
  },
  { rateLimit: 'public' }
);

// POST /api/categories - Create a new category
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

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

