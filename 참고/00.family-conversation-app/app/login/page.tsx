"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const returnTo = searchParams.get("returnTo") || "/home"

  const handleKakaoLogin = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would integrate with Kakao SDK
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate successful login
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "user-1",
          nickname: "김민수",
          kakaoUserId: "kakao-123",
        }),
      )

      // Redirect to returnTo or home
      router.push(returnTo)
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">문답다리</CardTitle>
          <CardDescription>가족과의 진짜 대화를 시작해보세요</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-6">
            {returnTo !== "/home" && <p className="mb-2">로그인이 필요한 페이지입니다.</p>}
            <p>카카오 계정으로 간편하게 시작하세요.</p>
          </div>

          <Button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            size="lg"
          >
            {isLoading ? "로그인 중..." : "카카오로 시작하기"}
          </Button>

          <div className="text-xs text-center text-muted-foreground pt-4">
            <p>로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
