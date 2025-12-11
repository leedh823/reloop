/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Supabase Edge Functions는 Deno 런타임이므로 Next.js 빌드에서 제외
  webpack: (config) => {
    config.externals = config.externals || []
    return config
  },
}

module.exports = nextConfig



