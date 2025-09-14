/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  images: {
    domains: ['images.unsplash.com', 'i.scdn.co', 'source.unsplash.com', 'picsum.photos', 'placehold.co','/public/cover','/public'],
  },
  poweredByHeader: false,
  compress: true,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Disable development indicators
  devIndicators: false,
};

module.exports = nextConfig;
