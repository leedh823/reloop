/**
 * API 호출을 위한 유틸리티 함수
 * 개발 환경에서 호스트 URL을 설정할 수 있도록 지원
 */

/**
 * API Base URL을 반환합니다.
 * - 환경 변수 NEXT_PUBLIC_API_HOST가 설정되어 있으면 사용
 * - 로컬 스토리지에 apiHost가 저장되어 있으면 사용
 * - 그 외에는 상대 경로 사용 (현재 도메인)
 */
export function getApiBaseUrl(): string {
  // 환경 변수에서 호스트 URL 가져오기
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    const envHost = process.env.NEXT_PUBLIC_API_HOST
    const storedHost = localStorage.getItem('apiHost')
    
    if (envHost) {
      return envHost.replace(/\/$/, '') // 마지막 슬래시 제거
    }
    
    if (storedHost) {
      return storedHost.replace(/\/$/, '') // 마지막 슬래시 제거
    }
  }
  
  // 서버 사이드 또는 기본값
  const envHost = process.env.NEXT_PUBLIC_API_HOST
  if (envHost) {
    return envHost.replace(/\/$/, '')
  }
  
  // 기본값: 상대 경로 (현재 도메인 사용)
  return ''
}

/**
 * API 엔드포인트 URL을 생성합니다.
 * @param endpoint API 엔드포인트 (예: '/api/ai/analyze-file')
 * @returns 전체 URL 또는 상대 경로
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  if (baseUrl) {
    return `${baseUrl}${cleanEndpoint}`
  }
  
  return cleanEndpoint
}

/**
 * 호스트 URL을 로컬 스토리지에 저장합니다.
 * @param hostUrl 호스트 URL (예: 'https://reloop-beta.vercel.app')
 */
export function setApiHost(hostUrl: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = hostUrl.replace(/\/$/, '')
    localStorage.setItem('apiHost', cleanUrl)
    console.log('API 호스트가 설정되었습니다:', cleanUrl)
  }
}

/**
 * 저장된 호스트 URL을 가져옵니다.
 */
export function getStoredApiHost(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('apiHost')
  }
  return null
}

/**
 * 저장된 호스트 URL을 삭제합니다.
 */
export function clearApiHost(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apiHost')
    console.log('API 호스트 설정이 초기화되었습니다.')
  }
}


