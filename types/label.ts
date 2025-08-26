// 라벨 상태 타입
export type LabelStatus = 'pending' | 'confirmed' | 'blocked'

// 가족 라벨 인터페이스
export interface FamilyLabel {
  id: string
  name: string           // 표시명 (엄마, 아빠, 누나 등)
  nickname?: string      // 실제 닉네임 (선택사항)
  phone?: string         // 전화번호 (검증용, 해시화됨)
  status: LabelStatus    // 라벨 상태
  avatar?: string        // 아바타 이미지 URL
  createdAt: Date
  updatedAt: Date
  isRecent?: boolean     // 최근 사용된 라벨인지
  lastUsedAt?: Date      // 마지막 사용 시간
}

// 라벨 생성 요청
export interface CreateLabelRequest {
  name: string
  nickname?: string
  phone?: string
}

// 라벨 수정 요청  
export interface UpdateLabelRequest {
  name?: string
  nickname?: string
  phone?: string
  status?: LabelStatus
}

// 보내기 요청 데이터
export interface SendRequest {
  questionId: string
  labelId: string
  recipientName: string  // 수신자 표시명
}

// 보내기 응답 데이터
export interface SendResponse {
  shareToken: string     // 1회용 공유 토큰
  shareUrl: string       // 공유용 URL
  expiresAt: string      // 만료 시간 (ISO string)
  recipient: {
    labelId: string
    name: string
  }
}

// 공유 방법 타입
export type ShareMethod = 'kakao-talk' | 'kakao-link' | 'copy-url' | 'sms'

// 공유 옵션
export interface ShareOptions {
  method: ShareMethod
  url: string
  message?: string
  recipient: string
}