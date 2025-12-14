'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'
// API를 통해 서버에서 데이터 가져오기
import { generateMockAnalyzeResult, MockAnalyzeResult } from '@/lib/ai/mockAnalyze'
import AnalyzeInput from '@/components/AI/AnalyzeInput'
import AnalyzeProgress from '@/components/AI/AnalyzeProgress'
import AnalyzeResultView from '@/components/AI/AnalyzeResultView'
import ChatPanel from '@/components/AI/ChatPanel'

export const dynamic = 'force-dynamic'

type AnalyzeState = 'input' | 'analyzing' | 'result'

function AIPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const failureId = searchParams.get('failureId')

  const [state, setState] = useState<AnalyzeState>('input')
  const [inputText, setInputText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [analyzeResult, setAnalyzeResult] = useState<MockAnalyzeResult | null>(null)
  const [failure, setFailure] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFileUploaded, setHasFileUploaded] = useState(false)
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')

  // failureId가 있으면 해당 failure 로드 (API에서 가져오기)
  useEffect(() => {
    if (failureId) {
      const loadFailure = async () => {
        try {
          const response = await fetch(`/api/failures/${failureId}`)
          if (!response.ok) {
            setError('기록을 찾을 수 없어요')
            setLoading(false)
            return
          }
          const loadedFailure = await response.json()
          setFailure(loadedFailure)
          // 입력 텍스트 자동 채움
          const combinedText = [
            loadedFailure.summary,
            loadedFailure.detail,
          ].filter(Boolean).join('\n\n')
          setInputText(combinedText)
          // 텍스트가 있으면 분석 가능하도록 설정
          // inputText가 있으면 버튼이 활성화되므로 hasFileUploaded는 false여도 됨
          // 하지만 명시적으로 false로 설정하여 버튼 활성화 보장
          setHasFileUploaded(false)
          if (loadedFailure.category) {
            setSelectedCategory(loadedFailure.category)
          }
          if (loadedFailure.emotion) {
            setSelectedEmotion(loadedFailure.emotion)
          }
        } catch (err) {
          console.error('[ai] Failure 로드 오류:', err)
          setError('기록을 불러오는 중 오류가 발생했습니다.')
        } finally {
          setLoading(false)
        }
      }
      loadFailure()
    } else {
      setLoading(false)
    }
  }, [failureId])

  const handleAnalyze = async () => {
    // 텍스트 입력 또는 파일 업로드 확인
    if (!inputText.trim() && !hasFileUploaded) {
      alert('분석할 내용을 입력하거나 파일을 업로드해주세요.')
      return
    }

    // 텍스트 입력 모드인 경우: 바로 대화 페이지로 이동
    if (inputMode === 'text' && !hasFileUploaded) {
      setIsChatPanelOpen(true)
      return
    }

    // 파일 업로드 모드인 경우: 분석 후 대화 페이지로 이동
    const textToAnalyze = inputText.trim() || '파일이 업로드되었습니다. 파일 내용을 분석합니다.'

    setState('analyzing')

    // 1~2초 후 mock 결과 생성
    setTimeout(() => {
      const result = generateMockAnalyzeResult(textToAnalyze)
      setAnalyzeResult(result)
      // 분석 완료 후 대화 페이지로 이동
      setState('input') // 결과 화면 대신 대화 페이지로
      setIsChatPanelOpen(true)
    }, 1500)
  }

  const handleSaveToFailure = () => {
    if (!failureId || !analyzeResult) return

    try {
      const { updateFailure } = require('@/lib/storage/failures')
      updateFailure(failureId, {
        aiStatus: 'done',
        aiResult: {
          aiSummary: analyzeResult.summary,
          aiRootCause: analyzeResult.rootCause.join('\n'),
          aiLearnings: analyzeResult.learnings.join('\n'),
          aiNextActions: analyzeResult.nextActions.join('\n'),
        },
      })
      router.push(`/failures/${failureId}`)
    } catch (error) {
      console.error('[ai] 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleSaveAsNew = () => {
    if (!analyzeResult) return

    // 분석 결과를 localStorage에 임시 저장
    localStorage.setItem('reloop_temp_analysis', JSON.stringify({
      ...analyzeResult,
      inputText,
      category: selectedCategory,
      emotion: selectedEmotion,
    }))
    router.push('/compose?fromAnalysis=true')
  }

  if (loading) {
    return (
      <AppShell title="AI 분석">
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="AI 분석">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error}
          </h2>
          <PrimaryButton
            onClick={() => router.push('/failures')}
            rounded="lg"
            className="min-h-[48px] px-8 mt-4"
          >
            목록으로 돌아가기
          </PrimaryButton>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="AI 분석">
      <div className="px-4 py-4">
        {/* 선택된 기록 표시 */}
        {failure && (
          <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg">
            <p className="text-xs text-[#777777] mb-1">선택된 기록</p>
            <p className="text-sm text-white font-medium mb-2">{failure.title}</p>
            {/* 첫 번째 이미지 표시 */}
            {failure.images && failure.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={failure.images[0].url}
                  alt={failure.images[0].fileName || '첨부 이미지'}
                  className="w-full h-auto object-contain max-h-48"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 입력 상태 */}
        {state === 'input' && (
          <div className="space-y-6">
            <AnalyzeInput
              inputText={inputText}
              onInputChange={setInputText}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedEmotion={selectedEmotion}
              onEmotionChange={setSelectedEmotion}
              onFileUploaded={(text) => {
                setInputText(text)
                setHasFileUploaded(true)
                setInputMode('file') // 파일 업로드 모드로 설정
              }}
            />

            <div className="pt-4">
              <PrimaryButton
                onClick={handleAnalyze}
                fullWidth
                className="min-h-[48px]"
                disabled={inputText.trim().length === 0 && !hasFileUploaded}
              >
                {hasFileUploaded ? 'AI에게 분석 요청하기' : 'AI와 대화하기'}
              </PrimaryButton>
              {inputText.trim().length === 0 && !hasFileUploaded && (
                <p className="text-xs text-[#777777] mt-2 text-center">
                  분석할 내용을 입력해주세요
                </p>
              )}
            </div>
          </div>
        )}

        {/* 분석 중 상태 */}
        {state === 'analyzing' && <AnalyzeProgress />}

        {/* 결과 상태 */}
        {state === 'result' && analyzeResult && (
          <AnalyzeResultView
            result={analyzeResult}
            onSaveToFailure={handleSaveToFailure}
            onSaveAsNew={handleSaveAsNew}
            hasFailureId={!!failureId}
          />
        )}
      </div>

      {/* 채팅 패널 */}
      <ChatPanel
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
        failureSummary={inputText.trim() || failure?.summary}
        emotionTag={selectedEmotion || failure?.emotion}
      />
    </AppShell>
  )
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <AppShell title="AI 분석">
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    }>
      <AIPageContent />
    </Suspense>
  )
}
