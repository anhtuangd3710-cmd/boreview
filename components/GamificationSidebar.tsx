'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import UserProfileCard from './UserProfileCard';
import DailyTasksList from './DailyTasksList';
import StreakDisplay from './StreakDisplay';
import Leaderboard from './Leaderboard';
import GuestWelcomeCard from './GuestWelcomeCard';

interface GamificationSidebarProps {
  className?: string;
}

type TabType = 'profile' | 'tasks' | 'leaderboard';

export default function GamificationSidebar({ className = '' }: GamificationSidebarProps) {
  const { isLoggedIn } = useVisitor();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs = [
    { id: 'profile' as TabType, label: 'Hồ sơ', icon: '👤' },
    { id: 'tasks' as TabType, label: 'Nhiệm vụ', icon: '📋' },
    { id: 'leaderboard' as TabType, label: 'Xếp hạng', icon: '🏆' },
  ];

  if (!isLoggedIn) {
    return (
      <div className={`space-y-4 ${className}`}>
        <GuestWelcomeCard />
        <Leaderboard />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tab Navigation - Compact */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <StreakDisplay />
              <UserProfileCard showProgress={true} showStats={false} />
            </div>
          )}
          {activeTab === 'tasks' && (
            <DailyTasksList maxVisible={3} compact />
          )}
          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

