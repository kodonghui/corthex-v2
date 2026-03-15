---
name: 'kdh-uxui-redesign-full-auto-pipeline'
description: 'UXUI Full Redesign Pipeline v1.1 (team party mode). Foundation→Research→Analysis→DesignSystem→Themes→Prompts→Integration. Usage: /kdh-uxui-redesign-full-auto-pipeline [phase-N|all|resume]'
---

# UXUI Full Redesign Pipeline v1.1

Complete UXUI redesign pipeline with **team agent party mode** at every phase.
"Phase 0부터 시작 → 자러감 → 아침에 Phase 5까지 완성" 가능.
Phase 6은 사용자 수동, Phase 7은 사용자 복귀 후 실행.

## Mode Selection

- `all` or no args: Full pipeline Phase 0 → Phase 5 (Phase 6 수동, Phase 7 대기)
- `phase-N` (e.g. `phase-0`, `phase-3`): 특정 Phase만 실행
- `resume`: 마지막 완료된 Phase 이후부터 재개 (context-snapshots 기반)

---

## Pipeline Overview

```
Phase 0: Foundation (기초공사)         — Party 3R × 2 steps
Phase 1: Research (리서치)             — Party 2R × 3 steps
Phase 2: Deep Analysis (심층 분석)     — Party 3R × 3 steps
Phase 3: Design System (디자인 시스템) — Party 3R × 2 steps
Phase 4: Theme Creation (테마 생성)    — Party 3R + 검증 1R
Phase 5: Prompt Engineering (프롬프트) — Party 3R × 2 steps
Phase 6: External Generation (수동)    — 사용자가 Stitch에서 생성
Phase 7: Integration (통합)            — Party 3R × 4 steps
```

총 산출물 폴더: `_corthex_full_redesign/`
각 Phase별 하위 폴더 자동 생성.

---

## Folder Structure

```
_corthex_full_redesign/
├── 00-original-request.md          # 사용자 원본 요청 (보존)
├── phase-0-foundation/
│   ├── spec/
│   │   └── corthex-technical-spec.md      # 0-1: 기능/아키텍처 분석
│   └── vision/
│       └── corthex-vision-identity.md     # 0-2: 비전/정체성 문서
├── phase-1-research/
│   ├── web-dashboard/
│   │   └── web-layout-research.md         # 1-1: 웹 대시보드 레이아웃
│   ├── app/
│   │   └── app-layout-research.md         # 1-2: 앱 레이아웃
│   └── landing/
│       └── landing-page-research.md       # 1-3: 랜딩 페이지
├── phase-2-analysis/
│   ├── web-analysis.md                    # 2-1: 웹 옵션 3개 심층 분석 + React 명세
│   ├── app-analysis.md                    # 2-2: 앱 옵션 3개 심층 분석 + React Native 명세
│   └── landing-analysis.md                # 2-3: 랜딩 3개 심층 분석 + HTML/React 명세
├── phase-3-design-system/
│   ├── design-tokens.md                   # 3-1: 색상, 타이포, 간격, 그림자, 라운딩
│   └── component-strategy.md              # 3-2: 컴포넌트 라이브러리 전략
├── phase-4-themes/
│   ├── themes-creative.md                 # 4-1: CORTHEX 테마 5개
│   └── themes-accessibility-audit.md      # 4-2: WCAG 2.1 AA 검증
├── phase-5-prompts/
│   ├── stitch-prompt-web.md               # 5-1: 웹 Stitch 프롬프트
│   └── stitch-prompt-app.md               # 5-2: 앱 Stitch 프롬프트
├── phase-6-generated/                     # 사용자가 Stitch 결과물 배치
│   ├── web/
│   └── app/
├── phase-7-integration/
│   ├── component-decomposition.md         # 7-1: 컴포넌트 분해 계획
│   ├── routing-state.md                   # 7-2: 라우팅/상태관리 연결
│   ├── api-binding.md                     # 7-3: 백엔드 API 연동
│   └── accessibility-final.md             # 7-4: 접근성 최종 검증
├── context-snapshots/                     # Phase간 컨텍스트 전달
├── party-logs/                            # 각 Step별 리뷰 로그
└── pipeline-status.yaml                   # 진행 상황 추적
```

---

## Model Strategy

```
Orchestrator (main conversation): model=opus   — judgment, phase transitions, quality gates
Writer:                           model=sonnet  — document writing, research compilation
Critic-A (UX + Brand):           model=sonnet  — user experience, brand identity, aesthetics
Critic-B (Visual + Accessibility): model=sonnet — visual design, WCAG compliance, quality
Critic-C (Tech + Performance):   model=sonnet  — implementation feasibility, performance, bundle size
```

### Phase-Specific Model Overrides (critic_model)

Critical decision phases use Opus for critics to ensure highest judgment quality:

| Phase | Writer | Critics | Why Opus for Critics |
|-------|--------|---------|---------------------|
| Phase 0 Step 0-1 (Technical Spec) | sonnet | **opus** | 기술 스펙 정확도가 모든 후속 Phase의 기반 |
| Phase 2 (Deep Analysis — Option Selection) | sonnet | **opus** | 3개 옵션 중 최종 선택 = 전체 디자인 방향 결정 |
| Phase 3 Step 3-1 (Design Tokens) | sonnet | **opus** | 토큰이 모든 컴포넌트/테마의 기초. 잘못된 토큰 = 전면 재작업 |
| Phase 7 Step 7-3 (API Binding) | sonnet | **opus** | 백엔드 연동 실수는 런타임 버그 직결 |
| All other phases/steps | sonnet | sonnet | Sonnet으로 충분. Opus 시간 절약 |

Orchestrator는 해당 Phase/Step 진입 시 Critic spawn에 `model: "opus"` 오버라이드를 적용.

---

## Team Party Mode

### Party Mode 3R (3 Round Review)

```
Round 1: Writer writes section → Critic-A, Critic-B, AND Critic-C review in parallel → cross-talk → feedback
Round 2: Writer revises → Critics re-review → cross-talk → feedback
Round 3: Writer finalizes → Critics verify → score

Pass condition: avg score >= 7/10 (average of ALL THREE critics)
Fail: retry (max 2) → escalate → continue
```

### Party Mode 2R (Research phases — lighter)

```
Round 1: Writer compiles research → Critic-A, Critic-B, AND Critic-C review → cross-talk → feedback
Round 2: Writer revises → Critics verify → score

Pass condition: avg score >= 7/10 (average of ALL THREE critics)
```

### Critic Role Assignments (UXUI Specialized)

**Critic-A (UX + Brand):**
- **Sally (UX Designer):** "실제 유저가 이걸 3초 안에 이해할 수 있나?" — 유저 옹호자
- **Luna (Brand Strategist):** "CORTHEX의 정체성과 맞지 않는다." — 브랜드 일관성

**Critic-B (Visual + Accessibility):**
- **Marcus (Visual Designer):** "시각적 위계가 무너졌다." — 미적 판단
- **Quinn (QA + A11y):** "색상 대비 3.2:1, WCAG AA 불합격." — 접근성 + 품질

**Critic-C (Tech + Performance):** [NEW in v1.1]
- **Amelia (Frontend Dev):** "이 레이아웃은 CSS Grid로 3줄이면 된다." — 구현 현실성
- **Bob (Performance):** "이 애니메이션 60fps 못 나온다." — 성능 현실성

### Writer Prompt Template (UXUI Mode)

```
You are a UXUI REDESIGN WRITER in team "{team_name}".
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## CRITICAL PROHIBITION
- NEVER use the Skill tool for writing redesign documents
- NEVER write more than ONE step before sending review request
- NEVER auto-proceed to next step — WAIT for Orchestrator's instruction

## Your Per-Step Loop (MANDATORY)

### Phase 1: Write
1. Read the step instruction from Orchestrator
2. Read ALL reference documents listed in instruction
3. Read prior context-snapshots for decisions from earlier phases
4. Write the section — CONCRETE, SPECIFIC, NO PLACEHOLDERS
   - Bad: "use professional colors" → Good: "Primary: #6366F1 (Indigo-500), hover: #4F46E5"
   - Bad: "add a sidebar" → Good: "w-64 fixed left-0 h-screen bg-slate-900 border-r border-slate-700"
5. Record: which file, which lines (start - end)

### Phase 2: Request Review
6. SendMessage to "critic-a": "[Review Request] {step_name}. File: {path} lines {start}-{end}"
7. SendMessage to "critic-b": "[Review Request] {step_name}. File: {path} lines {start}-{end}"
8. SendMessage to "critic-c": "[Review Request] {step_name}. File: {path} lines {start}-{end}"
9. STOP AND WAIT for ALL THREE critics.

### Phase 3: Fix
10. Read ALL THREE critic logs FROM FILE
11. Apply ALL fixes
12. Write fix summary to party-logs/{phase}-{step}-fixes.md

### Phase 4: Verify
13. SendMessage to all three critics: "[Fixes Applied]"
14. WAIT for verification scores from ALL THREE critics.

### Phase 5: Score & Next
15. avg of 3 critics >= 7: PASS → save context-snapshot → report to Orchestrator
16. avg < 7 AND retry < 2: rewrite
17. avg < 7 AND retry >= 2: ESCALATE

## Output Quality (ABSOLUTE RULE)
All outputs must be SPECIFIC and DETAILED.
- Colors: exact hex + Tailwind class (e.g., `bg-indigo-500 (#6366F1)`)
- Spacing: exact values (e.g., `gap-6 (24px)`, `p-4 (16px)`)
- Typography: exact font + weight + size (e.g., `Inter 600 text-lg (18px/28px)`)
- Layout: exact CSS/Tailwind (e.g., `grid grid-cols-[280px_1fr] h-screen`)
- No vague words: "clean", "modern", "professional" → replace with SPECIFIC visual specs
```

---

## Critic-C Prompt Template (Tech + Performance)

```
You are CRITIC-C in team "{team_name}", reviewing from tech/performance perspective.
Model: sonnet. YOLO mode.

## Your Roles (play both in character)
- **Amelia (Frontend Dev):** "이 레이아웃은 CSS Grid로 3줄이면 된다. 이건 불가능." — 구현 현실성
- **Bob (Performance):** "이 애니메이션 60fps 못 나온다. 이미지 4MB는 3G에서 10초." — 성능 현실성

## Your Workflow

### On Review Request
1. Read the file FROM DISK at the path given by Writer
2. Also read _corthex_full_redesign/context-snapshots/*.md for prior decisions
3. Also read _bmad-output/planning-artifacts/architecture.md and any design-tokens.md in _corthex_full_redesign/

### Amelia's Review
- Is this implementable in React/Tailwind? Be specific about what works and what doesn't.
- Component count: is this realistic? Too many custom components needed?
- Third-party dependencies: are any required that aren't already in the project?
- CSS/layout feasibility: will the proposed layout actually work in the browser?

### Bob's Review
- Will it perform? Estimate bundle size impact for any new dependencies.
- Image optimization: are any large images or heavy assets called for?
- Animation fps: will proposed animations run at 60fps? Name specific problematic ones.
- Loading time on slow connections: any critical path blockers?

### Required Output
- Find minimum 2 issues (one from Amelia, one from Bob)
- Write review to _corthex_full_redesign/party-logs/{phase}-{step}-critic-c.md
- Format:
  ## Critic-C Review: {step_name}
  ### Amelia (Frontend Dev)
  [in-character comment, 2-3 sentences minimum]
  Issues: [numbered list of specific problems]
  ### Bob (Performance)
  [in-character comment, 2-3 sentences minimum]
  Issues: [numbered list of specific problems]
  ### Score: {X}/10
  ### Required Fixes: [numbered list]
- Cross-talk: SendMessage to critic-a and critic-b with summary of tech/perf concerns

## Rules
- ALWAYS read FROM FILE before reviewing
- Cross-check against architecture.md and design-tokens.md
- In-character comments: 2-3 sentences minimum per role
- Zero findings = re-analyze (not allowed to pass with no issues)
- Score honestly: vague/unimplementable outputs score <= 4
```

---

## Phase 0: Foundation (기초공사)

### Step 0-1: Technical Spec (Party 3R)

**Output:** `phase-0-foundation/spec/corthex-technical-spec.md`

**Writer Instruction:**
```
[Step Instruction] Write CORTHEX Technical Spec.
Output: _corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md

Read and analyze these source files thoroughly:

Architecture:
- _bmad-output/planning-artifacts/architecture.md (D1-D21, E1-E10)
- _bmad-output/planning-artifacts/prd.md (functional + non-functional requirements)

Source Code (scan for actual routes, components, API endpoints):
- packages/server/routes/ (all route files — list every API endpoint)
- packages/app/src/ (all pages + components — list every user-facing screen)
- packages/admin/src/ (all admin pages — list every admin screen)
- packages/shared/types.ts (all shared types — data model summary)
- packages/server/db/schema.ts (all tables — DB schema summary)

v1 Reference:
- _bmad-output/planning-artifacts/v1-feature-spec.md (features that MUST exist in v2)

Write the following sections:

## 1. System Overview
- Monorepo structure (Turborepo: server, app, admin, ui, shared)
- Tech stack (Hono+Bun, React+Vite, PostgreSQL+Drizzle, pgvector)
- Deploy pipeline (GitHub Actions → Cloudflare)

## 2. User-Facing Pages (App)
For EACH page/screen in packages/app:
- Route path
- Purpose (what user does here)
- Key components used
- API endpoints called
- Data displayed/modified

## 3. Admin Pages
For EACH page in packages/admin:
- Route path
- Purpose
- Key components
- API endpoints
- CRUD operations

## 4. API Endpoint Map
For EACH route in packages/server/routes:
- Method + path
- Request/response shape
- Auth requirements
- Related DB tables

## 5. Data Model Summary
For EACH table in schema.ts:
- Table name
- Key columns + types
- Relationships (FK)
- Purpose

## 6. Engine Architecture
- agent-loop.ts flow (messages.create → hooks → tool execution)
- Hook pipeline (PreToolUse, PostToolUse, Stop)
- 3-Layer Caching (Prompt, Tool, Semantic)
- E8 boundary rules

## 7. Real-time Features
- SSE streams
- WebSocket connections (if any)
- Polling patterns

## 8. Design Constraints for UXUI
- What the UI MUST support (from v1-feature-spec)
- Performance budgets (from architecture NFRs)
- Data flow patterns the UI must accommodate
```

**Critic-A Focus:** 유저 관점에서 빠진 기능이 없는지, 화면 목록이 완전한지
**Critic-B Focus:** 기술적으로 정확한지, API/DB 매핑이 맞는지, 성능 제약 누락 없는지
**Critic-C Focus:** 구현 복잡도 평가, 성능 제약이 현실적인지, React/Hono 스택과 충돌 없는지

### Step 0-2: Vision & Identity (Party 3R)

**Output:** `phase-0-foundation/vision/corthex-vision-identity.md`

**Writer Instruction:**
```
[Step Instruction] Write CORTHEX Vision & Identity Document.
Output: _corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md

Read these references:
- _corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md (just completed)
- _bmad-output/planning-artifacts/v1-feature-spec.md
- _bmad-output/planning-artifacts/prd.md (vision, mission sections)
- _bmad-output/planning-artifacts/architecture.md (design philosophy)
- CLAUDE.md (project direction)

Write the following sections:

## 1. What is CORTHEX?
- One-paragraph elevator pitch
- The problem it solves (AI agents need organizational structure)
- Why it exists (not just another chatbot — it's an AI ORGANIZATION MANAGER)

## 2. Core Vision
- "Not 29 fixed agents — admin can freely create/edit/delete departments, human staff, AI agents"
- Dynamic org management as the fundamental differentiator
- The NEXUS metaphor (visual org chart = living nervous system)

## 3. Who Uses CORTHEX?
- Primary persona: 비개발자 조직 관리자 (non-dev org manager)
- Secondary persona: 기술 관리자 (tech admin)
- What they care about (control, visibility, trust in AI)

## 4. Emotional Design Direction
- What should users FEEL when using CORTHEX?
  - In control (not overwhelmed by AI complexity)
  - Professional (enterprise-grade, not toy-like)
  - Intelligent (the tool itself feels smart)
  - Trust (transparent AI decisions, not black box)
- What CORTHEX is NOT:
  - Not a chatbot interface (it's an org management tool)
  - Not playful/casual (it manages real business operations)
  - Not cluttered (despite many features, it should feel simple)

## 5. Brand Personality
- Voice: confident, precise, trustworthy
- Visual metaphor candidates (neural network? corporate HQ? command center? constellation?)
- Color emotion targets (what feelings should colors evoke?)
- Typography personality (authoritative but approachable)

## 6. Feature Hierarchy (for UI priority)
Rank ALL features by user importance:
- P0 (always visible): ...
- P1 (one click away): ...
- P2 (settings/admin): ...
- P3 (power user): ...

## 7. Competitive Positioning
- vs Slack (we're not a chat app)
- vs Linear/Jira (we're not a project manager)
- vs custom AI dashboards (we're a full org system)
- What makes CORTHEX's UI unique?

## 8. Design Principles (for all subsequent phases)
5-7 design principles that ALL future design decisions must follow.
Example: "Show the org, not the AI" — users should see their organization structure, not raw AI interfaces.
```

**Critic-A Focus:** 비전이 설득력 있는지, 감정 방향이 모순 없는지, 유저 페르소나가 현실적인지
**Critic-B Focus:** 기능 계층이 기술적으로 맞는지, 경쟁 포지셔닝이 정확한지
**Critic-C Focus:** 디자인 원칙이 구현 가능한지, 성능 목표가 현실적인지 (Lighthouse 점수 등)

---

## Phase 1: Research (리서치)

### Step 1-1: Web Dashboard Layout Research (Party 2R)

**Output:** `phase-1-research/web-dashboard/web-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research web dashboard layouts for AI SaaS platforms.
Output: _corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md

Read these references first:
- _corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md
- _corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md
- _corthex_full_redesign/context-snapshots/*.md

Use WebSearch and WebFetch to research REAL, CURRENT (2025-2026) web dashboards.

Research targets (search for these specifically):
1. AI/ML platform dashboards (Anthropic Console, OpenAI Platform, Hugging Face, Weights & Biases)
2. Org management tools (Notion, Linear, Slack admin, Microsoft Teams admin)
3. Enterprise SaaS dashboards (Vercel, Supabase, Neon, Planetscale)
4. Design system showcases (Tailwind UI, shadcn/ui examples, Radix UI)
5. AI agent management UIs (if any exist — CrewAI, AutoGen Studio, LangFlow)

For EACH reference found, document:
- Screenshot description (or detailed visual description if no screenshot)
- Layout pattern: sidebar type, header type, content area structure
- Navigation pattern: flat, nested, breadcrumb, tabs
- Color scheme: exact colors if identifiable
- Typography: font family, hierarchy
- Key UX pattern: what makes this dashboard work well
- URL source

Then select TOP 3 options most suitable for CORTHEX:
For each option:
- Layout diagram (ASCII art showing grid structure)
- Why this works for CORTHEX specifically
- How it handles: sidebar nav, main content, modals, notifications, org chart view
- Specific Tailwind/CSS grid structure
- Responsive breakpoint strategy
- Pros and cons for CORTHEX's feature set
```

**Critic-A Focus:** 선택한 3개가 CORTHEX 비전에 맞는지, 유저가 실제로 편할지
**Critic-B Focus:** 시각적 위계, WCAG AA 대비, 반응형 가능성
**Critic-C Focus:** 기술적 구현 가능성, 성능, 복잡도 (CSS Grid/Flex 실현 여부, 번들 크기 영향)

### Step 1-2: App Layout Research (Party 2R)

**Output:** `phase-1-research/app/app-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research app layouts for AI/enterprise mobile apps.
Output: _corthex_full_redesign/phase-1-research/app/app-layout-research.md

Read references: phase-0 outputs + context-snapshots

Use WebSearch to research REAL mobile app patterns (2025-2026):
1. AI assistant apps (ChatGPT mobile, Claude mobile, Gemini app)
2. Enterprise management apps (Slack mobile, Teams mobile, Notion mobile)
3. Dashboard apps (Vercel mobile, AWS Console mobile)
4. App design pattern libraries (Material Design 3, Apple HIG)

For each reference: layout pattern, nav pattern (bottom tab? drawer? stack?),
gesture patterns, color scheme, typography.

Select TOP 3 options for CORTHEX mobile:
For each:
- Screen flow diagram (ASCII)
- Navigation structure (tab bar items, stack hierarchy)
- How it handles: agent chat, org chart view, notifications, admin functions
- Touch target sizes, gesture patterns
- Stitch-specific considerations (what Stitch can/can't generate)
- Pros and cons
```

### Step 1-3: Landing Page Research (Party 2R)

**Output:** `phase-1-research/landing/landing-page-research.md`

**Writer Instruction:**
```
[Step Instruction] Research landing pages for AI/SaaS products.
Output: _corthex_full_redesign/phase-1-research/landing/landing-page-research.md

Read references: phase-0 outputs + context-snapshots

Use WebSearch to research REAL landing pages (2025-2026):
1. AI product landing pages (Anthropic.com, OpenAI.com, Midjourney.com)
2. SaaS landing pages (Vercel.com, Linear.app, Notion.so)
3. Enterprise AI landing pages (Datadog, Weights & Biases)
4. Landing page design showcases (Awwwards, Dribbble, Land-book.com)
5. Login/signup page designs (Auth0, Clerk, Supabase Auth UI)

For each reference: hero section pattern, CTA placement, scroll flow,
animation/interaction style, login integration, color mood.

Select TOP 3 landing page options for CORTHEX:
For each:
- Full page wireframe (ASCII art showing sections top to bottom)
- Hero section design (headline, subhead, CTA, visual)
- Login/signup integration (where does the auth form go?)
- Scroll sections (feature showcase, social proof, pricing if applicable)
- Animation/motion design approach
- Color mood + typography pairing
- How it communicates CORTHEX's value in under 5 seconds
- Pros and cons
```

---

## Phase 2: Deep Analysis (심층 분석 + 구현 명세)

### Step 2-1: Web Options Deep Analysis (Party 3R)

**Output:** `phase-2-analysis/web-analysis.md`

**Writer Instruction:**
```
[Step Instruction] Deep analysis of 3 web dashboard options + React implementation spec.
Output: _corthex_full_redesign/phase-2-analysis/web-analysis.md

Read: phase-0 all + phase-1 web research + context-snapshots

For EACH of the 3 web options from Phase 1:

## Design Philosophy Analysis
- What design movement/school does this follow? (Swiss, Material, Fluent, etc.)
- What emotional response does it create?
- How does it align with CORTHEX vision & design principles?
- User flow analysis: how does user navigate key tasks?
  - Task 1: Create a new AI agent → steps + screens
  - Task 2: View org chart (NEXUS) → steps + screens
  - Task 3: Chat with an agent → steps + screens
  - Task 4: Manage knowledge base → steps + screens

## UX Deep Dive
- Information architecture (IA) diagram
- Cognitive load analysis (how many things compete for attention)
- Fitts's Law analysis (are key targets easy to reach?)
- Hick's Law analysis (are choices manageable?)

## React Implementation Spec
- Component tree (top-level layout → page → section → component)
- Exact Tailwind classes for layout structure
- React Router structure (routes, nested routes, layouts)
- State management approach (what's global? what's local?)
- Key component list with props interface (TypeScript)
- Estimated component count
- Third-party dependencies needed (React Flow for NEXUS, etc.)

## Scoring (1-10 for each)
- CORTHEX Vision Alignment: X/10
- User Experience: X/10
- Implementation Feasibility: X/10
- Performance: X/10
- Accessibility: X/10
- Total: XX/50
```

### Step 2-2: App Options Deep Analysis (Party 3R)

**Output:** `phase-2-analysis/app-analysis.md`
(Same structure as 2-1 but for mobile app, with React Native/Stitch considerations)

### Step 2-3: Landing Options Deep Analysis (Party 3R)

**Output:** `phase-2-analysis/landing-analysis.md`
(Same structure but for landing pages, with HTML + React hybrid considerations)

---

## Phase 3: Design System (디자인 시스템)

### Step 3-1: Design Tokens (Party 3R)

**Output:** `phase-3-design-system/design-tokens.md`

**Writer Instruction:**
```
[Step Instruction] Define CORTHEX design tokens.
Output: _corthex_full_redesign/phase-3-design-system/design-tokens.md

Read: ALL phase-0, phase-1, phase-2 outputs + context-snapshots

Based on the winning options from Phase 2 scoring, define:

## Color System
- Primary palette: 5 shades (50-900) with exact hex + Tailwind mapping
- Secondary palette: 5 shades
- Neutral palette: 10 shades (slate/gray/zinc)
- Semantic colors: success, warning, error, info (each with 3 shades)
- Surface colors: bg-primary, bg-secondary, bg-elevated, bg-overlay
- Text colors: text-primary, text-secondary, text-muted, text-inverse
- Border colors: border-default, border-hover, border-active
- WCAG AA contrast ratios verified for all text/bg combinations

## Typography Scale
- Font family: primary (headings) + secondary (body) + mono (code)
- Size scale: xs through 4xl with exact px + rem + line-height
- Weight scale: light, regular, medium, semibold, bold
- Letter spacing per size
- Tailwind config additions

## Spacing Scale
- Base unit: 4px
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64
- Component-specific spacing rules (card padding, section gaps, etc.)

## Border & Shadow
- Border radius scale: none, sm, md, lg, xl, 2xl, full
- Shadow scale: sm, md, lg, xl, 2xl (with exact values)
- Border width: 1px, 2px

## Motion & Animation
- Duration scale: fast (100ms), normal (200ms), slow (300ms), lazy (500ms)
- Easing curves: ease-out (primary), ease-in-out (secondary)
- Transition properties per component type

## Icon System
- Icon library choice (Lucide? Heroicons? Phosphor?)
- Size scale: xs(12), sm(16), md(20), lg(24), xl(32)
- Stroke width standard

## Dark Mode
- Full token mapping for dark variant
- Auto-detection strategy (system preference + manual toggle)

Output as both:
1. Human-readable documentation
2. Tailwind config snippet (tailwind.config.ts extend section)
```

### Step 3-2: Component Strategy (Party 3R)

**Output:** `phase-3-design-system/component-strategy.md`

**Writer Instruction:**
```
[Step Instruction] Define component library strategy for CORTHEX.
Output: _corthex_full_redesign/phase-3-design-system/component-strategy.md

Read: ALL previous phase outputs + context-snapshots

## Base Library Decision
Evaluate and choose ONE:
- shadcn/ui (Radix + Tailwind) — current project uses this?
- Headless UI + custom styling
- Radix Primitives + custom
- Full custom

For each option: pros, cons, CORTHEX fit score.

## Component Inventory
List EVERY component CORTHEX needs, categorized:

### Primitives (atoms)
Button, Input, Select, Checkbox, Radio, Toggle, Badge, Avatar, Tooltip, etc.
For each: variants, sizes, states, props interface

### Composites (molecules)
Card, Modal, Dropdown, Tabs, Breadcrumb, Pagination, Toast, etc.

### Features (organisms)
AgentCard, OrgChart (NEXUS), ChatWindow, KnowledgePanel, TierBadge, etc.

### Layouts
AppShell, Sidebar, Header, PageContainer, SplitPane, etc.

## Component API Standards
- Prop naming conventions
- Variant pattern (cva? class-variance-authority?)
- Composition pattern (compound components? render props?)
- Accessibility requirements per component (ARIA roles, keyboard nav)

## Stitch → React Migration Strategy
How generated Stitch components will be decomposed into this system:
- What Stitch generates (monolithic pages)
- How to break into reusable components
- What to keep, what to rewrite
- Naming convention mapping
```

---

## Phase 4: Theme Creation (테마 생성)

### Step 4-1: Creative Themes (Party 3R)

**Output:** `phase-4-themes/themes-creative.md`

**Writer Instruction:**
```
[Step Instruction] Create 5 creative CORTHEX themes.
Output: _corthex_full_redesign/phase-4-themes/themes-creative.md

Read: ALL previous phase outputs + context-snapshots

Create 5 DISTINCT, CREATIVE themes for CORTHEX.
Each theme must be dramatically different from the others.
Use the design tokens from Phase 3 as the base, with theme-specific overrides.

For EACH theme:

## Theme Name: [Creative Name]
### Concept
- One-line pitch: "..."
- Visual metaphor: (what real-world thing does this look like?)
- Mood board description: (imagine 4 images that capture this mood)
- Design movement influence: (which movement inspires this?)

### Color Override
- Primary: [hex] — why this color
- Accent: [hex]
- Background: [hex]
- Full palette with all token overrides

### Typography Override
- Heading font: [name] — why
- Body font: [name] — why
- Character: what personality does this type give?

### Visual Details
- Sidebar style: (transparent? solid? gradient? glass?)
- Card style: (bordered? elevated? flat? glassmorphism?)
- Button style: (sharp? rounded? pill? ghost?)
- Icon style: (outlined? filled? duotone?)
- Animation mood: (snappy? smooth? playful? minimal?)

### Sample Screen Description
Describe the main dashboard as it would look in this theme:
- Exact layout with Tailwind classes
- Exact colors applied to each element
- How the sidebar looks
- How an agent card looks
- How the NEXUS org chart looks

### Who This Theme Is For
- What kind of user would love this?
- What emotion does it evoke?
- What industry/context fits best?

THEME IDEAS TO EXPLORE (suggestions, not requirements):
1. Neural Network / Synapse — dark, glowing nodes, data-flow animations
2. Corporate Command Center — clean, authoritative, Bloomberg-terminal-like
3. Minimalist Nordic — white space, calm, paper-like textures
4. Cyberpunk HQ — neon accents, dark backgrounds, tech-forward
5. Nature / Organic — earth tones, gentle curves, breathing animations
```

### Step 4-2: Accessibility Audit (1R Verification)

**Output:** `phase-4-themes/themes-accessibility-audit.md`

**Writer Instruction:**
```
[Step Instruction] WCAG 2.1 AA audit for all 5 themes.
Output: _corthex_full_redesign/phase-4-themes/themes-accessibility-audit.md

For EACH theme, verify:
- All text/bg color combinations meet WCAG AA (4.5:1 normal, 3:1 large)
- Interactive elements have focus indicators
- Color is never the sole means of conveying information
- Motion respects prefers-reduced-motion
- Touch targets >= 44×44px (mobile)

Use contrast ratio calculations for every color pair.
Flag failures with specific fix suggestions.
```

---

## Phase 5: Prompt Engineering (프롬프트)

### Step 5-1: Web Stitch Prompt (Party 3R)

**Output:** `phase-5-prompts/stitch-prompt-web.md`

**Writer Instruction:**
```
[Step Instruction] Create Google Stitch prompt for CORTHEX web version.
Output: _corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md

Read: ALL previous phase outputs (especially winning theme + design tokens + component strategy)

Create a DETAILED, READY-TO-PASTE prompt for Google Stitch that will generate
CORTHEX's web dashboard UI.

The prompt must include:
1. Project description (what CORTHEX is, who uses it)
2. Exact visual specifications (from design tokens + winning theme)
3. Page-by-page descriptions:
   - Dashboard/Hub main view
   - Agent management page
   - NEXUS org chart view
   - Knowledge library page
   - Chat/conversation view
   - Admin settings
   - Landing page (pre-login)
4. Component specifications (from component strategy)
5. Color palette (exact hex values)
6. Typography (exact fonts + sizes)
7. Layout structure (exact grid/flex specifications)
8. Interaction specifications (hover, click, transitions)
9. Responsive breakpoints
10. "Generate as React with Tailwind CSS" instruction
    (Fallback: "Generate as HTML first, then I will convert to React")

The prompt should be structured so Stitch can generate EACH PAGE separately
(multiple prompts if needed — one per page).

Also create a "master prompt" that establishes the design system for all pages.
```

### Step 5-2: App Stitch Prompt (Party 3R)

**Output:** `phase-5-prompts/stitch-prompt-app.md`

(Same structure but for mobile app, with Stitch mobile-specific instructions)

---

## Phase 6: External Generation (사용자 수동)

```
이 Phase는 사용자가 직접 수행합니다:
1. phase-5-prompts/의 프롬프트를 복사
2. Google Stitch에 붙여넣기
3. 생성된 결과물을 phase-6-generated/web/ 및 phase-6-generated/app/에 배치
4. 사용자가 "Phase 7 시작"을 요청하면 Orchestrator 재개

Orchestrator는 이 Phase에서 대기합니다.
pipeline-status.yaml에 "phase-6: waiting-for-user"로 기록.
```

---

## Phase 7: Integration (통합)

### Step 7-1: Component Decomposition (Party 3R)

**Output:** `phase-7-integration/component-decomposition.md` + 실제 코드

**Writer Instruction:**
```
[Step Instruction] Decompose Stitch output into React components.

Read: phase-6-generated/ (Stitch output) + phase-3 component strategy

1. Analyze Stitch-generated code
2. Identify reusable components
3. Map to component inventory from Phase 3
4. Create component files in packages/ui/src/ or packages/app/src/components/
5. Apply design tokens from Phase 3
6. Ensure TypeScript types are correct
```

### Step 7-2: Routing & State (Party 3R)

```
Connect components to React Router.
Set up state management (React Context / Zustand / etc.)
Wire up navigation between pages.
```

### Step 7-3: API Binding (Party 3R)

```
Connect React components to actual backend API endpoints.
Wire up SSE for real-time features.
Implement data fetching (SWR/React Query/native fetch).
Verify all CRUD operations work end-to-end.
```

### Step 7-4: Accessibility Final Audit (Party 3R)

```
Full WCAG 2.1 AA audit on the integrated product.
Keyboard navigation testing.
Screen reader testing.
Color contrast verification.
Focus management verification.
Performance audit (Lighthouse).
```

---

## Orchestrator Execution Flow

```
Step 0: Setup
  → mkdir -p _corthex_full_redesign/{phase-0..7 subdirs}
  → Initialize pipeline-status.yaml
  → TeamCreate (team: uxui-redesign)

Step 1: For each Phase (0 through 5):
  → Read pipeline-status.yaml for current state
  → Read ALL context-snapshots/*.md
  → Spawn Writer + Critic-A + Critic-B + Critic-C for the Phase
  → For each Step in Phase:
    → Send [Step Instruction] to Writer
    → Monitor party mode (timeout: 15min per step)
    → Validate party-logs exist
    → Verify score >= 7
  → On Phase complete:
    → git add _corthex_full_redesign/
    → git commit: "docs(uxui-redesign): Phase {N} complete -- {steps} steps, party-{2R|3R}"
    → Update pipeline-status.yaml
    → Shutdown team, spawn fresh for next Phase

Step 2: Phase 6 (User Manual)
  → Update pipeline-status.yaml: "phase-6: waiting-for-user"
  → Report to user: "Phase 5 완료. Stitch 프롬프트 준비됨. 생성 후 phase-6-generated/에 넣어주세요."
  → STOP

Step 3: Phase 7 (User triggers)
  → Spawn new team
  → Execute 4 integration steps
  → Final commit + push + deploy verification

Step 4: Report
  → "UXUI Redesign Pipeline 완료. {total_steps} steps, {total_party_rounds} party rounds."
```

---

## Defense Mechanisms (from kdh-full-auto-pipeline)

- max_retry: 2 per step (FAIL 3x = ESCALATE)
- step_timeout: 15min + 2min grace (stall 3x = SKIP)
- Party-log validation: critic-a.md + critic-b.md + critic-c.md + fixes.md must exist
- Context-snapshot after EVERY step
- On respawn: inject ALL context-snapshots
- Team failure → single-worker fallback
- Pipeline never blocks — timeout/fail/escalate always leads to "continue"

---

### Timeout Strategy
- step_timeout: 15 minutes (per UXUI step)
- party_timeout: 15 minutes (per party round)
- grace_period: 2 minutes
- stall_threshold: 5 minutes (no message = stalled)
- max_stalls: 3 → SKIP step

---

### Anti-patterns & Failure Modes

#### Inherited from kdh-full-auto-pipeline (v6.0)
1. Writer calls Skill tool → bypasses critic review loop
2. Writer batches all steps → critics can't give step-by-step feedback
3. Orchestrator says "run this skill" → Writer calls Skill tool
4. Shutdown-before-continue race
5. Workers skip mandatory skills
6. Stale resources (tmux/worktree/team) accumulate

#### UXUI-Specific (to be filled after v1.1 execution)
- [TBD — document failures during first run]

---

### Context Snapshot Schema
After each step, save to: _corthex_full_redesign/context-snapshots/{phase}-{step}-snapshot.md

Contents:
  ## {step_name}
  - Decisions: (what was decided and why)
  - Design tokens referenced: (exact hex, Tailwind classes)
  - Constraints for next step: (what MUST be respected)
  - Connections: (how this relates to previous steps)
  - Critic scores: A={X}/10, B={X}/10, C={X}/10

---

## Absolute Rules

1. ALL outputs must be SPECIFIC (exact hex, exact Tailwind, exact px). "Vague" = instant FAIL.
2. Writer NEVER uses Skill tool — reads instructions and writes manually
3. Writer writes ONE step → review → fix → verify → THEN next step
4. Every step must produce a context-snapshot for cross-phase continuity
5. Phase 1 research must cite REAL URLs and REAL products (no made-up references)
6. Design tokens must include WCAG AA contrast ratios for all text/bg pairs
7. Stitch prompts must be COPY-PASTE READY (no "[fill in]" placeholders)
8. Phase 7 integration must produce WORKING code (no stubs/mocks)
9. git commit after each Phase (not per step)
10. Orchestrator=opus, Workers=sonnet
11. Model strategy can be overridden by user request only
12. pipeline-status.yaml is the single source of truth for progress
13. On resume: read pipeline-status.yaml + ALL context-snapshots before proceeding
14. 3 Critics required for all party mode phases (A: UX+Brand, B: Visual+A11y, C: Tech+Performance)
15. Anti-patterns from kdh-full-auto apply to this pipeline (shared team engine)
16. Context snapshots include exact design token values (hex, Tailwind classes, px)

---

## Troubleshooting

### Writer produces vague output ("clean colors", "modern layout")
**Fix:** Critic-A, Critic-B, and Critic-C MUST reject with specific replacement suggestions. Score 0 for vague outputs.

### Research phase finds no good references
**Fix:** Expand search to adjacent domains (fintech dashboards, healthcare admin UIs, etc.)

### Stitch can't generate React directly
**Fix:** Prompt includes fallback: "Generate as HTML with Tailwind first, then convert to React"

### Phase 7 integration breaks existing functionality
**Fix:** npx tsc --noEmit before every commit. Run existing tests. Never merge breaking changes.

### User changes design direction mid-pipeline
**Fix:** Use pipeline-status.yaml to mark phases as "invalidated". Re-run from the changed phase forward.

ARGUMENTS: $ARGUMENTS
