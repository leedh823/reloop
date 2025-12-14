import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const description = formData.get('description') as string | null
    const emotionTag = formData.get('emotionTag') as string | null

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: '파일이 필요합니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // OpenAI API 키 확인
    const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim()
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.')
      return new Response(
        JSON.stringify({ success: false, error: 'AI 서비스가 설정되지 않았습니다.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!apiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({ success: false, error: 'API 키 형식이 올바르지 않습니다.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 파일 내용 추출
    let textContent = ''
    let originalLength = 0

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'txt' || fileExtension === 'md') {
      textContent = await file.text()
      originalLength = textContent.length
    } else if (fileExtension === 'pdf') {
      // PDF는 클라이언트에서 처리하거나, 여기서 처리
      // 일단 텍스트로 읽기 시도
      try {
        const arrayBuffer = await file.arrayBuffer()
        // PDF 파싱은 Deno에서 복잡하므로, 클라이언트에서 처리하거나
        // 별도의 PDF 파싱 라이브러리 필요
        textContent = 'PDF 파일은 현재 Edge Functions에서 직접 파싱할 수 없습니다.'
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'PDF 파일은 현재 지원하지 않습니다. 텍스트 파일을 사용해주세요.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: '파일을 읽는 중 오류가 발생했습니다.' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // System 프롬프트
    const systemPrompt = `너는 'Reloop'라는 서비스 안에서 동작하는 감정 기반 AI 파트너야.
사용자가 업로드한 텍스트는 실패에 대한 기록일 가능성이 높다.

역할:
- 이 텍스트를 중심으로 사용자의 감정과 경험을 정리해준다.
- 아래 항목으로 나눠서 요약해줘:
  1) 상황 요약
  2) 사용자가 느낀 감정들
  3) 반복해서 나타나는 패턴/생각
  4) 앞으로 도움이 될 수 있는 관점 2~3가지
- 각 항목은 2~4문장 정도로 간단히 설명한다.
- 마지막에 '키워드 태그' 섹션을 만들어서, 쉼표로 구분된 키워드 목록을 제공한다.
- 심리상담사나 의사가 아니며, 진단/치료를 제공하면 안 된다.
- 심각한 위기/자해/극단 선택 관련 내용이 보이면,
  반드시 전문 기관이나 주변 사람에게 도움을 요청하라고 안내해야 한다.

응답 형식:
각 섹션은 "## 제목" 형식으로 시작하고, 내용을 작성해주세요.
키워드 태그는 "## 키워드 태그" 다음에 쉼표로 구분된 키워드 목록을 제공해주세요.`

    // User 메시지 구성
    let userMessage = `다음 텍스트는 사용자의 실패 기록이야. 위 원칙에 따라 분석해줘.\n\n${textContent}`

    if (description) {
      userMessage += `\n\n[추가 컨텍스트] 이 파일은 "${description}"에 대한 기록입니다.`
    }

    if (emotionTag) {
      userMessage += `\n\n[현재 감정 태그] ${emotionTag}`
    }

    // OpenAI API 호출
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
        max_tokens: 1500,
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
      
      console.error('OpenAI API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      
      let errorMessage = '분석에 실패했습니다.'
      
      if (response.status === 403) {
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message
        } else {
          errorMessage = 'OpenAI API 접근이 거부되었습니다. API 키를 확인하거나 관리자에게 문의하세요.'
        }
      } else if (response.status === 401) {
        errorMessage = 'OpenAI API 인증에 실패했습니다. API 키가 올바른지 확인하세요.'
      }
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content || ''

    // 응답 파싱
    const sections: { title: string; content: string }[] = []
    const tags: string[] = []

    const lines = analysisText.split('\n')
    let currentSection: { title: string; content: string } | null = null

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        const title = line.replace('## ', '').trim()
        if (title === '키워드 태그') {
          currentSection = null
        } else {
          currentSection = { title, content: '' }
        }
      } else if (currentSection) {
        if (line.trim()) {
          currentSection.content += (currentSection.content ? '\n' : '') + line.trim()
        }
      } else if (line.includes(',') && sections.length > 0) {
        const tagLine = line.trim()
        tags.push(...tagLine.split(',').map((t: string) => t.trim()).filter(Boolean))
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    const defaultSections = [
      { title: '상황 요약', content: '' },
      { title: '감정 정리', content: '' },
      { title: '반복 패턴', content: '' },
      { title: '도움이 될 관점', content: '' },
    ]

    const result = {
      sections: sections.length > 0 ? sections : defaultSections,
      tags: tags.length > 0 ? tags : [],
      rawTextLength: originalLength,
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: any) {
    console.error('파일 분석 오류:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || '서버 오류가 발생했습니다.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})







