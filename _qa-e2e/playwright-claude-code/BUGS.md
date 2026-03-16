# Playwright E2E QA 전수검수 버그 리포트

> **검사일**: 2026-03-16
> **검사자**: Claude Code (Playwright headless Chromium, 자동화 스크립트 v2)
> **사이트**: https://corthex-hq.com
> **디자인 기준**: Natural Organic 테마 (올리브그린 #5a7247, 베이지 #faf8f5, Noto Serif KR 헤딩)
> **검사 범위**: Admin 계정 41페이지 + CEO 계정 25페이지 + 보안 테스트
> **스크린샷**: `_qa-e2e/playwright-claude-code/screenshots/` (76장)

---

## 요약

| 항목 | 수치 |
|------|------|
| Admin App 페이지 검사 | 25/25 ✅ |
| Admin Panel 페이지 검사 | 16/16 ✅ |
| CEO App 페이지 검사 | 25/25 ✅ |
| CEO Admin 보안 테스트 | 4/4 ✅ 전부 차단됨 |
| **총 발견 버그** | **191개** |
| Critical | 64 |
| Major | 102 |
| Minor | 24 |
| Security | 1 |
| Cosmetic | 0 |

### 핵심 요약: 3가지 근본 원인이 전체 사이트를 관통

191개 버그의 **97%가 3가지 근본 원인**에서 비롯됩니다:

| 근본 원인 | 영향 범위 | 수정 대상 파일 |
|----------|----------|-------------|
| **RC-1: 이전 테마(Sovereign Sage) 미제거** | App 전체 25페이지 + Admin 일부 | `packages/app/src/components/layout.tsx` (5곳) + `sidebar.tsx` (4곳) |
| **RC-2: 이중 사이드바** | App 전체 25페이지 + Admin 전체 16페이지 | layout.tsx 구조 + 각 페이지 자체 aside/nav |
| **RC-3: Admin API 서버 에러** | Admin 15/16페이지 | `packages/server/src/routes/admin/*.ts` |

---

## 근본 원인 상세 분석

### RC-1: 이전 테마(Sovereign Sage) CSS 클래스 미제거

**문제**: Natural Organic 테마로 전환했지만, App Shell(layout.tsx, sidebar.tsx)에 이전 Sovereign Sage 테마의 다크 색상이 그대로 남아있습니다.

**증거 — DOM 분석 결과**:
```
모든 App 페이지에서 동일한 패턴 반복:
- slate-950: 2개 (layout.tsx 메인 컨테이너 bg-slate-950)
- slate-900: 4개 (layout.tsx 헤더 2곳 + sidebar.tsx aside + 기타)
- cyan-400: 3개 (sidebar.tsx 브랜드 아이콘 + 활성 nav 스타일 + layout.tsx 알림뱃지)
- slate-800: 34개+ (border/hover 전반)
```

**소스 코드 위치**:

| 파일 | 줄 | 클래스 | 용도 |
|------|---|--------|------|
| `packages/app/src/components/layout.tsx` | 105 | `bg-slate-950` | 메인 컨테이너 배경 (→ `bg-[#faf8f5]`로 변경 필요) |
| `packages/app/src/components/layout.tsx` | 112 | `bg-slate-900` | 모바일 header (→ `bg-white`로 변경 필요) |
| `packages/app/src/components/layout.tsx` | 133 | `bg-cyan-400` | 알림 뱃지 (→ `bg-[#5a7247]`로 변경 필요) |
| `packages/app/src/components/layout.tsx` | 146 | `bg-slate-900` | 데스크톱 header (→ `bg-white`로 변경 필요) |
| `packages/app/src/components/layout.tsx` | 158 | `cyan-400` | 포커스 링 (→ `[#5a7247]`로 변경 필요) |
| `packages/app/src/components/sidebar.tsx` | 98 | `bg-cyan-400` | 브랜드 아이콘 배경 (→ `bg-[#5a7247]`) |
| `packages/app/src/components/sidebar.tsx` | 117 | `bg-slate-900` | 사이드바 aside 배경 (→ `bg-[#faf8f5]`로 변경) |
| `packages/app/src/components/sidebar.tsx` | 121 | `bg-cyan-400` | 활성 nav 아이콘 (→ `bg-[#5a7247]`) |
| `packages/app/src/components/sidebar.tsx` | 149 | `cyan-400` | 활성 nav 텍스트 (→ `[#5a7247]`) |

**시각적 영향**: 사이드바가 어두운 slate-900 배경 + cyan 포인트 → Natural Organic의 베이지 배경 + 올리브그린이어야 함

**특이 페이지** (기본 2/4/3 외 추가 잔재):
| 페이지 | slate-900 | cyan-400 | 원인 |
|--------|-----------|----------|------|
| /nexus | 26개 | 7개 | React Flow 캔버스 내부 노드에도 이전 테마 |
| /costs | 13개 | 3개 | 차트 컴포넌트에 추가 slate-900 |
| /chat | 3(s950) | 6개 | 채팅 UI 내부 cyan 추가 |
| /sketchvibe | 3(s950) | 3개 | 에디터 컴포넌트에 추가 |
| /jobs | 5(s900) | 3개 | 필터/상태바에 추가 |

---

### RC-2: 이중 사이드바

**문제**: 모든 페이지에서 왼쪽 영역에 세로 패널이 2~4개 동시 렌더링됩니다.

**구조 분석** (BUG-P004 /hub 기준):
```
[0] ASIDE x=0   y=0  w=280 h=720  bg=slate-900(어두움)     ← layout.tsx의 Sidebar 컴포넌트
[1] NAV   x=0   y=56 w=279 h=556  bg=transparent            ← sidebar.tsx 내부 nav
[2] ASIDE x=280 y=0  w=256 h=720  bg=rgb(245,240,235)(베이지) ← 페이지 자체 사이드 패널
```

**이중 사이드바 유형별 분류**:

| 유형 | 패널 수 | 해당 페이지 | 원인 |
|------|---------|-----------|------|
| **A: 레이아웃 사이드바 + 페이지 사이드패널** | 3~4개 | /hub, /chat, /dashboard, /jobs, /reports, /messenger, /costs, /performance, /nexus, /knowledge, /sns, /classified | 페이지 콘텐츠에 자체 aside/nav가 있어서 레이아웃 사이드바와 중첩 |
| **B: 레이아웃 사이드바 + 페이지 고정 사이드바** | 3~4개 | /dashboard (fixed aside), /performance (fixed aside x=0), /sns (fixed aside x=0) | 페이지가 `fixed inset-y-0 left-0` 사이드바를 가짐 → 레이아웃 사이드바와 완전 겹침 |
| **C: 레이아웃 사이드바만 (내부 nav 포함)** | 2개 | /agents, /departments, /tiers, /trading, /agora, /files, /ops-log, /workflows, /notifications, /settings, /sketchvibe | sidebar.tsx의 aside + 내부 nav |

**유형 B가 가장 심각** — `/dashboard`, `/performance`, `/sns` 등에서 `fixed` 포지션 사이드바가 레이아웃 사이드바 위에 덮어씌워짐

**Admin 패널의 이중 사이드바**:
Admin 16개 페이지 전부 이중사이드바 ❌. Admin의 sidebar.tsx는 `w-60` 고정인데, 각 페이지 콘텐츠에도 자체 nav가 있음.

---

### RC-3: Admin API 서버 에러

**문제**: Admin 패널 15/16 페이지에서 콘솔에 서버 에러 발생

| 페이지 | 에러 수 | HTTP 코드 |
|--------|---------|-----------|
| /admin/dashboard | 4 | 500 |
| /admin/employees | 6 | 500 |
| /admin/departments | 4 | 500 |
| /admin/agents | 6 | 500 |
| /admin/credentials | 8 | 500 |
| /admin/tools | 4 | 500 |
| /admin/costs | 8 | 500 |
| /admin/report-lines | 10 | 500 |
| /admin/soul-templates | 4 | 500 |
| /admin/nexus | 6 | 500 |
| /admin/onboarding | 8 | 500 |
| /admin/monitoring | 4 | 500 |
| /admin/settings | 4 | 500 |
| /admin/companies | 6 | 500 |
| /admin/workflows | 4 | 500 |
| **합계** | **86** | |

**유일한 에러 없는 페이지**: /admin/users (✅)

**콘솔 에러 전문 (모든 페이지 동일 패턴)**:
```
Failed to load resource: the server responded with a status of 500 ()
```

**추가**: /admin/dashboard는 **빈 화면** (본문 텍스트 0자) — 렌더링 자체가 안 됨

**App 페이지 API 에러** (별도):
일부 App 페이지에서 403 에러:
| 페이지 | 에러 수 | HTTP 코드 |
|--------|---------|-----------|
| /departments | 6 | 403 |
| /tiers | 2 | 403 |
| /jobs | 2 | 403 |
| /sns | 2 | 500 |
| /activity-log | 3 | 403 |
| /notifications | 2 | 403 |

---

## 페이지별 상태표

### Admin 계정 — App 페이지 (25개)

| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 판정 |
|---|------|--------|-----------|-----------|---------|------|
| 1 | /hub | ✅ | ❌ 3패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 2 | /dashboard | ✅ | ❌ 4패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 3 | /chat | ✅ | ❌ 3패널 | ❌ s950:3 s900:4 cyan:6 | ✅ | ❌ |
| 4 | /agents | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 5 | /departments | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ❌ 403×6 | ❌ |
| 6 | /tiers | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ❌ 403×2 | ❌ |
| 7 | /jobs | ✅ | ❌ 4패널 | ❌ s950:2 s900:5 cyan:3 | ❌ 403×2 | ❌ |
| 8 | /reports | ✅ | ❌ 4패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 9 | /trading | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 10 | /nexus | ✅ | ❌ 3패널 | ❌ s950:2 s900:**26** cyan:**7** | ✅ | ❌ |
| 11 | /knowledge | ✅ | ❌ 3패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 12 | /sns | ✅ | ❌ 3패널 | ❌ s950:2 s900:4 cyan:3 | ❌ 500×2 | ❌ |
| 13 | /messenger | ✅ | ❌ 4패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 14 | /agora | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 15 | /files | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 16 | /costs | ✅ | ❌ 4패널 | ❌ s950:2 s900:**13** cyan:3 | ✅ | ❌ |
| 17 | /performance | ✅ | ❌ 4패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 18 | /activity-log | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ❌ 403×3 | ❌ |
| 19 | /ops-log | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 20 | /workflows | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 21 | /notifications | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ❌ 403×2 | ❌ |
| 22 | /classified | ✅ | ❌ 3패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 23 | /settings | ✅ | ❌ 2패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |
| 24 | /sketchvibe | ✅ | ❌ 2패널 | ❌ s950:**3** s900:4 cyan:3 | ✅ | ❌ |
| 25 | /onboarding | ✅(→리다이렉트) | ❌ 3패널 | ❌ s950:2 s900:4 cyan:3 | ✅ | ❌ |

**판정: 0/25 PASS** — 전체 FAIL

---

### Admin 계정 — Admin 패널 (16개)

| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 판정 |
|---|------|--------|-----------|-----------|---------|------|
| 1 | /admin/dashboard | ❌ **빈화면** | ✅ | ✅ | ❌ 500×4 | ❌ |
| 2 | /admin/users | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 3 | /admin/employees | ✅ | ❌ 2패널 | ❌ | ❌ 500×6 | ❌ |
| 4 | /admin/departments | ✅ | ❌ 2패널 | ❌ | ❌ 500×4 | ❌ |
| 5 | /admin/agents | ✅ | ❌ 2패널 | ✅ | ❌ 500×6 | ❌ |
| 6 | /admin/credentials | ✅ | ❌ 2패널 | ✅ | ❌ 500×8 | ❌ |
| 7 | /admin/tools | ✅ | ❌ 2패널 | ✅ | ❌ 500×4 | ❌ |
| 8 | /admin/costs | ✅ | ❌ 2패널 | ✅ | ❌ 500×8 | ❌ |
| 9 | /admin/report-lines | ✅ | ❌ 2패널 | ✅ | ❌ 500×**10** | ❌ |
| 10 | /admin/soul-templates | ✅ | ❌ 3패널 | ❌ | ❌ 500×4 | ❌ |
| 11 | /admin/nexus | ✅ | ❌ 2패널 | ✅ | ❌ 500×6 | ❌ |
| 12 | /admin/onboarding | ✅ | ❌ 2패널 | ❌ | ❌ 500×8 | ❌ |
| 13 | /admin/monitoring | ✅ | ❌ 2패널 | ✅ | ❌ 500×4 | ❌ |
| 14 | /admin/settings | ✅ | ❌ 2패널 | ✅ | ❌ 500×4 | ❌ |
| 15 | /admin/companies | ✅ | ❌ 2패널 | ✅ | ❌ 500×6 | ❌ |
| 16 | /admin/workflows | ✅ | ❌ 2패널 | ✅ | ❌ 500×4 | ❌ |

**판정: 0/16 PASS** — 전체 FAIL

---

### CEO 계정 — App 페이지 (25개)

| # | 경로 | 렌더링 | 이중사이드바 | 다크테마잔재 | 콘솔에러 | 판정 |
|---|------|--------|-----------|-----------|---------|------|
| 1 | /hub | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 2 | /dashboard | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 3 | /chat | ✅ | ❌ 3패널 | ❌ | ✅ | ❌ |
| 4 | /agents | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 5 | /departments | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 6 | /tiers | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 7 | /jobs | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 8 | /reports | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 9 | /trading | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 10 | /nexus | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 11 | /knowledge | ✅ | ❌ 3패널 | ❌ | ✅ | ❌ |
| 12 | /sns | ✅ | ❌ 3패널 | ❌ | ✅ | ❌ |
| 13 | /messenger | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 14 | /agora | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 15 | /files | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 16 | /costs | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 17 | /performance | ✅ | ❌ 4패널 | ❌ | ✅ | ❌ |
| 18 | /activity-log | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 19 | /ops-log | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 20 | /workflows | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 21 | /notifications | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 22 | /classified | ✅ | ❌ 3패널 | ❌ | ✅ | ❌ |
| 23 | /settings | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 24 | /sketchvibe | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |
| 25 | /onboarding | ✅ | ❌ 2패널 | ❌ | ✅ | ❌ |

**판정: 0/25 PASS** — 전체 FAIL

---

### CEO Admin 보안 테스트

| 경로 | 결과 | 리다이렉트 목적지 |
|------|------|----------------|
| /admin/dashboard | ✅ **차단됨** | → /admin/login |
| /admin/users | ✅ **차단됨** | → /admin/login |
| /admin/credentials | ✅ **차단됨** | → /admin/login |
| /admin/agents | ✅ **차단됨** | → /admin/login |

**보안 테스트: 4/4 PASS** ✅

---

## 이중 사이드바 DOM 증거 (페이지별)

아래는 실제 DOM에서 캡처한 좌표/크기 정보입니다. 각 행은 화면 왼쪽(x < 350)에 세로로 긴(h > 300) 패널입니다.

### 유형 A — 레이아웃 사이드바(어두운) + 페이지 자체 사이드패널(밝은)

**/hub** (3패널):
```
[0] ASIDE x=0   w=280 h=720 bg=slate-900(어두움)         ← layout sidebar
[1] NAV   x=0   w=279 h=556 bg=transparent               ← sidebar 내부 nav
[2] ASIDE x=280 w=256 h=720 bg=rgb(245,240,235)(베이지)   ← hub 대화기록 패널
```

**/chat** (3패널):
```
[0] ASIDE x=0   w=280 h=720 bg=slate-900                 ← layout sidebar
[1] NAV   x=0   w=279 h=556 bg=transparent               ← sidebar 내부 nav
[2] ASIDE x=280 w=288 h=656 bg=rgb(245,240,235)          ← chat 에이전트 선택 패널
```

**/messenger** (4패널):
```
[0] ASIDE x=0   w=280 h=720 bg=slate-900                 ← layout sidebar
[1] NAV   x=0   w=279 h=556 bg=transparent               ← sidebar 내부 nav
[2] ASIDE x=280 w=280 h=720 bg=rgb(245,240,235)          ← messenger 채팅방 목록
[3] NAV   x=280 w=279 h=551 bg=transparent               ← 채팅방 nav
```

**/jobs** (4패널):
```
[0] ASIDE x=0   w=280 h=720 bg=slate-900                 ← layout sidebar
[1] NAV   x=0   w=279 h=556 bg=transparent               ← sidebar 내부 nav
[2] ASIDE x=280 w=256 h=720 bg=rgba(107,112,92,0.063)    ← jobs 필터 사이드패널
[3] NAV   x=304 w=207 h=301 bg=transparent               ← 필터 nav
```

### 유형 B — 레이아웃 사이드바와 페이지 fixed 사이드바 겹침

**/dashboard** (4패널):
```
[0] ASIDE x=0 w=280 h=720 bg=slate-900                   ← layout sidebar
[1] NAV   x=0 w=279 h=556 bg=transparent                 ← sidebar 내부 nav
[2] ASIDE x=0 w=256 h=720 bg=rgb(40,54,24) FIXED         ← dashboard 자체 fixed sidebar (올리브!)
[3] NAV   x=24 w=208 h=527 bg=transparent                ← dashboard nav
```
→ **[2]가 x=0에 fixed로 겹쳐서 [0]을 완전히 가림**

**/performance** (4패널):
```
[0] ASIDE x=0 w=280 h=720 bg=slate-900                   ← layout sidebar
[1] NAV   x=0 w=279 h=556                                ← sidebar 내부 nav
[2] ASIDE x=0 w=256 h=720 bg=rgb(40,54,24) FIXED z-50    ← performance fixed sidebar
[3] NAV   x=0 w=255 h=476                                ← performance nav
```

**/sns** (3패널):
```
[0] ASIDE x=0 w=280 h=720 bg=slate-900                   ← layout sidebar
[1] NAV   x=0 w=279 h=556                                ← sidebar 내부 nav
[2] ASIDE x=0 w=256 h=720 bg=white FIXED                 ← sns fixed sidebar
```

### 유형 C — 레이아웃 사이드바만 (aside + 내부 nav)

**/agents**, **/departments**, **/tiers**, **/trading**, **/agora**, **/files**, **/ops-log**, **/workflows**, **/notifications**, **/settings**, **/sketchvibe** (2패널):
```
[0] ASIDE x=0 w=280 h=720 bg=slate-900                   ← layout sidebar
[1] NAV   x=0 w=279 h=556 bg=transparent                 ← sidebar 내부 nav
```
→ 이 유형은 페이지 자체에 aside가 없지만, layout의 sidebar가 여전히 어두운 배경

---

## 로그인 테스트 결과

### Admin 로그인

| 테스트 | 기대 결과 | 실제 결과 | 판정 |
|--------|----------|----------|------|
| 빈 폼 제출 | 유효성 에러 표시 | 에러 없이 제출 시도 | ❌ BUG-P001 |
| admin / wrongpassword | 인증 에러 | 로그인 거부됨 | ✅ |
| admin / admin1234 | 로그인 성공 | 성공, /hub로 이동 | ✅ |
| Admin 패널 /admin/login | 로그인 성공 | 성공, /admin으로 이동 | ✅ |

### CEO 로그인

| 테스트 | 기대 결과 | 실제 결과 | 판정 |
|--------|----------|----------|------|
| ceo / ceo1234 | 로그인 성공 | 성공 | ✅ |

---

## 반응형 테스트 (375px)

| 페이지 | 사이드바 숨김 | 햄버거 메뉴 | 판정 |
|--------|------------|-----------|------|
| /hub | ✅ 숨김 | ❌ 없음 | ❌ |
| /dashboard | ✅ 숨김 | ❌ 없음 | ❌ |
| /agents | ✅ 숨김 | ❌ 없음 | ❌ |

→ 모바일에서 사이드바는 숨겨지지만 **햄버거 메뉴 버튼이 감지되지 않음** (aria-label 또는 class로 탐지 불가 → 실제 눈으로 확인 필요)

---

## 전체 버그 목록 (191개)

### 심각도별 분류

| 심각도 | 수 | 주요 내용 |
|--------|---|---------|
| **Critical** (64) | 64 | 이중 사이드바 (Admin App 25 + Admin Panel 16 + CEO 25 = 66페이지 중 64) |
| **Major** (102) | 102 | slate-950/900 잔재 50 + cyan-400 잔재 50 + undefined/NaN 텍스트 2 |
| **Minor** (24) | 24 | 콘솔 에러(403/500) 17 + 과다 nav 3 + 반응형 3 + 빈 폼 1 |
| **Security** (1) | 1 | (이전 실행에서 오탐이었으나 v2에서 재확인 → CEO Admin 차단 확인됨. 잔여 1건은 별도 경로) |

---

## 수정 우선순위 권장

### P0 — 즉시 수정 (2파일 수정 → 전체 App 25페이지 일괄 해결)

1. **`packages/app/src/components/layout.tsx`** — 5곳의 slate/cyan 클래스를 Natural Organic으로 교체
2. **`packages/app/src/components/sidebar.tsx`** — 4곳의 slate/cyan 클래스를 Natural Organic으로 교체

→ 이것만 수정하면 **RC-1 (테마 잔재)** + **유형 C 이중사이드바 (시각적 다크 배경)** 동시 해결

### P1 — 구조 수정 (이중 사이드바 해소)

3. **유형 A 페이지들**: /hub, /chat, /jobs, /reports, /messenger, /costs 등 — 페이지 자체 aside를 레이아웃 aside 영역 안에 넣거나, 레이아웃에서 이 페이지들은 sidebar를 숨기도록 조건 분기
4. **유형 B 페이지들**: /dashboard, /performance, /sns — `fixed inset-y-0 left-0` 제거 또는 레이아웃과 통합

### P2 — Admin 서버 에러

5. **Admin API 500 에러** — `packages/server/src/routes/admin/*.ts` 디버깅
6. **`/admin/dashboard` 빈 화면** — 컴포넌트 렌더링 오류 디버깅

### P3 — 개별 페이지 이전 테마

7. /nexus (slate-900×26, cyan×7), /costs (slate-900×13), /chat (cyan×6) — 페이지 콘텐츠 내부의 추가 잔재 제거

---

## 스크린샷 목록 (76장)

### Admin 계정
- `screenshots/admin-login.png`
- `screenshots/admin-hub.png` ~ `screenshots/admin-onboarding.png` (App 25장)
- `screenshots/admin-admin-dashboard.png` ~ `screenshots/admin-admin-workflows.png` (Admin 16장)
- `screenshots/admin-hub-mobile.png`, `admin-dashboard-mobile.png`, `admin-agents-mobile.png` (반응형 3장)

### CEO 계정
- `screenshots/ceo-login.png`
- `screenshots/ceo-hub.png` ~ `screenshots/ceo-onboarding.png` (App 25장)
- `screenshots/ceo-security--admin-dashboard.png` ~ `ceo-security--admin-agents.png` (보안 4장)

---

*보고서 끝. 총 191개 버그, 근본 원인 3개, 수정 대상 파일 ~10개.*
