import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET /api/product-categories - Public: Get all active categories
export const GET = withPublicRateLimit(
  async () => {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      select: {
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const response = NextResponse.json(
      categories.map(c => ({
        name: c.name,
        slug: c.slug,
        image: c.image,
        productCount: c._count.products,
      }))
    );

    return withCacheHeaders(response, { maxAge: 300, staleWhileRevalidate: 600 });
  },
  { rateLimit: 'public' }
);

