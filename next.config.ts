import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "drive.usercontent.google.com",
      },
      {
        protocol: "https",
        hostname: "media2.dev.to",
      },
      {
        protocol: "https",
        hostname: "*.dev.to",
      },
      {
        protocol: "https",
        hostname: "iili.io",
      },
      {
        protocol: "https",
        hostname: "*.iili.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/materials",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/materials/:path*",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/learning",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/learning/articles",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/learning/articles/:slug*",
        destination: "/articles/:slug*",
        permanent: true,
      },
      {
        source: "/learning/notes",
        destination: "/daily-notes",
        permanent: true,
      },
      {
        source: "/learning/notes/:id*",
        destination: "/daily-notes",
        permanent: true,
      },
      {
        source: "/learning/resources",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/learning/subjects",
        destination: "/subjects",
        permanent: true,
      },
      {
        source: "/learning/subjects/:code*",
        destination: "/subjects/:code*",
        permanent: true,
      },
      {
        source: "/admin/materials",
        destination: "/admin/articles",
        permanent: false,
      },
      {
        source: "/admin/materials/:path*",
        destination: "/admin/articles",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
