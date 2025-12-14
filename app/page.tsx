'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    
    if (onboardingCompleted) {
      router.replace('/home')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return null
}
