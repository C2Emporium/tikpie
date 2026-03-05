/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers de sécurité et cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  // Compression activée par défaut en prod
  compress: true,
};

module.exports = nextConfig;
