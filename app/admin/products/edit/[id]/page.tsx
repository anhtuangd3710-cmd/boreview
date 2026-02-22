'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import slugify from 'slugify';

interface Category {
  id: string;
  name: string;
}

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: '',
    salePrice: '',
    stock: '',
    sku: '',
    categoryId: '',
    thumbnail: '',
    images: '',
    shopeeLink: '',
    lazadaLink: '',
    tiktokShopLink: '',
    seoTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
  });

  const fetchProduct = useCallback(async () => {
    try {
      const [productRes, catRes] = await Promise.all([
        fetch(`/api/admin/products/${params.id}`),
        fetch('/api/admin/product-categories'),
      ]);
      
      if (!productRes.ok) throw new Error('Not found');
      
      const product = await productRes.json();
      const cats = await catRes.json();
      
      setCategories(cats);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDesc: product.shortDesc || '',
        price: product.price?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        thumbnail: product.thumbnail || '',
        images: JSON.parse(product.images || '[]').join('\n'),
        shopeeLink: product.shopeeLink || '',
        lazadaLink: product.lazadaLink || '',
        tiktokShopLink: product.tiktokShopLink || '',
        seoTitle: product.seoTitle || '',
        metaDescription: product.metaDescription || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
    } catch {
      alert('Không tìm thấy sản phẩm');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugify(name, { lower: true, strict: true, locale: 'vi' }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          salePrice: formData.salePrice ? parseInt(formData.salePrice) : null,
          stock: parseInt(formData.stock) || 0,
          images: formData.images ? JSON.stringify(formData.images.split('\n').filter(Boolean)) : '[]',
        }),
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể cập nhật sản phẩm');
      }
    } catch {
      alert('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-violet-600 hover:underline">← Quay lại</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">✏️ Sửa sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">📦 Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
              <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" required>
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
            <input type="text" value={formData.shortDesc} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết *</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" required />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">💰 Giá & Kho</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá gốc (VNĐ) *</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá sale</label>
              <input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số lượng kho</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">🖼️ Hình ảnh</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Thumbnail</label>
            <input type="url" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL các ảnh khác</label>
            <textarea value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
        </div>

        {/* External Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">🔗 Link mua hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shopee</label>
              <input type="url" value={formData.shopeeLink} onChange={(e) => setFormData({ ...formData, shopeeLink: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lazada</label>
              <input type="url" value={formData.lazadaLink} onChange={(e) => setFormData({ ...formData, lazadaLink: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok Shop</label>
              <input type="url" value={formData.tiktokShopLink} onChange={(e) => setFormData({ ...formData, tiktokShopLink: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">🔍 SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
            <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
            <textarea value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Cài đặt</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded text-violet-500" />
              <span className="text-gray-700 dark:text-gray-300">Hiển thị sản phẩm</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 rounded text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300">⭐ Sản phẩm nổi bật</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
          {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}

