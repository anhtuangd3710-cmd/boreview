import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashIP, getClientIP, isIPBanned } from '@/lib/security';
import { z } from 'zod';
import { withPublicRateLimit } from '@/lib/api-middleware';

const subscribeSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().optional(),
  source: z.string().optional(),
});

// POST - Subscribe to newsletter (Public with rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();

    // Validate input
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, name, source } = validation.data;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json(
        { error: 'Bạn không được phép đăng ký' },
        { status: 403 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Email này đã đăng ký nhận tin rồi!' },
          { status: 400 }
        );
      } else {
        // Re-activate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            name: name || existing.name,
            source: source || existing.source,
          },
        });
        return NextResponse.json({
          success: true,
          message: 'Chào mừng quay lại! Đăng ký nhận tin thành công.',
        });
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name,
        source,
        ipHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký nhận tin thành công! Cảm ơn bạn.',
    });
  },
  { rateLimit: 'newsletter' }
);

// DELETE - Unsubscribe from newsletter (Public with rate limiting)
export const DELETE = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email không tìm thấy trong danh sách' },
        { status: 404 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã hủy đăng ký nhận tin thành công.',
    });
  },
  { rateLimit: 'public' }
);

