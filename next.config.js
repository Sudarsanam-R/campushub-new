/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable SWC compiler (replaces Babel for most transformations)
  swcMinify: true,
  
  // Configure webpack to handle font loading with next/font
  webpack(config) {
    // Add rule for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]',
      },
    });

    return config;
  },
  
  // Configure images
  images: {
    domains: ['localhost'], // Add your image domains here
  },
  
  // Enable experimental features if needed
  experimental: {
    // Enable the new font system
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
};

module.exports = nextConfig;
