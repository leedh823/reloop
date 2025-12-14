'use client'

import AppShell from '@/components/Layout/AppShell'
import Link from 'next/link'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'

export default function MePage() {
  const handleLogout = () => {
    localStorage.removeItem('guestId')
    localStorage.removeItem('onboardingCompleted')
    window.location.href = '/onboarding'
  }

  return (
    <AppShell title="나">
      <div className="px-4 py-4 space-y-4">
        {/* Placeholder Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">프로필 화면</h2>
          <p className="text-[#B3B3B3] text-sm">
            사용자 정보와 설정이 여기에 표시됩니다.
          </p>
          <p className="text-xs text-[#777777]">
            (3단계: 디자인 시스템 적용 예정)
          </p>
        </div>

        {/* CTA 버튼 (다음 단계에서 구현) */}
        <div className="space-y-2">
          <Link href="/compose">
            <PrimaryButton fullWidth className="min-h-[44px]">
              실패 작성하기
            </PrimaryButton>
          </Link>
          <SecondaryButton 
            fullWidth 
            className="min-h-[44px]"
            onClick={handleLogout}
          >
            로그아웃
          </SecondaryButton>
        </div>
      </div>
    </AppShell>
  )
}

