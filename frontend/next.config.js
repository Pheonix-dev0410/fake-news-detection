/** @type {import('next').NextConfig} */
// Trigger new deployment with updated token
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  basePath: '',
  assetPrefix: ''
}

module.exports = nextConfig 