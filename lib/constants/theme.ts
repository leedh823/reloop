/**
 * Reloop 다크 테마 컬러 상수
 */

export const THEME = {
  // 배경
  background: {
    base: '#000000', // 또는 #050505
    card: '#111111', // ~ #161616
    input: '#181818',
  },
  
  // 텍스트
  text: {
    primary: '#F5F5F5',
    secondary: '#B3B3B3',
    placeholder: '#777777',
  },
  
  // 포인트 컬러
  primary: {
    main: '#359DFE', // Reloop Blue
    hover: '#2B8FE5', // 약간 더 밝은 블루
  },
  
  // 보더
  border: {
    default: '#2A2A2A',
    input: '#333333',
    light: '#1c1c1c',
  },
  
  // 버튼
  button: {
    secondary: {
      bg: '#111111',
      hover: '#1c1c1c',
      text: '#FFFFFF',
      border: '#2A2A2A',
    },
  },
} as const

/**
 * Tailwind 클래스 패턴
 */
export const THEME_CLASSES = {
  // 배경
  bgBase: 'bg-black',
  bgCard: 'bg-[#111]',
  bgInput: 'bg-[#181818]',
  
  // 텍스트
  textPrimary: 'text-[#F5F5F5]',
  textSecondary: 'text-[#B3B3B3]',
  textPlaceholder: 'placeholder:text-[#777777]',
  
  // 보더
  borderDefault: 'border-[#2A2A2A]',
  borderInput: 'border-[#333333]',
  
  // 인풋 공통 스타일
  inputBase: 'w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder:text-[#777777] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent',
  
  // 셀렉트 공통 스타일
  selectBase: 'w-full px-4 py-2 bg-[#181818] border border-[#333333] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent appearance-none',
  
  // Primary 버튼
  buttonPrimary: 'bg-reloop-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors',
  buttonPrimaryFull: 'bg-reloop-blue text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors',
  
  // Secondary 버튼
  buttonSecondary: 'bg-[#111111] text-white border border-[#2A2A2A] px-6 py-3 rounded-lg font-semibold hover:bg-[#1c1c1c] transition-colors',
} as const



