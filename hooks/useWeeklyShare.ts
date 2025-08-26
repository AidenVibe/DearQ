import { useState, useCallback, useRef } from 'react'
import { WeeklyHighlight, ShareStatus, WeeklyImageData } from '@/types/weekly-highlight'
import { ImageGenerator, ImageGenerationError } from '@/utils/image-generator'
import { useKakaoShare, KakaoTemplateBuilder } from './useKakaoShare'

export interface WeeklyShareOptions {
  kakaoAppKey?: string
  enableImageGeneration?: boolean
  maxImageSizeKB?: number
  imageFormat?: 'png' | 'jpeg'
  imageQuality?: number
}

export interface WeeklyShareState {
  status: ShareStatus
  generatedImage: WeeklyImageData | null
  progress: number
  error: string | null
  lastSharedAt: Date | null
}

const DEFAULT_OPTIONS: Required<WeeklyShareOptions> = {
  kakaoAppKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '',
  enableImageGeneration: true,
  maxImageSizeKB: 500,
  imageFormat: 'png',
  imageQuality: 0.9
}

export function useWeeklyShare(options: Partial<WeeklyShareOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const imageElementRef = useRef<HTMLElement | null>(null)
  
  const [state, setState] = useState<WeeklyShareState>({
    status: 'idle',
    generatedImage: null,
    progress: 0,
    error: null,
    lastSharedAt: null
  })

  const kakaoShare = useKakaoShare({ 
    appKey: config.kakaoAppKey 
  })

  /**
   * 이미지 생성 대상 요소 설정
   */
  const setImageElement = useCallback((element: HTMLElement | null) => {
    imageElementRef.current = element
  }, [])

  /**
   * 주간 하이라이트 이미지 생성
   */
  const generateImage = useCallback(async (
    highlight: WeeklyHighlight
  ): Promise<WeeklyImageData | null> => {
    if (!config.enableImageGeneration) {
      throw new ImageGenerationError('이미지 생성이 비활성화되었습니다.', 'CANVAS_ERROR')
    }

    if (!imageElementRef.current) {
      throw new ImageGenerationError('이미지 생성 대상 요소를 찾을 수 없습니다.', 'ELEMENT_NOT_FOUND')
    }

    try {
      setState(prev => ({ 
        ...prev, 
        status: 'generating-image', 
        progress: 0, 
        error: null 
      }))

      // 진행률 업데이트 시뮬레이션
      const progressInterval = setInterval(() => {
        setState(prev => ({ 
          ...prev, 
          progress: Math.min(prev.progress + 10, 90) 
        }))
      }, 200)

      const imageData = await ImageGenerator.generateWeeklyHighlight(
        imageElementRef.current,
        highlight,
        {
          format: config.imageFormat,
          quality: config.imageQuality,
          width: 800,
          height: 1200
        }
      )

      clearInterval(progressInterval)

      setState(prev => ({ 
        ...prev, 
        status: 'idle',
        progress: 100,
        generatedImage: imageData,
        error: null 
      }))

      return imageData
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : '이미지 생성에 실패했습니다.' 
      }))
      
      throw error
    }
  }, [config.enableImageGeneration, config.imageFormat, config.imageQuality])

  /**
   * 이미지 다운로드
   */
  const downloadImage = useCallback(async (
    highlight: WeeklyHighlight
  ): Promise<boolean> => {
    try {
      let imageData = state.generatedImage

      // 이미지가 생성되지 않은 경우 생성
      if (!imageData) {
        imageData = await generateImage(highlight)
        if (!imageData) return false
      }

      // 파일 다운로드 실행
      ImageGenerator.downloadImage(imageData)

      setState(prev => ({ 
        ...prev, 
        lastSharedAt: new Date(),
        error: null 
      }))

      return true
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '다운로드에 실패했습니다.' 
      }))
      return false
    }
  }, [state.generatedImage, generateImage])

  /**
   * 카카오톡 공유
   */
  const shareToKakao = useCallback(async (
    highlight: WeeklyHighlight
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, status: 'sharing', error: null }))

      // 이미지 생성 (필요한 경우)
      let imageUrl: string | undefined
      if (config.enableImageGeneration) {
        let imageData = state.generatedImage
        
        if (!imageData) {
          imageData = await generateImage(highlight)
        }

        if (imageData) {
          // 실제 서비스에서는 이미지를 서버에 업로드하고 URL을 받아야 함
          // 현재는 개발 환경이므로 Data URL 사용
          imageUrl = await ImageGenerator.uploadImageToServer(imageData)
        }
      }

      // 카카오 공유 템플릿 생성
      const template = KakaoTemplateBuilder.createWeeklyHighlight(
        highlight.shareData.title,
        highlight.shareData.description,
        imageUrl,
        `${window.location.origin}/weekly/${highlight.id}`
      )

      // 카카오톡 공유 실행
      const success = await kakaoShare.shareFeed(template)

      if (success) {
        setState(prev => ({ 
          ...prev, 
          status: 'completed',
          lastSharedAt: new Date(),
          error: null 
        }))
        return true
      } else {
        setState(prev => ({ 
          ...prev, 
          status: 'failed',
          error: kakaoShare.error || '공유에 실패했습니다.' 
        }))
        return false
      }
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      setState(prev => ({ 
        ...prev, 
        status: 'failed',
        error: error instanceof Error ? error.message : '공유에 실패했습니다.' 
      }))
      return false
    }
  }, [
    config.enableImageGeneration, 
    state.generatedImage, 
    generateImage, 
    kakaoShare
  ])

  /**
   * 다른 플랫폼 공유 (Web Share API 또는 복사)
   */
  const shareToOther = useCallback(async (
    highlight: WeeklyHighlight,
    platform?: 'clipboard' | 'native'
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, status: 'sharing', error: null }))

      const shareData = {
        title: highlight.shareData.title,
        text: `${highlight.shareData.description}\n\n${highlight.shareData.hashtags.map(tag => `#${tag}`).join(' ')}`,
        url: `${window.location.origin}/weekly/${highlight.id}`
      }

      if (platform === 'clipboard' || !navigator.share) {
        // 클립보드에 복사
        const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        await navigator.clipboard.writeText(textToCopy)
        
        setState(prev => ({ 
          ...prev, 
          status: 'completed',
          lastSharedAt: new Date(),
          error: null 
        }))
        return true
      } else {
        // Web Share API 사용
        await navigator.share(shareData)
        
        setState(prev => ({ 
          ...prev, 
          status: 'completed',
          lastSharedAt: new Date(),
          error: null 
        }))
        return true
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 사용자가 공유를 취소한 경우
        setState(prev => ({ ...prev, status: 'idle' }))
        return false
      }

      console.error('공유 실패:', error)
      setState(prev => ({ 
        ...prev, 
        status: 'failed',
        error: '공유에 실패했습니다.' 
      }))
      return false
    }
  }, [])

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      generatedImage: null,
      progress: 0,
      error: null,
      lastSharedAt: null
    })
  }, [])

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, status: 'idle' }))
    kakaoShare.clearError()
  }, [kakaoShare])

  /**
   * 공유 기능 사용 가능 여부
   */
  const canShare = {
    kakao: kakaoShare.canShare && !!config.kakaoAppKey,
    download: config.enableImageGeneration,
    native: !!navigator.share,
    clipboard: !!navigator.clipboard
  }

  return {
    // 상태
    ...state,
    isKakaoReady: kakaoShare.isInitialized,
    
    // 기능 사용 가능 여부
    canShare,
    
    // 이미지 관련
    setImageElement,
    generateImage,
    downloadImage,
    
    // 공유 기능
    shareToKakao,
    shareToOther,
    
    // 유틸리티
    reset,
    clearError
  }
}

// 공유 이벤트 추적을 위한 타입
export interface WeeklyShareAnalytics {
  highlightId: string
  shareMethod: 'kakao' | 'download' | 'native' | 'clipboard'
  success: boolean
  error?: string
  imageGenerated: boolean
  timestamp: Date
  userAgent: string
}