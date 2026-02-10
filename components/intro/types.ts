// ============================================
// INTRO ONBOARDING TYPES
// ============================================

export interface SceneConfig {
  id: number;
  duration: number; // in seconds
  component: string;
  title?: string;
  subtitle?: string;
  texts?: string[];
  icons?: { icon: string; label: string }[];
}

export interface IntroState {
  currentScene: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  progress: number;
  soundEnabled: boolean;
}

export interface IntroControllerReturn {
  state: IntroState;
  nextScene: () => void;
  prevScene: () => void;
  goToScene: (index: number) => void;
  skip: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  toggleSound: () => void;
  sceneProgress: number;
}

// Scene component props
export interface SceneProps {
  isActive: boolean;
  onComplete?: () => void;
  progress: number;
}

// Confetti particle
export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

