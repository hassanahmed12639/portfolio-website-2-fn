'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Chatbot from './Chatbot'

export default function ChatbotWrapper() {
  const pathname = usePathname()
  const [chatbotType, setChatbotType] = useState<'portfolio' | 'trackhive' | null>(null)

  useEffect(() => {
    const hostname = window.location.hostname

    // Production domains
    if (hostname.includes('track.itshassanahmed.com')) {
      setChatbotType('trackhive')
      return
    }

    if (hostname === 'itshassanahmed.com' || hostname === 'www.itshassanahmed.com') {
      setChatbotType('portfolio')
      return
    }

    // Localhost — detect by pathname
    const trackHiveRoutes = [
      '/trackhive',
      '/dashboard',
      '/admin',
      '/pricing',
      '/features',
      '/integrations',
      '/docs',
      '/blog',
      '/onboarding'
    ]

    const isTrackHivePage = pathname ? trackHiveRoutes.some(route => pathname.startsWith(route)) : false

    if (isTrackHivePage) {
      setChatbotType('trackhive')
    } else {
      setChatbotType('portfolio')
    }
  }, [pathname])

  if (!chatbotType) return null
  return <Chatbot type={chatbotType} />
}
