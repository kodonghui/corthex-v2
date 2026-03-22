# Stage 2 Step 12 — Quinn (Critic-B) Review: Non-Functional Requirements

**Critic:** Quinn (QA + Security)
**Date:** 2026-03-22
**Section:** PRD lines 2499–2647 (## Non-Functional Requirements)
**Grade:** A (2사이클 필수, avg ≥ 8.0)
**Cycle:** 1

---

## Rubric (Critic-B Weights)

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| D1 Specificity | 10% | 8.5 | 0.85 |
| D2 Completeness | 25% | 8.0 | 2.00 |
| D3 Accuracy | 15% | 8.0 | 1.20 |
| D4 Implementability | 10% | 8.5 | 0.85 |
| D5 Consistency | 15% | 7.5 | 1.125 |
| D6 Risk | 25% | 7.5 | 1.875 |
| **Total** | **100%** | | **7.90** |

**Verdict (pre-cross-talk): ✅ PASS (7.90 ≥ 7.0) — 5 issues (0M + 4m + 1low). Below Grade A target (8.0), R2 needed.**

---

## Strengths

1. **Comprehensive 12-category structure** — 74 active NFRs covering performance, security, scalability, availability, accessibility, data integrity, external deps, operations, cost, logging, browser compat, and code quality. Well-organized.
2. **Measurement methods specified** — All 17 performance NFRs have specific tools: Lighthouse, Chrome DevTools, Vite build, E2E timers. Testable by CI/CD.
3. **Priority system accurate** — 21 P0, 42 P1, 10 P2, 1 CQ, 2 deleted = 74 active. Count verified ✅. P0 items correctly mapped to release blockers + Sprint gates.
4. **NFR-S9 n8n 8-layer security** — All 8 N8N-SEC layers with specific descriptions. "100% 통과" quality target. 확정 결정 #3 referenced. Best security NFR in the section.
5. **GATE deletions clean** — NFR-S7 (cost-tracker) and NFR-D7 (cost records) properly struck through with GATE date and reason.
6. **FR cross-references present** — NFR-SC8→FR-OC2, NFR-A6→FR-OC10, NFR-A7→FR-OC9, NFR-D8→FR-MEM13. Step 11 FR additions properly linked.
7. **Proactive fixes verified** — NFR-SC8 (50/co NRT-5), NFR-S9 (8-layer), NFR-D8 (Option B + MEM-7). All correct.
8. **v3 Sprint distribution balanced** — Sprint 1: 2, Sprint 2: 4, Sprint 3: 4, Sprint 4: 6 NFRs. No Sprint is overloaded.

---

## Issues (5 total: 0M + 4m + 1low)

### MINOR (4)

**m1: No NFR for MEM-6 observation sanitization quality**

NFR-S8 covers PER-1 personality sanitization: "4-layer 100% 통과 (Key Boundary → API Zod → extraVars strip → Template regex)".

But there is NO NFR-S* for MEM-6 observation sanitization quality. FR-MEM12 (Step 11 Fix 1) defines the 4-layer defense mechanism, but the NFR section doesn't define what "passing" means for MEM-6.

- Go/No-Go #9 (L602): "10KB cap + control char strip + prompt hardening + content classification — E2E 검증"
- But #9 says "E2E 검증" — what counts as passing? How many adversarial payloads? What blocking rate?
- NFR-S8 provides the template: "4-layer 100% 통과"
- MEM-6 should have the same pattern: quality measurement standard for the #1 security risk

**Same propagation failure pattern from Step 11** — FR-MEM12 added to FRs but quality metric not propagated to NFRs.

**Impact:** Defense mechanism exists (FR-MEM12) but no quality standard to test against. Sprint 3 Go/No-Go #9 has no NFR-level pass/fail criterion.

**Fix:** Add NFR-S10: "MEM-6 observation sanitization 4-layer 방어 100% 통과 — N종 adversarial payload (10KB 초과, 제어문자, 프롬프트 주입, 악성 분류) 100% 차단 (Go/No-Go #9, FR-MEM12 기능 기준). PER-1 (NFR-S8)과 별도 공격 표면"

**m2: NFR-P4 conflates Brief §4 hub bundle with Go/No-Go #5 PixiJS bundle**

NFR-P4: "허브 ≤ 200KB gzip **(Brief §4, Go/No-Go #5)**, 관리자 ≤ 500KB gzip"

But Go/No-Go #5 (L598) is specifically: "**PixiJS 번들 크기** | < 200KB gzipped (204,800 bytes) CI 게이트 | **Sprint 4** | #5"

Go/No-Go #5 = PixiJS bundle, NOT hub bundle. The hub 200KB comes from Brief §4 only.
NFR-P13 correctly references Go/No-Go #5 for PixiJS: "/office FCP ≤ 3초, PixiJS 번들 ≤ 200KB gzipped **(Go/No-Go #5)**".

The cross-reference error could mislead: developers might think Go/No-Go #5 requires hub ≤ 200KB.

**Fix:** NFR-P4: "(Brief §4, Go/No-Go #5)" → "(Brief §4)" — Go/No-Go #5 is PixiJS only

**m3: NFR-A5 vs FR-PERS9 ARIA attribute incomplete/inconsistent**

| Attribute | NFR-A5 | FR-PERS9 | Purpose |
|-----------|--------|----------|---------|
| aria-valuenow | ✅ | ✅ | Current numeric value |
| aria-valuetext | ❌ | ✅ | Human-readable value meaning |
| aria-label | ✅ ("특성 설명") | ❌ | Control name |
| Arrow keys / ←→ | ✅ | ✅ | Keyboard navigation |

Both attributes are needed for full accessibility:
- aria-label: names the slider ("Extraversion")
- aria-valuetext: describes the current value ("90: 체크리스트 자동 생성")

Each section mentions one but not the other. Go/No-Go L601 mentions "aria-valuenow + 키보드 조작" only.

**Fix:** NFR-A5에 aria-valuetext 추가: "aria-valuenow + **aria-valuetext** + Arrow keys + 특성 설명 aria-label"

**m4: NFR-COST2 Voyage AI scope covers knowledge docs only, not observations/reflections**

NFR-COST2: "Voyage AI Embedding **월 $5 이하 (문서 1,000건 기준)**" — Phase 4, P2.

But observations (FR-MEM2) and reflections (FR-MEM5) ALSO use Voyage AI embedding from Sprint 3. Each observation gets embedded once (voyage-3, 1024d). With active agents generating observations daily, this is a non-trivial cost that starts 1 Sprint earlier than NFR-COST2's Phase 4 scope.

Integration table L1904 confirms: "Memory Reflection 크론 | Voyage AI Embedding API (voyage-3, 1024d) | Sprint 3"

**Fix:** NFR-COST2 범위 확장: "Voyage AI Embedding 총 비용 — knowledge docs (Phase 4) + observations/reflections (Sprint 3) 포함. 월 $5 이하" with Phase updated to "Sprint 3~4"

### LOW (1)

**l1: Go/No-Go #14 Capability Evaluation has no NFR**
- L607: "동일 태스크 N≥3회 반복 시 3회차 재수정 ≤ 1회차의 50% (task corpus 3개)"
- Measurable quality criterion for agent memory learning effectiveness
- Arguably gate-only (tested once at sprint acceptance, not ongoing)
- Lower impact since gate definition itself is measurable with clear pass/fail
- Not an error; an observation.

---

## John's Checkpoint Verification

| # | Checkpoint | Verdict | Details |
|---|-----------|---------|---------|
| 1 | 확정 결정 정합 | ✅ | #2 NFR-SC9 2G ✅. #3 NFR-S9 8/8 ✅. #5 NFR-D8 30일 ✅. #10 NFR-SC8 50/co ✅. |
| 2 | FR ↔ NFR 연동 | ⚠️ | FR-MEM12 (MEM-6 defense) has no quality NFR. FR-MEM13→NFR-D8 ✅. FR-MEM14→NFR-COST3 ✅. FR-N8N4→NFR-S9 ✅. FR-PERS9→NFR-A5 (partial). |
| 3 | 측정 가능성 | ✅ | All performance NFRs have tools + targets. Security NFRs have pass/fail criteria. Cost NFRs have dollar limits. |
| 4 | 우선순위 정합 | ✅ | 21 P0 verified. P0-Phase alignment correct (Sprint-specific P0s match Sprint scope). |
| 5 | Go/No-Go 연동 | ⚠️ | #5 NFR-P13 ✅ (but NFR-P4 conflates). #7 NFR-COST3 ✅. #9 no quality NFR ❌. #11 FR-level only. #14 no NFR. |
| 6 | GATE 결정 반영 | ✅ | NFR-S7, NFR-D7 삭제 clean with GATE date |
| 7 | 수치 일관성 | ✅ | 200KB, 50/co, 2G, $0.10/day all match FR + Integration + Go/No-Go sections |
| 8 | v3 NFR 완전성 | ⚠️ | 16 v3 NFRs across 4 Sprints. MEM-6 quality NFR missing. COST2 scope doesn't include Sprint 3. |

---

## Score Rationale (pre-cross-talk)

- **D1 (8.5)**: NFRs are specific with measurable targets and tools. N8N-SEC 8-layer detailed. Performance targets with percentiles. Priority counts verified.
- **D2 (8.0)**: 74 active NFRs comprehensive. 12 categories well-structured. BUT MEM-6 observation sanitization has no quality NFR (NFR-S8 exists for PER-1 but not MEM-6). COST2 scope limited to Phase 4 knowledge docs. Go/No-Go #14 unrepresented.
- **D3 (8.0)**: Dollar amounts, connection limits, performance targets all accurate. Sprint/Phase assignments correct. BUT NFR-P4 cross-references Go/No-Go #5 incorrectly (PixiJS ≠ hub). NFR-A5 ARIA attributes don't match FR-PERS9.
- **D4 (8.5)**: NFRs are testable — performance has Lighthouse/DevTools, security has pass/fail, cost has dollar limits. Priority system enables sprint-level planning.
- **D5 (7.5)**: Most NFRs consistent with FRs. BUT NFR-P4 Go/No-Go cross-ref error. NFR-A5/FR-PERS9 ARIA mismatch. NFR-COST2 Phase 4 scope vs Sprint 3 embedding usage. NFR-S8 pattern (quality metric) not propagated to MEM-6.
- **D6 (7.5)**: MEM-6 (most dangerous injection path, Go/No-Go #9) has defense in FR but no quality measurement in NFR. Without quality standard, Sprint 3 gate verification has no pass/fail definition. COST2 uncovered for Sprint 3. Same propagation failure pattern: Step 11 fixed FR, Step 12 didn't propagate to NFR.

---

## Questions for Cross-Talk

1. **m1 severity**: MEM-6 quality NFR missing — is the defense mechanism in FR-MEM12 sufficient without a measurable quality standard in NFR? Go/No-Go #9 says "E2E 검증" but doesn't define pass criteria.
2. **m4 impact**: Voyage AI embedding cost for observations/reflections (Sprint 3) — is the current $5/month knowledge docs budget (Phase 4) sufficient to cover all embedding costs? Or does Sprint 3 introduce a new cost line?
3. **NFR-P4 cross-ref**: Should the hub 200KB target reference only Brief §4, or is Go/No-Go #5 intentionally applied to both hub AND PixiJS bundles?

---

## Cross-Talk Results (Post R1)

### Consensus

| Issue | Quinn | Winston | Sally | Bob | Consensus |
|-------|-------|---------|-------|-----|-----------|
| m1 MEM-6 no quality NFR | MINOR | MINOR (M1) | MINOR (m1) | should-fix #1 | **4/4 unanimous** |
| m2 NFR-P4 cross-ref | MINOR | — | — | — | Quinn only |
| m3 NFR-A5 ARIA | MINOR | question to Sally | MINOR (m2) | question to Sally | 3/4 (Quinn+Sally+Winston question) |
| m4 NFR-COST2 scope | MINOR | supports (M2 SC7) | — | should-fix #2 | 3/4 |

### Cross-Talk Questions Resolved

1. **m1 MEM-6 quality NFR** → All 4 critics agree: NFR-S10 needed. Winston confirms "3대 공격 표면 중 가장 위험한데 유일하게 NFR 품질 게이트가 없다." Bob confirms Sprint 3 P0 underrepresentation (only 1 P0 vs 5 gates). Three sanitization chains should all have NFR quality targets:
   - PER-1: NFR-S8 ✅
   - MEM-6: ❌ missing → NFR-S10
   - TOOLSANITIZE: FR-level (acceptable for now)

2. **m4 NFR-COST2** → Bob confirms Phase "4" doesn't match Step 9 Fix 9 "Pre-Sprint→유지". Winston supports with M2 (NFR-SC7 pgvector memory should also be Sprint 3).

3. **m3 NFR-A5 ARIA** → Sally confirms both aria-label AND aria-valuetext needed. Winston asked Sally same question. Complementary attributes: aria-label (control name) + aria-valuetext (value meaning).

### Noted but Not Adopted

- **Sally m3 (Go/No-Go #13 CEO daily task)**: L606 "CEO 일상 태스크 5분 완료" not in NFRs. Acknowledged but not adopted — Go/No-Go gate definition sufficient for one-time acceptance test.
- **Winston M2 (NFR-SC7 Phase)**: Sprint 3 pgvector validation. Valid concern but SC7 says Phase 4 for the full ceiling; Sprint 3 observation volumes are early-stage. Noted for implementation monitoring.
- **Bob Q (TOOLSANITIZE quality target location)**: Quality metric in FR vs NFR inconsistency. Acknowledged — QA plan should consolidate. Not a fix target for this review.

### Updated Issue Count (post-cross-talk)

**5 issues: 0M + 4m + 1low** (unchanged — no new findings adopted)

**Verdict (post-cross-talk): ✅ PASS (7.90 ≥ 7.0) — R2 required for Grade A.**

---

## R2 Verification (Post-Fix)

### Fix Status — All 6 Issues

| # | Issue | Severity | Status | Line Evidence |
|---|-------|----------|--------|---------------|
| m1 | MEM-6 no quality NFR | MINOR | **FIXED** | L2538: NFR-S10 — MEM-6 4-layer 100% 통과 + 10종 adversarial 100% 차단. P0, Sprint 3. Go/No-Go #9 + 확정 #8. FR-MEM12 기준. PER-1 별개. |
| m2 | NFR-P4 Go/No-Go #5 cross-ref | MINOR | **FIXED** | L2510: "(Brief §4)" only. "Go/No-Go #5는 PixiJS 번들 전용 (NFR-P13)" clarification added. |
| m3 | NFR-A5 ARIA gap | MINOR | **FIXED** | L2570: aria-valuenow + aria-valuetext (값 의미) + aria-label (특성명) + Arrow keys. FR-PERS9 정합 명시. |
| m4 | NFR-COST2 scope | MINOR | **FIXED** | L2616: "knowledge docs + observations/reflections 포함 (Sprint 3~4)". Phase "Pre-Sprint~Sprint 4". Go/No-Go #10 참조. |
| — | NFR-SC7 Phase (Winston) | — | **FIXED** | L2550: Phase "Sprint 3~4". Sprint 3 HNSW 측정 시작 명시. |
| — | NFR-O11 CEO task (Sally) | — | **FIXED** | L2609: ≤ 5분, Go/No-Go #13. O7/O8 별개 명시. P1, 전체. |
| l1 | Go/No-Go #14 no NFR | LOW | Deferred | Gate-only criterion, acceptable. |

**Resolution: 6/6 fixes verified. 1 LOW deferred.**

### Priority Count Verification (R2)

| Priority | R1 | R2 | Verified |
|----------|-----|-----|---------|
| 🔴 P0 | 21 | 22 | ✅ (+NFR-S10) |
| P1 | 42 | 43 | ✅ (+NFR-O11) |
| P2 | 10 | 10 | ✅ |
| CQ | 1 | 1 | ✅ |
| 삭제 | 2 | 2 | ✅ |
| **활성** | **74** | **76** | ✅ (v2 58 + v3 18) |

### Three Sanitization Chains — NFR Quality Coverage (R2)

| Chain | FR | NFR | Quality Target | Status |
|-------|------|------|-------|--------|
| PER-1 | FR-PERS2 | NFR-S8 | 4-layer 100% 통과 | ✅ |
| MEM-6 | FR-MEM12 | **NFR-S10** | 4-layer 100% + 10종 100% 차단 | ✅ (NEW) |
| TOOLSANITIZE | FR-TOOLSANITIZE3 | FR-level | 10종 100% 차단 | ⚠️ acceptable |

### Confirmed Decisions Coverage (R2)

| # | Decision | NFR | Status |
|---|----------|-----|--------|
| 2 | n8n Docker 2G | NFR-SC9 | ✅ |
| 3 | n8n 8-layer | NFR-S9 | ✅ |
| 5 | 30-day TTL | NFR-D8 | ✅ |
| 8 | Obs Poisoning | NFR-S10 | ✅ (NEW) |
| 9 | Advisory lock | NFR-O10 | ✅ |
| 10 | WS limits | NFR-SC8 | ✅ |

### Dimension Scores (R2 [Verified])

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|-----|-----|--------|----------|----------|
| D1 Specificity | 8.5 | 9.0 | 10% | 0.90 | NFR-S10: 4-layer + 10종 adversarial targets. NFR-A5: 3 ARIA attributes with purpose. NFR-COST2: expanded scope with Sprint reference. |
| D2 Completeness | 8.0 | 9.0 | 25% | 2.25 | All 4 gaps filled. 76 active NFRs. 6/6 confirmed decisions. CEO daily task added. Priority summary updated. |
| D3 Accuracy | 8.0 | 9.0 | 15% | 1.35 | P4 cross-ref corrected. A5 ARIA matches FR-PERS9. COST2 Phase matches Step 9 Fix 9. Priority counts verified 22/43/10/1/2=76. |
| D4 Implementability | 8.5 | 9.0 | 10% | 0.90 | NFR-S10 testable with clear quality target. NFR-O11 specific user journey + time limit. All new NFRs follow established patterns. |
| D5 Consistency | 7.5 | 9.0 | 15% | 1.35 | All 4 consistency issues resolved. Three sanitization chains consistent. P4 corrected. A5/FR-PERS9 aligned. COST2/SC7 Phases updated. |
| D6 Risk | 7.5 | 9.0 | 25% | 2.25 | MEM-6 quality NFR (P0) has measurable pass/fail. COST2 covers Sprint 3. Sprint 3 P0 = 2 (COST3 + S10). No remaining security measurement gaps. |

### Weighted Average: 9.00/10

### Verdict

**[Verified] 9.00/10 — ✅ PASS (Grade A: ≥ 8.0)**

Score: 7.90 → **9.00**. All 6 fixes verified. MEM-6 propagation failure finally closed: Domain (Step 7) → Compliance (Step 9) → Go/No-Go (Step 5) → Must-Have (Step 10) → FR (Step 11) → NFR (Step 12). Three sanitization chains have consistent quality coverage. All confirmed decisions backed by NFRs.
