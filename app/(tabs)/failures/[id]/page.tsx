'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Failure } from '@/types/failure'
import { getFailureById, deleteFailure } from '@/lib/storage/failures'
import FailureDetailHeader from '@/components/Failures/FailureDetailHeader'
import AISummarySection from '@/components/Failures/AISummarySection'
import ConfirmModal from '@/components/UI/ConfirmModal'
import { getCategoryLabel } from '@/lib/constants/categories'
import { getEmotionLabel } from '@/lib/constants/emotions'
import { PrimaryButton } from '@/components/UI/Button'

export const dynamic = 'force-dynamic'

export default function FailureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [failure, setFailure] = useState<Failure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    try {
      const data = getFailureById(id)
      if (!data) {
        // NotFound 처리
        setFailure(null)
      } else {
        setFailure(data)
      }
    } catch (error) {
      console.error('[failure-detail] 데이터 로드 오류:', error)
      setFailure(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleEdit = () => {
    router.push(`/compose?id=${id}`)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    try {
      const success = deleteFailure(id)
      if (success) {
        router.push('/failures')
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('[failure-detail] 삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black">
        <FailureDetailHeader onEdit={() => {}} onDelete={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </div>
    )
  }

  if (!failure) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black">
        <FailureDetailHeader onEdit={() => {}} onDelete={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-6">
            <span className="text-6xl">📝</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            기록을 찾을 수 없어요
          </h2>
          <p className="text-sm text-[#B3B3B3] mb-8 max-w-xs">
            삭제되었거나 존재하지 않는 기록입니다.
          </p>
          <PrimaryButton
            onClick={() => router.push('/failures')}
            rounded="lg"
            className="min-h-[48px] px-8"
          >
            목록으로 돌아가기
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden">
      <FailureDetailHeader onEdit={handleEdit} onDelete={handleDelete} />

      {/* 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-20 safe-area-bottom min-h-0">
        <div className="w-full max-w-full overflow-x-hidden px-4 py-6 space-y-6">
          {/* 제목 */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {failure.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-[#777777] mb-4">
              <span>{formatDate(failure.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {failure.category && (
                <span className="text-xs px-3 py-1.5 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                  {getCategoryLabel(failure.category)}
                </span>
              )}
              {failure.emotion && (
                <span className="text-xs px-3 py-1.5 bg-[#2A2A2A] text-[#B3B3B3] rounded-full">
                  {getEmotionLabel(failure.emotion)}
                </span>
              )}
            </div>
          </div>

          {/* 요약 카드 */}
          <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-4">
            <h2 className="text-sm font-medium text-[#B3B3B3] mb-2">요약</h2>
            <p className="text-base text-white leading-relaxed">{failure.summary}</p>
          </div>

          {/* 상세 내용 */}
          {failure.detail && (
            <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-4">
              <h2 className="text-sm font-medium text-[#B3B3B3] mb-2">상세 내용</h2>
              <p className="text-base text-white leading-relaxed whitespace-pre-line">
                {failure.detail}
              </p>
            </div>
          )}

          {/* AI 분석 섹션 */}
          <AISummarySection failure={failure} />
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="정말 삭제할까요?"
        message="삭제된 기록은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  )
}
