# Phase 0-2 Context Snapshot — Vision & Identity

**Date:** 2026-03-15
**Status:** PASS (avg 8.67/10)
**Output:** `_corthex_full_redesign/phase-0-foundation/vision/corthex-vision-identity.md`

## Key Decisions for Subsequent Phases

### Brand Archetype
- **Sovereign Sage** (Ruler + Sage) — authoritative, intelligent, premium, structured, efficient
- Voice: Korean 존댓말 default, button labels 명령형, no emoji, clinical error messages

### Design Movement
- **Swiss International Style** (primary) — 12-col grid, flush-left, type-driven
- **Dark Tech UI** (atmospheric) — zinc-950/slate-900 base, luminous accents
- **Glassmorphism** (selective) — modals only, backdrop-blur-xl bg-slate-900/80

### Color System
- Base: zinc-950 (page), slate-900 (surface), slate-800 (elevated), slate-700 (border)
- Text: slate-100 (primary), slate-400 (secondary), slate-500 (muted — 4.82:1 verified)
- CTA: indigo-600 (primary), indigo-700 (hover)
- Status: emerald-400 (online), blue-400 (working), red-400 (error), slate-500 (offline)
- Tier: violet-400 (T1), sky-400 (T2), slate-400 (T3)
- Secretary: amber-500/15 + amber-400
- Light theme (landing/login): bg-white, bg-slate-50, text-slate-900

### Typography
- Display/Brand: **Geist** (Vercel)
- Body/UI: **Pretendard** (Korean+Latin)
- Monospace: **JetBrains Mono**
- Scale: 32px Display → 12px Small, 4px base unit

### Layout
- App sidebar: 64px collapsed / 240px expanded
- Admin sidebar: 64px / 256px
- 12-column grid desktop, 8-col tablet, 4-col mobile
- Breakpoints: sm(640), lg(1024), xl(1440), 2xl(1440+)
- Card pattern: rounded-2xl + gradient from-{color}-600/15

### Feature Priority
- P0: Hub, Chat, NEXUS, Dashboard, Home
- P1: Agents, Departments, Jobs, Reports, Command Center, ARGOS
- P2: SNS, Trading, Messenger, Knowledge, AGORA, Tiers, Performance
- P3: Costs, Activity Log, Settings, Classified, Cron, Files, Notifications

### Motion
- Conservative: 150ms page, 200ms modal, 300ms toast, 1.5s skeleton
- No parallax, particles, hero videos, lottie

### Design Masters Applied
- Rams: 10 principles mapped to CORTHEX (every element earns its place)
- Vignelli: 3-font constraint (Geist + Pretendard + JetBrains Mono)
- Muller-Brockmann: 12-col mathematical grid
- Bass: reductionism for icon/logo direction

### UX Principles (6)
1. Hierarchy is Sacred (tier visual primacy)
2. Hub is Center of Gravity (80% time)
3. Data Before Decoration (status → data → actions → metadata → nav)
4. Real-Time Must Feel Real (streaming animations)
5. Density Without Clutter (tables vs cards criteria)
6. Mobile is Secondary, Not Absent

## Libre Tools Applied
- Design Masters (Rams, Vignelli, Muller-Brockmann)
- Design Movements (Swiss International, Dark Tech, Glassmorphism)
- Design Principles (gestalt, hierarchy, contrast)

## Connections to Next Steps
- Phase 1: Research dashboards matching Swiss + Dark Tech aesthetic
- Phase 2: Score options against these 6 UX principles + Rams' principles
- Phase 3: Operationalize color tokens, typography scale, grid into tailwind.config
- Phase 4: Themes override the base accent palette while preserving structure
