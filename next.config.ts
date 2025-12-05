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
  eslint: {
    ignoreDuringBuilds: true,
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

    // Ignore viem test decorators completely
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /node_modules\/viem\/_cjs\/clients\/decorators\/test\.js$/,
        require.resolve('./webpack-empty-module.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /node_modules\/viem\/_esm\/clients\/decorators\/test\.js$/,
        require.resolve('./webpack-empty-module.js')
      )
    );

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
    const path = require('path');
    const emptyModulePath = path.resolve(__dirname, 'webpack-empty-module.js');

    config.resolve.alias = {
      ...config.resolve.alias,
      'porto': false,
      // Replace viem test decorators with empty module
      'viem/_esm/clients/decorators/test.js': emptyModulePath,
      'viem/_cjs/clients/decorators/test.js': emptyModulePath,
      'viem/_esm/clients/decorators/test': emptyModulePath,
      'viem/_cjs/clients/decorators/test': emptyModulePath,
    };

    // Use IgnorePlugin to completely exclude test directories
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /thread-stream/,
      })
    );

    // Ignore viem test module completely
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /clients\/decorators\/test/,
        contextRegExp: /viem/,
      })
    );

    // Ignore viem test actions that are causing export errors
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.\/test\/(dumpState|getAutomine|getTxpoolContent|getTxpoolStatus|impersonateAccount|increaseTime|inspectTxpool|loadState|mine|removeBlockTimestampInterval|reset|revert|sendUnsignedTransaction|setAutomine|setBalance|setBlockGasLimit|setBlockTimestampInterval|setCode|setCoinbase|setIntervalMining|setLoggingEnabled|setMinGasPrice|setNextBlockBaseFeePerGas|setNextBlockTimestamp|setNonce|setRpcUrl|setStorageAt|snapshot|stopImpersonatingAccount)/,
        contextRegExp: /viem.*actions/,
      })
    );

    // Ignore all viem actions/index.js test re-exports
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /viem\/_esm\/actions/,
      })
    );

    return config;
  },
};

export default nextConfig;
// Orchids restart: 1763763673599
