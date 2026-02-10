import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Ban/Unban visitor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (action === 'ban') {
      const visitor = await prisma.visitorProfile.update({
        where: { id },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedReason: reason || 'Vi phạm quy định cộng đồng',
        },
      });
      return NextResponse.json({ success: true, visitor, message: 'Đã khóa tài khoản' });
    }

    if (action === 'unban') {
      const visitor = await prisma.visitorProfile.update({
        where: { id },
        data: {
          isBanned: false,
          bannedAt: null,
          bannedReason: null,
        },
      });
      return NextResponse.json({ success: true, visitor, message: 'Đã mở khóa tài khoản' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating visitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete visitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete all related data first
    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({ where: { visitorId: id } }),
      prisma.userBadge.deleteMany({ where: { visitorId: id } }),
      prisma.streak.deleteMany({ where: { visitorId: id } }),
      prisma.readingHistory.deleteMany({ where: { visitorId: id } }),
      prisma.userDailyTask.deleteMany({ where: { visitorId: id } }),
      prisma.notification.deleteMany({ where: { visitorId: id } }),
      prisma.bookmark.deleteMany({ where: { visitorId: id } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: id }, { followingId: id }] } }),
      prisma.visitorProfile.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

