// ============================================
// INTRO CONTROLLER HOOK
// Controls scene navigation, auto-play, progress
// ============================================

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { SCENE_CONFIGS, TOTAL_DURATION, getSceneStartTime } from './sceneConfig';
import { IntroState, IntroControllerReturn } from './types';

export function useIntroController(onComplete?: () => void): IntroControllerReturn {
  const [state, setState] = useState<IntroState>({
    currentScene: 0,
    isPlaying: true,
    isPaused: false,
    isComplete: false,
    progress: 0,
    soundEnabled: true, // Enable sound by default for intro audio
  });

  const [sceneProgress, setSceneProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sceneStartTimeRef = useRef<number>(Date.now());

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sceneTimerRef.current) clearInterval(sceneTimerRef.current);
  }, []);

  // Auto-advance to next scene
  useEffect(() => {
    if (!state.isPlaying || state.isPaused || state.isComplete) return;

    const currentConfig = SCENE_CONFIGS[state.currentScene];
    if (!currentConfig) return;

    sceneStartTimeRef.current = Date.now();

    // Update scene progress every 50ms
    sceneTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - sceneStartTimeRef.current) / 1000;
      const progress = Math.min(elapsed / currentConfig.duration, 1);
      setSceneProgress(progress);
    }, 50);

    // Auto-advance after scene duration
    timerRef.current = setTimeout(() => {
      if (state.currentScene < SCENE_CONFIGS.length - 1) {
        setState(prev => ({ ...prev, currentScene: prev.currentScene + 1 }));
      } else {
        setState(prev => ({ ...prev, isComplete: true, isPlaying: false }));
        onComplete?.();
      }
    }, currentConfig.duration * 1000);

    return clearTimers;
  }, [state.currentScene, state.isPlaying, state.isPaused, state.isComplete, clearTimers, onComplete]);

  // Update overall progress
  useEffect(() => {
    const sceneStart = getSceneStartTime(state.currentScene);
    const currentDuration = SCENE_CONFIGS[state.currentScene]?.duration || 0;
    const overallProgress = (sceneStart + sceneProgress * currentDuration) / TOTAL_DURATION;
    setState(prev => ({ ...prev, progress: overallProgress }));
  }, [state.currentScene, sceneProgress]);

  // Navigation functions
  const nextScene = useCallback(() => {
    clearTimers();
    if (state.currentScene < SCENE_CONFIGS.length - 1) {
      setState(prev => ({ ...prev, currentScene: prev.currentScene + 1 }));
      setSceneProgress(0);
    } else {
      setState(prev => ({ ...prev, isComplete: true, isPlaying: false }));
      onComplete?.();
    }
  }, [state.currentScene, clearTimers, onComplete]);

  const prevScene = useCallback(() => {
    clearTimers();
    if (state.currentScene > 0) {
      setState(prev => ({ ...prev, currentScene: prev.currentScene - 1 }));
      setSceneProgress(0);
    }
  }, [state.currentScene, clearTimers]);

  const goToScene = useCallback((index: number) => {
    clearTimers();
    if (index >= 0 && index < SCENE_CONFIGS.length) {
      setState(prev => ({ ...prev, currentScene: index, isComplete: false, isPlaying: true }));
      setSceneProgress(0);
    }
  }, [clearTimers]);

  const skip = useCallback(() => {
    clearTimers();
    setState(prev => ({ ...prev, isComplete: true, isPlaying: false }));
    onComplete?.();
  }, [clearTimers, onComplete]);

  const pause = useCallback(() => {
    clearTimers();
    setState(prev => ({ ...prev, isPaused: true }));
  }, [clearTimers]);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const replay = useCallback(() => {
    clearTimers();
    setState({
      currentScene: 0,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      progress: 0,
      soundEnabled: state.soundEnabled,
    });
    setSceneProgress(0);
    startTimeRef.current = Date.now();
  }, [clearTimers, state.soundEnabled]);

  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  return {
    state,
    nextScene,
    prevScene,
    goToScene,
    skip,
    pause,
    resume,
    replay,
    toggleSound,
    sceneProgress,
  };
}

