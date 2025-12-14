import { NextRequest, NextResponse } from 'next/server'

/**
 * 간단한 테스트 엔드포인트
 * Vercel 함수가 실행되는지 확인
 */
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  console.log('[test-simple] POST 함수 진입:', {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
  })
  
  return NextResponse.json({
    success: true,
    message: '함수가 정상적으로 실행되었습니다.',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    },
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'GET 요청도 정상 작동합니다.',
    timestamp: new Date().toISOString(),
  })
}

