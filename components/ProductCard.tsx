'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function calculateDiscount(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount ? calculateDiscount(product.price, product.salePrice!) : 0;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/san-pham/${product.slug}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">📦</div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                  -{discount}%
                </span>
              )}
              {product.isFeatured && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                  ⭐ Hot
                </span>
              )}
            </div>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              {product.category.name}
            </span>

            {/* Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Sold count */}
            {product.soldCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Đã bán {product.soldCount}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

