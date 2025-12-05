'use client'

import { useState } from 'react'
import ChatPanel from './ChatPanel'

interface EmotionChatLauncherProps {
  failureSummary?: string
  emotionTag?: string
}

export default function EmotionChatLauncher({
  failureSummary,
  emotionTag,
}: EmotionChatLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-reloop-blue text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 z-30 flex items-center gap-2 font-semibold"
        aria-label="감정 리루프 AI 열기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="hidden sm:inline">감정 리루프 AI</span>
      </button>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        failureSummary={failureSummary}
        emotionTag={emotionTag}
      />
    </>
  )
}

