import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, failureSummary, emotionTag } = await req.json()

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

    const systemPrompt = `너는 'Reloop'라는 서비스 안에서 동작하는 감정 기반 AI 파트너야.
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
    console.error('감정 반영 오류:', error)
    return new Response(
      JSON.stringify({ error: error?.message || '서버 오류가 발생했습니다.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})


