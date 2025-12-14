import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RouteGuard from '@/components/Layout/RouteGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reloop - 실패를 기록하고 다시 도전하세요',
  description: '실패를 기록하고, AI로 구조화해, 다시 시도하게 돕는 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Reloop',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000', // 기본값 (각 페이지에서 동적으로 변경)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Reloop" />
        <link rel="apple-touch-icon" href="/images/logo1.png" />
        {/* 주소창 최소화를 위한 메타 태그 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        {/* 상태바 색상 동적 변경을 위한 메타 태그 */}
        <meta name="theme-color" content="#000000" id="theme-color-meta" />
      </head>
      <body className={inter.className}>
        <RouteGuard>
          {children}
        </RouteGuard>
      </body>
    </html>
  )
}

