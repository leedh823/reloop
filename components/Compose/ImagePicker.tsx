'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImagePickerProps {
  images: Array<{ url: string; file: File | null }>
  onImagesChange: (images: Array<{ url: string; file: File | null }>) => void
  maxImages?: number
}

export default function ImagePicker({ images, onImagesChange, maxImages = 10 }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (images.length + imageFiles.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 선택할 수 있습니다.`)
      return
    }

    const newImages = imageFiles.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
    }))

    onImagesChange([...images, ...newImages])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    // URL 해제
    URL.revokeObjectURL(images[index].url)
    onImagesChange(updatedImages)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        이미지 {images.length > 0 && `(${images.length}/${maxImages})`}
      </label>

      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square group rounded-lg overflow-hidden bg-[#1a1a1a]">
              {image.url.startsWith('blob:') || image.url.startsWith('http') ? (
                <img
                  src={image.url}
                  alt={`이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={image.url}
                  alt={`이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="이미지 삭제"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 이미지 추가 버튼 */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-reloop-blue bg-reloop-blue/10'
              : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[#B3B3B3]">
              {isDragging ? '여기에 이미지를 놓으세요' : '이미지 추가'}
            </p>
            <p className="text-xs text-[#777777]">
              사진을 찍거나 갤러리에서 선택
            </p>
          </div>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-[#777777] text-center">
          최대 {maxImages}개의 이미지만 선택할 수 있습니다.
        </p>
      )}
    </div>
  )
}

