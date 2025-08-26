'use client'

import React, { useState, useCallback } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { BaseNotification, NotificationType } from '@/types/notification'
import { NotificationItem } from './NotificationItem'
import { NotificationPermission } from './NotificationPermission'

interface NotificationCenterProps {
  className?: string
  maxHeight?: string
  showPermissionPrompt?: boolean
  onNotificationClick?: (notification: BaseNotification) => void
}

/**
 * 알림 센터 컴포넌트
 * 모든 알림을 관리하고 표시하는 중앙 집중식 UI
 */
export function NotificationCenter({
  className = '',
  maxHeight = '400px',
  showPermissionPrompt = true,
  onNotificationClick
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    permission,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    clearError
  } = useNotifications()

  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // 알림 필터링
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) {
      return false
    }
    if (showUnreadOnly && notification.readAt) {
      return false
    }
    return true
  })

  // 알림 클릭 핸들러
  const handleNotificationClick = useCallback(async (notification: BaseNotification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.readAt) {
      await markAsRead(notification.id)
    }
    
    // 부모 컴포넌트에 클릭 이벤트 전달
    onNotificationClick?.(notification)
  }, [markAsRead, onNotificationClick])

  // 알림 삭제 핸들러
  const handleDeleteNotification = useCallback(async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await clearNotification(id)
  }, [clearNotification])

  // 모두 읽음 처리 핸들러
  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount > 0) {
      await markAllAsRead()
    }
  }, [markAllAsRead, unreadCount])

  // 모든 알림 정리 핸들러
  const handleClearAll = useCallback(async () => {
    if (confirm('모든 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await clearAllNotifications()
    }
  }, [clearAllNotifications])

  // 알림 타입별 개수
  const getTypeCount = (type: NotificationType): number => {
    return notifications.filter(n => n.type === type && (!showUnreadOnly || !n.readAt)).length
  }

  // 권한이 없는 경우 권한 요청 UI 표시
  if (permission !== 'granted' && showPermissionPrompt) {
    return (
      <div className={`notification-center bg-white rounded-lg shadow-lg border border-slate-200 ${className}`}>
        <NotificationPermission />
      </div>
    )
  }

  return (
    <div className={`notification-center bg-white rounded-lg shadow-lg border border-slate-200 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-slate-900">알림</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {unreadCount}개
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* 모두 읽음 버튼 */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              모두 읽음
            </button>
          )}

          {/* 모든 알림 정리 버튼 */}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              모두 삭제
            </button>
          )}

          {/* 새로고침 버튼 */}
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            title="새로고침"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-slate-700">읽지 않은 알림만</span>
            </label>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
            className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ minHeight: '44px' }}
          >
            <option value="all">모든 알림 ({notifications.length})</option>
            <option value="message">메시지 ({getTypeCount('message')})</option>
            <option value="weekly-highlight">주간 하이라이트 ({getTypeCount('weekly-highlight')})</option>
            <option value="family-event">가족 이벤트 ({getTypeCount('family-event')})</option>
            <option value="reminder">리마인더 ({getTypeCount('reminder')})</option>
            <option value="system">시스템 ({getTypeCount('system')})</option>
          </select>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="notification-list" style={{ maxHeight, overflowY: 'auto' }}>
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-600">알림을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM9 7h6l-6-6v6zM21 12.5L15.5 18l-3.5-3.5M2.5 12.5L8 18l3.5-3.5" />
              </svg>
              <p className="text-slate-500 text-sm">
                {notifications.length === 0 
                  ? '아직 받은 알림이 없습니다.'
                  : '조건에 맞는 알림이 없습니다.'
                }
              </p>
              {notifications.length === 0 && (
                <p className="text-slate-400 text-xs mt-1">
                  가족들과 대화를 시작하면 알림을 받을 수 있어요.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={(event) => handleDeleteNotification(notification.id, event)}
                className="cursor-pointer hover:bg-slate-50"
              />
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            총 {notifications.length}개의 알림 • 읽지 않음 {unreadCount}개
          </p>
        </div>
      )}
    </div>
  )
}