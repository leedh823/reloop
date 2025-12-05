'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Failure } from '@/types'

interface FailureCardCarouselProps {
  failures: Failure[]
}

export default function FailureCardCarousel({ failures }: FailureCardCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [failures])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = 350 // 카드 너비 + gap
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  if (failures.length === 0) {
    return null
  }

  return (
    <section className="bg-black py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-3xl md:text-4xl uppercase tracking-wider">
            INSIDE OUR FAILURES
          </h2>
        </div>

        {/* 카드 리스트 컨테이너 */}
        <div className="relative">
          {/* 좌측 화살표 버튼 - 데스크탑에서만 표시 */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-transparent border-2 border-reloop-blue text-reloop-blue w-12 h-12 rounded-full items-center justify-center hover:bg-reloop-blue hover:text-white transition-all duration-200 shadow-lg"
              aria-label="이전 카드 보기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* 우측 화살표 버튼 - 데스크탑에서만 표시 */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-transparent border-2 border-reloop-blue text-reloop-blue w-12 h-12 rounded-full items-center justify-center hover:bg-reloop-blue hover:text-white transition-all duration-200 shadow-lg"
              aria-label="다음 카드 보기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* 스크롤 가능한 카드 리스트 */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 sm:px-0 snap-x snap-mandatory"
          >
            {failures.map((failure) => (
              <Link
                key={failure.id}
                href={`/failures/${failure.id}`}
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[330px] h-[380px] sm:h-[400px] bg-[#0f0f0f] rounded-lg overflow-hidden hover:border-2 hover:border-reloop-blue/50 transition-all duration-200 group snap-start"
              >
                {/* 썸네일 이미지 */}
                <div className="relative w-full h-[200px] bg-[#111] overflow-hidden">
                  {failure.thumbnailUrl ? (
                    <Image
                      src={failure.thumbnailUrl}
                      alt={failure.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 330px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-reloop-blue/20 to-reloop-blue/5 flex items-center justify-center">
                      <span className="text-reloop-blue/30 text-4xl">📝</span>
                    </div>
                  )}
                </div>

                {/* 텍스트 블록 */}
                <div className="p-5 flex flex-col h-[200px]">
                  {/* 제목 */}
                  <h3 className="text-white font-bold text-lg md:text-xl mb-3 line-clamp-2 group-hover:text-reloop-blue transition-colors">
                    {failure.title}
                  </h3>

                  {/* 설명 */}
                  <p className="text-[#bdbdbd] text-sm mb-auto line-clamp-3 flex-grow">
                    {failure.summary}
                  </p>

                  {/* 작성자 */}
                  <div className="mt-4 pt-4 border-t border-[#333]">
                    <p className="text-[#666] text-xs uppercase">
                      BY: {failure.author || 'ANONYMOUS'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}

