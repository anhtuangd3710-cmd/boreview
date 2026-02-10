// ============================================
// API MIDDLEWARE - Security & Rate Limiting
// Production-ready middleware for API routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { checkRateLimit, getClientIP, hashIP, isIPBanned } from './security';
import { z, ZodSchema } from 'zod';

// Types
export interface AdminContext {
  session: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  ipHash: string;
}

export interface PublicContext {
  ipHash: string;
  rateLimit: {
    remaining: number;
  };
}

type AdminHandler<T = unknown> = (
  request: NextRequest,
  context: AdminContext,
  validatedData?: T
) => Promise<NextResponse>;

type PublicHandler<T = unknown> = (
  request: NextRequest,
  context: PublicContext,
  validatedData?: T
) => Promise<NextResponse>;

// ============================================
// ADMIN API MIDDLEWARE
// Checks: session, role, rate limit, IP ban
// ============================================
export function withAdminAuth<T = unknown>(
  handler: AdminHandler<T>,
  options?: {
    rateLimit?: string;
    schema?: ZodSchema<T>;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Check session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }

      // 2. Check admin role
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }

      // 3. Get and check IP
      const clientIP = getClientIP(request);
      const ipHash = hashIP(clientIP);

      // 4. Check if IP is banned
      const banned = await isIPBanned(ipHash);
      if (banned) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // 5. Rate limiting (optional for admin)
      if (options?.rateLimit) {
        const { allowed, remaining } = await checkRateLimit(ipHash, options.rateLimit);
        if (!allowed) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
          );
        }
      }

      // 6. Validate input if schema provided
      let validatedData: T | undefined;
      if (options?.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          const result = options.schema.safeParse(body);
          if (!result.success) {
            return NextResponse.json(
              { error: 'Validation failed', details: result.error.issues },
              { status: 400 }
            );
          }
          validatedData = result.data;
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          );
        }
      }

      // 7. Call handler with context
      const context: AdminContext = {
        session: session as AdminContext['session'],
        ipHash,
      };

      return handler(request, context, validatedData);
    } catch (error) {
      console.error('Admin API Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// ============================================
// PUBLIC API MIDDLEWARE
// Checks: rate limit, IP ban, sanitizes output
// ============================================
export function withPublicRateLimit<T = unknown>(
  handler: PublicHandler<T>,
  options: {
    rateLimit: string;
    schema?: ZodSchema<T>;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Get and check IP
      const clientIP = getClientIP(request);
      const ipHash = hashIP(clientIP);

      // 2. Check if IP is banned
      const banned = await isIPBanned(ipHash);
      if (banned) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // 3. Rate limiting
      const { allowed, remaining } = await checkRateLimit(ipHash, options.rateLimit);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'Retry-After': '60'
            }
          }
        );
      }

      // 4. Validate input if schema provided
      let validatedData: T | undefined;
      if (options?.schema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          const result = options.schema.safeParse(body);
          if (!result.success) {
            return NextResponse.json(
              { error: 'Validation failed' },
              { status: 400 }
            );
          }
          validatedData = result.data;
        } catch {
          return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
          );
        }
      }

      // 5. Call handler with context
      const context: PublicContext = {
        ipHash,
        rateLimit: { remaining },
      };

      const response = await handler(request, context, validatedData);

      // Add rate limit headers
      response.headers.set('X-RateLimit-Remaining', remaining.toString());

      return response;
    } catch (error) {
      console.error('Public API Error:', error);
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      );
    }
  };
}

// ============================================
// SAFE FIELD SELECTOR
// Only return safe fields for public APIs
// ============================================
export const SAFE_POST_FIELDS = {
  title: true,
  slug: true,
  excerpt: true,
  thumbnail: true,
  publishedAt: true,
  views: true,
  author: {
    select: {
      name: true,
    },
  },
  categories: {
    select: {
      name: true,
      slug: true,
    },
  },
} as const;

// Transform post to safe public format
export function toSafePost(post: {
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: Date | null;
  views: number;
  author?: { name: string | null };
  categories?: { name: string; slug: string }[];
}) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    image_url: post.thumbnail,
    published_at: post.publishedAt?.toISOString(),
    views: post.views,
    author_name: post.author?.name || 'Anonymous',
    categories: post.categories?.map(c => ({ name: c.name, slug: c.slug })) || [],
  };
}

// ============================================
// CACHE HEADERS HELPER
// ============================================
export function withCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPrivate?: boolean;
  } = {}
): NextResponse {
  const { maxAge = 60, staleWhileRevalidate = 300, isPrivate = false } = options;

  const cacheControl = isPrivate
    ? 'private, no-cache'
    : `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;

  response.headers.set('Cache-Control', cacheControl);

  return response;
}

