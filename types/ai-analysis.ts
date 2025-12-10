/**
 * AI 파일 분석 관련 타입 정의
 */

export interface AnalysisSection {
  title: string
  content: string
}

export interface FileAnalysisResult {
  sections: AnalysisSection[]
  tags: string[]
  rawTextLength: number
}

export interface AnalyzeFileRequest {
  description?: string
  emotionTag?: string
}

export interface AnalyzeFileResponse {
  success: boolean
  data?: FileAnalysisResult
  error?: string
}

export interface ChatWithFileRequest {
  message: string
  analysisSummary: string
  tags: string[]
}

export interface ChatWithFileResponse {
  reply: string
}



