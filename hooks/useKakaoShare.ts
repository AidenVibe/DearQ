import { useState, useCallback, useEffect } from 'react'
import { KakaoShareTemplate } from '@/types/weekly-highlight'

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (settings: any) => Promise<void>
        createCustomButton: (settings: any) => void
      }
    }
  }
}

export interface KakaoShareOptions {
  appKey: string // 카카오 개발자 앱 키
  scriptSrc?: string // 카카오 SDK 스크립트 URL
}

export interface KakaoShareState {
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  lastSharedAt: Date | null
}

const DEFAULT_OPTIONS: Required<KakaoShareOptions> = {
  appKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY',
  scriptSrc: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js'
}

export function useKakaoShare(options: Partial<KakaoShareOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const [state, setState] = useState<KakaoShareState>({
    isLoading: false,
    isInitialized: false,
    error: null,
    lastSharedAt: null
  })

  /**
   * 카카오 SDK 로드 및 초기화
   */
  const initializeKakao = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // 이미 초기화된 경우
      if (window.Kakao?.isInitialized()) {
        setState(prev => ({ ...prev, isLoading: false, isInitialized: true }))
        return true
      }

      // 카카오 SDK 스크립트 로드
      if (!window.Kakao) {
        await loadKakaoScript(config.scriptSrc)
      }

      // SDK 초기화
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(config.appKey)
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        error: null 
      }))

      return true
    } catch (error) {
      console.error('카카오 SDK 초기화 실패:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: false,
        error: '카카오톡 공유 기능을 사용할 수 없습니다.' 
      }))
      return false
    }
  }, [config.appKey, config.scriptSrc])

  /**
   * 피드 메시지 공유
   */
  const shareFeed = useCallback(async (template: KakaoShareTemplate): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // SDK 초기화 확인
      const isReady = state.isInitialized || await initializeKakao()
      if (!isReady) {
        throw new Error('카카오 SDK 초기화 실패')
      }

      // 공유 실행
      await window.Kakao.Share.sendDefault(template)

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastSharedAt: new Date(),
        error: null 
      }))

      return true
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      
      let errorMessage = '공유 중 문제가 발생했습니다.'
      
      // 에러 타입별 메시지 설정
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          errorMessage = '공유가 취소되었습니다.'
        } else if (error.message.includes('not installed')) {
          errorMessage = '카카오톡이 설치되지 않았습니다.'
        }
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage 
      }))

      return false
    }
  }, [state.isInitialized, initializeKakao])

  /**
   * 커스텀 공유 버튼 생성
   */
  const createCustomButton = useCallback(async (
    containerId: string, 
    template: KakaoShareTemplate
  ): Promise<boolean> => {
    try {
      const isReady = state.isInitialized || await initializeKakao()
      if (!isReady) return false

      window.Kakao.Share.createCustomButton({
        container: `#${containerId}`,
        templateId: template.content?.title,
        templateArgs: template
      })

      return true
    } catch (error) {
      console.error('카카오 커스텀 버튼 생성 실패:', error)
      return false
    }
  }, [state.isInitialized, initializeKakao])

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * 공유 가능 여부 확인
   */
  const canShare = useCallback((): boolean => {
    // 모바일 환경에서 카카오톡 앱 설치 여부 체크
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    if (isMobile) {
      // 모바일에서는 카카오톡 앱이 필요
      return true // 실제로는 앱 설치 여부를 확인하는 로직 필요
    }
    
    // 데스크탑에서는 웹 카카오톡 사용 가능
    return true
  }, [])

  // 컴포넌트 마운트 시 SDK 초기화
  useEffect(() => {
    if (config.appKey !== 'YOUR_KAKAO_APP_KEY') {
      initializeKakao()
    }
  }, [config.appKey, initializeKakao])

  return {
    ...state,
    canShare: canShare(),
    initialize: initializeKakao,
    shareFeed,
    createCustomButton,
    clearError
  }
}

// 카카오 SDK 스크립트 로드 유틸리티
function loadKakaoScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드된 스크립트 확인
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('카카오 SDK 로드 실패'))

    document.head.appendChild(script)
  })
}

// 카카오 공유 템플릿 빌더 유틸리티
export class KakaoTemplateBuilder {
  static createWeeklyHighlight(
    title: string,
    description: string,
    imageUrl?: string,
    webUrl?: string
  ): KakaoShareTemplate {
    return {
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: imageUrl || undefined,
        link: {
          webUrl: webUrl || window.location.href,
          mobileWebUrl: webUrl || window.location.href
        }
      },
      buttons: webUrl ? [{
        title: '자세히 보기',
        link: {
          webUrl,
          mobileWebUrl: webUrl
        }
      }] : undefined
    }
  }

  static createCustomTemplate(
    title: string,
    description: string,
    options: {
      imageUrl?: string
      webUrl?: string
      buttonText?: string
      hashtags?: string[]
    } = {}
  ): KakaoShareTemplate {
    const fullDescription = options.hashtags?.length 
      ? `${description}\n\n${options.hashtags.map(tag => `#${tag}`).join(' ')}`
      : description

    return {
      objectType: 'feed',
      content: {
        title,
        description: fullDescription,
        imageUrl: options.imageUrl,
        link: {
          webUrl: options.webUrl || window.location.href,
          mobileWebUrl: options.webUrl || window.location.href
        }
      },
      buttons: options.webUrl ? [{
        title: options.buttonText || '자세히 보기',
        link: {
          webUrl: options.webUrl,
          mobileWebUrl: options.webUrl
        }
      }] : undefined
    }
  }
}

// 카카오 공유 분석을 위한 이벤트 타입
export interface KakaoShareEvent {
  template: KakaoShareTemplate
  success: boolean
  error?: string
  timestamp: Date
  userAgent: string
}