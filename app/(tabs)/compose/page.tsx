'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'
import { saveFailure, updateFailure, getFailureById } from '@/lib/storage/failures'
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'

export const dynamic = 'force-dynamic'

function ComposeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const failureId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
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
        }
      } catch (error) {
        console.error('[compose] 데이터 로드 오류:', error)
      }
    }
  }, [failureId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
            disabled={loading}
          >
            {loading ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정하기' : '저장하기')}
          </PrimaryButton>
          <SecondaryButton 
            type="button"
            fullWidth 
            className="min-h-[48px]"
            onClick={() => router.back()}
            disabled={loading}
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
