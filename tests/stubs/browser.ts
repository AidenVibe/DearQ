import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// MSW 워커 설정 - 브라우저 환경 (Storybook, 개발용)
export const worker = setupWorker(...handlers)