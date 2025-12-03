'use client'

import { useState } from 'react'

interface FilterBarProps {
  selectedCategory: string
  selectedEmotion: string
  searchQuery: string
  onCategoryChange: (category: string) => void
  onEmotionChange: (emotion: string) => void
  onSearchChange: (query: string) => void
}

const categories = [
  { id: 'all', label: '전체' },
  { id: 'job', label: '취업' },
  { id: 'school', label: '학교' },
  { id: 'side-project', label: '사이드프로젝트' },
  { id: 'relationship', label: '관계' },
  { id: 'business', label: '비즈니스' },
  { id: 'other', label: '기타' },
]

const emotions = [
  { id: 'all', label: '전체' },
  { id: 'anxiety', label: '불안' },
  { id: 'frustration', label: '좌절' },
  { id: 'regret', label: '후회' },
  { id: 'relief', label: '안도' },
  { id: 'growth', label: '성장' },
]

export default function FilterBar({
  selectedCategory,
  selectedEmotion,
  searchQuery,
  onCategoryChange,
  onEmotionChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-black border-b border-white/10 sticky top-16 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* 좌측: 카테고리 탭 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto pb-2 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-reloop-blue text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* 중앙: 감정 태그 필터 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto pb-2 lg:pb-0">
            {emotions.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => onEmotionChange(emotion.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedEmotion === emotion.id
                    ? 'bg-reloop-gold text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {emotion.label}
              </button>
            ))}
          </div>

          {/* 우측: 검색 인풋 */}
          <div className="w-full lg:w-auto lg:ml-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="제목, 요약 검색..."
                className="w-full lg:w-64 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

