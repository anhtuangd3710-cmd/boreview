import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashIP, getClientIP, checkRateLimit, containsProfanity, sanitizeInput, isIPBanned } from '@/lib/security';
import { z } from 'zod';
import { withPublicRateLimit, withAdminAuth, withCacheHeaders } from '@/lib/api-middleware';

const contactSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề quá dài'),
  message: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự').max(5000, 'Nội dung quá dài'),
});

// POST - Submit contact message (Public with strict rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();

    // Validate input
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json(
        { error: 'Bạn không được phép gửi tin nhắn' },
        { status: 403 }
      );
    }

    // Check for profanity
    if (containsProfanity(name) || containsProfanity(subject) || containsProfanity(message)) {
      return NextResponse.json(
        { error: 'Nội dung chứa từ ngữ không phù hợp' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);

    // Create contact message
    await prisma.contactMessage.create({
      data: {
        name: sanitizedName,
        email: email.toLowerCase(),
        subject: sanitizedSubject,
        message: sanitizedMessage,
        ipHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.',
    });
  },
  { rateLimit: 'contact' } // Strict rate limit for contact form
);

// GET - Get contact messages (Admin only - protected)
export const GET = withAdminAuth(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const unreadOnly = searchParams.get('unread') === 'true';

    const where = unreadOnly ? { read: false } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    const response = NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return withCacheHeaders(response, { maxAge: 30, isPrivate: true });
  },
  { rateLimit: 'admin' }
);

