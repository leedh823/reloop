'use client'

import { useRouter } from 'next/navigation'
import AppShell from '@/components/Layout/AppShell'
import ConfirmModal from '@/components/UI/ConfirmModal'
import { useState } from 'react'
import { clearProfile } from '@/lib/storage/profile'

export default function SettingsPage() {
  const router = useRouter()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const handleLogout = () => {
    // 로그아웃: 게스트 ID와 프로필 삭제
    localStorage.removeItem('guestId')
    clearProfile()
    // 로그인 페이지로 이동
    router.push('/login')
  }

  const handleWithdraw = () => {
    // 회원탈퇴: 모든 데이터 삭제
    localStorage.removeItem('guestId')
    localStorage.removeItem('onboardingCompleted')
    clearProfile()
    // 작성한 글도 삭제할지 선택 가능 (현재는 유지)
    // localStorage.removeItem('reloop_failures')
    // 로그인 페이지로 이동
    router.push('/login')
  }

  return (
    <AppShell title="설정">
      <div className="px-4 py-4 bg-white min-h-full">
        {/* 이용 안내 섹션 */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">이용 안내</h2>
          <div className="space-y-0 bg-white rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => {
                // TODO: 공지사항 페이지 구현
                alert('공지사항은 준비 중입니다.')
              }}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white border-b border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              공지사항
            </button>
            <button
              onClick={() => {
                // TODO: 문의하기 페이지 구현
                alert('문의하기는 준비 중입니다.')
              }}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white border-b border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              문의하기
            </button>
            <button
              onClick={() => {
                // TODO: 개인정보 처리방침 페이지 구현
                alert('개인정보 처리방침은 준비 중입니다.')
              }}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white border-b border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              개인정보 처리방침
            </button>
            <button
              onClick={() => {
                // TODO: 서비스 이용 약관 페이지 구현
                alert('서비스 이용 약관은 준비 중입니다.')
              }}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white border-b border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              서비스 이용 약관
            </button>
            <div className="flex items-center justify-between px-4 py-3 min-h-[48px] bg-white text-gray-900">
              <span>버전 정보</span>
              <span className="text-gray-500">1.1.1</span>
            </div>
          </div>
        </div>

        {/* 계정 섹션 */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">계정</h2>
          <div className="space-y-0 bg-white rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white border-b border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              로그아웃
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full text-left px-4 py-3 min-h-[48px] bg-white text-gray-900 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {isLogoutModalOpen && (
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="로그아웃"
          message="정말 로그아웃하시겠습니까?"
          confirmText="로그아웃"
          cancelText="취소"
        />
      )}

      {/* 회원탈퇴 확인 모달 */}
      {isWithdrawModalOpen && (
        <ConfirmModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdraw}
          title="회원탈퇴"
          message="정말 회원탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다."
          confirmText="탈퇴하기"
          cancelText="취소"
        />
      )}
    </AppShell>
  )
}

