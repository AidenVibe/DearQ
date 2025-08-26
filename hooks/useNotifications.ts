import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  UseNotificationsReturn,
  NotificationManagerState,
  NotificationPreferences,
  NotificationSubscription,
  NotificationStats,
  BaseNotification,
  NotificationPermissionState,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '@/types/notification'
import { NotificationManager } from '@/utils/notification-manager'

/**
 * 알림 관리 훅
 * 푸시 알림의 전체 생명주기를 관리합니다.
 */
export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationManagerState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    notifications: [],
    unreadCount: 0,
    activeNotifications: [],
    isLoading: false,
    error: null,
    syncErrors: []
  })

  const notificationManager = useRef<NotificationManager>()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES)

  // 초기화
  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      notificationManager.current = NotificationManager.getInstance()
      
      const isSupported = notificationManager.current.isSupported()
      const permission = notificationManager.current.getPermissionState()
      
      // 로컬 스토리지에서 구독 정보 확인
      const storedSubscription = localStorage.getItem('dearq_push_subscription')
      let subscription: NotificationSubscription | null = null
      let isSubscribed = false
      
      if (storedSubscription && permission === 'granted') {
        try {
          subscription = JSON.parse(storedSubscription)
          isSubscribed = true
        } catch (error) {
          console.error('구독 정보 파싱 실패:', error)
        }
      }

      // 알림 목록 로드
      const notifications = await loadNotifications()
      const unreadCount = notifications.filter(n => !n.readAt).length
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission,
        isSubscribed,
        subscription,
        notifications,
        unreadCount,
        isLoading: false
      }))
      
      // 설정 로드
      loadPreferences()
      
    } catch (error) {
      console.error('알림 초기화 실패:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림 초기화에 실패했습니다.'
      }))
    }
  }, [])

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!notificationManager.current) {
      throw new Error('NotificationManager가 초기화되지 않았습니다.')
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const permission = await notificationManager.current.requestPermission()
      
      setState(prev => ({ 
        ...prev, 
        permission,
        isLoading: false
      }))
      
      return permission
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '권한 요청에 실패했습니다.'
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // 푸시 알림 구독
  const subscribe = useCallback(async (): Promise<NotificationSubscription | null> => {
    if (!notificationManager.current) {
      throw new Error('NotificationManager가 초기화되지 않았습니다.')
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // VAPID 공개 키 (실제 구현에서는 환경변수나 설정에서 가져옴)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'DEMO_VAPID_KEY'
      
      const subscription = await notificationManager.current.subscribe(vapidPublicKey)
      
      setState(prev => ({ 
        ...prev, 
        isSubscribed: !!subscription,
        subscription,
        isLoading: false
      }))
      
      return subscription
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구독에 실패했습니다.'
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage,
        syncErrors: [...prev.syncErrors, errorMessage]
      }))
      throw error
    }
  }, [])

  // 구독 해제
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!notificationManager.current) {
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const success = await notificationManager.current.unsubscribe()
      
      if (success) {
        setState(prev => ({ 
          ...prev, 
          isSubscribed: false,
          subscription: null,
          isLoading: false
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: '구독 해제에 실패했습니다.'
        }))
      }
      
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구독 해제에 실패했습니다.'
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }))
      return false
    }
  }, [])

  // 알림 표시
  const showNotification = useCallback(async (
    notification: Partial<BaseNotification>
  ): Promise<string | null> => {
    if (!notificationManager.current) {
      throw new Error('NotificationManager가 초기화되지 않았습니다.')
    }

    try {
      const id = await notificationManager.current.showNotification(notification)
      
      if (id) {
        // 알림 목록 업데이트
        const newNotification: BaseNotification = {
          id,
          userId: getCurrentUserId(),
          type: notification.type || 'system',
          priority: notification.priority || 'normal',
          status: 'sent',
          title: notification.title || '',
          body: notification.body || '',
          createdAt: new Date(),
          ...notification
        }
        
        setState(prev => ({
          ...prev,
          notifications: [newNotification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1,
          activeNotifications: [...prev.activeNotifications, id]
        }))
        
        // 로컬 스토리지에 저장
        await saveNotification(newNotification)
      }
      
      return id
    } catch (error) {
      console.error('알림 표시 실패:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '알림 표시에 실패했습니다.'
      }))
      return null
    }
  }, [])

  // 예약 알림
  const scheduleNotification = useCallback(async (
    notification: Partial<BaseNotification>,
    scheduleTime: Date
  ): Promise<string | null> => {
    if (!notificationManager.current) {
      throw new Error('NotificationManager가 초기화되지 않았습니다.')
    }

    try {
      const id = await notificationManager.current.scheduleNotification(notification, scheduleTime)
      
      if (id) {
        const scheduledNotification: BaseNotification = {
          id,
          userId: getCurrentUserId(),
          type: notification.type || 'system',
          priority: notification.priority || 'normal',
          status: 'pending',
          title: notification.title || '',
          body: notification.body || '',
          createdAt: new Date(),
          scheduledAt: scheduleTime,
          ...notification
        }
        
        setState(prev => ({
          ...prev,
          notifications: [scheduledNotification, ...prev.notifications]
        }))
        
        await saveNotification(scheduledNotification)
      }
      
      return id
    } catch (error) {
      console.error('예약 알림 실패:', error)
      return null
    }
  }, [])

  // 알림 취소
  const cancelNotification = useCallback(async (id: string): Promise<boolean> => {
    if (!notificationManager.current) {
      return false
    }

    try {
      const success = await notificationManager.current.cancelNotification(id)
      
      if (success) {
        setState(prev => ({
          ...prev,
          activeNotifications: prev.activeNotifications.filter(nId => nId !== id)
        }))
      }
      
      return success
    } catch (error) {
      console.error('알림 취소 실패:', error)
      return false
    }
  }, [])

  // 읽음 처리
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === id
            ? { ...notification, status: 'read', readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }))
      
      // 로컬 스토리지 업데이트
      await updateNotificationStatus(id, 'read')
      
      // 배지 카운트 업데이트
      if (notificationManager.current) {
        await notificationManager.current.updateBadgeCount()
      }
      
      return true
    } catch (error) {
      console.error('읽음 처리 실패:', error)
      return false
    }
  }, [])

  // 모두 읽음 처리
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({
          ...notification,
          status: 'read',
          readAt: notification.readAt || new Date()
        })),
        unreadCount: 0
      }))
      
      // 로컬 스토리지 업데이트
      await markAllNotificationsAsRead()
      
      // 배지 초기화
      if (notificationManager.current) {
        await notificationManager.current.updateBadgeCount(0)
      }
      
      return true
    } catch (error) {
      console.error('모두 읽음 처리 실패:', error)
      return false
    }
  }, [])

  // 알림 삭제
  const clearNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      // 활성 알림 취소
      await cancelNotification(id)
      
      // 목록에서 제거
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id),
        unreadCount: prev.notifications.find(n => n.id === id && !n.readAt) 
          ? prev.unreadCount - 1 
          : prev.unreadCount
      }))
      
      // 로컬 스토리지에서 제거
      await removeNotification(id)
      
      return true
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      return false
    }
  }, [cancelNotification])

  // 모든 알림 정리
  const clearAllNotifications = useCallback(async (): Promise<boolean> => {
    if (!notificationManager.current) {
      return false
    }

    try {
      // 모든 활성 알림 정리
      await notificationManager.current.clearAllNotifications()
      
      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0,
        activeNotifications: []
      }))
      
      // 로컬 스토리지 정리
      await clearAllStoredNotifications()
      
      return true
    } catch (error) {
      console.error('모든 알림 정리 실패:', error)
      return false
    }
  }, [])

  // 설정 업데이트
  const updatePreferences = useCallback(async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      setPreferences(updatedPreferences)
      
      if (notificationManager.current) {
        notificationManager.current.updatePreferences(updatedPreferences)
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem('dearq_notification_preferences', JSON.stringify(updatedPreferences))
      
      return true
    } catch (error) {
      console.error('설정 업데이트 실패:', error)
      return false
    }
  }, [preferences])

  // 통계 조회
  const getStats = useCallback(async (
    period?: { start: Date; end: Date }
  ): Promise<NotificationStats> => {
    if (!notificationManager.current) {
      throw new Error('NotificationManager가 초기화되지 않았습니다.')
    }

    return notificationManager.current.getStats(period)
  }, [])

  // 알림 목록 새로고침
  const refreshNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const notifications = await loadNotifications()
      const unreadCount = notifications.filter(n => !n.readAt).length
      
      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false,
        lastSyncAt: new Date()
      }))
      
      return true
    } catch (error) {
      console.error('알림 새로고침 실패:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '알림 새로고침에 실패했습니다.'
      }))
      return false
    }
  }, [])

  // 서버와 동기화
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, syncErrors: [] }))
      
      // 실제 구현에서는 서버 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date()
      }))
      
      return true
    } catch (error) {
      console.error('서버 동기화 실패:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        syncErrors: [...prev.syncErrors, '서버 동기화 실패']
      }))
      return false
    }
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 유틸리티 함수들
  
  const loadNotifications = async (): Promise<BaseNotification[]> => {
    try {
      const stored = localStorage.getItem('dearq_notifications')
      if (stored) {
        const notifications = JSON.parse(stored)
        return notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          scheduledAt: n.scheduledAt ? new Date(n.scheduledAt) : undefined,
          deliveredAt: n.deliveredAt ? new Date(n.deliveredAt) : undefined,
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }))
      }
      return []
    } catch (error) {
      console.error('알림 목록 로드 실패:', error)
      return []
    }
  }

  const saveNotification = async (notification: BaseNotification): Promise<void> => {
    try {
      const notifications = await loadNotifications()
      const updated = [notification, ...notifications]
      localStorage.setItem('dearq_notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('알림 저장 실패:', error)
    }
  }

  const updateNotificationStatus = async (id: string, status: string): Promise<void> => {
    try {
      const notifications = await loadNotifications()
      const updated = notifications.map(n =>
        n.id === id ? { ...n, status, readAt: new Date() } : n
      )
      localStorage.setItem('dearq_notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('알림 상태 업데이트 실패:', error)
    }
  }

  const markAllNotificationsAsRead = async (): Promise<void> => {
    try {
      const notifications = await loadNotifications()
      const updated = notifications.map(n => ({ 
        ...n, 
        status: 'read', 
        readAt: n.readAt || new Date() 
      }))
      localStorage.setItem('dearq_notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error)
    }
  }

  const removeNotification = async (id: string): Promise<void> => {
    try {
      const notifications = await loadNotifications()
      const updated = notifications.filter(n => n.id !== id)
      localStorage.setItem('dearq_notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('알림 제거 실패:', error)
    }
  }

  const clearAllStoredNotifications = async (): Promise<void> => {
    try {
      localStorage.removeItem('dearq_notifications')
    } catch (error) {
      console.error('저장된 알림 정리 실패:', error)
    }
  }

  const loadPreferences = (): void => {
    try {
      const stored = localStorage.getItem('dearq_notification_preferences')
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
    }
  }

  const getCurrentUserId = (): string => {
    return localStorage.getItem('dearq_user_id') || 'anonymous'
  }

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    scheduleNotification,
    cancelNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    updatePreferences,
    getStats,
    refreshNotifications,
    syncWithServer,
    clearError
  }
}