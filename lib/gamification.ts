import prisma from './prisma';
import { LEVEL_XP_REQUIREMENTS, LEVEL_NAMES, XP_REWARDS, LevelInfo, PointAction } from '@/types/gamification';

// Calculate level from XP
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[i]) {
      return i + 1;
    }
  }
  // Beyond predefined levels
  const lastLevel = LEVEL_XP_REQUIREMENTS.length;
  const lastXP = LEVEL_XP_REQUIREMENTS[lastLevel - 1];
  const extraXP = totalXP - lastXP;
  return lastLevel + Math.floor(extraXP / 5000);
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < LEVEL_XP_REQUIREMENTS.length) {
    return LEVEL_XP_REQUIREMENTS[currentLevel];
  }
  const lastXP = LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
  return lastXP + (currentLevel - LEVEL_XP_REQUIREMENTS.length + 1) * 5000;
}

// Get level info
export function getLevelInfo(level: number): LevelInfo {
  const xpRequired = level <= LEVEL_XP_REQUIREMENTS.length 
    ? LEVEL_XP_REQUIREMENTS[level - 1] 
    : LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + (level - LEVEL_XP_REQUIREMENTS.length) * 5000;
  
  const nextLevelXP = getXPForNextLevel(level);
  
  // Find the appropriate name
  let name = 'Người Mới';
  for (const [lvl, lvlName] of Object.entries(LEVEL_NAMES).reverse()) {
    if (level >= parseInt(lvl)) {
      name = lvlName;
      break;
    }
  }
  
  // Level icon based on level tier
  let icon = '🌱';
  if (level >= 50) icon = '👑';
  else if (level >= 30) icon = '💎';
  else if (level >= 20) icon = '🔥';
  else if (level >= 15) icon = '⭐';
  else if (level >= 10) icon = '🏆';
  else if (level >= 5) icon = '📖';
  
  return { level, name, minXP: xpRequired, maxXP: nextLevelXP, icon };
}

// Award XP to visitor
export async function awardXP(
  visitorId: string,
  action: PointAction,
  postId?: string,
  customPoints?: number
): Promise<{ newXP: number; leveledUp: boolean; newLevel: number; pointsAwarded: number }> {
  const visitor = await prisma.visitorProfile.findUnique({
    where: { id: visitorId },
  });
  
  if (!visitor) {
    throw new Error('Visitor not found');
  }
  
  const points = customPoints ?? XP_REWARDS[action as keyof typeof XP_REWARDS] ?? 10;
  const oldLevel = calculateLevel(visitor.totalXP);
  const newXP = visitor.totalXP + points;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;
  
  // Update visitor XP and level
  await prisma.visitorProfile.update({
    where: { id: visitorId },
    data: {
      totalXP: newXP,
      level: newLevel,
      lastActiveAt: new Date(),
    },
  });
  
  // Record transaction
  await prisma.pointTransaction.create({
    data: {
      points,
      action,
      visitorId,
      postId,
      description: getActionDescription(action),
    },
  });
  
  // Create level-up notification if leveled up
  if (leveledUp) {
    const levelInfo = getLevelInfo(newLevel);
    await prisma.notification.create({
      data: {
        visitorId,
        type: 'level_up',
        title: `🎉 Chúc mừng! Bạn đã lên Level ${newLevel}!`,
        message: `Bạn đã trở thành "${levelInfo.name}". Tiếp tục phát huy nhé!`,
      },
    });
  }
  
  return { newXP, leveledUp, newLevel, pointsAwarded: points };
}

// Get action description in Vietnamese
function getActionDescription(action: PointAction): string {
  const descriptions: Record<PointAction, string> = {
    read: 'Đọc bài viết',
    comment: 'Viết bình luận',
    react: 'Thả cảm xúc',
    login: 'Đăng nhập hàng ngày',
    streak_bonus: 'Thưởng streak',
    daily_task: 'Hoàn thành nhiệm vụ',
    badge_earned: 'Đạt huy hiệu',
    level_up: 'Lên cấp',
    first_action: 'Hành động đầu tiên',
  };
  return descriptions[action] || action;
}

// Streak milestones for badge awarding
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

// Check and update streak
export async function checkAndUpdateStreak(visitorId: string): Promise<{
  currentStreak: number;
  isNewDay: boolean;
  streakBroken: boolean;
  xpAwarded: number;
  milestoneBadge?: string;
}> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  
  let streak = await prisma.streak.findUnique({ where: { visitorId } });
  
  if (!streak) {
    // Create new streak
    streak = await prisma.streak.create({
      data: { visitorId, currentStreak: 1, longestStreak: 1, lastCheckIn: now },
    });
    await prisma.visitorProfile.update({
      where: { id: visitorId },
      data: { currentStreak: 1, longestStreak: 1 },
    });
    return { currentStreak: 1, isNewDay: true, streakBroken: false, xpAwarded: XP_REWARDS.daily_login };
  }
  
  const lastCheckIn = new Date(streak.lastCheckIn);
  const lastCheckInDay = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
  
  // Already checked in today
  if (lastCheckInDay.getTime() === startOfToday.getTime()) {
    return { currentStreak: streak.currentStreak, isNewDay: false, streakBroken: false, xpAwarded: 0 };
  }
  
  let newStreak: number;
  let streakBroken = false;
  let xpAwarded = XP_REWARDS.daily_login;
  // Continued from code above - streak logic
  if (lastCheckInDay.getTime() === startOfYesterday.getTime()) {
    newStreak = streak.currentStreak + 1;
    xpAwarded += XP_REWARDS.streak_bonus * newStreak;
  } else if (streak.freezesAvailable > 0) {
    newStreak = streak.currentStreak;
    await prisma.streak.update({
      where: { visitorId },
      data: { freezesAvailable: streak.freezesAvailable - 1, freezesUsed: streak.freezesUsed + 1 },
    });
  } else {
    newStreak = 1;
    streakBroken = true;
  }
  const longestStreak = Math.max(streak.longestStreak, newStreak);
  await prisma.streak.update({ where: { visitorId }, data: { currentStreak: newStreak, longestStreak, lastCheckIn: now } });
  await prisma.visitorProfile.update({ where: { id: visitorId }, data: { currentStreak: newStreak, longestStreak } });

  // Check for milestone badge
  let milestoneBadge: string | undefined;
  if (STREAK_MILESTONES.includes(newStreak)) {
    const badgeSlug = `streak-${newStreak}`;
    const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
    if (badge) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { visitorId, badgeId: badge.id },
      });
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: { visitorId, badgeId: badge.id },
        });
        await prisma.notification.create({
          data: {
            visitorId,
            type: 'badge',
            title: `🏆 Huy hiệu mới: ${badge.name}!`,
            message: badge.description,
          },
        });
        milestoneBadge = badge.name;
        xpAwarded += badge.xpReward;
      }
    }
  }

  return { currentStreak: newStreak, isNewDay: true, streakBroken, xpAwarded, milestoneBadge };
}

