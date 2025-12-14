/**
 * 피드 데이터 가공 로직
 */

import { Failure } from '@/types/failure'
import { getProfile } from '@/lib/storage/profile'

export type FeedTab = 'for-you' | 'trending' | 'recent' | 'following'

export interface FeedItem extends Failure {
  authorName?: string
  avatarId?: string
  likesCount?: number
  commentsCount?: number
}

/**
 * API에서 failures 가져오기
 */
async function fetchFailures(): Promise<Failure[]> {
  try {
    const response = await fetch('/api/failures')
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('[feed] API 오류:', error)
    return []
  }
}

/**
 * Recent 탭: 최신순 정렬
 */
export async function getRecentFeed(): Promise<FeedItem[]> {
  const failures = await fetchFailures()
  const profile = getProfile()
  
  return failures
    .map((failure) => ({
      ...failure,
      authorName: profile?.name || 'Anonymous',
      avatarId: profile?.avatarId,
      likesCount: Math.floor(Math.random() * 50), // Mock
      commentsCount: Math.floor(Math.random() * 10), // Mock
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Trending 탭: 좋아요 수 기반 정렬
 */
export async function getTrendingFeed(): Promise<FeedItem[]> {
  const failures = await fetchFailures()
  const profile = getProfile()
  
  return failures
    .map((failure) => ({
      ...failure,
      authorName: profile?.name || 'Anonymous',
      avatarId: profile?.avatarId,
      likesCount: Math.floor(Math.random() * 100) + 10, // Mock (10~110)
      commentsCount: Math.floor(Math.random() * 20), // Mock
    }))
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
}

/**
 * For You 탭: 카테고리 다양성 기준으로 섞기
 */
export async function getForYouFeed(): Promise<FeedItem[]> {
  const failures = await fetchFailures()
  const profile = getProfile()
  
  // 카테고리별로 그룹화
  const byCategory: { [key: string]: FeedItem[] } = {}
  failures.forEach((failure) => {
    const category = failure.category || 'other'
    if (!byCategory[category]) {
      byCategory[category] = []
    }
    byCategory[category].push({
      ...failure,
      authorName: profile?.name || 'Anonymous',
      avatarId: profile?.avatarId,
      likesCount: Math.floor(Math.random() * 80), // Mock
      commentsCount: Math.floor(Math.random() * 15), // Mock
    })
  })

  // 카테고리별로 섞어서 반환
  const result: FeedItem[] = []
  const categories = Object.keys(byCategory)
  let maxLength = Math.max(...categories.map((cat) => byCategory[cat].length))

  for (let i = 0; i < maxLength; i++) {
    categories.forEach((category) => {
      if (byCategory[category][i]) {
        result.push(byCategory[category][i])
      }
    })
  }

  return result
}

/**
 * Following 탭: 아직 없음 (빈 배열 반환)
 */
export async function getFollowingFeed(): Promise<FeedItem[]> {
  return []
}

/**
 * 탭별 피드 가져오기
 */
export async function getFeedByTab(tab: FeedTab): Promise<FeedItem[]> {
  switch (tab) {
    case 'recent':
      return getRecentFeed()
    case 'trending':
      return getTrendingFeed()
    case 'for-you':
      return getForYouFeed()
    case 'following':
      return getFollowingFeed()
    default:
      return getRecentFeed()
  }
}

