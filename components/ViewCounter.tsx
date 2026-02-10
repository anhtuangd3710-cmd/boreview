'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  postId: string;
  initialViews: number;
}

export default function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    // Increment view count on mount
    const incrementView = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/view`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          setViews(data.views);
        }
      } catch (error) {
        console.error('Failed to increment view:', error);
      }
    };

    // Only increment if not already viewed in this session
    const viewedPosts = sessionStorage.getItem('viewedPosts');
    const viewed = viewedPosts ? JSON.parse(viewedPosts) : [];
    
    if (!viewed.includes(postId)) {
      incrementView();
      sessionStorage.setItem('viewedPosts', JSON.stringify([...viewed, postId]));
    }
  }, [postId]);

  const formatViews = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {formatViews(views)} lượt xem
    </span>
  );
}

