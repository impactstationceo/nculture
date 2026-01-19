/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  images: {
    domains: ['zqyaitvnguyanhmnefvp.supabase.co'],
    unoptimized: true,
  },
}

module.exports = nextConfig
