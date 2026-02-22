'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  salePrice: number | null;
  thumbnail: string | null;
  stock: number;
  isFeatured: boolean;
  soldCount: number;
  category: { name: string; slug: string };
}

interface Category {
  name: string;
  slug: string;
  count: number;
}

interface ProductListProps {
  initialProducts: Product[];
  totalPages: number;
  currentPage: number;
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
}

export default function ProductList({
  initialProducts,
  totalPages,
  currentPage,
  categories,
  currentCategory,
  currentSort = 'newest',
  currentSearch,
}: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');

  const updateUrl = (params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value);
      else current.delete(key);
    });
    current.delete('page'); // Reset page on filter change
    router.push(`/san-pham?${current.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: search || undefined });
  };

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'popular', label: 'Bán chạy' },
    { value: 'price-asc', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </form>

        {/* Category Filter */}
        <select
          value={currentCategory || ''}
          onChange={(e) => updateUrl({ category: e.target.value || undefined })}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateUrl({ sort: e.target.value })}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {initialProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                const current = new URLSearchParams(searchParams.toString());
                current.set('page', page.toString());
                router.push(`/san-pham?${current.toString()}`);
              }}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

