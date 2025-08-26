// DearQ 푸시 알림 매니저
// 웹 푸시 알림의 전체 생명주기를 관리하는 핵심 클래스

import { 
  BaseNotification,
  NotificationSubscription,
  NotificationTemplate,
  NotificationPreferences,
  NotificationStats,
  NotificationError,
  NotificationPermissionState,
  NOTIFICATION_TEMPLATES,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '@/types/notification'

export class NotificationManager {
  private static instance: NotificationManager
  private serviceWorkerReg: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null
  private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES
  private activeNotifications = new Map<string, Notification>()

  // 싱글톤 패턴
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private constructor() {
    this.initializeServiceWorker()
    this.loadPreferences()
  }

  /**
   * 서비스 워커 초기화
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new NotificationError('Service Worker가 지원되지 않습니다.', 'NOT_SUPPORTED')
    }

    try {
      this.serviceWorkerReg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      // 서비스 워커 메시지 리스너
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))
      
      console.log('Service Worker 등록 완료:', this.serviceWorkerReg)
    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
      throw new NotificationError('Service Worker 등록에 실패했습니다.', 'SUBSCRIPTION_FAILED')
    }
  }

  /**
   * 알림 권한 확인
   */
  getPermissionState(): NotificationPermissionState {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission as NotificationPermissionState
  }

  /**
   * 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) {
      throw new NotificationError('알림이 지원되지 않는 브라우저입니다.', 'NOT_SUPPORTED')
    }

    try {
      const permission = await Notification.requestPermission()
      return permission as NotificationPermissionState
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      throw new NotificationError('알림 권한 요청에 실패했습니다.', 'PERMISSION_DENIED')
    }
  }

  /**
   * 푸시 알림 구독
   */
  async subscribe(vapidPublicKey: string): Promise<NotificationSubscription | null> {
    if (!this.serviceWorkerReg) {
      await this.initializeServiceWorker()
    }

    if (this.getPermissionState() !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        throw new NotificationError('알림 권한이 거부되었습니다.', 'PERMISSION_DENIED')
      }
    }

    try {
      const pushSubscription = await this.serviceWorkerReg!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      this.subscription = pushSubscription

      const subscription: NotificationSubscription = {
        id: crypto.randomUUID(),
        userId: this.getCurrentUserId(), // 실제 구현에서는 auth context에서 가져옴
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(pushSubscription.getKey('auth')!)
        },
        platform: 'web',
        userAgent: navigator.userAgent,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isActive: true
      }

      // 서버에 구독 정보 저장
      await this.saveSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      console.error('푸시 구독 실패:', error)
      throw new NotificationError('푸시 구독에 실패했습니다.', 'SUBSCRIPTION_FAILED')
    }
  }

  /**
   * 푸시 알림 구독 해제
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      await this.subscription.unsubscribe()
      
      // 서버에서 구독 정보 제거
      await this.removeSubscriptionFromServer()
      
      this.subscription = null
      return true
    } catch (error) {
      console.error('구독 해제 실패:', error)
      return false
    }
  }

  /**
   * 로컬 알림 표시
   */
  async showNotification(notification: Partial<BaseNotification>): Promise<string | null> {
    if (this.getPermissionState() !== 'granted') {
      console.warn('알림 권한이 없습니다.')
      return null
    }

    // 조용한 시간 체크
    if (this.isQuietHours()) {
      console.log('조용한 시간으로 알림을 표시하지 않습니다.')
      return null
    }

    // 알림 타입별 설정 확인
    const typePrefs = this.preferences.types[notification.type || 'system']
    if (!typePrefs.enabled) {
      console.log(`${notification.type} 타입 알림이 비활성화되어 있습니다.`)
      return null
    }

    const id = notification.id || crypto.randomUUID()
    const title = notification.title || 'DearQ'
    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icons/notification-icon.png',
      badge: notification.badge || '/icons/badge-icon.png',
      image: notification.image,
      tag: notification.tag || notification.type,
      data: {
        id,
        type: notification.type,
        clickAction: notification.clickAction,
        ...notification.data
      },
      actions: typePrefs.actions ? notification.actions?.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon
      })) : undefined,
      silent: !typePrefs.sound,
      requireInteraction: notification.priority === 'urgent',
      timestamp: Date.now()
    }

    try {
      if (this.serviceWorkerReg) {
        // 서비스 워커를 통한 알림 (백그라운드에서도 동작)
        await this.serviceWorkerReg.showNotification(title, options)
      } else {
        // 직접 알림 생성 (현재 탭이 활성화된 경우만)
        const webNotification = new Notification(title, options)
        this.activeNotifications.set(id, webNotification)
        
        webNotification.onclick = (event) => {
          this.handleNotificationClick(event, id)
        }
      }

      // 배지 업데이트
      if (this.preferences.badge.enabled) {
        await this.updateBadgeCount()
      }

      return id
    } catch (error) {
      console.error('알림 표시 실패:', error)
      throw new NotificationError('알림 표시에 실패했습니다.', 'SEND_FAILED', id)
    }
  }

  /**
   * 예약 알림
   */
  async scheduleNotification(
    notification: Partial<BaseNotification>, 
    scheduleTime: Date
  ): Promise<string | null> {
    const delay = scheduleTime.getTime() - Date.now()
    
    if (delay <= 0) {
      return this.showNotification(notification)
    }

    const id = notification.id || crypto.randomUUID()
    
    setTimeout(async () => {
      try {
        await this.showNotification({ ...notification, id })
      } catch (error) {
        console.error('예약 알림 표시 실패:', error)
      }
    }, delay)

    return id
  }

  /**
   * 알림 취소
   */
  async cancelNotification(id: string): Promise<boolean> {
    try {
      // 활성 알림에서 제거
      const webNotification = this.activeNotifications.get(id)
      if (webNotification) {
        webNotification.close()
        this.activeNotifications.delete(id)
      }

      // 서비스 워커의 알림도 닫기
      if (this.serviceWorkerReg) {
        const notifications = await this.serviceWorkerReg.getNotifications()
        notifications.forEach(notification => {
          if (notification.data?.id === id) {
            notification.close()
          }
        })
      }

      return true
    } catch (error) {
      console.error('알림 취소 실패:', error)
      return false
    }
  }

  /**
   * 모든 알림 정리
   */
  async clearAllNotifications(): Promise<boolean> {
    try {
      // 웹 알림 정리
      this.activeNotifications.forEach(notification => notification.close())
      this.activeNotifications.clear()

      // 서비스 워커 알림 정리
      if (this.serviceWorkerReg) {
        const notifications = await this.serviceWorkerReg.getNotifications()
        notifications.forEach(notification => notification.close())
      }

      // 배지 초기화
      await this.updateBadgeCount(0)

      return true
    } catch (error) {
      console.error('알림 정리 실패:', error)
      return false
    }
  }

  /**
   * 배지 카운트 업데이트
   */
  async updateBadgeCount(count?: number): Promise<void> {
    if (!this.preferences.badge.enabled) return

    try {
      if ('setAppBadge' in navigator) {
        if (count === 0) {
          // @ts-ignore
          await navigator.clearAppBadge()
        } else {
          const badgeCount = count || await this.getUnreadCount()
          const maxCount = this.preferences.badge.maxCount
          const displayCount = Math.min(badgeCount, maxCount)
          // @ts-ignore
          await navigator.setAppBadge(displayCount)
        }
      }
    } catch (error) {
      console.warn('배지 업데이트 실패:', error)
    }
  }

  /**
   * 템플릿을 사용한 알림 생성
   */
  async showNotificationFromTemplate(
    templateId: string, 
    data: Record<string, any>
  ): Promise<string | null> {
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (!template) {
      throw new NotificationError(`템플릿을 찾을 수 없습니다: ${templateId}`, 'INVALID_TEMPLATE')
    }

    // 템플릿 변수 검증
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in data)) {
        throw new NotificationError(
          `필수 변수가 누락되었습니다: ${variable.name}`, 
          'INVALID_TEMPLATE'
        )
      }
    }

    // 템플릿 렌더링
    const notification: Partial<BaseNotification> = {
      type: template.type,
      title: this.renderTemplate(template.titleTemplate, data),
      body: this.renderTemplate(template.bodyTemplate, data),
      priority: template.defaultPriority,
      actions: template.defaultActions,
      data
    }

    return this.showNotification(notification)
  }

  /**
   * 알림 설정 업데이트
   */
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences }
    this.savePreferences()
  }

  /**
   * 알림 통계 조회
   */
  async getStats(period?: { start: Date; end: Date }): Promise<NotificationStats> {
    // 실제 구현에서는 서버 API 호출 또는 로컬 스토리지에서 조회
    const mockStats: NotificationStats = {
      userId: this.getCurrentUserId(),
      period: period || {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      totalSent: 42,
      totalDelivered: 40,
      totalRead: 35,
      totalClicked: 12,
      byType: {
        message: { sent: 25, delivered: 24, read: 22, clicked: 8 },
        'weekly-highlight': { sent: 7, delivered: 7, read: 6, clicked: 3 },
        'family-event': { sent: 5, delivered: 5, read: 4, clicked: 1 },
        reminder: { sent: 3, delivered: 3, read: 2, clicked: 0 },
        system: { sent: 2, delivered: 1, read: 1, clicked: 0 }
      },
      byHour: new Array(24).fill(0).map((_, i) => Math.floor(Math.random() * 5)),
      byDayOfWeek: new Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 10)),
      deliveryRate: 0.95,
      readRate: 0.875,
      clickThroughRate: 0.3
    }

    return mockStats
  }

  // Private 유틸리티 메서드들

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data
    
    switch (type) {
      case 'notification-clicked':
        this.handleNotificationClick(event, data.notificationId)
        break
      case 'action-clicked':
        this.handleActionClick(data.actionId, data.notificationId, data.inputValue)
        break
      case 'sync-notifications':
        this.syncNotifications()
        break
    }
  }

  private handleNotificationClick(event: Event, notificationId?: string): void {
    console.log('알림 클릭됨:', notificationId)
    
    // 알림 데이터에서 클릭 액션 URL 가져오기
    const notification = event.target as Notification
    const clickAction = notification.data?.clickAction
    
    if (clickAction) {
      // 해당 페이지로 이동
      if ('clients' in self) {
        // 서비스 워커에서 실행 중인 경우
        self.clients.openWindow(clickAction)
      } else {
        // 메인 스레드에서 실행 중인 경우
        window.open(clickAction, '_blank')
      }
    }
    
    // 알림 닫기
    notification.close()
  }

  private handleActionClick(actionId: string, notificationId: string, inputValue?: string): void {
    console.log('알림 액션 클릭됨:', { actionId, notificationId, inputValue })
    
    // 액션별 처리 로직
    switch (actionId) {
      case 'reply':
        if (inputValue) {
          // 답장 처리
          this.handleReplyAction(notificationId, inputValue)
        }
        break
      case 'like':
        // 좋아요 처리
        this.handleLikeAction(notificationId)
        break
      case 'view':
        // 보기 처리
        this.handleViewAction(notificationId)
        break
      case 'share':
        // 공유 처리
        this.handleShareAction(notificationId)
        break
    }
  }

  private async handleReplyAction(notificationId: string, message: string): Promise<void> {
    // 실제 구현에서는 메시지 API 호출
    console.log('답장 전송:', { notificationId, message })
  }

  private async handleLikeAction(notificationId: string): Promise<void> {
    // 실제 구현에서는 좋아요 API 호출
    console.log('좋아요 처리:', notificationId)
  }

  private handleViewAction(notificationId: string): void {
    // 해당 컨텐츠 페이지로 이동
    const url = `/notifications/${notificationId}`
    if ('clients' in self) {
      self.clients.openWindow(url)
    } else {
      window.open(url, '_blank')
    }
  }

  private handleShareAction(notificationId: string): void {
    // 공유 기능 실행
    console.log('공유 처리:', notificationId)
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false
    }

    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const startTime = this.parseTime(this.preferences.quietHours.startTime)
    const endTime = this.parseTime(this.preferences.quietHours.endTime)

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // 자정을 넘어가는 경우 (예: 22:00 ~ 08:00)
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 100 + minutes
  }

  private async getUnreadCount(): Promise<number> {
    // 실제 구현에서는 서버 API 또는 로컬 스토리지에서 조회
    return this.activeNotifications.size
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('dearq_notification_preferences')
      if (stored) {
        this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('dearq_notification_preferences', JSON.stringify(this.preferences))
    } catch (error) {
      console.error('알림 설정 저장 실패:', error)
    }
  }

  private async saveSubscriptionToServer(subscription: NotificationSubscription): Promise<void> {
    // 실제 구현에서는 서버 API 호출
    try {
      localStorage.setItem('dearq_push_subscription', JSON.stringify(subscription))
    } catch (error) {
      console.error('구독 정보 저장 실패:', error)
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    // 실제 구현에서는 서버 API 호출
    try {
      localStorage.removeItem('dearq_push_subscription')
    } catch (error) {
      console.error('구독 정보 제거 실패:', error)
    }
  }

  private syncNotifications(): void {
    // 서버와 알림 상태 동기화
    console.log('알림 동기화 중...')
  }

  private getCurrentUserId(): string {
    // 실제 구현에서는 인증 컨텍스트에서 가져옴
    return localStorage.getItem('dearq_user_id') || 'anonymous'
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer))
    return window.btoa(binary)
  }
}