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
  {
    name: "My Process",
    url: "/my-process",
    children: [
          {
            name: "Tools",
            children: [
              { name: "UTM Builder", url: "/my-process/tools/utm-builder" },
              { name: "A/B Test Calculator", url: "/my-process/tools/ab-test-calculator" },
              { name: "Budget Reverse Calculator", url: "/my-process/tools/budget-reverse-calculator" },
              { name: "Custom Audience Builder", url: "/my-process/tools/custom-audience-builder" },
            ],
          },
    ],
  },
  { name: "Resume", url: "/resume" },
  { name: "Contact", url: "/contact" },
  {
    name: "TrackHive",
    url: "https://track.itshassanahmed.com",
    highlight: true,
    badge: "NEW",
  },
]

export default function Header() {
  return <NavBar items={navItems} />
}
