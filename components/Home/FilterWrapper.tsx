'use client'

import CategoryFilter from './CategoryFilter'
import EmotionFilter from './EmotionFilter'

interface FilterWrapperProps {
  selectedCategory: string
  selectedEmotion: string
  onCategoryChange: (category: string) => void
  onEmotionChange: (emotion: string) => void
}

export default function FilterWrapper({
  selectedCategory,
  selectedEmotion,
  onCategoryChange,
  onEmotionChange,
}: FilterWrapperProps) {
  return (
    <div className="bg-black border-b border-[#2A2A2A] sticky top-14 md:top-16 z-40">
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
  )
}



