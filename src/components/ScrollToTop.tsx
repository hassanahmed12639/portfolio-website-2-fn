'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const HERO_ID = 'hero'

export default function ScrollToTop() {
  const { isDarkMode: isDark } = useTheme()
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(HERO_ID)
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { rootMargin: '-10px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) {
      setEntered(false)
      return
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [visible])

  const scrollToTop = () => {
    const hero = document.getElementById(HERO_ID)
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="ha-scroll-to-top-strap"
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          transform: entered ? 'translateY(-50%)' : 'translate(-100%, -50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: isDark ? 'rgba(10,10,10,0.75)' : 'rgba(255,255,255,0.85)',
          border: isDark
            ? '1px solid rgba(180,255,0,0.25)'
            : '1px solid rgba(0,0,0,0.08)',
          borderLeft: 'none',
          borderRadius: '0 18px 18px 0',
          padding: '16px 12px',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          boxShadow: 'none',
          cursor: 'pointer',
          outline: 'none',
          transition:
            'transform 0.35s ease-out, background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        <span
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(180,255,0,0.5)' : 'rgba(0,0,0,0.35)',
            fontFamily: 'sans-serif',
            userSelect: 'none',
            transition: 'color 0.4s ease',
          }}
        >
          To top
        </span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .ha-scroll-to-top-strap {
            top: 60% !important;
            padding: 12px 10px !important;
            border-radius: 0 14px 14px 0 !important;
          }
        }
      `}} />
    </>
  )
}
