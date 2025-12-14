'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import BottomSheet from '@/components/UI/BottomSheet'

interface FailureDetailHeaderProps {
  onEdit: () => void
  onDelete: () => void
  onComment?: () => void
}

export default function FailureDetailHeader({ onEdit, onDelete }: FailureDetailHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between px-4 h-14 bg-black border-b border-[#2A2A2A] safe-area-top z-10 flex-shrink-0">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="p-2 min-h-[44px] min-w-[44px] text-white"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 메뉴 버튼 */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 min-h-[44px] min-w-[44px] text-white"
          aria-label="메뉴"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* 메뉴 바텀시트 */}
      <BottomSheet
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              setIsMenuOpen(false)
              onEdit()
            }}
            className="w-full text-left px-4 py-3 min-h-[48px] bg-[#2A2A2A] rounded-lg text-white hover:bg-[#333333] transition-colors"
          >
            편집
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false)
              onDelete()
            }}
            className="w-full text-left px-4 py-3 min-h-[48px] bg-[#2A2A2A] rounded-lg text-red-400 hover:bg-[#333333] transition-colors"
          >
            삭제
          </button>
        </div>
      </BottomSheet>
    </>
  )
}

