// ============================================
// SCENE 10: REWARD (35s-40s)
// XP reward popup, mascot waves
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

interface Scene10Props extends SceneProps {
  showConfetti?: () => void;
}

export default function Scene10Reward({ isActive, showConfetti }: Scene10Props) {
  if (!isActive) return null;

  // Trigger confetti when scene becomes active
  if (showConfetti) {
    showConfetti();
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900 overflow-hidden">
      {/* Background celebration */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Golden glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2)_0%,transparent_60%)]" />
      </motion.div>

      {/* Reward popup */}
      <motion.div
        className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl max-w-md mx-4"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-yellow-400/30 rounded-3xl blur-xl -z-10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* XP Badge */}
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl sm:text-4xl">🎉</span>
        </motion.div>

        {/* Reward text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Chúc mừng!
          </h2>
          <p className="text-lg sm:text-xl text-yellow-400 font-semibold mb-4">
            +10 XP cho lần tham gia đầu tiên!
          </p>
          
          {/* XP animation */}
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full border border-yellow-400/30"
            animate={{
              boxShadow: [
                '0 0 20px rgba(251, 191, 36, 0.3)',
                '0 0 40px rgba(251, 191, 36, 0.5)',
                '0 0 20px rgba(251, 191, 36, 0.3)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-2xl">⭐</span>
            <span className="text-2xl font-bold text-yellow-400">10 XP</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="relative z-10 mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        {/* Mascot (cow emoji as placeholder) */}
        <motion.div
          className="text-6xl sm:text-7xl"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
        >
          🐮
        </motion.div>
        
        {/* Speech bubble */}
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-2xl shadow-lg whitespace-nowrap"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <span className="text-sm font-medium text-gray-800">
            Hẹn gặp bạn bên trong nhé! 👋
          </span>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
        </motion.div>
      </motion.div>

      {/* Floating stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl sm:text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
          }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  );
}

