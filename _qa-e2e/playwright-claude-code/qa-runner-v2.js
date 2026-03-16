const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE = 'https://corthex-hq.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BUGS_FILE = path.join(__dirname, 'BUGS.md');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const bugs = [];
let bugCount = 0;

function addBug(b) {
  bugCount++;
  b.id = `BUG-P${String(bugCount).padStart(3, '0')}`;
  bugs.push(b);
  console.log(`    ⚠️  ${b.id} [${b.severity}] ${b.summary}`);
}

// ========== PAGE DEFINITIONS ==========
const APP_PAGES = [
  { path: '/hub', name: 'hub' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/chat', name: 'chat' },
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

// ========== DEEP PAGE INSPECTOR ==========
async function inspectPage(page, pagePath, name, account, consoleErrors) {
  console.log(`\n  📄 ${pagePath}`);

  try {
    await page.goto(SITE + pagePath, { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    try { await page.goto(SITE + pagePath, { timeout: 15000 }); } catch {}
  }
  await page.waitForTimeout(2500);

  const screenshotName = `${account}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, screenshotName), fullPage: false });

  const currentUrl = page.url();
  const redirected = !currentUrl.includes(pagePath);

  // ---- FULL DOM ANALYSIS ----
  const analysis = await page.evaluate(() => {
    const result = {};

    // 1. Body background
    const bodyStyle = window.getComputedStyle(document.body);
    result.bodyBg = bodyStyle.backgroundColor;

    // 2. All wrapper/main backgrounds (detect dark theme)
    const wrappers = document.querySelectorAll('body > div, body > div > div, main, [class*="flex"]');
    result.darkWrappers = [];
    for (const w of wrappers) {
      const s = window.getComputedStyle(w);
      const bg = s.backgroundColor;
      const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (m) {
        const brightness = (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3;
        if (brightness < 30) {
          result.darkWrappers.push({
            tag: w.tagName,
            class: (w.className || '').substring(0, 80),
            bg,
            rect: { x: Math.round(w.getBoundingClientRect().x), y: Math.round(w.getBoundingClientRect().y), w: Math.round(w.getBoundingClientRect().width), h: Math.round(w.getBoundingClientRect().height) },
          });
        }
      }
    }

    // 3. Sidebar analysis - position-based
    const navEls = Array.from(document.querySelectorAll('nav, aside, [class*="sidebar"], [class*="Sidebar"]'));
    result.navElements = navEls.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        class: (el.className || '').substring(0, 100),
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height),
        display: style.display, visibility: style.visibility, position: style.position,
        bg: style.backgroundColor,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
      };
    });

    // Count actual left-side sidebars (visible, x < 350, width < 400, height > 300)
    result.leftSidebars = result.navElements.filter(el =>
      el.visible && el.x < 350 && el.width < 400 && el.height > 300
    );

    // 4. Slate/dark class detection (old Sovereign Sage theme)
    const allEls = document.querySelectorAll('*');
    result.oldThemeClasses = { slate950: 0, slate900: 0, slate800: 0, cyan400: 0 };
    for (const el of allEls) {
      const cls = el.className || '';
      if (typeof cls !== 'string') continue;
      if (cls.includes('slate-950') || cls.includes('bg-slate-950')) result.oldThemeClasses.slate950++;
      if (cls.includes('slate-900') || cls.includes('bg-slate-900')) result.oldThemeClasses.slate900++;
      if (cls.includes('slate-800')) result.oldThemeClasses.slate800++;
      if (cls.includes('cyan-400')) result.oldThemeClasses.cyan400++;
    }

    // 5. Font check
    result.fonts = {};
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const h3 = document.querySelector('h3');
    if (h1) result.fonts.h1 = window.getComputedStyle(h1).fontFamily;
    if (h2) result.fonts.h2 = window.getComputedStyle(h2).fontFamily;
    if (h3) result.fonts.h3 = window.getComputedStyle(h3).fontFamily;
    result.fonts.body = bodyStyle.fontFamily;

    // 6. Content check
    const bodyText = document.body.innerText.trim();
    result.textLength = bodyText.length;
    result.hasUndefined = bodyText.includes('undefined');
    result.hasNaN = bodyText.includes('NaN');
    result.hasObjectObject = bodyText.includes('[object Object]');

    // 7. Horizontal scroll check
    result.hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

    // 8. Olive green accent check — look for buttons with #5a7247 family colors
    const buttons = document.querySelectorAll('button, a[class*="btn"], [role="button"]');
    result.oliveButtons = 0;
    result.totalButtons = buttons.length;
    for (const btn of buttons) {
      const s = window.getComputedStyle(btn);
      const bg = s.backgroundColor;
      const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (m) {
        const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
        // olive green family: r=70-110, g=90-140, b=50-100
        if (r > 60 && r < 120 && g > 80 && g < 150 && b > 40 && b < 110) result.oliveButtons++;
      }
    }

    return result;
  });

  // ---- BUG DETECTION ----

  // Redirect bug
  if (redirected && currentUrl.includes('/login')) {
    addBug({ severity: 'Critical', account, page: pagePath, summary: `로그인 상태인데 /login으로 리다이렉트`, expected: `${pagePath} 정상 접근`, actual: `${currentUrl}로 리다이렉트됨`, screenshot: `screenshots/${screenshotName}` });
  } else if (redirected) {
    addBug({ severity: 'Minor', account, page: pagePath, summary: `다른 페이지로 리다이렉트됨`, expected: `${pagePath}`, actual: `${currentUrl}`, screenshot: `screenshots/${screenshotName}` });
  }

  if (!redirected) {
    // Empty screen
    if (analysis.textLength < 50) {
      addBug({ severity: 'Critical', account, page: pagePath, summary: `빈 화면 — 본문 ${analysis.textLength}자`, expected: '정상 콘텐츠 렌더링', actual: `텍스트 ${analysis.textLength}자 (50자 미만)`, screenshot: `screenshots/${screenshotName}` });
    }

    // Dark wrappers (old theme)
    const bigDarkWrappers = analysis.darkWrappers.filter(w => w.rect.w > 200 && w.rect.h > 200);
    if (bigDarkWrappers.length > 0) {
      addBug({
        severity: 'Major', account, page: pagePath,
        summary: `다크 배경 감지 (이전 Sovereign Sage 테마 잔재)`,
        expected: '배경 베이지(#faf8f5) 또는 흰색',
        actual: bigDarkWrappers.map(w => `${w.tag}[${w.class.substring(0,40)}] bg=${w.bg} (${w.rect.w}x${w.rect.h})`).join('; '),
        screenshot: `screenshots/${screenshotName}`,
        details: `dark wrapper ${bigDarkWrappers.length}개 감지`,
      });
    }

    // Old theme class counts
    const otc = analysis.oldThemeClasses;
    if (otc.slate950 + otc.slate900 > 0) {
      addBug({
        severity: 'Major', account, page: pagePath,
        summary: `이전 테마(Sovereign Sage) CSS 클래스 잔재 — slate-950: ${otc.slate950}개, slate-900: ${otc.slate900}개`,
        expected: 'Natural Organic 테마 (올리브그린, 베이지)',
        actual: `slate-950: ${otc.slate950}, slate-900: ${otc.slate900}, slate-800: ${otc.slate800}, cyan-400: ${otc.cyan400}`,
        screenshot: `screenshots/${screenshotName}`,
      });
    }
    if (otc.cyan400 > 0) {
      addBug({
        severity: 'Major', account, page: pagePath,
        summary: `이전 테마 액센트 색상(cyan-400) ${otc.cyan400}개 감지`,
        expected: '올리브그린(#5a7247) 액센트',
        actual: `cyan-400 클래스 ${otc.cyan400}개`,
        screenshot: `screenshots/${screenshotName}`,
      });
    }

    // Double sidebar (actual left-panel count)
    const leftSidebarCount = analysis.leftSidebars.length;
    if (leftSidebarCount >= 2) {
      const details = analysis.leftSidebars.map((s, i) =>
        `[${i}] ${s.tag} x=${s.x} y=${s.y} w=${s.width} h=${s.height} bg=${s.bg} class=${s.class.substring(0,50)}`
      ).join('\n');
      addBug({
        severity: 'Critical', account, page: pagePath,
        summary: `이중 사이드바 — 왼쪽에 세로 패널 ${leftSidebarCount}개`,
        expected: '사이드바 1개',
        actual: `왼쪽 사이드바 ${leftSidebarCount}개 동시 표시`,
        screenshot: `screenshots/${screenshotName}`,
        details,
      });
    }

    // Total nav/aside elements for reference
    const visibleNavs = analysis.navElements.filter(e => e.visible);
    if (visibleNavs.length >= 3) {
      // Only report if not already reported as double sidebar
      if (leftSidebarCount < 2) {
        addBug({
          severity: 'Minor', account, page: pagePath,
          summary: `nav/aside 요소 ${visibleNavs.length}개 (과다)`,
          expected: '2개 이하',
          actual: `visible nav/aside ${visibleNavs.length}개`,
          screenshot: `screenshots/${screenshotName}`,
        });
      }
    }

    // Font check — headings should have serif
    const headingFont = analysis.fonts.h1 || analysis.fonts.h2 || analysis.fonts.h3;
    if (headingFont && !headingFont.toLowerCase().includes('serif') && !headingFont.toLowerCase().includes('noto')) {
      addBug({
        severity: 'Cosmetic', account, page: pagePath,
        summary: `헤딩 폰트가 세리프 아님 — ${headingFont.substring(0, 50)}`,
        expected: 'Noto Serif KR (세리프)',
        actual: headingFont.substring(0, 80),
        screenshot: `screenshots/${screenshotName}`,
      });
    }

    // undefined/NaN/[object Object]
    if (analysis.hasUndefined) addBug({ severity: 'Major', account, page: pagePath, summary: '"undefined" 텍스트 노출', expected: '정상 데이터', actual: 'undefined 텍스트 표시됨', screenshot: `screenshots/${screenshotName}` });
    if (analysis.hasNaN) addBug({ severity: 'Major', account, page: pagePath, summary: '"NaN" 텍스트 노출', expected: '정상 숫자', actual: 'NaN 텍스트 표시됨', screenshot: `screenshots/${screenshotName}` });
    if (analysis.hasObjectObject) addBug({ severity: 'Major', account, page: pagePath, summary: '"[object Object]" 텍스트 노출', expected: '정상 데이터', actual: '[object Object] 표시됨', screenshot: `screenshots/${screenshotName}` });

    // Horizontal scroll
    if (analysis.hasHorizontalScroll) {
      addBug({ severity: 'Minor', account, page: pagePath, summary: '가로 스크롤 발생', expected: '가로 스크롤 없음', actual: '수평 스크롤바 표시됨', screenshot: `screenshots/${screenshotName}` });
    }
  }

  // Console errors for this page
  const pageErrors = consoleErrors.filter(e => e.pagePath === pagePath);
  if (pageErrors.length > 0) {
    addBug({
      severity: 'Minor', account, page: pagePath,
      summary: `콘솔 에러 ${pageErrors.length}개`,
      expected: '콘솔 에러 없음',
      actual: pageErrors.map(e => e.text).join('\n'),
      screenshot: `screenshots/${screenshotName}`,
      consoleErrors: pageErrors.map(e => e.text),
    });
  }

  return {
    path: pagePath, name, screenshot: screenshotName, redirected, currentUrl,
    textLength: analysis.textLength,
    leftSidebarCount: analysis.leftSidebars.length,
    darkWrapperCount: analysis.darkWrappers.filter(w => w.rect.w > 200).length,
    oldThemeClasses: analysis.oldThemeClasses,
    headingFont: analysis.fonts.h1 || analysis.fonts.h2 || analysis.fonts.h3 || '(none)',
    consoleErrorCount: pageErrors.length,
    oliveButtons: analysis.oliveButtons,
    totalButtons: analysis.totalButtons,
    hasHorizontalScroll: analysis.hasHorizontalScroll,
  };
}

// ========== LOGIN FUNCTIONS ==========
async function loginApp(page, username, password) {
  console.log(`  🔑 App 로그인 (${username})...`);
  await page.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  const u = page.locator('input[type="text"], input[name="username"], input[name="id"], input[placeholder*="아이디"]').first();
  const p = page.locator('input[type="password"]').first();
  const s = page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();

  if (await u.count() === 0) return { success: false, error: '입력 필드 없음' };

  await u.fill(username);
  await p.fill(password);
  await s.click();
  await page.waitForTimeout(3000);

  const url = page.url();
  const success = !url.includes('/login');
  console.log(`    ${success ? '✅' : '❌'} → ${url}`);
  return { success, url };
}

async function loginAdmin(page) {
  console.log(`  🔑 Admin 패널 로그인 (/admin/login)...`);
  await page.goto(SITE + '/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  const u = page.locator('input[type="text"], input[name="username"]').first();
  const p = page.locator('input[type="password"]').first();
  const s = page.locator('button[type="submit"], button:has-text("로그인")').first();

  if (await u.count() === 0) return { success: false, error: 'Admin 로그인 폼 없음' };

  await u.fill('admin');
  await p.fill('admin1234');
  await s.click();
  await page.waitForTimeout(3000);

  const url = page.url();
  const success = !url.includes('/admin/login');
  console.log(`    ${success ? '✅' : '❌'} → ${url}`);
  return { success, url };
}

// ========== MAIN ==========
async function main() {
  console.log('🚀 CORTHEX v2 E2E QA — Full Rerun (v2)');
  console.log(`📅 2026-03-16 | 🌐 ${SITE}\n`);

  const browser = await chromium.launch({ headless: true });
  const results = { admin: { app: [], admin: [] }, ceo: { app: [] } };

  // ============================
  // STEP 1-3: ADMIN 계정
  // ============================
  console.log('═'.repeat(60));
  console.log('👤 ADMIN 계정 — STEP 1~3');
  console.log('═'.repeat(60));

  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const adminPage = await adminCtx.newPage();
  const adminErrors = [];
  adminPage.on('console', msg => { if (msg.type() === 'error') adminErrors.push({ pagePath: '', text: msg.text() }); });
  adminPage.on('pageerror', err => adminErrors.push({ pagePath: '', text: err.message }));

  // Update pagePath on navigation
  adminPage.on('framenavigated', () => {
    try { const p = new URL(adminPage.url()).pathname; adminErrors.forEach(e => { if (!e.pagePath) e.pagePath = p; }); } catch {}
  });

  // --- Login page screenshot ---
  await adminPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-login.png') });

  // --- Login edge cases ---
  console.log('\n  STEP 1: 로그인 에지 케이스');

  // 1a. Empty submit
  const submitBtn = adminPage.locator('button[type="submit"], button:has-text("로그인")').first();
  if (await submitBtn.count() > 0) {
    await submitBtn.click();
    await adminPage.waitForTimeout(1000);
    const errVisible = await adminPage.locator('[class*="error"], [class*="Error"], .text-red, [role="alert"]').count();
    console.log(`    빈 폼 제출 → 에러 표시: ${errVisible > 0 ? '✅' : '❌ (없음)'}`);
    if (errVisible === 0) {
      addBug({ severity: 'Minor', account: 'Admin', page: '/login', summary: '빈 폼 제출 시 에러 메시지 없음', expected: '유효성 검사 에러 표시', actual: '에러 메시지 없이 제출 시도', screenshot: 'screenshots/admin-login.png' });
    }
  }

  // 1b. Wrong password
  await adminPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await adminPage.waitForTimeout(500);
  let u = adminPage.locator('input[type="text"], input[name="username"]').first();
  let p = adminPage.locator('input[type="password"]').first();
  let s = adminPage.locator('button[type="submit"], button:has-text("로그인")').first();
  if (await u.count() > 0) {
    await u.fill('admin');
    await p.fill('wrongpassword');
    await s.click();
    await adminPage.waitForTimeout(1500);
    if (!adminPage.url().includes('/login')) {
      addBug({ severity: 'Security', account: 'Admin', page: '/login', summary: '틀린 비밀번호로 로그인 성공', expected: '로그인 거부', actual: '로그인 성공됨', screenshot: 'screenshots/admin-login.png' });
    } else {
      console.log('    틀린 비밀번호 → 거부: ✅');
    }
  }

  // 1c. Correct login
  const appLogin = await loginApp(adminPage, 'admin', 'admin1234');
  if (!appLogin.success) {
    addBug({ severity: 'Critical', account: 'Admin', page: '/login', summary: 'Admin App 로그인 실패', expected: '로그인 성공', actual: appLogin.error || '로그인 페이지 머무름', screenshot: 'screenshots/admin-login.png' });
  }

  // --- STEP 2: App 25 pages ---
  if (appLogin.success) {
    console.log('\n  STEP 2: App 25개 페이지 전수');
    for (const pg of APP_PAGES) {
      // Reset error tracker path
      adminErrors.forEach(e => { if (!e.pagePath) e.pagePath = pg.path; });
      const r = await inspectPage(adminPage, pg.path, pg.name, 'Admin', adminErrors);
      results.admin.app.push(r);
    }
  }

  // --- STEP 3: Admin 16 pages (separate login) ---
  console.log('\n  STEP 3: Admin 패널 별도 로그인 + 16개 페이지');
  const adminPanelLogin = await loginAdmin(adminPage);
  if (!adminPanelLogin.success) {
    addBug({ severity: 'Critical', account: 'Admin', page: '/admin/login', summary: 'Admin 패널 로그인 실패', expected: '로그인 성공', actual: adminPanelLogin.error || '로그인 실패', screenshot: 'screenshots/admin-panel-login.png' });
  } else {
    for (const pg of ADMIN_PAGES) {
      const r = await inspectPage(adminPage, pg.path, pg.name, 'Admin', adminErrors);
      results.admin.admin.push(r);
    }
  }

  // --- STEP 4: Sidebar navigation ---
  console.log('\n  STEP 4: 사이드바 네비게이션');
  if (appLogin.success) {
    await adminPage.goto(SITE + '/hub', { waitUntil: 'networkidle', timeout: 15000 });
    await adminPage.waitForTimeout(1500);
    const sidebarLinks = await adminPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, aside a'));
      return links.map(a => ({ href: a.getAttribute('href') || '', text: a.textContent?.trim().substring(0, 30) || '' })).filter(l => l.href.startsWith('/'));
    });
    console.log(`    사이드바 링크 ${sidebarLinks.length}개`);
    if (sidebarLinks.length === 0) {
      addBug({ severity: 'Critical', account: 'Admin', page: '/hub', summary: '사이드바에 네비게이션 링크 없음', expected: '메뉴 링크들', actual: '0개', screenshot: 'screenshots/admin-hub.png' });
    }
    // Click through each sidebar link
    for (const link of sidebarLinks.slice(0, 25)) {
      try {
        await adminPage.goto(SITE + link.href, { timeout: 10000 });
        await adminPage.waitForTimeout(500);
      } catch {}
    }
  }

  // --- STEP 5: Responsive ---
  console.log('\n  STEP 5: 반응형 (375px)');
  const mobilePages = ['/hub', '/dashboard', '/agents'];
  await adminPage.setViewportSize({ width: 375, height: 812 });
  for (const mp of mobilePages) {
    try { await adminPage.goto(SITE + mp, { waitUntil: 'networkidle', timeout: 15000 }); } catch {}
    await adminPage.waitForTimeout(1500);
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, `admin-${mp.replace('/', '')}-mobile.png`) });

    const mobileResult = await adminPage.evaluate(() => {
      const sidebars = document.querySelectorAll('nav, aside, [class*="sidebar"]');
      let visibleSidebar = false;
      for (const sb of sidebars) {
        const s = window.getComputedStyle(sb);
        const r = sb.getBoundingClientRect();
        if (s.display !== 'none' && s.visibility !== 'hidden' && r.width > 100 && r.height > 200) {
          visibleSidebar = true;
          break;
        }
      }
      const hamburger = document.querySelector('button[aria-label*="메뉴"], button[aria-label*="menu"], [class*="hamburger"], [class*="Menu"]');
      return { visibleSidebar, hasHamburger: !!hamburger };
    });

    if (mobileResult.visibleSidebar) {
      addBug({ severity: 'Minor', account: 'Admin', page: mp, summary: `모바일(375px)에서 사이드바 미숨김`, expected: '사이드바 숨김 + 햄버거 메뉴', actual: `사이드바 표시됨, 햄버거: ${mobileResult.hasHamburger ? '있음' : '없음'}`, screenshot: `screenshots/admin-${mp.replace('/', '')}-mobile.png` });
    }
    console.log(`    ${mp}: sidebar=${mobileResult.visibleSidebar ? '보임⚠️' : '숨김✅'} hamburger=${mobileResult.hasHamburger ? '✅' : '❌'}`);
  }
  await adminPage.setViewportSize({ width: 1280, height: 720 });

  await adminCtx.close();

  // ============================
  // STEP 6-8: CEO 계정
  // ============================
  console.log('\n' + '═'.repeat(60));
  console.log('👤 CEO 계정 — STEP 6~8');
  console.log('═'.repeat(60));

  const ceoCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const ceoPage = await ceoCtx.newPage();
  const ceoErrors = [];
  ceoPage.on('console', msg => { if (msg.type() === 'error') ceoErrors.push({ pagePath: '', text: msg.text() }); });

  // STEP 6: CEO login
  console.log('\n  STEP 6: CEO 로그인');
  const ceoLogin = await loginApp(ceoPage, 'ceo', 'ceo1234');
  if (!ceoLogin.success) {
    addBug({ severity: 'Critical', account: 'CEO', page: '/login', summary: 'CEO 로그인 실패', expected: '로그인 성공', actual: '실패', screenshot: 'screenshots/ceo-login.png' });
  } else {
    // STEP 7: CEO app pages
    console.log('\n  STEP 7: CEO App 25개 페이지');
    for (const pg of APP_PAGES) {
      const r = await inspectPage(ceoPage, pg.path, pg.name, 'CEO', ceoErrors);
      results.ceo.app.push(r);
    }

    // STEP 8: CEO admin access security
    console.log('\n  STEP 8: CEO Admin 접근 보안 테스트');
    const securityPaths = ['/admin/dashboard', '/admin/users', '/admin/credentials', '/admin/agents'];
    for (const sp of securityPaths) {
      await ceoPage.goto(SITE + sp, { waitUntil: 'networkidle', timeout: 15000 });
      await ceoPage.waitForTimeout(1500);
      const ceoAdminUrl = ceoPage.url();
      await ceoPage.screenshot({ path: path.join(SCREENSHOTS_DIR, `ceo-security-${sp.replace(/\//g, '-')}.png`) });

      if (ceoAdminUrl.includes('/admin') && !ceoAdminUrl.includes('/admin/login') && !ceoAdminUrl.includes('/login')) {
        addBug({
          severity: 'Security', account: 'CEO', page: sp,
          summary: `CEO가 ${sp} 접근 가능 — 권한 검사 미흡`,
          expected: '접근 거부 (리다이렉트 또는 403)',
          actual: `${ceoAdminUrl}에 접근됨`,
          screenshot: `screenshots/ceo-security-${sp.replace(/\//g, '-')}.png`,
        });
      } else {
        console.log(`    ${sp} → 차단됨 ✅ (${ceoAdminUrl})`);
      }
    }
  }

  await ceoCtx.close();
  await browser.close();

  // ============================
  // BUGS.md 생성
  // ============================
  console.log('\n' + '═'.repeat(60));
  console.log('📝 BUGS.md 생성...');

  const severity = (s) => bugs.filter(b => b.severity === s).length;

  let md = `# Playwright QA 버그 리포트
> 검사일: 2026-03-16
> 검사자: Claude Code (Playwright — headless chromium, v2)
> 사이트: ${SITE}
> 디자인 기준: Natural Organic (올리브그린 #5a7247, 베이지 #faf8f5)

## 요약
- Admin App: ${results.admin.app.length}/25 페이지 검사
- Admin Panel: ${results.admin.admin.length}/16 페이지 검사
- CEO App: ${results.ceo.app.length}/25 페이지 + Admin 보안 테스트
- 발견 버그: **${bugs.length}개** (Critical: ${severity('Critical')} | Major: ${severity('Major')} | Minor: ${severity('Minor')} | Cosmetic: ${severity('Cosmetic')} | Security: ${severity('Security')})

---

## 페이지별 상태표

### Admin 계정 — App 페이지
| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 리다이렉트 | 판정 |
|---|------|--------|-----------|-----------|---------|----------|------|
`;

  results.admin.app.forEach((r, i) => {
    const render = r.textLength > 50 ? '✅' : '❌';
    const sidebar = r.leftSidebarCount >= 2 ? `❌(${r.leftSidebarCount})` : '✅';
    const dark = (r.oldThemeClasses.slate950 + r.oldThemeClasses.slate900 > 0) ? `❌(s950:${r.oldThemeClasses.slate950} s900:${r.oldThemeClasses.slate900})` : '✅';
    const err = r.consoleErrorCount > 0 ? `❌(${r.consoleErrorCount})` : '✅';
    const redir = r.redirected ? `→${r.currentUrl.substring(0, 30)}` : '✅';
    const ok = r.textLength > 50 && r.leftSidebarCount < 2 && !r.redirected ? '✅' : '❌';
    md += `| ${i + 1} | ${r.path} | ${render} | ${sidebar} | ${dark} | ${err} | ${redir} | ${ok} |\n`;
  });

  md += `\n### Admin 계정 — Admin 패널
| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 판정 |
|---|------|--------|-----------|-----------|---------|------|
`;

  results.admin.admin.forEach((r, i) => {
    const render = r.textLength > 50 ? '✅' : '❌';
    const sidebar = r.leftSidebarCount >= 2 ? `❌(${r.leftSidebarCount})` : '✅';
    const dark = (r.oldThemeClasses.slate950 + r.oldThemeClasses.slate900 > 0) ? `❌` : '✅';
    const err = r.consoleErrorCount > 0 ? `❌(${r.consoleErrorCount})` : '✅';
    const ok = r.textLength > 50 && r.leftSidebarCount < 2 ? '✅' : '❌';
    md += `| ${i + 1} | ${r.path} | ${render} | ${sidebar} | ${dark} | ${err} | ${ok} |\n`;
  });

  md += `\n### CEO 계정 — App 페이지
| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 판정 |
|---|------|--------|-----------|-----------|---------|------|
`;

  results.ceo.app.forEach((r, i) => {
    const render = r.textLength > 50 ? '✅' : '❌';
    const sidebar = r.leftSidebarCount >= 2 ? `❌(${r.leftSidebarCount})` : '✅';
    const dark = (r.oldThemeClasses.slate950 + r.oldThemeClasses.slate900 > 0) ? `❌` : '✅';
    const err = r.consoleErrorCount > 0 ? `❌(${r.consoleErrorCount})` : '✅';
    const ok = r.textLength > 50 && r.leftSidebarCount < 2 ? '✅' : '❌';
    md += `| ${i + 1} | ${r.path} | ${render} | ${sidebar} | ${dark} | ${err} | ${ok} |\n`;
  });

  // Bug list
  md += `\n---\n\n## 버그 목록\n\n`;

  bugs.forEach(bug => {
    md += `### ${bug.id}: ${bug.summary}
- **심각도**: ${bug.severity}
- **계정**: ${bug.account}
- **페이지**: ${bug.page}
- **기대 결과**: ${bug.expected}
- **실제 결과**: ${bug.actual}
- **스크린샷**: ${bug.screenshot}
`;
    if (bug.consoleErrors && bug.consoleErrors.length > 0) {
      md += `- **콘솔 에러**:\n\`\`\`\n${bug.consoleErrors.join('\n')}\n\`\`\`\n`;
    }
    if (bug.details) md += `- **세부 정보**:\n\`\`\`\n${bug.details}\n\`\`\`\n`;
    md += `\n---\n\n`;
  });

  // Screenshot list
  md += `## 스크린샷 목록\n`;
  fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).forEach(f => { md += `- \`screenshots/${f}\`\n`; });

  fs.writeFileSync(BUGS_FILE, md, 'utf-8');

  console.log(`\n✅ 완료!`);
  console.log(`📋 버그: ${bugs.length}개 (Critical: ${severity('Critical')}, Major: ${severity('Major')}, Minor: ${severity('Minor')}, Cosmetic: ${severity('Cosmetic')}, Security: ${severity('Security')})`);
  console.log(`📄 ${BUGS_FILE}`);
}

main().catch(err => { console.error('❌ 오류:', err); process.exit(1); });
