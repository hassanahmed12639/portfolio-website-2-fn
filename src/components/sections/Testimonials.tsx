"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    quote: "This changed everything for me.",
    author: "Sarah Chen",
    role: "Designer at Figma",
    avatar: "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "Simply brilliant. Nothing else compares.",
    author: "Marcus Johnson",
    role: "Engineer at Vercel",
    avatar: "https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?q=80&w=1287&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "The attention to detail is unmatched.",
    author: "Elena Rodriguez",
    role: "Founder at Craft",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 4,
    quote: "Delivered exactly what we needed—and then some.",
    author: "James Wilson",
    role: "VP Marketing at Stripe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 5,
    quote: "A true partner in growth. Results speak for themselves.",
    author: "Priya Sharma",
    role: "Growth Lead at Notion",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 6,
    quote: "Transformed our approach. Couldn't recommend more highly.",
    author: "David Park",
    role: "CTO at Linear",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1480&auto=format&fit=crop",
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote)
  const [displayedRole, setDisplayedRole] = useState(testimonials[0].role)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)

    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedRole(testimonials[index].role)
      setActiveIndex(index)
      setTimeout(() => setIsAnimating(false), 400)
    }, 200)
  }

  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-black">
      <div className="flex flex-col items-center gap-8 pt-4 pb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white text-center -mt-2">
          What My Clients Say
        </h2>
        {/* Quote Container */}
        <div className="relative px-8 md:px-12">
          <span className="absolute -left-2 -top-8 text-8xl md:text-9xl font-serif text-white/[0.06] select-none pointer-events-none">
            "
          </span>

          <p
            className={cn(
              "text-2xl md:text-4xl lg:text-5xl font-light text-white text-center max-w-2xl md:max-w-3xl leading-relaxed transition-all duration-400 ease-out",
              isAnimating ? "opacity-0 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100",
            )}
          >
            {displayedQuote}
          </p>

          <span className="absolute -right-2 -bottom-10 text-8xl md:text-9xl font-serif text-white/[0.06] select-none pointer-events-none">
            "
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 mt-0">
          {/* Role text */}
          <p
            className={cn(
              "text-sm md:text-base text-white/60 tracking-[0.2em] uppercase transition-all duration-500 ease-out",
              isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
            )}
          >
            {displayedRole}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {testimonials.map((testimonial, index) => {
              const isActive = activeIndex === index
              const isHovered = hoveredIndex === index && !isActive
              const showName = isActive || isHovered

              return (
                <button
                  key={testimonial.id}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    "relative flex items-center gap-0 rounded-full cursor-pointer",
                    "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isActive ? "bg-white shadow-lg" : "bg-transparent hover:bg-white/10",
                    showName ? "pr-5 pl-3 py-3" : "p-1",
                  )}
                >
                  {/* Avatar with smooth ring animation */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-full object-cover",
                        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        isActive ? "ring-2 ring-black/30" : "ring-0",
                        !isActive && "hover:scale-105",
                      )}
                    />
                  </div>

                  <div
                    className={cn(
                      "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      showName ? "grid-cols-[1fr] opacity-100 ml-3" : "grid-cols-[0fr] opacity-0 ml-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <span
                        className={cn(
                          "text-base md:text-lg font-medium whitespace-nowrap block",
                          "transition-colors duration-300",
                          isActive ? "text-black" : "text-white",
                        )}
                      >
                        {testimonial.author}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
