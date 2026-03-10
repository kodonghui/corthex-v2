# Diagnosis Report: 01-command-center

**Page:** Command Center (packages/app/src/pages/command-center/)
**Domain Color:** Blue (primary command hub)
**Layout Template:** Template C — Split View
**Date:** 2026-03-10

---

## Current Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Pipeline Bar (h-16, flat, horizontal stages)          │
├──────────────────────────────────────────────────────┤
│ [Mobile Tab: Chat | Report]  (md:hidden)             │
├──────────────────┬───────────────────────────────────┤
│ Message Thread   │ Deliverable Viewer                │
│ (w-[420px])      │ (flex-1)                          │
│ - user messages  │ - header + tabs                   │
│ - agent messages │ - markdown viewer                 │
│ - empty state    │ - empty/loading state             │
├──────────────────┴───────────────────────────────────┤
│ Command Input (border-t, textarea + buttons)         │
└──────────────────────────────────────────────────────┘
```

## Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| `index.tsx` | 185 | Main page — layout, state wiring, modals |
| `pipeline-visualization.tsx` | 135 | Pipeline stage bar (Manager→Analyst→Writer→Designer) |
| `command-input.tsx` | 283 | Textarea with slash commands, @mentions, send button |
| `message-thread.tsx` | 271 | Message list with user/agent/system messages |
| `deliverable-viewer.tsx` | 145 | Right panel — overview/deliverable tabs, markdown |
| `slash-popup.tsx` | 223 | Slash command popup with search + presets |
| `mention-popup.tsx` | 135 | Agent @mention popup grouped by department |
| `sketch-preview-card.tsx` | 177 | SketchVibe ReactFlow mini-preview in messages |
| `preset-manager.tsx` | 245 | Modal — CRUD for command presets |

---

## 7-Dimension Analysis

### 1. Archetypal Coherence — 5/10
- **Good:** Split-view follows the command center archetype (thread + detail)
- **Bad:** No visual identity. Looks like a generic chat app, not a "command center" for an AI-agent platform
- **Missing:** No hero/header area, no KPI cards, no connection status pill, no real-time activity indicators
- **Gap:** The page doesn't convey authority/control — needs bold typography, gradient accents, glowing elements

### 2. Design Mastery — 4/10
- **Grid:** Basic 2-column split, no top summary row, no visual sections
- **Typography:** No `text-3xl font-black` page title. No `uppercase tracking-widest` section labels. Agent names use `text-sm font-medium` (weak)
- **Color:** Flat `bg-slate-900` everywhere. No gradient cards, no domain-colored accents (blue). Pipeline dots are plain circles
- **Whitespace:** Message thread uses `space-y-3 px-4 py-3` — adequate but not premium
- **Hierarchy:** Pipeline bar (h-16) looks like a footnote, not a primary feature. No visual weight difference between user/agent messages
- **Gestalt:** Weak grouping. Pipeline stages look like a list, not connected steps. Thread messages blend together

### 3. Accessibility — 6/10
- **Good:** `role="log"`, `aria-live="polite"` on message thread and pipeline. ARIA labels on input. `role="listbox"` on popups
- **Missing:** Focus rings not visible on all buttons. Tab key navigation for message items. Skip links. Agent avatar alt text
- **Contrast:** slate-300 on slate-900 = OK (~7:1). slate-500 on slate-900 = borderline (~4:1)
- **Touch targets:** Some buttons (slash, @, preset) at 28px — below 44px minimum

### 4. Security — 7/10
- **Good:** No `dangerouslySetInnerHTML` in thread (except MarkdownRenderer which is expected). Input length limits on preset form. No exposed tokens
- **Concern:** `decodeURIComponent(replayText)` from URL params in index.tsx — XSS vector if not sanitized (query string replay feature)
- **Note:** Preset commands are user-generated — server should validate

### 5. Performance — 6/10
- **Issue:** `@xyflow/react` loaded in message-thread for SketchPreviewCard — heavy lib in every thread render
- **Missing:** No lazy loading for SketchPreviewCard, DeliverableViewer, or PresetManager
- **Missing:** No virtualization for message list (will degrade with 100+ messages)
- **Good:** Skeleton loading exists for thread

### 6. Code Quality — 7/10
- **Good:** Clean separation of concerns. Each component has clear props interface. TypeScript throughout
- **Good:** Custom hooks (`useCommandCenter`, `usePresets`, `useCommandStore`) abstract complexity
- **Issue:** Some handlers defined inline in JSX callbacks
- **Issue:** `ROLE_COLORS` in message-thread.tsx is hardcoded — should come from shared constants
- **Reuse:** SlashPopup, MentionPopup could share a common Combobox base

### 7. User Experience — 5/10
- **CTA:** Send button is small (p-2.5) and same color as other elements. Not prominent enough
- **Navigation:** Mobile tab switching is basic — no animation, no swipe support
- **Feedback:** No toast/notification when command is submitted. Pipeline changes are subtle
- **Loading states:** Thread skeleton exists. Deliverable shows spinner. Empty states exist but are basic (plain text + SVG)
- **Error states:** System error messages exist in thread. No retry button
- **Responsive:** Mobile hides split and shows tabs — functional but not optimized for the medium

---

## Overall Score: 40/70 (5.7/10)

## Verdict: **REBUILD**

The current command center is functionally correct but visually flat and generic. It requires structural layout changes to match the CORTHEX premium dark SaaS design system.

---

## Priority Fixes for Redesign

### P0 — Layout Structure (MUST change)
1. Add **page header** with `text-3xl font-black` title + connection status pill + quick stats
2. Redesign **pipeline bar** → gradient stage cards with animated connectors and progress indication
3. Add **KPI mini-cards** above the split view (messages count, active agents, pipeline status, last activity)
4. Enhance **command input** → gradient border glow, more prominent send button

### P1 — Design System Compliance
5. Apply `bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950` page background
6. Use domain gradient cards (blue) for KPI cards
7. Apply `rounded-2xl backdrop-blur-sm` to all panels
8. Replace pipeline dots with `bg-gradient-to-br` stage cards
9. Add decorative circles to gradient cards

### P2 — UX Improvements
10. Enhanced empty state with gradient icon container + example command cards (not just text links)
11. Better message grouping with time separators
12. Deliverable viewer with gradient header + proper Subframe Tabs
13. Add loading skeletons matching new layout
14. Improve mobile responsiveness

### P3 — Component Integration
15. Use Subframe `Badge` for quality/status pills
16. Use Subframe `Tabs` for deliverable tabs
17. Use Subframe `Loader` for loading states
18. Use Subframe `Tooltip` for button tooltips
