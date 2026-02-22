'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  product?: { slug: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  shippingWard: string | null;
  shippingDistrict: string | null;
  shippingCity: string | null;
  customerNote: string | null;
  adminNote: string | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUSES = [
  { value: 'PENDING', label: 'Chờ xác nhận', color: 'yellow', icon: '⏳' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue', icon: '✅' },
  { value: 'SHIPPING', label: 'Đang giao', color: 'purple', icon: '🚚' },
  { value: 'DELIVERED', label: 'Đã giao', color: 'green', icon: '📦' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'red', icon: '❌' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setOrder(data);
      setAdminNote(data.adminNote || '');
    } catch {
      alert('Không tìm thấy đơn hàng');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === 'CANCELLED' && !confirm('Bạn có chắc muốn hủy đơn hàng này? Số lượng sản phẩm sẽ được hoàn lại vào kho.')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (res.ok) {
        await fetchOrder();
      } else {
        alert('Không thể cập nhật trạng thái');
      }
    } catch {
      alert('Đã xảy ra lỗi');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Đang tải...</div>;
  if (!order) return null;

  const currentStatusIndex = STATUSES.findIndex((s) => s.value === order.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-violet-600 hover:underline">← Quay lại danh sách</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Đơn hàng {order.orderNumber}</h1>
          <p className="text-gray-500">Ngày tạo: {formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold bg-${STATUSES.find(s => s.value === order.status)?.color}-100 text-${STATUSES.find(s => s.value === order.status)?.color}-700`}>
          {STATUSES.find(s => s.value === order.status)?.icon} {STATUSES.find(s => s.value === order.status)?.label}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Tiến trình đơn hàng</h2>
        <div className="flex items-center justify-between">
          {STATUSES.filter(s => s.value !== 'CANCELLED').map((status, index) => {
            const isCompleted = currentStatusIndex >= index && order.status !== 'CANCELLED';
            const isCurrent = status.value === order.status;
            return (
              <div key={status.value} className="flex-1 relative">
                <div className={`flex flex-col items-center ${index < 3 ? 'after:absolute after:top-5 after:left-1/2 after:w-full after:h-0.5 ' + (isCompleted ? 'after:bg-green-500' : 'after:bg-gray-200 dark:after:bg-gray-700') : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-violet-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    {status.icon}
                  </div>
                  <p className={`text-xs mt-2 text-center ${isCompleted || isCurrent ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>{status.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">👤 Thông tin khách hàng</h2>
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Tên:</span> <span className="font-medium text-gray-900 dark:text-white">{order.customerName}</span></p>
            <p><span className="text-gray-500">SĐT:</span> <span className="font-medium">{order.customerPhone}</span></p>
            {order.customerEmail && <p><span className="text-gray-500">Email:</span> {order.customerEmail}</p>}
            <p><span className="text-gray-500">Địa chỉ:</span> {order.shippingAddress}</p>
            {(order.shippingWard || order.shippingDistrict || order.shippingCity) && (
              <p className="text-gray-600">{[order.shippingWard, order.shippingDistrict, order.shippingCity].filter(Boolean).join(', ')}</p>
            )}
            {order.customerNote && <p className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400">💬 {order.customerNote}</p>}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Tổng đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tạm tính:</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phí vận chuyển:</span><span>{order.shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(order.shippingFee)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Giảm giá:</span><span className="text-red-600">-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-lg font-bold">
              <span>Tổng cộng:</span><span className="text-primary-600">{formatPrice(order.total)}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">💵 Thanh toán: COD ({order.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'})</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📦 Sản phẩm ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                <p className="text-sm text-gray-500">Số lượng: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                {item.product && <Link href={`/san-pham/${item.product.slug}`} target="_blank" className="text-xs text-violet-600 hover:underline">Xem SP →</Link>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Cập nhật trạng thái</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ghi chú admin</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-violet-500 resize-none"
                placeholder="Ghi chú nội bộ..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {STATUSES.filter(s => {
                if (order.status === 'PENDING') return s.value === 'CONFIRMED' || s.value === 'CANCELLED';
                if (order.status === 'CONFIRMED') return s.value === 'SHIPPING' || s.value === 'CANCELLED';
                if (order.status === 'SHIPPING') return s.value === 'DELIVERED' || s.value === 'CANCELLED';
                return false;
              }).map((status) => (
                <button
                  key={status.value}
                  onClick={() => updateStatus(status.value)}
                  disabled={updating}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 ${
                    status.value === 'CANCELLED'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25'
                  }`}
                >
                  {updating ? '⏳ Đang xử lý...' : `${status.icon} ${status.label}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📅 Lịch sử đơn hàng</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Ngày tạo:</span><span>{formatDate(order.createdAt)}</span></div>
          {order.confirmedAt && <div className="flex justify-between"><span className="text-gray-500">Ngày xác nhận:</span><span>{formatDate(order.confirmedAt)}</span></div>}
          {order.shippedAt && <div className="flex justify-between"><span className="text-gray-500">Ngày giao hàng:</span><span>{formatDate(order.shippedAt)}</span></div>}
          {order.deliveredAt && <div className="flex justify-between"><span className="text-gray-500">Ngày hoàn thành:</span><span className="text-green-600 font-medium">{formatDate(order.deliveredAt)}</span></div>}
          {order.cancelledAt && <div className="flex justify-between"><span className="text-gray-500">Ngày hủy:</span><span className="text-red-600 font-medium">{formatDate(order.cancelledAt)}</span></div>}
          {order.adminNote && <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-700 dark:text-violet-400">📝 Admin: {order.adminNote}</div>}
        </div>
      </div>
    </div>
  );
}

