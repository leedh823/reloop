'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const publicPaths = ['/splash', '/login', '/onboarding', '/profile-onboarding']
    const isPublicPath = publicPaths.includes(pathname)

    // 새로고침 감지: sessionStorage를 사용하여 이전 페이지 추적
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const isRefresh = navigationEntry?.type === 'reload' || 
                      (typeof performance.navigation !== 'undefined' && performance.navigation.type === 1)
    
    // 새로고침 감지 시 스플래시로 이동 (공개 경로 제외)
    if (isRefresh && !isPublicPath) {
      router.replace('/splash')
      return
    }

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')

    // 스플래시는 항상 접근 가능
    if (pathname === '/splash') {
      return
    }

    // 루트 접근 시 스플래시로 이동
    if (pathname === '/') {
      router.replace('/splash')
      return
    }

    // 프로필 온보딩 페이지는 항상 접근 가능
    if (pathname === '/profile-onboarding') {
      return
    }

    // 온보딩 페이지는 항상 접근 가능 (온보딩 완료 여부와 관계없이)
    if (pathname === '/onboarding') {
      return
    }

    // 로그인 페이지는 항상 접근 가능
    if (pathname === '/login') {
      return
    }

    // 온보딩이 완료되지 않았으면 온보딩으로
    if (!onboardingCompleted && !isPublicPath) {
      router.replace('/onboarding')
      return
    }

    // 게스트 ID가 없으면 로그인으로 (온보딩 완료 후)
    if (onboardingCompleted && !guestId && !isPublicPath) {
      router.replace('/login')
      return
    }
  }, [pathname, router])

  return <>{children}</>
}
