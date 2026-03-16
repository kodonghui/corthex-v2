# CORTHEX v2 E2E QA Bug Report

> **Inspection Date**: 2026-03-16
> **Inspector**: Claude Desktop (Playwright MCP)
> **Site**: https://corthex-hq.com
> **Accounts Tested**: Admin (`admin`/`admin1234`), CEO (`ceo`/`ceo1234`)
> **Design Standard**: Natural Organic Theme (light mode, beige `#faf8f5` bg, olive `#5a7247` accent, Noto Serif KR headings, Pretendard body)
> **Reference Screenshots**: `_corthex_full_redesign/phase-7-stitch/1_stitch_remix_of_design_system_style_guide/`

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **Critical** | 3 |
| **Major** | 8 |
| **Minor** | 6 |
| **Cosmetic** | 5 |
| **Security** | 1 |
| **Total** | **23** |

### Top 3 Systemic Issues
1. **다크 테마 강제 적용** — Natural Organic(라이트) 테마로 디자인했는데, 코드가 강제로 다크 모드를 씌움. 전체 앱에 영향.
2. **Material Symbols 폰트 미로드** — 아이콘이 텍스트로 표시됨 ("settings", "dashboard", "notifications" 등). Jobs/Costs/Performance/SketchVibe/Workflows 등 10개 이상 페이지 영향.
3. **App 페이지가 Admin API 호출** — `/api/admin/*` 엔드포인트를 호출하여 403 에러 → 에이전트/부서/티어 3개 페이지 완전 불능.

---

## Round 1: Admin Account Full Inspection

### App Pages (25 pages)

| # | Route | Page Title | Content Status | API Errors | Material Symbols | Inner Sidebar | Verdict |
|---|-------|-----------|---------------|------------|-----------------|---------------|---------|
| 1 | `/login` | 로그인 | 폼, 버튼, 로고 정상 | 0 | No | No | **PASS** (cosmetic) |
| 2 | `/hub` | 허브 | 채팅 UI, 제안 카드 4개, Process Delegation 패널, CORTHEX_TERMINAL | 0 | No | **YES** (Workspace Hub/Active Tasks/Agent Directory) | **MAJOR** |
| 3 | `/dashboard` | 대시보드 | "반갑습니다, CEO님", 액션 카드 3개, 에이전트 현황, 최근 알림 | 0 | No | **YES** (대시보드/AI 에이전트 채팅/워크플로우/보고서) | **MAJOR** |
| 4 | `/agents` | 에이전트 | **스켈레톤만 표시**, 데이터 없음 | 403 x9 (`/api/admin/agents`, `/api/admin/departments`, `/api/admin/users`) | No | No | **CRITICAL** |
| 5 | `/departments` | 부서 | **스켈레톤만 표시**, 데이터 없음 | 403 x3 (`/api/admin/departments`) | No | No | **CRITICAL** |
| 6 | `/tiers` | 티어 | **스켈레톤만 표시**, 데이터 없음 | 403 x3 (`/api/admin/tier-configs`) | No | No | **CRITICAL** |
| 7 | `/jobs` | 작업 | 탭(야간 작업), 테이블, 통계 카드 3개, "새로운 작업 생성" 버튼 | 0 | **YES** (`work`, `calendar_month`, `bolt`, `settings`, `add`, `terminal`, `dark_mode`, `notifications`, `eco`, `dashboard`, `search`) | **YES** | **MAJOR** |
| 8 | `/reports` | 보고서 | 빈 콘텐츠 영역 | 0 | No | No | **MINOR** |
| 9 | `/workflows` | 워크플로우 | 탭(Workflows/Suggestions), 빈 상태 "아직 워크플로우가 없습니다" | 500 x4 (`/api/workspace/workflows/suggestions`) | **YES** (`hub`, `account_tree`, `tips_and_updates`) | **YES** | **MAJOR** |
| 10 | `/sketchvibe` | 스케치바이브 | React Flow 캔버스, 채팅 패널("개발팀장과(와) 대화를 시작하세요"), 컨트롤바 | 0 | **YES** (`home`, `folder`, `dashboard`, `settings`, `help`, `fit_screen`, `ios_share`) | **YES** | **MAJOR** |
| 11 | `/sns` | SNS | 게시물 목록, 필터, 이미지 카드 | 0 | **YES** (일부) | **YES** | **MINOR** |
| 12 | `/trading` | 전략실 | Watchlist, 차트, 포지션, AI 채팅 | 0 | No | **YES** (내부 nav) | **PASS** (theme only) |
| 13 | `/messenger` | 메신저 | 채팅 룸 목록, 메시지, 프로필 패널 | 0 | No | No (3-column layout) | **PASS** (theme only) |
| 14 | `/knowledge` | 라이브러리 | 문서 라이브러리, 검색, 필터, 0 파일 | 0 | No | No | **PASS** (theme only) |
| 15 | `/agora` | AGORA | AI 토론 진행 중, 3 Agents, Round 4/5, Workspace/Debates/Archive 탭 | 0 | No | No | **PASS** (theme only) |
| 16 | `/files` | 파일 | 드래그앤드롭 영역, 필터(전체/이미지/문서/기타), 빈 상태 | 0 | No | No | **PASS** (theme only) |
| 17 | `/costs` | 비용 분석 | 통계 카드 4개 ($0.00), Cost Trends 차트, Detailed Cost Records | 0 | **YES** (`payments`, `smart_toy`, `description`, `settings`, `dashboard`, `account_balance_wallet`, `search`, `notifications`, `download`, `cloud`, `psychology`, `temp_preferences_custom`) | **YES** | **MAJOR** |
| 18 | `/performance` | 전력분석 | Performance Matrix 테이블, Hallucination Report, Soul Gym | 500 x3 (`/api/workspace/performance/summary`) | **YES** (`analytics`, `dashboard`, `auto_awesome`, `psychology_alt`, `settings`, `smart_toy`, `cloud_done`, `support_agent`, `check_circle`, `warning`, `error`, `fitness_center`, `star` x20+, `arrow_forward`, `notifications`, `search`) | **YES** (별도 사이드바) | **MAJOR** |
| 19 | `/activity-log` | 통신로그 | 타임라인 로그(로그인 이력), Activity/Delegation/QA Reviews/Tools 탭 | 0 | No | No | **PASS** (theme only) |
| 20 | `/ops-log` | 작전일지 | 통계, 필터, 빈 상태 | 0 | No | No | **PASS** (theme only) |
| 21 | `/classified` | 기밀문서 | 보안 등급 UI, 빈 아카이브 | 0 | No | No | **PASS** (theme only) |
| 22 | `/settings` | 설정 | 8개 탭(일반/테마/알림설정/허브/API연동/텔레그램/소울편집/MCP연동), 회사정보 폼 | 0 | No | No | **PASS** (theme only) |
| 23 | `/nexus` | NEXUS | React Flow 캔버스, 줌/미니맵/툴바 | 0 | No | No | **PASS** (theme only) |
| 24 | `/chat` | 채팅 | 세션 목록, 에이전트 프로필 패널, 메시지 입력 | 0 | No | No | **MAJOR** (연결 끊김 + 문법 오류) |
| 25 | `/onboarding` | 온보딩 | 미확인 (로그인 후 자동 리다이렉트 없음) | — | — | — | — |

### Admin Panel Pages (18 pages)

| # | Route | 확인 | Content | Verdict |
|---|-------|------|---------|---------|
| 1 | `/admin` (dashboard) | O | 통계 카드 4개, 차트 2개, 알림 테이블 | MAJOR (budget 500) |
| 2 | `/admin/agents` | O | 에이전트 관리, 검색, 템플릿 | MAJOR (API errors) |
| 3 | `/admin/credentials` | O | CLI 토큰 관리, 직원 목록, 보안 정책 | PASS |
| 4 | `/admin/employees` | O | 빈 메인 영역 | MINOR |
| 5-18 | 나머지 14개 | X | 미확인 | — |

---

## Round 2: CEO Account Inspection

### CEO Admin Access Security Test

| API Endpoint | CEO Result | Status |
|-------------|-----------|--------|
| `/api/admin/departments` | 403 "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/users` | 403 | **PASS** |
| `/api/admin/agents` | 403 | **PASS** |
| `/api/admin/credentials` | 403 | **PASS** |
| `/api/admin/tier-configs` | 403 | **PASS** |
| `/api/admin/tools` | 403 | **PASS** |
| `/api/admin/companies` | 403 | **PASS** |
| `/api/admin/soul-templates` | 403 | **PASS** |
| `/api/admin/budget` | 403 | **PASS** |
| `/api/admin/report-lines` | 403 | **PASS** |
| `/api/admin/monitoring` | 403 | **PASS** |

**Result**: 11/11 admin API endpoints correctly reject CEO token with 403. **SECURITY PASS.**

### CEO Sidebar
CEO (role: "user")와 Admin (role: "관리자") 사이드바 메뉴 **완전 동일** — 25개 항목 모두 동일하게 표시. 역할별 메뉴 분기 없음.

---

## Round 3: Bug List with Root Cause Analysis

---

### BUG-D001: 다크 테마 강제 적용 — 전체 앱이 다크 모드

- **Severity**: Critical
- **Account**: Admin + CEO
- **Pages**: 전체 앱 (25개 페이지 모두)
- **Screenshot**: `screenshots/01-hub.jpeg`, `screenshots/02-dashboard.jpeg` 등 전부

#### 레퍼런스 비교
| 항목 | 레퍼런스 디자인 | 실제 사이트 |
|------|---------------|-----------|
| 배경색 | 베이지 `#faf8f5` | 다크 슬레이트 `oklch(0.208 0.042 265.755)` |
| 사이드바 | 올리브 그린 `#5a7247` 기반 | 진한 네이비/블랙 |
| 텍스트 | 다크 브라운/블랙 | 라이트 그레이/화이트 |
| 전체 느낌 | 밝고 자연적인 오가닉 | 어두운 테크 대시보드 |

#### DOM Evidence
```
<html lang="ko" class="dark">  ← 이것이 원인
```
- `document.documentElement.classList` = `["dark"]`
- Body의 `background-color`는 `rgb(250, 248, 245)` = `#faf8f5`로 정확하지만, Tailwind의 `dark:` variant 클래스들이 이를 완전히 덮어씀

#### Console Error
없음 (코드 의도대로 동작 중)

#### Root Cause Code
**`packages/app/src/App.tsx:67`**
```tsx
useEffect(() => {
  document.documentElement.classList.add('dark')
}, [])
```
이 한 줄이 앱 마운트 시 `<html>` 태그에 `dark` 클래스를 강제 추가. Tailwind CSS 4의 모든 `dark:` variant가 활성화되어 전체 UI가 다크 모드로 변환됨.

#### Fix
이 `useEffect` 블록을 삭제하거나, 테마 설정 페이지(`/settings` > 테마 탭)의 사용자 선택에 따라 토글하도록 수정.

---

### BUG-D002: App 페이지가 Admin API 호출 → 403 에러로 3개 페이지 완전 불능

- **Severity**: Critical
- **Account**: Admin + CEO (둘 다 동일하게 실패)
- **Pages**: `/agents`, `/departments`, `/tiers`
- **Screenshot**: `screenshots/03-agents.jpeg`, `screenshots/04-departments.jpeg`, `screenshots/06-tiers.jpeg`

#### 레퍼런스 비교
| 페이지 | 레퍼런스 | 실제 |
|--------|---------|------|
| `/agents` | 에이전트 카드 그리드, 상태 뱃지, 이미지 | 빈 스켈레톤 4개만 표시 |
| `/departments` | 부서 카드 3개 (Customer Support, Product Dev, Sales & Growth) | 빈 스켈레톤 4개만 표시 |
| `/tiers` | N-Tier Configuration 테이블, 5 tiers, API Health | 어두운 직사각형 4개만 표시 |

#### Console Errors (verbatim)
```
[Agents page]
Failed to load resource: the server responded with a status of 403 () @ /api/admin/agents?isActive=true
Failed to load resource: the server responded with a status of 403 () @ /api/admin/departments
Failed to load resource: the server responded with a status of 403 () @ /api/admin/users
(각 3회 반복 = 총 9개 에러)

[Departments page]
Failed to load resource: the server responded with a status of 403 () @ /api/admin/departments
(3회 반복)

[Tiers page]
Failed to load resource: the server responded with a status of 403 () @ /api/admin/tier-configs
(3회 반복)
```

#### Network Requests
```
[GET] /api/admin/agents?isActive=true => [403]
[GET] /api/admin/departments => [403]
[GET] /api/admin/users => [403]
[GET] /api/admin/tier-configs => [403]
```

#### Root Cause Code
App 페이지 컴포넌트가 Admin 전용 API를 직접 호출:
- **`packages/app/src/pages/agents.tsx:3-9`** — `/api/admin/agents`, `/api/admin/departments`, `/api/admin/users`
- **`packages/app/src/pages/departments.tsx:3-8`** — `/api/admin/departments`
- **`packages/app/src/pages/tiers.tsx:469`** — `/api/admin/tier-configs`

서버 미들웨어 **`packages/server/src/middleware/auth.ts:40-56`**:
```typescript
isAdminUser: payload.type === 'admin'
// ...
if (!isAdminLevel(tenant.role) || !tenant.isAdminUser) {
  throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
}
```
App 로그인 JWT의 `type`은 `'user'`이므로 `isAdminUser`가 항상 `false` → 403.

#### Fix
App 페이지에서 `/api/workspace/*` 엔드포인트 (읽기 전용)를 호출하도록 변경하거나, 해당 데이터의 workspace-level API를 새로 생성.

---

### BUG-D003: Material Symbols 아이콘이 텍스트로 표시

- **Severity**: Critical
- **Account**: Admin + CEO
- **Pages**: `/jobs`, `/workflows`, `/sketchvibe`, `/costs`, `/performance`, `/admin` (dashboard), SNS 일부
- **Screenshot**: `screenshots/05-jobs.jpeg`, `screenshots/07-workflows.jpeg`, `screenshots/08-sketchvibe.jpeg`, `screenshots/09-costs.jpeg`, `screenshots/10-performance.jpeg`

#### 실제 화면에서 보이는 텍스트 (아이콘이어야 하는 것들)

| 페이지 | 노출된 Material Symbols 텍스트 |
|--------|------------------------------|
| `/jobs` | `work`, `calendar_month`, `bolt`, `settings`, `add`, `terminal`, `dark_mode`, `notifications`, `eco`, `dashboard`, `search` |
| `/workflows` | `hub`, `account_tree`, `tips_and_updates` |
| `/sketchvibe` | `home`, `folder`, `dashboard`, `settings`, `help`, `fit_screen`, `ios_share` |
| `/costs` | `payments`, `smart_toy`, `description`, `settings`, `dashboard`, `account_balance_wallet`, `search`, `notifications`, `download`, `cloud`, `psychology`, `temp_preferences_custom` |
| `/performance` | `analytics`, `dashboard`, `auto_awesome`, `psychology_alt`, `settings`, `smart_toy`, `cloud_done`, `support_agent`, `check_circle`, `warning`, `error`, `fitness_center`, `star` (20회+), `arrow_forward`, `notifications`, `search` |
| `/admin/*` | `check_circle`, `more_vert` |

#### Root Cause
이 페이지들은 Google Material Symbols 폰트를 사용하는 아이콘 컴포넌트를 사용. 해당 폰트가 로드되지 않아 폰트 이름 텍스트가 그대로 화면에 출력됨.

CLAUDE.md 디자인 규칙: **"아이콘: Lucide React 유지 (Material Symbols 대신 — 번들 크기)"**

#### Fix
Material Symbols를 사용하는 모든 컴포넌트를 Lucide React 아이콘으로 교체. 또는 임시 조치로 Material Symbols 폰트를 로드하는 `<link>` 태그 추가.

---

### BUG-D004: WebSocket "재연결 중..." / "연결이 끊어졌습니다" 상시 표시

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/hub`, `/chat`, `/activity-log`
- **Screenshot**: `screenshots/01-hub.jpeg`, `screenshots/15-chat.jpeg`, `screenshots/11-activity-log.jpeg`

#### 실제 화면
- `/chat`: 상단 빨간 배너 **"연결이 끊어졌습니다. 재연결 중..."**
- `/activity-log`: 우측 상단 **"재연결 중..."** 빨간 점 뱃지
- `/hub`: Process Delegation 패널에 "Waiting..." 상태

#### Console Error
직접적인 WebSocket 에러 메시지는 콘솔에 표시되지 않음 (연결 시도가 조용히 실패)

#### Root Cause
서버의 WebSocket 엔드포인트가 프로덕션 환경에서 제대로 동작하지 않거나, Cloudflare 프록시가 WebSocket 업그레이드를 차단하고 있을 가능성.

#### Fix
서버 WebSocket 설정 확인 + Cloudflare 대시보드에서 WebSocket 지원 활성화 확인.

---

### BUG-D005: Dashboard/Hub에서 Admin 계정에 "CEO님" 표시

- **Severity**: Major
- **Account**: Admin
- **Pages**: `/dashboard`, `/hub`
- **Screenshot**: `screenshots/02-dashboard.jpeg` — "반갑습니다, CEO님"

#### 레퍼런스 비교
레퍼런스: "Admin User" / "관리자님" 표시
실제: Admin 계정으로 로그인했는데 "반갑습니다, CEO님" 및 하단 프로필에 "CEO님 / Administrator"

#### Root Cause
Dashboard 인사말과 Hub 프로필이 하드코딩되었거나, 사용자 역할 대신 고정 텍스트를 사용.

---

### BUG-D006: 다수 페이지에 이중 사이드바 (Inner Sidebar)

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/hub`, `/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/costs`, `/performance`, `/sns`, `/trading`

#### 레퍼런스 비교
| 레퍼런스 | 실제 |
|---------|------|
| 단일 사이드바 (앱 셸) + 콘텐츠 영역 | 앱 셸 사이드바 + 페이지 내부 사이드바 = 이중 네비게이션 |

#### 상세 내역

| 페이지 | Inner Sidebar 내용 |
|--------|-------------------|
| `/hub` | Workspace Hub, Active Tasks, Agent Directory |
| `/dashboard` | 대시보드, AI 에이전트 채팅, 워크플로우 (Jobs), 보고서, 설정 |
| `/jobs` | Dashboard, Jobs, Schedules, Triggers, Settings |
| `/workflows` | Workflows, All Workflows, Suggestions |
| `/sketchvibe` | Home, Workspaces, Templates, Settings, Help |
| `/costs` | Dashboard, Cost Analysis, Agents, Logs, Settings |
| `/performance` | Dashboard, Analytics, Agent Souls, Hallucinations, Settings |

#### Root Cause
각 페이지 컴포넌트가 자체 네비게이션 사이드바를 포함하고 있음. 앱 셸의 사이드바와 중복됨. Stitch HTML에서 변환할 때 content area뿐 아니라 sidebar도 함께 포함한 것으로 보임.

CLAUDE.md 규칙: **"페이지 콘텐츠: 각 Stitch HTML에서 content area만 참고 (sidebar/topbar 무시)"**

#### Fix
각 페이지 컴포넌트에서 내부 사이드바 컴포넌트를 제거하고, content area만 유지.

---

### BUG-D007: Chat 페이지 문법 오류 — "와의" → "과의"

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/chat`
- **Screenshot**: `screenshots/15-chat.jpeg`

#### 실제 텍스트
- 세션 목록: **"비서실장와의 대화"** (반복 7회)
- 채팅 영역: **"비서실장과(와) 대화를 시작하세요"** (이건 올바른 표현)

#### 올바른 표현
"비서실장**과의** 대화" (받침 있는 명사 뒤에는 "과")

#### Root Cause
세션 제목 생성 로직에서 한국어 조사 처리가 잘못됨.

---

### BUG-D008: Workflows Suggestions API 500 에러

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/workflows`
- **Screenshot**: `screenshots/07-workflows.jpeg`

#### Console Errors (verbatim)
```
Failed to load resource: the server responded with a status of 500 ()
@ /api/workspace/workflows/suggestions?limit=100
(4회 반복)
```

#### Root Cause
서버의 `/api/workspace/workflows/suggestions` 엔드포인트에서 내부 오류 발생.

---

### BUG-D009: Performance Summary API 500 에러

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/performance`
- **Screenshot**: `screenshots/10-performance.jpeg`

#### Console Errors (verbatim)
```
Failed to load resource: the server responded with a status of 500 ()
@ /api/workspace/performance/summary
(3회 반복)
```

상단 통계 카드 3개가 스켈레톤 상태로 남아있음 (데이터 로드 실패).

---

### BUG-D010: Admin Panel `/api/admin/budget` 500 에러

- **Severity**: Major
- **Account**: Admin (admin panel)
- **Pages**: `/admin` (dashboard), `/admin/agents`, `/admin/credentials`

#### Console Errors
```
500 /api/admin/budget
500 /api/admin/costs/summary?startDate=...
```

대시보드 예산 영역에 데이터 표시 안 됨.

---

### BUG-D011: 폰트 미로드 — Pretendard, Noto Serif KR, Work Sans

- **Severity**: Minor
- **Account**: Admin + CEO
- **Pages**: 전체 앱

#### 레퍼런스 비교
| 항목 | 레퍼런스 | 실제 |
|------|---------|------|
| 제목 폰트 | Noto Serif KR (세리프) | 시스템 산세리프 폴백 |
| 본문 폰트 | Pretendard | 시스템 산세리프 폴백 |
| UI 폰트 | Inter | Inter (부분 로드) |

#### DOM Evidence
- Google Fonts에서 **Work Sans** 12 variants 로드 중이나 "unloaded" 상태
- CSS `--font-ui: 'Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif'` 선언됨
- Pretendard용 `@font-face` 또는 CDN 링크 없음
- Noto Serif KR: computed style에서 참조되나 실제 로드 미확인
- 결과: `ui-sans-serif, system-ui, sans-serif`로 폴백

#### Fix
`packages/app/index.html`에 Pretendard CDN + Noto Serif KR Google Fonts 링크 추가. 사용하지 않는 Work Sans 로드 제거.

---

### BUG-D012: Login 에러 메시지 부적절 — "인증이 만료되었습니다"

- **Severity**: Minor
- **Account**: Admin + CEO
- **Pages**: `/login`

#### 재현 방법
잘못된 비밀번호로 로그인 시도 (예: `admin`/`wrongpass`)

#### 실제 동작
에러 메시지: **"인증이 만료되었습니다"** (auth expired)

#### 예상 동작
**"아이디 또는 비밀번호가 올바르지 않습니다"**

#### Root Cause
서버가 401 응답 시 generic 메시지를 반환하고, 프론트엔드가 만료와 잘못된 자격증명을 구분하지 않음.

---

### BUG-D013: SNS API 라우팅 버그 — "posts"가 UUID로 파싱

- **Severity**: Minor
- **Account**: Admin + CEO
- **Pages**: `/sns` (잠재적)

#### Console Error
```
500 /api/workspace/sns/posts — "invalid input syntax for type uuid: \"posts\""
```

#### Root Cause Code
**`packages/server/src/routes/workspace/sns.ts`** — `/api/workspace/sns/:id` 라우트가 `/api/workspace/sns/posts`보다 먼저 매칭되어 "posts" 문자열을 UUID로 파싱 시도.

#### Fix
구체적 라우트(`/posts`)를 동적 라우트(`/:id`) 앞에 배치.

---

### BUG-D014: Reports 페이지 빈 콘텐츠

- **Severity**: Minor
- **Account**: Admin + CEO
- **Pages**: `/reports`

콘텐츠 영역이 완전히 비어있음. 에러 없음, 빈 상태 메시지도 없음. 레퍼런스에는 "Reports Archive" 테이블이 표시됨.

---

### BUG-D015: Performance 페이지 아이콘-텍스트 겹침

- **Severity**: Minor
- **Account**: Admin + CEO
- **Pages**: `/performance`
- **Screenshot**: `screenshots/10-performance.jpeg`

Agent Performance Matrix에서 에이전트 이름 앞에 Material Symbols 텍스트가 겹쳐 표시:
- `smart_to개발팀장` (smart_toy + 개발팀장)
- `support_agent마케팅팀장` (support_agent + 마케팅팀장)
- `cloud_don재무팀장` (cloud_done + 재무팀장)
- `smart_to비서실장` (smart_toy + 비서실장)

원인: Material Symbols 폰트 미로드 + 아이콘과 텍스트 사이 공간 없음.

---

### BUG-D016: Admin Panel Emoji 아이콘 사용

- **Severity**: Cosmetic
- **Account**: Admin (admin panel)
- **Pages**: 전체 admin panel

디자인 스펙은 Lucide React 아이콘을 요구하지만, admin panel 사이드바는 이모지 사용:
`📊🏛️👥🏢🤖🔧💰🔑📋✨🖥️🏗️🔮🛒🧠🔐⚡⚙️⇄`

---

### BUG-D017: Copyright 연도 오류

- **Severity**: Cosmetic
- **Pages**: `/login`

실제: "© 2024 CORTHEX"
현재 연도: 2026

---

### BUG-D018: CEO와 Admin 사이드바 동일 — 역할별 분기 없음

- **Severity**: Cosmetic
- **Account**: CEO
- **Pages**: 전체 앱

CEO (role: "user")가 Admin과 동일한 25개 메뉴 항목을 봄. 시스템 관리 메뉴(비용, 통신로그, 기밀문서 등)가 일반 사용자에게도 노출.

---

### BUG-D019: Admin Panel 세션 격리 미흡

- **Severity**: Security (Low)
- **Account**: Any
- **Pages**: `/admin/*`

앱에서 로그아웃해도 admin panel의 별도 JWT 토큰이 삭제되지 않음. 동일 브라우저에서 다음 사용자가 `/admin`에 접근하면 이전 admin 세션으로 접근 가능.

#### Root Cause
앱 로그아웃이 `corthex_token`만 삭제하고, admin panel의 별도 토큰은 그대로 남김.

#### Fix
앱 로그아웃 시 admin panel 토큰도 함께 삭제.

---

### BUG-D020: Performance 페이지 별점(star) 텍스트 반복

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Pages**: `/performance`
- **Screenshot**: `screenshots/10-performance.jpeg`

Agent Performance Matrix의 QUALITY 컬럼에 `starstarstarstarstar` 텍스트가 반복 표시. 별점 아이콘(★★★★★)이어야 하는 곳에 Material Symbols 텍스트 "star"가 5번 반복.

---

### BUG-D021: SketchVibe 문법 — "과(와)" 표기 불일치

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Pages**: `/sketchvibe`

표시 텍스트: **"개발팀장과(와) 대화를 시작하세요"**
"과(와)"는 불필요한 이중 표기. "과" 또는 "와" 중 받침에 따라 하나만 사용해야 함.

---

### BUG-D022: Admin Dashboard 빈 라우트 — `/admin/dashboard`

- **Severity**: Minor
- **Account**: Admin
- **Pages**: `/admin/dashboard`

**완전히 빈 페이지** — "No routes matched location '/dashboard'"
Admin SPA의 대시보드는 `/admin` (루트)이지 `/admin/dashboard`가 아님.

---

### BUG-D023: Costs 페이지 내부 사이드바에 불필요한 "Monthly Budget" 프로그레스바

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Pages**: `/costs`
- **Screenshot**: `screenshots/09-costs.jpeg`

좌측 하단에 "SOUL GROWTH PLAN" 프로그레스바와 "Upgrade Workspace" 버튼이 표시됨. 이것은 Performance 페이지(`/performance`)의 사이드바 요소가 잘못 포함된 것으로 보임.

---

## Appendix: Reference Screenshot Comparison Summary

| 페이지 | 레퍼런스 파일명 | 디자인 일치도 | 주요 차이점 |
|--------|--------------|------------|-----------|
| `/hub` | `corthex_v2_react_hub_command_center/screen.png` | **30%** | 다크 테마, 이중 사이드바, 프로세스 체인 위치 다름 |
| `/dashboard` | `corthex_v2_react_dashboard/screen.png` | **25%** | 다크 테마, 이중 사이드바, 레이아웃 구조 다름, "CEO님" 하드코딩 |
| `/agents` | `corthex_v2_react_agents/screen.png` | **0%** | 완전 불능 (스켈레톤만) |
| `/departments` | `corthex_v2_react_departments/screen.png` | **0%** | 완전 불능 (스켈레톤만) |
| `/tiers` | `corthex_v2_react_tiers/screen.png` | **0%** | 완전 불능 (스켈레톤만) |
| `/trading` | `corthex_v2_react_trading/screen.png` | **60%** | 다크 테마, 구조는 유사 |
| `/sns` | `corthex_v2_react_sns/screen.png` | **50%** | 다크 테마, Material Symbols, 구조 유사 |
| `/nexus` | `corthex_v2_react_nexus_org_chart/screen.png` | **70%** | 다크 테마만 차이, 캔버스 기능 정상 |
| `/performance` | `corthex_v2_react_performance/screen.png` | **30%** | 다크 테마, Material Symbols 대량, API 500 |
| `/jobs` | `corthex_v2_react_jobs/screen.png` | **35%** | 다크 테마, Material Symbols 대량, 이중 사이드바 |
| `/chat` | `corthex_v2_react_hub_command_center/screen.png` | **50%** | 다크 테마, WebSocket 끊김, 문법 오류 |
| `/costs` | `costs/screen.png` | **30%** | 다크 테마, Material Symbols 대량, 이중 사이드바 |
| `/activity-log` | `activity_log/screen.png` | **65%** | 다크 테마만 차이, 기능 정상 |
| `/files` | N/A | **70%** | 다크 테마만 차이, 기능 정상 |
| `/settings` | `admin_settings_react/screen.png` | **65%** | 다크 테마만 차이, 기능 정상 |
| `/agora` | `corthex_v2_react_agora/screen.png` | **70%** | 다크 테마만 차이, 콘텐츠 풍부 |

---

## Fix Priority Matrix

| Priority | Bug IDs | Description | Impact | Effort |
|----------|---------|-------------|--------|--------|
| **P0** | D001 | 다크 테마 제거 (`classList.add('dark')` 삭제) | 전체 앱 | 1줄 삭제 |
| **P0** | D002 | Admin API → Workspace API 전환 | 3개 페이지 복구 | 중간 |
| **P0** | D003 | Material Symbols → Lucide React 전환 | 10+ 페이지 | 높음 |
| **P1** | D004 | WebSocket 연결 수정 | 실시간 기능 복구 | 중간 |
| **P1** | D006 | Inner sidebar 제거 | 9개 페이지 레이아웃 | 중간 |
| **P1** | D008, D009, D010 | API 500 에러 수정 | 3개 API 복구 | 중간 |
| **P2** | D005, D007 | 텍스트/문법 수정 | UX 품질 | 낮음 |
| **P2** | D011, D012 | 폰트 로드 + 에러 메시지 | 디자인 품질 | 낮음 |
| **P3** | D016-D021 | Cosmetic 이슈들 | 미관 | 낮음 |

---

> Generated by Claude Desktop E2E Inspector
> Screenshots saved to: `_qa-e2e/browser-claude-desktop/screenshots/`
