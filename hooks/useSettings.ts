import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  UserSettings, 
  FamilySettings, 
  AppSettings, 
  SettingsSection,
  SettingsSyncState,
  UseSettingsReturn,
  SettingsBackup,
  SettingsError,
  DEFAULT_USER_SETTINGS,
  DEFAULT_APP_SETTINGS
} from '@/types/settings'

// 설정 저장소 관리 유틸리티
class SettingsStorage {
  private static readonly STORAGE_KEYS = {
    USER_SETTINGS: 'dearq_user_settings',
    FAMILY_SETTINGS: 'dearq_family_settings', 
    APP_SETTINGS: 'dearq_app_settings',
    LAST_SYNC: 'dearq_settings_last_sync'
  }

  static async loadUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEYS.USER_SETTINGS}_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { 
          ...DEFAULT_USER_SETTINGS, 
          ...parsed,
          id: parsed.id || crypto.randomUUID(),
          userId 
        }
      }
      return null
    } catch (error) {
      console.error('사용자 설정 로드 실패:', error)
      return null
    }
  }

  static async saveUserSettings(settings: UserSettings): Promise<boolean> {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEYS.USER_SETTINGS}_${settings.userId}`,
        JSON.stringify(settings)
      )
      return true
    } catch (error) {
      console.error('사용자 설정 저장 실패:', error)
      return false
    }
  }

  static async loadFamilySettings(familyId: string): Promise<FamilySettings | null> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEYS.FAMILY_SETTINGS}_${familyId}`)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('가족 설정 로드 실패:', error)
      return null
    }
  }

  static async saveFamilySettings(settings: FamilySettings): Promise<boolean> {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEYS.FAMILY_SETTINGS}_${settings.familyId}`,
        JSON.stringify(settings)
      )
      return true
    } catch (error) {
      console.error('가족 설정 저장 실패:', error)
      return false
    }
  }

  static async loadAppSettings(): Promise<AppSettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.APP_SETTINGS)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_APP_SETTINGS, ...parsed }
      }
      return DEFAULT_APP_SETTINGS
    } catch (error) {
      console.error('앱 설정 로드 실패:', error)
      return DEFAULT_APP_SETTINGS
    }
  }

  static async saveAppSettings(settings: AppSettings): Promise<boolean> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('앱 설정 저장 실패:', error)
      return false
    }
  }

  static getLastSyncTime(): Date | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC)
      return stored ? new Date(stored) : null
    } catch {
      return null
    }
  }

  static setLastSyncTime(time: Date): void {
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, time.toISOString())
  }
}

// 설정 섹션 정의
const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'profile',
    title: '프로필',
    description: '개인 프로필 및 상태 메시지 관리',
    icon: 'user',
    order: 1,
    isVisible: true
  },
  {
    id: 'personalization', 
    title: '개인화',
    description: '테마, 언어, 폰트 등 개인 맞춤 설정',
    icon: 'palette',
    order: 2,
    isVisible: true
  },
  {
    id: 'notifications',
    title: '알림',
    description: '푸시 알림, 이메일 알림 설정',
    icon: 'bell',
    order: 3,
    isVisible: true
  },
  {
    id: 'conversation',
    title: '대화',
    description: '메시지, 읽음 표시 등 대화 관련 설정',
    icon: 'message-circle',
    order: 4,
    isVisible: true
  },
  {
    id: 'weeklyHighlight',
    title: '주간 하이라이트',
    description: '주간 하이라이트 생성 및 공유 설정',
    icon: 'star',
    order: 5,
    isVisible: true
  },
  {
    id: 'family',
    title: '가족 관리',
    description: '가족 구성원 및 공통 설정 관리',
    icon: 'users',
    order: 6,
    isVisible: true,
    requiresAuth: true
  },
  {
    id: 'performance',
    title: '성능',
    description: '이미지 품질, 캐시, 백업 등 성능 설정',
    icon: 'zap',
    order: 7,
    isVisible: true
  },
  {
    id: 'security',
    title: '보안',
    description: '생체 인증, 세션, 자동 잠금 설정',
    icon: 'shield',
    order: 8,
    isVisible: true
  },
  {
    id: 'data',
    title: '데이터',
    description: '동기화, 압축, 백업 등 데이터 관리',
    icon: 'database',
    order: 9,
    isVisible: true
  },
  {
    id: 'accessibility',
    title: '접근성',
    description: '고대비, 큰 글씨 등 접근성 기능',
    icon: 'accessibility',
    order: 10,
    isVisible: true
  }
]

/**
 * 설정 관리 훅
 * 사용자, 가족, 앱 설정을 통합적으로 관리합니다.
 */
export function useSettings(userId?: string, familyId?: string): UseSettingsReturn {
  // 상태 관리
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [familySettings, setFamilySettings] = useState<FamilySettings | null>(null)
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [syncState, setSyncState] = useState<SettingsSyncState>({
    isLoading: false,
    pendingChanges: 0,
    syncErrors: [],
    isOnline: navigator.onLine
  })
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // 변경사항 추적을 위한 Ref
  const pendingChanges = useRef<Set<string>>(new Set())

  // 설정 로드
  const loadSettings = useCallback(async () => {
    if (!userId) return

    try {
      setSyncState(prev => ({ ...prev, isLoading: true, syncErrors: [] }))
      
      // 병렬로 설정 로드
      const [userSettingsData, familySettingsData, appSettingsData] = await Promise.all([
        SettingsStorage.loadUserSettings(userId),
        familyId ? SettingsStorage.loadFamilySettings(familyId) : Promise.resolve(null),
        SettingsStorage.loadAppSettings()
      ])

      // 사용자 설정이 없으면 기본값으로 초기화
      if (!userSettingsData) {
        const newUserSettings: UserSettings = {
          ...DEFAULT_USER_SETTINGS,
          id: crypto.randomUUID(),
          userId
        }
        await SettingsStorage.saveUserSettings(newUserSettings)
        setUserSettings(newUserSettings)
      } else {
        setUserSettings(userSettingsData)
      }

      setFamilySettings(familySettingsData)
      setAppSettings(appSettingsData)
      
      setSyncState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastSyncAt: SettingsStorage.getLastSyncTime() || undefined
      }))
      
      setIsInitialized(true)
    } catch (err) {
      console.error('설정 로드 실패:', err)
      setError('설정을 불러오는 중 오류가 발생했습니다.')
      setSyncState(prev => ({ 
        ...prev, 
        isLoading: false,
        syncErrors: [...prev.syncErrors, '설정 로드 실패']
      }))
    }
  }, [userId, familyId])

  // 객체 경로로 값 설정하는 유틸리티
  const setNestedValue = useCallback((obj: any, path: string, value: any): any => {
    const keys = path.split('.')
    const result = { ...obj }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      current[key] = { ...current[key] }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
    return result
  }, [])

  // 사용자 설정 업데이트
  const updateUserSetting = useCallback(async (path: string, value: any): Promise<boolean> => {
    if (!userSettings) return false

    try {
      const updatedSettings = setNestedValue(userSettings, path, value)
      setUserSettings(updatedSettings)
      
      const saved = await SettingsStorage.saveUserSettings(updatedSettings)
      if (saved) {
        pendingChanges.current.add(`user.${path}`)
        setSyncState(prev => ({ ...prev, pendingChanges: pendingChanges.current.size }))
        setError(null)
      }
      
      return saved
    } catch (err) {
      console.error('사용자 설정 업데이트 실패:', err)
      setError('설정 저장에 실패했습니다.')
      return false
    }
  }, [userSettings, setNestedValue])

  // 가족 설정 업데이트  
  const updateFamilySetting = useCallback(async (path: string, value: any): Promise<boolean> => {
    if (!familySettings) return false

    try {
      const updatedSettings = setNestedValue(familySettings, path, value)
      setFamilySettings(updatedSettings)
      
      const saved = await SettingsStorage.saveFamilySettings(updatedSettings)
      if (saved) {
        pendingChanges.current.add(`family.${path}`)
        setSyncState(prev => ({ ...prev, pendingChanges: pendingChanges.current.size }))
        setError(null)
      }
      
      return saved
    } catch (err) {
      console.error('가족 설정 업데이트 실패:', err)
      setError('가족 설정 저장에 실패했습니다.')
      return false
    }
  }, [familySettings, setNestedValue])

  // 앱 설정 업데이트
  const updateAppSetting = useCallback(async (path: string, value: any): Promise<boolean> => {
    try {
      const updatedSettings = setNestedValue(appSettings, path, value)
      setAppSettings(updatedSettings)
      
      const saved = await SettingsStorage.saveAppSettings(updatedSettings)
      if (saved) {
        pendingChanges.current.add(`app.${path}`)
        setSyncState(prev => ({ ...prev, pendingChanges: pendingChanges.current.size }))
        setError(null)
      }
      
      return saved
    } catch (err) {
      console.error('앱 설정 업데이트 실패:', err)
      setError('앱 설정 저장에 실패했습니다.')
      return false
    }
  }, [appSettings, setNestedValue])

  // 기본값으로 재설정
  const resetToDefaults = useCallback(async (section?: string): Promise<boolean> => {
    try {
      if (!section) {
        // 모든 설정 초기화
        if (userSettings) {
          const resetUserSettings = { 
            ...DEFAULT_USER_SETTINGS, 
            id: userSettings.id, 
            userId: userSettings.userId 
          }
          setUserSettings(resetUserSettings)
          await SettingsStorage.saveUserSettings(resetUserSettings)
        }
        
        setAppSettings(DEFAULT_APP_SETTINGS)
        await SettingsStorage.saveAppSettings(DEFAULT_APP_SETTINGS)
        
        pendingChanges.current.clear()
        setSyncState(prev => ({ ...prev, pendingChanges: 0 }))
        return true
      }

      // 특정 섹션만 초기화
      if (userSettings && ['profile', 'personalization', 'notifications', 'conversation', 'weeklyHighlight'].includes(section)) {
        const defaultSection = (DEFAULT_USER_SETTINGS as any)[section]
        return updateUserSetting(section, defaultSection)
      }

      if (['performance', 'security', 'data', 'accessibility'].includes(section)) {
        const defaultSection = (DEFAULT_APP_SETTINGS as any)[section]  
        return updateAppSetting(section, defaultSection)
      }

      return false
    } catch (err) {
      console.error('설정 초기화 실패:', err)
      setError('설정 초기화에 실패했습니다.')
      return false
    }
  }, [userSettings, updateUserSetting, updateAppSetting])

  // 설정 내보내기
  const exportSettings = useCallback(async (): Promise<SettingsBackup> => {
    const backup: SettingsBackup = {
      version: '1.0.0',
      createdAt: new Date(),
      userId: userSettings?.userId || 'anonymous',
      userSettings: userSettings || { 
        ...DEFAULT_USER_SETTINGS, 
        id: crypto.randomUUID(), 
        userId: 'anonymous' 
      },
      familySettings: familySettings || undefined,
      appSettings,
      checksum: crypto.randomUUID() // 실제로는 설정 데이터의 해시값 사용
    }
    
    return backup
  }, [userSettings, familySettings, appSettings])

  // 설정 가져오기
  const importSettings = useCallback(async (backup: SettingsBackup): Promise<boolean> => {
    try {
      if (backup.userSettings && userId) {
        const importedUserSettings = { 
          ...backup.userSettings, 
          id: crypto.randomUUID(), 
          userId 
        }
        setUserSettings(importedUserSettings)
        await SettingsStorage.saveUserSettings(importedUserSettings)
      }

      if (backup.familySettings && familyId) {
        const importedFamilySettings = { 
          ...backup.familySettings, 
          id: crypto.randomUUID(),
          familyId 
        }
        setFamilySettings(importedFamilySettings)
        await SettingsStorage.saveFamilySettings(importedFamilySettings)
      }

      setAppSettings(backup.appSettings)
      await SettingsStorage.saveAppSettings(backup.appSettings)

      return true
    } catch (err) {
      console.error('설정 가져오기 실패:', err)
      setError('설정 가져오기에 실패했습니다.')
      return false
    }
  }, [userId, familyId])

  // 서버 동기화 (실제 구현에서는 API 호출)
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    try {
      setSyncState(prev => ({ ...prev, isLoading: true, syncErrors: [] }))
      
      // 실제 구현에서는 서버 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      pendingChanges.current.clear()
      SettingsStorage.setLastSyncTime(new Date())
      
      setSyncState(prev => ({ 
        ...prev, 
        isLoading: false,
        pendingChanges: 0,
        lastSyncAt: new Date()
      }))
      
      return true
    } catch (err) {
      console.error('서버 동기화 실패:', err)
      setSyncState(prev => ({ 
        ...prev, 
        isLoading: false,
        syncErrors: [...prev.syncErrors, '서버 동기화 실패']
      }))
      return false
    }
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 초기 설정 로드
  useEffect(() => {
    if (userId && !isInitialized) {
      loadSettings()
    }
  }, [userId, familyId, isInitialized])

  return {
    userSettings,
    familySettings, 
    appSettings,
    sections: SETTINGS_SECTIONS,
    syncState,
    isInitialized,
    error,
    
    // 메서드들
    updateUserSetting,
    updateFamilySetting,
    updateAppSetting,
    resetToDefaults,
    exportSettings,
    importSettings,
    syncWithServer,
    clearError
  }
}