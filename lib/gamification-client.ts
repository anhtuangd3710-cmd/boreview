// Client-side gamification utilities (no Prisma dependency)
// Re-export constants from types
export { 
  LEVEL_XP_REQUIREMENTS, 
  LEVEL_NAMES, 
  XP_REWARDS 
} from '@/types/gamification';

import { LEVEL_XP_REQUIREMENTS, LEVEL_NAMES, LevelInfo } from '@/types/gamification';

// Calculate level from XP
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[i]) {
      return i + 1;
    }
  }
  // Beyond predefined levels
  const lastLevel = LEVEL_XP_REQUIREMENTS.length;
  const lastXP = LEVEL_XP_REQUIREMENTS[lastLevel - 1];
  const extraXP = totalXP - lastXP;
  return lastLevel + Math.floor(extraXP / 5000);
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < LEVEL_XP_REQUIREMENTS.length) {
    return LEVEL_XP_REQUIREMENTS[currentLevel];
  }
  const lastXP = LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
  return lastXP + (currentLevel - LEVEL_XP_REQUIREMENTS.length + 1) * 5000;
}

// Get level info
export function getLevelInfo(level: number): LevelInfo {
  const xpRequired = level <= LEVEL_XP_REQUIREMENTS.length 
    ? LEVEL_XP_REQUIREMENTS[level - 1] 
    : LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + (level - LEVEL_XP_REQUIREMENTS.length) * 5000;
  
  const nextLevelXP = getXPForNextLevel(level);
  
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

// Format XP with commas
export function formatXP(xp: number): string {
  return xp.toLocaleString('vi-VN');
}

// Calculate progress percentage in current level
export function getLevelProgress(totalXP: number, level: number): number {
  const levelInfo = getLevelInfo(level);
  const nextLevelInfo = getLevelInfo(level + 1);
  
  const xpInCurrentLevel = totalXP - levelInfo.minXP;
  const xpNeededForNext = nextLevelInfo.minXP - levelInfo.minXP;
  
  return Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100);
}

