'use client'

import Image from 'next/image'

interface StepAvatarProps {
  selectedAvatarId: string
  onAvatarSelect: (avatarId: string) => void
}

const AVATARS = [
  { id: 'avatar1', image: '/images/프로필 1.png' },
  { id: 'avatar2', image: '/images/프로필 2.png' },
  { id: 'avatar3', image: '/images/프로필3.png' },
  { id: 'avatar4', image: '/images/프로필 4.png' },
  { id: 'avatar5', image: '/images/프로필 5.png' },
  { id: 'avatar6', image: '/images/프로필 6.png' },
]

export default function StepAvatar({
  selectedAvatarId,
  onAvatarSelect,
}: StepAvatarProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        프로필 사진 <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-4">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onAvatarSelect(avatar.id)}
            className={`aspect-square min-h-[80px] rounded-xl overflow-hidden transition-all ${
              selectedAvatarId === avatar.id
                ? 'ring-4 ring-reloop-blue ring-offset-2'
                : 'ring-2 ring-transparent hover:ring-gray-300'
            }`}
          >
            <Image
              src={avatar.image}
              alt={`Avatar ${avatar.id}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      {!selectedAvatarId && (
        <p className="text-xs text-red-500 mt-2">프로필 사진을 선택해주세요</p>
      )}
    </div>
  )
}

