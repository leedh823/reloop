'use client'

import SearchBar from './SearchBar'
import CategoryFilter from './CategoryFilter'
import EmotionFilter from './EmotionFilter'

interface FilterBarProps {
  selectedCategory: string
  selectedEmotion: string
  searchQuery: string
  onCategoryChange: (category: string) => void
  onEmotionChange: (emotion: string) => void
  onSearchChange: (query: string) => void
}

export default function FilterBar({
  selectedCategory,
  selectedEmotion,
  searchQuery,
  onCategoryChange,
  onEmotionChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-black border-b border-[#2A2A2A] sticky top-16 z-40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 검색바 영역 */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="제목, 요약 검색..."
          />
        </div>

        {/* 필터 영역 */}
        <div className="space-y-4">
          {/* 카테고리 필터 */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />

          {/* 감정 필터 */}
          <EmotionFilter
            selectedEmotion={selectedEmotion}
            onEmotionChange={onEmotionChange}
          />
        </div>
      </div>
    </div>
  )
}
