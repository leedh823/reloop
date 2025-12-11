import { NextRequest, NextResponse } from 'next/server'
import { ChatWithFileRequest, ChatWithFileResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: ChatWithFileRequest = await request.json()
    const { message, analysisSummary, tags } = body

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
          `${supabaseUrl}/functions/v1/openai-chat-with-file`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            },
            body: JSON.stringify({ message, analysisSummary, tags }),
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
      console.error('[chat-with-file] OPENAI_API_KEY가 설정되지 않았습니다.')
      console.error('[chat-with-file] Vercel 환경:', process.env.VERCEL_ENV)
      console.error('[chat-with-file] 사용 가능한 환경 변수:', Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API')).join(', '))
      
      return NextResponse.json(
        { error: 'AI 서비스가 설정되지 않았습니다. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수를 설정하고 Redeploy 해주세요.' },
        { status: 500 }
      )
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error('[chat-with-file] OPENAI_API_KEY 형식이 올바르지 않습니다.')
      return NextResponse.json(
        { error: 'API 키 형식이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    // System 프롬프트
    const systemPrompt = `너는 'Reloop'의 감정 기반 AI 파트너야.
사용자가 업로드한 실패 기록에 대한 요약과 키워드가 이미 분석되어 있다.
지금부터는 그 내용을 바탕으로 사용자와 대화를 나누며 감정을 정리하도록 돕는다.

원칙:
- 사용자를 판단하거나 비난하지 않는다.
- "그럴 수 있다", "그렇게 느끼는 건 자연스럽다" 같은 공감 문장을 우선 사용한다.
- 매 답변에서 사용자가 더 깊이 생각해볼 만한 질문을 1~2개 정도 던져준다.
- 너무 긴 강의식 조언은 피하고, 3~6문장 사이의 답변을 유지한다.
- 전문 심리상담/치료가 아닐 뿐 아니라, 그런 것처럼 말하면 안 된다.
- 위기/자해/극단적 표현이 나오면,
  반드시 현실의 사람이나 전문 기관에 도움을 구하라는 안내를 덧붙인다.`

    // User 메시지 구성
    const userMessage = `이전 분석 요약:
${analysisSummary}

키워드 태그:
${tags.join(', ')}

사용자 메시지:
${message}`

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
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
        
        console.error('[chat-with-file] 403 오류 - 환경 변수 상태:', JSON.stringify(envStatus, null, 2))
        
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
        { error: `AI 응답을 생성하는 중 오류가 발생했습니다. (${response.status} ${response.statusText})` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'

    return NextResponse.json<ChatWithFileResponse>({ reply })
  } catch (error) {
    console.error('Chat with file 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}



