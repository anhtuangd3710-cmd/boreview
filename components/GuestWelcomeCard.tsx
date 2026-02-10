'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import VisitorAuth from './VisitorAuth';
import { IntroOnboarding } from './intro';

export default function GuestWelcomeCard() {
  const [showAuth, setShowAuth] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  // Open intro first, then auth after intro completes
  const openIntro = () => {
    setShowIntro(true);
  };

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  // Handle intro completion - open auth modal
  const handleIntroRegister = () => {
    setShowIntro(false);
    setAuthTab('register');
    setShowAuth(true);
  };

  const handleIntroLogin = () => {
    setShowIntro(false);
    setAuthTab('login');
    setShowAuth(true);
  };

  return (
    <>
      {/* Cinematic Intro */}
      <IntroOnboarding
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
        onRegister={handleIntroRegister}
        onLogin={handleIntroLogin}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-purple-500/10 
                   dark:from-primary-900/30 dark:via-accent-900/30 dark:to-purple-900/30
                   border border-primary-200/50 dark:border-primary-800/30 p-5"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-400/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                          flex items-center justify-center text-2xl shadow-lg">
              👋
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Chào bạn mới!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Khám phá cộng đồng Bơ Review
              </p>
            </div>
          </div>

          {/* Benefits preview - compact */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { icon: '⭐', text: 'Tích XP' },
              { icon: '🔥', text: 'Streak' },
              { icon: '🏆', text: 'Huy hiệu' },
              { icon: '📊', text: 'Xếp hạng' },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 
                         text-sm text-gray-600 dark:text-gray-300"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA - subtle, not aggressive */}
          <div className="flex gap-2">
            <button
              onClick={() => openIntro()}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-accent-500
                       text-white text-sm font-medium rounded-xl hover:opacity-90
                       transition-all shadow-lg shadow-primary-500/25"
            >
              Tham gia miễn phí
            </button>
            <button
              onClick={() => openAuth('login')}
              className="py-2.5 px-4 bg-white/80 dark:bg-gray-800/80 
                       text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl 
                       hover:bg-white dark:hover:bg-gray-700 transition-all
                       border border-gray-200 dark:border-gray-700"
            >
              Đăng nhập
            </button>
          </div>

          {/* Reassurance */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
            Không bắt buộc • Xem nội dung thoải mái
          </p>
        </div>
      </motion.div>

      {/* Auth Modal - only shows when user clicks */}
      <VisitorAuth 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        defaultTab={authTab}
      />
    </>
  );
}

