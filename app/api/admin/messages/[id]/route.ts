import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({
  replyContent: z.string().min(1, 'Nội dung trả lời không được để trống'),
});

// GET - Lấy chi tiết tin nhắn
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Không tìm thấy tin nhắn' }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Đánh dấu đã đọc hoặc trả lời
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
    const { action, replyContent } = body;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Không tìm thấy tin nhắn' }, { status: 404 });
    }

    if (action === 'markRead') {
      await prisma.contactMessage.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    }

    if (action === 'reply') {
      const validation = replySchema.safeParse({ replyContent });
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      // Gửi email trả lời (giả lập - trong thực tế cần tích hợp email service)
      // await sendEmail(message.email, 'Re: ' + message.subject, replyContent);

      await prisma.contactMessage.update({
        where: { id },
        data: {
          read: true,
          replied: true,
          repliedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Đã gửi phản hồi thành công',
        note: 'Email sẽ được gửi khi tích hợp email service',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Xóa tin nhắn
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
    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa tin nhắn' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

