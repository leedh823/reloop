'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PrimaryButton } from '@/components/UI/Button'

interface OnboardingStep {
  title: string
  description: string
  image: string // 이미지 경로
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '실패는 멈춤이 아니에요',
    description: '누구나 넘어질 수 있어요.\n중요한 건 다시 시작할 수 있다는 것.',
    image: '/images/onboading 1.png',
  },
  {
    title: '실패를 나누면, 혼자가 아니게 돼요',
    description: '같은 경험을 한 사람들의 공감과 조언이 힘이 돼요.',
    image: '/images/onboading 2.png',
  },
  {
    title: '실패를 나누면, 혼자가 아니게 돼요',
    description: '같은 경험을 한 사람들의 공감과 조언이 힘이 돼요.',
    image: '/images/onboading 3.png',
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
      // 로그인 페이지로 이동
      router.push('/login')
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    // 로그인 페이지로 이동
    router.push('/login')
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const showSkip = currentStep > 0 // 2, 3번째 스텝에만 건너뛰기 표시

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      {/* 상단: 로고 + Progress Dots + 건너뛰기 */}
      <header className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          {/* 로고 */}
          <div className="flex items-center">
            <Image
              src="/images/logo2.png"
              alt="Reloop"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* 건너뛰기 버튼 (2, 3번째 스텝에만) */}
          {showSkip && (
            <button
              onClick={handleSkip}
              className="text-gray-500 text-sm font-medium"
            >
              건너뛰기
            </button>
          )}
        </div>

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
      </header>

      {/* 중앙: 일러스트레이션 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 overflow-hidden bg-white">
        <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-8">
          {/* 이미지 영역 */}
          <div 
            key={`image-${currentStep}`}
            className="flex items-center justify-center w-full aspect-square max-w-[280px] animate-fade-in"
          >
            <Image
              src={currentStepData.image}
              alt={currentStepData.title}
              width={280}
              height={280}
              className="w-full h-full object-contain"
              priority={currentStep === 0}
            />
          </div>

          {/* 텍스트 영역 - 이미지 아래 */}
          <div 
            key={`text-${currentStep}`}
            className="w-full space-y-3 text-center animate-fade-in"
          >
            <h1 className="text-2xl font-bold text-reloop-blue leading-tight">
              {currentStepData.title}
            </h1>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {currentStepData.description}
            </p>
          </div>
        </div>
      </main>

      {/* 하단: CTA 버튼 */}
      <footer className="flex-shrink-0 px-4 pb-6 pt-2 safe-area-bottom">
        <PrimaryButton
          onClick={handleNext}
          fullWidth
          rounded="lg"
          className="h-12 min-h-[48px] text-base font-semibold"
        >
          {isLastStep ? '시작하기' : '다음'}
        </PrimaryButton>
      </footer>
    </div>
  )
}
