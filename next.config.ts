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
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
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
};

export default nextConfig;
