import { NextRequest, NextResponse } from 'next/server'
import { extractText, getDocumentProxy } from 'unpdf'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * 파일 파싱 API
 * POST /api/files/parse
 * multipart/form-data로 파일 수신
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { ok: false, error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: `파일이 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`,
        },
        { status: 413 }
      )
    }

    // 파일 타입 검증
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedTypes = ['application/pdf', 'text/plain']
    const allowedExtensions = ['pdf', 'txt']

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension || '')
    ) {
      return NextResponse.json(
        { ok: false, error: '지원하지 않는 파일 형식입니다. (PDF, TXT만 지원)' },
        { status: 400 }
      )
    }

    console.log('[files/parse] 파일 파싱 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    let extractedText = ''

    // 파일 내용 추출
    if (fileExtension === 'txt') {
      extractedText = await file.text()
    } else if (fileExtension === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // unpdf 사용
        const { extractText, getDocumentProxy } = require('unpdf')
        const pdf = await getDocumentProxy(new Uint8Array(buffer))
        const numPages = pdf.numPages || 0

        console.log('[files/parse] PDF 문서 로드 완료:', { numPages })

        // extractText로 전체 텍스트 추출 시도
        let fullText = ''
        try {
          const extractResult = await extractText(pdf, { mergePages: true })

          if (typeof extractResult === 'string') {
            fullText = extractResult
          } else if (extractResult && typeof extractResult === 'object' && 'text' in extractResult) {
            fullText = extractResult.text || ''
          } else if (extractResult && typeof extractResult === 'object' && 'pages' in extractResult && Array.isArray(extractResult.pages)) {
            fullText = extractResult.pages.map((p: any) => p.text || '').join('\n')
          }
        } catch (extractError) {
          console.warn('[files/parse] extractText 실패, 페이지별 추출 시도')
        }

        // extractText가 실패하거나 빈 텍스트면 페이지별로 추출
        if (!fullText || fullText.trim().length === 0) {
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            try {
              const page = await pdf.getPage(pageNum)
              const textContent = await page.getTextContent()
              const pageText = textContent.items
                .map((item: any) => item.str || item.text || item.content || '')
                .filter((text: string) => text && text.trim().length > 0)
                .join(' ')

              if (pageText) {
                fullText += pageText + '\n'
              }
            } catch (pageError) {
              console.warn(`[files/parse] 페이지 ${pageNum} 추출 실패`)
            }
          }
        }

        extractedText = fullText.trim()

        if (!extractedText || extractedText.length === 0) {
          return NextResponse.json(
            { ok: false, error: 'PDF 파일에서 텍스트를 추출할 수 없습니다.' },
            { status: 400 }
          )
        }
      } catch (error: any) {
        console.error('[files/parse] PDF 파싱 오류:', error)
        return NextResponse.json(
          {
            ok: false,
            error: `PDF 파일 파싱 중 오류가 발생했습니다: ${error?.message}`,
          },
          { status: 500 }
        )
      }
    }

    console.log('[files/parse] 텍스트 추출 완료:', { textLength: extractedText.length })

    // 텍스트를 구조화된 미리보기로 변환
    const structuredPreview = parseTextToStructured(extractedText)

    return NextResponse.json({
      ok: true,
      extractedText,
      structuredPreview,
    })
  } catch (error: any) {
    console.error('[files/parse] 파일 파싱 오류:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || '파일 파싱 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

/**
 * 텍스트를 구조화된 미리보기로 변환
 */
function parseTextToStructured(text: string): {
  bullets: string[]
  possibleIssues: string[]
} {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
  
  const bullets: string[] = []
  const possibleIssues: string[] = []

  // 주요 내용 추출 (불릿 포인트, 번호 목록, 짧은 문장)
  lines.forEach((line) => {
    // 불릿 포인트나 번호 목록 패턴
    if (/^[•\-\*]\s+|^\d+[\.\)]\s+/.test(line)) {
      const content = line.replace(/^[•\-\*]\s+|^\d+[\.\)]\s+/, '').trim()
      if (content.length > 10 && content.length < 200) {
        bullets.push(content)
      }
    } else if (line.length > 20 && line.length < 150 && !line.includes('.')) {
      // 짧은 문장 (마침표 없는 경우)
      bullets.push(line)
    }
  })

  // 문제로 보이는 부분 추출 (부정적 키워드 포함)
  const negativeKeywords = [
    '실패', '문제', '오류', '에러', '부족', '미흡', '어려움', '장애',
    '실수', '잘못', '부족함', '부재', '없음', '실패함', '실패한',
    '문제점', '이슈', '리스크', '위험', '한계', '제약',
  ]

  lines.forEach((line) => {
    const hasNegativeKeyword = negativeKeywords.some((keyword) =>
      line.includes(keyword)
    )
    
    if (hasNegativeKeyword && line.length > 15 && line.length < 200) {
      // 중복 제거
      if (!possibleIssues.some((issue) => issue === line || issue.includes(line))) {
        possibleIssues.push(line)
      }
    }
  })

  // 최대 개수 제한
  return {
    bullets: bullets.slice(0, 10),
    possibleIssues: possibleIssues.slice(0, 8),
  }
}

