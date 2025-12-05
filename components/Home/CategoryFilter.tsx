'use client'

import FilterPillList from './FilterPillList'
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
    <FilterPillList
      items={CATEGORIES}
      selectedId={selectedCategory}
      onSelect={onCategoryChange}
    />
  )
}

