import { NextRequest, NextResponse } from 'next/server'
import { createFailure, getAllFailures } from '@/lib/db'
import { sendToDiscord } from '@/lib/discord'

export async function GET() {
  try {
    const failures = getAllFailures()
    return NextResponse.json(failures)
  } catch (error) {
    console.error('Error fetching failures:', error)
    return NextResponse.json(
      { error: '실패 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // 텍스트 필드 추출
    const title = formData.get('title') as string
    const summary = formData.get('summary') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const emotionTag = formData.get('emotionTag') as string
    const thumbnailUrl = formData.get('thumbnailUrl') as string | null
    const author = formData.get('author') as string | null
    const pdfFile = formData.get('pdfFile') as File | null

    // 필수 필드 검증
    if (!title || !summary || !content || !category || !emotionTag) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // PDF 파일 처리
    let finalPdfUrl: string | undefined = undefined

    if (pdfFile) {
      // 파일 크기 검증 (10MB 제한)
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'PDF 파일 크기가 너무 큽니다. (최대 10MB)' },
          { status: 400 }
        )
      }

      // 파일 타입 검증
      if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'PDF 파일만 업로드할 수 있습니다.' },
          { status: 400 }
        )
      }

      // TODO: Vercel 환경에서는 파일 시스템에 직접 저장할 수 없으므로,
      // 나중에 S3, Supabase Storage, Cloudinary 등의 외부 스토리지로 업로드해야 합니다.
      // 현재는 파일명만 저장하고, 실제 파일은 메모리에만 존재합니다.
      
      // 임시 처리: 파일명을 저장 (실제 프로덕션에서는 외부 스토리지 URL로 대체)
      const timestamp = Date.now()
      const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      finalPdfUrl = `uploaded/${timestamp}_${sanitizedFileName}`
      
      // TODO: 실제 파일을 외부 스토리지에 업로드하는 로직 추가 필요
      // 예: await uploadToS3(pdfFile, finalPdfUrl)
      // 또는: await uploadToSupabase(pdfFile, finalPdfUrl)
      
      console.log(`PDF 파일 업로드됨: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(2)} MB)`)
      console.log(`임시 저장 경로: ${finalPdfUrl}`)
    }

    const failure = createFailure({
      title,
      summary,
      content,
      category,
      emotionTag,
      pdfUrl: finalPdfUrl,
      thumbnailUrl: thumbnailUrl || undefined,
      author: author || undefined,
    })

    // Discord Webhook으로 전송
    await sendToDiscord({
      id: failure.id,
      title: failure.title,
      summary: failure.summary,
      category: failure.category,
      emotionTag: failure.emotionTag,
    })

    return NextResponse.json(failure, { status: 201 })
  } catch (error) {
    console.error('Error creating failure:', error)
    return NextResponse.json(
      { error: '실패를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

