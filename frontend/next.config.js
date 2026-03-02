/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // All /api/v1/ requests go through Nginx → backend:8080 at runtime.
  // No rewrites needed – the browser calls /api/v1/... which Nginx proxies.
};

module.exports = nextConfig;
