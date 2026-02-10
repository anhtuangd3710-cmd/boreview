'use client';

import { motion } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import { getLevelInfo, formatXP } from '@/lib/gamification-client';
import XPProgressBar from './XPProgressBar';

interface UserProfileCardProps {
  compact?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  className?: string;
}

export default function UserProfileCard({
  compact = false,
  showProgress = true,
  showStats = true,
  className = ''
}: UserProfileCardProps) {
  const { isLoggedIn, visitor } = useVisitor();

  if (!isLoggedIn || !visitor) {
    return null;
  }

  const levelInfo = getLevelInfo(visitor.level);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 ${className}`}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {visitor.displayName?.charAt(0).toUpperCase() || visitor.username.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 text-sm">{levelInfo.icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {visitor.displayName || visitor.username}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Lv.{visitor.level}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>⭐ {formatXP(visitor.totalXP)} XP</span>
            <span>🔥 {visitor.currentStreak || 0} ngày</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-lg">
            {visitor.displayName?.charAt(0).toUpperCase() || visitor.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 sm:p-1 shadow">
            <span className="text-sm sm:text-base lg:text-lg">{levelInfo.icon}</span>
          </div>
        </div>

        {/* Name & Level */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">
            {visitor.displayName || visitor.username}
          </h3>
          <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
            {levelInfo.name}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              ⭐ <span className="font-semibold text-gray-700 dark:text-gray-300">{formatXP(visitor.totalXP)}</span>
            </span>
            <span className="flex items-center gap-1">
              🔥 <span className="font-semibold text-gray-700 dark:text-gray-300">{visitor.currentStreak || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      {showProgress && (
        <div className="mt-3 sm:mt-4">
          <XPProgressBar
            currentXP={visitor.totalXP}
            level={visitor.level}
            size="sm"
          />
        </div>
      )}

      {/* Stats - conditionally rendered */}
      {showStats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
          <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-900/30">
            <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
              {visitor.level}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Cấp độ</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-900/30">
            <div className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              {visitor.currentStreak || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Streak</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {(visitor as any).longestStreak || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Kỷ lục</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

