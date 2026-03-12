# Context Snapshot — Phase 1, Step 1-1: Web Dashboard Layout Research

**Date**: 2026-03-12
**Score**: 8.75/10 (Critic-A: 8.5/10, Critic-B: 9.0/10) — PASS
**Output file**: `_corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md` (864 lines)
**Rounds**: 2 (Round 1 → 9 issues identified → Round 2 all fixed)

---

## Key Decisions & Facts Established

### 10 Reference Products Analyzed
| Product | URL | Key pattern for CORTHEX |
|---------|-----|------------------------|
| Anthropic Console | https://console.anthropic.com | Configure-left/observe-right split → Hub DNA |
| OpenAI Platform | https://platform.openai.com | KPI→chart→table data layout → Dashboard pattern |
| W&B web dashboard | https://docs.wandb.ai/guides/app/ | Real-time auto-refresh → SSE streaming analog |
| W&B LEET | https://app.getbeamer.com/wandb/... | **Terminal TUI only** (not web) — conceptual 3-pane ref |
| Grafana | https://grafana.com/grafana/ | Web 3-panel layout reference (confirmed browser-based) |
| Linear 2025 redesign | https://linear.app/now/how-we-redesigned-the-linear-ui | Visual noise reduction, adaptive panels |
| Vercel new dashboard | https://vercel.com/try/new-dashboard | Context-preserving nav, collapsible sidebar icon-strip |
| Supabase | https://supabase.com/ui | SQL Editor → Soul Editor pattern (CodeMirror left + preview right) |
| CrewAI Studio | https://docs.crewai.com/en/enterprise/features/crew-studio | Canvas + sidebar + execution panel → NEXUS reference |
| shadcn/ui | https://ui.shadcn.com/examples/dashboard | Zinc palette, SidebarProvider, card grid |

### TOP 3 Layout Options for CORTHEX

**Option A: Fixed Command Center (3-Column Persistent)**
- All panels always visible: `flex [AppSidebar w-60][nav w-64][main flex-1][aside w-80]`
- TrackerPanel: `transition-[width] duration-250 motion-reduce:transition-none`, `w-80↔w-12`
- NEXUS: config panel `absolute right-0 w-96` (canvas doesn't reflow)
- Width at 1440px: Chat = 624px (expanded) / 896px (collapsed)
- **Hub soft-minimum: 1440px** (at 1280px, Chat = 464px — tight for investment report markdown)

**Option B: Adaptive Commander Dashboard (Context-Aware)**
- TrackerPanel auto-expands on `handoff` SSE event → collapses after `complete`
- 3s auto-collapse = **ASSUMPTION, requires user testing validation**
- NEXUS: config panel reflows canvas to 816px (flex layout, not absolute)
- Best for product demo: TrackerPanel expanding IS the reveal moment

**Option C: Resizable Commander Panels**
- `react-resizable-panels` library: `[PanelGroup horizontal][Panel SessionPanel 20%][Panel Chat][Panel Tracker 25%]`
- SessionPanel: min 17% (208px) / default 20% (256px) / max 27% (320px)
- Tracker: collapsible to 4% (48px icon-strip) / max 32% (384px)
- localStorage persistence for panel sizes
- Solves 464px problem via user control

### Rejected Alternative
**Status Rail (Mission Control)**: NOT recommended. Violates Phase 0 3-column Hub spec. Regresses to current `HandoffTracker` horizontal bar implementation. One salvageable element: agent status dots in sidebar header (`bg-zinc-900 border-b border-zinc-800 px-4 py-2`).

### NEXUS Canvas Layout (all options)
- Admin NEXUS: `[AdminSidebar w-60 fixed][ReactFlow canvas flex-1][Config panel w-96]`
- At 1440px: canvas = 1200px (no config) / 816px (with config)
- Config panel: absolute-positioned (Options A, C) or flex-reflows (Option B)

### ARIA Landmarks (all options)
```tsx
<nav aria-label="Sessions">         // SessionPanel
<main>                              // ChatArea
<aside role="complementary" aria-label="Handoff Tracker" aria-live="polite" aria-atomic="false">  // TrackerPanel
```

### motion-reduce (WCAG 2.1 SC 2.3.3)
All transitions require `motion-reduce:transition-none`:
- TrackerPanel width: `transition-[width] duration-250 motion-reduce:transition-none`
- SSE step rows: `transition-[transform,opacity] duration-300 motion-reduce:transition-none`
- Drawers/panels: all slide-in transitions include `motion-reduce:transition-none`

### Critical Width Facts
- 1280px minimum (app-wide). Hub soft-minimum: 1440px
- At 1440px: AppSidebar 240 + SessionPanel 256 + Tracker 320 = 816px fixed, Chat = **624px**
- At 1280px: Chat = **464px** — insufficient for 12-page markdown investment reports (~600px minimum)
- GitHub markdown prose: ~740px comfortable minimum

---

## Issues Fixed (9 total across 2 rounds)
1. Option C replaced (Status Rail → Resizable Panels)
2. `motion-reduce:transition-none` added to all animations
3. ARIA landmarks in all 3-column code blocks
4. NEXUS ASCII diagrams added for all 3 options
5. shadcn URL fixed: `/docs/components/sidebar` (removed `/radix/`)
6. W&B LEET clarified as terminal TUI; Grafana added as web reference
7. Option C SessionPanel corrected w-72→w-64 (replaced entirely)
8. 464px ChatArea con strengthened with markdown rendering context
9. Option B 3s auto-collapse flagged as assumption

---

## Next Step
Phase 1-2: App Layout Research (waiting for Orchestrator instruction)
