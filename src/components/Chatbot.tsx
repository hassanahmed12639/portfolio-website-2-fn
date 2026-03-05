'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotProps {
  type: 'portfolio' | 'trackhive'
}

const CONFIG = {
  portfolio: {
    name: "Hassan's Assistant",
    greeting: "Hi! I'm Hassan's assistant. Ask me anything about his skills, projects or experience.",
    headerBg: 'bg-slate-900',
    buttonBg: 'bg-slate-900 hover:bg-slate-800',
    userBubbleBg: 'bg-slate-900 text-white',
    assistantBubbleBg: 'bg-slate-100 text-slate-800',
    inputFocus: 'focus:ring-slate-500',
    sendBg: 'bg-slate-900 hover:bg-slate-800',
    placeholder: 'Ask about Hassan...',
    dotColor: 'bg-green-400'
  },
  trackhive: {
    name: 'TrackHive Support',
    greeting: "Hi! I'm the TrackHive assistant. Ask me anything about server-side tracking, setup, pricing or how to implement CAPI.",
    headerBg: 'bg-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    userBubbleBg: 'bg-blue-600 text-white',
    assistantBubbleBg: 'bg-slate-100 text-slate-800',
    inputFocus: 'focus:ring-blue-500',
    sendBg: 'bg-blue-600 hover:bg-blue-700',
    placeholder: 'Ask about TrackHive...',
    dotColor: 'bg-green-400'
  }
}

export default function Chatbot({ type }: ChatbotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const config = CONFIG[type]

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: config.greeting }])
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, config.greeting])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = updatedMessages.filter((_, i) => i > 0)

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          chatbotType: type
        })
      })

      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        const errorMsg = data.error || data.details || 'Sorry something went wrong. Please try again.'
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* Chat window */}
      {open && (
        <div className="mb-3 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col dark:bg-slate-800 dark:border-slate-700" style={{ height: '500px' }}>

          {/* Header */}
          <div className={`${config.headerBg} px-4 py-3.5 flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${config.dotColor} rounded-full border-2 border-white`} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{config.name}</p>
                <p className="text-white/70 text-xs">Online now</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? `${config.userBubbleBg} rounded-br-sm`
                    : `${config.assistantBubbleBg} rounded-bl-sm dark:bg-slate-700 dark:text-slate-200`
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`${config.assistantBubbleBg} px-4 py-3 rounded-2xl rounded-bl-sm dark:bg-slate-700`}>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {type === 'trackhive' ? [
                'How do I install TrackHive?',
                'How does Meta CAPI work?',
                'What is the pricing?',
                'How to improve match rate?'
              ] : [
                "What projects has Hassan built?",
                "What are Hassan's skills?",
                'How can I hire Hassan?',
                "What is Hassan's experience?"
              ].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-full transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 flex gap-2 flex-shrink-0 dark:border-slate-700">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder}
              className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${config.inputFocus} focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`${config.sendBg} text-white p-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`${config.buttonBg} text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105`}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  )
}
