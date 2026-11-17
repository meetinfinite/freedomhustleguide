/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" }
    ]
  },
  // Free footage-sorting guide: a self-contained page in public/sort,
  // served at the clean address /sort.
  async rewrites() {
    return [{ source: "/sort", destination: "/sort/index.html" }];
  }
};

export default nextConfig;
