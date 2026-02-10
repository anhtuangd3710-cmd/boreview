'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useVisitor } from '@/contexts/VisitorContext';

interface ReadingHistoryItem {
  id: string;
  progress: number;
  readTimeSeconds: number;
  completed: boolean;
  lastReadAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
}

interface ContinueReadingProps {
  maxItems?: number;
  className?: string;
}

export default function ContinueReading({ maxItems = 3, className = '' }: ContinueReadingProps) {
  const { isLoggedIn, fetchWithVisitor } = useVisitor();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetchWithVisitor('/api/visitor/reading');
        if (res.ok) {
          const data = await res.json();
          // Filter only incomplete reads
          const incompleteReads = data
            .filter((item: ReadingHistoryItem) => !item.completed && item.progress < 100)
            .slice(0, maxItems);
          setHistory(incompleteReads);
        }
      } catch (error) {
        console.error('Failed to fetch reading history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isLoggedIn, fetchWithVisitor, maxItems]);

  if (!isLoggedIn || loading || history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>📖</span>
        <span>Tiếp tục đọc</span>
      </h3>

      <div className="space-y-3">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/blog/${item.post.slug}`}
              className="flex gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {item.post.thumbnail ? (
                  <Image
                    src={item.post.thumbnail}
                    alt={item.post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    📝
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.post.title}
                </h4>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.progress}% hoàn thành</span>
                    <span>{Math.floor(item.readTimeSeconds / 60)} phút đã đọc</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {history.length > 0 && (
        <Link
          href="/reading-history"
          className="block mt-4 text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
        >
          Xem tất cả lịch sử đọc →
        </Link>
      )}
    </motion.div>
  );
}

