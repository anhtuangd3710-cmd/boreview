'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REACTION_EMOJIS } from '@/lib/utils';
import { useVisitor } from '@/contexts/VisitorContext';
import { showXPNotification } from '@/components/XPToast';

interface ReactionsProps {
  postId: string;
}

interface ReactionCounts {
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
}

const reactionLabels: Record<string, string> = {
  like: 'Thích',
  love: 'Yêu thích',
  laugh: 'Haha',
  wow: 'Wow',
  sad: 'Buồn',
};

export default function Reactions({ postId }: ReactionsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({
    like: 0, love: 0, laugh: 0, wow: 0, sad: 0,
  });
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState<string | null>(null);

  const { fetchWithVisitor, handleXPResult, isLoggedIn } = useVisitor();

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const res = await fetch(`/api/reactions?postId=${postId}`);
      const data = await res.json();
      setCounts({
        like: data.counts?.like ?? 0,
        love: data.counts?.love ?? 0,
        laugh: data.counts?.laugh ?? 0,
        wow: data.counts?.wow ?? 0,
        sad: data.counts?.sad ?? 0,
      });
      setUserReactions(data.userReactions || []);
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type: string) => {
    setAnimating(type);

    try {
      const res = await fetchWithVisitor('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, postId }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.action === 'added') {
          setCounts(prev => ({ ...prev, [type]: prev[type as keyof ReactionCounts] + 1 }));
          setUserReactions(prev => [...prev, type]);

          // Handle XP result if visitor is logged in
          if (data.xpResult && isLoggedIn) {
            handleXPResult(data.xpResult);
            showXPNotification(
              data.xpResult.pointsAwarded,
              'Thả cảm xúc',
              data.xpResult.leveledUp
                ? { oldLevel: data.xpResult.newLevel - 1, newLevel: data.xpResult.newLevel }
                : undefined
            );
          }
        } else {
          setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type as keyof ReactionCounts] - 1) }));
          setUserReactions(prev => prev.filter(r => r !== type));
        }
      }
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setTimeout(() => setAnimating(null), 300);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          {Object.keys(REACTION_EMOJIS).map((type) => (
            <div key={type} className="flex-1 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-lg">💭</span>
          Bạn cảm thấy thế nào?
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
          {totalReactions} lượt tương tác
        </span>
      </div>

      {/* Reactions Grid */}
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Cảm xúc bài viết">
        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
          const isActive = userReactions.includes(type);
          const count = counts[type as keyof ReactionCounts];

          return (
            <motion.button
              key={type}
              onClick={() => handleReaction(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl
                transition-all duration-300 group
                ${isActive
                  ? 'bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 ring-2 ring-primary-400 dark:ring-primary-500 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
                }
              `}
              aria-label={`${reactionLabels[type]}, ${count} người`}
              aria-pressed={isActive}
            >
              {/* Floating animation on active */}
              <AnimatePresence>
                {animating === type && (
                  <motion.span
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -30, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-2xl"
                  >
                    {emoji}
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.span
                className="text-2xl transition-transform group-hover:scale-110"
                animate={{ scale: animating === type ? 1.3 : 1 }}
                role="img"
                aria-hidden="true"
              >
                {emoji}
              </motion.span>

              <span className={`text-xs font-medium ${
                isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {count}
              </span>

              {/* Label on hover */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {reactionLabels[type]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

