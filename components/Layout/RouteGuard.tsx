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
    
    const publicPaths = ['/onboarding', '/login']
    const isPublicPath = publicPaths.includes(pathname)

    // 온보딩 체크
    if (!onboardingCompleted && !isPublicPath) {
      router.replace('/onboarding')
      return
    }

    // 게스트 ID 체크 (온보딩 완료 후)
    if (onboardingCompleted && !guestId && !isPublicPath) {
      router.replace('/login')
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

