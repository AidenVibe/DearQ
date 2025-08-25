"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    if (isAuthenticated) {
      router.push("/home")
    } else {
      // Stay on landing page - no redirect needed since this is the landing
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">문답다리</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            하루 한 번, 가족 한 사람과 진짜 대화를 완결하는 서비스
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            카카오로 시작하기
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-12">
          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="h-12 w-12 text-primary mx-auto mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">간단한 질문</h3>
            <p className="text-muted-foreground">매일 새로운 질문으로 자연스러운 대화를 시작해보세요</p>
          </div>

          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="h-12 w-12 text-primary mx-auto mb-4">❤️</div>
            <h3 className="text-lg font-semibold mb-2">진짜 소통</h3>
            <p className="text-muted-foreground">서로의 마음을 나누며 더 깊은 관계를 만들어가세요</p>
          </div>

          <div className="bg-card rounded-lg p-6 text-center border">
            <div className="h-12 w-12 text-primary mx-auto mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-semibold mb-2">가족 연결</h3>
            <p className="text-muted-foreground">바쁜 일상 속에서도 가족과의 소중한 시간을 만들어보세요</p>
          </div>
        </div>

        {/* Sample Conversation */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-center mb-8">이런 대화를 나눠보세요</h2>
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">오늘의 질문</p>
              <p>어릴 때 가장 좋아했던 놀이는 무엇이었나요?</p>
            </div>

            <div className="bg-card rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">나의 답변</p>
              <p>저는 숨바꼭질을 정말 좋아했어요. 특히 집 안 곳곳에 숨어서 찾아달라고 하는 게 재밌었던 것 같아요.</p>
            </div>

            <div className="bg-card rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">엄마의 답변</p>
              <p>나도 숨바꼭질 좋아했지! 너랑 같이 놀던 게 엊그제 같은데... 그때는 정말 순수했구나.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
