import Link from 'next/link'
import Image from 'next/image'
import { PrimaryButtonLink, SecondaryButtonLink } from '@/components/UI/Button'

export default function HeroSection() {
  return (
    <section className="bg-black py-12 md:py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 좌측 텍스트 영역 */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                실패를 쌓아 올리는
                <br />
                <span className="text-reloop-blue">포트폴리오</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
                Reloop은 실패를 공유하고, AI와 함께 정리하고, Discord에서 다시 도전하는 사람들의 커뮤니티입니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <PrimaryButtonLink href="/submit" className="w-full sm:w-auto">
                실패 올리기
              </PrimaryButtonLink>
              <SecondaryButtonLink href="/ai" className="w-full sm:w-auto">
                AI에게 정리 요청하기
              </SecondaryButtonLink>
              <Link
                href="#"
                className="bg-[#111111] text-white border border-[#2A2A2A] px-6 py-3 h-12 rounded-lg font-semibold hover:bg-[#1c1c1c] transition-colors text-center w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:ring-offset-2 focus:ring-offset-black"
              >
                Discord에서 이야기하기
              </Link>
            </div>
          </div>

          {/* 우측 프리뷰 박스 */}
          <div className="hidden lg:block">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 max-w-md">
              <div className="space-y-4">
                {/* 썸네일 */}
                <div className="relative w-full h-48 bg-gradient-to-br from-reloop-blue/20 to-reloop-blue/5 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-reloop-blue/30 text-6xl">📝</span>
                  </div>
                </div>
                
                {/* 제목 */}
                <h3 className="text-white font-bold text-lg line-clamp-2">
                  실패 카드 예시
                </h3>
                
                {/* 태그 */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-reloop-blue/20 text-reloop-blue text-xs rounded-full">
                    취업
                  </span>
                  <span className="px-3 py-1 bg-reloop-gold/20 text-reloop-gold text-xs rounded-full">
                    좌절
                  </span>
                </div>
                
                {/* 요약 */}
                <p className="text-gray-400 text-sm line-clamp-2">
                  이 프로젝트에서 배운 것들을 정리하고 다음 도전을 준비합니다.
                </p>
                
                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
                  <span>작성자</span>
                  <span>2024.12.03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

