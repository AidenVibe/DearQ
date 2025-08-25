# 마음배달 (DearQ) 개발 할 일 목록

## 현재 진행 상황
- ✅ 프로젝트 기초 설정 완료 (2025-08-25)
  - Git 저장소 초기화
  - 프로젝트 디렉토리 구조 생성
  - package.json 및 의존성 설치
  - 환경 설정 파일 생성

## 다음 단계 - Phase 1: Foundation Setup

### 🔴 Red (실패 테스트 먼저) - 진행 중
- [ ] 카카오 로그인 버튼 테스트 작성 및 실패 확인
- [ ] MSW stub 핸들러 4가지 상태 구현 (success/failure/expired/empty)
- [ ] Jest 및 테스트 환경 설정

### 🟢 Green (최소 구현)
- [ ] 카카오 로그인 버튼 컴포넌트 구현
- [ ] 기본 레이아웃 및 라우팅 설정
- [ ] Stub API 응답으로 테스트 통과시키기

### ♻️ Refactor (개선)
- [ ] 컴포넌트 최적화 및 코드 정리
- [ ] 접근성 검토 (44px 터치 타겟, 4.5:1 대비율)
- [ ] 성능 최적화

## Phase 2: Core Flow Implementation
- [ ] 홈 화면 - 오늘의 질문 표시
- [ ] 보내기 모달 - 라벨 선택 및 공유
- [ ] 수신자 답변 화면 - 토큰 검증 및 답변 제출
- [ ] 대화 보기 - 자기표현 게이트 및 축하 애니메이션

## Phase 3: Enhancement Features  
- [ ] 라벨 관리 시스템
- [ ] 대화 히스토리
- [ ] 주간 하이라이트 카드
- [ ] 설정 화면

## 기술 요구사항 준수 사항
- 🎯 TDD 원칙: Red → Green → Refactor
- 🌐 한국어 출력: 모든 문서, 로그, 커밋 메시지
- 🎨 디자인: Primary-100 배경, 그라데이션 금지
- ♿ 접근성: 44px 터치 타겟, 4.5:1 대비율
- 🔒 보안: 2-800자 답변, 24시간 토큰 만료
- ⚡ 성능: TTI < 2.5s, Lighthouse 80+

## 참고 파일
- PRD: `참고/01.마음배달 PRD.md`
- 디자인: `참고/02.DearQ_design_system_guide.html` 
- 규칙: `참고/04.Rules.md`
- 질문: `참고/05.Questions.txt` (100개, 10개 카테고리)
- 참조 앱: `참고/00.family-conversation-app/`

## 중요 결정 사항
- Next.js 15 + React 19 + Tailwind CSS v4 + shadcn/ui
- MSW 4-state stub pattern (success/failure/expired/empty)
- 카카오 OAuth + returnTo 파라미터 세션 복구
- 1회용 토큰 24시간 TTL + 즉시 무효화
- 라벨 기반 가족 시스템 (페어링 없음)
- 자기표현 게이트 (상대방 답변 블러 처리)

---
*최종 업데이트: 2025-08-25*