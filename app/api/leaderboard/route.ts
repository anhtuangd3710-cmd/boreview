import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

type Period = 'weekly' | 'monthly' | 'alltime';
type Category = 'xp' | 'streak' | 'comments';

// GET leaderboard - Public with rate limiting and caching
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'weekly') as Period;
    const category = (searchParams.get('category') || 'xp') as Category;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const visitorId = request.headers.get('x-visitor-id');

    // Try to get from cache first
    const cached = await prisma.leaderboardCache.findUnique({
      where: { period_category: { period, category } },
    });

    // Cache valid for 5 minutes
    const cacheValid = cached && (Date.now() - cached.updatedAt.getTime()) < 5 * 60 * 1000;

    let rankings: Array<{ visitorId: string; username: string; displayName: string; value: number; rank: number }>;

    if (cacheValid && cached) {
      rankings = JSON.parse(cached.rankings);
    } else {
      // Generate fresh rankings
      rankings = await generateRankings(period, category, limit);

      // Update cache
      await prisma.leaderboardCache.upsert({
        where: { period_category: { period, category } },
        update: { rankings: JSON.stringify(rankings), updatedAt: new Date() },
        create: { period, category, rankings: JSON.stringify(rankings) },
      });
    }

    // Get current user's rank if logged in
    let userRank = null;
    if (visitorId) {
      const userIndex = rankings.findIndex(r => r.visitorId === visitorId);
      if (userIndex >= 0) {
        userRank = { ...rankings[userIndex], rank: userIndex + 1 };
      } else {
        // User not in top rankings, find their actual rank
        userRank = await getUserRank(visitorId, period, category);
      }
    }

    // Transform rankings to safe format (hide internal visitorId)
    const safeRankings = rankings.slice(0, limit).map(r => ({
      username: r.username,
      displayName: r.displayName,
      value: r.value,
      rank: r.rank,
    }));

    const response = NextResponse.json({
      period,
      category,
      rankings: safeRankings,
      userRank: userRank ? {
        username: userRank.username,
        displayName: userRank.displayName,
        value: userRank.value,
        rank: userRank.rank,
      } : null,
      updatedAt: cached?.updatedAt || new Date(),
    });

    // Cache for 1 minute (leaderboard updates frequently)
    return withCacheHeaders(response, { maxAge: 60, staleWhileRevalidate: 120 });
  },
  { rateLimit: 'public' }
);

async function generateRankings(period: Period, category: Category, limit: number) {
  const dateFilter = getDateFilter(period);

  if (category === 'xp') {
    const visitors = await prisma.visitorProfile.findMany({
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
      orderBy: { totalXP: 'desc' },
      take: limit,
      select: { id: true, username: true, displayName: true, totalXP: true },
    });

    return visitors.map((v, i) => ({
      visitorId: v.id,
      username: v.username,
      displayName: v.displayName || v.username,
      value: v.totalXP,
      rank: i + 1,
    }));
  }

  if (category === 'streak') {
    const streaks = await prisma.streak.findMany({
      orderBy: { currentStreak: 'desc' },
      take: limit,
      include: { visitor: { select: { id: true, username: true, displayName: true } } },
    });

    return streaks.map((s, i) => ({
      visitorId: s.visitor.id,
      username: s.visitor.username,
      displayName: s.visitor.displayName || s.visitor.username,
      value: s.currentStreak,
      rank: i + 1,
    }));
  }

  if (category === 'comments') {
    // Count comments per visitor in the period
    const comments = await prisma.comment.groupBy({
      by: ['ipHash'],
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // This is simplified - in production, you'd link comments to visitor profiles
    return comments.map((c, i) => ({
      visitorId: c.ipHash,
      username: `User ${i + 1}`,
      displayName: `Người dùng #${i + 1}`,
      value: c._count.id,
      rank: i + 1,
    }));
  }

  return [];
}

function getDateFilter(period: Period): Date | null {
  const now = new Date();
  if (period === 'weekly') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === 'monthly') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null; // alltime
}

async function getUserRank(visitorId: string, period: Period, category: Category) {
  const visitor = await prisma.visitorProfile.findUnique({
    where: { id: visitorId },
    select: { username: true, displayName: true, totalXP: true },
  });

  if (!visitor) return null;

  if (category === 'xp') {
    const higherCount = await prisma.visitorProfile.count({
      where: { totalXP: { gt: visitor.totalXP } },
    });

    return {
      visitorId,
      username: visitor.username,
      displayName: visitor.displayName || visitor.username,
      value: visitor.totalXP,
      rank: higherCount + 1,
    };
  }

  return null;
}

