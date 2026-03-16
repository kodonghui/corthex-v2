const { chromium } = require('playwright');

const SITE = 'https://corthex-hq.com';

const PAGES_TO_CHECK = [
  { path: '/hub', account: 'app' },
  { path: '/dashboard', account: 'app' },
  { path: '/agents', account: 'app' },
  { path: '/departments', account: 'app' },
  { path: '/classified', account: 'app' }, // nav 5개 감지됐던 페이지
  { path: '/chat', account: 'app' },       // nav 3개 감지됐던 페이지
  { path: '/admin/users', account: 'admin' },
  { path: '/admin/soul-templates', account: 'admin' }, // nav 5개
  { path: '/admin/costs', account: 'admin' },          // nav 3개
  { path: '/admin/onboarding', account: 'admin' },     // nav 3개
];

async function analyzeNavElements(page, pagePath) {
  const analysis = await page.evaluate(() => {
    const navEls = Array.from(document.querySelectorAll('nav, aside, [class*="sidebar"], [class*="Sidebar"]'));
    return navEls.map((el, i) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        index: i,
        tag: el.tagName,
        class: el.className.substring(0, 80),
        id: el.id || '',
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        display: style.display,
        position: style.position,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
      };
    });
  });

  console.log(`\n📄 ${pagePath}`);
  let verticalNavCount = 0; // 실제 사이드바 (세로 배치)
  let horizontalNavCount = 0; // 상단바 (가로 배치)

  analysis.forEach(el => {
    if (!el.visible) {
      console.log(`  [${el.index}] ${el.tag} — HIDDEN (skip)`);
      return;
    }
    const isVertical = el.height > el.width * 1.5; // 세로로 길면 사이드바
    const isTopbar = el.y < 80 && el.width > 800; // Y가 낮고 넓으면 상단바
    const isThinVertical = el.x < 300 && el.width < 350 && el.height > 300; // 왼쪽에 좁고 세로로 긴 것

    let type = '?';
    if (!el.visible) type = 'HIDDEN';
    else if (isTopbar) { type = 'TOPBAR'; horizontalNavCount++; }
    else if (isThinVertical || isVertical) { type = 'SIDEBAR'; verticalNavCount++; }
    else type = 'OTHER';

    console.log(`  [${el.index}] ${el.tag} | ${type} | x=${el.x} y=${el.y} w=${el.width} h=${el.height} | class: ${el.class.substring(0, 50)}`);
  });

  const hasDualSidebar = verticalNavCount >= 2;
  if (hasDualSidebar) {
    console.log(`  ⚠️  실제 이중 사이드바! 세로 nav ${verticalNavCount}개, 상단바 ${horizontalNavCount}개`);
  } else {
    console.log(`  ✅ 정상: 세로 사이드바 ${verticalNavCount}개, 상단바 ${horizontalNavCount}개`);
  }
  return { verticalNavCount, horizontalNavCount, hasDualSidebar };
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // App 로그인
  const appCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const appPage = await appCtx.newPage();

  console.log('🔑 App 로그인...');
  await appPage.goto(SITE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await appPage.waitForTimeout(1000);
  const u = appPage.locator('input[type="text"], input[name="username"]').first();
  const p = appPage.locator('input[type="password"]').first();
  const s = appPage.locator('button[type="submit"], button:has-text("로그인")').first();
  await u.fill('admin'); await p.fill('admin1234'); await s.click();
  await appPage.waitForTimeout(2500);
  console.log('  → ' + appPage.url());

  console.log('\n=== APP 페이지 사이드바 정밀 분석 ===');
  for (const pg of PAGES_TO_CHECK.filter(p => p.account === 'app')) {
    await appPage.goto(SITE + pg.path, { waitUntil: 'networkidle', timeout: 15000 });
    await appPage.waitForTimeout(1500);
    await analyzeNavElements(appPage, pg.path);
  }

  await appCtx.close();

  // Admin 로그인
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const adminPage = await adminCtx.newPage();

  console.log('\n🔑 Admin 패널 로그인...');
  await adminPage.goto(SITE + '/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
  await adminPage.waitForTimeout(1000);
  const au = adminPage.locator('input[type="text"], input[name="username"]').first();
  const ap = adminPage.locator('input[type="password"]').first();
  const as_ = adminPage.locator('button[type="submit"], button:has-text("로그인")').first();
  await au.fill('admin'); await ap.fill('admin1234'); await as_.click();
  await adminPage.waitForTimeout(2500);
  console.log('  → ' + adminPage.url());

  console.log('\n=== ADMIN 페이지 사이드바 정밀 분석 ===');
  for (const pg of PAGES_TO_CHECK.filter(p => p.account === 'admin')) {
    await adminPage.goto(SITE + pg.path, { waitUntil: 'networkidle', timeout: 15000 });
    await adminPage.waitForTimeout(1500);
    await analyzeNavElements(adminPage, pg.path);
  }

  await adminCtx.close();
  await browser.close();

  console.log('\n✅ 사이드바 분석 완료');
}

main().catch(err => { console.error('오류:', err); process.exit(1); });
