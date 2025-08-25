"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Heart, ThumbsUp, Smile, Sunrise as Surprised, Salad as Sad, Lock } from "lucide-react"
import { conversations, currentUser, type Conversation } from "@/lib/dummy-data"

type ReactionType = "heart" | "thumbs_up" | "smile" | "surprised" | "sad"

interface ReactionData {
  type: ReactionType
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}

const reactions: ReactionData[] = [
  { type: "heart", icon: Heart, label: "좋아요", color: "text-red-500" },
  { type: "thumbs_up", icon: ThumbsUp, label: "최고예요", color: "text-blue-500" },
  { type: "smile", icon: Smile, label: "웃겨요", color: "text-yellow-500" },
  { type: "surprised", icon: Surprised, label: "놀라워요", color: "text-purple-500" },
  { type: "sad", icon: Sad, label: "슬퍼요", color: "text-gray-500" },
]

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null)
  const [otherReaction, setOtherReaction] = useState<ReactionType | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasMyAnswer, setHasMyAnswer] = useState(true) // Gate control

  useEffect(() => {
    // Find conversation by ID
    const conv = conversations.find((c) => c.conversationId === conversationId)
    if (conv) {
      setConversation(conv)

      // Simulate existing reactions
      if (conversationId === "conv-1") {
        setOtherReaction("heart")
      }

      // Check if conversation is complete and show celebration
      if (conv.senderAnswer && conv.recipientAnswer) {
        setTimeout(() => {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 1000)
        }, 500)
      }
    }
  }, [conversationId])

  const handleReaction = (reactionType: ReactionType) => {
    if (myReaction === reactionType) {
      // Cancel reaction
      setMyReaction(null)
    } else {
      // Set new reaction
      setMyReaction(reactionType)
    }
  }

  const handleWriteMyAnswer = () => {
    // In real app, this would open answer editor
    setHasMyAnswer(true)
    console.log("Opening answer editor...")
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">대화를 찾을 수 없어요.</p>
            <Button onClick={() => router.back()} className="mt-4">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isMyAnswer = (authorId: string) => authorId === currentUser.id
  const isComplete = conversation.senderAnswer && conversation.recipientAnswer

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="container mx-auto px-4 py-3 max-w-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">대화</h1>
              <p className="text-sm text-muted-foreground">{conversation.labelName}와의 대화</p>
            </div>
            <Badge variant="secondary">{conversation.question.category}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">오늘의 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{conversation.question.content}</p>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="space-y-4 mb-6">
          {/* My Answer */}
          {conversation.senderAnswer && isMyAnswer(conversation.senderAnswer.authorUserId) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">나</span>
                  </div>
                  <span className="text-sm font-medium">내 답변</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.senderAnswer.answeredAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="leading-relaxed">{conversation.senderAnswer.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Other Person's Answer */}
          {conversation.recipientAnswer && !isMyAnswer(conversation.recipientAnswer.authorUserId) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{conversation.labelName.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium">{conversation.labelName}의 답변</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.recipientAnswer.answeredAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="leading-relaxed">{conversation.recipientAnswer.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Recipient Answer (when I'm the recipient) */}
          {conversation.recipientAnswer && isMyAnswer(conversation.recipientAnswer.authorUserId) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">나</span>
                  </div>
                  <span className="text-sm font-medium">내 답변</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.recipientAnswer.answeredAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="leading-relaxed">{conversation.recipientAnswer.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Sender Answer (when I'm the recipient) */}
          {conversation.senderAnswer && !isMyAnswer(conversation.senderAnswer.authorUserId) && (
            <>
              {hasMyAnswer ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{conversation.labelName.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium">{conversation.labelName}의 답변</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.senderAnswer.answeredAt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{conversation.senderAnswer.content}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">상대방의 답변을 보려면 먼저 내 답변을 작성해주세요</p>
                    <Button onClick={handleWriteMyAnswer}>내 답변 쓰기</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Gate Message for incomplete answers */}
        {!hasMyAnswer && (
          <Alert className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              진솔한 대화를 위해 서로의 답변을 동시에 공개해요. 먼저 답변을 작성해주세요!
            </AlertDescription>
          </Alert>
        )}

        {/* Reactions */}
        {isComplete && hasMyAnswer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">이 대화가 어떠셨나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-3 mb-4">
                {reactions.map((reaction) => {
                  const Icon = reaction.icon
                  const isSelected = myReaction === reaction.type
                  const hasOtherReaction = otherReaction === reaction.type

                  return (
                    <button
                      key={reaction.type}
                      onClick={() => handleReaction(reaction.type)}
                      className={`relative p-3 rounded-full transition-all ${
                        isSelected ? "bg-primary/20 scale-110" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? reaction.color : "text-muted-foreground"}`} />
                      {hasOtherReaction && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background"></div>
                      )}
                    </button>
                  )
                })}
              </div>

              {myReaction && (
                <p className="text-center text-sm text-muted-foreground">
                  {reactions.find((r) => r.type === myReaction)?.label} 반응을 보냈어요
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Completion Badge */}
        {isComplete && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-green-600 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">✓</div>
                <p className="font-medium">대화 완료!</p>
              </div>
              <p className="text-sm text-green-700">오늘도 소중한 대화를 나누셨네요. 내일도 함께해요!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="animate-bounce text-6xl">🎉</div>
        </div>
      )}
    </div>
  )
}
