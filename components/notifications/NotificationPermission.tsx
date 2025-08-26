'use client'

import React, { useState, useCallback } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationPermissionProps {
  className?: string
  showBenefits?: boolean
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
}

/**
 * 알림 권한 요청 컴포넌트
 * 사용자에게 자연스럽게 알림 권한을 요청하고 안내합니다.
 */
export function NotificationPermission({
  className = '',
  showBenefits = true,
  onPermissionGranted,
  onPermissionDenied
}: NotificationPermissionProps) {
  const {
    permission,
    isSupported,
    requestPermission,
    subscribe,
    isLoading
  } = useNotifications()

  const [isDismissed, setIsDismissed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 권한 요청 핸들러
  const handleRequestPermission = useCallback(async () => {
    try {
      const newPermission = await requestPermission()
      
      if (newPermission === 'granted') {
        // 권한이 승인되면 자동으로 구독 시도
        await subscribe()
        onPermissionGranted?.()
      } else {
        onPermissionDenied?.()
      }
    } catch (error) {
      console.error('권한 요청 실패:', error)
      onPermissionDenied?.()
    }
  }, [requestPermission, subscribe, onPermissionGranted, onPermissionDenied])

  // 나중에 하기 핸들러
  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
  }, [])

  // 알림이 지원되지 않는 경우
  if (!isSupported) {
    return (
      <div className={`notification-permission bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <svg className="h-6 w-6 text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-amber-800">알림을 사용할 수 없습니다</h3>
            <p className="text-sm text-amber-700 mt-1">
              현재 브라우저에서는 푸시 알림을 지원하지 않습니다. 
              최신 버전의 Chrome, Firefox, Safari를 사용해보세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 이미 권한이 승인된 경우
  if (permission === 'granted') {
    return (
      <div className={`notification-permission bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <svg className="h-6 w-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">알림이 활성화되었습니다!</h3>
            <p className="text-sm text-green-700 mt-1">
              이제 중요한 가족 소식을 놓치지 않고 받아보실 수 있어요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 권한이 거부된 경우
  if (permission === 'denied') {
    return (
      <div className={`notification-permission bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">알림 권한이 차단되었습니다</h3>
              <p className="text-sm text-red-700 mt-1">
                브라우저 설정에서 알림을 허용해주세요. 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 설정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 설정 방법 안내 */}
        <div className="mt-4 p-3 bg-red-100 rounded-md">
          <p className="text-sm text-red-800 font-medium mb-2">알림 허용 방법:</p>
          <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
            <li>주소창 왼쪽의 자물쇠 🔒 아이콘을 클릭하세요</li>
            <li>"알림"을 "허용"으로 변경하세요</li>
            <li>페이지를 새로고침하세요</li>
          </ol>
        </div>
      </div>
    )
  }

  // 이미 무시된 경우
  if (isDismissed) {
    return null
  }

  // 권한 요청 UI
  return (
    <div className={`notification-permission bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      {/* 메인 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6l-6-6v6zM21 12.5L15.5 18l-3.5-3.5M2.5 12.5L8 18l3.5-3.5" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-900">가족 소식을 놓치지 마세요!</h3>
            <p className="text-sm text-blue-700 mt-1">
              중요한 메시지와 특별한 순간들을 실시간으로 알려드릴게요.
            </p>
          </div>
        </div>
        
        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-400 hover:text-blue-600"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 혜택 목록 */}
      {showBenefits && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm text-blue-800">새 메시지 즉시 알림</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm text-blue-800">주간 하이라이트 완성</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V6.455c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0c.454.303.977.454 1.5.454v9.091zm-5.636-5.09a1 1 0 00-1.414-1.414l-2.586 2.586a1 1 0 01-1.414 0L7.464 9.05a1 1 0 00-1.414 1.414L9.636 14.05a3 3 0 004.242 0L15.364 12.455z" />
              </svg>
              <span className="text-sm text-blue-800">생일 & 기념일 알림</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800">중요한 순간 리마인더</span>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 보호 안내 */}
      <div className="mt-4 p-3 bg-blue-100 rounded-md">
        <div className="flex items-center">
          <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-sm text-blue-800">
            <strong>개인정보 보호:</strong> 알림은 오직 가족 구성원들과의 소통을 위해서만 사용됩니다.
          </p>
        </div>
      </div>

      {/* 자세한 설명 토글 */}
      {!showDetails && (
        <button
          onClick={() => setShowDetails(true)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          style={{ minHeight: '44px' }}
        >
          알림에 대해 더 자세히 알아보기
        </button>
      )}

      {/* 자세한 설명 */}
      {showDetails && (
        <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">알림은 언제 받나요?</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>가족이 메시지를 보낼 때</li>
            <li>주간 하이라이트가 완성될 때</li>
            <li>가족 구성원의 생일이나 기념일</li>
            <li>중요한 가족 활동이나 이벤트가 있을 때</li>
            <li>답장이 필요한 메시지가 있을 때</li>
          </ul>
          
          <h4 className="text-sm font-medium text-blue-900 mt-3 mb-2">알림 설정을 변경할 수 있나요?</h4>
          <p className="text-sm text-blue-800">
            네! 언제든지 설정에서 알림 유형별로 켜고 끌 수 있으며, 
            조용한 시간도 설정할 수 있습니다.
          </p>
          
          <button
            onClick={() => setShowDetails(false)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            style={{ minHeight: '44px' }}
          >
            간단히 보기
          </button>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-transparent border border-blue-300 rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ minHeight: '44px' }}
        >
          나중에 하기
        </button>
        
        <button
          onClick={handleRequestPermission}
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              설정 중...
            </div>
          ) : (
            '알림 허용하기'
          )}
        </button>
      </div>
    </div>
  )
}