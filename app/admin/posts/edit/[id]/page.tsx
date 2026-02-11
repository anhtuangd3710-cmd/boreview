'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ContentQualityChecker from '@/components/ContentQualityChecker';
import Image from 'next/image';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  youtubeUrl: string | null;
  thumbnail: string | null;
  published: boolean;
  featured: boolean;
  categories: { id: string }[];
  seoTitle: string | null;
  metaDescription: string | null;
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    youtubeUrl: '',
    thumbnail: '',
    published: false,
    featured: false,
    selectedCategories: [] as string[],
    // SEO fields
    seoTitle: '',
    metaDescription: '',
    customSlug: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${params.id}`).then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([post, cats]: [Post, Category[]]) => {
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          youtubeUrl: post.youtubeUrl || '',
          thumbnail: post.thumbnail || '',
          published: post.published,
          featured: post.featured,
          selectedCategories: post.categories.map((c) => c.id),
          // SEO fields
          seoTitle: post.seoTitle || '',
          metaDescription: post.metaDescription || '',
          customSlug: post.slug || '',
        });
        setCategories(cats);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Không thể tải bài viết');
        setIsLoading(false);
      });
  }, [params.id]);

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
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          youtubeUrl: formData.youtubeUrl || null,
          thumbnail: formData.thumbnail || null,
          published: publish !== undefined ? publish : formData.published,
          featured: formData.featured,
          categories: formData.selectedCategories,
          // SEO fields
          seoTitle: formData.seoTitle || null,
          metaDescription: formData.metaDescription || null,
          customSlug: formData.customSlug || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post');
      }

      setSuccess('Đã cập nhật bài viết thành công!');
      setTimeout(() => {
        router.push('/admin/posts');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            ✏️ Chỉnh sửa bài viết
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Cập nhật nội dung bài viết</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3">
          <span className="text-green-500 text-xl">✅</span>
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <span className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs">📝</span>
                Tiêu đề bài viết
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-gray-400"
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              />
              <p className="mt-2 text-xs text-gray-400">{formData.title.length}/100 ký tự</p>
            </div>

            {/* Excerpt Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">💬</span>
                Mô tả ngắn
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none placeholder:text-gray-400"
                placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách và SEO)..."
              />
              <p className="mt-2 text-xs text-gray-400">{formData.excerpt.length}/200 ký tự</p>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs">✍️</span>
                Nội dung bài viết
                <span className="text-red-500">*</span>
              </label>
              <RichEditor content={formData.content} onChange={(content) => setFormData({ ...formData, content })} />
            </div>

            {/* Quality Checker */}
            <ContentQualityChecker
              content={formData.content}
              excerpt={formData.excerpt}
              title={formData.title}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Card */}
            <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-800 dark:to-primary-900/10 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">🚀</span>
                Xuất bản
              </h3>
              <div className="space-y-4">
                {/* Status Badge */}
                <div className={`p-3 rounded-xl ${formData.published ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${formData.published ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    <span className={`text-sm font-medium ${formData.published ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                      {formData.published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">⭐ Bài viết nổi bật</span>
                    <p className="text-xs text-gray-400">Hiển thị ở vị trí đặc biệt</p>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, false)}
                    disabled={isSaving}
                    className="py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : '📋'}
                    {formData.published ? 'Hủy xuất bản' : 'Lưu nháp'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isSaving}
                    className="py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : '🚀'}
                    {formData.published ? 'Cập nhật' : 'Xuất bản'}
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/25">📂</span>
                Danh mục
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      formData.selectedCategories.includes(cat.id)
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-600'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">🎬</span>
                Đa phương tiện
              </h3>
              <div className="space-y-4">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ảnh bìa</label>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                    className="hidden"
                  />
                  {formData.thumbnail ? (
                    <div className="relative group">
                      <Image
                        src={formData.thumbnail}
                        alt="Thumbnail"
                        width={300}
                        height={169}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          🔄
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                          className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
                    >
                      {isUploadingThumbnail ? (
                        <svg className="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <span className="text-3xl">📷</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Nhấn để tải ảnh lên</span>
                          <span className="text-xs text-gray-400">PNG, JPG, GIF (max 5MB)</span>
                        </>
                      )}
                    </button>
                  )}
                  <div className="mt-2">
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
                      placeholder="Hoặc nhập URL ảnh..."
                    />
                  </div>
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.35,31.35,0,0,0,0,12a31.35,31.35,0,0,0,.5,5.81A3.02,3.02,0,0,0,2.62,19.95c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.35,31.35,0,0,0,24,12,31.35,31.35,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z" />
                      </svg>
                      Link YouTube
                    </span>
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">🔍</span>
                SEO & URL
              </h3>
              <div className="space-y-4">
                {/* Custom Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Đường dẫn URL (Slug)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">/blog/</span>
                    <input
                      type="text"
                      value={formData.customSlug}
                      onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
                      placeholder="tu-dong-tao-tu-tieu-de"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Để trống sẽ tự động tạo từ tiêu đề</p>
                </div>

                {/* SEO Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    maxLength={70}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
                    placeholder="Tiêu đề SEO (mặc định dùng tiêu đề bài viết)"
                  />
                  <p className={`mt-1 text-xs ${formData.seoTitle.length > 60 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {formData.seoTitle.length}/70 ký tự (khuyến nghị 50-60)
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    maxLength={170}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm resize-none"
                    placeholder="Mô tả SEO (mặc định dùng mô tả ngắn)"
                  />
                  <p className={`mt-1 text-xs ${formData.metaDescription.length > 160 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {formData.metaDescription.length}/170 ký tự (khuyến nghị 120-160)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

