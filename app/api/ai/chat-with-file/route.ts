import { NextRequest, NextResponse } from 'next/server'
import { ChatWithFileRequest, ChatWithFileResponse } from '@/types'
import { callOpenAIAPI } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

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

    const systemPrompt = `너는 'Reloop'의 감정 기반 AI 파트너야.
사용자가 업로드한 파일의 분석 결과를 바탕으로 대화한다.

원칙:
- 사용자를 평가하거나 비난하지 않는다.
- "너는 잘못했어"가 아니라 "그 상황에서 그렇게 느낀 건 자연스러워"처럼 공감 위주로 말한다.
- 심리상담사나 의사가 아니며, 진단이나 치료를 제안하지 않는다.
- 대신, 사용자가 스스로를 돌아보도록 돕는 질문을 1~2개 정도 던져준다.
- 가능한 한 부드러운 한국어를 사용하되, 사용자가 영어로 말하면 영어도 섞어서 답해도 된다.
- 답변은 3~6문장 정도의 길이로 유지한다.
- 만약 사용자가 자해, 극단적인 선택, 심각한 위험을 언급하면
  반드시 "나는 전문 도움을 줄 수 없는 AI"라는 점을 분명히 하고
  주변 사람이나 전문가, 긴급 전화 등 다른 도움을 요청하라고 안내한다.

[파일 분석 요약]
${analysisSummary}

[키워드 태그]
${tags.join(', ')}`

    const openAIResponse = await callOpenAIAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], {
      max_tokens: 500,
    })

    if (!openAIResponse.ok) {
      console.error('[chat-with-file] OpenAI API 호출 실패:', {
        reason: openAIResponse.reason,
        status: openAIResponse.status,
        code: openAIResponse.code,
        type: openAIResponse.type,
        message: openAIResponse.message,
      })

      const statusCode = openAIResponse.status || 500
      return NextResponse.json(
        {
          error: `OpenAI API 오류: ${openAIResponse.message}`,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json<ChatWithFileResponse>({ reply: openAIResponse.content })
  } catch (error: any) {
    console.error('[chat-with-file] 오류:', error)
    
    const errorMessage = error?.message || '서버 오류가 발생했습니다.'
    const statusCode = error?.message?.includes('접근이 거부') ? 403 : 500

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
