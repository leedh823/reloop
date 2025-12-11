'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage, EmotionReflectRequest } from '@/types'
import { formatTime } from '@/lib/utils/formatters'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  failureSummary?: string
  emotionTag?: string
}

export default function ChatPanel({
  isOpen,
  onClose,
  failureSummary,
  emotionTag,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      // 초기 환영 메시지
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: '안녕하세요! 지금 느끼는 감정을 정리해보고, 실패 속에서 무엇을 배울 수 있을지 같이 생각해봐요. 어떤 감정이 드시나요?',
          createdAt: new Date().toISOString(),
        }
        setMessages([welcomeMessage])
      }
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      createdAt: new Date().toISOString(),
    }

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const requestBody: EmotionReflectRequest = {
        message: userMessage.content,
        failureSummary,
        emotionTag,
      }

      const response = await fetch('/api/ai/emotion-reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API 요청 실패:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        let errorMsg = '지금은 연결이 조금 불안정해요. 잠시 후 다시 시도해볼까요?'
        
        if (response.status === 403) {
          errorMsg = errorData?.error || 'OpenAI API 접근이 거부되었습니다. 관리자에게 문의해주세요.'
        } else if (response.status === 401) {
          errorMsg = 'OpenAI API 인증에 실패했습니다. 관리자에게 문의해주세요.'
        } else if (errorData?.error) {
          errorMsg = errorData.error
        }
        
        throw new Error(errorMsg)
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error?.message || '지금은 연결이 조금 불안정해요. 잠시 후 다시 시도해볼까요?',
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

  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* 사이드 패널 */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-reloop-blue to-blue-500 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">감정 리루프 AI</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/90 mb-2">
            지금 느끼는 감정을 정리해보고, 실패 속에서 무엇을 배울 수 있을지 같이 생각해봐요.
          </p>
          <p className="text-xs text-white/70">
            전문 상담이 아니며, 심각한 위기 상황에서는 전문가에게 도움을 요청해야 합니다.
          </p>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-reloop-blue text-white'
                    : 'bg-gray-200 text-gray-800'
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
              <div className="bg-gray-200 text-gray-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
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

