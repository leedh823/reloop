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

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'AI 서비스가 설정되지 않았습니다.' },
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

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API 오류:', errorData)
      return NextResponse.json(
        { error: 'AI 응답을 생성하는 중 오류가 발생했습니다.' },
        { status: 500 }
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

