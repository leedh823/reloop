/**
 * 파일 업로드 관련 상수
 * 
 * 참고: Vercel의 요청 크기 제한은 4.5MB입니다.
 * 따라서 실제로는 4MB 이하의 파일만 업로드 가능합니다.
 */

// PDF 파일 최대 크기: 4MB (Vercel 제한 고려)
export const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024
export const MAX_PDF_SIZE_MB = 4

// 기타 파일 최대 크기: 4MB (Vercel 제한 고려)
export const MAX_OTHER_FILE_SIZE_BYTES = 4 * 1024 * 1024
export const MAX_OTHER_FILE_SIZE_MB = 4

// 텍스트 분석 최대 길이
export const MAX_TEXT_LENGTH = 10000



