import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'pino',
    'thread-stream',
    'pino-pretty',
  ],
  webpack: (config, { isServer, webpack }) => {
    // Exclude test files from being bundled
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Ignore viem test decorators that cause build issues
    config.module.rules.push({
      test: /node_modules\/viem\/_cjs\/clients\/decorators\/test\.js$/,
      use: 'null-loader',
    });

    // Ignore all test files
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      use: 'null-loader',
    });

    // Ignore helper files in test directories
    config.module.rules.push({
      test: /node_modules\/.*\/test\/.*\.(js|ts)$/,
      use: 'null-loader',
    });

    // Ignore missing optional dependencies used only in tests
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'tap': false,
      'tape': false,
      'why-is-node-running': false,
      '@react-native-async-storage/async-storage': false,
    };

    // Fix wagmi's porto connector import issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'porto': false,
    };

    // Use IgnorePlugin to completely exclude test directories
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /thread-stream/,
      })
    );

    return config;
  },
};

export default nextConfig;
// Orchids restart: 1763763673599
