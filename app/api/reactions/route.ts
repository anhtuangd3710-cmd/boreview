import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { reactionSchema } from '@/lib/validation';
import { hashIP, getClientIP, checkRateLimit, isIPBanned } from '@/lib/security';
import { awardXP } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET reactions for a post - Public with rate limiting
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Get reaction counts
    const reactions = await prisma.reaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: { type: true },
    });

    // Get user's reactions (based on IP)
    const userReactions = await prisma.reaction.findMany({
      where: { postId, ipHash },
      select: { type: true },
    });

    const counts: Record<string, number> = {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
    };

    reactions.forEach((r) => {
      counts[r.type] = r._count.type;
    });

    const response = NextResponse.json({
      counts,
      userReactions: userReactions.map((r) => r.type),
    });

    // Short cache since user reactions are personalized
    return withCacheHeaders(response, { maxAge: 10, staleWhileRevalidate: 30 });
  },
  { rateLimit: 'public' }
);

// POST/toggle reaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = reactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, postId } = validation.data;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json({ error: 'Action not allowed' }, { status: 403 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(ipHash, 'reaction');
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many reactions. Please wait.' }, { status: 429 });
    }

    // Check if reaction exists
    const existing = await prisma.reaction.findUnique({
      where: { postId_ipHash_type: { postId, ipHash, type } },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ action: 'removed', type });
    } else {
      // Add reaction
      await prisma.reaction.create({
        data: { type, postId, ipHash },
      });

      // Award XP and track daily task if visitor is logged in (only for adding reaction)
      const visitorId = request.headers.get('x-visitor-id');
      let xpResult = null;
      if (visitorId) {
        try {
          xpResult = await awardXP(visitorId, 'react', postId);
          // Update daily task progress
          await fetch(new URL('/api/visitor/daily-tasks', request.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-visitor-id': visitorId },
            body: JSON.stringify({ taskType: 'react', increment: 1 }),
          }).catch(() => {});
        } catch (err) {
          console.log('XP award skipped:', err);
        }
      }

      return NextResponse.json({ action: 'added', type, xpResult });
    }
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 });
  }
}

