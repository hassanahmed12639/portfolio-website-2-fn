'use client'

import { useState } from 'react'

type Props = {
  src: string
  alt: string
  slug?: string
}

function buildFallbacks(slug?: string): string[] {
  const list = ['/rcc-featured.png']
  if (slug) {
    list.unshift(`/${slug}-featured.png`)
  }
  return list
}

export default function CaseStudyHeroImage({ src, alt, slug }: Props) {
  const fallbacks = buildFallbacks(slug)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => {
        if (fallbackIndex >= fallbacks.length) return
        setCurrentSrc(fallbacks[fallbackIndex])
        setFallbackIndex((i) => i + 1)
      }}
    />
  )
}
