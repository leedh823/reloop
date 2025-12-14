import { NextRequest, NextResponse } from 'next/server'
import { AnalyzeFileResponse, FileAnalysisResult } from '@/types'
import { MAX_PDF_SIZE_BYTES, MAX_OTHER_FILE_SIZE_BYTES, MAX_TEXT_LENGTH, MAX_PDF_SIZE_MB, MAX_OTHER_FILE_SIZE_MB } from '@/lib/constants'
import { callOpenAIAPI } from '@/lib/openai'
import { downloadFile } from '@/lib/r2'

// Node.js Runtime 명시 (대용량 파일 처리 필수)
export const runtime = 'nodejs'
export const maxDuration = 60

// DOMMatrix 폴리필 (pdf-parse가 브라우저 API를 사용하려고 할 때 필요)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init?: any) {
      // 간단한 폴리필 구현
      this.a = 1
      this.b = 0
      this.c = 0
      this.d = 1
      this.e = 0
      this.f = 0
      this.m11 = 1
      this.m12 = 0
      this.m21 = 0
      this.m22 = 1
      this.m41 = 0
      this.m42 = 0
    }
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    m11: number
    m12: number
    m21: number
    m22: number
    m41: number
    m42: number
  } as any
}

// GET 요청 처리 (디버깅용 - 실제 사용 시 제거 가능)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: '이 엔드포인트는 POST 메서드만 지원합니다. 파일 업로드를 위해 POST 요청을 사용해주세요.',
      method: 'GET',
      supportedMethods: ['POST'],
    },
    { status: 405 }
  )
}

export async function POST(request: NextRequest) {
  // 함수 진입 확인 로그 (가장 먼저 실행)
  const startTime = Date.now()
  console.log('[analyze-file] ========== POST 함수 진입 ==========')
  console.log('[analyze-file] 진입 시간:', new Date().toISOString())
  console.log('[analyze-file] 요청 URL:', request.url)
  console.log('[analyze-file] 요청 메서드:', request.method)
  console.log('[analyze-file] Content-Type:', request.headers.get('content-type'))
  console.log('[analyze-file] Content-Length:', request.headers.get('content-length'))
  console.log('[analyze-file] 환경 변수 확인:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) || '없음',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    isVercel: !!process.env.VERCEL,
  })
  
  try {
    console.log('[analyze-file] FormData 파싱 시작...')
    const formData = await request.formData()
    console.log('[analyze-file] FormData 파싱 완료')
    const file = formData.get('file') as File | null
    const blobUrl = formData.get('blobUrl') as string | null
    const fileKey = formData.get('fileKey') as string | null // R2 파일 키 (직접 다운로드용)
    const description = formData.get('description') as string | null
    const emotionTag = formData.get('emotionTag') as string | null

    let fileToProcess: File | null = file
    let fileName = file?.name || 'unknown'
    let fileSize = file?.size || 0

    // R2 URL이 있으면 서버에서 직접 다운로드
    if (blobUrl && !file) {
      console.log('[analyze-file] R2에서 파일 다운로드 시작:', { blobUrl, fileKey })
      try {
        // 파일 키가 직접 제공되면 사용, 없으면 URL에서 추출
        let r2FileKey: string
        if (fileKey) {
          r2FileKey = fileKey
        } else {
          // R2 URL에서 파일 키 추출
          // URL 형식: https://account-id.r2.dev/uploads/... 또는 https://custom-domain.com/uploads/...
          if (blobUrl.includes('.r2.dev/') || blobUrl.includes('.r2.cloudflarestorage.com/')) {
            // R2 URL에서 키 추출
            const urlParts = blobUrl.split('/')
            const keyIndex = urlParts.findIndex(part => part === 'uploads')
            if (keyIndex !== -1) {
              r2FileKey = urlParts.slice(keyIndex).join('/')
            } else {
              // URL의 마지막 부분을 키로 사용
              r2FileKey = urlParts[urlParts.length - 1]
            }
          } else {
            // 전체 URL에서 경로 부분 추출
            try {
              const url = new URL(blobUrl)
              r2FileKey = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
            } catch {
              // URL 파싱 실패 시 마지막 부분 사용
              r2FileKey = blobUrl.split('/').pop() || 'unknown'
            }
          }
        }

        console.log('[analyze-file] 사용할 파일 키:', r2FileKey)

        // R2에서 직접 다운로드
        const fileBuffer = await downloadFile(r2FileKey)
        fileSize = fileBuffer.length
        
        // 파일명 추출 (키에서)
        fileName = r2FileKey.split('/').pop() || 'unknown'
        
        // Content-Type 추정
        const extension = fileName.split('.').pop()?.toLowerCase() || ''
        const contentTypeMap: Record<string, string> = {
          'pdf': 'application/pdf',
          'txt': 'text/plain',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        const contentType = contentTypeMap[extension] || 'application/octet-stream'

        // Buffer를 File 객체로 변환 (Uint8Array로 변환)
        const uint8Array = new Uint8Array(fileBuffer)
        fileToProcess = new File([uint8Array], fileName, { type: contentType })
        console.log('[analyze-file] R2 파일 다운로드 완료:', { fileName, fileSize, contentType })
      } catch (error: any) {
        console.error('[analyze-file] R2 다운로드 오류:', error)
        return NextResponse.json<AnalyzeFileResponse>(
          { success: false, error: `파일 다운로드 실패: ${error?.message}` },
          { status: 500 }
        )
      }
    }

    if (!fileToProcess) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '파일 또는 Blob URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (Blob을 사용하면 50MB까지 허용)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const isPdf = fileExtension === 'pdf'
    // Blob URL을 사용하면 더 큰 파일 허용 (50MB)
    const maxSize = blobUrl ? (50 * 1024 * 1024) : (isPdf ? MAX_PDF_SIZE_BYTES : MAX_OTHER_FILE_SIZE_BYTES)
    const maxSizeMB = blobUrl ? 50 : (isPdf ? MAX_PDF_SIZE_MB : MAX_OTHER_FILE_SIZE_MB)

    if (fileSize > maxSize) {
      return NextResponse.json<AnalyzeFileResponse>(
        {
          success: false,
          error: `파일 용량이 너무 큽니다. (${(fileSize / (1024 * 1024)).toFixed(1)}MB)\n\n최대 ${maxSizeMB}MB까지 지원합니다. 파일을 압축하거나 분할해주세요.`
        },
        { status: 413 }
      )
    }

    // 파일 타입 체크
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf']
    if (!allowedTypes.includes(fileToProcess.type) && !['txt', 'md', 'pdf'].includes(fileExtension || '')) {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '지원하지 않는 파일 형식입니다. (txt, md, pdf만 지원)' },
        { status: 400 }
      )
    }

    // 파일 내용 추출
    let textContent = ''
    let originalLength = 0

    if (fileExtension === 'txt' || fileExtension === 'md') {
      textContent = await fileToProcess.text()
      originalLength = textContent.length
    } else if (fileExtension === 'pdf') {
      try {
        console.log('[analyze-file] PDF 파싱 시작:', { fileName, fileSize, fileType: fileToProcess.type })
        
        // PDF 파싱
        const arrayBuffer = await fileToProcess.arrayBuffer()
        console.log('[analyze-file] ArrayBuffer 생성 완료:', { size: arrayBuffer.byteLength })
        
        const buffer = Buffer.from(arrayBuffer)
        console.log('[analyze-file] Buffer 생성 완료:', { length: buffer.length })

        // pdf-parse 모듈 로드 (DOMMatrix 폴리필이 이미 설정됨)
        const pdfParseModule = require('pdf-parse')
        console.log('[analyze-file] pdf-parse 모듈 로드 완료:', { 
          hasPDFParse: !!pdfParseModule.PDFParse,
          hasDefault: !!pdfParseModule.default,
          moduleKeys: Object.keys(pdfParseModule),
          hasDOMMatrix: typeof globalThis.DOMMatrix !== 'undefined'
        })

        // PDFParse 클래스 사용
        const PDFParse = pdfParseModule.PDFParse
        
        if (!PDFParse || typeof PDFParse !== 'function') {
          console.error('[analyze-file] PDFParse 클래스를 찾을 수 없습니다:', typeof PDFParse)
          throw new Error('PDFParse 클래스를 찾을 수 없습니다.')
        }

        console.log('[analyze-file] PDF 파싱 실행 중...')
        
        // 타임아웃 설정
        const timeoutDuration = fileSize > 20 * 1024 * 1024 ? 120000 : 90000
        
        // PDFParse 클래스 인스턴스 생성 및 파싱
        const pdfParser = new PDFParse({ data: buffer })
        const parseOptions = { max: 0, version: '1.10.100' }
        
        const parsePromise = pdfParser.getText(parseOptions)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            reject(new Error('PDF 파싱 시간이 초과되었습니다.'))
          }, timeoutDuration)
        )

        const pdfData = await Promise.race([parsePromise, timeoutPromise]) as any
        console.log('[analyze-file] PDF 파싱 완료:', { 
          pages: pdfData.numpages,
          info: pdfData.info,
          metadata: pdfData.metadata,
          textLength: pdfData.text?.length || 0
        })
        
        textContent = pdfData.text || ''
        originalLength = textContent.length

        if (!textContent || textContent.trim().length === 0) {
          return NextResponse.json<AnalyzeFileResponse>(
            {
              success: false,
              error: 'PDF 파일에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF인지 확인해주세요.'
            },
            { status: 400 }
          )
        }
        
        console.log('[analyze-file] PDF 텍스트 추출 완료:', { textLength: textContent.length })
      } catch (error: any) {
        console.error('[analyze-file] PDF 파싱 오류 상세:', {
          error: error,
          message: error?.message,
          stack: error?.stack,
          fileName,
          fileSize,
        })
        
        let errorMessage = 'PDF 파일을 읽는 중 오류가 발생했습니다.'
        let statusCode = 500

        const errorMsg = error?.message || ''
        if (errorMsg.includes('시간이 초과') || errorMsg.includes('timeout')) {
          errorMessage = `PDF 파일 분석 시간이 초과되었습니다. (${(fileSize / (1024 * 1024)).toFixed(1)}MB)\n\n파일이 너무 크거나 복잡합니다. 파일을 압축하거나 더 작은 파일로 시도해주세요.`
          statusCode = 408
        } else if (errorMsg.includes('memory') || errorMsg.includes('메모리')) {
          errorMessage = `PDF 파일이 너무 커서 메모리 부족이 발생했습니다. (${(fileSize / (1024 * 1024)).toFixed(1)}MB)\n\n파일을 압축하거나 30MB 이하로 줄여주세요.`
          statusCode = 413
        } else {
          // 구체적인 오류 메시지 포함
          errorMessage = `PDF 파일을 읽는 중 오류가 발생했습니다: ${errorMsg}`
        }

        return NextResponse.json<AnalyzeFileResponse>(
          { success: false, error: errorMessage },
          { status: statusCode }
        )
      }
    } else {
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      )
    }

    // 텍스트 길이 제한
    if (textContent.length > MAX_TEXT_LENGTH) {
      textContent = textContent.substring(0, MAX_TEXT_LENGTH)
    }

    // OpenAI API 호출
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

    let userMessage = `다음 텍스트는 사용자의 실패 기록이야. 위 원칙에 따라 분석해줘.\n\n${textContent}`
    
    if (description) {
      userMessage += `\n\n[추가 컨텍스트] 이 파일은 "${description}"에 대한 기록입니다.`
    }
    if (emotionTag) {
      userMessage += `\n\n[현재 감정 태그] ${emotionTag}`
    }

    // OpenAI API 호출 (상세한 에러 처리)
    const openAIResponse = await callOpenAIAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ])

    // OpenAI API 에러 처리
    if (!openAIResponse.ok) {
      console.error('[analyze-file] OpenAI API 호출 실패:', {
        reason: openAIResponse.reason,
        status: openAIResponse.status,
        code: openAIResponse.code,
        type: openAIResponse.type,
        message: openAIResponse.message,
        openaiError: openAIResponse.openaiError,
      })

      // 403 오류인 경우 상세한 정보 반환
      if (openAIResponse.status === 403) {
        return NextResponse.json<AnalyzeFileResponse>(
          {
            success: false,
            error: `OpenAI API 접근이 거부되었습니다.\n\n오류 코드: ${openAIResponse.code || 'unknown'}\n오류 타입: ${openAIResponse.type || 'unknown'}\n오류 메시지: ${openAIResponse.message}`,
            // 디버깅을 위한 추가 정보 (프로덕션에서는 제거 가능)
            debug: {
              reason: openAIResponse.reason,
              status: openAIResponse.status,
              code: openAIResponse.code,
              type: openAIResponse.type,
            },
          },
          { status: 403 }
        )
      }

      // 기타 OpenAI 오류
      const statusCode = openAIResponse.status || 500
      return NextResponse.json<AnalyzeFileResponse>(
        {
          success: false,
          error: `OpenAI API 오류: ${openAIResponse.message}`,
          debug: {
            reason: openAIResponse.reason,
            status: openAIResponse.status,
            code: openAIResponse.code,
            type: openAIResponse.type,
          },
        },
        { status: statusCode }
      )
    }

    // 성공 응답 처리
    const analysisText = openAIResponse.content

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
    const errorDetails = {
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack?.substring(0, 1000),
      errorType: typeof error,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    }
    
    console.error('[analyze-file] ========== 최상위 오류 발생 ==========')
    console.error('[analyze-file] 오류 상세:', JSON.stringify(errorDetails, null, 2))
    
    const errorMessage = error?.message || '서버 오류가 발생했습니다.'
    const statusCode = error?.message?.includes('접근이 거부') ? 403 : 500

    // 항상 JSON 응답 반환 (Vercel 인프라 레벨 차단과 구분)
    return NextResponse.json<AnalyzeFileResponse>(
      { 
        success: false, 
        error: errorMessage,
        debug: {
          errorName: error?.name || undefined,
          timestamp: new Date().toISOString(),
        }
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}
