'use client'

import { useRef, useState } from 'react'

interface FileUploadSectionProps {
  onUploadSuccess: (preview: { bullets: string[]; possibleIssues: string[] }) => void
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

    // 파일 타입 검증
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt'].includes(fileExtension || '')) {
      onUploadError('PDF 또는 TXT 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      onUploadError(`파일이 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`)
      return
    }

    setSelectedFile(file)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || '파일 파싱에 실패했습니다.')
      }

      onUploadSuccess(data.structuredPreview)
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
          관련 자료가 있다면 파일을 올려보세요.
        </h3>
        <p className="text-xs text-[#777777]">
          파일 내용을 먼저 정리해서 보여드릴게요.
        </p>
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.txt"
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
              <span className="mr-2">📄</span>
              <span>PDF 또는 TXT 파일 선택 (최대 10MB)</span>
            </>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  )
}

