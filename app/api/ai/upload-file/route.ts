import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl, generateFileKey, getPublicUrl } from '@/lib/r2'

/**
 * Presigned URL 생성 API
 * 
 * POST /api/ai/upload-file
 * Body: { filename: string, contentType: string, fileSize: number }
 * Response: { uploadUrl: string, key: string, publicUrl: string }
 */
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // R2 설정 확인
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      console.error('[upload-file] R2 환경 변수가 설정되지 않았습니다.')
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudflare R2가 설정되지 않았습니다. 환경 변수를 확인해주세요.\n\n필수 환경 변수:\n- R2_ACCOUNT_ID\n- R2_ACCESS_KEY_ID\n- R2_SECRET_ACCESS_KEY\n- R2_BUCKET_NAME',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { filename, contentType, fileSize } = body

    if (!filename || !fileSize) {
      return NextResponse.json(
        { success: false, error: '파일명과 파일 크기가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('[upload-file] Presigned URL 생성 요청:', {
      filename,
      contentType,
      fileSize,
    })

    // 파일 크기 체크 (50MB 제한)
    const maxSize = 50 * 1024 * 1024
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `파일이 너무 큽니다 (${(fileSize / (1024 * 1024)).toFixed(1)}MB). 최대 50MB까지 지원합니다.`,
        },
        { status: 413 }
      )
    }

    // 고유한 파일 키 생성
    const key = generateFileKey(filename)

    // Presigned URL 생성 (1시간 유효)
    const uploadUrl = await generateUploadUrl(
      key,
      contentType || 'application/octet-stream',
      3600 // 1시간
    )

    // 공개 URL 생성
    const publicUrl = getPublicUrl(key)

    console.log('[upload-file] Presigned URL 생성 성공:', {
      key,
      hasUploadUrl: !!uploadUrl,
      publicUrl,
    })

    return NextResponse.json({
      success: true,
      uploadUrl, // 클라이언트에서 이 URL로 직접 업로드
      key, // 파일 키
      publicUrl, // 업로드 후 접근 가능한 공개 URL
    })
  } catch (error: any) {
    console.error('[upload-file] Presigned URL 생성 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Presigned URL 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

// GET 요청 처리 (405)
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: '이 엔드포인트는 POST 메서드만 지원합니다.',
    },
    { status: 405 }
  )
}
