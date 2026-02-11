import { Metadata } from 'next';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { InArticleAd } from '@/components/AdSense';
import Link from 'next/link';
import { getPaginatedPosts, getCategoriesWithCount } from '@/lib/queries';

// Force dynamic rendering - database queries happen at runtime
// React cache() in lib/queries.ts handles request deduplication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bài viết - Bơ Review',
  description: 'Khám phá các bài viết tóm tắt và phân tích video từ kênh Bơ Review.',
};

interface BlogPageProps {
  searchParams: { page?: string; search?: string; category?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const category = searchParams.category || '';

  // Using cached queries for better performance
  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPaginatedPosts(page, search, category),
    getCategoriesWithCount(),
  ]);

  const queryParams: Record<string, string> = {};
  if (search) queryParams.search = search;
  if (category) queryParams.category = category;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 py-16 md:py-20">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <span className="inline-block text-5xl mb-4">📝</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Bài viết
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Khám phá các bài viết tóm tắt, phân tích và bình luận về video từ kênh Bơ Review.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{total}</div>
                <div className="text-sm text-white/80">Bài viết</div>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{categories.length}</div>
                <div className="text-sm text-white/80">Chủ đề</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-10 -mt-16 relative z-20">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="w-full lg:w-auto lg:flex-1 max-w-xl">
              <SearchBar />
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/blog"
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  !category
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    category === cat.slug
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.name}
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-black/10 dark:bg-white/10">
                    {cat._count.posts}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {search && (
          <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Kết quả tìm kiếm cho</span>
                <span className="ml-1 font-semibold text-gray-900 dark:text-white">&ldquo;{search}&rdquo;</span>
                <span className="ml-2 text-primary-600 dark:text-primary-400">({posts.length} kết quả)</span>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {posts.length > 3 && (
              <>
                <div className="my-10">
                  <InArticleAd />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {posts.slice(3).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-12">
              <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" queryParams={queryParams} />
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Không tìm thấy bài viết</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {search
                ? 'Không tìm thấy bài viết nào phù hợp với từ khóa của bạn. Hãy thử từ khóa khác nhé!'
                : 'Hãy quay lại sau để xem nội dung mới nhé!'}
            </p>
            {search && (
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600
                  text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Xem tất cả bài viết
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

