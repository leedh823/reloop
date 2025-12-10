/**
 * AI 채팅 관련 타입 정의
 */

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}



