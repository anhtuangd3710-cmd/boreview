// ============================================
// SCENE 6: COMMUNITY (17s-21s)
// Multiple avatars with chat bubbles
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

const AVATARS = [
  { emoji: '👩', color: 'from-pink-400 to-rose-500', x: -120, y: -60 },
  { emoji: '👨', color: 'from-blue-400 to-indigo-500', x: 120, y: -60 },
  { emoji: '🧑', color: 'from-green-400 to-teal-500', x: -80, y: 80 },
  { emoji: '👧', color: 'from-purple-400 to-violet-500', x: 80, y: 80 },
  { emoji: '🧔', color: 'from-orange-400 to-amber-500', x: 0, y: -100 },
];

const CHAT_BUBBLES = [
  { text: 'Hay quá!', delay: 0.5, x: -100, y: -80 },
  { text: 'Mình cũng nghĩ vậy!', delay: 1, x: 100, y: -40 },
  { text: 'Chia sẻ thêm nhé!', delay: 1.5, x: -60, y: 60 },
];

export default function Scene6Community({ isActive }: SceneProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Avatars container */}
      <div className="relative z-10 w-80 h-80 sm:w-96 sm:h-96">
        {/* Center avatar (you) */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border-4 border-white/30">
            👤
          </div>
        </motion.div>

        {/* Other avatars */}
        {AVATARS.map((avatar, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ 
              x: avatar.x * 0.7, 
              y: avatar.y * 0.7, 
              scale: 1, 
              opacity: 1 
            }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 15,
              delay: 0.2 + i * 0.1,
            }}
          >
            <motion.div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${avatar.color} 
                         flex items-center justify-center text-xl sm:text-2xl shadow-xl border-2 border-white/20`}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {avatar.emoji}
            </motion.div>
          </motion.div>
        ))}

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
          {AVATARS.map((avatar, i) => (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${avatar.x * 0.7}px)`}
              y2={`calc(50% + ${avatar.y * 0.7}px)`}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            />
          ))}
        </svg>

        {/* Chat bubbles */}
        {CHAT_BUBBLES.map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg"
            style={{ x: bubble.x * 0.8, y: bubble.y * 0.8 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: bubble.delay,
            }}
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {bubble.text}
            </span>
            {/* Bubble tail */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 dark:bg-gray-800/90 rotate-45" />
          </motion.div>
        ))}
      </div>

      {/* Main text */}
      <motion.p
        className="relative z-10 mt-8 text-xl sm:text-2xl md:text-3xl font-bold text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Bạn không đi một mình.
        </span>
      </motion.p>
    </div>
  );
}

