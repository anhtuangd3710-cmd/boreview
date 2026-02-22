'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductOrderFormProps {
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  stock: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function ProductOrderForm({
  productId,
  productName,
  productImage,
  price,
  stock,
}: ProductOrderFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    shippingWard: '',
    shippingDistrict: '',
    shippingCity: '',
    customerNote: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  const subtotal = price * quantity;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: [{ productId, quantity }],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: 'Đặt hàng thành công!',
          orderNumber: data.order.orderNumber,
        });
      } else {
        setResult({ success: false, message: data.error || 'Đã xảy ra lỗi' });
      }
    } catch {
      setResult({ success: false, message: 'Không thể kết nối đến server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stock === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">❌ Sản phẩm tạm hết hàng</p>
      </div>
    );
  }

  return (
    <>
      {/* Order Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02]"
      >
        🛒 Đặt hàng ngay
      </button>
      <p className="text-center text-sm text-gray-500">💵 Thanh toán khi nhận hàng (COD)</p>

      {/* Order Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !isSubmitting && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">🛒 Đặt hàng</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>

              {result?.success ? (
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Mã đơn hàng: <strong>{result.orderNumber}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6">Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>
                  <button
                    onClick={() => { setIsOpen(false); setResult(null); }}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Product Summary */}
                  <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      {productImage && <img src={productImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">{productName}</p>
                      <p className="text-primary-600 font-bold">{formatPrice(price)}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Số lượng:</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 font-bold">-</button>
                      <span className="w-8 text-center font-bold">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 font-bold">+</button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <input
                      type="text" required placeholder="Họ và tên *"
                      value={formData.customerName}
                      onChange={(e) => setFormData(f => ({ ...f, customerName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="tel" required placeholder="Số điện thoại *"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="email" placeholder="Email (không bắt buộc)"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(f => ({ ...f, customerEmail: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      required placeholder="Địa chỉ giao hàng *"
                      rows={2}
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData(f => ({ ...f, shippingAddress: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text" placeholder="Phường/Xã"
                        value={formData.shippingWard}
                        onChange={(e) => setFormData(f => ({ ...f, shippingWard: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                      <input
                        type="text" placeholder="Quận/Huyện"
                        value={formData.shippingDistrict}
                        onChange={(e) => setFormData(f => ({ ...f, shippingDistrict: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                      <input
                        type="text" placeholder="Tỉnh/TP"
                        value={formData.shippingCity}
                        onChange={(e) => setFormData(f => ({ ...f, shippingCity: e.target.value }))}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <textarea
                      placeholder="Ghi chú (không bắt buộc)"
                      rows={2}
                      value={formData.customerNote}
                      onChange={(e) => setFormData(f => ({ ...f, customerNote: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tạm tính:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển:</span>
                      <span>{shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(shippingFee)}</span>
                    </div>
                    {subtotal < 500000 && (
                      <p className="text-xs text-gray-500">💡 Miễn phí vận chuyển cho đơn từ 500.000đ</p>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span>Tổng cộng:</span>
                      <span className="text-primary-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Error message */}
                  {result && !result.success && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                      ❌ {result.message}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '⏳ Đang xử lý...' : '✅ Xác nhận đặt hàng'}
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    💵 Thanh toán khi nhận hàng (COD)
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

