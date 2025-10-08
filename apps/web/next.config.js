/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tortuga/hedera', '@tortuga/database'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  env: {
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK,
  },
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        fs: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
