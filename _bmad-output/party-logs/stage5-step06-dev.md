# Critic-Dev Review — Step 6: Design System Foundation (UX Design Specification)

**Reviewer:** Amelia (Dev Critic)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 752-981
**Reference:** `_uxui_redesign/phase-3-design-system/design-tokens.md` (733 lines)
**Date:** 2026-03-23
**Focus:** Implementation feasibility, component architecture, CSS/framework patterns, performance
**Target Grade:** A (avg >= 8.0)

---

## Dimension Scores

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| D1 Specificity | 9/10 | 15% | Hex values, WCAG ratios, px grid values, pinned versions, file paths, CSS token prefixes all highly specific. Component tree structure with exact filenames. 7 layout types with CSS patterns. Duration tokens in ms. Only gap: Radix package versions not pinned (just `@radix-ui/react-*` without version). |
| D2 Completeness | 9/10 | 15% | All Step 6 sections covered: Choice, Rationale, Implementation, Customization. Color, typography, spacing, motion, a11y, layout types all addressed. CVD-safe chart palette. Forbidden color combinations listed. Migration strategy (Subframe → Radix) phased. Dark mode future path noted. Minor gap: no responsive typography scale (does type scale change at breakpoints?). |
| D3 Accuracy | 4/10 | **25%** | **Multiple fabricated v2 claims (Quinn-2 cross-talk expanded scope):** (1) "v2에서 Radix 일부 사용 중" — FALSE, zero direct @radix-ui in package.json (transitive via Subframe only). (2) "Recharts 기존 v2 사용 중" — FALSE, zero recharts in any package.json, v2 uses Subframe charts. (3) "@fontsource/* (self-hosted, no CDN)" — FALSE, fonts load via Google Fonts CDN (index.html:12-14). (4) Subframe "36개" → actual 44. (5) accent-hover WCAG 7.44:1 → 7.02:1 per design-tokens. (6) content-max 1160px→1440px undocumented. (7) surface #ffffff→#f5f0e8 undocumented. (8) 5/5 semantic colors diverge. Items 6-8 are pre-migration vs target (acceptable with note). Items 1-5 are factual errors about current codebase state — **3 fabricated "v2 사용 중" claims in a single section is a pattern**, not an isolated mistake. D3 drops from 5→4. |
| D4 Implementability | 8/10 | **20%** | Component tree (lines 826-848) is directly translatable to file creation. Token table maps to `@theme {}` entries. Migration strategy (Pre-Sprint/Sprint/Post-v3) is phased and actionable. `cva()` for button variants, Monaco-lite for Soul editor, shadcn copy-paste pattern — all concrete. Coexistence rule (Subframe + Radix) is clear. **Gap:** No Radix installation command / migration sequence (which Radix packages to install first? `npm install @radix-ui/react-dialog @radix-ui/react-slider ...`). Since Radix is NOT currently installed, the installation is a prerequisite that should be listed. |
| D5 Consistency | 7/10 | 15% | Color hex values (cream, olive, sage) consistent with design-tokens.md and Step 2/3 references. 60-30-10 rule consistent. 8px grid consistent with design-tokens. **Inconsistencies:** (1) accent-hover 7.44:1 vs design-tokens 7.02:1. (2) Subframe "36개" vs actual 44. (3) "Radix 일부 사용 중" contradicts codebase (zero Radix). (4) content-max 1440px vs codebase 1160px — not noted as a change. |
| D6 Risk | 8/10 | 10% | Subframe→Radix migration risk well-managed (phased, coexistence rule, post-v3 full removal). Token collision risk addressed ("Subframe 컴포넌트에 corthex-* 직접 적용 금지"). Dark mode future-proofing noted. `@subframe/core` ~54KB removal quantified. **Gaps:** (1) Radix as new dependency = learning curve + new bundle weight not estimated. (2) What if shadcn/ui component structure conflicts with existing packages/ui flat structure? Migration path from flat → 3-tier not detailed. |

---

## Weighted Average

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 9 | 0.15 | 1.35 |
| D3 | 4 | 0.25 | 1.00 |
| D4 | 8 | 0.20 | 1.60 |
| D5 | 7 | 0.15 | 1.05 |
| D6 | 8 | 0.10 | 0.80 |
| **Total** | | | **7.15/10 PASS** |

---

## Issue List (Priority Order)

### Must Fix (Critical)

1. **[D3 Accuracy — NEAR AUTO-FAIL] "v2에서 Radix 일부 사용 중 (Dialog, Dropdown)" is fabricated.**
   - Evidence: `grep -r "@radix-ui" packages/*/package.json` = zero matches. `Grep @radix-ui *.{tsx,ts,json}` = zero files.
   - Reality: v2 uses `@subframe/core ^1.154.0` (packages/app/package.json:26). Subframe provides Dialog, Dropdown, etc.
   - Impact: This claim underpins the migration rationale ("기존 코드 호환"). If Radix is NOT already in use, the migration is a **net-new dependency introduction**, not an expansion. Sprint planning, bundle size, and learning curve estimates all change.
   - Fix: Replace with "v2에서 Subframe UI 사용 중 (`@subframe/core ^1.154.0`). Radix UI는 v3에서 신규 도입 — Subframe의 점진적 대체."
   - **Auto-fail consideration**: Rubric says "존재하지 않는 API/파일/함수를 참조" triggers auto-fail. Claiming a dependency exists that doesn't is analogous. I'm NOT triggering auto-fail because: (a) the Radix recommendation itself is sound, and (b) the error is about current state, not a phantom API. But D3 takes a severe penalty.

2. **[D3 Accuracy] Subframe component count: 36 → 44.**
   - Evidence: `ls packages/app/src/ui/components/ | wc -l` = 44 files.
   - Impact: Migration scope underestimated by 22%. Sprint planning for "Post-v3 Subframe 전수 교체" needs accurate count.
   - Fix: "Subframe UI 컴포넌트 **44개**"

3. **[D3/D5 Accuracy/Consistency] accent-hover WCAG ratio: 7.44:1 → 7.02:1.**
   - UX doc line 885: "7.44:1". Design-tokens.md §1.2 line 57: "**7.02:1**".
   - Design-tokens.md is the authoritative source cited by the UX doc itself. Misquoting it undermines the WCAG verification table's credibility.
   - Fix: Change 7.44:1 to 7.02:1.

### Should Fix

4. **[D3 Accuracy] content-max discrepancy: 1160px → 1440px.**
   - index.css:42: `--content-max: 1160px`. UX doc line 966: "max-width 1440px". Step 3 Platform Strategy: "max-width 1440px".
   - If 1440px is the v3 target, note this is a change from current 1160px. If 1160px should remain, correct the UX doc.
   - Fix: Add "(현재 1160px → v3 목표 1440px, Pre-Sprint Layer 0에서 변경)" or correct to 1160px.

5. **[D3 Accuracy] Semantic color divergence: index.css vs design-tokens.**
   - 5/5 semantic colors differ between codebase and spec:
     - success: `#34D399` (code) → `#4d7c0f` (spec)
     - warning: `#FBBF24` → `#b45309`
     - error: `#c4622d` → `#dc2626`
     - info: `#60A5FA` → `#2563eb`
     - handoff: `#A78BFA` → `#7c3aed`
   - These are pre-migration values and the spec defines target state — acceptable. But add a one-liner: "현재 index.css의 시맨틱 색상은 v2 기준 — Layer 0-B 마이그레이션에서 아래 값으로 교체."

6. **[D4 Implementability] Radix installation prerequisites missing.**
   - Radix is NOT installed. The spec should list required packages: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-select`, `@radix-ui/react-slider`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`. Plus `class-variance-authority` (cva) and `clsx` if not already present.

7. **[D4 Implementability] packages/ui reorganization path.**
   - Current: flat structure (`packages/ui/avatar.tsx`, `badge.tsx`, ...).
   - Proposed: 3-tier (`primitives/`, `composed/`, `layout/`).
   - No migration path specified. Add: "기존 packages/ui/ 플랫 구조 → 3-tier 재구성은 Pre-Sprint Layer 0-A에서 수행. 기존 컴포넌트는 이동 후 barrel export 유지."

### Must Fix (Added from Quinn-2 cross-talk)

8. **[D3 Accuracy] Recharts "기존 v2 사용 중" (L768) — FALSE.** Zero `recharts` in any package.json. v2 uses Subframe's AreaChart.tsx/BarChart.tsx components. Fix: "Recharts는 v3 신규 도입 — Subframe 차트 컴포넌트 대체."

9. **[D3 Accuracy] @fontsource "self-hosted, no CDN" (L767) — FALSE.** Fonts loaded via Google Fonts CDN (app/index.html:12-14: `fonts.googleapis.com`). Zero `@fontsource` in any package.json. Fix: Either (a) correct to "Google Fonts CDN (현재)" + "v3에서 @fontsource self-hosted 전환 권장" or (b) keep @fontsource as target and note current state is CDN.

10. **[D5 Consistency] Lucide pin: app `"^0.577.0"` vs admin `"0.577.0"`.** CLAUDE.md: "SDK pin version (no ^)". App package violates convention. Fix: note inconsistency, recommend `"0.577.0"` for both.

### Nice to Have

11. **[D6 Risk] Radix bundle size estimate.** Claimed "~5-15KB/컴포넌트" but with 8 primitives that's 40-120KB total. Should note cumulative impact + tree-shaking behavior.

12. **[D2 Completeness] Responsive typography.** Type scale defined (xs:12 → 5xl:48) but no breakpoint scaling noted. Does base stay 16px on mobile? Or drop to 14px?

---

## Cross-talk Notes

- **Critical finding for all critics**: Radix UI is NOT in the v2 codebase. Any review that scored D3 based on "Radix 일부 사용 중" needs revision.
- **Winston (Architect) confirms**: Radix is NOT in architecture.md's "Version Management Strategy" (L286-334) package list. Adding ~8 `@radix-ui/*` packages is an **unplanned dependency introduction** requiring a new architecture decision (D-number). Key risk: **React 19 compatibility** — Radix primitives historically lag behind React major versions. Must verify all 8 packages support React 19.2.4 before committing.
- **Winston (Architect) on content-max**: 1440px content-max on a 1440px viewport = zero side padding. Likely wrong. Either content-max should stay at 1160px, or viewport breakpoint and content-max should have different values (e.g., xl=1440px viewport, content-max=1280px).
- **Winston (Architect) recommendation**: Either (a) add Radix as new architecture decision with React 19 verification, or (b) keep Subframe primitives and restyle with new tokens. The Subframe→Radix migration is a **component library migration** not scoped in architecture.
- **Semantic color divergence**: The 5 old values in index.css are ALL different from design-tokens. The spec correctly defines target state, but should note the gap explicitly for Layer 0-B migration planning.
- **accent-hover `#7a8f5a` in codebase**: design-tokens.md line 57 notes this was the OLD value that "failed at 3.36:1 with white text" — it's still in the live codebase (index.css:9). Migration critical.
- **Quinn (QA) nuance on Radix**: Radix IS in the dependency tree — transitively via `@subframe/core`. bun.lock has 20+ `@radix-ui/*` packages. But zero direct imports. Accurate statement: "v2는 @subframe/core를 사용하며, Subframe이 내부적으로 Radix 의존. 직접 @radix-ui import는 0건." Good news: Radix peerDependency shows `react: "^19.0"` support — React 19 compatibility confirmed. Addresses Winston's risk concern.
- **Quinn-2 (QA) found 2 MORE fabricated v2 claims:**
  - **Recharts "기존 v2 사용 중" (L768) — FALSE.** Zero `recharts` in any package.json. v2 uses Subframe's AreaChart.tsx/BarChart.tsx. Recharts is a new dependency.
  - **@fontsource "self-hosted, no CDN" (L767) — FALSE.** Fonts loaded via Google Fonts CDN (`fonts.googleapis.com`, app/index.html:12-14). Zero `@fontsource` in any package.json.
- **Quinn-2: Lucide pin inconsistency** — admin: `"0.577.0"` (pinned ✅), app: `"^0.577.0"` (caret ❌, violates CLAUDE.md "SDK pin version (no ^)").

---

## Verdict

**7.15/10 — PASS (marginal, below Grade A 8.0)**

Excellent structure and specificity. The design system choice (Radix + Tailwind v4 + shadcn) is architecturally sound. Token system, component hierarchy, migration strategy, and a11y coverage are thorough. However, **3 fabricated "v2 사용 중" claims** (Radix, Recharts, @fontsource) form a pattern of inaccurate codebase assumptions — D3 drops to 4/10. Quinn-2's additional findings (Recharts not installed, fonts via CDN not self-hosted) compound the original Radix issue. This is the lowest D3 across all steps reviewed. **Critical note**: Radix React 19 compatibility IS confirmed via bun.lock peerDependency (`^19.0`) — Winston's risk concern is resolved.

---

## Re-Score After Fixes (Round 2)

**sally's 12 fixes applied (Round 1: 6건 + Round 2: 5건 + Round 3: 1건).** Re-read updated file (lines 752-1008). Verification:

### Fix Verification — Round 1 (Issues 1-6)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Radix "v2 사용 중" fabrication | ✅ Fixed | L785: "v2 미사용 — v3 신규 도입". L794-808: "v3 신규 도입 전제 사항" section with 8 package install list. Clear, honest, actionable. |
| 2 | Subframe 36→44 | ✅ Fixed | L878: "Subframe UI 컴포넌트 44개". L884: "Subframe 44개 컴포넌트 전수 교체". |
| 3 | accent-hover WCAG | ⚠️ Partial | L912: "7.44:1 (white-on) / 7.02:1 (on cream)". Design-tokens §1.2:57 says 7.02:1 for white on #4e5a2b. Dual notation adds confusion. Should be single value 7.02:1. |
| 4 | content-max 1160→1440 | ✅ Fixed | L993: Explicit note — "현재 코드베이스 `--content-max: 1160px`". Notes zero-padding problem at 1440px, 1280px alternative with 80px margin. Pre-Sprint 확정. Thorough. |
| 5 | Semantic color migration | ✅ Fixed | L882: Full old→new value table for all 5 semantic colors (success, warning, error, info, handoff). Pre-Sprint Layer 0 scope. All `from` values match `index.css`, all `to` values match design-tokens.md. Excellent. |
| 6 | Radix install prerequisites | ✅ Fixed | L799-808: All 8 packages listed. Pre-Sprint Layer 0 scope. |

### Fix Verification — Round 2 (Issues 7-11)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 7 | Recharts "v2 사용 중" | ✅ Fixed | L768: "v2: Subframe 내장 AreaChart/BarChart/LineChart 사용 중. v3: Recharts 도입 시 설치 필요, 또는 Subframe Chart 리스타일 유지 (Sprint 시점 결정)". Honest + provides options. |
| 8 | @fontsource "self-hosted" | ⚠️ Still wrong | L767: "v2: CSS `font-family` 선언만 존재 (시스템 fallback)". **INACCURATE** — v2 uses **Google Fonts CDN** (`app/index.html:12-14`: `fonts.googleapis.com` preconnect + CSS2 import for Inter, JetBrains Mono, Noto Serif KR). These are NOT system fallback fonts — they are explicitly loaded from Google's CDN. Fix: "v2: Google Fonts CDN에서 로딩 (`index.html:12-14`). v3: `@fontsource/*` self-hosted 전환 (GDPR/성능)." |
| 9 | Architecture Decision gate | ✅ Fixed | L810-817: (1) D-number required in architecture.md, (2) React 19 compat verification for all 8 packages, (3) Subframe restyle alternative documented. Defers to Pre-Sprint Architecture Review. **Model section** — exactly what a dev needs. |
| 10 | content-max 1280px alternative | ✅ Fixed | L993: "xl breakpoint = 1440px에서 max-width 1440px = 사이드 패딩 0px. 1280px 사용 시 양쪽 80px 여유." Good analysis. |
| 11 | Lucide pinned version | ⚠️ Partial | L766: "pinned version, no ^". Correct target convention. But doesn't note current inconsistency: app=`^0.577.0` vs admin=`0.577.0`. |

### Fix Verification — Round 3 (Issue 12)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 12 | CSS 우선순위 정책 | ⚠️ **Technically incorrect** | L888: "Tailwind 유틸리티 > Subframe 스타일". **WRONG** — Subframe components use TAILWIND UTILITY CLASSES (verified: `Button.tsx:52` uses `bg-brand-600`, `hover:bg-brand-500` via `SubframeUtils.twClassNames()`). Both Subframe and new Radix components use same-specificity Tailwind classes. The real coexistence mechanism is **token namespace separation**: Subframe → `brand-*`/`neutral-*` tokens from `theme.css`, new components → `corthex-*` tokens from `@theme {}`. They don't conflict because they reference DIFFERENT CSS custom properties, not because of specificity differences. The `!important` prohibition and wrapper pattern are correct practical guidance, but the underlying priority claim is misleading. |

### Dev Correction: Subframe CSS Architecture

**IMPORTANT**: My earlier cross-talk to Winston-2 incorrectly stated "Subframe은 `style` prop (inline CSS-in-JS) 생성 → specificity ~1000". This is **WRONG**. Verified:

- `packages/app/src/ui/utils.ts`: `twClassNames = SubframeCore.createTwClassNames(...)` — a Tailwind class merge utility
- `packages/app/src/ui/components/Button.tsx:52-75`: All styling via Tailwind classes (`bg-brand-600`, `hover:bg-brand-500`, etc.)
- `grep "style=" packages/app/src/ui/components/` → **0 matches** — zero inline styles
- Subframe CSS specificity = **identical to Tailwind utilities** (~10-20, single class selectors)

**Correct coexistence model**: Subframe and Radix+Tailwind components coexist because they use DIFFERENT TOKEN NAMESPACES (`brand-*`/`neutral-*` vs `corthex-*`), NOT because of CSS specificity hierarchy. On the same page, a Subframe Button using `bg-brand-600` and a Radix Button using `bg-corthex-accent` reference different CSS custom properties — no conflict.

### Updated Dimension Scores

| Dimension | R1 | R2 | Weight | Change Rationale |
|-----------|-----|-----|--------|-----------------|
| D1 Specificity | 9 | **9** | 15% | Unchanged — was already strong. Architecture Decision section (L810-817) adds specificity. |
| D2 Completeness | 9 | **9** | 15% | Unchanged. Radix prerequisites, architecture gate, chart options all added. |
| D3 Accuracy | 4 | **7** | 25% | 3 fabricated v2 claims all corrected ✅. Recharts properly described ✅. **Remaining issues:** (1) Font "시스템 fallback" should be "Google Fonts CDN" — factual error, (2) accent-hover dual notation 7.44/7.02 — unverified value, (3) CSS priority "Tailwind > Subframe" — technically incorrect (same specificity), (4) Lucide pin inconsistency not noted. One old error partially fixed + one NEW technical error (CSS priority) introduced. D3 stays at 7. |
| D4 Implementability | 8 | **9** | 20% | Architecture Decision gate (L810-817) is excellent — D-number requirement, React 19 verification, Subframe alternative path. Content-max zero-padding analysis actionable. Radix install list complete. CSS coexistence practical guidance (despite wrong priority rationale) is workable — token separation actually works. |
| D5 Consistency | 7 | **8** | 15% | Migration notes align spec with codebase. Semantic color table bridges gap. Architecture.md gap explicitly acknowledged. Lucide pin still inconsistent but minor. |
| D6 Risk | 8 | **8** | 10% | Architecture Decision gate is a strong risk mitigation. Subframe restyle alternative documented. CSS `!important` prohibition correct. |

### Weighted Average (Round 2)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 9 | 0.15 | 1.35 |
| D3 | 7 | 0.25 | 1.75 |
| D4 | 9 | 0.20 | 1.80 |
| D5 | 8 | 0.15 | 1.20 |
| D6 | 8 | 0.10 | 0.80 |
| **Total** | | | **8.25/10 PASS — Grade A** |

### Remaining Notes (non-blocking)

1. **Font loading (D3)**: L767 "시스템 fallback" → should be "Google Fonts CDN" (`index.html:12-14` has explicit CDN preconnect + CSS2 import). Quick one-line fix.
2. **CSS priority (D3)**: L888 "Tailwind 유틸리티 > Subframe 스타일" → should be "동일 specificity — 토큰 네임스페이스 분리로 충돌 방지 (`brand-*` vs `corthex-*`)". The practical guidance (wrapper, `!important` 금지) is correct regardless.
3. **accent-hover (D3)**: Simplify to single value "7.02:1" matching design-tokens exactly.
4. **Lucide pin (D5)**: Note app `^0.577.0` → `0.577.0` for Pre-Sprint fix.

**Final verdict: 8.25/10 — PASS. Grade A (8.0+) achieved. Improvement from 7.15→8.25. All 3 fabricated v2 claims corrected. Architecture Decision gate (L810-817) is the standout addition — elevates D4 from 8→9. The CSS priority claim in Fix #12 introduces a new technical inaccuracy (Subframe uses Tailwind classes, not CSS-in-JS — same specificity), but the practical coexistence guidance works because token namespaces don't overlap. Font CDN error persists from R1 but is non-blocking.**
