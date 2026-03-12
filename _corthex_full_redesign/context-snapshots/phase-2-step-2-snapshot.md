# Context Snapshot — Phase 2, Step 2-2: App Mobile Options Deep Analysis + React Implementation Spec

**Date**: 2026-03-12
**Score**: 9.35/10 (Critic-A: 9.7/10, Critic-B: 9.0/10) — PASS
**Output file**: `_corthex_full_redesign/phase-2-analysis/app-analysis.md`
**Rounds**: 4 (R1 → R2 → R3 → R4 final approval)
**Issues resolved**: 20 total (+ 3 ADD cross-talk)

---

## Key Decisions & Facts Established

### Final Recommendation
**Option A (4-Tab Command Center)** — 45/50
- Tabs: `[🔗허브 | 📈대시보드 | 🔍NEXUS | ⋯더보기]`
- MD3-compliant tab widths: 390px ÷ 4 = 97.5px > 80dp minimum ✅
- Hybrid: Option A base layout + Option B SSE TrackerStrip auto-expand behavior

**Option B (Hub-First Drawer Navigation)** — 42/50 (upgraded from 41 after focus trap implemented)
**Option C (Adaptive 5-Tab)** — 40/50 (deferred post-MVP)

### Technology Clarification
- Google Stitch generates **React + Tailwind CSS** — NOT React Native
- Mobile app = React + Tailwind CSS PWA wrapped via Capacitor
- Package: `packages/mobile/src/` (new package, separate from `packages/app/`)

### CRITICAL TrackerStrip ARIA (Phase 2-2 — same pattern as Phase 2-1)
```tsx
// Visual container: role="region" aria-live="off" — NO implicit live region
// role="status" is FORBIDDEN on visual tracker div (implicit aria-live="polite" floods at 300ms SSE rate)
// All SR announcements from separate sr-only divs ONLY:
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {/* chain progress announcement */}
</div>
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {/* expand/collapse announcement */}
</div>
<div role="region" aria-live="off" aria-label="Agent delegation tracker">
  {/* visual tracker — h-12 compact / h-48 expanded */}
</div>
```

### API Endpoints (Verified from server source)
| Mobile Screen | Endpoint | Method |
|---------------|----------|--------|
| Hub home | `/api/workspace/chat/sessions` | GET |
| Create session | `/api/workspace/chat/sessions` | POST |
| Chat history | `/api/workspace/chat/sessions/:id/messages` | GET |
| **SSE stream** | `/api/workspace/hub/stream` | **POST** (body: `{ message, sessionId?, agentId? }`) |
| Agent list | `/api/workspace/agents` | GET |
| Dashboard KPI | `/api/workspace/dashboard/summary` | GET |
| Dashboard costs | `/api/workspace/dashboard/costs` | GET |
| NEXUS tree | `/api/workspace/nexus/org-data` | GET |
| Notifications | `/api/workspace/notifications` | GET |
| Notification count | `/api/workspace/notifications/count` | GET |
| Mark read | `/api/workspace/notifications/:id/read` | PATCH |

**Critical**: SSE is `POST /api/workspace/hub/stream` — NOT a GET on sessions URL.

### Component Package Structure
```
packages/mobile/src/
├── App.tsx (Capacitor root, BrowserRouter)
├── screens/
│   ├── HubScreen.tsx
│   ├── ChatScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── NexusScreen.tsx (read-only SVG — NOT @xyflow/react)
│   ├── MoreScreen.tsx (Option A)
│   └── [NotificationsScreen, LibraryScreen, ArgosScreen...]
├── components/
│   ├── BottomTabBar.tsx (4-tab — Option A)
│   ├── BottomTabBar5.tsx (5-tab — Option C)
│   ├── TrackerStrip.tsx (shared — all options)
│   ├── DrawerNav.tsx (Option B)
│   ├── DrawerSection.tsx (Option B — h-12 headers)
│   ├── InputBar.tsx (Option B permanent)
│   └── HubMoreMenu.tsx (Option C dropdown)
└── stores/
    ├── mobile-hub-store.ts
    └── mobile-agent-store.ts  ← required for agentTiers lookup
```

### Key Implementation Specs

**navigate declarations (all components that route):**
```tsx
const navigate = useNavigate()  // import { useNavigate } from 'react-router-dom'
// Required in: BottomTabBar, BottomTabBar5, HubMoreMenu
```

**Badge ARIA pattern:**
```tsx
<button aria-label={tab.badge ? `${tab.label} 알림 ${tab.badge}개` : tab.label}>
  <span aria-hidden="true" className="...badge styles...">
    {tab.badge}
  </span>
</button>
// EXCEPTION: notifications tab label "알림" → use just `알림 ${n}개` (not `${tab.label} 알림 ${n}개`)
```

**DrawerNav — always-mounted (prevents exit animation loss):**
```tsx
// NEVER: {isOpen && <div>} — unmounts DOM, kills CSS close animation
// CORRECT: always mounted, toggle visibility
<div
  className={cn(
    "fixed inset-0 z-50 transition-opacity duration-[250ms] motion-reduce:transition-none",
    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  )}
  role="dialog" aria-modal="true" aria-hidden={!isOpen}
>
```

**Option B dynamic content padding (TrackerStrip-aware):**
```tsx
<main
  className="flex-1 overflow-y-auto bg-zinc-950 transition-[padding-bottom] duration-[250ms] motion-reduce:transition-none"
  style={{
    paddingBottom: `calc(${
      hasActiveHandoff ? (isTrackerExpanded ? 192 : 48) : 0
    }px + 56px + env(safe-area-inset-bottom))`
  }}
>
// 192px = TrackerStrip expanded (h-48), 48px = compact (h-12), 56px = InputBar (h-14)
```

**Safe area (Tailwind v4):**
```tsx
pb-[env(safe-area-inset-bottom)]  // works WITHOUT @theme
// @theme { --spacing-safe: env(safe-area-inset-bottom) } = OPTIONAL for pb-safe shorthand only
```

**Duration distinction:**
```
duration-[150ms]: color/opacity micro-interactions (tab active state, badge flash)
duration-[250ms]: layout/height transitions (TrackerStrip h-12↔h-48, DrawerNav slide, padding-bottom)
```

**NEXUS on mobile:** SVG simplified tree — NOT `@xyflow/react` (too heavy, Stitch cannot generate)

**WCAG 2.2.2:** No auto-collapse timer. TrackerStrip stays expanded after SSE complete. `autoCollapseTimer` must NOT be in Zustand store.

### Stitch Feasibility
- Option A: 6 sessions, 5/6 high-confidence
- Option B: 5 sessions, 5/6 high-confidence
- Option C: 6 sessions, 5/6 high-confidence (5-tab bar needs 430px for MD3 compliance)
- NEXUS SVG tree: all options require manual code work (Stitch cannot generate)

---

## Issues Fixed (20 total + 3 ADD)

**Round 1 → Round 2 (15 issues):**
1. S1: BottomTabBar badge aria-label on button (not span)
2. S2: TrackerStrip visual div: role="status" → role="region" aria-live="off"
3. M1: h-18 → h-[72px] (all 3 instances)
4. M2: duration-[150ms] vs duration-[250ms] distinction documented
5. ADD-Addendum 2: DrawerNav focus trap (useRef + useEffect + Escape)
6. ADD-Addendum 3: @theme "required" → "Optional" (5 locations)
7. ADD-Addendum 5: DrawerNav animation — always-mounted
8. ADD-Addendum 6: mobile-agent-store.ts added
9. ADD-Addendum 7: HubMoreMenu navigate declared
10. S3: BottomTabBar5 navigate declared
11. L1: Badge "알림 알림 N개" → "알림 N개" for notifications tab
12. L2: useAgentStore import in mobile-hub-store.ts
13. M5: DrawerSection.tsx component with h-12 added
14. Option B Accessibility 8→9, total 41→42
15. Section 5.5 + CRITICAL INVARIANT: role="region" aria-live="off"

**Round 2 → Round 3 (5 issues + 3 ADD):**
16. L2-badge: BottomTabBar5 badge span aria-hidden="true"
17. M5 UX score: deduction removed → "h-12 ✅ corrected"
18. ADD-1: §1.6 API table — all 11 paths corrected (/api/workspace/ prefix, SSE POST)
19. ADD-2: Option B pb-[calc()] → dynamic inline style tracking TrackerStrip state
20. ADD-3: Stitch session prompts added for Options B (§3.8) and C (§4.8)

**Round 3 → Round 4 (JSX compile error):**
21. JSX comment `{/* */}` between props → moved to after `>` (valid child position)

---

## Final Scores
| Option | Total |
|--------|-------|
| A (4-Tab Command Center) | **45/50** ← RECOMMENDED |
| B (Hub-First Drawer) | **42/50** |
| C (Adaptive 5-Tab) | **40/50** |

---

## Next Step
Phase 2-3: Landing Options Deep Analysis + HTML/React Spec (Task #8, waiting for team-lead instruction)
