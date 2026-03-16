---
name: 'kdh-uxui-redesign-full-auto-pipeline'
description: 'UXUI Redesign Pipeline v5.0 (Universal). Works on ANY React/Vue/Svelte/Next project. 8 Phases + auto-scan + app shell sync + completeness gates + E2E verification. Libre+BMAD+KDH.'
---

# Universal UXUI Redesign Pipeline v5.0

Phase 0~7 fully automated. Stitch MCP for UI generation (Phase 6), Claude for framework conversion (Phase 7).
Works on ANY frontend project — auto-detects framework, router, design tokens, and app shell.
Output root: `_uxui_redesign/`

## Methodology Stack

- **LibreUIUX**: Design expertise (archetypes, masters, principles, accessibility, brand systems, rapid prototyping, context management)
- **BMAD**: Quality gates (3-critic party mode, cross-talk review, score threshold >= 7/10)
- **KDH**: Execution engine (model strategy, timeouts, anti-patterns, context snapshots, auto commit+push)

## Mode Selection

- `all` or no args: Phase 0→7 fully automated (Stitch MCP for Phase 6)
- `phase-N`: specific Phase only
- `resume` or `계속`: Read pipeline-status.yaml → find first non-complete phase → resume from there
  - IMPORTANT: `계속` means "continue to completion". Do NOT stop at intermediate milestones.
  - After Stitch HTML generation (Phase 6), IMMEDIATELY proceed to framework conversion (Phase 7).
  - After conversion, IMMEDIATELY run type-check and fix errors.
  - Pipeline is NOT done until Phase 7 status=complete AND type-check passes.

## Step 0: Project Auto-Scan (runs before ANY mode)

**Output:** `_uxui_redesign/project-context.yaml`

This step runs ONCE at the start of every pipeline execution. All subsequent phases reference `project-context.yaml` instead of hardcoded paths.

```
Step 0: Project Auto-Scan
  1. Read package.json → detect framework:
     - "react" / "react-dom" → React
     - "vue" → Vue
     - "svelte" / "@sveltejs/kit" → Svelte
     - "next" → Next.js
     - "nuxt" → Nuxt
     - "@angular/core" → Angular
     - Fallback: ask user
  2. Find tsconfig.json → determine type-check command:
     - tsconfig.json exists → "npx tsc --noEmit" (find correct -p flag from project structure)
     - jsconfig.json only → skip type-check or use ESLint
  3. Find router file → extract ALL page routes:
     - React Router: scan for createBrowserRouter / <Route> / lazy(() => import(...))
     - Next.js: scan app/ or pages/ directory structure
     - Vue Router: scan router/index.ts
     - SvelteKit: scan src/routes/
     - Save: { route, componentPath, lazyImport? } for every page
  4. Find tailwind.config (tailwind.config.ts/js/mjs) → extract current design tokens:
     - theme.extend.colors, theme.extend.fontFamily, theme.extend.spacing
     - If no Tailwind → note CSS framework (Bootstrap, vanilla CSS, etc.)
  5. Find entry file (App.tsx / main.tsx / app.vue / +layout.svelte) → detect global settings:
     - Is "dark" class forced on <html> or root element?
     - What fonts are loaded? What base colors are set?
  6. Find layout/sidebar files → identify app shell:
     - Search for: layout.tsx, Layout.tsx, AppShell, Sidebar, sidebar, Nav, navigation
     - Record file paths for app shell components
  7. Find index.html (or app/layout.tsx for Next.js) → check font CDN links:
     - Google Fonts links? Local font files? @font-face declarations?
  8. Find architecture/PRD docs (if any):
     - Scan for: architecture.md, prd.md, ARCHITECTURE.md, PRD.md, docs/
     - Scan for: README.md project description
  9. Detect project name:
     - package.json "name" field
     - CLAUDE.md project references
     - Git remote URL
  10. Save ALL findings to _uxui_redesign/project-context.yaml:
      ```yaml
      project:
        name: "{detected-name}"
        framework: react|vue|svelte|next|nuxt|angular
        language: typescript|javascript
      paths:
        root: "."
        entry: "src/App.tsx"
        router: "src/router.tsx"
        layout: "src/components/Layout.tsx"
        sidebar: "src/components/Sidebar.tsx"
        index_html: "index.html"
        tailwind_config: "tailwind.config.ts"
        tsconfig: "tsconfig.json"
        pages_dir: "src/pages/"
        architecture_doc: null  # or path if found
        prd_doc: null  # or path if found
      type_check_cmd: "npx tsc --noEmit -p tsconfig.json"
      pages:  # auto-extracted from router
        - route: "/"
          component: "src/pages/Dashboard.tsx"
          lazy: true
        - route: "/settings"
          component: "src/pages/Settings.tsx"
          lazy: true
        # ... all routes
      current_tokens:
        fonts: ["Inter", "JetBrains Mono"]
        colors: { primary: "#...", background: "#..." }
        dark_mode: forced|auto|none
      app_shell:
        layout_file: "src/components/Layout.tsx"
        sidebar_file: "src/components/Sidebar.tsx"
        font_cdn_links: ["https://fonts.googleapis.com/..."]
      ```
  11. All subsequent steps reference project-context.yaml instead of hardcoded paths.
```

## Pipeline Overview

| Phase | Name | Mode | Steps | Libre Tools |
|-------|------|------|-------|-------------|
| 0 | Foundation | 3R × 2 | spec + vision | Design Masters, Design Movements, Design Principles |
| 1 | Research | 2R × 3 | web + app + landing | Premium SaaS Design |
| 2 | Deep Analysis | 3R × 3 | web + app + landing options | Design Principles (scoring criteria) |
| 3 | Design System | 3R × 2 | tokens + components | Brand Systems, Design System Context, Premium SaaS Design |
| 4 | Themes | 3R + 1R | 5 archetypal themes + a11y | Archetypal Combinations, Jungian Archetypes, Major Arcana, Accessibility Audit |
| 5 | Prompts | 3R × 2 | web + app Stitch prompts | Premium SaaS Design (prompt patterns) |
| 6 | Stitch Generation | auto × 3 | web + app + landing via Stitch MCP | — |
| 7 | Integration | 3R × 6 | app-shell-sync + decompose + completeness-gate + routing + visual + E2E | Rapid Prototyping, Accessibility Audit |

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

PROJECT: Read _uxui_redesign/project-context.yaml for all project-specific paths, framework, and conventions.

PROHIBITIONS: Never use Skill tool. Never write more than ONE step before review. Never auto-proceed — wait for Orchestrator.

LIBRE TOOLS: Before writing, READ the libre skill files listed for your current Phase (see Libre Tools Reference table). Apply their frameworks — do not guess.

PER-STEP LOOP:
1. Read step instruction + project-context.yaml + ALL reference docs + context-snapshots + referenced libre skill files
2. Write section — CONCRETE, SPECIFIC, NO PLACEHOLDERS
3. SendMessage to critic-a, critic-b, critic-c: "[Review Request] {step_name}. File: {path} lines {start}-{end}"
4. WAIT for all 3 critics
5. Read ALL critic logs FROM FILE → apply fixes → write to party-logs/{phase}-{step}-fixes.md
6. SendMessage to all critics: "[Fixes Applied]" → WAIT for scores
7. avg >= 7: PASS → save context-snapshot → report. avg < 7 + retry < 2: rewrite. Else: ESCALATE

OUTPUT QUALITY (ABSOLUTE):
- Colors: exact hex + framework utility (e.g., `bg-indigo-500 (#6366F1)`)
- Spacing: exact values (e.g., `gap-6 (24px)`)
- Typography: font + weight + size (e.g., `Inter 600 text-lg (18px/28px)`)
- Layout: exact CSS/utility classes (e.g., `grid grid-cols-[280px_1fr] h-screen`)
- NO vague words: "clean", "modern", "professional" → SPECIFIC visual specs
```

## Critic-C Prompt Template

```
You are CRITIC-C in team "{team_name}". Model: sonnet. YOLO mode.

PROJECT: Read _uxui_redesign/project-context.yaml for framework, tech stack, and conventions.

ROLES: Amelia (Frontend Dev) — "this layout is 3 CSS Grid lines." Bob (Performance) — "this animation won't hit 60fps."

LIBRE CHECK: Verify Writer actually applied referenced libre skill frameworks. If Writer claims "Design Principles scoring" but has no gestalt/hierarchy analysis → score 0 for that section.

ON REVIEW:
1. Read file FROM DISK + context-snapshots + project-context.yaml + design-tokens.md
2. Amelia: Framework feasibility (React/Vue/Svelte), component count, dependencies, CSS layout
3. Bob: bundle size, image optimization, animation fps, loading time
4. Min 2 issues (1 per role). Write to party-logs/{phase}-{step}-critic-c.md
5. Cross-talk: SendMessage to critic-a, critic-b with summary
6. Score honestly: vague/unimplementable <= 4. Zero findings = re-analyze.
```

---

## Phase 0: Foundation

### Step 0-1: Technical Spec (3R, critics=opus)

**Output:** `phase-0-foundation/spec/technical-spec.md`

**Writer Instruction:**
```
[Step Instruction] Write Project Technical Spec.
Output: _uxui_redesign/phase-0-foundation/spec/technical-spec.md

FIRST: Read _uxui_redesign/project-context.yaml to get all project paths.

Read and analyze (paths from project-context.yaml):
- Architecture doc (if exists)
- PRD doc (if exists)
- All API route files (scan server/routes/ or api/ directory)
- All user-facing page files (from project-context.yaml pages list)
- All admin page files (if separate admin package exists)
- Shared types + DB schema files
- Feature spec / requirements docs (if any)

Write sections:
1. System Overview — project structure, tech stack, deploy pipeline
2. User-Facing Pages — for EACH page from project-context.yaml: route, purpose, components, API endpoints, data
3. Admin Pages (if applicable) — for EACH: route, purpose, components, API endpoints, CRUD ops
4. API Endpoint Map — for EACH route: method+path, req/res shape, auth, DB tables
5. Data Model Summary — for EACH table/collection: name, columns+types, FKs, purpose
6. Architecture — core flow, middleware pipeline, caching strategy, module boundaries
7. Real-time Features — SSE, WebSocket, polling (if any)
8. Design Constraints for UXUI — must-have features, NFR budgets, data flow patterns
```

**Critic-A Focus:** user-facing missing features, screen list completeness
**Critic-B Focus:** API/DB mapping accuracy, performance constraints
**Critic-C Focus:** implementation complexity, performance constraint feasibility, framework-specific conflicts

### Step 0-2: Vision & Identity (3R)

**Output:** `phase-0-foundation/vision/vision-identity.md`

**Libre Tools:** Design Masters, Design Movements, Design Principles

**Writer Instruction:**
```
[Step Instruction] Write Project Vision & Identity Document.
Output: _uxui_redesign/phase-0-foundation/vision/vision-identity.md

FIRST: Read _uxui_redesign/project-context.yaml for project name and details.

BEFORE WRITING — Read these libre skill files:
- .claude/plugins/design-mastery/skills/design-masters/SKILL.md
- .claude/plugins/design-mastery/skills/design-movements/SKILL.md
- .claude/plugins/design-mastery/skills/design-principles/SKILL.md

Read: phase-0-1 output + all available project docs (PRD, architecture, feature specs, README)

Write sections:
1. What is {project}? — elevator pitch, problem, why it exists
2. Core Vision — what makes this product unique, key differentiators
3. Who Uses {project}? — primary user persona, secondary persona, what they care about
4. Emotional Design Direction — target feelings (e.g., in control, professional, intelligent). What it should NOT feel like.
5. Brand Personality — voice, visual metaphor candidates, color emotion targets, typography personality
6. Feature Hierarchy — P0 (always visible) through P3 (power user), rank ALL features from tech spec
7. Competitive Positioning — vs competitors, what makes {project} unique
8. Design Principles — 5-7 principles for all future design decisions
9. Design Masters Alignment — Rams' 10 principles applied to {project}, Vignelli's constrained typography (2-3 fonts), Muller-Brockmann's grid philosophy
10. Design Movement Selection — which movement fits {project} (Swiss International? Flat? Contemporary Eclecticism?) with justification
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
[Step Instruction] Research web dashboard layouts for SaaS platforms in this product's domain.
Output: _uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md

FIRST: Read _uxui_redesign/project-context.yaml for project details and domain.

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md
- phase-0 outputs + context-snapshots

Follow the Premium SaaS Design 7-artifact approach. Research must target $5k+ quality level.

WebSearch real 2025-2026 dashboards in {project}'s domain:
1. Direct competitors and similar products
2. Best-in-class SaaS dashboards (Vercel, Linear, Notion, Supabase)
3. Design systems (Tailwind UI, shadcn/ui, Radix UI)
4. Industry-specific UIs relevant to {project}

For EACH reference: layout pattern, nav pattern, color scheme, typography, key UX pattern, URL.

Select TOP 3 for {project}. For each:
- ASCII layout diagram + grid structure
- Why it works for {project}
- How it handles: sidebar, main content, modals, notifications, key feature views
- CSS grid/flex structure + responsive breakpoints
- Premium SaaS quality assessment (score against $5k standard)
- Pros and cons
```

**Critic-A Focus:** vision alignment, user convenience
**Critic-B Focus:** visual hierarchy, WCAG AA, responsiveness
**Critic-C Focus:** CSS Grid/Flex implementability, bundle size impact

### Step 1-2: App Layout (2R)

**Output:** `phase-1-research/app/app-layout-research.md`

**Writer Instruction:**
```
[Step Instruction] Research app layouts for mobile apps in {project}'s domain.
Output: _uxui_redesign/phase-1-research/app/app-layout-research.md

FIRST: Read _uxui_redesign/project-context.yaml for project details.

Read: .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md + phase-0 outputs + context-snapshots

WebSearch real 2025-2026 mobile patterns:
1. Competing mobile apps in {project}'s domain
2. Enterprise apps (Slack, Teams, Notion mobile)
3. Dashboard apps (Vercel, AWS Console mobile)
4. Pattern libraries (Material Design 3, Apple HIG)

For each: layout, nav (bottom tab/drawer/stack), gestures, colors, typography.

TOP 3 for {project} mobile. For each:
- ASCII screen flow + nav structure
- How it handles the project's key features on mobile
- Touch targets, gesture patterns
- Stitch considerations
- Premium SaaS quality score
- Pros and cons
```

### Step 1-3: Landing Page (2R)

**Output:** `phase-1-research/landing/landing-page-research.md`

**Writer Instruction:**
```
[Step Instruction] Research landing pages for SaaS products in {project}'s domain.
Output: _uxui_redesign/phase-1-research/landing/landing-page-research.md

FIRST: Read _uxui_redesign/project-context.yaml for project details.

Read: .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md + phase-0 outputs + context-snapshots

WebSearch real 2025-2026 landing pages:
1. Direct competitors' landing pages
2. Best-in-class SaaS (Vercel, Linear, Notion)
3. Enterprise products in {project}'s domain
4. Showcases (Awwwards, Land-book.com)
5. Auth UIs (Auth0, Clerk, Supabase Auth)

For each: hero pattern, CTA, scroll flow, animations, login integration, color mood.

TOP 3 for {project}. For each:
- Full page wireframe (ASCII)
- Hero section + login/signup integration
- Scroll sections + animation approach
- Color mood + typography pairing
- How it communicates {project}'s value in <5 seconds
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
[Step Instruction] Deep analysis of 3 web dashboard options + framework implementation spec.
Output: _uxui_redesign/phase-2-analysis/web-analysis.md

FIRST: Read _uxui_redesign/project-context.yaml for framework and tech stack.

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/design-principles/SKILL.md
- phase-0 all + phase-1 web research + context-snapshots

For EACH of the 3 web options:

## Design Philosophy Analysis
- Design movement, emotional response, {project} vision alignment
- User flow for the project's top 3-4 key features

## Design Principles Scoring (from libre skill)
- Gestalt compliance: proximity grouping, similarity patterns, continuity in nav, closure usage
- Visual hierarchy: blur test (50% blur — can you identify focal point, secondary info, CTA?)
- Golden ratio: sidebar:content ratio, heading:body size ratio, spacing multipliers
- Contrast: size contrast, color contrast, weight contrast, spacing contrast
- White space: breathing room score, grouping clarity, emphasis isolation
- Unity: does every element feel like it belongs?

## UX Deep Dive
- IA diagram, cognitive load, Fitts's Law, Hick's Law

## Framework Implementation Spec
- Component tree, exact utility/CSS layout classes
- Router structure (from project-context.yaml framework), state management approach
- Key components with typed props interface
- Estimated component count, third-party deps needed

## Scoring (1-10 each)
Vision Alignment + UX + Design Principles + Feasibility + Performance + Accessibility = Total/60
```

### Step 2-2: App Options (3R, critics=opus)

**Output:** `phase-2-analysis/app-analysis.md`
Same structure as 2-1 for mobile app with mobile-specific framework considerations. Include Design Principles scoring.

### Step 2-3: Landing Options (3R, critics=opus)

**Output:** `phase-2-analysis/landing-analysis.md`
Same structure for landing pages with HTML+framework hybrid considerations. Include Design Principles scoring.

---

## Phase 3: Design System

### Step 3-1: Design Tokens (3R, critics=opus)

**Output:** `phase-3-design-system/design-tokens.md`

**Libre Tools:** Brand Systems, Design System Context

**Writer Instruction:**
```
[Step Instruction] Define {project} design tokens.
Output: _uxui_redesign/phase-3-design-system/design-tokens.md

FIRST: Read _uxui_redesign/project-context.yaml for current tokens and framework.

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/brand-systems/SKILL.md
- .claude/plugins/context-management/skills/design-system-context/SKILL.md
- ALL phase-0, phase-1, phase-2 outputs + context-snapshots

Apply Brand Systems framework:
- 60-30-10 color rule: 60% dominant (backgrounds), 30% secondary (supporting), 10% accent (CTAs)
- Typography pairing: use recommended pairs from Brand Systems skill
- Brand Canvas: fill out the quick reference canvas for {project}

Apply Design System Context framework:
- Use compressed token format for LLM consumption
- Structure tokens in layered context model (brand → tokens → components → task)
- Include token budget allocation guidance

CRITICAL — Design tokens MUST include a color-mode declaration:
  color-mode: "light" | "dark" | "auto"
This drives Phase 7-0 app shell sync. Be explicit.

Based on winning options from Phase 2, define:

1. Color System — primary (5 shades), secondary (5), neutral (10), semantic (success/warning/error/info × 3), surface, text, border. 60-30-10 rule applied. WCAG AA verified.
2. Typography Scale — primary+body+mono fonts (from Brand Systems pairing rules), xs~4xl with px/rem/line-height, weights, letter spacing, config snippet.
3. Spacing Scale — base 4px, scale 0~64, component-specific rules.
4. Border & Shadow — radius (none~full), shadow (sm~2xl), border width.
5. Motion & Animation — duration (100~500ms), easing curves, per-component transitions.
6. Icon System — library choice, size scale (12~32), stroke width.
7. Color Mode — full token mapping for declared color-mode, auto-detection strategy.
8. LLM Context Format — compressed token representation for Stitch/AI consumption (from Design System Context skill).

Output as: (1) human-readable docs + (2) framework config extend snippet (tailwind.config.ts, CSS variables, etc.) + (3) compressed LLM context block.
```

### Step 3-2: Component Strategy (3R)

**Output:** `phase-3-design-system/component-strategy.md`

**Libre Tools:** Premium SaaS Design

**Writer Instruction:**
```
[Step Instruction] Define component library strategy.
Output: _uxui_redesign/phase-3-design-system/component-strategy.md

FIRST: Read _uxui_redesign/project-context.yaml for framework and existing components.

BEFORE WRITING — Read:
- .claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md (component resources section)
- ALL previous outputs + context-snapshots

Follow Premium SaaS Design component patterns.

1. Base Library Decision — evaluate options appropriate for the detected framework (e.g., shadcn/ui for React, Headless UI for Vue, Skeleton for Svelte). Pick ONE with scores.
2. Component Inventory:
   - Primitives: Button, Input, Select, Checkbox, etc. → variants, sizes, states, props
   - Composites: Card, Modal, Dropdown, Tabs, Toast, etc.
   - Features: project-specific feature components (derived from tech spec page list)
   - Layouts: AppShell, Sidebar, Header, PageContainer, SplitPane
3. Component API Standards — prop naming, variant pattern, composition, ARIA/keyboard reqs
4. Stitch → Framework Migration — how monolithic Stitch output → reusable components, naming mapping
5. Premium Component Sources — which components from community libraries, which custom, which from base
```

---

## Phase 4: Themes

### Step 4-1: Archetypal Themes (3R)

**Output:** `phase-4-themes/themes-creative.md`

**Libre Tools:** Archetypal Combinations, Jungian Archetypes, Major Arcana

**Writer Instruction:**
```
[Step Instruction] Create 5 archetypal themes for {project} using Jungian Archetypes + Major Arcana synthesis.
Output: _uxui_redesign/phase-4-themes/themes-creative.md

FIRST: Read _uxui_redesign/project-context.yaml for project name and domain.

BEFORE WRITING — Read these skill files completely:
- .claude/plugins/archetypal-alchemy/skills/archetypal-combinations/SKILL.md
- .claude/plugins/archetypal-alchemy/skills/jungian-archetypes/SKILL.md
- .claude/plugins/archetypal-alchemy/skills/major-arcana/SKILL.md

Read: ALL previous outputs + context-snapshots. Use Phase 3 tokens as base.

Each theme = 1 Jungian Archetype (STRUCTURE) + 1 Major Arcana card (COLOR/MOOD).
Follow the Alchemy Process from archetypal-combinations: Parse → Extract Archetype → Extract Card → Synthesize.

The 5 themes MUST be dynamically generated based on {project}'s domain and user personas:
- Theme 1: Best fit for the PRIMARY user persona (from Phase 0-2 vision)
- Theme 2: Best fit for the SECONDARY user persona
- Theme 3: Bold/distinctive option (push creative boundaries)
- Theme 4: Conservative/trustworthy option (enterprise-friendly)
- Theme 5: Innovative/forward-looking option (differentiation play)

For EACH theme, produce a table row:
| # | Theme Name | Archetype | Card | Primary Colors (hex) | Gradient | Target |

For EACH theme, Writer MUST produce:
1. Archetype personality + UI structure (from Jungian Archetypes: layout, spacing, motion, typography rules)
2. Card color palette with hex + utility classes (from Major Arcana: primary/secondary/accent/dark + gradient + shadow style)
3. Synthesis rationale (from Archetypal Combinations: how structure + color create meaning)
4. Complete token overrides: colors, typography (heading+body fonts), border-radius, shadows, motion timing
5. Sample Dashboard: exact utility classes per element — sidebar, key feature card, primary view, buttons
6. Target user persona + emotion evoked + industry fit
```

### Step 4-2: Accessibility Audit (1R)

**Output:** `phase-4-themes/themes-accessibility-audit.md`

**Libre Tools:** Accessibility Compliance

**Writer Instruction:**
```
[Step Instruction] WCAG 2.1 AA audit for all 5 archetypal themes.
Output: _uxui_redesign/phase-4-themes/themes-accessibility-audit.md

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
[Step Instruction] Create Google Stitch prompt for {project} web.
Output: _uxui_redesign/phase-5-prompts/stitch-prompt-web.md

FIRST: Read _uxui_redesign/project-context.yaml for all page routes.

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
1. Project description (what {project} is, users, archetype personality)
2. Exact visual specs (tokens + winning theme + archetype+card synthesis)
3. Page-by-page: create a section for EVERY page from project-context.yaml routes list
4. Component specs, color palette (hex), typography (fonts+sizes)
5. Layout (grid/flex), interactions (hover/click/transitions), responsive breakpoints
6. "Generate as HTML with CSS utility classes" (framework conversion happens in Phase 7)

Structure for per-page generation + master design system prompt. NO placeholders.
```

### Step 5-2: App Stitch Prompt (3R)

**Output:** `phase-5-prompts/stitch-prompt-app.md`
Same structure for mobile app with Stitch mobile-specific instructions. Include archetype+card context.

---

## Phase 6: Stitch Generation (Automated via MCP)

**Requires:** Stitch MCP server configured in MCP settings

### Step 6-1: Create Stitch Project

**Orchestrator Action (no team needed):**
```
1. Read project-context.yaml for project name
2. Call MCP tool `create_project` with name "{project}-uxui-redesign"
3. Save returned projectId to pipeline-status.yaml under phase-6.projectId
```

### Step 6-2: Generate Web Screens

**Orchestrator Action:**
```
1. Read phase-5-prompts/stitch-prompt-web.md
2. Read project-context.yaml → get FULL page list
3. For EACH page route:
   a. If Phase 5 prompt has a section for this page → use that prompt
   b. If NOT → generate a prompt by reading the existing page code + design tokens + winning theme
   c. Call MCP tool `generate_screen_from_text` with:
      - projectId from step 6-1
      - prompt text (from Phase 5 or auto-generated)
   d. Call `get_screen` → save HTML to phase-6-generated/web/{screen-name}.html
   e. Save screenshot to phase-6-generated/web/{screen-name}.png (if available)
4. Verify: ALL routes from project-context.yaml have corresponding HTML files
5. git commit "docs(uxui-redesign): Phase 6-2 web screens generated via Stitch MCP"
```

**Expected screens: ALL page routes from project-context.yaml must have a corresponding Stitch screen.**
Phase 5 prompts cover core screens; the orchestrator must generate prompts for remaining pages by analyzing their existing code structure.

### Step 6-3: Generate App Screens

**Orchestrator Action:**
```
Same as 6-2 but with phase-5-prompts/stitch-prompt-app.md
Save to phase-6-generated/app/{screen-name}.html and .png
git commit "docs(uxui-redesign): Phase 6-3 app screens generated via Stitch MCP"
```

### Step 6-4: Generate Landing Page

**Orchestrator Action:**
```
Read phase-5-prompts/ for landing prompt (if exists, else derive from Phase 2-3 winning option + Phase 3 tokens)
Generate via Stitch MCP → save to phase-6-generated/landing/
git commit "docs(uxui-redesign): Phase 6-4 landing page generated via Stitch MCP"
```

### Step 6-5: Visual Review (1R)

**Orchestrator Action:**
```
1. Read ALL generated screenshots (.png) from phase-6-generated/
2. Compare against Phase 3 design tokens + Phase 4 winning theme
3. Check: color accuracy, typography, layout structure, component presence
4. If major discrepancy (wrong colors, missing sections, broken layout):
   → Re-generate that screen with refined prompt (append "IMPORTANT: use exact colors..." fix)
   → Max 2 retries per screen
5. Write review to phase-6-generated/stitch-review.md
6. git commit "docs(uxui-redesign): Phase 6 complete — Stitch generation reviewed"
```

### Stitch MCP Fallback

If Stitch MCP fails (auth error, API down, rate limit):
1. Log error to pipeline-status.yaml
2. Set phase-6 status to "fallback-manual"
3. Write instructions: "Paste prompts from phase-5-prompts/ into https://stitch.withgoogle.com/"
4. STOP and notify user

---

## Phase 7: Integration

**Libre Tools:** Rapid Prototyping, Accessibility Audit

### Step 7-0: App Shell Theme Sync (MANDATORY — runs FIRST before any page work)

**Output:** Updated app shell files (layout, sidebar, entry file, index.html, CSS config)

**CRITICAL: This step ensures the app shell matches the design tokens BEFORE any pages are touched.**
Without this step, you get sidebar-dark + pages-light (or vice versa) conflicts.

```
Step 7-0: App Shell Theme Sync
  1. Read _uxui_redesign/project-context.yaml (paths for entry, layout, sidebar, index.html, config)
  2. Read _uxui_redesign/phase-3-design-system/design-tokens.md → extract:
     - color-mode: "light" | "dark" | "auto"
     - bg-primary (main background color)
     - accent color
     - heading-font, body-font, mono-font
     - All surface/border/text colors
  3. Update global entry file (from project-context.yaml paths.entry):
     - If tokens say color-mode: "light":
       → REMOVE any "dark" class forcing on <html> or root element
       → REMOVE any dark-mode-only meta tags
       → Ensure NO className="dark" is set programmatically
     - If tokens say color-mode: "dark":
       → ENSURE "dark" class IS set on <html> or root element
       → Add dark color-scheme meta tag if missing
     - If tokens say color-mode: "auto":
       → Ensure prefers-color-scheme media query is respected
       → Add dark mode toggle if not present
  4. Rebuild Layout file (from project-context.yaml paths.layout):
     - Background color → design-tokens bg-primary
     - Text colors → design-tokens text hierarchy
     - Border colors → design-tokens border color
     - Font family → design-tokens fonts
     - Use Stitch app-shell HTML as VISUAL reference (if exists in phase-6-generated/)
  5. Rebuild Sidebar file (from project-context.yaml paths.sidebar):
     - Background → design-tokens sidebar/surface color
     - Active state → design-tokens accent color
     - Hover state → design-tokens hover color
     - Icon colors → design-tokens icon color
     - Text → design-tokens nav text color
  6. Update index.html (from project-context.yaml paths.index_html):
     - Add/update Google Fonts CDN links for heading-font + body-font + mono-font
     - Set correct color-scheme meta tag
     - Remove old font links that no longer match tokens
  7. Update CSS/styling config (from project-context.yaml paths.tailwind_config or equivalent):
     - Extend theme with design-tokens colors (exact hex values)
     - Add font-family definitions matching tokens
     - Add custom spacing/border-radius if tokens define them
  8. VERIFY (all must pass):
     - Entry file color-mode matches design-tokens color-mode
     - Layout background matches design-tokens bg-primary
     - Sidebar accent matches design-tokens accent
     - index.html has CDN links for ALL fonts in design-tokens
     - CSS config extends with ALL design-token colors
     - Type-check passes (run project-context.yaml type_check_cmd)
  9. git commit "feat(uxui-redesign): Phase 7-0 app shell synced with design tokens"
```

### Step 7-1: Page JSX Rebuild (parallel agents)

**Output:** Actual working framework pages that LOOK LIKE the Stitch HTML designs.

**CRITICAL RULE: This is a REBUILD, not a patch.**
- DO NOT "add classes to existing pages"
- DO rewrite each page's render/return output to match Stitch HTML structure
- DO preserve existing hooks, API calls, state management, event handlers
- The page must VISUALLY MATCH the Stitch HTML when rendered

**Execution Strategy:**
```
1. Read _uxui_redesign/project-context.yaml for framework and all page paths.

2. Generate dynamic color mapping (Step 7-1 color mapping):
   a. Read _uxui_redesign/phase-3-design-system/design-tokens.md
   b. Read Stitch HTML inline config (from any phase-6-generated HTML file)
   c. Generate mapping: Stitch default colors → design-tokens values
      Example output:
        Stitch bg-primary (#XXXXXX)        → {design-tokens accent} ({hex})
        Stitch bg-background-dark          → {design-tokens bg-primary} ({hex})
        Stitch bg-surface/bg-card-dark     → {design-tokens bg-surface} ({hex})
        Stitch bg-surface-secondary        → {design-tokens bg-secondary} ({hex})
        Stitch text-content-primary        → {design-tokens text-primary} ({hex})
        Stitch text-content-secondary      → {design-tokens text-secondary} ({hex})
        Stitch Material Symbols icons      → {design-tokens icon-library} icons (same semantic icon)
        Stitch font: {stitch-font}         → {design-tokens body-font} (from config)
   d. Save mapping to _uxui_redesign/phase-7-integration/color-mapping.md
   e. All batch agents reference this mapping file (NOT hardcoded values)

3. For each page with a Stitch HTML counterpart:
   a. Read the Stitch HTML file (phase-6-generated/web/{screen}.html)
   b. Read the existing page file (from project-context.yaml pages list)
   c. EXTRACT from Stitch HTML:
      - Layout structure (grid/flex patterns, section ordering)
      - Card designs (border-radius, padding, bg colors, shadows)
      - Typography (font sizes, weights, colors, font-mono for numbers)
      - Spacing (gaps, margins, paddings)
      - Icon usage and placement
      - Color palette (must match design-tokens.md via color-mapping.md, NOT Stitch's inline config)
   d. PRESERVE from existing code:
      - All data-fetching hooks (useQuery, useSWR, fetch, onMounted, etc.)
      - All state management logic
      - All event handlers (onClick, onSubmit, etc.)
      - All conditional rendering logic
      - All type definitions and interfaces
   e. REWRITE the render/return output:
      - Structure matches Stitch HTML layout
      - Utility classes match Stitch HTML (standardized via color-mapping.md)
      - Dynamic data replaces Stitch's hardcoded demo data
      - Responsive: mobile-first
   f. Verify: type-check passes

4. For pages WITHOUT Stitch HTML:
   - Apply design tokens only (colors, fonts, spacing from design-tokens.md)
   - Match card/spacing patterns from the Stitch pages for consistency
   - Do NOT redesign layout — just color/token alignment

5. App Shell was already synced in Step 7-0 — do NOT re-modify layout/sidebar here.
   - If Stitch HTML pages have their own sidebar/nav, IGNORE them
   - Use ONLY the main content area from each Stitch HTML
```

**Batch Strategy (parallel agents):**
```
Dynamically create batches from project-context.yaml pages list:
- Batch 1: Core screens (dashboard/home + 2-3 most-used pages)
- Batch 2-N: Remaining pages in groups of 4-5

Each agent prompt MUST include:
- The exact Stitch HTML file path to read
- The exact page file path to rewrite
- The color-mapping.md file path to reference
- "REBUILD the render output, don't patch it"
- "PRESERVE all hooks/API/state, only change the render output and utility classes"
```

### Step 7-1.5: File Completeness Gate (MANDATORY)

**Output:** `_uxui_redesign/phase-7-integration/completeness-report.md`

**This gate ensures NO router imports point to missing files. Missing files = page crash on navigation.**

```
Step 7-1.5: File Completeness Gate
  1. Read project-context.yaml → get router file path
  2. Parse router/entry file → extract ALL lazy/dynamic import paths
     - React: lazy(() => import("./pages/Foo"))
     - Vue: () => import("@/views/Foo.vue")
     - Svelte: import("./routes/foo/+page.svelte")
     - Next.js: scan app/ or pages/ directory
  3. For EACH import path → verify the target file exists on disk
  4. If file is MISSING:
     a. Check _uxui_redesign/phase-6-generated/ for a corresponding Stitch HTML
     b. If found → create the page file from Stitch HTML + design tokens
     c. If NOT found → create minimal page with:
        - Design tokens applied (bg, text, font from design-tokens.md)
        - Page title matching the route name
        - "Coming soon" or empty state content styled with design tokens
        - Proper exports matching what the router expects
  5. Write completeness report:
     - Total routes: N
     - Files verified: N
     - Files created: N (list each with reason)
     - Files still missing: 0 (must be 0)
  6. GATE: ALL router imports must resolve to existing files.
     - 0 missing files required to proceed.
     - If any file cannot be created → FAIL and stop Phase 7.
  7. Type-check must pass after any new files are created.
  8. git commit "feat(uxui-redesign): Phase 7-1.5 completeness gate — all routes verified"
```

### Step 7-2: Live Render Verification (MANDATORY)

**This is NOT optional. Every page must be verified against its reference.**

```
Step 7-2: Live Render Verification (MANDATORY)

  Option A (Playwright / browser automation available):
    1. Start dev server (detect command from package.json scripts: dev, start, serve)
    2. Wait for server ready (poll health endpoint or stdout)
    3. Navigate to EVERY page route from project-context.yaml
    4. For EACH page:
       a. Screenshot desktop (1280x800)
       b. Screenshot mobile (390x844)
       c. Collect console errors (filter noise: React DevTools, HMR)
       d. Check for 404 network requests (fonts, images, API endpoints)
    5. Compare screenshots against reference:
       - If Stitch PNG exists → pixel diff, flag if >10% different
       - If no Stitch PNG → verify structural match against Stitch HTML
    6. Flag pages with >10% visual difference for rework

  Option B (Playwright NOT available):
    1. For EACH page file:
       a. Read rebuilt JSX/template structure
       b. Read corresponding Stitch HTML (if exists)
       c. Verify structural match:
          - Same number of sections/cards
          - Same color classes used
          - Same layout pattern (grid/flex)
          - Same typography scale
       d. Check for theme conflicts:
          - Does page use "dark:" classes when color-mode is "light"?
          - Does page use light backgrounds when color-mode is "dark"?
          - Do page colors match design-tokens.md?
       e. Verify responsive breakpoints present (sm:, md:, lg: or equivalent)

  BOTH options MUST also:
    - Check for console errors on every page (read code for obvious runtime issues)
    - Verify no 404 resources:
      - Font CDN links in index.html are valid
      - Image/asset imports resolve to existing files
      - API endpoint URLs are correct (match server routes)
    - Confirm app shell theme matches page theme:
      - Layout background === page background base
      - Sidebar active color === page accent color
      - No dark-sidebar + light-page (or vice versa) conflicts
    - Write verification report to _uxui_redesign/phase-7-integration/visual-verification.md
    - Pages that FAIL → re-enter Step 7-1 for that page only

  git commit "docs(uxui-redesign): Phase 7-2 visual verification complete"
```

### Step 7-3: API Binding + Routing (sequential)

```
1. Read project-context.yaml for framework and router path
2. Verify all existing hooks/data-fetching still works (no broken imports after rebuild)
3. Check routing: all lazy/dynamic imports point to correct files (already gated by 7-1.5)
4. Verify navigation links match routes (sidebar links, breadcrumbs, internal links)
5. Test SSE/WebSocket connections if applicable
6. Run project tests for affected test files (detect test runner from package.json)
7. Type-check: run project-context.yaml type_check_cmd → must pass with 0 errors
```

### Step 7-4: Accessibility + Final QA

```
1. axe-core scan on all rebuilt pages (if Playwright available)
2. Keyboard navigation: Tab through all interactive elements
3. Focus management: modals trap focus, restore on close
4. Touch targets: all buttons/links >= 44px on mobile
5. Color contrast: verify all text/bg pairs meet WCAG AA (4.5:1)
6. Final type-check + deploy verify
```

### Step 7-5: Full E2E Functional Verification (MANDATORY)

**Output:** `_uxui_redesign/phase-7-integration/e2e-verification.md`

**"Screenshot only" is NOT verification. Every interactive element must be tested.**

```
Step 7-5: Full E2E Functional Verification

  For EVERY page in project-context.yaml routes:

  1. INTERACTION INVENTORY — before testing, list ALL interactive elements on the page:
     - Buttons (submit, cancel, delete, toggle, action buttons)
     - Input fields (text, number, email, password, search)
     - Forms (login, create, edit, settings)
     - Dropdowns / Select menus
     - Tabs / Toggles / Switches
     - Delete / Destructive action buttons
     - Links (internal navigation, external)
     - Search / Filter controls
     - Pagination controls
     - Modal triggers
     - File upload inputs
     - Drag-and-drop zones

  2. TEST EACH ELEMENT:
     - Every button → click → record response:
       - Opens modal? → verify modal content + close behavior
       - Navigates? → verify correct destination
       - API call? → verify request sent + response handled
       - State change? → verify UI updates
       - Nothing? → FLAG as potential broken handler
     - Every input field → type text → verify:
       - Input accepts characters
       - Validation fires (if applicable)
       - Placeholder text shown when empty
     - Every form → fill ALL fields + submit → verify:
       - Success: success message/toast/redirect
       - Error: error message displayed (try empty submit)
     - Every dropdown/select → open → select option → verify:
       - Options list appears
       - Selection reflects in UI
       - Dependent fields update (if any)
     - Every tab/toggle → click → verify:
       - Active state changes visually
       - Content area updates
       - Previous tab content hidden
     - Every delete button → verify:
       - Confirmation dialog appears (if applicable)
       - Item removed from list after confirm
       - Cancel returns to previous state
     - Every link → click → verify:
       - Internal: correct page loads
       - External: opens in new tab (if target="_blank")
     - Every search/filter → enter query → verify:
       - Results update
       - Empty query shows all results
       - No-match shows empty state

  3. CRUD CYCLE (where applicable):
     - Create → verify item appears in list
     - Read → verify item details display correctly
     - Update/Edit → verify changes reflected
     - Delete → verify item disappears from list

  4. STATE VERIFICATION:
     - Empty state: if no data, verify empty state message shown (not blank page)
     - Loading state: verify loading indicator shown during data fetch
     - Error state: trigger error (e.g., network off) → verify error message

  5. CONSOLE ERRORS:
     - Collect ALL red errors from browser console (or code review for obvious runtime errors)
     - Categorize: critical (crash) vs warning (non-blocking)
     - 0 critical errors required to pass

  6. WRITE REPORT per page:
     ```
     Page: /dashboard
     Interactive Elements: 15
     Tested: 15
     Passed: 13
     Failed: 2
       - "Export PDF" button: onClick handler missing
       - Date range picker: selection not reflected in chart
     Console Errors: 0 critical, 1 warning (React key prop)
     CRUD: N/A (read-only page)
     Status: NEEDS FIX
     ```

  GATE: A page is NOT verified until ALL its interactive elements have been tested.
  - "Screenshot only" = NOT verified.
  - Missing interaction test = page FAILS QA.
  - Page with >0 critical console errors = FAILS QA.
  - Failed pages → fix → re-test → update report.

  git commit "docs(uxui-redesign): Phase 7-5 E2E verification complete"
```

---

## Orchestrator Flow

```
SETUP:
  Run Step 0 (Project Auto-Scan) → generate project-context.yaml
  mkdir -p _uxui_redesign/{all subdirs} → init pipeline-status.yaml → TeamCreate

FOR Phase 0~5:
  Read pipeline-status.yaml + project-context.yaml + context-snapshots
  Spawn Writer + Critic-A + Critic-B + Critic-C (apply opus override per table)
  For each Step: send instruction → monitor (timeout 15min) → validate party-logs → verify score >= 7
  On Phase complete: git commit "docs(uxui-redesign): Phase {N} complete" → update status → shutdown team

PHASE 6 (Stitch MCP — no team needed):
  Step 6-1: create_project → save projectId
  Step 6-2: For each page route from project-context.yaml → generate_screen_from_text → get_screen → save to phase-6-generated/web/
  Step 6-3: Same for app screens → phase-6-generated/app/
  Step 6-4: Landing page → phase-6-generated/landing/
  Step 6-5: Visual review (read screenshots, compare to tokens/theme) → retry if off
  git commit after each sub-step. Fallback: if MCP fails → status="fallback-manual" → STOP

PHASE 7 (Sequential + Parallel Execution):
  Step 7-0: App Shell Theme Sync (MUST run first, before any pages)
    → Sync entry file + layout + sidebar + index.html + CSS config with design tokens
    → Verify color-mode matches, fonts match, colors match
    → git commit

  Step 7-1: Page Rebuild (parallel agents)
    → Generate color-mapping.md from design-tokens + Stitch inline config
    → Split all pages into batches of 4-5
    → Launch parallel agents (each handles one batch)
    → Each agent: read Stitch HTML + read existing page → rebuild render output → commit
    → Wait for ALL agents → type-check → fix errors

  Step 7-1.5: File Completeness Gate (MUST pass before proceeding)
    → Parse router → verify ALL imports resolve → create missing files → type-check
    → GATE: 0 missing files. FAIL = stop.

  Step 7-2: Visual Verification (MANDATORY)
    → Screenshot or manual JSX comparison for EVERY page
    → Check theme consistency (app shell matches pages)
    → Fix mismatches → re-verify

  Step 7-3: API Binding + Routing
    → Verify hooks, routing, navigation links, real-time connections
    → Run tests → type-check

  Step 7-4: Accessibility + Final QA
    → axe-core, keyboard nav, focus management, touch targets, contrast

  Step 7-5: Full E2E Functional Verification (MANDATORY)
    → Test ALL interactive elements on ALL pages
    → CRUD cycles, empty/loading/error states, console errors
    → GATE: every element tested, 0 critical errors

  Final: type-check → git commit + push → deploy verify

Context snapshot after EVERY step → _uxui_redesign/context-snapshots/{phase}-{step}-snapshot.md
Contents: decisions, design tokens referenced, libre tools applied, constraints for next step, connections, critic scores
```

## Anti-Patterns (production failures — ranked by severity)

1. **"Add classes" instead of "rebuild render output"** — Agent adds `sm:p-4` to existing page instead of rewriting render output to match Stitch HTML. RESULT: Page looks nothing like the design. FIX: Phase 7 instruction explicitly says "REBUILD the render output" and "the page must VISUALLY MATCH the Stitch design." Verify by comparing output structure against HTML.
2. **Ignoring Stitch HTML structure** — Agent reads Stitch HTML but only extracts colors, ignores layout/sections/ordering. RESULT: Colors match but layout is completely different. FIX: Extract FULL structure (section ordering, grid patterns, card hierarchy) not just tokens.
3. **Orchestrator stops at intermediate milestone** — Generates HTML but doesn't convert to framework code, or converts but doesn't verify visual match. FIX: `계속` = run to Phase 7 complete + type-check pass + visual match verified.
4. **Treating Stitch nav/sidebar as authoritative** — Each Stitch HTML has its own sidebar/nav that differs between screens. FIX: IGNORE Stitch's nav. Use only the main content area. App shell (layout + sidebar) is the single source of truth for navigation.
5. **Phase 6 incomplete coverage** — Only generates screens from Phase 5 prompt, not all routes. FIX: Analyze all page routes from project-context.yaml and generate screens for each.
6. **Writer calls Skill tool** — Bypasses critic review. FIX: Read step files manually.
7. **Writer batches all steps** — Writes everything then sends one review. FIX: ONE step → review → fix → next.
8. **"App shell not synced with page theme"** — Pages rebuilt with new theme but Layout/Sidebar/entry file still uses old theme. RESULT: sidebar dark, pages light (or vice versa). Looks broken and unprofessional. FIX: Phase 7-0 syncs app shell FIRST, before any page work. All pages inherit the synced app shell.
9. **"Missing files shipped"** — Router references a file that doesn't exist on disk. RESULT: page crash on navigation, white screen of death. FIX: Phase 7-1.5 completeness gate parses ALL router imports and verifies every target file exists. 0 missing files = gate pass.
10. **"Screenshot-only QA"** — QA takes screenshots and says "looks fine" but never clicks any button, types in any input, or submits any form. RESULT: looks great, nothing works. FIX: Phase 7-5 requires ALL interactive elements tested with recorded results. "Screenshot only" explicitly marked as NOT verified.
11. **"Dark class conflicts with light theme"** — App entry file forces `className="dark"` but design tokens specify `color-mode: "light"`. RESULT: all colors inverted — light backgrounds become dark, dark text becomes light. FIX: Phase 7-0 reads color-mode from design-tokens.md and removes/adds dark class accordingly. Explicit verification step.

## Safeguards & Timeouts

| Mechanism | Value | Action |
|-----------|-------|--------|
| max_retry | 2 per step | 3 fails → ESCALATE |
| step_timeout | 15min + 2min grace | Reminder → grace → respawn with snapshots |
| party_timeout | 10min per round | Critic unresponsive → single-worker fallback |
| stall_threshold | 5min no message | Ping → 2nd stall → force-close |
| max_stalls | 3 | SKIP step |
| Phase 7 agent timeout | 10min per batch | Accept partial results |
| Stitch MCP timeout | 5min per screen | Retry once → fallback manual |

Additional:
- Party-log validation: critic-{a,b,c}.md + fixes.md must exist per step.
- On respawn: inject ALL context-snapshots. Team failure → single-worker fallback.
- Pipeline never blocks — timeout/fail/escalate always leads to "continue".
- Troubleshoot: vague output → critics reject (score 0). No references → expand search domains.

## Completion Gate (ALL must pass)

```
[ ] Step 0: project-context.yaml generated with all paths, framework, pages, tokens
[ ] Phase 0-5: all steps score >= 7/10
[ ] Phase 6: all screens generated (web + app + landing), visual review PASS
[ ] Phase 7-0: app shell theme matches design tokens (color-mode dark/light class correct)
[ ] Phase 7-0: Layout + Sidebar rebuilt with design-token colors
[ ] Phase 7-0: index.html has correct font CDN links for ALL design-token fonts
[ ] Phase 7-1: pages VISUALLY MATCH Stitch HTML (not just "classes added")
[ ] Phase 7-1: verify by comparing rebuilt output vs Stitch HTML — same structure, same colors, same layout
[ ] Phase 7-1: color-mapping.md generated dynamically from design-tokens (not hardcoded)
[ ] Phase 7-1.5: ALL router imports resolve to existing files (0 missing)
[ ] Phase 7-2: EVERY page screenshotted (or manually JSX-compared) against reference
[ ] Phase 7-2: app shell theme matches page theme on every page (no dark/light conflicts)
[ ] Phase 7-3: all API hooks connected, no broken imports
[ ] Phase 7-4: axe-core 0 critical violations, keyboard nav works
[ ] Phase 7-5: EVERY interactive element on EVERY page tested
[ ] Phase 7-5: ALL CRUD cycles verified where applicable
[ ] Phase 7-5: Console errors: 0 critical on all pages
[ ] Type-check: 0 errors (run project-context.yaml type_check_cmd)
[ ] git commit + push: deployed successfully
[ ] pipeline-status.yaml: all phases status=complete
[ ] working-state.md: updated with final status
```

### 2.1.76 Enhancements (auto-applied)

- **1M context window**: Opus 4.6 기본 100만 토큰 → Phase 0~5 연속 실행 시 압축 거의 없음
- **PostCompact hook**: 만약 압축이 발생해도 working-state.md + context-snapshots 자동 보존 (hooks.json)
- **Stale worktree auto-cleanup**: Phase 7 Integration 중 중단된 worktree 자동 정리 (Claude Code 내장)
- **Background agent partial results**: Writer/Critic 타임아웃 시에도 거기까지 작성한 내용 보존됨
- **Token estimation fix**: 토큰 과다 계산 수정 → 불필요한 조기 압축 방지 (2.1.75)
- **SessionEnd hook timeout**: 15초로 확장 → 종료 시 정리 작업 충분히 완료

## Core Rules

1. ALL outputs SPECIFIC — exact hex, utility classes, px. "Vague" = instant FAIL.
2. Writer NEVER uses Skill tool. ONE step → review → fix → verify → next.
3. Every step produces a context-snapshot with exact token values.
4. Phase 1 research cites REAL URLs and REAL products only.
5. Design tokens include WCAG AA contrast ratios for all text/bg pairs.
6. Stitch prompts are COPY-PASTE READY — no "[fill in]" placeholders. Phase 6 uses Stitch MCP to auto-generate.
7. Phase 7 produces WORKING code — no stubs/mocks. Type-check before commit.
8. pipeline-status.yaml is single source of truth. On resume: read it + project-context.yaml + all snapshots first.
9. Writer MUST read referenced libre skill files BEFORE writing. Critics verify this.
10. Phase 4 themes MUST use Archetype+Card synthesis (no generic "Neural Network" or "Cyberpunk" themes).
11. Accessibility audit uses libre-a11y methodology (axe-core patterns, full WCAG 2.1 AA checklist).
12. **`계속` = run to completion.** Do NOT stop at intermediate milestones (HTML gen, doc gen, etc.). The pipeline ends when Phase 7 status=complete AND type-check passes AND pages VISUALLY MATCH Stitch AND code is committed+pushed.
13. **Phase 7 = REBUILD, not patch.** Each page's render output must be REWRITTEN to match Stitch HTML structure. "Adding responsive classes to existing pages" is NOT Phase 7 completion. The page must look like the Stitch design when rendered.
14. **Phase 6 screen coverage**: Generate screens for ALL page routes (from project-context.yaml), not just those in Phase 5 prompt.
15. **Stitch HTML = visual spec, not drop-in code.** Extract layout/colors/typography from Stitch. Replace hardcoded demo data with real hooks. Map Stitch's inline config to design-tokens.md values via color-mapping.md. Map Stitch icons → project's icon library.
16. **Stitch inconsistencies (sidebar/nav) = ignore.** Each Stitch HTML is standalone — they have different sidebars, navs, etc. Use ONLY the main content area from each Stitch HTML. The app shell (layout + sidebar) is shared and consistent, synced in Step 7-0.
17. **Visual verification before completion.** After rebuilding each page, compare the output structure against Stitch HTML. Same section ordering, same card patterns, same color usage. If they don't match, it's not done.
18. **Step 0 runs FIRST, always.** project-context.yaml is the single source of truth for all project-specific paths. NO hardcoded paths anywhere else in the pipeline.
19. **Phase 7-0 runs before any page work.** App shell must be synced with design tokens before touching pages. This prevents dark/light conflicts.
20. **Phase 7-1.5 is a hard gate.** 0 missing files. No exceptions. Router imports that don't resolve = pipeline stop.
21. **Phase 7-5 requires interaction testing, not just screenshots.** Every button clicked, every input typed, every form submitted. "Looks fine" is not "works fine".

ARGUMENTS: $ARGUMENTS
