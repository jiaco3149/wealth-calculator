/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable turbopack minification bug workarounds - use webpack for production
  output: 'standalone',
};

export default nextConfig;
