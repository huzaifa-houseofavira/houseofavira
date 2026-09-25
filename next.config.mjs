/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['firebase-admin', 'nodemailer', 'razorpay', 'cloudinary'],
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
    ],
  },
  async headers() {
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com https://*.googleusercontent.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://checkout.razorpay.com https://lux.razorpay.com https://api.razorpay.com https://api.postalpincode.in https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com https://*.firebaseapp.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
