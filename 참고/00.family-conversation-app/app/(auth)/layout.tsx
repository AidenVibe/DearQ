import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen pb-16">
        {children}
        <Navigation />
      </div>
    </AuthGuard>
  )
}
