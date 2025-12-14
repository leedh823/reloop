/**
 * 실패(Failure) 타입 정의
 * localStorage 기반 저장을 위한 최소한의 타입
 */

export interface Failure {
  id: string
  title: string
  summary: string
  detail?: string
  category?: string
  emotion?: string
  createdAt: string // ISO string
  aiStatus?: 'none' | 'done'
  pdfUrl?: string
  filePreview?: {
    bullets: string[]
    possibleIssues: string[]
  }
  aiResult?: {
    aiSummary?: string
    aiRootCause?: string
    aiLearnings?: string
    aiNextActions?: string
  }
}
