'use client'

interface StepAvatarProps {
  selectedAvatarId: string
  onAvatarSelect: (avatarId: string) => void
}

const AVATARS = [
  { id: 'avatar1', emoji: '😊' },
  { id: 'avatar2', emoji: '😎' },
  { id: 'avatar3', emoji: '🤔' },
  { id: 'avatar4', emoji: '😄' },
  { id: 'avatar5', emoji: '🙂' },
  { id: 'avatar6', emoji: '😌' },
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
            className={`aspect-square min-h-[80px] rounded-xl text-4xl flex items-center justify-center transition-all ${
              selectedAvatarId === avatar.id
                ? 'bg-reloop-blue ring-4 ring-reloop-blue ring-offset-2'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {avatar.emoji}
          </button>
        ))}
      </div>
      {!selectedAvatarId && (
        <p className="text-xs text-red-500 mt-2">프로필 사진을 선택해주세요</p>
      )}
    </div>
  )
}

