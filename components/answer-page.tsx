'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Send, Clock, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { ReceivedQuestion, AnswerSubmission, AnswerResponse, ANSWER_CONSTRAINTS } from '@/types/answer'

interface AnswerPageProps {
  shareToken: string
  question?: ReceivedQuestion | null
  isLoading: boolean
  error?: string | null
  onSubmit?: (submission: AnswerSubmission) => Promise<AnswerResponse>
  onViewConversation?: (conversationId: string) => void
}

type PageState = 'loading' | 'form' | 'success' | 'error' | 'expired' | 'invalid'

interface FormData {
  authorName: string
  content: string
}

interface FormErrors {
  authorName?: string
  content?: string
}

export function AnswerPage({
  shareToken,
  question,
  isLoading,
  error,
  onSubmit,
  onViewConversation
}: AnswerPageProps) {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [formData, setFormData] = useState<FormData>({ authorName: '', content: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitResponse, setSubmitResponse] = useState<AnswerResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 페이지 상태 결정
  useEffect(() => {
    if (isLoading) {
      setPageState('loading')
    } else if (error) {
      setPageState('invalid')
    } else if (question?.isExpired) {
      setPageState('expired')
    } else if (question) {
      setPageState('form')
    } else {
      setPageState('invalid')
    }
  }, [isLoading, error, question])

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // 이름 검증
    if (!formData.authorName.trim()) {
      errors.authorName = '이름을 입력해주세요.'
    } else if (formData.authorName.trim().length < 1) {
      errors.authorName = '이름을 입력해주세요.'
    }

    // 답변 검증
    if (!formData.content.trim()) {
      errors.content = '답변을 작성해주세요.'
    } else if (formData.content.trim().length < ANSWER_CONSTRAINTS.MIN_LENGTH) {
      errors.content = '최소 2자 이상 작성해주세요.'
    } else if (formData.content.length > ANSWER_CONSTRAINTS.MAX_LENGTH) {
      errors.content = '최대 800자까지 작성할 수 있어요.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 실시간 유효성 검사
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleContentChange = (value: string) => {
    // 800자 제한 강제 적용
    if (value.length <= ANSWER_CONSTRAINTS.MAX_LENGTH) {
      handleInputChange('content', value)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm() || !question || !onSubmit) return

    setIsSubmitting(true)
    try {
      const submission: AnswerSubmission = {
        questionId: question.id,
        shareToken: shareToken,
        content: formData.content.trim(),
        authorName: formData.authorName.trim()
      }

      const response = await onSubmit(submission)
      setSubmitResponse(response)
      setPageState('success')
    } catch (err) {
      setPageState('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewConversation = () => {
    if (submitResponse?.conversationId && onViewConversation) {
      onViewConversation(submitResponse.conversationId)
    }
  }

  const isFormValid = formData.authorName.trim() && 
                     formData.content.trim() && 
                     formData.content.trim().length >= ANSWER_CONSTRAINTS.MIN_LENGTH &&
                     formData.content.length <= ANSWER_CONSTRAINTS.MAX_LENGTH

  // 로딩 상태
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 만료된 링크
  if (pageState === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">링크 유효시간이 지났어요</h2>
            <p className="text-muted-foreground">새로운 링크를 요청해주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 유효하지 않은 링크
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">유효하지 않은 링크예요</h2>
            <p className="text-muted-foreground">링크를 다시 확인해주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 답변 제출 성공
  if (pageState === 'success' && submitResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">답변이 전달되었어요!</h2>
            <p className="text-muted-foreground mb-6">대화를 확인해보세요.</p>
            
            {submitResponse.canViewConversation && (
              <Button 
                onClick={handleViewConversation}
                className="w-full min-h-[44px]"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                대화 보러가기
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // 답변 제출 실패
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">답변 저장 중 문제가 발생했어요</h2>
            <p className="text-muted-foreground mb-6">잠시 후 다시 시도해주세요.</p>
            
            <Button 
              onClick={() => setPageState('form')}
              variant="outline"
              className="w-full min-h-[44px]"
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 답변 폼 (기본 상태)
  if (!question) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* 질문 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {question.senderName}님이 보낸 질문
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">
                {question.category}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question.content}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 답변 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              답변하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 이름 입력 */}
            <div className="space-y-2">
              <label htmlFor="authorName" className="text-sm font-medium">
                당신의 이름 <span className="text-destructive">*</span>
              </label>
              <input
                id="authorName"
                type="text"
                placeholder="예: 엄마, 아빠, 친구 이름"
                value={formData.authorName}
                onChange={(e) => handleInputChange('authorName', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {formErrors.authorName && (
                <p className="text-sm text-destructive">{formErrors.authorName}</p>
              )}
            </div>

            {/* 답변 입력 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="answerContent" className="text-sm font-medium">
                  답변을 작성해주세요 <span className="text-destructive">*</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  {formData.content.length}/{ANSWER_CONSTRAINTS.MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="answerContent"
                placeholder="솔직하고 진솔한 답변을 들려주세요..."
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onBlur={validateForm}
                rows={6}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {formErrors.content && (
                <p className="text-sm text-destructive">{formErrors.content}</p>
              )}
            </div>

            {/* 제출 버튼 */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full min-h-[44px]"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? '답변 보내는 중...' : '답변 보내기'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}