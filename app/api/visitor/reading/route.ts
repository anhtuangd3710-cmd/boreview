import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { awardXP } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// POST - Record reading progress and award XP (Public with rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const { postId, readTimeSeconds, completed } = await request.json();
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Verify visitor exists
    const visitor = await prisma.visitorProfile.findUnique({
      where: { id: visitorId },
    });

    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    // Check if visitor is banned
    if (visitor.isBanned) {
      return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 });
    }

    // Check if reading history exists
    let readingHistory = await prisma.readingHistory.findUnique({
      where: { visitorId_postId: { visitorId, postId } },
    });

    const minReadTimeForXP = 120; // 2 minutes minimum to earn XP
    let xpResult = null;
    let alreadyRewarded = false;

    if (readingHistory) {
      // Update existing reading history
      const newProgress = Math.min(100, readingHistory.progress + (completed ? 100 : 10));
      const totalReadTime = readingHistory.readDuration + (readTimeSeconds || 0);

      await prisma.readingHistory.update({
        where: { id: readingHistory.id },
        data: {
          progress: newProgress,
          readDuration: totalReadTime,
          completed: completed || readingHistory.completed,
          lastReadAt: new Date(),
        },
      });

      alreadyRewarded = readingHistory.xpAwarded;

      // Award XP if completed and not already awarded
      if (completed && !readingHistory.xpAwarded && totalReadTime >= minReadTimeForXP) {
        xpResult = await awardXP(visitorId, 'read', postId);
        await prisma.readingHistory.update({
          where: { id: readingHistory.id },
          data: { xpAwarded: true },
        });
        // Update daily task progress
        await fetch(new URL('/api/visitor/daily-tasks', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-visitor-id': visitorId },
          body: JSON.stringify({ taskType: 'read', increment: 1 }),
        }).catch(() => {});
      }
    } else {
      // Create new reading history
      const shouldAwardXP = completed && (readTimeSeconds || 0) >= minReadTimeForXP;

      readingHistory = await prisma.readingHistory.create({
        data: {
          visitorId,
          postId,
          progress: completed ? 100 : 10,
          readDuration: readTimeSeconds || 0,
          completed: completed || false,
          xpAwarded: shouldAwardXP,
        },
      });

      if (shouldAwardXP) {
        xpResult = await awardXP(visitorId, 'read', postId);
        // Update daily task progress
        await fetch(new URL('/api/visitor/daily-tasks', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-visitor-id': visitorId },
          body: JSON.stringify({ taskType: 'read', increment: 1 }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      readingHistory: {
        progress: readingHistory.progress,
        completed: readingHistory.completed || completed,
        readDuration: readingHistory.readDuration + (readTimeSeconds || 0),
      },
      xpResult,
      alreadyRewarded,
    });
  },
  { rateLimit: 'public' }
);

// GET - Get reading history for a visitor (Public with rate limiting)
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    if (postId) {
      // Get specific post reading history - only safe fields
      const history = await prisma.readingHistory.findUnique({
        where: { visitorId_postId: { visitorId, postId } },
        select: {
          progress: true,
          completed: true,
          readDuration: true,
          lastReadAt: true,
          post: { select: { title: true, slug: true, thumbnail: true } },
        },
      });

      const response = NextResponse.json(history);
      return withCacheHeaders(response, { maxAge: 10, staleWhileRevalidate: 30 });
    }

    // Get all reading history (recent first) - only safe fields
    const history = await prisma.readingHistory.findMany({
      where: { visitorId },
      select: {
        progress: true,
        completed: true,
        readDuration: true,
        lastReadAt: true,
        post: { select: { title: true, slug: true, thumbnail: true } },
      },
      orderBy: { lastReadAt: 'desc' },
      take: 20,
    });

    const response = NextResponse.json(history);
    return withCacheHeaders(response, { maxAge: 10, staleWhileRevalidate: 30 });
  },
  { rateLimit: 'public' }
);

