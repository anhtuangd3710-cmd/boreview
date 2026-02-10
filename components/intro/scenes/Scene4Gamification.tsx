// ============================================
// SCENE 4: GAMIFICATION (9s-13s)
// Floating icons with labels
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

const ICONS = [
  { icon: '⭐', label: 'XP', color: 'from-yellow-400 to-orange-500' },
  { icon: '🔥', label: 'Streak', color: 'from-orange-500 to-red-500' },
  { icon: '🏆', label: 'Badge', color: 'from-amber-400 to-yellow-500' },
  { icon: '📊', label: 'Ranking', color: 'from-blue-400 to-purple-500' },
];

export default function Scene4Gamification({ isActive }: SceneProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900 overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Icons grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-12">
        {ICONS.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 50, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: index * 0.15,
            }}
          >
            {/* Icon container with glow */}
            <motion.div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${item.color} 
                         flex items-center justify-center text-3xl sm:text-4xl shadow-2xl`}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2 + index * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} blur-xl opacity-50`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className="relative z-10">{item.icon}</span>
            </motion.div>

            {/* Label */}
            <motion.span
              className="mt-3 text-white/90 font-semibold text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {item.label}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Main text */}
      <motion.p
        className="relative z-10 text-lg sm:text-xl md:text-2xl text-white/90 font-medium text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
          Mỗi hành động của bạn đều tạo ra sức mạnh.
        </span>
      </motion.p>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#AA96DA'][i % 4],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

