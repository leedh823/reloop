'use client'

import { useRef, useState } from 'react'

interface FileUploadSectionProps {
  onUploadSuccess: (fileUrl: string, fileName: string, fileType: string) => void
  onUploadError: (error: string) => void
  disabled?: boolean
}

interface UploadedImage {
  url: string
  fileName: string
  fileType: string
}

export default function FileUploadSection({
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 여러 파일 처리
    const fileArray = Array.from(files)
    
    // 파일 타입 및 크기 검증
    for (const file of fileArray) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      
      if (!allowedImageTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        onUploadError(`${file.name}: 이미지 파일만 업로드할 수 있습니다. (JPG, PNG, GIF, WEBP)`)
        return
      }

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        onUploadError(`${file.name}: 이미지가 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`)
        return
      }
    }

    setUploading(true)

    // 모든 파일을 순차적으로 업로드
    for (const file of fileArray) {
      const fileId = `${file.name}-${Date.now()}`
      setUploadingFiles(prev => new Set(prev).add(fileId))

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

        // 3. 파일 URL과 정보를 전달 (각 파일마다 콜백 호출)
        onUploadSuccess(publicUrl, file.name, file.type || 'image/jpeg')
      } catch (error: any) {
        console.error('[FileUploadSection] 업로드 오류:', error)
        onUploadError(`${file.name}: ${error?.message || '파일 업로드 중 오류가 발생했습니다.'}`)
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev)
          next.delete(fileId)
          return next
        })
      }
    }

    setUploading(false)
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isUploading = uploadingFiles.size > 0

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
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full min-h-[48px] px-4 py-3 bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg text-sm text-white cursor-pointer hover:bg-[#333333] transition-colors ${
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <span className="text-[#B3B3B3]">업로드 중... ({uploadingFiles.size})</span>
          ) : (
            <>
              <span className="mr-2">📷</span>
              <span>이미지 선택 (여러 개 가능, 최대 10MB)</span>
            </>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>
    </div>
  )
}

