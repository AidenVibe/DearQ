// DearQ 서비스 워커
// 백그라운드에서 푸시 알림을 처리하고 오프라인 기능을 제공합니다.

const CACHE_NAME = 'dearq-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/notification-icon.png',
  '/icons/badge-icon.png'
]

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기 완료')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('캐시 생성 실패:', error)
      })
  )
  
  // 새로운 서비스 워커를 즉시 활성화
  self.skipWaiting()
})

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화됨')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 기존 캐시 정리
          if (cacheName !== CACHE_NAME) {
            console.log('기존 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // 모든 클라이언트에서 즉시 제어권 획득
  self.clients.claim()
})

// 네트워크 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then((response) => {
            // 유효하지 않은 응답이면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // 네트워크 실패 시 오프라인 페이지 제공 (선택사항)
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// 푸시 메시지 수신
self.addEventListener('push', (event) => {
  console.log('푸시 메시지 수신:', event)
  
  let notificationData = {}
  
  try {
    if (event.data) {
      notificationData = event.data.json()
    }
  } catch (error) {
    console.error('푸시 데이터 파싱 실패:', error)
    notificationData = {
      title: 'DearQ',
      body: '새로운 알림이 있습니다.',
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png'
    }
  }
  
  // 기본 알림 옵션 설정
  const options = {
    body: notificationData.body || '새로운 알림이 있습니다.',
    icon: notificationData.icon || '/icons/notification-icon.png',
    badge: notificationData.badge || '/icons/badge-icon.png',
    image: notificationData.image,
    data: notificationData.data || {},
    tag: notificationData.tag || 'default',
    requireInteraction: notificationData.priority === 'urgent',
    actions: notificationData.actions || [],
    silent: notificationData.silent || false,
    vibrate: notificationData.vibrate || [200, 100, 200],
    timestamp: Date.now()
  }
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'DearQ',
      options
    ).then(() => {
      console.log('알림 표시 완료')
      
      // 배지 업데이트
      if ('setAppBadge' in navigator) {
        const badgeCount = notificationData.badgeCount || 1
        navigator.setAppBadge(badgeCount)
          .catch(error => console.error('배지 업데이트 실패:', error))
      }
      
      // 클라이언트에 알림 수신 이벤트 전달
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'notification-received',
            data: notificationData
          })
        })
      })
    }).catch(error => {
      console.error('알림 표시 실패:', error)
    })
  )
})

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭됨:', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // 알림 닫기
  notification.close()
  
  // 액션 버튼 클릭 처리
  if (event.action) {
    handleNotificationAction(event.action, data, notification)
  } else {
    // 알림 자체 클릭 처리
    handleNotificationClick(data, notification)
  }
})

// 알림 닫기 이벤트
self.addEventListener('notificationclose', (event) => {
  console.log('알림 닫힘:', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // 클라이언트에 알림 닫기 이벤트 전달
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'notification-closed',
        data: {
          notificationId: data.id,
          tag: notification.tag
        }
      })
    })
  })
})

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag)
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

// 알림 클릭 처리 함수
function handleNotificationClick(data, notification) {
  const clickAction = data.clickAction || '/'
  
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => {
      // 이미 열린 창이 있는지 확인
      for (let client of clients) {
        if (client.url.includes(clickAction.split('?')[0])) {
          // 해당 창으로 포커스 이동
          client.focus()
          client.postMessage({
            type: 'notification-clicked',
            data: {
              notificationId: data.id,
              clickAction: clickAction
            }
          })
          return
        }
      }
      
      // 새 창 열기
      self.clients.openWindow(clickAction)
        .then(client => {
          if (client) {
            client.postMessage({
              type: 'notification-clicked',
              data: {
                notificationId: data.id,
                clickAction: clickAction
              }
            })
          }
        })
    })
}

// 알림 액션 처리 함수
function handleNotificationAction(actionId, data, notification) {
  console.log('알림 액션 실행:', actionId, data)
  
  switch (actionId) {
    case 'reply':
      // 답장 처리
      handleReplyAction(data, notification)
      break
      
    case 'like':
      // 좋아요 처리
      handleLikeAction(data, notification)
      break
      
    case 'view':
      // 보기 처리 (알림 클릭과 동일)
      handleNotificationClick(data, notification)
      break
      
    case 'share':
      // 공유 처리
      handleShareAction(data, notification)
      break
      
    case 'dismiss':
      // 무시 처리 (별도 동작 없이 알림만 닫기)
      break
      
    default:
      // 기본 동작 (알림 클릭과 동일)
      handleNotificationClick(data, notification)
  }
  
  // 클라이언트에 액션 이벤트 전달
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'action-clicked',
        data: {
          actionId: actionId,
          notificationId: data.id,
          data: data
        }
      })
    })
  })
}

// 답장 액션 처리
function handleReplyAction(data, notification) {
  // 실제 구현에서는 답장 인터페이스를 열거나 API 호출
  console.log('답장 액션 처리:', data)
  
  // 답장 인터페이스 열기
  const replyUrl = `/reply?messageId=${data.messageId || ''}&conversationId=${data.conversationId || ''}`
  self.clients.openWindow(replyUrl)
}

// 좋아요 액션 처리
function handleLikeAction(data, notification) {
  // 실제 구현에서는 API 호출하여 좋아요 처리
  console.log('좋아요 액션 처리:', data)
  
  // 좋아요 API 호출 (모의)
  fetch('/api/notifications/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notificationId: data.id,
      messageId: data.messageId
    })
  }).then(response => {
    if (response.ok) {
      // 성공 피드백 알림 표시
      self.registration.showNotification('좋아요 완료!', {
        body: '메시지에 좋아요를 보냈습니다.',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: 'like-success',
        requireInteraction: false,
        silent: true
      })
    }
  }).catch(error => {
    console.error('좋아요 처리 실패:', error)
  })
}

// 공유 액션 처리
function handleShareAction(data, notification) {
  console.log('공유 액션 처리:', data)
  
  const shareUrl = `/share?highlightId=${data.highlightId || ''}`
  self.clients.openWindow(shareUrl)
}

// 알림 동기화 함수
async function syncNotifications() {
  try {
    console.log('알림 동기화 중...')
    
    // 실제 구현에서는 서버와 동기화
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastSyncTime: new Date().toISOString()
      })
    })
    
    if (response.ok) {
      const syncData = await response.json()
      console.log('동기화 완료:', syncData)
      
      // 클라이언트에 동기화 완료 이벤트 전달
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({
          type: 'sync-completed',
          data: syncData
        })
      })
    }
  } catch (error) {
    console.error('알림 동기화 실패:', error)
  }
}

// 메시지 수신 (클라이언트로부터)
self.addEventListener('message', (event) => {
  console.log('Service Worker 메시지 수신:', event.data)
  
  const { type, data } = event.data
  
  switch (type) {
    case 'skip-waiting':
      self.skipWaiting()
      break
      
    case 'sync-notifications':
      syncNotifications()
      break
      
    case 'clear-badge':
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge()
          .catch(error => console.error('배지 지우기 실패:', error))
      }
      break
      
    case 'update-badge':
      if ('setAppBadge' in navigator && data && data.count !== undefined) {
        navigator.setAppBadge(data.count)
          .catch(error => console.error('배지 업데이트 실패:', error))
      }
      break
  }
})

// 에러 처리
self.addEventListener('error', (event) => {
  console.error('Service Worker 에러:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker 처리되지 않은 Promise 거부:', event.reason)
})

console.log('DearQ Service Worker 로드 완료')