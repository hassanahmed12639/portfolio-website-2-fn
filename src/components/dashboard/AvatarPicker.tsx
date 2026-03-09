'use client'

import { useRef, useMemo } from 'react'

interface AvatarPickerProps {
  currentType: string
  currentUrl: string
  initials: string
  onImageUpload: (file: File | null) => void
  uploading?: boolean
}

export default function AvatarPicker({
  currentType,
  currentUrl,
  initials,
  onImageUpload,
  uploading
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      e.target.value = ''
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG or WebP images allowed')
      e.target.value = ''
      return
    }

    onImageUpload(file)
    e.target.value = ''
  }

  const cacheBuster = useMemo(() => Date.now(), [currentUrl])

  return (
    <div className="flex items-center gap-5">

      {/* Avatar preview */}
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-blue-600 text-white text-2xl font-bold">
          {currentType === 'image' && currentUrl ? (
            <img
              src={`${currentUrl}${currentUrl.includes('?') ? '&' : '?'}t=${cacheBuster}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
        <p className="text-xs text-slate-400 mt-1.5">
          JPG, PNG or WebP — Max 5MB
        </p>
        {currentType === 'image' && currentUrl && (
          <button
            type="button"
            onClick={() => onImageUpload(null)}
            className="text-xs text-red-400 hover:text-red-600 mt-1 block"
          >
            Remove photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

    </div>
  )
}
