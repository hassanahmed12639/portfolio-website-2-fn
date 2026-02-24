'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { toggleTheme, isDarkMode: isDark } = useTheme()

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark/light theme"
        className="ha-theme-strap"
        style={{
          position: 'fixed',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: isDark ? 'rgba(10,10,10,0.75)' : 'rgba(255,255,255,0.85)',
          border: isDark
            ? '1px solid rgba(180,255,0,0.25)'
            : '1px solid rgba(0,0,0,0.08)',
          borderRight: 'none',
          borderRadius: '16px 0 0 16px',
          padding: '12px 8px',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          boxShadow: isDark
            ? '-4px 0 24px rgba(180,255,0,0.08), 0 4px 16px rgba(0,0,0,0.5)'
            : '-4px 0 16px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 26,
            height: 52,
            borderRadius: 13,
            background: isDark ? '#b4ff00' : '#111',
            boxShadow: isDark ? '0 0 12px rgba(180,255,0,0.45)' : 'none',
            flexShrink: 0,
            transition: 'background 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#000' : 'rgba(180,255,0,0.45)',
              opacity: isDark ? 1 : 0.5,
              transition: 'color 0.3s ease, opacity 0.3s ease',
            }}
          >
            <SunIcon />
          </span>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: isDark ? 3 : 29,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: isDark ? '#000' : '#b4ff00',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              transition:
                'top 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease',
            }}
          />

          <span
            style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? 'rgba(0,0,0,0.35)' : '#b4ff00',
              opacity: isDark ? 0.4 : 1,
              transition: 'color 0.3s ease, opacity 0.3s ease',
            }}
          >
            <MoonIcon />
          </span>
        </div>

        <span
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(180,255,0,0.5)' : 'rgba(0,0,0,0.35)',
            marginTop: 10,
            fontFamily: 'sans-serif',
            userSelect: 'none',
            transition: 'color 0.4s ease',
          }}
        >
          Theme
        </span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .ha-theme-strap {
            top: 60% !important;
            padding: 10px 7px !important;
            border-radius: 12px 0 0 12px !important;
          }
        }
      `}} />
    </>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
