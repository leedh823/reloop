'use client'

import { useState, useEffect } from 'react'
import { getApiUrl, getStoredApiHost, setApiHost, clearApiHost } from '@/lib/utils/api'

/**
 * API 호스트 설정 컴포넌트
 * 개발 환경에서 호스트 URL을 설정하여 다른 서버의 API를 테스트할 수 있도록 함
 */
export default function ApiHostConfig() {
  const [hostUrl, setHostUrl] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [currentHost, setCurrentHost] = useState<string | null>(null)

  useEffect(() => {
    // 저장된 호스트 URL 불러오기
    const stored = getStoredApiHost()
    setCurrentHost(stored)
    if (stored) {
      setHostUrl(stored)
    }
  }, [])

  const handleSave = () => {
    if (hostUrl.trim()) {
      setApiHost(hostUrl.trim())
      setCurrentHost(hostUrl.trim())
      setIsOpen(false)
      alert(`API 호스트가 설정되었습니다: ${hostUrl.trim()}`)
    }
  }

  const handleClear = () => {
    clearApiHost()
    setCurrentHost(null)
    setHostUrl('')
    setIsOpen(false)
    alert('API 호스트 설정이 초기화되었습니다. 현재 도메인을 사용합니다.')
  }

  const handleTest = async () => {
    if (!hostUrl.trim()) {
      alert('호스트 URL을 입력해주세요.')
      return
    }

    try {
      const testUrl = getApiUrl('/api/debug/env')
      const response = await fetch(testUrl)
      const data = await response.json()
      
      alert(`API 연결 테스트 성공!\n\n호스트: ${hostUrl.trim()}\n\n응답:\n${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      alert(`API 연결 테스트 실패:\n\n${error.message}`)
    }
  }

  // 프로덕션 환경에서는 표시하지 않음
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#2A2A2A] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-sm border border-[#444] shadow-lg"
        >
          🔧 API 호스트 설정
          {currentHost && (
            <span className="ml-2 text-xs text-[#888]">
              ({currentHost})
            </span>
          )}
        </button>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 shadow-xl min-w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">API 호스트 설정</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#888] hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#CFCFCF] mb-2">
                호스트 URL
              </label>
              <input
                type="text"
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                placeholder="https://reloop-beta.vercel.app"
                className="w-full bg-[#111] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#359DFE]"
              />
              <p className="text-xs text-[#888] mt-1">
                비워두면 현재 도메인을 사용합니다
              </p>
            </div>

            {currentHost && (
              <div className="bg-[#111] border border-[#2A2A2A] rounded px-3 py-2">
                <p className="text-xs text-[#888]">현재 설정:</p>
                <p className="text-sm text-white">{currentHost}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#359DFE] hover:bg-[#2A8EE8] text-white px-4 py-2 rounded text-sm font-medium"
              >
                저장
              </button>
              <button
                onClick={handleTest}
                className="flex-1 bg-[#2A2A2A] hover:bg-[#333] text-white px-4 py-2 rounded text-sm border border-[#444]"
              >
                테스트
              </button>
              {currentHost && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-[#444] hover:bg-[#555] text-white rounded text-sm"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

