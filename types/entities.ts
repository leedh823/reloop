/**
 * 도메인 엔티티 타입 정의
 */

import { ChatMessage } from './chat'

// Failure 엔티티
export interface Failure {
  id: string
  title: string
  summary: string
  content: string
  category: string
  emotionTag: string
  thumbnailUrl?: string
  pdfUrl?: string
  author?: string
  authorId?: string
  createdAt: Date
  updatedAt?: Date
  hasAiReview?: boolean
  hasDiscordThread?: boolean
  discordThreadUrl?: string
}

// User 엔티티 (향후 확장용)
export interface User {
  id: string
  nickname: string
  avatarUrl?: string
  bio?: string
  email?: string
  joinedAt: Date
  discordUserId?: string
}

// Category 엔티티
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

// EmotionTag 엔티티
export interface EmotionTag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

// AI Session (향후 확장용)
export interface AiSession {
  id: string
  failureId: string
  userId?: string
  messages: ChatMessage[]
  summary?: string
  createdAt: Date
  updatedAt: Date
}

