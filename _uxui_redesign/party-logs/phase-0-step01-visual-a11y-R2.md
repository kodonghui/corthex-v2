# Critic-B Review R2 — Step 0-1: Technical Spec

**Reviewer:** Marcus (Visual Hierarchy) + Quinn (WCAG Verification)
**Document:** `_uxui_redesign/phase-0-foundation/spec/technical-spec.md` (1651 lines, +481 from R1)
**Date:** 2026-03-23

---

## R1 Issue Resolution

| # | R1 Issue | Status | Notes |
|---|---------|--------|-------|
| 1 | Accessibility section missing | ✅ FIXED | Section 7.6 added (3 subsections: audit, ARIA map, fix list) |
| 2 | `agent_memories.embedding` hallucination | ✅ FIXED | Line 1060: column removed + explicit note at 1062 |
| 3 | Color migration risk absent | ✅ FIXED | Section 1.4 "Pre-Reset Baseline" + 7.11.3 60-30-10 analysis + 8.2 violations |
| 4 | JetBrains Mono CDN gap | ✅ FIXED | Line 31 fonts updated + line 33 explicit CDN gap note |
| 5 | Empty/Error/Loading states | ✅ FIXED | Section 2C (4 subsections, 12 empty states, 6 error types, 5 transitions) |
| 6 | Subframe ARIA dependency | ✅ FIXED | Section 7.5b: full 44-component inventory + migration plan + risk |
| 7 | ARIA live regions for WS | ⚠️ PARTIAL | 8 `aria-live` instances documented but no mapping to 16 WS channels |
| 8 | Typography scale analysis | ✅ FIXED | Section 7.11.2: flat hierarchy documented + Major Third recommendation |

**Resolution rate: 7/8 full, 1/8 partial**

---

## New Content Quality Assessment

### Section 7.6 Accessibility Baseline — STRONG
- Current state audit with quantified metrics (78 ARIA/26 files) ✅
- `prefers-reduced-motion` = 0 correctly flagged as critical ✅
- Contrast ratio for tertiary text (2.46:1 FAIL) accurate ✅
- 6 actionable Phase 1 fix items including `aria-current="page"` ✅
- **Issue:** Sidebar contrast listed as "~4.2:1 Marginal FAIL" (line 1489) — **INCORRECT.** ux-brand corrected to **6.63:1 (PASS)** in cross-talk. My calc: ~5.8:1. This is actually a PASS, not a fail. Conservative error (overcautious), not dangerous, but inaccurate.

### Section 2C Empty/Error/Loading — EXCELLENT
- 12 empty state contexts with redesign impact ratings ✅
- 6 error types including "no error boundary in CEO app" — excellent catch ✅
- Network offline handling gap identified ✅
- Transition states (pulse, delegation chain, progress bar) ✅

### Section 7.5b Subframe Inventory — COMPREHENSIVE
- All 44 components listed across 8 categories with @subframe/core dependency column ✅
- 4-phase migration plan ✅
- Risk: 40-component simultaneous failure ✅
- **Minor gap:** Which Subframe components provide internal ARIA (Dialog, Select, etc.) not explicitly called out as migration parity requirement

### Section 7.10 Bundle Size — GOOD
- Concrete figures: app 2.5MB, admin 2.4MB, server 15MB ✅
- Optimization targets with estimated savings ✅
- PixiJS ≤200KB gzip target ✅

### Section 7.12 Libre/Gestalt — STRONG
- 5 Gestalt principles with current state + redesign impact ✅
- Typography scale: flat hierarchy quantified (brand=body=nav at 14px) + recommendation ✅
- 60-30-10 analysis: accent over-represented at 25% — excellent finding ✅
- Design Masters reference table (Rams, Vignelli, Brockmann, Rand) ✅

### Section 8.2 Known Codebase Violations — VALUABLE
- Gemini API in server files with decision reference ✅
- 428 color-mix with action plan ✅
- Subframe deprecation with migration mandate ✅

---

## 차원별 점수 (R2)

| 차원 | R1 | R2 | Δ | 근거 |
|------|-----|-----|---|------|
| D1 구체성 | 8 | 8 | 0 | 유지. 새 섹션들도 구체적 (78 ARIA/26파일, 2.5MB 번들, 44 Subframe 컴포넌트). SNS/Trading 축약 미변경. |
| D2 완전성 | 6 | **8** | +2 | 접근성, empty/error/loading, Subframe 인벤토리, Libre/Gestalt, 번들 사이즈, 타이포 스케일 전부 추가. ARIA live region → WS 채널 매핑만 부분적. |
| D3 정확성 | 7 | **7** | 0 | `agent_memories.embedding` 수정 ✅. 그러나 sidebar contrast "~4.2:1 FAIL" 새로 추가 — 실제 6.63:1 PASS. 할루시네이션 수정 + 새 오류 = 상쇄. |
| D4 실행가능성 | 7 | **8** | +1 | Empty state 패턴, Subframe 마이그레이션 4단계 플랜, 타이포 스케일 추천 = 바로 실행 가능. |
| D5 일관성 | 8 | 8 | 0 | 유지. 폰트 현황 정리됨. 새 섹션이 기존 구조와 일관. |
| D6 리스크 | 5 | **7** | +2 | WCAG 위반 문서화, prefers-reduced-motion 크리티컬 갭, Subframe 40-컴포넌트 위험, Gemini 위반, 번들 최적화 타겟. WS 구현 리스크(jitter/max retry/JWT URL)만 미반영. |

---

## 가중 평균: 7.60/10 ✅ PASS

**산출:**
- D1: 8 × 0.10 = 0.80
- D2: 8 × 0.25 = 2.00
- D3: 7 × 0.15 = 1.05
- D4: 8 × 0.10 = 0.80
- D5: 8 × 0.15 = 1.20
- D6: 7 × 0.25 = 1.75
- **합계: 7.60**

---

## 잔여 이슈 (통과에 영향 없음, Phase 1 참고)

1. **[D3] Sidebar contrast 수정 필요** — line 1489: "~4.2:1 Marginal FAIL" → 실제 6.63:1 PASS. 보수적 오류지만 수정 권장.
2. **[D2] ARIA live region → WebSocket 채널 매핑** — 16개 WS 채널 중 어떤 것에 `aria-live` 필요한지 명시 필요 (activity-log, notifications, dashboard, budget-alert 최소 4개)
3. **[D6] WebSocket 구현 리스크 미반영** — tech-perf가 발견한 4개 리스크 (no max retry, no jitter, JWT in URL, per-tab connections)가 7.11 Performance Targets에 미반영. "Automatic with backoff" 한 줄만 존재.
4. **[D2] Modal focus trap** — 다수 모달 (agent create, dept cascade, debate create) 사용하나 focus trap 패턴이 접근성 섹션에 미포함

---

## Cross-talk 요약 (R2)

- **ux-brand**: Sidebar contrast 6.63:1 확인 → spec line 1489 수정 요청. Font strategy (Noto Serif KR → Phase 1 defer) 합의.
- **tech-perf**: WS 구현 리스크 4개는 잔여 이슈로 남음. Subframe 인벤토리 추가에 동의할 것으로 예상. 번들 2.5MB 베이스라인 포함 확인.

---

## R1 → R2 비교

| 지표 | R1 | R2 | 변화 |
|------|-----|-----|------|
| 문서 길이 | 1170 lines | 1651 lines | +481 (+41%) |
| 가중 평균 | 6.50 | **7.60** | +1.10 |
| 판정 | ❌ FAIL | **✅ PASS** | 통과 |
| Critical 이슈 | 5 | 0 | 전부 해결 |
| 잔여 이슈 | — | 4 (minor) | Phase 1 참고 |
