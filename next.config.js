/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mssql', 'bcryptjs'],
  },
  webpack: (config, { isServer }) => {
    config.externals = config.externals || [];
    config.externals.push({
      mssql: 'commonjs mssql',
      tedious: 'commonjs tedious',
      bcryptjs: 'commonjs bcryptjs',
      'node:events': 'commonjs node:events',
    });

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'node:events': require.resolve('events/'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        events: require.resolve('events/'),
      };
    }

    return config;
  },
};

module.exports = nextConfig;
