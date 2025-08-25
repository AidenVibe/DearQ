// 사용자 인터페이스
export interface User {
  id: string
  nickname: string
  profile_image?: string
  email?: string
  provider?: 'kakao'
  createdAt?: Date
  updatedAt?: Date
}

// 홈 화면 상태
export interface HomeState {
  hasSent: boolean
  hasAnswered: boolean
  canViewConversation: boolean
}