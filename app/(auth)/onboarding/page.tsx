'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/UI/Button'

interface OnboardingStep {
  title: string
  description: string
  image: string // 이모지 또는 이미지 경로
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '실패는 멈춤이 아니에요',
    description: '누구나 넘어질 수 있어요.\n중요한 건 다시 시작할 수 있다는 것.',
    image: '💪',
  },
  {
    title: '실패는 정리되지 않으면 남아요',
    description: '감정과 경험이 섞인 채로\n그냥 흘려보내지 마세요.',
    image: '📝',
  },
  {
    title: 'Reloop은 실패를 정리해줘요',
    description: '기록하고, AI로 구조화하고,\n다시 시도할 수 있게 돕습니다.',
    image: '🤖',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = onboardingSteps.length

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 마지막 step: 시작하기
      localStorage.setItem('onboardingCompleted', 'true')
      router.push('/login')
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      {/* 상단: 로고 + Progress Dots */}
      <header className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-reloop-blue">Reloop</span>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-reloop-blue w-6'
                    : index < currentStep
                    ? 'bg-reloop-blue/50 w-2'
                    : 'bg-[#2A2A2A] w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 중앙: 이미지 + 텍스트 (가변 영역) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* 이미지 영역 */}
          <div className="flex items-center justify-center min-h-[200px]">
            <div 
              key={currentStep}
              className="text-8xl animate-fade-in"
            >
              {currentStepData.image}
            </div>
          </div>

          {/* 텍스트 영역 */}
          <div 
            key={`text-${currentStep}`}
            className="space-y-4 animate-fade-in"
          >
            <h1 className="text-2xl font-bold text-white leading-tight px-4">
              {currentStepData.title}
            </h1>
            <p className="text-base text-[#B3B3B3] leading-relaxed whitespace-pre-line px-4">
              {currentStepData.description}
            </p>
          </div>
        </div>
      </main>

      {/* 하단: 고정 CTA 버튼 */}
      <footer className="flex-shrink-0 px-4 pb-6 safe-area-bottom">
        <PrimaryButton
          onClick={handleNext}
          fullWidth
          rounded="full"
          className="h-12 min-h-[48px] text-base font-semibold"
        >
          {isLastStep ? '시작하기' : '다음'}
        </PrimaryButton>
      </footer>

    </div>
  )
}
