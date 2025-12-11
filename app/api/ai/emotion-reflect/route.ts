import { NextRequest, NextResponse } from 'next/server'
import { EmotionReflectRequest, EmotionReflectResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: EmotionReflectRequest = await request.json()
    const { message, failureSummary, emotionTag } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // Supabase Edge Functions 사용 여부 확인
    const useSupabase = process.env.USE_SUPABASE_EDGE_FUNCTIONS === 'true'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (useSupabase && supabaseUrl) {
      try {
        const supabaseResponse = await fetch(
          `${supabaseUrl}/functions/v1/openai-emotion-reflect`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            },
            body: JSON.stringify({ message, failureSummary, emotionTag }),
          }
        )

        if (!supabaseResponse.ok) {
          const errorData = await supabaseResponse.json().catch(() => ({}))
          return NextResponse.json(
            { error: errorData.error || 'Supabase Edge Function 호출 실패' },
            { status: supabaseResponse.status }
          )
        }

        const data = await supabaseResponse.json()
        return NextResponse.json(data)
      } catch (error: any) {
        console.error('Supabase Edge Function 오류:', error)
        // Supabase 실패 시 기존 로직으로 폴백
      }
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim()
    
    // Vercel 환경 변수 확인 (함수 로그에서 확인 가능)
    if (!apiKey) {
      console.error('[emotion-reflect] OPENAI_API_KEY가 설정되지 않았습니다.')
      console.error('[emotion-reflect] Vercel 환경:', process.env.VERCEL_ENV)
      console.error('[emotion-reflect] 사용 가능한 환경 변수:', Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API')).join(', '))
      
      return NextResponse.json(
        { error: 'AI 서비스가 설정되지 않았습니다. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수를 설정하고 Redeploy 해주세요.' },
        { status: 500 }
      )
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error('[emotion-reflect] OPENAI_API_KEY 형식이 올바르지 않습니다.')
      return NextResponse.json(
        { error: 'API 키 형식이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    // System 프롬프트 구성
    let systemPrompt = `너는 'Reloop'라는 서비스 안에서 동작하는 감정 기반 AI 파트너야.
사용자의 실패 경험과 지금 느끼는 감정을 정리하도록 도와준다.

원칙:
- 사용자를 평가하거나 비난하지 않는다.
- "너는 잘못했어"가 아니라 "그 상황에서 그렇게 느낀 건 자연스러워"처럼 공감 위주로 말한다.
- 심리상담사나 의사가 아니며, 진단이나 치료를 제안하지 않는다.
- 대신, 사용자가 스스로를 돌아보도록 돕는 질문을 1~2개 정도 던져준다.
- 가능한 한 부드러운 한국어를 사용하되, 사용자가 영어로 말하면 영어도 섞어서 답해도 된다.
- 답변은 3~6문장 정도의 길이로 유지한다.
- 만약 사용자가 자해, 극단적인 선택, 심각한 위험을 언급하면
  반드시 "나는 전문 도움을 줄 수 없는 AI"라는 점을 분명히 하고
  주변 사람이나 전문가, 긴급 전화 등 다른 도움을 요청하라고 안내한다.`

    // Context 구성
    let userMessage = message
    if (failureSummary || emotionTag) {
      let context = ''
      if (failureSummary) {
        context += `[실패 요약: ${failureSummary}]\n\n`
      }
      if (emotionTag) {
        context += `[현재 감정 태그: ${emotionTag}]\n\n`
      }
      userMessage = context + userMessage
    }

    // Authorization 헤더 구성 (명시적으로 공백 제거)
    const authHeader = `Bearer ${apiKey.trim()}`
    
    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const responseText = await response.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { raw: responseText.substring(0, 500) }
      }
      
      console.error('OpenAI API 오류 (상세):', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKeyLength: apiKey?.length,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
        authHeaderPrefix: authHeader.substring(0, 20),
        responseText: responseText.substring(0, 500),
      })
      
      // 403 오류에 대한 구체적인 메시지
      if (response.status === 403) {
        let errorMessage = 'OpenAI API 접근이 거부되었습니다.'
        
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
        
        if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota')) {
          errorMessage = 'OpenAI API 사용량 한도에 도달했습니다. 계정 크레딧을 확인해주세요.'
        } else if (errorMessage.includes('billing') || errorMessage.includes('payment')) {
          errorMessage = 'OpenAI API 결제 정보가 필요합니다. 계정 설정을 확인해주세요.'
        } else if (errorMessage.includes('organization') || errorMessage.includes('org')) {
          errorMessage = 'OpenAI API 조직 설정에 문제가 있습니다. API 키의 조직 권한을 확인해주세요.'
        } else {
          // 일반적인 403 오류 - 환경 변수 문제 가능성
          errorMessage = `OpenAI API 접근이 거부되었습니다.\n\n가능한 원인:\n1. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.\n2. 환경 변수 설정 후 재배포가 필요합니다.\n3. API 키가 유효하지 않거나 만료되었습니다.\n\n해결 방법:\n- Vercel 대시보드 → Settings → Environment Variables에서 OPENAI_API_KEY 확인\n- 환경 변수 설정 후 반드시 Redeploy 실행\n- /api/debug/env 엔드포인트에서 환경 변수 상태 확인`
        }
        
        // 환경 변수 상태 로깅
        const envStatus = {
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          startsWithSk: apiKey?.startsWith('sk-') || false,
          vercelEnv: process.env.VERCEL_ENV || 'local',
        }
        
        console.error('[emotion-reflect] 403 오류 - 환경 변수 상태:', JSON.stringify(envStatus, null, 2))
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 403 }
        )
      }
      
      // 401 오류 (인증 실패)
      if (response.status === 401) {
        const authError = errorData?.error?.message || errorData?.message || '인증 실패'
        return NextResponse.json(
          { error: `OpenAI API 인증에 실패했습니다: ${authError}` },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'AI 응답을 생성하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'

    const result: EmotionReflectResponse = {
      reply,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Emotion reflect API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}



