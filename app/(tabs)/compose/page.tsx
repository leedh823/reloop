'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'
import { saveFailure, updateFailure, getFailureById } from '@/lib/storage/failures'
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'
import { MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB } from '@/lib/constants/file-upload'

export const dynamic = 'force-dynamic'

function ComposeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const failureId = searchParams.get('id')
  const pdfFileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    detail: '',
    category: '',
    emotion: '',
  })

  // 편집 모드: 기존 데이터 로드
  useEffect(() => {
    if (failureId) {
      try {
        const failure = getFailureById(failureId)
        if (failure) {
          setFormData({
            title: failure.title,
            summary: failure.summary,
            detail: failure.detail || '',
            category: failure.category || '',
            emotion: failure.emotion || '',
          })
          if (failure.pdfUrl) {
            setPdfUrl(failure.pdfUrl)
          }
        }
      } catch (error) {
        console.error('[compose] 데이터 로드 오류:', error)
      }
    } else {
      // AI 분석 결과에서 온 경우
      const fromAnalysis = searchParams.get('fromAnalysis')
      if (fromAnalysis === 'true') {
        try {
          const tempAnalysis = localStorage.getItem('reloop_temp_analysis')
          if (tempAnalysis) {
            const analysis = JSON.parse(tempAnalysis)
            setFormData(prev => ({
              ...prev,
              summary: analysis.inputText || prev.summary,
              category: analysis.category || prev.category,
              emotion: analysis.emotion || prev.emotion,
            }))
            // 임시 데이터 삭제
            localStorage.removeItem('reloop_temp_analysis')
          }
        } catch (error) {
          console.error('[compose] AI 분석 결과 로드 오류:', error)
        }
      }
    }
  }, [failureId, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 검증
    if (file.size > MAX_PDF_SIZE_BYTES) {
      alert(`PDF 파일은 최대 ${MAX_PDF_SIZE_MB}MB까지 업로드할 수 있습니다.`)
      return
    }

    setPdfFile(file)
    setUploading(true)

    try {
      // Presigned URL 생성
      const uploadResponse = await fetch('/api/ai/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!uploadResponse.ok) {
        throw new Error('업로드 URL 생성 실패')
      }

      const { uploadUrl, publicUrl } = await uploadResponse.json()

      // R2에 직접 업로드
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResult.ok) {
        throw new Error('파일 업로드 실패')
      }

      setPdfUrl(publicUrl)
      alert('PDF 파일이 업로드되었습니다.')
    } catch (error) {
      console.error('[compose] PDF 업로드 오류:', error)
      alert('PDF 파일 업로드 중 오류가 발생했습니다.')
      setPdfFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePdf = () => {
    setPdfFile(null)
    setPdfUrl('')
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 필드 검증
    if (!formData.title.trim() || !formData.summary.trim() || !formData.category || !formData.emotion) {
      alert('제목, 요약, 카테고리, 감정은 필수 입력 항목입니다.')
      return
    }

    setLoading(true)
    try {
      if (failureId) {
        // 편집 모드: 기존 데이터 업데이트
        const updated = updateFailure(failureId, {
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          detail: formData.detail.trim() || undefined,
          category: formData.category,
          emotion: formData.emotion,
          pdfUrl: pdfUrl || undefined,
        })

        if (!updated) {
          alert('수정할 기록을 찾을 수 없습니다.')
          return
        }

        // 성공 후 상세 페이지로 이동
        router.push(`/failures/${failureId}`)
      } else {
        // 새로 작성: 저장
        const newFailure = saveFailure({
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          detail: formData.detail.trim() || undefined,
          category: formData.category,
          emotion: formData.emotion,
          pdfUrl: pdfUrl || undefined,
          aiStatus: 'none',
        })

        // 성공 후 목록 페이지로 이동
        router.push('/failures')
      }
    } catch (error) {
      console.error('[compose] 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const isEditMode = !!failureId

  return (
    <AppShell 
      title={isEditMode ? "실패 수정" : "실패 작성"}
      rightAction={
        <button
          onClick={() => router.back()}
          className="text-[#B3B3B3] text-sm min-h-[44px] px-2"
        >
          취소
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            placeholder="실패의 제목을 입력하세요"
          />
        </div>

        {/* 요약 */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-white mb-2">
            요약 *
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent resize-none min-h-[120px]"
            placeholder="실패에 대한 간단한 요약을 입력하세요"
          />
        </div>

        {/* 상세 내용 */}
        <div>
          <label htmlFor="detail" className="block text-sm font-medium text-white mb-2">
            상세 내용 (선택)
          </label>
          <textarea
            id="detail"
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent resize-none min-h-[150px]"
            placeholder="실패의 상세 내용을 작성하세요"
          />
        </div>

        {/* PDF 파일 업로드 */}
        <div>
          <label htmlFor="pdfFile" className="block text-sm font-medium text-white mb-2">
            PDF 파일 (선택)
          </label>
          {pdfUrl ? (
            <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {pdfFile?.name || 'PDF 파일'}
                    </p>
                    <p className="text-xs text-[#777777]">업로드 완료</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="text-red-400 text-sm min-h-[44px] px-3"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="pdfFile"
                ref={pdfFileInputRef}
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="pdfFile"
                className={`flex items-center justify-center w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white cursor-pointer hover:bg-[#252525] transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <span className="text-[#B3B3B3]">업로드 중...</span>
                ) : (
                  <>
                    <span className="mr-2">📄</span>
                    <span>PDF 파일 선택 (최대 {MAX_PDF_SIZE_MB}MB)</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
            카테고리 *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
          >
            <option value="">선택하세요</option>
            {CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 감정 */}
        <div>
          <label htmlFor="emotion" className="block text-sm font-medium text-white mb-2">
            감정 *
          </label>
          <select
            id="emotion"
            name="emotion"
            required
            value={formData.emotion}
            onChange={handleChange}
            className="w-full min-h-[48px] px-4 py-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
          >
            <option value="">선택하세요</option>
            {EMOTIONS.filter(emotion => emotion.id !== 'all').map((emotion) => (
              <option key={emotion.id} value={emotion.id}>
                {emotion.label}
              </option>
            ))}
          </select>
        </div>

        {/* 버튼 */}
        <div className="space-y-2 pt-4">
          <PrimaryButton 
            type="submit"
            fullWidth 
            className="min-h-[48px]"
            disabled={loading || uploading}
          >
            {loading ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정하기' : '저장하기')}
          </PrimaryButton>
          <SecondaryButton 
            type="button"
            fullWidth 
            className="min-h-[48px]"
            onClick={() => router.back()}
            disabled={loading || uploading}
          >
            취소
          </SecondaryButton>
        </div>
      </form>
    </AppShell>
  )
}

export default function ComposePage() {
  return (
    <Suspense fallback={
      <AppShell title="실패 작성">
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    }>
      <ComposeForm />
    </Suspense>
  )
}
