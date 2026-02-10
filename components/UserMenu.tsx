'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useVisitor } from '@/contexts/VisitorContext';
import VisitorAuth from './VisitorAuth';
import { IntroOnboarding } from './intro';

export default function UserMenu() {
  const { visitor, isLoggedIn, isLoading, logout } = useVisitor();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle intro completion - open auth modal
  const handleIntroRegister = () => {
    setAuthMode('register');
    setIsAuthOpen(true);
  };

  const handleIntroLogin = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        {/* Intro Onboarding */}
        <IntroOnboarding
          isOpen={showIntro}
          onClose={() => setShowIntro(false)}
          onRegister={handleIntroRegister}
          onLogin={handleIntroLogin}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowIntro(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
        >
          <span className="text-base">🎮</span>
          <span>Tham gia</span>
        </motion.button>
        <VisitorAuth
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultTab={authMode}
        />
      </>
    );
  }

  // Logged in state
  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
          {visitor?.avatar ? (
            <img src={visitor.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            visitor?.displayName?.charAt(0).toUpperCase() || '?'
          )}
        </div>
        {/* Level badge */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">Lv.{visitor?.level}</span>
          <span className="text-orange-500">🔥{visitor?.currentStreak || 0}</span>
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                  {visitor?.displayName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{visitor?.displayName}</p>
                  <p className="text-xs text-gray-500">@{visitor?.username}</p>
                </div>
              </div>
              {/* XP Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-primary-600 dark:text-primary-400 font-medium">Level {visitor?.level}</span>
                  <span className="text-gray-500">{visitor?.totalXP} XP</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    style={{ width: '45%' }} // TODO: Calculate actual progress
                  />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href={`/profile/${visitor?.username}`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>👤</span>
                <span className="text-sm font-medium">Trang cá nhân</span>
              </Link>
              <Link
                href="/achievements"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>🏆</span>
                <span className="text-sm font-medium">Thành tựu & Huy hiệu</span>
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>📊</span>
                <span className="text-sm font-medium">Bảng xếp hạng</span>
              </Link>
              <Link
                href="/bookmarks"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>🔖</span>
                <span className="text-sm font-medium">Bài đã lưu</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-2">
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span>🚪</span>
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

