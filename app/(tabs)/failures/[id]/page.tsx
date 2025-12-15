'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Failure } from '@/types/failure'
// API를 통해 서버에서 데이터 가져오기
import FailureDetailHeader from '@/components/Failures/FailureDetailHeader'
import AISummarySection from '@/components/Failures/AISummarySection'
import FileUploadSection from '@/components/Failures/FileUploadSection'
import CommentDrawer from '@/components/Failures/CommentDrawer'
import ChatPanel from '@/components/AI/ChatPanel'
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
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false)
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [isAuthor, setIsAuthor] = useState(false)

  useEffect(() => {
    const loadFailure = async () => {
      try {
        const response = await fetch(`/api/failures/${id}`)
        if (response.ok) {
          const data = await response.json()
          setFailure(data)
          
          // 작성자 확인
          if (typeof window !== 'undefined') {
            const guestId = localStorage.getItem('guestId')
            const isMyPost = data.authorId === guestId
            setIsAuthor(isMyPost)
          }
        } else {
          setFailure(null)
        }
      } catch (error) {
        console.error('[failure-detail] 데이터 로드 오류:', error)
        setFailure(null)
      } finally {
        setLoading(false)
      }
    }
    loadFailure()
  }, [id])

  const handleEdit = () => {
    router.push(`/compose?id=${id}`)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/failures/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.push('/failures')
      } else {
        const error = await response.json().catch(() => ({ error: '삭제 실패' }))
        alert(error.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('[failure-detail] 삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleFileUploadSuccess = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!failure) return

    try {
      // 기존 이미지 배열에 추가
      const existingImages = failure.images || []
      // 하위 호환성: fileUrl이 있으면 images 배열에 추가
      if (failure.fileUrl && !existingImages.some(img => img.url === failure.fileUrl)) {
        existingImages.push({
          url: failure.fileUrl,
          fileName: failure.fileName || '이미지',
          fileType: failure.fileType || 'image/jpeg',
        })
      }
      
      // 새 이미지 추가
      existingImages.push({
        url: fileUrl,
        fileName,
        fileType,
      })

      const response = await fetch(`/api/failures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: existingImages,
          // 하위 호환성을 위해 fileUrl도 유지 (첫 번째 이미지)
          fileUrl: existingImages[0]?.url,
          fileName: existingImages[0]?.fileName,
          fileType: existingImages[0]?.fileType,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setFailure(updated)
      } else {
        alert('파일 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('[failure-detail] 파일 저장 오류:', error)
      alert('파일 저장에 실패했습니다.')
    }
  }

  const handleFileUploadError = (error: string) => {
    alert(error)
  }

  const handleAddComment = async (comment: { authorName: string; avatarId?: string; content: string }) => {
    if (!failure) return

    try {
      const existingComments = failure.comments || []
      const newComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        ...comment,
        createdAt: new Date().toISOString(),
      }

      const response = await fetch(`/api/failures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: [...existingComments, newComment],
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setFailure(updated)
        setIsCommentDrawerOpen(false)
      } else {
        alert('댓글 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('[failure-detail] 댓글 추가 오류:', error)
      alert('댓글 추가에 실패했습니다.')
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
      <FailureDetailHeader 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onComment={() => setIsCommentDrawerOpen(true)}
        isAuthor={isAuthor}
      />

      {/* 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-20 safe-area-bottom min-h-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {/* 이미지 섹션 (최우선 표시) */}
          {(failure.images && failure.images.length > 0) || failure.fileUrl ? (
            <div className="space-y-0">
              {failure.images && failure.images.length > 0 ? (
                failure.images.map((image, index) => (
                  <div key={index} className="relative w-full bg-black">
                    <img
                      src={image.url}
                      alt={image.fileName || `이미지 ${index + 1}`}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        console.error('[failure-detail] 이미지 로드 오류:', image.url)
                        // 이미지 로드 실패 시 placeholder 표시
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const placeholder = document.createElement('div')
                        placeholder.className = 'w-full h-64 bg-[#1a1a1a] flex items-center justify-center text-[#777777]'
                        placeholder.textContent = '이미지를 불러올 수 없습니다'
                        target.parentElement?.appendChild(placeholder)
                      }}
                    />
                    {isAuthor && (
                      <button
                        onClick={async () => {
                          try {
                            const updatedImages = failure.images?.filter((_, i) => i !== index) || []
                            const response = await fetch(`/api/failures/${id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                images: updatedImages.length > 0 ? updatedImages : undefined,
                                fileUrl: updatedImages.length > 0 ? updatedImages[0]?.url : undefined,
                                fileName: updatedImages.length > 0 ? updatedImages[0]?.fileName : undefined,
                                fileType: updatedImages.length > 0 ? updatedImages[0]?.fileType : undefined,
                              }),
                            })
                            if (response.ok) {
                              const updated = await response.json()
                              setFailure(updated)
                            }
                          } catch (error) {
                            console.error('[failure-detail] 이미지 삭제 오류:', error)
                          }
                        }}
                        className="absolute top-4 right-4 bg-black/70 text-red-400 text-sm px-3 py-2 rounded min-h-[44px] backdrop-blur-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))
              ) : failure.fileUrl ? (
                <div className="relative w-full bg-black">
                  <img
                    src={failure.fileUrl}
                    alt={failure.fileName || '이미지'}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      console.error('[failure-detail] 이미지 로드 오류:', failure.fileUrl)
                      // 이미지 로드 실패 시 placeholder 표시
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = document.createElement('div')
                      placeholder.className = 'w-full h-64 bg-[#1a1a1a] flex items-center justify-center text-[#777777]'
                      placeholder.textContent = '이미지를 불러올 수 없습니다'
                      target.parentElement?.appendChild(placeholder)
                    }}
                  />
                  {isAuthor && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/failures/${id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              fileUrl: undefined,
                              fileName: undefined,
                              fileType: undefined,
                            }),
                          })
                          if (response.ok) {
                            const updated = await response.json()
                            setFailure(updated)
                          }
                        } catch (error) {
                          console.error('[failure-detail] 이미지 삭제 오류:', error)
                        }
                      }}
                      className="absolute top-4 right-4 bg-black/70 text-red-400 text-sm px-3 py-2 rounded min-h-[44px] backdrop-blur-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 텍스트 콘텐츠 영역 */}
          <div className="px-4 py-6 space-y-6">
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

            {/* 파일 업로드 섹션 */}
            {isAuthor && (
              <FileUploadSection
                onUploadSuccess={handleFileUploadSuccess}
                onUploadError={handleFileUploadError}
              />
            )}

            {/* AI 분석 섹션 (작성자만) */}
            {isAuthor && <AISummarySection failure={failure} />}
          </div>
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

      {/* 댓글 드로어 */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        comments={failure?.comments || []}
        onAddComment={handleAddComment}
      />

      {/* 채팅 패널 (남의 게시물용) */}
      {!isAuthor && failure && (
        <ChatPanel
          isOpen={isChatPanelOpen}
          onClose={() => setIsChatPanelOpen(false)}
          failureSummary={failure.summary}
          emotionTag={failure.emotion}
        />
      )}
    </div>
  )
}
