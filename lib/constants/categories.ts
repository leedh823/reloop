/**
 * 카테고리 상수 정의
 */

export interface CategoryOption {
  id: string
  label: string
  slug: string
  color: string
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: '전체', slug: 'all', color: '#359DFE' },
  { id: 'job', label: '취업', slug: 'job', color: '#359DFE' },
  { id: 'school', label: '학교', slug: 'school', color: '#359DFE' },
  { id: 'side-project', label: '사이드프로젝트', slug: 'side-project', color: '#359DFE' },
  { id: 'relationship', label: '관계', slug: 'relationship', color: '#359DFE' },
  { id: 'business', label: '비즈니스', slug: 'business', color: '#359DFE' },
  { id: 'other', label: '기타', slug: 'other', color: '#359DFE' },
]

export const CATEGORY_MAP: Record<string, string> = {
  'job': '취업',
  'school': '학교',
  'side-project': '사이드프로젝트',
  'relationship': '관계',
  'business': '비즈니스',
  'other': '기타',
}

export function getCategoryLabel(slug: string): string {
  return CATEGORY_MAP[slug] || slug
}




