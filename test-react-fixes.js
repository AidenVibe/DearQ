const { chromium } = require('@playwright/test');

async function testReactFixes() {
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
    console.log('=== React 무한 루프 수정 검증 테스트 시작 ===\n');

    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:3010');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-homepage.png' });
    console.log('   ✅ 홈페이지 로드 완료\n');

    // 2. 로그인 페이지 테스트
    console.log('2. 로그인 페이지 테스트 중...');
    await page.goto('http://localhost:3010/login');
    await page.waitForLoadState('networkidle');
    
    // 카카오 로그인 버튼 확인
    const loginButton = await page.locator('text=카카오 로그인').first();
    if (await loginButton.isVisible()) {
      console.log('   ✅ 카카오 로그인 버튼 발견');
      await page.screenshot({ path: 'test-login-page.png' });
      
      // 로그인 버튼 클릭 (실제 로그인은 하지 않고 버튼 클릭만 테스트)
      await loginButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ 로그인 버튼 클릭 테스트 완료');
    } else {
      console.log('   ⚠️ 카카오 로그인 버튼을 찾을 수 없음');
    }
    console.log('');

    // 3. 라벨 관리 페이지 테스트
    console.log('3. 라벨 관리 페이지 테스트 중...');
    await page.goto('http://localhost:3010/labels');
    await page.waitForLoadState('networkidle');
    
    // 잠시 대기하여 React 렌더링 완료 확인
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-labels-page.png' });
    
    // 페이지 요소 확인
    const labelsTitle = await page.locator('h1, h2').filter({ hasText: /라벨|관리|labels/i }).first();
    if (await labelsTitle.isVisible()) {
      console.log('   ✅ 라벨 관리 페이지 제목 확인');
    }
    
    // 검색 기능 테스트 (있다면)
    const searchInput = await page.locator('input[type="text"], input[placeholder*="검색"]').first();
    if (await searchInput.isVisible()) {
      console.log('   ✅ 검색 입력창 발견');
      await searchInput.fill('테스트');
      await page.waitForTimeout(1000);
      await searchInput.clear();
      console.log('   ✅ 검색 기능 테스트 완료');
    }
    
    console.log('   ✅ 라벨 관리 페이지 테스트 완료\n');

    // 4. 히스토리 페이지 테스트
    console.log('4. 히스토리 페이지 테스트 중...');
    await page.goto('http://localhost:3010/history');
    await page.waitForLoadState('networkidle');
    
    // 잠시 대기하여 React 렌더링 완료 확인
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-history-page.png' });
    
    // 페이지 요소 확인
    const historyTitle = await page.locator('h1, h2').filter({ hasText: /히스토리|대화|history/i }).first();
    if (await historyTitle.isVisible()) {
      console.log('   ✅ 히스토리 페이지 제목 확인');
    }
    
    // 필터링 기능 테스트 (있다면)
    const filterButtons = await page.locator('button').filter({ hasText: /전체|필터|filter/i });
    const filterCount = await filterButtons.count();
    if (filterCount > 0) {
      console.log(`   ✅ 필터 버튼 ${filterCount}개 발견`);
      // 첫 번째 필터 버튼 클릭 테스트
      await filterButtons.first().click();
      await page.waitForTimeout(1000);
      console.log('   ✅ 필터 기능 테스트 완료');
    }
    
    console.log('   ✅ 히스토리 페이지 테스트 완료\n');

    // 5. 추가 인터랙션 테스트
    console.log('5. 추가 사용자 인터랙션 테스트 중...');
    
    // 모든 버튼 찾기
    const allButtons = await page.locator('button:visible');
    const buttonCount = await allButtons.count();
    console.log(`   발견된 버튼 수: ${buttonCount}개`);
    
    // 처음 몇 개 버튼 클릭 테스트 (최대 3개)
    const maxButtonsToTest = Math.min(3, buttonCount);
    for (let i = 0; i < maxButtonsToTest; i++) {
      try {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`   버튼 클릭 테스트: "${buttonText}"`);
        await button.click();
        await page.waitForTimeout(500);
      } catch (error) {
        console.log(`   버튼 클릭 실패: ${error.message}`);
      }
    }
    
    console.log('   ✅ 사용자 인터랙션 테스트 완료\n');

    // 6. 결과 분석
    console.log('=== 테스트 결과 분석 ===');
    
    // 에러 분석
    const reactErrors = errors.filter(error => 
      error.includes('Maximum update depth exceeded') ||
      error.includes('Cannot read properties of undefined') ||
      error.includes('React')
    );
    
    const consoleErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && (
        msg.text.includes('Maximum update depth exceeded') ||
        msg.text.includes('Cannot read properties of undefined') ||
        msg.text.includes('React')
      )
    );
    
    console.log(`\n총 페이지 에러: ${errors.length}개`);
    console.log(`React 관련 에러: ${reactErrors.length}개`);
    console.log(`콘솔 에러: ${consoleErrors.length}개`);
    
    if (reactErrors.length === 0 && consoleErrors.length === 0) {
      console.log('✅ React 무한 루프 문제가 해결된 것으로 보입니다!');
    } else {
      console.log('❌ 여전히 React 관련 에러가 존재합니다:');
      reactErrors.forEach(error => console.log(`   - ${error}`));
      consoleErrors.forEach(msg => console.log(`   - ${msg.text}`));
    }
    
    // 경고 메시지 확인
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    if (warnings.length > 0) {
      console.log(`\n⚠️ 경고 메시지 ${warnings.length}개 발견:`);
      warnings.forEach(warning => console.log(`   - ${warning.text}`));
    }
    
    console.log('\n=== 스크린샷 저장 위치 ===');
    console.log('- test-homepage.png: 홈페이지');
    console.log('- test-login-page.png: 로그인 페이지');
    console.log('- test-labels-page.png: 라벨 관리 페이지');
    console.log('- test-history-page.png: 히스토리 페이지');

  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testReactFixes();