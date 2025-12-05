'use client'

import { PrimaryButtonLink } from '@/components/UI/Button'

export default function EmptyState() {
  return (
    <div className="text-center py-20 px-4">
      <p className="text-[#A0A4A9] text-lg font-medium mb-2">
        표시할 실패가 없습니다.
      </p>
      <p className="text-[#A0A4A9] text-sm mb-8">
        검색 또는 필터를 변경해보세요.
      </p>
      <PrimaryButtonLink href="/submit" rounded="full">
        실패 업로드하기
      </PrimaryButtonLink>
    </div>
  )
}

