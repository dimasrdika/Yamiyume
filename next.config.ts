/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "cdn.myanimelist.net", // Existing domain
      "s4.anilist.co", // Add this line for Anilist images
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/consumet/:path*",
        destination: "https://api.consumet.org/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
