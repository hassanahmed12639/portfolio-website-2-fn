"use client"

import dynamic from "next/dynamic"

const NavBar = dynamic(
  () => import("./NavBar").then((m) => ({ default: m.NavBar })),
  { ssr: false }
)

const navItems = [
  { name: "Home", url: "/" },
  { name: "About", url: "/about-me" },
  { name: "Projects", url: "/project" },
  { name: "My Process", url: "/my-process" },
  { name: "Resume", url: "#" },
]

export default function Header() {
  return <NavBar items={navItems} />
}
