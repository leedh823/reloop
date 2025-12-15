'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'
// API를 통해 서버에서 데이터 가져오기
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'
import ImagePicker from '@/components/Compose/ImagePicker'

export const dynamic = 'force-dynamic'

function ComposeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const failureId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Array<{ url: string; file: File | null }>>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
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
      const loadFailure = async () => {
        try {
          const response = await fetch(`/api/failures/${failureId}`)
          if (response.ok) {
            const failure = await response.json()
            setFormData({
              title: failure.title,
              summary: failure.summary,
              detail: failure.detail || '',
              category: failure.category || '',
              emotion: failure.emotion || '',
            })
            if (failure.images && failure.images.length > 0) {
              setSelectedImages(
                failure.images.map((img: any) => ({
                  url: img.url,
                  file: null, // 편집 모드에서는 파일 객체가 없음
                }))
              )
              setUploadedImageUrls(failure.images.map((img: any) => img.url))
            }
          } else {
            console.error('[compose] 데이터 로드 실패:', response.statusText)
          }
        } catch (error) {
          console.error('[compose] 데이터 로드 오류:', error)
        }
      }
      loadFailure()
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

  const handleImagesChange = (images: Array<{ url: string; file: File | null }>) => {
    setSelectedImages(images)
  }

  const uploadImagesToR2 = async (images: Array<{ url: string; file: File | null }>) => {
    const urls: string[] = []
    setUploadingImages(true)

    try {
      for (const image of images) {
        // 이미 업로드된 이미지는 URL만 사용
        if (!image.file) {
          // 편집 모드에서 기존 이미지인 경우
          if (image.url.startsWith('http')) {
            urls.push(image.url)
            continue
          }
        }

        if (!image.file) continue

        // 파일 크기 검증 (10MB)
        const maxSize = 10 * 1024 * 1024
        if (image.file.size > maxSize) {
          alert(`${image.file.name}: 이미지가 너무 큽니다. (${(image.file.size / (1024 * 1024)).toFixed(1)}MB)\n\n최대 10MB까지 지원합니다.`)
          continue
        }

        // Presigned URL 생성
        const uploadResponse = await fetch('/api/ai/upload-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: image.file.name,
            contentType: image.file.type || 'image/jpeg',
            fileSize: image.file.size,
          }),
        })

        if (!uploadResponse.ok) {
          throw new Error('업로드 URL 생성 실패')
        }

        const { uploadUrl, publicUrl } = await uploadResponse.json()

        // R2에 직접 업로드
        const uploadResult = await fetch(uploadUrl, {
          method: 'PUT',
          body: image.file,
          headers: {
            'Content-Type': image.file.type || 'image/jpeg',
          },
        })

        if (!uploadResult.ok) {
          throw new Error('파일 업로드 실패')
        }

        urls.push(publicUrl)
      }

      return urls
    } catch (error) {
      console.error('[compose] 이미지 업로드 오류:', error)
      throw error
    } finally {
      setUploadingImages(false)
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
      // 이미지 업로드
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        imageUrls = await uploadImagesToR2(selectedImages)
      }

      // 이미지 데이터 구조화
      const images = imageUrls.map((url, index) => ({
        url,
        fileName: selectedImages[index]?.file?.name || `이미지 ${index + 1}`,
        fileType: selectedImages[index]?.file?.type || 'image/jpeg',
      }))

      if (failureId) {
        // 편집 모드: API를 통해 업데이트
        const response = await fetch(`/api/failures/${failureId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            summary: formData.summary.trim(),
            detail: formData.detail.trim() || undefined,
            category: formData.category,
            emotion: formData.emotion,
            images: images.length > 0 ? images : undefined,
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: '수정 실패' }))
          alert(error.error || '수정할 기록을 찾을 수 없습니다.')
          return
        }

        // 성공 후 상세 페이지로 이동
        router.push(`/failures/${failureId}`)
      } else {
        // 새로 작성: API를 통해 저장
        // 작성자 정보 가져오기
        const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
        const profile = typeof window !== 'undefined' ? (() => {
          try {
            const profileData = localStorage.getItem('reloop_profile')
            return profileData ? JSON.parse(profileData) : null
          } catch {
            return null
          }
        })() : null

        const response = await fetch('/api/failures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            summary: formData.summary.trim(),
            detail: formData.detail.trim() || undefined,
            category: formData.category,
            emotion: formData.emotion,
            images: images.length > 0 ? images : undefined,
            aiStatus: 'none',
            authorId: guestId || undefined,
            authorName: profile?.name || undefined,
            avatarId: profile?.avatarId || undefined,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: '저장 실패' }))
          console.error('[compose] API 오류:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          })
          alert(errorData.error || `저장 중 오류가 발생했습니다. (${response.status})`)
          return
        }

        const newFailure = await response.json()

        // 성공 후 목록 페이지로 이동
        router.push('/failures')
      }
    } catch (error: any) {
      console.error('[compose] 저장 오류:', error)
      alert(`저장 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`)
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
      <form onSubmit={handleSubmit} className="px-4 py-4 pb-32 space-y-4">
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

        {/* 이미지 선택 (인스타그램 스타일) */}
        <ImagePicker
          images={selectedImages}
          onImagesChange={handleImagesChange}
          maxImages={10}
        />

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
            disabled={loading || uploadingImages}
          >
            {loading ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정하기' : '저장하기')}
          </PrimaryButton>
          <SecondaryButton 
            type="button"
            fullWidth 
            className="min-h-[48px]"
            onClick={() => router.back()}
            disabled={loading || uploadingImages}
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
