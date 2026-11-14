/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.blackaboij.com",
      },
    ],
  },

  // Add rewrites to proxy API requests
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.blackaboij.com/api/:path*",
      },
    ];
  },

  // Increase body size limit for Server Actions (App Router equivalent
  // of the old Pages Router `api.bodyParser` option)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;