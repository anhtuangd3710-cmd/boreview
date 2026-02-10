'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string | null;
    youtubeUrl?: string | null;
    createdAt: Date | string;
    publishedAt?: Date | string | null;
    viewCount?: number;
    author: {
      name?: string | null;
    };
    categories?: { id: string; name: string; slug: string }[];
  };
  featured?: boolean;
}

function getYouTubeThumbnail(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  return null;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const thumbnailUrl = post.thumbnail ||
    (post.youtubeUrl ? getYouTubeThumbnail(post.youtubeUrl) : null);

  const formattedDate = format(
    new Date(post.publishedAt || post.createdAt),
    'dd/MM/yyyy'
  );

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="group relative bg-white dark:bg-gray-800/90 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 overflow-hidden
          border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500"
        aria-label={`Bài viết nổi bật: ${post.title}`}
      >
        <div className="md:flex">
          {/* Thumbnail */}
          <Link
            href={`/blog/${post.slug}`}
            className="block md:w-1/2 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            aria-label={`Xem bài viết: ${post.title}`}
          >
            <div className="relative h-64 md:h-80 lg:h-[420px]">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 flex items-center justify-center">
                  <span className="text-7xl" role="img" aria-hidden="true">📖</span>
                </div>
              )}
              {/* Softer gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />

              {/* YouTube play button - Improved accessibility */}
              {post.youtubeUrl && (
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-20 h-20 bg-red-600/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40"
                  >
                    <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </motion.div>
                </div>
              )}

              {/* Featured badge - Better positioning */}
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-primary-500/30">
                  <span role="img" aria-hidden="true">✨</span>
                  <span>Nổi bật</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Content - Better spacing and hierarchy */}
          <div className="md:w-1/2 p-7 md:p-10 lg:p-12 flex flex-col justify-center">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <nav aria-label="Danh mục bài viết" className="flex flex-wrap gap-2 mb-5">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="text-xs font-semibold px-3.5 py-1.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full hover:bg-accent-200 dark:hover:bg-accent-800/50 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            )}

            <Link
              href={`/blog/${post.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight tracking-tight">
                {post.title}
              </h2>
            </Link>

            <p className="mt-5 text-gray-600 dark:text-gray-400 text-base md:text-lg line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author and meta - Better alignment */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {(post.author.name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{post.author.name || 'Admin'}</div>
                  <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()} className="text-xs text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </time>
                </div>
              </div>
              {post.viewCount !== undefined && post.viewCount > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
                </div>
              )}
            </div>

            {/* CTA Link - Better styling */}
            <Link
              href={`/blog/${post.slug}`}
              className="mt-8 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold
                hover:gap-3 transition-all duration-300
                focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-1"
            >
              <span>Đọc bài viết</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  // Regular card - Improved accessibility and visual refinement
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative bg-white dark:bg-gray-800/90 rounded-2xl md:rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 overflow-hidden
        border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:shadow-primary-500/10 hover:border-gray-200 dark:hover:border-gray-600/50 transition-all duration-400"
      aria-label={`Bài viết: ${post.title}`}
    >
      {/* Thumbnail */}
      <Link
        href={`/blog/${post.slug}`}
        className="block relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        aria-label={`Xem bài viết: ${post.title}`}
        tabIndex={-1}
      >
        <div className="relative h-52 md:h-56">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 flex items-center justify-center">
              <span className="text-5xl" role="img" aria-hidden="true">📖</span>
            </div>
          )}
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" aria-hidden="true" />

          {/* YouTube play button - Better animation */}
          {post.youtubeUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              <div className="w-14 h-14 bg-red-600/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 transform scale-80 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Content - Better spacing */}
      <div className="p-5 md:p-6">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Danh mục">
            {post.categories.slice(0, 2).map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="text-xs font-semibold px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                role="listitem"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
        >
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug tracking-tight">
            {post.title}
          </h2>
        </Link>

        <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Footer - Better alignment */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {(post.author.name || 'A')[0].toUpperCase()}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{post.author.name || 'Admin'}</span>
          </div>
          <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()} className="text-gray-400 dark:text-gray-500">
            {formattedDate}
          </time>
        </div>
      </div>
    </motion.article>
  );
}

