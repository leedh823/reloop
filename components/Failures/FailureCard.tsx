'use client'

import Link from 'next/link'
import { Failure } from '@/types/failure'
import { getCategoryLabel } from '@/lib/constants/categories'
import { getEmotionLabel } from '@/lib/constants/emotions'

interface FailureCardProps {
  failure: Failure
}

export default function FailureCard({ failure }: FailureCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '오늘'
    } else if (days === 1) {
      return '어제'
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <Link href={`/failures/${failure.id}`}>
      <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-4 mb-3 active:bg-[#252525] transition-colors min-h-[120px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-white flex-1 line-clamp-2 pr-2">
            {failure.title}
          </h3>
          {failure.aiStatus === 'done' && (
            <span className="text-xs text-reloop-blue flex-shrink-0">✓</span>
          )}
        </div>

        <p className="text-sm text-[#B3B3B3] line-clamp-2 mb-3">
          {failure.summary}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {failure.category && (
              <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                {getCategoryLabel(failure.category)}
              </span>
            )}
            {failure.emotion && (
              <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                {getEmotionLabel(failure.emotion)}
              </span>
            )}
          </div>
          <span className="text-xs text-[#777777]">
            {formatDate(failure.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
