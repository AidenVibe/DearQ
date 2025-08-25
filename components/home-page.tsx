'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, Send, MessageSquare, Eye } from 'lucide-react'
import { TodaysQuestion } from '@/types/question'
import { User, HomeState } from '@/types/user'

interface HomePageProps {
  user?: User | null
  todaysQuestion?: TodaysQuestion | null
  homeState?: HomeState
  isLoading?: boolean
  onSendComplete?: () => void
  onAnswerComplete?: () => void
  onViewConversation?: () => void
}

export function HomePage({
  user,
  todaysQuestion,
  homeState = { hasSent: false, hasAnswered: false, canViewConversation: false },
  isLoading = false,
  onSendComplete,
  onAnswerComplete,
  onViewConversation
}: HomePageProps) {
  const [currentState, setCurrentState] = useState<HomeState>(homeState)

  const handleSend = () => {
    setCurrentState(prev => ({ ...prev, hasSent: true }))
    onSendComplete?.()
  }

  const handleWriteAnswer = () => {
    setCurrentState(prev => ({ 
      ...prev, 
      hasAnswered: true, 
      canViewConversation: true 
    }))
    onAnswerComplete?.()
  }

  const handleViewConversation = () => {
    onViewConversation?.()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div data-testid="loading-skeleton" className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!todaysQuestion) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center">
          <p className="text-muted-foreground">
            오늘의 질문이 준비되지 않았어요. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {user?.nickname || '사용자'}님!
        </h1>
        <p className="text-muted-foreground">
          오늘도 가족과 소중한 대화를 나눠보세요
        </p>
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
          <p className="text-foreground mb-4 leading-relaxed">
            {todaysQuestion.content}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentState.hasSent 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Send className="h-4 w-4" />
              </div>
              <span className={
                currentState.hasSent 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              }>
                가족에게 보내기
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentState.hasAnswered 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className={
                currentState.hasAnswered 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              }>
                내 답변 작성하기
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentState.canViewConversation
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Eye className="h-4 w-4" />
              </div>
              <span className={
                currentState.canViewConversation 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              }>
                대화 보기
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!currentState.hasSent && (
          <Button 
            onClick={handleSend} 
            className="w-full min-h-[44px]" 
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            보내기
          </Button>
        )}

        {currentState.hasSent && !currentState.hasAnswered && (
          <Button 
            onClick={handleWriteAnswer} 
            className="w-full min-h-[44px]" 
            size="lg"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            내 답변 쓰기
          </Button>
        )}

        {currentState.canViewConversation && (
          <Button 
            onClick={handleViewConversation} 
            variant="outline" 
            className="w-full bg-transparent min-h-[44px]" 
            size="lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            대화 보기
          </Button>
        )}

        {currentState.hasSent && (
          <div className="text-center">
            <Badge variant="outline" className="text-green-600 border-green-600">
              전송 완료
            </Badge>
          </div>
        )}
      </div>

      {!currentState.hasSent && (
        <Card className="mt-6 bg-accent/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              오늘의 질문이 준비되었어요! 가족 중 한 분을 선택해서 질문을 보내보세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}