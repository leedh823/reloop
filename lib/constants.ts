/**
 * Reloop 브랜딩 및 슬로건 상수
 */

export const BRAND = {
  name: 'Reloop',
  tagline: '실패를 공유하고 다시 도전하세요',
  description: 'Reloop는 실패를 부끄럽게 여기지 않고, 함께 성장할 수 있는 커뮤니티입니다.',
  colors: {
    primary: '#359DFE', // Reloop Blue
    gold: '#9F9366',
    silver: '#ACACAC',
  },
} as const;

export const SLOGANS = {
  main: '실패를 공유하고 다시 도전하세요',
  hero: '실패를 공유하고\n다시 도전하세요',
  short: '다시 도전',
  sub: '함께 성장하는 실패 공유 커뮤니티',
} as const;

export const HERO_CONTENT = {
  title: '실패를 공유하고',
  titleHighlight: '다시 도전',
  titleSuffix: '하세요',
  description: 'Reloop는 실패를 부끄럽게 여기지 않고, 함께 성장할 수 있는 커뮤니티입니다.\n디스코드에서 함께 이야기하고 다음 도전을 준비하세요.',
  cta: {
    primary: '실패 공유하기',
    secondary: '실패 목록 보기',
  },
} as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    icon: '📝',
    title: '실패 작성',
    description: '경험한 실패를 솔직하게 작성하고 공유하세요.',
  },
  {
    step: 2,
    icon: '💬',
    title: '디스코드에서 이야기',
    description: '디스코드 채널에서 다른 사람들과 함께 이야기하고 조언을 나누세요.',
  },
  {
    step: 3,
    icon: '🚀',
    title: '다시 도전',
    description: '배운 것을 바탕으로 새로운 도전을 시작하세요.',
  },
] as const;

