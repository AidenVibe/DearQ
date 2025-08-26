'use client'

import React from 'react'
import { BaseNotification } from '@/types/notification'

interface NotificationItemProps {
  notification: BaseNotification
  onClick?: () => void
  onDelete?: (event: React.MouseEvent) => void
  className?: string
  showActions?: boolean
}

/**
 * 개별 알림 항목 컴포넌트
 * 알림 타입별로 적절한 아이콘과 내용을 표시합니다.
 */
export function NotificationItem({
  notification,
  onClick,
  onDelete,
  className = '',
  showActions = true
}: NotificationItemProps) {
  
  // 알림 타입별 아이콘 및 스타일
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'message':
        return {
          icon: (
            <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-900'
        }
      case 'weekly-highlight':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          textColor: 'text-yellow-900'
        }
      case 'family-event':
        return {
          icon: (
            <svg className="h-6 w-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V6.455c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0c.454.303.977.454 1.5.454v9.091z" />
            </svg>
          ),
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-100',
          textColor: 'text-pink-900'
        }
      case 'reminder':
        return {
          icon: (
            <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-100',
          textColor: 'text-orange-900'
        }
      case 'system':
        return {
          icon: (
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-100',
          textColor: 'text-gray-900'
        }
      default:
        return {
          icon: (
            <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-100',
          textColor: 'text-slate-900'
        }
    }
  }

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}시간 전`
    } else if (diffInMinutes < 7 * 24 * 60) {
      const days = Math.floor(diffInMinutes / (24 * 60))
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  // 우선순위별 표시
  const getPriorityIndicator = () => {
    if (notification.priority === 'urgent') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          긴급
        </span>
      )
    } else if (notification.priority === 'high') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          중요
        </span>
      )
    }
    return null
  }

  // 상태별 표시
  const getStatusIndicator = () => {
    switch (notification.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            대기중
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            실패
          </span>
        )
      default:
        return null
    }
  }

  const style = getNotificationStyle()
  const isUnread = !notification.readAt

  return (
    <div
      onClick={onClick}
      className={`notification-item p-4 border-l-4 ${
        isUnread ? 'bg-white border-l-primary-500' : `${style.bgColor} border-l-slate-300`
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        {/* 아이콘 */}
        <div className={`flex-shrink-0 p-2 rounded-full ${isUnread ? 'bg-primary-100' : style.bgColor}`}>
          {style.icon}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* 제목 */}
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-medium ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                  {notification.title}
                </h4>
                {getPriorityIndicator()}
                {getStatusIndicator()}
                {isUnread && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </div>

              {/* 내용 */}
              <p className={`text-sm mt-1 ${isUnread ? 'text-slate-700' : 'text-slate-600'}`}>
                {notification.body}
              </p>

              {/* 메타 정보 */}
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                <span>{formatTime(notification.createdAt)}</span>
                
                {notification.scheduledAt && (
                  <span>예약: {formatTime(notification.scheduledAt)}</span>
                )}
                
                {notification.expiresAt && new Date() < notification.expiresAt && (
                  <span>만료: {formatTime(notification.expiresAt)}</span>
                )}
              </div>

              {/* 액션 버튼들 */}
              {showActions && notification.actions && notification.actions.length > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  {notification.actions.slice(0, 2).map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        // 액션 처리 로직 (실제 구현에서는 콜백으로 전달)
                        console.log(`액션 실행: ${action.action}`)
                      }}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      style={{ minHeight: '32px' }}
                    >
                      {action.icon && <span className="mr-1">{action.icon}</span>}
                      {action.title}
                    </button>
                  ))}
                  
                  {notification.actions.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{notification.actions.length - 2}개 더
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 삭제 버튼 */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-shrink-0 ml-3 p-1 text-slate-400 hover:text-slate-600"
                title="알림 삭제"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}