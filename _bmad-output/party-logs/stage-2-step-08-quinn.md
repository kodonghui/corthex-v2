# Stage 2 Step 08 — Quinn (Critic-B) Review: Innovation & Novel Patterns

**Critic:** Quinn (QA + Security)
**Date:** 2026-03-22
**Section:** PRD lines 1538–1775 (## Innovation & Novel Patterns)
**Grade:** B reverify
**Cycle:** 2 (R1: 7.00 → R2: 8.90)

---

## Rubric (Critic-B Weights)

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| D1 Specificity | 10% | 8.0 | 0.80 |
| D2 Completeness | 25% | 7.0 | 1.75 |
| D3 Accuracy | 15% | 7.0 | 1.05 |
| D4 Implementability | 10% | 8.0 | 0.80 |
| D5 Consistency | 15% | 7.0 | 1.05 |
| D6 Risk | 25% | 6.5 | 1.625 |
| **Total** | **100%** | | **7.075 ≈ 7.10** |

**Verdict (pre-cross-talk): ✅ PASS (7.10 ≥ 7.0) — borderline, 6 issues (2M + 4m)**

---

## Strengths

1. **Brief 3대 문제 → v3 혁신 매핑 (L1544-1548)** — Clear problem-solution traceability. Each v3 innovation maps to a specific user pain point.
2. **Competitor comparison tables** — 4 detailed tables (Soul vs CrewAI/LangGraph/AutoGen, Non-dev vs Dify/Coze, Memory vs AutoGen/CrewAI, n8n vs Zapier/Make) with specific differentiators.
3. **Verification tables (L1721-1751)** — Go/No-Go #1-8 covered with specific success criteria (80%+ Soul accuracy, ≤60s E2E, agent_memories 단절 0건).
4. **v2→v3 혁신 계층 table (L1550-1558)** — Clean layered view of how v3 innovations extend v2 foundation.
5. **User-felt vs Technical innovation (L1694-1713)** — Dual perspective ensures both CEO and dev teams understand the value. CEO-facing descriptions are concrete ("사무실이 살아있다", "슬라이더로 성격을 설정한다").
6. **Implementation patterns (L1641, L1662-1666, L1686)** — Code-level specificity for soul-enricher.ts, Option B, Hono proxy.
7. **Risk mitigation tables** — Both v2 (L1756-1762) and v3 (L1766-1774) with fallback strategies + Sprint + Go/No-Go references.

---

## Issues (6 total: 2M + 4m)

### MAJOR (2)

**M1: Innovation 7 (Memory) — Missing Observation Poisoning from risk AND verification tables**
- **Risk table (L1764-1774):** Lists 7 v3 risks but NONE about observation content poisoning (R10 🟠 High)
  - L1772: "Reflection 크론 LLM 비용 폭주" — cost risk ✅
  - L1774: "기존 agent_memories 데이터 단절" — regression risk ✅
  - But: **Observation poisoning (R10) — MISSING.** The attack chain: malicious observation → reflected=true → Reflection에 오염 데이터 → Soul에 주입 → 에이전트 행동 조작
- **Verification table (L1734-1741):** v3 Sprint 3 Memory verification references Go/No-Go #4 (Zero Regression) only. **Go/No-Go #9 (Observation Poisoning 4-layer)** — MISSING from verification.
  - Go/No-Go #9 (L464): "4-layer sanitization E2E 검증: 10종 adversarial payload 100% 차단"
  - This gate is defined in Exec Summary but NOT in the Innovation verification table
- MEM-6 was added in Step 7 specifically for this defense. Risk Registry R10 is 🟠 High. Go/No-Go #9 is Sprint 3 gate.
- **Impact:** Innovation section reader sees Memory's risks as "cost" and "regression" only. The most dangerous risk (content poisoning → agent behavior manipulation) is invisible.
- **Fix:**
  - Risk table: Add row: "Observation 콘텐츠 포이즈닝 (R10) | 4-layer sanitization (MEM-6): 10KB + 제어문자 + 하드닝 + 분류. 실패 시 observation 저장 차단 + Admin 알림 | Sprint 3 | #9"
  - Verification table: Add Sprint 3 row or merge with existing: "에이전트 메모리 | ... + 10종 adversarial payload 100% 차단 | Sprint 3 | ... | #4, **#9**"

**M2: L1663 memoryTypeEnum adds 'observation' — contradicts MEM-1 Option B**
- L1663: "memoryTypeEnum에 `'reflection'`, `'observation'` 추가"
- MEM-1 (L1479, Step 7 Fix 12): "observations 신규 테이블 + 기존 agent_memories에 memoryType='reflection' 확장. 별도 reflections 테이블 생성 안 함"
- Option B design: observations → **separate `observations` table** (NOT agent_memories). Only 'reflection' is added to memoryTypeEnum.
- Adding 'observation' to agent_memories.memoryTypeEnum implies observations are stored in agent_memories — contradicts the entire Option B architecture.
- L1665 correctly says "observations(raw)" → separate storage. But L1663's enum list is wrong.
- **Impact:** Developer reading Innovation section sees 'observation' in memoryTypeEnum → adds it to schema migration → creates unnecessary enum value + confusion about where observations are stored.
- **Fix:** L1663: "memoryTypeEnum에 `'reflection'` 추가" — remove 'observation' from the enum list. Observations have their own table.

### MINOR (4)

**m1: L1623 + L1741 "< 200KB" — PIX-1 propagation failure**
- L1623: "PixiJS 8 번들 < 200KB gzipped (Go/No-Go #5)"
- L1741: "번들 < 200KB gzipped"
- PIX-1 (Step 7 Fix 11): "≤ 200KB gzipped (204,800 bytes)"
- 204,800 = exactly 200 KiB. "< 200KB" excludes 200KB exactly.
- Same propagation pattern as L447 (Sprint roadmap) and L460 (Go/No-Go #5)
- **Fix:** "< 200KB" → "≤ 200KB" in L1623, L1741. (L447 and L460 are Step 4/5 scope — carry-forward)

**m2: L1649 vs L1662-1666 — 3-stage concept vs 2-stage implementation gap**
- L1649: "관찰(Observation) → 반성(Reflection) → 계획(Planning)" — 3 stages
- L1662-1666: Implementation shows 2 stages only: "observations(raw) → memory-reflection.ts 크론 → agent_memories[reflection]"
- "계획(Planning)" = read-time semantic search via soul-enricher.ts (Product Scope L896, MEM-5). NOT a separate process/cron/step.
- John flagged this in checkpoint #4. The gap between conceptual model and implementation could confuse developers.
- **Fix:** After L1666 add: "Planning(계획)은 별도 프로세스가 아님 — soul-enricher.ts가 태스크 시작 시 agent_memories(reflection) pgvector cosine ≥ 0.75 top 3 검색 → Soul에 자동 주입 (MEM-5 참조)"

**m3: Innovation risk table missing R11 Voyage AI migration (🔴 Critical)**
- R11 (L414): "Voyage AI 임베딩 마이그레이션 — 768d→1024d re-embed + HNSW rebuild (2-3일, 🔴 NOT STARTED)"
- R11 is a Critical Pre-Sprint risk that directly impacts Innovation 7 (Memory) — if migration fails, Sprint 3 pgvector semantic search is impossible
- Risk table (L1764-1774) doesn't mention R11
- **Fix:** Add row: "Voyage AI 임베딩 마이그레이션 실패 (R11) | 768d→1024d re-embed + HNSW rebuild (2-3일). 실패 시 Sprint 3 시맨틱 검색 전체 불능 | Pre-Sprint | #10"

**m4: Innovation risk table missing R15 WebSocket flood**
- R15 (L418): "/ws/office 연결 flood → 서버 부하"
- Related to Innovation 5 (OpenClaw) — WebSocket is the primary data delivery for /office
- NRT-5 (Step 7 Fix 7) defines limits: 50/company, 500/server, 10msg/s
- Risk table L1764 doesn't mention WebSocket flood for OpenClaw
- **Fix:** Add row or note in L1768 PixiJS risk: "+ WebSocket 연결 제한 (NRT-5): 50/company, 500/server (R15)"

---

## Confirmed Decisions Cross-Reference (Innovation Section)

| # | Decision | Innovation Section | Status |
|---|----------|-------------------|--------|
| 2 | n8n Docker 2G | L1688, L1769: "2G/2CPU" | ✅ (proactive fix applied) |
| 3 | n8n 8-layer | L1683: "포트 5678 + Hono + tag + HMAC" | ⚠️ PARTIAL (4 layers mentioned, not 8) |
| 5 | 30-day TTL | Not in Innovation section | N/A (implementation detail) |
| 8 | Observation poisoning | ❌ NOT in risk/verification | **MISSING** (M1) |
| 9 | Advisory lock | L1772: "advisory lock" | ✅ |
| 10 | WebSocket limits | Not explicitly in Innovation | ⚠️ (R15 not in risk table) |

---

## Go/No-Go Coverage in Verification Tables

| Gate | In Innovation Verification? | Notes |
|------|-----------------------------|-------|
| #1 Zero Regression | ✅ L1747 | Quality gate |
| #2 extraVars | ✅ L1738 | Big Five |
| #3 n8n security | ✅ L1739 | n8n |
| #4 Memory regression | ✅ L1740 | Memory |
| #5 PixiJS bundle | ✅ L1741 | OpenClaw (< vs ≤ issue) |
| #6 UXUI Layer 0 | ✅ L1748 | Quality gate |
| #7 Reflection cost | ✅ L1749 | Quality gate |
| #8 Asset quality | ✅ L1750 | Quality gate |
| **#9 Observation Poisoning** | **❌ MISSING** | **M1 — Sprint 3 security gate** |
| #10 Voyage AI migration | ❌ MISSING | m3 — Pre-Sprint blocker |
| #11 Tool Sanitization | ❌ MISSING | Security gate (less innovation-specific) |
| #12 v1 feature parity | ❌ MISSING | Quality gate (less innovation-specific) |
| #13 Usability | ❌ MISSING | Quality gate |
| #14 Capability Evaluation | ❌ MISSING | Memory gate (could be in verification) |

**8/14 covered. #9 is the critical gap (security gate for Innovation 7).**

---

## Score Rationale (pre-cross-talk)

- **D1 (8.0)**: Good specificity in comparison tables, implementation patterns, and verification criteria. Market timing section more narrative.
- **D2 (7.0)**: All 8 innovations covered. Verification covers Gates #1-8. But missing Gate #9 (observation poisoning) and R10/R11/R15 from risk tables.
- **D3 (7.0)**: memoryTypeEnum 'observation' error contradicts MEM-1. "< 200KB" not propagated from PIX-1 fix. Planning stage gap. Competitor comparisons directionally correct.
- **D4 (8.0)**: Good implementation patterns (soul-enricher, Option B, Hono proxy). Clear fallback strategies. memoryTypeEnum confusion could mislead.
- **D5 (7.0)**: "< 200KB" vs PIX-1 "≤ 200KB". memoryTypeEnum 'observation' vs MEM-1 separate table. 3-stage concept vs 2-stage implementation. Cross-references generally good otherwise.
- **D6 (6.5)**: Good v2+v3 risk coverage overall. BUT missing R10 (Observation Poisoning, 🟠 High, Go/No-Go #9) — the most critical security risk for Innovation 7. Missing R11 (Voyage AI, 🔴 Critical). Missing R15 (WebSocket flood).

---

## Cross-Talk (4 Critics)

### Sally (7.45 PASS) — 2 adopted

| Finding | Quinn Assessment | Action |
|---------|-----------------|--------|
| #11 Tool Sanitization missing from n8n verification | Agree — Security gate for Sprint 2-3 n8n pipeline should appear in Innovation 6 verification | **m5 adopted** |
| L1740 ↔ Go/No-Go #14 cross-reference missing | Agree — verification criterion "재수정 ≤ 50%" verbatim matches #14 (Capability Evaluation) but only #4 is referenced | **m6 adopted** |
| Planning 3단계 concern | Reinforces my m2 — read-time search stage not shown in implementation pattern | Already covered |

### Winston (8.60 PASS) — 1 adopted

| Finding | Quinn Assessment | Action |
|---------|-----------------|--------|
| M1: L1740 #4/#14 confusion | Same as Sally's finding — confirmed cross-critic consensus | Already m6 |
| **M2: L1768 R1 오귀속** | **New finding.** L1768 attributes "번들 200KB 초과" to (R1) but R1 = "PixiJS 8 학습 곡선" (L404). Bundle exceed is Go/No-Go #5, not R1. Clear D3 accuracy error. | **m7 adopted** |
| L1: "< 200KB" propagation | Same as my m1 | Already covered |
| L2: R10 missing from risk | Same as my M1 | Already covered |

### Bob (6.95 FAIL) — 1 adopted

| Finding | Quinn Assessment | Action |
|---------|-----------------|--------|
| #1: Innovation 7 impl pattern incomplete | Same as my m2 — missing read-time search stage | Already covered |
| #2: Go/No-Go #4/#9/#14 gaps | Combines my M1 (#9) + m6 (#14) | Already covered |
| **#3: R14 Solo dev + PixiJS missing from risk** | **Partially new.** R14 (L417, HIGH) directly impacts Innovation 5 (OpenClaw). L1623 mentions bundle risk but not team capability risk. Innovation risk table covers technical risks but omits the highest human risk for v3's most novel feature. | **m8 adopted (LOW)** |
| Obs #4: R11 Pre-Sprint acceptable omission | Disagree partially — R11 is CRITICAL and blocks Sprint 3 semantic search entirely. However Bob's point that it's Pre-Sprint scope is valid. Keep my m3 as MINOR, not upgrade. | m3 retained |

### Cross-Talk Consensus

| Issue | Quinn | Winston | Sally | Bob | Consensus |
|-------|-------|---------|-------|-----|-----------|
| M1: R10 Obs Poisoning missing | ✅ M1 | ✅ L2 | ✅ | ✅ #3 | **4/4 — unanimous** |
| M2: memoryTypeEnum 'observation' | ✅ M2 | — | — | — | 1/4 — Quinn only (architecture-specific) |
| m1: "< vs ≤" propagation | ✅ | ✅ L1 | — | — | 2/4 |
| m2: 3-stage vs 2-stage impl gap | ✅ | ✅ CP#4 | ✅ | ✅ #1 | **4/4 — unanimous** |
| m3: R11 Voyage missing | ✅ | — | — | Obs #4 | 1/4 (Bob considers acceptable) |
| m4: R15 WebSocket missing | ✅ | — | — | — | 1/4 |
| m5: #11 Tool Sanitization | — | — | ✅ | — | 1/4 (adopted from Sally) |
| m6: L1740 #4↔#14 confusion | — | ✅ M1 | ✅ | ✅ #2 | **3/4** (excluding Quinn origin=Sally) |
| m7: L1768 R1 오귀속 | — | ✅ M2 | — | — | 1/4 (adopted from Winston) |
| m8: R14 Solo dev missing | — | — | — | ✅ #3 | 1/4 (adopted from Bob, LOW) |

---

## Revised Score (post-cross-talk)

| Dimension | Weight | Pre | Post | Change Reason |
|-----------|--------|-----|------|---------------|
| D1 Specificity | 10% | 8.0 | 8.0 | No change |
| D2 Completeness | 25% | 7.0 | 7.0 | m5/#11 is an additional gate gap, but 8/14 coverage was already factored into 7.0 |
| D3 Accuracy | 15% | 7.0 | **6.5** | m7: L1768 R1 오귀속 (bundle ≠ learning curve) is a 4th distinct factual error alongside memoryTypeEnum, PIX-1, Planning gap |
| D4 Implementability | 10% | 8.0 | 8.0 | No change |
| D5 Consistency | 15% | 7.0 | 7.0 | m6 (#4/#14) was already factored; 3-critic confirmation strengthens but doesn't add new inconsistency |
| D6 Risk | 25% | 6.5 | 6.5 | m8 (R14) is LOW scope addition; D6 already captures R10/R11/R15 gaps |
| **Total** | **100%** | **7.10** | **7.00** | |

**Revised: 8.0×0.10 + 7.0×0.25 + 6.5×0.15 + 8.0×0.10 + 7.0×0.15 + 6.5×0.25 = 0.80 + 1.75 + 0.975 + 0.80 + 1.05 + 1.625 = 7.00**

**Verdict (post-cross-talk): ✅ PASS (7.00 ≥ 7.0) — exact threshold, 10 issues (2M + 6m + 2low)**

---

## Consolidated Issue List (post-cross-talk: 2M + 6m + 2low = 10 total)

### MAJOR (2)
- **M1**: R10 Obs Poisoning missing from risk + verification tables (4/4 unanimous)
- **M2**: L1663 memoryTypeEnum 'observation' contradicts Option B (architecture-specific)

### MINOR (6)
- **m1**: "< 200KB" → "≤ 200KB" propagation (L1623, L1741)
- **m2**: 3-stage concept vs 2-stage implementation gap (4/4 unanimous)
- **m3**: R11 Voyage AI migration missing from risk table
- **m4**: R15 WebSocket flood missing from risk table
- **m5**: #11 Tool Sanitization missing from n8n verification (from Sally)
- **m6**: L1740 Go/No-Go #4 → should be #4 AND #14 (3/4 consensus)

### LOW (2)
- **m7**: L1768 R1 오귀속 — bundle 200KB risk ≠ R1 (learning curve), should be Go/No-Go #5 (from Winston)
- **m8**: R14 Solo dev + PixiJS missing from innovation risk table (from Bob)

---

## R1 Cross-Critic Summary

| Critic | Role | Score | Status |
|--------|------|-------|--------|
| Winston | Architecture/API | 8.60 | ✅ PASS |
| **Quinn** | **QA/Security** | **7.00** | **✅ PASS (exact threshold)** |
| Sally | UX Designer | 7.45 | ✅ PASS |
| Bob | Scrum Master | 6.95 | ❌ FAIL |
| **Average** | | **7.50** | **3/4 PASS, 1 FAIL** |

Bob's FAIL is driven by D5 (6.5) and D6 (6.5) with 20% D6 weight — same cross-referencing gaps that all critics flagged. His findings (#1-#3) overlap heavily with Quinn M1, m2, m6. The FAIL signals Innovation Risk table and Go/No-Go cross-referencing need mechanical fixes, not structural rewrite.

---

## R2 Verification (post-fix)

### Fix Verification (8 fixes against 10 issues)

| Issue | Fix # | Verification | Status |
|-------|-------|-------------|--------|
| **M1**: R10 Obs Poisoning | Fix 1,3,7,8 | L1740 #4+#9+#14 ✅, L1751 QG#9 ✅, L1781 R10 risk+attack chain ✅, L1740 adversarial criteria ✅ | **FIXED** |
| **M2**: memoryTypeEnum 'observation' | Fix 2 | L1663 "'reflection' 추가" only ✅ | **FIXED** |
| **m1**: "< 200KB" → "≤ 200KB" | Fix 5 | L1623 ✅, L1741 ✅ | **FIXED** |
| **m2**: 3-stage impl gap | Fix 4 | L1665 full 3-stage with "read-time, 저장 없음 = 계획 단계" ✅ | **FIXED** |
| **m3**: R11 Voyage missing | Fix 3 | L1752 QG#10 with criteria ✅ (Pre-Sprint → QG appropriate) | **FIXED** |
| **m4**: R15 WebSocket | — | Not in risk table. LOW, NRT-5 in Domain Reqs | **RESIDUAL** |
| **m5**: #11 Tool Sanitization | Fix 3 | L1753 QG#11 ✅ | **FIXED** |
| **m6**: #4→#4+#14 | Fix 1 | L1740 "#4 + #9 + #14" ✅ | **FIXED** |
| **m7**: R1 오귀속 | Fix 6 | L1774 no "(R1)" ✅ | **FIXED** |
| **m8**: R14 Solo dev | Fix 7 | L1782 R14 with fallback + @pixi/react ✅ | **FIXED** |

**9/10 fixed. 1 non-blocking residual (m4 R15, LOW).**

### Quality Assessment of Fixes

1. **Fix 3 (Quality Gates expansion)**: 14/14 gates now covered (was 8/14). Each row has Sprint, success criteria, and Go/No-Go number. The most impactful fix — transforms verification completeness from 57% to 100%.
2. **Fix 4 (3-stage flow)**: L1665 now reads as a single continuous pipeline: obs→reflection→soul-enricher search→Soul injection. "(read-time, 저장 없음 = '계획' 단계)" explicitly disambiguates. Resolves the most consensus finding (4/4 unanimous).
3. **Fix 7 (R10 + R14 risk rows)**: R10 row includes attack chain summary. R14 row includes the Sprint 4 last-in-line mitigation. Both properly scoped.
4. **Fix 1 (Go/No-Go expansion)**: L1740 Memory verification now covers 3 orthogonal dimensions: data integrity (#4), security (#9), growth measurement (#14). Most complete single-innovation verification in the section.

### Residuals (non-blocking, 2건)

| Item | Severity | Notes |
|------|----------|-------|
| m4: R15 WebSocket flood not in Innovation Risk table | LOW | NRT-5 (50/company, 500/server) in Domain Reqs. R15 is LOW severity. Innovation Risk table covers all HIGH+ items. |
| L1713 "200KB 미만" | COSMETIC | Narrative list uses "미만" (< 200KB) vs PIX-1 "이하" (≤ 200KB). Specification locations (L1623, L1741) correctly fixed. |

### R2 Score

| Dimension | Weight | R1 | R2 | Change |
|-----------|--------|-----|-----|--------|
| D1 Specificity | 10% | 8.0 | 9.0 | 3-stage flow complete, adversarial criteria added, 14/14 gates with specific success criteria |
| D2 Completeness | 25% | 7.0 | 9.0 | 14/14 gates (was 8/14), R10+R14 in risk, #11 in verification. Only R15 (LOW) not in risk table |
| D3 Accuracy | 15% | 6.5 | 9.0 | All 4 accuracy errors fixed: memoryTypeEnum ✅, ≤ 200KB ✅, 3-stage ✅, R1 removed ✅ |
| D4 Implementability | 10% | 8.0 | 9.0 | 3-stage flow implementable, Go/No-Go complete, Quality Gates = Sprint-by-Sprint checklist |
| D5 Consistency | 15% | 7.0 | 9.0 | PIX-1 propagated, memoryTypeEnum corrected, Planning=read-time clear, #4+#9+#14 cross-referenced |
| D6 Risk | 25% | 6.5 | 8.5 | R10 + R14 added, 14/14 gates, attack chain explicit. R15 (LOW) still not in risk table |
| **Total** | **100%** | **7.00** | **8.875 ≈ 8.90** | |

**R2: 9.0×0.10 + 9.0×0.25 + 9.0×0.15 + 9.0×0.10 + 9.0×0.15 + 8.5×0.25 = 0.90 + 2.25 + 1.35 + 0.90 + 1.35 + 2.125 = 8.875**

**Verdict: ✅ PASS (8.90 ≥ 7.0) — strong pass, 9/10 fixes verified, 2 non-blocking residuals**

---

## FINAL — R2 Cross-Critic Summary

| Critic | Role | R1 | R2 | Status |
|--------|------|-----|-----|--------|
| Winston | Architecture/API | 8.60 | TBD | — |
| **Quinn** | **QA/Security** | **7.00** | **8.90** | **✅ PASS** |
| Sally | UX Designer | 7.45 | TBD | — |
| Bob | Scrum Master | 6.95 | TBD | — |
