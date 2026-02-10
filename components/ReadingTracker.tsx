'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useVisitor } from '@/contexts/VisitorContext';
import { showXPNotification } from '@/components/XPToast';

interface ReadingTrackerProps {
  postId: string;
  minReadTime?: number; // minimum seconds to earn XP
}

export default function ReadingTracker({ postId, minReadTime = 120 }: ReadingTrackerProps) {
  const [readTime, setReadTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [xpEarned, setXpEarned] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef(0);
  
  const { fetchWithVisitor, handleXPResult, isLoggedIn } = useVisitor();

  // Track reading time
  const startTracking = useCallback(() => {
    if (!isReading && isLoggedIn && !xpEarned) {
      setIsReading(true);
      intervalRef.current = setInterval(() => {
        setReadTime(prev => prev + 1);
      }, 1000);
    }
  }, [isReading, isLoggedIn, xpEarned]);

  const stopTracking = useCallback(() => {
    if (isReading) {
      setIsReading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isReading]);

  // Sync reading progress to server
  const syncProgress = useCallback(async (completed: boolean = false) => {
    if (!isLoggedIn || readTime === lastSyncRef.current) return;
    
    try {
      const res = await fetchWithVisitor('/api/visitor/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          readTimeSeconds: readTime - lastSyncRef.current,
          completed,
        }),
      });

      const data = await res.json();
      lastSyncRef.current = readTime;

      if (data.xpResult && !xpEarned) {
        setXpEarned(true);
        handleXPResult(data.xpResult);
        showXPNotification(
          data.xpResult.pointsAwarded,
          'Đọc bài viết',
          data.xpResult.leveledUp 
            ? { oldLevel: data.xpResult.newLevel - 1, newLevel: data.xpResult.newLevel }
            : undefined
        );
      }
    } catch (error) {
      console.error('Failed to sync reading progress:', error);
    }
  }, [isLoggedIn, readTime, postId, fetchWithVisitor, handleXPResult, xpEarned]);

  // Visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
        syncProgress();
      } else {
        startTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startTracking, stopTracking, syncProgress]);

  // Start tracking on mount
  useEffect(() => {
    if (isLoggedIn) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [isLoggedIn, startTracking, stopTracking]);

  // Sync every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (readTime > 0) {
        syncProgress(readTime >= minReadTime);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [readTime, minReadTime, syncProgress]);

  // Sync on unmount or when reaching threshold
  useEffect(() => {
    if (readTime >= minReadTime && !xpEarned) {
      syncProgress(true);
    }
  }, [readTime, minReadTime, xpEarned, syncProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Don't render anything visible - this is a tracking component
  if (!isLoggedIn) return null;

  return null;
}

