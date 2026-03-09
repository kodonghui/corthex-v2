# CORTHEX v2 — UXUI 리팩토링 + Playwright QA 통합 워크플로우

> 작성일: 2026-03-09
> 목적: UI를 싹 갈아엎으면서 기능은 절대 깨지지 않도록 하는 전체 작업 순서

---

## 전체 흐름 한눈에 보기

```
[Phase 0] Playwright 환경 세팅
    ↓
[Phase 1] 현재 기능 상태 점검 (스모크 테스트)
    → "지금 뭐가 되고 뭐가 안 되는지" 파악
    ↓
[Phase 2] UXUI 리팩토링 (페이지별 반복)
    → 설명서 작성 → Banana2 이미지 생성 → Claude 코딩 → 인터랙션 테스트
    ↓
[Phase 3] 시각 회귀 테스트 기준 이미지 등록
    → 새 UI 완성본 스크린샷 찍어서 baseline으로 저장
    ↓
[Phase 4] 최종 전체 검증 + 배포
```

---

## Phase 0: Playwright 환경 세팅

> 소요 시간: 1~2시간 (한 번만)
> 담당: Claude Code (서버)

### 0-1. 패키지 설치

```bash
# 프로젝트 루트에서
cd /home/ubuntu/corthex-v2
bun add -d @playwright/test @axe-core/playwright
bunx playwright install chromium
```

### 0-2. 패키지 디렉토리 생성

```
packages/e2e/
├── package.json
├── playwright.config.ts
└── src/
    ├── fixtures/
    │   ├── auth.setup.ts          ← 로그인 자동화
    │   └── .auth/                 ← 로그인 상태 저장 (gitignore)
    ├── helpers/
    │   └── wait-helpers.ts        ← SSE/API 대기 유틸
    └── tests/
        ├── smoke/                 ← Phase 1에서 사용
        │   ├── health.spec.ts
        │   └── navigation.spec.ts
        ├── interaction/           ← Phase 2에서 페이지마다 추가
        │   ├── app/
        │   └── admin/
        └── visual/                ← Phase 3에서 활성화
            └── regression.spec.ts
```

### 0-3. package.json (e2e 패키지)

```json
{
  "name": "@corthex/e2e",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "smoke": "playwright test src/tests/smoke/",
    "interaction": "playwright test src/tests/interaction/",
    "visual": "playwright test src/tests/visual/",
    "update-snapshots": "playwright test src/tests/visual/ --update-snapshots",
    "report": "playwright show-report reports/html"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@axe-core/playwright": "latest"
  }
}
```

### 0-4. playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,   // 순서 있는 테스트를 위해 false
  retries: 1,

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
  },

  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'app',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'http://localhost:5173',
        storageState: 'src/fixtures/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
})
```

### 0-5. 로그인 자동화 (auth.setup.ts)

```typescript
import { test as setup } from '@playwright/test'
import * as fs from 'fs'

setup.beforeAll(() => {
  fs.mkdirSync('src/fixtures/.auth', { recursive: true })
})

setup('app 유저 로그인', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('이메일').fill(process.env.TEST_USER_EMAIL!)
  await page.getByPlaceholder('비밀번호').fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/')
  await page.context().storageState({ path: 'src/fixtures/.auth/user.json' })
})

setup('admin 로그인', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  await page.getByPlaceholder('이메일').fill(process.env.TEST_ADMIN_EMAIL!)
  await page.getByPlaceholder('비밀번호').fill(process.env.TEST_ADMIN_PASSWORD!)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/admin/')
  await page.context().storageState({ path: 'src/fixtures/.auth/admin.json' })
})
```

### 0-6. .env.test 파일 생성 (gitignore에 추가)

```
TEST_USER_EMAIL=test@company.com
TEST_USER_PASSWORD=비밀번호
TEST_ADMIN_EMAIL=admin@corthex.com
TEST_ADMIN_PASSWORD=어드민비밀번호
BASE_URL=http://localhost:5174
ADMIN_URL=http://localhost:5173
```

### 0-7. turbo.json에 e2e 태스크 추가

```json
// turbo.json에 추가
"e2e": {
  "dependsOn": ["^build"],
  "outputs": ["packages/e2e/reports/**"]
}
```

---

## Phase 1: 현재 기능 상태 점검

> 목적: "지금 어떤 페이지가 살아있고, 어떤 게 에러인지" 파악
> 소요 시간: 30분~1시간
> 결과물: 각 페이지의 현재 상태 리포트

### 1-1. 스모크 테스트 — 서버 상태 확인

```typescript
// src/tests/smoke/health.spec.ts
import { test, expect } from '@playwright/test'

test('서버 헬스체크', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.success).toBe(true)
})

test('DB 연결 확인', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health')
  const body = await res.json()
  expect(body.data?.db).toBe(true)
})
```

### 1-2. 스모크 테스트 — 앱 전체 페이지 접근

현재 앱의 모든 라우트 목록 (24개):

```typescript
// src/tests/smoke/navigation.spec.ts
import { test, expect } from '@playwright/test'

const APP_ROUTES = [
  { path: '/',              name: '홈/대시보드' },
  { path: '/command-center', name: '사령관실' },
  { path: '/chat',          name: '에이전트 채팅' },
  { path: '/jobs',          name: '작업 현황' },
  { path: '/reports',       name: '보고서' },
  { path: '/sns',           name: 'SNS 관리' },
  { path: '/messenger',     name: '메신저' },
  { path: '/dashboard',     name: '성과 대시보드' },
  { path: '/ops-log',       name: '작전일지' },
  { path: '/nexus',         name: 'NEXUS 워크플로우' },
  { path: '/trading',       name: '트레이딩' },
  { path: '/files',         name: '파일 관리' },
  { path: '/org',           name: '조직도' },
  { path: '/notifications', name: '알림' },
  { path: '/activity-log',  name: '활동 로그' },
  { path: '/costs',         name: '비용 현황' },
  { path: '/cron',          name: '스케줄러' },
  { path: '/argos',         name: 'ARGOS 모니터링' },
  { path: '/agora',         name: 'AGORA 토론' },
  { path: '/classified',    name: '기밀 작전' },
  { path: '/knowledge',     name: '지식 베이스' },
  { path: '/performance',   name: '성과 지표' },
  { path: '/settings',      name: '설정' },
]

for (const route of APP_ROUTES) {
  test(`[앱] ${route.name} (${route.path}) — 에러 없이 로드`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await page.goto(route.path)
    expect(response?.status()).not.toBe(404)
    await page.waitForLoadState('domcontentloaded')

    // React 에러 바운더리 미표시
    const crashTexts = ['Something went wrong', '오류가 발생', 'Cannot read properties of']
    for (const text of crashTexts) {
      await expect(page.getByText(text)).not.toBeVisible()
    }

    // 치명적 JS 에러 없음
    const critical = errors.filter(e =>
      e.includes('Uncaught') || e.includes('TypeError') || e.includes('ReferenceError')
    )
    if (critical.length > 0) {
      console.error(`[${route.path}] 에러:`, critical)
    }
    expect(critical, `${route.path} 에서 JS 에러 발생`).toEqual([])
  })
}
```

```typescript
// src/tests/smoke/navigation-admin.spec.ts
// (admin 프로젝트에서 실행)

const ADMIN_ROUTES = [
  { path: '/',                name: '어드민 대시보드' },
  { path: '/users',           name: '사용자 관리' },
  { path: '/employees',       name: '인간 직원 관리' },
  { path: '/departments',     name: '부서 관리' },
  { path: '/agents',          name: 'AI 직원 관리' },
  { path: '/credentials',     name: 'CLI 자격증명' },
  { path: '/companies',       name: '회사 관리' },
  { path: '/tools',           name: '도구 관리' },
  { path: '/costs',           name: '비용 관리' },
  { path: '/report-lines',    name: '보고 라인' },
  { path: '/soul-templates',  name: '소울 템플릿' },
  { path: '/monitoring',      name: '시스템 모니터링' },
  { path: '/org-chart',       name: '조직도' },
  { path: '/org-templates',   name: '조직 템플릿' },
  { path: '/workflows',       name: '워크플로우 관리' },
  { path: '/template-market', name: '템플릿 마켓' },
  { path: '/agent-marketplace', name: '에이전트 마켓플레이스' },
  { path: '/api-keys',        name: 'API 키 관리' },
  { path: '/settings',        name: '설정' },
]
```

### 1-3. 스모크 테스트 실행 방법

```bash
# 서버 + 앱 먼저 실행 (별도 터미널)
cd /home/ubuntu/corthex-v2
bun run dev

# 테스트 실행
cd packages/e2e
bun run smoke

# HTML 리포트 확인
bun run report
```

### 1-4. 결과 기록

스모크 테스트 결과를 아래 표에 기록. 이게 작업 전 "현재 상태 기준선"이 됨.

```markdown
# 스모크 테스트 결과 — 작업 전 기준선
날짜: YYYY-MM-DD

## 앱 페이지 (24개)
| 페이지 | 상태 | 비고 |
|--------|------|------|
| / | ✅/❌ | |
| /command-center | ✅/❌ | |
... (각 페이지)

## 어드민 페이지 (19개)
| 페이지 | 상태 | 비고 |
|--------|------|------|
| / | ✅/❌ | |
...
```

---

## Phase 2: UXUI 리팩토링 (페이지별 반복 작업)

> 전체 페이지: 앱 24개 + 어드민 19개 = 43개
> 각 페이지마다 아래 5단계를 반복

### 페이지 작업 우선순위

중요도와 사용 빈도 기준으로 순서 정함:

**1순위 (핵심 기능 — 먼저)**
```
앱:
  1. /command-center     ← 사령관실, 가장 많이 쓰는 화면
  2. /chat               ← 에이전트 채팅
  3. /dashboard          ← 성과 대시보드
  4. /trading            ← 트레이딩 (실투자)
  5. /agora              ← AGORA 토론
  6. /nexus              ← NEXUS 워크플로우

어드민:
  7. /agents             ← AI 직원 관리
  8. /departments        ← 부서 관리
  9. /credentials        ← CLI 자격증명 (핵심)
```

**2순위 (중요 기능)**
```
앱:
  10. /sns               ← SNS 관리
  11. /messenger         ← 메신저
  12. /ops-log           ← 작전일지
  13. /reports           ← 보고서
  14. /jobs              ← 작업 현황
  15. /knowledge         ← 지식 베이스
  16. /files             ← 파일 관리
  17. /costs             ← 비용 현황
  18. /activity-log      ← 활동 로그

어드민:
  19. /workflows         ← 워크플로우 관리
  20. /tools             ← 도구 관리
  21. /users             ← 사용자 관리
  22. /employees         ← 인간 직원 관리
  23. /monitoring        ← 시스템 모니터링
```

**3순위 (부가 기능)**
```
앱:
  24. /           ← 홈
  25. /argos      ← ARGOS 모니터링
  26. /classified ← 기밀 작전
  27. /org        ← 조직도
  28. /cron       ← 스케줄러
  29. /performance← 성과 지표
  30. /notifications ← 알림
  31. /settings   ← 설정

어드민:
  32. /org-chart
  33. /org-templates
  34. /template-market
  35. /agent-marketplace
  36. /soul-templates
  37. /report-lines
  38. /api-keys
  39. /costs
  40. /companies
  41. /settings
  42. /onboarding
```

---

### 페이지 1개당 작업 순서 (5단계)

#### Step A. 설명서 작성 (Claude가 자동)

Claude Code가 해당 페이지의 현재 코드를 읽고 UX/UI 설명서를 작성.

```
작성 위치: _uxui-refactoring/specs/{번호}-{페이지명}.md
```

설명서 내용 (Claude가 채워야 할 항목):

```markdown
# {페이지명} UX/UI 설명서

## 1. 페이지 목적
- 누가 쓰는 화면인가?
- 이 화면에서 핵심으로 해야 할 것 1가지는?

## 2. 현재 레이아웃 분석
- 전체 구조 (예: 상단 헤더 / 좌측 사이드바 / 메인 콘텐츠)
- 각 영역의 역할과 내용

## 3. 현재 문제점 (솔직하게)
- 지금 UI에서 불편하거나 어색한 점
- 정보 구조가 잘못된 부분
- 반응형이 깨지는 부분

## 4. 개선 방향
- 레이아웃 변경 제안
- 새로 추가할 UI 요소
- 제거할 불필요한 요소
- 강조해야 할 핵심 정보

## 5. 컴포넌트 목록 (개선 후)
- 각 영역에 들어갈 컴포넌트
- 상태 관리 방식 (로딩/에러/빈 상태)
- 인터랙션 동작 (클릭, 호버, 드래그 등)

## 6. 데이터 바인딩
- API 엔드포인트
- 표시할 데이터 필드
- 실시간 업데이트 여부 (WebSocket/SSE)

## 7. 색상/톤 앤 매너
- 다크테마 기준 주요 색상
- 강조색 (primary, warning, danger 등)
- 폰트 사이즈 위계
- 특별히 강조할 시각적 요소

## 8. 반응형 대응
- 데스크톱 레이아웃
- 태블릿 레이아웃 (768px)
- 모바일 레이아웃 (375px)
- 접힘/펼침 처리

## 9. v1 참고사항
- v1에서 이 화면이 어땠는지
- v1에서 반드시 살려야 할 기능

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
[여기에 영문 프롬프트 — Antigravity에 바로 복붙 가능]
```

### 모바일 버전
```
[여기에 영문 프롬프트]
```

## 11. data-testid 목록 (개선 후 추가할 것들)
| 요소 | data-testid 값 | 용도 |
|------|---------------|------|
| 메인 입력창 | {페이지명}-input | 인터랙션 테스트 |
| ...   | ...           | ...  |
```

#### Step B. Banana2 이미지 생성 (사용자가 직접)

1. `git pull` → 설명서 확인
2. 각 설명서의 **"10. Banana2 이미지 생성 프롬프트"** 섹션 복사
3. Antigravity 웹에서 바나나2로 이미지 생성
4. `_uxui-refactoring/designs/{번호}-{페이지명}-desktop.png` 로 저장
5. 모바일 버전도 생성 → `{번호}-{페이지명}-mobile.png`
6. `git add . && git commit -m "design: {페이지명} mockup" && git push`

**파일 저장 규칙:**
```
_uxui-refactoring/designs/
├── 01-command-center-desktop.png
├── 01-command-center-mobile.png
├── 02-chat-desktop.png
├── 02-chat-mobile.png
...
```

#### Step C. Claude 코딩 (Claude가 자동)

Claude Code가 이미지를 보고 코드를 작성.

지시 방식:
```
_uxui-refactoring/designs/01-command-center-desktop.png 와
_uxui-refactoring/specs/01-command-center.md 를 보고
packages/app/src/pages/command-center/ 를 리팩토링해줘.

규칙:
1. 기능은 절대 건드리지 말 것 (API 호출, 상태 관리 로직 유지)
2. 오직 UI/레이아웃/스타일만 변경
3. 모든 인터랙션 요소에 data-testid 추가 (설명서 11번 목록 참고)
4. 기존 data-testid는 절대 삭제하지 말 것
5. 반응형 (모바일 이미지 참고)
```

#### Step D. 인터랙션 테스트 작성 + 실행 (Claude가 자동)

각 페이지마다 인터랙션 테스트 파일 작성.
CRUD 기능, 버튼 클릭, 폼 제출, 응답 확인 등.

```
작성 위치: packages/e2e/src/tests/interaction/app/{페이지명}.spec.ts
          packages/e2e/src/tests/interaction/admin/{페이지명}.spec.ts
```

**중요**: 인터랙션 테스트는 UI 모양이 아닌 **동작**을 테스트하기 때문에
UXUI 변경 전후에 모두 통과해야 함.

테스트 실행:
```bash
cd packages/e2e
bun run interaction -- --grep "command-center"
```

#### Step E. 확인 체크리스트

각 페이지 작업 완료 전 아래를 모두 체크:

```
[UXUI 체크리스트 — {페이지명}]
[ ] A. 설명서 작성 완료 (_uxui-refactoring/specs/)
[ ] B. Banana2 이미지 생성 완료 (_uxui-refactoring/designs/)
[ ] C. 코드 리팩토링 완료 (UI만 변경, 기능 유지)
[ ] D. data-testid 전부 추가됨 (설명서 11번 목록 기준)
[ ] E. 인터랙션 테스트 통과
[ ] F. 스모크 테스트 통과 (해당 페이지)
[ ] G. 콘솔 에러 없음
[ ] H. 모바일 레이아웃 확인 (Chrome DevTools)
```

모두 통과 → 커밋:
```bash
git add .
git commit -m "feat(uxui): {페이지명} UI 리팩토링 완료"
git push
```

---

## Phase 3: 시각 회귀 테스트 기준 이미지 등록

> 전제 조건: 모든 페이지 UXUI 리팩토링 완료
> 목적: "새 UI가 이 모습이다"를 스크린샷으로 고정
> 이후부터: 코드 수정 시 UI가 깨지면 자동으로 감지

### 3-1. 시각 회귀 테스트 파일

```typescript
// src/tests/visual/regression.spec.ts
import { test, expect } from '@playwright/test'

const APP_PAGES = [
  { name: 'home',           path: '/',               waitFor: 'main' },
  { name: 'command-center', path: '/command-center',  waitFor: '[data-testid="command-input"]' },
  { name: 'chat',           path: '/chat',            waitFor: '[data-testid="agent-list"]' },
  { name: 'jobs',           path: '/jobs',            waitFor: 'main' },
  { name: 'reports',        path: '/reports',         waitFor: 'main' },
  { name: 'sns',            path: '/sns',             waitFor: 'main' },
  { name: 'messenger',      path: '/messenger',       waitFor: 'main' },
  { name: 'dashboard',      path: '/dashboard',       waitFor: 'main' },
  { name: 'ops-log',        path: '/ops-log',         waitFor: 'main' },
  { name: 'nexus',          path: '/nexus',           waitFor: 'main' },
  { name: 'trading',        path: '/trading',         waitFor: '[data-testid="watchlist"]' },
  { name: 'files',          path: '/files',           waitFor: 'main' },
  { name: 'org',            path: '/org',             waitFor: 'main' },
  { name: 'notifications',  path: '/notifications',   waitFor: 'main' },
  { name: 'activity-log',   path: '/activity-log',    waitFor: 'main' },
  { name: 'costs',          path: '/costs',           waitFor: 'main' },
  { name: 'cron',           path: '/cron',            waitFor: 'main' },
  { name: 'argos',          path: '/argos',           waitFor: 'main' },
  { name: 'agora',          path: '/agora',           waitFor: 'main' },
  { name: 'classified',     path: '/classified',      waitFor: 'main' },
  { name: 'knowledge',      path: '/knowledge',       waitFor: 'main' },
  { name: 'performance',    path: '/performance',     waitFor: 'main' },
  { name: 'settings',       path: '/settings',        waitFor: 'main' },
]

for (const pg of APP_PAGES) {
  test(`[앱] ${pg.name} 시각 회귀`, async ({ page }) => {
    await page.goto(pg.path)
    await page.waitForSelector(pg.waitFor, { timeout: 15_000 })
    await page.waitForLoadState('networkidle')
    // 로딩 스피너 사라질 때까지 대기
    await page.waitForFunction(() =>
      !document.querySelector('[data-loading="true"]')
    )
    await expect(page).toHaveScreenshot(`app-${pg.name}.png`, {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
      animations: 'disabled',
    })
  })
}
```

### 3-2. 기준 이미지 최초 등록 (한 번만)

```bash
cd packages/e2e
# 기준 이미지 최초 생성 (새 UI 완성 후 딱 한 번만 실행)
bun run update-snapshots

# 생성된 스크린샷 확인
ls src/tests/visual/__snapshots__/
```

생성된 `.png` 파일들을 git에 커밋:
```bash
git add packages/e2e/src/tests/visual/__snapshots__/
git commit -m "test(visual): baseline screenshots for new UXUI"
git push
```

### 3-3. 이후 사용법

코드를 수정할 때마다:
```bash
bun run visual
# PASS: UI가 기준 이미지와 같음
# FAIL: 스크린샷이 달라짐 → 의도한 변경이면 update-snapshots, 아니면 버그
```

---

## Phase 4: 최종 전체 검증 + 배포

### 4-1. 최종 전체 테스트 실행

```bash
cd packages/e2e

# 1. 스모크 테스트 (전 페이지 접근 가능한지)
bun run smoke

# 2. 인터랙션 테스트 (핵심 기능 동작하는지)
bun run interaction

# 3. 시각 회귀 테스트 (UI 깨진 곳 없는지)
bun run visual

# 4. 결과 리포트 열기
bun run report
```

### 4-2. 배포 전 최종 체크리스트

```
[최종 배포 체크리스트]
[ ] 스모크 테스트 전체 통과 (앱 23개 + 어드민 19개)
[ ] 인터랙션 테스트 전체 통과
[ ] 시각 회귀 테스트 통과
[ ] 콘솔 에러 0개
[ ] 모바일 반응형 확인 (Chrome DevTools, 375px)
[ ] 다크모드 정상 작동
[ ] 로그인 → 로그아웃 흐름 정상
```

### 4-3. 배포

```bash
git push
# → GitHub Actions 자동 트리거
# → self-hosted runner에서 빌드
# → Cloudflare 캐시 퍼지
# → 배포 완료
```

---

## 인터랙션 테스트 상세 — 페이지별 테스트 내용

> 아래는 각 페이지에서 테스트해야 할 핵심 동작 목록.
> Phase 2 Step D에서 Claude Code가 이 목록을 보고 테스트 코드를 작성함.

### 앱 — 사령관실 (`/command-center`)
```
- 입력창에 텍스트 타이핑 → Enter 전송 → SSE 응답 수신 → 결과 표시
- @멘션 입력 → 에이전트 드롭다운 표시 → 선택
- /슬래시 입력 → 명령 드롭다운 표시
- 프리셋 버튼 클릭 → 입력창에 자동 입력
- 이전 대화 히스토리 표시
```

### 앱 — 에이전트 채팅 (`/chat`)
```
- 에이전트 목록 표시 → 선택
- 메시지 입력 → 전송 → AI 응답 수신
- 파일 첨부
- 대화 히스토리 스크롤
```

### 앱 — 트레이딩 (`/trading`)
```
- 감시목록 표시
- 종목 클릭 → 차트 모달 오픈 → Esc로 닫기
- 포트폴리오 탭 전환
- 실시간 가격 업데이트 (WebSocket)
```

### 앱 — AGORA (`/agora`)
```
- 토론 목록 표시
- 새 토론 생성 버튼 클릭 → 폼 오픈
- 토론 시작 → 에이전트 응답 수신
```

### 앱 — NEXUS (`/nexus`)
```
- 워크플로우 캔버스 표시
- 노드 추가
- 노드 연결
- 저장 → 성공 토스트
```

### 앱 — SNS (`/sns`)
```
- 게시물 목록 표시
- 새 게시물 작성 → 저장
- 예약 게시 설정
```

### 앱 — 메신저 (`/messenger`)
```
- 채널 목록 표시
- 채널 선택 → 메시지 표시
- 메시지 입력 → 전송
- @에이전트 멘션
```

### 앱 — 지식 베이스 (`/knowledge`)
```
- 폴더 트리 표시
- 파일 업로드 → 목록에 표시
- 파일 클릭 → 내용 미리보기
- 파일 삭제 → 목록에서 제거
```

### 앱 — 스케줄러 (`/cron`)
```
- 크론 작업 목록 표시
- 새 작업 추가 → 저장
- 작업 활성화/비활성화 토글
- 작업 삭제
```

### 어드민 — 부서 관리 (`/departments`)
```
- 부서 목록 표시
- 부서 추가 → 목록에 반영
- 부서 수정 → 변경 반영
- 부서 삭제 → 목록에서 제거
- 부서에 에이전트 배치
```

### 어드민 — AI 직원 관리 (`/agents`)
```
- 에이전트 목록 표시
- 에이전트 생성 → 목록에 반영
- 에이전트 수정 (Soul 편집)
- 에이전트 활성화/비활성화
- 에이전트 삭제
```

### 어드민 — CLI 자격증명 (`/credentials`)
```
- 자격증명 목록 표시 (키는 마스킹)
- 새 자격증명 등록
- 자격증명 삭제
```

### 어드민 — 워크플로우 (`/workflows`)
```
- 워크플로우 목록 표시
- 새 워크플로우 생성
- 워크플로우 실행
- 실행 상태 확인
```

---

## 전체 작업 진행 상황 추적표

Phase 2 작업 시 아래 표를 업데이트:

```markdown
## Phase 2 진행 상황

| # | 페이지 | 설명서 | 이미지 | 코딩 | 테스트 | 완료 |
|---|--------|--------|--------|------|--------|------|
| 1 | command-center | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | chat | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | dashboard | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | trading | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | agora | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | nexus | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | agents(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | departments(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | credentials(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | sns | ☐ | ☐ | ☐ | ☐ | ☐ |
| 11 | messenger | ☐ | ☐ | ☐ | ☐ | ☐ |
| 12 | ops-log | ☐ | ☐ | ☐ | ☐ | ☐ |
| 13 | reports | ☐ | ☐ | ☐ | ☐ | ☐ |
| 14 | jobs | ☐ | ☐ | ☐ | ☐ | ☐ |
| 15 | knowledge | ☐ | ☐ | ☐ | ☐ | ☐ |
| 16 | files | ☐ | ☐ | ☐ | ☐ | ☐ |
| 17 | costs | ☐ | ☐ | ☐ | ☐ | ☐ |
| 18 | activity-log | ☐ | ☐ | ☐ | ☐ | ☐ |
| 19 | workflows(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 20 | tools(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 21 | users(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 22 | employees(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 23 | monitoring(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 24 | home | ☐ | ☐ | ☐ | ☐ | ☐ |
| 25 | argos | ☐ | ☐ | ☐ | ☐ | ☐ |
| 26 | classified | ☐ | ☐ | ☐ | ☐ | ☐ |
| 27 | org | ☐ | ☐ | ☐ | ☐ | ☐ |
| 28 | cron | ☐ | ☐ | ☐ | ☐ | ☐ |
| 29 | performance | ☐ | ☐ | ☐ | ☐ | ☐ |
| 30 | notifications | ☐ | ☐ | ☐ | ☐ | ☐ |
| 31 | settings | ☐ | ☐ | ☐ | ☐ | ☐ |
| 32 | org-chart(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 33 | org-templates(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 34 | template-market(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 35 | agent-marketplace(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 36 | soul-templates(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 37 | report-lines(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 38 | api-keys(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 39 | costs(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 40 | companies(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 41 | settings(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 42 | onboarding(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 43 | dashboard(admin) | ☐ | ☐ | ☐ | ☐ | ☐ |
```

---

## 사용자가 직접 해야 하는 것 (요약)

Claude Code가 자동으로 하는 것과 사용자가 직접 해야 하는 것을 명확히 구분:

### Claude Code가 자동으로 함
- Phase 0: Playwright 환경 세팅
- Phase 1: 스모크 테스트 실행 + 결과 기록
- Phase 2 Step A: 각 페이지 설명서 작성
- Phase 2 Step C: 이미지 보고 코딩
- Phase 2 Step D: 인터랙션 테스트 작성 + 실행
- Phase 3: 시각 회귀 테스트 + 기준 이미지 등록

### 사용자가 직접 해야 함 (Phase 2 Step B만)
```
1. git pull (설명서 가져오기)
2. 설명서의 "Banana2 이미지 생성 프롬프트" 복사
3. Antigravity 웹 접속
4. 바나나2로 이미지 생성
5. _uxui-refactoring/designs/ 폴더에 저장
6. git add . && git commit -m "design: {페이지명}" && git push
7. Claude Code에게 "이미지 올렸어, 코딩해줘" 알려주기
```

---

## 작업 시작 방법

준비가 됐으면 아래 순서로 시작:

```
1. "Phase 0 시작해줘" → Claude Code가 Playwright 세팅
2. "Phase 1 시작해줘" → 스모크 테스트 실행 + 현재 상태 파악
3. "command-center 설명서 써줘" → 1번 페이지 설명서 생성
4. (사용자) Banana2로 이미지 생성 + 업로드
5. "이미지 올렸어, command-center 코딩해줘"
6. 3~5 반복 (43개 페이지)
7. "Phase 3 시작해줘" → 기준 이미지 등록
8. "최종 검증해줘" → 전체 테스트
```
