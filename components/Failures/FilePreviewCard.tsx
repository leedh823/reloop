'use client'

interface FilePreviewCardProps {
  preview: {
    bullets: string[]
    possibleIssues: string[]
  }
  onRemove?: () => void
}

export default function FilePreviewCard({ preview, onRemove }: FilePreviewCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <h3 className="text-lg font-semibold text-white">파일에서 정리된 내용</h3>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-[#777777] hover:text-white transition-colors min-h-[44px] px-2"
          >
            삭제
          </button>
        )}
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {/* 주요 내용 */}
        {preview.bullets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">• 주요 내용</h4>
            <ul className="space-y-1.5">
              {preview.bullets.map((bullet, index) => (
                <li key={index} className="text-sm text-white leading-relaxed pl-4">
                  - {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 문제로 보이는 부분 */}
        {preview.possibleIssues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">• 문제로 보이는 부분</h4>
            <ul className="space-y-1.5">
              {preview.possibleIssues.map((issue, index) => (
                <li key={index} className="text-sm text-white leading-relaxed pl-4">
                  - {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {preview.bullets.length === 0 && preview.possibleIssues.length === 0 && (
          <p className="text-sm text-[#777777]">파일에서 구조화된 내용을 추출할 수 없습니다.</p>
        )}
      </div>
    </div>
  )
}






