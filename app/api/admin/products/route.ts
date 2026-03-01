import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

// GET /api/admin/products - Get all products (admin)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');

  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, totalPages: Math.ceil(total / limit) });
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      shortDesc,
      price,
      salePrice,
      images,
      thumbnail,
      stock,
      sku,
      weight,
      categoryId,
      shopeeLink,
      lazadaLink,
      tiktokShopLink,
      seoTitle,
      metaDescription,
      isActive,
      isFeatured,
      customSlug,
    } = body;

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = customSlug 
      ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : slugify(name, { lower: true, strict: true, locale: 'vi' });

    // Check for existing slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDesc,
        price: parseInt(price),
        salePrice: salePrice ? parseInt(salePrice) : null,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        thumbnail,
        stock: parseInt(stock) || 0,
        sku,
        weight: weight ? parseInt(weight) : null,
        categoryId,
        shopeeLink,
        lazadaLink,
        tiktokShopLink,
        seoTitle,
        metaDescription,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

