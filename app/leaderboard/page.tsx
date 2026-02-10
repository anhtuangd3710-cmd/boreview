'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  visitorId: string;
  displayName: string;
  username: string;
  avatar?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

type TimeFilter = 'weekly' | 'monthly' | 'alltime';
type SortBy = 'xp' | 'streak';

const RANK_CONFIG = {
  1: { icon: '🥇', gradient: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-400/50', bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' },
  2: { icon: '🥈', gradient: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/50', bg: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50' },
  3: { icon: '🥉', gradient: 'from-orange-400 to-orange-500', glow: 'shadow-orange-400/50', bg: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
};

export default function LeaderboardPage() {
  const { visitor, isLoggedIn } = useVisitor();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const [sortBy, setSortBy] = useState<SortBy>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, sortBy, visitor?.id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: timeFilter,
        sortBy,
        limit: '50',
      });
      if (visitor?.id) {
        params.append('visitorId', visitor.id);
      }

      const res = await fetch(`/api/leaderboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) return RANK_CONFIG[rank as 1 | 2 | 3].icon;
    return rank;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-yellow-300/20 dark:bg-yellow-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block text-7xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bảng xếp hạng
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Xem ai đang dẫn đầu cộng đồng Bơ Review. Hoạt động tích cực để leo hạng!
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
        >
          {/* Time Filter */}
          <div className="flex justify-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-gray-700/50">
            {[
              { key: 'weekly', label: 'Tuần này', icon: '📅' },
              { key: 'monthly', label: 'Tháng này', icon: '🗓️' },
              { key: 'alltime', label: 'Mọi thời đại', icon: '👑' },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeFilter(tab.key as TimeFilter)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  timeFilter === tab.key
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex justify-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-gray-700/50">
            {[
              { key: 'xp', label: 'XP', icon: '⭐' },
              { key: 'streak', label: 'Streak', icon: '🔥' },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(tab.key as SortBy)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  sortBy === tab.key
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* User's Rank (if logged in) */}
        {isLoggedIn && userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-lg opacity-30" />
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-primary-200 dark:border-primary-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl ${
                    userRank.rank <= 3
                      ? `bg-gradient-to-br ${RANK_CONFIG[userRank.rank as 1|2|3].gradient} text-white shadow-lg ${RANK_CONFIG[userRank.rank as 1|2|3].glow}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getRankDisplay(userRank.rank)}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Thứ hạng của bạn</p>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{userRank.displayName}</p>
                  <p className="text-sm text-gray-500">Level {userRank.level}</p>
                </div>
                <div className="text-right">
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500"
                  >
                    {sortBy === 'xp' ? userRank.totalXP.toLocaleString() : userRank.currentStreak}
                  </motion.p>
                  <p className="text-sm text-gray-500">{sortBy === 'xp' ? 'XP' : 'ngày streak'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50"
        >
          {loading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"
              />
              <p className="text-gray-500 mt-4">Đang tải bảng xếp hạng...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {leaderboard.map((entry, index) => {
                const isTopThree = entry.rank <= 3;
                const rankConfig = isTopThree ? RANK_CONFIG[entry.rank as 1|2|3] : null;

                return (
                  <motion.div
                    key={entry.visitorId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring' }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className={`relative flex items-center gap-4 p-5 transition-all cursor-pointer ${
                      entry.isCurrentUser
                        ? 'bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20'
                        : isTopThree
                          ? rankConfig?.bg
                          : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    {/* Top 3 glow effect */}
                    {isTopThree && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${rankConfig?.gradient}`} />
                    )}

                    {/* Rank */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isTopThree
                          ? `bg-gradient-to-br ${rankConfig?.gradient} text-white shadow-lg ${rankConfig?.glow}`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {getRankDisplay(entry.rank)}
                    </motion.div>

                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 overflow-hidden">
                          {entry.avatar ? (
                            <img src={entry.avatar} alt="" className="w-full h-full rounded-[10px] object-cover" />
                          ) : (
                            entry.displayName?.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      {/* Level badge */}
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gray-800 dark:bg-gray-600 text-white text-xs font-bold rounded-md">
                        {entry.level}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                        {entry.displayName}
                        {entry.isCurrentUser && (
                          <span className="text-xs bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-0.5 rounded-full">
                            Bạn
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{entry.username}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        isTopThree
                          ? `text-transparent bg-clip-text bg-gradient-to-r ${rankConfig?.gradient}`
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {sortBy === 'xp' ? entry.totalXP.toLocaleString() : entry.currentStreak}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        <span>{sortBy === 'xp' ? 'XP' : 'ngày'}</span>
                        <span className="opacity-50">•</span>
                        <span>{sortBy === 'xp' ? `🔥${entry.currentStreak}` : `⭐${entry.totalXP}`}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center"
            >
              <motion.span
                className="text-7xl block mb-6"
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🏆
              </motion.span>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">Chưa có dữ liệu xếp hạng</p>
              <p className="text-gray-500">Hãy là người đầu tiên tham gia cộng đồng!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Link
            href="/"
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>←</span> Trang chủ
          </Link>
          <Link
            href="/achievements"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>🏅</span> Thành tựu
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

