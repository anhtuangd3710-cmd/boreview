/**
 * Cached Database Queries
 *
 * Using Next.js unstable_cache to cache database queries BETWEEN requests.
 * This dramatically reduces database load and improves page load times.
 *
 * Benefits:
 * - Cross-request caching: Results are cached and reused across multiple requests
 * - Time-based revalidation: Cache expires after specified time (e.g., 60 seconds)
 * - Tag-based invalidation: Can invalidate specific caches when data changes
 * - Works with dynamic rendering: No need for ISR/static generation
 */

import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// Cache durations (in seconds)
const CACHE_SHORT = 60;      // 1 minute - for frequently changing data
const CACHE_MEDIUM = 300;    // 5 minutes - for homepage, blog list
const CACHE_LONG = 3600;     // 1 hour - for individual posts

// =============================================================================
// POST QUERIES
// =============================================================================

/**
 * Get a single post by slug with author, categories, and tags
 * Used by: app/blog/[slug]/page.tsx
 * Cache: 1 hour (posts rarely change)
 */
export const getPostBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.post.findUnique({
        where: { slug, published: true },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: true,
          tags: true,
        },
      });
    },
    [`post-${slug}`],
    { revalidate: CACHE_LONG, tags: ['posts', `post-${slug}`] }
  )();

/**
 * Get related posts by category
 * Used by: app/blog/[slug]/page.tsx
 * Cache: 5 minutes
 */
export const getRelatedPosts = (postId: string, categoryIds: string[]) =>
  unstable_cache(
    async () => {
      return prisma.post.findMany({
        where: {
          published: true,
          id: { not: postId },
          categories: { some: { id: { in: categoryIds } } },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          youtubeUrl: true,
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
      });
    },
    [`related-${postId}`],
    { revalidate: CACHE_MEDIUM, tags: ['posts'] }
  )();

/**
 * Get featured posts for homepage
 * Used by: app/page.tsx
 * Cache: 5 minutes
 */
export const getFeaturedPosts = () =>
  unstable_cache(
    async () => {
      return prisma.post.findMany({
        where: { published: true, featured: true },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 1,
      });
    },
    ['featured-posts'],
    { revalidate: CACHE_MEDIUM, tags: ['posts', 'featured'] }
  )();

/**
 * Get latest posts for homepage
 * Used by: app/page.tsx
 * Cache: 5 minutes
 */
export const getLatestPosts = (take: number = 6) =>
  unstable_cache(
    async () => {
      return prisma.post.findMany({
        where: { published: true },
        include: {
          author: { select: { id: true, name: true, email: true } },
          categories: true,
        },
        orderBy: { publishedAt: 'desc' },
        take,
      });
    },
    [`latest-posts-${take}`],
    { revalidate: CACHE_MEDIUM, tags: ['posts'] }
  )();

/**
 * Get paginated posts with optional search and category filter
 * Used by: app/blog/page.tsx
 * Cache: 1 minute (search results should be fresh)
 */
export const getPaginatedPosts = (
  page: number,
  search: string,
  category: string,
  limit: number = 9
) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { published: true };

      if (search) {
        where.OR = [
          { title: { contains: search } },
          { content: { contains: search } },
          { excerpt: { contains: search } },
        ];
      }

      if (category) {
        where.categories = { some: { slug: category } };
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: { select: { id: true, name: true, email: true } },
            categories: true,
          },
          orderBy: { publishedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);

      return { posts, total, totalPages: Math.ceil(total / limit) };
    },
    [`posts-page-${page}-search-${search}-cat-${category}-limit-${limit}`],
    { revalidate: CACHE_SHORT, tags: ['posts'] }
  )();

// =============================================================================
// CATEGORY QUERIES
// =============================================================================

/**
 * Get all categories with post count
 * Used by: app/blog/page.tsx, sidebar components
 * Cache: 5 minutes
 */
export const getCategoriesWithCount = () =>
  unstable_cache(
    async () => {
      return prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: 'asc' },
      });
    },
    ['categories-with-count'],
    { revalidate: CACHE_MEDIUM, tags: ['categories'] }
  )();

