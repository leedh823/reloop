'use client'

import Link from 'next/link'
import { PrimaryButton } from '@/components/UI/Button'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6">
        <span className="text-6xl">📝</span>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        아직 기록이 없어요
      </h2>
      <p className="text-sm text-[#B3B3B3] mb-8 max-w-xs">
        첫 실패를 남기고, AI로 정리해보세요.
      </p>
      <Link href="/compose">
        <PrimaryButton rounded="lg" className="min-h-[48px] px-8">
          첫 기록하기
        </PrimaryButton>
      </Link>
    </div>
  )
}
