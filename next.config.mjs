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

  // Security headers
  async headers() {
    return [
      // Auth pages - more permissive CSP for OAuth
      {
        source: '/auth/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.google.com https://accounts.google.com https://oauth2.googleapis.com; frame-src 'self' https://*.google.com;",
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com https://accounts.google.com https://apis.google.com https://gstatic.com https://www.google.com https://ssl.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://*.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.iyzipay.com https://api.openweathermap.org https://www.tcmb.gov.tr https://accounts.google.com https://oauth2.googleapis.com https://*.google.com; frame-src 'self' https://maps.google.com https://accounts.google.com https://*.google.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

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
