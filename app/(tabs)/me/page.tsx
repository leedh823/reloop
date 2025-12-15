'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import AppShell from '@/components/Layout/AppShell'
import { PrimaryButton } from '@/components/UI/Button'
import { getProfile } from '@/lib/storage/profile'
import { Failure } from '@/types/failure'

const AVATAR_IMAGES: { [key: string]: string } = {
  avatar1: '/images/프로필 1.png',
  avatar2: '/images/프로필 2.png',
  avatar3: '/images/프로필3.png',
  avatar4: '/images/프로필 4.png',
  avatar5: '/images/프로필 5.png',
  avatar6: '/images/프로필 6.png',
}

export default function MePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [myFailures, setMyFailures] = useState<Failure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loaded = getProfile()
    setProfile(loaded)
    
    // 내가 작성한 게시글 가져오기
    const loadMyFailures = async () => {
      try {
        const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
        if (!guestId) {
          setMyFailures([])
          setLoading(false)
          return
        }

        const response = await fetch('/api/failures')
        if (response.ok) {
          const allFailures = await response.json()
          // 내가 작성한 게시글만 필터링
          const filtered = allFailures.filter((f: Failure) => f.authorId === guestId)
          setMyFailures(filtered)
        }
      } catch (error) {
        console.error('[me] 게시글 로드 오류:', error)
        setMyFailures([])
      } finally {
        setLoading(false)
      }
    }
    
    loadMyFailures()
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
      <AppShell title="" rightAction={rightAction}>
        <div className="flex items-center justify-center py-16">
          <span className="text-[#B3B3B3]">로딩 중...</span>
        </div>
      </AppShell>
    )
  }

  if (!profile || !profile.completed) {
    return (
      <AppShell title="" rightAction={rightAction}>
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

  const getImageUrl = (failure: Failure) => {
    if (failure.images && failure.images.length > 0) {
      return failure.images[0].url
    }
    return failure.fileUrl
  }

  return (
    <AppShell title="" rightAction={rightAction}>
      <div className="w-full">
        {/* 프로필 헤더 (Instagram 스타일) */}
        <div className="px-4 py-4">
          <div className="flex items-start gap-4">
            {/* 프로필 사진 */}
            <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profile.avatarId && AVATAR_IMAGES[profile.avatarId] ? (
                <Image
                  src={AVATAR_IMAGES[profile.avatarId]}
                  alt="Profile Avatar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>

            {/* 사용자 정보 및 통계 */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <h1 className="text-lg font-semibold text-white mb-3">{profile.name}</h1>
                
                {/* 통계 */}
                <div className="flex items-center gap-6 mb-3">
                  <div className="text-center">
                    <div className="text-base font-semibold text-white">{myFailures.length}</div>
                    <div className="text-xs text-[#B3B3B3]">게시물</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-semibold text-white">0</div>
                    <div className="text-xs text-[#B3B3B3]">팔로워</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-semibold text-white">0</div>
                    <div className="text-xs text-[#B3B3B3]">팔로우</div>
                  </div>
                </div>

                {/* 자기소개 */}
                {profile.bio && (
                  <p className="text-sm text-white leading-relaxed mb-3">{profile.bio}</p>
                )}

                {/* 프로필 편집 버튼 */}
                <button
                  onClick={() => router.push('/profile-onboarding?edit=1')}
                  className="w-full min-h-[32px] px-4 py-1.5 bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg text-sm font-medium text-white hover:bg-[#252525] transition-colors"
                >
                  프로필 편집
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 게시물 그리드 */}
        <div className="border-t border-[#2A2A2A] mt-4">
          {myFailures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4">
                <span className="text-6xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                게시물이 없어요
              </h3>
              <p className="text-sm text-[#B3B3B3] mb-6">
                첫 번째 실패 경험을 공유해보세요.
              </p>
              <PrimaryButton
                onClick={() => router.push('/compose')}
                rounded="lg"
                className="min-h-[48px] px-8"
              >
                게시물 작성하기
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {myFailures.map((failure) => {
                const imageUrl = getImageUrl(failure)
                return (
                  <Link
                    key={failure.id}
                    href={`/failures/${failure.id}`}
                    className="aspect-square bg-[#1a1a1a] overflow-hidden relative group"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={failure.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-reloop-blue/20 to-reloop-blue/5 flex items-center justify-center">
                        <span className="text-reloop-blue/30 text-3xl">📝</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
