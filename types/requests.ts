/**
 * API 요청/응답 타입 정의
 */

import { Failure } from './entities'

// 실패 생성 요청
export interface CreateFailureRequest {
  title: string
  summary: string
  content: string
  emotionTag: string
  category: string
  pdfUrl?: string
  thumbnailUrl?: string
  author?: string
}

// AI 감정 반영 요청
export interface EmotionReflectRequest {
  message: string
  failureSummary?: string
  emotionTag?: string
}

// AI 감정 반영 응답
export interface EmotionReflectResponse {
  reply: string
}

