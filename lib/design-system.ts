// Design System for Bơ Review
// Brand Colors, Typography, Animations, and UI Tokens

export const colors = {
  // Primary - Pink Gradient (from logo)
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  // Secondary - Green (from logo)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Yellow Accent
  yellow: {
    400: '#facc15',
    500: '#eab308',
  },
} as const;

// Animation Variants for Framer Motion
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  // Fade in from left
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  // Scale on hover
  scaleOnHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
  },
  // Card hover effect
  cardHover: {
    whileHover: { y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  // Stagger children
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.1 } },
  },
  // Page transition
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  // Spring animation
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
} as const;

// Typography Scale
export const typography = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  body: 'text-base leading-relaxed',
  bodyLg: 'text-lg leading-relaxed',
  small: 'text-sm',
  caption: 'text-xs text-gray-500 dark:text-gray-400',
} as const;

// Shadow System
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-lg shadow-primary-500/25',
  glowAccent: 'shadow-lg shadow-accent-500/25',
  card: 'shadow-md hover:shadow-xl transition-shadow duration-300',
} as const;

// Border Radius
export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
} as const;

// Button Styles
export const buttonStyles = {
  primary: `px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium 
    rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 
    shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 
    active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`,
  secondary: `px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-medium 
    rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-300 
    shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30 
    active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`,
  outline: `px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 
    font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 
    transition-all duration-300 active:scale-[0.98]`,
  ghost: `px-6 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl 
    hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-[0.98]`,
} as const;

// Card Styles
export const cardStyles = {
  base: `bg-white dark:bg-gray-800 rounded-2xl overflow-hidden 
    border border-gray-100 dark:border-gray-700 transition-all duration-300`,
  hover: `hover:shadow-xl hover:-translate-y-1`,
  gradient: `bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900`,
} as const;

// Glassmorphism
export const glass = {
  light: 'bg-white/80 backdrop-blur-lg border border-white/20',
  dark: 'dark:bg-gray-900/80 dark:backdrop-blur-lg dark:border-gray-700/50',
  combined: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50',
} as const;

// Gradient backgrounds
export const gradients = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
  accent: 'bg-gradient-to-r from-accent-500 to-accent-600',
  hero: 'bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  card: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
  text: 'bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent',
} as const;

