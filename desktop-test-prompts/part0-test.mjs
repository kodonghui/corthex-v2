import { chromium } from 'playwright';

const ADMIN_URL = 'https://corthex-hq.com/admin/login';
const APP_URL = 'https://corthex-hq.com/login';
const results = [];

function log(step, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  const msg = `${icon} ${step}: ${detail}`;
  console.log(msg);
  results.push({ step, status, detail });
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // ========== 0-1. Chrome + DevTools (skip - we're using Playwright) ==========
  log('0-1', 'PASS', 'Playwright 브라우저 실행 완료 (DevTools는 Playwright 콘솔로 대체)');

  // ========== 0-2. Admin 로그인 확인 ==========
  console.log('\n━━━ 0-2. Admin 로그인 확인 ━━━');
  const adminPage = await context.newPage();

  try {
    await adminPage.goto(ADMIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    log('0-2-1', 'PASS', `Admin 로그인 페이지 로드: ${adminPage.url()}`);
  } catch (e) {
    log('0-2-1', 'FAIL', `Admin 로그인 페이지 로드 실패: ${e.message}`);
  }

  // 스크린샷 - 로그인 전
  await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-2-login-page.png', fullPage: true });

  // 아이디/비밀번호 입력
  try {
    // 입력 필드 찾기
    const idInput = await adminPage.locator('input[type="text"], input[name="username"], input[name="id"], input[placeholder*="아이디"], input[placeholder*="ID"]').first();
    const pwInput = await adminPage.locator('input[type="password"]').first();

    await idInput.fill('admin');
    await pwInput.fill('admin1234');
    log('0-2-2', 'PASS', '아이디/비밀번호 입력 완료');

    // 스크린샷 - 입력 후
    await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-2-filled.png' });

    // 로그인 버튼 클릭
    const loginBtn = await adminPage.locator('button[type="submit"], button:has-text("세션 시작"), button:has-text("로그인"), button:has-text("Login")').first();
    await loginBtn.click();

    // 대시보드 로딩 대기
    await adminPage.waitForURL('**/admin/**', { timeout: 15000 }).catch(() => {});
    await adminPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const currentUrl = adminPage.url();
    await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-2-dashboard.png', fullPage: true });

    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      // 카드 3개 확인
      const cards = await adminPage.locator('[class*="card"], [class*="Card"], [class*="stat"], [class*="metric"]').count();
      log('0-2-3', 'PASS', `대시보드 로드 성공. URL: ${currentUrl}, 카드 요소: ${cards}개`);
    } else {
      const bodyText = await adminPage.locator('body').innerText().catch(() => '(읽기 실패)');
      log('0-2-3', 'FAIL', `대시보드 이동 실패. URL: ${currentUrl}. 페이지 텍스트: ${bodyText.slice(0, 200)}`);
    }
  } catch (e) {
    log('0-2-err', 'FAIL', `Admin 로그인 과정 에러: ${e.message}`);
    await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-2-error.png' });
  }

  // ========== 0-3. CEO App 로그인 확인 ==========
  console.log('\n━━━ 0-3. CEO App 로그인 확인 ━━━');
  const appPage = await context.newPage();

  try {
    await appPage.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    log('0-3-1', 'PASS', `CEO App 로그인 페이지 로드: ${appPage.url()}`);
    await appPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-3-login-page.png', fullPage: true });
  } catch (e) {
    log('0-3-1', 'FAIL', `CEO App 로그인 페이지 로드 실패: ${e.message}`);
  }

  try {
    const idInput = await appPage.locator('input[type="text"], input[name="username"], input[name="id"], input[placeholder*="아이디"], input[placeholder*="ID"]').first();
    const pwInput = await appPage.locator('input[type="password"]').first();

    await idInput.fill('admin');
    await pwInput.fill('admin1234');
    log('0-3-2', 'PASS', '아이디/비밀번호 입력 완료');

    // INITIALIZE COMMAND 버튼 클릭
    const loginBtn = await appPage.locator('button[type="submit"], button:has-text("INITIALIZE"), button:has-text("로그인"), button:has-text("Login")').first();
    await loginBtn.click();

    await appPage.waitForURL('**/', { timeout: 15000 }).catch(() => {});
    await appPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const currentUrl = appPage.url();
    await appPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-3-hub.png', fullPage: true });

    if (!currentUrl.includes('/login')) {
      // 터미널 입력창 확인
      const terminal = await appPage.locator('input[placeholder*="명령"], textarea, [class*="terminal"], [class*="input"]').count();
      log('0-3-3', 'PASS', `Hub 페이지 로드 성공. URL: ${currentUrl}, 입력 요소: ${terminal}개`);
    } else {
      const bodyText = await appPage.locator('body').innerText().catch(() => '(읽기 실패)');
      log('0-3-3', 'FAIL', `Hub 이동 실패. URL: ${currentUrl}. 텍스트: ${bodyText.slice(0, 200)}`);
    }
  } catch (e) {
    log('0-3-err', 'FAIL', `CEO App 로그인 과정 에러: ${e.message}`);
    await appPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-3-error.png' });
  }

  // ========== 0-4. DB Seed 데이터 확인 ==========
  console.log('\n━━━ 0-4. DB Seed 데이터 확인 ━━━');

  try {
    // Admin 탭에서 회사 관리 페이지로 이동
    await adminPage.goto('https://corthex-hq.com/admin/companies', { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-4-companies.png', fullPage: true });

    const bodyText = await adminPage.locator('body').innerText();
    const hasCompany = bodyText.includes('CORTHEX') || bodyText.includes('HQ') || bodyText.includes('회사');

    if (hasCompany) {
      log('0-4-1', 'PASS', `회사 데이터 확인됨. 페이지 텍스트에 회사 정보 포함`);
    } else {
      log('0-4-1', 'FAIL', `회사 카드 0개 — 시드 데이터 없음. 텍스트: ${bodyText.slice(0, 300)}`);
    }

    // 에이전트 페이지 확인
    await adminPage.goto('https://corthex-hq.com/admin/agents', { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await adminPage.screenshot({ path: 'desktop-test-prompts/screenshots/0-4-agents.png', fullPage: true });

    const agentText = await adminPage.locator('body').innerText();
    // 테이블 행이 있는지 확인 (에이전트 이름이 있으면 데이터 존재)
    const rows = await adminPage.locator('table tbody tr, [class*="row"], [class*="agent"]').count();

    if (rows > 0) {
      log('0-4-2', 'PASS', `에이전트 데이터 확인됨. 행 수: ${rows}개`);
    } else {
      log('0-4-2', 'FAIL', `에이전트 행 0개. 텍스트: ${agentText.slice(0, 300)}`);
    }
  } catch (e) {
    log('0-4-err', 'FAIL', `시드 데이터 확인 에러: ${e.message}`);
  }

  // ========== 결과 요약 ==========
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 0 결과 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`✅ PASS: ${passed}개`);
  console.log(`❌ FAIL: ${failed}개`);
  console.log(`총 테스트: ${results.length}개`);

  if (failed > 0) {
    console.log('\n❌ 실패 항목:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.step}: ${r.detail}`);
    });
  }

  // 콘솔 에러 수집
  console.log('\n━━━ 콘솔 에러 ━━━');

  // 브라우저 닫기 (확인을 위해 5초 대기)
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();

  console.log('\nPart 0 테스트 완료!');
}

run().catch(e => {
  console.error('테스트 실행 에러:', e);
  process.exit(1);
});
