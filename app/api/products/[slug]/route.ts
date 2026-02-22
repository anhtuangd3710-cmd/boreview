import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCacheHeaders } from '@/lib/api-middleware';

// GET /api/products/[slug] - Public: Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Increment view count (non-blocking)
    prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    const response = NextResponse.json(product);
    return withCacheHeaders(response, { maxAge: 300, staleWhileRevalidate: 600 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
