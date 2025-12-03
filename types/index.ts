export interface Failure {
  id: string;
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  createdAt: Date;
  hasAiReview?: boolean;
  hasDiscordThread?: boolean;
}

export interface CreateFailureRequest {
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  author?: string;
}

// AI 채팅 관련 타입
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface EmotionReflectRequest {
  message: string;
  failureSummary?: string;
  emotionTag?: string;
}

export interface EmotionReflectResponse {
  reply: string;
}

