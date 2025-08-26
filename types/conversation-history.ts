// 대화 히스토리 시스템 타입 정의

export interface ConversationHistoryItem {
  id: string
  questionId: string
  questionContent: string
  questionCategory: string
  participantCount: number
  answerCount: number
  status: ConversationStatus
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  isArchived: boolean
  isFavorite: boolean
  participants: ConversationParticipantSummary[]
  preview?: ConversationPreview
}

export interface ConversationParticipantSummary {
  id: string
  name: string
  hasAnswered: boolean
  lastActivityAt?: string
}

export interface ConversationPreview {
  latestAnswer?: string
  latestAuthor?: string
  totalAnswers: number
  completedCount: number
  pendingCount: number
}

export type ConversationStatus = 'waiting' | 'active' | 'completed' | 'expired'

export interface ConversationHistoryState {
  conversations: ConversationHistoryItem[]
  isLoading: boolean
  error: string | null
  filters: ConversationFilters
  pagination: PaginationState
  searchQuery: string
  selectedConversation: ConversationHistoryItem | null
  viewMode: ConversationViewMode
}

export interface ConversationFilters {
  status: ConversationStatus | 'all'
  category: string | 'all'
  dateRange: DateRange
  participantFilter: string | 'all'
  isArchived: boolean | 'all'
  isFavorite: boolean | 'all'
}

export type ConversationViewMode = 'list' | 'grid' | 'timeline'

export interface DateRange {
  startDate: string | null
  endDate: string | null
  preset: DateRangePreset | null
}

export type DateRangePreset = 
  | 'today'
  | 'yesterday' 
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'custom'

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

export interface ConversationHistoryResponse {
  conversations: ConversationHistoryItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
  filters: ConversationFilters
}

export interface ConversationArchiveAction {
  conversationId: string
  isArchived: boolean
}

export interface ConversationFavoriteAction {
  conversationId: string
  isFavorite: boolean
}

export interface ConversationBulkAction {
  conversationIds: string[]
  action: BulkActionType
}

export type BulkActionType = 
  | 'archive'
  | 'unarchive'
  | 'favorite'
  | 'unfavorite'
  | 'delete'

export interface ConversationStatistics {
  totalConversations: number
  activeConversations: number
  completedConversations: number
  archivedConversations: number
  favoriteConversations: number
  conversationsByCategory: Record<string, number>
  conversationsByMonth: Array<{
    month: string
    count: number
  }>
  mostActiveParticipants: Array<{
    name: string
    participationCount: number
  }>
}