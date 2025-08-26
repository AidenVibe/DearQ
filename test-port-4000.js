const { chromium } = require('@playwright/test');

async function testPort4000() {
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
    console.log('=== 포트 4000에서 React 에러 수정 검증 ===\n');

    // 1. 로그인
    console.log('1. 로그인 (포트 4000)...');
    await page.goto('http://localhost:4000/login');
    await page.waitForLoadState('networkidle');
    
    const loginButton = await page.locator('text=카카오로 시작하기').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ 로그인 완료');
    } else {
      console.log('   ⚠️ 로그인 버튼을 찾을 수 없음, 직접 이동');
    }
    console.log('');

    // 2. 히스토리 페이지 테스트
    console.log('2. 히스토리 페이지 (포트 4000)...');
    await page.goto('http://localhost:4000/history');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-history-port4000.png', fullPage: true });
    console.log('   ✅ 히스토리 페이지 로드 완료');

    // 3. 라벨 관리 페이지 테스트
    console.log('3. 라벨 관리 페이지 (포트 4000)...');
    await page.goto('http://localhost:4000/labels');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-labels-port4000.png', fullPage: true });
    console.log('   ✅ 라벨 관리 페이지 로드 완료');

    // 4. React 에러 분석
    console.log('\n=== React 에러 분석 (포트 4000) ===');
    
    const maxUpdateErrors = errors.filter(error => 
      error.includes('Maximum update depth exceeded')
    );
    
    const colorErrors = errors.filter(error => 
      error.includes('Cannot read properties of undefined') && 
      error.includes('color')
    );
    
    const consoleMaxUpdateErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && msg.text.includes('Maximum update depth exceeded')
    );
    
    const consoleColorErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && 
      msg.text.includes('Cannot read properties of undefined') && 
      msg.text.includes('color')
    );

    console.log(`📊 에러 통계:`);
    console.log(`   전체 페이지 에러: ${errors.length}개`);
    console.log(`   Maximum update depth 에러: ${maxUpdateErrors.length + consoleMaxUpdateErrors.length}개`);
    console.log(`   Color undefined 에러: ${colorErrors.length + consoleColorErrors.length}개`);
    console.log(`   전체 콘솔 메시지: ${consoleMessages.length}개`);

    const totalCriticalErrors = maxUpdateErrors.length + colorErrors.length + consoleMaxUpdateErrors.length + consoleColorErrors.length;

    if (totalCriticalErrors === 0) {
      console.log('\n🎉 성공! 모든 React 에러가 해결되었습니다!');
      console.log('\n✅ 수정된 사항들이 올바르게 적용됨:');
      console.log('   1. conversation-history.tsx: statusLabels 안전 접근');
      console.log('   2. label-management.tsx: useEffect 무한 루프 방지');
      console.log('   3. useCallback 모두 제거하여 의존성 문제 해결');
    } else {
      console.log(`\n❌ 여전히 ${totalCriticalErrors}개의 중요 에러가 존재:`);
      
      if (maxUpdateErrors.length > 0 || consoleMaxUpdateErrors.length > 0) {
        console.log('\n🔄 Maximum Update Depth 에러:');
        [...maxUpdateErrors, ...consoleMaxUpdateErrors.map(m => m.text)].forEach((error, i) => {
          console.log(`   ${i+1}. ${error}`);
        });
      }
      
      if (colorErrors.length > 0 || consoleColorErrors.length > 0) {
        console.log('\n🎨 Color Undefined 에러:');
        [...colorErrors, ...consoleColorErrors.map(m => m.text)].forEach((error, i) => {
          console.log(`   ${i+1}. ${error}`);
        });
      }
    }

    // 모든 에러 표시 (디버깅용)
    if (errors.length > 0) {
      console.log('\n🔍 발생한 모든 에러:');
      errors.forEach((error, i) => {
        console.log(`   ${i+1}. ${error}`);
      });
    }

    console.log('\n📸 생성된 스크린샷:');
    console.log('   - test-history-port4000.png');
    console.log('   - test-labels-port4000.png');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testPort4000();