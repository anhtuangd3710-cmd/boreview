// ============================================
// SCENE 9: CALL TO ACTION (30s-35s)
// Logo zoom, buttons with pulse
// ============================================

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SceneProps } from '../types';

interface Scene9Props extends SceneProps {
  onRegister?: () => void;
  onLogin?: () => void;
}

export default function Scene9CallToAction({ isActive, onRegister, onLogin }: Scene9Props) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 overflow-hidden">
      {/* Background effects */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.2)_0%,transparent_70%)]" />
        
        {/* Animated rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-500/20"
            initial={{ width: 100, height: 100, opacity: 0 }}
            animate={{
              width: [100 + i * 100, 400 + i * 100],
              height: [100 + i * 100, 400 + i * 100],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      {/* Logo */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Glow */}
        <motion.div
          className="absolute -inset-8 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-green-500/40 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <Image
          src="/logo.png"
          alt="Bơ Review"
          width={180}
          height={90}
          className="relative h-16 sm:h-20 md:h-24 w-auto drop-shadow-2xl"
          priority
        />
      </motion.div>

      {/* Main text */}
      <motion.h2
        className="relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center px-8 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
          Sẵn sàng bước vào Bơ Review?
        </span>
      </motion.h2>

      {/* Buttons */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Register button */}
        <motion.button
          onClick={onRegister}
          className="relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-pink-500/30 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="relative z-10">🚀 Tham gia miễn phí</span>
        </motion.button>

        {/* Login button */}
        <motion.button
          onClick={onLogin}
          className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Đăng nhập
        </motion.button>
      </motion.div>

      {/* Floating emojis */}
      {['🎉', '⭐', '🔥', '🏆', '💫', '✨'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl"
          style={{
            left: `${10 + i * 15}%`,
            top: `${60 + (i % 3) * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.3,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

