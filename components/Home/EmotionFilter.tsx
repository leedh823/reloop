'use client'

import FilterPillList from './FilterPillList'
import { EMOTIONS } from '@/lib/constants/emotions'

interface EmotionFilterProps {
  selectedEmotion: string
  onEmotionChange: (emotion: string) => void
}

export default function EmotionFilter({
  selectedEmotion,
  onEmotionChange,
}: EmotionFilterProps) {
  return (
    <FilterPillList
      items={EMOTIONS}
      selectedId={selectedEmotion}
      onSelect={onEmotionChange}
    />
  )
}

