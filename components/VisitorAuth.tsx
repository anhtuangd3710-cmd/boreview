'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';

interface VisitorAuthProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: 'login' | 'register';
}

export default function VisitorAuth({ isOpen = false, onClose = () => {}, defaultTab = 'login' }: VisitorAuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { login, register } = useVisitor();

  // Ensure portal is only rendered on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update tab when defaultTab changes
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const result = await login(username, password || undefined);
        if (result.success) {
          if (result.streakBonus) setStreakBonus(result.streakBonus);
          setTimeout(() => onClose(), 1500);
        } else {
          setError(result.error || 'Đăng nhập thất bại');
        }
      } else {
        if (!displayName) {
          setError('Vui lòng nhập tên hiển thị');
          setIsLoading(false);
          return;
        }
        const result = await register({ username, displayName, password: password || undefined, email: email || undefined });
        if (result.success) {
          setTimeout(() => onClose(), 1500);
        } else {
          setError(result.error || 'Đăng ký thất bại');
        }
      }
    } catch {
      setError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Drag indicator for mobile */}
          <div className="sm:hidden w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
              {tab === 'login' ? '👋' : '🎉'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {tab === 'login' ? 'Chào mừng trở lại!' : 'Tham gia cộng đồng'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tab === 'login' ? 'Đăng nhập để tiếp tục hành trình' : 'Tạo tài khoản miễn phí ngay'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-5 sm:mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Streak Bonus Alert */}
          {streakBonus > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl mb-4 text-center text-sm font-medium"
            >
              🔥 +{streakBonus} XP Thưởng Streak!
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="vd: reviewer123"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white text-sm sm:text-base
                         transition-all"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             dark:bg-gray-700 dark:text-white text-sm sm:text-base
                             transition-all"
                    required
                    minLength={2}
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             dark:bg-gray-700 dark:text-white text-sm sm:text-base
                             transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mật khẩu <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         dark:bg-gray-700 dark:text-white text-sm sm:text-base
                         transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Không bắt buộc nếu chỉ dùng tên đăng nhập
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white
                       font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50
                       shadow-lg shadow-primary-500/25 text-sm sm:text-base"
            >
              {isLoading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng Nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Benefits */}
          {tab === 'register' && (
            <div className="mt-5 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎁 Quyền lợi thành viên:</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Nhận ngay 25 XP + Huy hiệu &quot;Người Mới&quot;</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🔥</span>
                  <span>Tích streak mỗi ngày để nhận bonus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🏆</span>
                  <span>Lên level và mở khoá huy hiệu độc quyền</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Theo dõi tiến độ đọc và lịch sử</span>
                </li>
              </ul>
            </div>
          )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}

