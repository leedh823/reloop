'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // 2초 후 로그인 페이지로 이동
    const timer = setTimeout(() => {
      router.push('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center safe-area-top safe-area-bottom">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        {/* 로고 */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Reloop"
            width={120}
            height={40}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* 슬로건 */}
        <p className="text-white text-lg font-medium text-center px-4">
          실패를 기록하고 다시 도전하세요
        </p>
      </div>
    </div>
  )
}

