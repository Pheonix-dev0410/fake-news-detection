/** @type {import('next').NextConfig} */
// Trigger new deployment with updated token
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true
}

module.exports = nextConfig 