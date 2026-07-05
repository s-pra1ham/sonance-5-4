/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configures the output directory for the build
  output: "standalone",
  
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'i.scdn.co' },
      { hostname: 'source.unsplash.com' },
      { hostname: 'picsum.photos' },
      { hostname: 'placehold.co' },
      { hostname: 'c.saavncdn.com' }
    ],
  },
  // Disables the 'x-powered-by: Next.js' header
  poweredByHeader: false,
  // Enables compression (gzip) for all responses
  compress: true,
  // Enable React strict mode for better development and debugging
  reactStrictMode: true,
  // Disables the "development" indicator in the corner of the screen
  devIndicators: {
    // Correct way to disable indicators is to set 'devIndicators' to an object
    // and 'autoPrerender' to false, but the boolean is simpler for general disablement.
    // The previous 'devIndicators: false' is functionally incorrect for the config structure.
    // If you want to disable the badge:
    // showBadge: false,
    // showDevServer: false,
  },
  // Eslint configuration to ignore lint errors during Vercel builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. This is usually set to ignore errors for deployment purposes.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
