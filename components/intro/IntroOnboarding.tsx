// ============================================
// INTRO ONBOARDING - Main Component
// Cinematic onboarding experience for Bơ Review
// ============================================

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntroController } from './useIntroController';
import { SCENE_CONFIGS } from './sceneConfig';
import ProgressIndicator from './ProgressIndicator';
import Confetti from './Confetti';

// Import all scenes
import {
  Scene1Awakening,
  Scene2LogoReveal,
  Scene3Identity,
  Scene4Gamification,
  Scene5XPGain,
  Scene6Community,
  Scene7Vision,
  Scene8FutureSelf,
  Scene9CallToAction,
  Scene10Reward,
} from './scenes';

interface IntroOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
}

export default function IntroOnboarding({
  isOpen,
  onClose,
  onRegister,
  onLogin,
}: IntroOnboardingProps) {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleComplete = useCallback(() => {
    // Auto close after completion or let user interact
  }, []);

  const controller = useIntroController(handleComplete);
  const { state, nextScene, goToScene, skip, replay, toggleSound, sceneProgress } = controller;

  // Initialize and control background audio
  useEffect(() => {
    if (isOpen && !audioRef.current) {
      audioRef.current = new Audio('/audio/audio.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    if (isOpen && audioRef.current) {
      if (state.soundEnabled) {
        audioRef.current.play().catch(() => {
          // Auto-play may be blocked by browser
          console.log('Audio autoplay blocked');
        });
      } else {
        audioRef.current.pause();
      }
    }

    // Cleanup when closed
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isOpen, state.soundEnabled]);

  // Reset audio on replay
  useEffect(() => {
    if (state.currentScene === 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (state.soundEnabled) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [state.currentScene, state.soundEnabled]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextScene();
          break;
        case 'Escape':
          skip();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextScene, skip, onClose]);

  // Trigger confetti on scene 10
  useEffect(() => {
    if (state.currentScene === 9) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [state.currentScene]);

  // Handle CTA actions
  const handleRegister = () => {
    onClose();
    onRegister?.();
  };

  const handleLogin = () => {
    onClose();
    onLogin?.();
  };

  if (!mounted || !isOpen) return null;

  // Render current scene
  const renderScene = () => {
    const props = { isActive: true, progress: sceneProgress };

    switch (state.currentScene) {
      case 0: return <Scene1Awakening {...props} />;
      case 1: return <Scene2LogoReveal {...props} />;
      case 2: return <Scene3Identity {...props} />;
      case 3: return <Scene4Gamification {...props} />;
      case 4: return <Scene5XPGain {...props} />;
      case 5: return <Scene6Community {...props} />;
      case 6: return <Scene7Vision {...props} />;
      case 7: return <Scene8FutureSelf {...props} />;
      case 8: return <Scene9CallToAction {...props} onRegister={handleRegister} onLogin={handleLogin} />;
      case 9: return <Scene10Reward {...props} showConfetti={() => setShowConfetti(true)} />;
      default: return null;
    }
  };

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="intro-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black"
          onClick={nextScene}
        >
          {/* Scene container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {renderScene()}
            </motion.div>
          </AnimatePresence>

          {/* Confetti */}
          <Confetti isActive={showConfetti} />

          {/* Top controls */}
          <div className="fixed top-6 left-6 right-6 z-[10003] flex justify-between items-center">
            {/* Sound toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={(e) => { e.stopPropagation(); toggleSound(); }}
              className="p-3 bg-white/10 backdrop-blur-sm text-white/70 rounded-full border border-white/20
                       hover:bg-white/20 hover:text-white transition-all"
              aria-label={state.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {state.soundEnabled ? '🔊' : '🔇'}
            </motion.button>

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={(e) => { e.stopPropagation(); skip(); onClose(); }}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium
                       rounded-full border border-white/20 hover:bg-white/20 hover:text-white transition-all"
            >
              Bỏ qua →
            </motion.button>
          </div>

          {/* Progress indicator */}
          <ProgressIndicator
            currentScene={state.currentScene}
            sceneProgress={sceneProgress}
            onDotClick={(index) => { goToScene(index); }}
          />

          {/* Replay button (shown when complete) */}
          {state.isComplete && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => { e.stopPropagation(); replay(); }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10003] px-6 py-3
                       bg-white/10 backdrop-blur-sm text-white font-medium rounded-full
                       border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Xem lại</span>
            </motion.button>
          )}

          {/* Click hint */}
          {state.currentScene < 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ delay: 2, duration: 2, repeat: Infinity }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[10002] text-white/50 text-sm"
            >
              Nhấn để tiếp tục
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

