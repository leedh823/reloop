'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // 상태바 색상 설정 (검은 배경)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#000000')
    }

    // 온보딩/로그인 상태 확인
    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    const guestId = localStorage.getItem('guestId')
    const profile = localStorage.getItem('reloop_profile')
    const profileData = profile ? JSON.parse(profile) : null

    // 2초 후 적절한 페이지로 이동
    const timer = setTimeout(() => {
      if (onboardingCompleted && guestId && profileData?.completed) {
        // 모든 온보딩 완료: 홈으로
        router.push('/home')
      } else if (onboardingCompleted && guestId) {
        // 프로필 미완료: 프로필 온보딩으로
        router.push('/profile-onboarding')
      } else if (onboardingCompleted) {
        // 로그인 미완료: 로그인으로
        router.push('/login')
      } else {
        // 온보딩 미완료: 온보딩으로
        router.push('/onboarding')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center safe-area-top safe-area-bottom">
      <div className="flex flex-col items-center space-y-8 animate-fade-in px-4">
        {/* 로고 */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo1.png"
            alt="Reloop"
            width={120}
            height={120}
            className="h-24 w-24 object-contain"
            priority
          />
        </div>

        {/* 슬로건 */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/슬로건.png"
            alt="실패를 기록하고 다시 도전하세요"
            width={200}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
