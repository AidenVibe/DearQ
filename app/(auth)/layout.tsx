"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// 임시 네비게이션 컴포넌트
function Navigation() {
  const router = useRouter()
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <button 
          onClick={() => router.push('/home')}
          className="text-xl font-bold text-primary"
        >
          마음배달
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/home')}
            className="text-sm text-gray-600 hover:text-primary px-3 py-2 min-h-[44px]"
          >
            홈
          </button>
          <button
            onClick={() => router.push('/history')}
            className="text-sm text-gray-600 hover:text-primary px-3 py-2 min-h-[44px]"
          >
            히스토리
          </button>
          <button
            onClick={() => router.push('/labels')}
            className="text-sm text-gray-600 hover:text-primary px-3 py-2 min-h-[44px]"
          >
            가족관리
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="text-sm text-gray-600 hover:text-primary px-3 py-2 min-h-[44px]"
          >
            설정
          </button>
        </div>
      </div>
    </nav>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // 임시 인증 체크 (실제로는 JWT 토큰이나 세션 체크)
    const checkAuth = () => {
      // MSW 환경에서는 기본적으로 인증된 상태로 간주
      const authStatus = true // localStorage.getItem("isAuthenticated") === "true"
      setIsAuthenticated(authStatus)
      
      if (!authStatus) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 상태를 확인하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // 리디렉션 처리 중
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}