/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
    ],
    unoptimized: false,
  },
  // Supabase Edge Functions는 Deno 런타임이므로 Next.js 빌드에서 제외
  webpack: (config, { isServer }) => {
    // 서버 사이드에서 unpdf를 external로 설정 (번들링 제외)
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('unpdf')
    }
    return config
  },
}

module.exports = nextConfig



