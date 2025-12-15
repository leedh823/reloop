'use client'

import { useRef, useState } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'

export interface AnalyzeInputProps {
  inputText: string
  onInputChange: (text: string) => void
  selectedCategory?: string
  onCategoryChange: (category: string) => void
  selectedEmotion?: string
  onEmotionChange: (emotion: string) => void
  onFileUploaded?: (text: string) => void
  onInputModeChange?: (mode: 'text' | 'file') => void
}

export default function AnalyzeInput({
  inputText,
  onInputChange,
  selectedCategory,
  onCategoryChange,
  selectedEmotion,
  onEmotionChange,
  onFileUploaded,
  onInputModeChange,
}: AnalyzeInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('PDF 또는 이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert(`파일이 너무 큽니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`)
      return
    }

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
          contentType: file.type || 'application/pdf',
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
          'Content-Type': file.type || 'application/pdf',
        },
      })

      if (!uploadResult.ok) {
        throw new Error('파일 업로드 실패')
      }

      // 3. 파일 파싱 (PDF인 경우)
      if (file.type === 'application/pdf' || fileExtension === '.pdf') {
        const parseResponse = await fetch('/api/files/parse', {
          method: 'POST',
          body: (() => {
            const formData = new FormData()
            formData.append('blobUrl', publicUrl)
            formData.append('fileKey', key)
            return formData
          })(),
        })

        if (parseResponse.ok) {
          const parseData = await parseResponse.json()
          // PDF 파싱 결과가 있으면 텍스트로 변환
          if (parseData.extractedText) {
            const extractedText = parseData.extractedText
            onInputChange(extractedText)
            if (onFileUploaded) {
              onFileUploaded(extractedText)
            }
          } else {
            // 파싱 결과가 없으면 파일 정보만 표시
            const fileInfo = `파일이 업로드되었습니다: ${file.name}\n\n파일 내용을 분석합니다.`
            onInputChange(fileInfo)
            if (onFileUploaded) {
              onFileUploaded(fileInfo)
            }
          }
        } else {
          // 파싱 실패해도 파일은 업로드됨
          const fileInfo = `파일이 업로드되었습니다: ${file.name}\n\n파일 내용을 분석합니다.`
          onInputChange(fileInfo)
          if (onFileUploaded) {
            onFileUploaded(fileInfo)
          }
        }
      } else {
        // 이미지 파일인 경우 - 파일 정보를 텍스트로 입력
        const imageInfo = `이미지 파일이 업로드되었습니다: ${file.name}\n\n이미지 내용을 분석합니다.`
        onInputChange(imageInfo)
        if (onFileUploaded) {
          onFileUploaded(imageInfo)
        }
      }
    } catch (error: any) {
      console.error('[AnalyzeInput] 파일 업로드 오류:', error)
      alert(`파일 업로드 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
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

  return (
    <div className="space-y-4">
      {/* 입력 방식 탭 */}
      <div className="flex gap-2 border-b border-[#2A2A2A]">
        <button
          type="button"
          onClick={() => {
            setInputMode('text')
            onInputModeChange?.('text')
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === 'text'
              ? 'text-reloop-blue border-b-2 border-reloop-blue'
              : 'text-[#B3B3B3]'
          }`}
        >
          텍스트 입력
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('file')
            onInputModeChange?.('file')
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            inputMode === 'file'
              ? 'text-reloop-blue border-b-2 border-reloop-blue'
              : 'text-[#B3B3B3]'
          }`}
        >
          파일 업로드
        </button>
      </div>

      {/* 텍스트 입력 */}
      {inputMode === 'text' && (
        <div>
          <label htmlFor="analyze-text" className="block text-sm font-medium text-white mb-2">
            분석할 내용을 입력하세요
          </label>
          <textarea
            id="analyze-text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent resize-none min-h-[200px]"
            placeholder="실패 경험, 문제 상황, 고민 등을 자유롭게 작성해주세요..."
          />
        </div>
      )}

      {/* 파일 업로드 */}
      {inputMode === 'file' && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            파일 선택
          </label>
          {selectedFile ? (
            <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-[#777777]">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-400 text-sm min-h-[44px] px-3"
                  disabled={uploading}
                >
                  삭제
                </button>
              </div>
              {uploading && (
                <p className="text-xs text-reloop-blue mt-2">
                  파일 업로드 중...
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white cursor-pointer hover:bg-[#252525] transition-colors"
              >
                <span className="mr-2">📄</span>
                <span>PDF 또는 이미지 파일 선택</span>
              </label>
              <input
                id="file-input"
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* 카테고리 선택 */}
      <div>
        <label htmlFor="analyze-category" className="block text-sm font-medium text-white mb-2">
          카테고리 (선택)
        </label>
        <select
          id="analyze-category"
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
        >
          <option value="">선택 안 함</option>
          {CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 감정 선택 */}
      <div>
        <label htmlFor="analyze-emotion" className="block text-sm font-medium text-white mb-2">
          감정 (선택)
        </label>
        <select
          id="analyze-emotion"
          value={selectedEmotion || ''}
          onChange={(e) => onEmotionChange(e.target.value)}
          className="w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
        >
          <option value="">선택 안 함</option>
          {EMOTIONS.filter(emotion => emotion.id !== 'all').map((emotion) => (
            <option key={emotion.id} value={emotion.id}>
              {emotion.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}






