/** @type {import('next').NextConfig} */
const { Buffer } = require('buffer');

const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable SWC compiler (replaces Babel for most transformations)
  swcMinify: true,
  
  // Configure webpack to handle large strings and assets efficiently
  webpack(config, { dev, isServer }) {
    // Add rule for font files with optimized handling
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]',
      },
    });

    // Optimize handling of large strings in the build process
    if (!dev) {
      // Cache large chunks more efficiently
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        maxMemoryGenerations: 1,
      };

      // Optimize chunk size limits
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          maxSize: 244 * 1024, // 244KB
          minSize: 20 * 1024,  // 20KB
        },
        minimize: true,
      };

      // Add a custom plugin to handle large strings
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.NEXT_BUILD_OPTIMIZED': JSON.stringify(true),
        })
      );
    }

    // Add a custom loader for large JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      use: [
        {
          loader: 'json-loader',
          options: {
            // Force JSON files to be loaded as Buffer
            parse: (jsonString) => {
              return Buffer.from(jsonString);
            },
          },
        },
      ],
      // Only apply to large JSON files
      resourceQuery: /large/,
    });

    return config;
  },
  
  // Configure images with optimized defaults
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Enable experimental features
  experimental: {
    // Enable the new font system
    fontLoaders: [
      { 
        loader: '@next/font/google', 
        options: { 
          subsets: ['latin'],
          display: 'swap',
          preload: true,
        },
      },
    ],
    // Enable Webpack 5 persistent caching
    webpackBuildWorker: true,
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Custom webpack cache configuration
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: '.next/cache/webpack',
  },
};

// Helper function to handle large string serialization
function optimizeLargeString(str) {
  if (Buffer.byteLength(str) > 128 * 1024) { // 128KB threshold
    return {
      __isBuffer: true,
      data: Buffer.from(str).toJSON().data,
    };
  }
  return str;
}

// Helper function to deserialize optimized strings
function deserializeOptimizedString(obj) {
  if (obj && obj.__isBuffer && Array.isArray(obj.data)) {
    return Buffer.from(obj.data).toString('utf8');
  }
  return obj;
}

module.exports = nextConfig;
