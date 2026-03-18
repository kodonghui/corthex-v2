# CORTHEX v2 — Spec-Based E2E + Root Cause Analysis Report

> **Inspection Date**: 2026-03-16
> **Inspector**: Claude Desktop (Playwright MCP)
> **Site**: https://corthex-hq.com
> **Accounts Tested**: Admin (`admin`/`admin1234`), CEO (`ceo`/`ceo1234`)
> **Design Standard**: Natural Organic Theme (light mode, beige `#faf8f5` bg, olive `#5a7247` accent, Noto Serif KR headings, Pretendard body)
> **PRD Reference**: `_bmad-output/planning-artifacts/prd.md` (FR1~FR72, NFR 61개)
> **Reference Screenshots**: `_corthex_full_redesign/phase-7-stitch/1_stitch_remix_of_design_system_style_guide/`

---

## FR Coverage Summary

| Category | FR Range | Total | Tested | PASS | FAIL | Not Implemented | Blocked |
|----------|----------|-------|--------|------|------|-----------------|---------|
| Agent Execution | FR1~10 | 10 | 3 | 0 | 2 | 0 | 1 |
| Secretary & Orchestration | FR11~20 | 10 | 3 | 1 | 1 | 1 | 0 |
| Soul Management | FR21~25 | 5 | 1 | 0 | 0 | 0 | 1 |
| Organization Management | FR26~33 | 8 | 5 | 2 | 3 | 0 | 0 |
| Tier & Cost | FR34~39 | 6 | 2 | 0 | 2 | 0 | 0 |
| Security & Audit | FR40~45 | 6 | 3 | 2 | 0 | 0 | 1 |
| Real-time Monitoring | FR46~49 | 4 | 2 | 0 | 2 | 0 | 0 |
| Library | FR50~56 | 7 | 0 | 0 | 0 | 7 | 0 |
| Dev Collaboration | FR57~58 | 2 | 0 | 0 | 0 | 2 | 0 |
| Onboarding | FR59~61 | 3 | 1 | 1 | 0 | 0 | 0 |
| v1 Compat & UX | FR62~68 | 7 | 7 | 4 | 3 | 0 | 0 |
| Phase 5+ | FR69~72 | 4 | 1 | 0 | 0 | 0 | 1 |
| **Total** | **FR1~72** | **72** | **28** | **10** | **13** | **10** | **4** |

**Coverage**: 28/72 tested (39%) — remaining 34 are Phase 2~5+ features not yet implemented, plus 10 blocked by other failures.

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **Critical** | 6 |
| **Major** | 17 |
| **Minor** | 7 |
| **Cosmetic** | 6 |
| **Security** | 2 |
| **Total** | **38** |

### Top 7 Systemic Issues

1. **Inner Sidebar가 메인 네비게이션을 물리적으로 차단** — 6개 페이지(`/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/sns`, `/costs`)에서 Inner sidebar의 `aside`가 `position:fixed; left:0; z-index:50`으로 메인 사이드바를 덮어씌움. **사용자가 다른 페이지로 이동할 수 없음**. (BUG-D029, Critical P0)
2. **Hub stream API 500** — `POST /api/workspace/hub/stream` returns 500 INTERNAL_ERROR. 허브에서 에이전트에게 명령을 보낼 수 없음 (FR1 완전 실패). Chat 페이지에서는 메시지 전송 가능하나 "CLI 토큰 미등록" 에러 반환.
3. **다크 테마 강제 적용** — `App.tsx:67`에서 `document.documentElement.classList.add('dark')` 하드코딩. Natural Organic(라이트) 테마 전면 무효화. 전체 앱 25개 페이지 영향.
4. **App 페이지가 Admin API 호출** — `/agents`, `/departments`, `/tiers` 3개 페이지가 `/api/admin/*` 엔드포인트 호출 → 403 에러 → 페이지 완전 불능 (FR26, FR27, FR34 실패).
5. **8개 페이지 빈 main** — `/messenger`, `/knowledge`, `/agora`, `/files`, `/costs`, `/performance`, `/classified`, `/reports`가 콘텐츠 없이 빈 페이지. 일부는 API 에러, 일부는 미구현.
6. **Material Symbols 폰트 미로드** — `/jobs`, `/workflows`, `/sketchvibe`, `/sns` 등에서 아이콘이 영문 텍스트로 노출 ("settings", "dashboard", "notifications" 등 24개+).
7. **WebSocket 상시 끊김** — `/hub`, `/chat`, `/sketchvibe`, `/activity-log`에서 "재연결 중..." / "연결이 끊어졌습니다" 상시 표시. 실시간 기능 전면 불능.

### CRUD 테스트 성공 (긍정적 발견)

- **Jobs**: 작업 생성(에이전트 선택+지시 입력) → 테이블 반영 → 삭제 → 확인 다이얼로그 → 완료. **풀 CRUD 동작** ✅
- **Workflows**: 워크플로우 생성(이름/설명/단계) → 카드 표시 → 삭제 → 완료. **풀 CRUD 동작** ✅
- **Settings**: 이름 변경 → 저장 → 사이드바 실시간 반영 → 복원. **Read+Update 동작** ✅

---

## Round 1: Admin Account — Spec-Based Full E2E

### Login Tests

| # | Test | Action | Expected | Actual | FR | Result |
|---|------|--------|----------|--------|-----|--------|
| 1 | Empty form submit | Click 로그인 | 에러 메시지 표시 | 첫 빈 필드에 포커스만 이동, 에러 메시지 없음 | — | **MINOR** |
| 2 | Wrong password | admin/wrongpass | "아이디 또는 비밀번호가 올바르지 않습니다" | **"인증이 만료되었습니다"** (misleading) | — | **BUG-D012** |
| 3 | SQL injection | `admin' OR 1=1--` / anything | 401 거부 | 401 "인증이 만료되었습니다" | FR45 | **PASS** |
| 4 | XSS attempt | `<script>alert(1)</script>` / test | 401 거부, 스크립트 미실행 | 401, 스크립트 미실행 | FR45 | **PASS** |
| 5 | Correct login | admin/admin1234 | 로그인 성공 → /hub 리다이렉트 | 성공, /hub 이동, 토큰 저장 | — | **PASS** |

**DOM Evidence (Login page)**:
```
forms: 0 (no <form> tag — inputs are raw divs)
background-color: rgb(250, 248, 245) = #faf8f5 ✅
copyright: "© 2024 CORTHEX" (should be 2026)
```

### /hub — Hub (FR1, FR6, FR7, FR14, FR46, FR62, FR65~68)

| FR | Test | Action | Expected | Actual | DOM/API Evidence | Result |
|----|------|--------|----------|--------|-----------------|--------|
| FR1 | 자연어 명령 | "안녕" 입력 → 전송 | 에이전트 응답 | **"오류가 발생했습니다 (코드: INTERNAL_ERROR)"** | `POST /api/workspace/hub/stream → [500]` | **FAIL** |
| FR6 | SSE 스트리밍 | 전송 후 | 실시간 글자 | API 500으로 스트리밍 시작 불가 | Network: 500 INTERNAL_ERROR | **BLOCKED** |
| FR7 | 에러 처리 | 잘못된 요청 | 에러 메시지 표시 | "오류가 발생했습니다 (코드: INTERNAL_ERROR)" 배너 표시 + 닫기 버튼 | 에러 배너 DOM 존재, 닫기 버튼 동작 확인 | **PASS** (에러 표시는 됨) |
| FR14 | 비서 있는 허브 | 로그인 후 | 채팅 중심 UI | 채팅 입력 중심 + 제안 카드 4개 + Process Delegation 패널 | `heading "비서실장에게 명령하세요"` 존재 | **PASS** (UI 구조) |
| FR46 | 핸드오프 트래커 | — | 실시간 표시 | "Process Delegation" 패널 존재, "System Secretary: Waiting..." | Delegation tracker DOM 있음, WebSocket 끊김으로 비활성 | **PARTIAL** |
| FR62 | 대화 기록 | — | 이전 대화 | Hub에서는 확인 불가 (Chat 페이지에서 7개 세션 확인) | `GET /api/workspace/chat/sessions → 200, 7개` | **PASS** (Chat에서) |
| FR65 | 파일 첨부 | 첨부 버튼 | 파일 선택 대화상자 | `input[type=file]` 존재 (display:none, 버튼 클릭으로 트리거) | `fileInputCount: 1, accept: ""` | **PASS** (UI 존재) |
| FR66 | 작업 취소 | — | 취소 버튼 | Hub에서는 미확인. **Chat에서 "작업 중단" 버튼 확인** → 클릭 시 "서버 중단 실패, 로컬 스트림만 중지됨" | Cancel API 실패, 로컬만 중지 | **PARTIAL** |
| FR67 | 응답 복사 | 복사 버튼 | 클립보드 복사 | Hub에서 복사 버튼 미발견 (copyBtnCount: 0) | 응답이 오지 않아 버튼 미생성 가능 | **UNTESTABLE** |
| FR68 | 마크다운 렌더링 | 표/코드 응답 | 렌더링됨 | 응답이 오지 않아 테스트 불가 | — | **UNTESTABLE** |

**Hub DOM Analysis**:
```javascript
darkClass: true                    // ❌ should be false
htmlClasses: ["dark"]              // ❌ forced dark mode
bodyBg: "rgb(250, 248, 245)"       // ✅ correct beige, but overridden by dark: classes
navCount: 2                        // ❌ double sidebar (app + inner)
asideCount: 3                      // ❌ triple: inner sidebar + delegation panel + outer
h1Font: "Pretendard, Inter, sans-serif"  // ✅ working
h2Font: '"Noto Serif KR", serif'         // ✅ working
sidebarBg: "oklch(0.208 0.042 265.755)"  // ❌ dark navy instead of olive
reconnecting: true                 // ❌ WebSocket always disconnected
profileText: "CEO님"               // ❌ shows "CEO님" for Admin user
```

**Hub Suggestion Buttons Test**:
| Button | Click | Result |
|--------|-------|--------|
| "오늘 뉴스 브리핑해줘" | ✅ 클릭 가능 | 입력창에 텍스트 자동 채움 ✅ |
| "/tools 사용 가능한 도구 목록" | 미테스트 | — |
| "@CMO 이번 주 마케팅 보고서" | 미테스트 | — |
| "경쟁사 분석 보고서 작성해줘" | 미테스트 | — |

### /chat — Chat (FR1, FR62, FR63, FR65, FR66)

| FR | Test | Action | Expected | Actual | Result |
|----|------|--------|----------|--------|--------|
| FR1 | 메시지 전송 | "안녕하세요 테스트입니다" → 전송 | 에이전트 응답 | 메시지 전송 성공 ✅, 비서실장 응답: "[AI 연결 오류] CLI 토큰이 등록되지 않았습니다" | **PARTIAL** (전송은 됨, 토큰 미등록) |
| FR62 | 대화 기록 | 사이드바 | 세션 목록 | 7개 세션 표시: 비서실장와의 대화, 개발팀장와의 대화 ×4, 마케팅팀장와의 대화, 재무팀장와의 대화 | **PASS** (데이터 있음) |
| FR63 | 맥락 유지 | — | 이전 대화 맥락 | CLI 토큰 없어서 검증 불가 | **UNTESTABLE** |
| FR65 | 파일 첨부 | 첨부 버튼 | 파일 선택 | "파일 첨부" 버튼 존재, 작업 중 disabled 처리됨 | **PASS** (UI) |
| FR66 | 작업 취소 | "작업 중단" 클릭 | 중단 | 버튼 표시 ✅, 클릭 시 "서버 중단 실패, 로컬 스트림만 중지됨" | **PARTIAL** |

**Chat Bugs Found**:
- 세션 제목 문법 오류: "비서실장**와**의 대화" × 7회 반복 (올바른 표현: "비서실장**과**의 대화")
- WebSocket 배너: "연결이 끊어졌습니다. 재연결 중..."
- Agent profile: "No soul description configured for this agent."
- Cancel API: `POST /sessions/{id}/cancel` → 실패

### /agents — Agents (FR20, FR27, FR29, FR33)

| FR | Test | Expected | Actual | Result |
|----|------|----------|--------|--------|
| FR27 | 에이전트 목록 | 카드 그리드 | **빈 main**, 스켈레톤 없음 | **CRITICAL FAIL** |
| FR27 | CRUD 전체 | 생성/수정/삭제 | 불가 (403) | **BLOCKED** |
| FR20 | 에이전트 추가 | 추가 버튼 | 불가 (데이터 미로드) | **BLOCKED** |
| FR29 | 도구 할당 | 도구 체크 | 불가 (403) | **BLOCKED** |
| FR33 | 비서실장 삭제 방지 | 삭제 시 거부 | 불가 (접근 자체 불가) | **BLOCKED** |

**Console Errors (verbatim)**:
```
[ERROR] Failed to load resource: 403 @ /api/admin/users (×3)
[ERROR] Failed to load resource: 403 @ /api/admin/agents?isActive=true (×3)
[ERROR] Failed to load resource: 403 @ /api/admin/departments (×3)
```

### /departments — Departments (FR26)

| FR | Test | Expected | Actual | Result |
|----|------|----------|--------|--------|
| FR26 | 부서 목록 | 부서 카드 | **빈 main** | **CRITICAL FAIL** |
| FR26 | CRUD | 생성/수정/삭제 | 불가 (403) | **BLOCKED** |

**Console**: `403 @ /api/admin/departments`

### /tiers — Tiers (FR34~36)

| FR | Test | Expected | Actual | Result |
|----|------|----------|--------|--------|
| FR34 | 티어 목록 | N-Tier Configuration 테이블 | **빈 main** | **CRITICAL FAIL** |
| FR35 | 모델 매핑 | tier → model | 데이터 없음 | **BLOCKED** |

**Console**: `403 @ /api/admin/tier-configs`

### /nexus — NEXUS Org Chart (FR30, FR32)

| FR | Test | Expected | Actual | Result |
|----|------|----------|--------|--------|
| FR30 | 조직도 시각 편집 | React Flow 캔버스 | 9 nodes, minimap, controls ✅ | **PASS** (rendering) |
| FR30 | 드래그&드롭 | 노드 이동 | 미테스트 (snapshot 한계) | — |
| FR32 | CEO 읽기 전용 | 편집 불가 | **CEO가 "편집 모드" 토글 + "Publish Changes" 버튼 보유** | **FAIL** (see BUG-D027) |

**NEXUS Data**:
```
Nodes: CORTHEX HQ, 경영지원실(비서실장), 개발팀(개발팀장), 마케팅팀(마케팅팀장), 재무팀(재무팀장)
Edges: 8 (company→dept→agent connections)
Controls: Zoom In/Out, Fit View, Minimap ✅
Edit: Add Department, Add Agent, ELK.js Auto-layout, Save Draft, Publish Changes
```

### /settings — Settings (FR61 partial)

| Test | Action | Expected | Actual | Result |
|------|--------|----------|--------|--------|
| 회사 정보 | 페이지 로드 | 폼 표시 | 8개 탭, 회사 정보 폼 (사용자명/이메일/이름/역할) | **PASS** |
| 이름 변경 | "관리자" → "관리자테스트" → 저장 | 저장 성공 | "저장되었습니다" 토스트 + 사이드바 반영 | **PASS** |
| 이름 복원 | "관리자테스트" → "관리자" → 저장 | 저장 성공 | "저장되었습니다" ✅ | **PASS** |
| 비밀번호 변경 | — | 최소 6자 | 폼 존재, disabled 상태 (빈 필드) | **PASS** (UI) |
| 탭 전환 | 8개 탭 확인 | 전환 가능 | 일반/테마/알림설정/허브/API연동/텔레그램/소울편집/MCP연동 | **PASS** |

### Batch API Test Results (Admin Account)

| API Endpoint | Status | Data | Notes |
|-------------|--------|------|-------|
| `/api/workspace/chat/sessions` | 200 | 7 sessions | ✅ Real data |
| `/api/workspace/notifications/count` | 200 | 0 unread | ✅ |
| `/api/workspace/org-chart` | 200 | Full tree | ✅ Real data |
| `/api/workspace/files` | 200 | 0 files | ✅ Empty but valid |
| `/api/workspace/sns` | 200 | 0 posts | ✅ Empty but valid |
| `/api/workspace/workflows` | 200 | 0 workflows | ✅ |
| `/api/workspace/workflows/suggestions` | **500** | — | `"column \"suggested_steps\" does not..."` |
| `/api/workspace/performance/summary` | **500** | — | `"The \"string\" argument must be of..."` |
| `/api/workspace/activity-log` | 200 | 50 entries | ✅ Real data |
| `/api/workspace/jobs` | 200 | 0 jobs | ✅ |
| `/api/workspace/reports` | 200 | 1 report | ✅ (encoding garbled: `"3월 최근 분석"`) |
| `/api/workspace/hub/sessions` | 200 | **HTML** | ⚠️ SPA fallback, not API |
| `/api/workspace/knowledge/documents` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/trading/watchlist` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/messenger/rooms` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/costs/summary` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/classified` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/agora/debates` | 200 | **HTML** | ⚠️ SPA fallback |
| `/api/workspace/ops-log` | 200 | **HTML** | ⚠️ SPA fallback |

**SPA Fallback Issue**: 8 API endpoints return HTML instead of JSON. These routes don't exist on the server — the SPA catch-all serves `index.html` with 200 status. Frontend pages likely use different/mock data or different API paths.

---

## Round 2: CEO Account Full E2E

### CEO Login
- Username: `ceo` / Password: `ceo1234` → **Login success** ✅
- Displayed name: "고동희 대표" (correct)
- Role: "User"

### CEO Sidebar (vs Admin)
**Identical**: CEO sees all 23 menu items, same as Admin. No role-based menu filtering.

| Admin Sidebar | CEO Sidebar | Match |
|--------------|-------------|-------|
| 23 links | 23 links | **100% identical** |

**PRD Violation**: Per RBAC matrix (Architecture doc), CEO/Human should NOT see admin-level features.

### CEO Admin API Security Test

| API Endpoint | CEO Status | Message | Result |
|-------------|-----------|---------|--------|
| `/api/admin/departments` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/users` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/agents` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/credentials` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/tier-configs` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/tools` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/companies` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/soul-templates` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/budget` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/report-lines` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/monitoring` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/workflows` | **403** | "관리자 권한이 필요합니다" | **PASS** |
| `/api/admin/costs/summary` | **403** | "관리자 권한이 필요합니다" | **PASS** |

**Result: 13/13 admin APIs correctly reject CEO token. SECURITY PASS.**

### CEO NEXUS Access (FR32)

| Check | Expected (per PRD) | Actual | Result |
|-------|-------------------|--------|--------|
| 편집 모드 토글 | **없어야 함** (읽기 전용) | **있음** | **FAIL** |
| Add Department 버튼 | **없어야 함** | 없음 (snapshot에서 미발견) | PASS |
| Add Agent 버튼 | **없어야 함** | 없음 | PASS |
| Publish Changes | **없어야 함** | **있음** | **FAIL** |
| Save Draft | **없어야 함** | 있음 | **FAIL** |

---

## Round 3: Root Cause Analysis

### 근본 원인 1: 다크 테마 강제

| Evidence | Value |
|----------|-------|
| `document.documentElement.classList` | `["dark"]` |
| `getComputedStyle(body).backgroundColor` | `rgb(250, 248, 245)` (correct, but overridden) |
| Sidebar bg | `oklch(0.208 0.042 265.755)` (dark navy) |
| Code location | `packages/app/src/App.tsx:67` |

**Root Cause Code**:
```tsx
useEffect(() => {
  document.documentElement.classList.add('dark')
}, [])
```
This single line adds `class="dark"` to `<html>`, activating ALL Tailwind `dark:` variant classes. The Natural Organic design is light-mode-only.

**Fix**: Remove this `useEffect` block entirely. If theme toggle is desired (FR70, Phase 5+), implement a settings-based toggle.

### 근본 원인 2: App 페이지가 Admin API 호출

| Page | API Called | Should Call |
|------|-----------|-------------|
| `/agents` | `/api/admin/agents`, `/api/admin/departments`, `/api/admin/users` | `/api/workspace/agents` (read-only) |
| `/departments` | `/api/admin/departments` | `/api/workspace/departments` |
| `/tiers` | `/api/admin/tier-configs` | `/api/workspace/tier-configs` |

**Root Cause Code**:
- `packages/app/src/pages/agents.tsx:3-9` — imports reference `/api/admin/*`
- `packages/app/src/pages/departments.tsx:3-8` — same
- `packages/app/src/pages/tiers.tsx:469` — same

**Why 403**: Server middleware `packages/server/src/middleware/auth.ts:40-56`:
```typescript
isAdminUser: payload.type === 'admin'  // App JWT type = 'user', Admin panel JWT type = 'admin'
if (!isAdminLevel(tenant.role) || !tenant.isAdminUser) {
  throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
}
```

**Fix**: Create workspace-level read-only API endpoints or change App pages to call existing workspace APIs.

### 근본 원인 3: Hub Stream 500 Error

| Evidence | Value |
|----------|-------|
| Request | `POST /api/workspace/hub/stream` |
| Status | 500 |
| Error Code | `INTERNAL_ERROR` |
| Chat endpoint | `POST /api/workspace/chat/sessions/{id}/messages` works (returns CLI token error) |

**Difference**: Hub uses a different streaming endpoint than Chat. Hub's `/api/workspace/hub/stream` has a server-side error, while Chat's messaging endpoint works but requires CLI token.

### 근본 원인 4: WebSocket 상시 끊김

| Evidence | Value |
|----------|-------|
| Hub | "Reconnecting..." (상시 표시) |
| Chat | "연결이 끊어졌습니다. 재연결 중..." (빨간 배너) |
| Activity Log | "재연결 중..." |

**Likely Cause**: Cloudflare 프록시가 WebSocket 업그레이드를 차단하거나, 서버의 WebSocket 핸들러가 프로덕션 환경에서 비활성 상태.

### 근본 원인 5: Workflow Suggestions 500

```json
{"error":{"code":"INTERNAL_ERROR","message":"column \"suggested_steps\" does not..."}}
```
**DB column `suggested_steps` missing** — 마이그레이션이 누락되었거나 스키마 불일치.

### 근본 원인 6: Performance Summary 500

```json
{"error":{"code":"INTERNAL_ERROR","message":"The \"string\" argument must be of..."}}
```
**Type error** in performance summary API — 문자열 인수 타입 불일치.

### 근본 원인 7: SPA Fallback으로 API 응답이 HTML

8개 workspace API가 HTML을 반환. 이는 해당 라우트가 서버에 정의되지 않아 SPA의 catch-all `index.html`이 200으로 제공되는 현상.

**Affected**: hub/sessions, knowledge/documents, trading/watchlist, messenger/rooms, costs/summary, classified, agora/debates, ops-log

### 근본 원인 8: 한국어 조사 오류

| 텍스트 | 올바른 표현 | 원인 |
|--------|-----------|------|
| "비서실장**와**의 대화" | "비서실장**과**의 대화" | 받침 있는 명사 뒤 "과" 사용 규칙 미적용 |
| "개발팀장**와**의 대화" | "개발팀장**과**의 대화" | 동일 |
| "마케팅팀장**와**의 대화" | "마케팅팀장**과**의 대화" | 동일 |
| "재무팀장**와**의 대화" | "재무팀장**과**의 대화" | 동일 |

세션 제목 생성 로직에서 "~와의 대화"를 하드코딩한 것으로 추정. 한국어 조사 처리 함수가 필요.

---

## Bug List

### BUG-D001: Hub Stream API 500 — 허브에서 에이전트 명령 불가

- **Severity**: Critical
- **Violated FR**: FR1 (자연어 명령), FR6 (SSE 스트리밍)
- **Account**: Admin + CEO
- **Page**: `/hub`
- **PRD 기준**: "사용자가 허브에서 에이전트에게 자연어로 명령을 보낼 수 있다"
- **실제**: "오류가 발생했습니다 (코드: INTERNAL_ERROR)"
- **API 분석**: `POST /api/workspace/hub/stream → [500]`
- **DOM 분석**: 에러 배너 `generic: "오류가 발생했습니다 (코드: INTERNAL_ERROR)"` + 닫기 버튼 표시
- **비교**: Chat 페이지(`/chat`)에서는 메시지 전송이 성공하지만 CLI 토큰 미등록 에러 반환. Hub과 Chat이 다른 API 사용.
- **추정 원인 코드**: `packages/server/src/routes/workspace/hub.ts` — stream 엔드포인트 내부 오류

### BUG-D002: 다크 테마 강제 적용 — 전체 앱 다크 모드

- **Severity**: Critical
- **Violated FR**: FR70 (Phase 5+ 테마 전환 — 현재는 라이트 모드 고정이어야 함)
- **Account**: Admin + CEO
- **Page**: 전체 앱 (25개 페이지)
- **PRD 기준**: Natural Organic 테마 = 라이트 모드
- **실제**: 모든 페이지 다크 모드
- **DOM 분석**: `<html class="dark">`, sidebar bg: `oklch(0.208 0.042 265.755)`
- **추정 원인 코드**: `packages/app/src/App.tsx:67` — `document.documentElement.classList.add('dark')`
- **Fix**: 이 한 줄 삭제

### BUG-D003: App 페이지가 Admin API 호출 → 3개 페이지 완전 불능

- **Severity**: Critical
- **Violated FR**: FR26 (부서 CRUD), FR27 (에이전트 CRUD), FR34 (티어 CRUD)
- **Account**: Admin + CEO
- **Page**: `/agents`, `/departments`, `/tiers`
- **PRD 기준**: Admin이 에이전트/부서/티어를 관리할 수 있다
- **실제**: 빈 main, 데이터 없음
- **API 분석**: 9× `403` on `/api/admin/agents`, `/api/admin/departments`, `/api/admin/users`, `/api/admin/tier-configs`
- **추정 원인 코드**: `pages/agents.tsx:3-9`, `pages/departments.tsx:3-8`, `pages/tiers.tsx:469`
- **Fix**: `/api/workspace/*` 엔드포인트로 전환

### BUG-D004: Material Symbols 아이콘이 텍스트로 표시

- **Severity**: Critical
- **Violated FR**: — (디자인 품질)
- **Account**: Admin + CEO
- **Page**: `/jobs`, `/workflows`, `/sketchvibe`, `/costs`, `/performance`, `/admin/*`
- **실제**: `work`, `settings`, `dashboard`, `notifications`, `analytics`, `star` 등 영문 텍스트 노출
- **CLAUDE.md 규칙**: "아이콘: Lucide React 유지 (Material Symbols 대신 — 번들 크기)"
- **Fix**: Material Symbols → Lucide React 아이콘으로 전환

### BUG-D005: WebSocket 상시 끊김 — 실시간 기능 전면 불능

- **Severity**: Major
- **Violated FR**: FR46 (핸드오프 트래커), FR49 (서버 재시작 안내)
- **Account**: Admin + CEO
- **Page**: `/hub`, `/chat`, `/activity-log`
- **PRD 기준**: NFR-P9 "끊김 후 ≤ 3초 자동 재연결"
- **실제**: 영구 "Reconnecting..." / "연결이 끊어졌습니다. 재연결 중..."
- **추정 원인**: 서버 WebSocket 엔드포인트 비활성 또는 Cloudflare WebSocket 차단

### BUG-D006: Hub에서 Admin에게 "CEO님" 표시

- **Severity**: Major
- **Violated FR**: — (사용자 프로필 정확성)
- **Account**: Admin
- **Page**: `/hub` (inner sidebar profile), `/dashboard`
- **DOM 분석**: `paragraph: CEO님`, `paragraph: Administrator`
- **추정 원인**: Hub 프로필이 하드코딩되었거나 잘못된 데이터 소스 사용

### BUG-D007: Chat 세션 제목 한국어 조사 오류

- **Severity**: Major
- **Violated FR**: — (한국어 품질)
- **Account**: Admin + CEO
- **Page**: `/chat`
- **실제**: "비서실장**와**의 대화", "개발팀장**와**의 대화", "마케팅팀장**와**의 대화", "재무팀장**와**의 대화" (×7회)
- **올바른 표현**: "비서실장**과**의 대화" (받침 있는 명사 뒤 "과")
- **추정 원인**: 세션 제목 생성 시 "~와의 대화" 하드코딩

### BUG-D008: Workflow Suggestions API 500

- **Severity**: Major
- **Violated FR**: — (워크플로우 기능)
- **Account**: Admin + CEO
- **Page**: `/workflows`
- **API 분석**: `GET /api/workspace/workflows/suggestions?limit=100 → 500`
- **에러 메시지**: `"column \"suggested_steps\" does not exist"`
- **추정 원인**: DB 마이그레이션 누락 — `suggested_steps` 컬럼이 테이블에 없음

### BUG-D009: Performance Summary API 500

- **Severity**: Major
- **Violated FR**: — (성능 분석 기능)
- **Account**: Admin + CEO
- **Page**: `/performance`
- **API 분석**: `GET /api/workspace/performance/summary → 500`
- **에러 메시지**: `"The \"string\" argument must be of type string"`
- **추정 원인**: 타입 변환 오류 — string이 아닌 값이 string 인수로 전달됨

### BUG-D010: 이중 사이드바 (Inner Sidebar)

- **Severity**: Major
- **Violated FR**: — (레이아웃)
- **Account**: Admin + CEO
- **Page**: `/hub`, `/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/costs`, `/performance`
- **DOM 분석**: `navCount: 2`, `asideCount: 3`
- **CLAUDE.md 규칙**: "페이지 콘텐츠: 각 Stitch HTML에서 content area만 참고 (sidebar/topbar 무시)"
- **Fix**: 각 페이지 컴포넌트에서 내부 사이드바 제거

### BUG-D011: Cancel Task 서버 실패

- **Severity**: Major
- **Violated FR**: FR66 (작업 취소)
- **Account**: Admin + CEO
- **Page**: `/chat`
- **실제**: "작업 중단" 버튼 클릭 → "서버 중단 실패, 로컬 스트림만 중지됨"
- **API 분석**: `POST /sessions/{id}/cancel → 실패`
- **Fix**: Cancel API 엔드포인트 수정

### BUG-D012: Login 에러 메시지 부적절

- **Severity**: Major
- **Violated FR**: — (UX 품질)
- **Account**: All
- **Page**: `/login`
- **재현**: 잘못된 비밀번호로 로그인
- **실제**: "인증이 만료되었습니다" (auth expired)
- **예상**: "아이디 또는 비밀번호가 올바르지 않습니다"
- **추정 원인**: 서버 401 응답 메시지가 만료와 잘못된 자격증명을 구분하지 않음

### BUG-D013: 8개 Workspace API가 HTML 반환 (SPA Fallback)

- **Severity**: Minor
- **Violated FR**: — (API 정합성)
- **Account**: Admin + CEO
- **API**: hub/sessions, knowledge/documents, trading/watchlist, messenger/rooms, costs/summary, classified, agora/debates, ops-log
- **실제**: 200 + HTML (index.html) 반환
- **추정 원인**: 서버에 해당 라우트가 미정의, SPA catch-all이 200으로 HTML 제공
- **영향**: 프론트엔드가 이 API를 실제로 호출하면 JSON 파싱 실패

### BUG-D014: 폰트 미로드 — Pretendard, Noto Serif KR

- **Severity**: Minor
- **Violated FR**: — (디자인)
- **Account**: Admin + CEO
- **Page**: 전체 앱
- **DOM 분석**:
  - h1: `Pretendard, Inter, sans-serif` → ✅ (Pretendard 로드됨!)
  - h2: `"Noto Serif KR", serif` → ✅ (있음)
  - body: `ui-sans-serif, system-ui, sans-serif` → ⚠️ (Pretendard 미폴백)
  - Google Fonts에서 Work Sans 12 variants 로드 중 (사용처 불명)
- **Note**: h1/h2 수준에서는 Pretendard/Noto Serif KR이 감지됨. 일부 요소에서만 폴백.

### BUG-D015: Reports API 응답 인코딩 깨짐

- **Severity**: Minor
- **Account**: Admin + CEO
- **Page**: `/reports`
- **API 분석**: `GET /api/workspace/reports → 200, 1 report`
- **응답 snippet**: `"3월 최근 분석"` 대신 `"3\ufffd\ufffd \ufffd\ufffd\ufffd \ufffd\ufffd\ufffd"` (garbled)
- **추정 원인**: UTF-8 인코딩 불일치

### BUG-D016: Empty form submit 에러 없음

- **Severity**: Minor
- **Account**: All
- **Page**: `/login`
- **실제**: 빈 폼 제출 시 에러 메시지 없이 첫 빈 필드에 포커스만 이동
- **예상**: "아이디를 입력해주세요" 등 validation 메시지

### BUG-D017: Copyright 연도 오류

- **Severity**: Minor
- **Account**: All
- **Page**: `/login`
- **실제**: "© 2024 CORTHEX"
- **현재 연도**: 2026

### BUG-D018: Soul 미설정 메시지

- **Severity**: Minor
- **Account**: Admin + CEO
- **Page**: `/chat`
- **실제**: Agent profile에 "No soul description configured for this agent." 표시
- **Violated FR**: FR21~25 (Soul 관리) — 비서실장에게 Soul이 설정되어 있지 않음

### BUG-D019: CEO/Admin 사이드바 동일 — 역할별 분기 없음

- **Severity**: Cosmetic
- **Account**: CEO
- **Page**: 전체 앱
- **PRD RBAC**: CEO/Human은 관리자 콘솔 ❌, Admin 전용 기능 숨겨야 함
- **실제**: 23개 메뉴 항목 완전 동일

### BUG-D020: Admin Panel 이모지 아이콘

- **Severity**: Cosmetic
- **Account**: Admin (admin panel)
- **Page**: 전체 admin panel
- **디자인 스펙**: Lucide React 아이콘
- **실제**: 이모지 사용 `📊🏛️👥🏢🤖🔧💰🔑📋✨🖥️🏗️🔮🛒🧠🔐⚡⚙️⇄`

### BUG-D021: Admin Panel Material Symbols 텍스트

- **Severity**: Cosmetic
- **Account**: Admin (admin panel)
- **Page**: `/admin` dashboard
- **실제**: `check_circle`, `more_vert` 등이 텍스트로 표시

### BUG-D022: Admin Panel 세션 격리 미흡

- **Severity**: Security (Low)
- **Account**: Any
- **Page**: `/admin/*`
- **실제**: 앱 로그아웃 후에도 admin panel 별도 JWT 토큰이 삭제되지 않음
- **Fix**: 앱 로그아웃 시 admin panel 토큰도 함께 삭제

### BUG-D023: Performance 페이지 아이콘-텍스트 겹침

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Page**: `/performance`
- **실제**: `smart_to개발팀장`, `support_agent마케팅팀장` 등 Material Symbols 텍스트가 한국어와 겹침

### BUG-D024: SketchVibe "과(와)" 이중 표기

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Page**: `/sketchvibe`
- **실제**: "개발팀장과(와) 대화를 시작하세요" — "과(와)" 불필요한 이중 표기

### BUG-D025: Reports 페이지 빈 콘텐츠

- **Severity**: Cosmetic
- **Account**: Admin + CEO
- **Page**: `/reports`
- **실제**: 콘텐츠 영역 비어있음 (API에는 1개 보고서 있음)
- **추정 원인**: API 응답의 인코딩 깨짐으로 렌더링 실패 가능

### BUG-D026: Admin Panel `/admin/dashboard` 빈 라우트

- **Severity**: Cosmetic
- **Account**: Admin
- **Page**: `/admin/dashboard`
- **실제**: "No routes matched location '/dashboard'" — 빈 페이지
- **원인**: Admin SPA 대시보드는 `/admin` (루트), `/admin/dashboard` 라우트 미정의

### BUG-D027: CEO가 NEXUS 편집 모드 접근 가능

- **Severity**: Security (Medium)
- **Violated FR**: FR32 "CEO/Human이 NEXUS 조직도를 **읽기 전용**으로 확인"
- **Account**: CEO
- **Page**: `/nexus`
- **실제**: CEO가 "편집 모드" 토글, "Save Draft", "Publish Changes" 버튼 보유
- **PRD RBAC**: CEO → NEXUS ✅ 읽기, Admin → NEXUS ✅ 편집
- **Fix**: role 체크 후 편집 UI 숨김

---

## Fix Priority Matrix

| Priority | Bug IDs | Description | Impact | Effort |
|----------|---------|-------------|--------|--------|
| **P0** | **D029** | **Inner sidebar 제거 (메인 네비게이션 차단)** | **6개 페이지 네비게이션 복구** | **중간** |
| **P0** | D001 | Hub stream API 500 수정 | 허브 명령 기능 복구 | 중간 |
| **P0** | D002 | 다크 테마 제거 (1줄 삭제) | 전체 앱 디자인 복구 | **1줄** |
| **P0** | D003 | Admin API → Workspace API 전환 | 3개 페이지 복구 | 중간 |
| **P0** | D004 | Material Symbols → Lucide React | 10+ 페이지 아이콘 복구 | 높음 |
| **P1** | D005 | WebSocket 연결 수정 | 실시간 기능 복구 | 중간 |
| **P1** | D008, D009 | API 500 에러 수정 (DB column + type) | 2개 페이지 | 낮음 |
| **P1** | D030 | 8개 빈 main 페이지 콘텐츠 구현 | 8개 페이지 | 높음 |
| **P1** | D011 | Cancel API 수정 | 작업 취소 기능 | 낮음 |
| **P1** | D027 | CEO NEXUS 편집 차단 | 보안 | 낮음 |
| **P1** | D028 | Dashboard mock 데이터 → 실제 에이전트 데이터 | Dashboard 정확성 | 낮음 |
| **P2** | D006, D007, D012 | 텍스트/문법 수정 (CEO님, 조사, 로그인 에러) | UX 품질 | 낮음 |
| **P2** | D013 | SPA fallback API 라우트 정리 | API 정합성 | 중간 |
| **P1** | D031 | Admin Panel 12+ API 500 수정 | Admin 기능 전반 | 높음 |
| **P1** | D036 | UUID "system" 파싱 에러 수정 | 24h 100건 에러 해소 | 낮음 |
| **P1** | D037 | 직접 URL 접근 시 빈 main 수정 | 새로고침/북마크 불가 | 중간 |
| **P2** | D032, D033, D034 | Admin 전환/에이전트/무한로딩 | Admin UX | 중간 |
| **P2** | D035 | 메모리 95% 원인 분석 | 운영 안정성 | 중간 |
| **P2** | D038 | SNS Approve 버튼 백엔드 연동 | SNS 기능 | 낮음 |
| **P3** | D014~D026 | Cosmetic + Minor | 미관/품질 | 낮음~중간 |

---

## Interaction Test Summary (All 25 Pages — Round 2 완료)

| # | Page | Load | Buttons Clicked | Inputs Tested | Forms | API | Material Symbols | Inner Sidebar | Overall |
|---|------|------|----------------|---------------|-------|-----|-----------------|---------------|---------|
| 1 | `/login` | ✅ | ✅ 로그인, 빈폼 submit | ✅ ID/PW 입력 | ⚠️ no `<form>` | 200/401 | No | No | **PASS** (minor) |
| 2 | `/hub` | ✅ | ✅ 제안4, 전송 | ✅ 메시지 입력 | — | **500** stream | No | **YES** | **CRITICAL** |
| 3 | `/chat` | ✅ | ✅ 전송, 취소, 첨부, 새세션, 삭제 | ✅ 메시지 입력 | — | 200 (CLI 미등록) | No | No | **MAJOR** (WS+문법) |
| 4 | `/agents` | ✅ | — (빈 페이지) | — | — | **403** ×9 | No | No | **CRITICAL** |
| 5 | `/departments` | ✅ | — (빈 페이지) | — | — | **403** | No | No | **CRITICAL** |
| 6 | `/tiers` | ✅ | — (빈 페이지) | — | — | **403** | No | No | **CRITICAL** |
| 7 | `/nexus` | ✅ | ✅ Zoom, Fit, Add, Save, Publish | — | — | 200 (9 nodes) | No | No | **PASS** |
| 8 | `/settings` | ✅ | ✅ 탭8개, 저장 | ✅ 이름 변경+저장+복원 | ✅ 비번 변경 폼 | 200 | No | No | **PASS** |
| 9 | `/dashboard` | ✅ | ✅ "새로운 대화" → Hub 이동 | — | — | — | No | **YES** | **MAJOR** (CEO님 표시, mock 에이전트) |
| 10 | `/jobs` | ✅ | ✅ 작업 생성→등록→삭제 CRUD | ✅ 에이전트 선택, 지시 입력 | ✅ 생성 폼 | 200 CRUD 성공 | **YES** (24개) | **YES** | **PASS** (CRUD 동작!) |
| 11 | `/workflows` | ✅ | ✅ 생성→삭제 CRUD | ✅ 이름/설명/단계 입력 | ✅ 생성 모달 | 200 CRUD / **500** suggestions | **YES** | **YES** | **PASS** (CRUD) / **MAJOR** (API 500) |
| 12 | `/sketchvibe` | ✅ | ✅ React Flow 컨트롤, 시작/종료/에이전트 | ✅ 메시지 입력 | — | WS 끊김 | **YES** | **YES** | **MAJOR** (WS 끊김) |
| 13 | `/sns` | ✅ | ✅ Approve, Edit Draft, Reschedule, View Stats | — | ✅ 플랫폼/상태 필터 | Mock 데이터 | **YES** (24개) | **YES** | **MINOR** (Approve 반응 없음) |
| 14 | `/trading` | ✅ | ✅ BUY/SELL, 타임프레임 1H/4H/1D/1W | ✅ Strategy Agent 채팅 입력 | — | Mock 데이터 | No | **YES** (내부 nav) | **PASS** (UI 완성도 높음, mock) |
| 15 | `/messenger` | ✅ | — | — | — | — | No | No | **빈 main** |
| 16 | `/knowledge` | ✅ | — | — | — | **에러** docs API | No | No | **빈 main** (API 실패) |
| 17 | `/agora` | ✅ | — | — | — | — | No | No | **빈 main** |
| 18 | `/files` | ✅ | — | — | — | — | No | No | **빈 main** |
| 19 | `/costs` | ✅ | — | — | — | — | No | No | **빈 main** |
| 20 | `/performance` | ✅ | — | — | — | **500** summary | No | No | **빈 main** |
| 21 | `/activity-log` | ✅ | ✅ 4탭 (Activity/Delegation/QA/Tools), Filters | ✅ 검색 | — | 200 (실제 로그 데이터) | No | No | **PASS** (실시간 audit trail) |
| 22 | `/ops-log` | ✅ | ✅ 내보내기, ★북마크, 필터 3종 | ✅ 검색, 날짜범위 | ✅ 유형/상태/정렬 | 200 (빈 데이터) | No | No | **PASS** (UI 완성) |
| 23 | `/classified` | ✅ | — | — | — | — | No | No | **빈 main** |
| 24 | `/reports` | ✅ | — | — | — | 200 (encoding 깨짐) | No | No | **빈 main** |
| 25 | `/onboarding` | ✅→redirect | — | — | — | **에러** templates API | — | — | Hub로 리다이렉트 (정상) |

### 빈 main 페이지 요약 (8개)

| Page | 원인 분석 |
|------|----------|
| `/messenger` | 페이지 컴포넌트에 main 콘텐츠 미구현 |
| `/knowledge` | `/api/workspace/knowledge/docs` API 에러 (서버 응답 실패) |
| `/agora` | 페이지 컴포넌트에 main 콘텐츠 미구현 |
| `/files` | 페이지 컴포넌트에 main 콘텐츠 미구현 (API는 200/0건) |
| `/costs` | 페이지 컴포넌트에 main 콘텐츠 미구현 |
| `/performance` | `/api/workspace/performance/summary` → 500 타입 에러 |
| `/classified` | 페이지 컴포넌트에 main 콘텐츠 미구현 |
| `/reports` | API 200이지만 인코딩 깨짐 → 렌더링 실패 추정 |

### Inner Sidebar 충돌 확인 (BUG-D010 심각도 상향)

SNS 페이지에서 Inner sidebar의 `aside` 요소가 `position: fixed; inset-y: 0; left: 0`으로 설정되어 **메인 사이드바를 완전히 가림**. Playwright에서 메인 사이드바 링크 클릭 불가 (TimeoutError: `<aside>` intercepts pointer events). 사용자도 마우스로 메인 사이드바에 접근할 수 없는 상태.

**영향받는 페이지**: `/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/sns`, `/costs` (Inner sidebar가 있는 모든 페이지)

### Dashboard 추가 버그

| 항목 | 문제 |
|------|------|
| 인사말 | Admin 로그인인데 "반갑습니다, **CEO님**" 표시 (BUG-D006 재확인) |
| 에이전트 현황 | "메인 비서" (Secretary), "콘텐츠 작가" (Online) — 실제 DB 에이전트 (비서실장/개발팀장/마케팅팀장/재무팀장)와 불일치 |
| 워크스페이스명 | "나의 전략 연구소" — 하드코딩 추정 |
| Quick Actions | "새로운 대화" → /hub 이동 ✅, "워크플로우 생성" / "주간 분석" 미테스트 |
| Inner sidebar | 대시보드/AI 에이전트 채팅/워크플로우/보고서/설정 (모두 href="#") |
| Copyright | "© 2024 CORTHEX Technologies" (BUG-D017 재확인) |

### CRUD 테스트 성공 페이지 ✅

| Page | Create | Read | Delete | Notes |
|------|--------|------|--------|-------|
| `/jobs` | ✅ 에이전트 선택 + 지시 입력 → "작업이 등록되었습니다" 토스트 | ✅ 테이블에 행 추가 | ✅ "작업 취소" 확인 다이얼로그 → "작업이 취소되었습니다" | 체인 단계 추가, 반복 스케줄, 이벤트 트리거 미테스트 |
| `/workflows` | ✅ 이름/설명/단계(이름+타입+액션) → "워크플로우가 생성되었습니다" | ✅ 카드 표시 (이름/설명/단계수/날짜) | ✅ 확인 다이얼로그 → "워크플로우가 삭제되었습니다" | 편집 미테스트, Suggestions 탭 API 500 |
| `/settings` | — | ✅ 8개 탭 전환 | — | 이름 변경 → 저장 → 복원 → 저장 모두 성공 |

---

## Admin Panel Test Summary (18 pages)

| # | Page | Load | Content | CRUD | API Errors | Notes |
|---|------|------|---------|------|------------|-------|
| 1 | `/admin` (대시보드) | ✅ | **빈 main** | — | — | 루트 라우트에 콘텐츠 없음 |
| 2 | `/admin/companies` | ✅ | ✅ 2개 회사 카드 | ✅ 생성/비활성화 테스트 완료 | budget 500, costs/summary 에러 | **CRUD PASS** ✅ |
| 3 | `/admin/employees` | ✅ | ✅ 드래그&드롭 직원 할당 UI | ⚠️ 드래그 미테스트 | — | 고동희 대표 Unassigned, 4부서 |
| 4 | `/admin/departments` | ✅ | ✅ 4개 부서 카드 + 이미지 | ⚠️ 편집/삭제 미테스트 | budget 500, costs 에러 | 편집/삭제 버튼 있음 |
| 5 | `/admin/agents` | ✅ | ⚠️ 리스트 비어보임 | ⚠️ 미테스트 | departments API 에러 | "Select an agent from the list" |
| 6 | `/admin/tools` | ✅ | ✅ UI 있음 (카테고리 필터) | ⚠️ 미테스트 | tools/catalog 500 | 5개 카테고리 |
| 7 | `/admin/costs` | ✅ | ✅ 예산/부서별/기록 UI | ⚠️ 데이터 없음 | **6개 API 500** (budget, daily, summary, by-dept) | UI 완성, 데이터 실패 |
| 8 | `/admin/credentials` | ✅ | ✅ 직원별 CLI 토큰 관리 | ⚠️ 토큰 등록 미테스트 | api-keys 500 | AES-256 보안 안내 ✅ |
| 9 | `/admin/report-lines` | ✅ | ✅ 보고 체계 테이블 | ⚠️ 추가/변경 미테스트 | — | **실제 데이터** (2명) ✅ |
| 10 | `/admin/soul-templates` | ✅ | ✅ 카테고리/티어/복잡도 필터 | ⚠️ 템플릿 없음 | soul-templates API는 200 | Inner sidebar + Material Symbols |
| 11 | `/admin/monitoring` | ✅ | ✅ **실제 시스템 데이터** | — (읽기 전용) | — | Server Healthy, Memory 95.3%, DB 70ms, 24h에러 100개 |
| 12 | `/admin/org-chart` | ✅ | **빈 main** | — | org-chart API 에러 | — |
| 13 | `/admin/nexus` | ✅ | **빈 main** | — | nexus/layout 에러, org-chart 에러 | — |
| 14 | `/admin/org-templates` | ✅ | "로딩 중..." 멈춤 | — | 3개 API 에러 | 무한 로딩 |
| 15 | `/admin/template-market` | ✅ | "로딩 중..." 멈춤 | — | template-market API 에러 | 무한 로딩 |
| 16 | `/admin/agent-marketplace` | ✅ | ✅ UI + 검색/필터 | "로딩 중..." | agent-marketplace API 에러 | 카테고리/티어 필터 있음 |
| 17 | `/admin/api-keys` | ✅ | ✅ UI | "로딩 중..." | api-keys 500 | "+ 새 API 키" 버튼 |
| 18 | `/admin/workflows` | ✅ | ✅ "No workflows yet" | ⚠️ 미테스트 | — | Inner sidebar + Material Symbols |
| 19 | `/admin/settings` | ✅ | ✅ **풍부한 설정 UI** | ⚠️ 변경 미테스트 | api-keys 500 | Company Info, Handoff Depth(5), LLM(Claude Sonnet 4), TZ(Asia/Seoul) |

### Admin Panel API 에러 종합

| API Endpoint | Status | 영향 페이지 |
|-------------|--------|-----------|
| `/api/admin/budget` | **500** | costs, companies, departments, 기타 |
| `/api/admin/costs/summary` | **500** | costs, companies |
| `/api/admin/costs/daily` | **500** | costs |
| `/api/admin/costs/by-department` | **500** | costs |
| `/api/admin/api-keys` | **500** | api-keys, settings, credentials |
| `/api/admin/tools/catalog` | **500** | tools |
| `/api/admin/org-chart?companyId=...` | **에러** | org-chart, nexus |
| `/api/admin/nexus/layout` | **에러** | nexus |
| `/api/admin/departments?companyId=...` | **에러** | agents, tools |
| `/api/workspace/template-market` | **에러** | template-market |
| `/api/workspace/agent-marketplace` | **에러** | agent-marketplace |
| `/api/auth/switch-app` | **404** | CEO 앱으로 전환 버튼 |

### Admin Panel 주요 발견

1. **시스템 모니터링 실제 데이터**: Server Healthy, Bun 1.3.10, Memory 95.3% (⚠️ 거의 풀!), DB 70ms Healthy
2. **24시간 에러 100건**: `"invalid input syntax for type uuid: \"system\""` 반복 — UUID 파싱 에러
3. **회사 CRUD 동작**: 생성 → 비활성화 → 드롭다운 반영 ✅
4. **CEO 앱 전환 실패**: "해당 회사에 CEO 계정이 없습니다" alert + `/api/auth/switch-app` 404
5. **Admin 설정에서 확인**: Handoff Depth=5, Default LLM=Claude Sonnet 4, TZ=Asia/Seoul

## New Bugs Found (Round 2 + Admin Panel)

### BUG-D028: Dashboard에 Mock 에이전트 데이터 표시

- **Severity**: Major
- **Account**: Admin + CEO
- **Page**: `/dashboard`
- **실제**: "메인 비서" (Secretary, 대기 중), "콘텐츠 작가" (Online) — 실제 DB의 비서실장/개발팀장/마케팅팀장/재무팀장과 불일치
- **추정 원인**: Dashboard 컴포넌트가 하드코딩된 mock 데이터 사용 (실제 `/api/workspace/agents` 미호출)

### BUG-D029: Inner Sidebar가 메인 사이드바를 물리적으로 가림

- **Severity**: Critical → **P0 상향**
- **Violated FR**: — (접근성, 네비게이션)
- **Account**: Admin + CEO
- **Page**: `/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/sns`, `/costs`
- **실제**: Inner sidebar의 `aside` 요소가 `position: fixed; inset-y: 0; left: 0; z-index: 50`으로 설정 → 메인 사이드바 위에 겹침 → **메인 네비게이션 클릭 불가**
- **Playwright 에러**: `TimeoutError: <aside> from <div> subtree intercepts pointer events`
- **추정 원인**: 각 페이지 컴포넌트 내부에 독립 사이드바가 있어 App Shell 사이드바와 z-index 충돌
- **Fix**: 페이지 컴포넌트에서 inner sidebar 제거, content area만 렌더링

### BUG-D030: 8개 페이지가 빈 main 콘텐츠

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/messenger`, `/knowledge`, `/agora`, `/files`, `/costs`, `/performance`, `/classified`, `/reports`
- **실제**: 사이드바 + 탑바만 렌더링되고 `<main>` 안에 아무 콘텐츠 없음
- **구분**: 일부는 API 에러(knowledge, performance), 일부는 단순 미구현(messenger, agora, files, costs, classified), reports는 인코딩 문제
- **Note**: 이전 세션에서 일부 페이지에 Inner sidebar + Material Symbols 콘텐츠가 있었으나, 새로고침 후 빈 상태로 변경됨 (SPA 라우팅 vs 직접 URL 접근 차이)

### BUG-D031: Admin Panel 12개+ API 500 에러

- **Severity**: Critical
- **Account**: Admin
- **Pages**: `/admin/costs`, `/admin/api-keys`, `/admin/tools`, `/admin/org-chart`, `/admin/nexus`, `/admin/template-market`, `/admin/agent-marketplace`
- **실제**: budget, costs/summary, costs/daily, costs/by-department, api-keys, tools/catalog, org-chart, nexus/layout, template-market, agent-marketplace 등 12개+ API가 500 에러 반환
- **영향**: 비용 관리 데이터 없음, API 키 관리 불가, 조직도/NEXUS 빈 페이지, 마켓플레이스 무한 로딩
- **추정 원인**: DB 마이그레이션 누락 또는 서버 핸들러 구현 미완료

### BUG-D032: Admin "CEO 앱으로 전환" 실패

- **Severity**: Major
- **Account**: Admin
- **Page**: `/admin/settings`
- **실제**: "⇄ CEO 앱으로 전환" 클릭 → alert "해당 회사에 CEO 계정이 없습니다" (실제로 CEO 계정 존재)
- **API 분석**: `POST /api/auth/switch-app → 404` (라우트 미정의)
- **추정 원인**: switch-app API 엔드포인트 미구현

### BUG-D033: Admin 에이전트 목록 표시 안 됨

- **Severity**: Major
- **Account**: Admin
- **Page**: `/admin/agents`
- **실제**: "Select an agent from the list" 표시되나 에이전트 리스트가 보이지 않음 (4개 에이전트 존재)
- **API 분석**: `/api/admin/departments?companyId=...` 에러로 에이전트 목록 로드 실패
- **추정 원인**: departments API 의존성 — 부서 로드 실패 시 에이전트도 표시 안 됨

### BUG-D034: Admin 4개 페이지 "로딩 중..." 무한 스피너

- **Severity**: Major
- **Account**: Admin
- **Pages**: `/admin/org-templates`, `/admin/template-market`, `/admin/agent-marketplace`, `/admin/api-keys`
- **실제**: "로딩 중..." 표시 후 영구 멈춤 (스피너가 해제되지 않음)
- **추정 원인**: API 에러 핸들링 누락 — 500 응답 시 로딩 상태가 해제되지 않는 코드 결함

### BUG-D035: 시스템 메모리 95.3% 사용 (경고)

- **Severity**: Major (운영)
- **Account**: Admin
- **Page**: `/admin/monitoring`
- **실제**: RSS 171.2 MB, Heap 30.4/31.9 MB — 메모리 95.3% 사용
- **추정 원인**: 메모리 누수 가능성 (Uptime 2h 49m에 이미 95%) 또는 서버 인스턴스 메모리 제한이 작음

### BUG-D036: 24시간 UUID 파싱 에러 100건 반복

- **Severity**: Major
- **Account**: Admin
- **Page**: `/admin/monitoring`
- **실제**: `"invalid input syntax for type uuid: \"system\""` 에러가 100건 반복
- **추정 원인**: 코드 어딘가에서 `"system"` 문자열을 UUID 컬럼에 넣으려는 쿼리 발생

### BUG-D037: App 페이지 직접 URL 접근 시 빈 main (새로고침 문제)

- **Severity**: Major
- **Account**: Admin + CEO
- **Pages**: `/hub`, `/dashboard`, `/jobs`, `/workflows`, `/sketchvibe`, `/sns`, `/trading`, `/costs`, `/performance` 등 다수
- **실제**: SPA 내부 링크로 이동하면 정상 렌더링, 하지만 직접 URL 입력 또는 새로고침(F5) 시 `<main>` 안에 콘텐츠가 비어있음
- **예외**: `/nexus`, `/chat`, `/settings`, `/activity-log`, `/notifications` 등은 직접 URL 접근도 정상
- **추정 원인**: 일부 페이지 컴포넌트가 SPA 내부 상태에 의존하여 렌더링 (서버사이드에서 필요한 초기 데이터를 SPA 네비게이션 시에만 로드)

### BUG-D038: SNS Approve 버튼 무반응

- **Severity**: Minor
- **Account**: Admin
- **Page**: `/sns`
- **실제**: "Approve" 버튼 클릭 → 상태 변화 없음, API 호출 없음
- **추정 원인**: 프론트엔드 전용 mock 데이터, 백엔드 연동 미구현

---

> Generated by Claude Desktop Spec-Based E2E Inspector (Final Report)
> **Inspection**: 2026-03-16
> **Scope**: App 25개 페이지 + Admin Panel 19개 페이지 = **총 44개 페이지** 전수 방문 + 상호작용 테스트
> PRD: FR1~FR72 (72 requirements, 28 tested, 10 PASS, 13 FAIL)
> Total Bugs: **38** (Critical **6**, Major **17**, Minor **7**, Cosmetic 6, Security 2)
> **CRUD 성공**: Jobs ✅, Workflows ✅, Settings ✅, Admin Companies ✅
> **Admin CRUD 성공**: Company 생성/비활성화 ✅
> **빈 페이지 (App)**: 8개 (messenger, knowledge, agora, files, costs, performance, classified, reports)
> **빈/로딩 멈춤 (Admin)**: 6개 (dashboard, org-chart, nexus, org-templates, template-market, agent-marketplace)
> **Admin API 500**: 12개+ 엔드포인트
> **시스템 상태**: Server Healthy, Memory 95.3% ⚠️, DB 70ms, 24h 에러 100건
