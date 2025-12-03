'use client'

import { useState, useEffect, useMemo } from 'react'
import { Failure } from '@/types'
import HeroSection from '@/components/HeroSection'
import FilterBar from '@/components/FilterBar'
import FailureCard from '@/components/FailureCard'

// Mock 데이터 (실제 API가 없을 때 사용)
const mockFailures: Failure[] = [
  {
    id: '1',
    title: '스타트업 면접에서 실수한 경험',
    summary: '기술 면접에서 기본적인 질문에 답하지 못해 탈락했습니다. 하지만 이 경험을 통해 부족한 부분을 알게 되었습니다.',
    content: '상세 내용...',
    category: 'job',
    emotionTag: 'frustration',
    author: '김개발',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-12-01'),
    hasAiReview: true,
    hasDiscordThread: true,
  },
  {
    id: '2',
    title: '대학 프로젝트 팀원과의 갈등',
    summary: '팀 프로젝트에서 역할 분담이 제대로 되지 않아 프로젝트가 실패했습니다. 소통의 중요성을 배웠습니다.',
    content: '상세 내용...',
    category: 'school',
    emotionTag: 'regret',
    author: '이학생',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-11-28'),
    hasAiReview: false,
    hasDiscordThread: true,
  },
  {
    id: '3',
    title: '사이드 프로젝트 중도 포기',
    summary: '너무 많은 기능을 한 번에 구현하려다가 프로젝트를 완성하지 못했습니다. 작은 것부터 시작하는 것이 중요하다는 것을 배웠습니다.',
    content: '상세 내용...',
    category: 'side-project',
    emotionTag: 'anxiety',
    author: '박개발',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-11-25'),
    hasAiReview: true,
    hasDiscordThread: false,
  },
  {
    id: '4',
    title: '비즈니스 파트너십 실패',
    summary: '신뢰를 바탕으로 한 파트너십이었지만, 명확한 계약 없이 진행하다가 문제가 발생했습니다.',
    content: '상세 내용...',
    category: 'business',
    emotionTag: 'regret',
    author: '최창업',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-11-20'),
    hasAiReview: true,
    hasDiscordThread: true,
  },
  {
    id: '5',
    title: '인간관계에서의 오해',
    summary: '친구와의 오해로 인해 관계가 소원해졌습니다. 솔직한 대화의 중요성을 깨달았습니다.',
    content: '상세 내용...',
    category: 'relationship',
    emotionTag: 'relief',
    author: '정친구',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-11-15'),
    hasAiReview: false,
    hasDiscordThread: true,
  },
  {
    id: '6',
    title: '포트폴리오 제작 실패',
    summary: '완벽한 포트폴리오를 만들려다가 오히려 완성하지 못했습니다. 완벽보다 완성이 중요하다는 것을 배웠습니다.',
    content: '상세 내용...',
    category: 'side-project',
    emotionTag: 'growth',
    author: '강디자인',
    thumbnailUrl: undefined,
    createdAt: new Date('2024-11-10'),
    hasAiReview: true,
    hasDiscordThread: false,
  },
]

export default function Home() {
  const [failures, setFailures] = useState<Failure[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEmotion, setSelectedEmotion] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 데이터 로드
  useEffect(() => {
    async function fetchFailures() {
      try {
        const response = await fetch('/api/failures')
        if (response.ok) {
          const data = await response.json()
          setFailures(data)
        } else {
          // API 실패 시 mock 데이터 사용
          setFailures(mockFailures)
        }
      } catch (error) {
        console.error('Failed to fetch failures:', error)
        // 에러 시 mock 데이터 사용
        setFailures(mockFailures)
      } finally {
        setLoading(false)
      }
    }

    fetchFailures()
  }, [])

  // 필터링 로직
  const filteredFailures = useMemo(() => {
    return failures.filter((failure) => {
      // 카테고리 필터
      if (selectedCategory !== 'all' && failure.category !== selectedCategory) {
        return false
      }

      // 감정 태그 필터
      if (selectedEmotion !== 'all' && failure.emotionTag !== selectedEmotion) {
        return false
      }

      // 검색 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = failure.title.toLowerCase().includes(query)
        const matchesSummary = failure.summary.toLowerCase().includes(query)
        if (!matchesTitle && !matchesSummary) {
          return false
        }
      }

      return true
    })
  }, [failures, selectedCategory, selectedEmotion, searchQuery])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero 섹션 */}
      <HeroSection />

      {/* 필터 바 */}
      <FilterBar
        selectedCategory={selectedCategory}
        selectedEmotion={selectedEmotion}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onEmotionChange={setSelectedEmotion}
        onSearchChange={setSearchQuery}
      />

      {/* 카드 그리드 */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">로딩 중...</p>
          </div>
        ) : filteredFailures.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">표시할 실패가 없습니다.</p>
            <p className="text-gray-500 text-sm">필터를 조정하거나 검색어를 변경해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFailures.map((failure) => (
              <FailureCard key={failure.id} failure={failure} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
