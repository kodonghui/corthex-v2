# Plan 1: Playwright 자동 QA 파이프라인

> **⚠️ 다음 단계 안내**
> 이 문서는 아이디어 메모입니다. 실제 구현 전에 반드시 BMAD 파이프라인으로 구체화할 것.
>
> ```
> /bmad-full-pipeline planning
> ```
>
> 위 명령으로 기획 파이프라인을 실행하여 Brief → PRD → Architecture → UX → Epics 순서로 정식 기획 문서를 만들고 나서 구현을 시작하세요.

---

## 개요

UX/UI 구현 후 **실제 브라우저에서 자동으로 검증**하는 파이프라인.

현재 파이프라인:
```
Claude (아키텍처 설명) → Anthropic/Gemini (Banana2 디자인 생성) → Claude (코드 구현)
```

여기에 추가할 단계:
```
→ Playwright (자동 검증) → 결과 보고 → 필요시 Claude 수정 → 재검증
```

---

## 1. 설치 및 기본 세팅

### 1-1. 패키지 설치

```bash
# 프로젝트 루트에서
bun add -d playwright @playwright/test

# 브라우저 바이너리 설치 (Chromium만 — 가볍게)
bunx playwright install chromium
```

### 1-2. 디렉토리 구조

```
packages/
  e2e/                          ← 새로 만들 패키지
    package.json
    playwright.config.ts
    src/
      fixtures/                 ← 공통 설정 (로그인 상태, 테스트 데이터 등)
        auth.fixture.ts         ← 로그인 완료 상태로 테스트 시작
        test-data.fixture.ts    ← 테스트용 회사/에이전트 데이터
      helpers/
        selectors.ts            ← 공통 CSS 셀렉터 모음
        assertions.ts           ← 커스텀 검증 함수
        screenshots.ts          ← 스크린샷 비교 유틸
        wait-helpers.ts         ← SSE/WebSocket 대기 유틸
      tests/
        smoke/                  ← 빠른 연기 테스트 (배포 후 1분 이내)
          health.spec.ts
          login.spec.ts
          navigation.spec.ts
        app/                    ← 메인 앱 페이지별 테스트
          command-center.spec.ts
          trading.spec.ts
          dashboard.spec.ts
          chat.spec.ts
          sns.spec.ts
          agora.spec.ts
          nexus.spec.ts
          knowledge.spec.ts
          cron.spec.ts
          activity-log.spec.ts
          costs.spec.ts
          messenger.spec.ts
          notifications.spec.ts
          settings.spec.ts
        admin/                  ← 어드민 콘솔 테스트
          login.spec.ts
          departments.spec.ts
          agents.spec.ts
          users.spec.ts
          credentials.spec.ts
          tools.spec.ts
          org-chart.spec.ts
          monitoring.spec.ts
        uxui/                   ← UX/UI 전용 검증 (핵심!)
          visual-regression.spec.ts
          responsive.spec.ts
          accessibility.spec.ts
          theme-consistency.spec.ts
          interaction-flow.spec.ts
        integration/            ← 페이지 간 연동 테스트
          command-to-report.spec.ts
          agent-crud-flow.spec.ts
          sns-publish-flow.spec.ts
      snapshots/                ← 스크린샷 기준 이미지 저장
        baseline/
        diff/
```

### 1-3. playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  workers: 3,

  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    // 인증 상태 준비 (한 번만 실행)
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 메인 앱 테스트
    {
      name: 'app-desktop',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    // 어드민 테스트
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'http://localhost:5173',
        storageState: 'src/fixtures/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // 모바일 반응형 테스트
    {
      name: 'app-mobile',
      use: {
        ...devices['iPhone 14'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
})
```

### 1-4. Auth Fixture (로그인 자동화)

```typescript
// src/fixtures/auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const USER_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@corthex.com',
  password: process.env.TEST_USER_PASSWORD || 'test1234',
}

const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@corthex.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin1234',
}

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('이메일').fill(USER_CREDENTIALS.email)
  await page.getByPlaceholder('비밀번호').fill(USER_CREDENTIALS.password)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/')
  await page.context().storageState({ path: 'src/fixtures/.auth/user.json' })
})

setup('authenticate as admin', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/login')
  await page.getByPlaceholder('이메일').fill(ADMIN_CREDENTIALS.email)
  await page.getByPlaceholder('비밀번호').fill(ADMIN_CREDENTIALS.password)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/admin/')
  await page.context().storageState({ path: 'src/fixtures/.auth/admin.json' })
})
```

---

## 2. UX/UI 검증 테스트 (핵심 — Banana2 디자인 구현 검증용)

### 2-1. 시각적 회귀 테스트 (Visual Regression)

Banana2에서 생성한 디자인 → Claude가 구현 → **Playwright가 스크린샷 찍어서 비교**.

```typescript
// src/tests/uxui/visual-regression.spec.ts
import { test, expect } from '@playwright/test'

// 모든 주요 페이지를 순회하며 스크린샷 비교
const PAGES = [
  { name: 'home', path: '/', waitFor: '[data-testid="dashboard"]' },
  { name: 'command-center', path: '/command-center', waitFor: '[data-testid="command-input"]' },
  { name: 'trading', path: '/trading', waitFor: '[data-testid="trading-view"]' },
  { name: 'chat', path: '/chat', waitFor: '[data-testid="chat-container"]' },
  { name: 'sns', path: '/sns', waitFor: '[data-testid="sns-list"]' },
  { name: 'agora', path: '/agora', waitFor: '[data-testid="debate-list"]' },
  { name: 'nexus', path: '/nexus', waitFor: '[data-testid="nexus-canvas"]' },
  { name: 'knowledge', path: '/knowledge', waitFor: '[data-testid="knowledge-tree"]' },
  { name: 'costs', path: '/costs', waitFor: '[data-testid="cost-chart"]' },
  { name: 'activity-log', path: '/activity-log', waitFor: '[data-testid="log-table"]' },
  { name: 'cron', path: '/cron', waitFor: '[data-testid="cron-list"]' },
  { name: 'settings', path: '/settings', waitFor: '[data-testid="settings-form"]' },
]

for (const page of PAGES) {
  test(`visual: ${page.name} 페이지 스크린샷 일치`, async ({ page: p }) => {
    await p.goto(page.path)
    await p.waitForSelector(page.waitFor, { timeout: 15_000 })
    // 로딩 애니메이션 끝날 때까지 대기
    await p.waitForLoadState('networkidle')
    await expect(p).toHaveScreenshot(`${page.name}.png`, {
      maxDiffPixelRatio: 0.02,  // 2% 차이까지 허용
      fullPage: true,
    })
  })
}
```

### 2-2. 반응형 레이아웃 테스트

```typescript
// src/tests/uxui/responsive.spec.ts
import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { name: 'mobile-s', width: 320, height: 568 },
  { name: 'mobile-m', width: 375, height: 667 },
  { name: 'mobile-l', width: 425, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 },
]

const CRITICAL_PAGES = ['/', '/command-center', '/trading', '/chat']

for (const vp of VIEWPORTS) {
  for (const path of CRITICAL_PAGES) {
    test(`responsive: ${path} @ ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // 가로 스크롤바 없어야 함 (잘린 콘텐츠 없음)
      const hasHorizontalScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasHorizontalScroll).toBe(false)

      // 모바일에서 네비게이션이 햄버거 메뉴로 바뀌는지
      if (vp.width < 768) {
        const hamburger = page.locator('[data-testid="mobile-menu-toggle"]')
        await expect(hamburger).toBeVisible()
      }

      // 텍스트가 잘리지 않는지 (overflow hidden 체크)
      const overflowElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const overflowed: string[] = []
        elements.forEach(el => {
          const rect = el.getBoundingClientRect()
          if (rect.width > window.innerWidth && rect.width > 0) {
            overflowed.push(`${el.tagName}.${el.className}`)
          }
        })
        return overflowed
      })
      expect(overflowElements).toEqual([])

      await expect(page).toHaveScreenshot(
        `responsive-${path.replace('/', 'home')}-${vp.name}.png`,
        { maxDiffPixelRatio: 0.03 }
      )
    })
  }
}
```

### 2-3. 인터랙션 플로우 테스트

Banana2 디자인에서 의도한 **사용자 조작 흐름**이 실제로 작동하는지 검증.

```typescript
// src/tests/uxui/interaction-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('사령관실 인터랙션', () => {
  test('명령 입력 → 타이핑 → 전송 → SSE 응답 수신 → 결과 표시', async ({ page }) => {
    await page.goto('/command-center')

    // 1. 입력창 포커스
    const input = page.locator('[data-testid="command-input"]')
    await input.click()
    await expect(input).toBeFocused()

    // 2. 명령 타이핑
    await input.fill('오늘 시장 현황 알려줘')
    await expect(input).toHaveValue('오늘 시장 현황 알려줘')

    // 3. 전송 버튼 클릭 (또는 Enter)
    await page.keyboard.press('Enter')

    // 4. 로딩 인디케이터 표시
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()

    // 5. SSE 응답 대기 (최대 30초 — AI 응답 시간)
    await expect(page.locator('[data-testid="command-result"]')).toBeVisible({
      timeout: 30_000
    })

    // 6. 결과에 텍스트가 있는지
    const resultText = await page.locator('[data-testid="command-result"]').textContent()
    expect(resultText!.length).toBeGreaterThan(10)

    // 7. 입력창이 다시 비어있는지
    await expect(input).toHaveValue('')
  })

  test('@멘션 자동완성 동작', async ({ page }) => {
    await page.goto('/command-center')
    const input = page.locator('[data-testid="command-input"]')
    await input.fill('@')

    // 자동완성 드롭다운 표시
    const dropdown = page.locator('[data-testid="mention-dropdown"]')
    await expect(dropdown).toBeVisible()

    // 에이전트 목록이 있는지
    const items = dropdown.locator('[data-testid="mention-item"]')
    expect(await items.count()).toBeGreaterThan(0)

    // 첫 번째 항목 클릭
    await items.first().click()

    // 입력창에 에이전트 이름이 포함되는지
    const value = await input.inputValue()
    expect(value).toMatch(/@.+\s/)
  })

  test('프리셋 명령어 클릭 → 자동 입력 → 전송', async ({ page }) => {
    await page.goto('/command-center')

    // 프리셋 버튼들이 보이는지
    const presets = page.locator('[data-testid="preset-button"]')
    const count = await presets.count()
    if (count > 0) {
      await presets.first().click()
      const input = page.locator('[data-testid="command-input"]')
      const value = await input.inputValue()
      const hasValue = value.length > 0
      const isLoading = await page.locator('[data-testid="loading-indicator"]').isVisible()
      expect(hasValue || isLoading).toBe(true)
    }
  })
})

test.describe('트레이딩 인터랙션', () => {
  test('감시목록 → 종목 클릭 → 차트 모달 → 닫기', async ({ page }) => {
    await page.goto('/trading')

    const watchlist = page.locator('[data-testid="watchlist"]')
    await expect(watchlist).toBeVisible()

    const stockItem = watchlist.locator('[data-testid="stock-item"]').first()
    if (await stockItem.isVisible()) {
      await stockItem.click()

      const modal = page.locator('[data-testid="chart-modal"]')
      await expect(modal).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    }
  })

  test('포트폴리오 탭 전환', async ({ page }) => {
    await page.goto('/trading')
    const tabs = page.locator('[role="tab"]')
    const count = await tabs.count()
    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click()
      const activeTab = page.locator('[role="tab"][aria-selected="true"]')
      await expect(activeTab).toHaveCount(1)
    }
  })
})

test.describe('채팅 인터랙션', () => {
  test('에이전트 선택 → 메시지 전송 → 응답 수신', async ({ page }) => {
    await page.goto('/chat')

    const agentList = page.locator('[data-testid="agent-list"]')
    await expect(agentList).toBeVisible()
    const firstAgent = agentList.locator('[data-testid="agent-item"]').first()
    if (await firstAgent.isVisible()) {
      await firstAgent.click()

      const msgInput = page.locator('[data-testid="chat-input"]')
      await msgInput.fill('안녕하세요, 테스트입니다')
      await page.keyboard.press('Enter')

      const myMsg = page.locator('[data-testid="chat-message-user"]').last()
      await expect(myMsg).toContainText('테스트입니다')

      const aiMsg = page.locator('[data-testid="chat-message-agent"]').last()
      await expect(aiMsg).toBeVisible({ timeout: 30_000 })
    }
  })
})

test.describe('어드민 CRUD 인터랙션', () => {
  test('부서 생성 → 목록에 표시 → 삭제', async ({ page }) => {
    await page.goto('/admin/departments')

    await page.getByRole('button', { name: /추가|생성|새/ }).click()

    const nameInput = page.locator('[data-testid="dept-name-input"]')
      .or(page.getByPlaceholder('부서명'))
    await nameInput.fill('E2E 테스트 부서')

    await page.getByRole('button', { name: /저장|확인|생성/ }).click()

    await expect(page.getByText('E2E 테스트 부서')).toBeVisible()

    const row = page.locator('tr', { hasText: 'E2E 테스트 부서' })
      .or(page.locator('[data-testid="dept-item"]', { hasText: 'E2E 테스트 부서' }))
    await row.locator('[data-testid="delete-btn"]').click()

    await page.getByRole('button', { name: /확인|삭제/ }).click()

    await expect(page.getByText('E2E 테스트 부서')).not.toBeVisible()
  })
})
```

### 2-4. 접근성(A11y) 자동 검사

```typescript
// src/tests/uxui/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES_TO_CHECK = [
  '/', '/command-center', '/trading', '/chat', '/sns',
  '/dashboard', '/settings', '/knowledge', '/costs'
]

for (const path of PAGES_TO_CHECK) {
  test(`a11y: ${path} 접근성 위반 없음`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('[data-testid="chart-canvas"]')
      .analyze()

    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })
}
```

### 2-5. 디자인 일관성 테스트 (테마/색상/간격)

```typescript
// src/tests/uxui/theme-consistency.spec.ts
import { test, expect } from '@playwright/test'

test('모든 페이지에서 동일한 폰트 패밀리 사용', async ({ page }) => {
  const pages = ['/', '/command-center', '/trading', '/chat']

  for (const path of pages) {
    await page.goto(path)
    const bodyFont = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    )
    expect(bodyFont).toContain('sans')
  }
})

test('버튼 스타일 일관성 (primary 버튼)', async ({ page }) => {
  const pages = ['/', '/command-center', '/settings']
  const buttonStyles: Record<string, string>[] = []

  for (const path of pages) {
    await page.goto(path)
    const btn = page.locator('button.btn-primary, [data-variant="primary"]').first()
    if (await btn.isVisible()) {
      const style = await btn.evaluate(el => {
        const cs = getComputedStyle(el)
        return {
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          fontSize: cs.fontSize,
          padding: cs.padding,
        }
      })
      buttonStyles.push(style)
    }
  }

  if (buttonStyles.length > 1) {
    for (let i = 1; i < buttonStyles.length; i++) {
      expect(buttonStyles[i]).toEqual(buttonStyles[0])
    }
  }
})

test('다크모드/라이트모드 토글 시 색상 전환', async ({ page }) => {
  await page.goto('/settings')

  const lightBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
      || getComputedStyle(document.body).backgroundColor
  )

  const toggle = page.locator('[data-testid="theme-toggle"]')
  if (await toggle.isVisible()) {
    await toggle.click()
    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
        || getComputedStyle(document.body).backgroundColor
    )
    expect(darkBg).not.toEqual(lightBg)
  }
})
```

---

## 3. Claude Code 연동 파이프라인 (핵심!)

### 3-1. 전체 파이프라인 흐름

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Claude — 아키텍처/컴포넌트 설계 설명                        │
│   "이 페이지는 3단 레이아웃, 좌측 사이드바, 중앙 콘텐츠..."            │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Anthropic/Gemini — Banana2 디자인 이미지 생성                │
│   설계 설명 기반으로 시각적 디자인 목업 생성                            │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Claude — React 코드 구현                                    │
│   디자인 이미지 + 아키텍처 설명 참고하여 실제 코드 작성                  │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌══════════════════════════════════════════════════════════════════╗
║ STEP 4: Playwright 자동 검증 (이 문서의 핵심)                       ║
║                                                                  ║
║   4-A. 서버 + 앱 구동 확인                                        ║
║   4-B. 스모크 테스트 (페이지 접근 + 에러 없음)                       ║
║   4-C. 인터랙션 테스트 (클릭, 입력, 전환 동작)                       ║
║   4-D. 시각적 회귀 테스트 (스크린샷 비교)                            ║
║   4-E. 반응형 테스트 (7개 뷰포트)                                   ║
║   4-F. 접근성 검사                                                ║
║   4-G. 콘솔 에러 수집                                              ║
║   4-H. 결과 리포트 생성                                            ║
╚════════════════════════╤═════════════════════════════════════════╝
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: 결과 분석 + 자동 수정 (선택적)                                │
│   실패한 테스트 → Claude에게 스크린샷 + 에러 전달 → 코드 수정          │
│   → 다시 STEP 4 실행 (최대 3회 반복)                                 │
└──────────────────────────────────────────────────────────────────┘
```

### 3-2. Claude Code에서 실행하는 구체적 명령어

```bash
# 방법 1: 특정 페이지만 빠르게 검증
cd /home/user/corthex-v2
bunx playwright test src/tests/app/command-center.spec.ts --headed

# 방법 2: 전체 UX/UI 검증 스위트
bunx playwright test src/tests/uxui/ --reporter=html

# 방법 3: 스모크 테스트만 (빠름, 1분 이내)
bunx playwright test src/tests/smoke/ --reporter=list

# 방법 4: 특정 뷰포트만
bunx playwright test src/tests/uxui/responsive.spec.ts --project=app-mobile

# 방법 5: 스크린샷 기준 이미지 갱신 (새 디자인 적용 후)
bunx playwright test --update-snapshots
```

#### package.json 스크립트:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:smoke": "playwright test src/tests/smoke/",
    "e2e:uxui": "playwright test src/tests/uxui/",
    "e2e:app": "playwright test src/tests/app/",
    "e2e:admin": "playwright test src/tests/admin/",
    "e2e:update-snapshots": "playwright test --update-snapshots",
    "e2e:report": "playwright show-report reports/html"
  }
}
```

### 3-3. Claude Code 자동 검증 프롬프트

```
UX/UI 구현이 끝났으니 Playwright로 검증해줘.

1. 먼저 서버가 떠있는지 확인 (localhost:3000 헬스체크)
2. 앱 dev 서버가 떠있는지 확인 (localhost:5174)
3. bun run e2e:smoke 실행 — 모든 페이지 접근 가능한지
4. bun run e2e:uxui 실행 — 시각적 회귀 + 반응형 + 접근성
5. 실패한 테스트가 있으면:
   a. reports/html에서 실패 스크린샷 확인
   b. 원인 분석
   c. 코드 수정
   d. 해당 테스트만 재실행
6. 모든 테스트 통과하면 결과 보고
```

### 3-4. 스모크 테스트

```typescript
// src/tests/smoke/health.spec.ts
import { test, expect } from '@playwright/test'

test('서버 헬스체크 200 OK', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health')
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.status).toBe('ok')
  expect(body.checks.db).toBe(true)
})

test('앱 메인 페이지 로드', async ({ page }) => {
  await page.goto('/')
  const url = page.url()
  expect(url).toMatch(/\/(login)?$/)
})

test('어드민 메인 페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/login')
  await expect(page).toHaveTitle(/CORTHEX|Admin|로그인/)
})
```

```typescript
// src/tests/smoke/navigation.spec.ts
import { test, expect } from '@playwright/test'

const APP_ROUTES = [
  '/', '/command-center', '/chat', '/jobs', '/reports', '/sns',
  '/messenger', '/dashboard', '/ops-log', '/nexus', '/trading',
  '/files', '/org', '/notifications', '/activity-log', '/costs',
  '/cron', '/argos', '/agora', '/classified', '/knowledge',
  '/performance', '/settings',
]

for (const route of APP_ROUTES) {
  test(`smoke: ${route} 접근 시 에러 없음`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(route)
    await page.waitForLoadState('domcontentloaded')

    const errorBoundary = page.locator('[data-testid="error-boundary"]')
      .or(page.getByText('Something went wrong'))
      .or(page.getByText('오류가 발생'))
    await expect(errorBoundary).not.toBeVisible()

    const criticalErrors = errors.filter(e =>
      e.includes('Uncaught') ||
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('Cannot read properties of')
    )
    expect(criticalErrors).toEqual([])
  })
}
```

### 3-5. SSE/WebSocket 대기 헬퍼

```typescript
// src/helpers/wait-helpers.ts
import { Page, expect } from '@playwright/test'

export async function waitForSSEResponse(
  page: Page,
  options: {
    resultSelector: string
    timeoutMs?: number
    minTextLength?: number
  }
) {
  const { resultSelector, timeoutMs = 30_000, minTextLength = 10 } = options

  await expect(page.locator(resultSelector)).toBeVisible({ timeout: timeoutMs })

  await page.waitForFunction(
    ({ sel, minLen }) => {
      const el = document.querySelector(sel)
      return el && (el.textContent?.length || 0) >= minLen
    },
    { sel: resultSelector, minLen: minTextLength },
    { timeout: timeoutMs }
  )
}

export async function waitForAPI(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(
    res => {
      const matches = typeof urlPattern === 'string'
        ? res.url().includes(urlPattern)
        : urlPattern.test(res.url())
      return matches && res.status() < 400
    },
    { timeout: 15_000 }
  )
}
```

---

## 4. CI/CD 통합

### 4-1. GitHub Actions E2E 워크플로우

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]
    paths:
      - 'packages/app/**'
      - 'packages/admin/**'
      - 'packages/server/**'
      - 'packages/e2e/**'

jobs:
  e2e:
    runs-on: self-hosted
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: '1.3.10'

      - run: bun install
      - run: bunx playwright install chromium

      - name: Start server
        run: |
          cd packages/server && bun run dev &
          sleep 5
          curl -f http://localhost:3000/api/health

      - name: Start app
        run: |
          cd packages/app && bun run dev &
          sleep 3

      - name: Smoke tests
        run: cd packages/e2e && bunx playwright test src/tests/smoke/

      - name: UX/UI tests
        continue-on-error: true
        run: cd packages/e2e && bunx playwright test src/tests/uxui/

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-report
          path: packages/e2e/reports/
```

### 4-2. 배포 후 스모크 (deploy.yml에 추가)

```yaml
- name: Post-deploy smoke test
  run: |
    cd packages/e2e
    BASE_URL=https://corthex-hq.com bunx playwright test src/tests/smoke/
```

---

## 5. BMAD 워크플로우 통합

### 5-1. QA 단계에서 Playwright 실행

```
1. create-story  → 스토리 파일 생성
2. dev-story     → 코드 구현
3. TEA automate  → 유닛 테스트 생성
4. QA 검증       → ★ Playwright E2E 테스트 실행 ★
                    - 해당 스토리가 건드린 페이지 테스트
                    - 스모크 테스트 (전체 회귀 없는지)
                    - 스크린샷 비교
5. code-review   → 코드 리뷰
```

### 5-2. 커밋 전 체크리스트에 추가

```
[BMAD 체크리스트 -- Story X-Y]
[ ] 1. create-story 완료
[ ] 2. dev-story 완료
[ ] 3. TEA 완료
[ ] 4. QA 완료
[ ] 5. code-review 완료
[ ] 6. 실제 동작 확인 (stub/mock 아님)
[ ] 7. ★ Playwright 스모크 테스트 통과 ★   ← 새로 추가
```

---

## 6. data-testid 컨벤션

```
네이밍 규칙: {컴포넌트}-{역할}

data-testid="command-input"         ← 사령관실 입력창
data-testid="command-result"        ← 사령관실 결과 표시
data-testid="loading-indicator"     ← 로딩 스피너
data-testid="mention-dropdown"      ← @멘션 드롭다운
data-testid="watchlist"             ← 감시목록 컨테이너
data-testid="stock-item"            ← 개별 종목 항목
data-testid="chart-modal"           ← 차트 모달
data-testid="agent-list"            ← 에이전트 목록
data-testid="chat-input"            ← 채팅 입력창
data-testid="chat-message-user"     ← 사용자 메시지 말풍선
data-testid="chat-message-agent"    ← AI 메시지 말풍선
data-testid="error-boundary"        ← 에러 바운더리
data-testid="mobile-menu-toggle"    ← 모바일 햄버거 메뉴
data-testid="theme-toggle"          ← 테마 전환 버튼
data-testid="sidebar"               ← 사이드바 내비게이션
data-testid="preset-button"         ← 프리셋 명령 버튼
```

---

## 7. 트러블슈팅 가이드

| 문제 | 원인 | 해결 |
|------|------|------|
| `page.goto() timeout` | 서버 미구동 | `curl localhost:3000/api/health` 확인 |
| `storageState file not found` | auth setup 미실행 | `bunx playwright test --project=auth-setup` 먼저 |
| 스크린샷 diff 과도 | 폰트 로딩 타이밍 | `waitForLoadState('networkidle')` 추가 |
| WSS 연결 실패 | 프록시 설정 | vite.config의 ws 프록시 확인 |
| `Chromium not found` | 브라우저 미설치 | `bunx playwright install chromium` |
| SSE 테스트 타임아웃 | AI 응답 지연 | timeout 60초로 증가 |
| 어드민/앱 포트 충돌 | 동시 구동 | 5173(admin), 5174(app), 3000(server) 확인 |

---

## 8. 최종 요약

| 항목 | 내용 |
|------|------|
| **목적** | Banana2 디자인 → Claude 구현 후 자동 검증 |
| **도구** | Playwright + @axe-core/playwright |
| **테스트 종류** | 스모크, 시각회귀, 반응형, 접근성, 인터랙션, CRUD |
| **페이지 커버리지** | 앱 24개 라우트 + 어드민 12개 라우트 |
| **뷰포트** | 7개 (320px ~ 1920px) |
| **실행 시점** | 구현 직후 + 배포 후 + BMAD QA 단계 |
| **CI/CD** | PR 시 자동 실행 + 배포 후 스모크 |
| **기준 이미지** | `snapshots/baseline/`에 커밋 |
| **결과 리포트** | HTML (`reports/html/`) + JSON (`reports/results.json`) |
