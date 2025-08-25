"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter } from "lucide-react"
import { conversations, labels } from "@/lib/dummy-data"

export default function HistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLabel, setSelectedLabel] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchQuery === "" ||
      conv.question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.senderAnswer?.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.recipientAnswer?.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLabel = selectedLabel === "all" || conv.labelName === selectedLabel

    const matchesPeriod =
      selectedPeriod === "all" ||
      (() => {
        const convDate = new Date(conv.createdAt)
        const now = new Date()

        switch (selectedPeriod) {
          case "week":
            return now.getTime() - convDate.getTime() <= 7 * 24 * 60 * 60 * 1000
          case "month":
            return now.getTime() - convDate.getTime() <= 30 * 24 * 60 * 60 * 1000
          case "3months":
            return now.getTime() - convDate.getTime() <= 90 * 24 * 60 * 60 * 1000
          default:
            return true
        }
      })()

    return matchesSearch && matchesLabel && matchesPeriod
  })

  const handleConversationClick = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">대화 히스토리</h1>
        <p className="text-muted-foreground">지금까지 나눈 소중한 대화들을 다시 만나보세요</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="질문이나 답변 내용으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="flex-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="기간" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 기간</SelectItem>
              <SelectItem value="week">최근 1주일</SelectItem>
              <SelectItem value="month">최근 1개월</SelectItem>
              <SelectItem value="3months">최근 3개월</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLabel} onValueChange={setSelectedLabel}>
            <SelectTrigger className="flex-1">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="라벨" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 라벨</SelectItem>
              {labels.map((label) => (
                <SelectItem key={label.labelId} value={label.name}>
                  {label.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">총 {filteredConversations.length}개의 대화</p>
      </div>

      {/* Conversation List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-2">검색 결과가 없어요</p>
              <p className="text-sm text-muted-foreground">다른 검색어나 필터를 시도해보세요</p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.conversationId}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleConversationClick(conversation.conversationId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {conversation.labelName}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {conversation.question.category}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm line-clamp-2 mb-2">{conversation.question.content}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {conversation.senderAnswer && (
                    <div className="bg-primary/5 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-1">내 답변</p>
                      <p className="text-sm line-clamp-2">{conversation.senderAnswer.content}</p>
                    </div>
                  )}

                  {conversation.recipientAnswer && (
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-1">{conversation.labelName}의 답변</p>
                      <p className="text-sm line-clamp-2">{conversation.recipientAnswer.content}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <div className="flex items-center gap-1">
                    {conversation.senderAnswer && conversation.recipientAnswer && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        완료
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
