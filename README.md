# 마음배달 (DearQ)

> 매일 하나의 질문으로 가족의 마음을 배달합니다

## 프로젝트 개요
가족 구성원들이 매일 하나의 질문을 통해 자연스럽고 깊이 있는 대화를 나눌 수 있도록 돕는 웹 애플리케이션입니다.

## 핵심 기능
- 📱 카카오 로그인
- ❓ 매일 새로운 질문 (100개, 10개 카테고리)  
- 🏷️ 라벨 기반 가족 관리 (페어링 없음)
- 🔒 자기표현 게이트 (상대방 답변 블러)
- 🎁 1회용 답변 토큰 (24시간)
- 📊 주간 하이라이트 카드

## 기술 스택
- **프레임워크**: Next.js 15, React 19
- **스타일링**: Tailwind CSS v4, shadcn/ui
- **테스팅**: Jest, React Testing Library, MSW, Playwright
- **도구**: TypeScript, Storybook

## 개발 원칙
- 🔴 **TDD**: Red → Green → Refactor
- 🌐 **한국어 우선**: 모든 문서, 로그, 커밋 메시지  
- ♿ **접근성**: 44px 터치 타겟, 4.5:1 대비율
- ⚡ **성능**: TTI < 2.5s, Lighthouse 80+
- 🎨 **디자인**: Primary-100 배경, 그라데이션 금지

## 설치 및 실행

### 1. 환경 설정
```bash
cp .env.example .env.local
# .env.local 파일에서 KAKAO_REST_KEY 설정
```

### 2. 의존성 설치
```bash
npm install --legacy-peer-deps
```

### 3. 개발 서버 실행  
```bash
npm run dev
```

### 4. 테스트 실행
```bash
npm run test        # Jest 단위 테스트
npm run test:e2e    # Playwright E2E 테스트
npm run storybook   # Storybook UI 컴포넌트
```

## API Stub 시나리오
개발 단계에서 4가지 시나리오로 API 동작을 시뮬레이션합니다:

- `?scenario=success`: 정상 응답
- `?scenario=failure`: 서버 오류  
- `?scenario=expired`: 토큰 만료
- `?scenario=empty`: 빈 데이터

## 프로젝트 구조
```
DearQ/
├── app/             # Next.js App Router 페이지
├── components/      # 재사용 가능한 컴포넌트  
├── lib/            # 유틸리티 함수
├── types/          # TypeScript 타입 정의
├── hooks/          # 커스텀 훅
├── tests/          # 테스트 파일
│   ├── __tests__/  # 단위 테스트
│   ├── __mocks__/  # Mock 파일
│   ├── e2e/        # E2E 테스트
│   └── stubs/      # MSW 핸들러
├── docs/           # 문서
├── 참고/           # 프로젝트 참고 자료
└── public/         # 정적 파일
```

## 참고 자료
- [PRD](./참고/01.마음배달%20PRD.md) - 제품 요구사항 문서
- [디자인 가이드](./참고/02.DearQ_design_system_guide.html) - 디자인 시스템
- [개발 규칙](./참고/04.Rules.md) - 개발 표준 및 규칙  
- [질문 목록](./참고/05.Questions.txt) - 100개 질문 데이터

---
*개발 시작: 2025-08-25*