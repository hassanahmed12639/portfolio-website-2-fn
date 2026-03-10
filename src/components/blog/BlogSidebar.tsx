'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, Facebook, Twitter, Linkedin, Mail, BarChart2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type TocItem = { text: string; id: string; level: number }

type BlogSidebarProps = {
  toc: TocItem[]
  publishedDate?: string
  readTime?: number | null
  shareUrl?: string
  shareTitle?: string
}

export function BlogSidebar({
  toc,
  publishedDate,
  readTime,
  shareUrl = '',
  shareTitle = '',
}: BlogSidebarProps) {
  const [tocOpen, setTocOpen] = React.useState(true)
  const [email, setEmail] = React.useState('')
  const router = useRouter()

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => () => {
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')
    const encoded = encodeURIComponent(url)
    const titleEncoded = encodeURIComponent(shareTitle)
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${titleEncoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    }
    window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const handleEmailShare = () => {
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')
    const titleEncoded = encodeURIComponent(shareTitle)
    const bodyEncoded = encodeURIComponent(`${shareTitle}\n\n${url}`)
    window.location.href = `mailto:?subject=${titleEncoded}&body=${bodyEncoded}`
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (email) params.set('email', email)
    router.push(`/dashboard/signup${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <aside className="hidden lg:block w-[260px] shrink-0 self-start">
      <div className="sticky top-24 space-y-8 pb-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* Table of Contents */}
        <div className="border-b border-slate-100 pb-6">
          <button
            type="button"
            onClick={() => setTocOpen(!tocOpen)}
            className="flex w-full items-center justify-between text-left"
          >
            <p className="text-sm font-bold text-slate-900">Table of Contents</p>
            {tocOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>
          {tocOpen && toc.length > 0 && (
            <nav className="mt-3 space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    'block text-sm text-slate-600 hover:text-blue-600 transition-colors',
                    item.level === 3 && 'pl-3'
                  )}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Share this article */}
        <div className="border-b border-slate-100 pb-6">
          <p className="text-sm font-bold text-slate-900 mb-3">Share this article</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleShare('facebook')}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleShare('twitter')}
              className="w-9 h-9 rounded-full bg-sky-400 text-white flex items-center justify-center hover:bg-sky-500 transition-colors"
              aria-label="Share on X"
            >
              <Twitter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleShare('linkedin')}
              className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleEmailShare}
              className="w-9 h-9 rounded-full bg-slate-600 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
              aria-label="Share via email"
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Looking for More? - Newsletter */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="relative mb-4 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
                <BarChart2 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                <Mail className="w-4 h-4 text-amber-700" />
              </div>
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Looking for More?</h3>
          <p className="text-sm text-slate-600 mb-4">
            Get expert ideas, industry updates, case studies, and more straight to your inbox to help you level up and get ahead.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              required
            />
            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Keep Me Updated
            </Button>
          </form>
        </div>

        {/* Published / read time - compact at bottom */}
        {(publishedDate || readTime != null) && (
          <div className="text-xs text-slate-500 pt-2">
            {publishedDate && <p className="uppercase font-semibold text-slate-400 mb-1">Published</p>}
            <p>{publishedDate}</p>
            {readTime != null && <p className="mt-1">{readTime} min read</p>}
          </div>
        )}
      </div>
    </aside>
  )
}
