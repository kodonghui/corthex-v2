# Critic-Dev Review — Step 3: Core Experience (UX Design Specification)

**Reviewer:** Amelia (Dev Critic)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 238-448
**Date:** 2026-03-23
**Focus:** Implementation feasibility, component architecture, CSS/framework patterns, performance

---

## Dimension Scores

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| D1 Specificity | 9/10 | 15% | FCP/TTI numbers (1.5s/3s), breakpoints with px values (sm<640, md 640-1023, lg 1024-1439, xl ≥1440), sidebar 280px/topbar 56px (matches codebase `index.css:39-41`), slider preset values (conscientiousness 90, openness 85, extraversion 30, agreeableness 60, neuroticism 20), onboarding ≤15min, n8n ≤10min, toast ≤500ms. One issue: EP-5 error format `[E-XXX-NNN]` is specific but the "PRD 패턴" reference is fabricated (see D3). |
| D2 Completeness | 8/10 | 15% | All 5 required sections present: Defining Experience, Platform Strategy, Effortless Interactions (5), Critical Success Moments (5), Experience Principles (5). Two core loops (CEO + Admin) fully mapped. **Missing:** (1) State management pattern — architecture line 311 specifies "Zustand (client) + React Query (server)" + "/office WebSocket = Zustand store". This was deferred from Step 2 to Step 3 but is still absent. (2) Keyboard accessibility strategy for NEXUS drag&drop and Big Five sliders (mentioned in DC-3 aria attributes but no core experience principle). |
| D3 Accuracy | 7/10 | **25%** | **Two concrete inaccuracies:** (1) Line 309: "React Router v6" — codebase has `"react-router-dom": "^7.13.1"`. **v7, not v6.** React Router v7 has significant API differences (loader/action patterns, `<Route>` vs file-based routing). (2) Line 447: `[E-XXX-NNN] 한국어 설명 + 다음 행동 (PRD 패턴)` — searched PRD for `E-\w+-\d`, `에러.*코드.*형식`, `error.*format`: **no matches**. This error code format does not exist in the PRD. It's either hallucinated or a forward reference to something undefined. **Verified accurate:** Secretary routing 80% (PRD:386 ✅), onboarding ≤15min (PRD:391 ✅), sidebar 280px (index.css:39 ✅), topbar 56px (index.css:41 ✅), React 19 (package.json ✅), WS 16+1 channels (architecture:85 ✅). |
| D4 Implementability | 7/10 | **20%** | Core loops give clear page priority guidance. CSM pass/fail tables are actionable. Breakpoint table maps to concrete responsive behavior. **Gaps:** (1) State management unspecified — dev needs to know: Zustand store for /office WS state, React Query for API data, local state for forms. (2) Breakpoints (md=640, xl=1440) differ from Tailwind defaults (md=768, xl=1280) — needs `theme.screens` customization in tailwind.config. Not mentioned. (3) 30fps/60fps per breakpoint is a new constraint not in architecture — needs PixiJS Ticker config or requestAnimationFrame throttling. What happens on window resize across lg↔xl boundary? Dynamic fps switch or fixed? (4) No component architecture sketch — how do 5 EIs map to components? |
| D5 Consistency | 8/10 | 15% | FCP/TTI 1.5s/3s consistent with Step 2 updates. Onboarding flow consistent. Design tokens (olive #283618, cream #faf8f5) consistent with design-tokens.md. WS channel count consistent with architecture. **Inconsistent:** React Router v6 vs codebase v7. Also: architecture line 311 specifies state management pattern but Platform Strategy doesn't reference it — internal inconsistency with project docs. |
| D6 Risk | 7/10 | 10% | CSM tables identify failure scenarios with specific thresholds. EP-5 "Safe to Fail" is a good principle. WS auto-reconnect (3s×5) specified. n8n healthcheck interval (30s) specified. **Missing:** (1) WebGL unsupported browsers — PixiJS requires WebGL. What's the fallback? (caniuse: ~1.5% of users lack WebGL 2). DC-1 has list view fallback but CSM-1 doesn't reference it. (2) 30→60fps dynamic switch on resize — potential jank during transition. (3) React 19 concurrent mode interaction with PixiJS imperative canvas rendering — potential reconciliation issues. |

---

## Weighted Average

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 8 | 0.15 | 1.20 |
| D3 | 7 | 0.25 | 1.75 |
| D4 | 7 | 0.20 | 1.40 |
| D5 | 8 | 0.15 | 1.20 |
| D6 | 7 | 0.10 | 0.70 |
| **Total** | | | **7.60/10 PASS** |

---

## Issue List (Priority Order)

### Must Fix

1. **[D3 Accuracy] React Router v6 → v7** — Line 309: "React Router v6, React.lazy 코드 분할". Codebase: `"react-router-dom": "^7.13.1"`. React Router v7 has loader/action patterns, different API surface. Fix to "React Router v7". File: `packages/app/package.json:35`.

2. **[D3 Accuracy] Error format "[E-XXX-NNN]" hallucinated** — Line 447: EP-5 references "PRD 패턴" for `[E-XXX-NNN]` error codes. Grep across full PRD: zero matches. Either (a) remove the PRD reference and note this as a new UX proposal, or (b) define the format here and mark it as "v3 신규 — Step 6 상세화". Don't cite a source that doesn't exist.

### Should Fix

3. **[D2/D4 Completeness/Implementability] State management pattern missing** — Architecture line 311: "Zustand (client) + React Query (server)". `/office` WebSocket state specifically assigned to Zustand store. This was deferred from Step 2 → Step 3, but Step 3 Platform Strategy still omits it. Add to Platform Strategy table: `| 상태 관리 | Zustand 5 (client) + React Query 5 (server) | 기존 v2 패턴 유지. /office WS 상태 = Zustand store 추가 |`

4. **[D4 Implementability] Tailwind breakpoint customization unmentioned** — Custom breakpoints (md=640, xl=1440) differ from Tailwind defaults (md=768, xl=1280). Needs `theme.screens` override in `tailwind.config.ts`. One line noting this prevents dev confusion.

5. **[D4 Implementability] fps breakpoint transition behavior** — Line 302-303: lg=30fps, xl=60fps. What happens when user resizes window from xl to lg? Instant fps drop? Debounced transition? This is a new UX decision not in architecture — needs clarification for PixiJS Ticker implementation.

### Nice to Have

6. **[D6 Risk] WebGL fallback in CSM-1** — DC-1 already defines list view fallback for mobile. CSM-1 should cross-reference: "WebGL 미지원 브라우저 → DC-1 리스트 뷰 fallback 적용".

7. **[D2 Completeness] Keyboard strategy for core interactions** — NEXUS drag&drop and Big Five sliders need keyboard alternatives. DC-3 has aria attributes but no EP-level keyboard principle. Consider adding to EP-1 or as note: "모든 시각적 인터랙션에 키보드 대안 제공 (WCAG 2.1 SC 2.1.1)".

---

## Cross-talk Notes

- **React Router v7 vs v6**: This is a factual error verifiable from `package.json:35`. All critics should check their own docs for this reference.
- **State management gap**: Architecture explicitly assigns Zustand for /office WS state. This is the most implementation-critical omission — without it, a dev would have to read architecture.md to learn the pattern. Core Experience should be self-sufficient for implementation planning.
- **EP-5 error format**: Hallucinated PRD reference is an auto-fail candidate under rubric "존재하지 않는 API/파일/함수를 참조". I'm NOT triggering auto-fail because: (a) the error format itself is reasonable as a UX proposal, and (b) the issue is the source citation, not the content. **Quinn (QA) concurs**: false attribution ≠ dependency hallucination. D3 penalty, not auto-fail override.
- **fps transition testability**: Quinn flags that E2E testing fps at viewport boundaries is fragile without defined behavior. Recommend: `matchMedia` listener + 500ms debounce before PixiJS Ticker reconfiguration. This makes the behavior deterministic and testable (Playwright viewport resize + wait 500ms + measure).
- **John (PM) flagged `soul-enricher.ts`**: Verified — `soul-enricher.ts` does NOT exist in codebase. Current v2 file is `engine/soul-renderer.ts`. However, architecture.md lines 88/169/226 explicitly define `services/soul-enricher.ts` as a **new v3 Sprint 1+3 file**. The UX doc (EI-1, EI-5) references it consistently with architecture, not current code. **Not an accuracy error** — but adding "(v3 신규, Sprint 1)" qualifier would prevent confusion for devs reading the spec against current codebase.
- **Quinn-2 (QA) flagged concurrent editing**: Two Admins editing same Soul — last-write-wins vs optimistic locking. Implementation detail but valid edge case. Also: rate limiting UX (10 msg/s) with no surface for rapid slider/Soul saves. Both good implementation notes for Step 6+.
- **Quinn-2 (QA) confirmed** EP-5 auto-fail ruling: NO. Agrees `[E-XXX-NNN]` is format attribution, not API/file/function reference. Quinn-2 D3 drops 8→7, total 7.75→7.60 — converges exactly with my score.
- **Winston (Architect) on 30/60fps**: **New constraint not in architecture.md** — no NFR backing. Concerns: (1) 30fps may be too low for 5-state animations (typing/speech bubbles look choppy), suggests 45fps lower bound. (2) Resize boundary undefined = visible stutter risk. (3) VPS CPU budget on 4-core ARM64 needs benchmarking. **Recommends**: either remove fps split (defer to Sprint 4 benchmarks) or add as architecture decision with resize spec. This upgrades my should-fix #5 to **should-fix with architect backing**.
- **Winston-2 (Architect) questions**: (1) NEXUS undo/redo for "저장 즉시 반영" — if v2 has it, spec should reference; if not, needs speccing. (2) soul-enricher.ts failure path (pgvector timeout) — proceed with base Soul or error out? Affects EI-1 "instant behavior change" promise. Both are strong implementation edge cases for sally.

---

## Verdict (Round 1)

**7.60/10 — PASS (marginal)**

Good structure — 5 EIs, 5 CSMs, 5 EPs are well-organized and mostly concrete. CEO/Admin core loops are clear and actionable. CSM pass/fail tables are dev-friendly. Two accuracy issues (Router version, error format citation) pull D3 down. State management omission is the biggest implementability gap. Fixes are straightforward — should bump to 8.0+ range.

---

## Re-Score After Fixes (Round 2)

**14 fixes applied.** Re-read updated sections. Verification:

### Fix Verification

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | React Router v6 → v7 | ✅ Fixed | Line 320: "React Router v7 (`react-router-dom ^7.13.1`)" — exact version cited. |
| 2 | EP-5 "(PRD 패턴)" → v3 UX 신규 | ✅ Fixed | Line 469: "(v3 UX 신규 형식 — XXX=모듈 코드, NNN=에러 번호)". False attribution removed, format defined. |
| 3 | State management in Platform Strategy | ✅ Fixed | Line 300: "Zustand 5 (클라이언트) + React Query 5 (서버) \| Architecture §311 기준. `/office` WS = Zustand store, API 데이터 = React Query 캐시". Exact architecture reference + per-feature store assignment. |
| 4 | Tailwind breakpoint customization | ✅ Fixed | Line 312: explicit note — md=640 ≠ default 768, xl=1440 ≠ default 1280, `theme.screens` 필수. |
| 5 | fps transition behavior | ✅ Fixed | Line 314: "500ms debounce 후 전환. PixiJS Ticker `maxFPS`를 `matchMedia('(min-width: 1440px)')` 리스너로 제어." Deterministic, testable. |

### Bonus Fixes (from other critics)

- EP-2 line 448: NEXUS undo added — "Ctrl+Z undo (최근 10회 액션 스택)". Addresses Winston-2's undo/redo gap. Confirmation modal for destructive actions (agent move/dept delete). Soul diff preview before save. Good safety net for "저장 즉시 반영" promise.

### Updated Dimension Scores

| Dimension | R1 | R2 | Weight | Change Rationale |
|-----------|-----|-----|--------|-----------------|
| D1 Specificity | 9 | **9** | 15% | Was already strong. New additions (matchMedia, debounce 500ms, maxFPS, Ticker) add implementation specificity. |
| D2 Completeness | 8 | **9** | 15% | State management added. NEXUS undo/redo added (10-action stack). Tailwind config note added. Only remaining gap: keyboard a11y principle (nice-to-have). |
| D3 Accuracy | 7 | **9** | 25% | Both inaccuracies fixed: Router v7 with exact version, EP-5 false attribution removed. All verifiable references now accurate. |
| D4 Implementability | 7 | **9** | 20% | State management pattern now actionable (Zustand for WS, React Query for API). fps transition has concrete implementation (matchMedia + debounce + Ticker.maxFPS). Tailwind config requirement explicit. Undo spec (10-action stack) is implementable. |
| D5 Consistency | 8 | **9** | 15% | Router version now matches codebase. State management now matches architecture. All internal references consistent. |
| D6 Risk | 7 | **7** | 10% | Unchanged — WebGL fallback still only cross-referenced implicitly. Winston's 30fps animation quality concern (may be too low for 5-state animations) not addressed — deferred to Sprint 4 benchmarks. Acceptable for UX spec scope. |

### Weighted Average (Round 2)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 9 | 0.15 | 1.35 |
| D3 | 9 | 0.25 | 2.25 |
| D4 | 9 | 0.20 | 1.80 |
| D5 | 9 | 0.15 | 1.35 |
| D6 | 7 | 0.10 | 0.70 |
| **Total** | | | **8.80/10 PASS** |

### Remaining Minor Notes (non-blocking)

1. Winston flags 30fps may be too low for 5-state sprite animations — validate in Sprint 4 benchmark. The debounce spec is correct regardless of final fps values.
2. Keyboard accessibility principle still missing from EPs — addressed implicitly via DC-3 aria attributes and WCAG references, but no explicit EP. Minor for Core Experience step.
3. WebGL fallback cross-reference in CSM-1 still implicit (DC-1 has it, CSM-1 doesn't cite it). Non-blocking.

**Final verdict: 8.80/10 — PASS. Significant improvement from 7.60. All must-fix and should-fix items resolved. The accuracy fixes (Router v7, EP-5 attribution) and state management addition bring D3 and D4 from marginal to strong. Document is implementation-ready for Step 4.**
