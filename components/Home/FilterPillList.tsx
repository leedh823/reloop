'use client'

interface FilterPill {
  id: string
  label: string
}

interface FilterPillListProps {
  items: FilterPill[]
  selectedId: string
  onSelect: (id: string) => void
  label?: string
}

export default function FilterPillList({
  items,
  selectedId,
  onSelect,
  label,
}: FilterPillListProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#B3B3B3] mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item) => {
          const isActive = selectedId === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`px-4 py-2 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-reloop-blue text-white shadow-md scale-105'
                  : 'bg-[#1A1A1A] text-[#CFCFCF] hover:bg-[#222]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

