// const withPWA = require("@ducanh2912/next-pwa").default({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ['ssh2'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kalpintelligence.com',
      },
      {
        protocol: 'https',
        hostname: 'www.kalpintelligence.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
// module.exports = withPWA(nextConfig);
