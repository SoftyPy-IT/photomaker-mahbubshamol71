import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Enable optimization for better performance
    unoptimized: false,
    // Use modern formats with fallbacks
    formats: ["image/avif", "image/webp"],
    // Optimize for different screen sizes
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable optimization for static images
    dangerouslyAllowSVG: false,
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slider"],
    // Enable app router optimizations
    optimizeServerReact: true,
  },

  // Compression settings
  compress: true,

  // Enable static optimization
  trailingSlash: false,
};

export default nextConfig;
