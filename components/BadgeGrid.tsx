'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';

interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  earnedAt?: string;
  isFeatured?: boolean;
}

interface BadgeGridProps {
  showAll?: boolean;
  selectable?: boolean;
  onSelect?: (badgeIds: string[]) => void;
  maxFeatured?: number;
}

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const CATEGORY_NAMES: Record<string, string> = {
  category: 'Thể loại',
  engagement: 'Tương tác',
  streak: 'Streak',
  special: 'Đặc biệt',
};

export default function BadgeGrid({ showAll = false, selectable = false, onSelect, maxFeatured = 3 }: BadgeGridProps) {
  const { isLoggedIn, fetchWithVisitor } = useVisitor();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Record<string, Badge[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBadges();
  }, [isLoggedIn, showAll]);

  const fetchBadges = async () => {
    try {
      if (showAll) {
        const res = await fetch('/api/visitor/badges?type=all');
        const data = await res.json();
        setAllBadges(data.grouped || {});
      } else if (isLoggedIn) {
        const res = await fetchWithVisitor('/api/visitor/badges');
        const data = await res.json();
        setBadges(data.badges || []);
        setSelectedIds(data.badges?.filter((b: Badge) => b.isFeatured).map((b: Badge) => b.id) || []);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBadge = (badgeId: string) => {
    if (!selectable) return;
    
    setSelectedIds(prev => {
      let newIds;
      if (prev.includes(badgeId)) {
        newIds = prev.filter(id => id !== badgeId);
      } else if (prev.length < maxFeatured) {
        newIds = [...prev, badgeId];
      } else {
        return prev;
      }
      onSelect?.(newIds);
      return newIds;
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const renderBadge = (badge: Badge, earned: boolean = true) => {
    const rarityClass = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
    const isSelected = selectedIds.includes(badge.id);
    
    return (
      <motion.div
        key={badge.id}
        whileHover={{ scale: 1.05 }}
        whileTap={selectable ? { scale: 0.95 } : undefined}
        onClick={() => earned && toggleBadge(badge.id)}
        className={`relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center text-center
          ${earned 
            ? `bg-gradient-to-br ${rarityClass} text-white cursor-pointer` 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 opacity-50'
          }
          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}
          ${selectable && earned ? 'hover:ring-2 hover:ring-white/50' : ''}
        `}
      >
        <span className="text-2xl mb-1">{badge.icon}</span>
        <span className="text-xs font-medium leading-tight">{badge.name}</span>
        {isSelected && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-white text-primary-600 rounded-full flex items-center justify-center text-xs">
            ✓
          </div>
        )}
      </motion.div>
    );
  };

  if (showAll) {
    return (
      <div className="space-y-6">
        {Object.entries(allBadges).map(([category, categoryBadges]) => (
          <div key={category}>
            <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
              {CATEGORY_NAMES[category] || category}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {categoryBadges.map(badge => {
                const earned = badges.some(b => b.id === badge.id);
                return renderBadge(badge, earned);
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl mb-2 block">🏆</span>
        <p>Chưa có huy hiệu nào!</p>
        <p className="text-sm">Tiếp tục hoạt động để nhận huy hiệu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {badges.map(badge => renderBadge(badge, true))}
    </div>
  );
}

