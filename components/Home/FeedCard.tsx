'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FeedItem } from '@/lib/feed/buildFeed'
import { getCategoryLabel } from '@/lib/constants/categories'
import { getEmotionLabel } from '@/lib/constants/emotions'

const AVATAR_IMAGES: { [key: string]: string } = {
  avatar1: '/images/프로필 1.png',
  avatar2: '/images/프로필 2.png',
  avatar3: '/images/프로필3.png',
  avatar4: '/images/프로필 4.png',
  avatar5: '/images/프로필 5.png',
  avatar6: '/images/프로필 6.png',
}

interface FeedCardProps {
  item: FeedItem
}

export default function FeedCard({ item }: FeedCardProps) {
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

  const avatarImage = item.avatarId ? AVATAR_IMAGES[item.avatarId] : null

  return (
    <Link href={`/failures/${item.id}`}>
      <article className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg overflow-hidden mb-4 active:bg-[#252525] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarImage ? (
                <Image
                  src={avatarImage}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {item.authorName || 'Anonymous'}
              </p>
              <p className="text-xs text-[#777777]">{formatDate(item.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.category && (
              <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                {getCategoryLabel(item.category)}
              </span>
            )}
            {/* Follow 버튼 (UI만, 자기 자신이면 숨김) */}
            {item.authorName !== 'Anonymous' && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // TODO: 팔로우 기능 구현
                }}
                className="text-xs px-3 py-1.5 bg-reloop-blue text-white rounded-full font-medium hover:bg-blue-600 transition-colors min-h-[32px]"
              >
                팔로우
              </button>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="w-full aspect-video bg-gradient-to-br from-reloop-blue/20 to-reloop-blue/5 flex items-center justify-center">
          <span className="text-reloop-blue/30 text-5xl">📝</span>
        </div>

        {/* Content */}
        <div className="p-4 pt-3">
          <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-[#B3B3B3] mb-3 line-clamp-2">
            {item.summary}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {item.category && (
              <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                {getCategoryLabel(item.category)}
              </span>
            )}
            {item.emotion && (
              <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                {getEmotionLabel(item.emotion)}
              </span>
            )}
            {item.aiStatus === 'done' && (
              <span className="text-xs px-2 py-1 bg-reloop-blue/20 text-reloop-blue rounded-full">
                AI 분석 완료
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-3 border-t border-[#2A2A2A]">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: 좋아요 기능 구현
              }}
              className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{item.likesCount || 0}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: 댓글 기능 구현
              }}
              className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{item.commentsCount || 0}</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}





