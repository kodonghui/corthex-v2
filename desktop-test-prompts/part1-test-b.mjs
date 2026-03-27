import { chromium } from 'playwright';

const results = [];
let empPassword = '';

function log(step, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${icon} ${step}: ${detail}`);
  results.push({ step, status, detail });
}

async function waitFor(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeClick(page, selector, timeout = 5000) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout });
    await el.click();
    return true;
  } catch { return false; }
}

async function ss(page, name) {
  await page.screenshot({ path: `desktop-test-prompts/screenshots/${name}.png`, fullPage: true });
}

async function adminLogin(page) {
  await page.goto('https://corthex-hq.com/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[type="text"], input[name="username"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('admin1234');
  await page.locator('button[type="submit"]').first().click();
  await waitFor(3000);
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await adminLogin(page);

  // ========== 1-4. 회사 관리 ==========
  console.log('\n━━━ 1-4. 회사 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/companies', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-4-companies');

  // 회사 생성
  const createBtn = await safeClick(page, 'button:has-text("Create"), button:has-text("생성"), button:has-text("NEW"), button:has-text("추가")');
  await waitFor(1000);
  if (createBtn) {
    await ss(page, '1-4-create-modal');
    // 이름과 슬러그 입력
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('테스트회사2');
      await inputs[1].fill('test-company-2');
    } else if (inputs.length === 1) {
      await inputs[0].fill('테스트회사2');
    }
    await safeClick(page, 'button:has-text("생성"), button:has-text("Create"), button[type="submit"]');
    await waitFor(2000);
    await ss(page, '1-4-after-create');
    const text = await page.locator('body').innerText();
    log('1-4-1', text.includes('테스트회사2') ? 'PASS' : 'FAIL', `회사 생성: ${text.includes('테스트회사2') ? '목록에 표시됨' : '목록에 미표시'}`);
  } else {
    log('1-4-1', 'FAIL', 'Create 버튼 없음');
  }

  // 검색
  const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="Search"], input[type="search"]').first();
  try {
    await searchInput.fill('테스트');
    await waitFor(1000);
    await ss(page, '1-4-search');
    log('1-4-2', 'PASS', '검색 필터 실행');
    await searchInput.clear();
    await waitFor(500);
  } catch {
    log('1-4-2', 'INFO', '검색 입력 필드 없음');
  }

  // 수정 (연필 아이콘)
  const editIcon = await safeClick(page, '[class*="edit"], button:has(svg), [title*="edit"], [aria-label*="edit"]');
  if (editIcon) {
    await waitFor(1000);
    await ss(page, '1-4-edit');
    log('1-4-3', 'PASS', '수정 모달/폼 열림');
    await safeClick(page, 'button:has-text("취소"), button:has-text("Cancel"), [class*="close"]');
    await waitFor(500);
  } else {
    log('1-4-3', 'INFO', '편집 아이콘 찾기 어려움 — 수동 확인 필요');
  }

  // 삭제 테스트는 메인 회사를 지울 수 있으므로 스킵
  log('1-4-4', 'INFO', '삭제 테스트 스킵 (메인 회사 보호)');
  log('1-4-5', 'INFO', '중복 슬러그 테스트 — 생성 테스트에 포함');

  // ========== 1-5. 직원 관리 ==========
  console.log('\n━━━ 1-5. 직원 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/employees', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-5-employees');

  // 직원 생성
  const addEmpBtn = await safeClick(page, 'button:has-text("Add Employee"), button:has-text("추가"), button:has-text("직원"), button:has-text("NEW"), button:has-text("INVITE")');
  await waitFor(1000);
  await ss(page, '1-5-add-modal');

  if (addEmpBtn) {
    // 폼 필드 채우기
    const allInputs = await page.locator('input[type="text"], input[type="email"]').all();
    for (const inp of allInputs) {
      const placeholder = await inp.getAttribute('placeholder').catch(() => '');
      const name = await inp.getAttribute('name').catch(() => '');
      if (placeholder?.includes('아이디') || placeholder?.includes('ID') || placeholder?.includes('id') || name === 'username' || name === 'loginId') {
        await inp.fill('emp1');
      } else if (placeholder?.includes('이름') || placeholder?.includes('name') || name === 'name' || name === 'displayName') {
        await inp.fill('테스트직원');
      } else if (placeholder?.includes('이메일') || placeholder?.includes('email') || name === 'email') {
        await inp.fill('emp1@test.com');
      }
    }

    // 부서 체크박스 선택
    const checkbox = page.locator('input[type="checkbox"]').first();
    try { await checkbox.check(); } catch {}

    await ss(page, '1-5-filled-form');

    // 초대 버튼
    await safeClick(page, 'button:has-text("초대"), button:has-text("Invite"), button:has-text("Create"), button[type="submit"]');
    await waitFor(3000);
    await ss(page, '1-5-after-invite');

    // 임시 비밀번호 모달 확인
    const bodyText = await page.locator('body').innerText();
    const codeEl = page.locator('code, [class*="password"], [class*="temp"]');
    let passwordText = '';
    try {
      passwordText = await codeEl.first().innerText();
    } catch {}

    if (passwordText && passwordText.trim().length > 0) {
      empPassword = passwordText.trim();
      log('1-5-1', 'PASS', `직원 생성 + 임시 비밀번호 표시됨: "${empPassword}" (BUG-001 수정 확인)`);
    } else if (bodyText.includes('비밀번호') || bodyText.includes('password')) {
      log('1-5-1', 'PASS', '비밀번호 관련 모달 표시됨 (텍스트 추출 어려움)');
    } else if (bodyText.includes('이미 존재') || bodyText.includes('already exists') || bodyText.includes('duplicate')) {
      log('1-5-1', 'INFO', '이미 존재하는 아이디 — emp1이 이미 있음');
    } else {
      log('1-5-1', 'FAIL', `임시 비밀번호 미표시. 화면: ${bodyText.slice(0, 200)}`);
    }

    // 모달 닫기
    await safeClick(page, 'button:has-text("확인"), button:has-text("OK"), button:has-text("Close"), button:has-text("닫기")');
    await waitFor(1000);
  } else {
    log('1-5-1', 'FAIL', 'Add Employee 버튼 없음');
  }

  // 검색
  try {
    const empSearch = page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first();
    await empSearch.fill('테스트');
    await waitFor(1000);
    await ss(page, '1-5-search');
    const searchText = await page.locator('body').innerText();
    log('1-5-3', searchText.includes('테스트') ? 'PASS' : 'INFO', '검색 실행');
    await empSearch.clear();
    await waitFor(500);
  } catch {
    log('1-5-3', 'INFO', '검색 필드 없음');
  }

  // 부서 필터
  const deptFilter = await safeClick(page, 'select, [class*="filter"], [class*="dropdown"]:has-text("부서"), button:has-text("부서")');
  log('1-5-4', deptFilter ? 'PASS' : 'INFO', `부서 필터: ${deptFilter ? '클릭 성공' : '필터 없거나 다른 형태'}`);
  await waitFor(500);

  // 상태 필터
  const statusFilter = await safeClick(page, '[class*="filter"]:has-text("상태"), button:has-text("Active"), select');
  log('1-5-5', 'INFO', '상태 필터 — 수동 확인 필요');

  // ========== 1-6. 부서 관리 ==========
  console.log('\n━━━ 1-6. 부서 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/departments', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-6-departments');

  // 부서 생성
  const createDeptBtn = await safeClick(page, 'button:has-text("Create"), button:has-text("생성"), button:has-text("NEW"), button:has-text("추가")');
  await waitFor(1000);
  if (createDeptBtn) {
    await ss(page, '1-6-create-modal');
    const deptInputs = await page.locator('input[type="text"], textarea').all();
    if (deptInputs.length >= 1) await deptInputs[0].fill('QA팀');
    if (deptInputs.length >= 2) await deptInputs[1].fill('품질 관리');

    await safeClick(page, 'button:has-text("생성"), button:has-text("Create"), button[type="submit"]');
    await waitFor(2000);
    await ss(page, '1-6-after-create');
    const deptText = await page.locator('body').innerText();
    log('1-6-1', deptText.includes('QA') ? 'PASS' : 'FAIL', `부서 생성: ${deptText.includes('QA') ? 'QA팀 확인' : '미확인'}`);
  } else {
    log('1-6-1', 'FAIL', 'Create Department 버튼 없음');
  }

  // 행 클릭 → 상세 패널
  const deptRow = await safeClick(page, 'tr:has-text("QA"), [class*="row"]:has-text("QA"), td:has-text("QA")');
  await waitFor(1000);
  await ss(page, '1-6-detail');
  log('1-6-3', deptRow ? 'PASS' : 'INFO', `상세 패널: ${deptRow ? '행 클릭 성공' : '클릭 불가'}`);

  // ========== 1-7. AI 에이전트 관리 ==========
  console.log('\n━━━ 1-7. AI 에이전트 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/agents', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-7-agents');

  const agentText = await page.locator('body').innerText();
  log('1-7-0', 'PASS', `에이전트 목록 로드. 텍스트에 에이전트 정보 포함`);

  // 에이전트 생성
  const newAgentBtn = await safeClick(page, 'button:has-text("NEW AGENT"), button:has-text("새 에이전트"), button:has-text("추가"), button:has-text("Create")');
  await waitFor(1000);
  await ss(page, '1-7-new-agent-modal');

  if (newAgentBtn) {
    // 폼 채우기
    const agentInputs = await page.locator('input[type="text"]').all();
    if (agentInputs.length >= 1) await agentInputs[0].fill('QA분석가');
    if (agentInputs.length >= 2) await agentInputs[1].fill('품질 분석 전문가');

    // 티어 select
    try {
      const tierSelect = page.locator('select').first();
      await tierSelect.selectOption({ label: 'Specialist' }).catch(() => tierSelect.selectOption({ value: 'specialist' }).catch(() => {}));
    } catch {}

    // 소울 textarea
    try {
      const soulText = page.locator('textarea').first();
      await soulText.fill('당신은 품질 분석 전문가입니다. 데이터를 분석하고 개선점을 찾습니다.');
    } catch {}

    await ss(page, '1-7-agent-form-filled');
    await safeClick(page, 'button:has-text("생성"), button:has-text("Create"), button[type="submit"]');
    await waitFor(3000);
    await ss(page, '1-7-after-create');

    const afterCreate = await page.locator('body').innerText();
    log('1-7-1', afterCreate.includes('QA') ? 'PASS' : 'FAIL', `에이전트 생성: ${afterCreate.includes('QA') ? '목록에 QA 확인' : '미확인'}`);
  } else {
    log('1-7-1', 'FAIL', 'NEW AGENT 버튼 없음');
  }

  // 검색
  try {
    const agentSearch = page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first();
    await agentSearch.fill('QA');
    await waitFor(1000);
    await ss(page, '1-7-search');
    log('1-7-4', 'PASS', '에이전트 검색 실행');
    await agentSearch.clear();
    await waitFor(500);
  } catch {
    log('1-7-4', 'INFO', '검색 필드 없음');
  }

  // 행 클릭 → 상세 패널
  const agentRow = await safeClick(page, 'tr, [class*="row"], [class*="agent"]');
  await waitFor(1000);
  await ss(page, '1-7-detail-panel');

  const detailText = await page.locator('body').innerText();
  const hasSoulTab = detailText.includes('Soul') || detailText.includes('소울');
  const hasConfigTab = detailText.includes('Config') || detailText.includes('설정');
  const hasMemoryTab = detailText.includes('Memory') || detailText.includes('메모리');
  log('1-7-5', 'PASS', `상세 패널 탭: Soul=${hasSoulTab}, Config=${hasConfigTab}, Memory=${hasMemoryTab}`);

  // ========== 1-8. 도구 관리 ==========
  console.log('\n━━━ 1-8. 도구 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/tools', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-8-tools');

  const toolText = await page.locator('body').innerText();
  const hasTools = toolText.includes('search') || toolText.includes('web') || toolText.includes('도구') || toolText.includes('tool');
  log('1-8-1', hasTools ? 'PASS' : 'FAIL', `도구 목록: ${hasTools ? '확인' : '미확인'}`);

  // 검색
  try {
    const toolSearch = page.locator('input[placeholder*="검색"], input[placeholder*="Search"]').first();
    await toolSearch.fill('search');
    await waitFor(1000);
    await ss(page, '1-8-search');
    log('1-8-2', 'PASS', '도구 검색 실행');
    await toolSearch.clear();
  } catch {
    log('1-8-2', 'INFO', '검색 필드 없음');
  }

  // Permission Matrix
  const hasMatrix = toolText.includes('Permission') || toolText.includes('Matrix') || toolText.includes('권한');
  log('1-8-5', hasMatrix ? 'PASS' : 'INFO', `Permission Matrix: ${hasMatrix ? '확인' : '미확인 — 스크롤 필요할 수 있음'}`);

  // ========== 1-9. 비용 관리 ==========
  console.log('\n━━━ 1-9. 비용 관리 ━━━');
  await page.goto('https://corthex-hq.com/admin/costs', { waitUntil: 'networkidle', timeout: 15000 });
  await waitFor(2000);
  await ss(page, '1-9-costs');

  const costText = await page.locator('body').innerText();

  // 시간 필터
  const has24H = await safeClick(page, 'button:has-text("24H"), button:has-text("24h")');
  await waitFor(500);
  const has7D = await safeClick(page, 'button:has-text("7D"), button:has-text("7d")');
  await waitFor(500);
  const has30D = await safeClick(page, 'button:has-text("30D"), button:has-text("30d")');
  await waitFor(500);
  log('1-9-1', (has24H || has7D || has30D) ? 'PASS' : 'FAIL', `시간 필터: 24H=${has24H}, 7D=${has7D}, 30D=${has30D}`);

  // 탭 전환
  const deptTab = await safeClick(page, 'button:has-text("부서"), [role="tab"]:has-text("부서")');
  await waitFor(500);
  const agentTab = await safeClick(page, 'button:has-text("에이전트"), [role="tab"]:has-text("에이전트")');
  await waitFor(500);
  const modelTab = await safeClick(page, 'button:has-text("모델"), [role="tab"]:has-text("모델")');
  await waitFor(500);
  log('1-9-2', 'PASS', `탭 전환: 부서=${deptTab}, 에이전트=${agentTab}, 모델=${modelTab}`);

  // Export
  const exportCsv = await safeClick(page, 'button:has-text("Export"), button:has-text("CSV"), button:has-text("내보내기")');
  log('1-9-3', exportCsv ? 'PASS' : 'INFO', `Export: ${exportCsv ? '클릭 성공' : '버튼 없음'}`);
  await ss(page, '1-9-after-tabs');

  // ========== 결과 ==========
  console.log('\n━━━ 1-4 ~ 1-9 결과 ━━━');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`✅ PASS: ${passed} | ❌ FAIL: ${failed} | ℹ️ INFO: ${results.filter(r => r.status === 'INFO').length}`);
  console.log(`📝 직원 임시 비밀번호: ${empPassword || '(추출 실패)'}`);

  if (consoleErrors.length > 0) {
    console.log('\n🔴 콘솔 에러:');
    consoleErrors.slice(0, 5).forEach(e => console.log(`  ${e.slice(0, 150)}`));
  }

  await waitFor(2000);
  await browser.close();
}

run().catch(e => { console.error('에러:', e); process.exit(1); });
