'use client'

import { Failure } from '@/types/failure'
import { PrimaryButton } from '@/components/UI/Button'
import Link from 'next/link'

interface AISummarySectionProps {
  failure: Failure
}

export default function AISummarySection({ failure }: AISummarySectionProps) {
  const hasAIResult = failure.aiStatus === 'done' && failure.aiResult
  const aiResult = failure.aiResult

  if (!hasAIResult || !aiResult) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl">🤖</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          AI 분석이 아직 없어요
        </h3>
        <p className="text-sm text-[#B3B3B3] mb-6">
          AI로 실패를 분석하고 다음 단계를 찾아보세요.
        </p>
        <Link href={`/ai?failureId=${failure.id}`}>
          <PrimaryButton rounded="lg" className="min-h-[48px] px-8">
            AI로 정리해보기
          </PrimaryButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🤖</span>
          AI 분석 결과
        </h3>
        <span className="text-xs text-reloop-blue bg-reloop-blue/20 px-2 py-1 rounded-full">
          완료
        </span>
      </div>

      {aiResult.aiSummary && (
        <div>
          <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">요약</h4>
          <p className="text-sm text-white leading-relaxed">{aiResult.aiSummary}</p>
        </div>
      )}

      {aiResult.aiRootCause && (
        <div>
          <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">근본 원인</h4>
          <p className="text-sm text-white leading-relaxed">{aiResult.aiRootCause}</p>
        </div>
      )}

      {aiResult.aiLearnings && (
        <div>
          <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">배운 점</h4>
          <p className="text-sm text-white leading-relaxed">{aiResult.aiLearnings}</p>
        </div>
      )}

      {aiResult.aiNextActions && (
        <div>
          <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">다음 행동</h4>
          <p className="text-sm text-white leading-relaxed">{aiResult.aiNextActions}</p>
        </div>
      )}
    </div>
  )
}

