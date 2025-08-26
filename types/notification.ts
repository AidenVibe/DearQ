// DearQ 푸시 알림 시스템 타입 정의
// 포괄적인 알림 관리 시스템의 핵심 타입들

export type NotificationType = 
  | 'message'           // 가족 메시지
  | 'weekly-highlight'  // 주간 하이라이트  
  | 'family-event'      // 가족 이벤트
  | 'reminder'          // 리마인더
  | 'system'            // 시스템 알림

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
export type NotificationPermissionState = 'default' | 'granted' | 'denied'

// 기본 알림 인터페이스
export interface BaseNotification {
  id: string
  userId: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  
  // 알림 내용
  title: string
  body: string
  icon?: string
  image?: string
  badge?: string
  
  // 메타데이터
  createdAt: Date
  scheduledAt?: Date
  deliveredAt?: Date
  readAt?: Date
  expiresAt?: Date
  
  // 액션 및 네비게이션
  actions?: NotificationAction[]
  clickAction?: string // URL to navigate to
  tag?: string // 그룹화를 위한 태그
  
  // 플랫폼별 설정
  platform?: NotificationPlatform
  data?: Record<string, any>
}

// 알림 액션 버튼
export interface NotificationAction {
  id: string
  title: string
  icon?: string
  action: string // 'reply', 'like', 'dismiss', etc.
  input?: boolean // 텍스트 입력 가능 여부
  placeholder?: string
}

// 플랫폼별 알림 설정
export interface NotificationPlatform {
  web?: WebNotificationOptions
  mobile?: MobileNotificationOptions
}

export interface WebNotificationOptions {
  silent?: boolean
  vibrate?: number[]
  requireInteraction?: boolean
  renotify?: boolean
  timestamp?: number
}

export interface MobileNotificationOptions {
  sound?: string
  channelId?: string
  category?: string
  threadId?: string
}

// 메시지 알림 (가족 메시지)
export interface MessageNotification extends BaseNotification {
  type: 'message'
  messageId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  conversationId: string
  conversationName?: string
  messagePreview: string
  attachmentCount?: number
  isGroupMessage: boolean
}

// 주간 하이라이트 알림
export interface WeeklyHighlightNotification extends BaseNotification {
  type: 'weekly-highlight'
  highlightId: string
  weekStart: string
  weekEnd: string
  highlightType: 'generated' | 'shared' | 'reminder'
  familyMemberCount: number
  conversationCount: number
  photoCount?: number
}

// 가족 이벤트 알림
export interface FamilyEventNotification extends BaseNotification {
  type: 'family-event'
  eventType: 'birthday' | 'anniversary' | 'milestone' | 'custom'
  eventDate: Date
  celebrantId?: string
  celebrantName?: string
  eventTitle: string
  eventDescription?: string
  daysUntilEvent?: number
}

// 리마인더 알림
export interface ReminderNotification extends BaseNotification {
  type: 'reminder'
  reminderType: 'reply' | 'call' | 'task' | 'custom'
  originalMessageId?: string
  targetUserId?: string
  targetUserName?: string
  reminderText: string
  isRecurring: boolean
  recurringPattern?: RecurringPattern
}

// 시스템 알림
export interface SystemNotification extends BaseNotification {
  type: 'system'
  systemType: 'update' | 'maintenance' | 'security' | 'feature' | 'policy'
  version?: string
  updateRequired?: boolean
  actionRequired?: boolean
  actionDeadline?: Date
}

// 반복 패턴
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number // 매 N일/주/월/년
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number
  endDate?: Date
  maxOccurrences?: number
}

// 알림 구독 정보
export interface NotificationSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  platform: 'web' | 'android' | 'ios'
  userAgent: string
  createdAt: Date
  lastUsedAt: Date
  isActive: boolean
}

// 알림 설정 (기존 settings.ts와 연동)
export interface NotificationPreferences {
  enabled: boolean
  types: {
    [K in NotificationType]: {
      enabled: boolean
      priority: NotificationPriority
      sound: boolean
      vibration: boolean
      showPreview: boolean
      actions: boolean
    }
  }
  
  // 시간 제한
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string // HH:mm
    timezone?: string
  }
  
  // 그룹화 설정
  grouping: {
    enabled: boolean
    maxGroupSize: number
    groupTimeout: number // minutes
  }
  
  // 배지 설정
  badge: {
    enabled: boolean
    showCount: boolean
    maxCount: number
  }
  
  // 개인정보 보호
  privacy: {
    showContentOnLockScreen: boolean
    showSenderInfo: boolean
    anonymizeContent: boolean
  }
}

// 알림 매니저 상태
export interface NotificationManagerState {
  permission: NotificationPermissionState
  isSupported: boolean
  isSubscribed: boolean
  subscription: NotificationSubscription | null
  
  // 알림 목록
  notifications: BaseNotification[]
  unreadCount: number
  activeNotifications: string[] // 현재 표시중인 알림 ID들
  
  // 로딩 상태
  isLoading: boolean
  error: string | null
  
  // 동기화 상태
  lastSyncAt?: Date
  syncErrors: string[]
}

// 알림 템플릿
export interface NotificationTemplate {
  id: string
  type: NotificationType
  name: string
  description?: string
  
  // 템플릿 내용
  titleTemplate: string
  bodyTemplate: string
  iconUrl?: string
  imageUrl?: string
  
  // 템플릿 변수
  variables: NotificationVariable[]
  
  // 기본 설정
  defaultPriority: NotificationPriority
  defaultActions?: NotificationAction[]
  
  // 조건부 로직
  conditions?: NotificationCondition[]
}

export interface NotificationVariable {
  name: string
  type: 'string' | 'number' | 'date' | 'user' | 'url'
  required: boolean
  description?: string
  defaultValue?: any
}

export interface NotificationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists'
  value: any
}

// 알림 통계
export interface NotificationStats {
  userId: string
  period: {
    startDate: Date
    endDate: Date
  }
  
  // 전송 통계
  totalSent: number
  totalDelivered: number
  totalRead: number
  totalClicked: number
  
  // 타입별 통계
  byType: {
    [K in NotificationType]: {
      sent: number
      delivered: number
      read: number
      clicked: number
      averageReadTime?: number // seconds
    }
  }
  
  // 시간대별 통계
  byHour: number[]
  byDayOfWeek: number[]
  
  // 성능 지표
  deliveryRate: number // delivered / sent
  readRate: number // read / delivered
  clickThroughRate: number // clicked / delivered
}

// 알림 규칙 (자동화)
export interface NotificationRule {
  id: string
  name: string
  description?: string
  isActive: boolean
  
  // 트리거 조건
  triggers: NotificationTrigger[]
  
  // 알림 템플릿
  templateId: string
  templateData?: Record<string, any>
  
  // 제한 조건
  limits?: NotificationLimits
  
  // 대상자
  targetUsers?: string[]
  targetRoles?: string[]
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface NotificationTrigger {
  type: 'message_received' | 'highlight_generated' | 'event_approaching' | 'inactivity' | 'custom'
  conditions: Record<string, any>
  delay?: number // minutes
}

export interface NotificationLimits {
  maxPerHour?: number
  maxPerDay?: number
  cooldownMinutes?: number
  skipIfRecentlySent?: boolean
}

// Hook 반환 타입
export interface UseNotificationsReturn {
  // 상태
  ...NotificationManagerState
  
  // 알림 관리
  requestPermission: () => Promise<NotificationPermissionState>
  subscribe: () => Promise<NotificationSubscription | null>
  unsubscribe: () => Promise<boolean>
  
  // 알림 발송
  showNotification: (notification: Partial<BaseNotification>) => Promise<string | null>
  scheduleNotification: (notification: Partial<BaseNotification>, scheduleTime: Date) => Promise<string | null>
  cancelNotification: (id: string) => Promise<boolean>
  
  // 알림 관리
  markAsRead: (id: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  clearNotification: (id: string) => Promise<boolean>
  clearAllNotifications: () => Promise<boolean>
  
  // 설정 관리
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>
  
  // 통계 및 분석
  getStats: (period?: { start: Date; end: Date }) => Promise<NotificationStats>
  
  // 유틸리티
  refreshNotifications: () => Promise<boolean>
  syncWithServer: () => Promise<boolean>
  clearError: () => void
}

// 서비스 워커 메시지 타입
export interface ServiceWorkerMessage {
  type: 'notification-clicked' | 'notification-closed' | 'action-clicked' | 'sync-notifications'
  data?: {
    notificationId?: string
    actionId?: string
    inputValue?: string
    [key: string]: any
  }
}

// 에러 타입
export class NotificationError extends Error {
  constructor(
    message: string,
    public code: NotificationErrorCode,
    public notificationId?: string
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

export type NotificationErrorCode =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'SUBSCRIPTION_FAILED'
  | 'SEND_FAILED'
  | 'INVALID_TEMPLATE'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'PARSING_ERROR'

// 기본값들
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    message: {
      enabled: true,
      priority: 'high',
      sound: true,
      vibration: true,
      showPreview: true,
      actions: true
    },
    'weekly-highlight': {
      enabled: true,
      priority: 'normal',
      sound: false,
      vibration: false,
      showPreview: true,
      actions: true
    },
    'family-event': {
      enabled: true,
      priority: 'high',
      sound: true,
      vibration: true,
      showPreview: true,
      actions: false
    },
    reminder: {
      enabled: true,
      priority: 'normal',
      sound: true,
      vibration: false,
      showPreview: true,
      actions: true
    },
    system: {
      enabled: true,
      priority: 'low',
      sound: false,
      vibration: false,
      showPreview: false,
      actions: false
    }
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  grouping: {
    enabled: true,
    maxGroupSize: 5,
    groupTimeout: 5
  },
  badge: {
    enabled: true,
    showCount: true,
    maxCount: 99
  },
  privacy: {
    showContentOnLockScreen: true,
    showSenderInfo: true,
    anonymizeContent: false
  }
}

// 미리 정의된 템플릿들
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'family_message',
    type: 'message',
    name: '가족 메시지',
    titleTemplate: '{{senderName}}님의 메시지',
    bodyTemplate: '{{messagePreview}}',
    variables: [
      { name: 'senderName', type: 'string', required: true },
      { name: 'messagePreview', type: 'string', required: true }
    ],
    defaultPriority: 'high',
    defaultActions: [
      { id: 'reply', title: '답장', action: 'reply', input: true, placeholder: '답장을 입력하세요...' },
      { id: 'like', title: '👍', action: 'like' }
    ]
  },
  {
    id: 'weekly_highlight_ready',
    type: 'weekly-highlight',
    name: '주간 하이라이트 완성',
    titleTemplate: '이번 주 하이라이트가 준비되었어요!',
    bodyTemplate: '{{weekStart}}~{{weekEnd}} 가족의 소중한 순간들을 확인해보세요',
    variables: [
      { name: 'weekStart', type: 'date', required: true },
      { name: 'weekEnd', type: 'date', required: true }
    ],
    defaultPriority: 'normal',
    defaultActions: [
      { id: 'view', title: '보기', action: 'view' },
      { id: 'share', title: '공유', action: 'share' }
    ]
  },
  {
    id: 'birthday_reminder',
    type: 'family-event',
    name: '생일 알림',
    titleTemplate: '{{celebrantName}}님의 생일이에요! 🎉',
    bodyTemplate: '축하 메시지를 보내어 특별한 날을 함께 해주세요',
    variables: [
      { name: 'celebrantName', type: 'string', required: true }
    ],
    defaultPriority: 'high',
    defaultActions: [
      { id: 'congratulate', title: '축하하기', action: 'congratulate' }
    ]
  }
]