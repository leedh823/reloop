/**
 * localStorage 기반 프로필 저장/조회 유틸리티
 */

import { Profile } from '@/types/profile'

const STORAGE_KEY = 'reloop_profile'

/**
 * 프로필 조회
 */
export function getProfile(): Profile | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return null
    }
    return JSON.parse(data) as Profile
  } catch (error) {
    console.error('[storage] 프로필 조회 오류:', error)
    return null
  }
}

/**
 * 프로필 저장
 */
export function saveProfile(profile: Partial<Profile>): Profile {
  if (typeof window === 'undefined') {
    throw new Error('localStorage는 클라이언트 사이드에서만 사용 가능합니다.')
  }

  const existing = getProfile()
  const newProfile: Profile = {
    name: profile.name || existing?.name || '',
    gender: profile.gender || existing?.gender || 'none',
    avatarId: profile.avatarId || existing?.avatarId || '',
    bio: profile.bio || existing?.bio || '',
    completed: profile.completed !== undefined ? profile.completed : (existing?.completed || false),
    updatedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
    return newProfile
  } catch (error) {
    console.error('[storage] 프로필 저장 오류:', error)
    throw new Error('프로필 저장에 실패했습니다.')
  }
}

/**
 * 프로필 삭제
 */
export function clearProfile(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[storage] 프로필 삭제 오류:', error)
  }
}





