'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'
import { getFailureById } from '@/lib/storage/failures'
import { generateMockAnalyzeResult, MockAnalyzeResult } from '@/lib/ai/mockAnalyze'
import AnalyzeInput from '@/components/AI/AnalyzeInput'
import AnalyzeProgress from '@/components/AI/AnalyzeProgress'
import AnalyzeResultView from '@/components/AI/AnalyzeResultView'

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

  // failureId가 있으면 해당 failure 로드
  useEffect(() => {
    if (failureId) {
      try {
        const loadedFailure = getFailureById(failureId)
        if (!loadedFailure) {
          setError('기록을 찾을 수 없어요')
          setLoading(false)
          return
        }
        setFailure(loadedFailure)
        // 입력 텍스트 자동 채움
        const combinedText = [
          loadedFailure.summary,
          loadedFailure.detail,
        ].filter(Boolean).join('\n\n')
        setInputText(combinedText)
        if (loadedFailure.category) {
          setSelectedCategory(loadedFailure.category)
        }
        if (loadedFailure.emotion) {
          setSelectedEmotion(loadedFailure.emotion)
        }
      } catch (err) {
        console.error('[ai] Failure 로드 오류:', err)
        setError('기록을 불러오는 중 오류가 발생했습니다.')
      }
    }
    setLoading(false)
  }, [failureId])

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      alert('분석할 내용을 입력해주세요.')
      return
    }

    setState('analyzing')

    // 1~2초 후 mock 결과 생성
    setTimeout(() => {
      const result = generateMockAnalyzeResult(inputText)
      setAnalyzeResult(result)
      setState('result')
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
            <p className="text-sm text-white font-medium">{failure.title}</p>
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
            />

            <div className="pt-4">
              <PrimaryButton
                onClick={handleAnalyze}
                fullWidth
                className="min-h-[48px]"
                disabled={!inputText.trim()}
              >
                AI에게 분석 요청하기
              </PrimaryButton>
              {!inputText.trim() && (
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
