"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const isAuth = authStatus === "true"

    setIsAuthenticated(isAuth)

    if (!isAuth && pathname !== "/login" && pathname !== "/") {
      // Redirect to login with returnTo parameter
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and trying to access protected route, don't render children
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/") {
    return null
  }

  return <>{children}</>
}
