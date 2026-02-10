import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { pollSchema } from '@/lib/validation';
import { authOptions } from '@/lib/auth';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET poll for a post - Public with rate limiting
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { postId },
      select: {
        question: true,
        options: {
          select: {
            id: true,
            text: true,
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0);

    const response = NextResponse.json({
      poll: {
        question: poll.question,
        options: poll.options.map((opt) => ({
          id: opt.id, // Keep option ID for voting
          text: opt.text,
          votes: opt._count.votes,
          percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
        })),
        totalVotes,
      },
    });

    return withCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
  },
  { rateLimit: 'public' }
);

// POST create poll (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const validation = pollSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { question, options, postId } = validation.data;

    // Check if poll already exists for this post
    const existing = await prisma.poll.findUnique({ where: { postId } });
    if (existing) {
      return NextResponse.json({ error: 'Poll already exists for this post' }, { status: 400 });
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        postId,
        options: {
          create: options.map((text) => ({ text })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Poll creation error:', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}

// DELETE poll (admin only)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get('pollId');

  if (!pollId) {
    return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 });
  }

  try {
    await prisma.poll.delete({ where: { id: pollId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
  }
}

