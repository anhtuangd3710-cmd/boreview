'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';

interface DailyTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  taskType: string;
  requirement: number;
  xpReward: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

interface TaskSummary {
  total: number;
  completed: number;
  allCompleted: boolean;
  bonusAwarded: boolean;
}

interface DailyTasksListProps {
  maxVisible?: number;
  compact?: boolean;
}

export default function DailyTasksList({ maxVisible, compact = false }: DailyTasksListProps = {}) {
  const { isLoggedIn, fetchWithVisitor } = useVisitor();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  const fetchTasks = async () => {
    try {
      const res = await fetchWithVisitor('/api/visitor/daily-tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || loading) return null;

  const progressPercentage = summary ? (summary.completed / summary.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-2xl">📋</span>
          <h3 className="font-bold text-sm sm:text-lg text-gray-800 dark:text-gray-100">Nhiệm vụ hôm nay</h3>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {summary?.completed}/{summary?.total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
        />
      </div>

      {/* Task list */}
      <div className={`space-y-2 ${compact ? '' : 'sm:space-y-3'}`}>
        <AnimatePresence>
          {(maxVisible && !showAll ? tasks.slice(0, maxVisible) : tasks).map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2 ${compact ? 'p-2 rounded-lg' : 'sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl'} transition-colors ${
                task.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              {/* Icon */}
              <div className={`${compact ? 'w-7 h-7 text-sm' : 'w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-xl'} rounded-lg flex items-center justify-center flex-shrink-0 ${
                task.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                {task.completed ? '✓' : task.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`${compact ? 'text-sm' : 'text-sm sm:text-base'} font-medium truncate ${
                  task.completed
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {task.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {task.progress}/{task.requirement} • +{task.xpReward} XP
                </div>
              </div>

              {/* Progress indicator */}
              {!task.completed && (
                <div className={`${compact ? 'w-10' : 'w-12 sm:w-16'} flex-shrink-0`}>
                  <div className="h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${Math.min((task.progress / task.requirement) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Show more/less button */}
        {maxVisible && tasks.length > maxVisible && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-xs text-purple-600 dark:text-purple-400 hover:underline py-1"
          >
            {showAll ? 'Thu gọn' : `Xem thêm ${tasks.length - maxVisible} nhiệm vụ`}
          </button>
        )}
      </div>

      {/* Bonus message */}
      {summary?.allCompleted && !summary?.bonusAwarded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl text-center"
        >
          <span className="text-xl">🎉</span>
          <p className="font-medium text-yellow-600 dark:text-yellow-400">
            Chúc mừng! Bạn đã hoàn thành tất cả nhiệm vụ!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

