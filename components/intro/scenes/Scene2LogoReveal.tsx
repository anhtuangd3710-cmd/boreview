// ============================================
// SCENE 2: LOGO REVEAL (3s-6s)
// Gradient wave explosion, logo with glow
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';
import Image from 'next/image';

export default function Scene2LogoReveal({ isActive }: SceneProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 overflow-hidden">
      {/* Gradient wave explosion */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Expanding rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pink-500/30"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ 
              width: [0, 600 + i * 200], 
              height: [0, 600 + i * 200],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Gradient background waves */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-green-500/20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
      </motion.div>

      {/* Logo container */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.3,
        }}
      >
        {/* Glow behind logo */}
        <motion.div
          className="absolute -inset-10 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-green-500/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Logo */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/logo.png"
            alt="Bơ Review"
            width={200}
            height={100}
            className="h-20 sm:h-24 md:h-28 w-auto drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-white/80 text-base sm:text-lg md:text-xl font-light tracking-wider text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Một thế giới khám phá tri thức
        </motion.p>
      </motion.div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 3 === 0 ? '#FF6B9D' : i % 3 === 1 ? '#4ECDC4' : '#AA96DA',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

