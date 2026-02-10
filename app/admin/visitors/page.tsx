import prisma from '@/lib/prisma';
import Link from 'next/link';
import VisitorActions from '@/components/admin/VisitorActions';

async function getVisitors(page: number = 1, search: string = '') {
  const take = 20;
  const skip = (page - 1) * take;

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [visitors, total] = await Promise.all([
    prisma.visitorProfile.findMany({
      where,
      take,
      skip,
      orderBy: { totalXP: 'desc' },
      include: {
        _count: {
          select: {
            badges: true,
            pointTransactions: true,
            readingHistory: true,
          },
        },
      },
    }),
    prisma.visitorProfile.count({ where }),
  ]);

  return { visitors, total, page, totalPages: Math.ceil(total / take) };
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const { visitors, total, totalPages } = await getVisitors(page, search);

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-yellow-400 to-amber-500';
    if (level >= 30) return 'from-purple-400 to-violet-500';
    if (level >= 20) return 'from-blue-400 to-cyan-500';
    if (level >= 10) return 'from-green-400 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            👥 Quản lý Visitors
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {total} thành viên đã đăng ký
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm theo username, tên hoặc email..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
          >
            Tìm kiếm
          </button>
          {search && (
            <Link
              href="/admin/visitors"
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Xóa bộ lọc
            </Link>
          )}
        </form>
      </div>

      {/* Visitors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Đăng ký</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {visitors.map((visitor) => (
                <tr key={visitor.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${visitor.isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelColor(visitor.level)} flex items-center justify-center text-white font-bold text-sm shadow-md ${visitor.isBanned ? 'opacity-50' : ''}`}>
                        {visitor.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium ${visitor.isBanned ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{visitor.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{visitor.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {visitor.isBanned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        🔒 Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        ✅ Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelColor(visitor.level)} text-white shadow-sm`}>
                      Lv.{visitor.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                      {visitor.totalXP.toLocaleString()} ⭐
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-medium ${visitor.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {visitor.currentStreak > 0 ? `🔥 ${visitor.currentStreak}` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {new Date(visitor.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <VisitorActions
                      visitorId={visitor.id}
                      username={visitor.username}
                      isBanned={visitor.isBanned}
                    />
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="text-4xl mb-3 block">👥</span>
                    <p className="text-gray-500 dark:text-gray-400">
                      {search ? 'Không tìm thấy visitor nào' : 'Chưa có visitor nào đăng ký'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/visitors?page=${page - 1}${search ? `&search=${search}` : ''}`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Trước
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/visitors?page=${page + 1}${search ? `&search=${search}` : ''}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
                >
                  Sau →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

