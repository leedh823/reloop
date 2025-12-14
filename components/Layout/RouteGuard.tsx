'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    // 새로고침 감지: sessionStorage에 이전 경로가 없으면 새로고침으로 간주
    const previousPath = sessionStorage.getItem('previousPath')
    const isRefresh = !previousPath || previousPath !== pathname

    // 현재 경로 저장
    sessionStorage.setItem('previousPath', pathname)

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')
    
    const publicPaths = ['/splash', '/login', '/onboarding', '/profile-onboarding']
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

    // 프로필 온보딩 페이지는 항상 접근 가능
    if (pathname === '/profile-onboarding') {
      return
    }

    // 새로고침 감지 시 스플래시로 이동 (스플래시, 로그인, 온보딩, 프로필 온보딩 제외)
    if (isRefresh && !isPublicPath && onboardingCompleted && guestId) {
      router.replace('/splash')
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
