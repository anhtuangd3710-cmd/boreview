'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';

interface RankingEntry {
  visitorId: string;
  username: string;
  displayName: string;
  value: number;
  rank: number;
}

interface LeaderboardData {
  period: string;
  category: string;
  rankings: RankingEntry[];
  userRank: RankingEntry | null;
  updatedAt: string;
}

const PERIODS = [
  { value: 'weekly', label: 'Tuần này' },
  { value: 'monthly', label: 'Tháng này' },
  { value: 'alltime', label: 'Mọi thời đại' },
];

const CATEGORIES = [
  { value: 'xp', label: 'XP', icon: '⭐' },
  { value: 'streak', label: 'Streak', icon: '🔥' },
];

const RANK_STYLES = [
  'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white', // 1st
  'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800', // 2nd
  'bg-gradient-to-r from-orange-400 to-orange-500 text-white', // 3rd
];

export default function Leaderboard() {
  const { isLoggedIn, visitor, fetchWithVisitor } = useVisitor();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [period, setPeriod] = useState('weekly');
  const [category, setCategory] = useState('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, category, isLoggedIn]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const url = `/api/leaderboard?period=${period}&category=${category}&limit=10`;
      const res = isLoggedIn ? await fetchWithVisitor(url) : await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = () => {
    return category === 'xp' ? 'XP' : category === 'streak' ? 'ngày' : '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-bold text-lg">Bảng xếp hạng</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                period === p.value
                  ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                category === c.value
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {c.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings */}
      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))
        ) : (
          data?.rankings.map((entry, index) => {
            const isCurrentUser = visitor?.id === entry.visitorId;
            return (
              <motion.div
                key={entry.visitorId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isCurrentUser
                    ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < 3 ? RANK_STYLES[index] : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {entry.displayName}
                    {isCurrentUser && <span className="ml-1 text-xs text-primary-500">(Bạn)</span>}
                  </div>
                  <div className="text-xs text-gray-500">@{entry.username}</div>
                </div>

                {/* Value */}
                <div className="text-right">
                  <div className="font-bold text-lg">{entry.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{getCategoryLabel()}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Current user rank if not in top */}
      {data?.userRank && !data.rankings.find(r => r.visitorId === visitor?.id) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 mb-2">Xếp hạng của bạn</div>
          <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold">
              #{data.userRank.rank}
            </div>
            <div className="flex-1">
              <div className="font-medium">{data.userRank.displayName}</div>
            </div>
            <div className="font-bold">{data.userRank.value.toLocaleString()} {getCategoryLabel()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

