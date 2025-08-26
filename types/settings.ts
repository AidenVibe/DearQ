// DearQ 앱 설정 시스템 타입 정의
// 설정 화면 아키텍처의 핵심 타입들

export type ThemeMode = 'light' | 'dark' | 'auto'
export type LanguageCode = 'ko' | 'en'
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large'
export type NotificationFrequency = 'all' | 'important' | 'none'
export type ConversationStyle = 'casual' | 'formal' | 'playful'

// 사용자 개별 설정
export interface UserSettings {
  id: string
  userId: string
  
  // 프로필 설정
  profile: {
    displayName: string
    avatar?: string
    statusMessage?: string
    birthday?: string
    favoriteEmoji: string
  }
  
  // 개인화 설정
  personalization: {
    theme: ThemeMode
    language: LanguageCode
    fontSize: FontSize
    conversationStyle: ConversationStyle
  }
  
  // 알림 설정
  notifications: {
    push: boolean
    email: boolean
    weeklyHighlight: boolean
    familyActivity: boolean
    mentions: boolean
    frequency: NotificationFrequency
    quietHours: {
      enabled: boolean
      startTime: string // HH:mm
      endTime: string // HH:mm
    }
  }
  
  // 개인 대화 설정
  conversation: {
    autoCorrect: boolean
    readReceipts: boolean
    typingIndicators: boolean
    messagePreview: boolean
    soundEffects: boolean
    vibration: boolean
  }
  
  // 주간 하이라이트 개인 설정
  weeklyHighlight: {
    enabled: boolean
    autoGenerate: boolean
    includePhotos: boolean
    includeStatistics: boolean
    shareByDefault: boolean
    reminderDay: number // 0: 일요일, 1: 월요일, ...
    reminderTime: string // HH:mm
  }
}

// 가족 공통 설정
export interface FamilySettings {
  id: string
  familyId: string
  
  // 가족 정보
  familyInfo: {
    name: string
    motto?: string
    profileImage?: string
    createdAt: Date
    timezone: string
  }
  
  // 가족 구성원 관리
  members: FamilyMember[]
  
  // 가족 대화방 설정
  conversationRules: {
    allowPhotoSharing: boolean
    allowVoiceMessages: boolean
    allowFileSharing: boolean
    maxMessageLength: number
    moderationEnabled: boolean
    autoDeleteAfterDays?: number
  }
  
  // 가족 주간 하이라이트 설정
  familyWeeklyHighlight: {
    enabled: boolean
    generationDay: number // 0: 일요일, 1: 월요일, ...
    includeAllMembers: boolean
    adminApprovalRequired: boolean
    shareExternally: boolean
  }
  
  // 가족 프라이버시 설정
  privacy: {
    allowMemberInvites: boolean
    requireAdminApproval: boolean
    externalSharingPolicy: 'none' | 'admin-only' | 'all-members'
    dataRetentionDays: number
  }
}

// 가족 구성원 정보
export interface FamilyMember {
  userId: string
  displayName: string
  role: FamilyRole
  relationship: string // '아빠', '엄마', '아들', '딸', etc.
  joinedAt: Date
  isActive: boolean
  permissions: FamilyPermissions
}

export type FamilyRole = 'admin' | 'member' | 'child'

export interface FamilyPermissions {
  canInviteMembers: boolean
  canModifySettings: boolean
  canDeleteMessages: boolean
  canManageHighlights: boolean
  canExportData: boolean
}

// 앱 전체 설정 (시스템 설정)
export interface AppSettings {
  // 성능 설정
  performance: {
    imageQuality: 'low' | 'medium' | 'high'
    autoBackup: boolean
    cacheSize: number // MB
    backgroundSync: boolean
  }
  
  // 보안 설정
  security: {
    biometricAuth: boolean
    sessionTimeout: number // minutes
    requirePasscode: boolean
    autoLockEnabled: boolean
  }
  
  // 데이터 설정
  data: {
    wifiOnlySync: boolean
    compressImages: boolean
    backupToCloud: boolean
    analyticsEnabled: boolean
  }
  
  // 접근성 설정
  accessibility: {
    highContrast: boolean
    reduceMotion: boolean
    screenReaderEnabled: boolean
    largeTextEnabled: boolean
    colorBlindSupport: boolean
  }
}

// 설정 섹션 메타데이터
export interface SettingsSection {
  id: string
  title: string
  description?: string
  icon: string
  order: number
  isVisible: boolean
  requiresAuth?: boolean
  parentSection?: string
  subsections?: SettingsSection[]
}

// 설정 항목 정의
export interface SettingItem {
  id: string
  type: SettingItemType
  title: string
  description?: string
  value: any
  defaultValue: any
  options?: SettingOption[]
  validation?: SettingValidation
  isEnabled: boolean
  isVisible: boolean
  requiresRestart?: boolean
  onChange?: (value: any) => void | Promise<void>
}

export type SettingItemType = 
  | 'toggle' 
  | 'select' 
  | 'input' 
  | 'slider' 
  | 'color' 
  | 'time' 
  | 'date' 
  | 'button' 
  | 'link'
  | 'section'

export interface SettingOption {
  value: any
  label: string
  description?: string
  isDisabled?: boolean
}

export interface SettingValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

// 설정 변경 이벤트
export interface SettingsChangeEvent {
  section: string
  itemId: string
  oldValue: any
  newValue: any
  userId: string
  timestamp: Date
}

// 설정 동기화 상태
export interface SettingsSyncState {
  isLoading: boolean
  lastSyncAt?: Date
  pendingChanges: number
  syncErrors: string[]
  isOnline: boolean
}

// 설정 백업/복원
export interface SettingsBackup {
  version: string
  createdAt: Date
  userId: string
  userSettings: UserSettings
  familySettings?: FamilySettings
  appSettings: AppSettings
  checksum: string
}

// 설정 마이그레이션
export interface SettingsMigration {
  fromVersion: string
  toVersion: string
  migrations: SettingMigrationRule[]
}

export interface SettingMigrationRule {
  path: string
  transform: (oldValue: any) => any
  isRequired: boolean
}

// Hook 반환 타입들
export interface UseSettingsReturn {
  userSettings: UserSettings | null
  familySettings: FamilySettings | null
  appSettings: AppSettings
  sections: SettingsSection[]
  syncState: SettingsSyncState
  
  // 메서드들
  updateUserSetting: (path: string, value: any) => Promise<boolean>
  updateFamilySetting: (path: string, value: any) => Promise<boolean>
  updateAppSetting: (path: string, value: any) => Promise<boolean>
  resetToDefaults: (section?: string) => Promise<boolean>
  exportSettings: () => Promise<SettingsBackup>
  importSettings: (backup: SettingsBackup) => Promise<boolean>
  syncWithServer: () => Promise<boolean>
}

// 설정 컨텍스트 타입
export interface SettingsContextValue extends UseSettingsReturn {
  isInitialized: boolean
  error: string | null
  clearError: () => void
}

// 설정 관련 에러 타입
export class SettingsError extends Error {
  constructor(
    message: string,
    public code: SettingsErrorCode,
    public section?: string,
    public itemId?: string
  ) {
    super(message)
    this.name = 'SettingsError'
  }
}

export type SettingsErrorCode = 
  | 'INVALID_VALUE'
  | 'PERMISSION_DENIED'
  | 'SYNC_FAILED'
  | 'VALIDATION_FAILED'
  | 'BACKUP_FAILED'
  | 'MIGRATION_FAILED'
  | 'STORAGE_ERROR'

// 기본값들
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'userId'> = {
  profile: {
    displayName: '',
    favoriteEmoji: '😊'
  },
  personalization: {
    theme: 'auto',
    language: 'ko',
    fontSize: 'medium',
    conversationStyle: 'casual'
  },
  notifications: {
    push: true,
    email: false,
    weeklyHighlight: true,
    familyActivity: true,
    mentions: true,
    frequency: 'important',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  },
  conversation: {
    autoCorrect: true,
    readReceipts: true,
    typingIndicators: true,
    messagePreview: true,
    soundEffects: true,
    vibration: true
  },
  weeklyHighlight: {
    enabled: true,
    autoGenerate: true,
    includePhotos: true,
    includeStatistics: true,
    shareByDefault: false,
    reminderDay: 0,
    reminderTime: '19:00'
  }
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  performance: {
    imageQuality: 'medium',
    autoBackup: true,
    cacheSize: 100,
    backgroundSync: true
  },
  security: {
    biometricAuth: false,
    sessionTimeout: 30,
    requirePasscode: false,
    autoLockEnabled: false
  },
  data: {
    wifiOnlySync: false,
    compressImages: true,
    backupToCloud: true,
    analyticsEnabled: true
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    screenReaderEnabled: false,
    largeTextEnabled: false,
    colorBlindSupport: false
  }
}