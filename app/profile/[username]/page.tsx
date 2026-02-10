'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalComments: number;
  totalReactions: number;
  createdAt: string;
  badges: Array<{ id: string; name: string; icon: string; description: string; rarity: string; earnedAt: string }>;
  stats: {
    postsRead: number;
    bookmarks: number;
    following: number;
    followers: number;
  };
}

export default function ProfilePage() {
  const { visitor } = useVisitor();
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isOwnProfile = visitor?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/visitor/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setError('Không tìm thấy người dùng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const xpForNextLevel = (level: number) => level * 100;
  const currentLevelXP = profile ? profile.totalXP % xpForNextLevel(profile.level) : 0;
  const progressPercent = profile ? (currentLevelXP / xpForNextLevel(profile.level)) * 100 : 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (loading) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl mb-6"
        >
          😢
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || 'Không tìm thấy'}</h1>
        <Link href="/" className="text-primary-600 hover:underline">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-300/20 dark:bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/20 dark:border-gray-700/50"
        >
          {/* Cover Gradient */}
          <div className="h-40 md:h-48 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 relative">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3 + i, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Profile Info */}
          <div className="px-6 md:px-10 pb-8 -mt-20 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative"
              >
                <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary-400 via-accent-500 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      profile.displayName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                {/* Level Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-2 -right-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-bold shadow-lg"
                >
                  Lv.{profile.level}
                </motion.div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                >
                  {profile.displayName}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-500 dark:text-gray-400 mt-1"
                >
                  @{profile.username}
                </motion.p>
                {profile.bio && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 dark:text-gray-300 mt-3 max-w-md"
                  >
                    {profile.bio}
                  </motion.p>
                )}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-2"
                >
                  <span>📅</span>
                  Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </motion.p>
              </div>

              {/* XP Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 backdrop-blur-sm rounded-2xl p-5 border border-primary-200/50 dark:border-primary-700/50"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tổng XP</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                    {profile.totalXP.toLocaleString()}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Level {profile.level}</span>
                    <span>Level {profile.level + 1}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-1">
                    {currentLevelXP} / {xpForNextLevel(profile.level)} XP
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: '🔥', label: 'Streak hiện tại', value: profile.currentStreak, suffix: 'ngày', color: 'from-orange-400 to-red-500' },
            { icon: '🏆', label: 'Streak cao nhất', value: profile.longestStreak, suffix: 'ngày', color: 'from-yellow-400 to-amber-500' },
            { icon: '💬', label: 'Bình luận', value: profile.totalComments, suffix: '', color: 'from-blue-400 to-cyan-500' },
            { icon: '❤️', label: 'Cảm xúc', value: profile.totalReactions, suffix: '', color: 'from-pink-400 to-rose-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 dark:border-gray-700/50 text-center group cursor-default"
            >
              <motion.span
                className="text-3xl block mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                {stat.icon}
              </motion.span>
              <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {stat.value} {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">🏅</span> Huy hiệu đã đạt
              <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {profile.badges.length}
              </span>
            </h2>
            {isOwnProfile && (
              <Link
                href="/achievements"
                className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1"
              >
                Xem tất cả <span>→</span>
              </Link>
            )}
          </div>

          {profile.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {profile.badges.slice(0, 10).map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity`} />
                  <div className="relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-600 hover:border-transparent transition-colors">
                    <span className="text-4xl block mb-2">{badge.icon}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{badge.name}</p>
                    <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
                      {badge.rarity === 'legendary' ? 'Huyền thoại' : badge.rarity === 'epic' ? 'Sử thi' : badge.rarity === 'rare' ? 'Hiếm' : 'Thường'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <motion.span
                className="text-6xl block mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎯
              </motion.span>
              <p className="text-lg">Chưa có huy hiệu nào</p>
              <p className="text-sm mt-1">Hãy hoạt động để nhận huy hiệu đầu tiên!</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/achievements"
              className="group px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 transition-all flex items-center gap-2"
            >
              <span>🏆</span> Xem thành tựu
              <motion.span
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
            <Link
              href="/leaderboard"
              className="group px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <span>📊</span> Bảng xếp hạng
            </Link>
            <Link
              href="/bookmarks"
              className="group px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <span>🔖</span> Bài đã lưu
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

