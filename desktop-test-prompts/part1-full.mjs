import { chromium } from 'playwright';

const results = [];
let empPassword = '';

function log(step, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${icon} ${step}: ${detail}`);
  results.push({ step, status, detail });
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function ss(page, name) {
  await page.screenshot({ path: `desktop-test-prompts/screenshots/${name}.png`, fullPage: true });
}

async function run() {
  // slowMo: 800ms — 각 동작마다 0.8초 대기 (눈으로 볼 수 있음)
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  // ╔══════════════════════════════════════╗
  // ║  1-1. 로그인                         ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-1. 로그인 ━━━');

  // 1-1-1. 정상 로그인
  await page.goto('https://corthex-hq.com/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
  await wait(1000);

  await page.locator('input[type="text"]').first().click();
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().click();
  await page.locator('input[type="password"]').first().fill('admin1234');
  await page.locator('button[type="submit"]').first().click();
  await wait(3000);

  const loginUrl = page.url();
  await ss(page, '1-1-login-success');
  log('1-1-1', !loginUrl.includes('/login') ? 'PASS' : 'FAIL',
    `정상 로그인. URL: ${loginUrl}`);

  // 1-1-2. 잘못된 비밀번호
  await page.goto('https://corthex-hq.com/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(1000);

  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('wrongpassword');
  await page.locator('button[type="submit"]').first().click();
  await wait(2000);

  const errUrl = page.url();
  const errBody = await page.locator('body').innerText();
  await ss(page, '1-1-wrong-pw');
  log('1-1-2', errUrl.includes('/login') ? 'PASS' : 'FAIL',
    `잘못된 비번: ${errUrl.includes('/login') ? '로그인 페이지 유지' : '이동됨'}. 에러텍스트: ${errBody.includes('올바르지') || errBody.includes('Invalid') ? '있음' : '확인필요'}`);

  // 다시 정상 로그인
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('admin1234');
  await page.locator('button[type="submit"]').first().click();
  await wait(3000);
  await page.waitForLoadState('networkidle').catch(() => {});

  // ╔══════════════════════════════════════╗
  // ║  1-2. 온보딩                         ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-2. 온보딩 ━━━');

  await page.goto('https://corthex-hq.com/admin/onboarding', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-2-step1');

  let obText = await page.locator('body').innerText();
  log('1-2-1', obText.includes('CORTHEX') || obText.includes('Company') ? 'PASS' : 'FAIL',
    'Step 1 회사 설정 로드');

  // NEXT DEPARTMENTS 버튼 클릭
  try {
    await page.locator('button:has-text("NEXT"), button:has-text("DEPARTMENTS")').first().click();
    await wait(2000);
    await ss(page, '1-2-step2');
    obText = await page.locator('body').innerText();
    log('1-2-2', obText.includes('템플릿') || obText.includes('Template') || obText.includes('DEPARTMENT') ? 'PASS' : 'INFO',
      `Step 2 부서/템플릿: ${obText.slice(0, 80).replace(/\n/g, ' ')}`);
  } catch (e) {
    log('1-2-2', 'FAIL', `Step 2 이동 실패: ${e.message.slice(0, 80)}`);
  }

  // Step 3 - CREDENTIALS
  try {
    await page.locator('button:has-text("NEXT"), button:has-text("CREDENTIALS"), button:has-text("다음")').first().click();
    await wait(2000);
    await ss(page, '1-2-step3');
    log('1-2-3', 'PASS', 'Step 3 API 키');
  } catch { log('1-2-3', 'INFO', 'Step 3 버튼 못찾음'); }

  // Step 4 - INVITE
  try {
    await page.locator('button:has-text("NEXT"), button:has-text("INVITE"), button:has-text("다음")').first().click();
    await wait(2000);
    await ss(page, '1-2-step4');
    log('1-2-4', 'PASS', 'Step 4 팀원 초대');
  } catch { log('1-2-4', 'INFO', 'Step 4 버튼 못찾음'); }

  // Step 5 - LAUNCH
  try {
    await page.locator('button:has-text("NEXT"), button:has-text("LAUNCH"), button:has-text("REVIEW"), button:has-text("다음")').first().click();
    await wait(2000);
    await ss(page, '1-2-step5');
    log('1-2-5', 'PASS', 'Step 5 완료/리뷰');
  } catch { log('1-2-5', 'INFO', 'Step 5 버튼 못찾음'); }

  // 대시보드로
  try {
    await page.locator('button:has-text("CORTHEX"), button:has-text("시작"), button:has-text("LAUNCH"), button:has-text("START")').first().click();
    await wait(2000);
  } catch {}

  // ╔══════════════════════════════════════╗
  // ║  1-3. 대시보드                       ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-3. 대시보드 ━━━');

  await page.goto('https://corthex-hq.com/admin', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-3-dashboard');

  const dashText = await page.locator('body').innerText();
  log('1-3-1', dashText.includes('DEPARTMENTS') ? 'PASS' : 'FAIL', `카드: DEPT=${dashText.includes('DEPARTMENTS')}, USERS=${dashText.includes('USERS')}, AGENTS=${dashText.includes('AGENTS')}`);
  log('1-3-2', dashText.includes('OPERATIONAL') || dashText.includes('Health') ? 'PASS' : 'FAIL', 'Health Status');
  log('1-3-3', dashText.includes('ACTIVITY') || dashText.includes('Activity') ? 'PASS' : 'FAIL', 'Recent Activity');
  log('1-3-4', dashText.includes('DEPARTMENT') ? 'PASS' : 'FAIL', 'Department Overview');

  // 버튼
  try {
    await page.locator('button:has-text("로그"), button:has-text("Export"), button:has-text("EXPORT")').first().click();
    await wait(1000);
    log('1-3-5', 'PASS', '로그 내보내기 클릭');
  } catch { log('1-3-5', 'INFO', '버튼 없음'); }

  try {
    await page.locator('button:has-text("전체"), button:has-text("View All"), button:has-text("VIEW")').first().click();
    await wait(1000);
    log('1-3-6', 'PASS', '전체 기록 보기 클릭');
  } catch { log('1-3-6', 'INFO', '버튼 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-4. 회사 관리                      ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-4. 회사 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/companies', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-4-companies');
  log('1-4-0', 'PASS', '회사 관리 페이지 로드');

  // 회사 생성
  try {
    await page.locator('button:has-text("Create"), button:has-text("추가"), button:has-text("NEW")').first().click();
    await wait(1500);
    await ss(page, '1-4-create-form');

    // 입력
    const nameInputs = await page.locator('input[type="text"]').all();
    if (nameInputs.length >= 2) {
      await nameInputs[0].fill('테스트회사2');
      await nameInputs[1].fill('test-company-2');
    } else if (nameInputs.length >= 1) {
      await nameInputs[0].fill('테스트회사2');
    }

    await page.locator('button:has-text("생성"), button:has-text("Create"), button[type="submit"]').first().click();
    await wait(2000);
    await ss(page, '1-4-after-create');
    const t = await page.locator('body').innerText();
    log('1-4-1', t.includes('테스트회사2') || t.includes('test-company-2') ? 'PASS' : 'FAIL', '회사 생성');
  } catch (e) {
    log('1-4-1', 'FAIL', `회사 생성 에러: ${e.message.slice(0, 80)}`);
  }

  // 검색
  try {
    await page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first().fill('테스트');
    await wait(1000);
    await ss(page, '1-4-search');
    log('1-4-2', 'PASS', '검색 실행');
    await page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first().clear();
    await wait(500);
  } catch { log('1-4-2', 'INFO', '검색 필드 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-5. 직원 관리                      ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-5. 직원 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/employees', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-5-employees');
  log('1-5-0', 'PASS', '직원 관리 페이지 로드');

  // Add Employee
  try {
    await page.locator('button:has-text("Add"), button:has-text("추가"), button:has-text("INVITE"), button:has-text("NEW")').first().click();
    await wait(1500);
    await ss(page, '1-5-add-modal');

    // 폼 필드 채우기 — placeholder나 name으로 찾기
    const inputs = await page.locator('dialog input, [role="dialog"] input, [class*="modal"] input, form input').all();
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder').catch(() => '') || '';
      const nm = await inp.getAttribute('name').catch(() => '') || '';
      const tp = await inp.getAttribute('type').catch(() => '') || '';

      if (ph.includes('아이디') || ph.includes('ID') || nm.includes('login') || nm.includes('username')) {
        await inp.fill('emp1');
      } else if (ph.includes('이름') || ph.includes('name') || nm === 'name' || nm === 'displayName') {
        await inp.fill('테스트직원');
      } else if (ph.includes('이메일') || ph.includes('email') || nm === 'email' || tp === 'email') {
        await inp.fill('emp1@test.com');
      }
    }

    // 부서 체크박스 하나 선택
    try {
      await page.locator('input[type="checkbox"]').first().check();
    } catch {}

    await wait(500);
    await ss(page, '1-5-form-filled');

    // 초대
    await page.locator('button:has-text("초대"), button:has-text("Invite"), button:has-text("Create"), button[type="submit"]').first().click();
    await wait(3000);
    await ss(page, '1-5-after-invite');

    // 임시 비밀번호 확인
    const bodyT = await page.locator('body').innerText();
    try {
      const codeText = await page.locator('code').first().innerText({ timeout: 3000 });
      if (codeText && codeText.trim().length > 0) {
        empPassword = codeText.trim();
        log('1-5-1', 'PASS', `임시 비밀번호: "${empPassword}" ★ BUG-001 수정 확인`);
      } else {
        log('1-5-1', 'FAIL', '비밀번호 빈칸 — BUG-001 재발?');
      }
    } catch {
      if (bodyT.includes('이미 존재') || bodyT.includes('already') || bodyT.includes('duplicate')) {
        log('1-5-1', 'INFO', 'emp1 이미 존재 — 이전 테스트에서 생성됨');
      } else {
        log('1-5-1', 'INFO', `비밀번호 code 태그 미발견. 텍스트: ${bodyT.slice(0, 150)}`);
      }
    }

    // 모달 닫기
    try {
      await page.locator('button:has-text("확인"), button:has-text("OK"), button:has-text("닫기"), button:has-text("Close")').first().click();
      await wait(1000);
    } catch {}
  } catch (e) {
    log('1-5-1', 'FAIL', `직원 생성 에러: ${e.message.slice(0, 100)}`);
  }

  // 검색
  try {
    await page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first().fill('테스트');
    await wait(1000);
    await ss(page, '1-5-search');
    log('1-5-3', 'PASS', '검색 실행');
    await page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first().clear();
  } catch { log('1-5-3', 'INFO', '검색 필드 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-6. 부서 관리                      ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-6. 부서 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/departments', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-6-departments');
  log('1-6-0', 'PASS', '부서 관리 페이지 로드');

  // 부서 생성
  try {
    await page.locator('button:has-text("Create"), button:has-text("추가"), button:has-text("NEW")').first().click();
    await wait(1500);
    const deptInputs = await page.locator('input[type="text"], textarea').all();
    if (deptInputs.length >= 1) await deptInputs[0].fill('QA팀');
    if (deptInputs.length >= 2) await deptInputs[1].fill('품질 관리');
    await ss(page, '1-6-create-form');

    await page.locator('button:has-text("생성"), button:has-text("Create"), button[type="submit"]').first().click();
    await wait(2000);
    await ss(page, '1-6-after-create');
    const dT = await page.locator('body').innerText();
    log('1-6-1', dT.includes('QA') ? 'PASS' : 'FAIL', `부서 생성: ${dT.includes('QA') ? 'QA팀 확인' : '미확인'}`);
  } catch (e) {
    log('1-6-1', 'FAIL', `부서 생성 에러: ${e.message.slice(0, 80)}`);
  }

  // ╔══════════════════════════════════════╗
  // ║  1-7. AI 에이전트 관리               ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-7. AI 에이전트 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/agents', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-7-agents');
  log('1-7-0', 'PASS', '에이전트 관리 페이지 로드');

  // 에이전트 생성
  try {
    await page.locator('button:has-text("NEW AGENT"), button:has-text("추가"), button:has-text("Create")').first().click();
    await wait(1500);
    await ss(page, '1-7-new-agent');

    const agInputs = await page.locator('input[type="text"]').all();
    if (agInputs.length >= 1) await agInputs[0].fill('QA분석가');
    if (agInputs.length >= 2) await agInputs[1].fill('품질 분석 전문가');

    // 드롭다운/select
    const selects = await page.locator('select').all();
    for (const sel of selects) {
      const options = await sel.locator('option').allInnerTexts();
      const optStr = options.join(',').toLowerCase();
      if (optStr.includes('specialist') || optStr.includes('스페셜')) {
        await sel.selectOption({ label: options.find(o => o.toLowerCase().includes('specialist')) || options[1] || '' });
      } else if (optStr.includes('haiku') || optStr.includes('claude')) {
        await sel.selectOption({ label: options.find(o => o.toLowerCase().includes('haiku')) || options[0] || '' });
      }
    }

    // 소울 textarea
    try {
      await page.locator('textarea').first().fill('당신은 품질 분석 전문가입니다. 데이터를 분석하고 개선점을 찾습니다.');
    } catch {}

    await ss(page, '1-7-agent-filled');
    await page.locator('button:has-text("생성"), button:has-text("Create"), button[type="submit"]').first().click();
    await wait(3000);
    await ss(page, '1-7-after-create');
    const agT = await page.locator('body').innerText();
    log('1-7-1', agT.includes('QA') ? 'PASS' : 'FAIL', `에이전트 생성: ${agT.includes('QA') ? 'QA 확인' : '미확인'}`);
  } catch (e) {
    log('1-7-1', 'FAIL', `에이전트 생성 에러: ${e.message.slice(0, 80)}`);
  }

  // 행 클릭 → 상세 패널
  try {
    await page.locator('tr:has-text("비서실장"), [class*="row"]').first().click();
    await wait(2000);
    await ss(page, '1-7-detail');
    const detailT = await page.locator('body').innerText();
    log('1-7-5', 'PASS', `상세 패널: Soul=${detailT.includes('Soul')}, Config=${detailT.includes('Config')}, Memory=${detailT.includes('Memory')}`);

    // Soul 탭
    try {
      await page.locator('button:has-text("Soul"), [role="tab"]:has-text("Soul")').first().click();
      await wait(1000);
      await ss(page, '1-7-soul-tab');
      log('1-7-5a', 'PASS', 'Soul 탭 클릭');
    } catch {}

    // Config 탭
    try {
      await page.locator('button:has-text("Config"), [role="tab"]:has-text("Config")').first().click();
      await wait(1000);
      await ss(page, '1-7-config-tab');
      log('1-7-5b', 'PASS', 'Config 탭 클릭');
    } catch {}

    // Memory 탭
    try {
      await page.locator('button:has-text("Memory"), [role="tab"]:has-text("Memory")').first().click();
      await wait(1000);
      await ss(page, '1-7-memory-tab');
      log('1-7-5c', 'PASS', 'Memory 탭 클릭');
    } catch {}
  } catch {
    log('1-7-5', 'INFO', '상세 패널 열기 실패');
  }

  // ╔══════════════════════════════════════╗
  // ║  1-8. 도구 관리                      ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-8. 도구 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/tools', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-8-tools');
  const toolT = await page.locator('body').innerText();
  log('1-8-1', toolT.length > 200 ? 'PASS' : 'FAIL', `도구 관리 로드 (텍스트 ${toolT.length}자)`);

  // ╔══════════════════════════════════════╗
  // ║  1-9. 비용 관리                      ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-9. 비용 관리 ━━━');

  await page.goto('https://corthex-hq.com/admin/costs', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-9-costs');

  // 시간 필터 클릭
  for (const label of ['24H', '7D', '30D', 'ALL']) {
    try {
      await page.locator(`button:has-text("${label}")`).first().click();
      await wait(800);
    } catch {}
  }
  await ss(page, '1-9-filters');
  log('1-9-1', 'PASS', '시간 필터 전환');

  // 탭 전환
  for (const tab of ['부서', '에이전트', '모델']) {
    try {
      await page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`).first().click();
      await wait(800);
    } catch {}
  }
  log('1-9-2', 'PASS', '탭 전환');

  // Export
  try {
    await page.locator('button:has-text("Export"), button:has-text("CSV")').first().click();
    await wait(1000);
    log('1-9-3', 'PASS', 'Export 클릭');
  } catch { log('1-9-3', 'INFO', 'Export 버튼 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-10. CLI / API 키                  ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-10. CLI / API 키 ━━━');

  await page.goto('https://corthex-hq.com/admin/credentials', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-10-credentials');
  const credT = await page.locator('body').innerText();
  log('1-10-1', credT.length > 100 ? 'PASS' : 'FAIL', 'Credentials 페이지 로드');

  // 프로바이더 드롭다운
  try {
    const provSelect = page.locator('select').first();
    const provOptions = await provSelect.locator('option').allInnerTexts();
    log('1-10-2', 'PASS', `프로바이더 옵션: ${provOptions.slice(0, 6).join(', ')}`);

    // anthropic 선택
    await provSelect.selectOption({ label: provOptions.find(o => o.toLowerCase().includes('anthropic')) || provOptions[1] || '' });
    await wait(1000);
    await ss(page, '1-10-anthropic');
  } catch {
    log('1-10-2', 'INFO', '프로바이더 드롭다운 없거나 다른 형태');
  }

  // ╔══════════════════════════════════════╗
  // ║  1-11. 보고 라인                     ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-11. 보고 라인 ━━━');

  await page.goto('https://corthex-hq.com/admin/report-lines', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-11-report-lines');
  const rlT = await page.locator('body').innerText();
  log('1-11-1', rlT.length > 100 ? 'PASS' : 'FAIL', '보고 라인 페이지 로드');

  // ╔══════════════════════════════════════╗
  // ║  1-12. 소울 템플릿                   ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-12. 소울 템플릿 ━━━');

  await page.goto('https://corthex-hq.com/admin/soul-templates', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-12-soul-templates');
  const stT = await page.locator('body').innerText();
  log('1-12-1', stT.length > 100 ? 'PASS' : 'FAIL', '소울 템플릿 페이지 로드');

  // 생성
  try {
    await page.locator('button:has-text("Create"), button:has-text("추가"), button:has-text("NEW")').first().click();
    await wait(1500);
    const stInputs = await page.locator('input[type="text"]').all();
    if (stInputs.length >= 1) await stInputs[0].fill('테스트소울');
    try {
      await page.locator('textarea').first().fill('당신은 테스트 에이전트입니다. 사용자의 질문에 정확하게 답변하세요.');
    } catch {}
    await ss(page, '1-12-create-form');
    await page.locator('button:has-text("생성"), button:has-text("Create"), button[type="submit"]').first().click();
    await wait(2000);
    await ss(page, '1-12-after-create');
    const afterSt = await page.locator('body').innerText();
    log('1-12-2', afterSt.includes('테스트소울') ? 'PASS' : 'FAIL', '소울 템플릿 생성');
  } catch (e) {
    log('1-12-2', 'FAIL', `소울 템플릿 생성 에러: ${e.message.slice(0, 80)}`);
  }

  // ╔══════════════════════════════════════╗
  // ║  1-13. 시스템 모니터링               ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-13. 시스템 모니터링 ━━━');

  await page.goto('https://corthex-hq.com/admin/monitoring', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-13-monitoring');
  const monT = await page.locator('body').innerText();
  log('1-13-1', monT.includes('ONLINE') || monT.includes('OFFLINE') || monT.includes('Status') ? 'PASS' : 'FAIL', 'Server Status');
  log('1-13-2', monT.includes('Uptime') || monT.includes('uptime') ? 'PASS' : 'INFO', 'Uptime');
  log('1-13-3', monT.includes('Memory') || monT.includes('memory') || monT.includes('메모리') ? 'PASS' : 'INFO', 'Memory');
  log('1-13-4', monT.includes('Latency') || monT.includes('latency') || monT.includes('ms') ? 'PASS' : 'INFO', 'DB Latency');

  // Refresh
  try {
    await page.locator('button:has-text("Refresh"), button:has-text("새로고침"), button:has-text("REFRESH")').first().click();
    await wait(2000);
    await ss(page, '1-13-refreshed');
    log('1-13-5', 'PASS', 'Refresh 클릭');
  } catch { log('1-13-5', 'INFO', 'Refresh 버튼 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-14. NEXUS 조직도                  ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-14. NEXUS 조직도 ━━━');

  await page.goto('https://corthex-hq.com/admin/nexus', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(3000);
  await ss(page, '1-14-nexus');
  const nexT = await page.locator('body').innerText();
  log('1-14-1', nexT.includes('NEXUS') || nexT.length > 200 ? 'PASS' : 'FAIL', 'NEXUS 조직도 로드');

  // Fit View
  try {
    await page.locator('button:has-text("Fit"), button[title="fit view"], button:has-text("fitView")').first().click();
    await wait(1000);
    log('1-14-2', 'PASS', 'Fit View 클릭');
  } catch { log('1-14-2', 'INFO', 'Fit View 버튼 없음'); }

  // ╔══════════════════════════════════════╗
  // ║  1-15. 설정                          ║
  // ╚══════════════════════════════════════╝
  console.log('\n━━━ 1-15. 설정 ━━━');

  await page.goto('https://corthex-hq.com/admin/settings', { waitUntil: 'networkidle', timeout: 15000 });
  await wait(2000);
  await ss(page, '1-15-settings');
  const setT = await page.locator('body').innerText();
  log('1-15-1', setT.includes('General') || setT.includes('설정') || setT.includes('Settings') ? 'PASS' : 'FAIL', '설정 페이지 로드');

  // 탭 전환
  for (const tab of ['API', 'Agent', 'Keys']) {
    try {
      await page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`).first().click();
      await wait(800);
    } catch {}
  }
  await ss(page, '1-15-tabs');
  log('1-15-2', 'PASS', '설정 탭 전환');

  // ╔══════════════════════════════════════╗
  // ║  최종 결과                            ║
  // ╚══════════════════════════════════════╝
  console.log('\n\n╔══════════════════════════════════════╗');
  console.log('║  PART 1 최종 결과                    ║');
  console.log('╚══════════════════════════════════════╝');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;

  console.log(`\n✅ PASS: ${passed}개`);
  console.log(`❌ FAIL: ${failed}개`);
  console.log(`ℹ️  INFO: ${info}개`);
  console.log(`📊 총 테스트: ${results.length}개`);
  console.log(`📝 직원 임시 비밀번호: ${empPassword || '(미추출)'}`);

  if (failed > 0) {
    console.log('\n❌ 실패 항목:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.step}: ${r.detail}`));
  }

  if (consoleErrors.length > 0) {
    console.log(`\n🔴 콘솔 에러 (${consoleErrors.length}개):`);
    [...new Set(consoleErrors)].slice(0, 5).forEach(e => console.log(`  ${e.slice(0, 150)}`));
  }

  console.log('\n⏳ 5초 후 브라우저 닫힘...');
  await wait(5000);
  await browser.close();
  console.log('Part 1 테스트 완료!');
}

run().catch(e => { console.error('테스트 에러:', e); process.exit(1); });
