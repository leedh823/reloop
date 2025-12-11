import { NextRequest, NextResponse } from 'next/server'

/**
 * 환경 변수 디버깅용 엔드포인트 (개발/디버깅 전용)
 * 프로덕션에서는 제거하거나 보안을 강화해야 합니다.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const useSupabase = process.env.USE_SUPABASE_EDGE_FUNCTIONS === 'true'
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
    apiKeyEndsWith: apiKey ? `...${apiKey.substring(apiKey.length - 4)}` : 'undefined',
    startsWithSk: apiKey?.startsWith('sk-') || false,
    rawEnvExists: !!process.env.OPENAI_API_KEY,
    rawEnvLength: process.env.OPENAI_API_KEY?.length || 0,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseAnonKey: !!supabaseAnonKey,
    useSupabaseEdgeFunctions: useSupabase,
    // 실제 키 값은 반환하지 않음 (보안)
  })
}

