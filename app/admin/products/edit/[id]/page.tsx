'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    price: '',
    salePrice: '',
    stock: '',
    sku: '',
    weight: '',
    categoryId: '',
    thumbnail: '',
    images: [] as string[],
    shopeeLink: '',
    lazadaLink: '',
    tiktokShopLink: '',
    seoTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
  });

  const fetchCategories = () => {
    fetch('/api/admin/product-categories')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  };

  const fetchProduct = useCallback(async () => {
    try {
      const [productRes, catRes] = await Promise.all([
        fetch(`/api/admin/products/${params.id}`),
        fetch('/api/admin/product-categories'),
      ]);

      if (!productRes.ok) throw new Error('Not found');

      const product = await productRes.json();
      const cats = await catRes.json();

      if (Array.isArray(cats)) setCategories(cats);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDesc: product.shortDesc || '',
        price: product.price?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        weight: product.weight?.toString() || '',
        categoryId: product.categoryId || '',
        thumbnail: product.thumbnail || '',
        images: JSON.parse(product.images || '[]'),
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
    setFormData((prev) => ({ ...prev, name, slug: slugify(name, { lower: true, strict: true, locale: 'vi' }) }));
  };

  const handleThumbnailUpload = async (file: File) => {
    setIsUploadingThumbnail(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFormData(prev => ({ ...prev, thumbnail: data.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleImagesUpload = async (files: FileList) => {
    setIsUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.url;
      });
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await fetch('/api/admin/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories(prev => [...prev, newCat]);
        setFormData(prev => ({ ...prev, categoryId: newCat.id }));
        setShowCategoryModal(false);
        setNewCategoryName('');
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể tạo danh mục');
      }
    } catch {
      alert('Đã xảy ra lỗi');
    } finally {
      setCreatingCategory(false);
    }
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
          weight: formData.weight ? parseInt(formData.weight) : null,
          images: formData.images, // Already an array, will be JSON.stringify in API
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
            <div className="flex gap-2">
              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" required>
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
              <button type="button" onClick={() => setShowCategoryModal(true)}
                className="px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium whitespace-nowrap">
                + Tạo mới
              </button>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khối lượng (gram)</label>
              <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="VD: 500" />
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

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh thumbnail chính</label>
            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])} className="hidden" />
            {formData.thumbnail ? (
              <div className="relative group w-fit">
                <Image src={formData.thumbnail} alt="Thumbnail" width={200} height={200} className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                  <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">🔄</button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600">🗑️</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => thumbnailInputRef.current?.click()} disabled={isUploadingThumbnail}
                className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-violet-400 transition-all">
                {isUploadingThumbnail ? (
                  <svg className="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (<><span className="text-2xl">📷</span><span className="text-xs text-gray-500">Tải ảnh lên</span></>)}
              </button>
            )}
            <input type="url" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm" placeholder="Hoặc nhập URL..." />
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh sản phẩm khác</label>
            <input ref={imagesInputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleImagesUpload(e.target.files)} className="hidden" />
            <div className="flex flex-wrap gap-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <Image src={url} alt={`Image ${index + 1}`} width={100} height={100} className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => imagesInputRef.current?.click()} disabled={isUploadingImages}
                className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-violet-400 transition-all">
                {isUploadingImages ? (
                  <svg className="w-6 h-6 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (<><span className="text-xl">➕</span><span className="text-xs text-gray-500">Thêm ảnh</span></>)}
              </button>
            </div>
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

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">➕ Tạo danh mục mới</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Tên danh mục..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCategoryModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                Hủy
              </button>
              <button type="button" onClick={handleCreateCategory} disabled={creatingCategory || !newCategoryName.trim()}
                className="flex-1 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium disabled:opacity-50">
                {creatingCategory ? '⏳ Đang tạo...' : '✅ Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

