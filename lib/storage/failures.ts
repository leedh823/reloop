/**
 * localStorage 기반 실패 데이터 저장/조회 유틸리티
 * 
 * 추후 Supabase 등으로 교체 가능하도록 인터페이스 분리
 */

import { Failure } from '@/types/failure'

const STORAGE_KEY = 'reloop_failures'

/**
 * 모든 실패 목록 조회
 */
export function getFailures(): Failure[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return []
    }
    const failures: Failure[] = JSON.parse(data)
    return failures.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('[storage] 실패 목록 조회 오류:', error)
    return []
  }
}

/**
 * 특정 실패 조회
 */
export function getFailureById(id: string): Failure | null {
  const failures = getFailures()
  return failures.find(f => f.id === id) || null
}

/**
 * 실패 저장
 */
export function saveFailure(failure: Omit<Failure, 'id' | 'createdAt'>): Failure {
  if (typeof window === 'undefined') {
    throw new Error('localStorage는 클라이언트 사이드에서만 사용 가능합니다.')
  }

  const newFailure: Failure = {
    ...failure,
    id: `failure_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date().toISOString(),
    aiStatus: failure.aiStatus || 'none',
  }

  const failures = getFailures()
  failures.push(newFailure)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(failures))
    return newFailure
  } catch (error) {
    console.error('[storage] 실패 저장 오류:', error)
    throw new Error('실패 저장에 실패했습니다.')
  }
}

/**
 * 실패 수정
 */
export function updateFailure(id: string, updates: Partial<Omit<Failure, 'id' | 'createdAt'>>): Failure | null {
  if (typeof window === 'undefined') {
    throw new Error('localStorage는 클라이언트 사이드에서만 사용 가능합니다.')
  }

  const failures = getFailures()
  const index = failures.findIndex(f => f.id === id)
  
  if (index === -1) {
    return null
  }

  failures[index] = {
    ...failures[index],
    ...updates,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(failures))
    return failures[index]
  } catch (error) {
    console.error('[storage] 실패 수정 오류:', error)
    throw new Error('실패 수정에 실패했습니다.')
  }
}

/**
 * 실패 삭제
 */
export function deleteFailure(id: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('localStorage는 클라이언트 사이드에서만 사용 가능합니다.')
  }

  const failures = getFailures()
  const filtered = failures.filter(f => f.id !== id)
  
  if (filtered.length === failures.length) {
    return false // 삭제할 항목이 없음
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('[storage] 실패 삭제 오류:', error)
    throw new Error('실패 삭제에 실패했습니다.')
  }
}





