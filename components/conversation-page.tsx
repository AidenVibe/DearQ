'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Send, Clock, User, MessageSquare, Heart, Sparkles, AlertCircle } from 'lucide-react'
import { 
  Conversation, 
  ConversationAnswer, 
  SelfAnswerSubmission, 
  SelfAnswerResponse,
  ConversationPageState,
  SelfExpressionGate,
  CelebrationConfig
} from '@/types/conversation'

interface ConversationPageProps {
  conversationId: string
  userId: string
  conversation?: Conversation | null
  isLoading?: boolean
  error?: string | null
  onSubmitAnswer?: (submission: SelfAnswerSubmission) => Promise<SelfAnswerResponse>
  onLoadConversation?: (conversationId: string, userId: string) => Promise<Conversation>
}

export function ConversationPage({
  conversationId,
  userId,
  conversation: propConversation,
  isLoading: propIsLoading = false,
  error: propError = null,
  onSubmitAnswer,
  onLoadConversation
}: ConversationPageProps) {
  const [state, setState] = useState<ConversationPageState>({
    loadingState: propIsLoading ? 'loading' : (propConversation ? 'loaded' : 'not-found'),
    conversation: propConversation || null,
    selfExpressionGate: {
      status: 'locked',
      userHasAnswered: false,
      canViewOthersAnswers: false,
      requiresOwnAnswer: true
    },
    celebration: {
      show: false,
      type: 'connection',
      duration: 3000,
      message: ''
    },
    error: propError
  })

  const [selfAnswer, setSelfAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 자기표현 게이트 상태 계산
  useEffect(() => {
    if (!state.conversation) return

    const userAnswer = state.conversation.answers.find(answer => answer.authorId === userId)
    const userHasAnswered = !!userAnswer
    const canViewAll = state.conversation.canViewAll || userHasAnswered

    setState(prev => ({
      ...prev,
      selfExpressionGate: {
        status: userHasAnswered ? 'unlocked' : 'locked',
        userHasAnswered,
        canViewOthersAnswers: canViewAll,
        requiresOwnAnswer: !userHasAnswered && !canViewAll
      }
    }))
  }, [state.conversation, userId])

  // 대화 로딩
  useEffect(() => {
    if (propIsLoading) {
      setState(prev => ({ ...prev, loadingState: 'loading' }))
    } else if (propConversation) {
      setState(prev => ({ 
        ...prev, 
        loadingState: 'loaded', 
        conversation: propConversation,
        error: null 
      }))
    } else if (propError) {
      setState(prev => ({ 
        ...prev, 
        loadingState: 'error', 
        error: propError 
      }))
    }
  }, [propIsLoading, propConversation, propError])

  const handleSelfAnswerSubmit = async () => {
    if (!selfAnswer.trim() || !onSubmitAnswer || !state.conversation) return

    setIsSubmitting(true)
    try {
      const submission: SelfAnswerSubmission = {
        conversationId,
        content: selfAnswer.trim(),
        authorName: state.conversation.participants.find(p => p.id === userId)?.name || '나'
      }

      const response = await onSubmitAnswer(submission)
      
      // 축하 애니메이션 표시
      setState(prev => ({
        ...prev,
        celebration: {
          show: true,
          type: 'connection',
          duration: 3000,
          message: '대화가 연결되었어요!'
        }
      }))

      // 애니메이션 후 대화 업데이트
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          celebration: { ...prev.celebration, show: false },
          conversation: prev.conversation ? {
            ...prev.conversation,
            answers: [
              ...prev.conversation.answers,
              {
                id: response.answerId,
                authorId: userId,
                authorName: submission.authorName,
                content: submission.content,
                createdAt: new Date().toISOString(),
                isOwn: true
              },
              ...(response.unlockedAnswers || [])
            ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            canViewAll: true,
            status: 'completed'
          } : null
        }))
        setSelfAnswer('')
      }, 3000)

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '답변 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 답변 유효성 검사
  const isAnswerValid = selfAnswer.trim().length >= 2 && selfAnswer.trim().length <= 800

  // 로딩 상태
  if (state.loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">대화를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 에러 상태
  if (state.loadingState === 'error' || state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">문제가 발생했어요</h2>
            <p className="text-muted-foreground">{state.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 대화 없음
  if (!state.conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">존재하지 않는 대화예요</h2>
            <p className="text-muted-foreground">링크를 다시 확인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 축하 애니메이션
  if (state.celebration.show) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4"
        data-testid="celebration-animation"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-bounce mb-4">
              <Heart className="h-16 w-16 text-red-500 mx-auto fill-current" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">{state.celebration.message}</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm">소중한 연결이 만들어졌어요</span>
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const conversation = state.conversation
  const gate = state.selfExpressionGate

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* 질문 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {conversation.question.date}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {conversation.question.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {conversation.participants.length}명 참여
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {conversation.question.content}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 자기표현 게이트 - 자기 답변이 필요한 경우 */}
        {gate.requiresOwnAnswer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                먼저 당신의 답변을 들려주세요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                답변을 작성하면 상대방의 답변을 볼 수 있어요
              </p>
              
              <div className="space-y-2">
                <label htmlFor="selfAnswer" className="text-sm font-medium">
                  당신의 답변 <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="selfAnswer"
                  placeholder="솔직하고 진솔한 답변을 들려주세요..."
                  value={selfAnswer}
                  onChange={(e) => setSelfAnswer(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>2자 이상 800자 이하</span>
                  <span>{selfAnswer.length}/800</span>
                </div>
              </div>

              <Button
                onClick={handleSelfAnswerSubmit}
                disabled={!isAnswerValid || isSubmitting}
                className="w-full min-h-[44px]"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? '답변 제출 중...' : '답변 제출하기'}
              </Button>
            </CardContent>
          </Card>
        )}


        {/* 자기표현 게이트가 활성화된 경우: 블러 처리된 상대방 답변 */}
        {gate.requiresOwnAnswer && conversation.answers
          .filter(answer => !answer.isOwn)
          .map((answer) => (
            <Card 
              key={`blurred-${answer.id}`} 
              className="relative mr-8 mb-4 blur"
              data-testid="blurred-answer"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{answer.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(answer.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed bg-secondary/30 p-3 rounded-md">
                  {answer.content}
                </p>
              </CardContent>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">
                  답변을 작성하면 상대방의 답변을 볼 수 있어요
                </p>
              </div>
            </Card>
          ))
        }

        {/* 완성된 대화 - 모든 답변 시간순 표시 */}
        {gate.canViewOthersAnswers && conversation.answers
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((answer) => (
            <Card 
              key={`conversation-${answer.id}`}
              className={`mb-4 ${answer.isOwn ? 'ml-8 bg-primary/10' : 'mr-8 bg-secondary/30'}`}
              data-testid={`answer-${answer.authorId}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className={`h-4 w-4 ${answer.isOwn ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-medium text-sm ${answer.isOwn ? 'text-primary' : ''}`}>
                    {answer.authorName}
                  </span>
                  {answer.isOwn && <Badge variant="secondary" className="text-xs">나</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {new Date(answer.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed p-3 rounded-md bg-white/50">
                  {answer.content}
                </p>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}