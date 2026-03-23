# Critic-B (QA + Security) Review — Stage 5 Step 6: Design System Foundation

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 752~980)
**Step Spec:** `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-06-design-system.md`
**Grade Target:** A (avg >= 8.0)

---

## Step Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Design system choice clearly presented | PASS | Radix + Tailwind v4 + shadcn/ui with comparison table |
| Rationale for selection | PASS | vs Material/Ant comparison + vs custom rationale |
| Implementation approach planned | PASS | Token system, component hierarchy, legacy migration |
| Customization strategy defined | PASS | Color 60-30-10, typography, spacing, motion, a11y, layouts, themes |

---

## Dimension Scores (Critic-B Weights)

| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | **9**/10 | 10% | 0.90 | Hex values, WCAG ratios, px values, duration ms, type scale, token names, file paths, component names. Near-complete specificity. |
| D2 Completeness | **8**/10 | **25%** | 2.00 | All 4 template sections + extensive customization (color, type, spacing, motion, a11y, layouts, theme). Missing: responsive component behavior mapping, icon usage guide, form component patterns. |
| D3 Accuracy | **5**/10 | 15% | 0.75 | **5 false claims about v2 codebase state.** See Issues #1-5. Design decisions and token values are accurate, but codebase claims are wrong. |
| D4 Implementability | **7**/10 | 10% | 0.70 | Component hierarchy is actionable. Token table maps to Tailwind. Migration strategy has 3 phases. But migration plan underestimates effort because Radix/Recharts aren't installed. |
| D5 Consistency | **9**/10 | 15% | 1.35 | Colors, dimensions, app shell, layout types all match design-tokens.md and Step 3. No self-contradictions. |
| D6 Risk Awareness | **7**/10 | **25%** | 1.75 | Subframe↔Radix coexistence rules, WCAG matrix (9 areas), forbidden combos (3), dark mode future path, CVD safety. But migration risk is UNDERSTATED because v2 dependencies are misidentified. |

### **Weighted Average: 7.45/10 ✅ PASS (but below Grade A target of 8.0)**

---

## Issue List (6 issues, ordered by severity)

### Issue #1 — [D3] CRITICAL: Radix UI "v2에서 일부 사용 중" is FALSE
**Location:** Line 785 (rationale table), Line 764 (choice table)
**Problem:** The rationale table states: `v2에서 Radix 일부 사용 중 (Dialog, Dropdown)`. **Grep-verified: zero `@radix-ui` packages in any package.json across the entire monorepo.** v2 uses Subframe UI for Dialog and DropdownMenu (`packages/app/src/ui/components/Dialog.tsx`, `DropdownMenu.tsx` — Subframe components, not Radix).

**Impact:** This false claim inflates the migration advantage of Radix ("already partially adopted") and understates migration effort. Developers reading this will expect Radix imports to exist.

**Verification:**
```
grep -r "radix-ui" packages/*/package.json  → 0 matches
grep -r "@subframe/core" packages/*/package.json  → 1 match (packages/app)
ls packages/app/src/ui/components/Dialog.tsx  → exists (Subframe)
```

**Fix:** Change L785 to: `v2에서 미사용 — Subframe UI 사용 중 (Dialog, Dropdown 등 44개 컴포넌트). v3에서 Radix로 점진 교체.` Update migration strategy to include "Phase 0: Install @radix-ui packages" step.

### Issue #2 — [D3] HIGH: Recharts "기존 v2 사용 중" is FALSE
**Location:** Line 768
**Problem:** States: `기존 v2 사용 중`. **Recharts is not installed in any package.json.** v2 uses Subframe's built-in chart components (`packages/app/src/ui/components/AreaChart.tsx`, `BarChart.tsx`).

**Verification:**
```
grep -r "recharts" packages/*/package.json  → 0 matches
ls packages/app/src/ui/components/AreaChart.tsx  → exists (Subframe)
```

**Fix:** Change to: `v3 신규 도입 예정 — v2는 Subframe 내장 차트 사용 중`. This changes the migration story: it's a chart library introduction, not continuation.

### Issue #3 — [D3] MEDIUM: Subframe component count is 44, not 36
**Location:** Line 853
**Problem:** States "Subframe UI 컴포넌트 36개". Actual count is **44 files** in `packages/app/src/ui/components/`.

**Note:** The "36" number also appears in design-tokens.md L701, so this is a propagated error from the design tokens doc. Still needs correction in this spec.

**Verification:**
```
ls packages/app/src/ui/components/ | wc -l  → 44
```

**Fix:** Change "36개" → "44개" in L853. Also flag design-tokens.md for correction.

### Issue #4 — [D3] MEDIUM: @fontsource "self-hosted, no CDN" — NOT installed
**Location:** Line 767
**Problem:** States `@fontsource/* (self-hosted, no CDN)`. **No @fontsource packages in any package.json.** Fonts may be loaded differently (CDN, manual files, or not at all yet).

**Verification:**
```
grep -r "fontsource" packages/*/package.json  → 0 matches
```

**Fix:** Either: (a) Change to "v3에서 @fontsource 설치 예정" if self-hosted is the plan, or (b) Verify current font loading method and document accurately.

### Issue #5 — [D3] LOW: Lucide React "pinned, no ^" — partially wrong
**Location:** Line 766
**Problem:** States `lucide-react (pinned, no ^)`. Admin has it pinned (`"0.577.0"`), but app uses `"^0.577.0"` (with caret). CLAUDE.md says "SDK pin version (no ^)" — the app package violates this.

**Verification:**
```
packages/app/package.json:    "lucide-react": "^0.577.0"   ← has ^
packages/admin/package.json:  "lucide-react": "0.577.0"    ← pinned correctly
```

**Fix:** Note the inconsistency: "admin은 pinned, app은 ^0.577.0 — CLAUDE.md 규칙 위반. Pre-Sprint에서 app도 pin 필요."

### Issue #6 — [D3] LOW: Accent-hover contrast ratio discrepancy
**Location:** Line 885
**Problem:** States white on accent-hover `#4e5a2b` = 7.44:1. Design Tokens §1.2 states 7.02:1 for the same combination. Both pass AA, but the numbers should match the authoritative source.

**Fix:** Align with design-tokens.md: 7.44:1 → 7.02:1.

---

## WCAG / Accessibility Verification

| Claim | Verified Against | Status |
|-------|-----------------|--------|
| Text primary 16.42:1 on cream | Design Tokens §1.3 | MATCH ✅ |
| Text secondary 4.83:1 on cream | Design Tokens §1.3 | MATCH ✅ |
| Chrome text 6.63:1 on olive | Design Tokens §1.3 | MATCH ✅ |
| White 5.68:1 on accent | Design Tokens §1.2 | MATCH ✅ |
| Input border 3.25:1 (WCAG 1.4.11) | Design Tokens §1.2 | MATCH ✅ |
| Decorative border 1.23:1 — forbidden for input | Design Tokens §1.2 note | MATCH ✅ |
| Focus ring 5.35:1 on cream / 6.63:1 on olive | Design Tokens §1.6 | MATCH ✅ |
| Touch target ≥44px | WCAG 2.5.8 | CORRECT ✅ |
| Reduced motion 0.01ms override | WCAG 2.3.3 | CORRECT ✅ |
| Forced colors Windows HC fallback | WCAG 1.4.1 | CORRECT ✅ (border: 1px solid ButtonText) |
| CVD 4 hue families | Design Tokens §1.5 | MATCH ✅ |
| Color alone never sole info carrier | Design Tokens §1.4 note | MATCH ✅ |

**Accessibility section (L935-947) is EXCELLENT.** 9 areas covered, all aligned with design-tokens.md and WCAG 2.1 AA. No issues found.

---

## Auto-Fail Assessment

| Rule | Applies? | Ruling |
|------|----------|--------|
| 할루시네이션: 존재하지 않는 API/파일/함수 참조 | CLOSE CALL | **NO AUTO-FAIL.** Claims are about package installation state ("v2에서 사용 중"), not about specific API paths or function names. The packages (Radix, Recharts) are real libraries — the false claim is about their presence in THIS codebase. D3 scored severely (5/10) instead. |
| 보안 구멍 | No | 4-layer sanitization preserved, no new vulnerabilities |
| 빌드 깨짐 | No | No code proposed that would break tsc |
| 아키텍처 위반 | No | Component hierarchy respects packages/ui boundary |

---

## Summary

**7.45/10 PASS** — Design decisions are sound (Radix + Tailwind v4 + shadcn/ui is the correct choice for this project). WCAG coverage is excellent. Component hierarchy and token system are well-structured.

**However, 5 false claims about v2 codebase state severely undermine D3 Accuracy.** The migration strategy is built on incorrect assumptions about what's already installed. Fixing these is essential for Grade A — developers will use this spec to plan Sprint work.

**For Grade A (8.0+):** Fix Issues #1-4 (codebase state corrections) + #6 (contrast ratio alignment). Issue #5 (Lucide pin) is a codebase fix, not a spec fix.

---

## R2 Verification (6 fixes + bonus content applied)

### Issue-by-Issue Resolution Check

| # | R1 Issue | Severity | Status | Evidence |
|---|----------|----------|--------|----------|
| 1 | Radix UI "v2에서 사용 중" false claim | CRITICAL | **RESOLVED** | L785: `v2 미사용 — v3 신규 도입`. L794-817: New "v3 신규 도입 전제 사항" section — 8 Radix packages listed, architecture decision prerequisite, React 19 compat check, Subframe alternative path. Architecture.md L286-334 verified: zero Radix mentions. |
| 2 | Recharts "기존 v2 사용 중" false claim | HIGH | **RESOLVED** | L768: `v2: Subframe 내장 AreaChart/BarChart/LineChart 사용 중. v3: Recharts 도입 시 recharts 설치 필요, 또는 Subframe Chart 리스타일하여 유지 (Sprint 시점 결정)`. Correctly frames as introduction-or-maintain decision. |
| 3 | Subframe count 36→44 | MEDIUM | **RESOLVED** | L878: `Subframe UI 컴포넌트 44개` ✅ |
| 4 | @fontsource "self-hosted" not installed | MEDIUM | **RESOLVED** | L767: `v2: CSS font-family 선언만 존재 (시스템 fallback). v3: @fontsource/* 설치하여 self-hosted 전환 (Pre-Sprint Layer 0)`. Clear current/target distinction. |
| 5 | Lucide "pinned, no ^" inconsistency | LOW | **ACCEPTED** | L766: Prescriptive "pinned version, no ^" matches CLAUDE.md policy. app `^0.577.0` is a codebase fix for Pre-Sprint, not a spec error. |
| 6 | Accent-hover contrast 7.44:1 vs 7.02:1 | LOW | **RESOLVED (improved)** | L910: `7.44:1 (white-on) / 7.02:1 (on cream)` — dual notation distinguishing white text on accent-hover button vs accent-hover on cream bg. 7.02:1 matches design-tokens.md §1.2 L57 exactly. 7.44:1 is correct for white (#fff > cream luminance). More precise than R1. |

### Bonus Improvements (from dev cross-talk, verified)

| New Content | Line(s) | Quality |
|-------------|---------|---------|
| "v3 신규 도입 전제 사항" section | 794-817 | **Excellent** — 8 Radix packages, 3 architecture prerequisites (AD registration, React 19 compat, Subframe alternative). Prevents premature adoption. |
| Pre-Sprint Layer 0 migration details | 882 | **Excellent** — 5 semantic colors with exact from→to hex values. Verified: `index.css` current values (#34D399, #FBBF24, #c4622d, #60A5FA, #A78BFA) match "from". Design-tokens.md §1.4 values (#4d7c0f, #b45309, #dc2626, #2563eb, #7c3aed) match "to". content-max 1160→1440px confirmed vs `index.css` L42. |
| Content-max discrepancy note | 991 | **Good** — Transparently flags 1440px = 0px side padding at xl breakpoint. Defers decision (1440 vs 1280) to Pre-Sprint. Honest risk disclosure. |
| Chart library decision deferral | 768 | **Good** — Recharts vs Subframe Chart maintain is presented as explicit decision, not false assumption. |

### Codebase Cross-Verification (R2)

| Claim | Verified Against | Status |
|-------|-----------------|--------|
| Radix UI not in v2 | `grep -r "radix-ui" packages/*/package.json` → 0 | MATCH ✅ |
| Radix not in architecture.md | `grep -i "radix" architecture.md` → 0 | MATCH ✅ |
| @subframe/core ^1.154.0 | packages/app/package.json | MATCH ✅ |
| Subframe 44 components | `packages/app/src/ui/components/` | MATCH ✅ |
| Recharts not installed | `grep -r "recharts" packages/*/package.json` → 0 | MATCH ✅ |
| @fontsource not installed | `grep -r "fontsource" packages/*/package.json` → 0 | MATCH ✅ |
| content-max: 1160px current | `packages/app/src/index.css` L42 | MATCH ✅ |
| Semantic color "from" values | `packages/app/src/index.css` L14-18 | MATCH ✅ (all 5) |
| Semantic color "to" values | design-tokens.md §1.4 L79-83 | MATCH ✅ (all 5) |
| accent-hover 7.02:1 on cream | design-tokens.md §1.2 L57 | MATCH ✅ |

### R2 Dimension Scores (Critic-B Weights)

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|----|----|--------|----------|----------|
| D1 Specificity | 9 | **9**/10 | 10% | 0.90 | Maintained. 8 Radix packages named. Semantic color hex from→to pairs exact. Content-max discrepancy quantified. |
| D2 Completeness | 8 | **9**/10 | **25%** | 2.25 | Pre-Sprint Layer 0 migration is now a concrete checklist. Architecture decision prerequisites. Font current/target state. Chart library decision explicitly deferred. |
| D3 Accuracy | 5 | **9**/10 | 15% | 1.35 | **ALL 5 false claims corrected.** Every codebase state claim verified: Radix=new ✅, Recharts=new/optional ✅, Subframe=44 ✅, @fontsource=v3 plan ✅, semantic colors from/to exact ✅, accent-hover dual ratio correct ✅. |
| D4 Implementability | 7 | **9**/10 | 10% | 0.90 | Pre-Sprint Layer 0 is copy-pasteable checklist. Architecture decision gates prevent premature implementation. Migration 3-phase strategy now accurate for actual codebase state. |
| D5 Consistency | 9 | **9**/10 | 15% | 1.35 | Maintained. Semantic target values match design-tokens.md §1.4. Content-max discrepancy preserved for explicit resolution. No new inconsistencies introduced. |
| D6 Risk Awareness | 7 | **9**/10 | **25%** | 2.25 | Radix=new = honest migration scope. React 19 compat risk flagged. Architecture decision prerequisite = governance gate. Subframe alternative = fallback path. Content-max decision deferred with tradeoff analysis. |

### **R2 Weighted Average: 9.00/10 ✅ PASS — Grade A**

**Improvement: 7.45 → 9.00 (+1.55)**

All 5 non-accepted issues resolved. Issue #5 (Lucide pin) appropriately accepted as codebase fix. Bonus improvements from dev cross-talk significantly strengthened accuracy, implementability, and risk awareness. The "v3 신규 도입 전제 사항" section is the standout addition — it transforms a false migration narrative into an honest, governance-gated adoption plan.

### Round 3 Verification (Fix #12 — CSS 우선순위 정책)

**Verified at L888:** Subframe+Radix 공존 시 CSS specificity 정책 추가 확인.
- Tailwind 유틸리티 > Subframe 스타일 ✅
- 충돌 시 wrapper className override 패턴 ✅
- `!important` 금지 ✅
- Specificity 관리: selector 순서 + wrapper 패턴으로만 ✅

**QA 관점**: 이 정책은 Subframe→Radix 마이그레이션 중 스타일 충돌을 테스트 가능하게 만듦. E2E에서 computed style 검증 가능.

**R2 score 유지: 9.00/10** — Round 3 fix는 D4(실행가능성) + D6(리스크)를 추가로 보강하나 이미 9/10 반영됨.

### 잔여 이슈 (non-blocking, Step 7+ 보완 권장)

1. **[D2+D6] 접근성 회귀 테스팅 전략** — 44개 마이그레이션 중 a11y 검증 자동화 (axe-core CI gate 등). Sprint 1 prerequisite 권장.
2. **[D6] Radix 버전 핀** — 8개 패키지 exact version은 Pre-Sprint 설치 시 확정.
3. **[D6] 차트 라이브러리 결정** — Recharts vs Subframe Chart 유지, Pre-Sprint에서 확정 권장.
