'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreateFailureRequest } from '@/types'
import { CATEGORIES, EMOTIONS, MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB } from '@/lib/constants'
import { PrimaryButton, SecondaryButton } from '@/components/UI/Button'

export default function SubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const pdfFileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<CreateFailureRequest>({
    title: '',
    summary: '',
    content: '',
    emotionTag: '',
    category: '',
    thumbnailUrl: '',
    author: '',
  })

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 타입 검증
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('PDF 파일만 업로드할 수 있습니다.')
        return
      }
      // 파일 크기 검증 (50MB 제한)
      if (file.size > MAX_PDF_SIZE_BYTES) {
        alert(`PDF 파일은 최대 ${MAX_PDF_SIZE_MB}MB까지 업로드할 수 있습니다.`)
        return
      }
      setPdfFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // FormData 생성
      const formDataToSend = new FormData()
      
      // 텍스트 필드 추가
      formDataToSend.append('title', formData.title)
      formDataToSend.append('summary', formData.summary)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('emotionTag', formData.emotionTag)
      if (formData.thumbnailUrl) {
        formDataToSend.append('thumbnailUrl', formData.thumbnailUrl)
      }
      if (formData.author) {
        formDataToSend.append('author', formData.author)
      }
      
      // PDF 파일 추가 (있는 경우)
      if (pdfFile) {
        formDataToSend.append('pdfFile', pdfFile)
      }

      const response = await fetch('/api/failures', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/failures/${data.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || '실패를 저장하는 중 오류가 발생했습니다.')
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
    <div className="min-h-screen bg-black">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 폼 카드 */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-8">실패 공유하기</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                placeholder="실패의 제목을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                요약 *
              </label>
              <textarea
                id="summary"
                name="summary"
                required
                value={formData.summary}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                placeholder="실패에 대한 간단한 요약을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                상세 내용 *
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                placeholder="실패의 상세 내용을 작성하세요"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                  카테고리 *
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent appearance-none pr-10"
                  >
                    <option value="" className="bg-[#181818]">선택하세요</option>
                    {CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id} className="bg-[#181818]">
                        {category.label}
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

              <div>
                <label htmlFor="emotionTag" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                  감정 태그 *
                </label>
                <div className="relative">
                  <select
                    id="emotionTag"
                    name="emotionTag"
                    required
                    value={formData.emotionTag}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent appearance-none pr-10"
                  >
                    <option value="" className="bg-[#181818]">선택하세요</option>
                    {EMOTIONS.filter(e => e.id !== 'all').map((emotion) => (
                      <option key={emotion.id} value={emotion.id} className="bg-[#181818]">
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
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                  썸네일 이미지 URL (선택)
                </label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                  placeholder="썸네일 이미지 URL을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                  작성자 (선택)
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
                  placeholder="작성자 이름을 입력하세요"
                />
              </div>
            </div>

            {/* PDF 파일 업로드 */}
            <div>
              <label htmlFor="pdfFile" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                PDF 파일 업로드 (선택)
              </label>
              <div className="space-y-2">
                <input
                  ref={pdfFileInputRef}
                  type="file"
                  id="pdfFile"
                  accept="application/pdf"
                  onChange={handlePdfFileChange}
                  className="w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-reloop-blue file:text-white hover:file:bg-blue-600"
                />
                {pdfFile && (
                  <div className="flex items-center justify-between p-3 bg-[#181818] border border-[#333333] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#F5F5F5]">{pdfFile.name}</span>
                      <span className="text-xs text-[#B3B3B3]">
                        ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null)
                        if (pdfFileInputRef.current) {
                          pdfFileInputRef.current.value = ''
                        }
                      }}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <SecondaryButton
                type="button"
                onClick={() => router.back()}
              >
                취소
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={loading}
              >
                {loading ? '저장 중...' : '공유하기'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
