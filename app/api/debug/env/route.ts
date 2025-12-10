import { NextRequest, NextResponse } from 'next/server'

/**
 * 환경 변수 디버깅용 엔드포인트 (개발/디버깅 전용)
 * 프로덕션에서는 제거하거나 보안을 강화해야 합니다.
 */
export async function GET(request: NextRequest) {
  // 보안: 특정 조건에서만 허용 (예: 특정 헤더 또는 쿼리 파라미터)
  const apiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
    apiKeyEndsWith: apiKey ? `...${apiKey.substring(apiKey.length - 4)}` : 'undefined',
    // 실제 키 값은 반환하지 않음 (보안)
  })
}

