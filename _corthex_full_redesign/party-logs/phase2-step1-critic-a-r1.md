# Phase 2-1: Web Analysis — CRITIC-A Review (Round 1)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/web-analysis.md`
**Round**: 1 — Initial Review

---

## Overall Assessment

The document is structurally strong: it covers all 3 options with consistent depth, the React implementation spec is detailed, and the scoring criteria are relevant. However, I found **5 concrete issues** that must be fixed before this document can be approved: 2 code correctness errors, 1 brand architecture error, 1 unresolved analysis gap, and 1 scoring inconsistency.

---

## SALLY (UX Designer) — Issues Found

### Issue S1: `onErrorEvent` drops the error string — P1/P5 violation (CRITICAL)

**Location**: `stores/hub.ts` — HubStore interface vs implementation (Options A and B, both reference this store)

**Problem**: The HubStore interface declares:
```typescript
interface HubStore {
  onErrorEvent: (error: string) => void
}
```
But the implementation is:
```typescript
onErrorEvent: () => set({ sseStatus: 'error' }),
```
The `error: string` parameter is accepted but **immediately dropped**. The store has no `lastError: string | null` field. The error message is swallowed — it never reaches the UI.

**Why it matters**: Vision §5.2 (Voice) states: "Name the agent, show the chain, never hide errors — `CTO 응답 없음 → 비서실장 직접 처리 중` not `An error occurred`." If the error string isn't stored, the UI can only show a generic error state. This directly violates Principle 5 (Show the Org) and the brand voice guideline on error transparency.

**Required fix**:
1. Add `lastError: string | null` to `HubStore` interface
2. Update `onErrorEvent: (error: string) => set({ sseStatus: 'error', lastError: error })`
3. Add `resetChain: () => set({ ..., lastError: null })` (clear on reset)
4. ChatArea should display `lastError` when `sseStatus === 'error'`

---

### Issue S2: Option B auto-collapse 3s is an unresolved assumption — analysis gap

**Location**: Option B — User Flow Task 3, State Management section, Option B IA diagram

**Problem**: The document contains 5 separate instances of:
> "⚠️ ASSUMPTION: 3s delay. Requires user testing validation."

A Phase 2 **deep analysis** document must resolve, not defer, this core interaction design question. The 3s timer is cited as a risk in 3 different places (cognitive load analysis, accessibility scoring, user flow) but the document never proposes a concrete resolution.

The documented failure scenario is clear: "If user is reviewing the chain after completion, it disappears." This is a genuine P4 (Commander's View) violation. Yet the document scores Option B 8/10 on UX without resolving the mechanism.

**Required fix**: Replace the 5 "⚠️ ASSUMPTION" notes with a concrete design decision. Recommended alternative to the 3s timer:

> **Option B resolution**: TrackerPanel does NOT auto-collapse after completion. Instead: after `complete` event, display a "접기" (collapse) button in the TrackerPanel header. The panel stays expanded until the user manually collapses it, or until the next new session starts. This preserves the reveal moment, removes the time-pressure anxiety, and still allows the idle state to default to `w-12` (on page load, before any SSE activity).

If the Writer disagrees, they must provide a specific alternative — but "3s, TBD in user testing" is not acceptable for a Phase 2 specification.

---

## MARCUS (Visual Designer) — Issues Found

### Issue M1: `border-zinc-800` is invisible in dark mode — affects ALL options (CRITICAL BUG)

**Location**: React Implementation Spec — HubLayout code (Options A, B, C) + AdminLayout

**Problem**: Vision Identity §9.5 explicitly states:
> **Warning**: `border-zinc-800` = `bg-zinc-800` in dark mode — invisible. If card bg is `bg-zinc-900`, use `border-zinc-700` for visible card borders in dark mode.

The HubLayout code for **all three options** uses `border-zinc-800` on panels that have `bg-zinc-900` backgrounds:

| Component | Current (wrong) | Should be |
|-----------|----------------|-----------|
| `AppSidebar` | `border-r border-zinc-800` (bg-zinc-900) | `border-r border-zinc-700` |
| `nav[aria-label="Sessions"]` | `border-r border-zinc-800` (bg-zinc-900) | `border-r border-zinc-700` |
| `aside[role="complementary"]` | `border-l border-zinc-800` (bg-zinc-900) | `border-l border-zinc-700` |
| `AdminLayout AdminSidebar` | `border-r border-zinc-800` (bg-zinc-900) | `border-r border-zinc-700` |

Note: The NEXUS AgentConfigPanel correctly uses `border-zinc-700` — the Hub layout code should match.

**Required fix**: Replace all `border-zinc-800` → `border-zinc-700` in Hub and Admin layout Tailwind classes throughout the document. (Vision §9.5: "Invisible borders are a design failure.")

---

### Issue M2: Option A UX deduction "At 1280px Chat=464px" is imprecise

**Location**: Option A — Scoring, UX criterion justification

**The statement**: "At 1280px Chat=464px is tight for markdown tables (-1)"

**The problem**: 464px only occurs when the TrackerPanel is **fully expanded** (`w-80=320px`) AND the user is at the minimum supported viewport (1280px). In that state:
- 1280 - 240 (AppSidebar) - 256 (SessionPanel) - 320 (TrackerPanel w-80) = **464px**

But in Option A's **idle state** at 1280px (`w-12=48px`):
- 1280 - 240 - 256 - 48 = **736px** — fully adequate for markdown tables

The -1 UX deduction is valid (464px IS tight for markdown tables during active execution), but the current statement implies 464px is a constant, which it is not. Users read the final markdown report AFTER execution — when TrackerPanel could still be expanded at w-80 in Option A (since it stays expanded post-completion). This is a legitimate concern, but it should be stated precisely:

> **Required fix**: Replace the justification with: "At 1280px minimum viewport with TrackerPanel expanded (w-80 active/post-complete): Chat=464px is tight for markdown report tables. At idle (w-12): Chat=736px. Since TrackerPanel stays expanded post-completion in Option A, users reviewing the final report at min-viewport will experience 464px chat width. (-1)"

This makes the -1 deduction defensible and precise, not vague.

---

## LUNA (Brand Strategist) — Issues Found

### Issue L1: NEXUS/SketchVibe placed in 시스템 nav group — P1 feature buried (CRITICAL)

**Location**: IA Diagram — App SPA Nav Groups

**Current placement**:
```
├── Nav Group: 시스템
│   ├── 🔍 NEXUS → /nexus (SketchVibe canvas)
│   └── ⚙️ 설정 → /settings
```

**The problem**: Vision Identity §6.1 explicitly classifies SketchVibe NEXUS as **P1** — "One Click Away, High design polish, frequently used" — and calls it the product's **"Demo Moment"**:
> "Demo moment: 'type `add backend team under CTO` → watch nodes appear on canvas.'"

P1 features sit alongside AGORA, Dashboard, Library — all in the **업무** (Work) nav group. Yet SketchVibe is placed next to ⚙️ 설정 (Settings) in 시스템 — which is conventionally the lowest-priority system utilities section.

This is a brand positioning error: NEXUS/SketchVibe is CORTHEX's MCP-powered live canvas editing demo. Burying it in 시스템 communicates to users that it is a configuration tool (settings-level), not a core work tool.

**Required fix**: Move NEXUS to the **업무** nav group. Recommended placement: after AGORA (another premium differentiator), making the 업무 group:
```
├── Nav Group: 업무
│   ├── 🏠 홈
│   ├── 🔗 허브 → /hub
│   ├── 🔍 NEXUS → /nexus (SketchVibe)   ← MOVED HERE
│   ├── 🎖️ 티어 → /tiers
│   ├── 💬 AGORA → /agora
│   ├── 📈 대시보드 → /dashboard
│   └── 🗣️ ARGOS → /argos
```
Remove NEXUS from 시스템, leaving only ⚙️ 설정 there.

---

## Summary of Issues

| # | Severity | Reviewer | Issue | Required action |
|---|----------|----------|-------|----------------|
| S1 | CRITICAL | Sally | `onErrorEvent` drops error string — P1/P5 violation | Add `lastError: string\|null` to store, fix implementation |
| S2 | MAJOR | Sally | Option B 3s auto-collapse unresolved across 5 instances | Replace assumptions with concrete design decision |
| M1 | CRITICAL | Marcus | `border-zinc-800` invisible in dark mode on all Hub/Admin layouts | Replace with `border-zinc-700` throughout layout code |
| M2 | MINOR | Marcus | Option A UX -1 deduction states "464px" without viewport+state context | Add "at min-viewport with TrackerPanel expanded" qualifier |
| L1 | MAJOR | Luna | NEXUS/SketchVibe in 시스템 nav — P1 demo feature buried | Move to 업무 nav group, after Hub or AGORA |

**Blockers before approval**: S1, M1 (code correctness), L1 (brand architecture)
**Should fix before Round 2**: S2 (resolve the assumption), M2 (scoring precision)

---

## What the Document Does Well

- Design philosophy labels for Option A (Swiss International Style + Mission Control aesthetic) are accurate and well-justified
- Fitts's Law and Hick's Law analysis are specific and cite actual pixel values — this is exactly the depth required
- The hybrid recommendation (Option A base + Option B SSE-expand behavior) is well-argued and correctly identifies the key insight (ChatArea pre-allocation at 624px removes the layout shift problem)
- Option C's "disable resize handles during SSE" recommendation is a smart UX mitigation
- ARIA landmark spec is complete (nav, main, aside with aria-live and aria-atomic)
- TanStack Query vs Zustand responsibility separation is clearly defined

**Round 1 rating**: Cannot approve. Fix all CRITICAL + MAJOR issues before Round 2.

---

## Addendum: Codebase Verification (post cross-talk with CRITIC-B)

After direct verification against actual codebase:

### CRITICAL-ADD-1: Wrong ReactFlow package name — build failure

**Location**: Third-Party Dependencies table
`reactflow: 12.x (existing)` → **WRONG**
Actual: `"@xyflow/react": "^12.10.1"` (both packages/app and packages/admin package.json)
Fix: Update to `@xyflow/react: ^12.10.1`

### CRITICAL-ADD-2: Root route redirect removes existing HomePage

**Location**: React Router Structure — App SPA index route
Analysis spec: `{ index: true, element: <Navigate to="/hub" replace /> }`
Actual App.tsx line 110: `<Route index element={<Suspense fallback={<PageSkeleton />}><HomePage /></Suspense>} />`
Fix: Restore `<HomePage />` at index, or document intentional retirement with rationale.

### MAJOR-ADD-3: 9 existing active routes absent + path mismatch

Actual App.tsx routes missing from analysis spec (no explanation):
`/command-center`, `/chat`, `/reports`, `/reports/:id`, `/messenger`, `/classified`, `/org`, `/jobs`, `/onboarding`, `/departments` (App SPA), `/agents` (App SPA)

Path mismatches: `cost-analytics` (spec) vs `costs` (actual). Both `cron` + `argos` exist in actual; spec only has `argos`.

Fix: Add "Route Continuity" section: retained routes + explicitly retired routes + new routes.

### Updated Full Priority Order

| Priority | ID | Issue |
|----------|-----|-------|
| 🔴 CRITICAL | S1 | `onErrorEvent` drops error string |
| 🔴 CRITICAL | M1 | `border-zinc-800` invisible in dark mode |
| 🔴 CRITICAL | ADD-1 | Wrong package `reactflow` → `@xyflow/react` |
| 🔴 CRITICAL | ADD-2 | Root redirect kills existing HomePage |
| 🟡 MAJOR | S2 | Option B 3s auto-collapse unresolved (5× assumption) |
| 🟡 MAJOR | L1 | NEXUS in 시스템 nav (P1 feature buried) |
| 🟡 MAJOR | ADD-3 | 9 missing routes + path mismatches |
| ⚪ MINOR | M2 | Option A UX "464px" deduction imprecise |
