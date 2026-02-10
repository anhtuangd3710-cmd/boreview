import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET community stats - Public with rate limiting and caching
export const GET = withPublicRateLimit(
  async () => {
    // Get stats in parallel
    const [totalPosts, totalViews, totalComments, totalMembers] = await Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.post.aggregate({
        where: { published: true },
        _sum: { views: true },
      }),
      prisma.comment.count(),
      prisma.visitorProfile.count(),
    ]);

    const response = NextResponse.json({
      totalPosts,
      totalViews: totalViews._sum.views || 0,
      totalComments,
      totalMembers,
    });

    // Cache for 2 minutes (stats don't change frequently)
    return withCacheHeaders(response, { maxAge: 120, staleWhileRevalidate: 300 });
  },
  { rateLimit: 'public' }
);

