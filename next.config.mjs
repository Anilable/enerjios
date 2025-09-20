// next.config.js (GÜNCEL VE TEMİZLENMİŞ HALİ)

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    domains: ['api.mapbox.com', 'images.unsplash.com', 'lh3.googleusercontent.com', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        port: '',
        pathname: '/styles/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      '@react-three/drei', 
      '@react-three/fiber', 
      'three',
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
    scrollRestoration: true,
    optimizeCss: false,
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Temporarily disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // 🔥🔥🔥 ASYNC HEADERS FONKSİYONU TAMAMEN KALDIRILDI 🔥🔥🔥
  // Güvenlik başlıkları artık middleware.ts dosyasından yönetilecek.

  // Environment-specific redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/calculator',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev }) => {
    // Simple development configuration - avoid complex optimizations that cause errors
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        minimize: false,
      };
    }

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
};

export default nextConfig;