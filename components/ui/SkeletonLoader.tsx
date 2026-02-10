'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

// Base skeleton with shimmer effect
function SkeletonBase({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      role="status"
      aria-label="Đang tải..."
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Text skeleton
export function SkeletonText({ className = '', lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Heading skeleton
export function SkeletonHeading({ className = '' }: SkeletonProps) {
  return <SkeletonBase className={`h-8 w-2/3 ${className}`} />;
}

// Avatar skeleton
export function SkeletonAvatar({ className = '', size = 'md' }: SkeletonProps & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <SkeletonBase className={`rounded-full ${sizeClasses[size]} ${className}`} />;
}

// Image skeleton
export function SkeletonImage({ className = '' }: SkeletonProps) {
  return (
    <SkeletonBase className={`w-full aspect-video rounded-2xl ${className}`} />
  );
}

// Card skeleton (for PostCard)
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white dark:bg-gray-800/90 rounded-2xl md:rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 ${className}`}>
      <SkeletonImage />
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex gap-2">
          <SkeletonBase className="h-6 w-16 rounded-full" />
          <SkeletonBase className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonHeading />
        <SkeletonText lines={2} />
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <SkeletonAvatar size="sm" />
            <SkeletonBase className="h-4 w-20" />
          </div>
          <SkeletonBase className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Featured card skeleton
export function SkeletonFeaturedCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white dark:bg-gray-800/90 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 ${className}`}>
      <div className="md:flex">
        <div className="md:w-1/2">
          <SkeletonBase className="h-64 md:h-80 lg:h-[420px] w-full rounded-none" />
        </div>
        <div className="md:w-1/2 p-7 md:p-10 lg:p-12 space-y-5">
          <div className="flex gap-2">
            <SkeletonBase className="h-7 w-20 rounded-full" />
            <SkeletonBase className="h-7 w-24 rounded-full" />
          </div>
          <SkeletonBase className="h-10 w-full" />
          <SkeletonBase className="h-10 w-4/5" />
          <SkeletonText lines={3} />
          <div className="flex items-center gap-4 pt-4">
            <SkeletonAvatar size="md" />
            <div className="space-y-2">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-3 w-16" />
            </div>
          </div>
          <SkeletonBase className="h-5 w-32" />
        </div>
      </div>
    </div>
  );
}

// Button skeleton
export function SkeletonButton({ className = '' }: SkeletonProps) {
  return <SkeletonBase className={`h-12 w-32 rounded-xl ${className}`} />;
}

// Grid of cards skeleton
export function SkeletonGrid({ count = 6, className = '' }: SkeletonProps & { count?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonBase;

