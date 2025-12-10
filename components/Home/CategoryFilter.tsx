'use client'

import { CATEGORIES } from '@/lib/constants/categories'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <section className="w-full bg-black py-3 md:py-4">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex gap-2 flex-wrap justify-center md:justify-start">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`px-4 py-2 h-9 md:h-10 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-reloop-blue text-white shadow-md shadow-reloop-blue/20'
                    : 'bg-[#1A1A1A] text-[#CFCFCF] hover:bg-[#222]'
                }`}
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

