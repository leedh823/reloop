import { NextRequest, NextResponse } from 'next/server'
import { createMultipartUpload, uploadPart, completeMultipartUpload } from '@vercel/blob'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'

/**
 * 멀티파트 업로드 - 파트 업로드 API
 * 
 * POST /api/ai/upload-file/part
 * Body: FormData { file: File, uploadId: string, key: string, partNumber: number }
 * 
 * Response: { etag: string }
 */
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadId = formData.get('uploadId') as string | null
    const key = formData.get('key') as string | null
    const partNumberStr = formData.get('partNumber') as string | null

    if (!file || !uploadId || !key || !partNumberStr) {
      return NextResponse.json(
        { success: false, error: 'file, uploadId, key, partNumber가 필요합니다.' },
        { status: 400 }
      )
    }

    const partNumber = parseInt(partNumberStr, 10)

    console.log('[upload-file] 파트 업로드:', {
      partNumber,
      fileSize: file.size,
      uploadId,
      key,
    })

    // 파트 업로드 (각 파트는 4MB 이하)
    // uploadPart는 (pathname, body, options) 형태
    const { etag } = await uploadPart(key, file, {
      key,
      uploadId,
      partNumber,
      access: 'public',
    })

    console.log('[upload-file] 파트 업로드 완료:', {
      partNumber,
      etag,
    })

    return NextResponse.json({
      success: true,
      etag,
    })
  } catch (error: any) {
    console.error('[upload-file] 파트 업로드 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '파트 업로드 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

/**
 * 멀티파트 업로드 시작 API
 * 
 * PUT /api/ai/upload-file/start
 * Body: { filename: string, contentType?: string, fileSize: number }
 * 
 * Response: { uploadId: string, key: string, totalParts: number, partSize: number }
 */
export async function PUT(request: NextRequest) {
  try {
    // BLOB_READ_WRITE_TOKEN 확인
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[upload-file] BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.')
      return NextResponse.json(
        {
          success: false,
          error: 'Vercel Blob이 설정되지 않았습니다. Vercel 대시보드에서 Blob 스토리지를 생성해주세요.\n\n설정 방법:\n1. Vercel 대시보드 > Storage > Create Database > Blob\n2. Blob 스토리지 생성 시 BLOB_READ_WRITE_TOKEN이 자동 생성됩니다\n3. 재배포 필요',
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

    console.log('[upload-file] 멀티파트 업로드 시작 요청:', {
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

    // 멀티파트 업로드 생성
    // 각 파트는 서버를 통해 업로드되므로 Vercel의 4.5MB 제한을 받음
    // 하지만 Vercel Blob은 각 파트에 최소 크기 제한이 있음
    // 마지막 파트가 너무 작으면 이전 파트와 합치기
    const partSize = 4 * 1024 * 1024 // 4MB per part (Vercel 제한 고려)
    let totalParts = Math.ceil(fileSize / partSize)
    
    // 마지막 파트 크기 확인
    const lastPartSize = fileSize % partSize
    const minPartSize = 1 * 1024 * 1024 // 1MB 최소 크기 (Vercel Blob 제한)
    
    // 마지막 파트가 너무 작으면 (1MB 미만) 이전 파트와 합치기
    if (lastPartSize > 0 && lastPartSize < minPartSize && totalParts > 1) {
      totalParts = totalParts - 1
      console.log('[upload-file] 마지막 파트가 너무 작아서 파트 수 조정:', {
        originalParts: totalParts + 1,
        adjustedParts: totalParts,
        lastPartSize,
      })
    }

    console.log('[upload-file] 파트 크기 계산:', {
      fileSize,
      totalParts,
      partSize,
      lastPartSize: fileSize % partSize,
    })

    const { uploadId, key } = await createMultipartUpload(filename, {
      access: 'public',
      addRandomSuffix: true,
      contentType: contentType || 'application/octet-stream',
    })

    console.log('[upload-file] 멀티파트 업로드 생성 성공:', {
      uploadId,
      key,
      totalParts,
    })

    // 클라이언트에서 직접 업로드할 수 있도록 클라이언트 토큰 생성
    // 이 토큰을 사용하여 클라이언트에서 직접 Blob에 업로드 가능
    let clientToken: string | undefined = undefined
    
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('[upload-file] BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.')
        throw new Error('BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.')
      }

      clientToken = await generateClientTokenFromReadWriteToken({
        token: process.env.BLOB_READ_WRITE_TOKEN,
        pathname: key,
        allowedContentTypes: [contentType || 'application/octet-stream'],
      })

      console.log('[upload-file] 클라이언트 토큰 생성 성공:', { 
        hasToken: !!clientToken, 
        tokenType: typeof clientToken,
        tokenLength: clientToken?.length 
      })
    } catch (tokenError: any) {
      console.error('[upload-file] 클라이언트 토큰 생성 실패:', tokenError)
      // 토큰 생성 실패 시에도 업로드는 계속 진행 (서버를 통한 업로드로 폴백)
      // 하지만 클라이언트에서 직접 업로드를 시도하면 실패할 수 있음
    }

    return NextResponse.json({
      success: true,
      uploadId,
      key,
      totalParts,
      partSize,
      clientToken: clientToken || null, // 클라이언트에서 직접 업로드할 수 있는 토큰
    })
  } catch (error: any) {
    console.error('[upload-file] 멀티파트 업로드 시작 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '업로드 시작 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

/**
 * 멀티파트 업로드 완료 API
 * 
 * PATCH /api/ai/upload-file/complete
 * Body: { uploadId: string, key: string, parts: Array<{ partNumber: number, etag: string }> }
 * 
 * Response: { url: string, pathname: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('[upload-file] 멀티파트 업로드 완료 요청')
    
    const body = await request.json()
    const { uploadId, key, parts } = body

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { success: false, error: 'uploadId, key, parts가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('[upload-file] 완료 정보:', {
      uploadId,
      key,
      partsCount: parts.length,
    })

    // 멀티파트 업로드 완료
    // completeMultipartUpload는 (pathname, parts, options) 형태
    // uploadId와 key는 options 안에 포함
    const blob = await completeMultipartUpload(key, parts, {
      uploadId,
      key,
      access: 'public',
    })

    console.log('[upload-file] 멀티파트 업로드 완료 성공:', {
      url: blob.url,
      pathname: blob.pathname,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error: any) {
    console.error('[upload-file] 멀티파트 업로드 완료 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '업로드 완료 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
