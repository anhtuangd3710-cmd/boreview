import Link from 'next/link';
import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import { InArticleAd } from '@/components/AdSense';
import HeroSection from '@/components/HeroSection';
import HomeSidebar from '@/components/HomeSidebar';
import NewsletterSection from '@/components/NewsletterSection';

// Force dynamic rendering - don't try to connect to DB during build
export const dynamic = 'force-dynamic';

async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { published: true, featured: true },
    include: {
      author: { select: { id: true, name: true, email: true } },
      categories: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 1,
  });
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { id: true, name: true, email: true } },
      categories: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });
}

export default async function HomePage() {
  const [featuredPosts, latestPosts] = await Promise.all([
    getFeaturedPosts(),
    getLatestPosts(),
  ]);

  const featuredPost = featuredPosts[0];
  const regularPosts = latestPosts.filter((p) => p.id !== featuredPost?.id).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content with Sidebar */}
      <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 xl:gap-12">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 order-1">
            {/* Featured Post */}
        {featuredPost && (
          <section className={regularPosts.length > 0 ? "mb-12 md:mb-16" : ""} aria-labelledby="featured-heading">
            <header className="flex items-center gap-4 mb-6 md:mb-8">
              <span className="text-2xl md:text-3xl" role="img" aria-hidden="true">✨</span>
              <h2 id="featured-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Bài viết nổi bật
              </h2>
            </header>
            <PostCard post={featuredPost} featured />
          </section>
        )}

        {/* Only show ad if there are more posts */}
        {regularPosts.length > 0 && <InArticleAd />}

        {/* Latest Posts - Better visual rhythm */}
        {regularPosts.length > 0 && (
          <section className="mb-12 md:mb-16" aria-labelledby="latest-heading">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl" role="img" aria-hidden="true">📝</span>
                <h2 id="latest-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Bài viết mới nhất
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100/80 dark:bg-gray-800/80
                  text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-700
                  hover:bg-primary-100 hover:text-primary-600 hover:border-primary-200
                  dark:hover:bg-primary-900/30 dark:hover:text-primary-400 dark:hover:border-primary-800
                  transition-all duration-300
                  focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Xem tất cả
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* No Posts State - Improved */}
        {!featuredPost && regularPosts.length === 0 && (
          <section className="text-center py-20 md:py-28 bg-gray-50/80 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-700/50">
            <div className="text-6xl md:text-7xl mb-8" role="img" aria-hidden="true">📭</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Chưa có bài viết</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
              Hãy quay lại sau để xem nội dung mới nhé!
            </p>
            <a
              href="https://www.youtube.com/@BoRiViu67"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-red-500 text-white font-semibold rounded-xl
                hover:bg-red-600 shadow-lg shadow-red-500/25 hover:shadow-xl transition-all duration-300
                focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Xem video trên YouTube
            </a>
          </section>
        )}
          </div>

          {/* Sidebar - Shows after content on mobile, sticky on desktop */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <HomeSidebar />
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
    </div>
  );
}

