---
name: 'kdh-uxui-redesign-full-auto-pipeline'
description: 'UXUI Full Redesign Pipeline v2.0. Foundation→Research→Analysis→DesignSystem→Themes→Prompts→Integration. Usage: /kdh-uxui-redesign-full-auto-pipeline [phase-N|all|resume]'
---

# UXUI Full Redesign Pipeline v2.0

Phase 0~5 자동 → Phase 6 수동(Stitch) → Phase 7 통합.
Output root: `_corthex_full_redesign/`

## Mode Selection

- `all` or no args: Phase 0→5 (Phase 6 수동, Phase 7 대기)
- `phase-N`: 특정 Phase만 실행
- `resume`: pipeline-status.yaml + context-snapshots 기반 재개

## Pipeline Overview

| Phase | Name | Mode | Steps |
|-------|------|------|-------|
| 0 | Foundation | 3R × 2 | spec + vision |
| 1 | Research | 2R × 3 | web + app + landing |
| 2 | Deep Analysis | 3R × 3 | web + app + landing options |
| 3 | Design System | 3R × 2 | tokens + components |
| 4 | Themes | 3R + 1R | 5 themes + a11y audit |
| 5 | Prompts | 3R × 2 | web + app Stitch prompts |
| 6 | Manual | user | Stitch generation |
| 7 | Integration | 3R × 4 | decompose + routing + API + a11y |

Folders: `phase-0-foundation/`, `phase-1-research/`, `phase-2-analysis/`, `phase-3-design-system/`, `phase-4-themes/`, `phase-5-prompts/`, `phase-6-generated/`, `phase-7-integration/`, `context-snapshots/`, `party-logs/`, `pipeline-status.yaml`

## Model Strategy

Orchestrator=opus, Writer/Critics=sonnet by default.

**Opus overrides for critics:**

| Step | Why |
|------|-----|
| 0-1 Technical Spec | 기술 스펙이 모든 후속 Phase의 기반 |
| 2-* Deep Analysis | 최종 옵션 선택 = 전체 디자인 방향 결정 |
| 3-1 Design Tokens | 토큰이 모든 컴포넌트/테마의 기초 |
| 7-3 API Binding | 백엔드 연동 실수 = 런타임 버그 |

## Party Mode

3R = Write → Review×3 critics → Fix → Verify → Score. 2R = Write → Review×3 → Fix → Score.
Pass: avg score >= 7/10 across all 3 critics. Fail: retry (max 2) → escalate → continue.

**Critics:**
- **Critic-A (UX+Brand):** Sally (유저 옹호) + Luna (브랜드 일관성)
- **Critic-B (Visual+A11y):** Marcus (시각적 위계) + Quinn (WCAG 검증)
- **Critic-C (Tech+Perf):** Amelia (구현 현실성) + Bob (성능 현실성)

## Writer Prompt Template

```
You are a UXUI REDESIGN WRITER in team "{team_name}". Model: sonnet. YOLO mode.

PROHIBITIONS: Never use Skill tool. Never write more than ONE step before review. Never auto-proceed — wait for Orchestrator.

PER-STEP LOOP:
1. Read step instruction + ALL reference docs + context-snapshots
2. Write section — CONCRETE, SPECIFIC, NO PLACEHOLDERS
3. SendMessage to critic-a, critic-b, critic-c: "[Review Request] {step_name}. File: {path} lines {start}-{end}"
4. WAIT for all 3 critics
5. Read ALL critic logs FROM FILE → apply fixes → write to party-logs/{phase}-{step}-fixes.md
6. SendMessage to all critics: "[Fixes Applied]" → WAIT for scores
7. avg >= 7: PASS → save context-snapshot → report. avg < 7 + retry < 2: rewrite. Else: ESCALATE

OUTPUT QUALITY (ABSOLUTE):
- Colors: exact hex + Tailwind (e.g., `bg-indigo-500 (#6366F1)`)
- Spacing: exact values (e.g., `gap-6 (24px)`)
- Typography: font + weight + size (e.g., `Inter 600 text-lg (18px/28px)`)
- Layout: exact CSS/Tailwind (e.g., `grid grid-cols-[280px_1fr] h-screen`)
- NO vague words: "clean", "modern", "professional" → SPECIFIC visual specs
```

## Critic-C Prompt Template

```
You are CRITIC-C in team "{team_name}". Model: sonnet. YOLO mode.

ROLES: Amelia (Frontend Dev) — "이 레이아웃은 CSS Grid 3줄이면 된다." Bob (Performance) — "이 애니메이션 60fps 못 나온다."

ON REVIEW:
1. Read file FROM DISK + context-snapshots + architecture.md + design-tokens.md
2. Amelia: React/Tailwind feasibility, component count, dependencies, CSS layout
3. Bob: bundle size, image optimization, animation fps, loading time
4. Min 2 issues (1 per role). Write to party-logs/{phase}-{step}-critic-c.md
5. Cross-talk: SendMessage to critic-a, critic-b with summary
6. Score honestly: vague/unimplementable <= 4. Zero findings = re-analyze.
```

---

## Phase 0: Foundation

### Step 0-1: Technical Spec (3R, critics=opus)

**Output:** `phase-0-foundation/spec/corthex-technical-spec.md`

**Writer Instruction:**
```
[Step Instruction] Write CORTHEX Technical Spec.
Output: _corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md

Read and analyze:
- _bmad-output/planning-artifacts/architecture.md (D1-D21, E1-E10)
- _bmad-output/planning-artifacts/prd.md
- packages/server/routes/ (all API endpoints)
- packages/app/src/ (all user-facing screens)
- packages/admin/src/ (all admin screens)
- packages/shared/types.ts + packages/server/db/schema.ts
- _bmad-output/planning-artifacts/v1-feature-spec.md

Write sections:
1. System Overview — monorepo structure, tech stack, deploy pipeline
2. User-Facing Pages (App) — for EACH: route, purpose, components, API endpoints, data
3. Admin Pages — for EACH: route, purpose, components, API endpoints, CRUD ops
4. API Endpoint Map — for EACH route: method+path, req/res shape, auth, DB tables
5. Data Model Summary — for EACH table: name, columns+types, FKs, purpose
6. Engine Architecture — agent-loop flow, hook pipeline, 3-layer caching, E8 boundary
7. Real-time Features — SSE, WebSocket, polling
8. Design Constraints for UXUI — v1 must-haves, NFR budgets, data flow patterns
```

**Critic-A Focus:** 유저 관점 빠진 기능, 화면 목록 완전성
**Critic-B Focus:** API/DB 매핑 정확성, 성능 제약 누락
**Critic-C Focus:** 구현 복잡도, 성능 제약 현실성, React/Hono 스택 충돌

### Step 0-2: Vision & Identity (3R)

**Output:** `phase-0-foundation/vision/corthex-vision-identity.md`

**Writer Instruction:**
```
[Step Instruction] Write CORTHEX Vision & Identity Document.
Output: _corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md

Read: phase-0-1 output + v1-feature-spec + prd + architecture + CLAUDE.md

Write sections:
1. What is CORTHEX? — elevator pitch, problem, why it exists
2. Core Vision — dynamic org management (not 29 fixed agents), NEXUS metaphor
3. Who Uses CORTHEX? — primary (비개발자 조직 관리자), secondary (기술 관리자), what they care about
4. Emotional Design Direction — feel: in control, professional, intelligent, trustworthy. NOT: chatbot, playful, cluttered
5. Brand Personality — voice, visual metaphor candidates, color emotion targets, typography personality
6. Feature Hierarchy — P0 (always visible) through P3 (power user), rank ALL features
7. Competitive Positioning — vs Slack/Linear/custom AI dashboards, what makes CORTHEX unique
8. Design Principles — 5-7 principles for all future design decisions (e.g., "Show the org, not the AI")
```

**Critic-A Focus:** 비전 설득력, 감정 방향 모순, 페르소나 현실성
**Critic-B Focus:** 기능 계층 기술 정확성, 경쟁 포지셔닝
**Critic-C Focus:** 디자인 원칙 구현 가능성, 성능 목표 현실성

---

## Phase 1: Research

### Step 1-1: Web Dashboard Layout (2R)

**Output:** `phase-1-research/web-dashboard/web-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research web dashboard layouts for AI SaaS platforms.
Output: _corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md

Read: phase-0 outputs + context-snapshots

WebSearch real 2025-2026 dashboards:
1. AI/ML platforms (Anthropic Console, OpenAI, HuggingFace, W&B)
2. Org management (Notion, Linear, Slack admin, Teams admin)
3. Enterprise SaaS (Vercel, Supabase, Neon, Planetscale)
4. Design systems (Tailwind UI, shadcn/ui, Radix UI)
5. AI agent UIs (CrewAI, AutoGen Studio, LangFlow)

For EACH reference: layout pattern, nav pattern, color scheme, typography, key UX pattern, URL.

Select TOP 3 for CORTHEX. For each:
- ASCII layout diagram + grid structure
- Why it works for CORTHEX
- How it handles: sidebar, main content, modals, notifications, NEXUS view
- Tailwind/CSS grid structure + responsive breakpoints
- Pros and cons
```

**Critic-A Focus:** CORTHEX 비전 적합성, 유저 편의
**Critic-B Focus:** 시각적 위계, WCAG AA, 반응형
**Critic-C Focus:** CSS Grid/Flex 구현성, 번들 크기 영향

### Step 1-2: App Layout (2R)

**Output:** `phase-1-research/app/app-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research app layouts for AI/enterprise mobile apps.
Output: _corthex_full_redesign/phase-1-research/app/app-layout-research.md

Read: phase-0 outputs + context-snapshots

WebSearch real 2025-2026 mobile patterns:
1. AI apps (ChatGPT, Claude, Gemini mobile)
2. Enterprise apps (Slack, Teams, Notion mobile)
3. Dashboard apps (Vercel, AWS Console mobile)
4. Pattern libraries (Material Design 3, Apple HIG)

For each: layout, nav (bottom tab/drawer/stack), gestures, colors, typography.

TOP 3 for CORTHEX mobile. For each:
- ASCII screen flow + nav structure
- How it handles: agent chat, org chart, notifications, admin
- Touch targets, gesture patterns
- Stitch considerations
- Pros and cons
```

### Step 1-3: Landing Page (2R)

**Output:** `phase-1-research/landing/landing-page-research.md`

**Writer Instruction:**
```
[Step Instruction] Research landing pages for AI/SaaS products.
Output: _corthex_full_redesign/phase-1-research/landing/landing-page-research.md

Read: phase-0 outputs + context-snapshots

WebSearch real 2025-2026 landing pages:
1. AI products (Anthropic, OpenAI, Midjourney)
2. SaaS (Vercel, Linear, Notion)
3. Enterprise AI (Datadog, W&B)
4. Showcases (Awwwards, Land-book.com)
5. Auth UIs (Auth0, Clerk, Supabase Auth)

For each: hero pattern, CTA, scroll flow, animations, login integration, color mood.

TOP 3 for CORTHEX. For each:
- Full page wireframe (ASCII)
- Hero section + login/signup integration
- Scroll sections + animation approach
- Color mood + typography pairing
- How it communicates CORTHEX value in <5 seconds
- Pros and cons
```

---

## Phase 2: Deep Analysis

### Step 2-1: Web Options (3R, critics=opus)

**Output:** `phase-2-analysis/web-analysis.md`

**Writer Instruction:**
```
[Step Instruction] Deep analysis of 3 web dashboard options + React implementation spec.
Output: _corthex_full_redesign/phase-2-analysis/web-analysis.md

Read: phase-0 all + phase-1 web research + context-snapshots

For EACH of the 3 web options:

## Design Philosophy Analysis
- Design movement, emotional response, CORTHEX vision alignment
- User flow for: Create agent → View NEXUS → Chat → Manage knowledge

## UX Deep Dive
- IA diagram, cognitive load, Fitts's Law, Hick's Law

## React Implementation Spec
- Component tree, exact Tailwind layout classes
- React Router structure, state management approach
- Key components with TypeScript props interface
- Estimated component count, third-party deps needed

## Scoring (1-10 each)
Vision Alignment + UX + Feasibility + Performance + Accessibility = Total/50
```

### Step 2-2: App Options (3R, critics=opus)

**Output:** `phase-2-analysis/app-analysis.md`
Same structure as 2-1 for mobile app with React Native/Stitch considerations.

### Step 2-3: Landing Options (3R, critics=opus)

**Output:** `phase-2-analysis/landing-analysis.md`
Same structure for landing pages with HTML+React hybrid considerations.

---

## Phase 3: Design System

### Step 3-1: Design Tokens (3R, critics=opus)

**Output:** `phase-3-design-system/design-tokens.md`

**Writer Instruction:**
```
[Step Instruction] Define CORTHEX design tokens.
Output: _corthex_full_redesign/phase-3-design-system/design-tokens.md

Read: ALL phase-0, phase-1, phase-2 outputs + context-snapshots

Based on winning options from Phase 2, define:

1. Color System — primary (5 shades), secondary (5), neutral (10), semantic (success/warning/error/info × 3), surface, text, border colors. WCAG AA verified.
2. Typography Scale — primary+body+mono fonts, xs~4xl with px/rem/line-height, weights, letter spacing, Tailwind config.
3. Spacing Scale — base 4px, scale 0~64, component-specific rules.
4. Border & Shadow — radius (none~full), shadow (sm~2xl), border width.
5. Motion & Animation — duration (100~500ms), easing curves, per-component transitions.
6. Icon System — library choice, size scale (12~32), stroke width.
7. Dark Mode — full token mapping, auto-detection strategy.

Output as: (1) human-readable docs + (2) tailwind.config.ts extend snippet.
```

### Step 3-2: Component Strategy (3R)

**Output:** `phase-3-design-system/component-strategy.md`

**Writer Instruction:**
```
[Step Instruction] Define component library strategy.
Output: _corthex_full_redesign/phase-3-design-system/component-strategy.md

Read: ALL previous outputs + context-snapshots

1. Base Library Decision — evaluate shadcn/ui vs Headless UI vs Radix vs custom. Pick ONE with scores.
2. Component Inventory:
   - Primitives: Button, Input, Select, Checkbox, etc. → variants, sizes, states, props
   - Composites: Card, Modal, Dropdown, Tabs, Toast, etc.
   - Features: AgentCard, OrgChart (NEXUS), ChatWindow, KnowledgePanel, TierBadge
   - Layouts: AppShell, Sidebar, Header, PageContainer, SplitPane
3. Component API Standards — prop naming, variant pattern (cva?), composition, ARIA/keyboard reqs
4. Stitch → React Migration — how monolithic Stitch output → reusable components, naming mapping
```

---

## Phase 4: Themes

### Step 4-1: Creative Themes (3R)

**Output:** `phase-4-themes/themes-creative.md`

**Writer Instruction:**
```
[Step Instruction] Create 5 creative CORTHEX themes.
Output: _corthex_full_redesign/phase-4-themes/themes-creative.md

Read: ALL previous outputs + context-snapshots. Use Phase 3 tokens as base.

For EACH of 5 dramatically different themes:

## Theme Name: [Creative Name]
- Concept: one-line pitch, visual metaphor, mood board description, design movement
- Color Override: primary/accent/background hex + full palette overrides
- Typography Override: heading+body fonts + personality
- Visual Details: sidebar/card/button/icon/animation style (exact Tailwind)
- Sample Dashboard: exact layout with Tailwind classes, exact colors per element, sidebar/agent card/NEXUS appearance
- Target User: who loves this, emotion evoked, industry fit

Theme ideas: Neural Network, Corporate Command Center, Minimalist Nordic, Cyberpunk HQ, Nature/Organic
```

### Step 4-2: Accessibility Audit (1R)

**Output:** `phase-4-themes/themes-accessibility-audit.md`

**Writer Instruction:**
```
[Step Instruction] WCAG 2.1 AA audit for all 5 themes.
Output: _corthex_full_redesign/phase-4-themes/themes-accessibility-audit.md

For EACH theme: verify text/bg contrast (4.5:1 normal, 3:1 large), focus indicators,
color-not-sole-info, prefers-reduced-motion, touch targets >= 44×44px.
Calculate contrast ratios for every color pair. Flag failures with fix suggestions.
```

---

## Phase 5: Prompts

### Step 5-1: Web Stitch Prompt (3R)

**Output:** `phase-5-prompts/stitch-prompt-web.md`

**Writer Instruction:**
```
[Step Instruction] Create Google Stitch prompt for CORTHEX web.
Output: _corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md

Read: ALL previous outputs (especially winning theme + tokens + components)

Create COPY-PASTE READY Stitch prompt including:
1. Project description (what CORTHEX is, users)
2. Exact visual specs (tokens + theme)
3. Page-by-page: Dashboard, Agent mgmt, NEXUS, Knowledge, Chat, Admin, Landing
4. Component specs, color palette (hex), typography (fonts+sizes)
5. Layout (grid/flex), interactions (hover/click/transitions), responsive breakpoints
6. "Generate as React with Tailwind CSS" (fallback: HTML first)

Structure for per-page generation + master design system prompt. NO placeholders.
```

### Step 5-2: App Stitch Prompt (3R)

**Output:** `phase-5-prompts/stitch-prompt-app.md`
Same structure for mobile app with Stitch mobile-specific instructions.

---

## Phase 6: Manual

사용자가 직접: phase-5 프롬프트 → Stitch 생성 → phase-6-generated/{web,app}/ 배치.
Orchestrator: pipeline-status.yaml에 "phase-6: waiting-for-user" 기록 후 STOP.

---

## Phase 7: Integration

### Step 7-1: Component Decomposition (3R)

**Output:** `phase-7-integration/component-decomposition.md` + actual code

**Writer Instruction:**
```
[Step Instruction] Decompose Stitch output into React components.
Read: phase-6-generated/ + phase-3 component strategy
1. Analyze Stitch code → identify reusable components → map to Phase 3 inventory
2. Create component files in packages/ui/src/ or packages/app/src/components/
3. Apply design tokens. Ensure TypeScript types correct.
```

### Step 7-2: Routing & State (3R)

```
Connect components to React Router. Set up state management.
Wire navigation between pages. Match Phase 2 route structure.
```

### Step 7-3: API Binding (3R, critics=opus)

```
Connect React components to backend API endpoints.
Wire SSE for real-time. Implement data fetching (SWR/React Query/fetch).
Verify all CRUD operations end-to-end.
```

### Step 7-4: Accessibility Final Audit (3R)

```
Full WCAG 2.1 AA audit on integrated product.
Keyboard nav, screen reader, color contrast, focus management, Lighthouse perf audit.
```

---

## Orchestrator Flow

```
SETUP: mkdir -p _corthex_full_redesign/{all subdirs} → init pipeline-status.yaml → TeamCreate

FOR Phase 0~5:
  Read pipeline-status.yaml + context-snapshots
  Spawn Writer + Critic-A + Critic-B + Critic-C (apply opus override per table)
  For each Step: send instruction → monitor (timeout 15min) → validate party-logs → verify score >= 7
  On Phase complete: git commit "docs(uxui-redesign): Phase {N} complete" → update status → shutdown team

PHASE 6: status="waiting-for-user" → report → STOP

PHASE 7 (user triggers): spawn team → 4 steps → final commit+push+deploy verify

Context snapshot after EVERY step → _corthex_full_redesign/context-snapshots/{phase}-{step}-snapshot.md
Contents: decisions, design tokens referenced, constraints for next step, connections, critic scores
```

## Safeguards

- max_retry: 2 per step (fail 3x = ESCALATE). step_timeout: 15min + 2min grace. stall 5min × 3 = SKIP.
- Party-log validation: critic-{a,b,c}.md + fixes.md must exist per step.
- On respawn: inject ALL context-snapshots. Team failure → single-worker fallback.
- Pipeline never blocks — timeout/fail/escalate always leads to "continue".
- Anti-patterns: Writer must NOT call Skill tool, NOT batch steps, NOT skip critic review.
- Troubleshoot: vague output → critics reject (score 0). No references → expand search domains. Stitch HTML fallback. tsc --noEmit before commit.

## Core Rules

1. ALL outputs SPECIFIC — exact hex, Tailwind, px. "Vague" = instant FAIL.
2. Writer NEVER uses Skill tool. ONE step → review → fix → verify → next.
3. Every step produces a context-snapshot with exact token values.
4. Phase 1 research cites REAL URLs and REAL products only.
5. Design tokens include WCAG AA contrast ratios for all text/bg pairs.
6. Stitch prompts are COPY-PASTE READY — no "[fill in]" placeholders.
7. Phase 7 produces WORKING code — no stubs/mocks. tsc --noEmit before commit.
8. pipeline-status.yaml is single source of truth. On resume: read it + all snapshots first.

ARGUMENTS: $ARGUMENTS
