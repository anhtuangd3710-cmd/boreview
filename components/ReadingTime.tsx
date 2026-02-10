import { calculateReadingTime, formatReadingTime } from '@/lib/utils';

interface ReadingTimeProps {
  content: string;
  className?: string;
}

export default function ReadingTime({ content, className = '' }: ReadingTimeProps) {
  const minutes = calculateReadingTime(content);
  
  return (
    <span className={`inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{formatReadingTime(minutes)}</span>
    </span>
  );
}

