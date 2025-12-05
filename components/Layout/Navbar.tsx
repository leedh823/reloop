'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/failures', label: '실패 목록' },
    { href: '/ai', label: 'AI 분석' },
  ]

  return (
    <nav className="bg-black/80 backdrop-blur-sm border-b border-[#2a2a2a] sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-reloop-blue">Reloop</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative transition-colors ${
                  isActive(link.href)
                    ? 'text-reloop-blue'
                    : 'text-[#e5e5e5] hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-reloop-blue" />
                )}
              </Link>
            ))}
            <Link
              href="/submit"
              className="bg-reloop-blue text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors"
            >
              실패 공유하기
            </Link>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-[#2a2a2a]">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 transition-colors ${
                  isActive(link.href)
                    ? 'text-reloop-blue font-semibold'
                    : 'text-[#e5e5e5] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full bg-reloop-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors text-center"
            >
              실패 공유하기
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
