import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelInfo, getXPForNextLevel } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// GET - Get visitor profile (Public with rate limiting)
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('id');
    const username = searchParams.get('username');

    if (!visitorId && !username) {
      return NextResponse.json({ error: 'Missing id or username' }, { status: 400 });
    }

    const visitor = await prisma.visitorProfile.findUnique({
      where: visitorId ? { id: visitorId } : { username: username!.toLowerCase() },
      include: {
        streak: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
        _count: {
          select: {
            readingHistory: true,
            pointTransactions: true,
            bookmarks: true,
            following: true,
            followers: true,
          },
        },
      },
    });

    if (!visitor) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if visitor is banned
    if (visitor.isBanned) {
      return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 });
    }

    // Note: Comment and Reaction models don't have visitorId field
    // They use ipHash for tracking. We'll show 0 for now or could match by ipHash if available
    const commentCount = 0;
    const reactionCount = 0;

    const levelInfo = getLevelInfo(visitor.level);
    const nextLevelXP = getXPForNextLevel(visitor.level);
    const currentLevelXP = visitor.level <= 1 ? 0 : getXPForNextLevel(visitor.level - 1);
    const progressToNextLevel = ((visitor.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    const response = NextResponse.json({
      // Only expose safe public fields (no internal IDs for sensitive ops)
      username: visitor.username,
      displayName: visitor.displayName,
      avatar: visitor.avatar,
      bio: visitor.bio,
      level: visitor.level,
      levelInfo,
      totalXP: visitor.totalXP,
      xpToNextLevel: nextLevelXP - visitor.totalXP,
      progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
      currentStreak: visitor.streak?.currentStreak || 0,
      longestStreak: visitor.streak?.longestStreak || 0,
      freezesAvailable: visitor.streak?.freezesAvailable || 0,
      badges: visitor.badges.map(ub => ({
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        earnedAt: ub.earnedAt,
        isFeatured: ub.isFeatured,
      })),
      featuredBadges: visitor.badges
        .filter(ub => ub.isFeatured)
        .slice(0, 3)
        .map(ub => ({
          name: ub.badge.name,
          slug: ub.badge.slug,
          icon: ub.badge.icon,
          rarity: ub.badge.rarity,
        })),
      totalComments: commentCount,
      totalReactions: reactionCount,
      stats: {
        postsRead: visitor._count.readingHistory,
        totalActions: visitor._count.pointTransactions,
        bookmarks: visitor._count.bookmarks,
        following: visitor._count.following,
        followers: visitor._count.followers,
        comments: commentCount,
        reactions: reactionCount,
      },
      createdAt: visitor.createdAt,
      lastActiveAt: visitor.lastActiveAt,
    });

    // Cache for 30 seconds (profile can change)
    return withCacheHeaders(response, { maxAge: 30, staleWhileRevalidate: 60 });
  },
  { rateLimit: 'public' }
);

// PATCH - Update visitor profile (Public with rate limiting)
export const PATCH = withPublicRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();
    const { visitorId, displayName, bio, avatar, featuredBadgeIds } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitor ID' }, { status: 400 });
    }

    const visitor = await prisma.visitorProfile.findUnique({
      where: { id: visitorId },
    });

    if (!visitor) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if visitor is banned
    if (visitor.isBanned) {
      return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 });
    }

    // Update profile
    const updateData: Record<string, unknown> = {};
    if (displayName && displayName.length >= 2 && displayName.length <= 30) {
      updateData.displayName = displayName;
    }
    if (bio !== undefined) {
      updateData.bio = bio.slice(0, 200); // Max 200 chars
    }
    if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedVisitor = await prisma.visitorProfile.update({
      where: { id: visitorId },
      data: updateData,
    });

    // Update featured badges if provided
    if (featuredBadgeIds && Array.isArray(featuredBadgeIds)) {
      // Reset all featured flags
      await prisma.userBadge.updateMany({
        where: { visitorId },
        data: { isFeatured: false },
      });
      // Set new featured badges (max 3)
      for (const badgeId of featuredBadgeIds.slice(0, 3)) {
        await prisma.userBadge.updateMany({
          where: { visitorId, badgeId },
          data: { isFeatured: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      visitor: {
        username: updatedVisitor.username,
        displayName: updatedVisitor.displayName,
        avatar: updatedVisitor.avatar,
        bio: updatedVisitor.bio,
      },
    });
  },
  { rateLimit: 'public' }
);

