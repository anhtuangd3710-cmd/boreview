'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import { showXPNotification } from './XPToast';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string;
  freezesAvailable: number;
  freezesUsed: number;
  checkInDays: string[];
  canCheckInToday: boolean;
}

export default function StreakDisplay() {
  const { isLoggedIn, fetchWithVisitor, handleXPResult } = useVisitor();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStreak();
    }
  }, [isLoggedIn]);

  const fetchStreak = async () => {
    try {
      const res = await fetchWithVisitor('/api/visitor/streak');
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!streak?.canCheckInToday) return;
    
    setCheckingIn(true);
    try {
      const res = await fetchWithVisitor('/api/visitor/streak', { method: 'POST' });
      const data = await res.json();
      
      if (data.success && data.xpResult) {
        handleXPResult(data.xpResult);
        showXPNotification(
          data.xpResult.pointsAwarded,
          `Streak ${data.currentStreak} ngày!`,
          data.xpResult.leveledUp 
            ? { oldLevel: data.xpResult.newLevel - 1, newLevel: data.xpResult.newLevel }
            : undefined
        );
      }
      
      fetchStreak();
    } catch (error) {
      console.error('Failed to check-in:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  if (!isLoggedIn || loading) return null;
  if (!streak) return null;

  // Generate last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20
                 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-orange-200/50 dark:border-orange-800/50"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🔥</span>
          <div>
            <div className="font-bold text-base sm:text-lg text-orange-600 dark:text-orange-400">
              {streak.currentStreak} ngày
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Kỷ lục: {streak.longestStreak}
            </div>
          </div>
        </div>

        {/* Freeze indicator */}
        {streak.freezesAvailable > 0 && (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
            <span>❄️</span>
            <span>{streak.freezesAvailable}</span>
          </div>
        )}
      </div>

      {/* Mini calendar - responsive */}
      <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
        {last7Days.map((day) => {
          const isCheckedIn = streak.checkInDays.includes(day);
          const isToday = day === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day}
              className={`flex-1 aspect-square max-w-8 sm:max-w-10 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium
                ${isCheckedIn
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm'
                  : isToday
                    ? 'bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
            >
              {isCheckedIn ? '✓' : new Date(day).getDate()}
            </div>
          );
        })}
      </div>

      {/* Check-in button */}
      <AnimatePresence>
        {streak.canCheckInToday && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white
                       rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:from-orange-600 hover:to-red-600
                       disabled:opacity-50 transition-all duration-200 shadow-lg shadow-orange-500/25"
          >
            {checkingIn ? 'Đang check-in...' : '🔥 Check-in hôm nay!'}
          </motion.button>
        )}
      </AnimatePresence>

      {!streak.canCheckInToday && (
        <div className="text-center text-xs sm:text-sm text-green-600 dark:text-green-400 py-1">
          ✅ Đã check-in hôm nay!
        </div>
      )}
    </motion.div>
  );
}

