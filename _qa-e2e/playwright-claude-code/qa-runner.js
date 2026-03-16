const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE = 'https://corthex-hq.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BUGS_FILE = path.join(__dirname, 'BUGS.md');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const bugs = [];
let bugCount = 0;

function addBug({ severity, account, page: pagePath, summary, expected, actual, screenshot, consoleErrors = [], details = '' }) {
  bugCount++;
  const id = `BUG-P${String(bugCount).padStart(3, '0')}`;
  bugs.push({ id, severity, account, page: pagePath, summary, expected, actual, screenshot, consoleErrors, details });
  console.log(`  ⚠️  ${id} [${severity}] ${summary}`);
}

const APP_PAGES = [
  { path: '/hub', name: 'hub' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/agents', name: 'agents' },
  { path: '/departments', name: 'departments' },
  { path: '/tiers', name: 'tiers' },
  { path: '/jobs', name: 'jobs' },
  { path: '/reports', name: 'reports' },
  { path: '/trading', name: 'trading' },
  { path: '/nexus', name: 'nexus' },
  { path: '/knowledge', name: 'knowledge' },
  { path: '/sns', name: 'sns' },
  { path: '/messenger', name: 'messenger' },
  { path: '/agora', name: 'agora' },
  { path: '/files', name: 'files' },
  { path: '/costs', name: 'costs' },
  { path: '/performance', name: 'performance' },
  { path: '/activity-log', name: 'activity-log' },
  { path: '/ops-log', name: 'ops-log' },
  { path: '/workflows', name: 'workflows' },
  { path: '/notifications', name: 'notifications' },
  { path: '/classified', name: 'classified' },
  { path: '/settings', name: 'settings' },
  { path: '/sketchvibe', name: 'sketchvibe' },
  { path: '/onboarding', name: 'onboarding' },
  { path: '/chat', name: 'chat' },
];

const ADMIN_PAGES = [
  { path: '/admin/dashboard', name: 'admin-dashboard' },
  { path: '/admin/users', name: 'admin-users' },
  { path: '/admin/employees', name: 'admin-employees' },
  { path: '/admin/departments', name: 'admin-departments' },
  { path: '/admin/agents', name: 'admin-agents' },
  { path: '/admin/credentials', name: 'admin-credentials' },
  { path: '/admin/tools', name: 'admin-tools' },
  { path: '/admin/costs', name: 'admin-costs' },
  { path: '/admin/report-lines', name: 'admin-report-lines' },
  { path: '/admin/soul-templates', name: 'admin-soul-templates' },
  { path: '/admin/nexus', name: 'admin-nexus' },
  { path: '/admin/onboarding', name: 'admin-onboarding' },
  { path: '/admin/monitoring', name: 'admin-monitoring' },
  { path: '/admin/settings', name: 'admin-settings' },
  { path: '/admin/companies', name: 'admin-companies' },
  { path: '/admin/workflows', name: 'admin-workflows' },
];

async function checkPage(page, pagePath, name, account, consoleErrors) {
  console.log(`\n  📄 ${pagePath}`);

  try {
    await page.goto(SITE + pagePath, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    await page.goto(SITE + pagePath, { timeout: 15000 }).catch(() => {});
  }

  await page.waitForTimeout(2000);

  const screenshotName = `${account}-${name}.png`;
  const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  // 현재 URL 확인 (리다이렉트 여부)
  const currentUrl = page.url();
  const redirected = !currentUrl.includes(pagePath);

  // 1. 다크 배경 체크 (slate-950 = #020617 또는 비슷한 어두운 색)
  const bgColor = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return style.backgroundColor;
  });

  // rgb를 파싱해서 밝기 계산
  const isDarkBg = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    const bg = style.backgroundColor;
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return false;
    const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    // 밝기 < 50이면 다크 배경
    return (r + g + b) / 3 < 50;
  });

  if (isDarkBg && !redirected) {
    addBug({
      severity: 'Major',
      account,
      page: pagePath,
      summary: `다크 배경 감지 — Natural Organic 테마 미적용`,
      expected: '배경색 베이지(#faf8f5) 또는 흰색',
      actual: `배경색: ${bgColor}`,
      screenshot: `screenshots/${screenshotName}`,
    });
  }

  // 2. 이중 사이드바 체크
  const sidebarCount = await page.evaluate(() => {
    const sidebars = document.querySelectorAll('nav, aside, [class*="sidebar"], [class*="Sidebar"]');
    return sidebars.length;
  });

  if (sidebarCount >= 2 && !redirected) {
    addBug({
      severity: 'Major',
      account,
      page: pagePath,
      summary: `이중 사이드바 의심 — nav/aside 요소 ${sidebarCount}개 감지`,
      expected: '사이드바 1개',
      actual: `nav/aside 요소 ${sidebarCount}개`,
      screenshot: `screenshots/${screenshotName}`,
    });
  }

  // 3. 빈 화면 체크
  const bodyText = await page.evaluate(() => document.body.innerText.trim());
  if (bodyText.length < 50 && !redirected) {
    addBug({
      severity: 'Critical',
      account,
      page: pagePath,
      summary: `빈 화면 또는 매우 적은 콘텐츠`,
      expected: '페이지 콘텐츠 정상 렌더링',
      actual: `본문 텍스트 ${bodyText.length}자 (50자 미만)`,
      screenshot: `screenshots/${screenshotName}`,
    });
  }

  // 4. undefined/NaN/[object Object] 체크
  const badTexts = ['undefined', 'NaN', '[object Object]'];
  for (const bad of badTexts) {
    if (bodyText.includes(bad)) {
      addBug({
        severity: 'Major',
        account,
        page: pagePath,
        summary: `페이지에 "${bad}" 텍스트 노출`,
        expected: '정상 데이터 표시',
        actual: `"${bad}" 텍스트가 페이지에 노출됨`,
        screenshot: `screenshots/${screenshotName}`,
      });
    }
  }

  // 5. 콘솔 에러 체크
  const pageErrors = consoleErrors.filter(e => e.pagePath === pagePath);
  if (pageErrors.length > 0) {
    addBug({
      severity: 'Minor',
      account,
      page: pagePath,
      summary: `콘솔 에러 ${pageErrors.length}개`,
      expected: '콘솔 에러 없음',
      actual: pageErrors.map(e => e.text).join('\n'),
      screenshot: `screenshots/${screenshotName}`,
      consoleErrors: pageErrors.map(e => e.text),
    });
  }

  // 6. 로그인 리다이렉트 체크 (로그인 상태인데 /login으로 리다이렉트)
  if (redirected && currentUrl.includes('/login')) {
    addBug({
      severity: 'Critical',
      account,
      page: pagePath,
      summary: `로그인 상태인데 /login으로 리다이렉트`,
      expected: `${pagePath} 정상 접근`,
      actual: `${currentUrl}로 리다이렉트됨`,
      screenshot: `screenshots/${screenshotName}`,
    });
  }

  // 7. 올리브그린 액센트 색상 체크 (버튼에)
  const hasOliveAccent = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a[class*="btn"], [class*="button"]');
    for (const btn of buttons) {
      const style = window.getComputedStyle(btn);
      const bg = style.backgroundColor;
      // #5a7247 = rgb(90, 114, 71)
      const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        if (r > 70 && r < 120 && g > 90 && g < 140 && b > 50 && b < 100) return true;
      }
    }
    return false;
  });

  // 8. 세리프 폰트 체크
  const hasSerifHeading = await page.evaluate(() => {
    const headings = document.querySelectorAll('h1, h2, h3');
    for (const h of headings) {
      const style = window.getComputedStyle(h);
      const font = style.fontFamily.toLowerCase();
      if (font.includes('serif') || font.includes('noto serif')) return true;
    }
    return false;
  });

  return {
    path: pagePath,
    name,
    screenshot: screenshotName,
    redirected,
    currentUrl,
    darkBg: isDarkBg,
    hasOliveAccent,
    hasSerifHeading,
    bodyLength: bodyText.length,
    consoleErrorCount: pageErrors.length,
  };
}

async function login(page, username, password) {
  await page.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  // 폼 찾기
  const usernameInput = page.locator('input[type="text"], input[name="username"], input[name="id"], input[placeholder*="아이디"], input[placeholder*="ID"], input[placeholder*="id"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await usernameInput.fill(username);
  await passwordInput.fill(password);

  const submitBtn = page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login"), button:has-text("로 그 인")').first();
  await submitBtn.click();

  await page.waitForTimeout(2000);
  return page.url();
}

async function main() {
  console.log('🚀 CORTHEX v2 E2E QA 시작');
  console.log(`📅 날짜: 2026-03-16`);
  console.log(`🌐 사이트: ${SITE}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const pageResults = { admin: [], ceo: [] };

  // ===== ADMIN 세션 =====
  console.log('='.repeat(60));
  console.log('👤 ADMIN 계정 테스트');
  console.log('='.repeat(60));

  const adminContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const adminPage = await adminContext.newPage();

  const adminConsoleErrors = [];
  adminPage.on('console', msg => {
    if (msg.type() === 'error') {
      adminConsoleErrors.push({ pagePath: new URL(adminPage.url()).pathname, text: msg.text() });
    }
  });
  adminPage.on('pageerror', err => {
    adminConsoleErrors.push({ pagePath: new URL(adminPage.url()).pathname, text: err.message });
  });

  // 로그인 페이지 먼저 검사
  console.log('\n📄 /login (사전 검사)');
  await adminPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-login.png') });

  // 로그인 페이지 배경 체크
  const loginBgDark = await adminPage.evaluate(() => {
    const style = window.getComputedStyle(document.body);
    const bg = style.backgroundColor;
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return false;
    return (parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3])) / 3 < 50;
  });
  if (loginBgDark) {
    addBug({ severity: 'Major', account: 'Admin', page: '/login', summary: '로그인 페이지 다크 배경', expected: '베이지/흰색 배경', actual: '어두운 배경', screenshot: 'screenshots/admin-login.png' });
  }

  // 에지 케이스: 빈 폼 제출
  console.log('  → 빈 폼 제출 테스트');
  const submitBtn = adminPage.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();
  if (await submitBtn.count() > 0) {
    await submitBtn.click();
    await adminPage.waitForTimeout(1000);
    const errorVisible = await adminPage.locator('[class*="error"], [class*="Error"], .text-red, [class*="alert"]').count() > 0;
    if (!errorVisible) {
      // 빈 폼 에러 없는 건 minor 이슈일 수도
    }
  }

  // 틀린 비밀번호
  console.log('  → 틀린 비밀번호 테스트');
  const usernameInput = adminPage.locator('input[type="text"], input[name="username"], input[name="id"]').first();
  const passwordInput = adminPage.locator('input[type="password"]').first();
  if (await usernameInput.count() > 0) {
    await usernameInput.fill('admin');
    await passwordInput.fill('wrongpassword');
    await submitBtn.click();
    await adminPage.waitForTimeout(1500);
    const stillOnLogin = adminPage.url().includes('/login');
    if (!stillOnLogin) {
      addBug({ severity: 'Security', account: 'Admin', page: '/login', summary: '틀린 비밀번호로 로그인 성공', expected: '로그인 실패 + 에러 메시지', actual: '로그인 성공 (보안 취약점)', screenshot: 'screenshots/admin-login.png' });
    }
  }

  // 정상 로그인
  console.log('\n🔑 Admin 로그인...');
  await adminPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await adminPage.waitForTimeout(1000);

  const u = adminPage.locator('input[type="text"], input[name="username"], input[name="id"], input[placeholder*="아이디"]').first();
  const p = adminPage.locator('input[type="password"]').first();
  const s = adminPage.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();

  if (await u.count() > 0) {
    await u.fill('admin');
    await p.fill('admin1234');
    await s.click();
    await adminPage.waitForTimeout(3000);

    const afterLoginUrl = adminPage.url();
    if (afterLoginUrl.includes('/login')) {
      addBug({ severity: 'Critical', account: 'Admin', page: '/login', summary: 'Admin 로그인 실패', expected: '로그인 후 /hub 또는 대시보드 이동', actual: `로그인 페이지에 머물러 있음: ${afterLoginUrl}`, screenshot: 'screenshots/admin-login.png' });
      console.log('  ❌ Admin 로그인 실패 — 나머지 테스트 건너뜀');
    } else {
      console.log(`  ✅ Admin 로그인 성공 → ${afterLoginUrl}`);

      // App 페이지들
      console.log('\n📱 App 25개 페이지 검사...');
      for (const pg of APP_PAGES) {
        const result = await checkPage(adminPage, pg.path, pg.name, 'admin', adminConsoleErrors);
        pageResults.admin.push({ ...result, type: 'app' });
      }

      // Admin 페이지들
      console.log('\n⚙️  Admin 16개 페이지 검사...');
      for (const pg of ADMIN_PAGES) {
        const result = await checkPage(adminPage, pg.path, pg.name, 'admin', adminConsoleErrors);
        pageResults.admin.push({ ...result, type: 'admin' });
      }

      // 사이드바 테스트
      console.log('\n🔗 사이드바 네비게이션 테스트...');
      await adminPage.goto(SITE + '/hub', { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1500);
      const sidebarLinks = await adminPage.locator('nav a, aside a, [class*="sidebar"] a, [class*="Sidebar"] a').all();
      console.log(`  사이드바 링크 ${sidebarLinks.length}개 발견`);
      if (sidebarLinks.length === 0) {
        addBug({ severity: 'Critical', account: 'Admin', page: '/hub', summary: '사이드바 링크가 없음', expected: '사이드바에 네비게이션 링크들', actual: '링크 0개 감지', screenshot: 'screenshots/admin-hub.png' });
      }

      // 반응형 테스트
      console.log('\n📱 반응형 테스트 (375px)...');
      await adminPage.setViewportSize({ width: 375, height: 812 });
      await adminPage.goto(SITE + '/hub', { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1500);
      await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-hub-mobile.png') });

      // 모바일에서 사이드바 숨겨지는지
      const mobileSidebarVisible = await adminPage.evaluate(() => {
        const sidebars = document.querySelectorAll('nav, aside, [class*="sidebar"]');
        for (const s of sidebars) {
          const style = window.getComputedStyle(s);
          if (style.display !== 'none' && style.visibility !== 'hidden' && parseInt(style.width) > 100) return true;
        }
        return false;
      });
      if (mobileSidebarVisible) {
        addBug({ severity: 'Minor', account: 'Admin', page: '/hub', summary: '모바일(375px)에서 사이드바가 숨겨지지 않음', expected: '모바일에서 사이드바 숨김 + 햄버거 메뉴', actual: '사이드바가 여전히 보임', screenshot: 'screenshots/admin-hub-mobile.png' });
      }

      // 뷰포트 복원
      await adminPage.setViewportSize({ width: 1280, height: 720 });

      // Admin 별도 로그인 (/admin/login)
      console.log('\n🔑 Admin 패널 별도 로그인 (/admin/login)...');
      await adminPage.goto(SITE + '/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1000);
      await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-panel-login.png') });

      const au = adminPage.locator('input[type="text"], input[name="username"], input[name="id"]').first();
      const ap = adminPage.locator('input[type="password"]').first();
      const as_ = adminPage.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();

      if (await au.count() > 0) {
        await au.fill('admin');
        await ap.fill('admin1234');
        await as_.click();
        await adminPage.waitForTimeout(3000);

        const adminPanelUrl = adminPage.url();
        if (adminPanelUrl.includes('/admin/login')) {
          addBug({ severity: 'Critical', account: 'Admin', page: '/admin/login', summary: 'Admin 패널 로그인 실패 (admin/admin1234)', expected: '로그인 후 /admin/ 페이지 이동', actual: `로그인 페이지에 머물러 있음`, screenshot: 'screenshots/admin-panel-login.png' });
        } else {
          console.log(`  ✅ Admin 패널 로그인 성공 → ${adminPanelUrl}`);

          // Admin 페이지들 재검사
          console.log('\n⚙️  Admin 16개 페이지 재검사 (올바른 세션)...');
          // 이전 admin 페이지 결과 교체
          pageResults.admin = pageResults.admin.filter(r => r.type !== 'admin');
          for (const pg of ADMIN_PAGES) {
            const result = await checkPage(adminPage, pg.path, pg.name, 'admin', adminConsoleErrors);
            pageResults.admin.push({ ...result, type: 'admin' });
          }
        }
      } else {
        addBug({ severity: 'Critical', account: 'Admin', page: '/admin/login', summary: 'Admin 패널 로그인 폼을 찾을 수 없음', expected: '로그인 폼', actual: '폼 없음', screenshot: 'screenshots/admin-panel-login.png' });
      }

      // 로그아웃
      console.log('\n🚪 Admin 로그아웃...');
      const logoutBtn = adminPage.locator('button:has-text("로그아웃"), button:has-text("Logout"), a:has-text("로그아웃"), [class*="logout"]').first();
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await adminPage.waitForTimeout(2000);
      } else {
        await adminContext.clearCookies();
      }
    }
  } else {
    addBug({ severity: 'Critical', account: 'Admin', page: '/login', summary: '로그인 폼 입력 필드를 찾을 수 없음', expected: '아이디/비밀번호 입력 필드', actual: '입력 필드 없음', screenshot: 'screenshots/admin-login.png' });
  }

  await adminContext.close();

  // ===== CEO 세션 =====
  console.log('\n' + '='.repeat(60));
  console.log('👤 CEO 계정 테스트');
  console.log('='.repeat(60));

  const ceoContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const ceoPage = await ceoContext.newPage();

  const ceoConsoleErrors = [];
  ceoPage.on('console', msg => {
    if (msg.type() === 'error') {
      ceoConsoleErrors.push({ pagePath: new URL(ceoPage.url()).pathname, text: msg.text() });
    }
  });

  console.log('\n🔑 CEO 로그인...');
  await ceoPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await ceoPage.waitForTimeout(1000);

  const cu = ceoPage.locator('input[type="text"], input[name="username"], input[name="id"]').first();
  const cp = ceoPage.locator('input[type="password"]').first();
  const cs = ceoPage.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();

  if (await cu.count() > 0) {
    await cu.fill('ceo');
    await cp.fill('ceo1234');
    await cs.click();
    await ceoPage.waitForTimeout(3000);

    const ceoLoginUrl = ceoPage.url();
    if (ceoLoginUrl.includes('/login')) {
      addBug({ severity: 'Critical', account: 'CEO', page: '/login', summary: 'CEO 로그인 실패', expected: '로그인 후 /hub 이동', actual: `로그인 페이지 머물러 있음`, screenshot: 'screenshots/admin-login.png' });
    } else {
      console.log(`  ✅ CEO 로그인 성공 → ${ceoLoginUrl}`);

      // CEO로 주요 App 페이지 검사 (전체 25개)
      console.log('\n📱 CEO App 페이지 검사...');
      for (const pg of APP_PAGES) {
        const result = await checkPage(ceoPage, pg.path, pg.name, 'ceo', ceoConsoleErrors);
        pageResults.ceo.push(result);
      }

      // 보안 테스트: CEO가 Admin 페이지 접근
      console.log('\n🔒 보안 테스트: CEO → Admin 페이지 접근...');
      await ceoPage.goto(SITE + '/admin/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
      await ceoPage.waitForTimeout(2000);
      const ceoAdminUrl = ceoPage.url();
      await ceoPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ceo-admin-access-test.png') });

      if (!ceoAdminUrl.includes('/login') && ceoAdminUrl.includes('/admin')) {
        addBug({ severity: 'Security', account: 'CEO', page: '/admin/dashboard', summary: 'CEO가 Admin 페이지에 접근 가능 — 권한 검사 미흡', expected: '/login으로 리다이렉트 또는 403', actual: `${ceoAdminUrl}에 정상 접근됨`, screenshot: 'screenshots/ceo-admin-access-test.png' });
      } else {
        console.log(`  ✅ CEO Admin 접근 차단됨 → ${ceoAdminUrl}`);
      }
    }
  }

  await ceoContext.close();
  await browser.close();

  // ===== 결과 리포트 생성 =====
  console.log('\n' + '='.repeat(60));
  console.log('📝 BUGS.md 생성 중...');

  const totalAdminPages = pageResults.admin.length + 1; // +1 for login
  const totalCeoPages = pageResults.ceo.length;

  const criticalCount = bugs.filter(b => b.severity === 'Critical').length;
  const majorCount = bugs.filter(b => b.severity === 'Major').length;
  const minorCount = bugs.filter(b => b.severity === 'Minor').length;
  const cosmeticCount = bugs.filter(b => b.severity === 'Cosmetic').length;
  const securityCount = bugs.filter(b => b.severity === 'Security').length;

  let md = `# Playwright QA 버그 리포트
> 검사일: 2026-03-16
> 검사자: Claude Code (Playwright — headless chromium)
> 사이트: ${SITE}
> 디자인 기준: Natural Organic (올리브그린 #5a7247, 베이지 #faf8f5)

## 요약
- Admin: ${totalAdminPages}/41 페이지 검사
- CEO: ${totalCeoPages}/25 페이지 + Admin 보안 테스트
- 발견 버그: **${bugs.length}개** (Critical: ${criticalCount} | Major: ${majorCount} | Minor: ${minorCount} | Cosmetic: ${cosmeticCount} | Security: ${securityCount})

---

## 페이지별 상태표

### Admin 계정
| # | 경로 | 렌더링 | 다크배경 | 콘솔에러 | 리다이렉트 | 판정 |
|---|------|--------|---------|---------|----------|------|
| 1 | /login | ✅ | ${loginBgDark ? '❌' : '✅'} | - | - | ${loginBgDark ? '❌' : '✅'} |
`;

  pageResults.admin.forEach((r, i) => {
    const rendering = r.bodyLength > 50 ? '✅' : '❌';
    const darkBg = r.darkBg ? '❌' : '✅';
    const consoleErr = r.consoleErrorCount > 0 ? `❌ (${r.consoleErrorCount})` : '✅';
    const redirect = r.redirected ? `→ ${r.currentUrl}` : '✅';
    const ok = !r.darkBg && r.bodyLength > 50 && r.consoleErrorCount === 0 && !r.redirected;
    md += `| ${i + 2} | ${r.path} | ${rendering} | ${darkBg} | ${consoleErr} | ${redirect} | ${ok ? '✅' : '❌'} |\n`;
  });

  md += `
### CEO 계정
| # | 경로 | 렌더링 | 다크배경 | 콘솔에러 | 리다이렉트 | 판정 |
|---|------|--------|---------|---------|----------|------|
`;
  pageResults.ceo.forEach((r, i) => {
    const rendering = r.bodyLength > 50 ? '✅' : '❌';
    const darkBg = r.darkBg ? '❌' : '✅';
    const consoleErr = r.consoleErrorCount > 0 ? `❌ (${r.consoleErrorCount})` : '✅';
    const redirect = r.redirected ? `→ ${r.currentUrl}` : '✅';
    const ok = !r.darkBg && r.bodyLength > 50 && r.consoleErrorCount === 0 && !r.redirected;
    md += `| ${i + 1} | ${r.path} | ${rendering} | ${darkBg} | ${consoleErr} | ${redirect} | ${ok ? '✅' : '❌'} |\n`;
  });

  md += `
---

## 버그 목록

`;

  if (bugs.length === 0) {
    md += `> ✅ 발견된 버그 없음\n`;
  } else {
    bugs.forEach(bug => {
      md += `### ${bug.id}: ${bug.summary}
- **심각도**: ${bug.severity}
- **계정**: ${bug.account}
- **페이지**: ${bug.page}
- **기대 결과**: ${bug.expected}
- **실제 결과**: ${bug.actual}
- **스크린샷**: ${bug.screenshot}
${bug.consoleErrors.length > 0 ? `- **콘솔 에러**:\n\`\`\`\n${bug.consoleErrors.join('\n')}\n\`\`\`` : ''}
${bug.details ? `- **세부 정보**: ${bug.details}` : ''}

---

`;
    });
  }

  md += `\n## 스크린샷 목록\n`;
  const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
  screenshots.forEach(s => { md += `- \`screenshots/${s}\`\n`; });

  fs.writeFileSync(BUGS_FILE, md, 'utf-8');

  console.log('\n✅ 완료!');
  console.log(`📋 버그: ${bugs.length}개 (Critical: ${criticalCount}, Major: ${majorCount}, Minor: ${minorCount}, Security: ${securityCount})`);
  console.log(`📄 결과: _qa-e2e/playwright-claude-code/BUGS.md`);
  console.log(`📸 스크린샷: _qa-e2e/playwright-claude-code/screenshots/ (${screenshots.length}개)`);
}

main().catch(err => {
  console.error('❌ 스크립트 오류:', err);
  process.exit(1);
});
