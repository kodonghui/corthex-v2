# Critic-B (QA + Security) Review — Stage 5 Step 3: Core Experience

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 238~449)
**Step Spec:** `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-03-core-experience.md`

---

## Step Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Core user action clearly identified and defined | PASS | CEO: Chat→Secretary routing. Admin: NEXUS zero-deploy. Both with core loops. |
| Platform requirements thoroughly explored | PASS | 4-breakpoint responsive, app shell dimensions, browser priority, offline policy, device policy |
| Effortless interaction areas identified | PASS | EI-1~EI-5 covering all 4 v3 layers + Soul editing |
| Critical success moments mapped out | PASS | CSM-1~CSM-5 with quantified success/failure criteria tables |
| Experience principles established | PASS | EP-1~EP-5 with apply/exception patterns |
| Content structure matches step-03 template | PASS | Defining Experience → Platform → Effortless → CSMs → Principles |

---

## Dimension Scores (Critic-B Weights)

| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | **9**/10 | 10% | 0.90 | Breakpoints in exact px (640/1024/1440), sidebar 280px, topbar 56px, Big Five preset values (90/85/30/60/20), FCP ≤1.5s/TTI ≤3s, Toast ≤500ms, onboarding ≤15min, routing accuracy 80%+, fps 30/60 by breakpoint. Near-complete. |
| D2 Completeness | **7**/10 | **25%** | 1.75 | All 5 template sections present. **Gaps:** No accessibility criteria in any CSM table (screen reader path for /office, keyboard path for sliders, onboarding wizard a11y). Memory data visibility still uncodified. i18n still absent. See Issues #1, #3, #4. |
| D3 Accuracy | **7**/10 | 15% | 1.05 | React 19 verified ✅. **React Router v6 WRONG** (codebase: v7.13.1). **EP-5 `[E-XXX-NNN]` "(PRD 패턴)" false attribution** — PRD contains no such format (grep verified, only L487 different format). soul-enricher.ts matches architecture. 16+1 WS correct. |
| D4 Implementability | **8**/10 | 10% | 0.80 | Core loops are actionable sequences. Platform table is copy-pasteable to Tailwind config. CSM tables are directly testable (Playwright assertions). EP-5 error format `[E-XXX-NNN]` is implementable. |
| D5 Consistency | **9**/10 | 15% | 1.35 | FCP/TTI matches Step 2 (L96). WS reconnect 3s×5 matches Step 2 DC-1. Onboarding 6 steps matches Step 2 flow. App shell colors match design-tokens.md. EP-5 references DC-7 from Step 2. No self-contradictions. |
| D6 Risk Awareness | **7**/10 | **25%** | 1.75 | EP-5 "Safe to Fail" is comprehensive for errors. Security error disclosure is correct (no info leak). **Gaps:** No a11y failure criteria in CSMs. No concurrent editing risk (two Admins editing same Soul/agent). No API rate limiting UX (10 msg/s per userId from architecture). |

### **Weighted Average: 7.60/10 ✅ PASS** (revised from 7.75 after dev cross-talk: EP-5 PRD false citation)

---

## Issue List (6 issues, ordered by severity)

### Issue #1 — [D2/D6] HIGH: No accessibility criteria in CSM tables
**Location:** CSM-1 through CSM-5 (Lines 354~408)
**Problem:** Every CSM table defines visual/performance success criteria but zero accessibility criteria. As a QA reviewer, these CSMs will become test specs — if a11y isn't in the table, it won't be tested.

Specific gaps:
- **CSM-1 (/office):** No criteria for screen reader experience. Step 2 DC-1 defines `aria-live` text alternative panel, but CSM-1 doesn't include "screen reader receives state updates within 5s" as a success criterion.
- **CSM-2 (Big Five slider):** No keyboard interaction criterion. Step 2 DC-3 defines `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, but CSM-2 doesn't include "keyboard-only user can adjust all 5 sliders via Arrow keys" as a success criterion.
- **CSM-4 (onboarding):** 6-step Wizard with no a11y mention. Can a screen reader user complete onboarding? Focus management between steps? Progress bar `aria-valuenow`?
- **CSM-5 (n8n):** n8n editor is a third-party embed — is it keyboard accessible? This is an uncontrollable risk.

**Fix:** Add an `접근성` row to each CSM table. Example for CSM-1:
```
| 접근성 (a11y) | aria-live 패널: 상태 변경 5초 내 스크린리더 전달 | 캔버스만 있고 텍스트 대안 없음 → WCAG 4.1.3 위반 |
```

### Issue #2 — [D3] MEDIUM: React Router version is v7, not v6
**Location:** Line 309
**Problem:** Text says "React Router v6" but codebase has `react-router-dom: "^7.13.1"` (packages/app) and `"^7"` (packages/admin). This is a factual error that will confuse developers.
**Fix:** Change "React Router v6" → "React Router v7".

### Issue #3 — [D2] MEDIUM: Memory data visibility permissions still uncodified
**Location:** EI-5 (Line 345), EP-4 (Line 438)
**Problem:** Step 2 residual. John confirmed in cross-talk: "Admin=all agents' reflections, CEO=own company only, employee=nothing." EI-5 says "CEO/Admin은 성장 지표만 확인하면 됨" but doesn't define who sees what. Step 3 Core Experience is the right place to codify this — it defines core interactions and their boundaries.
**Fix:** Add to EI-5: "**데이터 가시성**: Admin은 전체 에이전트 Reflection 열람 가능, CEO는 자사 에이전트만, 일반직원은 Reflection 접근 불가."

### Issue #4 — [D2] LOW: i18n / language strategy still absent
**Location:** Platform Strategy (Lines 285~310)
**Problem:** Step 2 residual. Platform Strategy defines browser, device, offline, responsive — but not language. Korean-only for v3 launch? This affects font stack (Inter needs Korean fallback like Pretendard), date formatting, input IME handling.
**Fix:** Add row to Platform Strategy table: `| 언어 | 한국어 전용 (v3 초기) | 글로벌 확장 시 i18n 구조 추가. 폰트: Inter + Pretendard 한국어 fallback |`

### Issue #5 — [D6] LOW: Concurrent editing risk not addressed
**Location:** EI-1 (Soul editing, Line 317), Admin core loop
**Problem:** What if two Admins edit the same Soul simultaneously? Or the same agent's Big Five sliders? Optimistic concurrency? Last-write-wins? This is a multi-admin risk for larger organizations.
**Fix:** Add note to EI-1 or EP-2: "동시 편집: Last-write-wins + 저장 시 conflict toast ('다른 관리자가 이 Soul을 수정했습니다. 최신 버전을 확인하세요.')"

### Issue #6 — [D6] LOW: API rate limiting UX undefined
**Location:** EI-1~EI-5 (general)
**Problem:** Architecture defines 10 msg/s per userId rate limit. Rapid Soul saves, slider adjustments, or Chat messages could hit this. No UX defined for rate-limited responses.
**Fix:** Add to EP-5: "Rate limit 초과 (10 msg/s): '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.' toast + 1초 디바운스 자동 적용"

### Issue #7 — [D3] MEDIUM: EP-5 error format falsely attributed to PRD (added post dev cross-talk)
**Location:** Line 447
**Problem:** EP-5 states `[E-XXX-NNN] 한국어 설명 + 다음 행동 (PRD 패턴)`. Grepped full PRD — zero matches for `[E-XXX-NNN]` or any structured error code format. PRD L487 only has "에러 시 명확한 피드백" with format "○○가 응답 못 함 → △△가 나머지로 종합" — completely different. The error format is a sound UX proposal, but citing PRD as source is false attribution.
**Auto-fail assessment:** NO — auto-fail trigger is "존재하지 않는 API/파일/함수 참조". This is a format attributed to a document, not a file/API/function hallucination. Content is reasonable; citation is wrong.
**Fix:** Remove "(PRD 패턴)" or change to "(UX 신규 제안)".

---

## Cross-Reference Verification

| Claim in Step 3 | Source | Match? |
|------------------|--------|--------|
| "React 19 + Vite" | `packages/app/package.json` `"react": "^19"` | **MATCH** ✅ |
| "React Router v6" | `packages/app/package.json` `"react-router-dom": "^7.13.1"` | **MISMATCH** ❌ (v7, not v6) |
| "16+1채널 WebSocket" | Architecture FR-OC | MATCH ✅ |
| "soul-enricher.ts" | Architecture FR-PERS | MATCH ✅ (planned, not yet implemented) |
| "memory-reflection.ts" | Architecture FR-MEM | MATCH ✅ |
| "4-layer sanitization" | Architecture PER-1 | MATCH ✅ |
| "8-layer 보안 (n8n)" | confirmed-decisions #3 | MATCH ✅ |
| Sidebar 280px, olive #283618 | design-tokens.md §1.2 | MATCH ✅ |
| Topbar 56px, cream #faf8f5 | design-tokens.md §1.2 | MATCH ✅ (56px = standard h-14) |
| FCP ≤1.5s, TTI ≤3s | Step 2 L96, Architecture NFR | MATCH ✅ |
| `[E-XXX-NNN]` error format | PRD error pattern | MATCH ✅ |

---

## Step 2 Residual Tracking

| Residual from Step 2 | Addressed in Step 3? | Notes |
|----------------------|---------------------|-------|
| Memory data visibility permissions | **NO** → Issue #3 | John confirmed roles. Needs 1 line in EI-5. |
| Admin mobile strategy | **YES** ✅ | Platform Strategy 4-breakpoint table covers all apps |
| i18n / language strategy | **NO** → Issue #4 | Platform table missing language row |
| Overall keyboard nav strategy | **PARTIAL** | "마우스/키보드 우선" stated. Per-feature a11y in CSMs missing (Issue #1). |
| n8n mid-execution resume | **NO** | Still Sprint 2 implementation detail. Acceptable. |

---

## Summary

**7.60/10 PASS** — Step 3 Core Experience is solid. Defining Experience and Platform Strategy are excellent. EI and EP sections demonstrate deep understanding of the product. CSM tables are well-structured and testable.

**Primary concern (Issue #1):** CSM tables will become QA test specs. Without a11y rows, accessibility testing gets skipped. This is the single most impactful fix — adds ~5 rows total across 5 CSMs.

**Secondary concerns:** React Router version is a simple text fix (Issue #2). EP-5 PRD false citation is 2 words to change (Issue #7). Memory visibility is 1 line (Issue #3). i18n is 1 table row (Issue #4). All low-effort, high-value fixes.

**Total: 7 issues** (1 high, 3 medium, 3 low)

---

## R2 Verification (14 fixes applied)

### Issue-by-Issue Resolution Check

| # | R1 Issue | Severity | Fix Ref | Status | Evidence |
|---|----------|----------|---------|--------|----------|
| 1 | a11y rows in 5 CSMs | HIGH | #12 | **RESOLVED** | CSM-1 L379: aria-live + WebGL fallback. CSM-2 L393: keyboard Arrow keys + role="slider" + aria-valuemin/max/now. CSM-3 L404: screen reader + bell badge aria-label. CSM-4 L416: Wizard keyboard + focus move + progress aria-valuenow. CSM-5 L428: keyboard nav (n8n editor excluded). |
| 2 | React Router v6→v7 | MEDIUM | #1 | **RESOLVED** | L320: "React Router v7 (`react-router-dom ^7.13.1`)" ✅ |
| 3 | Memory data visibility | MEDIUM | #14 | **RESOLVED** | EI-5 L363: "Admin = 전체 에이전트 Reflection 열람, CEO = 자사 에이전트만, 일반 직원 = 접근 불가" ✅ |
| 4 | i18n / language | LOW | deferred | **ACCEPTED** | Deferred to Step 5+. Korean-only v3 launch — low risk. |
| 5 | Concurrent editing | LOW | deferred | **ACCEPTED** | Deferred to Step 5+. EP-2 now has NEXUS undo/redo safety net (L448) which partially mitigates. |
| 6 | Rate limit UX | LOW | deferred | **ACCEPTED** | Deferred to Step 5+. |
| 7 | EP-5 PRD false citation | MEDIUM | #2 | **RESOLVED** | L469: "(v3 UX 신규 형식 — XXX=모듈 코드, NNN=에러 번호)" — PRD attribution removed, properly labeled as new UX format. |

### Bonus Improvements (from other critics, verified)

| Fix | Source | Quality |
|-----|--------|---------|
| State management row (Zustand 5 + React Query 5) | dev #3 | L300: Correct per architecture. Fills Platform Strategy gap. |
| Tailwind breakpoint customization note | dev #4 | L312: Clear warning about non-default md/xl. Prevents config error. |
| fps transition debounce (500ms + matchMedia) | dev #5 | L314: Clean solution for resize boundary. |
| Secretary misroute recovery UX | john #7 | L261-265: Excellent — agent tag, re-route button, misroute report, auto-improvement pattern. |
| NEXUS undo/redo safety net | winston #10 | L448: Confirm modal + Ctrl+Z (10 actions) + Soul diff preview. |
| FR-MKT pipeline split in EI-3 | winston #11 | L342-348: General (≤10min) vs marketing (≤30min, 6-step) clear separation. |
| soul-enricher.ts source clarification | john #6 | L331, L361: PRD §soul-enricher cited with line refs. |

### R2 Dimension Scores (Critic-B Weights)

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|----|----|--------|----------|----------|
| D1 Specificity | 9 | **9**/10 | 10% | 0.90 | Maintained. fps debounce (500ms), matchMedia specifics, misroute "3회+" threshold added. |
| D2 Completeness | 7 | **9**/10 | **25%** | 2.25 | a11y rows in all 5 CSMs ✅. Memory visibility codified ✅. State management added ✅. Secretary misroute recovery ✅. Marketing pipeline split ✅. Only i18n deferred. |
| D3 Accuracy | 7 | **9**/10 | 15% | 1.35 | React Router v7 fixed ✅. EP-5 PRD citation fixed ✅. soul-enricher.ts properly sourced with PRD lines ✅. Zustand 5/React Query 5 verified vs architecture ✅. |
| D4 Implementability | 8 | **9**/10 | 10% | 0.90 | Tailwind config note added. fps debounce is copy-pasteable. Misroute UX has clear component spec. NEXUS undo stack (10 actions) is concrete. |
| D5 Consistency | 9 | **9**/10 | 15% | 1.35 | No new inconsistencies. All fixes align with Step 2 and architecture. Memory visibility matches John's cross-talk. |
| D6 Risk Awareness | 7 | **8**/10 | **25%** | 2.00 | a11y criteria in CSMs = testable accessibility risk coverage ✅. Secretary misroute = routing failure UX ✅. NEXUS undo = destructive action safety ✅. Low items deferred (concurrent edit, rate limit). |

### **R2 Weighted Average: 8.75/10 ✅ PASS**

**Improvement: 7.60 → 8.75 (+1.15)**

All 4 non-deferred issues resolved. 3 low-priority items appropriately deferred. Bonus fixes from other critics significantly improved completeness and implementability.
