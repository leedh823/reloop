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

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 구현 (3단계)
    alert('구글 로그인은 준비 중입니다.')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full space-y-12">
        {/* 로고 영역 - 상단 중앙 */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/logo1.png"
              alt="Reloop"
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
              priority
            />
          </div>
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

        {/* 로그인 버튼 영역 - 하단 고정 */}
        <div className="space-y-3 pb-8">
          <button
            onClick={handleKakaoLogin}
            className="w-full min-h-[48px] bg-[#FEE500] text-black font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-[#FEE500]/90 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span>카카오 로그인</span>
          </button>

          <button
            onClick={handleGuestLogin}
            className="w-full min-h-[48px] bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            게스트로 시작하기
          </button>

          <button
            onClick={handleGoogleLogin}
            className="w-full min-h-[48px] bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            구글로 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
