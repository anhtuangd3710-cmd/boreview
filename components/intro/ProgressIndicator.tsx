// ============================================
// PROGRESS INDICATOR - Dots & Bar
// ============================================

'use client';

import { motion } from 'framer-motion';
import { SCENE_CONFIGS } from './sceneConfig';

interface ProgressIndicatorProps {
  currentScene: number;
  sceneProgress: number;
  onDotClick: (index: number) => void;
}

export default function ProgressIndicator({
  currentScene,
  sceneProgress,
  onDotClick,
}: ProgressIndicatorProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10002] flex flex-col items-center gap-4">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {SCENE_CONFIGS.map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className="relative group"
            aria-label={`Go to scene ${index + 1}`}
          >
            <motion.div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentScene
                  ? 'bg-white scale-125'
                  : index < currentScene
                  ? 'bg-white/80'
                  : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Active scene progress ring */}
            {index === currentScene && (
              <svg
                className="absolute -inset-1 w-[18px] h-[18px]"
                viewBox="0 0 18 18"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="9"
                  cy="9"
                  r="7"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={44}
                  strokeDashoffset={44 * (1 - sceneProgress)}
                  transform="rotate(-90 9 9)"
                />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Scene counter */}
      <div className="text-white/60 text-xs font-medium">
        {currentScene + 1} / {SCENE_CONFIGS.length}
      </div>
    </div>
  );
}

