'use client';

import { motion } from 'framer-motion';
import { LEVEL_XP_REQUIREMENTS, LEVEL_NAMES, getLevelInfo } from '@/lib/gamification-client';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Client-side level info function
function getClientLevelInfo(level: number) {
  const xpRequired = level <= LEVEL_XP_REQUIREMENTS.length 
    ? LEVEL_XP_REQUIREMENTS[level - 1] 
    : LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + (level - LEVEL_XP_REQUIREMENTS.length) * 5000;
  
  const nextLevelXP = level < LEVEL_XP_REQUIREMENTS.length 
    ? LEVEL_XP_REQUIREMENTS[level] 
    : xpRequired + 5000;
  
  // Find the appropriate name
  let name = 'Người Mới';
  for (const [lvl, lvlName] of Object.entries(LEVEL_NAMES).reverse()) {
    if (level >= parseInt(lvl)) {
      name = lvlName;
      break;
    }
  }
  
  // Level icon based on level tier
  let icon = '🌱';
  if (level >= 50) icon = '👑';
  else if (level >= 30) icon = '💎';
  else if (level >= 20) icon = '🔥';
  else if (level >= 15) icon = '⭐';
  else if (level >= 10) icon = '🏆';
  else if (level >= 5) icon = '📖';
  
  return { level, name, minXP: xpRequired, maxXP: nextLevelXP, icon };
}

export default function XPProgressBar({ 
  currentXP, 
  level, 
  showLabel = true, 
  size = 'md' 
}: XPProgressBarProps) {
  const levelInfo = getClientLevelInfo(level);
  const nextLevelInfo = getClientLevelInfo(level + 1);
  
  const xpInCurrentLevel = currentXP - levelInfo.minXP;
  const xpNeededForNext = nextLevelInfo.minXP - levelInfo.minXP;
  const progress = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100);
  
  const sizeStyles = {
    sm: { bar: 'h-2', text: 'text-xs' },
    md: { bar: 'h-3', text: 'text-sm' },
    lg: { bar: 'h-4', text: 'text-base' },
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between items-center mb-1.5 ${sizeStyles[size].text}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{levelInfo.icon}</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Lv.{level} {levelInfo.name}
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeStyles[size].bar}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      {showLabel && (
        <div className={`flex justify-between mt-1 ${sizeStyles[size].text} text-gray-400 dark:text-gray-500`}>
          <span>Lv.{level}</span>
          <span className="text-purple-500 font-medium">{progress.toFixed(0)}%</span>
          <span>Lv.{level + 1}</span>
        </div>
      )}
    </div>
  );
}

