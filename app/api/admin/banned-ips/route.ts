import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { hashIP } from '@/lib/security';

// GET all banned IPs
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bannedIPs = await prisma.bannedIP.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bannedIPs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banned IPs' }, { status: 500 });
  }
}

// POST ban an IP (from comment ipHash)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ipHash, reason } = await request.json();

    if (!ipHash) {
      return NextResponse.json({ error: 'IP hash required' }, { status: 400 });
    }

    // Check if already banned
    const existing = await prisma.bannedIP.findUnique({ where: { ipHash } });
    if (existing) {
      return NextResponse.json({ error: 'IP already banned' }, { status: 400 });
    }

    const banned = await prisma.bannedIP.create({
      data: { ipHash, reason },
    });

    return NextResponse.json(banned, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ban IP' }, { status: 500 });
  }
}

// DELETE unban an IP
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Ban ID required' }, { status: 400 });
  }

  try {
    await prisma.bannedIP.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unban IP' }, { status: 500 });
  }
}

