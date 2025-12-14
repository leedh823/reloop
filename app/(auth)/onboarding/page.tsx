'use client'

import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/UI/Button'

export default function OnboardingPage() {
  const router = useRouter()

  const handleStart = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 로고/브랜딩 */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-reloop-blue">Reloop</h1>
          <p className="text-xl text-white font-semibold">
            실패를 기록하고,<br />
            AI로 구조화해,<br />
            다시 시도하게 돕는 앱
          </p>
        </div>

        {/* 핵심 가치 제안 */}
        <div className="space-y-4 text-[#B3B3B3]">
          <p className="text-base leading-relaxed">
            실패 경험을 기록하고 AI가 분석하여<br />
            다음 도전을 위한 인사이트를 제공합니다.
          </p>
        </div>

        {/* CTA 버튼 */}
        <div className="pt-8">
          <PrimaryButton
            onClick={handleStart}
            fullWidth
            rounded="full"
            className="min-h-[44px]"
          >
            시작하기
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

