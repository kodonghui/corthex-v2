# John's Review — Stage 3 PRD Validate (V-02~V-08)

**Reviewer:** John (PM)
**Date:** 2026-03-21
**Report Under Review:** `_bmad-output/planning-artifacts/prd-validation-report.md`

---

## Agreement/Disagreement with Findings

### V-02: Format Detection — AGREE
PRD has all 6 core BMAD sections + 5 additional (11 total). Classification as "BMAD Standard" is correct. No issues. Grade C (solo) is appropriate — format detection is mechanical.

### V-03: Information Density — AGREE
Zero violations confirmed. The 3 subjective terms ("직관적이다" L475, "쉽게 만든다" L476, "직관적으로 확인" L699) are all backed by quantitative metrics in the same row. This is the correct pattern — the PRD consistently uses direct, precise language. No revision needed.

### V-04: Brief Coverage — AGREE with ADDITIONS

**My cross-check of 8 elements:**

| # | Element | Analyst Finding | My Verification | Result |
|---|---------|----------------|-----------------|--------|
| 1 | Vision Statement | Fully Covered | Brief §1 "개성을 갖고, 성장하며, 실제로 일하는 모습" → PRD L287 "보이고, 생각하고, 성장한다" — equivalent phrasing | Confirmed |
| 2 | Sprint Order | Fully Covered | Brief §4 Pre→S1(L3)→S2(L2)→S3(L4)→S4(L1) → PRD L66 identical | Confirmed |
| 3 | Go/No-Go Gates 8개 | Fully Covered | Brief §4 gates 1-8 → PRD L439-449 gates 1-8, identical + PRD adds new gates | Confirmed |
| 4 | Target Users | Fully Covered | Brief §2 Admin 이수진 32세 + CEO 김도현 38세 → PRD preserves both | Confirmed |
| 5 | WebSocket 채널 수 | Informational gap | Brief L173 "14채널" → PRD L277 "16채널" — PRD uses code-verified audit, more accurate | Confirmed |
| 6 | Option B Memory | Fully Covered | Brief §4 "Option B 채택 — 기존 확장" → PRD L148 consistent | Confirmed |
| 7 | Costs 제거 | Fully Covered | Brief §4 "전면 제거" → PRD L253-255, NFR-S7/D7 삭제 | Confirmed |
| 8 | Out of Scope | Fully Covered | Brief §4 9 items → PRD L931-948 all preserved + additions | Confirmed |

**ADDITION the analyst missed:**

**Big Five scale divergence (Informational):** Brief §Layer 3 (L136) says "5개 특성 각 **0.0~1.0**" and Brief §Sprint 1 Core Features (L398) repeats "0.0~1.0". But PRD uses "**0-100 정수**" throughout (L204, L312, FR-PERS1, FR-PERS2), citing "Stage 1 Decision 4.3.1." This is a **deliberate evolution** (the Tech Research refined the scale), not a coverage gap — but the analyst should have flagged it as a Brief→PRD divergence with explicit justification. Without the note, a downstream reader might think the Brief and PRD disagree.

**Verdict:** Coverage map is accurate. 98% assessment is fair. The scale divergence is informational only (Decision 4.3.1 is the authoritative source).

### V-05: Measurability — DISAGREE (MISSING)

The frontmatter lists `step-v-05-measurability` as completed, but **no V-05 findings appear in the report body**. This is a significant omission. V-05 should verify that all Success Criteria (L451-623) have quantitative targets, measurement methods, and pass/fail thresholds. The PRD has strong measurability (specific numeric targets throughout), but the validation report doesn't actually demonstrate this analysis was done.

**Impact:** Without V-05 findings, downstream consumers (Architecture, Epics) cannot confirm that all success criteria are testable.

### V-06: Traceability — DISAGREE (MISSING)

Same issue as V-05. The frontmatter claims completion but **no V-06 findings appear in the report body**. V-06 should map FR→NFR→Brief elements to verify full bidirectional traceability. This is one of the most valuable validation steps for downstream Architecture work, and it's absent.

**Impact:** Architecture stage needs traceability matrix to design component boundaries. Missing V-06 means this matrix doesn't exist yet.

### V-07: Implementation Leakage — AGREE with NUANCE

The analyst found 17 FR violations, 7 NFR informational, 4+ domain requirement leakage. The categorization is thorough and the recommended fixes are specific and actionable.

**PM nuance — which "leakages" are actually scope constraints in a brownfield v3 update?**

| Item | Analyst Says | PM Assessment |
|------|-------------|---------------|
| PixiJS 8 + @pixi/react | Scope constraint (acceptable) | AGREE — PixiJS IS the feature |
| React.lazy + dynamic import | Implementation leakage | AGREE — HOW to load, not WHAT |
| **Hono** in FR-N8N1/4/6 | Implementation leakage | **PARTIAL DISAGREE** — In a brownfield v3 update where Hono IS our existing server framework, referencing it is equivalent to referencing "PixiJS" (which analyst accepted). "Hono reverse proxy" is a scope constraint that prevents ambiguity about which framework handles the proxy. Recommend: keep "Hono" but remove framework-specific API patterns (e.g., `proxy()`, `upgrade()`) |
| PostgreSQL LISTEN/NOTIFY + raw SQL | Implementation leakage | AGREE — raw SQL queries and PostgreSQL-specific mechanisms belong in architecture |
| Zod schema syntax | Implementation leakage | AGREE — validation library choice belongs in architecture |
| File paths + function signatures | Implementation leakage | AGREE — strongest violations, must be removed from FRs |
| Docker compose syntax | Implementation leakage | AGREE — specific resource config belongs in architecture/ops docs |
| Oracle Security List | Implementation leakage | AGREE — cloud vendor specifics belong in ops docs |
| cosine similarity algorithm | Scope constraint (acceptable) | AGREE with analyst — cosine similarity is a capability constraint, not implementation detail |

**Net assessment:** 14 of 17 FR violations are genuine. 3 Hono references are borderline (acceptable as scope constraints in brownfield context, but internal API patterns should still be removed).

### V-08: Domain Compliance — AGREE

75/75 domain requirements across 14 categories is comprehensive. The novel domain combination (agent orchestration + personality + memory + workflow automation) goes well beyond standard templates. No regulatory compliance gaps for this domain type. The GDPR-like future consideration (L1912-1920) is appropriately scoped.

---

## Missed Issues

### 1. V-05 and V-06 Findings Missing from Report (HIGH)
The report claims 8 validation steps completed but only delivers findings for 6 (V-02, V-03, V-04, V-07, V-08, plus ECC gaps). V-05 (Measurability) and V-06 (Traceability) are absent. This makes the validation report **incomplete for downstream consumption**. Architecture stage needs the traceability matrix; Epics stage needs confirmed measurable acceptance criteria.

**Recommendation:** Analyst must add V-05 and V-06 sections before the report is considered complete.

### 2. Reflections Table Architecture Inconsistency (MODERATE)
The PRD has an **internal contradiction** about where reflections are stored:

- **Terminology section** (L99): "계획(agent_memories[reflection] pgvector 검색). Option B 기존 확장 방식"
- **Brief alignment** (L148): "기존 agent_memories 테이블: memoryTypeEnum에 'reflection', 'observation' 타입 추가"
- **Feature 5-4 section** (L842, L862): Defines a **separate** `CREATE TABLE reflections (...)` with its own schema
- **FR-MEM4** (L2326): "reflections 테이블에 고수준 인사이트를 저장"
- **FR-MEM6** (L2328): "reflections 상위 3개를 검색"

Option B promises "기존 agent_memories 확장, 대체 아님" — but the FRs and Feature 5-4 define a completely separate `reflections` table. These are two different architectures. The analyst should have caught this as either:
- A V-04 coverage gap (Brief says extend agent_memories, PRD creates new table)
- A V-07 consistency issue (terminology says Option B extension, FRs say new table)

**Business impact:** This affects DB migration planning, zero-regression promise on agent_memories, and Sprint 3 scope estimation.

### 3. Big Five Scale Brief→PRD Divergence (LOW)
As noted in V-04 section above. Brief says 0.0-1.0 float, PRD says 0-100 integer. Deliberate (Decision 4.3.1) but undocumented in the validation report.

---

## ECC Gap Assessment (PM perspective)

### ECC-1: FR-TOOLSANITIZE (Tool Response Prompt Injection) — CRITICAL

**Business value:** HIGH. This is a real security gap, not a theoretical one.

- n8n webhooks can receive arbitrary external content
- KIS API responses could be manipulated
- Web scraping tools return untrusted HTML/text
- If adversarial content in a tool response manipulates agent behavior → data exfiltration, unauthorized actions, credential exposure

The existing PER-1 (personality sanitization) and SEC-4/5 (credential patterns) address different attack surfaces. Tool response injection is distinct and undefended.

**PM recommendation:** MUST add to v3 PRD. Either:
1. Add FR-TOOLSANITIZE as a Sprint 2 requirement (before n8n integration goes live with external webhooks)
2. Or document an explicit risk acceptance decision with mitigation (e.g., "SDK's built-in handling is sufficient — verify with test")

### ECC-2: Observations confidence + domain_type — DEFER

**Business value:** LOW-MODERATE. Nice engineering improvement but not user-facing.

- The 3-stage memory pipeline delivers user value (agents learn from experience) without these fields
- `confidence` improves Reflection quality — but Reflection already summarizes 20 observations, which provides natural noise filtering
- `domain_type` improves search precision — but cosine similarity on embeddings already provides semantic relevance

**PM recommendation:** Document as Sprint 3 architectural decision. Let the architect decide during Architecture stage. Not PRD-level.

### ECC-3: Capability Evaluation Gate (Go/No-Go #9) — CRITICAL

**Business value:** HIGH. This is the most important ECC gap from product perspective.

Current Go/No-Go #4 checks: "agent_memories 단절 0건 + observation→reflection E2E" — this verifies **infrastructure works** but not that **agents actually get better**. We could ship a perfectly functioning memory system that doesn't improve outcomes.

The metric already exists at L1641 (Innovation Verification): "동일 태스크 3회 반복 → 3회차 재수정 ≤ 50% of 1회차" — but it's NOT a gate. Without a gate, Sprint 3 could "pass" with working plumbing but zero business value.

**PM recommendation:** MUST add Go/No-Go #9: "Capability Evaluation — 동일 태스크 3회 반복 시 3회차 재수정 횟수가 1회차 대비 ≤ 50%. Memory infrastructure works AND improves outcomes." This is the difference between "we built it" and "it works."

### ECC-4: NFR-LOG Handoff Chain + Memory Audit — NICE-TO-HAVE

**Business value:** MODERATE for compliance, LOW for v3 launch.

The domain requirements (Compliance section L1889-1900) already cover handoff chain and memory audit event types. MEM-5 mandates Planning audit logs. The gap is elevating these to NFR-level with **completeness guarantees** (100% of events logged, chain reconstruction capability).

**PM recommendation:** Defer to post-v3 hardening sprint. The domain requirements provide adequate coverage for v3 launch. NFR-level completeness guarantees are a maturity step, not a launch blocker.

---

## Dimension Scores (Critic-C: Product + Delivery)

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 20% | 8/10 | Line numbers cited throughout, exact counts, clear categorization. "적절한" expressions: 0 in analyst's own language. |
| D2 Completeness | 20% | 6/10 | V-05 and V-06 findings MISSING from report body despite frontmatter claiming completion. Reflections table inconsistency missed. 6/8 steps actually delivered. |
| D3 Accuracy | 15% | 8/10 | What IS in the report is accurate. Coverage map verified against 8 elements — all correct. Implementation leakage categorization is sound. |
| D4 Implementability | 15% | 8/10 | Clear, specific fix recommendations for V-07. ECC gap recommendations are actionable with Sprint alignment. |
| D5 Consistency | 10% | 6/10 | Report claims 8 steps complete but delivers 6. Internal inconsistency between frontmatter and body. |
| D6 Risk Awareness | 20% | 7/10 | ECC gaps well-identified with impact ratings. But missed the reflections table architecture contradiction — a risk for Sprint 3 scope. |

**Weighted Average:** 8×0.20 + 6×0.20 + 8×0.15 + 8×0.15 + 6×0.10 + 7×0.20 = 1.60 + 1.20 + 1.20 + 1.20 + 0.60 + 1.40 = **7.20/10**

## Score: 7/10 — PASS (conditional)

**Condition:** V-05 and V-06 findings must be added to the report before it can be considered complete for downstream consumption.

**Top 3 Issues:**
1. **V-05/V-06 findings missing** — report claims 8 steps but delivers 6. Architecture stage needs traceability matrix.
2. **Reflections table architecture contradiction** — PRD internally contradicts itself on Option B (extend agent_memories vs new reflections table). Must be resolved before Architecture stage.
3. **Go/No-Go #9 (Capability Evaluation) missing** — memory system could "pass" with working infrastructure but zero business value. Must be a gate, not just a verification metric.
