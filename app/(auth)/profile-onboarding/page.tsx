'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PrimaryButton } from '@/components/UI/Button'
import { getProfile, saveProfile } from '@/lib/storage/profile'
import StepNameGender from '@/components/profile/steps/StepNameGender'
import StepAvatar from '@/components/profile/steps/StepAvatar'
import StepBio from '@/components/profile/steps/StepBio'

const TOTAL_STEPS = 3

function ProfileOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === '1'

  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    gender: 'none' as 'male' | 'female' | 'none',
    avatarId: '',
    bio: '',
  })

  // 편집 모드: 기존 프로필 로드
  useEffect(() => {
    if (isEditMode) {
      const existing = getProfile()
      if (existing) {
        setProfile({
          name: existing.name,
          gender: existing.gender,
          avatarId: existing.avatarId,
          bio: existing.bio,
        })
      }
    }
  }, [isEditMode])

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 1 검증
      if (profile.name.length < 2 || profile.name.length > 8) {
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Step 2 검증
      if (!profile.avatarId) {
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Step 3 완료
      saveProfile({
        ...profile,
        completed: true,
      })
      router.push('/me')
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return profile.name.length >= 2 && profile.name.length <= 8
    } else if (currentStep === 2) {
      return !!profile.avatarId
    } else if (currentStep === 3) {
      return true // bio는 선택사항
    }
    return false
  }

  useEffect(() => {
    // 상태바 색상 설정 (흰 배경)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#FFFFFF')
    }
  }, [])

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      {/* Progress Bar */}
      <div className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900">
            {isEditMode ? '프로필 수정' : '프로필 설정'}
          </h1>
          {isEditMode && (
            <button
              onClick={() => router.back()}
              className="text-gray-500 text-sm font-medium min-h-[44px] px-2"
            >
              취소
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index + 1 <= currentStep
                  ? 'bg-reloop-blue'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {currentStep === 1 && (
          <StepNameGender
            name={profile.name}
            gender={profile.gender}
            onNameChange={(name) => setProfile((prev) => ({ ...prev, name }))}
            onGenderChange={(gender) => setProfile((prev) => ({ ...prev, gender }))}
          />
        )}

        {currentStep === 2 && (
          <StepAvatar
            selectedAvatarId={profile.avatarId}
            onAvatarSelect={(avatarId) => setProfile((prev) => ({ ...prev, avatarId }))}
          />
        )}

        {currentStep === 3 && (
          <StepBio
            bio={profile.bio}
            onBioChange={(bio) => setProfile((prev) => ({ ...prev, bio }))}
          />
        )}
      </main>

      {/* Footer CTA */}
      <footer className="flex-shrink-0 px-4 pb-6 pt-4 safe-area-bottom border-t border-gray-200">
        <PrimaryButton
          onClick={handleNext}
          fullWidth
          rounded="lg"
          className="h-12 min-h-[48px] text-base font-semibold"
          disabled={!canProceed()}
        >
          {currentStep === TOTAL_STEPS ? '완료' : '다음'}
        </PrimaryButton>
      </footer>
    </div>
  )
}

export default function ProfileOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-white flex items-center justify-center safe-area-top safe-area-bottom">
        <span className="text-gray-500">로딩 중...</span>
      </div>
    }>
      <ProfileOnboardingContent />
    </Suspense>
  )
}
