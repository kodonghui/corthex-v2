# CORTHEX v3 — Vision & Identity Document

**Phase:** 0-Foundation, Step 0-2
**Date:** 2026-03-23
**Source of Truth:** Benchmark Report + Design Masters + Design Movements + Design Principles + Product Brief v3 + Technical Spec (Step 0-1)

---

## 1. Brand Essence

### 1.1 What CORTHEX Is

CORTHEX is an **AI Agent Orchestration Platform** where a human CEO commands, observes, and nurtures a dynamic hierarchy of AI agents. It is:

- **A command center** — the CEO sees everything, delegates anything, tracks every cost
- **A living organization** — agents have departments, tiers, personalities (Big Five), and memory
- **A trust engine** — every action is audited, every cost tracked, every delegation traced

### 1.2 Brand Personality

| Trait | Expression | Anti-Pattern |
|-------|-----------|-------------|
| **Authoritative** | Dark, structured interfaces convey command & control | Not militaristic — warm, not cold |
| **Organic** | Natural color palette (olive, cream, sage) suggests growth | Not sterile — living, not clinical |
| **Intelligent** | Clean typography, precise spacing, data-rich dashboards | Not cluttered — curated, not overwhelming |
| **Trustworthy** | Consistent patterns, clear feedback, honest error states | Not opaque — transparent, not hidden |

### 1.3 Brand Promise

> "Your AI organization, alive and accountable."

The CEO should feel like they are looking through glass into a functioning organization — seeing agents work, grow, and deliver results — not staring at a terminal waiting for text.

### 1.4 Naming & Terminology

| Internal Concept | User-Facing Term | Rationale |
|-----------------|-----------------|-----------|
| AI instance | **Agent** (에이전트) | Industry standard, implies autonomy |
| Agent group | **Department** (부서) | Organizational metaphor matches CEO mental model |
| Hierarchy level | **Tier** (티어) | Gaming/tech-native, avoids corporate "rank" |
| Primary interface | **Hub** (허브) | Central control point metaphor |
| Delegation chain | **Handoff** (핸드오프) | Active verb, implies trust transfer |
| Visual org chart | **NEXUS** | Network of connections, sci-fi authority |
| Background tasks | **Night Jobs / ARGOS** | Mythological watchfulness (Argos Panoptes) |
| Debate platform | **AGORA** | Greek public assembly — democratic discourse |
| Virtual office | **OpenClaw** (v3) | Brand-specific, playful |

---

## 2. Design Direction

### 2.1 Benchmark Synthesis

From the Phase 0.5 benchmark of 15 sites (Linear, Vercel, Supabase, Notion, shadcn/ui, etc.):

**Key Patterns Adopted:**
1. **Linear's sidebar-driven dashboard** — persistent left nav, minimal chrome, content-first
2. **Notion's warm accessibility** — friendly to non-developers, readable typography
3. **shadcn/ui's component philosophy** — headless + Tailwind, zero runtime CSS
4. **Vercel's landing structure** — gradient hero, social proof, clear CTA hierarchy
5. **Resend's dark + serif combination** — premium feel through type contrast

**Patterns Rejected:**
1. GitHub's WebGL backgrounds — too heavy for VPS constraint (Oracle ARM 4-core 24GB)
2. Supabase's full-dark with green accent — too developer-centric, alienates non-tech CEO
3. Mixpanel's card-heavy layout — too busy for 22-page app with diverse content types

### 2.2 Chosen Direction: Natural Organic (Option C from Benchmark Report)

**Why Natural Organic over Dark Minimal or Light Warm:**

| Criterion | Dark Minimal (Option A) | Light Warm (Option B) | Natural Organic (Option C) |
|-----------|------------------------|----------------------|---------------------------|
| Brand fit | Tech-forward but generic | Approachable but ordinary | **Distinctive — olive/sage is rare in SaaS** |
| CEO persona | Developer-centric | Consumer-friendly | **Executive: authoritative yet warm** |
| Accessibility | High contrast risk | Good contrast | **Good contrast + warm readability** |
| v3 Virtual Office | Dark clashes with pixel art | Light works but bland | **Organic palette complements pixel world** |
| Differentiation | Looks like Linear/Supabase | Looks like Notion/Clerk | **No direct competitor uses this palette** |

### 2.3 Design Philosophy Statement

> **"Controlled Nature"** — Structure meets organicism. The precision of a command center wrapped in the warmth of natural materials.

Inspired by:
- **Dieter Rams** — "Less, but better." Every element earns its screen space.
- **Massimo Vignelli** — Systematic grid, constrained palette, typography as architecture.
- **Wabi-sabi (侘寂)** — Finding beauty in imperfection and natural materials. The olive and cream palette echoes wood, stone, and leaf — not chrome and neon.

---

## 3. Color System

### 3.1 Primary Palette — "Sovereign Sage"

| Role | Token | Hex | Usage | 60-30-10 Zone |
|------|-------|-----|-------|---------------|
| Background | `--bg-primary` | `#faf8f5` | Page background, content area | 60% (Dominant) |
| Surface | `--bg-surface` | `#f5f0e8` | Cards, panels, elevated elements | 60% (Dominant) |
| Surface border | `--border-primary` | `#e5e1d3` | Card borders, dividers | 60% (Dominant) |
| Sidebar / Chrome | `--bg-chrome` | `#283618` | Sidebar background, primary actions | 30% (Secondary) |
| Sidebar accent | `--bg-chrome-hover` | `white/10` | Hover/active states on dark chrome | 30% (Secondary) |
| Primary accent | `--accent-primary` | `#606C38` | Active indicators, focus rings, primary buttons | 10% (Accent) |
| Secondary accent | `--accent-secondary` | `#5a7247` | Secondary buttons, tags, subtle highlights | 10% (Accent) |

### 3.2 Text Colors

| Role | Token | Hex | Contrast on `#faf8f5` | WCAG AA |
|------|-------|-----|-----------------------|---------|
| Primary text | `--text-primary` | `#1a1a1a` | 16.5:1 | PASS |
| Secondary text | `--text-secondary` | `#6b705c` | 4.7:1 | PASS |
| Tertiary / placeholder | `--text-tertiary` | `#756e5a` | 4.5:1 | PASS (was `#a3a08e` at 2.46:1 — corrected) |
| Sidebar text | `--text-chrome` | `#a3c48a` | N/A (on `#283618`: 6.63:1) | PASS |
| Sidebar text dim | `--text-chrome-dim` | `#a3c48a/60` | N/A (on `#283618`: ~4.5:1) | PASS (marginal) |

### 3.3 Semantic Colors

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Success | `--semantic-success` | `#4d7c0f` | Completed tasks, online status, pass indicators |
| Warning | `--semantic-warning` | `#b45309` | Budget threshold, approaching limits |
| Error | `--semantic-error` | `#dc2626` | Failed tasks, error states, offline status |
| Info | `--semantic-info` | `#2563eb` | Informational banners, help text |

> **Rule:** No provider-specific colors in charts. Dashboard AI usage chart uses chart palette (see 3.4), NOT hardcoded Anthropic/OpenAI/Google brand colors.

### 3.4 Chart Palette (Data Visualization)

| Index | Hex | Usage |
|-------|-----|-------|
| 1 | `#606C38` | Primary data series |
| 2 | `#2563eb` | Secondary data series (cool blue — color-blind safe differentiator) |
| 3 | `#8B9D77` | Tertiary data series |
| 4 | `#b45309` | Quaternary data series (warm amber — color-blind safe differentiator) |
| 5 | `#D4C5A9` | Fifth series |
| 6 | `#A68A64` | Sixth series |

> **Color-blind safety:** Pure olive-family palette has insufficient luminance separation for deuteranopia (~8% of males). Positions 2 and 4 use cool blue and warm amber to ensure hue differentiation across all color vision types. Additionally, charts should support **pattern fills** (dashed, dotted, hatched) as a secondary differentiator when >3 series are displayed.

### 3.5 Theme Architecture

**Single theme only.** The 5-theme system (Sovereign/Imperial/Tactical/Mystic/Stealth) from v2 is deprecated. Maintaining 5 themes caused the 428-location color-mix incident. v3 ships with Sovereign Sage only.

**Dark mode:** Not planned for v3 initial launch. The Natural Organic palette is optimized for light mode. Dark mode can be added later as a single alternative theme (not 5).

---

## 4. Typography

### 4.1 Type Stack

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **UI (primary)** | Inter | 400, 500, 600, 700 | system-ui, -apple-system, sans-serif |
| **Code / monospace** | JetBrains Mono | 400, 500 | 'Fira Code', 'Cascadia Code', monospace |
| **Korean serif** | Noto Serif KR | 400, 700 | 'Batang', serif |

> **CDN Fix Required:** `packages/app/index.html` must add JetBrains Mono `<link>` (currently only in admin). See Technical Spec Section 1.2.

### 4.2 Type Scale (Custom Modular Scale)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 12px | 1.5 (18px) | Labels, badges, timestamps, build number |
| `--text-sm` | 14px | 1.5 (21px) | Body text, nav items, form inputs |
| `--text-base` | 16px | 1.5 (24px) | Emphasized body, card descriptions |
| `--text-lg` | 18px | 1.5 (27px) | Section headings, card titles |
| `--text-xl` | 20px | 1.4 (28px) | Page subtitles |
| `--text-2xl` | 24px | 1.3 (31px) | Page titles |
| `--text-3xl` | 32px | 1.2 (38px) | Hero headings (Dashboard, Hub welcome) |
| `--text-4xl` | 40px | 1.1 (44px) | Landing page hero (marketing site only) |

### 4.3 Typography Principles

1. **Two fonts maximum in any single view.** Inter for UI, JetBrains Mono for code/data. Noto Serif KR is reserved for Korean long-form content only.
2. **Weight hierarchy:** 400 (body) → 500 (emphasis/nav active) → 600 (headings) → 700 (brand/hero). Never skip weights.
3. **Monospace for data:** Agent IDs, cost values (`$0.0042`), API endpoints, code blocks, build numbers — always JetBrains Mono.
4. **Brand "CORTHEX":** Upgrade from `text-sm` (14px) to `text-lg` (18px) 600 weight. Current 14px is same as body text — weak brand presence.

---

## 5. Spacing & Layout

### 5.1 Base Grid

**8px base grid.** All spacing values are multiples of 8px (with 4px half-step for tight contexts).

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0.5` | 4px | Icon-text gap, inline badge padding |
| `--space-1` | 8px | Tight padding (pills, tags) |
| `--space-1.5` | 12px | Nav item horizontal padding |
| `--space-2` | 16px | Card internal padding, form field gap |
| `--space-3` | 24px | Section gap, content area padding |
| `--space-4` | 32px | Page section separation |
| `--space-6` | 48px | Major section dividers |
| `--space-8` | 64px | Page top/bottom margins |

### 5.2 App Shell Dimensions

| Element | Value | Rationale |
|---------|-------|-----------|
| Sidebar width | 280px | Accommodates Korean text (longer than English) |
| Topbar height | 56px (h-14) | 8px grid × 7 — room for breadcrumb + search + bell |
| Content max-width | 1440px | Optimal reading width for dashboard grids |
| Content padding | 24px (p-6) | 3 × 8px — breathing room without waste |
| Mobile breakpoint | 1024px (lg) | Below: sidebar collapses to overlay |

### 5.3 Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small pills, inline badges |
| `--radius-md` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 12px | Cards, panels, modals |
| `--radius-xl` | 16px | Large feature cards, hero sections |
| `--radius-full` | 9999px | Avatars, status dots |

---

## 6. Iconography

### 6.1 Icon System

**Lucide React exclusively.** No Material Symbols, no custom SVGs for standard UI.

| Principle | Rule |
|-----------|------|
| Stroke width | 2px (Lucide default) — consistent across all icons |
| Size in nav | 20px (`w-5 h-5`) |
| Size in buttons | 16px (`w-4 h-4`) |
| Size in page headers | 24px (`w-6 h-6`) |
| Color | Inherits from text color (`currentColor`) |
| Decorative icons | `aria-hidden="true"` — hidden from screen readers |
| Interactive icons | Must have `aria-label` — accessible name |

### 6.2 Status Indicators

| Status | Visual | Color | Icon |
|--------|--------|-------|------|
| Online | Solid dot | `--semantic-success` | `Circle` (filled) |
| Working | Pulse dot | `--accent-primary` | `Circle` (animated pulse) |
| Error | Solid dot | `--semantic-error` | `AlertCircle` |
| Offline | Ring dot | `--text-tertiary` | `Circle` (outline) |

---

## 7. Motion & Animation

### 7.1 Animation Principles

1. **Purposeful only.** Animation must communicate state change, not decorate.
2. **Respect user preference.** All animations must be wrapped in `prefers-reduced-motion` media query.
3. **Performance budget.** No animation that triggers layout recalculation. Transform and opacity only.

### 7.2 Timing Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-fast` | 100ms | ease-out | Hover states, focus rings |
| `--duration-normal` | 200ms | ease-in-out | Page transitions, modal open/close |
| `--duration-slow` | 300ms | ease-in-out | Sidebar slide, drawer open |
| `--duration-pulse` | 2000ms | ease-in-out (infinite) | Working status indicator |

### 7.3 Transition Patterns

| Context | Animation | Reduced-Motion Fallback |
|---------|-----------|------------------------|
| Sidebar mobile open | `translateX(-100% → 0)` 300ms | Instant show (no slide) |
| Modal open | `opacity(0→1) + scale(0.95→1)` 200ms | Instant show |
| Toast enter | `translateY(100% → 0)` 200ms | Instant show |
| Streaming text | Character-by-character reveal | Instant paragraph show |
| Agent status pulse | Opacity 1→0.5→1 cycle 2s | Static dot (no pulse) |
| Page route change | No animation (instant swap via React.lazy) | Same |

---

## 8. Design Movement Alignment

### 8.1 Primary Movement: International Typographic Style (Swiss Design)

CORTHEX's UI structure aligns most closely with the **International Typographic Style** (1950s–present):

| Swiss Principle | CORTHEX Application |
|----------------|---------------------|
| Grid-based layout | 8px grid system, consistent sidebar/topbar/content structure |
| Sans-serif typography | Inter as primary — clean, neutral, information-first |
| Asymmetric layouts | Sidebar (fixed 280px) + content (fluid) — intentional asymmetry |
| Photography/data over illustration | Metric cards, charts, data tables — not decorative illustrations |
| Mathematical type scale | Major Third (1.250) ratio — systematic, not arbitrary |

### 8.2 Secondary Influence: Arts & Crafts Movement

The Natural Organic palette draws from **Arts & Crafts** (1860s–1910s) — William Morris's celebration of natural materials:

| Arts & Crafts Principle | CORTHEX Application |
|------------------------|---------------------|
| Natural materials | Olive, cream, sand palette — wood, stone, leaf associations |
| Honest construction | No faux-3D, no gradients simulating material — flat surfaces with real borders |
| Craftsmanship over mass production | Bespoke color palette (no generic blue SaaS) — unique brand identity |

### 8.3 Tertiary: Contemporary Flat Design (2010s)

| Flat Design Principle | CORTHEX Application |
|----------------------|---------------------|
| No skeuomorphism | No shadows simulating depth (subtle elevation shadows only for z-order) |
| Bold color blocks | Sidebar dark olive block, cream content block — clear figure/ground |
| Icon-driven navigation | Lucide icons with text labels — no icon-only mystery nav |

---

## 9. Jungian Archetype

### 9.1 Primary Archetype: The Ruler

CORTHEX embodies **The Ruler** archetype — the leader who creates order from chaos, commands with authority, and builds systems that endure.

| Ruler Trait | CORTHEX Expression |
|-------------|-------------------|
| Control | CEO commands agents via Hub, monitors via Dashboard |
| Structure | Departments, Tiers, NEXUS hierarchy — organizational order |
| Responsibility | Cost tracking, quality reviews, audit logs — accountability |
| Legacy | Agent memory, knowledge base — organizational learning |

### 9.2 Shadow: The Tyrant

The Ruler's shadow is The Tyrant — obsessive control, micromanagement, distrust. CORTHEX counters this by:

- **Trust indicators:** Agent success rates, quality pass rates — proof that delegation works
- **Autonomy tools:** Night jobs, ARGOS triggers — agents work independently while CEO sleeps
- **Personality system:** Big Five traits give agents individuality — they're not interchangeable tools

### 9.3 Secondary Archetype: The Sage

Knowledge management, performance analytics, quality reviews, and memory architecture embody **The Sage** — the pursuit of understanding through data and reflection.

| Sage Trait | CORTHEX Expression |
|------------|-------------------|
| Wisdom | Agent memory: observation → reflection → planning |
| Analysis | Performance dashboard, cost analytics, quality reviews |
| Knowledge | Library (RAG), Classified archives, department knowledge |

### 9.4 Archetype → Design Mapping

| Archetype | Color Expression | Typography Expression | Layout Expression |
|-----------|-----------------|----------------------|-------------------|
| Ruler | Dark olive sidebar (authority), structured borders | Inter 600/700 for headings (command) | Hierarchical sidebar → content (top-down control) |
| Sage | Cream background (wisdom/parchment), warm surfaces | JetBrains Mono for data (precision) | Data-rich dashboards, metric cards (analysis) |

---

## 10. Component Philosophy

### 10.1 Migration Strategy: Subframe → shadcn/ui Pattern

**From:** 44 Subframe components with `@subframe/core` runtime dependency
**To:** Headless components (Radix UI primitives) + Tailwind CSS utility classes (zero-runtime)

| Principle | Implementation |
|-----------|---------------|
| Zero runtime CSS | No CSS-in-JS, no styled-components, no @subframe/core — Tailwind utilities only |
| Composition over configuration | Small, composable components (Button + Icon, not IconButton) |
| Headless accessibility | Radix UI primitives for complex interactions (Dialog, Dropdown, Tooltip) |
| Design token driven | All visual properties reference CSS custom properties (Section 3-5 tokens) |
| Copy-paste ownership | Components live in project (not imported from package) — full control |

**Bundle Impact Assessment:**
- `@subframe/core` removal: estimated **-200–400KB** (runtime CSS engine + unused components)
- Radix UI primitives (tree-shaken): estimated **+50–80KB** (only Dialog, DropdownMenu, Tooltip, Select, Accordion imported)
- **Net savings: ~120–350KB** — significant improvement, especially for mobile load times
- Radix UI packages are individually installable (`@radix-ui/react-dialog`, etc.) — no monolithic import

### 10.2 Component Categories (Migration Priority)

| Priority | Category | Count | Reason |
|----------|----------|-------|--------|
| P0 | Form components | 10 | Used on every CRUD page — highest impact |
| P1 | Dialog / Overlay | 5 | Critical for modals, drawers, dropdowns |
| P2 | Data Display | 7 | Charts and tables appear on Dashboard, Costs, Performance |
| P3 | Navigation | 5 | App shell (already rebuilt in Phase 7) |
| P4 | Feedback | 5 | Toast, Alert, Progress — cross-cutting |
| P5 | Interaction + Compound + Utility | 14 | Lower frequency, simpler migration |

---

## 11. Accessibility Commitments

### 11.1 WCAG 2.1 AA Targets

| Requirement | Target | Current Gap |
|-------------|--------|-------------|
| Color contrast (normal text) | 4.5:1 minimum | Tertiary text was 2.46:1 — corrected to `#756e5a` (4.5:1) |
| Color contrast (large text) | 3:1 minimum | Met |
| Focus indicators | Visible on all interactive elements | Partial — needs audit |
| Keyboard navigation | Full operability without mouse | Untested — needs skip-to-content link |
| Screen reader landmarks | Correct `<nav>`, `<main>`, `<aside>` hierarchy | Partial |
| Reduced motion | `prefers-reduced-motion` respected | **0 instances** — must add to all animations |
| ARIA attributes | Correct roles, labels, live regions | 78 attributes/26 files — inconsistent coverage |

### 11.2 Accessibility Design Rules

1. **Never use color alone** to convey information. Status indicators use color + icon + text label.
2. **All icon buttons must have `aria-label`.** No icon-only buttons without accessible name.
3. **Active nav item:** Uses visual styling (background) + `aria-current="page"`.
4. **Modal focus trap:** When Dialog/Drawer opens, focus trapped inside. Escape key closes.
5. **Error messages:** Connected to input via `aria-describedby`. Not just red color.
6. **Live regions:** `aria-live="polite"` for notification count, streaming text. `aria-live="assertive"` for error alerts.

---

## 12. Voice & Tone (UI Copy)

### 12.1 Language Strategy

| Context | Language | Rationale |
|---------|----------|-----------|
| Primary UI labels | Korean (한국어) | CEO's native language — zero cognitive translation |
| Technical terms | English preserved | Agent, Hub, NEXUS, ARGOS — brand terms stay English |
| Error messages | Korean with error code | `[E-AUTH-001] 세션이 만료되었습니다. 다시 로그인해주세요.` |
| Toast notifications | Korean, concise | `작업 완료 ✓` not `The operation has been completed successfully.` |
| Empty states | Korean, encouraging | `첫 번째 에이전트를 만들어보세요` — action-oriented |

### 12.2 Tone Principles

| Principle | Example | Anti-Pattern |
|-----------|---------|-------------|
| **Concise** | `저장 완료` | `변경 사항이 성공적으로 저장되었습니다` |
| **Action-oriented** | `에이전트 생성` | `새 에이전트를 생성하시겠습니까?` |
| **Honest about errors** | `API 연결 실패 — 3초 후 재시도` | `문제가 발생했습니다` |
| **Respectful** | `예산 한도에 도달했습니다` | `예산 초과!!!` |

---

## 13. Responsive Strategy

### 13.1 Breakpoints

| Breakpoint | Name | Layout |
|-----------|------|--------|
| < 640px | Mobile (sm) | Single column, hamburger nav, stacked cards |
| 640–1023px | Tablet (md) | Single column with wider cards, hamburger nav |
| 1024–1439px | Desktop (lg) | Sidebar visible, 2-column grids |
| ≥ 1440px | Wide (xl) | Sidebar visible, 3-column grids, max-width container |

### 13.2 Mobile-First Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed left panel (280px) | Hamburger → overlay slide-in (backdrop blur) |
| Trading 4-panel | Side-by-side panels | Tab navigation between panels |
| Messenger 3-column | All three visible | Channel list = overlay drawer, member list hidden |
| Dashboard grid | 3-column metric cards | Single column stacked |
| NEXUS canvas | Full viewport with pan/zoom | Zoomed-out overview, pinch-to-zoom |
| Tables | Full columns | Horizontal scroll or responsive card view |

---

## 14. Landing Page Identity (packages/landing)

### 14.1 Landing vs App Distinction

| Aspect | Landing Site | CEO App |
|--------|-------------|---------|
| Purpose | Attract, explain, convert | Command, monitor, manage |
| Tone | Inspirational, aspirational | Functional, efficient |
| Typography | Large hero (32-40px), dramatic | Compact (14-18px), dense |
| Color emphasis | More accent color (olive/sage CTAs) | More neutral (cream/white surfaces) |
| Animation | Scroll-triggered, attention-grabbing | Minimal, state-change only |
| Layout | Full-width sections, marketing grid | Sidebar + content, data-dense |

### 14.2 Landing Design Reference

Following Vercel/Stripe landing patterns:
1. **Hero:** Centered large title (40px) + subtitle (18px) + 2 CTAs (Primary `#606C38` + Ghost)
2. **Social proof:** Logo scroll bar (if applicable)
3. **Features:** Tab-based or card grid showcasing Hub, Dashboard, NEXUS, OpenClaw
4. **Pricing:** Simple tier comparison (if applicable)
5. **Footer:** Minimal — links + copyright

---

## 15. Summary — Design Identity Card

| Dimension | Value |
|-----------|-------|
| **Brand name** | CORTHEX |
| **Tagline** | "Your AI organization, alive and accountable." |
| **Archetype** | The Ruler (primary) + The Sage (secondary) |
| **Design movement** | Swiss Design (structure) + Arts & Crafts (warmth) |
| **Design masters** | Rams (less but better), Vignelli (systematic), Brockmann (grid) |
| **Color palette** | Sovereign Sage — cream `#faf8f5`, olive `#283618`, sage `#606C38` |
| **Typography** | Inter (UI) + JetBrains Mono (data) — Major Third scale |
| **Grid** | 8px base, 280px sidebar, 56px topbar |
| **Icons** | Lucide React, 2px stroke, `currentColor` |
| **Motion** | Purposeful only, `prefers-reduced-motion` respected |
| **Accessibility** | WCAG 2.1 AA, contrast ≥ 4.5:1, keyboard-first |
| **Theme count** | 1 (Sovereign Sage) — no multi-theme |
| **Dark mode** | Deferred (not v3 initial launch) |
| **Component system** | Headless (Radix UI) + Tailwind CSS — zero runtime |
| **Landing vs App** | Aspirational (landing) vs Functional (app) |

---

*End of Vision & Identity — Phase 0-Foundation, Step 0-2*
