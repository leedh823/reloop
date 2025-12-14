'use client'

import { useState } from 'react'
import { getProfile } from '@/lib/storage/profile'
import { PrimaryButton } from '@/components/UI/Button'
import Image from 'next/image'

const AVATAR_IMAGES: { [key: string]: string } = {
  avatar1: '/images/프로필 1.png',
  avatar2: '/images/프로필 2.png',
  avatar3: '/images/프로필3.png',
  avatar4: '/images/프로필 4.png',
  avatar5: '/images/프로필 5.png',
  avatar6: '/images/프로필 6.png',
}

interface Comment {
  id: string
  authorName: string
  avatarId?: string
  content: string
  createdAt: string
}

interface CommentDrawerProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  onAddComment: (comment: { authorName: string; avatarId?: string; content: string }) => void
}

export default function CommentDrawer({
  isOpen,
  onClose,
  comments,
  onAddComment,
}: CommentDrawerProps) {
  const [commentText, setCommentText] = useState('')
  const profile = getProfile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    onAddComment({
      authorName: profile?.name || 'Anonymous',
      avatarId: profile?.avatarId,
      content: commentText.trim(),
    })

    setCommentText('')
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 드로어 */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-black border-l border-[#2A2A2A] z-50 flex flex-col safe-area-top safe-area-bottom">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#2A2A2A] flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">댓글</h2>
          <button
            onClick={onClose}
            className="text-[#B3B3B3] text-2xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-6xl mb-4">💬</span>
              <p className="text-[#B3B3B3] text-sm">아직 댓글이 없어요</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  {comment.avatarId && AVATAR_IMAGES[comment.avatarId] ? (
                    <Image
                      src={AVATAR_IMAGES[comment.avatarId]}
                      alt={comment.authorName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{comment.authorName}</span>
                    <span className="text-xs text-[#777777]">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#B3B3B3] leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력 */}
        <div className="border-t border-[#2A2A2A] p-4 flex-shrink-0 safe-area-bottom">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-sm text-white placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent resize-none min-h-[100px]"
              rows={3}
            />
            <PrimaryButton
              type="submit"
              fullWidth
              className="min-h-[48px]"
              disabled={!commentText.trim()}
            >
              댓글 작성
            </PrimaryButton>
          </form>
        </div>
      </div>
    </>
  )
}

