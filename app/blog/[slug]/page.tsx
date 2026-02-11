import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { generateMetadata as generateSeoMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { InArticleAd, SidebarAd } from '@/components/AdSense';
import { format } from 'date-fns';
import ReadingTime from '@/components/ReadingTime';
import BookmarkButton from '@/components/BookmarkButton';
import Reactions from '@/components/Reactions';
import Comments from '@/components/Comments';
import Poll from '@/components/Poll';
import RelatedPosts from '@/components/RelatedPosts';
import ShareButton from '@/components/ShareButton';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import TableOfContents from '@/components/TableOfContents';
import ReadingTracker from '@/components/ReadingTracker';
import ViewCounter from '@/components/ViewCounter';
import { getPostBySlug, getRelatedPosts } from '@/lib/queries';

// Force dynamic rendering - database queries happen at runtime
// React cache() in lib/queries.ts handles request deduplication
// View increment is handled client-side by ViewCounter for better performance
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  // Using cached query - will be deduplicated with the page render
  const post = await getPostBySlug(params.slug);

  if (!post) return { title: 'Post Not Found' };

  return generateSeoMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.thumbnail || undefined,
    type: 'article',
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modifiedTime: new Date(post.updatedAt).toISOString(),
    authors: post.author.name ? [post.author.name] : undefined,
    tags: post.tags.map((t) => t.name),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Using cached query - deduplicated with generateMetadata call
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  // Using cached query for related posts
  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories.map((c) => c.id)
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    url: `${siteUrl}/blog/${post.slug}`,
    image: post.thumbnail || undefined,
    datePublished: new Date(post.publishedAt || post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    authorName: post.author.name || 'Admin',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
  ]);

  const formattedDate = format(new Date(post.publishedAt || post.createdAt), 'dd/MM/yyyy');

  const thumbnailUrl = post.thumbnail ||
    (post.youtubeUrl ? `https://img.youtube.com/vi/${getYouTubeId(post.youtubeUrl)}/maxresdefault.jpg` : null);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      <article className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero Section with Thumbnail */}
        <div className="relative">
          {thumbnailUrl && (
            <div className="relative h-[50vh] md:h-[55vh] lg:h-[65vh] overflow-hidden">
              <Image
                src={thumbnailUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

              {/* Floating Breadcrumb */}
              <div className="absolute top-6 left-0 right-0 z-10">
                <div className="container mx-auto px-4">
                  <nav className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-full text-white/90 text-sm border border-white/10" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                      <span>🏠</span> Trang chủ
                    </Link>
                    <span className="text-white/50">/</span>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <span className="text-white/50">/</span>
                    <span className="text-white font-medium truncate max-w-[200px]">{post.title}</span>
                  </nav>
                </div>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 pb-28 pt-24">
                <div className="container mx-auto px-4">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {post.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/blog?category=${category.slug}`}
                          className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 backdrop-blur-sm"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl drop-shadow-lg">
                    {post.title}
                  </h1>
                  {/* Excerpt */}
                  <p className="text-white/80 text-lg max-w-2xl line-clamp-2 hidden md:block">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Title when no thumbnail - Premium Design */}
          {!thumbnailUrl && (
            <div className="mb-10">
              {/* Breadcrumb */}
              <nav className="text-sm mb-8" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                      <span>🏠</span> Trang chủ
                    </Link>
                  </li>
                  <li className="text-gray-300 dark:text-gray-600">/</li>
                  <li><Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
                  <li className="text-gray-300 dark:text-gray-600">/</li>
                  <li className="text-primary-600 dark:text-primary-400 font-medium truncate max-w-[300px]">{post.title}</li>
                </ol>
              </nav>

              {/* Categories */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 text-primary-700 dark:text-primary-300 rounded-full hover:from-primary-200 hover:to-accent-200 dark:hover:from-primary-800/50 dark:hover:to-accent-800/50 transition-all"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Author & Meta Card - Premium Design */}
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-8 ${thumbnailUrl ? '-mt-20' : ''} relative z-10`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/30">
                        {(post.author.name || 'A')[0].toUpperCase()}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {post.author.name || 'Admin'}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span className="text-primary-500">📅</span>
                          {formattedDate}
                        </span>
                        {/* ViewCounter increments views from client-side for better performance */}
                        <ViewCounter postId={post.id} initialViews={post.views} />
                        <ReadingTime content={post.content} />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BookmarkButton
                      postId={post.id}
                      postTitle={post.title}
                      postSlug={post.slug}
                      postExcerpt={post.excerpt}
                    />
                    <ShareButton url={`${siteUrl}/blog/${post.slug}`} title={post.title} />
                  </div>
                </div>
              </div>

              {/* Reading Tracker for XP */}
              <ReadingTracker postId={post.id} />

              {/* Reactions - Now in a card */}
              <div className="mb-8">
                <Reactions postId={post.id} />
              </div>

              {/* AI Summary */}
              {/* <div className="mb-8">
                <AISummary postId={post.id} />
              </div> */}

              {/* YouTube Thumbnail + Link - Better for performance & AdSense */}
              {post.youtubeUrl && (
                <a
                  href={post.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-8 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 ring-1 ring-white/10 group transition-transform hover:scale-[1.01]"
                >
                  {/* Thumbnail with Play Button Overlay */}
                  <div className="aspect-video relative">
                    <Image
                      src={`https://img.youtube.com/vi/${getYouTubeId(post.youtubeUrl)}/maxresdefault.jpg`}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.35,31.35,0,0,0,0,12a31.35,31.35,0,0,0,.5,5.81A3.02,3.02,0,0,0,2.62,19.95c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.35,31.35,0,0,0,24,12,31.35,31.35,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm font-medium">Xem video trên YouTube</span>
                    </div>
                    <span className="flex items-center gap-2 px-4 py-2 bg-red-600 group-hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
                      Xem ngay
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>
                </a>
              )}

              {/* Content */}
              <div
                id="article-content"
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:scroll-mt-20
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic
                  prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <InArticleAd />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>🏷️</span> Thẻ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Poll */}
              <Poll postId={post.id} />

              {/* AI Q&A */}
              {/* <AIQA postId={post.id} /> */}

              {/* Comments */}
              <Comments postId={post.id} />
            </div>

            {/* Sidebar - Premium Design */}
            <aside className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-5 py-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <span className="text-lg">📑</span> Mục lục bài viết
                    </h3>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <TableOfContents content={post.content} />
                  </div>
                </div>

                {/* Author Card */}
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl p-5 border border-primary-100 dark:border-primary-800/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/30">
                      {(post.author.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {post.author.name || 'Admin'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tác giả
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Cảm ơn bạn đã đọc bài viết! Đừng quên theo dõi kênh YouTube để xem thêm nhiều video thú vị.
                  </p>
                  <a
                    href="https://www.youtube.com/@BoRiViu67"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-500/25"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.35,31.35,0,0,0,0,12a31.35,31.35,0,0,0,.5,5.81A3.02,3.02,0,0,0,2.62,19.95c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.35,31.35,0,0,0,24,12,31.35,31.35,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z" />
                    </svg>
                    Theo dõi YouTube
                  </a>
                </div>

                <SidebarAd />
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />
        </div>
      </article>
    </>
  );
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

