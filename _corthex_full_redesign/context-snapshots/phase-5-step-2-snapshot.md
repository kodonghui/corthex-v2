# Phase 5 Step 2 — Context Snapshot

**Date:** 2026-03-12
**Status:** ✅ COMPLETE (PASS 9.7/10 avg)
**Output:** `_corthex_full_redesign/phase-5-prompts/stitch-prompt-app.md`

---

## What was done

Wrote a comprehensive, copy-paste-ready Google Stitch prompt document for the CORTHEX mobile app (React + Tailwind CSS, Capacitor wrapper). Covers all 6 primary screens + shared components + 5 themes.

## Document structure

| Section | Screen | Key specs |
|---------|--------|-----------|
| 0 | Master Mobile Design System | Dark tokens, touch targets, safe area, TrackerStrip ARIA invariants, SSE endpoint, motion-reduce rules |
| 1 | Hub Home | Session list, ACTIVE/오늘/이번 주 groups, pull-to-refresh, BottomTabBar |
| 2 | Chat (compact tracker) | Message bubbles (L/R), "명령 접수됨" badge, h-12 compact TrackerStrip, input bar |
| 3 | Chat (expanded tracker) | h-48 chain list with Check/pulse icons, cost summary, sr-only ARIA divs |
| 4 | Dashboard | 2×2 KPI grid, cost progress bar (amber 78%), agent health list, recent activity |
| 5 | NEXUS (SVG tree) | Static SVG layout (NOT @xyflow/react), corrected x coords 5/135/265, zoom controls, node bottom sheet, sr-only fallback |
| 6 | More + Notifications | 2-col feature grid (8 items), notification list with badges, filter chips |
| 7 | Shared Components | BottomTabBar (4 states) + TrackerStrip (4 states: idle/compact/expanded/complete) |
| 8 | Mobile Theme Swap Guide | All 5 themes with hex, font @import URLs, component overrides |
| 9 | Quick Reference | Heights, colors, ARIA rules, critical don'ts |

## Key mobile-specific decisions confirmed

- **Technology:** React + Tailwind CSS (NOT React Native) — Capacitor wrapper
- **Layout:** 4-tab bottom bar: 🔗허브 | 📈대시보드 | 🔍NEXUS | ⋯더보기
- **TrackerStrip:** h-12 compact ↔ h-48 expanded, `transition-[height] duration-[250ms] ease-in-out motion-reduce:transition-none`
- **TrackerStrip ARIA:** `role="region" aria-live="off"` on visual div. NEVER `role="status"`. All SR announcements from separate `sr-only` divs only.
- **Chat log ARIA:** `role="log" aria-live="off"` — overrides polite default to prevent SSE flood
- **SSE endpoint:** `POST /api/workspace/hub/stream` (body: `{message, sessionId?, agentId?}`)
- **No auto-collapse:** TrackerStrip stays expanded after completion (WCAG 2.2.2)
- **NEXUS SVG:** Static tree, NOT @xyflow/react. Node coords Level 2: x=5/135/265, right edges 125/255/385, all 10px gaps within 390px viewport
- **Safe area:** `pb-[env(safe-area-inset-bottom)]` on nav + InputBar + BottomSheet only
- **Duration:** `duration-[150ms]` color/opacity, `duration-[250ms]` layout/height (Tailwind v4 arbitrary syntax required)
- **Touch targets:** All ≥44px. Tab items ~97px wide. Zoom controls w-11 h-11 (44px).
- **Chat header:** h-12 (48px) exception — maximizes message area; still meets 44px button targets
- **Borders:** `border-zinc-700/30` for subtle session row dividers on zinc-950. `divide-zinc-700/40` for card row dividers on zinc-900.
- **AGORA icon:** Lucide Scale (no chat bubbles — Vision rule)

## Round 1 fixes applied (11 total)
See: `_corthex_full_redesign/party-logs/phase5-step2-fixes.md`

## Scores

| Critic | Round 1 | Round 2 |
|--------|---------|---------|
| Critic-A | 8.9/10 | 9.5/10 ✅ |
| Critic-B | 9.1/10 | 9.9/10 ✅ |
| **Average** | **9.0/10 ✅** | **9.7/10 ✅ PASS** |

## Party log references
- `_corthex_full_redesign/party-logs/phase5-step2-critic-b.md` — Round 1 Critic-B (5 issues)
- `_corthex_full_redesign/party-logs/phase5-step2-critic-a.md` — Round 1 Critic-A (8 issues)
- `_corthex_full_redesign/party-logs/phase5-step2-fixes.md` — 11 fixes applied

## Phase 5 completion status

| Step | Output | Score |
|------|--------|-------|
| 5-1 Web Prompts | `stitch-prompt-web.md` | 9.3/10 ✅ |
| 5-2 App Prompts | `stitch-prompt-app.md` | 9.7/10 ✅ |

## Next step
Phase 5 complete if Step 5-2 was the last step. Check with team-lead for Phase 6 (Stitch generation sessions).
