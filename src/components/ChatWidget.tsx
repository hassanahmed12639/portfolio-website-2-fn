'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8000'

type Message = { role: 'user' | 'assistant'; content: string }

function stripMarkdownAsterisks(text: string): string {
  return text.replace(/\*+/g, '')
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${CHAT_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get response'
      setError('Chat service unavailable. Make sure the chatbot API is running (python chatbot_api.py).')
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-[#AAFF00] text-[#0F0F0F] hover:bg-[#AAFF00] focus:outline-none focus:ring-2 focus:ring-[#AAFF00] focus:ring-offset-2'
        )}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50 flex w-[min(100vw-3rem,400px)] flex-col overflow-hidden rounded-xl shadow-xl',
            'border border-gray-200 bg-white'
          )}
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Ask about Hassan&apos;s portfolio</h3>
            <p className="text-xs text-gray-500">Performance marketing, case studies, ROI</p>
          </div>

          <div className="flex h-80 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !loading && (
                <p className="text-sm text-gray-500">
                  Ask a question about Hassan&apos;s experience, case studies, or how he can help your business.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'ml-8 bg-[#AAFF00] text-[#0F0F0F]'
                      : 'mr-8 bg-gray-100 text-gray-900'
                  )}
                >
                  {m.role === 'assistant' ? stripMarkdownAsterisks(m.content) : m.content}
                </div>
              ))}
              {loading && (
                <div className="mr-8 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  Thinking...
                </div>
              )}
              {error && (
                <p className="text-xs text-[#AAFF00]">{error}</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Type your question..."
                  rows={1}
                  disabled={loading}
                  className={cn(
                    'flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm',
                    'focus:border-[#AAFF00] focus:outline-none focus:ring-1 focus:ring-[#AAFF00]',
                    'disabled:bg-gray-100 disabled:text-gray-500'
                  )}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={cn(
'rounded-lg bg-[#AAFF00] px-4 py-2 text-sm font-medium text-[#0F0F0F]',
    'hover:shadow-[0_0_20px_rgba(170,255,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#AAFF00] focus:ring-offset-2',
                    'disabled:opacity-50 disabled:pointer-events-none'
                  )}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
