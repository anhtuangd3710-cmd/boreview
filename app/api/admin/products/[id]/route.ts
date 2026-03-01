import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Handle slug
    let slug = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : slugify(name, { lower: true, strict: true, locale: 'vi' });

    // Check for existing slug (not this product)
    const existing = await prisma.product.findFirst({
      where: { slug, id: { not: params.id } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.update({
      where: { id: params.id },
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
        isActive,
        isFeatured,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

