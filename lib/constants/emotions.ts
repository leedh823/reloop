/**
 * 감정 태그 상수 정의
 */

export interface EmotionOption {
  id: string
  label: string
  slug: string
  color: string
}

export const EMOTIONS: EmotionOption[] = [
  { id: 'all', label: '전체', slug: 'all', color: '#9F9366' },
  { id: 'anxiety', label: '불안', slug: 'anxiety', color: '#9F9366' },
  { id: 'frustration', label: '좌절', slug: 'frustration', color: '#9F9366' },
  { id: 'regret', label: '후회', slug: 'regret', color: '#9F9366' },
  { id: 'relief', label: '안도', slug: 'relief', color: '#9F9366' },
  { id: 'growth', label: '성장', slug: 'growth', color: '#9F9366' },
]

export const EMOTION_MAP: Record<string, string> = {
  'anxiety': '불안',
  'frustration': '좌절',
  'regret': '후회',
  'relief': '안도',
  'growth': '성장',
}

export function getEmotionLabel(slug: string): string {
  return EMOTION_MAP[slug] || slug
}









