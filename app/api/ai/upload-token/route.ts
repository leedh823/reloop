import { NextRequest, NextResponse } from 'next/server'

/**
 * Vercel Blob 업로드 토큰 생성 API
 * 클라이언트에서 직접 Blob에 업로드할 수 있도록 토큰을 제공합니다.
 */
export const runtime = 'nodejs'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    // 파일명과 크기를 쿼리 파라미터로 받음
    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('filename') || 'file'
    const fileSize = parseInt(searchParams.get('size') || '0', 10)

    console.log('[upload-token] 토큰 요청:', { filename, fileSize })

    // Vercel Blob 업로드 토큰 생성
    // 참고: 실제로는 @vercel/blob의 generateBlobUploadUrl을 사용해야 하지만,
    // 클라이언트에서 직접 업로드하려면 다른 방법이 필요합니다.
    
    // 대신 서버에서 업로드 URL을 생성하는 방식으로 변경
    // 클라이언트에서는 이 URL로 직접 업로드
    
    return NextResponse.json({
      success: true,
      message: '토큰 생성 API - 클라이언트 직접 업로드 방식으로 변경 필요',
    })
  } catch (error: any) {
    console.error('[upload-token] 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '토큰 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

