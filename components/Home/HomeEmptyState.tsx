'use client'

import Link from 'next/link'
import { PrimaryButton } from '@/components/UI/Button'

interface HomeEmptyStateProps {
  message?: string
  ctaText?: string
  ctaLink?: string
}

export default function HomeEmptyState({
  message = '아직 올라온 기록이 없어요',
  ctaText = '첫 실패 기록하기',
  ctaLink = '/compose',
}: HomeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6">
        <span className="text-6xl">📝</span>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        {message}
      </h2>
      <p className="text-sm text-[#B3B3B3] mb-8 max-w-xs">
        첫 실패를 기록하고 공유해보세요.
      </p>
      <Link href={ctaLink}>
        <PrimaryButton rounded="lg" className="min-h-[48px] px-8">
          {ctaText}
        </PrimaryButton>
      </Link>
    </div>
  )
}






