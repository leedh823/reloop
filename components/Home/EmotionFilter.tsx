'use client'

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
    <section className="w-full bg-black py-3">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 flex-wrap md:flex-nowrap justify-center md:justify-start">
          {EMOTIONS.map((emotion) => {
            const isActive = selectedEmotion === emotion.id
            return (
              <button
                key={emotion.id}
                onClick={() => onEmotionChange(emotion.id)}
                className={`px-4 py-2 h-9 md:h-10 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D6C38E] text-white shadow-md scale-105'
                    : 'bg-[#1A1A1A] text-[#CFCFCF] hover:bg-[#222]'
                }`}
              >
                {emotion.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

