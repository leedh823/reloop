'use client'

import { useState, useRef } from 'react'
import { FileAnalysisResult } from '@/types'
import AnalysisResultPanel from '@/components/AI/AnalysisResultPanel'
import FileChatPanel from '@/components/AI/FileChatPanel'
import ApiHostConfig from '@/components/AI/ApiHostConfig'
import { EMOTIONS, MAX_PDF_SIZE_BYTES, MAX_OTHER_FILE_SIZE_BYTES, MAX_PDF_SIZE_MB, MAX_OTHER_FILE_SIZE_MB } from '@/lib/constants'
import { PrimaryButton } from '@/components/UI/Button'
import { getApiUrl } from '@/lib/utils/api'
import { createMultipartUploader, completeMultipartUpload } from '@vercel/blob/client'

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

    const maxSize = extension === 'pdf' ? MAX_PDF_SIZE_BYTES : MAX_OTHER_FILE_SIZE_BYTES
    const maxSizeMB = extension === 'pdf' ? MAX_PDF_SIZE_MB : MAX_OTHER_FILE_SIZE_MB
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    
    if (selectedFile.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. (${fileSizeMB.toFixed(1)}MB / 최대 ${maxSizeMB}MB)\n\n파일을 압축하거나 분할해주세요.`)
      return
    }
    
    // PDF 파일의 경우 추가 경고 (30MB 이상)
    if (extension === 'pdf' && fileSizeMB > 30) {
      const shouldContinue = confirm(
        `파일 크기가 큽니다 (${fileSizeMB.toFixed(1)}MB). 분석에 시간이 오래 걸리거나 실패할 수 있습니다.\n\n계속하시겠습니까?`
      )
      if (!shouldContinue) {
        return
      }
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
    console.log('[handleAnalyze] 함수 호출됨', { file: !!file, fileName: file?.name, fileSize: file?.size })
    
    if (!file) {
      console.warn('[handleAnalyze] 파일이 없음')
      alert('먼저 파일을 업로드해 주세요.')
      return
    }

    console.log('[handleAnalyze] 분석 시작', { fileName: file.name, fileSize: file.size })
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      let blobUrl: string | null = null

      // 파일 크기가 4MB 이상이면 멀티파트 업로드 사용
      if (file.size > 4 * 1024 * 1024) {
        console.log('[handleAnalyze] 파일이 4MB 이상이므로 멀티파트 업로드 사용:', { fileSize: file.size })
        
        // 1. 멀티파트 업로드 시작
        const uploadStartUrl = getApiUrl('/api/ai/upload-file')
        const uploadStartResponse = await fetch(uploadStartUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            fileSize: file.size,
          }),
        })

        if (!uploadStartResponse.ok) {
          const errorData = await uploadStartResponse.json().catch(() => ({}))
          throw new Error(errorData.error || '업로드 시작 실패')
        }

        const { uploadId, key, totalParts, partSize, clientToken } = await uploadStartResponse.json()
        console.log('[handleAnalyze] 멀티파트 업로드 시작:', { uploadId, key, totalParts, partSize, hasClientToken: !!clientToken, clientTokenType: typeof clientToken })

        // clientToken 검증
        if (!clientToken || typeof clientToken !== 'string') {
          throw new Error('클라이언트 토큰을 받지 못했습니다. 서버 설정을 확인해주세요.')
        }

        // 2. 클라이언트에서 직접 Blob에 업로드 (서버를 거치지 않음)
        // createMultipartUploader를 사용하여 클라이언트에서 직접 업로드
        // 중요: 서버에서 생성한 key를 사용해야 토큰의 pathname과 일치합니다
        const uploader = await createMultipartUploader(key, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
          token: clientToken, // 서버에서 생성한 클라이언트 토큰 사용
        })

        console.log('[handleAnalyze] 멀티파트 업로더 생성 완료:', { uploadId: uploader.uploadId, key: uploader.key })

        // 파일을 청크로 나눠서 각 파트를 클라이언트에서 직접 업로드
        const uploadedParts: Array<{ partNumber: number; etag: string }> = []
        
        for (let i = 0; i < totalParts; i++) {
          const partNumber = i + 1
          const start = i * partSize
          // 마지막 파트는 파일 끝까지
          const end = i === totalParts - 1 ? file.size : Math.min(start + partSize, file.size)
          const chunk = file.slice(start, end)

          console.log(`[handleAnalyze] 파트 ${partNumber} 업로드 중...`, { start, end, size: chunk.size })

          // 클라이언트에서 직접 업로드 (서버를 거치지 않음)
          const { etag } = await uploader.uploadPart(partNumber, chunk)
          
          uploadedParts.push({
            partNumber,
            etag,
          })

          console.log(`[handleAnalyze] 파트 ${partNumber} 업로드 완료`, { etag })
        }

        // 3. 멀티파트 업로드 완료 (클라이언트에서 직접)
        if (!clientToken || typeof clientToken !== 'string') {
          throw new Error('클라이언트 토큰이 유효하지 않습니다.')
        }

        const blob = await completeMultipartUpload(uploader.key, uploadedParts, {
          token: clientToken,
          access: 'public',
          uploadId: uploader.uploadId,
          key: uploader.key,
        })

        blobUrl = blob.url
        console.log('[handleAnalyze] 멀티파트 업로드 완료:', blobUrl)
      }

      // 분석 API 호출
      const formData = new FormData()
      if (blobUrl) {
        formData.append('blobUrl', blobUrl)
      } else {
        formData.append('file', file)
      }
      if (description) {
        formData.append('description', description)
      }
      if (emotionTag) {
        formData.append('emotionTag', emotionTag)
      }

      const apiUrl = getApiUrl('/api/ai/analyze-file')
      console.log('[handleAnalyze] 분석 API 호출 시작', { 
        apiUrl, 
        method: 'POST', 
        fileSize: file.size,
        usingBlob: !!blobUrl,
      })
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })
      
      console.log('[handleAnalyze] 분석 API 응답 받음', { status: response.status, statusText: response.statusText, ok: response.ok })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('분석 API 오류:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        let errorMessage = errorData.error || `서버 오류 (${response.status})`
        
        // 더 구체적인 에러 메시지
        if (response.status === 403) {
          // 403 오류는 환경 변수 문제일 가능성이 높음
          const detailedError = errorData.error || 'OpenAI API 접근이 거부되었습니다.'
          
          // 서버에서 제공한 상세 메시지가 있으면 사용
          if (detailedError.includes('Vercel 대시보드') || detailedError.includes('환경 변수')) {
            errorMessage = detailedError
          } else {
            errorMessage = `OpenAI API 접근이 거부되었습니다.\n\n가능한 원인:\n1. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.\n2. 환경 변수 설정 후 재배포가 필요합니다.\n3. API 키가 유효하지 않거나 만료되었습니다.\n\n해결 방법:\n- Vercel 대시보드 → Settings → Environment Variables에서 OPENAI_API_KEY 확인\n- 환경 변수 설정 후 반드시 Redeploy 실행\n- /api/debug/env 또는 /api/ai/test-env 엔드포인트에서 환경 변수 상태 확인`
          }
        } else if (response.status === 401) {
          errorMessage = 'OpenAI API 인증에 실패했습니다. 관리자에게 문의해주세요.'
        } else if (response.status === 413) {
          errorMessage = errorData.error || '파일 크기가 너무 큽니다. (최대 50MB)'
        } else if (response.status === 500) {
          errorMessage = errorData.error || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        setTimeout(() => {
          setIsChatOpen(true)
        }, 500)
      } else {
        const errorMsg = data.error || '분석에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        alert(errorMsg)
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      const errorMessage = error?.message || error?.error || '분석 중 오류가 발생했습니다.'
      alert(errorMessage)
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
      {/* 메인 영역 */}
      <main className="max-w-md md:max-w-2xl mx-auto px-4 sm:px-5 md:px-6 py-8 md:py-12">
        {!analysisResult ? (
          <div className="space-y-6 md:space-y-8">
            {/* 섹션 1: 온보딩 헤더 */}
            <section className="space-y-3 md:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                AI에게 실패 기록을 맡겨보세요.
              </h1>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl">
                PDF나 글 파일을 올리면, AI가 감정과 내용의 흐름을 정리해주고 그 내용을 바탕으로 함께 이야기할 수 있습니다.
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
                className={`bg-[#111] border-2 border-dashed rounded-xl p-6 md:p-8 min-h-[200px] md:min-h-[240px] flex flex-col items-center justify-center text-center transition-colors ${
                  isDragging
                    ? 'border-reloop-blue bg-reloop-blue/10'
                    : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                {file ? (
                  <div className="space-y-3 w-full">
                    <div className="text-reloop-blue text-5xl mb-3">✓</div>
                    <p className="text-white font-medium text-base md:text-lg break-words">{file.name}</p>
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
                  <div className="space-y-4 w-full">
                    <div className="text-gray-400 text-5xl">📄</div>
                    <div className="space-y-2">
                      <p className="text-white font-medium text-base md:text-lg">파일을 드래그하거나 클릭하여 업로드</p>
                      <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                        txt, md, pdf, docx (최대 {MAX_PDF_SIZE_MB}MB)
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        ※ 4MB 이상 파일은 자동으로 멀티파트 업로드됩니다
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-reloop-blue text-white px-6 py-3 h-12 rounded-full font-semibold hover:bg-blue-600 transition-colors w-full md:w-auto md:px-8 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:ring-offset-2 focus:ring-offset-black"
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
            <section className="space-y-4">
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
                  className="w-full h-12 md:h-14 px-4 py-3 bg-[#181818] border border-[#333333] rounded-lg text-base text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="emotionTag" className="block text-sm font-medium text-gray-300 mb-2">
                  지금 느끼는 감정 (선택)
                </label>
                <div className="relative">
                  <select
                    id="emotionTag"
                    value={emotionTag}
                    onChange={(e) => setEmotionTag(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 py-3 bg-[#181818] border border-[#333333] rounded-lg text-base text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent appearance-none pr-10"
                  >
                    <option value="" className="bg-[#181818]">선택하세요</option>
                    {EMOTIONS.filter((e) => e.id !== 'all').map((emotion) => (
                      <option key={emotion.id} value={emotion.label} className="bg-[#181818]">
                        {emotion.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-[#B3B3B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* 섹션 4: 버튼 영역 */}
            <section>
              <PrimaryButton
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                fullWidth
                rounded="full"
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <span>AI에게 분석 요청하기</span>
                )}
              </PrimaryButton>
            </section>

            {/* 섹션 5: 향후 섹션 placeholder */}
            <section className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 md:p-6 text-center">
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                분석이 완료되면 여기에서 요약과 감정 정리 결과를 볼 수 있어요. 또, 분석 결과를 바탕으로 AI와 대화할 수 있는 채팅이 이 아래에 나타납니다.
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

      {/* API 호스트 설정 (개발 모드) */}
      <ApiHostConfig />
    </div>
  )
}
