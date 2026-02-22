import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/admin/orders - Get all orders
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search } },
    ];
  }

  const [orders, total, stats] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: { productName: true, quantity: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  return NextResponse.json({
    orders,
    total,
    totalPages: Math.ceil(total / limit),
    stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
  });
}

