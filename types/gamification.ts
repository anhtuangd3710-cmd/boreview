// Gamification Types for Bơ Review

export interface VisitorProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  bio?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface PointTransaction {
  id: string;
  points: number;
  action: PointAction;
  description?: string;
  visitorId: string;
  postId?: string;
  createdAt: Date;
}

export type PointAction = 
  | 'read'
  | 'comment'
  | 'react'
  | 'login'
  | 'streak_bonus'
  | 'daily_task'
  | 'badge_earned'
  | 'level_up'
  | 'first_action';

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: BadgeRequirement;
  xpReward: number;
}

export type BadgeCategory = 'category' | 'engagement' | 'streak' | 'special' | 'seasonal';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeRequirement {
  type: string;
  category?: string;
  count?: number;
  days?: number;
  level?: number;
  rank?: number;
}

export interface UserBadge {
  id: string;
  earnedAt: Date;
  badgeId: string;
  badge: Badge;
  isFeatured: boolean;
}

export interface Streak {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date;
  freezesAvailable: number;
  freezesUsed: number;
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  taskType: TaskType;
  requirement: number;
  xpReward: number;
}

export type TaskType = 'read' | 'comment' | 'react' | 'visit' | 'share' | 'explore';

export interface UserDailyTask {
  id: string;
  date: Date;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  xpAwarded: boolean;
  task: DailyTask;
}

export interface ReadingHistory {
  id: string;
  readDuration: number;
  progress: number;
  completed: boolean;
  xpAwarded: boolean;
  postId: string;
  lastReadAt: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'badge_earned'
  | 'level_up'
  | 'streak_reminder'
  | 'streak_broken'
  | 'new_reply'
  | 'mention'
  | 'system'
  | 'achievement';

// Level System
export interface LevelInfo {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
}

// XP Requirements per level (exponential growth)
export const LEVEL_XP_REQUIREMENTS: number[] = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1400,   // Level 7
  1900,   // Level 8
  2500,   // Level 9
  3200,   // Level 10
  4000,   // Level 11
  5000,   // Level 12
  6200,   // Level 13
  7600,   // Level 14
  9200,   // Level 15
  11000,  // Level 16
  13000,  // Level 17
  15500,  // Level 18
  18500,  // Level 19
  22000,  // Level 20
  // Beyond level 20: +5000 XP per level
];

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Người Mới',
  5: 'Độc Giả',
  10: 'Fan Cuồng',
  15: 'Chuyên Gia',
  20: 'Huyền Thoại',
  25: 'Bậc Thầy',
  30: 'Đại Cao Thủ',
  50: 'Vua Review',
};

// XP Rewards
export const XP_REWARDS = {
  read_post: 10,          // Read a post (>2 min)
  react: 5,               // React to a post
  comment: 15,            // Leave a comment
  daily_login: 10,        // Daily login bonus
  streak_bonus: 5,        // Per day of streak
  complete_daily_tasks: 20, // Bonus for all daily tasks
  first_comment: 25,      // First time commenting
  first_reaction: 10,     // First time reacting
} as const;

// Visitor Session (stored in localStorage)
export interface VisitorSession {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  token: string;
  expiresAt: number;
}

