'use client'

import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'

export const dynamic = 'force-dynamic'

export default function FailureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  return (
    <AppShell 
      title="실패 상세"
      rightAction={
        <button
          onClick={() => router.push('/ai')}
          className="text-reloop-blue text-sm font-medium min-h-[44px] px-2"
        >
          AI 분석
        </button>
      }
    >
      <div className="px-4 py-4 space-y-4">
        {/* Placeholder Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">실패 상세 화면</h2>
          <p className="text-[#B3B3B3] text-sm">
            실패 ID: {id}
          </p>
          <p className="text-[#B3B3B3] text-sm">
            실패의 상세 내용과 AI 분석 결과가 여기에 표시됩니다.
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
            onClick={() => router.push(`/ai?failureId=${id}`)}
          >
            AI 분석하기
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  )
}

