import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

/**
 * 파일을 Vercel Blob에 업로드하는 엔드포인트
 * 클라이언트에서 직접 Blob에 업로드할 수도 있지만,
 * 서버를 통해 업로드하면 토큰 관리가 더 안전합니다.
 */
export const runtime = 'nodejs'
export const maxDuration = 30

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

