# 마음배달 (DearQ) 개발 할 일 목록

## 현재 진행 상황

### ✅ Phase 1 완료 (2025-08-25)
- Git 저장소 초기화 및 프로젝트 구조 생성
- TDD 환경 구축 (Jest + React Testing Library)
- LoginButton 컴포넌트 TDD 사이클 완료
- 접근성 기준 준수 (44px 터치 타겟, 키보드 네비게이션)

### ✅ Phase 2 완료 (2025-08-25)
- **질문 데이터 모델 설계**: 100개 질문, 10개 카테고리 구조화
- **홈 화면 구현**: TDD로 완전한 홈 페이지 컴포넌트 개발
- **질문 라이브러리**: 검색, 필터링, 랜덤 선택, 날짜별 고정 질문
- **스테퍼 UI**: 3단계 진행 상태 (보내기 → 답변 → 대화보기)
- **MSW Stub API**: 4-state 패턴으로 모든 시나리오 지원

## Phase 3: 다음 구현 예정
- [ ] 보내기 모달 - 라벨 선택 및 공유
- [ ] 수신자 답변 화면 - 토큰 검증 및 답변 제출
- [ ] 대화 보기 - 자기표현 게이트 및 축하 애니메이션
- [ ] 라벨 관리 시스템

## Phase 4: Enhancement Features  
- [ ] 대화 히스토리
- [ ] 주간 하이라이트 카드
- [ ] 설정 화면

## 현재 테스트 현황 ✅
```
Test Suites: 3 passed, 3 total
Tests: 27 passed, 27 total
✓ LoginButton (4 tests)
✓ Questions Library (15 tests) 
✓ HomePage (8 tests)
```

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