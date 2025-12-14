'use client'

export default function AnalyzeProgress() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6">
        <div className="w-16 h-16 border-4 border-reloop-blue border-t-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        AI가 분석 중이에요
      </h2>
      <p className="text-sm text-[#B3B3B3] text-center max-w-xs">
        입력하신 내용을 바탕으로<br />
        근본 원인과 개선 방안을 찾고 있어요
      </p>
    </div>
  )
}





