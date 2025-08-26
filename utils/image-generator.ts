import html2canvas from 'html2canvas'
import { WeeklyHighlight, WeeklyImageData, ShareImageOptions } from '@/types/weekly-highlight'

export interface ImageGenerationOptions {
  scale?: number
  quality?: number
  format?: 'png' | 'jpeg'
  backgroundColor?: string
  width?: number
  height?: number
}

export class ImageGenerator {
  private static readonly DEFAULT_OPTIONS: ImageGenerationOptions = {
    scale: 2,
    quality: 0.9,
    format: 'png',
    backgroundColor: '#f8fafc', // primary-50
    width: 800,
    height: 1200
  }

  /**
   * HTML 요소를 이미지로 변환
   */
  static async generateFromElement(
    element: HTMLElement,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<WeeklyImageData> {
    const config = { ...this.DEFAULT_OPTIONS, ...options }
    
    try {
      // 웹폰트 로딩 대기
      await this.waitForFonts()
      
      const canvas = await html2canvas(element, {
        scale: config.scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: config.backgroundColor,
        width: config.width,
        height: config.height,
        windowWidth: config.width,
        windowHeight: config.height,
        logging: false, // 프로덕션에서 로깅 비활성화
        imageTimeout: 30000, // 30초 타임아웃
        onclone: (clonedDoc) => {
          // 클론된 문서에서 불필요한 요소 제거
          const clonedElement = clonedDoc.querySelector('[data-image-target]')
          if (clonedElement) {
            // 공유 버튼 등 이미지에 포함하지 않을 요소들 숨김
            const shareButtons = clonedElement.querySelectorAll('[data-exclude-from-image="true"]')
            shareButtons.forEach(button => {
              (button as HTMLElement).style.display = 'none'
            })
          }
        }
      })

      // Blob 생성
      const blob = await this.canvasToBlob(canvas, config.format!, config.quality!)
      const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality)
      const filename = this.generateFilename(config.format!)

      return {
        dataUrl,
        blob,
        filename,
        size: blob.size
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error)
      throw new Error('이미지 생성 중 문제가 발생했습니다. 다시 시도해주세요.')
    }
  }

  /**
   * 주간 하이라이트 전용 이미지 생성
   */
  static async generateWeeklyHighlight(
    element: HTMLElement,
    highlight: WeeklyHighlight,
    options: Partial<ShareImageOptions> = {}
  ): Promise<WeeklyImageData> {
    const imageOptions: Partial<ImageGenerationOptions> = {
      format: options.format || 'png',
      quality: options.quality || 0.9,
      width: options.width || 800,
      height: options.height || 1200,
      scale: 2
    }

    const imageData = await this.generateFromElement(element, imageOptions)

    // 파일명을 주간 하이라이트 정보로 커스터마이징
    const weekStart = new Date(highlight.weekStart)
    const year = weekStart.getFullYear()
    const week = this.getWeekNumber(weekStart)
    const customFilename = `weekly_highlight_${year}_${week}.${imageOptions.format}`

    return {
      ...imageData,
      filename: customFilename
    }
  }

  /**
   * 파일 다운로드 실행
   */
  static downloadImage(imageData: WeeklyImageData): void {
    try {
      const url = URL.createObjectURL(imageData.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = imageData.filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 메모리 정리
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('파일 다운로드 실패:', error)
      throw new Error('파일 다운로드 중 문제가 발생했습니다.')
    }
  }

  /**
   * 이미지를 Base64 Data URL로 업로드 (임시 서버 업로드 시뮬레이션)
   */
  static async uploadImageToServer(imageData: WeeklyImageData): Promise<string> {
    // 실제 구현에서는 서버 업로드 API 호출
    // 현재는 Data URL을 그대로 반환 (개발용)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(imageData.dataUrl)
      }, 1000) // 업로드 시뮬레이션
    })
  }

  // Private 유틸리티 메서드들

  private static async waitForFonts(): Promise<void> {
    if ('fonts' in document) {
      try {
        await document.fonts.ready
        // 추가로 100ms 대기 (웹폰트 완전 로딩 보장)
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn('웹폰트 로딩 대기 중 오류:', error)
      }
    }
  }

  private static canvasToBlob(
    canvas: HTMLCanvasElement, 
    format: string, 
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Blob 생성 실패'))
        }
      }, `image/${format}`, quality)
    })
  }

  private static generateFilename(format: string): string {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `weekly_highlight_${timestamp}.${format}`
  }

  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
}

// 에러 타입 정의
export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public code: 'ELEMENT_NOT_FOUND' | 'CANVAS_ERROR' | 'BLOB_ERROR' | 'DOWNLOAD_ERROR' | 'UPLOAD_ERROR'
  ) {
    super(message)
    this.name = 'ImageGenerationError'
  }
}

// 이미지 생성 상태 관리를 위한 타입
export interface ImageGenerationState {
  isGenerating: boolean
  progress: number // 0-100
  error: string | null
  generatedImage: WeeklyImageData | null
}

// 이미지 최적화 유틸리티
export class ImageOptimizer {
  /**
   * 이미지 크기 최적화
   */
  static optimizeForPlatform(
    imageData: WeeklyImageData, 
    platform: 'kakao' | 'instagram' | 'facebook'
  ): Promise<WeeklyImageData> {
    const platformSpecs = {
      kakao: { width: 800, height: 800, quality: 0.8 },
      instagram: { width: 1080, height: 1080, quality: 0.9 },
      facebook: { width: 1200, height: 630, quality: 0.85 }
    }

    // 실제 구현에서는 canvas 리사이징 로직 추가
    return Promise.resolve(imageData)
  }

  /**
   * 파일 크기 최적화
   */
  static async compressImage(
    imageData: WeeklyImageData, 
    maxSizeKB: number = 500
  ): Promise<WeeklyImageData> {
    if (imageData.size <= maxSizeKB * 1024) {
      return imageData
    }

    // 실제 구현에서는 Canvas API를 사용한 압축 로직 추가
    // 현재는 품질을 줄여서 재생성하는 방식으로 시뮬레이션
    return imageData
  }
}