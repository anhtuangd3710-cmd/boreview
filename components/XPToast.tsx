'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPNotification {
  id: string;
  points: number;
  message?: string;
  levelUp?: { oldLevel: number; newLevel: number };
}

let addNotification: ((notification: Omit<XPNotification, 'id'>) => void) | null = null;

export function showXPNotification(points: number, message?: string, levelUp?: { oldLevel: number; newLevel: number }) {
  if (addNotification) {
    addNotification({ points, message, levelUp });
  }
}

export default function XPToast() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const addNotificationHandler = useCallback((notification: Omit<XPNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addNotification = addNotificationHandler;
    return () => {
      addNotification = null;
    };
  }, [addNotificationHandler]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="pointer-events-auto"
          >
            {notification.levelUp ? (
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎉</span>
                  <div>
                    <div className="font-bold text-lg">Level Up!</div>
                    <div className="text-sm opacity-90">
                      Lv.{notification.levelUp.oldLevel} → Lv.{notification.levelUp.newLevel}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <span className="font-bold">+{notification.points} XP</span>
                  {notification.message && (
                    <span className="text-sm opacity-90 ml-2">{notification.message}</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

