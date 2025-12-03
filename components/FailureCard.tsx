import Link from 'next/link'
import Image from 'next/image'
import { Failure } from '@/types'

interface FailureCardProps {
  failure: Failure
  discordThreadUrl?: string
}

export default function FailureCard({ failure, discordThreadUrl = '#' }: FailureCardProps) {
  const categoryMap: Record<string, string> = {
    'job': '취업',
    'school': '학교',
    'side-project': '사이드프로젝트',
    'relationship': '관계',
    'business': '비즈니스',
    'other': '기타',
  }

  const emotionMap: Record<string, string> = {
    'anxiety': '불안',
    'frustration': '좌절',
    'regret': '후회',
    'relief': '안도',
    'growth': '성장',
  }

  const categoryLabel = categoryMap[failure.category] || failure.category
  const emotionLabel = emotionMap[failure.emotionTag] || failure.emotionTag

  return (
    <Link
      href={`/failures/${failure.id}`}
      className="group bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden hover:border-reloop-blue/50 transition-all duration-200 hover:shadow-lg hover:shadow-reloop-blue/10"
    >
      {/* 썸네일 이미지 */}
      <div className="relative w-full aspect-video bg-[#0f0f0f] overflow-hidden">
        {failure.thumbnailUrl ? (
          <Image
            src={failure.thumbnailUrl}
            alt={failure.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-reloop-blue/20 to-reloop-blue/5 flex items-center justify-center">
            <span className="text-reloop-blue/30 text-5xl">📝</span>
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="p-4 space-y-3">
        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-reloop-blue/20 text-reloop-blue text-xs rounded-full font-medium">
            {categoryLabel}
          </span>
          <span className="px-2 py-1 bg-reloop-gold/20 text-reloop-gold text-xs rounded-full font-medium">
            {emotionLabel}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-white font-bold text-base line-clamp-2 group-hover:text-reloop-blue transition-colors">
          {failure.title}
        </h3>

        {/* 요약 */}
        <p className="text-gray-400 text-sm line-clamp-2">
          {failure.summary}
        </p>

        {/* 메타 영역 */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{failure.author || '익명'}</span>
            <span>•</span>
            <span>
              {new Date(failure.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {failure.hasAiReview && (
              <div className="flex items-center gap-1 text-xs text-reloop-blue">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>AI</span>
              </div>
            )}
            {failure.hasDiscordThread && (
              <a
                href={discordThreadUrl}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-reloop-blue hover:text-reloop-blue/80"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Discord</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

