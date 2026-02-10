'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';
import UserProfileCard from './UserProfileCard';
import DailyTasksList from './DailyTasksList';
import StreakDisplay from './StreakDisplay';
import GuestWelcomeCard from './GuestWelcomeCard';
import TrendingPosts from './TrendingPosts';

type UserTabType = 'profile' | 'tasks';

export default function HomeSidebar() {
  const { isLoggedIn } = useVisitor();
  const [activeUserTab, setActiveUserTab] = useState<UserTabType>('profile');

  const userTabs = [
    { id: 'profile' as UserTabType, label: 'Hồ sơ', icon: '👤' },
    { id: 'tasks' as UserTabType, label: 'Nhiệm vụ', icon: '📋' },
  ];

  return (
    <aside className="space-y-4">
      {/* Trending Posts - Compact version */}
      <TrendingPosts maxItems={3} />

      {/* User-specific content - Tabbed interface */}
      {isLoggedIn ? (
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveUserTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium transition-all ${
                  activeUserTab === tab.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeUserTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {activeUserTab === 'profile' && (
                  <div className="space-y-3">
                    <StreakDisplay />
                    <UserProfileCard showProgress={true} showStats={false} className="!p-3 !rounded-xl" />
                  </div>
                )}
                {activeUserTab === 'tasks' && (
                  <DailyTasksList maxVisible={3} compact />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <GuestWelcomeCard />
      )}
    </aside>
  );
}

