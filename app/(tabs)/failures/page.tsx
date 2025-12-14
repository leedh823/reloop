'use client'

import AppShell from '@/components/Layout/AppShell'
import Link from 'next/link'
import { PrimaryButton } from '@/components/UI/Button'

export default function FailuresPage() {
  return (
    <AppShell title="실패 목록">
      <div className="px-4 py-4 space-y-4">
        {/* Placeholder Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">실패 목록 화면</h2>
          <p className="text-[#B3B3B3] text-sm">
            작성한 실패 목록이 여기에 표시됩니다.
          </p>
          <p className="text-xs text-[#777777]">
            (3단계: 디자인 시스템 적용 예정)
          </p>
        </div>

        {/* CTA 버튼 (다음 단계에서 구현) */}
        <div className="space-y-2">
          <Link href="/compose">
            <PrimaryButton fullWidth className="min-h-[44px]">
              새 실패 작성하기
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}

