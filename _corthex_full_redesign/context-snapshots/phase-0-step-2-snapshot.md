# Phase 0-2 Context Snapshot — Vision & Identity v2.0

**Date:** 2026-03-15
**Status:** PASS (v2.0 — 809 lines, all 11 sections + 2 appendices)
**Output:** `_corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md`

## Key Decisions for Subsequent Phases

### Brand Archetype
- **Sovereign Sage** (Ruler + Sage) — authoritative, intelligent, premium, structured, efficient
- Voice: Korean 존댓말, button labels 명령형, no emoji, clinical errors with ERROR_CODE

### Design Movement
- **Swiss International Style** (dark mode adaptation) — 12-col grid, flush-left, Inter font
- Rejected: Flat/Material (too consumer), Neo-Brutalism (too raw for Korean CEO persona)

### Color System (CHANGED from v1)
- Page bg: `#020617` slate-950 (changed from zinc-950)
- Surface: `#0F172A` slate-900
- Primary accent: **cyan-400** `#22D3EE` (changed from indigo-600) — means "active"
- Handoff: violet-400, Success: emerald-400, Warning: amber-400, Error: red-400, Working: blue-400
- NEXUS bg: `#040D1A` (custom deep navy)
- Login: white/zinc-950 + indigo-600 CTA (exception)
- Color rule: max 2 semantic accents per screen (Vignelli)

### Typography (CHANGED from v1)
- **Inter** (not Geist, not Pretendard) — Vignelli 2-typeface constraint
- **JetBrains Mono** — technical contexts only
- Decision rationale: Inter handles mixed Korean/Latin at small sizes better than Pretendard

### Layout (CHANGED from v1)
- Sidebar: **280px** (not 240px) — golden ratio: 1160/280 ≈ φ³
- Content grid: 12-col, 24px gutter, max-w-1440px
- Hub: col-span-8 (output) + col-span-4 (Tracker)
- Active nav: `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400`

### Feature Priority
- P0: Hub, NEXUS, Dashboard, Chat
- P1: Agents, Departments, Jobs/ARGOS, Reports
- P2: SNS, Trading, Messenger, Library, AGORA, Files
- P3: Costs, Performance, Activity Log, Settings, Classified, Tiers, Ops Log

### Design Principles (7)
1. Show the Org, Not the AI
2. Command, Don't Chat
3. State Is Sacred
4. Density Without Clutter
5. One Primary Action Per Screen
6. The Grid Is the Law
7. Soul Is Never Hidden

### Button Hierarchy
- Primary: `bg-cyan-400 text-slate-950` (filled)
- Secondary: `border border-cyan-400/50 text-cyan-400` (outlined)
- Tertiary: `text-slate-400 hover:text-slate-200` (ghost)
- Destructive: `bg-red-400/10 text-red-400 border border-red-400/30`

### Motion
- Conservative: no parallax/particles/lottie
- Agent pulse: opacity 0.7→1.0 over 1.5s ease-in-out
- Dept clusters: `border border-violet-400/20 rounded-3xl`

### Terminology (Appendix A)
- Hub (not 사령관실), NEXUS (not 조직도), Handoff (not 위임), Tracker (not 상태창)

## Libre Tools Applied
- Design Masters (Rams 10 principles, Vignelli Canon, Muller-Brockmann Grid, Bass Geometric Reduction)
- Design Movements (Swiss International, Flat/Material, Neo-Brutalism evaluated)
- Design Principles (Gestalt 5 principles, Golden Ratio, WCAG contrast)

## Connections to Next Steps
- Phase 1: Research dashboards matching Swiss + Dark Tech aesthetic
- Phase 2: Score options against 7 Design Principles + Rams' test
- Phase 3: Operationalize Inter/JetBrains Mono, cyan-400 primary, 280px sidebar into tokens
- Phase 4: Themes override accent palette while preserving Swiss structure
