'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/Layout/AppShell'
import FeedTabs from '@/components/Home/FeedTabs'
import FeedCard from '@/components/Home/FeedCard'
import HomeEmptyState from '@/components/Home/HomeEmptyState'
import { FeedTab, getFeedByTab, FeedItem } from '@/lib/feed/buildFeed'
import Link from 'next/link'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('recent')
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const items = getFeedByTab(activeTab)
      setFeedItems(items)
    } catch (error) {
      console.error('[home] 피드 로드 오류:', error)
      setFeedItems([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab)
    setLoading(true)
    setTimeout(() => {
      try {
        const items = getFeedByTab(tab)
        setFeedItems(items)
      } catch (error) {
        console.error('[home] 피드 로드 오류:', error)
        setFeedItems([])
      } finally {
        setLoading(false)
      }
    }, 100) // 탭 전환 애니메이션을 위한 약간의 딜레이
  }

  return (
    <AppShell title="홈">
      <div className="flex flex-col h-full">
        {/* Feed Tabs */}
        <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Feed Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[#B3B3B3]">로딩 중...</span>
            </div>
          ) : activeTab === 'following' && feedItems.length === 0 ? (
            <HomeEmptyState
              message="팔로잉 피드는 준비 중이에요"
              ctaText="최근 피드 보기"
              ctaLink="/home"
            />
          ) : feedItems.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <div className="space-y-0">
              {feedItems.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  )
}
