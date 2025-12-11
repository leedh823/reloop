import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, analysisSummary, tags } = await req.json()

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '메시지가 필요합니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim()
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI 서비스가 설정되지 않았습니다.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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

    const userMessage = `이전 분석 요약:
${analysisSummary}

키워드 태그:
${tags.join(', ')}

사용자 메시지:
${message}`

    const authHeader = `Bearer ${apiKey.trim()}`
    
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
      
      let errorMessage = 'AI 응답 생성에 실패했습니다.'
      
      if (response.status === 403) {
        errorMessage = errorData?.error?.message || 'OpenAI API 접근이 거부되었습니다.'
      } else if (response.status === 401) {
        errorMessage = 'OpenAI API 인증에 실패했습니다.'
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'

    return new Response(
      JSON.stringify({ reply }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: any) {
    console.error('파일 채팅 오류:', error)
    return new Response(
      JSON.stringify({ error: error?.message || '서버 오류가 발생했습니다.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})



