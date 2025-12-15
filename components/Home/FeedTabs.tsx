'use client'

import { FeedTab } from '@/lib/feed/buildFeed'

interface FeedTabsProps {
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
}

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'for-you', label: 'For You' },
  { id: 'trending', label: 'Trending' },
  { id: 'recent', label: 'Recent' },
  { id: 'following', label: 'Following' },
]

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[#2A2A2A] bg-black px-4 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-4 py-3 min-h-[48px] text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-[#B3B3B3] hover:text-white'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-reloop-blue" />
          )}
        </button>
      ))}
    </div>
  )
}






