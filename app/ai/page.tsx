'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileAnalysisResult } from '@/types'
import FileUploadPanel from '@/components/AI/FileUploadPanel'
import AnalysisResultPanel from '@/components/AI/AnalysisResultPanel'
import FileChatPanel from '@/components/AI/FileChatPanel'

export default function AiOnboardingAndChatPage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [emotionTag, setEmotionTag] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleFileSelect = async (
    selectedFile: File,
    fileDescription?: string,
    fileEmotionTag?: string
  ) => {
    setFile(selectedFile)
    setDescription(fileDescription || '')
    setEmotionTag(fileEmotionTag || '')
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (fileDescription) {
        formData.append('description', fileDescription)
      }
      if (fileEmotionTag) {
        formData.append('emotionTag', fileEmotionTag)
      }

      const response = await fetch('/api/ai/analyze-file', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        // 분석 완료 후 자동으로 채팅 열기
        setTimeout(() => {
          setIsChatOpen(true)
        }, 500)
      } else {
        alert(data.error || '분석에 실패했습니다.')
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
      handleFileSelect(file, description || undefined, emotionTag || undefined)
    }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 좌측: 업로드 및 분석 결과 */}
          <div className="space-y-6">
            {!analysisResult ? (
              <FileUploadPanel
                onFileSelect={handleFileSelect}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <>
                <div className="bg-[#111] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">분석 결과</h2>
                    <button
                      onClick={() => {
                        setAnalysisResult(null)
                        setFile(null)
                        setIsChatOpen(false)
                      }}
                      className="text-gray-400 hover:text-white text-sm"
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
                  className="lg:hidden w-full bg-reloop-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  분석 결과를 바탕으로 대화하기
                </button>
              </>
            )}
          </div>

          {/* 우측: 채팅 패널 (데스크탑) */}
          {analysisResult && (
            <div className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-120px)]">
                <FileChatPanel
                  analysisResult={analysisResult}
                  isOpen={true}
                  onClose={() => setIsChatOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
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

