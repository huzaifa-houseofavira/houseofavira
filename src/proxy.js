import { NextResponse } from 'next/server';

// Simple in-memory rate limiting map for serverless edge.
// Note: This resets on cold starts. For production scale across multiple edge nodes,
// a Redis-based solution (like Upstash) is recommended.
const rateLimit = new Map();

const LIMITS = {
  '/api/orders': { max: 10, windowMs: 60000 },           // 10 req/min
  '/api/contact': { max: 5, windowMs: 60000 },           // 5 req/min
  '/api/send-reminder': { max: 10, windowMs: 60000 },    // 10 req/min
  '/api/send-custom-mail': { max: 10, windowMs: 60000 }, // 10 req/min
  '/api/verify-payment': { max: 15, windowMs: 60000 },   // 15 req/min
  '/api/razorpay/webhook': { max: 1000, windowMs: 60000 },// High limit for webhook
  'default': { max: 30, windowMs: 60000 }                // 30 req/min for other APIs
};

function getRateLimitConfig(pathname) {
  for (const route in LIMITS) {
    if (route !== 'default' && pathname.startsWith(route)) {
      return LIMITS[route];
    }
  }
  return LIMITS['default'];
}

export function proxy(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Set default cookies for non-API routes (if matched by accident or if needed)
  if (!pathname.startsWith('/api/')) {
    if (!request.cookies.get('NEXT_LOCALE')?.value) {
      response.cookies.set('NEXT_LOCALE', 'en', { maxAge: 60 * 60 * 24 * 30, path: '/' });
    }
    if (!request.cookies.get('USER_CURRENCY')?.value) {
      response.cookies.set('USER_CURRENCY', 'INR', { maxAge: 60 * 60 * 24 * 30, path: '/' });
    }
    return response;
  }

  // Rate Limiting for API routes
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const config = getRateLimitConfig(pathname);
  
  const key = `${ip}-${pathname}`;
  const now = Date.now();
  
  const record = rateLimit.get(key) || { count: 0, resetTime: now + config.windowMs };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + config.windowMs;
  } else {
    record.count++;
  }
  
  rateLimit.set(key, record);
  
  if (record.count > config.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later.' }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
        } 
      }
    );
  }

  return response;
}

// Apply middleware ONLY to API routes to prevent Vercel Invocation spikes
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
