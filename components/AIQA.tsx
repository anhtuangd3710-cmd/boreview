'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIQAProps {
  postId: string;
}

interface QAPair {
  question: string;
  answer: string;
}

export default function AIQA({ postId }: AIQAProps) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setHistory(prev => [...prev, { question, answer: data.answer }]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">🤖</span>
          Hỏi AI về bài viết này
        </h3>
      </div>

      <div className="p-5">
        {/* Q&A History */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2"
            >
              {history.map((qa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary-500/25">
                      ?
                    </div>
                    <div className="flex-1 bg-primary-50 dark:bg-primary-900/20 rounded-2xl rounded-tl-none px-4 py-3">
                      <p className="text-gray-900 dark:text-white">{qa.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="flex items-start gap-3 pl-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-lg shadow-blue-500/25">
                      🤖
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{qa.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {history.length === 0 && !loading && (
          <div className="text-center py-6 mb-4">
            <span className="text-4xl mb-3 block">💬</span>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bạn muốn hỏi gì về bài viết này?
            </p>
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Đặt câu hỏi về bài viết này..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
              disabled={loading}
              minLength={5}
              maxLength={500}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              {question.length}/500
            </span>
          </div>
          <motion.button
            type="submit"
            disabled={loading || !question.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Hỏi</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </motion.button>
        </form>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>ℹ️</span>
            Câu trả lời của AI chỉ dựa trên nội dung bài viết này. Để có thông tin đầy đủ, vui lòng đọc toàn bộ bài viết.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

