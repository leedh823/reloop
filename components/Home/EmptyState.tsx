'use client'

import Link from 'next/link'
import { PrimaryButtonLink } from '@/components/UI/Button'

export default function EmptyState() {
  return (
    <div className="text-center py-20 px-4">
      <p className="text-[#9BA0A8] text-lg font-medium mb-2">
        표시할 실패가 없습니다.
      </p>
      <p className="text-[#6F7880] text-sm mb-6">
        필터를 조정하거나 검색어를 변경해보세요.
      </p>
      <PrimaryButtonLink href="/submit" rounded="full">
        첫 실패를 기록해볼까요?
      </PrimaryButtonLink>
    </div>
  )
}

