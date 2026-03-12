# Phase 5 Step 1 — Context Snapshot

**Date:** 2026-03-12
**Status:** ✅ COMPLETE (PASS 9.3/10 avg)
**Output:** `_corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md`

---

## What was done

Wrote a comprehensive, copy-paste-ready Google Stitch prompt document for the CORTHEX web dashboard UI. Covers all major pages + master prompt + 5-theme swap guide.

## Document structure

| Section | Page | Key specs |
|---------|------|-----------|
| 0 | Master Prompt | Design system tokens, ARIA landmarks, motion-reduce rules, border-zinc-800 prohibition, Work Sans import |
| 1 | Hub Main | 4-column layout [w-60][w-64][flex-1][w-80↔w-12], TrackerPanel SSE, SessionPanel, ChatArea |
| 2 | Agent Management | AgentCard grid, StatusDot, TierBadge, Create Agent modal |
| 3 | Knowledge Library | 3-column layout, SearchBar, ChunkCard, Upload panel |
| 4 | NEXUS Org Chart | @xyflow/react placeholder, toolbar, TierBadge nodes, "즉시 적용됨" feedback |
| 5 | Admin Settings | 4-tab nav, DepartmentCard, 3-col grid, appearance-none selects |
| 6 | Landing Page | 9-section, 3-session split, bg-zinc-950, Option A Signal Dark |
| 7 | Chat/Conversation | Handoff thread, HandoffEvent card, message input, progress bar |
| 8 | Theme Swap Guide | All 5 themes with exact hex, font @import URLs, component overrides |
| 9 | Quick Reference | Token cheat sheet, spatial system, animation rules |
| 10 | Soul Editor | CodeMirror 6 placeholder, VS Code Dark+ appearance, gutter, tab strip |

## Key decisions confirmed

- **Hub layout:** `[AppSidebar w-60][SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80↔w-12]` at 1440px
- **TrackerPanel transition:** `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none`
- **Border rule:** NEVER `border-zinc-800` on `bg-zinc-900` surfaces. Use `border-zinc-700`. Exception: `border-zinc-800` OK on `bg-zinc-950`.
- **NEXUS feedback:** `"즉시 적용됨"` NOT `"저장됨"` (Vision §4.2 Principle 3)
- **No chat bubbles:** AGORA feature card uses `Lucide Scale` not `Lucide MessageSquare`
- **App pages:** desktop-only (1440px target, min-width 1024px). Landing page only = responsive.
- **Soul editor:** CodeMirror 6 required (NOT plain textarea). Stitch gets static placeholder.
- **NEXUS in Stitch:** Static SVG/HTML placeholder (not live @xyflow/react). Canvas added in code integration.
- **Motion-reduce:** All `animate-pulse`/`animate-bounce`/`transition` must include `motion-reduce:` variant (WCAG 2.3.3)
- **ARIA:** All pages need nav/main/aside landmarks. TrackerPanel: `aria-expanded`. SSE zone: `aria-live="polite"`.

## Theme fonts (correct)

| Theme | Font | Google Fonts URL |
|-------|------|-----------------|
| T1 Synaptic Cortex | Space Grotesk | `family=Space+Grotesk:wght@400;500;600;700` |
| T2 Terminal Command | JetBrains Mono | `family=JetBrains+Mono:wght@400;500;600` |
| T3 Arctic Intelligence | IBM Plex Sans | `family=IBM+Plex+Sans:wght@300;400;500;600` |
| T4 Neon Citadel | Syne | `family=Syne:wght@400;500;600;700` |
| T5 Bioluminescent Deep | Instrument Sans | `family=Instrument+Sans:wght@300;400;500;600` |

## Party log references

- `_corthex_full_redesign/party-logs/phase5-step1-critic-b.md` — Round 1 CRITIC-B feedback (7 issues)
- `_corthex_full_redesign/party-logs/phase5-step1-critic-a.md` — Round 1 CRITIC-A feedback (13 issues)
- `_corthex_full_redesign/party-logs/phase5-step1-fixes.md` — All 19 fixes applied

## Scores

| Critic | Round 1 | Round 2 |
|--------|---------|---------|
| CRITIC-B | 7.5/10 | 9.2/10 ✅ |
| CRITIC-A | (combined) | 9.4/10 ✅ |
| **Average** | | **9.3/10 ✅ PASS** |

## Next step

Phase 5 Step 2: Write mobile/app Stitch prompts (if applicable) OR proceed to Phase 6 (Stitch generation).
Per MEMORY.md: "앱: Stitch 앱용 별도 (반응형 X)" — the app has a separate prompt set.
Check with team-lead for Step 5-2 assignment.
