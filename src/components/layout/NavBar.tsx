"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"

interface NavItem {
  name: string
  url: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

function NavLinks({
  items,
  pathname,
  isMobile,
  onLinkClick,
}: {
  items: NavItem[]
  pathname: string
  isMobile: boolean
  onLinkClick?: () => void
}) {
  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.url
        return (
          <Link
            key={item.name}
            href={item.url}
            onClick={onLinkClick}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors hover:text-[#AAFF00]",
              isMobile
                ? "text-white"
                : "text-foreground dark:text-white/50",
              isActive && "bg-muted text-[#AAFF00]",
            )}
          >
            {item.name}
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full bg-[rgba(170,255,0,0.1)] rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {!isMobile && (
                  <>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#AAFF00] rounded-t-full shadow-[0_0_8px_rgba(170,255,0,0.6)]">
                      <div className="absolute w-12 h-6 bg-[rgba(170,255,0,0.2)] rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-[rgba(170,255,0,0.2)] rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-[rgba(170,255,0,0.2)] rounded-full blur-sm top-0 left-2" />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </Link>
        )
      })}
    </>
  )
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className={cn(
        "fixed lg:sticky top-0 left-0 right-0 w-full m-0 z-50 py-4 lg:py-6 bg-transparent",
        className,
      )}
    >
      <div className="relative max-w-7xl mx-auto flex items-center justify-end lg:justify-center px-4 sm:px-6">
        {/* Mobile: hamburger button - small, top right */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFF00] shadow-md transition-opacity hover:opacity-90"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-4 rounded-full bg-[#1a1a1a]" />
              <span className="h-0.5 w-4 rounded-full bg-[#1a1a1a]" />
              <span className="h-0.5 w-4 rounded-full bg-[#1a1a1a]" />
            </span>
          </button>
        </div>

        {/* Mobile: dropdown when open */}
        {mobileOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 lg:hidden z-50 rounded-2xl bg-background py-3 shadow-xl border border-border">
            <div className="flex flex-col gap-1 px-2">
              <NavLinks items={items} pathname={pathname} isMobile onLinkClick={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Desktop: pill with links (unchanged) */}
        <div className="hidden lg:flex items-center gap-6 lg:gap-8 bg-background/95 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg border border-border">
          <NavLinks items={items} pathname={pathname} isMobile={false} />
        </div>
      </div>
    </nav>
  )
}
