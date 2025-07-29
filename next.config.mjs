// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure images
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      // Add your production domains here
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    // Public env vars (exposed to the browser)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Add custom webpack configuration here
    
    // Important: return the modified config
    return config;
  },
  
  // Internationalization (i18n)
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects and rewrites
  async redirects() {
    return [
      // Example redirects
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Image optimization configuration
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Enable in production if needed
  compress: true,
  
  // Enable static exports for static site generation
  output: 'standalone',
  
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: true,
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['@heroicons/react'],
  },
};

export default nextConfig;
