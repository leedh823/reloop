'use client'

import { useRef, useState } from 'react'

interface FileUploadSectionProps {
  onUploadSuccess: (fileUrl: string, fileName: string, fileType: string) => void
  onUploadError: (error: string) => void
  disabled?: boolean
}

export default function FileUploadSection({
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증 (이미지만 허용)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    if (!allowedImageTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      onUploadError('이미지 파일만 업로드할 수 있습니다. (JPG, PNG, GIF, WEBP)')
      return
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      onUploadError(`이미지가 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`)
      return
    }

    // PDF 파일인 경우 페이지 수는 서버에서 검증 (클라이언트에서는 파일 크기만 체크)

    setSelectedFile(file)
    setUploading(true)

    try {
      // 1. Presigned URL 생성
      const uploadResponse = await fetch('/api/ai/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'image/jpeg',
          fileSize: file.size,
        }),
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: '업로드 URL 생성 실패' }))
        throw new Error(errorData.error || '업로드 URL 생성 실패')
      }

      const { uploadUrl, publicUrl, key } = await uploadResponse.json()

      // 2. R2에 직접 파일 업로드
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
      })

      if (!uploadResult.ok) {
        throw new Error('파일 업로드 실패')
      }

      // 3. 파일 URL과 정보를 전달 (텍스트 추출 없이 바로 표시)
      onUploadSuccess(publicUrl, file.name, file.type || (fileExtension === 'pdf' ? 'application/pdf' : 'text/plain'))
    } catch (error: any) {
      console.error('[FileUploadSection] 업로드 오류:', error)
      onUploadError(error?.message || '파일 업로드 중 오류가 발생했습니다.')
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (selectedFile && !uploading) {
    return null // 파일이 업로드되면 섹션 숨김
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-5 mb-6">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white mb-1">
          관련 이미지가 있다면 올려보세요.
        </h3>
        <p className="text-xs text-[#777777]">
          사진을 찍거나 갤러리에서 선택할 수 있어요.
        </p>
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full min-h-[48px] px-4 py-3 bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg text-sm text-white cursor-pointer hover:bg-[#333333] transition-colors ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <span className="text-[#B3B3B3]">업로드 중...</span>
          ) : (
            <>
              <span className="mr-2">📷</span>
              <span>이미지 선택 (최대 10MB)</span>
            </>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  )
}

