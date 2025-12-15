import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/r2'

/**
 * R2 이미지 프록시 API
 * R2 버킷이 공개되지 않은 경우 서버를 통해 이미지를 제공합니다.
 * 
 * GET /api/images/proxy?key={file-key}
 */
export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { error: 'key 파라미터가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('[images/proxy] 이미지 프록시 요청:', { key })

    // R2에서 파일 다운로드
    const fileBuffer = await downloadFile(key)
    
    // 파일 확장자로 Content-Type 결정
    const extension = key.split('.').pop()?.toLowerCase() || 'jpeg'
    const contentTypeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    }
    const contentType = contentTypeMap[extension] || 'image/jpeg'

    console.log('[images/proxy] 이미지 프록시 성공:', {
      key,
      contentType,
      size: fileBuffer.length,
    })

    // Buffer를 Uint8Array로 변환하여 NextResponse에 전달
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[images/proxy] 이미지 프록시 오류:', error)
    return NextResponse.json(
      { error: '이미지를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

