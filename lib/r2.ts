/**
 * Cloudflare R2 설정 및 유틸리티
 * 
 * 환경 변수 설정:
 * - R2_ACCOUNT_ID: Cloudflare R2 계정 ID
 * - R2_ACCESS_KEY_ID: R2 Access Key ID
 * - R2_SECRET_ACCESS_KEY: R2 Secret Access Key
 * - R2_BUCKET_NAME: R2 버킷 이름
 * - R2_PUBLIC_URL: R2 버킷의 공개 URL (선택적, CDN URL)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'

// R2는 S3 호환 API를 사용합니다
const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

// S3 클라이언트 생성
export const r2Client = new S3Client({
  region: 'auto', // R2는 'auto' 사용
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

/**
 * Presigned URL 생성 (업로드용)
 * @param key 파일 키 (경로)
 * @param contentType 파일 타입
 * @param expiresIn 만료 시간 (초, 기본 1시간)
 * @returns Presigned URL
 */
export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME 환경 변수가 설정되지 않았습니다.')
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * 파일 공개 URL 생성
 * @param key 파일 키
 * @returns 공개 URL
 */
export function getPublicUrl(key: string): string {
  // R2_PUBLIC_URL이 설정되어 있으면 사용, 없으면 기본 R2 URL 사용
  const baseUrl = process.env.R2_PUBLIC_URL || R2_ENDPOINT.replace('.r2.cloudflarestorage.com', '.r2.dev')
  return `${baseUrl}/${key}`
}

/**
 * R2에서 파일 다운로드 (서버에서 직접)
 * @param key 파일 키
 * @returns 파일 Buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME 환경 변수가 설정되지 않았습니다.')
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  const response = await r2Client.send(command)
  
  if (!response.Body) {
    throw new Error('파일을 다운로드할 수 없습니다.')
  }

  // Stream을 Buffer로 변환
  const stream = response.Body as Readable
  const chunks: Uint8Array[] = []
  
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  
  return Buffer.concat(chunks)
}

/**
 * 고유한 파일 키 생성
 * @param filename 원본 파일명
 * @returns 고유한 키
 */
export function generateFileKey(filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop() || ''
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')
  return `uploads/${timestamp}_${random}_${sanitizedName}.${extension}`
}

