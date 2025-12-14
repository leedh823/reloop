'use client'

import { useState } from 'react'
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
    title: '실패는 멈춤이 아니에요',
    description: '누구나 넘어질 수 있어요.\n중요한 건 다시 시작할 수 있다는 것.',
    imagePlaceholder: '일러스트레이션 1',
  },
  {
    title: '실패는 정리되지 않으면 남아요',
    description: '감정과 경험이 섞인 채로\n그냥 흘려보내지 마세요.',
    imagePlaceholder: '일러스트레이션 2',
  },
  {
    title: 'Reloop은 실패를 정리해줘요',
    description: '기록하고, AI로 구조화하고,\n다시 시도할 수 있게 돕습니다.',
    imagePlaceholder: '일러스트레이션 3',
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
      router.push('/home')
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      {/* 상단: 로고 + Progress Dots */}
      <header className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Reloop"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
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
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 중앙: 일러스트레이션 이미지 (큰 영역) */}
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
            <h1 className="text-2xl font-bold text-black leading-tight">
              {currentStepData.title}
            </h1>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {currentStepData.description}
            </p>
          </div>
        </div>
      </main>

      {/* 하단: 고정 CTA 버튼 */}
      <footer className="flex-shrink-0 px-4 pb-8 safe-area-bottom">
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
