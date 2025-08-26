"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, History, Users, Settings } from "lucide-react"

interface BottomNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const navItems: BottomNavItem[] = [
  {
    id: "home",
    label: "홈",
    icon: Home,
    path: "/home"
  },
  {
    id: "history",
    label: "히스토리",
    icon: History,
    path: "/history"
  },
  {
    id: "labels",
    label: "가족관리",
    icon: Users,
    path: "/labels"
  },
  {
    id: "settings",
    label: "설정",
    icon: Settings,
    path: "/settings"
  }
]

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || 
            (item.path === "/home" && pathname === "/") ||
            pathname.startsWith(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
                "min-h-[44px] min-w-[44px] touch-target",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}