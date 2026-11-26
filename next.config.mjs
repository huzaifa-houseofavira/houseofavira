/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['firebase-admin', 'nodemailer', 'razorpay'],
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'gsap',
      '@gsap/react',
      'fuse.js',
      'country-state-city',
    ],
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.houseofavira.shop',
      },
    ],
  },
  async headers() {
    const staticAssetCacheHeader = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=604800, stale-while-revalidate=2592000',
      },
    ];
    const immutableCacheHeader = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ];
    const privateNoCacheHeader = [
      {
        key: 'Cache-Control',
        value: 'private, no-store, no-cache, must-revalidate',
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://storage.googleapis.com https://images.houseofavira.shop https://*.razorpay.com https://*.googleusercontent.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://checkout.razorpay.com https://lux.razorpay.com https://api.razorpay.com https://api.postalpincode.in https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com https://*.firebaseapp.com;"
          }
        ],
      },
      // Static public assets: prevent Cloudflare/browser revalidation storms to Vercel
      { source: '/:path*.png', headers: staticAssetCacheHeader },
      { source: '/:path*.jpg', headers: staticAssetCacheHeader },
      { source: '/:path*.jpeg', headers: staticAssetCacheHeader },
      { source: '/:path*.webp', headers: staticAssetCacheHeader },
      { source: '/:path*.svg', headers: staticAssetCacheHeader },
      { source: '/:path*.mp4', headers: staticAssetCacheHeader },
      { source: '/:path*.webm', headers: staticAssetCacheHeader },
      { source: '/images/:path*', headers: staticAssetCacheHeader },
      { source: '/shipping/:path*', headers: staticAssetCacheHeader },
      { source: '/pricing/:path*', headers: staticAssetCacheHeader },
      { source: '/videos/:path*', headers: staticAssetCacheHeader },
      // Fonts are versioned/static assets — safe for immutable 1-year caching
      { source: '/fonts/:path*', headers: immutableCacheHeader },
      { source: '/:path*.woff2', headers: immutableCacheHeader },
      { source: '/:path*.otf', headers: immutableCacheHeader },
      { source: '/:path*.ttf', headers: immutableCacheHeader },
      // Never cache private/personalized/admin pages at Cloudflare or browser edge
      { source: '/admin', headers: privateNoCacheHeader },
      { source: '/admin/:path*', headers: privateNoCacheHeader },
      { source: '/account', headers: privateNoCacheHeader },
      { source: '/checkout', headers: privateNoCacheHeader },
      { source: '/wishlist', headers: privateNoCacheHeader },
      { source: '/order-success', headers: privateNoCacheHeader },
      { source: '/shipping-success', headers: privateNoCacheHeader },
      { source: '/auth/:path*', headers: privateNoCacheHeader },
      { source: '/api/orders/:path*', headers: privateNoCacheHeader },
      { source: '/api/shipping/:path*', headers: privateNoCacheHeader },
      { source: '/api/admin/:path*', headers: privateNoCacheHeader },
    ];
  },
};

export default nextConfig;
