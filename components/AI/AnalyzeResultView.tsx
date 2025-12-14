'use client'

import { MockAnalyzeResult } from '@/lib/ai/mockAnalyze'

interface AnalyzeResultViewProps {
  result: MockAnalyzeResult
  onSaveToFailure?: () => void
  onSaveAsNew?: () => void
  hasFailureId: boolean
}

export default function AnalyzeResultView({
  result,
  onSaveToFailure,
  onSaveAsNew,
  hasFailureId,
}: AnalyzeResultViewProps) {
  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📋</span>
          <h3 className="text-lg font-semibold text-white">요약</h3>
        </div>
        <p className="text-sm text-[#B3B3B3] leading-relaxed">{result.summary}</p>
      </div>

      {/* 근본 원인 카드 */}
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🔍</span>
          <h3 className="text-lg font-semibold text-white">근본 원인</h3>
        </div>
        <ul className="space-y-2">
          {result.rootCause.map((cause, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-reloop-blue mt-1">•</span>
              <span className="text-sm text-[#B3B3B3] flex-1">{cause}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 배운 점 카드 */}
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <h3 className="text-lg font-semibold text-white">배운 점</h3>
        </div>
        <ul className="space-y-2">
          {result.learnings.map((learning, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-reloop-blue mt-1">•</span>
              <span className="text-sm text-[#B3B3B3] flex-1">{learning}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 다음 행동 카드 */}
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🚀</span>
          <h3 className="text-lg font-semibold text-white">다음 행동</h3>
        </div>
        <ul className="space-y-2">
          {result.nextActions.map((action, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-reloop-blue mt-1">•</span>
              <span className="text-sm text-[#B3B3B3] flex-1">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 저장 버튼 */}
      <div className="pt-4">
        {hasFailureId ? (
          <button
            onClick={onSaveToFailure}
            className="w-full min-h-[48px] bg-reloop-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            기록에 저장하기
          </button>
        ) : (
          <button
            onClick={onSaveAsNew}
            className="w-full min-h-[48px] bg-reloop-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            새 기록으로 저장하기
          </button>
        )}
      </div>
    </div>
  )
}

