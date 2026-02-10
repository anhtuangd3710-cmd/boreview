import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-middleware';
import { z } from 'zod';

// Schemas for validation
const deleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'Comment IDs required'),
});

const patchSchema = z.object({
  ids: z.array(z.string()).min(1, 'Comment IDs required'),
  approved: z.boolean(),
});

const replySchema = z.object({
  parentId: z.string().min(1, 'Parent comment ID required'),
  content: z.string().min(2, 'Reply content is too short'),
});

// GET all comments for admin
export const GET = withAdminAuth(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // all, approved, pending

    const where: Record<string, unknown> = { parentId: null };
    if (status === 'approved') where.approved = true;
    if (status === 'pending') where.approved = false;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: { select: { title: true, slug: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              post: { select: { title: true, slug: true } },
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  },
  { rateLimit: 'admin' }
);

// DELETE multiple comments
export const DELETE = withAdminAuth<z.infer<typeof deleteSchema>>(
  async (request, context, data) => {
    if (!data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.comment.deleteMany({
      where: { id: { in: data.ids } },
    });

    return NextResponse.json({ success: true, deleted: data.ids.length });
  },
  { rateLimit: 'admin', schema: deleteSchema }
);

// PATCH approve/reject multiple comments
export const PATCH = withAdminAuth<z.infer<typeof patchSchema>>(
  async (request, context, data) => {
    if (!data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.comment.updateMany({
      where: { id: { in: data.ids } },
      data: { approved: data.approved },
    });

    return NextResponse.json({ success: true, updated: data.ids.length });
  },
  { rateLimit: 'admin', schema: patchSchema }
);

// POST admin reply to a comment
export const POST = withAdminAuth<z.infer<typeof replySchema>>(
  async (request, context, data) => {
    if (!data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get parent comment to get postId
    const parentComment = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { postId: true },
    });

    if (!parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // Create admin reply
    const reply = await prisma.comment.create({
      data: {
        content: data.content.trim(),
        authorName: context.session.user?.name || 'Admin',
        ipHash: 'admin',
        postId: parentComment.postId,
        parentId: data.parentId,
        isAdminReply: true,
        approved: true,
      },
      include: {
        post: { select: { title: true, slug: true } },
      },
    });

    return NextResponse.json(reply, { status: 201 });
  },
  { rateLimit: 'admin', schema: replySchema }
);

