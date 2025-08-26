'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WeeklyHighlight, ShareStatus, BestConversation } from '@/types/weekly-highlight'
import { Download, Share2, Trophy, TrendingUp, TrendingDown, Users, MessageCircle, Clock, Calendar, Copy } from 'lucide-react'
import { useWeeklyShare } from '@/hooks/useWeeklyShare'

interface WeeklyHighlightPageProps {
  highlight: WeeklyHighlight | null
  isLoading?: boolean
  error?: string | null
  isEmpty?: boolean
  shareStatus?: ShareStatus
  hasPreviousWeeks?: boolean
  availableWeeks?: string[]
  onSaveImage?: (highlight: WeeklyHighlight) => void
  onKakaoShare?: (shareData: WeeklyHighlight['shareData']) => void
  onConversationClick?: (conversationId: string) => void
  onWeekChange?: (weekStart: string) => void
  onRetry?: () => void
  onStartConversation?: () => void
}

export function WeeklyHighlightPage({
  highlight,
  isLoading = false,
  error = null,
  isEmpty = false,
  shareStatus = 'idle',
  hasPreviousWeeks = false,
  availableWeeks = [],
  onSaveImage,
  onKakaoShare,
  onConversationClick,
  onWeekChange,
  onRetry,
  onStartConversation
}: WeeklyHighlightPageProps) {
  const [selectedWeek, setSelectedWeek] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  
  // 주간 공유 훅 사용
  const weeklyShare = useWeeklyShare({
    kakaoAppKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY,
    enableImageGeneration: true,
    imageFormat: 'png',
    imageQuality: 0.9
  })

  // 이미지 생성 대상 요소 설정
  useEffect(() => {
    if (contentRef.current) {
      weeklyShare.setImageElement(contentRef.current)
    }
  }, [weeklyShare.setImageElement])

  // 이미지 저장 핸들러
  const handleSaveImage = async () => {
    if (!highlight) return
    
    try {
      const success = await weeklyShare.downloadImage(highlight)
      if (success && onSaveImage) {
        onSaveImage(highlight)
      }
    } catch (error) {
      console.error('이미지 저장 실패:', error)
    }
  }

  // 카카오톡 공유 핸들러
  const handleKakaoShare = async () => {
    if (!highlight) return
    
    try {
      const success = await weeklyShare.shareToKakao(highlight)
      if (success && onKakaoShare) {
        onKakaoShare(highlight.shareData)
      }
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
    }
  }

  // 기타 공유 핸들러
  const handleOtherShare = async () => {
    if (!highlight) return
    
    try {
      await weeklyShare.shareToOther(highlight)
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  // 공유 상태 override (훅의 상태 우선)
  const currentShareStatus = weeklyShare.status !== 'idle' ? weeklyShare.status : shareStatus

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-primary-600">주간 하이라이트를 생성하는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-red-100 p-4">
              <MessageCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="mt-4 text-red-600">{error}</p>
            <Button 
              onClick={onRetry}
              variant="outline" 
              className="mt-4 min-h-[44px]"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 빈 상태
  if (isEmpty || !highlight) {
    return (
      <div className="min-h-screen bg-primary-50 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-primary-100 p-4">
              <Calendar className="h-8 w-8 text-primary-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-primary-900">아직 주간 하이라이트가 없어요</h2>
            <p className="mt-2 text-center text-primary-600">첫 번째 대화를 시작해보세요</p>
            <Button 
              onClick={onStartConversation}
              className="mt-6 min-h-[44px]"
            >
              대화 시작하기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 대화 부족 상태 (3회 미만)
  const isInsufficientData = highlight.statistics.totalConversations < 3

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart)
    const month = start.getMonth() + 1
    const weekNumber = Math.ceil(start.getDate() / 7)
    return `${month}월 ${weekNumber}주차`
  }

  const formatResponseRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`
  }

  const getDayName = (day: string) => {
    const dayNames = {
      'sunday': '일요일',
      'monday': '월요일', 
      'tuesday': '화요일',
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일'
    }
    return dayNames[day as keyof typeof dayNames] || day
  }

  const renderGrowthIndicator = (growth?: number) => {
    if (growth === undefined) return null
    
    const isPositive = growth > 0
    const percentage = Math.abs(Math.round(growth * 100))
    
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} data-testid="growth-indicator">
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm">전주 대비 {percentage}% {isPositive ? '증가' : '감소'}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6" ref={contentRef} data-image-target data-testid="weekly-highlight-content">
        {/* 헤더 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">주간 하이라이트</h1>
            {availableWeeks.length > 0 && (
              <Select value={selectedWeek} onValueChange={(value) => {
                setSelectedWeek(value)
                onWeekChange?.(value)
              }}>
                <SelectTrigger className="w-32" aria-label="주 선택">
                  <SelectValue placeholder="주 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week) => (
                    <SelectItem key={week} value={week}>
                      {formatWeekRange(week)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {hasPreviousWeeks && (
            <Button variant="outline" className="self-start min-h-[44px]">
              이전 주 보기
            </Button>
          )}
        </div>

        {/* 메인 타이틀 카드 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <CardTitle className="text-xl">{highlight.shareData.title}</CardTitle>
            <p className="text-primary-100">{highlight.shareData.description}</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-900">{highlight.statistics.totalConversations}번의 대화</p>
                <p className="text-sm text-primary-600">이번 주 총 대화</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-900">{formatResponseRate(highlight.statistics.responseRate)}</p>
                <p className="text-sm text-primary-600">평균 응답률</p>
              </div>
            </div>
            {renderGrowthIndicator((highlight as any).weeklyGrowth)}
          </CardContent>
        </Card>

        {/* 대화 부족 안내 */}
        {isInsufficientData && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <div className="rounded-full bg-amber-100 p-3 mx-auto w-fit mb-4">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-900 mb-2">조금 더 대화해보세요</h3>
              <p className="text-amber-700 mb-2">이번 주는 {highlight.statistics.totalConversations}번의 대화를 나누었어요</p>
              <p className="text-sm text-amber-600">3번 이상 대화하시면 더 풍성한 하이라이트를 만들어드려요</p>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              이번 주 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-lg font-semibold text-primary-900">총 {highlight.statistics.totalConversations}개 대화</p>
                <p className="text-sm text-primary-600">{highlight.statistics.completedConversations}개 완료</p>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-lg font-semibold text-primary-900">응답률 {formatResponseRate(highlight.statistics.responseRate)}</p>
                <p className="text-sm text-primary-600">{highlight.statistics.participatingFamilies}명 참여</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-primary-700">가장 활발한 날: <span className="font-semibold">{getDayName(highlight.statistics.mostActiveDay)}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* 일별 대화 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              일별 대화 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2" data-testid="weekly-conversation-chart">
              {highlight.statistics.conversationsByDay.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-primary-600">{getDayName(day.dayOfWeek).slice(0, 1)}</span>
                  <div className="flex-1 bg-primary-100 rounded-full h-4 relative overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max((day.count / Math.max(...highlight.statistics.conversationsByDay.map(d => d.count))) * 100, day.count > 0 ? 10 : 0)}%` }}
                      data-testid={`chart-bar-${day.dayOfWeek}`}
                      data-count={day.count}
                    />
                  </div>
                  <span className="w-8 text-sm text-primary-900 font-medium">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 가족별 하이라이트 */}
        {highlight.familyHighlights.map((family, index) => (
          <Card key={family.familyName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                {family.familyName}님과의 대화
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-primary-600">
                <span>{family.conversationCount}개 대화</span>
                <span>{formatResponseRate(family.responseRate)} 응답률</span>
                <Badge variant={family.responseRate > 0.8 ? "default" : "secondary"}>
                  {family.relationshipType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {family.bestConversations.slice(0, 3).map((conversation, idx) => (
                <div 
                  key={conversation.id}
                  className="p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors min-h-[44px] flex flex-col justify-center"
                  onClick={() => onConversationClick?.(conversation.id)}
                  data-testid={`best-conversation-${conversation.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                    <span className="text-xs text-primary-500">참여도 {conversation.engagementScore}점</span>
                  </div>
                  <p className="font-medium text-primary-900 mb-1">{conversation.questionContent}</p>
                  <p className="text-sm text-primary-700 mb-2">"{conversation.preview.snippet}"</p>
                  <div className="flex items-center justify-between text-xs text-primary-600">
                    <span>- {conversation.preview.authorName}</span>
                    <span>{conversation.questionCategory}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* 인사이트 카드 */}
        {(highlight as any).insights?.map((insight: any, index: number) => (
          <Card key={index} className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">{insight.title}</h3>
                  <p className="text-green-700">{insight.description}</p>
                  {insight.actionText && (
                    <Button variant="outline" size="sm" className="mt-3">
                      {insight.actionText}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 공유 버튼 */}
        <div className="flex flex-col gap-3 sticky bottom-6" data-exclude-from-image="true" data-testid="share-buttons-section">
          {/* 이미지 생성 진행률 표시 */}
          {currentShareStatus === 'generating-image' && weeklyShare.progress > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-900">이미지 생성 중...</span>
                <span className="text-sm text-primary-600">{weeklyShare.progress}%</span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${weeklyShare.progress}%` }}
                  role="progressbar"
                  aria-valuenow={weeklyShare.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveImage}
              disabled={currentShareStatus === 'generating-image' || currentShareStatus === 'sharing' || !weeklyShare.canShare.download}
              className="flex-1 min-h-[44px]"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {currentShareStatus === 'generating-image' ? '이미지 생성 중...' : '이미지로 저장'}
            </Button>
            <Button 
              onClick={handleKakaoShare}
              disabled={currentShareStatus === 'generating-image' || currentShareStatus === 'sharing' || !weeklyShare.canShare.kakao}
              className="flex-1 min-h-[44px]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {currentShareStatus === 'sharing' ? '공유 중...' : '카카오톡 공유'}
            </Button>
          </div>

          {/* 추가 공유 옵션 */}
          <div className="flex gap-3">
            <Button 
              onClick={handleOtherShare}
              disabled={currentShareStatus === 'generating-image' || currentShareStatus === 'sharing'}
              className="flex-1 min-h-[44px]"
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              {weeklyShare.canShare.native ? '공유하기' : '링크 복사'}
            </Button>
          </div>
          
          {/* 상태 메시지 */}
          {(currentShareStatus === 'completed' || weeklyShare.lastSharedAt) && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              공유가 완료되었어요!
            </div>
          )}
          
          {(currentShareStatus === 'failed' || weeklyShare.error) && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
              <p>{weeklyShare.error || '공유 중 문제가 발생했어요. 다시 시도해주세요.'}</p>
              <Button 
                onClick={weeklyShare.clearError} 
                variant="ghost" 
                size="sm" 
                className="mt-1 text-xs"
              >
                확인
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}