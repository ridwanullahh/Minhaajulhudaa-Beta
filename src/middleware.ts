/**
 * Astro Middleware - Security headers, CSRF, rate limiting
 * Only applies to server-rendered routes, not prerendered static pages
 */
import { defineMiddleware } from 'astro:middleware';

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 60;
const AUTH_RATE_LIMIT_MAX = 10;

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(ip: string, max: number): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(ip);
  if (!record || now > record.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  record.count++;
  return record.count > max;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Skip middleware for prerendered/static routes and non-API routes
  if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/admin/')) {
    return next();
  }

  // Rate limiting for API routes
  if (url.pathname.startsWith('/api/')) {
    const ip = getClientIP(request);
    const isAuthEndpoint = url.pathname.includes('/auth/');
    const max = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX;

    if (isRateLimited(ip, max)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // CSRF: validate origin for mutating requests (skip auth login)
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !isAuthEndpoint) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin && host && !origin.includes(host.replace(/:.*/, ''))) {
        return new Response(JSON.stringify({ error: 'Invalid origin' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  // Process the request
  const response = await next();

  // Add security headers to server responses
  if (response.headers && typeof response.headers.set === 'function') {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  return response;
});
