'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

interface PollProps {
  postId: string;
}

export default function Poll({ postId }: PollProps) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoll();
  }, [postId]);

  const fetchPoll = async () => {
    try {
      const [pollRes, voteRes] = await Promise.all([
        fetch(`/api/polls?postId=${postId}`),
        fetch(`/api/polls/vote?pollId=${postId}`),
      ]);

      const pollData = await pollRes.json();
      const voteData = await voteRes.json();

      setPoll(pollData.poll);
      setHasVoted(voteData.hasVoted);
      setVotedOptionId(voteData.votedOptionId);
    } catch (error) {
      console.error('Failed to fetch poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted || voting) return;

    setVoting(true);
    setError('');

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      setPoll(data.poll);
      setHasVoted(true);
      setVotedOptionId(optionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden my-8 animate-pulse">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-4">
          <div className="h-6 bg-white/30 rounded w-3/4" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden my-8"
      role="group"
      aria-labelledby="poll-question"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-4">
        <h3 id="poll-question" className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">📊</span> {poll.question}
        </h3>
      </div>

      <div className="p-5">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const isVoted = votedOptionId === option.id;
            const isWinning = hasVoted && option.percentage === Math.max(...poll.options.map(o => o.percentage));

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || voting}
                whileHover={!hasVoted ? { scale: 1.02 } : {}}
                whileTap={!hasVoted ? { scale: 0.98 } : {}}
                className={`
                  w-full text-left p-4 rounded-xl transition-all relative overflow-hidden border-2
                  ${hasVoted
                    ? 'cursor-default'
                    : 'hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer'
                  }
                  ${isVoted
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : hasVoted && isWinning
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                  }
                `}
                aria-pressed={isVoted}
              >
                {/* Progress Bar */}
                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${option.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${
                      isVoted
                        ? 'bg-gradient-to-r from-primary-200 to-primary-100 dark:from-primary-800/50 dark:to-primary-900/30'
                        : isWinning
                        ? 'bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-yellow-800/50 dark:to-yellow-900/30'
                        : 'bg-gray-200/50 dark:bg-gray-600/30'
                    }`}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Checkbox/Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isVoted
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isVoted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <span className={`font-medium ${
                      isVoted
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.text}
                    </span>

                    {/* Crown for winning option */}
                    {hasVoted && isWinning && (
                      <span className="text-yellow-500">👑</span>
                    )}
                  </div>

                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        isVoted
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {option.percentage}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {option.votes}
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>🗳️</span>
            <span className="font-semibold text-gray-900 dark:text-white">{poll.totalVotes.toLocaleString('vi-VN')}</span>
            <span>phiếu bình chọn</span>
          </p>
          {!hasVoted && (
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              Nhấn để bình chọn →
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

