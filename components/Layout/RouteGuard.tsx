'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getProfile, clearProfile } from '@/lib/storage/profile'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')
    const profile = getProfile()
    
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

    // 무조건 프로필 온보딩으로 리다이렉트 (단, /me 페이지와 /profile-onboarding은 예외)
    if (onboardingCompleted && guestId && pathname !== '/profile-onboarding' && pathname !== '/me') {
      // 프로필 초기화 (작성한 글은 유지)
      const profile = getProfile()
      if (profile && profile.completed) {
        // 프로필이 완료되어 있으면 초기화
        clearProfile()
      }
      router.replace('/profile-onboarding')
      return
    }

    // 모든 가드를 통과하고, 온보딩 완료 후 루트 접근 시 프로필 온보딩으로 리다이렉트
    if (pathname === '/' && onboardingCompleted && guestId) {
      router.replace('/profile-onboarding')
      return
    }
  }, [pathname, router])

  return <>{children}</>
}
