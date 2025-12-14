'use client'

import { PrimaryButton, SecondaryButton } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg p-6 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#B3B3B3] mb-6">{message}</p>
          <div className="flex gap-3">
            <SecondaryButton
              onClick={onClose}
              className="flex-1 min-h-[48px]"
            >
              {cancelText}
            </SecondaryButton>
            <PrimaryButton
              onClick={handleConfirm}
              className="flex-1 min-h-[48px]"
            >
              {confirmText}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  )
}

