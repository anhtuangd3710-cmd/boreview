'use client';

import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

interface BookmarkButtonProps {
  postId: string;
  postTitle: string;
  postSlug: string;
  postExcerpt: string;
  className?: string;
}

interface Bookmark {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  savedAt: string;
}

export default function BookmarkButton({ postId, postTitle, postSlug, postExcerpt, className = '' }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const bookmarks = getLocalStorage<Bookmark[]>('bookmarks', []);
    setIsBookmarked(bookmarks.some(b => b.id === postId));
  }, [postId]);

  const toggleBookmark = () => {
    setAnimating(true);
    
    const bookmarks = getLocalStorage<Bookmark[]>('bookmarks', []);
    
    if (isBookmarked) {
      const updated = bookmarks.filter(b => b.id !== postId);
      setLocalStorage('bookmarks', updated);
      setIsBookmarked(false);
    } else {
      const newBookmark: Bookmark = {
        id: postId,
        title: postTitle,
        slug: postSlug,
        excerpt: postExcerpt,
        savedAt: new Date().toISOString(),
      };
      setLocalStorage('bookmarks', [...bookmarks, newBookmark]);
      setIsBookmarked(true);
    }

    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200 transform
        ${isBookmarked 
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
        ${animating ? 'scale-110' : 'scale-100'}
        ${className}
      `}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
    >
      <svg
        className={`w-4 h-4 transition-transform ${animating ? 'scale-125' : ''}`}
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {isBookmarked ? 'Đã lưu' : 'Lưu'}
    </button>
  );
}

