'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VisitorActionsProps {
  visitorId: string;
  username: string;
  isBanned: boolean;
}

export default function VisitorActions({ visitorId, username, isBanned }: VisitorActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'ban' | 'delete' | null>(null);

  const handleBan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/visitors/${visitorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isBanned ? 'unban' : 'ban' }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/visitors/${visitorId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Ban/Unban Button */}
      <button
        onClick={() => setShowConfirm('ban')}
        disabled={loading}
        className={`p-1.5 rounded-lg transition-colors ${
          isBanned
            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
            : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
        }`}
        title={isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
      >
        {isBanned ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm('delete')}
        disabled={loading}
        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Xóa tài khoản"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {showConfirm === 'delete' ? '🗑️ Xóa tài khoản?' : isBanned ? '🔓 Mở khóa?' : '🔒 Khóa tài khoản?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showConfirm === 'delete'
                ? `Bạn có chắc muốn xóa tài khoản @${username}? Hành động này không thể hoàn tác.`
                : isBanned
                ? `Mở khóa tài khoản @${username}?`
                : `Khóa tài khoản @${username}? Người dùng sẽ không thể đăng nhập.`}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={showConfirm === 'delete' ? handleDelete : handleBan}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  showConfirm === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : isBanned
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

