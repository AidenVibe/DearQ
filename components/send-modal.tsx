'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Plus, Send, Copy, MessageCircle, Clock, Star } from 'lucide-react'
import { TodaysQuestion } from '@/types/question'
import { FamilyLabel, SendResponse, ShareMethod } from '@/types/label'

interface SendModalProps {
  isOpen: boolean
  question?: TodaysQuestion | null
  labels?: FamilyLabel[]
  onClose: () => void
  onSend?: (questionId: string, labelId: string, recipientName: string) => Promise<SendResponse>
  onSendComplete?: (response: SendResponse) => void
}

type ModalStep = 'select-recipient' | 'add-label' | 'sharing' | 'error'

interface AddLabelForm {
  name: string
  nickname: string
}

export function SendModal({
  isOpen,
  question,
  labels = [],
  onClose,
  onSend,
  onSendComplete
}: SendModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('select-recipient')
  const [selectedLabel, setSelectedLabel] = useState<FamilyLabel | null>(null)
  const [sendResponse, setSendResponse] = useState<SendResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addLabelForm, setAddLabelForm] = useState<AddLabelForm>({ name: '', nickname: '' })

  // 확인된 라벨만 필터링 (pending 상태 제외)
  const confirmedLabels = labels.filter(label => label.status === 'confirmed')
  
  // 최근 사용 라벨 우선 정렬
  const sortedLabels = [...confirmedLabels].sort((a, b) => {
    if (a.isRecent && !b.isRecent) return -1
    if (!a.isRecent && b.isRecent) return 1
    if (a.lastUsedAt && b.lastUsedAt) {
      return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    }
    return 0
  })

  useEffect(() => {
    if (!isOpen) {
      // 모달 닫힐 때 상태 초기화
      setCurrentStep('select-recipient')
      setSelectedLabel(null)
      setSendResponse(null)
      setError(null)
      setAddLabelForm({ name: '', nickname: '' })
      setIsLoading(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때도 상태 초기화
      setCurrentStep('select-recipient')
      setSelectedLabel(null)
      setSendResponse(null)
      setError(null)
      setAddLabelForm({ name: '', nickname: '' })
      setIsLoading(false)
    }
  }, [isOpen])

  const handleLabelSelect = (label: FamilyLabel) => {
    setSelectedLabel(label)
    setError(null)
  }

  const handleSend = async () => {
    if (!selectedLabel || !question || !onSend) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await onSend(question.id, selectedLabel.id, selectedLabel.name)
      setSendResponse(response)
      setCurrentStep('sharing')
      onSendComplete?.(response)
    } catch (err) {
      setError('전송 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
      setCurrentStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLabel = () => {
    setCurrentStep('add-label')
  }

  const handleShare = async (method: ShareMethod) => {
    if (!sendResponse) return

    switch (method) {
      case 'copy-url':
        try {
          await navigator.clipboard.writeText(sendResponse.shareUrl)
          // 복사 성공 피드백 - 실제 앱에서는 토스트나 알림 표시
          alert('링크가 복사되었어요!')
        } catch (err) {
          // 복사 실패 처리
          alert('링크 복사에 실패했어요. 다시 시도해주세요.')
        }
        break
      case 'kakao-talk':
        // 카카오톡 공유 - 실제 구현에서는 Kakao SDK 사용
        try {
          const shareMessage = `${sendResponse.recipient.name}님께 질문을 보냈어요!\n\n${sendResponse.shareUrl}\n\n마음배달(DearQ)에서 가족과의 소통을 시작해보세요.`
          
          // 실제 카카오톡 공유 API 호출 위치
          // if (window.Kakao && window.Kakao.Link) {
          //   window.Kakao.Link.sendDefault({
          //     objectType: 'text',
          //     text: shareMessage,
          //     link: {
          //       webUrl: sendResponse.shareUrl,
          //       mobileWebUrl: sendResponse.shareUrl
          //     }
          //   })
          // } else {
          //   throw new Error('카카오톡이 설치되지 않았거나 지원하지 않는 환경입니다.')
          // }
          
          // 개발/테스트용 임시 구현
          alert(`카카오톡으로 공유:\n${shareMessage}`)
        } catch (err) {
          alert('카카오톡 공유에 실패했어요. 다시 시도해주세요.')
        }
        break
      default:
        break
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!question) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {currentStep === 'select-recipient' && (
          <>
            <DialogHeader>
              <DialogTitle>가족에게 보내기</DialogTitle>
              <DialogDescription className="text-left">
                오늘의 질문을 누구에게 보낼까요?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* 질문 미리보기 */}
              <Card className="bg-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {question.category}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{question.content}</p>
                </CardContent>
              </Card>

              {/* 라벨 선택 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">가족 선택</h4>
                <div className="grid grid-cols-2 gap-2">
                  {sortedLabels.map((label) => (
                    <Card
                      key={label.id}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedLabel?.id === label.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => handleLabelSelect(label)}
                      data-testid={label.isRecent ? 'recent-label' : 'label'}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm">{label.name}</span>
                              {label.isRecent && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            {label.nickname && (
                              <span className="text-xs text-muted-foreground">
                                {label.nickname}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 새 가족 추가 버튼 */}
              <Button
                variant="outline"
                onClick={handleAddLabel}
                className="w-full min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 가족 추가
              </Button>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1 min-h-[44px]"
              >
                닫기
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedLabel || isLoading}
                className="flex-1 min-h-[44px]"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? '보내는 중...' : '보내기'}
              </Button>
            </div>
          </>
        )}

        {currentStep === 'add-label' && (
          <>
            <DialogHeader>
              <DialogTitle>가족 추가</DialogTitle>
              <DialogDescription>
                새로운 가족을 추가해주세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="엄마, 아빠, 누나 등"
                  value={addLabelForm.name}
                  onChange={(e) => setAddLabelForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">
                  닉네임 (선택)
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder="실제 이름"
                  value={addLabelForm.nickname}
                  onChange={(e) => setAddLabelForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('select-recipient')}
                className="flex-1 min-h-[44px]"
              >
                취소
              </Button>
              <Button
                onClick={() => setCurrentStep('select-recipient')}
                disabled={!addLabelForm.name.trim()}
                className="flex-1 min-h-[44px]"
              >
                추가
              </Button>
            </div>
          </>
        )}

        {currentStep === 'sharing' && sendResponse && (
          <>
            <DialogHeader>
              <DialogTitle>공유하기</DialogTitle>
              <DialogDescription>
                {sendResponse.recipient.name}님에게 질문을 보냈어요!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-green-600 font-medium mb-1">전송 완료</div>
                    <div className="text-sm text-green-600">
                      {new Date(sendResponse.expiresAt).toLocaleString('ko-KR')}까지 유효
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button
                  onClick={() => handleShare('kakao-talk')}
                  className="w-full min-h-[44px] bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  카카오톡으로 보내기
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare('copy-url')}
                  className="w-full min-h-[44px]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  링크 복사
                </Button>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleClose}
              className="w-full min-h-[44px]"
            >
              완료
            </Button>
          </>
        )}

        {currentStep === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle>전송 실패</DialogTitle>
              <DialogDescription>
                문제가 발생했습니다.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('select-recipient')}
                className="flex-1 min-h-[44px]"
              >
                다시 시도
              </Button>
              <Button 
                onClick={handleClose}
                className="flex-1 min-h-[44px]"
              >
                닫기
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}