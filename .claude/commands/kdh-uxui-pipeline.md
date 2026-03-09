---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인 v6. Claude 직접 디자인 + 코딩 + 3라운드 파티모드 + Playwright QA. Usage: /kdh-uxui-pipeline [phase0|phase1|design PAGENAME|design-batch PRIORITY|code PAGENAME|code-batch PRIORITY|phase3|final]'
---

# CORTHEX UXUI Refactoring Pipeline v6

**Claude가 직접 디자인 + 코딩.** 외부 도구(Lovable/v0) 의존 제로.
기능, 비전, 아키텍처, UX를 모두 고려한 전문적 디자인 스펙 → 코드 구현.
3라운드 파티모드 + Playwright QA. tmux Worker가 실제 작업 수행.

---

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `design PAGENAME`: 해당 페이지 디자인 스펙 생성
- `design-batch PRIORITY`: 해당 우선순위 전체 디자인 스펙 생성
- `code PAGENAME`: 디자인 스펙 기반 코드 리팩토링 + 파티모드 3라운드 + Playwright
- `code-batch PRIORITY`: 해당 우선순위 전체 리팩토링 일괄 실행
- `phase3`: 시각 회귀 테스트 기준 이미지 등록
- `final`: 최종 전체 검증
- 인자 없음: 진행 상황 표시 + 다음 작업 안내

---

## 핵심 원칙

### Claude = 디자인 + 코딩 전부 직접 수행

이전 v5는 Lovable에게 디자인을 위임했다. v6는 **Claude가 직접 디자인**한다.

**Claude가 결정하는 것:**
- 레이아웃 구조 (sidebar, header, grid, flex 등)
- 색상 팔레트, 다크/라이트 모드
- 타이포그래피 (font family, size scale, weight)
- 간격 시스템 (spacing, padding, margin)
- 컴포넌트 디자인 (카드, 모달, 테이블, 폼 등)
- 시각적 위계, 정보 밀도
- 애니메이션, 마이크로 인터랙션
- 반응형 브레이크포인트, 모바일 적응
- 아이콘 시스템, 상태 표현 (loading, error, empty, success)

**디자인 시 반드시 고려하는 것:**
1. **기능 (Functionality)**: 이 페이지가 실제로 하는 일, API 호출, 상태관리
2. **비전 (Vision)**: CORTHEX는 AI 에이전트 기반 기업 운영 플랫폼 — 프로페셔널하고 현대적
3. **아키텍처 (Architecture)**: 모노레포 구조, 공유 컴포넌트, 라우팅
4. **UX 패턴 (UX)**: 정보 위계, 사용자 흐름, 접근성, 일관성
5. **기존 디자인 시스템**: Tailwind CSS, 현재 사용 중인 컴포넌트/클래스 패턴 분석

### 기능 로직 불변

- API 호출, 상태관리, 이벤트 핸들러 100% 유지
- UI/레이아웃/스타일/Tailwind 클래스만 변경
- v2 백엔드에 **현재 존재하는** 기능만 반영 (v1 스펙 직접 참조 금지)

### 모든 산출물은 구체적이고 자세하게 (CRITICAL)

**디자인 스펙이든 코드든, 모든 스텝의 산출물은 반드시 구체적이고 자세하게 작성할 것.**
- 색상: hex 코드까지 명시 (e.g., `bg-slate-900 (#0f172a)`)
- 레이아웃: 정확한 Tailwind 클래스 (e.g., `grid grid-cols-12 gap-6`)
- 타이포: 정확한 크기/굵기 (e.g., `text-2xl font-bold tracking-tight`)
- 간격: 정확한 값 (e.g., `p-6 space-y-4`)
- 컴포넌트: 전체 JSX 구조 + Tailwind 클래스 포함
- 상태: loading skeleton, error alert, empty state 전부 구체적 디자인
- 반응형: 각 브레이크포인트별 변화 명시
- 영어로 작성해도 됨 — 구체성이 최우선

---

## 작업 환경

```
이 PC (VS Code) 한 곳에서 전부 진행 — 외부 도구 없음

오케스트레이터 (메인 Claude Code)
  → 팀 생성, Worker 스폰, 스텝 지시, 커밋+푸시
  → 문서 작성/코딩 직접 안 함

Worker (tmux 안의 Claude Code)
  → 디자인 스펙 작성, 코드 리팩토링, 파티모드 3라운드, 테스트 작성
  → 사용자가 tmux에서 실시간 관찰 가능

Playwright (headless)
  → 스모크 테스트 + 인터랙션 테스트

테스트 대상: 배포 사이트 (https://corthex-hq.com)
```

---

## 전체 흐름

```
[Phase 0] Playwright 환경 세팅 (1회)
    ↓
[Phase 1] 현재 기능 상태 점검 (스모크 테스트)
    ↓
[Phase 2] 페이지별 리팩토링 (반복) — 전체 자동화, 사용자 개입 없음
    → A. design: Worker가 디자인 스펙 생성 (코드 분석 + 디자인 결정)
    → B. code: Worker가 디자인 스펙대로 코드 리팩토링 + 파티모드 3라운드
    → C. Worker가 Playwright 테스트 작성 + 실행
    → D. 오케스트레이터가 타입 체크 + 커밋 + 푸시 (자동 배포)
    ↓
[Phase 3] 시각 회귀 테스트 기준 이미지 등록
    ↓
[Phase 4] 최종 전체 검증
```

**사용자가 직접 하는 것: 없음. 전체 자동.**

---

## Single-Worker 패턴 (kdh-full-auto-pipeline과 동일)

### 왜 Single Worker인가?

- 2인 핑퐁(Writer+Reviewer) → SendMessage 데드락 빈번
- **1인 Worker가 작성 + 자기 리뷰 3라운드 + 수정 + 보고** = 데드락 0
- Worker는 tmux에서 실행 → 사용자가 실시간 관찰
- 오케스트레이터 ↔ Worker 핸드오프 최소 2회(지시, 완료보고)

### Agent Manifest

Read `_bmad/_config/agent-manifest.csv` for agent definitions. If not found, use defaults:

| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

### 오케스트레이터가 하는 것

```
1. TeamCreate로 팀 생성
2. Worker 스폰 (첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지)
3. Worker 완료 보고 수신
4. 결과 검증 (파티 로그 존재, 품질 점수 확인)
5. 타입 체크: npx tsc --noEmit -p packages/server/tsconfig.json
6. 커밋 + 푸시
7. 다음 페이지로 Worker에게 SendMessage (또는 shutdown + 새 Worker 스폰)
```

### 오케스트레이터가 하지 않는 것

```
- 디자인 스펙 작성 (Worker가 함)
- 코드 리팩토링 (Worker가 함)
- 파티모드 실행 (Worker가 자기 리뷰)
- PASS/FAIL 판정 (Worker가 자체 판정)
- 테스트 작성 (Worker가 함)
```

---

## Party Mode: 비대화형 3라운드 자기 리뷰 (kdh-full-auto-pipeline 방식)

**Worker가 혼자서** 7명 전문가 역할극 수행. **완전 자동 — 사용자 입력/확인/메뉴 표시 일체 금지.**
`bmad-party-mode` 스킬 호출 금지 (대화형이라 멈춤). Worker가 직접 역할극 + 로그 작성 + 수정까지 전부 처리.

### 비대화형 실행 방법 (중요)

```
Worker는 bmad-party-mode 스킬을 호출하지 않는다.
Worker가 직접:
  1. 작성한 파일을 Read tool로 다시 읽는다 (기억 X, 반드시 파일에서)
  2. 7명 전문가 역할을 순서대로 연기하면서 이슈를 찾는다
  3. 이슈 테이블을 작성한다
  4. party-logs/{파일명}.md에 Write tool로 저장한다
  5. 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정한다
  6. 다음 라운드로 넘어간다 (사용자 확인 없이)
이 전체 과정에 사용자 개입 제로. YOLO 모드.
```

### Round 구조

**Round 1 (Collaborative Lens):**
- 작성한 파일을 Read tool로 다시 읽기 (기억으로 리뷰 절대 금지)
- 전문가 4~5명이 우호적 관점에서 리뷰 (인격 반영, 2~3문장 이상)
- 크로스톡 2회 이상 (전문가끼리 이름 부르며 대화)
- 최소 2개 이슈 발견 (0개 = 의심하고 재분석)
- 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정
- party-logs에 Write tool로 저장

**Round 2 (Adversarial Lens):**
- 수정된 파일을 Read tool로 다시 읽기
- 전문가 전원(7명)이 적대적 관점으로 전환
- Round 1 수정이 진짜 고쳐졌는지 검증
- 각 전문가 최소 1개 새 관찰 (Round 1에 없던 것)
- 현재 백엔드 코드 기준으로 기능 커버리지 확인
- 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정
- party-logs에 Write tool로 저장

**Round 3 (Forensic Lens):**
- 최종 파일을 Read tool로 다시 읽기
- Round 1+2의 모든 이슈를 재평가 (과장 → 하향, 과소평가 → 상향)
- 각 전문가 최종 평가 (2~3문장, 인격 반영)
- 품질 점수 X/10 + PASS (7+) 또는 FAIL (6-)
- party-logs에 Write tool로 저장
- FAIL → 수정 후 3라운드 전체 재실행

### Party Log 형식

저장 경로: `_uxui-refactoring/party-logs/`

```
_uxui-refactoring/party-logs/
├── design-01-command-center-round1.md
├── design-01-command-center-round2.md
├── design-01-command-center-round3.md
├── code-01-command-center-round1.md
├── code-01-command-center-round2.md
├── code-01-command-center-round3.md
...
```

(라운드별 형식은 kdh-full-auto-pipeline과 동일 — 생략)

---

## Mode: design PAGENAME (디자인 스펙 생성 + 비대화형 3라운드 자기 리뷰)

### Worker 스폰 프롬프트

```
You are a senior UXUI designer AND frontend architect for CORTHEX v2.
You create DETAILED, SPECIFIC design specifications that another developer can implement exactly.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)
파티모드는 Skill tool로 호출하지 않는다. Worker인 네가 직접 수행한다:
1. 작성한 디자인 스펙 파일을 Read tool로 다시 읽는다 (기억으로 리뷰 절대 금지)
2. 7명 전문가(John/Winston/Sally/Amelia/Quinn/Mary/Bob) 역할을 직접 연기한다
3. 이슈 테이블을 작성하고, party-logs 파일에 Write tool로 저장한다
4. 발견된 이슈를 Edit tool로 디자인 스펙 원본 파일에서 즉시 수정한다
5. 다음 라운드로 자동 진행한다 (사용자 확인 없이, 메뉴 없이)

## CRITICAL: ALL DELIVERABLES MUST BE SPECIFIC AND DETAILED
Every output must be concrete, not vague. Examples:
- BAD: "Use a professional color scheme"
- GOOD: "Primary: #3b82f6 (blue-500), Surface: #0f172a (slate-900), Text: #f8fafc (slate-50), Accent: #22d3ee (cyan-400), Destructive: #ef4444 (red-500), Success: #22c55e (green-500)"
- BAD: "Add a sidebar navigation"
- GOOD: "Left sidebar, w-64 (256px), fixed position, bg-slate-900, border-r border-slate-700. Contains: logo area (h-16, flex items-center px-4), nav items (flex flex-col gap-1 px-3), each nav item (flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors)"

## DESIGN PHILOSOPHY
CORTHEX v2 is an AI-agent-powered enterprise operations platform.
The UI should feel:
- **Professional & Modern**: Clean lines, generous whitespace, subtle shadows
- **Data-Dense but Readable**: Information-rich screens with clear visual hierarchy
- **Dark-Mode First**: Deep slate backgrounds, high-contrast text, glowing accents
- **Enterprise-Grade**: Polished like Linear, Vercel Dashboard, or Raycast
- **Consistent**: Same patterns across all 42 pages

## DESIGN SYSTEM FOUNDATION (use across all pages)
Before designing page-specific UI, establish/reference these shared tokens:

### Color Tokens
- Background: slate-900 (#0f172a) primary, slate-800 (#1e293b) elevated, slate-950 (#020617) sunken
- Text: slate-50 (#f8fafc) primary, slate-400 (#94a3b8) secondary, slate-500 (#64748b) tertiary
- Border: slate-700 (#334155) default, slate-600 (#475569) hover
- Primary: blue-500 (#3b82f6) action, blue-600 (#2563eb) hover
- Accent: cyan-400 (#22d3ee) highlight, emerald-500 (#10b981) success
- Destructive: red-500 (#ef4444), Warning: amber-500 (#f59e0b)
- Status: green-500 online, yellow-500 busy, red-500 error, slate-500 offline

### Typography Scale
- Display: text-3xl font-bold tracking-tight
- Heading: text-xl font-semibold
- Subheading: text-sm font-medium uppercase tracking-wider text-slate-400
- Body: text-sm text-slate-300
- Caption: text-xs text-slate-500
- Mono: font-mono text-xs (for code, IDs, timestamps)

### Spacing System
- Page padding: p-6 (24px)
- Section gap: space-y-6
- Card padding: p-4 or p-5
- Compact list item: py-2 px-3
- Button padding: px-4 py-2

### Component Patterns
- Card: bg-slate-800/50 border border-slate-700 rounded-xl shadow-sm
- Button Primary: bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
- Button Secondary: bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium
- Button Ghost: hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg px-3 py-2
- Input: bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500
- Badge: inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
- Table Header: text-xs font-medium uppercase tracking-wider text-slate-400 border-b border-slate-700
- Table Row: border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors
- Modal: fixed inset-0 bg-black/60 backdrop-blur-sm, content: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-lg
- Toast: fixed bottom-4 right-4, bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4
- Skeleton: bg-slate-700 animate-pulse rounded

### Responsive Breakpoints
- Mobile: < 768px (single column, bottom nav, stacked cards)
- Tablet: 768px-1024px (collapsible sidebar, 2-column grids)
- Desktop: > 1024px (full sidebar, multi-column layouts)

## Your References (MUST read before designing)
1. Current page code: packages/{app|admin}/src/pages/{페이지명}/ — current functionality
2. Backend routes: packages/server/src/routes/ — API endpoints, data shapes
3. Database schema: packages/server/src/db/schema.ts — entity structure
4. Shared types: packages/shared/src/types.ts — type definitions
5. Other completed design specs: _uxui-refactoring/claude-prompts/ — consistency check
6. Current shared components: packages/{app|admin}/src/components/ — reusable patterns

IMPORTANT: Only describe features that CURRENTLY EXIST in the v2 codebase.

## Your Task: Create design spec for {페이지명} (page #{번호})

### Step 1: Deep Code Analysis
- Read ALL files in the page directory (every .tsx, .ts file)
- Read relevant backend route handlers
- Read relevant DB schema tables
- Read shared types used by this page
- Read existing shared components (what's reusable?)
- Map out: every piece of data displayed, every user action, every state transition, every API call

### Step 2: Write Comprehensive Design Spec
Save to: _uxui-refactoring/claude-prompts/{번호}-{페이지명}.md

THE SPEC MUST BE EXTREMELY DETAILED AND SPECIFIC. Write in English for precision.
Include exact Tailwind classes, exact layout structure, exact component hierarchy.

Structure:

# {번호}. {페이지명} — Design Specification

## 1. Page Overview
- Purpose: (what this page does, who uses it, when)
- Key User Goals: (what users come here to accomplish)
- Data Dependencies: (which API endpoints, what data shapes)
- Current State: (brief analysis of what exists now and what needs to change)

## 2. Page Layout Structure
(ASCII diagram showing the exact layout grid)
```
┌─────────────────────────────────────────────────────┐
│ Page Header                                          │
│ [Breadcrumb] [Title]                    [Actions]   │
├─────────────────────────────────────────────────────┤
│ [Filter Bar / Tabs]                                  │
├──────────────────────┬──────────────────────────────┤
│ Main Content Area    │ Detail Panel (if applicable)  │
│                      │                               │
│                      │                               │
└──────────────────────┴──────────────────────────────┘
```

- Exact grid: (e.g., `grid grid-cols-12 gap-6`, main=`col-span-8`, detail=`col-span-4`)
- Container: (e.g., `max-w-7xl mx-auto px-6 py-6`)
- Responsive behavior: (how layout changes at each breakpoint)

## 3. Component Breakdown
For EACH component on the page, specify:

### 3.1 {ComponentName}
- **Purpose**: what it does
- **Container**: exact Tailwind classes (e.g., `bg-slate-800/50 border border-slate-700 rounded-xl p-5`)
- **Layout**: internal layout classes (e.g., `flex items-center justify-between`)
- **Content**:
  - Element 1: `<h2 className="text-xl font-semibold text-white">Title</h2>`
  - Element 2: `<p className="text-sm text-slate-400 mt-1">Subtitle</p>`
  - ...
- **Interactive Elements**:
  - Button: exact classes, onClick handler (reference existing handler name)
  - Input: exact classes, value binding, onChange handler
  - ...
- **States**:
  - Loading: (skeleton UI with exact classes)
  - Empty: (empty state design with icon, message, CTA)
  - Error: (error alert design)
  - Success: (success feedback design)
- **data-testid**: (list all test IDs for this component)

(Repeat for every component on the page)

## 4. Interaction Specifications
- Click flows: (what happens when user clicks X → Y → Z)
- Form submissions: (validation rules, error display, success feedback)
- Navigation: (where links/buttons go, how state transfers)
- Keyboard shortcuts: (if any)
- Drag & drop: (if any)
- Real-time updates: (WebSocket events, polling intervals)

## 5. Responsive Design
### Desktop (> 1024px)
- (full layout description)
### Tablet (768px - 1024px)
- (adapted layout — what collapses, what stacks)
### Mobile (< 768px)
- (mobile layout — single column, bottom actions, swipeable)

## 6. Animation & Transitions
- Page enter: (e.g., `animate-in fade-in slide-in-from-bottom-4 duration-300`)
- Card hover: (e.g., `transition-all duration-200 hover:shadow-lg hover:border-slate-600`)
- Modal open/close: (e.g., `transition-opacity duration-200`)
- Loading transitions: (skeleton → content fade)
- State changes: (e.g., status badge color transitions)

## 7. Accessibility
- ARIA labels for interactive elements
- Focus management (tab order, focus trapping in modals)
- Color contrast compliance (WCAG AA minimum)
- Screen reader considerations

## 8. data-testid Map
| Element | data-testid | Type |
|---------|-------------|------|
| (every interactive element) | (exact ID) | button/input/link/... |

### Step 3: 비대화형 자기 리뷰 3라운드 (직접 수행 — Skill 호출 금지)

**Round 1 (Collaborative Lens):**
1. 디자인 스펙 파일을 Read tool로 다시 읽기
2. 전문가 4~5명이 우호적 관점으로 리뷰 (인격 반영, 2~3문장 이상, 크로스톡 2회+)
3. 최소 2개 이슈 (0개 = 재분석)
4. Write tool로 party-logs/design-{번호}-{페이지명}-round1.md 저장
5. Edit tool로 디자인 스펙 파일에서 이슈 수정

**Round 2 (Adversarial Lens):**
1. 수정된 디자인 스펙 파일을 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드, 각자 최소 1개 새 관찰
3. ADVERSARIAL CHECKLIST 검증:
   - [ ] Tailwind classes are REAL and CORRECT? (no made-up classes)
   - [ ] Layout is achievable with current Tailwind config?
   - [ ] All data from actual API endpoints is accounted for?
   - [ ] All interactive elements have event handlers mapped to existing code?
   - [ ] Edge cases designed (empty, error, loading, mobile)?
   - [ ] Consistent with design system tokens defined above?
   - [ ] Consistent with other completed page designs?
   - [ ] Specific enough for another developer to implement without guessing?
   - [ ] data-testid for every interactive element?
4. Write tool로 party-logs/design-{번호}-{페이지명}-round2.md 저장
5. Edit tool로 디자인 스펙 파일에서 이슈 수정

**Round 3 (Forensic Lens):**
1. 최종 디자인 스펙 파일을 Read tool로 다시 읽기
2. Round 1+2 이슈 재평가 + 각 전문가 최종 평가
3. 품질 점수 X/10 + PASS(7+) / FAIL(6-)
4. Write tool로 party-logs/design-{번호}-{페이지명}-round3.md 저장
5. FAIL → 디자인 스펙 재작성 후 3라운드 전체 재실행

### Step 4: Report to Orchestrator
[Step Complete] design-{번호}-{페이지명}
Content summary: (1~2줄)
Party mode: 3 rounds passed (issues fixed: N)
Quality score: X/10
Changed files: (경로들)
```

---

## Mode: design-batch PRIORITY (일괄 디자인 스펙 생성)

### 전체 흐름

```
오케스트레이터:
  1. 해당 우선순위의 전체 페이지 목록 추출
  2. Worker 스폰 (첫 페이지 작업을 spawn 프롬프트에 포함)
  3. Worker가 페이지 1개 완료 보고 → 오케스트레이터가 다음 페이지 SendMessage
  4. 5페이지마다 Worker shutdown + 새 Worker 스폰 (컨텍스트 관리)
  5. 모든 페이지 완료 → 일괄 커밋 + 푸시
  6. 사용자에게 완료 보고

Worker 페이지당 작업:
  1. 현재 코드 깊이 읽기 (페이지 파일 전부 + 백엔드 + 스키마 + 공유 컴포넌트)
  2. 디자인 스펙 생성 → _uxui-refactoring/claude-prompts/{번호}-{페이지명}.md
  3. 비대화형 파티모드 3라운드
  4. 오케스트레이터에게 완료 보고 (SendMessage)
```

---

## Mode: code PAGENAME (디자인 스펙 기반 리팩토링 + 파티모드 + Playwright)

### 전제 조건
- `design PAGENAME` 완료 (디자인 스펙 파일 존재)

### Worker 스폰 프롬프트

```
You are a senior frontend developer for CORTHEX v2. You implement UI changes based on detailed design specifications AND self-review with 3-round party mode.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)

## CRITICAL: ALL CODE MUST BE SPECIFIC AND DETAILED
- Every Tailwind class must match the design spec exactly
- Every component structure must follow the spec's JSX hierarchy
- Every state (loading/error/empty) must be implemented as specified
- Every data-testid must be added as specified
- Do not approximate or "interpret" the design — implement it precisely

## Your References (MUST read before coding)
1. **Design Spec** (PRIMARY GUIDE): _uxui-refactoring/claude-prompts/{번호}-{페이지명}.md
   - This is the blueprint. Follow it EXACTLY.
   - Every Tailwind class, every layout decision, every component structure is specified.
2. **Current page code**: packages/{app|admin}/src/pages/{페이지명}/ (what exists now)
3. **Shared components**: packages/{app|admin}/src/components/ (what to reuse)

## ABSOLUTE RULES (break any = instant FAIL)
1. 기능 로직 건드리지 말 것 — API 호출, 상태관리, 이벤트 핸들러 100% 유지
2. UI/레이아웃/스타일/Tailwind 클래스만 변경 — design spec에 맞춰서
3. data-testid 전부 추가 (design spec의 testid map 참조)
4. 기존 data-testid 삭제 금지
5. 새 파일 생성 최소화 (기존 파일 수정 선호)
6. import 경로는 git ls-files 기준 대소문자 정확히 일치

## Your Task: Refactor {페이지명} (page #{번호})

### Step 1: Read References
- Read design spec (this is your blueprint)
- Read all current page code files
- Read relevant shared components

### Step 2: Implement Design
For each file in the page:
1. Follow design spec's component breakdown exactly
2. Apply exact Tailwind classes from the spec
3. Implement the exact layout structure (grid, flex, positioning)
4. Implement all states: loading (skeleton), error (alert), empty (placeholder)
5. Add responsive classes as specified in the design spec
6. Add transitions/animations as specified
7. Add all data-testid attributes from the spec's testid map
8. Preserve ALL existing functionality (API calls, state, handlers)

### Step 3: 비대화형 자기 리뷰 3라운드

**Round 1 (Collaborative Lens):**
1. 수정한 코드 파일 전부를 Read tool로 다시 읽기
2. 전문가 4~5명이 우호적 관점으로 리뷰
3. 최소 2개 이슈
4. party-logs/code-{번호}-{페이지명}-round1.md 저장
5. 코드 수정

**Round 2 (Adversarial Lens):**
1. 수정된 코드 파일 전부를 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드
3. ADVERSARIAL CHECKLIST:
   - [ ] Design spec layout matched exactly?
   - [ ] Tailwind classes from spec applied correctly?
   - [ ] 기능 로직이 100% 동일? (API calls, state, handlers)
   - [ ] data-testid 전부 추가됨? (spec's testid map 대조)
   - [ ] 기존 data-testid 삭제 안 됨?
   - [ ] 반응형 (각 breakpoint에서 design spec대로)?
   - [ ] 로딩/에러/빈 상태 UI가 design spec대로?
   - [ ] 다른 페이지에 영향 없음?
   - [ ] import 경로 대소문자 일치?
4. party-logs/code-{번호}-{페이지명}-round2.md 저장
5. 코드 수정

**Round 3 (Forensic Lens):**
1. 최종 코드 파일을 Read tool로 다시 읽기
2. 점수 X/10 + PASS/FAIL
3. party-logs/code-{번호}-{페이지명}-round3.md 저장
4. FAIL → 재수정 후 3라운드 재실행

### Step 4: Write Playwright Tests
Save to: packages/e2e/src/tests/interaction/{app|admin}/{페이지명}.spec.ts
- 페이지 로드 확인
- 주요 인터랙션 (클릭, 입력, 내비게이션)
- data-testid 존재 확인
- 반응형 테스트 (desktop + mobile viewport)

### Step 5: Run Tests
- npx playwright test src/tests/interaction/{app|admin}/{페이지명}.spec.ts
- npx playwright test src/tests/smoke/ (회귀 확인)
- 실패 시 수정 후 재실행

### Step 6: Report to Orchestrator
[Step Complete] code-{번호}-{페이지명}
Content summary: (1~2줄)
Party mode: 3 rounds passed (issues fixed: N)
Quality score: X/10
Tests: N개 작성, 전부 통과
Changed files: (경로들)
```

---

## Mode: code-batch PRIORITY (일괄 리팩토링)

```
1. 해당 우선순위에서 design 완료 + code 미완료 페이지 목록 추출
2. 페이지별로 순차 실행 (code PAGENAME과 동일)
3. 5페이지마다 Worker shutdown + 새 Worker 스폰
4. 전체 완료 후 스모크 테스트 전체 실행
```

---

## Mode: phase0 (Playwright 환경 세팅)

한 번만 실행. packages/e2e/ 디렉토리에 Playwright 설정 생성.

```
1. packages/e2e/ 디렉토리 확인 (이미 있으면 스킵)
2. playwright.config.ts 생성 (baseURL: https://corthex-hq.com)
3. auth.setup.ts 생성
4. smoke 테스트 파일 생성 (42페이지)
5. npx playwright install chromium
6. 사용자에게 .env.test 비밀번호 입력 요청
```

---

## Mode: phase1 (현재 기능 상태 점검)

```
1. npx playwright test src/tests/smoke/ 실행
2. 결과 파싱 (통과/실패 페이지 분류)
3. 요약 보고
```

---

## Mode: phase3 (시각 회귀 기준 등록)

```
1. visual regression 테스트 파일 생성
2. npx playwright test src/tests/visual/ --update-snapshots
3. 기준 스크린샷 생성
4. 커밋: test(visual): baseline screenshots for new UXUI
```

---

## Mode: final (최종 전체 검증)

```
1. npx playwright test src/tests/smoke/ (전 페이지 접근)
2. npx playwright test src/tests/interaction/ (기능 동작)
3. npx playwright test src/tests/visual/ (스크린샷 비교)
4. 결과 종합 리포트
5. 실패 항목 있으면 Worker 스폰해서 수정
6. 전부 통과 → "UXUI 리팩토링 완료" 선언
```

---

## Mode: 인자 없음 (진행 상황 + 다음 안내)

```
1. _uxui-refactoring/ 폴더 구조 확인
2. claude-prompts/, party-logs/ 존재 확인
3. 현재 진행 상황 요약 (완료/진행중/남은 페이지)
4. 다음 할 일 안내
```

---

## 저장 위치

```
_uxui-refactoring/
├── claude-prompts/           (Worker가 생성한 상세 디자인 스펙)
│   ├── 01-command-center.md
│   ├── 02-chat.md
│   ...
├── lovable-prompts/          (v5에서 생성한 기능 프롬프트 — 참고용으로 유지)
│   ├── 00-context.md
│   ├── 01-command-center.md
│   ...
├── party-logs/               (파티모드 리뷰 로그)
│   ├── design-01-command-center-round1.md
│   ├── code-01-command-center-round1.md
│   ...
└── wireframes/               (사용 안 함 — v6는 Claude 직접 디자인)
```

---

## 페이지 우선순위 + 번호 매핑

| # | 패키지 | 페이지명 | 경로 | 우선순위 |
|---|--------|---------|------|---------|
| 01 | app | command-center | /command-center | 1순위 |
| 02 | app | chat | /chat | 1순위 |
| 03 | app | dashboard | /dashboard | 1순위 |
| 04 | app | trading | /trading | 1순위 |
| 05 | app | agora | /agora | 1순위 |
| 06 | app | nexus | /nexus | 1순위 |
| 07 | admin | agents | /agents | 1순위 |
| 08 | admin | departments | /departments | 1순위 |
| 09 | admin | credentials | /credentials | 1순위 |
| 10 | app | sns | /sns | 2순위 |
| 11 | app | messenger | /messenger | 2순위 |
| 12 | app | ops-log | /ops-log | 2순위 |
| 13 | app | reports | /reports | 2순위 |
| 14 | app | jobs | /jobs | 2순위 |
| 15 | app | knowledge | /knowledge | 2순위 |
| 16 | app | files | /files | 2순위 |
| 17 | app | costs | /costs | 2순위 |
| 18 | app | activity-log | /activity-log | 2순위 |
| 19 | admin | workflows | /workflows | 2순위 |
| 20 | admin | tools | /tools | 2순위 |
| 21 | admin | users | /users | 2순위 |
| 22 | admin | employees | /employees | 2순위 |
| 23 | admin | monitoring | /monitoring | 2순위 |
| 24 | app | home | / | 3순위 |
| 25 | app | argos | /argos | 3순위 |
| 26 | app | classified | /classified | 3순위 |
| 27 | app | org | /org | 3순위 |
| 28 | app | cron | /cron | 3순위 |
| 29 | app | performance | /performance | 3순위 |
| 30 | app | notifications | /notifications | 3순위 |
| 31 | app | settings | /settings | 3순위 |
| 32 | admin | org-chart | /org-chart | 3순위 |
| 33 | admin | org-templates | /org-templates | 3순위 |
| 34 | admin | template-market | /template-market | 3순위 |
| 35 | admin | agent-marketplace | /agent-marketplace | 3순위 |
| 36 | admin | soul-templates | /soul-templates | 3순위 |
| 37 | admin | report-lines | /report-lines | 3순위 |
| 38 | admin | api-keys | /api-keys | 3순위 |
| 39 | admin | costs-admin | /costs | 3순위 |
| 40 | admin | companies | /companies | 3순위 |
| 41 | admin | settings-admin | /settings | 3순위 |
| 42 | admin | onboarding | /onboarding | 3순위 |

---

## Worker 스폰 규칙

```
1. 반드시 첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지
2. Worker에게 mode=bypassPermissions 부여
3. 5개 이상 페이지 처리하면 shutdown + 새 Worker 스폰 (컨텍스트 관리)
4. Worker가 멈추면 SendMessage로 리마인더
5. Worker가 FAIL 보고 → 자동 재시도 1회 → 2번째 FAIL → 오케스트레이터 개입
```

---

## 트러블슈팅

### Worker가 스텝 완료 없이 멈춤
**해결:** SendMessage: "Continue working. Complete 3-round self-review and report back."
2번 리마인더 후에도 안 되면 shutdown + 새 Worker 스폰.

### Worker가 파티모드 라운드를 건너뜀
**해결:** 거부: "Party logs missing. Redo 3-round self-review."

### Worker가 vague한 디자인 스펙을 씀
**해결:** 즉시 FAIL. "Design spec is too vague. Every element needs exact Tailwind classes, exact layout, exact states. Rewrite with full specificity."

### Worker가 삭제된 v1 기능을 포함함
**해결:** FAIL. "Only describe features that exist in current v2 code. Read the actual code."

### TypeScript 타입 체크 실패
**해결:** Worker가 수정 또는 오케스트레이터가 직접 수정. 커밋 전 반드시 통과.

### Playwright 테스트 실패
**해결:** 커밋+푸시 후 2분 대기 → 재실행. 인증 실패면 auth.setup.ts 확인.

---

## 절대 규칙

1. **Claude가 직접 디자인** — 외부 도구(Lovable/v0) 의존 없음
2. **모든 산출물은 구체적이고 자세하게** — vague/abstract 금지, hex/Tailwind/JSX 수준으로
3. **v2 현재 코드 기준** — v1-feature-spec 직접 참조 금지 (삭제된 기능 부활 방지)
4. **기능 로직 건드리지 말 것** — UI/스타일만 변경
5. **파티모드 3라운드 없이 커밋하지 말 것**
6. **Playwright 테스트 실패 시 커밋 금지**
7. **data-testid 누락 시 커밋 금지**
8. **각 파티모드는 파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
9. **전문가 코멘트는 2~3문장 이상** (한 줄짜리 금지, 인격 반영 필수)
10. **"이슈 0개" = 재분석** (BMAD 프로토콜)
11. **오케스트레이터는 코딩/파티모드 직접 안 함** — Worker가 전부 처리
12. **Worker spawn 시 첫 작업 포함 필수** — "기다려" 금지
13. **커밋 전 npx tsc --noEmit 필수**
14. **5페이지마다 Worker shutdown + 새 Worker 스폰** (컨텍스트 관리)
15. **디자인 일관성** — 모든 페이지가 동일한 디자인 시스템 토큰 사용
