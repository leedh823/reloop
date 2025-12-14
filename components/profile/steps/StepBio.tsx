'use client'

interface StepBioProps {
  bio: string
  onBioChange: (bio: string) => void
}

export default function StepBio({ bio, onBioChange }: StepBioProps) {
  return (
    <div>
      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
        자기소개 (선택)
      </label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        maxLength={100}
        rows={6}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent resize-none min-h-[150px]"
        placeholder="자신을 소개해주세요 (최대 100자)"
      />
      <div className="flex justify-end mt-1">
        <p className="text-xs text-gray-400">{bio.length}/100</p>
      </div>
    </div>
  )
}





