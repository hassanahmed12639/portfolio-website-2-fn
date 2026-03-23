"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    quote: "This transformed our lead generation completely.",
    author: "Alliance Shipping",
    role: "Marketing Manager at Alliance Shipping",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "Simply outstanding campaign performance. Nothing compares.",
    author: "Vegout Organics",
    role: "Founder at Vegout Organics",
    avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "The targeting precision and optimization were exceptional.",
    author: "RCC Custom Landscape",
    role: "Operations Manager at RCC Custom Landscape",
    avatar: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 4,
    quote: "Delivered strong ROAS exactly when we needed it.",
    author: "Trade Locks",
    role: "E-commerce Manager at Trade Locks",
    avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 5,
    quote: "A true partner in scaling profitable ad campaigns.",
    author: "Steve Apparel",
    role: "Marketing Director at Steve Apparel",
    avatar: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1480&auto=format&fit=crop",
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
    <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-black">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white text-center pt-4 md:pt-6 flex-shrink-0">
        What My Clients Say
      </h2>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-4">
        {/* Quote Container */}
        <div className="relative px-8 md:px-12">
          <span className="absolute -left-2 -top-8 text-8xl md:text-9xl font-serif text-white/[0.06] select-none pointer-events-none">
            &ldquo;
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
            &rdquo;
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
                    "transition-all duration-500 ease-in-out",
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
                        "transition-all duration-500 ease-in-out",
                        isActive ? "ring-2 ring-black/30" : "ring-0",
                        !isActive && "hover:scale-105",
                      )}
                    />
                  </div>

                  <div
                    className={cn(
                      "grid transition-all duration-500 ease-in-out",
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
