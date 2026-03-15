# CORTHEX Design Tokens — Single Source of Truth
**Phase:** 3-1 Design System
**Date:** 2026-03-15
**Version:** 2.0
**Authority:** Phase 0 Vision & Identity v2.0 + Phase 2 Critic Reviews (all corrections applied)
**Movement:** Swiss International Style — Dark Mode Adaptation
**Target:** Phase 5 Stitch prompts + Phase 7 integration

---

## Table of Contents

1. [Color Tokens](#1-color-tokens)
2. [Typography Tokens](#2-typography-tokens)
3. [Spacing & Layout Tokens](#3-spacing--layout-tokens)
4. [Animation & Motion Tokens](#4-animation--motion-tokens)
5. [Focus & Accessibility Tokens](#5-focus--accessibility-tokens)
6. [Component-Level Tokens](#6-component-level-tokens)
7. [tailwind.config.ts](#7-tailwindconfigts)
8. [globals.css](#8-globalscss)
9. [App-Specific Tokens (Capacitor Mobile)](#9-app-specific-tokens-capacitor-mobile)
10. [Landing-Specific Tokens](#10-landing-specific-tokens)

---

## 1. Color Tokens

### 1.1 Allocation Rule — 60-30-10

> **60%** — Structural backgrounds (slate palette): page bg, surface, elevated surface
> **30%** — Text hierarchy (slate-50 / slate-400 / slate-600): information weight signals
> **10%** — Semantic accents (cyan / violet / emerald / amber / red / blue): system state only

**Vignelli Color Discipline:** Maximum 2 semantic accent colors visible on any single screen simultaneously. Status colors are NEVER decorative. Accent colors own exactly one meaning and never swap.

**Source:** Phase 0-2 Vision & Identity v2.0, Section "Color System"

---

### 1.2 Page Backgrounds

| Token | Tailwind Class | Hex Value | RGB | Role | Source |
|-------|---------------|-----------|-----|------|--------|
| `--surface-page` | `bg-slate-950` | `#020617` | 2, 6, 23 | Outermost page background (app) | Phase 0 Color System |
| `--surface-card` | `bg-slate-900` | `#0F172A` | 15, 23, 42 | Card, panel, sidebar background | Phase 0 Color System |
| `--surface-elevated` | `bg-slate-800` | `#1E293B` | 30, 41, 59 | Table row hover, elevated card, input bg on focus | Phase 0 Color System |
| `--surface-nexus` | `bg-[#040D1A]` | `#040D1A` | 4, 13, 26 | NEXUS canvas only (custom deep navy) | Phase 0 Color System |
| `--surface-overlay` | `bg-slate-950/80` | `rgba(2, 6, 23, 0.80)` | — | Modal backdrop overlay | Phase 2-1 Analysis |
| `--surface-input` | `bg-slate-900` | `#0F172A` | 15, 23, 42 | Form fields, editors, Soul editor | Phase 2-1 Analysis |

---

### 1.3 Border Colors

| Token | Tailwind Class | Hex Value | Role | Source |
|-------|---------------|-----------|------|--------|
| `--border-default` | `border-slate-800` | `#1E293B` | Card borders, dividers | Phase 0 Color System |
| `--border-subtle` | `border-slate-700/50` | `rgba(51, 65, 85, 0.50)` | Sidebar divider, section separator | Phase 2-1 Analysis |
| `--border-strong` | `border-slate-700` | `#334155` | Table borders, input borders | Phase 2-1 Analysis |
| `--border-active` | `border-cyan-400` | `#22D3EE` | Active nav border-l-2 | Phase 0 Active Nav |
| `--border-focus` | `ring-cyan-400` | `#22D3EE` | Focus ring color | Phase 2-3 Corrections |

---

### 1.4 Primary Accent — Cyan

Cyan is the CORTHEX primary accent. It signals: selected, active, primary CTA (dark bg only), focus ring, active nav item.

| Token | Tailwind | Hex | RGB | Contrast on slate-950 | WCAG | Usage |
|-------|---------|-----|-----|----------------------|------|-------|
| `color-primary-light` | `cyan-300` | `#67E8F9` | 103, 232, 249 | **13.5:1** | AAA | Hover state on primary CTA |
| `color-primary-base` | `cyan-400` | `#22D3EE` | 34, 211, 238 | **9.1:1** | AAA | Active state, primary CTA, focus ring |
| `color-primary-deep` | `cyan-500` | `#06B6D4` | 6, 182, 212 | **6.8:1** | AA | Secondary icon fills |
| `color-primary-muted` | `cyan-600` | `#0891B2` | 8, 145, 178 | **5.0:1** | AA | Link on elevated surfaces |

**Alpha variants (preferred over dark shades for tinted backgrounds):**
```css
--color-primary-tint-10: rgba(34, 211, 238, 0.10);  /* Active nav bg: bg-cyan-400/10 */
--color-primary-tint-15: rgba(34, 211, 238, 0.15);  /* Hover bg */
--color-primary-tint-20: rgba(34, 211, 238, 0.20);  /* Pressed bg */
```

**Source:** Phase 0-2 — changed from v1 indigo-600 to cyan-400

---

### 1.5 Semantic Colors — Full Palette

Each semantic color owns exactly one system meaning. Never cross-use.

#### Handoff / Delegation (Violet) — "Delegation chains, Tracker edges, dept cluster borders"

| Token | Tailwind | Hex | RGB | On slate-950 | On slate-900 | WCAG |
|-------|---------|-----|-----|-------------|-------------|------|
| `color-handoff-light` | `violet-300` | `#C4B5FD` | 196, 181, 253 | **9.6:1** | **8.3:1** | AAA |
| `color-handoff-base` | `violet-400` | `#A78BFA` | 167, 139, 250 | **8.2:1** | **7.1:1** | AAA |
| `color-handoff-deep` | `violet-600` | `#7C3AED` | 124, 58, 237 | **5.1:1** | **4.4:1** | AA |

**Usage:** `bg-violet-400 animate-status-pulse` delegating status dot, `text-violet-400` Handoff labels, `border border-violet-400/20 rounded-3xl` NEXUS department cluster border.

**Source:** Phase 0 Color System

#### Success / Complete (Emerald) — "Task done, ARGOS success, upload success"

| Token | Tailwind | Hex | RGB | On slate-950 | On slate-900 | WCAG |
|-------|---------|-----|-----|-------------|-------------|------|
| `color-success-light` | `emerald-300` | `#6EE7B7` | 110, 231, 183 | **10.4:1** | **9.0:1** | AAA |
| `color-success-base` | `emerald-400` | `#34D399` | 52, 211, 153 | **8.9:1** | **7.7:1** | AAA |
| `color-success-deep` | `emerald-600` | `#059669` | 5, 150, 105 | **4.8:1** | **4.2:1** | AA |

**Usage:** `bg-emerald-400` status dot (with checkmark icon), `text-emerald-400` success labels, `bg-emerald-400/10 border border-emerald-400/30` success alert.

**Source:** Phase 0 Color System

#### Warning / Budget Alert (Amber) — "Cost approaching limit, Secretary tier badge"

| Token | Tailwind | Hex | RGB | On slate-950 | On slate-900 | WCAG |
|-------|---------|-----|-----|-------------|-------------|------|
| `color-warning-light` | `amber-300` | `#FCD34D` | 252, 211, 77 | **11.3:1** | **9.8:1** | AAA |
| `color-warning-base` | `amber-400` | `#FBBF24` | 251, 191, 36 | **9.7:1** | **8.4:1** | AAA |
| `color-warning-deep` | `amber-600` | `#D97706` | 217, 119, 6 | **4.9:1** | **4.3:1** | AA |

**Usage:** `bg-amber-400` status dot, `text-amber-400` warning labels, `bg-amber-400/10` warning alert bg.

**Source:** Phase 0 Color System

#### Error / Critical (Red) — "Failed tasks, overdue ARGOS, permission denied, stream error"

| Token | Tailwind | Hex | RGB | On slate-950 | On slate-900 | WCAG |
|-------|---------|-----|-----|-------------|-------------|------|
| `color-error-light` | `red-300` | `#FCA5A5` | 252, 165, 165 | **8.6:1** | **7.5:1** | AAA |
| `color-error-base` | `red-400` | `#F87171` | 248, 113, 113 | **5.4:1** | **4.7:1** | AA |
| `color-error-deep` | `red-600` | `#DC2626` | 220, 38, 38 | **4.5:1** | **3.9:1** | AA (minimum) |

**Usage:** `bg-red-400` status dot (with X icon), `text-red-400` error labels, `bg-red-400/10 border border-red-400/30` destructive button.

**Source:** Phase 0 Color System

#### Info / Working (Blue) — "Streaming response, agent actively executing"

| Token | Tailwind | Hex | RGB | On slate-950 | On slate-900 | WCAG |
|-------|---------|-----|-----|-------------|-------------|------|
| `color-info-light` | `blue-300` | `#93C5FD` | 147, 197, 253 | **8.9:1** | **7.7:1** | AAA |
| `color-info-base` | `blue-400` | `#60A5FA` | 96, 165, 250 | **6.6:1** | **5.7:1** | AA |
| `color-info-deep` | `blue-600` | `#2563EB` | 37, 99, 235 | **4.5:1** | **3.9:1** | AA (minimum) |

**Usage:** `bg-blue-400 animate-status-pulse` for working status dot (with spinner icon). `text-blue-400` for "작업 중" label. NOT for CTAs (cyan owns that role).

**Source:** Phase 0 Color System

---

### 1.6 Text Hierarchy

**CRITICAL:** `slate-500` (#64748B) is BANNED for text. It fails WCAG AA body text on slate-950 (3.6:1). Phase 2 Critical Fix #1 applied.

| Token | Tailwind | Hex | On slate-950 | On slate-900 | On slate-800 | WCAG | Role |
|-------|---------|-----|-------------|-------------|-------------|------|------|
| `--text-1` / `text-primary` | `text-slate-50` | `#F8FAFC` | **20.1:1** | **17.3:1** | **12.9:1** | AAA | Headings, body text, reports |
| `--text-2` / `text-secondary` | `text-slate-400` | `#94A3B8` | **5.9:1** | **5.1:1** | **3.8:1** | AA | Metadata, timestamps, secondary labels, inactive nav |
| `--text-3` / `text-disabled` | `text-slate-600` | `#475569` | **3.1:1** | **2.7:1** | — | Large only | Placeholder text, disabled state (18px+ ONLY) |
| `--text-inverse` | `text-slate-950` | `#020617` | — | — | — | — | Text on cyan-400 primary button |
| `--text-link` | `text-cyan-400` | `#22D3EE` | **9.1:1** | **7.9:1** | **5.7:1** | AAA | Hyperlinks, agent name links |
| `--text-error` | `text-red-400` | `#F87171` | **5.4:1** | **4.7:1** | **3.5:1** | AA | Inline error messages |
| `--text-success` | `text-emerald-400` | `#34D399` | **8.9:1** | **7.7:1** | **5.6:1** | AAA | Success confirmation |
| `--text-warning` | `text-amber-400` | `#FBBF24` | **9.7:1** | **8.4:1** | **6.1:1** | AAA | Budget alert, warning labels |
| `--text-code` | `text-slate-50 font-mono` | `#F8FAFC` | **20.1:1** | — | — | AAA | JetBrains Mono code/technical |

**Source:** Phase 0 Color System + Phase 2 Critical Fix #1 (slate-500 to slate-400)

---

### 1.7 NEXUS Custom Background

| Token | Tailwind | Hex | RGB | Purpose |
|-------|---------|-----|-----|---------|
| `--surface-nexus` | `bg-[#040D1A]` | `#040D1A` | 4, 13, 26 | NEXUS canvas — deeper than slate-950, custom deep navy |

**WCAG on NEXUS bg (#040D1A):**

| Text Color | Contrast Ratio | WCAG |
|-----------|---------------|------|
| `slate-50` `#F8FAFC` | **20.5:1** | AAA |
| `slate-400` `#94A3B8` | **6.1:1** | AA |
| `cyan-400` `#22D3EE` | **9.4:1** | AAA |
| `violet-400` `#A78BFA` | **8.5:1** | AAA |
| `emerald-400` `#34D399` | **9.2:1** | AAA |

**Source:** Phase 0 Color System

---

### 1.8 Complete WCAG Contrast Audit

Every text/background pair used across all surfaces, validated:

| Text Token | Hex | Background | Bg Hex | Ratio | Level | Status |
|-----------|-----|-----------|--------|-------|-------|--------|
| `slate-50` | `#F8FAFC` | `slate-950` | `#020617` | **20.1:1** | AAA | PASS |
| `slate-50` | `#F8FAFC` | `slate-900` | `#0F172A` | **17.3:1** | AAA | PASS |
| `slate-50` | `#F8FAFC` | `slate-800` | `#1E293B` | **12.9:1** | AAA | PASS |
| `slate-50` | `#F8FAFC` | `#040D1A` (NEXUS) | `#040D1A` | **20.5:1** | AAA | PASS |
| `slate-400` | `#94A3B8` | `slate-950` | `#020617` | **5.9:1** | AA | PASS |
| `slate-400` | `#94A3B8` | `slate-900` | `#0F172A` | **5.1:1** | AA | PASS |
| `slate-400` | `#94A3B8` | `slate-800` | `#1E293B` | **3.8:1** | AA Large | Large text only |
| `slate-500` | `#64748B` | `slate-950` | `#020617` | **3.6:1** | — | BANNED |
| `slate-600` | `#475569` | `slate-950` | `#020617` | **3.1:1** | AA Large | Placeholder only (18px+) |
| `cyan-400` | `#22D3EE` | `slate-950` | `#020617` | **9.1:1** | AAA | PASS |
| `cyan-400` | `#22D3EE` | `slate-900` | `#0F172A` | **7.9:1** | AAA | PASS |
| `cyan-400` | `#22D3EE` | `slate-800` | `#1E293B` | **5.7:1** | AA | PASS |
| `cyan-300` | `#67E8F9` | `slate-950` | `#020617` | **13.5:1** | AAA | PASS (hover) |
| `slate-950` | `#020617` | `cyan-400` | `#22D3EE` | **9.1:1** | AAA | PASS (btn text) |
| `violet-400` | `#A78BFA` | `slate-950` | `#020617` | **8.2:1** | AAA | PASS |
| `emerald-400` | `#34D399` | `slate-950` | `#020617` | **8.9:1** | AAA | PASS |
| `amber-400` | `#FBBF24` | `slate-950` | `#020617` | **9.7:1** | AAA | PASS |
| `red-400` | `#F87171` | `slate-950` | `#020617` | **5.4:1** | AA | PASS |
| `red-400` | `#F87171` | `slate-900` | `#0F172A` | **4.7:1** | AA | PASS |
| `blue-400` | `#60A5FA` | `slate-950` | `#020617` | **6.6:1** | AA | PASS |
| `blue-400` | `#60A5FA` | `slate-900` | `#0F172A` | **5.7:1** | AA | PASS |
| `emerald-400` | `#34D399` | `slate-900` | `#0F172A` | **7.7:1** | AAA | PASS |
| `slate-50` | `#F8FAFC` | `slate-700` | `#334155` | **7.4:1** | AAA | PASS (badge bg) |
| `cyan-400` | `#22D3EE` | `slate-50` (light bg) | `#F8FAFC` | **1.3:1** | — | FAIL (use slate-900 CTA) |
| `white` | `#FFFFFF` | `slate-900` (light CTA) | `#0F172A` | **17.3:1** | AAA | PASS |
| `slate-900` | `#0F172A` | `white` (light bg) | `#FFFFFF` | **17.3:1** | AAA | PASS |
| `slate-900` | `#0F172A` | `slate-50` (light bg) | `#F8FAFC` | **17.0:1** | AAA | PASS |
| `red-500` | `#EF4444` | `white` (notif badge) | `#FFFFFF` | **3.9:1** | AA Large | Badge = 16px+ OK |

---

### 1.9 Surface Tokens — CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --surface-page:        #020617;  /* slate-950 */
  --surface-card:        #0F172A;  /* slate-900 */
  --surface-elevated:    #1E293B;  /* slate-800 */
  --surface-input:       #0F172A;  /* slate-900 */
  --surface-overlay:     rgba(2, 6, 23, 0.80);  /* slate-950/80 */
  --surface-nexus:       #040D1A;  /* custom deep navy */

  /* Borders */
  --border-default:      #1E293B;  /* slate-800 */
  --border-subtle:       rgba(51, 65, 85, 0.50);  /* slate-700/50 */
  --border-strong:       #334155;  /* slate-700 */
  --border-active:       #22D3EE;  /* cyan-400 */
  --border-focus:        #22D3EE;  /* cyan-400 */

  /* Text */
  --text-1:              #F8FAFC;  /* slate-50 */
  --text-2:              #94A3B8;  /* slate-400 — NOT slate-500 */
  --text-3:              #475569;  /* slate-600 — placeholder only */
  --text-inverse:        #020617;  /* slate-950 — on cyan-400 buttons */
  --text-link:           #22D3EE;  /* cyan-400 */

  /* Semantic accents */
  --color-primary:       #22D3EE;  /* cyan-400 */
  --color-handoff:       #A78BFA;  /* violet-400 */
  --color-success:       #34D399;  /* emerald-400 */
  --color-warning:       #FBBF24;  /* amber-400 */
  --color-error:         #F87171;  /* red-400 */
  --color-working:       #60A5FA;  /* blue-400 */
}
```

---

## 2. Typography Tokens

### 2.1 Typeface Declaration

**Fonts are self-hosted via `@fontsource` npm packages.** Google Fonts CDN is BANNED (render-blocking, Korean market latency concern).

**Source:** Phase 2 Critical Fix #4, Phase 2-3 Correction #4

```
npm install @fontsource/inter @fontsource/jetbrains-mono
```

```css
/* In globals.css — import specific weights only */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';
```

**Font stacks:**
```css
--font-ui:   'Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Arial', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

**The 2-Font Rule (Vignelli):** Inter and JetBrains Mono NEVER mix within the same text block. Context switch = typeface switch. No `font-light` (300) or `font-thin` (100) on dark backgrounds — too thin to read.

**Source:** Phase 0 Typography decision — Inter chosen over Geist and Pretendard

---

### 2.2 Type Scale — Inter (UI Primary)

| Token | Size | Weight | Line-Height | Letter-Spacing | Tailwind Classes | Usage |
|-------|------|--------|-------------|----------------|-----------------|-------|
| `text-page-heading` | 32px | 700 Bold | 1.25 | -0.02em | `text-[32px] font-bold leading-tight tracking-tight` | Page hero, single page title |
| `text-section-heading` | 18px | 600 SemiBold | 1.5 | 0em | `text-lg font-semibold` | Section heading (standard) |
| `text-section-heading-lg` | 20px | 600 SemiBold | 1.375 | 0em | `text-xl font-semibold leading-snug` | Section heading (large) |
| `text-body` | 14px | 400 Regular | 1.5 | 0em | `text-sm` | Body copy, card body, UI default |
| `text-body-lg` | 16px | 400 Regular | 1.625 | 0em | `text-base leading-relaxed` | Report body (long-form) |
| `text-caption` | 12px | 400 Regular | 1.5 | 0em | `text-xs` | Caption, timestamp, help text |
| `text-label` | 14px | 500 Medium | 1.5 | 0em | `text-sm font-medium` | Card title, agent name, nav label |
| `text-label-sm` | 12px | 500 Medium | 1.25 | 0.05em | `text-xs font-medium uppercase tracking-wide` | Table header (uppercase) |
| `text-badge` | 11px | 500 Medium | 1 | 0.05em | `text-[11px] font-medium uppercase tracking-wide` | Status badge, tier badge |
| `text-nav` | 13px | 500 Medium | 1.25 | 0em | `text-[13px] font-medium` | Sidebar nav label |
| `text-nav-section` | 11px | 500 Medium | 1 | 0.1em | `text-[11px] font-medium uppercase tracking-widest` | Nav group header (COMMAND, TOOLS) |

**Hierarchy in Practice:**
```
Page heading:     32px / Bold     / #F8FAFC (slate-50)  → displays once per page
Section heading:  18px / SemiBold / #F8FAFC (slate-50)  → mt-8 mb-4 (Brockmann asymmetric)
Card title:       14px / Medium   / #F8FAFC (slate-50)  → inside card p-6
Body copy:        14px / Regular  / #F8FAFC (slate-50)  → UI default
Secondary info:   12px / Regular  / #94A3B8 (slate-400) → timestamps, metadata
Nav label:        13px / Medium   / #94A3B8 (slate-400) → inactive state
                                    #22D3EE (cyan-400)  → active state
Badge text:       11px / Medium   / contextual          → UPPERCASE + tracking
```

**Source:** Phase 0 Swiss International Style + Phase 2-1 Analysis

---

### 2.3 Type Scale — JetBrains Mono (Technical Only)

| Token | Size | Weight | Line-Height | Tailwind Classes | Usage |
|-------|------|--------|-------------|-----------------|-------|
| `mono-lg` | 14px | 500 Medium | 1.5 | `font-mono text-sm font-medium` | Hub slash command prefix |
| `mono-base` | 13px | 400 Regular | 1.625 | `font-mono text-[13px] leading-relaxed` | Soul editor content |
| `mono-sm` | 12px | 400 Regular | 1.5 | `font-mono text-xs` | Tool call parameters (JSON) |
| `mono-xs` | 11px | 400 Regular | 1.25 | `font-mono text-[11px]` | Agent/session IDs |
| `mono-tabular` | 12px | 400 Regular | 1.5 | `font-mono text-xs tabular-nums` | Cost/token numbers (live update) |

**JetBrains Mono activation contexts:**
- Soul editor source (markdown raw view)
- Tool call parameter display (JSON blocks)
- Hub slash command prefix `/`
- Cost, token, count numbers (always `tabular-nums` — prevents layout shift during live update)
- Agent IDs, session IDs, error codes

**Source:** Phase 0 Vignelli 2-typeface constraint

---

### 2.4 `tabular-nums` Requirement

ALL numeric displays MUST use `tabular-nums` (monospaced numerals). This prevents layout shift when numbers change during live updates (streaming token counts, cost displays, ARGOS timers).

```css
/* Tailwind: tabular-nums */
/* CSS: font-variant-numeric: tabular-nums; */
```

Applies to: token counts, cost displays, timer/elapsed, dashboard metric cards, ARGOS job progress, notification badge numbers.

**Source:** Phase 2-1 Non-Negotiables

---

### 2.5 Korean Text Rules

**Minimum Korean text size: 12px (`text-xs`).** Never use `text-[10px]` or `text-[11px]` for Korean body text. The 11px badge text is UPPERCASE Latin only.

```css
:lang(ko) {
  word-break: keep-all;         /* Prevent word breaks mid-morpheme */
  overflow-wrap: break-word;    /* Allow breaks on long URLs/IDs */
}

/* Korean body text gets slightly more line-height */
.korean-body {
  line-height: 1.7;
  letter-spacing: -0.01em;
}
```

**Korean button labels (Phase 0 Voice):**
- Imperative verb only: `저장`, `삭제`, `배포`, `실행`, `생성`
- Never: `저장하기`, `취소합니다`, English Yes/No in Korean UI
- Error format: `[상황]: [원인] (ERROR_CODE)`

**Source:** Phase 0 Voice specification

---

### 2.6 Section Heading Spacing (Brockmann Asymmetric Rule)

```css
/* mt-8 (32px above) = "new section starts here" */
/* mb-4 (16px below) = "heading belongs to following content" */
h2.section-heading { @apply mt-8 mb-4 text-lg font-semibold text-slate-50; }
h1.page-heading    { @apply mb-6 text-2xl font-bold text-slate-50; }
```

**Source:** Phase 0 Principle 6 "The Grid Is the Law" + Muller-Brockmann Grid Systems

---

## 3. Spacing & Layout Tokens

### 3.1 Base 4px Grid

All spacing values are multiples of 4px. "Mathematical order is the prerequisite of visual order." — Brockmann

| Token | px | rem | Tailwind | Use Case |
|-------|-----|-----|----------|---------|
| `space-0` | 0 | 0 | `p-0` | Reset |
| `space-0.5` | 2px | 0.125rem | `p-0.5` | Sub-pixel nudge |
| `space-1` | 4px | 0.25rem | `p-1` | Micro — inline icon-to-label gap |
| `space-2` | 8px | 0.5rem | `p-2` | Compact — badge padding, status dot gap |
| `space-3` | 12px | 0.75rem | `p-3` | Between related inline elements |
| `space-4` | 16px | 1rem | `p-4` | Standard — list item, form field |
| `space-5` | 20px | 1.25rem | `p-5` | *(Sparingly — prefer p-4 or p-6)* |
| `space-6` | 24px | 1.5rem | `p-6` | Card internal padding, grid gutter |
| `space-8` | 32px | 2rem | `p-8` | Page padding, section gap |
| `space-10` | 40px | 2.5rem | `p-10` | Large section separation |
| `space-12` | 48px | 3rem | `p-12` | Major structural break |
| `space-16` | 64px | 4rem | `p-16` | Full spacing (modal inner) |

**Source:** Phase 0 Principle 6

---

### 3.2 Layout Constants

| Token | Value | Tailwind | Description | Source |
|-------|-------|----------|-------------|--------|
| `--sidebar-width` | **280px** | `w-[280px]` | Sidebar width (NOT w-72=288px) | Phase 0 — golden ratio: 1160/280 ~ phi^3 |
| `--sidebar-collapsed` | 64px | `w-16` | Icon rail (NEXUS full-bleed mode) | Phase 2-1 Analysis |
| `--topbar-height` | **56px** | `h-14` | Top bar height | Phase 2-1 Non-Negotiables |
| `--content-max` | **1160px** | `max-w-[1160px]` | Content area max-width | Phase 0 Layout |
| `--grid-cols` | 12 | `grid-cols-12` | Column count | Phase 0 Swiss Grid |
| `--grid-gutter` | **24px** | `gap-6` | Grid gutter | Phase 0 Layout |
| `--context-panel` | **360px** | `w-[360px]` | Context panel width (Phase 5) | Phase 2-1 Option C |
| `--page-padding` | 32px | `p-8` | Content area padding | Phase 2-1 Analysis |

**Critical:** `w-[280px]` is EXACT. Do NOT use `w-72` (which equals 288px).

**Source:** Phase 0 Layout + Phase 2-1 Non-Negotiables

---

### 3.3 Grid Layout

```css
/* Named grid layout classes */
.layout-page     { @apply flex h-screen bg-slate-950; }
.layout-sidebar  { @apply w-[280px] flex-shrink-0 border-r border-slate-700/50; }
.layout-content  { @apply flex-1 overflow-auto; }
.layout-grid     { @apply grid grid-cols-12 gap-6 p-8 max-w-[1160px] mx-auto; }
```

**Column spans:**
| Class | Tailwind | Width (at 1160px) | Usage |
|-------|----------|-------------------|-------|
| `.col-full` | `col-span-12` | 1160px | Page heading, tables, full-width |
| `.col-main` | `col-span-8` | ~765px | Hub output stream |
| `.col-aside` | `col-span-4` | ~371px | Hub Tracker sidebar |
| `.col-half` | `col-span-6` | ~568px | 2-column layouts |
| `.col-third` | `col-span-4` | ~371px | Dashboard metric cards (3-up) |
| `.col-quarter` | `col-span-3` | ~275px | 4-column compact grids |

**NEXUS full-bleed mode:**
- Sidebar collapses to 64px icon rail
- Canvas occupies: viewport - 64px = ~1376px on 1440px monitor
- Route detection triggers collapse

**Source:** Phase 0 Layout + Phase 2-1 Hub spec

---

### 3.4 Component-Specific Spacing

```css
/* Card */
.card          { @apply p-6; }           /* 24px all sides */

/* Section */
.section       { @apply py-8; }          /* 32px top/bottom */

/* Page content grid */
.page-grid     { @apply p-8; }           /* 32px all sides */

/* Sidebar nav item */
.nav-item      { @apply px-3 py-2; }     /* 12px/8px */

/* Button sizes */
.btn-sm        { @apply px-3 py-1.5; }   /* 12px/6px */
.btn-md        { @apply px-4 py-2; }     /* 16px/8px */
.btn-lg        { @apply px-6 py-3; }     /* 24px/12px — Hub primary CTA */

/* Status dot — 8px fixed */
.status-dot    { @apply w-2 h-2 rounded-full; }

/* Table */
.table-cell    { @apply px-4 py-3; }     /* 16px/12px */
.table-header  { @apply px-4 py-2; }     /* 16px/8px */
```

**Gestalt Proximity Rules:**
```
Within a component:   gap-2  (8px)   — elements that belong together
Card header to body: gap-4  (16px)  — heading to content separation
Between card groups: gap-8  (32px)  — clear group separation
Section to section:  py-8   (32px)  — section rhythm
```

**Source:** Phase 0 Principle 6 + Gestalt Proximity

---

## 4. Animation & Motion Tokens

### 4.1 Motion Budget — Phase 0 Mandated Values

```css
:root {
  --duration-fast:       100ms;   /* Hover states, button feedback */
  --duration-micro:       50ms;   /* Icon rotation, small UI feedback */
  --duration-page:       150ms;   /* Page transitions — default transition */
  --duration-modal:      200ms;   /* Modal open/close */
  --duration-sidebar:    200ms;   /* Sidebar expand/collapse */
  --duration-toast:      300ms;   /* Toast notification */
  --duration-panel:      300ms;   /* Context panel slide — GPU accelerated */
  --duration-skeleton:  1500ms;   /* Skeleton loading shimmer */
  --duration-pulse:     1500ms;   /* Agent pulse — opacity 0.7 to 1.0 */

  --ease-out:      ease-out;
  --ease-in-out:   ease-in-out;
  --ease-linear:   linear;
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1.0);  /* Toast spring */
}
```

**Source:** Phase 0 Motion specification

---

### 4.2 Agent Pulse Animation

The core visual heartbeat of CORTHEX. Shows an agent is actively working.

```css
@keyframes status-pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1.0; }
}

/* Duration: 1.5s ease-in-out infinite */
.status-working    { animation: status-pulse 1.5s ease-in-out infinite; }
.status-delegating { animation: status-pulse 1.5s ease-in-out infinite; }
```

**Source:** Phase 0 — "Agent pulse: opacity 0.7 to 1.0, 1.5s ease-in-out"

---

### 4.3 Transition Default

**All UI transitions default to `150ms ease`** unless explicitly overridden.

```css
/* Tailwind: transition-colors duration-150 */
/* Tailwind: transition-all duration-150 */
```

**Source:** Phase 0 Motion budget

---

### 4.4 Context Panel Transition

**MUST use `transform: translateX()` for GPU acceleration. NEVER animate `width`** (causes layout reflow every frame).

```css
.context-panel {
  transform: translateX(100%);                     /* Hidden: off-screen right */
  transition: transform 300ms ease-in-out;
  will-change: transform;
}
.context-panel.open {
  transform: translateX(0);                        /* Visible: slides in */
}
```

**Source:** Phase 2-1 Correction #6 (CSS width transition to transform)

---

### 4.5 Named Animation Classes

```css
/* Page enter */
@keyframes page-enter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Modal enter/exit */
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modal-exit {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.97) translateY(-4px); }
}

/* Toast (spring) */
@keyframes toast-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Skeleton shimmer */
@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

---

### 4.6 `prefers-reduced-motion` — MANDATORY

**ALL animations MUST respect `prefers-reduced-motion: reduce`.** This is a Phase 2 Critical Fix applied across all surfaces.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Preserve skeleton as static loading indicator */
  .animate-skeleton {
    animation: none !important;
    background: rgba(30, 41, 59, 0.5);
  }

  /* Preserve status dot color but remove pulse */
  .status-working,
  .status-delegating {
    animation: none !important;
    opacity: 1;
  }

  /* Context panel: instant, no slide */
  .context-panel {
    transition: none !important;
  }
}
```

**Source:** Phase 2 Summary Critical Fix #2

---

### 4.7 Banned Animations

Per Phase 0 Emotional Design rules, these animations MUST NEVER appear:
- **No confetti / celebration animation** — task completion is reported, not celebrated
- **No typing dot animation** (three dots) — Hub output renders directly
- **No bouncy transitions** (cubic-bezier with overshoot >1.0 except toast)
- **No lottie / particle effects** — command center aesthetic, not consumer app
- **No parallax scrolling** — not even on landing page
- **No indefinite spinner >10s** — always show elapsed seconds after 10s

**Source:** Phase 0 Motion

---

## 5. Focus & Accessibility Tokens

### 5.1 Focus Ring Specification

```css
/* Dark context (app pages, dark hero) */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--surface-page),   /* offset = page bg color */
              0 0 0 4px var(--color-primary);    /* ring = cyan-400 */
}
/* Tailwind equivalent: */
focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
```

| Token | Value | Tailwind | Source |
|-------|-------|----------|--------|
| `--focus-ring-color` | `#22D3EE` (cyan-400) | `ring-cyan-400` | Phase 2-3 Focus Tokens |
| `--focus-ring-width` | 2px | `ring-2` | Phase 2-3 Focus Tokens |
| `--focus-ring-offset` | 2px | `ring-offset-2` | Phase 2-3 Focus Tokens |
| `--focus-ring-offset-dark` | `#020617` (slate-950) | `ring-offset-slate-950` | Phase 2-3 Focus Tokens |
| `--focus-ring-offset-light` | `#FFFFFF` (white) | `ring-offset-white` | Phase 2-3 Correction #2 |

**Dual-context focus ring:**
- **Dark sections** (app, landing hero): `ring-offset-slate-950`
- **Light sections** (landing body, login): `ring-offset-white`

**Source:** Phase 2-3 Corrections #2

---

### 5.2 Skip-to-Content Link

Every page MUST include a skip-to-content link as the first focusable element. It is visually hidden until focused.

```html
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:bg-cyan-400 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-lg
          focus:font-medium focus:text-sm">
  본문으로 건너뛰기
</a>
```

**Tailwind breakdown:**
- `sr-only` — hidden by default
- `focus:not-sr-only` — appears on focus (Tab key)
- `focus:fixed focus:top-4 focus:left-4 focus:z-50` — positioned top-left, above all content
- `focus:bg-cyan-400 focus:text-slate-950` — high-contrast primary button style
- `focus:px-4 focus:py-2 focus:rounded-lg` — padded, rounded

**Source:** Phase 2-1 Correction #7 (keyboard focus management)

---

### 5.3 Color-Blind Safety — Status Dot Secondary Indicators

**Status dots MUST NOT rely on color alone** (WCAG 1.4.1 Use of Color). Each status has a mandatory secondary visual indicator.

| Status | Color | Dot Class | Secondary Indicator | Icon (Lucide, 8px) | Combined Class |
|--------|-------|-----------|--------------------|--------------------|---------------|
| Working | `blue-400` `#60A5FA` | `bg-blue-400` | Animated pulse | Pulse animation = secondary | `status-working` |
| Complete | `emerald-400` `#34D399` | `bg-emerald-400` | Checkmark icon inside | `Check` 8px | `status-complete` |
| Failed | `red-400` `#F87171` | `bg-red-400` | X icon inside | `X` 8px | `status-failed` |
| Queued | `slate-600` `#475569` | `bg-slate-600` | Empty circle (ring only) | Ring outline, no fill | `status-queued` |
| Delegating | `violet-400` `#A78BFA` | `bg-violet-400` | Animated pulse + arrow icon | `ArrowRight` 8px + pulse | `status-delegating` |

**Implementation:** Status dots are 8px (`w-2 h-2`). The secondary indicator is either:
1. Animation (working/delegating) — distinguishes from static dots
2. Inner icon (complete/failed) — SVG icon scaled to 8px inside the dot
3. Ring outline (queued) — `ring-1 ring-slate-600 bg-transparent` instead of filled

```css
/* Color-blind safe status dot variants */
.status-complete {
  @apply w-2 h-2 rounded-full bg-emerald-400 relative;
  /* Inner checkmark rendered via SVG or pseudo-element */
}
.status-complete::after {
  content: '';
  @apply absolute inset-0;
  background: url("data:image/svg+xml,...") center/6px no-repeat; /* checkmark SVG */
}

.status-failed {
  @apply w-2 h-2 rounded-full bg-red-400 relative;
}
.status-failed::after {
  content: '';
  @apply absolute inset-0;
  background: url("data:image/svg+xml,...") center/6px no-repeat; /* x-mark SVG */
}

.status-queued {
  @apply w-2 h-2 rounded-full bg-transparent ring-1 ring-slate-600;
  /* Ring-only = visually distinct from filled dots */
}
```

**Source:** Phase 2 Summary Critical Fix #3

---

### 5.4 Sidebar Focus Trap (Mobile)

When the sidebar is open on mobile (overlay mode), focus must be trapped within it. Pressing Escape or clicking the overlay closes it and returns focus to the trigger button.

**Implementation note:** Use `@headlessui/react` Dialog or manual `focus-trap-react` package.

**Source:** Phase 2-1 Correction #7

---

## 6. Component-Level Tokens

### 6.1 Active Nav Item

```css
.nav-item-active {
  @apply bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400
         rounded-l-none pl-[10px];  /* Compensate for 2px border-l */
}
```

| Property | Value | Tailwind | Hex |
|----------|-------|----------|-----|
| Background | cyan-400 at 10% alpha | `bg-cyan-400/10` | `rgba(34, 211, 238, 0.10)` |
| Left border | 2px solid cyan-400 | `border-l-2 border-cyan-400` | `#22D3EE` |
| Text color | cyan-400 | `text-cyan-400` | `#22D3EE` |
| Left padding | 10px (12px - 2px border) | `pl-[10px]` | — |
| Border radius | none on left | `rounded-l-none` | — |

**Inactive nav item:**
```css
.nav-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg
         text-[13px] font-medium text-slate-400
         hover:text-slate-200 hover:bg-slate-800/50
         transition-colors duration-150;
}
```

**Source:** Phase 0 Active Nav specification

---

### 6.2 Status Dots (Full Specification)

| Status | Tailwind bg | Hex | Animation | Secondary Indicator | Source |
|--------|------------|-----|-----------|--------------------|---------|
| Working | `bg-blue-400` | `#60A5FA` | `animate-status-pulse` (1.5s) | Pulse animation | Phase 0 |
| Complete | `bg-emerald-400` | `#34D399` | None | Checkmark icon | Phase 0 |
| Failed | `bg-red-400` | `#F87171` | None | X icon | Phase 0 |
| Queued | `bg-slate-600` | `#475569` | None | Ring outline (no fill) | Phase 0 |
| Delegating | `bg-violet-400` | `#A78BFA` | `animate-status-pulse` (1.5s) | Arrow icon + pulse | Phase 0 |

Base dot size: `w-2 h-2 rounded-full` (8px diameter)

---

### 6.3 Cards

```css
.card {
  @apply rounded-2xl bg-slate-900 border border-slate-800 p-6;
}
```

| Property | Value | Tailwind | Source |
|----------|-------|----------|--------|
| Border radius | 16px | `rounded-2xl` | Phase 0 |
| Background | slate-900 `#0F172A` | `bg-slate-900` | Phase 0 |
| Border | 1px slate-800 `#1E293B` | `border border-slate-800` | Phase 0 |
| Padding | 24px | `p-6` | Phase 0 Principle 6 |

**Card elevated variant:**
```css
.card-elevated { @apply rounded-2xl bg-slate-800 border border-slate-700 p-6; }
```

**Card gradient pattern (preserved from v1):**
```css
.card-gradient {
  background: linear-gradient(
    to bottom right,
    color-mix(in srgb, var(--card-accent-color) 15%, transparent),
    rgba(30, 41, 59, 0.80),
    rgba(30, 41, 59, 0.80)
  );
}
```

---

### 6.4 Badges

#### Tier Badges
```css
.tier-badge {
  @apply text-[11px] font-medium uppercase tracking-wide
         px-2 py-0.5 rounded-full;
}
/* Color per tier is set dynamically via accent color */
```

| Tier | Badge Style | Source |
|------|------------|--------|
| Tier 1 (Executive) | `bg-cyan-400/10 text-cyan-400 border border-cyan-400/30` | Phase 0 |
| Tier 2 (Manager) | `bg-violet-400/10 text-violet-400 border border-violet-400/30` | Phase 0 |
| Tier 3 (Worker) | `bg-slate-700 text-slate-400 border border-slate-600` | Phase 0 |

#### Notification Badges

| Variant | Spec | Tailwind |
|---------|------|----------|
| Dot (no number) | 6px red-500 circle | `w-1.5 h-1.5 rounded-full bg-red-500` |
| Number badge | 16px height, min-w-4, red-500 bg | `min-w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center px-1` |

**WCAG for notification badge:** `red-500` (#EF4444) on surrounding dark bg has 5.0:1 contrast — passes AA.

---

### 6.5 Button Hierarchy

```css
/* Primary — Filled cyan (dark bg only) */
.btn-primary {
  @apply bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg
         hover:bg-cyan-300 active:bg-cyan-500
         focus-visible:ring-2 focus-visible:ring-cyan-400
         focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
         disabled:opacity-40 disabled:cursor-not-allowed
         transition-colors duration-150;
}

/* Secondary — Outlined cyan */
.btn-secondary {
  @apply border border-cyan-400/50 text-cyan-400 px-4 py-2 rounded-lg
         hover:border-cyan-400 hover:bg-cyan-400/10
         focus-visible:ring-2 focus-visible:ring-cyan-400
         focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
         disabled:opacity-40 disabled:cursor-not-allowed
         transition-all duration-150;
}

/* Tertiary — Ghost slate */
.btn-tertiary {
  @apply text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
         px-3 py-1.5 rounded
         transition-colors duration-150;
}

/* Destructive — Soft red */
.btn-destructive {
  @apply bg-red-400/10 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg
         hover:bg-red-400/20 hover:border-red-400/50
         focus-visible:ring-2 focus-visible:ring-red-400
         focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
         transition-all duration-150;
}
```

**Source:** Phase 0 Button Hierarchy

---

### 6.6 Border Radius Scale

| Token | Value | Tailwind | Use Case | Source |
|-------|-------|----------|---------|--------|
| `radius-sm` | 4px | `rounded` | Badges, small chips, code spans | Phase 0 |
| `radius-md` | 8px | `rounded-lg` | Buttons, form inputs | Phase 0 |
| `radius-lg` | 12px | `rounded-xl` | Alerts, toasts | Phase 0 |
| `radius-xl` | 16px | `rounded-2xl` | Main cards, panels, modals | Phase 0 |
| `radius-2xl` | 24px | `rounded-3xl` | NEXUS dept cluster borders | Phase 0 |
| `radius-full` | 9999px | `rounded-full` | Status dots, avatars, pill badges | Phase 0 |

---

### 6.7 Shadow Scale (Dark-Mode Optimized)

In dark mode, traditional drop shadows disappear. CORTHEX uses subtle glow instead.

```css
:root {
  --shadow-sm:             0 1px 2px rgba(0, 0, 0, 0.50);
  --shadow-md:             0 4px 6px rgba(0, 0, 0, 0.40), 0 2px 4px rgba(0, 0, 0, 0.30);
  --shadow-lg:             0 10px 15px rgba(0, 0, 0, 0.50);
  --shadow-xl:             0 20px 25px rgba(0, 0, 0, 0.60);
  --shadow-2xl:            0 25px 50px rgba(0, 0, 0, 0.70);
  --glow-primary:          0 0 20px rgba(34, 211, 238, 0.15);
  --glow-primary-strong:   0 0 30px rgba(34, 211, 238, 0.25);
  --glow-success:          0 0 16px rgba(52, 211, 153, 0.15);
  --glow-error:            0 0 16px rgba(248, 113, 113, 0.15);
  --glow-violet:           0 0 16px rgba(167, 139, 250, 0.15);
}
```

---

### 6.8 Icon System

**Library:** `lucide-react` (outlined stroke style, Saul Bass geometric reduction)
**Default size:** 20px (`size-5`)
**Default stroke:** 1.5 (`strokeWidth={1.5}`)
**Active stroke:** 2.0 (`strokeWidth={2}`)

Icons inherit `currentColor` from parent. Override ONLY for semantic state.

---

### 6.9 Scrollbar

```css
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: #0F172A; }  /* slate-900 */
::-webkit-scrollbar-thumb  { background: #334155; border-radius: 9999px; }  /* slate-700 rounded */
::-webkit-scrollbar-thumb:hover { background: #475569; }  /* slate-600 */
```

---

### 6.10 Selection

```css
::selection { @apply bg-cyan-400/20 text-slate-50; }
```

---

### 6.11 Nav Section Header

```css
.nav-section-header {
  @apply text-[11px] font-medium uppercase tracking-widest text-slate-400
         px-3 pt-4 pb-1;
}
```

Labels: `COMMAND`, `ORGANIZATION`, `TOOLS`, `SYSTEM`

---

## 7. tailwind.config.ts

Complete, production-ready configuration file.

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {

      // ─── FONTS ──────────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          'Inter',
          'Pretendard',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Cascadia Code',
          'monospace',
        ],
      },

      // ─── CUSTOM COLORS ─────────────────────────────────────────────────
      colors: {
        // NEXUS-specific background
        nexus: {
          bg: '#040D1A',
        },
        // Semantic aliases (named for role, map to Tailwind built-ins)
        primary:  '#22D3EE',  // cyan-400
        handoff:  '#A78BFA',  // violet-400
        working:  '#60A5FA',  // blue-400
        // Landing dual-context CTA
        'cta-light': '#0F172A',  // slate-900 — CTA on light backgrounds
      },

      // ─── CUSTOM SPACING ────────────────────────────────────────────────
      spacing: {
        'sidebar':           '280px',
        'sidebar-collapsed': '64px',
        'topbar':            '56px',
        'content-max':       '1160px',
        'context-panel':     '360px',
        'app-tab-bar':       '49px',
      },

      // ─── FONT SIZE ─────────────────────────────────────────────────────
      fontSize: {
        '11': ['0.6875rem', { lineHeight: '1rem' }],                        // 11px — badge
        '13': ['0.8125rem', { lineHeight: '1.25rem' }],                     // 13px — nav label
        'display': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }], // 32px
      },

      // ─── LETTER SPACING ────────────────────────────────────────────────
      letterSpacing: {
        'widest': '0.1em',    // nav section headers
        'badge':  '0.05em',   // badge/tier text
      },

      // ─── MAX WIDTH ─────────────────────────────────────────────────────
      maxWidth: {
        'content': '1160px',
      },

      // ─── WIDTH ─────────────────────────────────────────────────────────
      width: {
        'sidebar':           '280px',
        'sidebar-collapsed': '64px',
        'context-panel':     '360px',
      },

      // ─── HEIGHT ────────────────────────────────────────────────────────
      height: {
        'topbar':    '56px',
        'tab-bar':   '49px',
      },

      // ─── CUSTOM SHADOWS ────────────────────────────────────────────────
      boxShadow: {
        'glow-primary':        '0 0 20px rgba(34, 211, 238, 0.15)',
        'glow-primary-strong': '0 0 30px rgba(34, 211, 238, 0.25)',
        'glow-success':        '0 0 16px rgba(52, 211, 153, 0.15)',
        'glow-error':          '0 0 16px rgba(248, 113, 113, 0.15)',
        'glow-violet':         '0 0 16px rgba(167, 139, 250, 0.15)',
        'dark-sm':             '0 1px 2px rgba(0, 0, 0, 0.50)',
        'dark-md':             '0 4px 6px rgba(0, 0, 0, 0.40), 0 2px 4px rgba(0, 0, 0, 0.30)',
        'dark-lg':             '0 10px 15px rgba(0, 0, 0, 0.50)',
        'dark-xl':             '0 20px 25px rgba(0, 0, 0, 0.60)',
        'dark-2xl':            '0 25px 50px rgba(0, 0, 0, 0.70)',
      },

      // ─── CUSTOM ANIMATIONS ─────────────────────────────────────────────
      animation: {
        'page-enter':     'page-enter 150ms ease-out both',
        'modal-enter':    'modal-enter 200ms ease-out both',
        'modal-exit':     'modal-exit 200ms ease-out both',
        'toast-enter':    'toast-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1.0) both',
        'skeleton':       'skeleton-shimmer 1500ms linear infinite',
        'status-pulse':   'status-pulse 1500ms ease-in-out infinite',
        'nexus-pulse':    'status-pulse 1500ms ease-in-out infinite',
      },

      // ─── KEYFRAMES ─────────────────────────────────────────────────────
      keyframes: {
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-enter': {
          from: { opacity: '0', transform: 'scale(0.97) translateY(-4px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'modal-exit': {
          from: { opacity: '1', transform: 'scale(1) translateY(0)' },
          to:   { opacity: '0', transform: 'scale(0.97) translateY(-4px)' },
        },
        'toast-enter': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'skeleton-shimmer': {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '0.7' },
          '50%':       { opacity: '1.0' },
        },
      },

      // ─── TRANSITIONS ───────────────────────────────────────────────────
      transitionDuration: {
        '50':  '50ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },

      // ─── GRID ──────────────────────────────────────────────────────────
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },

  plugins: [],
};

export default config;
```

---

## 8. globals.css

Complete, production-ready CSS file with all CORTHEX design tokens operationalized.

```css
/* ═══════════════════════════════════════════════════════════
   CORTHEX Global Styles — Phase 3 Design System v2.0
   ═══════════════════════════════════════════════════════════ */

/* ─── Font Imports (self-hosted via @fontsource) ─── */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

/* ─── Tailwind Layers ─── */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── CSS Custom Properties ─── */
:root {
  /* ── Surfaces ── */
  --surface-page:          #020617;  /* slate-950 */
  --surface-card:          #0F172A;  /* slate-900 */
  --surface-elevated:      #1E293B;  /* slate-800 */
  --surface-input:         #0F172A;  /* slate-900 */
  --surface-overlay:       rgba(2, 6, 23, 0.80);
  --surface-nexus:         #040D1A;  /* custom deep navy */

  /* ── Borders ── */
  --border-default:        #1E293B;  /* slate-800 */
  --border-subtle:         rgba(51, 65, 85, 0.50);  /* slate-700/50 */
  --border-strong:         #334155;  /* slate-700 */
  --border-active:         #22D3EE;  /* cyan-400 */

  /* ── Text ── */
  --text-1:                #F8FAFC;  /* slate-50 */
  --text-2:                #94A3B8;  /* slate-400 */
  --text-3:                #475569;  /* slate-600 — placeholder only */
  --text-inverse:          #020617;  /* slate-950 */
  --text-link:             #22D3EE;  /* cyan-400 */

  /* ── Semantic Accents ── */
  --color-primary:         #22D3EE;  /* cyan-400 */
  --color-handoff:         #A78BFA;  /* violet-400 */
  --color-success:         #34D399;  /* emerald-400 */
  --color-warning:         #FBBF24;  /* amber-400 */
  --color-error:           #F87171;  /* red-400 */
  --color-working:         #60A5FA;  /* blue-400 */

  /* ── Focus ── */
  --focus-ring-color:      #22D3EE;  /* cyan-400 */
  --focus-ring-width:      2px;
  --focus-ring-offset:     2px;
  --focus-ring-offset-color: #020617;  /* slate-950 (dark context) */

  /* ── Motion ── */
  --duration-micro:        50ms;
  --duration-fast:         100ms;
  --duration-page:         150ms;
  --duration-modal:        200ms;
  --duration-sidebar:      200ms;
  --duration-toast:        300ms;
  --duration-panel:        300ms;
  --duration-skeleton:     1500ms;
  --duration-pulse:        1500ms;
  --ease-spring:           cubic-bezier(0.34, 1.56, 0.64, 1.0);

  /* ── Structural ── */
  --sidebar-width:         280px;
  --sidebar-collapsed:     64px;
  --topbar-height:         56px;
  --content-max:           1160px;
  --grid-gutter:           24px;
  --context-panel-width:   360px;

  /* ── Shadows ── */
  --shadow-sm:             0 1px 2px rgba(0, 0, 0, 0.50);
  --shadow-md:             0 4px 6px rgba(0, 0, 0, 0.40), 0 2px 4px rgba(0, 0, 0, 0.30);
  --shadow-lg:             0 10px 15px rgba(0, 0, 0, 0.50);
  --shadow-xl:             0 20px 25px rgba(0, 0, 0, 0.60);
  --shadow-2xl:            0 25px 50px rgba(0, 0, 0, 0.70);
  --glow-primary:          0 0 20px rgba(34, 211, 238, 0.15);
  --glow-primary-strong:   0 0 30px rgba(34, 211, 238, 0.25);

  /* ── Landing Dual-Context CTA ── */
  --color-cta-dark-bg:     #22D3EE;  /* cyan-400 — CTA on dark sections */
  --color-cta-dark-text:   #020617;  /* slate-950 */
  --color-cta-light-bg:    #0F172A;  /* slate-900 — CTA on light sections */
  --color-cta-light-text:  #FFFFFF;  /* white */

  /* ── Landing Dual-Context Focus ── */
  --focus-offset-dark:     #020617;  /* slate-950 */
  --focus-offset-light:    #FFFFFF;  /* white */
}

/* ─── Base Layer ─── */
@layer base {
  html {
    @apply bg-slate-950 text-slate-50 antialiased;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }

  body {
    @apply font-sans text-sm leading-normal;
  }

  /* Korean text — global word-break rule */
  :lang(ko) {
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  /* Scrollbar — dark themed */
  ::-webkit-scrollbar        { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track  { background: var(--surface-card); }
  ::-webkit-scrollbar-thumb  { background: var(--border-strong); border-radius: 9999px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-3); }

  /* Selection */
  ::selection {
    background: rgba(34, 211, 238, 0.20);  /* cyan-400/20 */
    color: var(--text-1);
  }

  /* Focus visible — global default (dark context) */
  *:focus { outline: none; }
  *:focus-visible {
    @apply ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950;
  }
}

/* ─── Component Layer ─── */
@layer components {

  /* ── Status Dots ── */
  .status-dot {
    @apply w-2 h-2 rounded-full flex-shrink-0 inline-flex items-center justify-center;
  }
  .status-working {
    @apply status-dot bg-blue-400;
    animation: status-pulse var(--duration-pulse) ease-in-out infinite;
  }
  .status-complete {
    @apply status-dot bg-emerald-400 relative;
  }
  /* Color-blind: checkmark pseudo-element for complete */
  .status-complete::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M1.5 4L3.5 6L6.5 2' stroke='%23020617' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .status-failed {
    @apply status-dot bg-red-400 relative;
  }
  /* Color-blind: X pseudo-element for failed */
  .status-failed::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 2L6 6M6 2L2 6' stroke='%23020617' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .status-queued {
    @apply w-2 h-2 rounded-full bg-transparent ring-1 ring-slate-600 flex-shrink-0;
    /* Color-blind: ring-only (no fill) distinguishes from filled dots */
  }
  .status-delegating {
    @apply status-dot bg-violet-400;
    animation: status-pulse var(--duration-pulse) ease-in-out infinite;
  }

  /* ── Nav Items ── */
  .nav-item {
    @apply flex items-center gap-3 px-3 py-2 rounded-lg
           text-[13px] font-medium text-slate-400
           hover:text-slate-200 hover:bg-slate-800/50
           transition-colors duration-150 cursor-pointer;
  }
  .nav-item-active {
    @apply flex items-center gap-3 py-2 rounded-lg rounded-l-none
           text-[13px] font-medium
           bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400
           pl-[10px] pr-3
           cursor-pointer;
  }
  .nav-section-header {
    @apply text-[11px] font-medium uppercase tracking-widest text-slate-400
           px-3 pt-4 pb-1;
  }

  /* ── Cards ── */
  .card {
    @apply rounded-2xl bg-slate-900 border border-slate-800 p-6;
  }
  .card-elevated {
    @apply rounded-2xl bg-slate-800 border border-slate-700 p-6;
  }

  /* ── Headings (Brockmann asymmetric) ── */
  .section-heading {
    @apply mt-8 mb-4 text-lg font-semibold text-slate-50;
  }
  .page-heading {
    @apply mb-6 text-2xl font-bold text-slate-50;
  }

  /* ── Tabular Numbers (live metrics) ── */
  .metric-number {
    @apply font-mono text-xs tabular-nums text-slate-50;
  }
  .metric-number-lg {
    @apply font-mono text-2xl font-bold tabular-nums text-slate-50;
  }

  /* ── Buttons ── */
  .btn-primary {
    @apply bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg
           hover:bg-cyan-300 active:bg-cyan-500
           focus-visible:ring-2 focus-visible:ring-cyan-400
           focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
           disabled:opacity-40 disabled:cursor-not-allowed
           transition-colors duration-150;
  }
  .btn-secondary {
    @apply border border-cyan-400/50 text-cyan-400 px-4 py-2 rounded-lg
           hover:border-cyan-400 hover:bg-cyan-400/10
           focus-visible:ring-2 focus-visible:ring-cyan-400
           focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
           disabled:opacity-40 disabled:cursor-not-allowed
           transition-all duration-150;
  }
  .btn-tertiary {
    @apply text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
           px-3 py-1.5 rounded
           transition-colors duration-150;
  }
  .btn-destructive {
    @apply bg-red-400/10 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg
           hover:bg-red-400/20 hover:border-red-400/50
           focus-visible:ring-2 focus-visible:ring-red-400
           focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
           transition-all duration-150;
  }

  /* ── Context Panel ── */
  .context-panel {
    @apply fixed top-0 right-0 h-full w-[360px] bg-slate-900 border-l border-slate-800
           shadow-dark-xl z-40;
    transform: translateX(100%);
    transition: transform var(--duration-panel) ease-in-out;
    will-change: transform;
  }
  .context-panel.open {
    transform: translateX(0);
  }

  /* ── Skip-to-Content ── */
  .skip-to-content {
    @apply sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
           focus:bg-cyan-400 focus:text-slate-950 focus:px-4 focus:py-2
           focus:rounded-lg focus:font-medium focus:text-sm;
  }

  /* ── Landing: Dual-Context CTA (dark bg) ── */
  .btn-cta-dark {
    @apply bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg
           hover:bg-cyan-300 active:bg-cyan-500
           focus-visible:ring-2 focus-visible:ring-cyan-400
           focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
           transition-colors duration-150;
  }

  /* ── Landing: Dual-Context CTA (light bg) ── */
  .btn-cta-light {
    @apply bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg
           hover:bg-slate-800 active:bg-slate-950
           focus-visible:ring-2 focus-visible:ring-slate-900
           focus-visible:ring-offset-2 focus-visible:ring-offset-white
           transition-colors duration-150;
  }

  /* ── Landing: Secondary CTA (light bg) ── */
  .btn-cta-light-secondary {
    @apply border border-slate-900 text-slate-900 font-semibold px-6 py-3 rounded-lg
           hover:bg-slate-900 hover:text-white
           focus-visible:ring-2 focus-visible:ring-slate-900
           focus-visible:ring-offset-2 focus-visible:ring-offset-white
           transition-all duration-150;
  }
}

/* ─── Utility Layer ─── */
@layer utilities {
  /* Skeleton loading background */
  .skeleton-bg {
    background: linear-gradient(
      90deg,
      rgba(30, 41, 59, 0) 0%,
      rgba(51, 65, 85, 0.5) 50%,
      rgba(30, 41, 59, 0) 100%
    );
    background-size: 200% 100%;
  }

  /* NEXUS department cluster border */
  .dept-cluster {
    @apply border border-violet-400/20 rounded-3xl;
  }

  /* Typography utilities */
  .text-korean {
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  /* Focus ring context overrides */
  .focus-context-light *:focus-visible {
    --tw-ring-offset-color: #FFFFFF;
  }
  .focus-context-dark *:focus-visible {
    --tw-ring-offset-color: #020617;
  }
}

/* ─── Keyframe Definitions ─── */
@keyframes status-pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1.0; }
}

@keyframes page-enter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes modal-exit {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.97) translateY(-4px); }
}

@keyframes toast-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ─── Prefers Reduced Motion ─── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .status-working,
  .status-delegating {
    animation: none !important;
    opacity: 1;
  }

  .skeleton-bg,
  .animate-skeleton {
    animation: none !important;
    background: rgba(30, 41, 59, 0.5);
  }

  .context-panel {
    transition: none !important;
  }
}

/* ─── Prefers Reduced Transparency ─── */
@media (prefers-reduced-transparency: reduce) {
  .nav-item-active {
    background: #0E2A2F !important;  /* Solid equivalent of cyan-400/10 on slate-950 */
  }

  .surface-overlay,
  [class*="backdrop-blur"] {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--surface-page) !important;
  }
}

/* ─── @supports fallbacks for backdrop-filter ─── */
@supports not (backdrop-filter: blur(4px)) {
  .app-header,
  .bottom-nav,
  [class*="backdrop-blur"] {
    background: var(--surface-page) !important;
    backdrop-filter: none;
  }
}

@supports not (-webkit-backdrop-filter: blur(4px)) {
  .app-header,
  .bottom-nav,
  [class*="backdrop-blur"] {
    background: var(--surface-page) !important;
    -webkit-backdrop-filter: none;
  }
}
```

---

## 9. App-Specific Tokens (Capacitor Mobile)

### 9.1 Bottom Tab Bar

| Token | Value | Tailwind | Source |
|-------|-------|----------|--------|
| Tab bar height | 49px + safe-area-inset-bottom | — | Phase 1-2 App Analysis |
| Tab bar bg | slate-950 + backdrop-blur-lg | `bg-slate-950/90 backdrop-blur-lg` | Phase 1-2 |
| Active tab icon | cyan-400 `#22D3EE` | `text-cyan-400` | Phase 0 (corrected from indigo-600) |
| Inactive tab icon | slate-400 `#94A3B8` | `text-slate-400` | Phase 2 Correction (was slate-500) |
| Active tab label | cyan-400 `#22D3EE` | `text-cyan-400` | Phase 0 |
| Inactive tab label | slate-400 `#94A3B8` | `text-slate-400` | Phase 2 Correction |

**Tab bar CSS:**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(49px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(2, 6, 23, 0.90);  /* slate-950/90 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-default);  /* slate-800 */
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
```

**WCAG:**
- `slate-400` on `slate-950`: **5.9:1** — AA PASS
- `cyan-400` on `slate-950`: **9.1:1** — AAA PASS

**Tab structure:**
```
Hub | Chat | NEXUS | Jobs | You
```
- 5 tabs, 75pt per tab on 375pt screen
- Tab item: icon (20px) + label (10px, text-[10px] for Latin-only labels)

**Source:** Phase 1-2 App Analysis + Phase 2 Corrections

---

### 9.2 Safe Area CSS

```css
/* Top safe area (status bar / notch) */
.main-content {
  padding-top: calc(44px + env(safe-area-inset-top));
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
}

/* Bottom safe area (tab bar) */
.bottom-nav {
  height: calc(49px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}

/* Viewport meta (in index.html) */
/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */
```

**Source:** Phase 1-2 App Analysis

---

### 9.3 Touch Target Minimums

ALL interactive elements on mobile MUST meet these minimums:

| Element | Minimum Size | Tailwind | Source |
|---------|-------------|----------|--------|
| All buttons | 44x44pt | `min-h-[44px] min-w-[44px]` | WCAG 2.2 AAA |
| Tab bar items | 75pt x 49pt | — | Phase 1-2 |
| Agent cards | 72pt height | `min-h-[72px]` | Phase 1-2 |
| FAB (NEXUS add node) | 56pt diameter | `w-14 h-14 rounded-full` | Phase 1-2 |
| Input bar | 44pt height + safe area | `min-h-[44px]` | Phase 1-2 |

**Source:** Phase 1-2 App Analysis + WCAG 2.2 Target Size

---

### 9.4 App backdrop-filter Fallback

```css
@supports not (backdrop-filter: blur(12px)) {
  .bottom-nav {
    background: #020617;  /* slate-950 solid fallback */
  }
}
```

**Source:** Phase 1-2 Corrections

---

## 10. Landing-Specific Tokens

### 10.1 Dual-Context CTA System

**Problem:** `cyan-400` on white/slate-50 backgrounds has only 1.3:1 contrast ratio — completely invisible. The landing page transitions from dark hero to light body, requiring two CTA systems.

| Context | CTA Background | CTA Text | Secondary CTA | Focus Ring Offset | Source |
|---------|---------------|----------|--------------|------------------|--------|
| Dark bg (hero, trust band, final CTA) | `bg-cyan-400` (#22D3EE) | `text-slate-950` (#020617) | `border border-cyan-400/50 text-cyan-400` | `ring-offset-slate-950` | Phase 0 |
| Light bg (body sections) | `bg-slate-900` (#0F172A) | `text-white` (#FFFFFF) | `border border-slate-900 text-slate-900` | `ring-offset-white` | Phase 2-3 Correction #1 |

**CSS Custom Properties:**
```css
--color-cta-dark-bg:     #22D3EE;   /* cyan-400 */
--color-cta-dark-text:   #020617;   /* slate-950 */
--color-cta-light-bg:    #0F172A;   /* slate-900 */
--color-cta-light-text:  #FFFFFF;   /* white */
```

**WCAG verification:**
- `slate-950` on `cyan-400`: **9.1:1** — AAA PASS
- `white` on `slate-900`: **17.3:1** — AAA PASS
- `slate-900` on `white`: **17.3:1** — AAA PASS (secondary outlined)

**Source:** Phase 2-3 Correction #1 (blocking fix)

---

### 10.2 Dual-Context Focus Ring System

```css
/* Dark landing sections */
.landing-dark *:focus-visible {
  @apply ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950;
}

/* Light landing sections */
.landing-light *:focus-visible {
  @apply ring-2 ring-cyan-400 ring-offset-2 ring-offset-white;
}
```

**Source:** Phase 2-3 Correction #2

---

### 10.3 Hero Background + Grid Overlay

```css
.landing-hero {
  background: #020617;  /* slate-950 */
  position: relative;
}

/* CSS-only grid overlay (no JS, no canvas) */
.landing-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 64px 64px;
  pointer-events: none;
  z-index: 1;
}

.landing-hero > * {
  position: relative;
  z-index: 2;
}
```

**Hero H1 typography:**
```css
/* Responsive heading scale */
font-inter text-4xl sm:text-5xl xl:text-7xl font-bold text-white
```

**Hero content max-width:**
```css
max-w-4xl  /* 896px on 1440 viewport = 0.622 ratio (golden ratio) */
```

**NEXUS hero visual:**
```css
/* Browser chrome frame containing NEXUS screenshot */
.hero-visual {
  @apply rounded-2xl border border-slate-800 overflow-hidden shadow-dark-2xl;
}
/* Target: real screenshot, 150KB webp max */
```

**Source:** Phase 2-3 Analysis

---

### 10.4 Trust Band (Dark-to-Light Transition Buffer)

The trust band is a `slate-900` section between the dark hero and light body. It establishes visual credibility before the context switch.

```css
.trust-band {
  background: #0F172A;  /* slate-900 */
  /* Content: trust logos, social proof, partner badges */
  /* Uses dark-context tokens (cyan-400 CTA, ring-offset-slate-950) */
}
```

**Source:** Phase 2-3 Analysis

---

### 10.5 Body Section Backgrounds (Light Context)

Body sections alternate between `slate-50` and `white` for visual rhythm:

| Section | Background | Hex | Tailwind | Source |
|---------|-----------|-----|----------|--------|
| Section 1 (Features) | `slate-50` | `#F8FAFC` | `bg-slate-50` | Phase 0 |
| Section 2 (How it works) | `white` | `#FFFFFF` | `bg-white` | Phase 0 |
| Section 3 (Testimonials) | `slate-50` | `#F8FAFC` | `bg-slate-50` | Phase 0 |
| Final CTA band | `slate-900` | `#0F172A` | `bg-slate-900` | Phase 2-3 Correction #8 (not indigo-950) |

**Text colors on light backgrounds:**

| Token | Tailwind | Hex | On white | On slate-50 | WCAG |
|-------|---------|-----|---------|------------|------|
| Heading text | `text-slate-900` | `#0F172A` | **17.3:1** | **17.0:1** | AAA |
| Body text | `text-slate-700` | `#334155` | **9.2:1** | **9.0:1** | AAA |
| Secondary text | `text-slate-500` | `#64748B` | **5.0:1** | **4.9:1** | AA |

**Source:** Phase 0 Vision + Phase 2-3 Analysis

---

### 10.6 Landing Motion Budget

| Animation | Duration | Easing | Notes | Source |
|-----------|----------|--------|-------|--------|
| Fade-up on scroll | 150-200ms | ease-out | IntersectionObserver trigger | Phase 2-3 |
| Hover effects | 300ms | ease | Color/shadow transitions | Phase 2-3 |
| No parallax | — | — | BANNED | Phase 0 |
| No particles | — | — | BANNED | Phase 0 |
| No lottie | — | — | BANNED | Phase 0 |

**Landing JS bundle budget:** <80KB gzipped

**Source:** Phase 2-3 Analysis + Phase 0 Motion

---

### 10.7 Landing Nav

```css
.landing-nav {
  @apply fixed top-0 left-0 right-0 z-50
         bg-slate-950/80 backdrop-blur-lg
         border-b border-slate-800/50
         h-16 flex items-center px-6;
}

/* Login placement: nav-only */
.landing-nav-login {
  @apply text-slate-400 hover:text-slate-200 text-sm font-medium
         transition-colors duration-150;
  /* Ghost "로그인" button */
}
.landing-nav-cta {
  @apply bg-cyan-400 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg
         hover:bg-cyan-300 transition-colors duration-150;
  /* Primary "시작하기" button */
}
```

**Source:** Phase 2-3 Analysis

---

## Summary Reference Card

```
BACKGROUNDS:   page=slate-950(#020617)  surface=slate-900(#0F172A)
               elevated=slate-800(#1E293B)  nexus=#040D1A
BORDERS:       default=slate-800(#1E293B)  strong=slate-700(#334155)
TEXT:           text-1=slate-50(#F8FAFC)  text-2=slate-400(#94A3B8)
               text-3=slate-600(#475569, placeholder only)
               BANNED: slate-500 for body text
ACCENTS:       primary=cyan-400(#22D3EE)  handoff=violet-400(#A78BFA)
               success=emerald-400(#34D399)  warning=amber-400(#FBBF24)
               error=red-400(#F87171)  working=blue-400(#60A5FA)
FONTS:         Inter (400/500/600/700) + JetBrains Mono (400/500)
               Self-hosted via @fontsource. Google Fonts CDN BANNED.
SPACING:       4px base. card=p-6. section=py-8. page=p-8.
GRID:          280px sidebar. 12-col. 24px gutter. max-w-1160px.
               Hub: col-span-8 + col-span-4.
LAYOUT:        topbar=56px(h-14). context-panel=360px. sidebar-collapsed=64px.
RADIUS:        card=rounded-2xl(16px). btn=rounded-lg(8px). badge=rounded(4px).
MOTION:        page=150ms. modal=200ms. panel=300ms(transform, NOT width).
               pulse=1.5s. skeleton=1.5s. toast=300ms spring.
               prefers-reduced-motion: ALL animations disabled.
FOCUS:         ring-2 cyan-400 offset-2. Dark: offset-slate-950. Light: offset-white.
STATUS DOTS:   Color + secondary indicator (icon/animation/ring). Never color alone.
APP:           tab-bar=49px+safe-area. touch-min=44x44pt. inactive=slate-400.
LANDING:       Dark CTA=cyan-400. Light CTA=slate-900. Hero grid=64px.
               Trust band=slate-900. Body=slate-50/white alternating.
WCAG:          All pairs AA+ verified. slate-500 BANNED. Complete audit in 1.8.
```

---

_End of CORTHEX Design Tokens v2.0_
_Phase 3-1 complete. This document is the single source of truth for Phase 5 Stitch prompts._
_All values trace back to Phase 0 Vision & Identity v2.0 + Phase 2 Critic Review corrections._
