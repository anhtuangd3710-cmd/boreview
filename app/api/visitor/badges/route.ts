import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET badges for visitor or all badges (Public with rate limiting)
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user'; // 'user' | 'all'

    if (type === 'all') {
      // Get all badges - only safe fields
      const badges = await prisma.badge.findMany({
        where: { isActive: true },
        select: {
          name: true,
          slug: true,
          description: true,
          icon: true,
          category: true,
          rarity: true,
          xpReward: true,
        },
        orderBy: [{ category: 'asc' }, { xpReward: 'asc' }],
      });

      // Group by category
      const grouped = badges.reduce((acc, badge) => {
        if (!acc[badge.category]) {
          acc[badge.category] = [];
        }
        acc[badge.category].push(badge);
        return acc;
      }, {} as Record<string, typeof badges>);

      const response = NextResponse.json({ badges, grouped });
      // Cache for 5 minutes (badges don't change often)
      return withCacheHeaders(response, { maxAge: 300, staleWhileRevalidate: 600 });
    }

    // Get user badges
    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const userBadges = await prisma.userBadge.findMany({
      where: { visitorId },
      include: {
        badge: {
          select: {
            name: true,
            slug: true,
            description: true,
            icon: true,
            category: true,
            rarity: true,
            xpReward: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get featured badges (top 3)
    const featuredBadges = userBadges.filter(ub => ub.isFeatured).slice(0, 3);

    const response = NextResponse.json({
      badges: userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
        isFeatured: ub.isFeatured,
      })),
      featuredBadges: featuredBadges.map(ub => ub.badge),
      totalCount: userBadges.length,
    });

    // Cache for 30 seconds (user badges can change)
    return withCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
  },
  { rateLimit: 'public' }
);

// PUT to update featured badges (Public with rate limiting)
export const PUT = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const { badgeIds } = await request.json();

    if (!Array.isArray(badgeIds) || badgeIds.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 featured badges' }, { status: 400 });
    }

    // Reset all featured
    await prisma.userBadge.updateMany({
      where: { visitorId },
      data: { isFeatured: false },
    });

    // Set new featured
    if (badgeIds.length > 0) {
      await prisma.userBadge.updateMany({
        where: {
          visitorId,
          badgeId: { in: badgeIds },
        },
        data: { isFeatured: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Featured badges updated' });
  },
  { rateLimit: 'public' }
);

