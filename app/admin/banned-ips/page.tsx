'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';

interface BannedIP {
  id: string;
  ipHash: string;
  reason: string | null;
  createdAt: string;
}

export default function BannedIPsPage() {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBannedIPs = async () => {
    try {
      const res = await fetch('/api/admin/banned-ips');
      const data = await res.json();
      setBannedIPs(data.bannedIPs || []);
    } catch (error) {
      console.error('Failed to fetch banned IPs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const unbanIP = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn bỏ cấm IP này?')) return;

    try {
      await fetch(`/api/admin/banned-ips?id=${id}`, { method: 'DELETE' });
      fetchBannedIPs();
    } catch (error) {
      console.error('Không thể bỏ cấm IP:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            🚫 IP bị cấm
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
              {bannedIPs.length}
            </span>
            địa chỉ IP đã bị cấm
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-amber-700 dark:text-amber-300">IP được mã hóa để bảo mật</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bannedIPs.length > 0 ? (
        <div className="space-y-3">
          {bannedIPs.map((ip, index) => (
            <div
              key={ip.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Index & Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <span className="sm:hidden text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono rounded-lg">
                      {ip.ipHash.substring(0, 16)}...
                    </code>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatRelativeTime(ip.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">
                      {ip.reason || <span className="italic text-gray-400 dark:text-gray-500">Không có lý do</span>}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => unbanIP(ip.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-red-500/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bỏ cấm
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không có IP nào bị cấm</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Tất cả các địa chỉ IP đều được phép tương tác với trang web của bạn. Bạn có thể cấm IP từ trang kiểm duyệt bình luận.
          </p>
        </div>
      )}
    </div>
  );
}

