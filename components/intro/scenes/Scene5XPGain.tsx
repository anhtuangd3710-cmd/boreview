// ============================================
// SCENE 5: XP GAIN (13s-17s)
// Avatar with XP flying in, progress bar
// ============================================

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SceneProps } from '../types';

export default function Scene5XPGain({ isActive, progress }: SceneProps) {
  const [xpCount, setXpCount] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (isActive) {
      // Animate XP count
      const targetXP = Math.floor(progress * 150);
      setXpCount(targetXP);
      
      // Level up at certain thresholds
      if (progress > 0.7) setLevel(3);
      else if (progress > 0.4) setLevel(2);
      else setLevel(1);
    }
  }, [isActive, progress]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-hidden">
      {/* Background effects */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Avatar container */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Avatar glow */}
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-yellow-400/50 to-orange-500/50 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Avatar */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-white/20">
          👤
        </div>

        {/* Level badge */}
        <motion.div
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg"
          animate={{ scale: level > 1 ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {level}
        </motion.div>

        {/* Flying XP numbers */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 font-bold text-lg"
            initial={{
              x: (Math.random() - 0.5) * 200,
              y: 100 + Math.random() * 50,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            +{10 + i * 5}
          </motion.div>
        ))}
      </motion.div>

      {/* XP Counter */}
      <motion.div
        className="relative z-10 text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2">
          {xpCount} XP
        </div>
        
        {/* Progress bar */}
        <div className="w-48 sm:w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Action texts */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {['Đọc bài → Tích XP', 'Bình luận → Lên cấp'].map((text, i) => (
          <motion.div
            key={text}
            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            initial={{ x: i === 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.2 }}
          >
            <span className="text-white/90 font-medium">{text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

