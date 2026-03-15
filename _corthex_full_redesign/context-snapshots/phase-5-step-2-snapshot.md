# Phase 5-2 Context Snapshot: App Stitch Prompt

**Date:** 2026-03-15
**Status:** COMPLETE
**Critic Score:** 8.5/10 (post-fix)

## What Was Built

`phase-5-prompts/app-stitch-prompt.md` v1.0 — 6 copy-pasteable screen prompts for Google Stitch (mobile app, 390x844px).

## Screens Covered

1. Tab Bar + Shell
2. Hub Screen (status dashboard)
3. Chat Screen (message bubbles)
4. NEXUS Screen (chrome only)
5. Jobs List Screen
6. You / Profile Screen

## Key Design Decisions

- 5-tab bottom nav: Hub / Chat / NEXUS / Jobs / You (matches Phase 2-2 winner)
- Hub is a STATUS DASHBOARD, not a terminal (Phase 2 principle)
- Secretary card with amber tint signals priority agent
- Safe areas documented for iPhone 14 Pro (top 59px, bottom 34px)
- All touch targets 44x44pt minimum
- Chat input is rounded-full pill shape (mobile convention)
- 7 hand-coded components excluded from Stitch
- Capacitor integration notes with 7 plugins documented
- Bundle budget: <150KB gzipped, TTI <3s

## Connections to Phase 6
- User pastes each screen prompt into Google Stitch at 390x844px
- Output saved to `phase-6-stitch-output/app/`
- Phase 7 wraps with Capacitor, adds safe areas, connects SSE/data
