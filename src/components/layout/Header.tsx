"use client"

import dynamic from "next/dynamic"

const NavBar = dynamic(
  () => import("@/components/layout/NavBar").then((m) => ({ default: m.NavBar })),
  { ssr: false }
)

const navItems = [
  { name: "Home", url: "#" },
  { name: "About", url: "#" },
  { name: "Projects", url: "#" },
  { name: "Resume", url: "#" },
]

export default function Header() {
  return <NavBar items={navItems} />
}
