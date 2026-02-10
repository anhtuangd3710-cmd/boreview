'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryProps {
  postId: string;
}

export default function AISummary({ postId }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const generateSummary = async () => {
    if (summary) {
      setIsOpen(!isOpen);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/50 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tóm tắt AI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by GPT</p>
          </div>
        </div>

        <motion.button
          onClick={generateSummary}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
            transition-all duration-300 shadow-lg
            ${summary
              ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-expanded={isOpen}
          aria-controls="ai-summary-content"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              {summary ? (
                <>
                  <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{isOpen ? 'Ẩn tóm tắt' : 'Xem tóm tắt'}</span>
                </>
              ) : (
                <>
                  <span>🪄</span>
                  <span>Tạo tóm tắt</span>
                </>
              )}
            </>
          )}
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Content */}
      <AnimatePresence>
        {isOpen && summary && (
          <motion.div
            id="ai-summary-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 dark:border-purple-800/50">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {summary}
              </div>
              <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-800/50 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                  <span>🤖</span> AI Generated
                </span>
                <span>Nội dung có thể không hoàn toàn chính xác</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when no summary */}
      {!summary && !loading && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Nhấn nút để AI tạo bản tóm tắt ngắn gọn cho bài viết này
        </p>
      )}
    </motion.div>
  );
}

