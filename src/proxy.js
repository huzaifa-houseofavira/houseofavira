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

  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // List of common bot/scraper user agents
  const BLOCKED_USER_AGENTS = [
    'python-requests',
    'scrapy',
    'curl',
    'wget',
    'bot',
    'crawler',
    'spider',
    'headlesschrome',
    'puppeteer',
    'selenium',
  ];

  // List of legitimate bots we WANT to allow (Google, Bing, etc. for SEO)
  const ALLOWED_BOTS = [
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
  ];

  // 0.5 Check if it's a known bad bot
  const isBlockedBot = BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot));
  const isAllowedBot = ALLOWED_BOTS.some(bot => userAgent.includes(bot));

  if (isBlockedBot && !isAllowedBot) {
    console.log(`Blocked bot: ${userAgent}`);
    return new NextResponse('Access Denied: Bot traffic detected.', { status: 403 });
  }


  // 0. Set default cookies (migrated from proxy.js)
  if (!request.cookies.get('NEXT_LOCALE')?.value) {
    response.cookies.set('NEXT_LOCALE', 'en', { maxAge: 60 * 60 * 24 * 30, path: '/' });
  }

  if (!request.cookies.get('USER_CURRENCY')?.value) {
    response.cookies.set('USER_CURRENCY', 'INR', { maxAge: 60 * 60 * 24 * 30, path: '/' });
  }

  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
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
  }

  // 2. Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Note: unsafe-inline is required for some Next.js/React functionality and Razorpay SDK
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://apis.google.com https://accounts.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com https://*.googleusercontent.com;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://checkout.razorpay.com https://lux.razorpay.com https://api.razorpay.com https://api.postalpincode.in https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
    frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com https://*.firebaseapp.com;
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Apply middleware to all routes except static assets and image optimization
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. LOGO.png)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
