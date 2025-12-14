'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')
    
    const publicPaths = ['/splash', '/login', '/onboarding']
    const isPublicPath = publicPaths.includes(pathname)

    // 스플래시는 항상 접근 가능
    if (pathname === '/splash') {
      return
    }

    // 루트 접근 시 스플래시로 이동
    if (pathname === '/') {
      router.replace('/splash')
      return
    }

    // 게스트 ID가 없으면 로그인으로
    if (!guestId && !isPublicPath) {
      router.replace('/login')
      return
    }

    // 온보딩이 완료되지 않았으면 온보딩으로
    if (!onboardingCompleted && guestId && !isPublicPath) {
      router.replace('/onboarding')
      return
    }

    // 온보딩 완료 후 루트 접근 시 홈으로 리다이렉트
    if (pathname === '/' && onboardingCompleted) {
      router.replace('/home')
      return
    }
  }, [pathname, router])

  return <>{children}</>
}

