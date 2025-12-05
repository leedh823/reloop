'use client'

import { FileAnalysisResult } from '@/types'

interface AnalysisResultPanelProps {
  result: FileAnalysisResult
  onReanalyze?: () => void
}

export default function AnalysisResultPanel({
  result,
  onReanalyze,
}: AnalysisResultPanelProps) {
  return (
    <div className="space-y-6">
      {/* 분석 카드들 */}
      <div className="space-y-4">
        {result.sections.map((section, index) => (
          <div
            key={index}
            className="bg-[#181818] border border-[#2a2a2a] rounded-lg p-4"
          >
            <h3 className="text-white font-bold text-lg mb-2">{section.title}</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {section.content || '분석 중...'}
            </p>
          </div>
        ))}
      </div>

      {/* 키워드 태그 */}
      {result.tags.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">키워드 태그</h3>
          <div className="flex flex-wrap gap-2">
            {result.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-reloop-blue/20 text-reloop-blue text-sm rounded-full border border-reloop-blue/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="text-xs text-gray-500 pt-4 border-t border-[#2a2a2a]">
        분석된 텍스트 길이: {result.rawTextLength.toLocaleString()}자
      </div>

      {/* 분석 다시 하기 버튼 */}
      {onReanalyze && (
        <button
          onClick={onReanalyze}
          className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 text-gray-300 rounded-lg hover:bg-[#111] transition-colors"
        >
          분석 다시 하기
        </button>
      )}
    </div>
  )
}

