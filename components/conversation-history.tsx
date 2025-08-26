'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Label } from './ui/label'
import { 
  Search, 
  MessageSquare, 
  Clock, 
  Users, 
  Star, 
  Archive,
  Filter,
  Calendar,
  Heart,
  MoreVertical,
  AlertCircle,
  ChevronDown,
  Eye
} from 'lucide-react'
import { 
  ConversationHistoryItem,
  ConversationHistoryState,
  ConversationFilters,
  ConversationViewMode,
  DateRangePreset,
  PaginationState
} from '@/types/conversation-history'

interface ConversationHistoryPageProps {
  conversations?: ConversationHistoryItem[]
  isLoading?: boolean
  error?: string | null
  pagination?: PaginationState
  onConversationClick?: (conversationId: string) => void
  onToggleFavorite?: (conversationId: string, isFavorite: boolean) => Promise<void>
  onToggleArchive?: (conversationId: string, isArchived: boolean) => Promise<void>
  onLoadMore?: () => Promise<void>
}

const categories = [
  '일상·하루',
  '관계·소통', 
  '기억·추억',
  '감정·마음',
  '미래·꿈',
  '취미·관심사',
  '가치관·철학',
  '성장·변화',
  '가족·친구',
  '특별한순간'
]

const statusLabels: Record<string, { label: string; color: string }> = {
  waiting: { label: '대기중', color: 'bg-gray-100 text-gray-700' },
  active: { label: '진행중', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료됨', color: 'bg-green-100 text-green-700' },
  expired: { label: '만료됨', color: 'bg-red-100 text-red-700' }
}

export function ConversationHistoryPage({
  conversations: propConversations = [],
  isLoading = false,
  error: propError = null,
  pagination,
  onConversationClick,
  onToggleFavorite,
  onToggleArchive,
  onLoadMore
}: ConversationHistoryPageProps) {
  const [state, setState] = useState<ConversationHistoryState>({
    conversations: propConversations,
    isLoading,
    error: propError,
    filters: {
      status: 'all',
      category: 'all',
      dateRange: {
        startDate: null,
        endDate: null,
        preset: null
      },
      participantFilter: 'all',
      isArchived: 'all',
      isFavorite: 'all'
    },
    pagination: pagination || {
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      hasMore: false
    },
    searchQuery: '',
    selectedConversation: null,
    viewMode: 'list'
  })

  useEffect(() => {
    setState(prev => ({
      ...prev,
      conversations: propConversations,
      isLoading,
      error: propError,
      pagination: pagination || prev.pagination
    }))
  }, [propConversations, isLoading, propError, pagination])

  // 필터링 및 검색된 대화 목록
  const filteredConversations = useMemo(() => {
    let filtered = state.conversations

    // 검색 필터
    if (state.searchQuery) {
      filtered = filtered.filter(conv =>
        conv.questionContent.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        conv.questionCategory.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        conv.participants.some(p => p.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    }

    // 상태 필터
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(conv => conv.status === state.filters.status)
    }

    // 카테고리 필터
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(conv => conv.questionCategory === state.filters.category)
    }

    // 보관함 필터
    if (state.filters.isArchived !== 'all') {
      filtered = filtered.filter(conv => conv.isArchived === state.filters.isArchived)
    }

    // 즐겨찾기 필터
    if (state.filters.isFavorite !== 'all') {
      filtered = filtered.filter(conv => conv.isFavorite === state.filters.isFavorite)
    }

    // 최신순 정렬
    return filtered.sort((a, b) => 
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    )
  }, [state.conversations, state.searchQuery, state.filters])

  // 날짜별 그룹핑
  const groupedConversations = useMemo(() => {
    const groups: Record<string, ConversationHistoryItem[]> = {}
    
    filteredConversations.forEach(conv => {
      const date = new Date(conv.lastActivityAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(conv)
    })
    
    return groups
  }, [filteredConversations])

  const handleToggleFavorite = async (conversationId: string, currentIsFavorite: boolean) => {
    if (!onToggleFavorite) return
    
    try {
      await onToggleFavorite(conversationId, !currentIsFavorite)
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
    }
  }

  const handleToggleArchive = async (conversationId: string, currentIsArchived: boolean) => {
    if (!onToggleArchive) return
    
    try {
      await onToggleArchive(conversationId, !currentIsArchived)
    } catch (error) {
      console.error('보관함 토글 실패:', error)
    }
  }

  const handleConversationClick = (conversationId: string) => {
    if (onConversationClick) {
      onConversationClick(conversationId)
    }
  }

  // 로딩 상태
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">대화 목록을 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">대화 기록</h1>
          <p className="text-muted-foreground">지금까지 나눈 소중한 대화들을 확인해보세요</p>
        </div>

        {/* 에러 메시지 */}
        {state.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{state.error}</p>
            </CardContent>
          </Card>
        )}

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* 검색 */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="대화 검색..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 상태 필터 */}
              <div className="space-y-1">
                <Label htmlFor="status-filter" className="sr-only">상태 필터</Label>
                <Select 
                  value={state.filters.status}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: value as any }
                  }))}
                >
                  <SelectTrigger className="w-[120px]" id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="waiting">대기중</SelectItem>
                    <SelectItem value="active">진행중</SelectItem>
                    <SelectItem value="completed">완료됨</SelectItem>
                    <SelectItem value="expired">만료됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 카테고리 필터 */}
              <div className="space-y-1">
                <Label htmlFor="category-filter" className="sr-only">카테고리 필터</Label>
                <Select 
                  value={state.filters.category}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, category: value }
                  }))}
                >
                  <SelectTrigger className="w-[150px]" id="category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 보관함 필터 */}
              <div className="space-y-1">
                <Label htmlFor="archive-filter" className="sr-only">보관함 필터</Label>
                <Select 
                  value={state.filters.isArchived.toString()}
                  onValueChange={(value) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, isArchived: value === 'all' ? 'all' : value === 'true' }
                  }))}
                >
                  <SelectTrigger className="w-[120px]" id="archive-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="false">활성</SelectItem>
                    <SelectItem value="true">보관됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 대화 목록 */}
        {Object.keys(groupedConversations).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {state.searchQuery || 
                 state.filters.status !== 'all' || 
                 state.filters.category !== 'all' ||
                 state.filters.isArchived !== 'all' ||
                 state.filters.isFavorite !== 'all'
                  ? '검색 결과가 없어요'
                  : '아직 대화 기록이 없어요'}
              </h3>
              <p className="text-muted-foreground">
                {state.searchQuery || 
                 state.filters.status !== 'all' || 
                 state.filters.category !== 'all' ||
                 state.filters.isArchived !== 'all' ||
                 state.filters.isFavorite !== 'all'
                  ? '다른 검색어나 필터를 시도해보세요'
                  : '첫 번째 대화를 시작해보세요'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedConversations).map(([date, conversations]) => (
              <div key={date}>
                {/* 날짜 헤더 */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{date}</h2>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* 대화 카드들 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {conversations.map((conversation) => (
                    <Card 
                      key={conversation.id}
                      data-testid={`conversation-card-${conversation.id}`}
                      className={`cursor-pointer hover:shadow-lg transition-shadow relative ${
                        conversation.isArchived ? 'opacity-75' : ''
                      }`}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      {/* 카드 배지들 */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {conversation.isFavorite && (
                          <Star 
                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                            data-testid="favorite-icon"
                          />
                        )}
                        {conversation.isArchived && (
                          <Badge variant="secondary" className="text-xs">보관됨</Badge>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge 
                            variant="outline"
                            className={statusLabels[conversation.status].color}
                          >
                            {statusLabels[conversation.status].label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {conversation.questionCategory}
                          </Badge>
                        </div>
                        <CardTitle className="text-base leading-relaxed">
                          {conversation.questionContent}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* 참여자 정보 */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{conversation.participantCount}명 참여</span>
                          <span>•</span>
                          <span>{conversation.answerCount}개 답변</span>
                        </div>

                        {/* 미리보기 */}
                        {conversation.preview?.latestAnswer && (
                          <div className="bg-secondary/30 p-2 rounded text-sm">
                            <p className="text-muted-foreground mb-1">
                              최근: {conversation.preview.latestAuthor}
                            </p>
                            <p className="line-clamp-2">{conversation.preview.latestAnswer}</p>
                          </div>
                        )}

                        {/* 액션 버튼들 */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(conversation.id, conversation.isFavorite)
                            }}
                            className="flex-1 min-h-[44px]"
                            data-testid="favorite-button"
                          >
                            <Star className={`h-4 w-4 mr-1 ${
                              conversation.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                            }`} />
                            즐겨찾기
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleArchive(conversation.id, conversation.isArchived)
                            }}
                            className="flex-1 min-h-[44px]"
                            data-testid="archive-button"
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            {conversation.isArchived ? '복원' : '보관'}
                          </Button>
                        </div>

                        {/* 시간 정보 */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(conversation.lastActivityAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {state.pagination.hasMore && (
          <div className="mt-8 text-center">
            <Button
              onClick={onLoadMore}
              variant="outline"
              className="min-h-[44px] px-8"
            >
              더 보기 ({state.pagination.totalCount - filteredConversations.length}개 더)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}