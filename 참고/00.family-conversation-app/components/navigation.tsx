"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, History, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "홈",
    href: "/home",
    icon: Home,
  },
  {
    name: "히스토리",
    href: "/history",
    icon: History,
  },
  {
    name: "라벨 관리",
    href: "/labels",
    icon: Users,
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
