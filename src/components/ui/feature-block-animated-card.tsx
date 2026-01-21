"use client"

import { animate, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface AnimatedCardProps {
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  icons?: Array<{
    icon: React.ReactNode
    size?: "sm" | "md" | "lg"
    className?: string
  }>
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
}

export function AnimatedCard({ className, title, description, icons = [] }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePosition({ x, y })
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-[290px] h-[350px] mx-auto rounded-xl relative group p-[3px]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(450px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 68, 68, 1) 0%, rgba(239, 68, 68, 0.98) 12%, rgba(239, 68, 68, 0.85) 20%, rgba(239, 68, 68, 0.5) 30%, rgba(239, 68, 68, 0.2) 45%, transparent 65%)`,
          }}
        />
      )}
      <div
        className={cn(
          "w-full h-full p-6 rounded-xl border border-[rgba(255,255,255,0.10)] dark:bg-[rgba(40,40,40,0.70)] bg-gray-100 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] relative z-10",
        )}
      >
        <div
          className={cn(
            "h-[12rem] md:h-[14rem] rounded-xl z-40",
            "bg-neutral-300 dark:bg-[rgba(40,40,40,0.70)] [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]"
          )}
        >
          <AnimatedIcons icons={icons} />
        </div>
        {title && (
          <h3 className="text-base font-semibold text-gray-800 dark:text-white py-1.5">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-xs font-normal text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function AnimatedIcons({ icons }: { icons: AnimatedCardProps["icons"] }) {
  const scale = [1, 1.1, 1]
  const transform = ["translateY(0px)", "translateY(-4px)", "translateY(0px)"]
  
  const sequence = icons.map((_, index) => [
    `.circle-${index + 1}`,
    { scale, transform },
    { duration: 0.8 },
  ])

  useEffect(() => {
    animate(sequence, {
      repeat: Infinity,
      repeatDelay: 1,
    })
  }, [])

  return (
    <div className="p-6 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
        {icons.map((icon, index) => (
          <Container
            key={index}
            className={cn(
              sizeMap[icon.size || "lg"],
              `circle-${index + 1}`,
              icon.className
            )}
          >
            {icon.icon}
          </Container>
        ))}
      </div>
      <AnimatedSparkles />
    </div>
  )
}

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
      shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]`,
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

const AnimatedSparkles = () => (
  <div className="h-40 w-px absolute top-20 m-auto z-40 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-move">
    <div className="w-10 h-32 top-1/2 -translate-y-1/2 absolute -left-10">
      <Sparkles />
    </div>
  </div>
)

const Sparkles = () => {
  const randomMove = () => Math.random() * 2 - 1
  const randomOpacity = () => Math.random()
  const random = () => Math.random()

  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `2px`,
            height: `2px`,
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block bg-black dark:bg-white"
        />
      ))}
    </div>
  )
}