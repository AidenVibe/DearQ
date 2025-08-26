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

### ✅ Phase 3 완료 (2025-08-25)
- **보내기 모달 구현**: TDD로 완전한 SendModal 컴포넌트 개발
- **라벨 선택 시스템**: 확인된 라벨만 표시, 최근 사용 우선 정렬
- **다단계 모달**: 라벨 선택 → 가족 추가 → 공유 → 에러 처리
- **공유 기능**: 카카오톡 공유, 링크 복사 (개발용 구현)
- **MSW stub 확장**: 라벨 CRUD, 질문 전송 API 추가
- **접근성 준수**: 44px 터치 타겟, 키보드 네비게이션

### ✅ Phase 4 완료 (2025-08-25)  
- **수신자 답변 화면**: TDD로 완전한 AnswerPage 컴포넌트 개발
- **토큰 검증 시스템**: 유효/만료/무효 상태 처리
- **답변 제출 폼**: 2-800자 제한, 실시간 유효성 검사
- **5가지 상태 관리**: 로딩/폼/성공/에러/만료/무효
- **MSW stub 확장**: 토큰 검증(GET), 답변 제출(POST) API
- **접근성 준수**: 44px 터치 타겟, 폼 라벨링

### ✅ Phase 5 완료 (2025-08-25)
- **대화 보기 화면**: TDD로 완전한 ConversationPage 컴포넌트 개발
- **자기표현 게이트**: 자기 답변 후 상대방 답변 해제 로직
- **축하 애니메이션**: 대화 연결 시 3초간 축하 효과
- **시간순 대화**: 모든 답변을 시간순으로 정렬하여 표시
- **시각적 구분**: 자기/상대방 답변 명확한 구분 (ml-8/mr-8)
- **MSW stub 확장**: 대화 조회, 자기 답변 추가 API
- **5가지 상태 관리**: 로딩/로드됨/에러/404/권한 없음

### ✅ Phase 6 완료 (2025-08-25)
- **라벨 관리 시스템**: TDD로 완전한 LabelManagement 컴포넌트 개발
- **CRUD 기능**: 라벨 생성, 수정, 삭제, 고정 기능
- **검색 및 필터**: 이름 검색, 관계 유형별 필터링, 정렬 옵션
- **접근성 준수**: 44px 터치 타겟, 키보드 네비게이션, 라벨 연결
- **대화 히스토리**: TDD로 완전한 ConversationHistory 컴포넌트 개발
- **필터링 시스템**: 상태, 카테고리, 날짜, 보관함, 즐겨찾기 필터
- **인터랙션**: 즐겨찾기/보관함 토글, 대화 클릭 이벤트
- **날짜 그룹핑**: 활동 시간 기준 자동 그룹핑 및 정렬

## Phase 7: Enhancement Features

## Phase 7: Enhancement Features  
- [ ] 주간 하이라이트 카드
- [ ] 설정 화면
- [ ] 푸시 알림

## 현재 테스트 현황 ✅
```
Test Suites: 8 passed, 8 total
Tests: 95 passed, 95 total
✓ LoginButton (4 tests)
✓ Questions Library (15 tests) 
✓ HomePage (8 tests)
✓ SendModal (10 tests) 
✓ AnswerPage (13 tests) 
✓ ConversationPage (14 tests)
✓ LabelManagement (13 tests) - NEW!
✓ ConversationHistory (18 tests) - NEW!
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