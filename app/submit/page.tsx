'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateFailureRequest } from '@/types'

export default function SubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateFailureRequest>({
    title: '',
    summary: '',
    content: '',
    emotionTag: '',
    category: '',
    pdfUrl: '',
    thumbnailUrl: '',
    author: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/failures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/failures/${data.id}`)
      } else {
        alert('실패를 저장하는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">실패 공유하기</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            placeholder="실패의 제목을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
            요약 *
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            value={formData.summary}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            placeholder="실패에 대한 간단한 요약을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            상세 내용 *
          </label>
          <textarea
            id="content"
            name="content"
            required
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            placeholder="실패의 상세 내용을 작성하세요"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            >
              <option value="">선택하세요</option>
              <option value="기술">기술</option>
              <option value="비즈니스">비즈니스</option>
              <option value="학습">학습</option>
              <option value="인간관계">인간관계</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="emotionTag" className="block text-sm font-medium text-gray-700 mb-2">
              감정 태그 *
            </label>
            <select
              id="emotionTag"
              name="emotionTag"
              required
              value={formData.emotionTag}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            >
              <option value="">선택하세요</option>
              <option value="아쉬움">아쉬움</option>
              <option value="후회">후회</option>
              <option value="좌절">좌절</option>
              <option value="성장">성장</option>
              <option value="교훈">교훈</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 이미지 URL (선택)
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
              placeholder="썸네일 이미지 URL을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              작성자 (선택)
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
              placeholder="작성자 이름을 입력하세요"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-2">
            PDF URL (선택)
          </label>
          <input
            type="url"
            id="pdfUrl"
            name="pdfUrl"
            value={formData.pdfUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
            placeholder="관련 PDF 파일의 URL을 입력하세요"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-reloop-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '공유하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

