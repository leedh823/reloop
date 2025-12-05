import { NextRequest, NextResponse } from 'next/server'
import { AnalyzeFileResponse, FileAnalysisResult } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 10000 // 최대 10,000자만 분석

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const description = formData.get('description') as string | null
    const emotionTag = formData.get('emotionTag') as string | null

    if (!file) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 체크
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      )
    }

    // 파일 타입 체크
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (
      !allowedTypes.includes(file.type) &&
      !['txt', 'md', 'pdf', 'docx'].includes(fileExtension || '')
    ) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '지원하지 않는 파일 형식입니다. (txt, md, pdf, docx만 지원)' },
        { status: 400 }
      )
    }

    // 파일 내용 추출
    let textContent = ''
    let originalLength = 0

    if (fileExtension === 'txt' || fileExtension === 'md') {
      // 텍스트 파일 직접 읽기
      textContent = await file.text()
      originalLength = textContent.length
    } else if (fileExtension === 'pdf') {
      try {
        // PDF 파일을 ArrayBuffer로 읽기
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // pdf-parse를 require로 로드 (CommonJS 모듈)
        // @ts-ignore - pdf-parse는 CommonJS 모듈로 default export가 없음
        const pdfParse = require('pdf-parse')
        const pdfData = await pdfParse(buffer)
        textContent = pdfData.text
        originalLength = textContent.length
        
        if (!textContent || textContent.trim().length === 0) {
          return NextResponse.json<AnalyzeFileResponse>(
            { success: false, error: 'PDF 파일에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF인지 확인해주세요.' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('PDF 파싱 오류:', error)
        return NextResponse.json<AnalyzeFileResponse>(
          { success: false, error: 'PDF 파일을 읽는 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }
    } else if (fileExtension === 'docx') {
      // DOCX는 일단 TODO로 남김
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: 'DOCX 파일은 아직 지원하지 않습니다. 텍스트 파일(.txt, .md) 또는 PDF를 사용해주세요.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      )
    }

    // 텍스트 길이 제한
    if (textContent.length > MAX_TEXT_LENGTH) {
      textContent = textContent.substring(0, MAX_TEXT_LENGTH)
      console.log(`텍스트가 ${MAX_TEXT_LENGTH}자를 초과하여 잘렸습니다. (원본: ${originalLength}자)`)
    }

    // OpenAI API 호출
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: 'AI 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      )
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
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API 오류:', errorData)
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '분석에 실패했습니다. 나중에 다시 시도해 주세요.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content || ''

    // 응답 파싱
    const sections: { title: string; content: string }[] = []
    const tags: string[] = []

    // 마크다운 형식으로 파싱
    const lines = analysisText.split('\n')
    let currentSection: { title: string; content: string } | null = null

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // 새 섹션 시작
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
        // 현재 섹션에 내용 추가
        if (line.trim()) {
          currentSection.content += (currentSection.content ? '\n' : '') + line.trim()
        }
      } else if (line.includes(',') && sections.length > 0) {
        // 키워드 태그 파싱
        const tagLine = line.trim()
        tags.push(...tagLine.split(',').map((t: string) => t.trim()).filter(Boolean))
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    // 기본 섹션 구조 보장
    const defaultSections = [
      { title: '상황 요약', content: '' },
      { title: '감정 정리', content: '' },
      { title: '반복 패턴', content: '' },
      { title: '도움이 될 관점', content: '' },
    ]

    const result: FileAnalysisResult = {
      sections: sections.length > 0 ? sections : defaultSections,
      tags: tags.length > 0 ? tags : [],
      rawTextLength: originalLength,
    }

    return NextResponse.json<AnalyzeFileResponse>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('파일 분석 오류:', error)
    return NextResponse.json<AnalyzeFileResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

