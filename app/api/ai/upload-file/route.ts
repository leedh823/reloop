import { NextRequest, NextResponse } from 'next/server'
import { createMultipartUpload, uploadPart, completeMultipartUpload } from '@vercel/blob'

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
    const partSize = 4 * 1024 * 1024 // 4MB per part
    const totalParts = Math.ceil(fileSize / partSize)

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

    return NextResponse.json({
      success: true,
      uploadId,
      key,
      totalParts,
      partSize,
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
