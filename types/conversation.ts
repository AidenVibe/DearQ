// 대화 관련 타입 정의

export interface ConversationQuestion {
  id: string
  content: string
  category: string
  date: string
}

export interface ConversationAnswer {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  isOwn: boolean
}

export interface ConversationParticipant {
  id: string
  name: string
  hasAnswered: boolean
}

export interface Conversation {
  id: string
  question: ConversationQuestion
  answers: ConversationAnswer[]
  participants: ConversationParticipant[]
  status: ConversationStatus
  createdAt: string
  updatedAt: string
  canViewAll: boolean // 자기표현 게이트 통과 여부
}

export type ConversationStatus = 'waiting' | 'active' | 'completed'

// 자기표현 게이트 상태
export type SelfExpressionGateStatus = 'locked' | 'unlocked' | 'completed'

export interface SelfExpressionGate {
  status: SelfExpressionGateStatus
  userHasAnswered: boolean
  canViewOthersAnswers: boolean
  requiresOwnAnswer: boolean
}

// 자기 답변 제출
export interface SelfAnswerSubmission {
  conversationId: string
  content: string
  authorName: string
}

export interface SelfAnswerResponse {
  answerId: string
  conversationId: string
  message: string
  unlockedAnswers?: ConversationAnswer[]
}

// 축하 애니메이션 설정
export interface CelebrationConfig {
  show: boolean
  type: 'connection' | 'completion'
  duration: number
  message: string
}

// 대화 로딩 상태
export type ConversationLoadingState = 'loading' | 'loaded' | 'error' | 'not-found' | 'unauthorized'

export interface ConversationPageState {
  loadingState: ConversationLoadingState
  conversation: Conversation | null
  selfExpressionGate: SelfExpressionGate
  celebration: CelebrationConfig
  error: string | null
}