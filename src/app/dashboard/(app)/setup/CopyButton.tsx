'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 px-3 py-1.5 rounded-md bg-[var(--dash-success)] hover:bg-[var(--dash-success-strong)] text-white text-sm font-medium transition-colors"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}




