import { NextRequest, NextResponse } from 'next/server'

/**
 * 환경 변수 테스트 엔드포인트
 * Vercel에서 환경 변수가 제대로 로드되는지 확인
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  
  // 모든 관련 환경 변수 확인
  const envVars = {
    OPENAI_API_KEY: {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      prefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...` : 'undefined',
      endsWith: process.env.OPENAI_API_KEY ? `...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 'undefined',
      startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
      trimmed: process.env.OPENAI_API_KEY?.trim() || null,
      trimmedLength: process.env.OPENAI_API_KEY?.trim()?.length || 0,
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    // 모든 OPENAI 관련 환경 변수
    allOpenAIVars: Object.keys(process.env)
      .filter(k => k.toUpperCase().includes('OPENAI') || k.toUpperCase().includes('API'))
      .map(k => ({
        key: k,
        exists: true,
        length: process.env[k]?.length || 0,
        prefix: process.env[k] ? `${process.env[k]?.substring(0, 10)}...` : 'undefined',
      })),
  }
  
  // 실제 OpenAI API 테스트 (환경 변수가 있을 때만)
  let apiTest: any = null
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      })
      
      apiTest = {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok,
        message: testResponse.ok 
          ? 'OpenAI API 연결 성공 ✅' 
          : `OpenAI API 연결 실패: ${testResponse.status} ${testResponse.statusText}`,
      }
    } catch (error: any) {
      apiTest = {
        error: true,
        message: `OpenAI API 테스트 실패: ${error.message}`,
      }
    }
  } else {
    apiTest = {
      skipped: true,
      message: 'API 키가 없거나 형식이 올바르지 않아 테스트를 건너뜁니다.',
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
    },
    envVars,
    apiTest,
    recommendations: !apiKey 
      ? [
          '1. Vercel 대시보드 → Settings → Environment Variables로 이동',
          '2. OPENAI_API_KEY 환경 변수 추가 (sk-로 시작하는 실제 API 키)',
          '3. Production, Preview, Development 모두 체크',
          '4. Save 후 반드시 Redeploy 실행',
        ]
      : !apiKey.startsWith('sk-')
      ? [
          'API 키 형식이 올바르지 않습니다.',
          'sk-로 시작하는 OpenAI API 키를 사용해야 합니다.',
        ]
      : !apiTest?.ok
      ? [
          'API 키는 설정되어 있지만 OpenAI API 연결에 실패했습니다.',
          'API 키가 유효한지, 계정 크레딧이 있는지 확인하세요.',
        ]
      : [
          '환경 변수가 정상적으로 설정되어 있습니다! ✅',
        ],
  })
}






