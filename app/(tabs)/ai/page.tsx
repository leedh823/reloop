'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'

export const dynamic = 'force-dynamic'

function AIPageContent() {
  const searchParams = useSearchParams()
  const failureId = searchParams.get('failureId')

  return (
    <AppShell title="AI 분석">
      <div className="px-4 py-4 space-y-4">
        {/* Placeholder Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">AI 분석 화면</h2>
          {failureId && (
            <p className="text-[#B3B3B3] text-sm">
              분석 대상 실패 ID: {failureId}
            </p>
          )}
          <p className="text-[#B3B3B3] text-sm">
            실패 기록을 AI에게 전달하고 분석 결과를 받습니다.
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
              // TODO: AI 분석 API 호출
              alert('AI 분석 기능은 다음 단계에서 구현됩니다.')
            }}
          >
            분석 요청하기
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  )
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <AppShell title="AI 분석">
        <div className="px-4 py-4">
          <p className="text-[#B3B3B3]">로딩 중...</p>
        </div>
      </AppShell>
    }>
      <AIPageContent />
    </Suspense>
  )
}

