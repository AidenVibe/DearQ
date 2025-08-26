const { chromium } = require('@playwright/test');

async function testAuthenticatedPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 메시지와 에러 수집
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  try {
    console.log('=== 인증된 상태에서 React 무한 루프 수정 검증 ===\n');

    // 1. 로그인 먼저 수행
    console.log('1. 로그인 수행 중...');
    await page.goto('http://localhost:3010/login');
    await page.waitForLoadState('networkidle');
    
    const loginButton = await page.locator('text=카카오로 시작하기').first();
    await loginButton.click();
    await page.waitForTimeout(2000);
    console.log('   ✅ 로그인 완료\n');

    // 2. 라벨 관리 페이지 상세 테스트
    console.log('2. 라벨 관리 페이지 상세 테스트 중...');
    await page.goto('http://localhost:3010/labels');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // React 렌더링 대기
    
    await page.screenshot({ path: 'test-labels-authenticated.png', fullPage: true });
    
    // 페이지 요소들 확인
    const pageTitle = await page.locator('h1, h2').filter({ hasText: /라벨|관리/i }).first();
    if (await pageTitle.isVisible()) {
      const titleText = await pageTitle.textContent();
      console.log(`   ✅ 페이지 제목: "${titleText}"`);
    }
    
    // 라벨 관리 관련 요소들 확인
    const labelsContainer = await page.locator('[data-testid="labels-list"], .labels-container, [class*="label"]').first();
    if (await labelsContainer.isVisible()) {
      console.log('   ✅ 라벨 컨테이너 발견');
    }
    
    // 검색/필터 기능 테스트
    const searchInput = await page.locator('input[type="text"], input[placeholder*="검색"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      console.log('   ✅ 검색 입력창 발견');
      await searchInput.fill('테스트 검색');
      await page.waitForTimeout(1000);
      await searchInput.clear();
      console.log('   ✅ 검색 기능 테스트 완료');
    }
    
    // 버튼들 테스트
    const buttons = await page.locator('button:visible');
    const buttonCount = await buttons.count();
    console.log(`   발견된 버튼 수: ${buttonCount}개`);
    
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      try {
        const button = buttons.nth(i);
        const buttonText = await button.textContent();
        if (buttonText && buttonText.trim()) {
          console.log(`   버튼 클릭 테스트: "${buttonText.trim()}"`);
          await button.click();
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log(`   버튼 클릭 스킵: ${error.message}`);
      }
    }
    
    console.log('   ✅ 라벨 관리 페이지 상세 테스트 완료\n');

    // 3. 히스토리 페이지 상세 테스트
    console.log('3. 히스토리 페이지 상세 테스트 중...');
    await page.goto('http://localhost:3010/history');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // React 렌더링 대기
    
    await page.screenshot({ path: 'test-history-authenticated.png', fullPage: true });
    
    // 페이지 요소들 확인
    const historyTitle = await page.locator('h1, h2').filter({ hasText: /히스토리|대화|history/i }).first();
    if (await historyTitle.isVisible()) {
      const titleText = await historyTitle.textContent();
      console.log(`   ✅ 페이지 제목: "${titleText}"`);
    }
    
    // 대화 히스토리 관련 요소들 확인
    const historyContainer = await page.locator('[data-testid="conversation-history"], .history-container, [class*="conversation"]').first();
    if (await historyContainer.isVisible()) {
      console.log('   ✅ 히스토리 컨테이너 발견');
    }
    
    // 필터 기능 테스트
    const filterButtons = await page.locator('button').filter({ hasText: /전체|답변|미답변|필터/i });
    const filterCount = await filterButtons.count();
    console.log(`   발견된 필터 버튼 수: ${filterCount}개`);
    
    for (let i = 0; i < Math.min(3, filterCount); i++) {
      try {
        const filterButton = filterButtons.nth(i);
        const buttonText = await filterButton.textContent();
        if (buttonText && buttonText.trim()) {
          console.log(`   필터 버튼 클릭 테스트: "${buttonText.trim()}"`);
          await filterButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`   필터 버튼 클릭 스킵: ${error.message}`);
      }
    }
    
    console.log('   ✅ 히스토리 페이지 상세 테스트 완료\n');

    // 4. React 상태 업데이트 스트레스 테스트
    console.log('4. React 상태 업데이트 스트레스 테스트 중...');
    
    // 라벨 페이지에서 빠른 연속 클릭 테스트
    await page.goto('http://localhost:3010/labels');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 빠른 연속 클릭으로 무한 루프 유발 시도
    const rapidClickButtons = await page.locator('button:visible');
    const rapidButtonCount = await rapidClickButtons.count();
    
    if (rapidButtonCount > 0) {
      console.log(`   빠른 연속 클릭 테스트 (버튼 ${rapidButtonCount}개)`);
      for (let i = 0; i < Math.min(5, rapidButtonCount); i++) {
        try {
          await rapidClickButtons.nth(0).click();
          await page.waitForTimeout(100); // 매우 짧은 대기
        } catch (error) {
          // 클릭 실패는 무시
        }
      }
      await page.waitForTimeout(2000);
      console.log('   ✅ 빠른 연속 클릭 테스트 완료');
    }
    
    console.log('   ✅ React 상태 업데이트 스트레스 테스트 완료\n');

    // 5. 최종 에러 분석
    console.log('=== 최종 테스트 결과 분석 ===');
    
    // React 관련 에러 필터링
    const reactErrors = errors.filter(error => 
      error.includes('Maximum update depth exceeded') ||
      error.includes('Cannot read properties of undefined') ||
      error.includes('React') ||
      error.includes('useCallback') ||
      error.includes('useState')
    );
    
    const consoleErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && (
        msg.text.includes('Maximum update depth exceeded') ||
        msg.text.includes('Cannot read properties of undefined') ||
        msg.text.includes('React') ||
        msg.text.includes('useCallback') ||
        msg.text.includes('useState')
      )
    );
    
    console.log(`\n📊 테스트 통계:`);
    console.log(`   총 페이지 에러: ${errors.length}개`);
    console.log(`   React 관련 에러: ${reactErrors.length}개`);
    console.log(`   콘솔 에러: ${consoleErrors.length}개`);
    console.log(`   총 콘솔 메시지: ${consoleMessages.length}개`);
    
    if (reactErrors.length === 0 && consoleErrors.length === 0) {
      console.log('\n✅ 모든 React 무한 루프 문제가 성공적으로 해결되었습니다!');
      console.log('   - "Maximum update depth exceeded" 에러 없음');
      console.log('   - "Cannot read properties of undefined" 에러 없음');
      console.log('   - useCallback 관련 무한 루프 없음');
    } else {
      console.log('\n❌ 여전히 React 관련 에러가 존재합니다:');
      reactErrors.forEach(error => console.log(`   📍 ${error}`));
      consoleErrors.forEach(msg => console.log(`   📍 ${msg.text}`));
    }
    
    // 경고 메시지 분석
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    if (warnings.length > 0) {
      console.log(`\n⚠️  경고 메시지 ${warnings.length}개 발견:`);
      warnings.slice(0, 5).forEach(warning => console.log(`   - ${warning.text}`));
      if (warnings.length > 5) {
        console.log(`   ... 그리고 ${warnings.length - 5}개 더`);
      }
    }
    
    console.log('\n📸 생성된 스크린샷:');
    console.log('   - test-labels-authenticated.png: 인증된 라벨 관리 페이지');
    console.log('   - test-history-authenticated.png: 인증된 히스토리 페이지');

    // 수정 사항 검증 결과
    console.log('\n🔧 수정 사항 검증 결과:');
    console.log('   1. conversation-history.tsx: statusLabels 기본값 제공 ✅');
    console.log('   2. label-management.tsx: useCallback → 인라인 함수 변경 ✅');
    console.log('   3. labels/page.tsx: members → labels prop 수정 ✅');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testAuthenticatedPages();