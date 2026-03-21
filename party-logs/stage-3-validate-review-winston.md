# Winston's Review — Stage 3 PRD Validate (V-02~V-08)

**Reviewer:** Winston (Architect, Critic-A)
**Date:** 2026-03-21
**Target:** `_bmad-output/planning-artifacts/prd-validation-report.md`
**PRD:** `_bmad-output/planning-artifacts/prd.md` (v3 OpenClaw, 2500+ lines)

---

## Agreement/Disagreement with Findings

### V-02 Format Detection: AGREE

Analyst correctly identified all 11 Level-2 headers (6 BMAD core + 5 additional). I verified against the PRD — headers at L110, L265, L451, L625, L992, L1258, L1439, L1677, L1951, L2139, L2343 all confirmed present. The BMAD Standard classification is correct. Grade C (solo, no review needed) is appropriate for this factual enumeration task.

### V-03 Density: AGREE

Zero violations is accurate. I verified the 3 subjective adjective occurrences:
- L475 "직관적이다" — backed by ≤ 2분 metric ✅
- L476 "쉽게 만든다" — backed by ≤ 10분, 코드 0줄 ✅
- L699 "직관적으로 확인" — backed by load ≤ 3초, sync ≤ 2초 ✅

The PRD's information density is genuinely excellent — terse table format throughout, quantitative targets in every FR/NFR, no filler. Grade C appropriate.

### V-04 Brief Coverage: AGREE

The 98% coverage assessment is accurate. I spot-checked several mappings:
- Vision statement: Brief §1 → PRD L287 ✅
- Sprint order: Brief §4 → PRD L66, L163-180, L1969-1991 ✅
- Go/No-Go 8 gates: Brief §4 → PRD L439-449 ✅
- Out of Scope: Brief §4 → PRD L931-948 ✅

The WebSocket channel discrepancy (Brief says 14→15, PRD says 16→17) finding is correct and well-analyzed. The PRD's code-verified number (16 channels from `shared/types.ts:484-501`, confirmed at PRD L277) is authoritative. This is a PRD improvement, not a gap. Grade B appropriate.

### V-05 Measurability: NOT AVAILABLE

**Issue:** The frontmatter lists `step-v-05-measurability` as completed, but **no V-05 analysis exists in the report body**. The report jumps from V-04 directly to ECC Gap Injection Findings, then V-07. This is an internal consistency error in the report — the metadata claims completion but the work product is absent.

### V-06 Traceability: NOT AVAILABLE

**Same issue as V-05.** Frontmatter claims `step-v-06-traceability` completed but no V-06 section exists in the report. Both V-05 and V-06 are missing from the actual validation output.

**Recommendation:** Either add V-05/V-06 analysis or correct frontmatter to `validationStepsCompleted` excluding these two steps.

### V-07 Implementation Leakage: AGREE — with minor reclassifications

The 17 FR violations are correctly identified. I verified each against the PRD source text. The analyst's distinction between **scope constraints** (technology names that define the product) and **implementation leakage** (internal choices that belong in architecture) is methodologically sound and well-applied.

**Reclassifications:**

1. **FR-MEM6 "cosine ≥ 0.75"** (listed as #5 in "Other"): Analyst flagged but noted "acceptable as capability constraint." I **agree it's borderline** — the threshold (0.75) is a product decision, but "cosine" as the specific algorithm is leakage. Recommend keeping as violation but LOW severity. Architecture should specify the similarity algorithm; FR should say "유사도 ≥ 0.75인 reflections 상위 3개".

2. **FR-N8N4 "Oracle Security List"** (Cloud Platform #1): Correctly flagged. From architecture perspective, this hard-codes the cloud provider. If we ever migrate VPS, this FR becomes invalid. Confirm as violation — should be "VPS 방화벽".

3. **FR-OC7 PostgreSQL LISTEN/NOTIFY block**: This is the **most severe violation** in the entire report. A complete implementation strategy including raw SQL query (`SELECT * FROM activity_logs WHERE created_at > $lastCheck ORDER BY created_at LIMIT 50`), PostgreSQL-specific mechanisms, Neon compatibility verification, and specific library patterns (`Hono WebSocket Helper upgrade()`) are all embedded in an FR. This belongs entirely in architecture. **Severity: HIGH.** The FR should be one sentence: "서버가 activity_logs 테이블 변화를 감지하여 /ws/office 채널로 상태 이벤트를 브로드캐스트한다."

4. **FR-PERS2 triple leakage**: Correctly identified — Zod schema syntax + DB CHECK constraint SQL + migration filename (#61 `0061_add_personality_traits.ts`). Three distinct leakage types in one FR. **Severity: HIGH.** This FR should say "5개 축 모두 0-100 정수 범위를 서버 API와 DB 양쪽에서 검증한다. 문자열 타입 값 일괄 거부."

5. **NFR leakage (7 items)**: Agree these are informational. NFRs legitimately include measurement methods — `Vite 빌드`, `Lighthouse`, specific API paths are how you measure the NFR, not how you implement the system.

6. **Domain Requirements leakage (4 items)**: Agree on moderate severity. The domain requirements section is architecturally dense by design (it sits between PRD and architecture), but N8N-SEC-2 (`N8N_DISABLE_UI=false + Hono proxy`) and PER-1 (`soul-renderer.ts spread 순서 역전`) cross the line into implementation.

**Grade A assignment is correct** — V-07 is the most architecture-critical validation step and the analyst executed it thoroughly.

### V-08 Domain Compliance: AGREE

75/75 domain requirements correctly enumerated across 14 categories. I verified the domain coverage tables:
- AI/ML requirements: 5 checked, all status assessments accurate ✅
- SaaS B2B requirements: 7 checked, all Met with correct PRD locations ✅
- Workflow Automation: 5 checked, "Partial" for n8n workflow versioning is fair ✅
- Agent Orchestration: 6 checked, all Met ✅

The novel domain analysis is architecturally sound — "ai-agent-orchestration" is indeed not a standard regulated domain, and the analyst correctly applied domain-relevant checks rather than skipping entirely. The GDPR note (future consideration, not current requirement) aligns with PRD L1912-1920. Grade B appropriate.

---

## Missed Issues

### 1. V-05/V-06 Missing (Critical)

The biggest gap. Frontmatter claims both steps completed but zero analysis exists in the report body. V-05 (Measurability) is particularly important — it would check whether FRs have measurable acceptance criteria. V-06 (Traceability) would verify the FR→Brief→Research chain. Both are needed for a complete validation.

### 2. Deferred Items Scattered (Minor, Architecture-relevant)

The PRD mentions the JSONB read-modify-write race condition as a "Deferred Item" in **three separate locations** (L1404 MKT-1, L1719 multi-tenant table, L1909 token security). Consistent flagging is good, but the PRD has no consolidated **Deferred Items section**. For Stage 4 Architecture, these scattered deferrals could be lost. Analyst didn't flag this.

### 3. FR-MEM2 Embedding Dimension Lock-in (Minor)

FR-MEM2 specifies `embedding VECTOR(768)` — this locks the architecture to Gemini Embedding's current 768-dimension output. If Gemini Embedding upgrades to higher dimensionality (the v2 audit already noted a pending Gemini Embedding 2 upgrade in memory), this FR would force a migration. The analyst flagged this as implementation leakage but didn't note the **architectural constraint risk** of dimension lock-in.

### 4. Go/No-Go #6 References "Subframe" (Informational)

Go/No-Go #6 (L447): "Subframe 디자인 토큰 추출 완료" — but MEMORY.md notes Subframe was deprecated in favor of Gemini prompts and Stitch 2. If the validation is checking current accuracy, this gate name may be stale. Minor, as the gate's intent (design token extraction) is still valid regardless of the tool used.

---

## ECC Gap Assessment

### ECC-1: Tool Response Prompt Injection (FR-TOOLSANITIZE)

**AGREE — Moderate severity is correct.**

The analyst correctly identified a **distinct attack surface**. The PRD defends against:
- Personality injection into Soul: PER-1 (4-layer sanitization) ✅
- Credential exposure in output: SEC-4/SEC-5 (output-redactor, credential-scrubber) ✅
- CLI token in Soul: SEC-6 ✅

But **none of these** defend against adversarial content in **tool responses** — when an external API (n8n webhook, KIS API, web scraping tool) returns content designed to manipulate the agent's behavior through the conversation context. With Sprint 2 adding n8n webhooks (external-facing) and Sprint 2 adding marketing API integrations (AI-generated content flowing back), this attack surface grows significantly.

**Architecture recommendation:** This should be addressed at the `agent-loop.ts` level (the single SDK touchpoint) via tool response content sanitization before it enters the conversation context. Alternatively, document an explicit decision to rely on Claude's built-in instruction hierarchy (system > user > tool responses) — but this should be a conscious architectural choice, not an omission.

### ECC-2: Observations confidence + domain_type Fields

**AGREE on finding, DISAGREE on severity — downgrade to Low.**

The analyst rates this Low-Moderate. From architecture perspective, I'd rate it **Low**. The core memory pipeline (observe → reflect → plan) functions completely without these fields. They are optimization columns:
- `confidence`: Nice-to-have for Reflection prioritization, but the reflection cron already batch-processes 20 observations at a time — confidence filtering adds marginal value.
- `domain_type`: Would help Planning search precision, but cosine similarity on embeddings already handles domain relevance semantically.

**Recommendation:** Defer to Sprint 3 architecture. If the reflection quality proves insufficient in testing, add these columns as a Sprint 3.5 optimization. Don't add schema complexity upfront for hypothetical improvement.

### ECC-3: Capability Evaluation Gate (Go/No-Go #9)

**AGREE — Moderate severity is correct.**

This is a **real architectural gap**. The PRD has 8 Go/No-Go gates — all are **infrastructure gates** (does it work?) rather than **outcome gates** (does it improve results?). The metric exists at Innovation Verification L1641 ("동일 태스크 3회 반복 → 3회차 재수정 ≤ 50% of 1회차") but was never promoted to a formal gate.

Without this gate, Sprint 3 could pass with: ✅ observations table created, ✅ reflection cron runs, ✅ zero regression, ✅ reflections stored — but agents don't actually improve. The infrastructure works but delivers zero user value.

**Architecture recommendation:** Add Go/No-Go #9: "Capability Evaluation — 동일 태스크 3회 반복 시 3회차 재수정 횟수가 1회차 대비 ≤ 50%. 인프라 동작 + 결과 개선 모두 검증." This gate should be Sprint 3 exit criteria.

### ECC-4: NFR-LOG Handoff Chain + Memory Audit Completeness

**AGREE — Moderate severity is correct.**

The Compliance section (L1889-1900) defines 8 audit event types including handoff chain and memory deletion — good. But NFR-LOG (L2461-2467) only defines:
- NFR-LOG1: Structured log format (JSON)
- NFR-LOG2: 30-day retention
- NFR-LOG3: Error alerts

There's a gap between **what is logged** (Compliance section — descriptive) and **how well it's logged** (NFR-LOG — quantitative). The analyst's recommendation for NFR-LOG4 (100% handoff event logging) and NFR-LOG5 (100% memory modification logging) is architecturally sound. Without completeness guarantees, the audit events in the Compliance section are aspirational, not enforceable.

**Architecture impact for Stage 4:** The architecture must define which audit events are synchronous (blocking — must succeed for the operation to proceed) vs asynchronous (fire-and-forget). Handoff chain logging should be synchronous (losing a handoff event breaks chain reconstruction). Memory modification logging can be async (losing a log entry is annoying but doesn't break functionality).

---

## Critic-A Dimensional Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 9/10 | Excellent — line numbers, FR IDs, exact text quotes, specific rewrite suggestions. Every finding is traceable to source. |
| D2 Completeness | 15% | 6/10 | V-05 and V-06 claimed complete in frontmatter but absent from report body. The 6 steps present (V-02/03/04/ECC/07/08) are thorough, but 2 missing steps is a significant gap. |
| D3 Accuracy | 25% | 9/10 | All findings verified against PRD source text. Implementation leakage classifications are technically correct. ECC gap assessments are architecturally sound. Zero hallucinations detected. |
| D4 Implementability | 20% | 8/10 | Recommendations are specific and actionable — exact FR rewording in V-07, specific NFR additions for ECC-4, capability gate proposal for ECC-3. An architect can directly use these in Stage 4. |
| D5 Consistency | 15% | 7/10 | Internal inconsistency: frontmatter claims V-05/V-06 complete while body is absent. Otherwise, all cross-references are consistent (FR IDs, line numbers, PRD structure). |
| D6 Risk Awareness | 10% | 8/10 | ECC gap analysis shows strong security risk awareness (tool response injection as distinct attack surface). V-07 correctly identifies architecture-constraining FRs. Minor: didn't flag embedding dimension lock-in risk. |

### Weighted Average: 7.95/10 → 8/10 ✅ PASS

**Calculation:** (0.15×9) + (0.15×6) + (0.25×9) + (0.20×8) + (0.15×7) + (0.10×8) = 1.35 + 0.90 + 2.25 + 1.60 + 1.05 + 0.80 = **7.95**

---

## Summary

The validation work that IS present is excellent — thorough, accurate, and architecturally sound. The V-07 implementation leakage analysis is particularly strong, with correct distinction between scope constraints and genuine leakage. The ECC gap assessment demonstrates sophisticated security and architecture thinking.

**Top 3 issues to address:**
1. **V-05/V-06 missing** — frontmatter says complete, body says otherwise. Must be added or frontmatter corrected.
2. **FR-OC7 implementation leakage** — entire PostgreSQL strategy embedded in FR. Most severe single violation.
3. **ECC-3 capability gate** — Sprint 3 has infrastructure gates only, no outcome gate. Risk of "works but delivers nothing."

## Score: 8/10
