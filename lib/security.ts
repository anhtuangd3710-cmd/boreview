import { createHash } from 'crypto';
import prisma from './prisma';

// Hash IP address for privacy
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt';
  return createHash('sha256').update(ip + salt).digest('hex');
}

// Get client IP from request headers
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1';
}

// Rate limiting configuration
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  comment: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  reaction: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  poll: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  search: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  ai: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
  auth: { maxRequests: 10, windowMs: 60000 }, // 10 per minute for login/register
  newsletter: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour
  contact: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour
  upload: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  admin: { maxRequests: 100, windowMs: 60000 }, // 100 per minute for admin
  public: { maxRequests: 60, windowMs: 60000 }, // 60 per minute for public APIs
};

// Check rate limit
export async function checkRateLimit(ipHash: string, action: string): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMITS[action] || { maxRequests: 10, windowMs: 60000 };
  const windowStart = new Date(Date.now() - config.windowMs);

  // Clean up old entries and get current count
  const existing = await prisma.rateLimit.findUnique({
    where: { ipHash_action: { ipHash, action } },
  });

  if (!existing || existing.windowStart < windowStart) {
    // Reset or create new window
    await prisma.rateLimit.upsert({
      where: { ipHash_action: { ipHash, action } },
      update: { count: 1, windowStart: new Date() },
      create: { ipHash, action, count: 1, windowStart: new Date() },
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.rateLimit.update({
    where: { ipHash_action: { ipHash, action } },
    data: { count: existing.count + 1 },
  });

  return { allowed: true, remaining: config.maxRequests - existing.count - 1 };
}

// Check if IP is banned
export async function isIPBanned(ipHash: string): Promise<boolean> {
  const banned = await prisma.bannedIP.findUnique({ where: { ipHash } });
  return !!banned;
}

// Profanity filter - basic implementation
const PROFANITY_LIST = [
  'spam', 'scam', 'xxx', 'porn', 'viagra', 'casino',
  // Add more words as needed
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word => lowerText.includes(word));
}

// Sanitize HTML to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  const token = createHash('sha256')
    .update(Math.random().toString() + Date.now().toString())
    .digest('hex');
  return token;
}

// Validate reCAPTCHA (optional)
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // Skip if not configured

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch {
    return false;
  }
}

