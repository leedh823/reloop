'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  title?: string
  rightAction?: ReactNode
}

export default function AppShell({ children, title, rightAction }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { path: '/home', label: '홈', icon: '🏠' },
    { path: '/failures', label: '실패', icon: '📋' },
    { path: '/ai', label: 'AI', icon: '🤖' },
    { path: '/me', label: '나', icon: '👤' },
  ]

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/' || pathname === '/home'
    }
    return pathname.startsWith(path)
  }

  // compose 페이지에서는 FAB 숨기기
  const showFAB = !pathname.startsWith('/compose')

  const isSettingsPage = pathname === '/settings'
  const headerBg = isSettingsPage ? 'bg-white' : 'bg-black'
  const headerBorder = isSettingsPage ? 'border-gray-200' : 'border-[#2A2A2A]'
  const headerText = isSettingsPage ? 'text-gray-900' : 'text-white'
  const mainBg = isSettingsPage ? 'bg-white' : 'bg-black'

  return (
    <div className={`flex flex-col h-screen w-full max-w-md mx-auto ${mainBg} overflow-hidden`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 h-14 ${headerBg} border-b ${headerBorder} safe-area-top z-10 flex-shrink-0`}>
        <div className="flex items-center flex-1 min-w-0">
          {isSettingsPage ? (
            <>
              <button
                onClick={() => router.back()}
                className="p-2 min-h-[44px] min-w-[44px] -ml-2 mr-2"
                aria-label="뒤로가기"
              >
                <svg className={`w-6 h-6 ${headerText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={`text-lg font-semibold ${headerText} truncate`}>{title}</h1>
            </>
          ) : title ? (
            <h1 className={`text-lg font-semibold ${headerText} truncate`}>{title}</h1>
          ) : (
            <Link href="/home" className="flex items-center space-x-2 min-w-0">
              <span className="text-xl font-bold text-reloop-blue">Reloop</span>
            </Link>
          )}
        </div>
        {rightAction && <div className="ml-2 flex-shrink-0">{rightAction}</div>}
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 safe-area-bottom min-h-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#2A2A2A] safe-area-bottom z-10 flex-shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                isActive(tab.path)
                  ? 'text-reloop-blue'
                  : 'text-[#B3B3B3]'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Floating Action Button (Compose) */}
      {showFAB && (
        <Link
          href="/compose"
          className="fixed bottom-20 right-4 w-14 h-14 bg-reloop-blue text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10 min-h-[44px] min-w-[44px]"
          aria-label="실패 작성"
        >
          <span className="text-2xl">+</span>
        </Link>
      )}
    </div>
  )
}

