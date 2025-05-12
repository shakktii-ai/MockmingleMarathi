/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add a custom server configuration
  webpack: (config, { isServer }) => {
    // Keep the console output clean in development mode
    if (isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
  // Configure API routes to handle large requests
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },
  experimental: {
    // Enable larger response size limits
    largePageDataBytes: 128 * 1000, // 128KB (default is 128KB)
  },
}

module.exports = nextConfig
