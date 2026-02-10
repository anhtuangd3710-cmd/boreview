'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '@/lib/utils';
import { useVisitor } from '@/contexts/VisitorContext';
import { showXPNotification } from '@/components/XPToast';

interface Reply {
  id: string;
  content: string;
  authorName: string;
  isAdminReply: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  isAdminReply: boolean;
  replies?: Reply[];
}

interface CommentsProps {
  postId: string;
}

const COMMENTS_PER_PAGE = 10;
const INITIAL_DISPLAY = 5;

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ authorName: '', content: '' });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);
  const [isExpanded, setIsExpanded] = useState(false);

  const { fetchWithVisitor, handleXPResult, isLoggedIn, visitor } = useVisitor();

  const fetchComments = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const res = await fetch(`/api/comments?postId=${postId}&page=${pageNum}&limit=${COMMENTS_PER_PAGE}`);
      const data = await res.json();

      if (append) {
        setComments(prev => [...prev, ...(data.comments || [])]);
      } else {
        setComments(data.comments || []);
      }
      setTotal(data.total || 0);
    } catch {
      setError('Không thể tải bình luận');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments(1, false);
  }, [postId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetchWithVisitor('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể gửi bình luận');
      }

      // Handle XP result if visitor is logged in
      if (data.xpResult && isLoggedIn) {
        handleXPResult(data.xpResult);
        showXPNotification(
          data.xpResult.pointsAwarded,
          'Viết bình luận',
          data.xpResult.leveledUp
            ? { oldLevel: data.xpResult.newLevel - 1, newLevel: data.xpResult.newLevel }
            : undefined
        );
      }

      setSuccess('Bình luận đã được gửi thành công!');
      setFormData({ authorName: '', content: '' });
      setIsFormCollapsed(true);
      setPage(1);
      fetchComments(1, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    // First, show more from already loaded comments
    if (displayCount < comments.length) {
      setDisplayCount(prev => Math.min(prev + COMMENTS_PER_PAGE, comments.length));
      return;
    }

    // If we've shown all loaded comments, fetch more from server
    if (comments.length < total) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
      setDisplayCount(prev => prev + COMMENTS_PER_PAGE);
    }
  };

  const handleShowAll = () => {
    setIsExpanded(true);
    setDisplayCount(comments.length);
    // If we haven't loaded all comments, load them
    if (comments.length < total) {
      // Load all remaining pages
      const remainingPages = Math.ceil((total - comments.length) / COMMENTS_PER_PAGE);
      for (let i = 1; i <= remainingPages; i++) {
        fetchComments(page + i, true);
      }
    }
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setDisplayCount(INITIAL_DISPLAY);
    // Scroll to comments section
    document.getElementById('comments-heading')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    // Sort locally for better UX
    setComments(prev => {
      const sorted = [...prev].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === 'newest' ? dateB - dateA : dateA - dateB;
      });
      return sorted;
    });
  };

  const hasMoreToShow = displayCount < comments.length || comments.length < total;
  const displayedComments = comments.slice(0, displayCount);
  const remainingCount = total - displayCount;

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-400 to-rose-500',
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section className="mt-12" aria-labelledby="comments-heading">
      {/* Header with Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 id="comments-heading" className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg shadow-lg shadow-primary-500/25">
            💬
          </span>
          Bình luận
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {total}
          </span>
        </h2>

        {/* Sort & Actions */}
        {total > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sắp xếp:</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleSortChange('newest')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  sortOrder === 'newest'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Mới nhất
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('oldest')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  sortOrder === 'oldest'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Cũ nhất
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Comment Form */}
      <div className="mb-8">
        {/* Toggle Button when collapsed */}
        {isFormCollapsed && (
          <motion.button
            type="button"
            onClick={() => setIsFormCollapsed(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
          >
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              <span className="text-2xl">✍️</span>
              <span className="font-medium">Viết bình luận mới...</span>
            </div>
          </motion.button>
        )}

        {/* Comment Form - Premium Design */}
        <AnimatePresence>
          {!isFormCollapsed && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>✍️</span> Viết bình luận
                </h3>
                {total > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsFormCollapsed(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    aria-label="Thu gọn form"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

        {/* Alerts */}
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
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm flex items-center gap-2"
            >
              <span>✅</span> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          {/* Name Input */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên của bạn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="authorName"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
              placeholder="Nhập tên của bạn..."
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung bình luận <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              minLength={3}
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
              placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
            />
            <div className="mt-2 text-xs text-gray-400 text-right">
              {formData.content.length}/1000
            </div>
          </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi bình luận</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
        </AnimatePresence>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1.5" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
                </div>
              </div>
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ml-12" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {/* Comments Counter & Progress */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{Math.min(displayCount, total)}</span> / {total} bình luận
              </span>
              {remainingCount > 0 && (
                <span className="text-primary-500 font-medium">Còn {remainingCount} bình luận</span>
              )}
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((displayCount / total) * 100, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Comments */}
          <AnimatePresence mode="popLayout">
            {displayedComments.map((comment, index) => (
              <motion.article
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(index * 0.03, 0.2) }}
                layout
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar - Compact */}
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarColor(comment.authorName)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {comment.authorName[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header - Inline */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {comment.authorName}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                      <time className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>

                    {/* Content - Compact */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Admin Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-3 border-l-2 border-primary-300 dark:border-primary-700">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs shrink-0">
                                👑
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                    {reply.authorName}
                                  </span>
                                  {reply.isAdminReply && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                                      Admin
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 space-y-3"
          >
            {/* Load More / Show All Buttons */}
            {hasMoreToShow && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Load More Button */}
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:from-primary-50 hover:to-pink-50 dark:hover:from-primary-900/20 dark:hover:to-pink-900/20 transition-all group disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm font-medium">Đang tải...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="text-sm font-medium">
                        Xem thêm {Math.min(COMMENTS_PER_PAGE, remainingCount)} bình luận
                      </span>
                    </div>
                  )}
                </button>

                {/* Show All Button - Only show if there are many comments */}
                {total > 20 && remainingCount > COMMENTS_PER_PAGE && (
                  <button
                    type="button"
                    onClick={handleShowAll}
                    disabled={loadingMore}
                    className="py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 font-medium text-sm"
                  >
                    Xem tất cả ({total})
                  </button>
                )}
              </div>
            )}

            {/* Collapse Button - Show when expanded with many comments */}
            {isExpanded && displayCount > INITIAL_DISPLAY && (
              <button
                type="button"
                onClick={handleCollapse}
                className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Thu gọn bình luận
              </button>
            )}

            {/* All Loaded Indicator */}
            {!hasMoreToShow && total > INITIAL_DISPLAY && (
              <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-primary-900/10 dark:to-accent-900/10 rounded-xl">
                <span className="inline-flex items-center gap-2">
                  <span>✨</span>
                  Đã hiển thị tất cả {total} bình luận
                </span>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <span className="text-5xl mb-4 block">💭</span>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
            Chưa có bình luận nào
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
          </p>
        </motion.div>
      )}
    </section>
  );
}

