/**
 * 프로필 타입 정의
 */

export interface Profile {
  name: string
  gender: 'male' | 'female' | 'none'
  avatarId: string
  bio: string
  completed: boolean
  updatedAt: string // ISO string
}





