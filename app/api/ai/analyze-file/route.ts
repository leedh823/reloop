import { NextRequest, NextResponse } from 'next/server'
import { AnalyzeFileResponse, FileAnalysisResult } from '@/types'
import { MAX_PDF_SIZE_BYTES, MAX_OTHER_FILE_SIZE_BYTES, MAX_TEXT_LENGTH, MAX_PDF_SIZE_MB, MAX_OTHER_FILE_SIZE_MB } from '@/lib/constants'

// Node.js Runtime 명시 (대용량 파일 처리 필수)
// Edge Runtime은 대용량 파일 처리 불가능하므로 Node.js 사용
export const runtime = 'nodejs'

// Vercel 함수 실행 시간 제한: 60초 (Pro 플랜 기준)
// Next.js는 조건부 표현식을 지원하지 않으므로 정적 값 사용
// vercel.json에서도 동일하게 설정됨
export const maxDuration = 60

// Next.js App Router는 기본적으로 큰 파일을 지원하지만, 명시적으로 설정
// bodyParser는 Pages Router에서만 사용 가능, App Router는 자동 처리

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[analyze-file] 요청 시작:', new Date().toISOString())
    
    // FormData 파싱 (대용량 파일 지원)
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error: any) {
      console.error('[analyze-file] FormData 파싱 오류:', {
        message: error?.message,
        name: error?.name,
      })
      return NextResponse.json<AnalyzeFileResponse>(
        { 
          success: false, 
          error: '파일 업로드 중 오류가 발생했습니다. 파일 크기가 너무 크거나 형식이 올바르지 않습니다.' 
        },
        { status: 400 }
      )
    }
    
    const file = formData.get('file') as File | null
    const description = formData.get('description') as string | null
    const emotionTag = formData.get('emotionTag') as string | null

    if (!file) {
      console.error('[analyze-file] 파일이 없음')
      return NextResponse.json<AnalyzeFileResponse>(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }
    
    console.log('[analyze-file] 파일 정보:', {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type,
    })

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

    // 파일 크기 체크 (50MB 이상 경고, 100MB 이상 거부)
    const maxSize = fileExtension === 'pdf' ? MAX_PDF_SIZE_BYTES : MAX_OTHER_FILE_SIZE_BYTES
    const maxSizeMB = fileExtension === 'pdf' ? MAX_PDF_SIZE_MB : MAX_OTHER_FILE_SIZE_MB
    const absoluteMaxSize = 100 * 1024 * 1024 // 100MB 절대 최대값
    
    if (file.size > absoluteMaxSize) {
      console.error('[analyze-file] 파일 크기 초과:', {
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        maxSizeMB: maxSizeMB,
        absoluteMaxMB: 100,
      })
      return NextResponse.json<AnalyzeFileResponse>(
        { 
          success: false, 
          error: `파일 용량이 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 100MB까지 지원합니다. 파일을 압축하거나 분할해주세요.` 
        },
        { status: 413 }
      )
    }
    
    if (file.size > maxSize) {
      console.warn('[analyze-file] 파일 크기 경고:', {
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        maxSizeMB: maxSizeMB,
      })
      // 경고만 하고 계속 진행 (50MB까지는 허용)
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
        const pdfStartTime = Date.now()
        console.log('[analyze-file] PDF 파싱 시작:', {
          fileName: file.name,
          fileSize: file.size,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        })
        
        // 메모리 사용량 모니터링
        const memBefore = process.memoryUsage()
        console.log('[analyze-file] 메모리 사용량 (파싱 전):', {
          heapUsed: (memBefore.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
          heapTotal: (memBefore.heapTotal / 1024 / 1024).toFixed(2) + 'MB',
          rss: (memBefore.rss / 1024 / 1024).toFixed(2) + 'MB',
        })
        
        // PDF 파일을 ArrayBuffer로 읽기 (스트림 방식으로 메모리 효율적 처리)
        let arrayBuffer: ArrayBuffer
        try {
          arrayBuffer = await file.arrayBuffer()
          console.log('[analyze-file] ArrayBuffer 생성 완료:', {
            arrayBufferSize: arrayBuffer.byteLength,
            arrayBufferSizeMB: (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2),
          })
        } catch (error: any) {
          console.error('[analyze-file] ArrayBuffer 생성 실패:', {
            message: error?.message,
            name: error?.name,
          })
          throw new Error(`파일을 읽는 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`)
        }
        
        const buffer = Buffer.from(arrayBuffer)
        console.log('[analyze-file] Buffer 생성 완료:', {
          bufferLength: buffer.length,
          bufferLengthMB: (buffer.length / (1024 * 1024)).toFixed(2),
        })
        
        // ArrayBuffer 메모리 해제 (가능한 경우)
        // @ts-ignore
        if (arrayBuffer && typeof arrayBuffer.detach === 'function') {
          try {
            // @ts-ignore
            arrayBuffer.detach()
          } catch (e) {
            // detach가 지원되지 않는 환경에서는 무시
          }
        }
        
        // pdf-parse를 require로 로드 (Node.js Runtime에서 안정적)
        let PDFParse: any
        try {
          // Node.js 런타임에서는 require 사용
          // @ts-ignore - pdf-parse는 CommonJS 모듈
          const pdfParseModule = require('pdf-parse')
          
          console.log('[analyze-file] pdf-parse 모듈 로드 시도:', {
            moduleType: typeof pdfParseModule,
            hasPDFParse: !!pdfParseModule?.PDFParse,
            keys: pdfParseModule ? Object.keys(pdfParseModule).slice(0, 10) : [],
          })
          
          // PDFParse 클래스 추출
          if (pdfParseModule && pdfParseModule.PDFParse) {
            PDFParse = pdfParseModule.PDFParse
            console.log('[analyze-file] PDFParse 클래스 로드 성공 (PDFParse 속성)')
          } else {
            // 모듈 구조 확인
            console.error('[analyze-file] PDFParse를 찾을 수 없음:', {
              module: pdfParseModule,
              type: typeof pdfParseModule,
              keys: pdfParseModule ? Object.keys(pdfParseModule) : 'null',
            })
            throw new Error(`PDFParse 클래스를 찾을 수 없습니다. 모듈 타입: ${typeof pdfParseModule}`)
          }
          
          if (typeof PDFParse !== 'function') {
            throw new Error(`PDFParse가 함수/클래스가 아닙니다. 타입: ${typeof PDFParse}`)
          }
          
          console.log('[analyze-file] pdf-parse 모듈 로드 완료 (PDFParse 클래스)')
        } catch (error: any) {
          // 상세한 오류 로깅
          console.error('='.repeat(60))
          console.error('[analyze-file] pdf-parse 모듈 로드 실패!')
          console.error('='.repeat(60))
          console.error('오류 메시지:', error?.message)
          console.error('오류 타입:', error?.name)
          console.error('오류 코드:', error?.code)
          console.error('스택 트레이스:', error?.stack?.substring(0, 1000))
          console.error('='.repeat(60))
          
          // 모듈 경로 확인
          try {
            const fs = require('fs')
            const path = require('path')
            const pdfParsePath = path.join(process.cwd(), 'node_modules', 'pdf-parse')
            const exists = fs.existsSync(pdfParsePath)
            console.error('pdf-parse 모듈 경로:', pdfParsePath)
            console.error('모듈 존재 여부:', exists)
            if (exists) {
              const packageJson = path.join(pdfParsePath, 'package.json')
              if (fs.existsSync(packageJson)) {
                const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'))
                console.error('pdf-parse 버전:', pkg.version)
                console.error('main 필드:', pkg.main)
              }
            }
          } catch (pathError) {
            console.error('경로 확인 실패:', pathError)
          }
          
          throw new Error(`PDF 파싱 라이브러리를 로드할 수 없습니다: ${error?.message || '알 수 없는 오류'}. 서버 로그를 확인해주세요.`)
        }
        
        // PDF 파싱 옵션 설정 (메모리 최적화)
        const parseOptions: any = {
          max: 0, // 0 = 모든 페이지
          version: '1.10.100', // 버전 체크 비활성화
        }
        
        // 큰 파일(20MB 이상)의 경우 추가 최적화
        if (file.size > 20 * 1024 * 1024) {
          console.log('[analyze-file] 큰 파일 감지 (20MB+), 메모리 최적화 모드 활성화')
          // 큰 파일의 경우 타임아웃을 더 길게 설정
        }
        
        // 타임아웃 설정 (큰 파일을 위해 120초로 증가)
        const timeoutDuration = file.size > 20 * 1024 * 1024 ? 120000 : 90000
        console.log(`[analyze-file] PDF 파싱 시작 (타임아웃: ${timeoutDuration / 1000}초)`)
        
        // PDFParse 클래스를 사용하여 PDF 파싱
        let pdfData: any
        try {
          console.log('[analyze-file] PDFParse 인스턴스 생성 및 파싱 시작...')
          
          // PDFParse 인스턴스 생성
          const pdfParser = new PDFParse({ data: buffer })
          
          // getText() 메서드를 사용하여 텍스트 추출
          const parsePromise = pdfParser.getText(parseOptions)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => {
              reject(new Error('PDF 파싱 시간이 초과되었습니다. 파일이 너무 복잡하거나 크기가 큽니다.'))
            }, timeoutDuration)
          )
          
          const textResult = await Promise.race([parsePromise, timeoutPromise]) as any
          
          // 결과를 기존 형식으로 변환
          pdfData = {
            text: textResult.text || '',
            numpages: textResult.total || 0,
          }
          
          console.log('[analyze-file] PDFParse 파싱 성공')
        } catch (parseError: any) {
          // 파싱 오류를 더 구체적으로 처리
          console.error('[analyze-file] PDF 파싱 중 오류:', {
            message: parseError?.message,
            name: parseError?.name,
            code: parseError?.code,
            stack: parseError?.stack?.substring(0, 500),
          })
          
          // 함수가 아니라는 오류인지 확인
          if (parseError?.message?.includes('is not a function') || 
              parseError?.message?.includes('함수가 아닙니다')) {
            throw new Error(`PDF 파싱 라이브러리 오류: ${parseError.message}. 서버 설정을 확인해주세요.`)
          }
          
          // 타임아웃인지 확인
          if (parseError?.message?.includes('초과') || parseError?.message?.includes('timeout')) {
            throw new Error(`PDF 파일 분석 시간이 초과되었습니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n파일이 너무 크거나 복잡합니다. 파일을 압축하거나 더 작은 파일로 분할해주세요.`)
          }
          
          // 메모리 오류인지 확인
          if (parseError?.message?.includes('memory') || 
              parseError?.message?.includes('메모리') || 
              parseError?.message?.includes('allocation') ||
              parseError?.code === 'ENOMEM') {
            throw new Error(`PDF 파일이 너무 커서 메모리 부족이 발생했습니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n파일을 압축하거나 30MB 이하로 줄여주세요.`)
          }
          
          // 기타 오류는 원본 메시지와 함께 재발생
          throw parseError
        }
        
        const memAfter = process.memoryUsage()
        console.log('[analyze-file] PDF 파싱 완료:', {
          textLength: pdfData.text?.length || 0,
          numPages: pdfData.numpages || 0,
          parsingTime: ((Date.now() - pdfStartTime) / 1000).toFixed(2) + '초',
          memoryUsed: ((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2) + 'MB',
        })
        
        textContent = pdfData.text || ''
        originalLength = textContent.length
        
        // 메모리 정리 시도
        try {
          buffer.fill(0)
        } catch (e) {
          // 버퍼 정리 실패는 무시
        }
        
        // pdfData 참조 해제
        pdfData = null
        
        if (!textContent || textContent.trim().length === 0) {
          console.warn('[analyze-file] PDF에서 텍스트를 추출할 수 없음')
          return NextResponse.json<AnalyzeFileResponse>(
            { 
              success: false, 
              error: 'PDF 파일에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF인지 확인해주세요. (이미지만 포함된 PDF는 지원하지 않습니다)' 
            },
            { status: 400 }
          )
        }
        
        console.log('[analyze-file] 텍스트 추출 성공:', {
          textLength: textContent.length,
          textLengthKB: (textContent.length / 1024).toFixed(2),
        })
      } catch (error: any) {
        // 상세한 오류 로깅
        const errorDetails = {
          message: error?.message || 'Unknown error',
          stack: error?.stack?.substring(0, 1000),
          name: error?.name,
          code: error?.code,
          errno: error?.errno,
          fileSize: file.size,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
          fileName: file.name,
          memoryUsage: {
            heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB',
            heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + 'MB',
            rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB',
          },
        }
        
        // 터미널에 상세 오류 출력
        console.error('='.repeat(60))
        console.error('[analyze-file] PDF 파싱 오류 발생!')
        console.error('='.repeat(60))
        console.error('파일명:', file.name)
        console.error('파일 크기:', (file.size / (1024 * 1024)).toFixed(2), 'MB')
        console.error('오류 메시지:', error?.message)
        console.error('오류 타입:', error?.name)
        console.error('오류 코드:', error?.code)
        console.error('메모리 사용량:', errorDetails.memoryUsage)
        if (error?.stack) {
          console.error('스택 트레이스:')
          console.error(error.stack.substring(0, 1000))
        }
        console.error('='.repeat(60))
        
        // JSON 형식으로도 로깅
        console.error('[analyze-file] PDF 파싱 오류 (JSON):', JSON.stringify(errorDetails, null, 2))
        
        // 구체적인 오류 메시지 제공
        let errorMessage = 'PDF 파일을 읽는 중 오류가 발생했습니다.'
        let statusCode = 500
        
        const errorMsg = error?.message || ''
        const errorName = error?.name || ''
        const errorCode = error?.code || ''
        
        // 타임아웃 오류
        if (errorMsg.includes('시간이 초과') || 
            errorMsg.includes('timeout') || 
            errorMsg.includes('초과') ||
            errorCode === 'ETIMEDOUT') {
          errorMessage = `PDF 파일 분석 시간이 초과되었습니다. 파일이 너무 크거나 복잡합니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n파일을 압축하거나 더 작은 파일로 분할해주세요.`
          statusCode = 408
        } 
        // 메모리 오류
        else if (errorMsg.includes('memory') || 
                 errorMsg.includes('메모리') || 
                 errorMsg.includes('Memory') || 
                 errorMsg.includes('heap') || 
                 errorMsg.includes('allocation') ||
                 errorCode === 'ENOMEM' ||
                 errorName === 'RangeError') {
          errorMessage = `PDF 파일이 너무 커서 메모리 부족이 발생했습니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n파일을 압축하거나 30MB 이하로 줄여주세요.`
          statusCode = 413
        } 
        // 손상된 파일 오류
        else if (errorMsg.includes('corrupt') || 
                 errorMsg.includes('손상') || 
                 errorMsg.includes('invalid') || 
                 errorMsg.includes('malformed') ||
                 errorMsg.includes('Invalid PDF')) {
          errorMessage = 'PDF 파일이 손상되었거나 읽을 수 없는 형식입니다. 다른 PDF 파일을 시도해주세요.'
          statusCode = 400
        } 
        // 모듈 로드 오류
        else if (errorMsg.includes('Cannot find module') || 
                 errorMsg.includes('require') || 
                 errorMsg.includes('모듈') ||
                 errorCode === 'MODULE_NOT_FOUND') {
          errorMessage = 'PDF 파싱 라이브러리를 찾을 수 없습니다. 서버 설정을 확인해주세요.'
          statusCode = 500
        } 
        // 파일 읽기 오류
        else if (errorMsg.includes('파일을 읽는 중') || 
                 errorMsg.includes('read') ||
                 errorCode === 'ENOENT') {
          errorMessage = errorMsg || '파일을 읽는 중 오류가 발생했습니다.'
          statusCode = 400
        } 
        // 기타 오류 - 원본 메시지 포함
        else {
          // 원본 오류 메시지가 있으면 포함
          const originalMsg = errorMsg ? `\n\n오류 상세: ${errorMsg}` : ''
          errorMessage = `PDF 파일을 읽는 중 오류가 발생했습니다. (파일 크기: ${(file.size / (1024 * 1024)).toFixed(1)}MB)${originalMsg}\n\n파일이 너무 크거나 복잡할 수 있습니다. 파일을 압축하거나 더 작은 파일로 시도해주세요.`
        }
        
        return NextResponse.json<AnalyzeFileResponse>(
          { 
            success: false, 
            error: errorMessage
          },
          { status: statusCode }
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
    // Vercel에서는 환경 변수가 런타임에 로드되므로 명시적으로 확인
    // 여러 방법으로 환경 변수 확인 시도
    let apiKey = process.env.OPENAI_API_KEY?.trim()
    
    // 환경 변수가 없으면 다른 가능한 이름도 확인
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY?.trim() || 
               process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim() ||
               process.env.OPENAI_KEY?.trim() ||
               undefined
    }
    
    // 디버깅: 환경 변수 상태 로깅 (Vercel 함수 로그에서 확인 가능)
    const envCheck = {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'undefined',
      startsWithSk: apiKey?.startsWith('sk-') || false,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      allEnvKeys: Object.keys(process.env).filter(k => 
        k.toUpperCase().includes('OPENAI') || 
        k.toUpperCase().includes('API') ||
        k.toUpperCase().includes('KEY')
      ).join(', '),
      // 실제 환경 변수 값들 (일부만)
      envVarSamples: Object.keys(process.env)
        .filter(k => k.toUpperCase().includes('OPENAI') || k.toUpperCase().includes('API'))
        .reduce((acc: any, k) => {
          const val = process.env[k]
          acc[k] = {
            exists: !!val,
            length: val?.length || 0,
            prefix: val ? `${val.substring(0, 7)}...` : 'undefined',
          }
          return acc
        }, {}),
    }
    
    console.log('[analyze-file] API Key 체크 (상세):', JSON.stringify(envCheck, null, 2))
    
    if (!apiKey) {
      console.error('[analyze-file] ❌ OPENAI_API_KEY가 설정되지 않았습니다.')
      console.error('[analyze-file] 사용 가능한 환경 변수:', envCheck.allEnvKeys)
      console.error('[analyze-file] Vercel 환경:', process.env.VERCEL_ENV)
      console.error('[analyze-file] Vercel 여부:', process.env.VERCEL)
      console.error('[analyze-file] 환경 변수 샘플:', JSON.stringify(envCheck.envVarSamples, null, 2))
      
      const errorMsg = `AI 서비스가 설정되지 않았습니다.\n\n현재 상태:\n- 환경 변수 존재: ${envCheck.exists ? '예' : '아니오'}\n- Vercel 환경: ${process.env.VERCEL_ENV || '로컬'}\n- 사용 가능한 환경 변수: ${envCheck.allEnvKeys || '없음'}\n\n해결 방법:\n1. Vercel 대시보드 → Settings → Environment Variables\n2. OPENAI_API_KEY 추가 (sk-로 시작하는 실제 API 키)\n3. Production, Preview, Development 모두 체크\n4. Save 후 반드시 Redeploy 실행\n\n환경 변수 확인:\n- /api/debug/env\n- /api/ai/test-env`
      
      return NextResponse.json<AnalyzeFileResponse>(
        { 
          success: false, 
          error: errorMsg
        },
        { status: 500 }
      )
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error('[analyze-file] ❌ OPENAI_API_KEY 형식이 올바르지 않습니다.')
      console.error('[analyze-file] API 키 접두사:', apiKey.substring(0, 10))
      console.error('[analyze-file] API 키 길이:', apiKey.length)
      
      return NextResponse.json<AnalyzeFileResponse>(
        { 
          success: false, 
          error: `API 키 형식이 올바르지 않습니다.\n\n현재 접두사: ${apiKey.substring(0, 10)}...\n길이: ${apiKey.length}\n\n올바른 OpenAI API 키는 'sk-'로 시작해야 합니다.\nVercel 대시보드에서 환경 변수를 확인하고 올바른 API 키로 업데이트하세요.` 
        },
        { status: 500 }
      )
    }
    
    console.log('[analyze-file] ✅ API Key 확인 완료:', {
      length: apiKey.length,
      prefix: apiKey.substring(0, 7),
      startsWithSk: true,
    })

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
        } else {
          // 일반적인 403 오류 - 환경 변수 문제 가능성
          errorMessage = `OpenAI API 접근이 거부되었습니다.\n\n가능한 원인:\n1. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.\n2. 환경 변수 설정 후 재배포가 필요합니다.\n3. API 키가 유효하지 않거나 만료되었습니다.\n\n해결 방법:\n- Vercel 대시보드 → Settings → Environment Variables에서 OPENAI_API_KEY 확인\n- 환경 변수 설정 후 반드시 Redeploy 실행\n- /api/debug/env 엔드포인트에서 환경 변수 상태 확인`
        }
        
        // Vercel 환경에서 환경 변수 상태도 함께 반환
        const envStatus = {
          hasApiKey: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          startsWithSk: apiKey?.startsWith('sk-') || false,
          vercelEnv: process.env.VERCEL_ENV || 'local',
        }
        
        console.error('[analyze-file] 403 오류 - 환경 변수 상태:', JSON.stringify(envStatus, null, 2))
        
        return NextResponse.json<AnalyzeFileResponse>(
          { 
            success: false, 
            error: errorMessage,
            // 개발 환경에서만 환경 변수 상태 포함
            ...(process.env.NODE_ENV !== 'production' && { debug: envStatus })
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
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
    
    // 최상위 레벨 오류 로깅
    console.error('='.repeat(60))
    console.error('[analyze-file] 파일 분석 전체 오류 발생!')
    console.error('='.repeat(60))
    console.error('오류 메시지:', error?.message)
    console.error('오류 타입:', error?.name)
    console.error('오류 코드:', error?.code)
    console.error('처리 시간:', totalTime, '초')
    console.error('메모리 사용량:', {
      heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + 'MB',
      rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB',
    })
    if (error?.stack) {
      console.error('스택 트레이스:')
      console.error(error.stack.substring(0, 1500))
    }
    console.error('='.repeat(60))
    
    // 구체적인 오류 메시지 제공
    let errorMessage = '서버 오류가 발생했습니다.'
    let statusCode = 500
    
    if (error?.message?.includes('timeout') || error?.message?.includes('타임아웃') || error?.message?.includes('초과')) {
      errorMessage = '요청 시간이 초과되었습니다. 파일이 너무 크거나 복잡합니다. 잠시 후 다시 시도하거나 파일을 압축해주세요.'
      statusCode = 408
    } else if (error?.message?.includes('memory') || error?.message?.includes('메모리') || error?.message?.includes('allocation')) {
      errorMessage = '메모리 부족으로 파일을 처리할 수 없습니다. 파일 크기를 줄여주세요.'
      statusCode = 413
    } else if (error?.message?.includes('ENOENT') || error?.message?.includes('파일을 찾을 수 없')) {
      errorMessage = '파일을 찾을 수 없습니다. 파일을 다시 업로드해주세요.'
      statusCode = 400
    } else if (error?.message?.includes('파일 크기') || error?.message?.includes('too large')) {
      errorMessage = '파일 크기가 너무 큽니다. 파일을 압축하거나 분할해주세요.'
      statusCode = 413
    } else if (error?.message?.includes('FormData') || error?.message?.includes('파싱')) {
      errorMessage = '파일 업로드 중 오류가 발생했습니다. 파일 형식과 크기를 확인해주세요.'
      statusCode = 400
    }
    
    return NextResponse.json<AnalyzeFileResponse>(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: statusCode }
    )
  }
}

