"use client"

import React from "react"
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

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "w-full m-0 sticky top-0 left-0 right-0 z-50 py-4 lg:py-6 bg-[#F6F7ED] shadow-sm",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center px-4 sm:px-6">
        <div className="flex items-center gap-6 lg:gap-8 bg-designBg/95 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const isActive = pathname === item.url

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-textPrimary/80 hover:text-accent",
                isActive && "bg-muted text-accent",
              )}
            >
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-accent/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-t-full">
                    <div className="absolute w-12 h-6 bg-accent/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-accent/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-accent/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
