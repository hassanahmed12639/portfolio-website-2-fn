'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'

export interface SwipeCardItem {
  id: string
  title: string
  description: string
  icon?: string
}

const SWIPE_THRESHOLD = 80

export function SwipeCards({ cards }: { cards: SwipeCardItem[] }) {
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0.5, 0.9, 1, 0.9, 0.5])

  const currentCard = cards[index % cards.length]

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    const shouldSwipe = Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 300
    if (shouldSwipe && offset > 0) {
      setIndex((i) => i + 1)
    } else if (shouldSwipe && offset < 0) {
      setIndex((i) => Math.max(0, i - 1))
    }
    x.set(0)
  }

  if (!currentCard) return null

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] flex items-center justify-center">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentCard.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl bg-white shadow-xl border border-gray-100/80 p-6 flex flex-col justify-between"
          whileTap={{ scale: 1.02 }}
        >
          <div>
            {currentCard.icon && (
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4">
                <img src={currentCard.icon} alt="" className="w-7 h-7 object-contain" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-textPrimary">{currentCard.title}</h3>
            <p className="text-sm text-textPrimary/70 mt-2">{currentCard.description}</p>
          </div>
          <p className="text-xs text-textPrimary/50">Swipe for more</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
