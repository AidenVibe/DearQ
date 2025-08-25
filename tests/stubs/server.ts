import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// MSW 서버 설정 - Node.js 환경 (Jest 테스트용)
export const server = setupServer(...handlers)