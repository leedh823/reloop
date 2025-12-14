/**
 * 필터링 유틸리티 함수
 */

import { Failure } from '@/types'

/**
 * 실패 목록을 카테고리로 필터링
 */
export function filterByCategory(
  failures: Failure[],
  category: string
): Failure[] {
  if (category === 'all') return failures
  return failures.filter((f) => f.category === category)
}

/**
 * 실패 목록을 감정 태그로 필터링
 */
export function filterByEmotion(
  failures: Failure[],
  emotion: string
): Failure[] {
  if (emotion === 'all') return failures
  return failures.filter((f) => f.emotionTag === emotion)
}

/**
 * 실패 목록을 검색어로 필터링
 */
export function filterBySearch(
  failures: Failure[],
  searchQuery: string
): Failure[] {
  if (!searchQuery.trim()) return failures

  const query = searchQuery.toLowerCase()
  return failures.filter(
    (f) =>
      f.title.toLowerCase().includes(query) ||
      f.summary.toLowerCase().includes(query)
  )
}

/**
 * 여러 필터를 조합하여 필터링
 */
export function filterFailures(
  failures: Failure[],
  filters: {
    category?: string
    emotion?: string
    searchQuery?: string
  }
): Failure[] {
  let result = failures

  if (filters.category) {
    result = filterByCategory(result, filters.category)
  }

  if (filters.emotion) {
    result = filterByEmotion(result, filters.emotion)
  }

  if (filters.searchQuery) {
    result = filterBySearch(result, filters.searchQuery)
  }

  return result
}









