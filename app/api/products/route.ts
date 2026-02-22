import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET /api/products - Public: Get all active products
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { soldCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDesc: true,
          price: true,
          salePrice: true,
          thumbnail: true,
          stock: true,
          isFeatured: true,
          soldCount: true,
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const response = NextResponse.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

    return withCacheHeaders(response, { maxAge: 60, staleWhileRevalidate: 120 });
  },
  { rateLimit: 'public' }
);

