import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// DELETE - Xóa subscriber
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
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa subscriber' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Cập nhật trạng thái subscriber
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
    const { action } = body;

    if (action === 'activate') {
      await prisma.newsletterSubscriber.update({
        where: { id },
        data: { isActive: true, unsubscribedAt: null },
      });
      return NextResponse.json({ success: true, message: 'Đã kích hoạt subscriber' });
    }

    if (action === 'deactivate') {
      await prisma.newsletterSubscriber.update({
        where: { id },
        data: { isActive: false, unsubscribedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Đã hủy kích hoạt subscriber' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

