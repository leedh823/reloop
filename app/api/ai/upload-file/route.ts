import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

/**
 * 파일을 Vercel Blob에 업로드하는 엔드포인트
 * 
 * 참고: Vercel의 4.5MB 제한 때문에, 이 API는 4MB 이하 파일만 처리합니다.
 * 4MB 이상 파일은 현재 지원되지 않습니다.
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('[upload-file] 업로드 요청 시작')
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('[upload-file] 파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // 파일 크기 체크 (4MB 제한)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: `파일이 너무 큽니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB). 이 API는 4MB 이하 파일만 지원합니다.`,
        },
        { status: 413 }
      )
    }

    // Vercel Blob에 업로드
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // 파일명 충돌 방지
    })

    console.log('[upload-file] Blob 업로드 성공:', {
      url: blob.url,
      pathname: blob.pathname,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error: any) {
    console.error('[upload-file] 업로드 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '파일 업로드 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
