'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage, FileAnalysisResult } from '@/types'
import { formatTime } from '@/lib/utils/formatters'

interface FileChatPanelProps {
  analysisResult: FileAnalysisResult
  isOpen: boolean
  onClose: () => void
}

export default function FileChatPanel({
  analysisResult,
  isOpen,
  onClose,
}: FileChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 분석 요약 텍스트 생성
  const analysisSummary = analysisResult.sections
    .map((s) => `${s.title}: ${s.content}`)
    .join('\n\n')

  // 초기 메시지 설정
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content:
          '파일 내용을 기반으로 이런 감정들이 느껴졌을 것 같아요. 지금 제일 마음에 남는 부분이 어떤 건가요?',
        createdAt: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat-with-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          analysisSummary,
          tags: analysisResult.tags,
        }),
      })

      if (!response.ok) {
        throw new Error('API 요청 실패')
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '지금은 연결이 불안정해요. 잠시 후 다시 시도해볼까요?',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 채팅 패널 - 데스크탑: 인라인, 모바일: 오버레이 */}
      <div className={`${
        isOpen ? 'block' : 'hidden lg:block'
      } fixed lg:relative right-0 top-0 h-full lg:h-auto w-full lg:w-full max-w-[420px] lg:max-w-none bg-[#111] shadow-2xl lg:shadow-none z-50 lg:z-auto flex flex-col lg:rounded-xl lg:border lg:border-[#2a2a2a]`}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-reloop-blue to-blue-500 text-white p-6 lg:rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">파일 기반 AI 채팅</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors lg:hidden"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/90">
            업로드한 파일 내용을 바탕으로 감정을 정리해봐요.
          </p>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] lg:bg-[#111]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-reloop-blue text-white'
                    : 'bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a]'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {/* 로딩 버블 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] text-gray-200 rounded-2xl px-4 py-3 border border-[#2a2a2a]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-[#2a2a2a] p-4 bg-[#111] lg:rounded-b-xl">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg resize-none text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-reloop-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

