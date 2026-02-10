import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { commentSchema } from '@/lib/validation';
import { hashIP, getClientIP, checkRateLimit, isIPBanned, containsProfanity, sanitizeInput, verifyRecaptcha } from '@/lib/security';
import { awardXP } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// Safe comment fields - don't expose ipHash or internal IDs
const SAFE_COMMENT_SELECT = {
  id: true,
  content: true,
  authorName: true,
  isAdminReply: true,
  createdAt: true,
  replies: {
    where: { approved: true },
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      content: true,
      authorName: true,
      isAdminReply: true,
      createdAt: true,
    },
  },
};

// GET comments for a post - Public with rate limiting
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId, approved: true, parentId: null },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: SAFE_COMMENT_SELECT,
      }),
      prisma.comment.count({ where: { postId, approved: true, parentId: null } }),
    ]);

    const response = NextResponse.json({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

    return withCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
  },
  { rateLimit: 'public' }
);

// POST new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, authorName, postId, recaptchaToken } = validation.data;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json({ error: 'You are not allowed to comment' }, { status: 403 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(ipHash, 'comment');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please wait a minute.' },
        { status: 429 }
      );
    }

    // Verify reCAPTCHA if configured
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    // Check for profanity
    if (containsProfanity(content) || containsProfanity(authorName)) {
      return NextResponse.json({ error: 'Comment contains inappropriate content' }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment with sanitized input
    const comment = await prisma.comment.create({
      data: {
        content: sanitizeInput(content),
        authorName: sanitizeInput(authorName),
        ipHash,
        postId,
        approved: true, // Auto-approve, can be changed to false for moderation
      },
    });

    // Award XP and track daily task if visitor is logged in
    const visitorId = request.headers.get('x-visitor-id');
    let xpResult = null;
    if (visitorId) {
      try {
        xpResult = await awardXP(visitorId, 'comment', postId);
        // Update daily task progress
        await fetch(new URL('/api/visitor/daily-tasks', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-visitor-id': visitorId },
          body: JSON.stringify({ taskType: 'comment', increment: 1 }),
        }).catch(() => {}); // Silently fail if daily task update fails
      } catch (err) {
        console.log('XP award skipped:', err);
      }
    }

    return NextResponse.json({ ...comment, xpResult }, { status: 201 });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

