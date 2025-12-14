'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PrimaryButton } from '@/components/UI/Button'

interface OnboardingStep {
  title: string
  description: string
  imagePlaceholder: string // 네모 박스 placeholder 설명
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '공강시간에 원하는 모임 만들기',
    description: '공강이라는 공백, 어떻게 채우고 있나요?\n이제 같은 캠퍼스 친구들과 특별하게 채워보세요.',
    imagePlaceholder: '일러스트레이션 1',
  },
  {
    title: '모임 신청하고 함께 활동하기',
    description: '채우기 탭에서 원하는 모임을 신청하고,\n0이었던 공백을 100으로 알차게 채워보세요!',
    imagePlaceholder: '일러스트레이션 2',
  },
  {
    title: '스페이스에서 모임 멤버와 대화하기',
    description: '공백을 함께 채울 멤버들과 스페이스에서\n대화하며 모임을 준비해보세요!',
    imagePlaceholder: '일러스트레이션 3',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = onboardingSteps.length

  useEffect(() => {
    // 상태바 색상 설정 (흰 배경)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#FFFFFF')
    }
  }, [])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 마지막 step: 시작하기
      localStorage.setItem('onboardingCompleted', 'true')
      router.push('/home')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      {/* 상단: 뒤로가기 + 타이틀 */}
      <header className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 -ml-2"
            aria-label="뒤로가기"
          >
            <span className="text-2xl">←</span>
          </button>
          <h2 className="text-lg font-semibold text-black flex-1">
            {currentStepData.title}
          </h2>
        </div>
      </header>

      {/* 중앙: 일러스트레이션 이미지 + 설명 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 overflow-hidden bg-white">
        <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-8">
          {/* 이미지 영역 - 네모 박스 placeholder */}
          <div 
            key={`image-${currentStep}`}
            className="flex items-center justify-center w-full aspect-square max-w-[320px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg animate-fade-in"
          >
            <span className="text-gray-400 text-sm">{currentStepData.imagePlaceholder}</span>
          </div>

          {/* 텍스트 영역 - 이미지 아래 */}
          <div 
            key={`text-${currentStep}`}
            className="w-full space-y-3 text-center animate-fade-in"
          >
            <p className="text-base text-black leading-relaxed whitespace-pre-line">
              {currentStepData.description}
            </p>
          </div>
        </div>
      </main>

      {/* 하단: Progress Dots + CTA 버튼 */}
      <footer className="flex-shrink-0 px-4 pb-8 safe-area-bottom">
        <div className="space-y-4">
          {/* Progress Dots */}
          <div className="flex items-center justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-reloop-blue w-6'
                    : index < currentStep
                    ? 'bg-reloop-blue/50 w-2'
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* CTA 버튼 */}
          <PrimaryButton
            onClick={handleNext}
            fullWidth
            rounded="lg"
            className="h-12 min-h-[48px] text-base font-semibold"
          >
            {isLastStep ? '시작하기' : '다음'}
          </PrimaryButton>
        </div>
      </footer>
    </div>
  )
}
