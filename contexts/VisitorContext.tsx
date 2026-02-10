'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface VisitorProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  badges?: Array<{ id: string; name: string; icon: string }>;
}

interface XPResult {
  newXP: number;
  leveledUp: boolean;
  newLevel: number;
  pointsAwarded: number;
}

interface VisitorContextType {
  visitor: VisitorProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string; streakBonus?: number }>;
  register: (data: { username: string; displayName: string; password?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateXP: (newXP: number, newLevel?: number) => void;
  getVisitorId: () => string | null;
  fetchWithVisitor: (url: string, options?: RequestInit) => Promise<Response>;
  handleXPResult: (xpResult: XPResult | null) => void;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

const STORAGE_KEY = 'bo_review_visitor';

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load visitor from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.expiresAt > Date.now()) {
          setVisitor(data.visitor);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Save visitor to localStorage
  const saveVisitor = useCallback((profile: VisitorProfile, token: string) => {
    const data = {
      visitor: profile,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVisitor(profile);
  }, []);

  const login = useCallback(async (username: string, password?: string) => {
    try {
      const res = await fetch('/api/visitor/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      saveVisitor(data.visitor, data.token);
      return { success: true, streakBonus: data.streakBonus };
    } catch {
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }, [saveVisitor]);

  const register = useCallback(async (regData: { username: string; displayName: string; password?: string; email?: string }) => {
    try {
      const res = await fetch('/api/visitor/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...regData }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      saveVisitor(data.visitor, data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  }, [saveVisitor]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVisitor(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!visitor?.id) return;
    try {
      const res = await fetch(`/api/visitor/profile?id=${visitor.id}`);
      if (res.ok) {
        const data = await res.json();
        setVisitor(prev => prev ? { ...prev, ...data } : null);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.visitor = { ...parsed.visitor, ...data };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  }, [visitor?.id]);

  const updateXP = useCallback((newXP: number, newLevel?: number) => {
    setVisitor(prev => {
      if (!prev) return null;
      const updated = { ...prev, totalXP: newXP };
      if (newLevel) updated.level = newLevel;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.visitor = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return updated;
    });
  }, []);

  const getVisitorId = useCallback(() => {
    return visitor?.id || null;
  }, [visitor?.id]);

  // Fetch with visitor ID header
  const fetchWithVisitor = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (visitor?.id) {
      headers.set('x-visitor-id', visitor.id);
    }
    return fetch(url, { ...options, headers });
  }, [visitor?.id]);

  // Handle XP result from API responses
  const handleXPResult = useCallback((xpResult: XPResult | null) => {
    if (xpResult && visitor) {
      updateXP(xpResult.newXP, xpResult.newLevel);
      if (xpResult.leveledUp) {
        // Could trigger a level-up celebration here
        console.log(`🎉 Level Up! Now level ${xpResult.newLevel}`);
      }
    }
  }, [visitor, updateXP]);

  return (
    <VisitorContext.Provider
      value={{
        visitor,
        isLoading,
        isLoggedIn: !!visitor,
        login,
        register,
        logout,
        refreshProfile,
        updateXP,
        getVisitorId,
        fetchWithVisitor,
        handleXPResult,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
}

