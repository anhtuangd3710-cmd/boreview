import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ views: post.views });
  } catch (error) {
    console.error('Failed to increment view:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật lượt xem' },
      { status: 500 }
    );
  }
}

