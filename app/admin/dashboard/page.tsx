import prisma from '@/lib/prisma';
import Link from 'next/link';

async function getStats() {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get yesterday's date range for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get last 7 days for weekly stats
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalCategories,
    totalComments,
    pendingComments,
    totalReactions,
    totalPollVotes,
    bannedIPs,
    recentPosts,
    recentComments,
    // Daily stats
    todayPosts,
    todayComments,
    todayReactions,
    yesterdayPosts,
    yesterdayComments,
    yesterdayReactions,
    // Weekly stats
    weeklyPosts,
    weeklyComments,
    weeklyReactions,
    // Gamification stats
    totalVisitors,
    todayVisitors,
    totalXP,
    totalBadges,
    totalBadgesEarned,
    activeStreaks,
    longestStreakEver,
    dailyTasksCompleted,
    topVisitors,
    // Newsletter & Messages stats
    totalSubscribers,
    activeSubscribers,
    totalMessages,
    unreadMessages,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.category.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.reaction.count(),
    prisma.pollVote.count(),
    prisma.bannedIP.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { approved: false },
      include: { post: { select: { title: true, slug: true } } },
    }),
    // Today's stats
    prisma.post.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.comment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.reaction.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    // Yesterday's stats
    prisma.post.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.comment.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.reaction.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    // Weekly stats
    prisma.post.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.comment.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.reaction.count({ where: { createdAt: { gte: last7Days } } }),
    // Gamification stats
    prisma.visitorProfile.count(),
    prisma.visitorProfile.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.visitorProfile.aggregate({ _sum: { totalXP: true } }),
    prisma.badge.count(),
    prisma.userBadge.count(),
    prisma.streak.count({ where: { currentStreak: { gt: 0 } } }),
    prisma.streak.aggregate({ _max: { longestStreak: true } }),
    prisma.userDailyTask.count({ where: { completed: true } }),
    prisma.visitorProfile.findMany({
      take: 5,
      orderBy: { totalXP: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        level: true,
        totalXP: true,
        currentStreak: true,
      },
    }),
    // Newsletter & Messages stats
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews._sum.views || 0,
    totalCategories,
    totalComments,
    pendingComments,
    totalReactions,
    totalPollVotes,
    bannedIPs,
    recentPosts,
    recentComments,
    // Daily stats
    today: {
      posts: todayPosts,
      comments: todayComments,
      reactions: todayReactions,
    },
    yesterday: {
      posts: yesterdayPosts,
      comments: yesterdayComments,
      reactions: yesterdayReactions,
    },
    weekly: {
      posts: weeklyPosts,
      comments: weeklyComments,
      reactions: weeklyReactions,
    },
    // Gamification stats
    gamification: {
      totalVisitors,
      todayVisitors,
      totalXP: totalXP._sum.totalXP || 0,
      totalBadges,
      totalBadgesEarned,
      activeStreaks,
      longestStreakEver: longestStreakEver._max.longestStreak || 0,
      dailyTasksCompleted,
      topVisitors,
    },
    // Newsletter & Messages
    newsletter: {
      total: totalSubscribers,
      active: activeSubscribers,
    },
    messages: {
      total: totalMessages,
      unread: unreadMessages,
    },
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Tổng bài viết', value: stats.totalPosts, gradient: 'from-blue-500 to-cyan-500', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/20', icon: '📝' },
    { label: 'Đã xuất bản', value: stats.publishedPosts, gradient: 'from-green-500 to-emerald-500', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-900/20', icon: '✅' },
    { label: 'Bản nháp', value: stats.draftPosts, gradient: 'from-yellow-500 to-orange-500', bgLight: 'bg-yellow-50', bgDark: 'dark:bg-yellow-900/20', icon: '📋' },
    { label: 'Tổng lượt xem', value: stats.totalViews.toLocaleString(), gradient: 'from-purple-500 to-violet-500', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-900/20', icon: '👁️' },
    { label: 'Bình luận', value: stats.totalComments, gradient: 'from-cyan-500 to-blue-500', bgLight: 'bg-cyan-50', bgDark: 'dark:bg-cyan-900/20', icon: '💬', pending: stats.pendingComments },
    { label: 'Cảm xúc', value: stats.totalReactions, gradient: 'from-pink-500 to-rose-500', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-900/20', icon: '❤️' },
    { label: 'Newsletter', value: stats.newsletter.total, gradient: 'from-indigo-500 to-purple-500', bgLight: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900/20', icon: '📧', subLabel: `${stats.newsletter.active} đang hoạt động` },
    { label: 'Tin nhắn', value: stats.messages.total, gradient: 'from-teal-500 to-cyan-500', bgLight: 'bg-teal-50', bgDark: 'dark:bg-teal-900/20', icon: '📬', pending: stats.messages.unread },
    { label: 'Phiếu bầu', value: stats.totalPollVotes, gradient: 'from-orange-500 to-amber-500', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/20', icon: '📊' },
    { label: 'IP bị cấm', value: stats.bannedIPs, gradient: 'from-red-500 to-pink-500', bgLight: 'bg-red-50', bgDark: 'dark:bg-red-900/20', icon: '🚫' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            📊 Bảng điều khiển
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Tổng quan về hoạt động của blog</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Bài viết mới
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
          >
            {/* Gradient Background */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className={`w-10 h-10 rounded-xl ${stat.bgLight} ${stat.bgDark} flex items-center justify-center text-xl shadow-sm`}>
                  {stat.icon}
                </span>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              {'pending' in stat && typeof stat.pending === 'number' && stat.pending > 0 && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-lg">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  {stat.pending} chờ duyệt
                </span>
              )}
              {'subLabel' in stat && typeof stat.subLabel === 'string' && stat.subLabel && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {stat.subLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Stats Section */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-6 border border-primary-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/25">📅</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hoạt động hôm nay</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Posts */}
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📝</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stats.today.posts > stats.yesterday.posts
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : stats.today.posts < stats.yesterday.posts
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {stats.today.posts > stats.yesterday.posts ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>+{stats.today.posts - stats.yesterday.posts}</>
                ) : stats.today.posts < stats.yesterday.posts ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>{stats.today.posts - stats.yesterday.posts}</>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.today.posts}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bài viết hôm nay</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <p className="text-xs text-gray-400">Hôm qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.yesterday.posts}</span></p>
              <p className="text-xs text-gray-400">7 ngày qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.weekly.posts}</span></p>
            </div>
          </div>

          {/* Today's Comments */}
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">💬</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stats.today.comments > stats.yesterday.comments
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : stats.today.comments < stats.yesterday.comments
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {stats.today.comments > stats.yesterday.comments ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>+{stats.today.comments - stats.yesterday.comments}</>
                ) : stats.today.comments < stats.yesterday.comments ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>{stats.today.comments - stats.yesterday.comments}</>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.today.comments}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bình luận hôm nay</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <p className="text-xs text-gray-400">Hôm qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.yesterday.comments}</span></p>
              <p className="text-xs text-gray-400">7 ngày qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.weekly.comments}</span></p>
            </div>
          </div>

          {/* Today's Reactions */}
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">❤️</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stats.today.reactions > stats.yesterday.reactions
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : stats.today.reactions < stats.yesterday.reactions
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {stats.today.reactions > stats.yesterday.reactions ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>+{stats.today.reactions - stats.yesterday.reactions}</>
                ) : stats.today.reactions < stats.yesterday.reactions ? (
                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>{stats.today.reactions - stats.yesterday.reactions}</>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.today.reactions}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cảm xúc hôm nay</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <p className="text-xs text-gray-400">Hôm qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.yesterday.reactions}</span></p>
              <p className="text-xs text-gray-400">7 ngày qua: <span className="font-medium text-gray-600 dark:text-gray-300">{stats.weekly.reactions}</span></p>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 pt-5 border-t border-primary-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📈</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tổng kết 7 ngày qua</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-xl">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{stats.weekly.posts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bài viết</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-xl">
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{stats.weekly.comments}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bình luận</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-xl">
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{stats.weekly.reactions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cảm xúc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm shadow-lg shadow-primary-500/25">✏️</span>
            Nội dung
          </h2>
          <div className="space-y-2">
            <Link href="/admin/posts/new" className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800/50 hover:shadow-md transition-all group">
              <span className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">✏️</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Viết bài mới</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tạo bài viết blog mới</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/admin/posts" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
              <span className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-xl">📚</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Quản lý bài viết</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chỉnh sửa hoặc xóa bài viết</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/" target="_blank" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
              <span className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl">🌐</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Xem trang web</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Xem blog của bạn</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Moderation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm shadow-lg shadow-cyan-500/25">🛡️</span>
            Kiểm duyệt
          </h2>
          <div className="space-y-2">
            <Link href="/admin/comments" className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${stats.pendingComments > 0 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
              <span className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-xl relative">
                💬
                {stats.pendingComments > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {stats.pendingComments}
                  </span>
                )}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Kiểm duyệt bình luận</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.pendingComments > 0 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">{stats.pendingComments} bình luận chờ duyệt</span>
                  ) : (
                    'Duyệt hoặc xóa bình luận'
                  )}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/admin/banned-ips" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
              <span className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-xl">🚫</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">IP bị cấm</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stats.bannedIPs} IP đã bị cấm</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm shadow-lg shadow-green-500/25">📰</span>
              Bài viết gần đây
            </h2>
            <Link href="/admin/posts" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          {stats.recentPosts.length > 0 ? (
            <div className="space-y-2">
              {stats.recentPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/edit/${post.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{post.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      {post.published ? (
                        <><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Đã xuất bản</>
                      ) : (
                        <><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> Bản nháp</>
                      )}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">📝</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có bài viết nào</p>
              <Link href="/admin/posts/new" className="inline-block mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Tạo bài viết đầu tiên →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Gamification Section */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-6 border border-violet-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg shadow-violet-500/25">🎮</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hệ thống Gamification</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý visitors và thống kê tương tác</p>
            </div>
          </div>
          <Link
            href="/admin/visitors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 font-medium text-sm rounded-xl hover:bg-violet-50 dark:hover:bg-gray-600 shadow-sm transition-all"
          >
            Quản lý Visitors →
          </Link>
        </div>

        {/* Gamification Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👥</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tổng Visitors</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamification.totalVisitors}</p>
            <p className="text-xs text-green-500 mt-1">+{stats.gamification.todayVisitors} hôm nay</p>
          </div>
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⭐</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tổng XP</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamification.totalXP.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">XP đã phát</p>
          </div>
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔥</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Streaks đang active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamification.activeStreaks}</p>
            <p className="text-xs text-orange-500 mt-1">Kỷ lục: {stats.gamification.longestStreakEver} ngày</p>
          </div>
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏆</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Huy hiệu</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamification.totalBadgesEarned}</p>
            <p className="text-xs text-purple-500 mt-1">{stats.gamification.totalBadges} loại huy hiệu</p>
          </div>
        </div>

        {/* Top Visitors & Daily Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Visitors */}
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🏅</span> Top Visitors (XP)
            </h3>
            {stats.gamification.topVisitors.length > 0 ? (
              <div className="space-y-2">
                {stats.gamification.topVisitors.map((visitor, index) => (
                  <div key={visitor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{visitor.displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{visitor.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{visitor.totalXP.toLocaleString()} XP</p>
                      <p className="text-xs text-gray-400">Lv.{visitor.level} • 🔥{visitor.currentStreak}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có visitor nào</p>
            )}
          </div>

          {/* Daily Tasks Summary */}
          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-violet-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📋</span> Tổng quan Daily Tasks
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Tasks hoàn thành</span>
                <span className="font-bold text-green-600 dark:text-green-400">{stats.gamification.dailyTasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Tổng badges</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{stats.gamification.totalBadges}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Streak đang hoạt động</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{stats.gamification.activeStreaks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

