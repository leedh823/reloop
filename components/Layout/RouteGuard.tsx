'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getProfile } from '@/lib/storage/profile'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')
    
    const publicPaths = ['/onboarding', '/login', '/splash', '/profile-onboarding']
    const isPublicPath = publicPaths.includes(pathname)

    // 스플래시 페이지는 항상 접근 가능
    if (pathname === '/splash') {
      return
    }

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

    // 프로필 온보딩 체크 (게스트 ID가 있는 경우)
    if (onboardingCompleted && guestId && !isPublicPath) {
      const profile = getProfile()
      // /me 페이지는 프로필이 없어도 접근 가능 (CTA로 설정 가능)
      if (pathname !== '/me' && (!profile || !profile.completed)) {
        router.replace('/profile-onboarding')
        return
      }
    }

    // 온보딩 완료 후 루트 접근 시 홈으로 리다이렉트
    if (pathname === '/' && onboardingCompleted) {
      router.replace('/home')
      return
    }
  }, [pathname, router])

  return <>{children}</>
}
