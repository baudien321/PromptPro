/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
  // Configure domains for images from external sources
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  // Allow dev origins for Replit
  allowedDevOrigins: ['2b39b015-fc6e-412c-ae27-96216b11f2fc-00-1h4viscs2ehk1.worf.replit.dev'],
}