"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"

export interface NavItem {
  name: string
  url?: string
  children?: NavItem[]
  external?: boolean
  highlight?: boolean
  badge?: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

function isPathActive(pathname: string, item: NavItem): boolean {
  if (item.url && pathname === item.url) return true
  if (item.children) {
    return item.children.some((child) => isPathActive(pathname, child))
  }
  return false
}

function NavLinkItem({
  item,
  pathname,
  isMobile,
  onLinkClick,
}: {
  item: NavItem
  pathname: string
  isMobile: boolean
  onLinkClick?: () => void
}) {
  if (!item.url) return null
  const isActive = !item.external && pathname === item.url
  const isHighlight = item.highlight

  const baseClass = cn(
    "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all duration-200 block",
    !isHighlight && "hover:text-[#AAFF00]",
    isMobile && !isHighlight && "text-white",
    !isMobile && !isHighlight && "text-foreground dark:text-white/50",
    isActive && "bg-muted text-[#AAFF00]"
  )
  const highlightClass = cn(
    "flex items-center gap-1.5 bg-[#1a1a1a] text-white/90",
    "hover:bg-[#252525] hover:text-white border-0",
    isMobile && "text-white"
  )

  const content = (
    <>
      {isHighlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-[#b3f000] rounded-t-full shadow-[0_0_12px_2px_rgba(179,240,0,0.7),0_0_24px_4px_rgba(179,240,0,0.3)]" />
      )}
      {item.badge && (
        <span className="absolute -top-1.5 -right-1 text-[9px] font-bold uppercase tracking-wider text-[#b3f000] bg-[#b3f000]/15 px-1.5 py-0.5 rounded">
          {item.badge}
        </span>
      )}
      {item.name}
      {isActive && !item.external && (
        <motion.div
          layoutId="lamp"
          className="absolute inset-0 w-full bg-[rgba(170,255,0,0.1)] rounded-full -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {!isMobile && (
            <>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#AAFF00] rounded-t-full shadow-[0_0_8px_rgba(170,255,0,0.6)]" />
              <div className="absolute w-12 h-6 bg-[rgba(170,255,0,0.2)] rounded-full blur-md -top-2 -left-2" />
              <div className="absolute w-8 h-6 bg-[rgba(170,255,0,0.2)] rounded-full blur-md -top-1" />
              <div className="absolute w-4 h-4 bg-[rgba(170,255,0,0.2)] rounded-full blur-sm top-0 left-2" />
            </>
          )}
        </motion.div>
      )}
    </>
  )

  if (item.external) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onLinkClick}
        className={cn(baseClass, isHighlight && highlightClass)}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={item.url} onClick={onLinkClick} className={cn(baseClass, isHighlight && highlightClass)}>
      {content}
    </Link>
  )
}

function DesktopNavItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const [subOpen, setSubOpen] = useState<string | null>(null)
  const hasChildren = item.children && item.children.length > 0
  const active = isPathActive(pathname, item)

  if (!hasChildren) {
    return item.url ? (
      <NavLinkItem item={item} pathname={pathname} isMobile={false} />
    ) : null
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false)
        setSubOpen(null)
      }}
    >
      {item.url ? (
        <Link
          href={item.url}
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors hover:text-[#AAFF00] flex items-center gap-1",
            "text-foreground dark:text-white/50",
            active && "bg-muted text-[#AAFF00]"
          )}
        >
          {item.name}
          <span className="text-[10px] opacity-70">▾</span>
        </Link>
      ) : (
        <span
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors hover:text-[#AAFF00] flex items-center gap-1",
            "text-foreground dark:text-white/50"
          )}
          onClick={() => setOpen((o) => !o)}
        >
          {item.name}
          <span className="text-[10px] opacity-70">▾</span>
        </span>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-1 py-2 min-w-[180px] rounded-xl bg-background border border-border shadow-xl z-50">
          {item.children!.map((child) => {
            const hasSub = child.children && child.children.length > 0
            return (
              <div
                key={child.name}
                className="relative"
                onMouseEnter={() => hasSub && setSubOpen(child.name)}
                onMouseLeave={() => hasSub && setSubOpen(null)}
              >
                {child.url ? (
                  <Link
                    href={child.url}
                    className={cn(
                      "block px-4 py-2.5 text-sm font-medium rounded-lg mx-1",
                      "text-black dark:text-white",
                      "hover:bg-[rgba(170,255,0,0.1)] hover:text-[#AAFF00] focus:text-[#AAFF00]",
                      pathname === child.url && "text-[#AAFF00] bg-[rgba(170,255,0,0.08)]"
                    )}
                  >
                    {child.name}
                  </Link>
                ) : (
                  <span className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground dark:text-white/70 rounded-lg mx-1">
                    {child.name}
                    <span className="text-[10px]">›</span>
                  </span>
                )}
                {hasSub && subOpen === child.name && (
                  <div className="absolute left-full top-0 ml-0 py-2 min-w-[160px] rounded-xl bg-background border border-border shadow-xl z-50">
                    {child.children!.map((sub) =>
                      sub.url ? (
                        <Link
                          key={sub.name}
                          href={sub.url}
                          className={cn(
                            "block px-4 py-2.5 text-sm font-medium rounded-lg mx-1",
                            "text-black dark:text-white",
                            "hover:bg-[rgba(170,255,0,0.1)] hover:text-[#AAFF00] focus:text-[#AAFF00]",
                            pathname === sub.url && "text-[#AAFF00] bg-[rgba(170,255,0,0.08)]"
                          )}
                        >
                          {sub.name}
                        </Link>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MobileNavItem({
  item,
  pathname,
  onLinkClick,
  depth = 0,
}: {
  item: NavItem
  pathname: string
  onLinkClick?: () => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const pl = 12 + depth * 16

  if (!hasChildren) {
    return item.url ? (
      <div
        style={depth > 0 ? { paddingLeft: 12 + depth * 16 } : undefined}
        className={depth > 0 ? "border-l border-white/10 ml-2" : ""}
      >
        <NavLinkItem
          item={item}
          pathname={pathname}
          isMobile
          onLinkClick={onLinkClick}
        />
      </div>
    ) : null
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between" style={{ paddingLeft: pl }}>
        {item.url ? (
          <Link
            href={item.url}
            onClick={onLinkClick}
            className={cn(
              "py-2.5 text-sm font-semibold text-white hover:text-[#AAFF00]",
              pathname === item.url && "text-[#AAFF00]"
            )}
          >
            {item.name}
          </Link>
        ) : (
          <span className="py-2.5 text-sm font-semibold text-white">
            {item.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="p-2 text-white/70 hover:text-[#AAFF00]"
          aria-expanded={expanded}
        >
          <span className="text-xs">{expanded ? "▴" : "▾"}</span>
        </button>
      </div>
      {expanded && (
        <div className="border-l border-white/10 ml-2">
          {item.children!.map((child) => (
            <MobileNavItem
              key={child.name}
              item={child}
              pathname={pathname}
              onLinkClick={onLinkClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className={cn(
        "fixed lg:sticky top-0 left-0 right-0 w-full m-0 z-50 py-4 lg:py-6 bg-transparent",
        className
      )}
    >
      <div className="relative max-w-7xl mx-auto flex items-center justify-end lg:justify-center px-4 sm:px-6">
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

        {mobileOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 lg:hidden z-50 rounded-2xl bg-background py-3 shadow-xl border border-border">
            <div className="flex flex-col gap-0 px-2">
              {items.map((item) => (
                <MobileNavItem
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onLinkClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-6 lg:gap-8 bg-background/95 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg border border-border">
          {items.map((item) => (
            <DesktopNavItem key={item.name} item={item} pathname={pathname} />
          ))}
        </div>
      </div>
    </nav>
  )
}
