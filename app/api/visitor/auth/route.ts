import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashIP, getClientIP, isIPBanned } from '@/lib/security';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { withPublicRateLimit } from '@/lib/api-middleware';

// Generate a simple token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// POST - Register or Login (Public with rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();
    const { action, username, password, displayName, email } = body;
    const ipHash = hashIP(getClientIP(request));

    // Check if IP is banned
    if (await isIPBanned(ipHash)) {
      return NextResponse.json(
        { error: 'Bạn không được phép đăng ký hoặc đăng nhập' },
        { status: 403 }
      );
    }

    if (action === 'register') {
      // Validate required fields
      if (!username || username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { error: 'Tên đăng nhập phải từ 3-20 ký tự' },
          { status: 400 }
        );
      }

      if (!displayName || displayName.length < 2 || displayName.length > 30) {
        return NextResponse.json(
          { error: 'Tên hiển thị phải từ 2-30 ký tự' },
          { status: 400 }
        );
      }

      // Check if username exists
      const existing = await prisma.visitorProfile.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Tên đăng nhập đã tồn tại' },
          { status: 400 }
        );
      }

      // Hash password if provided
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // Check early adopter count for badge
      const userCount = await prisma.visitorProfile.count();
      const isEarlyAdopter = userCount < 100;

      // Create visitor profile
      const visitor = await prisma.visitorProfile.create({
        data: {
          username: username.toLowerCase(),
          displayName,
          email: email || null,
          password: hashedPassword,
          ipHash,
          level: 1,
          totalXP: 25, // Welcome bonus
        },
      });

      // Create streak record
      await prisma.streak.create({
        data: {
          visitorId: visitor.id,
          currentStreak: 1,
          longestStreak: 1,
        },
      });

      // Award "Người Mới" badge
      const newbieBadge = await prisma.badge.findUnique({ where: { slug: 'nguoi-moi' } });
      if (newbieBadge) {
        await prisma.userBadge.create({
          data: { visitorId: visitor.id, badgeId: newbieBadge.id, isFeatured: true },
        });
      }

      // Award "Early Bird" badge if applicable
      if (isEarlyAdopter) {
        const earlyBirdBadge = await prisma.badge.findUnique({ where: { slug: 'early-bird' } });
        if (earlyBirdBadge) {
          await prisma.userBadge.create({
            data: { visitorId: visitor.id, badgeId: earlyBirdBadge.id },
          });
        }
      }

      // Create welcome notification
      await prisma.notification.create({
        data: {
          visitorId: visitor.id,
          type: 'system',
          title: '🎉 Chào mừng đến Bơ Review!',
          message: 'Bạn đã nhận 25 XP và huy hiệu "Người Mới". Hãy khám phá và tích lũy điểm nhé!',
        },
      });

      const token = generateToken();

      return NextResponse.json({
        success: true,
        visitor: {
          id: visitor.id,
          username: visitor.username,
          displayName: visitor.displayName,
          avatar: visitor.avatar,
          level: visitor.level,
          totalXP: visitor.totalXP,
          currentStreak: 1,
        },
        token,
        message: 'Đăng ký thành công! Chào mừng đến Bơ Review!',
      });
    }

    if (action === 'login') {
      if (!username) {
        return NextResponse.json({ error: 'Vui lòng nhập tên đăng nhập' }, { status: 400 });
      }

      const visitor = await prisma.visitorProfile.findUnique({
        where: { username: username.toLowerCase() },
        include: {
          streak: true,
          badges: { include: { badge: true }, where: { isFeatured: true }, take: 3 },
        },
      });

      if (!visitor) {
        return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
      }

      // Verify password if account has password
      if (visitor.password) {
        if (!password || !(await bcrypt.compare(password, visitor.password))) {
          return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
        }
      }

      // Update streak and last active
      const { awardXP } = await import('@/lib/gamification');
      const { checkAndUpdateStreak } = await import('@/lib/gamification');
      const streakResult = await checkAndUpdateStreak(visitor.id);

      if (streakResult.isNewDay && streakResult.xpAwarded > 0) {
        await awardXP(visitor.id, 'login', undefined, streakResult.xpAwarded);
      }

      const updatedVisitor = await prisma.visitorProfile.findUnique({ where: { id: visitor.id } });
      const token = generateToken();

      return NextResponse.json({
        success: true,
        visitor: {
          id: updatedVisitor!.id,
          username: updatedVisitor!.username,
          displayName: updatedVisitor!.displayName,
          avatar: updatedVisitor!.avatar,
          level: updatedVisitor!.level,
          totalXP: updatedVisitor!.totalXP,
          currentStreak: streakResult.currentStreak,
          badges: visitor.badges.map(ub => ub.badge),
        },
        token,
        streakBonus: streakResult.isNewDay ? streakResult.xpAwarded : 0,
      });
    }

    // Change password action
    if (action === 'change-password') {
      const visitorId = request.headers.get('x-visitor-id');
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!visitorId) {
        return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
      }

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'Mật khẩu xác nhận không khớp' },
          { status: 400 }
        );
      }

      // Get visitor
      const visitor = await prisma.visitorProfile.findUnique({
        where: { id: visitorId },
      });

      if (!visitor) {
        return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
      }

      // Check if visitor is banned
      if (visitor.isBanned) {
        return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 });
      }

      // If visitor has existing password, verify current password
      if (visitor.password) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Vui lòng nhập mật khẩu hiện tại' },
            { status: 400 }
          );
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, visitor.password);
        if (!isCurrentValid) {
          return NextResponse.json(
            { error: 'Mật khẩu hiện tại không chính xác' },
            { status: 400 }
          );
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, visitor.password);
        if (isSamePassword) {
          return NextResponse.json(
            { error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' },
            { status: 400 }
          );
        }
      }

      // Hash new password with bcrypt (cost factor 10)
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.visitorProfile.update({
        where: { id: visitorId },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: visitor.password
          ? 'Đổi mật khẩu thành công!'
          : 'Đặt mật khẩu thành công! Từ giờ bạn cần nhập mật khẩu khi đăng nhập.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  },
  { rateLimit: 'auth' } // Auth has strict rate limiting
);

