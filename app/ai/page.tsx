'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { FileAnalysisResult } from '@/types'
import AnalysisResultPanel from '@/components/AI/AnalysisResultPanel'
import FileChatPanel from '@/components/AI/FileChatPanel'
import { EMOTIONS } from '@/lib/constants/emotions'

export default function AiOnboardingAndChatPage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [emotionTag, setEmotionTag] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    const allowedExtensions = ['txt', 'md', 'pdf', 'docx']
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (!extension || !allowedExtensions.includes(extension)) {
      alert('지원하지 않는 파일 형식입니다. (txt, md, pdf, docx만 지원)')
      return
    }

    const maxSize = extension === 'pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024
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

  const handleAnalyze = async () => {
    if (!file) {
      alert('먼저 PDF 파일을 업로드해 주세요.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) {
        formData.append('description', description)
      }
      if (emotionTag) {
        formData.append('emotionTag', emotionTag)
      }

      const response = await fetch('/api/ai/analyze-file', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        setTimeout(() => {
          setIsChatOpen(true)
        }, 500)
      } else {
        alert(data.error || '분석에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReanalyze = () => {
    if (file) {
      handleAnalyze()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 헤더 */}
      <header className="bg-[#111] border-b border-[#2a2a2a] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-reloop-blue">
              Reloop
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 영역 */}
      <main className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {!analysisResult ? (
          <div className="space-y-8">
            {/* 섹션 1: 온보딩 헤더 */}
            <section className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                AI에게 실패 기록을 맡겨보세요.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
                PDF나 글 파일을 올리면, AI가 감정과 내용의 흐름을 정리해주고
                <br />
                그 내용을 바탕으로 함께 이야기할 수 있습니다.
              </p>
              <p className="text-xs text-gray-400">
                ※ 이 기능은 전문적인 상담이나 치료가 아닌, 감정 정리를 돕는 도구입니다.
              </p>
            </section>

            {/* 섹션 2: 파일 업로드 카드 */}
            <section>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`bg-[#111] border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-reloop-blue bg-reloop-blue/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="text-reloop-blue text-5xl mb-3">✓</div>
                    <p className="text-white font-medium text-lg">{file.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="text-gray-400 hover:text-white text-sm mt-2 transition-colors"
                    >
                      다른 파일 선택
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-gray-400 text-5xl">📄</div>
                    <div>
                      <p className="text-white font-medium mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                      <p className="text-gray-400 text-sm">
                        txt, md, pdf, docx (PDF 최대 10MB, 기타 최대 5MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-reloop-blue text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
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
              {file && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  선택한 파일: {file.name} ({formatFileSize(file.size)})
                </p>
              )}
            </section>

            {/* 섹션 3: 추가 정보 입력 */}
            <section>
              <div className="grid md:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
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
            </section>

            {/* 섹션 4: 버튼 영역 */}
            <section className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="w-full md:max-w-sm bg-reloop-blue text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-reloop-blue flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <span>AI에게 분석 요청하기</span>
                )}
              </button>
            </section>

            {/* 섹션 5: 향후 섹션 placeholder */}
            <section className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm leading-relaxed">
                분석이 완료되면 여기에서 요약과 감정 정리 결과를 볼 수 있어요.
                <br />
                또, 분석 결과를 바탕으로 AI와 대화할 수 있는 채팅이 이 아래에 나타납니다.
              </p>
            </section>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 좌측: 분석 결과 */}
            <div className="space-y-6">
              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">분석 결과</h2>
                  <button
                    onClick={() => {
                      setAnalysisResult(null)
                      setFile(null)
                      setIsChatOpen(false)
                    }}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    새 파일 업로드
                  </button>
                </div>
                <AnalysisResultPanel
                  result={analysisResult}
                  onReanalyze={handleReanalyze}
                />
              </div>

              {/* 채팅 열기 버튼 (모바일용) */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="lg:hidden w-full bg-reloop-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
              >
                분석 결과를 바탕으로 대화하기
              </button>
            </div>

            {/* 우측: 채팅 패널 (데스크탑) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-120px)]">
                <FileChatPanel
                  analysisResult={analysisResult}
                  isOpen={true}
                  onClose={() => setIsChatOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 모바일 채팅 패널 (오버레이) */}
      {analysisResult && (
        <FileChatPanel
          analysisResult={analysisResult}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  )
}
