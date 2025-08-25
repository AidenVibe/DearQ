"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, Clock, AlertTriangle, CheckCircle, User } from "lucide-react"

interface TokenData {
  isValid: boolean
  isExpired: boolean
  question: string
  senderName: string
  labelName: string
  category: string
  expiresAt: string
}

interface ReceiverState {
  isLoggedIn: boolean
  hasAnswered: boolean
  needsLabelConfirmation: boolean
  wantsToBlock: boolean
}

export default function ReceiverAnswerPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [receiverState, setReceiverState] = useState<ReceiverState>({
    isLoggedIn: false,
    hasAnswered: false,
    needsLabelConfirmation: false,
    wantsToBlock: false,
  })
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    // Simulate token validation
    const validateToken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate different token states
      const isValid = token !== "expired" && token !== "invalid"
      const isExpired = token === "expired"

      if (isValid && !isExpired) {
        setTokenData({
          isValid: true,
          isExpired: false,
          question: "오늘 하루 중 가장 기억에 남는 순간은 언제였나요?",
          senderName: "김민수",
          labelName: "엄마",
          category: "일상",
          expiresAt: "2024-08-27T00:00:00Z",
        })
      } else {
        setTokenData({
          isValid: false,
          isExpired,
          question: "",
          senderName: "",
          labelName: "",
          category: "",
          expiresAt: "",
        })
      }
    }

    validateToken()
  }, [token])

  useEffect(() => {
    // Check if user is logged in
    const isAuth = localStorage.getItem("isAuthenticated") === "true"
    setReceiverState((prev) => ({ ...prev, isLoggedIn: isAuth }))
  }, [])

  const handleLogin = async () => {
    // Simulate Kakao login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "user-2",
        nickname: "이영희",
        kakaoUserId: "kakao-456",
      }),
    )

    setReceiverState((prev) => ({
      ...prev,
      isLoggedIn: true,
      needsLabelConfirmation: true, // First time answering
    }))
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate answer submission
      console.log("Answer submitted:", answer)

      setReceiverState((prev) => ({ ...prev, hasAnswered: true }))

      if (receiverState.needsLabelConfirmation) {
        setShowConfirmation(true)
      } else {
        // Show success message
        setTimeout(() => {
          router.push("/home")
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLabelConfirmation = (accept: boolean) => {
    if (accept) {
      console.log(`Label binding confirmed: ${tokenData?.labelName}`)
    } else {
      console.log(`Label binding rejected: ${tokenData?.labelName}`)
    }

    if (receiverState.wantsToBlock) {
      console.log(`Blocked label: ${tokenData?.labelName}`)
    }

    // Redirect to success or home
    setTimeout(() => {
      router.push("/home")
    }, 1500)
  }

  const handleRequestResend = () => {
    // In real app, this would notify the sender
    alert("재전송 요청이 발신자에게 전달되었습니다.")
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">링크를 확인하고 있어요...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token expired or invalid
  if (!tokenData.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>{tokenData.isExpired ? "링크가 만료되었어요" : "유효하지 않은 링크예요"}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {tokenData.isExpired
                ? "이 질문 링크는 이미 만료되었습니다. 발신자에게 새로운 링크를 요청해보세요."
                : "올바르지 않은 링크입니다. 링크를 다시 확인해주세요."}
            </p>
            {tokenData.isExpired && (
              <Button onClick={handleRequestResend} className="w-full">
                재전송 요청하기
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show confirmation dialog
  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>답변이 전달되었어요!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                이 계정을 '{tokenData.labelName}'로 기록할까요? 다음에 {tokenData.senderName}님이 같은 라벨로 질문을
                보내면 자동으로 추천됩니다.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="block"
                checked={receiverState.wantsToBlock}
                onCheckedChange={(checked) =>
                  setReceiverState((prev) => ({ ...prev, wantsToBlock: checked as boolean }))
                }
              />
              <label htmlFor="block" className="text-sm text-muted-foreground">
                이 라벨에서 질문 받지 않기
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleLabelConfirmation(true)} className="flex-1">
                네, 기록할게요
              </Button>
              <Button onClick={() => handleLabelConfirmation(false)} variant="outline" className="flex-1">
                아니요
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state after answering
  if (receiverState.hasAnswered && !receiverState.needsLabelConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>답변이 전달되었어요!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {tokenData.senderName}님이 답변을 확인할 수 있어요. 곧 홈으로 이동합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login required
  if (!receiverState.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>질문이 도착했어요!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {tokenData.senderName}님이 '{tokenData.labelName}' 라벨로 질문을 보냈어요
              </p>
              <Badge variant="secondary">{tokenData.category}</Badge>
            </div>

            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <p className="font-medium">{tokenData.question}</p>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">답변하려면 카카오 로그인이 필요해요</p>

            <Button onClick={handleLogin} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black" size="lg">
              카카오로 로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Answer form
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-md">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{tokenData.senderName}님의 질문</CardTitle>
              <Badge variant="secondary">{tokenData.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">'{tokenData.labelName}' 라벨로 받은 질문이에요</p>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <p className="font-medium text-primary">{tokenData.question}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">답변을 작성해주세요 (최대 500자)</label>
                <Textarea
                  placeholder="솔직하고 따뜻한 답변을 들려주세요..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{answer.length}/500자</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(tokenData.expiresAt).toLocaleDateString()} 까지</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    답변 전송 중...
                  </>
                ) : (
                  "답변 보내기"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              이 링크는 1회용이며, 답변 완료 후 자동으로 만료됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
