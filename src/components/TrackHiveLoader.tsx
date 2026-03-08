'use client'

import { useEffect, useState } from 'react'

export default function TrackHiveLoader() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const intervals = [
      setTimeout(() => setProgress(30), 100),
      setTimeout(() => setProgress(60), 300),
      setTimeout(() => setProgress(85), 500),
      setTimeout(() => setProgress(100), 700),
      setTimeout(() => setVisible(false), 1000),
    ]
    return () => intervals.forEach(clearTimeout)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease',
        opacity: progress === 100 ? 0 : 1,
      }}
    >
      {/* Logo text */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'white',
          letterSpacing: '-0.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          Track<span style={{ color: '#60a5fa' }}>Hive</span>
        </span>
      </div>

      {/* Animated dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2563eb',
              animation: `trackhive-bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '200px',
        height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '99px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
          borderRadius: '99px',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 10px rgba(96,165,250,0.6)'
        }} />
      </div>

      <style>{`
        @keyframes trackhive-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(37,99,235,0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 40px rgba(37,99,235,0.7); }
        }
        @keyframes trackhive-bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
