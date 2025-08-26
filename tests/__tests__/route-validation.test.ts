/**
 * 라우트 검증 테스트
 * Next.js 앱의 모든 라우트에 대해 404 에러가 발생하지 않는지 체계적으로 검증
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

describe('라우트 검증 테스트', () => {
  const BASE_URL = 'http://localhost:3010'

  // HTTP 상태 확인 헬퍼 함수 (curl 사용)
  const checkRouteStatus = async (path: string): Promise<number> => {
    try {
      const { stdout } = await execAsync(`curl -I -s "${BASE_URL}${path}" | head -n 1`)
      const statusMatch = stdout.match(/HTTP\/[\d.]+\s+(\d+)/)
      return statusMatch ? parseInt(statusMatch[1], 10) : 500
    } catch (error) {
      console.error(`라우트 ${path} 테스트 중 오류:`, error)
      return 500
    }
  }

  describe('공개 라우트 검증', () => {
    test('랜딩 페이지 (/)가 정상적으로 응답한다', async () => {
      const status = await checkRouteStatus('/')
      expect(status).toBe(200)
    })

    test('로그인 페이지 (/login)가 정상적으로 응답한다', async () => {
      const status = await checkRouteStatus('/login')
      expect(status).toBe(200)
    })

    test('토큰 기반 답변 페이지 (/r/[token])가 정상적으로 응답한다', async () => {
      const testTokens = ['sample', 'test123', 'abc-def-ghi']
      
      for (const token of testTokens) {
        const status = await checkRouteStatus(`/r/${token}`)
        expect(status).toBe(200)
      }
    })
  })

  describe('인증 필요 라우트 검증', () => {
    // 클라이언트 사이드 인증이므로 서버에서는 200 응답 예상
    const protectedRoutes = [
      '/home',
      '/history', 
      '/labels',
      '/settings',
      '/weekly'
    ]

    test.each(protectedRoutes)('%s 라우트가 서버에서 정상 응답한다', async (route) => {
      const status = await checkRouteStatus(route)
      expect(status).toBe(200)
    })

    test('동적 대화 상세 라우트 (/conversation/[id])가 정상 응답한다', async () => {
      const testIds = ['sample', 'test456', '12345']
      
      for (const id of testIds) {
        const status = await checkRouteStatus(`/conversation/${id}`)
        expect(status).toBe(200)
      }
    })
  })

  describe('404 에러 처리 검증', () => {
    const invalidRoutes = [
      '/nonexistent',
      '/invalid/route',
      '/test404',
      '/api/nonexistent',
      '/random-path',
      '/home/invalid',
      '/conversation',  // ID 없는 대화 라우트
      '/r',            // 토큰 없는 답변 라우트
    ]

    test.each(invalidRoutes)('%s 라우트가 404 에러를 반환한다', async (route) => {
      const status = await checkRouteStatus(route)
      expect(status).toBe(404)
    })
  })

  describe('라우트 그룹별 검증', () => {
    test('모든 (auth) 그룹 라우트가 존재한다', async () => {
      const authRoutes = [
        '/home',
        '/history',
        '/labels', 
        '/settings',
        '/weekly',
        '/conversation/sample'
      ]

      const results = await Promise.all(
        authRoutes.map(async (route) => ({
          route,
          status: await checkRouteStatus(route)
        }))
      )

      results.forEach(({ route, status }) => {
        expect(status).toBe(200)
      })
    })

    test('(landing) 그룹 라우트가 정상 작동한다', async () => {
      const status = await checkRouteStatus('/')
      expect(status).toBe(200)
    })

    test('공개 라우트들이 정상 작동한다', async () => {
      const publicRoutes = ['/login', '/r/sample']
      
      const results = await Promise.all(
        publicRoutes.map(async (route) => ({
          route,
          status: await checkRouteStatus(route)
        }))
      )

      results.forEach(({ route, status }) => {
        expect(status).toBe(200)
      })
    })
  })

  describe('동적 라우트 매개변수 검증', () => {
    test('토큰 라우트가 다양한 형식의 토큰을 처리한다', async () => {
      const tokenFormats = [
        'simple-token',
        'token_with_underscore', 
        'token-with-dash',
        '123456',
        'abc123def',
        'very-long-token-name-with-multiple-parts'
      ]

      for (const token of tokenFormats) {
        const status = await checkRouteStatus(`/r/${token}`)
        expect(status).toBe(200)
      }
    })

    test('대화 ID 라우트가 다양한 형식의 ID를 처리한다', async () => {
      const idFormats = [
        '12345',
        'conv-123',
        'conversation_id',
        'uuid-like-string',
        'mixed123ABC'
      ]

      for (const id of idFormats) {
        const status = await checkRouteStatus(`/conversation/${id}`)
        expect(status).toBe(200)
      }
    })
  })

  describe('엣지 케이스 검증', () => {
    test('빈 경로 세그먼트가 올바르게 처리된다', async () => {
      const edgeCases = [
        { path: '/r/', expectedStatus: [404, 308] },      // 빈 토큰 (리다이렉트 또는 404)
        { path: '/conversation/', expectedStatus: [404, 308] },  // 빈 ID (리다이렉트 또는 404)
        { path: '///', expectedStatus: [404, 308, 200] },      // 다중 슬래시 (정리되어 / 로 이동)
        { path: '/r//test', expectedStatus: [404, 308] }, // 중간 빈 세그먼트
      ]

      // 이런 경우들은 404 또는 리다이렉트를 반환
      for (const { path, expectedStatus } of edgeCases) {
        const status = await checkRouteStatus(path)
        expect(expectedStatus).toContain(status)
      }
    })

    test('대소문자 구분이 올바르게 작동한다', async () => {
      // Next.js는 대소문자를 구분함
      const caseVariations = [
        { path: '/HOME', expected: 404 },
        { path: '/Login', expected: 404 },
        { path: '/home', expected: 200 },
        { path: '/login', expected: 200 }
      ]

      for (const { path, expected } of caseVariations) {
        const status = await checkRouteStatus(path)
        expect(status).toBe(expected)
      }
    })
  })
})