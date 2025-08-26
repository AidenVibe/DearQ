// 답변 관련 타입 정의

export interface ReceivedQuestion {
  id: string
  content: string
  category: string
  senderName: string
  shareToken: string
  expiresAt: string
  isExpired: boolean
}

export interface AnswerSubmission {
  questionId: string
  shareToken: string
  content: string
  authorName: string
}

export interface AnswerResponse {
  conversationId: string
  message: string
  canViewConversation: boolean
}

// 토큰 상태
export type TokenStatus = 'valid' | 'expired' | 'invalid' | 'used'

export interface TokenValidation {
  status: TokenStatus
  question?: ReceivedQuestion
  error?: string
}

// 답변 제한사항
export const ANSWER_CONSTRAINTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 800,
  REQUIRED_FIELDS: ['content', 'authorName'] as const
} as const

export type AnswerConstraintKey = keyof typeof ANSWER_CONSTRAINTS