/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // new
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.localhost:3000"],
    },
  },
};

export default nextConfig;
