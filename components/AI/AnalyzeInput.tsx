'use client'

import { useRef, useState } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'

interface AnalyzeInputProps {
  inputText: string
  onInputChange: (text: string) => void
  selectedCategory?: string
  onCategoryChange: (category: string) => void
  selectedEmotion?: string
  onEmotionChange: (emotion: string) => void
}

export default function AnalyzeInput({
  inputText,
  onInputChange,
  selectedCategory,
  onCategoryChange,
  selectedEmotion,
  onEmotionChange,
}: AnalyzeInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // TODO: 9단계에서 실제 파일 업로드/파싱 구현 예정
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
          onClick={() => setInputMode('text')}
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
          onClick={() => setInputMode('file')}
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
                >
                  삭제
                </button>
              </div>
              <p className="text-xs text-[#777777] mt-2">
                ※ 실제 파일 업로드/파싱은 9단계에서 구현 예정입니다.
              </p>
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

