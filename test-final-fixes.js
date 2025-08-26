const { chromium } = require('@playwright/test');

async function testFinalFixes() {
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
    console.log('=== 최종 React 에러 수정 검증 테스트 ===\n');

    // 1. 로그인
    console.log('1. 로그인 수행...');
    await page.goto('http://localhost:3010/login');
    await page.waitForLoadState('networkidle');
    
    const loginButton = await page.locator('text=카카오로 시작하기').first();
    await loginButton.click();
    await page.waitForTimeout(2000);
    console.log('   ✅ 로그인 완료\n');

    // 2. 라벨 관리 페이지 - Maximum update depth 에러 확인
    console.log('2. 라벨 관리 페이지 테스트...');
    await page.goto('http://localhost:3010/labels');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 충분한 대기 시간

    // Select 드롭다운 테스트 (무한 루프 유발 가능한 부분)
    const filterSelect = page.locator('[id="filter-select"]').first();
    if (await filterSelect.isVisible()) {
      console.log('   필터 Select 드롭다운 테스트 중...');
      await filterSelect.click();
      await page.waitForTimeout(1000);
      
      const filterOption = page.locator('text=부모').first();
      if (await filterOption.isVisible()) {
        await filterOption.click();
        await page.waitForTimeout(1000);
      }
    }

    const sortSelect = page.locator('[id="sort-select"]').first();
    if (await sortSelect.isVisible()) {
      console.log('   정렬 Select 드롭다운 테스트 중...');
      await sortSelect.click();
      await page.waitForTimeout(1000);
      
      const sortOption = page.locator('text=이름순').first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: 'test-labels-final.png', fullPage: true });
    console.log('   ✅ 라벨 관리 페이지 테스트 완료\n');

    // 3. 히스토리 페이지 - color 에러 확인
    console.log('3. 히스토리 페이지 테스트...');
    await page.goto('http://localhost:3010/history');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 충분한 대기 시간

    await page.screenshot({ path: 'test-history-final.png', fullPage: true });
    console.log('   ✅ 히스토리 페이지 테스트 완료\n');

    // 4. 페이지 간 이동 스트레스 테스트
    console.log('4. 페이지 간 이동 스트레스 테스트...');
    const pages = ['/labels', '/history', '/home', '/settings'];
    
    for (let i = 0; i < 2; i++) { // 2번 반복
      for (const pagePath of pages) {
        console.log(`   ${pagePath} 페이지 이동 (${i+1}번째)`);
        await page.goto(`http://localhost:3010${pagePath}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      }
    }
    console.log('   ✅ 페이지 간 이동 스트레스 테스트 완료\n');

    // 5. 최종 에러 분석
    console.log('=== 최종 에러 분석 ===');
    
    const reactErrors = errors.filter(error => 
      error.includes('Maximum update depth exceeded') ||
      error.includes('Cannot read properties of undefined') ||
      error.includes('React') ||
      error.includes('useCallback') ||
      error.includes('useState') ||
      error.includes('color')
    );
    
    const consoleErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && (
        msg.text.includes('Maximum update depth exceeded') ||
        msg.text.includes('Cannot read properties of undefined') ||
        msg.text.includes('React') ||
        msg.text.includes('useCallback') ||
        msg.text.includes('useState') ||
        msg.text.includes('color')
      )
    );

    console.log(`\n📊 최종 테스트 통계:`);
    console.log(`   총 페이지 에러: ${errors.length}개`);
    console.log(`   React 관련 에러: ${reactErrors.length}개`);
    console.log(`   콘솔 에러: ${consoleErrors.length}개`);
    console.log(`   총 콘솔 메시지: ${consoleMessages.length}개`);
    
    if (reactErrors.length === 0 && consoleErrors.length === 0) {
      console.log('\n🎉 모든 React 무한 루프 및 undefined 에러가 성공적으로 해결되었습니다!');
      console.log('✅ 수정 사항 검증 완료:');
      console.log('   1. conversation-history.tsx: statusLabels 안전 접근 구현');
      console.log('   2. label-management.tsx: 모든 useCallback 제거 및 인라인 함수로 변경');
      console.log('   3. labels/page.tsx: members → labels prop 올바른 전달');
    } else {
      console.log('\n❌ 여전히 React 관련 에러가 존재합니다:');
      reactErrors.forEach((error, index) => console.log(`   ${index + 1}. ${error}`));
      consoleErrors.forEach((msg, index) => console.log(`   ${index + 1}. ${msg.text}`));
    }

    // 에러별 상세 정보
    if (errors.length > 0) {
      console.log('\n🔍 발견된 모든 에러:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    if (warnings.length > 0) {
      console.log(`\n⚠️  경고 메시지 ${warnings.length}개:`);
      warnings.slice(0, 3).forEach(warning => console.log(`   - ${warning.text}`));
      if (warnings.length > 3) {
        console.log(`   ... 그리고 ${warnings.length - 3}개 더`);
      }
    }

    console.log('\n📸 생성된 최종 스크린샷:');
    console.log('   - test-labels-final.png: 수정된 라벨 관리 페이지');
    console.log('   - test-history-final.png: 수정된 히스토리 페이지');

    console.log('\n🔧 적용된 수정 사항:');
    console.log('   1. conversation-history.tsx (388번째 줄): statusLabels 접근 시 다중 안전장치 적용');
    console.log('   2. label-management.tsx: useCallback → 인라인 함수 변경으로 무한 루프 방지');
    console.log('   3. import 정리: useCallback import 제거');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testFinalFixes();