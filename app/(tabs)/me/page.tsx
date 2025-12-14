'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'
import { getProfile } from '@/lib/storage/profile'

const AVATAR_IMAGES: { [key: string]: string } = {
  avatar1: '/images/프로필 1.png',
  avatar2: '/images/프로필 2.png',
  avatar3: '/images/프로필3.png',
  avatar4: '/images/프로필 4.png',
  avatar5: '/images/프로필 5.png',
  avatar6: '/images/프로필 6.png',
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

  // 톱니바퀴 아이콘 (항상 표시)
  const rightAction = (
    <button
      onClick={() => router.push('/settings')}
      className="p-2 min-h-[44px] min-w-[44px] text-white"
      aria-label="설정"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  )

  if (loading) {
    return (
      <AppShell title="나" rightAction={rightAction}>
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    )
  }

  if (!profile || !profile.completed) {
    return (
      <AppShell title="나" rightAction={rightAction}>
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
    <AppShell title="나" rightAction={rightAction}>
          <div className="px-4 py-4">
        {/* 프로필 카드 */}
        <div className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-6 mb-4">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* 아바타 */}
            <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
              {profile.avatarId && AVATAR_IMAGES[profile.avatarId] ? (
                <Image
                  src={AVATAR_IMAGES[profile.avatarId]}
                  alt="Profile Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">👤</span>
              )}
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
