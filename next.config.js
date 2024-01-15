// eslint-disable-next-line import/no-extraneous-dependencies
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const commit = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, options) => {
    const { dev, isServer } = options;

    // Output webpack stats JSON file only for client-side/production build
    if (!dev && !isServer) {
      config.plugins.push(
        new StatsWriterPlugin({
          filename: '../webpack-stats.json',
          stats: {
            assets: true,
            chunks: true,
            modules: true,
          },
        })
      );
    }

    return config;
  },
  env: {
    commit,
  },
};

module.exports = nextConfig;
