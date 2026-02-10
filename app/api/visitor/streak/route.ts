import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAndUpdateStreak, awardXP } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET streak info (Public with rate limiting)
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const streak = await prisma.streak.findUnique({
      where: { visitorId },
    });

    if (!streak) {
      return NextResponse.json({ error: 'Streak not found' }, { status: 404 });
    }

    // Get streak history for calendar (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.pointTransaction.findMany({
      where: {
        visitorId,
        action: 'login',
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, points: true },
    });

    // Create calendar data
    const checkInDays = transactions.map(t => {
      const date = new Date(t.createdAt);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });

    const response = NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCheckIn: streak.lastCheckIn,
      freezesAvailable: streak.freezesAvailable,
      freezesUsed: streak.freezesUsed,
      checkInDays,
      canCheckInToday: !checkInDays.includes(new Date().toISOString().split('T')[0]),
    });

    // Short cache since streak can change
    return withCacheHeaders(response, { maxAge: 10, staleWhileRevalidate: 30 });
  },
  { rateLimit: 'public' }
);

// POST to check-in today (Public with rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const streakResult = await checkAndUpdateStreak(visitorId);

    if (!streakResult.isNewDay) {
      return NextResponse.json({
        success: false,
        message: 'Bạn đã check-in hôm nay rồi!',
        ...streakResult,
      });
    }

    // Award XP for daily login
    let xpResult = null;
    if (streakResult.xpAwarded > 0) {
      xpResult = await awardXP(visitorId, 'login', undefined, streakResult.xpAwarded);
    }

    return NextResponse.json({
      success: true,
      message: streakResult.streakBroken
        ? '💔 Streak bị reset! Bắt đầu lại nào!'
        : `🔥 Check-in thành công! Streak: ${streakResult.currentStreak} ngày`,
      ...streakResult,
      xpResult,
    });
  },
  { rateLimit: 'public' }
);

// PUT to use freeze (Public with rate limiting)
export const PUT = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const streak = await prisma.streak.findUnique({ where: { visitorId } });

    if (!streak) {
      return NextResponse.json({ error: 'Streak not found' }, { status: 404 });
    }

    if (streak.freezesAvailable <= 0) {
      return NextResponse.json({ error: 'Không còn freeze khả dụng!' }, { status: 400 });
    }

    const updated = await prisma.streak.update({
      where: { visitorId },
      data: {
        freezesAvailable: streak.freezesAvailable - 1,
        freezesUsed: streak.freezesUsed + 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: '❄️ Đã sử dụng 1 freeze!',
      freezesAvailable: updated.freezesAvailable,
      freezesUsed: updated.freezesUsed,
    });
  },
  { rateLimit: 'public' }
);

