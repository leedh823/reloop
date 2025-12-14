'use client'

import { useRouter } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'

export default function ComposePage() {
  const router = useRouter()

  return (
    <AppShell 
      title="실패 작성"
      rightAction={
        <button
          onClick={() => router.back()}
          className="text-[#B3B3B3] text-sm min-h-[44px] px-2"
        >
          취소
        </button>
      }
    >
      <div className="px-4 py-4 space-y-4">
        {/* Placeholder Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">실패 작성 화면</h2>
          <p className="text-[#B3B3B3] text-sm">
            단계별 폼으로 실패 경험을 기록합니다.
          </p>
          <p className="text-xs text-[#777777]">
            (3단계: 디자인 시스템 적용 예정)
          </p>
        </div>

        {/* CTA 버튼 (다음 단계에서 구현) */}
        <div className="space-y-2">
          <PrimaryButton 
            fullWidth 
            className="min-h-[44px]"
            onClick={() => {
              // TODO: 실패 저장 API 호출
              alert('실패 작성 기능은 다음 단계에서 구현됩니다.')
            }}
          >
            저장하기
          </PrimaryButton>
          <SecondaryButton 
            fullWidth 
            className="min-h-[44px]"
            onClick={() => router.back()}
          >
            취소
          </SecondaryButton>
        </div>
      </div>
    </AppShell>
  )
}

