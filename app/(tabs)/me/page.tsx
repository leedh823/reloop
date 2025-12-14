'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'
import { getProfile } from '@/lib/storage/profile'

const AVATARS: { [key: string]: string } = {
  avatar1: '😊',
  avatar2: '😎',
  avatar3: '🤔',
  avatar4: '😄',
  avatar5: '🙂',
  avatar6: '😌',
}

const GENDER_LABELS: { [key: string]: string } = {
  male: '남자',
  female: '여자',
  none: '',
}

export default function MePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loaded = getProfile()
    setProfile(loaded)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <AppShell title="나">
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    )
  }

  if (!profile || !profile.completed) {
    return (
      <AppShell title="나">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-6">
            <span className="text-6xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            프로필이 없어요
          </h2>
          <p className="text-sm text-[#B3B3B3] mb-8 max-w-xs">
            프로필을 설정하고 나를 소개해보세요.
          </p>
          <PrimaryButton
            onClick={() => router.push('/profile-onboarding')}
            rounded="lg"
            className="min-h-[48px] px-8"
          >
            프로필 설정하기
          </PrimaryButton>
        </div>
      </AppShell>
    )
  }

  const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null

  return (
    <AppShell title="나">
      <div className="px-4 py-4">
        {/* 프로필 카드 */}
        <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-6 mb-4">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* 아바타 */}
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-5xl">
              {AVATARS[profile.avatarId] || '👤'}
            </div>

            {/* 이름 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
              {profile.gender !== 'none' && (
                <p className="text-sm text-[#B3B3B3]">{GENDER_LABELS[profile.gender]}</p>
              )}
            </div>

            {/* 자기소개 */}
            {profile.bio && (
              <p className="text-sm text-[#B3B3B3] leading-relaxed max-w-sm">
                {profile.bio}
              </p>
            )}

            {/* 프로필 수정 버튼 */}
            <PrimaryButton
              onClick={() => router.push('/profile-onboarding?edit=1')}
              rounded="lg"
              className="min-h-[48px] px-8"
            >
              프로필 수정
            </PrimaryButton>
          </div>
        </div>

        {/* 디버그: guestId 표시 */}
        {guestId && (
          <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-3">
            <p className="text-xs text-[#777777]">Guest ID: {guestId}</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
