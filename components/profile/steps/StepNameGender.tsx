'use client'

interface StepNameGenderProps {
  name: string
  gender: 'male' | 'female' | 'none'
  onNameChange: (name: string) => void
  onGenderChange: (gender: 'male' | 'female' | 'none') => void
}

export default function StepNameGender({
  name,
  gender,
  onNameChange,
  onGenderChange,
}: StepNameGenderProps) {
  const isValid = name.length >= 2 && name.length <= 8

  return (
    <div className="space-y-6">
      {/* 이름 입력 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={8}
          className="w-full min-h-[48px] px-4 py-3 bg-white border border-gray-300 rounded-lg text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent"
          placeholder="2~8자로 입력해주세요"
        />
        <div className="flex items-center justify-between mt-1">
          <p className={`text-xs ${isValid ? 'text-gray-500' : 'text-red-500'}`}>
            {name.length > 0 && !isValid && '이름은 2~8자로 입력해주세요'}
          </p>
          <p className="text-xs text-gray-400">{name.length}/8</p>
        </div>
      </div>

      {/* 성별 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          성별 (선택)
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onGenderChange('male')}
            className={`flex-1 min-h-[48px] px-4 py-3 rounded-lg text-base font-medium transition-colors ${
              gender === 'male'
                ? 'bg-reloop-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            남자
          </button>
          <button
            type="button"
            onClick={() => onGenderChange('female')}
            className={`flex-1 min-h-[48px] px-4 py-3 rounded-lg text-base font-medium transition-colors ${
              gender === 'female'
                ? 'bg-reloop-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            여자
          </button>
          <button
            type="button"
            onClick={() => onGenderChange('none')}
            className={`flex-1 min-h-[48px] px-4 py-3 rounded-lg text-base font-medium transition-colors ${
              gender === 'none'
                ? 'bg-reloop-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            선택안함
          </button>
        </div>
      </div>
    </div>
  )
}

