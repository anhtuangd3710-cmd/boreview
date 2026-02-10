// ============================================
// SCENE 1: AWAKENING (0s-3s)
// Black screen with glowing dot, heartbeat pulse
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

export default function Scene1Awakening({ isActive }: SceneProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
      {/* Glowing gradient dot with heartbeat pulse */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1, 1.1, 1, 1.1, 1],
          opacity: 1 
        }}
        transition={{ 
          duration: 2,
          times: [0, 0.3, 0.4, 0.5, 0.6, 0.7],
          ease: 'easeOut'
        }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-20 rounded-full bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-green-500/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Inner glowing dot */}
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-green-400"
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: [
              '0 0 20px rgba(236, 72, 153, 0.5)',
              '0 0 40px rgba(236, 72, 153, 0.8)',
              '0 0 20px rgba(236, 72, 153, 0.5)',
            ],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Text fade in */}
      <motion.p
        className="absolute bottom-1/3 text-white/90 text-lg sm:text-xl md:text-2xl font-light tracking-wide text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        Bạn đang đứng trước một điều mới mẻ…
      </motion.p>

      {/* Subtle particle effect */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: 0.5 + i * 0.2,
            repeat: Infinity,
            repeatDelay: Math.random(),
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  );
}

