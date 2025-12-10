'use client'

import { useState, useRef } from 'react'
import { EMOTIONS, MAX_PDF_SIZE_BYTES, MAX_OTHER_FILE_SIZE_BYTES, MAX_PDF_SIZE_MB, MAX_OTHER_FILE_SIZE_MB } from '@/lib/constants'

interface FileUploadPanelProps {
  onFileSelect: (file: File, description?: string, emotionTag?: string) => void
  isAnalyzing: boolean
}

export default function FileUploadPanel({
  onFileSelect,
  isAnalyzing,
}: FileUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [emotionTag, setEmotionTag] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    const allowedExtensions = ['txt', 'md', 'pdf', 'docx']
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (!extension || !allowedExtensions.includes(extension)) {
      alert('지원하지 않는 파일 형식입니다. (txt, md, pdf, docx만 지원)')
      return
    }

    // 파일 크기 제한
    const maxSize = extension === 'pdf' ? MAX_PDF_SIZE_BYTES : MAX_OTHER_FILE_SIZE_BYTES
    const maxSizeMB = extension === 'pdf' ? MAX_PDF_SIZE_MB : MAX_OTHER_FILE_SIZE_MB
    if (selectedFile.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`)
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleSubmit = () => {
    if (!file) {
      alert('파일을 선택해주세요.')
      return
    }

    onFileSelect(file, description || undefined, emotionTag || undefined)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-[#111] rounded-xl p-6 space-y-6">
      {/* Hero 섹션 */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">
          AI에게 실패 기록을 맡겨보세요.
        </h2>
        <p className="text-gray-300 leading-relaxed">
          PDF나 글 파일을 올리면, AI가 감정과 내용의 흐름을 정리해주고
          <br />
          그 내용을 바탕으로 함께 이야기할 수 있습니다.
        </p>
        <p className="text-xs text-gray-400">
          ※ 이 기능은 전문적인 상담이나 치료가 아닌, 감정 정리를 돕는 도구입니다.
        </p>
      </div>

      {/* 파일 업로드 박스 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-reloop-blue bg-reloop-blue/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        {file ? (
          <div className="space-y-2">
            <div className="text-reloop-blue text-4xl mb-2">✓</div>
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
            <button
              onClick={() => {
                setFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="text-gray-400 hover:text-white text-sm mt-2"
            >
              다른 파일 선택
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400 text-4xl">📄</div>
            <div>
              <p className="text-white mb-2">파일을 드래그하거나 클릭하여 업로드</p>
              <p className="text-gray-400 text-sm">txt, md, pdf, docx (PDF 최대 {MAX_PDF_SIZE_MB}MB, 기타 최대 {MAX_OTHER_FILE_SIZE_MB}MB)</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-reloop-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              파일 선택
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx,application/pdf,text/plain,text/markdown"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* 추가 입력 필드 */}
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            이 파일은 어떤 실패에 대한 기록인가요? (선택)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 스타트업 면접 실패"
            className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="emotionTag" className="block text-sm font-medium text-gray-300 mb-2">
            지금 느끼는 감정 (선택)
          </label>
          <select
            id="emotionTag"
            value={emotionTag}
            onChange={(e) => setEmotionTag(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
          >
            <option value="">선택하세요</option>
            {EMOTIONS.filter((e) => e.id !== 'all').map((emotion) => (
              <option key={emotion.id} value={emotion.label}>
                {emotion.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CTA 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={!file || isAnalyzing}
        className="w-full bg-reloop-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>AI 분석 중...</span>
          </>
        ) : (
          <span>AI에게 분석 요청하기</span>
        )}
      </button>
    </div>
  )
}

