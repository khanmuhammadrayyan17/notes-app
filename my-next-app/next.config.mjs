/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Add compression and optimization
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
