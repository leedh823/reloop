/**
 * 파일 업로드 관련 상수
 * 
 * 참고: Vercel의 요청 크기 제한은 4.5MB입니다.
 * 4MB 이상 파일은 멀티파트 업로드를 통해 Vercel Blob에 직접 업로드합니다.
 */

// PDF 파일 최대 크기: 50MB (멀티파트 업로드 사용)
export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024
export const MAX_PDF_SIZE_MB = 50

// 기타 파일 최대 크기: 50MB (멀티파트 업로드 사용)
export const MAX_OTHER_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const MAX_OTHER_FILE_SIZE_MB = 50

// 직접 업로드 제한 (4MB 이하는 직접 업로드, 이상은 멀티파트)
export const DIRECT_UPLOAD_LIMIT = 4 * 1024 * 1024
export const DIRECT_UPLOAD_LIMIT_MB = 4

// 텍스트 분석 최대 길이
export const MAX_TEXT_LENGTH = 10000



