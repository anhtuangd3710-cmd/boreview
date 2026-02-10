import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdminAuth, withCacheHeaders } from '@/lib/api-middleware';

export const GET = withAdminAuth(
  async () => {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalComments,
      pendingComments,
      totalReactions,
      totalPollVotes,
      bannedIPs,
      recentComments,
      totalMessages,
      unreadMessages,
      totalSubscribers,
      activeSubscribers,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.reaction.count(),
      prisma.pollVote.count(),
      prisma.bannedIP.count(),
      prisma.comment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { title: true, slug: true } } },
      }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    const response = NextResponse.json({
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
      },
      views: totalViews._sum.views || 0,
      comments: {
        total: totalComments,
        pending: pendingComments,
      },
      reactions: totalReactions,
      pollVotes: totalPollVotes,
      bannedIPs,
      recentComments,
      messages: {
        total: totalMessages,
        unread: unreadMessages,
      },
      newsletter: {
        total: totalSubscribers,
        active: activeSubscribers,
      },
    });

    return withCacheHeaders(response, { maxAge: 30, isPrivate: true });
  },
  { rateLimit: 'admin' }
);

