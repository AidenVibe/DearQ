"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Send, MessageSquare, Eye } from "lucide-react"
import { todaysQuestion } from "@/lib/dummy-data"
import { SendModal } from "@/components/send-modal"

interface HomeState {
  hasSent: boolean
  hasAnswered: boolean
  canViewConversation: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [homeState, setHomeState] = useState<HomeState>({
    hasSent: false,
    hasAnswered: false,
    canViewConversation: false,
  })

  const [user, setUser] = useState<any>(null)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleSend = () => {
    setIsSendModalOpen(true)
  }

  const handleSendComplete = () => {
    setHomeState((prev) => ({ ...prev, hasSent: true }))
  }

  const handleWriteAnswer = () => {
    setHomeState((prev) => ({ ...prev, hasAnswered: true, canViewConversation: true }))
  }

  const handleViewConversation = () => {
    router.push("/conversation/conv-1")
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">안녕하세요, {user?.nickname || "사용자"}님!</h1>
          <p className="text-muted-foreground">오늘도 가족과 소중한 대화를 나눠보세요</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">오늘의 질문</CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {todaysQuestion.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 leading-relaxed">{todaysQuestion.content}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    homeState.hasSent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </div>
                <span className={homeState.hasSent ? "text-foreground" : "text-muted-foreground"}>가족에게 보내기</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    homeState.hasAnswered ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className={homeState.hasAnswered ? "text-foreground" : "text-muted-foreground"}>
                  내 답변 작성하기
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    homeState.canViewConversation
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </div>
                <span className={homeState.canViewConversation ? "text-foreground" : "text-muted-foreground"}>
                  대화 보기
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {!homeState.hasSent && (
            <Button onClick={handleSend} className="w-full" size="lg">
              <Send className="h-4 w-4 mr-2" />
              보내기
            </Button>
          )}

          {homeState.hasSent && !homeState.hasAnswered && (
            <Button onClick={handleWriteAnswer} className="w-full" size="lg">
              <MessageSquare className="h-4 w-4 mr-2" />내 답변 쓰기
            </Button>
          )}

          {homeState.canViewConversation && (
            <Button onClick={handleViewConversation} variant="outline" className="w-full bg-transparent" size="lg">
              <Eye className="h-4 w-4 mr-2" />
              대화 보기
            </Button>
          )}

          {homeState.hasSent && (
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-600">
                전송 완료
              </Badge>
            </div>
          )}
        </div>

        {!homeState.hasSent && (
          <Card className="mt-6 bg-accent/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                오늘의 질문이 준비되었어요! 가족 중 한 분을 선택해서 질문을 보내보세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <SendModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSendComplete={handleSendComplete}
        question={todaysQuestion.content}
      />
    </>
  )
}
