// ============================================
// SCENE 8: FUTURE SELF (25s-30s)
// Silhouette facing glowing content world
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

export default function Scene8FutureSelf({ isActive }: SceneProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900 overflow-hidden">
      {/* Glowing horizon */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-purple-500/20 to-transparent" />
        
        {/* Light rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 bg-gradient-to-t from-white/20 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
              width: '2px',
              height: '60%',
              transformOrigin: 'bottom center',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.5, 0.3] }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </motion.div>

      {/* Floating content cards in the distance */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-20 sm:w-20 sm:h-24 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 15}%`,
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              delay: i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Card content placeholder */}
            <div className="p-2">
              <div className="w-full h-2 bg-white/30 rounded mb-1" />
              <div className="w-3/4 h-2 bg-white/20 rounded" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Silhouette */}
      <motion.div
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Person silhouette */}
        <div className="relative">
          {/* Glow behind */}
          <motion.div
            className="absolute -inset-8 bg-gradient-to-t from-pink-500/30 to-purple-500/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Silhouette body */}
          <div className="relative w-20 h-32 sm:w-24 sm:h-40">
            {/* Head */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 border-2 border-purple-500/50" />
            {/* Body */}
            <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 w-14 h-20 sm:w-16 sm:h-24 rounded-t-3xl bg-gray-800 border-2 border-purple-500/50 border-b-0" />
          </div>
        </div>
      </motion.div>

      {/* Main text */}
      <motion.div
        className="absolute top-1/4 left-0 right-0 text-center px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Phiên bản tốt hơn của bạn
          </span>
          <br />
          <span className="text-white/90">đang chờ phía trước.</span>
        </h2>
      </motion.div>

      {/* Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

