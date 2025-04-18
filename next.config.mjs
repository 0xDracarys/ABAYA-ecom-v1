/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['source.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix CSS extraction issue
    if (!isServer) {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      
      // Add the plugin if it doesn't exist
      if (!config.plugins.some(plugin => plugin instanceof MiniCssExtractPlugin)) {
        config.plugins.push(new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }));
      }
    }
    
    return config;
  },
  // Add port configuration with auto-detection
  serverRuntimeConfig: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
}

export default nextConfig
