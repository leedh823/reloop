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
  fileUrl?: string // 업로드된 파일 URL (단일 이미지용, 하위 호환성)
  fileName?: string // 파일명 (단일 이미지용, 하위 호환성)
  fileType?: string // 파일 타입 (단일 이미지용, 하위 호환성)
  images?: Array<{ // 여러 이미지 지원
    url: string
    fileName: string
    fileType: string
  }>
  aiResult?: {
    aiSummary?: string
    aiRootCause?: string
    aiLearnings?: string
    aiNextActions?: string
  }
}
