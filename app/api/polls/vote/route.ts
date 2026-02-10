import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pollVoteSchema } from '@/lib/validation';
import { hashIP, getClientIP, checkRateLimit, isIPBanned } from '@/lib/security';

// POST vote on poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = pollVoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { optionId } = validation.data;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json({ error: 'Action not allowed' }, { status: 403 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(ipHash, 'poll');
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many votes. Please wait.' }, { status: 429 });
    }

    // Get the option and its poll
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: true },
    });

    if (!option) {
      return NextResponse.json({ error: 'Poll option not found' }, { status: 404 });
    }

    // Check if user already voted on this poll
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        ipHash,
        option: { pollId: option.pollId },
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 });
    }

    // Create vote
    await prisma.pollVote.create({
      data: { optionId, ipHash },
    });

    // Get updated poll results
    const poll = await prisma.poll.findUnique({
      where: { id: option.pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0);

    return NextResponse.json({
      success: true,
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: opt._count.votes,
          percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
        })),
        totalVotes,
      },
    });
  } catch (error) {
    console.error('Poll vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

// GET check if user has voted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get('pollId');

  if (!pollId) {
    return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 });
  }

  const clientIP = getClientIP(request);
  const ipHash = hashIP(clientIP);

  try {
    const vote = await prisma.pollVote.findFirst({
      where: {
        ipHash,
        option: { pollId },
      },
      include: { option: true },
    });

    return NextResponse.json({
      hasVoted: !!vote,
      votedOptionId: vote?.optionId || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 });
  }
}

