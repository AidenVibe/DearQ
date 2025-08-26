"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // localStorage 기반 임시 인증 체크
    const checkAuth = () => {
      try {
        const userInfo = localStorage.getItem('dearq_user')
        const authStatus = userInfo !== null
        
        console.log('인증 상태 체크:', authStatus ? '인증됨' : '미인증')
        setIsAuthenticated(authStatus)
        
        if (!authStatus) {
          console.log('미인증 사용자 - 로그인 페이지로 이동')
          router.push('/login')
        }
      } catch (error) {
        console.error('인증 체크 중 오류:', error)
        setIsAuthenticated(false)
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
    <div className="min-h-screen bg-background pb-16">
      {/* 상단 헤더 - 브랜드명만 표시 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary text-center">
            마음배달
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  )
}