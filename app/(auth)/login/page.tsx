'use client'

import { useRouter } from 'next/navigation'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'

export default function LoginPage() {
  const router = useRouter()

  const handleGuestLogin = () => {
    // 게스트 ID 생성 (간단한 랜덤 문자열)
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('guestId', guestId)
    router.push('/home')
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
      <div className="max-w-md w-full space-y-6">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-reloop-blue mb-2">Reloop</h1>
          <p className="text-[#B3B3B3] text-sm">실패를 기록하고 다시 도전하세요</p>
        </div>

        {/* 로그인 옵션 */}
        <div className="space-y-3">
          <PrimaryButton
            onClick={handleGuestLogin}
            fullWidth
            rounded="lg"
            className="min-h-[44px]"
          >
            게스트로 시작하기
          </PrimaryButton>

          <SecondaryButton
            onClick={handleKakaoLogin}
            fullWidth
            rounded="lg"
            className="min-h-[44px] bg-[#FEE500] text-black hover:bg-[#FEE500]/90 border-0"
          >
            카카오로 시작하기
          </SecondaryButton>

          <SecondaryButton
            onClick={handleGoogleLogin}
            fullWidth
            rounded="lg"
            className="min-h-[44px] bg-white text-black hover:bg-gray-100 border-0"
          >
            구글로 시작하기
          </SecondaryButton>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-[#777777] mt-8">
          게스트 모드로 시작하면 로그인 없이<br />
          바로 실패 기록을 시작할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

