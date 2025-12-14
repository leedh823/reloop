'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const hasCheckedRefresh = useRef(false)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const publicPaths = ['/splash', '/login', '/onboarding', '/profile-onboarding']
    const isPublicPath = publicPaths.includes(pathname)

    // 새로고침 감지: 여러 방법 조합
    let isRefresh = false

    // 방법 1: PerformanceNavigationTiming API
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        isRefresh = navigationEntry.type === 'reload'
      }
    } catch (e) {
      // API가 지원되지 않는 경우
    }

    // 방법 2: performance.navigation (구형 브라우저 지원)
    if (!isRefresh && typeof (performance as any).navigation !== 'undefined') {
      isRefresh = (performance as any).navigation.type === 1 // TYPE_RELOAD
    }

    // 방법 3: sessionStorage를 사용한 추가 확인
    if (!hasCheckedRefresh.current) {
      const refreshFlag = sessionStorage.getItem('reloop_is_refresh')
      if (refreshFlag === 'true') {
        isRefresh = true
        sessionStorage.removeItem('reloop_is_refresh')
      }
    }

    // 새로고침 감지 시 스플래시로 이동 (공개 경로 제외)
    if (isRefresh && !isPublicPath && !hasCheckedRefresh.current) {
      hasCheckedRefresh.current = true
      router.replace('/splash')
      return
    }

    hasCheckedRefresh.current = true

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

  // beforeunload 이벤트로 새로고침 감지 플래그 설정
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('reloop_is_refresh', 'true')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return <>{children}</>
}
