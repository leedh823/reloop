import { NextRequest, NextResponse } from 'next/server'
import { AnalyzeFileResponse, FileAnalysisResult } from '@/types'
import { MAX_PDF_SIZE_BYTES, MAX_OTHER_FILE_SIZE_BYTES, MAX_TEXT_LENGTH, MAX_PDF_SIZE_MB, MAX_OTHER_FILE_SIZE_MB } from '@/lib/constants'

// Vercel 함수 실행 시간 제한: 60초 (Pro 플랜 기준)
export const maxDuration = 60

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

    // Supabase Edge Functions 사용 여부 확인
    const useSupabase = process.env.USE_SUPABASE_EDGE_FUNCTIONS === 'true'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    console.log('[analyze-file] 환경 변수 확인:', {
      useSupabase,
      hasSupabaseUrl: !!supabaseUrl,
      fileType: file.type,
      fileName: file.name,
    })
    
    // PDF 파일은 Supabase Edge Functions에서 지원하지 않으므로 Next.js API Routes 사용
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const isPdf = fileExtension === 'pdf'
    
    if (useSupabase && supabaseUrl && !isPdf) {
      // Supabase Edge Functions로 요청 전달 (PDF 제외)
      try {
        console.log('[analyze-file] Supabase Edge Function 호출 시도')
        const supabaseFormData = new FormData()
        supabaseFormData.append('file', file)
        if (description) {
          supabaseFormData.append('description', description)
        }
        if (emotionTag) {
          supabaseFormData.append('emotionTag', emotionTag)
        }

        const supabaseResponse = await fetch(
          `${supabaseUrl}/functions/v1/openai-analyze-file`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            },
            body: supabaseFormData,
          }
        )

        if (!supabaseResponse.ok) {
          const errorData = await supabaseResponse.json().catch(() => ({}))
          console.error('[analyze-file] Supabase Edge Function 오류:', {
            status: supabaseResponse.status,
            error: errorData,
          })
          return NextResponse.json<AnalyzeFileResponse>(
            { 
              success: false, 
              error: errorData.error || 'Supabase Edge Function 호출 실패' 
            },
            { status: supabaseResponse.status }
          )
        }

        const data = await supabaseResponse.json()
        console.log('[analyze-file] Supabase Edge Function 성공')
        return NextResponse.json<AnalyzeFileResponse>(data)
      } catch (error: any) {
        console.error('[analyze-file] Supabase Edge Function 예외:', error)
        // Supabase 실패 시 기존 로직으로 폴백
      }
    } else {
      if (isPdf) {
        console.log('[analyze-file] PDF 파일이므로 Next.js API Route 사용')
      } else {
        console.log('[analyze-file] Supabase 비활성화 또는 URL 없음, Next.js API Route 사용')
      }
    }

    // 파일 크기 체크 (fileExtension은 위에서 이미 정의됨)
    const maxSize = fileExtension === 'pdf' ? MAX_PDF_SIZE_BYTES : MAX_OTHER_FILE_SIZE_BYTES
    const maxSizeMB = fileExtension === 'pdf' ? MAX_PDF_SIZE_MB : MAX_OTHER_FILE_SIZE_MB
    
    if (file.size > maxSize) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: `파일 용량이 너무 큽니다. ${fileExtension === 'pdf' ? 'PDF는' : '파일은'} 최대 ${maxSizeMB}MB까지 지원합니다. 파일을 압축하거나 분할해주세요.` },
        { status: 413 }
      )
    }

    // 파일 타입 체크
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

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
        
        // PDF 파싱 옵션 설정 (메모리 최적화)
        const parseOptions = {
          // 최대 페이지 수 제한 (메모리 절약)
          max: 0, // 0 = 모든 페이지
          // 버전 체크 비활성화 (성능 향상)
          version: '1.10.100',
        }
        
        // 타임아웃 설정 (30초 - 더 짧게 설정하여 빠른 실패)
        const parsePromise = pdfParse(buffer, parseOptions)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF 파싱 시간이 초과되었습니다. 파일이 너무 복잡하거나 크기가 큽니다.')), 30000)
        )
        
        const pdfData = await Promise.race([parsePromise, timeoutPromise]) as any
        textContent = pdfData.text || ''
        originalLength = textContent.length
        
        // 메모리 정리
        buffer.fill(0)
        
        if (!textContent || textContent.trim().length === 0) {
          return NextResponse.json<AnalyzeFileResponse>(
            { success: false, error: 'PDF 파일에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF인지 확인해주세요. (이미지만 포함된 PDF는 지원하지 않습니다)' },
            { status: 400 }
          )
        }
      } catch (error: any) {
        console.error('PDF 파싱 오류:', error)
        
        // 구체적인 오류 메시지 제공
        let errorMessage = 'PDF 파일을 읽는 중 오류가 발생했습니다.'
        
        if (error?.message?.includes('시간이 초과')) {
          errorMessage = 'PDF 파일 분석 시간이 초과되었습니다. 파일이 너무 크거나 복잡합니다. 파일을 압축하거나 더 작은 파일로 분할해주세요.'
        } else if (error?.message?.includes('memory') || error?.message?.includes('메모리')) {
          errorMessage = 'PDF 파일이 너무 커서 메모리 부족이 발생했습니다. 파일을 압축하거나 30MB 이하로 줄여주세요.'
        } else if (error?.message?.includes('corrupt') || error?.message?.includes('손상')) {
          errorMessage = 'PDF 파일이 손상되었거나 읽을 수 없는 형식입니다. 다른 PDF 파일을 시도해주세요.'
        }
        
        return NextResponse.json<AnalyzeFileResponse>(
          { success: false, error: errorMessage },
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
    const apiKey = process.env.OPENAI_API_KEY?.trim()
    
    // 디버깅: 환경 변수 상태 로깅
    console.log('API Key 체크:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
      startsWithSk: apiKey?.startsWith('sk-') || false,
    })
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: 'AI 서비스가 설정되지 않았습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      )
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error('OPENAI_API_KEY 형식이 올바르지 않습니다. (sk-로 시작해야 함)')
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: 'API 키 형식이 올바르지 않습니다.' },
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

    // Authorization 헤더 구성 (명시적으로 공백 제거)
    const authHeader = `Bearer ${apiKey.trim()}`
    
    console.log('OpenAI API 호출 준비:', {
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 7),
      authHeaderLength: authHeader.length,
      authHeaderPrefix: authHeader.substring(0, 15),
      model: 'gpt-4o-mini',
    })
    
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
      
      // 상세한 오류 로깅
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKeyExists: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
        apiKeyEndsWith: apiKey ? `...${apiKey.substring(apiKey.length - 4)}` : 'undefined',
        authHeaderPrefix: authHeader.substring(0, 20),
        responseText: responseText.substring(0, 500),
      }
      
      console.error('OpenAI API 오류 (상세):', JSON.stringify(errorInfo, null, 2))
      
      // 403 오류에 대한 구체적인 메시지
      if (response.status === 403) {
        // OpenAI API의 403 오류는 보통 API 키 권한 문제
        let errorMessage = 'OpenAI API 접근이 거부되었습니다.'
        let detailedMessage = ''
        
        // OpenAI API의 구체적인 에러 메시지 추출
        if (errorData?.error?.message) {
          detailedMessage = errorData.error.message
          errorMessage = `${errorMessage}\n\n상세: ${detailedMessage}`
        } else if (errorData?.error?.code) {
          errorMessage = `오류 코드: ${errorData.error.code}`
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
        
        // 더 구체적인 안내
        if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota')) {
          errorMessage = 'OpenAI API 사용량 한도에 도달했습니다. 계정 크레딧을 확인해주세요.'
        } else if (errorMessage.includes('billing') || errorMessage.includes('payment')) {
          errorMessage = 'OpenAI API 결제 정보가 필요합니다. 계정 설정을 확인해주세요.'
        } else if (errorMessage.includes('organization') || errorMessage.includes('org')) {
          errorMessage = 'OpenAI API 조직 설정에 문제가 있습니다. API 키의 조직 권한을 확인해주세요.'
        }
        
        return NextResponse.json<AnalyzeFileResponse>(
          { 
            success: false, 
            error: errorMessage
          },
          { status: 403 }
        )
      }
      
      // 401 오류 (인증 실패)
      if (response.status === 401) {
        const authError = errorData?.error?.message || errorData?.message || '인증 실패'
        return NextResponse.json<AnalyzeFileResponse>(
          { 
            success: false, 
            error: `OpenAI API 인증에 실패했습니다: ${authError}` 
          },
          { status: 401 }
        )
      }
      
      return NextResponse.json<AnalyzeFileResponse>(
        { 
          success: false, 
          error: `분석에 실패했습니다. (${response.status} ${response.statusText})` 
        },
        { status: response.status }
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
  } catch (error: any) {
    console.error('파일 분석 오류:', error)
    
    // 구체적인 오류 메시지 제공
    let errorMessage = '서버 오류가 발생했습니다.'
    
    if (error?.message?.includes('timeout') || error?.message?.includes('타임아웃')) {
      errorMessage = '요청 시간이 초과되었습니다. 파일이 너무 크거나 복잡합니다. 잠시 후 다시 시도하거나 파일을 압축해주세요.'
    } else if (error?.message?.includes('memory') || error?.message?.includes('메모리')) {
      errorMessage = '메모리 부족으로 파일을 처리할 수 없습니다. 파일 크기를 줄여주세요.'
    } else if (error?.message?.includes('ENOENT') || error?.message?.includes('파일을 찾을 수 없')) {
      errorMessage = '파일을 찾을 수 없습니다. 파일을 다시 업로드해주세요.'
    }
    
    return NextResponse.json<AnalyzeFileResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

