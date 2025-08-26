"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인 (실제로는 MSW 스텁 사용)
    const isAuthenticated = false // MSW 환경에서는 기본적으로 false
    
    if (isAuthenticated) {
      router.push("/home")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              마음배달
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              매일 하나의 질문으로 가족의 마음을 배달합니다
            </p>
          </div>
          
          <Button
            onClick={() => router.push("/login")}
            className="px-8 py-3 text-lg font-medium min-h-[44px]"
          >
            카카오로 시작하기
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-12 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle className="text-lg">간단한 질문</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                매일 새로운 질문으로 자연스러운 대화를 시작해보세요
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">❤️</span>
              </div>
              <CardTitle className="text-lg">진짜 소통</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                서로의 마음을 나누며 더 깊은 관계를 만들어가세요
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <CardTitle className="text-lg">가족 연결</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                바쁜 일상 속에서도 가족과의 소중한 시간을 만들어보세요
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sample Conversation */}
        <div className="py-12 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            이런 대화를 나눠보세요
          </h2>
          <div className="space-y-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">오늘의 질문</p>
              <p>어릴 때 가장 좋아했던 놀이는 무엇이었나요?</p>
            </div>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">나의 답변</p>
              <p className="text-card-foreground">
                저는 숨바꼭질을 정말 좋아했어요. 특히 집 안 곳곳에 숨어서 찾아달라고 하는 게 재밌었던 것 같아요.
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">엄마의 답변</p>
              <p className="text-card-foreground">
                나도 숨바꼭질 좋아했지! 너랑 같이 놀던 게 엊그제 같은데... 그때는 정말 순수했구나.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}