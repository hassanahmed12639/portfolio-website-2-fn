const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/th-proxy/fb',
        destination: 'https://connect.facebook.net/en_US/fbevents.js'
      },
      {
        source: '/th-proxy/meta-capi/:path*',
        destination: 'https://graph.facebook.com/:path*'
      },
      {
        source: '/th-proxy/gtm',
        destination: 'https://www.googletagmanager.com/gtm.js'
      },
      {
        source: '/th-proxy/gads',
        destination: 'https://googleadservices.com'
      },
      {
        source: '/th-proxy/th',
        destination: 'https://track.itshassanahmed.com/th.js'
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    serverComponentsExternalPackages: [],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
      ],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }
    return config
  },
}

module.exports = nextConfig
