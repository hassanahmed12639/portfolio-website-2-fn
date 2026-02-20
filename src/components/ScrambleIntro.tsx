'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ScrambleIntro.module.css'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?'
const TARGET_L1 = 'HASSAN'
const TARGET_L2 = 'AHMED'
const TRACK_HEIGHT_VH = 500
const SEEN_KEY = 'scramble_intro_seen'
const FADE_MS = 450

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function norm(value: number, min: number, max: number) {
  return clamp((value - min) / (max - min), 0, 1)
}

export default function ScrambleIntro() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFading, setIsFading] = useState(false)

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const line1Ref = useRef<HTMLDivElement | null>(null)
  const line2Ref = useRef<HTMLDivElement | null>(null)
  const subRef = useRef<HTMLDivElement | null>(null)
  const scanlineRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const cueRef = useRef<HTMLDivElement | null>(null)
  const spans1Ref = useRef<HTMLSpanElement[]>([])
  const spans2Ref = useRef<HTMLSpanElement[]>([])
  const rafRef = useRef<number | null>(null)
  const fadeTimerRef = useRef<number | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const alreadySeen = window.sessionStorage.getItem(SEEN_KEY) === '1'
    if (alreadySeen) return

    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isVisible) return
    if (!line1Ref.current || !line2Ref.current) return

    const buildLine = (el: HTMLDivElement, target: string) => {
      el.innerHTML = ''
      const spans: HTMLSpanElement[] = []

      for (const _char of target) {
        const span = document.createElement('span')
        span.className = `${styles.char} ${styles.noise}`
        span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
        el.appendChild(span)
        spans.push(span)
      }

      return spans
    }

    spans1Ref.current = buildLine(line1Ref.current, TARGET_L1)
    spans2Ref.current = buildLine(line2Ref.current, TARGET_L2)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible || !scrollerRef.current) return

    const scroller = scrollerRef.current

    const updateLine = (spans: HTMLSpanElement[], target: string, lineProgress: number) => {
      const resolved = Math.floor(lineProgress * target.length)

      spans.forEach((span, index) => {
        if (index < resolved) {
          span.textContent = target[index]
          span.className = `${styles.char} ${styles.settled}`
        } else {
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
          span.className = `${styles.char} ${styles.noise}`
        }
      })
    }

    const finishIntro = () => {
      if (doneRef.current) return
      doneRef.current = true
      setIsFading(true)
      window.sessionStorage.setItem(SEEN_KEY, '1')
      fadeTimerRef.current = window.setTimeout(() => setIsVisible(false), FADE_MS)
    }

    const update = () => {
      if (!scrollerRef.current) return

      const maxScroll = scrollerRef.current.scrollHeight - scrollerRef.current.clientHeight
      const scrollTop = scrollerRef.current.scrollTop
      const progress = clamp(scrollTop / Math.max(maxScroll, 1), 0, 1)

      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`
      }

      if (cueRef.current) {
        if (scrollTop > 50) cueRef.current.classList.add(styles.hidden)
        else cueRef.current.classList.remove(styles.hidden)
      }

      const decodeProgress = norm(progress, 0, 0.55)
      if (scanlineRef.current) {
        scanlineRef.current.style.top = `${decodeProgress * 100}vh`
        scanlineRef.current.style.opacity = decodeProgress < 0.95 ? '0.8' : '0'
      }

      updateLine(spans1Ref.current, TARGET_L1, norm(progress, 0.05, 0.4))
      updateLine(spans2Ref.current, TARGET_L2, norm(progress, 0.2, 0.55))

      if (subRef.current) {
        const subProgress = norm(progress, 0, 0.55)
        if (subProgress < 0.3) subRef.current.textContent = 'decoding identity...'
        else if (subProgress < 0.7) subRef.current.textContent = 'access granted_'
        else subRef.current.textContent = ''
      }

      if (progress >= 0.985 || maxScroll - scrollTop <= 2) finishIntro()
    }

    const onScroll = () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = window.requestAnimationFrame(update)
    }

    const onWheel = (event: WheelEvent) => {
      if (doneRef.current) return
      event.preventDefault()
      scroller.scrollTop += event.deltaY
      onScroll()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!scrollerRef.current) return
      const step = Math.round(window.innerHeight * 0.16)
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        scrollerRef.current.scrollTop += step
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        scrollerRef.current.scrollTop -= step
      }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    update()

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className={`${styles.overlay} ${isFading ? styles.fading : ''}`} aria-hidden="true">
      <div ref={scrollerRef} className={styles.scrollCapture}>
        <div className={styles.track} style={{ height: `${TRACK_HEIGHT_VH}vh` }} />
      </div>

      <div className={styles.scrambleStage}>
        <div className={styles.line} ref={line1Ref} />
        <div className={styles.line} ref={line2Ref} />
        <div className={styles.sub} ref={subRef}>
          decoding identity...
        </div>
      </div>

      <div className={styles.scanline} ref={scanlineRef} />
      <div className={styles.progress} ref={progressRef} />
      <div className={styles.cue} ref={cueRef}>
        <span>scroll_to_decode()</span>
        <div className={styles.mouse}>
          <div className={styles.mouseDot} />
        </div>
      </div>
    </div>
  )
}
