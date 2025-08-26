// 주간 하이라이트 시스템 타입 정의

export interface WeeklyHighlight {
  id: string
  userId: string
  weekStart: string // ISO string, 해당 주 일요일 00:00
  weekEnd: string   // ISO string, 해당 주 토요일 23:59
  generatedAt: string
  statistics: WeeklyStatistics
  familyHighlights: FamilyHighlight[]
  shareData: WeeklyShareData
  status: WeeklyHighlightStatus
}

export interface WeeklyStatistics {
  totalConversations: number
  totalAnswers: number
  completedConversations: number
  averageResponseTime: number // 시간 (hours)
  responseRate: number // 0-1 범위의 응답률
  participatingFamilies: number
  mostActiveDay: string // 'monday' | 'tuesday' | ... 
  conversationsByDay: DailyConversationCount[]
}

export interface DailyConversationCount {
  date: string // ISO date string
  count: number
  dayOfWeek: string // 'sunday' | 'monday' | ...
}

export interface FamilyHighlight {
  familyName: string
  conversationCount: number
  responseRate: number
  bestConversations: BestConversation[]
  relationshipType: string
  lastActiveAt: string
}

export interface BestConversation {
  id: string
  questionContent: string
  questionCategory: string
  participantCount: number
  totalAnswers: number
  engagementScore: number // 참여도 점수 (0-100)
  createdAt: string
  preview: {
    snippet: string
    authorName: string
  }
}

export interface WeeklyShareData {
  title: string
  description: string
  imageUrl?: string
  shareText: string
  hashtags: string[]
  metadata: ShareMetadata
}

export interface ShareMetadata {
  ogTitle: string
  ogDescription: string
  ogImage?: string
  twitterCard: string
  kakaoTemplate?: KakaoShareTemplate
}

export interface KakaoShareTemplate {
  objectType: 'feed'
  content: {
    title: string
    description: string
    imageUrl?: string
    link: {
      webUrl: string
      mobileWebUrl: string
    }
  }
  buttons?: Array<{
    title: string
    link: {
      webUrl: string
      mobileWebUrl: string
    }
  }>
}

export type WeeklyHighlightStatus = 'generating' | 'ready' | 'shared' | 'expired'

export interface WeeklyHighlightState {
  currentWeek: WeeklyHighlight | null
  previousWeeks: WeeklyHighlight[]
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  shareStatus: ShareStatus
  filters: WeeklyFilters
}

export interface WeeklyFilters {
  weekRange: WeekRange
  familyFilter: string | 'all'
  showEmptyWeeks: boolean
}

export interface WeekRange {
  startWeek: string // ISO week start date
  endWeek: string   // ISO week start date
}

export type ShareStatus = 'idle' | 'generating-image' | 'sharing' | 'completed' | 'failed'

export interface WeeklyHighlightResponse {
  highlight: WeeklyHighlight
  hasData: boolean
  minimumConversations: number
  nextGenerationDate: string
}

export interface WeeklyHighlightListResponse {
  highlights: WeeklyHighlight[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
  filters: WeeklyFilters
}

export interface ShareImageOptions {
  format: 'png' | 'jpeg'
  quality: number // 0-1
  width: number
  height: number
  theme: 'light' | 'dark'
  includeStats: boolean
  includeBestConversations: boolean
}

export interface WeeklyImageData {
  dataUrl: string
  blob: Blob
  filename: string
  size: number
}

export interface WeeklyEngagementMetrics {
  weeklyGrowth: number // -1 to 1, 전주 대비 증감률
  longestStreak: number // 연속 대화 일수
  favoriteCategory: string
  peakActivityHour: number // 0-23 시간
  familyEngagementRanking: Array<{
    familyName: string
    engagementScore: number
    rank: number
  }>
}

export interface WeeklyInsight {
  type: 'achievement' | 'suggestion' | 'milestone' | 'celebration'
  title: string
  description: string
  iconName: string
  actionText?: string
  actionUrl?: string
}

export interface WeeklyRecommendation {
  targetFamily: string
  suggestedQuestionCategories: string[]
  rationale: string
  priority: 'high' | 'medium' | 'low'
}

export interface WeeklyHighlightConfig {
  minimumConversationsForHighlight: number
  bestConversationLimit: number
  generationDay: number // 0=Sunday, 1=Monday, ...
  generationHour: number // 0-23
  retentionDays: number
  autoShareEnabled: boolean
  includeEmptyWeeks: boolean
}

// 유틸리티 타입들
export interface WeekBoundary {
  start: Date
  end: Date
  weekNumber: number
  year: number
}

export interface ConversationScoring {
  participantMultiplier: number
  lengthWeight: number
  timeDecayFactor: number
  categoryBonus: Record<string, number>
}

// 이벤트 타입들
export interface WeeklyHighlightEvents {
  'weekly_highlight_view': {
    weekStart: string
    hasData: boolean
    conversationCount: number
  }
  'weekly_highlight_generate': {
    weekStart: string
    generationTime: number
    conversationCount: number
  }
  'weekly_highlight_share': {
    weekStart: string
    shareChannel: 'kakao' | 'instagram' | 'facebook' | 'download'
    shareFormat: 'image' | 'text' | 'link'
  }
  'weekly_best_conversation_click': {
    conversationId: string
    familyName: string
    rank: number
  }
}