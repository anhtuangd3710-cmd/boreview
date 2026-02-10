// ============================================
// SCENE 3: IDENTITY (6s-9s)
// Text morph animation
// ============================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SceneProps } from '../types';

export default function Scene3Identity({ isActive, progress }: SceneProps) {
  const [showSecondText, setShowSecondText] = useState(false);

  useEffect(() => {
    if (isActive && progress > 0.5) {
      setShowSecondText(true);
    } else {
      setShowSecondText(false);
    }
  }, [isActive, progress]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 50%, rgba(78, 205, 196, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Text container */}
      <div className="relative z-10 text-center px-8">
        <AnimatePresence mode="wait">
          {!showSecondText ? (
            <motion.h2
              key="text1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                Đây không chỉ là một website.
              </span>
            </motion.h2>
          ) : (
            <motion.h2
              key="text2"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Đây là một cộng đồng.
              </span>
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Decorative line */}
        <motion.div
          className="mt-8 mx-auto h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </div>

      {/* Floating elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.6, 0.2],
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

