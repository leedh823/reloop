'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/Layout/AppShell'
import { Failure } from '@/types/failure'
import { getFailures } from '@/lib/storage/failures'
import FailureCard from '@/components/Failures/FailureCard'
import EmptyState from '@/components/Failures/EmptyState'
import SearchBar from '@/components/Failures/SearchBar'
import { CATEGORIES } from '@/lib/constants/categories'
import { EMOTIONS } from '@/lib/constants/emotions'

type SortOption = 'latest' | 'unanalyzed'

export default function FailuresPage() {
  const [failures, setFailures] = useState<Failure[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // 데이터 로드
  useEffect(() => {
    try {
      const data = getFailures()
      setFailures(data)
    } catch (error) {
      console.error('[failures] 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 검색 및 필터링 및 정렬
  const filteredAndSorted = failures
    .filter((failure) => {
      // 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = failure.title.toLowerCase().includes(query)
        const matchesSummary = failure.summary.toLowerCase().includes(query)
        const matchesDetail = failure.detail?.toLowerCase().includes(query) || false
        if (!matchesTitle && !matchesSummary && !matchesDetail) {
          return false
        }
      }

      // 카테고리 필터
      if (selectedCategory !== 'all' && failure.category !== selectedCategory) {
        return false
      }

      // 감정 필터
      if (selectedEmotion !== 'all' && failure.emotion !== selectedEmotion) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'unanalyzed') {
        // 미분석 우선
        if (a.aiStatus === 'none' && b.aiStatus !== 'none') return -1
        if (a.aiStatus !== 'none' && b.aiStatus === 'none') return 1
      }
      // 최신순 (기본)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const rightAction = (
    <button
      onClick={() => {
        // 필터/정렬 모달 (간단하게 토글로 처리)
        const newSort = sortBy === 'latest' ? 'unanalyzed' : 'latest'
        setSortBy(newSort)
      }}
      className="p-2 min-h-[44px] min-w-[44px]"
      aria-label="정렬"
    >
      <span className="text-xl">
        {sortBy === 'latest' ? '🕐' : '⚠️'}
      </span>
    </button>
  )

  return (
    <AppShell title="실패" rightAction={rightAction}>
      <div className="px-4 py-4">
        {/* 검색 바 */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="제목, 요약, 내용으로 검색..."
        />

        {/* 필터 영역 */}
        <div className="mb-4 space-y-3">
          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-reloop-blue text-white'
                  : 'bg-[#1a1a1a] text-[#B3B3B3]'
              }`}
            >
              전체
            </button>
            {CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-reloop-blue text-white'
                    : 'bg-[#1a1a1a] text-[#B3B3B3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 감정 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedEmotion('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                selectedEmotion === 'all'
                  ? 'bg-reloop-blue text-white'
                  : 'bg-[#1a1a1a] text-[#B3B3B3]'
              }`}
            >
              전체
            </button>
            {EMOTIONS.filter(emotion => emotion.id !== 'all').map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => setSelectedEmotion(emotion.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                  selectedEmotion === emotion.id
                    ? 'bg-reloop-blue text-white'
                    : 'bg-[#1a1a1a] text-[#B3B3B3]'
                }`}
              >
                {emotion.label}
              </button>
            ))}
          </div>
        </div>

        {/* 리스트 영역 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-[#B3B3B3]">로딩 중...</span>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {filteredAndSorted.map((failure) => (
              <FailureCard key={failure.id} failure={failure} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
