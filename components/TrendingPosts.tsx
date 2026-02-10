'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  thumbnail?: string | null;
  category?: { name: string; slug: string } | null;
}

interface TrendingPostsProps {
  maxItems?: number;
  compact?: boolean;
  className?: string;
}

export default function TrendingPosts({ maxItems = 5, compact = false, className = '' }: TrendingPostsProps) {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const res = await fetch(`/api/posts?limit=${maxItems}&sort=views`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔥</span>
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Đang hot</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔥</span>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Đang hot</h3>
      </div>

      <div className="space-y-3">
        {posts.slice(0, maxItems).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="flex items-start gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Rank number */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 
                             line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    👁️ {post.views.toLocaleString()}
                  </span>
                  {post.category && (
                    <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 
                                   text-primary-600 dark:text-primary-400 rounded">
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-4 flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 
                 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
      >
        Xem tất cả
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  );
}

