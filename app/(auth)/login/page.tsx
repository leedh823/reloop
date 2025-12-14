'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 상태바 색상 설정 (검은 배경)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#000000')
    }
  }, [])

  const handleGuestLogin = () => {
    // 게스트 ID 생성 (간단한 랜덤 문자열)
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('guestId', guestId)
    router.push('/onboarding')
  }

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현 (3단계)
    alert('카카오 로그인은 준비 중입니다.')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-4 safe-area-top safe-area-bottom">
      {/* 상단: 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/logo1.png"
              alt="Reloop"
              width={120}
              height={120}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-reloop-blue mb-4">Reloop</h1>
          <p className="text-reloop-blue text-base font-medium">
            "We don't stop — we reloop."
          </p>
        </div>
      </div>

      {/* 하단: 로그인 버튼 영역 */}
      <div className="flex-shrink-0 pb-8 space-y-3">
        <button
          onClick={handleKakaoLogin}
          className="w-full min-h-[48px] bg-[#FEE500] text-black font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-[#FEE500]/90 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span>카카오 로그인</span>
        </button>

        <button
          onClick={handleGuestLogin}
          className="w-full min-h-[48px] bg-white text-black font-semibold rounded-lg border border-black hover:bg-gray-100 transition-colors"
        >
          게스트로 시작하기
        </button>
      </div>
    </div>
  )
}
