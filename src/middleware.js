import { NextResponse } from 'next/server';

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

export function middleware(request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // 1. Check if it's a known bad bot
  const isBlockedBot = BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot));
  const isAllowedBot = ALLOWED_BOTS.some(bot => userAgent.includes(bot));

  // If it's a blocked bot AND not a good search engine, block it!
  if (isBlockedBot && !isAllowedBot) {
    console.log(`Blocked bot: ${userAgent}`);
    return new NextResponse('Access Denied: Bot traffic detected.', { status: 403 });
  }

  // 2. Add basic security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
