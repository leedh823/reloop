'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '제목, 요약 검색...',
}: SearchBarProps) {
  return (
    <section className="w-full bg-black py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="relative w-full md:w-[70%] lg:w-[60%]">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-12 md:h-14 px-4 pl-12 bg-[#111] border border-[#2A2A2A] rounded-full text-[#F5F5F5] placeholder:text-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A] pointer-events-none"
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
    </section>
  )
}

