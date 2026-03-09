# CORTHEX v2 — UXUI 리팩토링 + Playwright QA 통합 워크플로우

> 작성일: 2026-03-09
> 목적: UI를 싹 갈아엎으면서 기능은 절대 깨지지 않도록 하는 전체 작업 순서

---

## 작업 환경 (중요!)

**모든 작업은 Windows PC의 VS Code 한 곳에서 진행.**

```
┌─────────────────────────────────────────────────────┐
│  Windows PC (VS Code)                               │
│                                                     │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Claude Code     │  │ Playwright Test 확장     │  │
│  │ (이 창)         │  │ (VS Code 확장, Microsoft)│  │
│  │                 │  │                         │  │
│  │ • 설명서 작성   │  │ • 테스트 실행 (▶ 클릭)  │  │
│  │ • 이미지 보고   │  │ • 브라우저 실시간 확인   │  │
│  │   코딩          │  │ • 실패 스크린샷 확인     │  │
│  │ • 테스트 코드   │  │ • Trace Viewer          │  │
│  │   작성          │  │                         │  │
│  └─────────────────┘  └─────────────────────────┘  │
│                                                     │
│  사용자: Antigravity에서 Banana2 이미지 생성         │
│          (같은 PC 브라우저에서)                       │
│                                                     │
└──────────────────────┬──────────────────────────────┘
                       │ 배포된 사이트에 접속
                       ▼
              https://corthex-hq.com  (VPS에서 서비스 중)
              https://corthex-hq.com/admin
```

**VPS는 서버만 돌린다.** Playwright 테스트, 코딩, 설명서 작성 전부 이 PC에서 한다.
git pull/push 왕복 없이, **이 VS Code 창 안에서 전부 끝남.**

### 필요한 것

| 항목 | 상태 |
|------|------|
| VS Code | ✅ 이미 있음 |
| Claude Code (VS Code 확장) | ✅ 지금 이거 |
| **Playwright Test for VSCode** (Microsoft) | 사용자가 설치 중 |
| Antigravity 브라우저 접속 | ✅ 같은 PC에서 |

---

## 전체 흐름 한눈에 보기

```
[Phase 0] Playwright 환경 세팅 (이 PC에서, 한 번만)
    ↓
[Phase 1] 현재 기능 상태 점검 (배포 사이트에 접속해서 스모크 테스트)
    → "지금 뭐가 되고 뭐가 안 되는지" 파악
    ↓
[Phase 2] UXUI 리팩토링 (페이지별 반복)
    → Claude 설명서 작성
    → 사용자 Banana2 이미지 생성 (같은 PC 브라우저)
    → Claude 이미지 보고 코딩
    → Claude Playwright 인터랙션 테스트 작성
    → VS Code 확장에서 ▶ 클릭으로 테스트 실행
    → 통과하면 커밋 + 푸시 (자동 배포)
    ↓
[Phase 3] 시각 회귀 테스트 기준 이미지 등록
    → 새 UI 완성본 스크린샷 찍어서 baseline으로 저장
    ↓
[Phase 4] 최종 전체 검증 + 배포
```

---

## Phase 0: Playwright 환경 세팅

> 소요 시간: 10~20분 (한 번만)
> 담당: Claude Code (이 창)

### 0-1. 패키지 설치 (이 PC에서)

```bash
# 프로젝트 루트 (이 PC)
cd c:\Users\elddl\Desktop\PJ0_CORTHEX\corthex-v2

# Playwright 설치
npm init playwright@latest -- --yes --install-deps --browser=chromium

# 또는 수동으로
bun add -d @playwright/test @axe-core/playwright
npx playwright install chromium
```

### 0-2. 디렉토리 구조

```
packages/
  e2e/                              ← 새로 만들 패키지
    package.json
    playwright.config.ts
    .env.test                       ← 테스트 접속 정보 (gitignore)
    src/
      fixtures/
        auth.setup.ts               ← 로그인 자동화
        .auth/                      ← 로그인 상태 저장 (gitignore)
      helpers/
        wait-helpers.ts             ← SSE/API 대기 유틸
      tests/
        smoke/                      ← Phase 1: 페이지 접근 테스트
          health.spec.ts
          app-navigation.spec.ts
          admin-navigation.spec.ts
        interaction/                ← Phase 2: 기능 동작 테스트
          app/
            command-center.spec.ts
            chat.spec.ts
            trading.spec.ts
            ...
          admin/
            departments.spec.ts
            agents.spec.ts
            ...
        visual/                     ← Phase 3: 스크린샷 비교
          app-regression.spec.ts
          admin-regression.spec.ts
```

### 0-3. playwright.config.ts (핵심 — 배포 사이트에 접속)

```typescript
import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,

  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],

  use: {
    // ★ 핵심: 배포된 사이트 URL (VPS의 localhost가 아님!)
    baseURL: process.env.BASE_URL || 'https://corthex-hq.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 로그인 상태 준비 (한 번만)
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 메인 앱 테스트 (https://corthex-hq.com)
    {
      name: 'app',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    // 어드민 테스트 (https://corthex-hq.com/admin)
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'https://corthex-hq.com/admin',
        storageState: 'src/fixtures/.auth/admin.json',
      },
      dependencies: ['auth-setup'],
    },

    // 모바일 반응형 테스트
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],
})
```

### 0-4. .env.test (gitignore에 추가 — 비밀번호 포함)

```env
# 배포된 사이트 URL
BASE_URL=https://corthex-hq.com
ADMIN_URL=https://corthex-hq.com/admin

# 테스트용 계정
TEST_USER_EMAIL=사용자이메일
TEST_USER_PASSWORD=사용자비밀번호
TEST_ADMIN_EMAIL=어드민이메일
TEST_ADMIN_PASSWORD=어드민비밀번호
```

### 0-5. 로그인 자동화 (auth.setup.ts)

```typescript
// src/fixtures/auth.setup.ts
import { test as setup } from '@playwright/test'
import * as fs from 'fs'

setup.beforeAll(() => {
  fs.mkdirSync('src/fixtures/.auth', { recursive: true })
})

setup('앱 유저 로그인', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('이메일').fill(process.env.TEST_USER_EMAIL!)
  await page.getByPlaceholder('비밀번호').fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/')
  await page.context().storageState({ path: 'src/fixtures/.auth/user.json' })
})

setup('어드민 로그인', async ({ page }) => {
  const adminUrl = process.env.ADMIN_URL || 'https://corthex-hq.com/admin'
  await page.goto(`${adminUrl}/login`)
  await page.getByPlaceholder('이메일').fill(process.env.TEST_ADMIN_EMAIL!)
  await page.getByPlaceholder('비밀번호').fill(process.env.TEST_ADMIN_PASSWORD!)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('**/admin/')
  await page.context().storageState({ path: 'src/fixtures/.auth/admin.json' })
})
```

### 0-6. package.json (e2e 패키지)

```json
{
  "name": "@corthex/e2e",
  "private": true,
  "scripts": {
    "test": "npx playwright test",
    "smoke": "npx playwright test src/tests/smoke/",
    "interaction": "npx playwright test src/tests/interaction/",
    "visual": "npx playwright test src/tests/visual/",
    "update-snapshots": "npx playwright test src/tests/visual/ --update-snapshots",
    "report": "npx playwright show-report reports/html"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@axe-core/playwright": "latest",
    "dotenv": "latest"
  }
}
```

### 0-7. .gitignore에 추가할 것

```
packages/e2e/.env.test
packages/e2e/src/fixtures/.auth/
packages/e2e/reports/
packages/e2e/test-results/
```

### 0-8. VS Code 확장 설정

**Playwright Test for VSCode** 설치 후:
1. VS Code 좌측 사이드바에 **테스트 아이콘**(플라스크 모양)이 생김
2. 클릭하면 테스트 파일 트리가 표시됨
3. 각 테스트 옆에 **▶ 버튼** → 클릭하면 바로 실행
4. **Show Browser** 체크하면 Chromium 창이 떠서 눈으로 확인 가능
5. 실패 시 **스크린샷 + 에러 메시지** 바로 VS Code 안에서 확인

---

## Phase 1: 현재 기능 상태 점검

> 목적: 배포된 사이트에 접속해서 "지금 뭐가 되고 뭐가 안 되는지" 파악
> 소요 시간: 30분
> 결과물: 각 페이지의 현재 상태 리포트

### 1-1. 스모크 테스트 — 서버 상태 확인

```typescript
// src/tests/smoke/health.spec.ts
import { test, expect } from '@playwright/test'

test('서버 헬스체크', async ({ request }) => {
  const baseUrl = process.env.BASE_URL || 'https://corthex-hq.com'
  const res = await request.get(`${baseUrl}/api/health`)
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.success).toBe(true)
})
```

### 1-2. 스모크 테스트 — 앱 전체 페이지 접근 (23개)

```typescript
// src/tests/smoke/app-navigation.spec.ts
import { test, expect } from '@playwright/test'

const APP_ROUTES = [
  { path: '/',              name: '홈' },
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
    const crashTexts = ['Something went wrong', '오류가 발생']
    for (const text of crashTexts) {
      await expect(page.getByText(text)).not.toBeVisible()
    }

    // 치명적 JS 에러 없음
    const critical = errors.filter(e =>
      e.includes('Uncaught') || e.includes('TypeError') || e.includes('ReferenceError')
    )
    expect(critical, `${route.path} 에서 JS 에러 발생`).toEqual([])
  })
}
```

### 1-3. 스모크 테스트 — 어드민 전체 페이지 접근 (19개)

```typescript
// src/tests/smoke/admin-navigation.spec.ts
import { test, expect } from '@playwright/test'

const ADMIN_ROUTES = [
  { path: '/',                 name: '어드민 대시보드' },
  { path: '/users',            name: '사용자 관리' },
  { path: '/employees',        name: '인간 직원 관리' },
  { path: '/departments',      name: '부서 관리' },
  { path: '/agents',           name: 'AI 직원 관리' },
  { path: '/credentials',      name: 'CLI 자격증명' },
  { path: '/companies',        name: '회사 관리' },
  { path: '/tools',            name: '도구 관리' },
  { path: '/costs',            name: '비용 관리' },
  { path: '/report-lines',     name: '보고 라인' },
  { path: '/soul-templates',   name: '소울 템플릿' },
  { path: '/monitoring',       name: '시스템 모니터링' },
  { path: '/org-chart',        name: '조직도' },
  { path: '/org-templates',    name: '조직 템플릿' },
  { path: '/workflows',        name: '워크플로우 관리' },
  { path: '/template-market',  name: '템플릿 마켓' },
  { path: '/agent-marketplace', name: '에이전트 마켓플레이스' },
  { path: '/api-keys',         name: 'API 키 관리' },
  { path: '/settings',         name: '설정' },
]

for (const route of ADMIN_ROUTES) {
  test(`[어드민] ${route.name} (${route.path}) — 에러 없이 로드`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await page.goto(route.path)
    expect(response?.status()).not.toBe(404)
    await page.waitForLoadState('domcontentloaded')

    const crashTexts = ['Something went wrong', '오류가 발생']
    for (const text of crashTexts) {
      await expect(page.getByText(text)).not.toBeVisible()
    }

    const critical = errors.filter(e =>
      e.includes('Uncaught') || e.includes('TypeError') || e.includes('ReferenceError')
    )
    expect(critical, `${route.path} 에서 JS 에러 발생`).toEqual([])
  })
}
```

### 1-4. 실행 방법 (2가지)

**방법 1: VS Code 확장으로 (추천 — 눈으로 보면서)**
1. VS Code 좌측 **테스트 아이콘** (플라스크) 클릭
2. `smoke` 폴더 옆 **▶** 클릭
3. 하단 **Show Browser** 체크하면 Chromium 창이 뜸
4. 각 페이지 접속하는 걸 실시간으로 볼 수 있음
5. 실패한 테스트는 빨간색 ✗ 표시 → 클릭하면 에러 상세 확인

**방법 2: 터미널에서 (빠르게)**
```bash
cd packages/e2e
npx playwright test src/tests/smoke/
```

### 1-5. 결과 기록

스모크 테스트 결과를 파일에 기록. Claude Code가 자동으로 작성함.

```
저장 위치: _uxui-refactoring/phase1-baseline.md
```

```markdown
# 스모크 테스트 결과 — 작업 전 기준선
날짜: 2026-MM-DD

## 앱 페이지 (23개)
| # | 페이지 | 경로 | 상태 | 에러 내용 |
|---|--------|------|------|----------|
| 1 | 홈 | / | ✅ | |
| 2 | 사령관실 | /command-center | ✅ | |
| 3 | 에이전트 채팅 | /chat | ❌ | TypeError: xxx |
...

## 어드민 페이지 (19개)
| # | 페이지 | 경로 | 상태 | 에러 내용 |
...

## 요약
- 앱: ??/23 통과
- 어드민: ??/19 통과
- 발견된 에러: ??? 건
```

---

## Phase 2: UXUI 리팩토링 (페이지별 반복 작업)

> 전체 페이지: 앱 23개 + 어드민 19개 = 42개
> 각 페이지마다 아래 5단계를 반복
> **전부 이 VS Code 안에서 진행**

### 페이지 작업 우선순위

중요도와 사용 빈도 기준:

**1순위 — 핵심 기능 (9개)**

| # | 패키지 | 페이지 | 경로 | 이유 |
|---|--------|--------|------|------|
| 1 | app | 사령관실 | /command-center | 가장 많이 쓰는 핵심 화면 |
| 2 | app | 에이전트 채팅 | /chat | AI 대화 핵심 기능 |
| 3 | app | 성과 대시보드 | /dashboard | CEO가 매일 보는 화면 |
| 4 | app | 트레이딩 | /trading | 실투자 — UI 중요 |
| 5 | app | AGORA 토론 | /agora | 핵심 차별화 기능 |
| 6 | app | NEXUS 워크플로우 | /nexus | 핵심 차별화 기능 |
| 7 | admin | AI 직원 관리 | /agents | 가장 많이 쓰는 어드민 |
| 8 | admin | 부서 관리 | /departments | 조직 구성 핵심 |
| 9 | admin | CLI 자격증명 | /credentials | 에이전트 두뇌 연결 |

**2순위 — 중요 기능 (14개)**

| # | 패키지 | 페이지 | 경로 |
|---|--------|--------|------|
| 10 | app | SNS 관리 | /sns |
| 11 | app | 메신저 | /messenger |
| 12 | app | 작전일지 | /ops-log |
| 13 | app | 보고서 | /reports |
| 14 | app | 작업 현황 | /jobs |
| 15 | app | 지식 베이스 | /knowledge |
| 16 | app | 파일 관리 | /files |
| 17 | app | 비용 현황 | /costs |
| 18 | app | 활동 로그 | /activity-log |
| 19 | admin | 워크플로우 | /workflows |
| 20 | admin | 도구 관리 | /tools |
| 21 | admin | 사용자 관리 | /users |
| 22 | admin | 인간 직원 | /employees |
| 23 | admin | 모니터링 | /monitoring |

**3순위 — 부가 기능 (19개)**

| # | 패키지 | 페이지 | 경로 |
|---|--------|--------|------|
| 24 | app | 홈 | / |
| 25 | app | ARGOS | /argos |
| 26 | app | 기밀 작전 | /classified |
| 27 | app | 조직도 | /org |
| 28 | app | 스케줄러 | /cron |
| 29 | app | 성과 지표 | /performance |
| 30 | app | 알림 | /notifications |
| 31 | app | 설정 | /settings |
| 32 | admin | 조직도 | /org-chart |
| 33 | admin | 조직 템플릿 | /org-templates |
| 34 | admin | 템플릿 마켓 | /template-market |
| 35 | admin | 에이전트 마켓 | /agent-marketplace |
| 36 | admin | 소울 템플릿 | /soul-templates |
| 37 | admin | 보고 라인 | /report-lines |
| 38 | admin | API 키 | /api-keys |
| 39 | admin | 비용 관리 | /costs |
| 40 | admin | 회사 관리 | /companies |
| 41 | admin | 설정 | /settings |
| 42 | admin | 온보딩 | /onboarding |

---

### 페이지 1개당 작업 순서 (5단계)

```
Step A: Claude가 설명서 작성            ← 이 창에서 자동
Step B: 사용자가 Banana2 이미지 생성     ← 같은 PC 브라우저에서
Step C: Claude가 이미지 보고 코딩        ← 이 창에서 자동
Step D: Claude가 테스트 작성 + 실행      ← VS Code Playwright 확장 활용
Step E: 체크리스트 확인 → 커밋+푸시      ← 자동 배포
```

---

#### Step A. 설명서 작성 (Claude Code가 자동으로)

Claude Code가 해당 페이지의 현재 코드를 읽고 UX/UI 설명서를 작성.

```
저장 위치: _uxui-refactoring/specs/{번호}-{페이지명}.md
예시:     _uxui-refactoring/specs/01-command-center.md
```

설명서에 포함되는 내용:

```markdown
# {페이지명} UX/UI 설명서

## 1. 페이지 목적
- 누가 쓰는 화면인가?
- 이 화면에서 핵심으로 해야 할 것 1가지는?

## 2. 현재 레이아웃 분석
- 전체 구조 (상단/좌측/메인/우측 배치)
- 각 영역의 역할과 내용

## 3. 현재 문제점
- 지금 UI에서 불편하거나 어색한 점
- 정보 구조가 잘못된 부분
- 반응형이 깨지는 부분

## 4. 개선 방향
- 레이아웃 변경 제안
- 새로 추가할 UI 요소
- 제거할 불필요한 요소

## 5. 컴포넌트 목록 (개선 후)
- 각 영역에 들어갈 컴포넌트
- 상태 관리 (로딩/에러/빈 상태)
- 인터랙션 (클릭, 호버, 드래그)

## 6. 데이터 바인딩
- API 엔드포인트
- 표시할 데이터 필드
- 실시간 업데이트 여부 (WebSocket/SSE)

## 7. 색상/톤 앤 매너
- 다크테마 기준 주요 색상
- 강조색 (primary, warning, danger)
- 폰트 사이즈 위계

## 8. 반응형 대응
- 데스크톱 (1440px)
- 태블릿 (768px)
- 모바일 (375px)

## 9. v1 참고사항
- v1에서 이 화면이 어땠는지
- v1에서 반드시 살려야 할 기능

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
(영문 프롬프트 — Antigravity에 바로 복붙)

### 모바일 버전
(영문 프롬프트)

## 11. data-testid 목록
| 요소 | data-testid | Playwright 테스트 용도 |
|------|------------|----------------------|
| 메인 입력창 | command-input | 텍스트 입력 테스트 |
| 전송 버튼 | command-submit | 클릭 테스트 |
| ... | ... | ... |
```

---

#### Step B. Banana2 이미지 생성 (사용자가 직접 — 같은 PC에서)

**git pull/push 필요 없음!** 파일이 같은 PC에 있으니까 바로 저장하면 됨.

**작업 순서:**
1. `_uxui-refactoring/specs/01-command-center.md` 열기
2. **"10. Banana2 이미지 생성 프롬프트"** 섹션의 영문 프롬프트 복사
3. **같은 PC의 브라우저**에서 Antigravity 접속
4. 바나나2로 이미지 생성
5. 바로 아래 폴더에 저장:

```
저장 위치: _uxui-refactoring/designs/{번호}-{페이지명}-desktop.png
          _uxui-refactoring/designs/{번호}-{페이지명}-mobile.png
```

**파일명 규칙:**
```
_uxui-refactoring/designs/
├── 01-command-center-desktop.png
├── 01-command-center-mobile.png
├── 02-chat-desktop.png
├── 02-chat-mobile.png
├── 03-dashboard-desktop.png
...
```

6. Claude Code에게 말하기: **"이미지 저장했어, 코딩해줘"**

---

#### Step C. Claude 코딩 (Claude Code가 자동으로)

Claude Code가 **이미지 파일을 직접 읽고** (Read 도구로) 코드를 작성.

**사용자가 이렇게 지시:**
```
01-command-center 이미지 저장했어, 코딩해줘
```

**Claude Code가 하는 일:**
1. `_uxui-refactoring/designs/01-command-center-desktop.png` 읽기 (시각적 확인)
2. `_uxui-refactoring/designs/01-command-center-mobile.png` 읽기
3. `_uxui-refactoring/specs/01-command-center.md` 참고
4. `packages/app/src/pages/command-center/` 코드 수정

**절대 규칙:**
```
1. 기능은 절대 건드리지 말 것 (API 호출, 상태 관리 로직 유지)
2. 오직 UI/레이아웃/스타일만 변경
3. 설명서 11번의 data-testid 전부 추가
4. 기존 data-testid는 절대 삭제하지 말 것
5. 반응형 대응 (모바일 이미지 참고)
```

---

#### Step D. 인터랙션 테스트 작성 + 실행 (Claude Code + VS Code 확장)

**Claude Code가 테스트 코드 작성:**
```
저장 위치: packages/e2e/src/tests/interaction/app/{페이지명}.spec.ts
          packages/e2e/src/tests/interaction/admin/{페이지명}.spec.ts
```

**사용자가 VS Code 확장으로 실행:**
1. VS Code 좌측 **테스트 아이콘** (플라스크) 클릭
2. 해당 테스트 파일 찾기
3. **▶** 클릭
4. **"Show Browser"** 체크하면 Chromium이 떠서 실시간으로 볼 수 있음
5. 결과: ✅ 통과 / ❌ 실패 (실패 시 스크린샷 + 에러 메시지 바로 확인)

**또는 Claude Code가 터미널에서 바로 실행:**
```bash
cd packages/e2e
npx playwright test src/tests/interaction/app/command-center.spec.ts
```

**중요**: 인터랙션 테스트는 **UI 모양이 아닌 동작을 테스트**하기 때문에
UXUI 변경 전후에 모두 통과해야 함.

---

#### Step E. 확인 체크리스트 + 커밋

각 페이지 작업 완료 전 아래를 모두 체크:

```
[UXUI 체크리스트 — {페이지명}]
[ ] A. 설명서 작성 완료
[ ] B. Banana2 이미지 생성 완료
[ ] C. 코드 리팩토링 완료 (UI만 변경, 기능 유지)
[ ] D. data-testid 전부 추가됨
[ ] E. 인터랙션 테스트 작성 + 통과
[ ] F. 스모크 테스트 통과 (전체 페이지 회귀 없음)
[ ] G. 콘솔 에러 없음
[ ] H. 모바일 레이아웃 확인
```

모두 통과 → 커밋 + 푸시 (자동 배포):
```bash
git add .
git commit -m "feat(uxui): {페이지명} UI 리팩토링 완료"
git push
# → GitHub Actions → VPS 빌드 → 배포 → Cloudflare 캐시 퍼지
```

배포 후 한 번 더 스모크 테스트:
```bash
npx playwright test src/tests/smoke/
```

---

## Phase 3: 시각 회귀 테스트 기준 이미지 등록

> 전제 조건: 모든 페이지 (또는 1순위 페이지들) UXUI 리팩토링 완료
> 목적: "새 UI가 이 모습이다"를 스크린샷으로 고정
> 이후: 코드 수정 시 UI가 의도치 않게 바뀌면 자동 감지

### 3-1. 시각 회귀 테스트 파일

```typescript
// src/tests/visual/app-regression.spec.ts
import { test, expect } from '@playwright/test'

const APP_PAGES = [
  { name: 'home',           path: '/' },
  { name: 'command-center', path: '/command-center' },
  { name: 'chat',           path: '/chat' },
  { name: 'dashboard',      path: '/dashboard' },
  { name: 'trading',        path: '/trading' },
  { name: 'agora',          path: '/agora' },
  { name: 'nexus',          path: '/nexus' },
  { name: 'sns',            path: '/sns' },
  { name: 'messenger',      path: '/messenger' },
  { name: 'ops-log',        path: '/ops-log' },
  { name: 'reports',        path: '/reports' },
  { name: 'jobs',           path: '/jobs' },
  { name: 'knowledge',      path: '/knowledge' },
  { name: 'files',          path: '/files' },
  { name: 'costs',          path: '/costs' },
  { name: 'activity-log',   path: '/activity-log' },
  { name: 'cron',           path: '/cron' },
  { name: 'argos',          path: '/argos' },
  { name: 'classified',     path: '/classified' },
  { name: 'org',            path: '/org' },
  { name: 'performance',    path: '/performance' },
  { name: 'notifications',  path: '/notifications' },
  { name: 'settings',       path: '/settings' },
]

for (const pg of APP_PAGES) {
  test(`[앱] ${pg.name} 시각 회귀`, async ({ page }) => {
    await page.goto(pg.path)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`app-${pg.name}.png`, {
      maxDiffPixelRatio: 0.02,     // 2% 차이까지 허용
      fullPage: true,
      animations: 'disabled',      // 애니메이션 끄고 찍기
    })
  })
}
```

### 3-2. 기준 이미지 최초 등록

```bash
cd packages/e2e
npx playwright test src/tests/visual/ --update-snapshots
```

VS Code 확장에서도 가능:
- 테스트 아이콘 → visual 폴더 → 우클릭 → **"Update Snapshots"**

생성된 `.png` 파일 커밋:
```bash
git add packages/e2e/src/tests/visual/
git commit -m "test(visual): baseline screenshots for new UXUI"
git push
```

### 3-3. 이후 사용법

코드를 수정할 때마다:
```bash
npx playwright test src/tests/visual/
```
- **PASS**: UI가 기준 이미지와 같음
- **FAIL**: 스크린샷이 달라짐 → VS Code에서 **diff 이미지** 바로 확인 가능
  - 의도한 변경이면 `--update-snapshots`로 갱신
  - 의도하지 않은 변경이면 버그 — 수정

---

## Phase 4: 최종 전체 검증 + 배포

### 4-1. 최종 전체 테스트

**VS Code 확장에서 전체 실행:**
1. 테스트 아이콘 클릭
2. 최상위 **▶▶** (Run All Tests) 클릭
3. 스모크 → 인터랙션 → 시각 회귀 순서로 전부 실행

**또는 터미널:**
```bash
cd packages/e2e

# 1. 스모크 (전 페이지 접근)
npx playwright test src/tests/smoke/

# 2. 인터랙션 (기능 동작)
npx playwright test src/tests/interaction/

# 3. 시각 회귀 (UI 스크린샷)
npx playwright test src/tests/visual/

# 4. 리포트 열기
npx playwright show-report reports/html
```

### 4-2. 배포 전 최종 체크리스트

```
[최종 배포 체크리스트]
[ ] 스모크 테스트 전체 통과 (앱 23개 + 어드민 19개)
[ ] 인터랙션 테스트 전체 통과
[ ] 시각 회귀 테스트 통과
[ ] 콘솔 에러 0개
[ ] 모바일 반응형 확인
[ ] 다크모드 정상 작동
[ ] 로그인 → 로그아웃 흐름 정상
```

### 4-3. 배포

```bash
git push
# → GitHub Actions 자동 트리거
# → self-hosted runner (VPS)에서 빌드
# → Cloudflare 캐시 퍼지
# → 배포 완료
```

---

## 인터랙션 테스트 상세 — 페이지별 테스트 항목

> Phase 2 Step D에서 Claude Code가 이 목록을 보고 테스트 코드를 작성함.

### 앱 — 사령관실 (`/command-center`)
```
- 페이지 로드 → 입력창 표시
- 입력창에 텍스트 타이핑 → Enter 전송 → SSE 응답 수신 → 결과 표시
- @멘션 입력 → 에이전트 드롭다운 표시 → 선택
- /슬래시 입력 → 명령 드롭다운 표시
- 프리셋 버튼 클릭 → 입력창에 자동 입력
- 이전 대화 히스토리 스크롤
```

### 앱 — 에이전트 채팅 (`/chat`)
```
- 에이전트 목록 로드 + 표시
- 에이전트 클릭 → 대화방 전환
- 메시지 입력 → 전송 → AI 응답 수신
- 대화 히스토리 스크롤
```

### 앱 — 트레이딩 (`/trading`)
```
- 감시목록 로드 + 표시
- 종목 클릭 → 차트 모달 오픈 → Esc로 닫기
- 포트폴리오 탭 전환
```

### 앱 — AGORA (`/agora`)
```
- 토론 목록 로드
- 새 토론 생성 버튼 클릭 → 폼 표시
- 토론 선택 → 상세 표시
```

### 앱 — NEXUS (`/nexus`)
```
- 워크플로우 캔버스 로드
- 워크플로우 목록 표시
- 워크플로우 선택 → 캔버스에 노드 표시
```

### 앱 — SNS (`/sns`)
```
- 게시물 목록 로드
- 새 게시물 작성 버튼 → 폼 표시
- 게시물 상태 필터
```

### 앱 — 메신저 (`/messenger`)
```
- 대화 목록 로드
- 대화 선택 → 메시지 표시
- 메시지 입력 → 전송
```

### 앱 — 지식 베이스 (`/knowledge`)
```
- 폴더 트리 로드
- 폴더 클릭 → 파일 목록 표시
- 파일 클릭 → 내용 미리보기
```

### 어드민 — AI 직원 관리 (`/agents`)
```
- 에이전트 목록 로드
- 에이전트 생성 버튼 → 폼 표시 → 저장
- 에이전트 수정 → 변경 반영
- 에이전트 삭제 → 목록에서 제거
```

### 어드민 — 부서 관리 (`/departments`)
```
- 부서 목록 로드
- 부서 추가 → 폼 → 저장
- 부서 수정 → 변경 반영
- 부서 삭제 → 목록에서 제거
```

### 어드민 — CLI 자격증명 (`/credentials`)
```
- 자격증명 목록 로드 (키는 마스킹)
- 새 자격증명 등록 → 저장
- 자격증명 삭제
```

### 어드민 — 워크플로우 (`/workflows`)
```
- 워크플로우 목록 로드
- 새 워크플로우 생성
- 워크플로우 실행 → 상태 확인
```

---

## 역할 분담 요약

| 단계 | 누가 | 뭘 하는지 | 어디서 |
|------|------|----------|--------|
| Phase 0 세팅 | Claude Code | Playwright 설치 + 설정 | 이 VS Code |
| Phase 1 점검 | Claude Code | 스모크 테스트 실행 + 결과 기록 | 이 VS Code |
| Phase 2-A | Claude Code | 페이지 설명서 작성 | 이 VS Code |
| **Phase 2-B** | **사용자** | **Banana2 이미지 생성** | **같은 PC 브라우저** |
| Phase 2-C | Claude Code | 이미지 보고 코딩 | 이 VS Code |
| Phase 2-D | Claude Code | 테스트 작성 + 실행 | 이 VS Code |
| Phase 2-E | Claude Code | 커밋 + 푸시 (자동 배포) | 이 VS Code |
| Phase 3 | Claude Code | 기준 스크린샷 등록 | 이 VS Code |
| Phase 4 | Claude Code | 최종 전체 테스트 | 이 VS Code |

**사용자가 직접 하는 건 Phase 2-B(이미지 생성)만.**
나머지는 전부 이 창에서 Claude Code가 자동으로 처리.

---

## 진행 상황 추적표

Phase 2 작업 시 아래 표를 업데이트 (Claude Code가 관리):

```
저장 위치: _uxui-refactoring/PROGRESS.md
```

| # | 페이지 | 패키지 | 설명서 | 이미지 | 코딩 | 테스트 | 배포 | 완료 |
|---|--------|--------|--------|--------|------|--------|------|------|
| 1 | command-center | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | chat | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | dashboard | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | trading | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | agora | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | nexus | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | agents | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | departments | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | credentials | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | sns | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 11 | messenger | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 12 | ops-log | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 13 | reports | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 14 | jobs | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 15 | knowledge | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 16 | files | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 17 | costs | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 18 | activity-log | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 19 | workflows | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 20 | tools | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 21 | users | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 22 | employees | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 23 | monitoring | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 24 | home | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 25 | argos | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 26 | classified | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 27 | org | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 28 | cron | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 29 | performance | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 30 | notifications | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 31 | settings | app | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 32 | org-chart | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 33 | org-templates | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 34 | template-market | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 35 | agent-marketplace | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 36 | soul-templates | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 37 | report-lines | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 38 | api-keys | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 39 | costs | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 40 | companies | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 41 | settings | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 42 | onboarding | admin | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 작업 시작 방법

준비가 됐으면 아래 순서로 시작:

```
1. "Phase 0 시작해줘"
   → Claude Code가 Playwright 패키지 설치 + 설정 파일 생성
   → 사용자는 .env.test에 비밀번호만 입력

2. "Phase 1 시작해줘"
   → 스모크 테스트 실행 + 현재 상태 기록
   → VS Code Playwright 확장에서 결과 확인 가능

3. "command-center 설명서 써줘"
   → 1번 페이지 설명서 생성

4. (사용자) Antigravity에서 이미지 생성 → designs 폴더에 저장

5. "이미지 저장했어, 코딩해줘"
   → Claude가 이미지 보고 코딩 + 테스트 작성 + 실행

6. 3~5 반복 (42개 페이지)

7. "Phase 3 시작해줘"
   → 기준 스크린샷 등록

8. "최종 검증해줘"
   → 전체 테스트
```

---

## data-testid 네이밍 규칙

모든 테스트 가능한 요소에 `data-testid` 속성을 추가할 때의 규칙:

```
형식: {페이지명}-{역할}

예시:
  data-testid="command-input"         ← 사령관실 입력창
  data-testid="command-submit"        ← 사령관실 전송 버튼
  data-testid="command-result"        ← 사령관실 결과 영역
  data-testid="mention-dropdown"      ← @멘션 드롭다운
  data-testid="agent-list"            ← 에이전트 목록
  data-testid="agent-item"            ← 개별 에이전트 항목
  data-testid="chat-input"            ← 채팅 입력창
  data-testid="chat-message-user"     ← 사용자 메시지
  data-testid="chat-message-agent"    ← AI 메시지
  data-testid="watchlist"             ← 감시목록
  data-testid="stock-item"            ← 종목 항목
  data-testid="dept-name-input"       ← 부서명 입력
  data-testid="delete-btn"            ← 삭제 버튼
  data-testid="mobile-menu-toggle"    ← 모바일 햄버거 메뉴
  data-testid="theme-toggle"          ← 다크모드 토글
  data-testid="sidebar"               ← 사이드바
```

---

## 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 테스트 시작 안 됨 | Chromium 미설치 | `npx playwright install chromium` |
| VS Code에 테스트 안 보임 | 확장이 config 못 찾음 | `playwright.config.ts` 경로 확인 |
| 로그인 실패 | `.env.test` 비밀번호 오류 | 비밀번호 확인 |
| 페이지 타임아웃 | 배포 사이트 다운 | VPS 서버 상태 확인 |
| 스크린샷 diff 과도 | 폰트 렌더링 차이 | `maxDiffPixelRatio` 값 올리기 |
| CORS 에러 | 배포 사이트 설정 | API 서버 CORS 설정 확인 |
| "Show Browser" 안 됨 | WSL 환경 | Windows 네이티브 Node.js 사용 확인 |
