"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Calendar, TrendingUp } from "lucide-react"
import { conversations, labels } from "@/lib/dummy-data"

export default function WeeklyPage() {
  const [selectedWeek, setSelectedWeek] = useState("current")

  // Generate weekly summary data
  const getWeeklySummary = () => {
    const labelStats = labels
      .map((label) => {
        const labelConversations = conversations.filter((c) => c.labelName === label.name)
        const highlights = labelConversations.slice(0, 3) // Top 3 conversations

        return {
          labelName: label.name,
          conversationCount: labelConversations.length,
          responseRate: labelConversations.length > 0 ? 100 : 0, // Simplified
          highlights,
        }
      })
      .filter((stat) => stat.conversationCount > 0)

    return {
      totalConversations: conversations.length,
      activeLabels: labelStats.length,
      labelStats,
    }
  }

  const weeklySummary = getWeeklySummary()

  const handleShare = (labelName: string) => {
    const shareText = `이번 주 ${labelName}와 나눈 소중한 대화들을 문답다리에서 확인해보세요! 🌉`

    if (navigator.share) {
      navigator.share({
        title: "문답다리 주간 하이라이트",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert("링크가 복사되었습니다!")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">주간 요약</h1>
        <p className="text-muted-foreground">이번 주 가족과 나눈 대화를 돌아보세요</p>
      </div>

      {/* Week Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">이번 주</span>
            </div>
            <Badge variant="secondary">
              {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 주간
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            이번 주 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{weeklySummary.totalConversations}</p>
              <p className="text-sm text-muted-foreground">완료된 대화</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{weeklySummary.activeLabels}</p>
              <p className="text-sm text-muted-foreground">활성 라벨</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Label Highlights */}
      <div className="space-y-4">
        {weeklySummary.labelStats.map((labelStat) => (
          <Card key={labelStat.labelName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{labelStat.labelName}와의 대화</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleShare(labelStat.labelName)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{labelStat.conversationCount}회 대화</Badge>
                <Badge variant="outline">{labelStat.responseRate}% 응답률</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-sm">이번 주 하이라이트 3선</p>
                {labelStat.highlights.map((conversation, index) => (
                  <div key={conversation.conversationId} className="bg-accent/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}위
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{conversation.question.content}</p>
                    {conversation.senderAnswer && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        "{conversation.senderAnswer.content}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {weeklySummary.labelStats.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-2">이번 주는 아직 대화가 없어요</p>
            <p className="text-sm text-muted-foreground">가족에게 첫 질문을 보내보세요!</p>
            <Button className="mt-4">질문 보내기</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
