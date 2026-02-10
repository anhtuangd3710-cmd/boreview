// ============================================
// SCENE 7: VISION (21s-25s)
// Network map with text lines
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SceneProps } from '../types';

const WORDS = ['Chia sẻ.', 'Khám phá.', 'Kết nối.'];

// Network nodes
const NODES = [
  { x: 20, y: 30 }, { x: 80, y: 25 }, { x: 50, y: 50 },
  { x: 15, y: 70 }, { x: 85, y: 75 }, { x: 35, y: 20 },
  { x: 65, y: 80 }, { x: 45, y: 35 }, { x: 55, y: 65 },
  { x: 25, y: 55 }, { x: 75, y: 45 }, { x: 40, y: 75 },
];

// Connections between nodes
const CONNECTIONS = [
  [0, 2], [1, 2], [2, 3], [2, 4], [5, 7], [6, 8],
  [7, 8], [9, 2], [10, 2], [11, 8], [0, 9], [1, 10],
];

export default function Scene7Vision({ isActive, progress }: SceneProps) {
  if (!isActive) return null;

  const currentWordIndex = Math.min(Math.floor(progress * 3), 2);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900/40 to-gray-900 overflow-hidden">
      {/* Network background */}
      <div className="absolute inset-0">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {CONNECTIONS.map(([from, to], i) => (
            <motion.line
              key={i}
              x1={`${NODES[from].x}%`}
              y1={`${NODES[from].y}%`}
              x2={`${NODES[to].x}%`}
              y2={`${NODES[to].y}%`}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            />
          ))}
          
          {/* Animated pulse along lines */}
          {CONNECTIONS.slice(0, 6).map(([from, to], i) => (
            <motion.circle
              key={`pulse-${i}`}
              r="3"
              fill="#8B5CF6"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                cx: [`${NODES[from].x}%`, `${NODES[to].x}%`],
                cy: [`${NODES[from].y}%`, `${NODES[to].y}%`],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </svg>

        {/* Network nodes */}
        {NODES.map((node, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-purple-500"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center">
        {/* Words appearing one by one */}
        <div className="flex flex-col items-center gap-4">
          {WORDS.map((word, i) => (
            <motion.h2
              key={word}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{
                opacity: i <= currentWordIndex ? 1 : 0.2,
                y: i <= currentWordIndex ? 0 : 30,
                scale: i === currentWordIndex ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <span
                className={`bg-gradient-to-r ${
                  i === 0
                    ? 'from-pink-400 to-rose-500'
                    : i === 1
                    ? 'from-purple-400 to-violet-500'
                    : 'from-green-400 to-teal-500'
                } bg-clip-text text-transparent`}
              >
                {word}
              </span>
            </motion.h2>
          ))}
        </div>

        {/* Decorative glow */}
        <motion.div
          className="absolute -inset-20 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-green-500/20 rounded-full blur-3xl -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

