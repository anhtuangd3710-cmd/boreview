import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Lấy danh sách subscribers
export const GET = withAdminAuth(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, active, unsubscribed
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (filter === 'active') {
      where.isActive = true;
    } else if (filter === 'unsubscribed') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [subscribers, total, activeCount, totalCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count(),
    ]);

    return NextResponse.json({
      subscribers,
      total,
      activeCount,
      totalCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  },
  { rateLimit: 'admin' }
);

