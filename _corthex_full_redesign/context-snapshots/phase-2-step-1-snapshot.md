# Context Snapshot — Phase 2, Step 2-1: Web Options Deep Analysis + React Implementation Spec

**Date**: 2026-03-12
**Score**: 9.2/10 (Critic-A: 9.2/10, Critic-B: Approved ✅) — PASS
**Output file**: `_corthex_full_redesign/phase-2-analysis/web-analysis.md` (~1570 lines)
**Rounds**: 3 full rounds + R4 final approval
**Issues resolved**: 22 total (Critic-A: 19, Critic-B: 14, overlap)

---

## Key Decisions & Facts Established

### Final Recommendation
**Option A (Fixed Command Center)** — 45/50
- 4-column fixed layout: `[AppSidebar w-60][SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80↔w-12]`
- TrackerPanel: SSE `handoff` event auto-expands. No auto-collapse. User collapses manually (ChevronLeft).
- Dark: `bg-zinc-950` page, `bg-zinc-900` panels, `border-zinc-700` dividers

**Option B (Adaptive Commander)** — 42/50 (close second)
- Same TrackerPanel behavior as Option A (timer REMOVED, WCAG 2.2.2)
- Overlay sidebars on 1280px, no left permanent sidebar

**Option C (Resizable Panels)** — 36/50 (Phase 4 candidate)

### CRITICAL Implementation Specs

**Border rule (§9.5):**
```
ALWAYS use border-zinc-700 on bg-zinc-900 panels
NEVER use border-zinc-800 (same visual value as bg-zinc-900 — invisible)
```

**TrackerPanel animation:**
```tsx
className={cn(
  "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col",
  "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
  isTrackerExpanded ? "w-80" : "w-12"
)}
// duration-[250ms] NOT duration-250 (Tailwind v4 arbitrary value syntax)
```

**WCAG 2.2.2 — NO auto-collapse timer:**
```
TrackerPanel stays expanded until manual toggle.
Auto-collapse 3s timer = WCAG 2.2.2 violation (Pause, Stop, Hide).
Removed from all options. autoCollapseTimerId must NOT be in Zustand store.
```

**ReactFlow package name:**
```
@xyflow/react (NOT reactflow — renamed in v12)
Confirmed: packages/app/package.json "@xyflow/react": "^12.10.1"
```

**ARIA live region — TrackerPanel:**
```tsx
// WRONG: aria-live on <aside> = announcement flood
// CORRECT: separate sr-only divs
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {lastStep && sseStatus === 'streaming'
    ? `${lastStep.agentName}이(가) 처리 중 (D${lastStep.depth})`
    : sseStatus === 'complete' ? '작업이 완료되었습니다' : ''}
</div>
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {isTrackerExpanded ? '핸드오프 트래커가 열렸습니다' : ''}
</div>
// Also: aria-expanded={isTrackerExpanded} on <aside>
```

**SSE event shape — HandoffStep.tier:**
```typescript
interface HandoffStepSSE {
  from: string; to: string; depth: number
  // NOTE: NO tier field in SSE. Derive from agentStore:
  // tier: useAgentStore.getState().agentTiers[step.to] ?? null
}
```

**HubStore — no autoCollapseTimerId:**
```typescript
interface HubStore {
  activeSessionId: string | null
  isTrackerExpanded: boolean
  sseStatus: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error'
  lastError: string | null  // onErrorEvent stores, not swallows
  handoffChain: HandoffStep[]
  // NO autoCollapseTimer (WCAG 2.2.2 + StrictMode non-serializable)
}
```

**React Router — BrowserRouter pattern (NOT createBrowserRouter):**
```tsx
// Confirmed from actual packages/app/src/App.tsx
// 29 routes total including /hub, /nexus, /costs, /agora, /argos, etc.
// Route "/" renders <HomePage /> — does NOT redirect to /hub (auto-redirect = JWT guard)
```

### Existing Components (do NOT recreate)
- `packages/app/src/components/hub/secretary-hub-layout.tsx` → redesign target
- `packages/app/src/components/hub/handoff-tracker.tsx` → migrate to right-column
- `packages/app/src/components/codemirror-editor.tsx` — existing CodeMirror 6 wrapper
- `packages/app/src/components/settings/soul-editor.tsx` — existing CodeMirror 6 wrapper
- `@xyflow/react` — already installed, 13 existing nexus components in `components/nexus/`
- `react-markdown: ^10.1.0` — already installed

### Design Token Decisions
| Token | Option A | All Options |
|-------|----------|-------------|
| Page bg | `bg-zinc-950` | `bg-zinc-950` |
| Panel bg | `bg-zinc-900` | `bg-zinc-900` |
| Borders | `border-zinc-700` | `border-zinc-700` (NEVER 800) |
| Accent | `indigo-500` | `indigo-500` |
| Active session dot | `bg-indigo-500 animate-pulse motion-reduce:animate-none` | — |
| Tracker expand | `w-80` ↔ `w-12` | — |

---

## Issues Fixed (22 total across rounds)

**Round 1 → Round 2 (19 issues):**
1. Root route `<Navigate to="/hub">` → `<HomePage />` (actual App.tsx)
2. `reactflow` → `@xyflow/react` (renamed in v12)
3. Hub existing components clarified (secretary-hub-layout.tsx etc.)
4. 29 routes complete (was ~12 routes)
5. `codemirror-editor.tsx` existing (not new install)
6. `duration-250` → `duration-[250ms]` (Tailwind v4 arbitrary)
7. AdminSidebar `border-zinc-200/border-zinc-800` → `border-zinc-700`
8. NEXUS: 3 components → 13 existing components
9. `HandoffStepSSE` interface + `agentTiers` lookup pattern
10. `aria-live` removed from TrackerPanel container → sr-only divs
11. `aria-expanded` + sr-only expand announcement added
12. WCAG 2.2.2: auto-collapse timer removed from Option B
13. `react-markdown: ^10.1.0 (existing)` labeled
14. `autoCollapseTimerId` removed from Zustand store
15. `onErrorEvent` stores error → `lastError: string | null`
16. NEXUS in `업무` nav group (not `시스템`)
17–19. Option A `border-zinc-800` → `border-zinc-700` (3 occurrences)

**Round 2 → Round 3 (3 residual issues):**
20. Options B/C `border-zinc-800` → `border-zinc-700` (6 occurrences in code)
21. IA diagram borders fixed
22. Option B Hick's Law stale auto-collapse text — 4 locations purged:
    - HubStore IA: `autoCollapseTimer` deleted
    - Cognitive Load: rewritten (2 states, no timer anxiety)
    - Fitts's Law: timer row deleted
    - Hick's Law: "Timer handles it" → "SSE auto-expands", "Is Tracker going to disappear?" ROW DELETED
    - UX 8→9 (timer anxiety deduction removed)
    - Feasibility 8→9 (timer edge case removed)
    - Option B Total: 40→42/50

---

## Final Scores
| Option | Total |
|--------|-------|
| A (Fixed Command Center) | **45/50** ← RECOMMENDED |
| B (Adaptive Commander) | **42/50** |
| C (Resizable Panels) | **36/50** |

**Recommendation**: Option A base layout + Option B SSE TrackerPanel expand behavior. Option C → Phase 4.

---

## Next Step
Phase 2-2: App Options Deep Analysis + React Native Spec (Task #7, waiting for team-lead instruction)
