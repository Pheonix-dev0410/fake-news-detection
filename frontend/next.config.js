/** @type {import('next').NextConfig} */
// Trigger new deployment with updated token
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  distDir: 'out'
}

module.exports = nextConfig 