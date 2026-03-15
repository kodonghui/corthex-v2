---
name: 'kdh-uxui-redesign-full-auto-pipeline'
description: 'UXUI Redesign Pipeline v3.0 (Libre+BMAD+KDH). 8 Phases, 3 Critics, archetypal themes, premium SaaS quality.'
---

# CORTHEX UXUI Redesign Pipeline v3.0

Phase 0~5 auto → Phase 6 manual (Stitch) → Phase 7 integration.
Output root: `_corthex_full_redesign/`

## Methodology Stack

- **LibreUIUX**: Design expertise (archetypes, masters, principles, accessibility, brand systems, rapid prototyping, context management)
- **BMAD**: Quality gates (3-critic party mode, cross-talk review, score threshold >= 7/10)
- **KDH**: Execution engine (model strategy, timeouts, anti-patterns, context snapshots, auto commit+push)

## Mode Selection

- `all` or no args: Phase 0→5 (Phase 6 manual, Phase 7 on trigger)
- `phase-N`: specific Phase only
- `resume`: pipeline-status.yaml + context-snapshots based resume

## Pipeline Overview

| Phase | Name | Mode | Steps | Libre Tools |
|-------|------|------|-------|-------------|
| 0 | Foundation | 3R × 2 | spec + vision | Design Masters, Design Movements, Design Principles |
| 1 | Research | 2R × 3 | web + app + landing | Premium SaaS Design |
| 2 | Deep Analysis | 3R × 3 | web + app + landing options | Design Principles (scoring criteria) |
| 3 | Design System | 3R × 2 | tokens + components | Brand Systems, Design System Context, Premium SaaS Design |
| 4 | Themes | 3R + 1R | 5 archetypal themes + a11y | Archetypal Combinations, Jungian Archetypes, Major Arcana, Accessibility Audit |
| 5 | Prompts | 3R × 2 | web + app Stitch prompts | Premium SaaS Design (prompt patterns) |
| 6 | Manual | user | Stitch generation | — |
| 7 | Integration | 3R × 4 | decompose + routing + API + a11y | Rapid Prototyping, Accessibility Audit |

Folders: `phase-0-foundation/`, `phase-1-research/`, `phase-2-analysis/`, `phase-3-design-system/`, `phase-4-themes/`, `phase-5-prompts/`, `phase-6-generated/`, `phase-7-integration/`, `context-snapshots/`, `party-logs/`, `pipeline-status.yaml`

## Model Strategy

Orchestrator=opus, Writer/Critics=sonnet by default.

**Opus overrides for critics:**

| Step | Why |
|------|-----|
| 0-1 Technical Spec | tech spec is foundation for all subsequent Phases |
| 2-* Deep Analysis | final option selection = entire design direction |
| 3-1 Design Tokens | tokens are foundation for all components/themes |
| 7-3 API Binding | backend integration errors = runtime bugs |

## Party Mode

3R = Write → Review×3 critics → Fix → Verify → Score. 2R = Write → Review×3 → Fix → Score.
Pass: avg score >= 7/10 across all 3 critics. Fail: retry (max 2) → escalate → continue.

**Critics:**
- **Critic-A (UX+Brand):** Sally (user advocacy) + Luna (brand consistency)
- **Critic-B (Visual+A11y):** Marcus (visual hierarchy) + Quinn (WCAG verification)
- **Critic-C (Tech+Perf):** Amelia (implementation feasibility) + Bob (performance reality)

## Libre Tools Reference

| Tool | Skill File Path | Used In |
|------|----------------|---------|
| Design Principles | `.claude/plugins/design-mastery/skills/design-principles/SKILL.md` | Phase 0, 2 |
| Design Masters | `.claude/plugins/design-mastery/skills/design-masters/SKILL.md` | Phase 0 |
| Design Movements | `.claude/plugins/design-mastery/skills/design-movements/SKILL.md` | Phase 0 |
| Brand Systems | `.claude/plugins/design-mastery/skills/brand-systems/SKILL.md` | Phase 3 |
| Premium SaaS Design | `.claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md` | Phase 1, 3, 5 |
| Jungian Archetypes | `.claude/plugins/archetypal-alchemy/skills/jungian-archetypes/SKILL.md` | Phase 4 |
| Major Arcana | `.claude/plugins/archetypal-alchemy/skills/major-arcana/SKILL.md` | Phase 4 |
| Archetypal Combinations | `.claude/plugins/archetypal-alchemy/skills/archetypal-combinations/SKILL.md` | Phase 4 |
| Accessibility Audit | `.claude/plugins/accessibility-compliance/README.md` | Phase 4, 7 |
| Rapid Prototyping | `.claude/plugins/vibe-coding/skills/rapid-prototyping/SKILL.md` | Phase 7 |
| Design System Context | `.claude/plugins/context-management/skills/design-system-context/SKILL.md` | Phase 3 |

## Writer Prompt Template

```
You are a UXUI REDESIGN WRITER in team "{team_name}". Model: sonnet. YOLO mode.

PROHIBITIONS: Never use Skill tool. Never write more than ONE step before review. Never auto-proceed — wait for Orchestrator.

LIBRE TOOLS: Before writing, READ the libre skill files listed for your current Phase (see Libre Tools Reference table). Apply their frameworks — do not guess.

PER-STEP LOOP:
1. Read step instruction + ALL reference docs + context-snapshots + referenced libre skill files
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

ROLES: Amelia (Frontend Dev) — "this layout is 3 CSS Grid lines." Bob (Performance) — "this animation won't hit 60fps."

LIBRE CHECK: Verify Writer actually applied referenced libre skill frameworks. If Writer claims "Design Principles scoring" but has no gestalt/hierarchy analysis → score 0 for that section.

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

**Critic-A Focus:** user-facing missing features, screen list completeness
**Critic-B Focus:** API/DB mapping accuracy, performance constraints
**Critic-C Focus:** implementation complexity, performance constraint feasibility, React/Hono stack conflicts

### Step 0-2: Vision & Identity (3R)

**Output:** `phase-0-foundation/vision/corthex-vision-identity.md`

**Libre Tools:** Design Masters, Design Movements, Design Principles

**Writer Instruction:**
```
[Step Instruction] Write CORTHEX Vision & Identity Document.
Output: _corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md

BEFORE WRITING — Read these libre skill files:
- .claude/plugins/design-mastery/skills/design-masters/SKILL.md
- .claude/plugins/design-mastery/skills/design-movements/SKILL.md
- .claude/plugins/design-mastery/skills/design-principles/SKILL.md

Read: phase-0-1 output + v1-feature-spec + prd + architecture + CLAUDE.md

Write sections:
1. What is CORTHEX? — elevator pitch, problem, why it exists
2. Core Vision — dynamic org management (not 29 fixed agents), NEXUS metaphor
3. Who Uses CORTHEX? — primary (non-dev org admin), secondary (tech admin), what they care about
4. Emotional Design Direction — feel: in control, professional, intelligent, trustworthy. NOT: chatbot, playful, cluttered
5. Brand Personality — voice, visual metaphor candidates, color emotion targets, typography personality
6. Feature Hierarchy — P0 (always visible) through P3 (power user), rank ALL features
7. Competitive Positioning — vs Slack/Linear/custom AI dashboards, what makes CORTHEX unique
8. Design Principles — 5-7 principles for all future design decisions (e.g., "Show the org, not the AI")
9. Design Masters Alignment — Rams' 10 principles applied to CORTHEX, Vignelli's constrained typography (2-3 fonts), Muller-Brockmann's grid philosophy
10. Design Movement Selection — which movement fits CORTHEX (Swiss International? Flat? Contemporary Eclecticism?) with justification
11. Visual Hierarchy Rules — gestalt principles for layouts, golden ratio for sidebar:content, contrast rules for hierarchy
```

**Critic-A Focus:** vision persuasiveness, emotional direction contradictions, persona realism
**Critic-B Focus:** feature hierarchy technical accuracy, competitive positioning
**Critic-C Focus:** design principle implementability, performance target realism

---

## Phase 1: Research

**Libre Tools:** Premium SaaS Design

### Step 1-1: Web Dashboard Layout (2R)

**Output:** `phase-1-research/web-dashboard/web-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research web dashboard layouts for AI SaaS platforms.
Output: _corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md
- phase-0 outputs + context-snapshots

Follow the Premium SaaS Design 7-artifact approach. Research must target $5k+ quality level.

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
- Premium SaaS quality assessment (score against $5k standard)
- Pros and cons
```

**Critic-A Focus:** CORTHEX vision alignment, user convenience
**Critic-B Focus:** visual hierarchy, WCAG AA, responsiveness
**Critic-C Focus:** CSS Grid/Flex implementability, bundle size impact

### Step 1-2: App Layout (2R)

**Output:** `phase-1-research/app/app-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research app layouts for AI/enterprise mobile apps.
Output: _corthex_full_redesign/phase-1-research/app/app-layout-research.md

Read: .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md + phase-0 outputs + context-snapshots

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
- Premium SaaS quality score
- Pros and cons
```

### Step 1-3: Landing Page (2R)

**Output:** `phase-1-research/landing/landing-page-research.md`

**Writer Instruction:**
```
[Step Instruction] Research landing pages for AI/SaaS products.
Output: _corthex_full_redesign/phase-1-research/landing/landing-page-research.md

Read: .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md + phase-0 outputs + context-snapshots

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
- Section-specific mood board (Premium SaaS Design "Frankenstein" approach)
- Pros and cons
```

---

## Phase 2: Deep Analysis

**Libre Tools:** Design Principles (scoring criteria)

### Step 2-1: Web Options (3R, critics=opus)

**Output:** `phase-2-analysis/web-analysis.md`

**Writer Instruction:**
```
[Step Instruction] Deep analysis of 3 web dashboard options + React implementation spec.
Output: _corthex_full_redesign/phase-2-analysis/web-analysis.md

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/design-principles/SKILL.md
- phase-0 all + phase-1 web research + context-snapshots

For EACH of the 3 web options:

## Design Philosophy Analysis
- Design movement, emotional response, CORTHEX vision alignment
- User flow for: Create agent → View NEXUS → Chat → Manage knowledge

## Design Principles Scoring (from libre skill)
- Gestalt compliance: proximity grouping, similarity patterns, continuity in nav, closure usage
- Visual hierarchy: blur test (50% blur — can you identify focal point, secondary info, CTA?)
- Golden ratio: sidebar:content ratio, heading:body size ratio, spacing multipliers
- Contrast: size contrast, color contrast, weight contrast, spacing contrast
- White space: breathing room score, grouping clarity, emphasis isolation
- Unity: does every element feel like it belongs?

## UX Deep Dive
- IA diagram, cognitive load, Fitts's Law, Hick's Law

## React Implementation Spec
- Component tree, exact Tailwind layout classes
- React Router structure, state management approach
- Key components with TypeScript props interface
- Estimated component count, third-party deps needed

## Scoring (1-10 each)
Vision Alignment + UX + Design Principles + Feasibility + Performance + Accessibility = Total/60
```

### Step 2-2: App Options (3R, critics=opus)

**Output:** `phase-2-analysis/app-analysis.md`
Same structure as 2-1 for mobile app with React Native/Stitch considerations. Include Design Principles scoring.

### Step 2-3: Landing Options (3R, critics=opus)

**Output:** `phase-2-analysis/landing-analysis.md`
Same structure for landing pages with HTML+React hybrid considerations. Include Design Principles scoring.

---

## Phase 3: Design System

### Step 3-1: Design Tokens (3R, critics=opus)

**Output:** `phase-3-design-system/design-tokens.md`

**Libre Tools:** Brand Systems, Design System Context

**Writer Instruction:**
```
[Step Instruction] Define CORTHEX design tokens.
Output: _corthex_full_redesign/phase-3-design-system/design-tokens.md

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/brand-systems/SKILL.md
- .claude/plugins/context-management/skills/design-system-context/SKILL.md
- ALL phase-0, phase-1, phase-2 outputs + context-snapshots

Apply Brand Systems framework:
- 60-30-10 color rule: 60% dominant (backgrounds), 30% secondary (supporting), 10% accent (CTAs)
- Typography pairing: use recommended pairs from Brand Systems skill (e.g., Space Grotesk + IBM Plex Sans for technical, Outfit + Inter for modern)
- Brand Canvas: fill out the quick reference canvas for CORTHEX

Apply Design System Context framework:
- Use compressed token format for LLM consumption
- Structure tokens in layered context model (brand → tokens → components → task)
- Include token budget allocation guidance

Based on winning options from Phase 2, define:

1. Color System — primary (5 shades), secondary (5), neutral (10), semantic (success/warning/error/info × 3), surface, text, border. 60-30-10 rule applied. WCAG AA verified.
2. Typography Scale — primary+body+mono fonts (from Brand Systems pairing rules), xs~4xl with px/rem/line-height, weights, letter spacing, Tailwind config.
3. Spacing Scale — base 4px, scale 0~64, component-specific rules.
4. Border & Shadow — radius (none~full), shadow (sm~2xl), border width.
5. Motion & Animation — duration (100~500ms), easing curves, per-component transitions.
6. Icon System — library choice, size scale (12~32), stroke width.
7. Dark Mode — full token mapping, auto-detection strategy.
8. LLM Context Format — compressed token representation for Stitch/AI consumption (from Design System Context skill).

Output as: (1) human-readable docs + (2) tailwind.config.ts extend snippet + (3) compressed LLM context block.
```

### Step 3-2: Component Strategy (3R)

**Output:** `phase-3-design-system/component-strategy.md`

**Libre Tools:** Premium SaaS Design

**Writer Instruction:**
```
[Step Instruction] Define component library strategy.
Output: _corthex_full_redesign/phase-3-design-system/component-strategy.md

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md (component resources section)
- ALL previous outputs + context-snapshots

Follow Premium SaaS Design component patterns (shadcn/ui, 21st.dev, component code approach).

1. Base Library Decision — evaluate shadcn/ui vs Headless UI vs Radix vs custom. Pick ONE with scores.
2. Component Inventory:
   - Primitives: Button, Input, Select, Checkbox, etc. → variants, sizes, states, props
   - Composites: Card, Modal, Dropdown, Tabs, Toast, etc.
   - Features: AgentCard, OrgChart (NEXUS), ChatWindow, KnowledgePanel, TierBadge
   - Layouts: AppShell, Sidebar, Header, PageContainer, SplitPane
3. Component API Standards — prop naming, variant pattern (cva?), composition, ARIA/keyboard reqs
4. Stitch → React Migration — how monolithic Stitch output → reusable components, naming mapping
5. Premium Component Sources — which components from 21st.dev, which custom, which from shadcn base
```

---

## Phase 4: Themes

### Step 4-1: Archetypal Themes (3R)

**Output:** `phase-4-themes/themes-creative.md`

**Libre Tools:** Archetypal Combinations, Jungian Archetypes, Major Arcana

**Writer Instruction:**
```
[Step Instruction] Create 5 archetypal CORTHEX themes using Jungian Archetypes + Major Arcana synthesis.
Output: _corthex_full_redesign/phase-4-themes/themes-creative.md

BEFORE WRITING — Read these skill files completely:
- .claude/plugins/archetypal-alchemy/skills/archetypal-combinations/SKILL.md
- .claude/plugins/archetypal-alchemy/skills/jungian-archetypes/SKILL.md
- .claude/plugins/archetypal-alchemy/skills/major-arcana/SKILL.md

Read: ALL previous outputs + context-snapshots. Use Phase 3 tokens as base.

Each theme = 1 Jungian Archetype (STRUCTURE) + 1 Major Arcana card (COLOR/MOOD).
Follow the Alchemy Process from archetypal-combinations: Parse → Extract Archetype → Extract Card → Synthesize.

The 5 themes (Archetype + Card → Target User):

| # | Theme Name | Archetype | Card | Primary Colors (hex) | Gradient | Target |
|---|-----------|-----------|------|---------------------|----------|--------|
| 1 | IMPERIAL COMMAND | Ruler | Emperor | Red #dc2626, Gray #52525b, Gold #eab308, Black #18181b | `from-zinc-900 to-red-950` | Enterprise admins |
| 2 | CONTEMPLATIVE DEPTHS | Sage | Hermit | Indigo #4338ca, Purple #6d28d9, Gray #d1d5db, Black #111827 | `from-indigo-950 via-purple-900 to-gray-900` | Knowledge workers |
| 3 | LUNAR ALCHEMY | Magician | Moon | Silver #cbd5e1, Blue #1e40af, Purple #c084fc, Navy #0f172a | `from-slate-900 via-blue-950 to-purple-950` | AI enthusiasts |
| 4 | SOLAR CONQUEST | Hero | Sun | Gold #fbbf24, Orange #fb923c, Yellow #fef08a, Amber #78350f | `from-yellow-100 via-orange-200 to-yellow-50` | Startup teams |
| 5 | STELLAR FORGE | Creator | Star | Blue #38bdf8, Sky #0c4a6e, White #f0f9ff, Space #082f49 | `from-sky-950 via-sky-400 to-sky-900` | Creative teams |

For EACH theme, Writer MUST produce:
1. Archetype personality + UI structure (from Jungian Archetypes: layout, spacing, motion, typography rules)
2. Card color palette with hex + Tailwind (from Major Arcana: primary/secondary/accent/dark + gradient + shadow style)
3. Synthesis rationale (from Archetypal Combinations: how structure + color create meaning)
4. Complete token overrides: colors, typography (heading+body fonts), border-radius, shadows, motion timing
5. Sample Dashboard: exact Tailwind classes per element — sidebar, agent card, NEXUS appearance, buttons
6. Target user persona + emotion evoked + industry fit
```

### Step 4-2: Accessibility Audit (1R)

**Output:** `phase-4-themes/themes-accessibility-audit.md`

**Libre Tools:** Accessibility Compliance

**Writer Instruction:**
```
[Step Instruction] WCAG 2.1 AA audit for all 5 archetypal themes.
Output: _corthex_full_redesign/phase-4-themes/themes-accessibility-audit.md

BEFORE WRITING — Read:
- .claude/plugins/accessibility-compliance/README.md

Apply libre-a11y-audit methodology (axe-core patterns + full WCAG 2.1 AA checklist).

For EACH theme verify: (1) contrast ratios for ALL text/bg pairs (4.5:1 normal, 3:1 large, 3:1 UI), (2) focus indicators visible in theme colors, (3) color-not-sole-info for status/state, (4) prefers-reduced-motion respected, (5) touch targets >= 44x44px, (6) dark mode pairs meet ratios, (7) forced-colors media query compatibility.

Flag ALL failures with exact hex replacement fixes. Pass/fail score per theme.
```

---

## Phase 5: Prompts

**Libre Tools:** Premium SaaS Design (prompt patterns)

### Step 5-1: Web Stitch Prompt (3R)

**Output:** `phase-5-prompts/stitch-prompt-web.md`

**Writer Instruction:**
```
[Step Instruction] Create Google Stitch prompt for CORTHEX web.
Output: _corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md (prompt templates section)
- ALL previous outputs (especially winning theme + tokens + components)

Follow Premium SaaS Design prompt engineering patterns:
- Project Brief format
- Section-specific mood board approach ("Frankenstein" method)
- Style Guide reference injection
- Component code inclusion

Include the winning archetype+card combination as context in every prompt section.

Create COPY-PASTE READY Stitch prompt including:
1. Project description (what CORTHEX is, users, archetype personality)
2. Exact visual specs (tokens + winning theme + archetype+card synthesis)
3. Page-by-page: Dashboard, Agent mgmt, NEXUS, Knowledge, Chat, Admin, Landing
4. Component specs, color palette (hex), typography (fonts+sizes)
5. Layout (grid/flex), interactions (hover/click/transitions), responsive breakpoints
6. "Generate as React with Tailwind CSS" (fallback: HTML first)

Structure for per-page generation + master design system prompt. NO placeholders.
```

### Step 5-2: App Stitch Prompt (3R)

**Output:** `phase-5-prompts/stitch-prompt-app.md`
Same structure for mobile app with Stitch mobile-specific instructions. Include archetype+card context.

---

## Phase 6: Manual

User does: phase-5 prompts → Stitch generation → place in phase-6-generated/{web,app}/.
Orchestrator: record "phase-6: waiting-for-user" in pipeline-status.yaml then STOP.

---

## Phase 7: Integration

**Libre Tools:** Rapid Prototyping, Accessibility Audit

### Step 7-1: Component Decomposition (3R)

**Output:** `phase-7-integration/component-decomposition.md` + actual code

**Writer Instruction:**
```
[Step Instruction] Decompose Stitch output into React components.

BEFORE WRITING — Read:
- .claude/plugins/vibe-coding/skills/rapid-prototyping/SKILL.md

Apply Rapid Prototyping patterns:
- 10-min prototype approach: quick validation of each decomposed component before full integration
- Variant explosion: generate minimal/dense/dark/light variants for key components

Read: phase-6-generated/ + phase-3 component strategy
1. Analyze Stitch code → identify reusable components → map to Phase 3 inventory
2. Create component files in packages/ui/src/ or packages/app/src/components/
3. Apply design tokens. Ensure TypeScript types correct.
4. For each key component: build 10-min prototype, validate, then integrate
```

### Step 7-2: Routing & State (3R)

**Writer Instruction:**
```
[Step Instruction] Connect components to React Router. Set up state management.

Apply Rapid Prototyping storyboard pattern:
- Generate screen flow storyboard for key user journeys
- Validate navigation flow before wiring

Wire navigation between pages. Match Phase 2 route structure.
```

### Step 7-3: API Binding (3R, critics=opus)

**Writer Instruction:**
```
[Step Instruction] Connect React components to backend API endpoints.
Wire SSE for real-time. Implement data fetching (SWR/React Query/fetch).
Verify all CRUD operations end-to-end.
```

### Step 7-4: Accessibility Final Audit (3R)

**Writer Instruction:**
```
[Step Instruction] Full WCAG 2.1 AA audit on integrated product.

BEFORE WRITING — Read:
- .claude/plugins/accessibility-compliance/README.md

Apply libre-a11y-audit full methodology:
- Automated: axe-core + Puppeteer (weighted: critical 10pts, serious 5, moderate 2, minor 1)
- Contrast: relative luminance for all text/bg pairs
- Keyboard: Tab traversal, trap detection, logical order
- Screen reader: landmarks, heading hierarchy, form labels, ARIA
- Manual: cognitive a11y + visual a11y (200% resize, 320px reflow)
- Focus: visible indicators, restoration after modal close
- Lighthouse perf audit. Generate scored report with remediation code.
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
Contents: decisions, design tokens referenced, libre tools applied, constraints for next step, connections, critic scores
```

## Safeguards

- max_retry: 2 per step (fail 3x = ESCALATE). step_timeout: 15min + 2min grace. stall 5min x 3 = SKIP.
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
9. Writer MUST read referenced libre skill files BEFORE writing. Critics verify this.
10. Phase 4 themes MUST use Archetype+Card synthesis (no generic "Neural Network" or "Cyberpunk" themes).
11. Accessibility audit uses libre-a11y methodology (axe-core patterns, full WCAG 2.1 AA checklist).

ARGUMENTS: $ARGUMENTS
