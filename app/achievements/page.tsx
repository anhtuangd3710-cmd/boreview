'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  earnedAt?: string;
  isEarned: boolean;
}

const RARITY_CONFIG = {
  common: { gradient: 'from-gray-400 to-gray-500', label: 'Thường', glow: 'shadow-gray-400/30' },
  rare: { gradient: 'from-blue-400 to-blue-600', label: 'Hiếm', glow: 'shadow-blue-500/30' },
  epic: { gradient: 'from-purple-400 to-purple-600', label: 'Sử thi', glow: 'shadow-purple-500/30' },
  legendary: { gradient: 'from-yellow-400 to-orange-500', label: 'Huyền thoại', glow: 'shadow-yellow-500/30' },
};

export default function AchievementsPage() {
  const { visitor, isLoggedIn, isLoading } = useVisitor();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
      return;
    }

    if (visitor?.id) {
      fetchBadges();
    }
  }, [visitor, isLoggedIn, isLoading, router]);

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/visitor/badges', {
        headers: { 'x-visitor-id': visitor?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.allBadges || []);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter((badge) => {
    if (filter === 'earned') return badge.isEarned;
    if (filter === 'locked') return !badge.isEarned;
    return true;
  });

  const earnedCount = badges.filter((b) => b.isEarned).length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const completionPercent = badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/20 dark:bg-yellow-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block text-7xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Thành tựu & Huy hiệu
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Thu thập huy hiệu bằng cách hoạt động tích cực trong cộng đồng.
            Mỗi huy hiệu là một dấu mốc đáng nhớ!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {/* Earned */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
            >
              {earnedCount}
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> Đã đạt được
            </p>
          </motion.div>

          {/* Locked */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-5xl font-bold text-gray-400"
            >
              {badges.length - earnedCount}
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
              <span>🔒</span> Chưa mở khóa
            </p>
          </motion.div>

          {/* Progress */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50 text-center"
          >
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <motion.circle
                  cx="48" cy="48" r="40"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 251.2' }}
                  animate={{ strokeDasharray: `${completionPercent * 2.512} 251.2` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercent}%</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Hoàn thành</p>
          </motion.div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-3 mb-10"
        >
          {[
            { key: 'all', label: 'Tất cả', icon: '📋' },
            { key: 'earned', label: 'Đã đạt', icon: '✅' },
            { key: 'locked', label: 'Chưa mở', icon: '🔒' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Badges Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
          >
            {filteredBadges.map((badge, index) => {
              const config = RARITY_CONFIG[badge.rarity];
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="relative group"
                >
                  {/* Glow effect for earned badges */}
                  {badge.isEarned && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
                  )}

                  <div className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border transition-all duration-300 ${
                    badge.isEarned
                      ? `border-transparent group-hover:border-primary-300 dark:group-hover:border-primary-600 ${config.glow} group-hover:shadow-2xl`
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}>
                    {/* Rarity indicator */}
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient} ${badge.isEarned ? 'animate-pulse' : ''}`} />

                    {/* Icon */}
                    <motion.div
                      className={`text-5xl mb-4 text-center ${!badge.isEarned ? 'filter blur-sm grayscale' : ''}`}
                      animate={badge.isEarned ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {badge.isEarned ? badge.icon : '🔒'}
                    </motion.div>

                    {/* Name */}
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-center truncate">
                      {badge.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 text-center min-h-[2.5rem]">
                      {badge.description}
                    </p>

                    {/* Rarity label */}
                    <div className="flex justify-center">
                      <span className={`inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Earned date */}
                    {badge.isEarned && badge.earnedAt && (
                      <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1">
                        <span>📅</span>
                        {new Date(badge.earnedAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredBadges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.span
              className="text-7xl block mb-6"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {filter === 'earned' ? '🎯' : filter === 'locked' ? '🎉' : '📭'}
            </motion.span>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {filter === 'earned'
                ? 'Chưa có huy hiệu nào. Hãy hoạt động để nhận huy hiệu!'
                : filter === 'locked'
                ? 'Tuyệt vời! Bạn đã mở khóa tất cả huy hiệu!'
                : 'Chưa có huy hiệu nào trong hệ thống.'}
            </p>
          </motion.div>
        )}

        {/* Back to Profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center gap-4"
        >
          <Link
            href="/"
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>←</span> Trang chủ
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>📊</span> Bảng xếp hạng
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

