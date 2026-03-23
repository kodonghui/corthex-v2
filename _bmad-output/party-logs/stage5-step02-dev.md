# Critic-Dev Review — Step 2: Discovery (UX Design Specification)

**Reviewer:** Amelia (Dev Critic)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 23-217
**Date:** 2026-03-23
**Focus:** Implementation feasibility, component architecture, CSS/framework patterns, performance

---

## Dimension Scores

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| D1 Specificity | 8/10 | 15% | Hex codes (`#faf8f5`, `#283618`, `#606C38`), bundle limits (≤200KB gzip), performance targets (FCP ≤3s), persona ages/roles, DB column names (`personality_traits JSONB`), aria attributes all specified. DC-2 cognitive overload section is the weak spot — "부서별 방 분리 또는 미니맵 도입" lacks threshold triggers (at what agent count? what room capacity?). |
| D2 Completeness | 7/10 | 15% | All 4 required sections present (Executive Summary, Target Users, Design Challenges, Design Opportunities). 6 DCs + 5 DOs is thorough. **Missing:** (1) Empty/loading states for DC-4 — what does Dashboard show Day 1 before any Reflections exist? (2) Error states beyond DC-5 n8n — what about /office WebSocket failure, Big Five save failure? (3) Secondary user section is one paragraph — no friction points or UX considerations identified. |
| D3 Accuracy | 9/10 | **25%** | Cross-verified against architecture.md and design-tokens.md: hex values match (`#faf8f5`, `#283618`, `#606C38`), `personality_traits JSONB` matches D33 schema, 4-layer sanitization (PER-1) matches architecture line 88, n8n Hono reverse proxy matches architecture line 86, `/ws/office` WebSocket matches architecture line 85, PixiJS ≤200KB matches NFR. **One inaccuracy:** "74페이지" (line 179) — `project-context.yaml` says `frontend_pages: 71`. Admin 29 + CEO 43 = 72 including v3 additions. The number 74 is unsourced. |
| D4 Implementability | 7/10 | **20%** | Layer table (line 31-36) maps cleanly to sprint order — dev can see what to build when. Big Five slider spec (DC-3) includes `aria-valuenow/min/max`, preset concept, time targets (≤30s preset, ≤2min manual). n8n proxy routing (`/admin/n8n/*`, `/admin/n8n-editor/*`) is actionable. **Missing:** (1) No component count estimate — how many new React components for PixiJS canvas, Big Five editor, n8n management, memory reflection UI? (2) No state management pattern guidance (React context? Zustand? per-page local?). (3) FCP ≤3s for PixiJS — unclear if this means shell paint or canvas-with-characters paint. These ambiguities would block a dev from starting without follow-up questions. |
| D5 Consistency | 9/10 | 15% | "Controlled Nature" philosophy, "Sovereign Sage" palette name, hex codes, sprint order — all consistent with architecture.md and design-tokens.md. Onboarding flow (Admin-first → CEO) matches architecture's "Admin 설정 완료 후에만 접근 가능". 5→1 theme consolidation matches architecture direction. **Note:** PRD line 1036 marks old "Sovereign Sage (slate-950 + cyan-400)" as 폐기 — the name reuse for the new cream/olive palette is correct per design-tokens.md §1 but could confuse readers who recall the v2 definition. Minor. |
| D6 Risk | 7/10 | 10% | DC-1 PixiJS accessibility (canvas + aria-live text alternative) is a real risk correctly identified. DC-6 ESLint enforcement for hardcoded colors is a good tooling call. DC-5 n8n Docker failure path included. **Missing:** (1) PixiJS 8 bundle tree-shaking risk — PixiJS v8 modular imports are still maturing; if tree-shaking fails, 200KB limit is easily blown. (2) No mention of mobile/tablet PixiJS performance risk beyond "비활성 → 리스트 뷰" — what about low-end desktop? (3) n8n Docker memory (2GB cap per architecture) competing with Node server on same host — resource contention risk unmentioned. |

---

## Weighted Average

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 8 | 0.15 | 1.20 |
| D2 | 7 | 0.15 | 1.05 |
| D3 | 9 | 0.25 | 2.25 |
| D4 | 7 | 0.20 | 1.40 |
| D5 | 9 | 0.15 | 1.35 |
| D6 | 7 | 0.10 | 0.70 |
| **Total** | | | **7.95/10 PASS** |

---

## Issue List (Priority Order)

### Must Fix (blocks pass confidence)

1. **[D3 Accuracy] "74페이지" unsourced** — `project-context.yaml` line 73: `frontend_pages: 71`. Admin 27+2=29, CEO 42+1=43, total=72. Fix to correct number with source citation.

2. **[D4 Implementability] FCP ≤3s metric ambiguity** — Line 96/197: "FCP ≤ 3초". For a PixiJS canvas with WebSocket real-time data, clarify: is this First Contentful Paint (loading shell renders) or First Meaningful Paint (pixel characters visible + WS connected)? Architecture NFR says "FCP ≤3초" but implementation strategy differs drastically between the two interpretations. Recommend: "FCP (shell + static layout) ≤ 1.5s, Time-to-Interactive (characters visible + WS streaming) ≤ 3s".

### Should Fix (improves quality)

3. **[D2 Completeness] DC-4 empty state missing** — Day 1: zero Reflections exist, zero performance data. Dashboard "이번 주 Reflection N건" widget shows "0건". What's the empty state UX? "아직 반성 데이터가 없습니다. 첫 태스크 완료 후 자동 생성됩니다" placeholder? Without this, dev will invent their own copy.

4. **[D1 Specificity] DC-2 lacks agent count thresholds** — "20명 이상 시" is mentioned as the problem trigger but the solution ("방 분리 또는 미니맵") has no decision criteria. Recommend: ≤10 agents = single view, 11-30 = department rooms with minimap, 30+ = minimap + search mandatory. These thresholds drive component architecture decisions.

5. **[D4 Implementability] No component count estimate** — v3 adds at minimum: PixiJS canvas (1 container + N sprite components), Big Five editor (slider ×5 + preset picker + preview), n8n management (list + detail + editor wrapper), memory reflection UI (timeline + chart + profile section). Rough count helps sprint planning. Even "~15-20 new components" is useful signal.

### Nice to Have

6. **[D6 Risk] PixiJS v8 tree-shaking maturity** — PixiJS 8 modular imports (`@pixi/sprite`, `@pixi/text`) are the path to ≤200KB, but v8's ESM tree-shaking has known issues with bundlers (Vite + Rollup). Worth noting as a Sprint 4 Go/No-Go checkpoint.

7. **[D5 Consistency] "Sovereign Sage" name reuse** — Old definition (slate-950/cyan-400) deprecated in PRD line 1036. New definition (cream/olive/sage) in design-tokens.md. Name collision won't confuse devs who read design-tokens.md, but a one-line note "이전 Sovereign Sage 테마와 무관 — 완전히 새로운 팔레트" would prevent future confusion.

---

## Cross-talk Notes

- **Quinn (QA) confirmed** DC-1 aria-live strategy: `aria-live="polite"` for normal 4-state transitions (idle/working/speaking/tool_calling), `aria-live="assertive"` + `role="alert"` for error state + WebSocket disconnect. Add `aria-atomic="true"` on status panel. This should be added to DC-1 UX response. (WCAG 2.1 SC 4.1.3)
- **Quinn (QA) aligned** on "74페이지" must-fix and DC-4 empty state gap. Reinforces testability concern — E2E tests need known empty state assertions for fresh accounts.
- **John (PM) confirmed** page count discrepancy. PRD line 160: ~67 pages (71 - 4 GATE removals) + 3 v3 new = **70 total**, not 74. Authoritative number + derivation needed. John also supports FCP split (TTI ≤3s = WOW moment metric) and DC-2 deferral to Step 3 with explicit "Step 3에서 확정" note. John's score: 7.7/10 PASS.

---

## Verdict (Round 1)

**7.95/10 — PASS**

Strong discovery document. Accurate cross-references to architecture, concrete hex/performance values, good accessibility awareness. The two must-fix items (page count accuracy, FCP metric clarification) are quick fixes. The empty state gap (DC-4) and component count absence are the main implementability concerns — both addressable in a single revision pass.

---

## Re-Score After Fixes (Round 2)

**19 fixes applied.** Re-read full updated file (lines 23-237). Verification:

### Fix Verification

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | "74페이지" → correct count | ✅ Fixed | DC-6 now "~67페이지" with derivation: "v2 71 - GATE 4 + v3 3 = ~67 (Brief §4 기준)". Sourced. |
| 2 | FCP ≤3s → split metric | ✅ Fixed | Line 96: "FCP (shell) ≤ 1.5초 + TTI (캐릭터 표시 + WS 연결) ≤ 3초". DO-1 also updated. |
| 3 | DC-4 empty state | ✅ Fixed | Line 172: Specific placeholder copy for 0 Reflections. Dashboard + Performance chart both covered. |
| 4 | DC-2 agent thresholds | ✅ Fixed | Lines 146-149: ≤10/11-30/30+ tiers with concrete strategies per tier. |
| 5 | DC-3 loading/error states | ✅ Fixed | Lines 160-161: Skeleton loaders, inline error, optimistic rollback. |
| 6 | Sovereign Sage clarification | ✅ Fixed | Line 40: "v2의 slate-950/cyan-400 Sovereign Sage와는 다른 새 팔레트" added. |
| 7 | Component count | ⏳ Deferred | To Step 3 — acceptable for Discovery phase. |
| 8 | PixiJS tree-shaking risk | ⏳ Deferred | To Sprint 4 Go/No-Go — acceptable. |

### New Additions (Beyond Fixes)

- **DC-1 expanded**: aria-live polite/assertive split (Quinn cross-talk), WebSocket retry (3s×5 max), loading state (progressive: tilemap→characters→WS), empty state (0 agents CTA).
- **DC-5 expanded**: n8n OOM detail, degraded mode (ARGOS independent), marketing automation UX flow (FR-MKT 6-step pipeline).
- **DC-7 new**: Server resource contention UX — WS 50conn limit exceeded → 429 message, graceful degradation 3-step (poll freq→fps→list view). Addresses Winston's Q3.
- **Solo founder case**: Line 122 — app switching nav + conditional onboarding skip. Good catch.
- **DC-4 expanded**: Admin Tier별 Reflection 한도 UI + 비용 모니터링 위젯. Slightly scope-creepy for Discovery but useful signal for Step 3.

### Updated Dimension Scores

| Dimension | R1 | R2 | Weight | Change Rationale |
|-----------|-----|-----|--------|-----------------|
| D1 Specificity | 8 | **9** | 15% | DC-2 thresholds, loading/error/empty states all have specific copy. Only minor vagueness remains (DC-7 "잠시 후"). |
| D2 Completeness | 7 | **9** | 15% | All empty/loading/error states added. DC-7 new. Solo founder case. Secondary user still thin but appropriate for v3 scope (no v3 features touch them). |
| D3 Accuracy | 9 | **9** | 25% | Page count now ~67 with derivation. CEO ~35 with FR-UX logic. Codebase check: `packages/app/src/pages/` has 31 entries (29 files + 2 dirs with sub-pages). -2 GATE + FR-UX consolidation + /office ≈ ~35 is reasonable with "~" qualifier. |
| D4 Implementability | 7 | **8** | 20% | Concrete loading/error/empty behaviors. FCP/TTI split actionable. DC-7 graceful degradation 3-step order. Component count deferred to Step 3 (acceptable). State management pattern still unaddressed — Step 3 territory. |
| D5 Consistency | 9 | **9** | 15% | All new additions consistent with architecture.md. Sovereign Sage clarified. |
| D6 Risk | 7 | **8** | 10% | DC-7 resource contention. PixiJS fallback. WS retry with max. n8n OOM scenario + ARGOS independence. |

### Weighted Average (Round 2)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 9 | 0.15 | 1.35 |
| D3 | 9 | 0.25 | 2.25 |
| D4 | 8 | 0.20 | 1.60 |
| D5 | 9 | 0.15 | 1.35 |
| D6 | 8 | 0.10 | 0.80 |
| **Total** | | | **8.70/10 PASS** |

### Remaining Minor Notes (non-blocking)

1. DC-4 lines 174-175: Admin Reflection 한도/비용 모니터링 is detailed feature design — slightly beyond Discovery scope. Not blocking; just note that Step 3 should own the final specification.
2. CEO ~35 page count: codebase shows 31 entries in `packages/app/src/pages/`. The derivation "v2 42 - GATE - FR-UX + /office = ~35" is logical but the "~" is doing work. Acceptable for Discovery.
3. DC-7 "잠시 후 다시 시도해주세요" — how long? 30s? 5min? Minor for Discovery, but Step 3 should specify retry interval for 429 response.

**Final verdict: 8.70/10 — PASS. Significant improvement from 7.95. All must-fix items resolved. Document is implementation-ready for Step 3 handoff.**
