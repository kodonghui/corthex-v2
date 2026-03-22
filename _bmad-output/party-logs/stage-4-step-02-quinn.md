## Critic-B (Quinn) Review — Stage 4 Step 2: v3 Project Context Analysis Update

### Review Date
2026-03-22 (R1)

### Content Reviewed
`_bmad-output/planning-artifacts/architecture.md` — Step 2 additions (L51-228): FR table, NFR table, Infrastructure Additions, Constraints, Cross-Cutting Concerns, Scale & Complexity.

---

### Verification Method
- PRD FR/NFR sections independently counted line-by-line (L2285-2648)
- Go/No-Go gate numbering cross-referenced against PRD table (L588-607)
- Confirmed decisions (12 items) checked one-by-one against Step 2 content
- Gemini remnant grep across full architecture.md
- NFR category counts summed and compared against PRD "총 활성: 76개" (L2648)

---

### Dimension Scores

| Dim | Score | Wt | Wtd | Evidence |
|-----|-------|-----|-----|----------|
| D1 | 8/10 | 10% | 0.80 | Excellent specificity: Docker flags (`--memory=2g`, `--cpus=2`, `NODE_OPTIONS=--max-old-space-size=1536`), WS limits (50/company, 500/server, 10msg/s), memory budget table (~11GB/24GB), advisory lock SQL (`pg_advisory_xact_lock(hashtext(companyId))`), PixiJS ≤200KB gzip. No vague "적절한" in Step 2 additions. |
| D2 | 7/10 | 25% | 1.75 | All 12 confirmed decisions reflected. 6 new cross-cutting concerns well documented. Memory budget analysis thorough. **BUT**: FR-UX (CEO앱 페이지 통합, 3 FRs: FR-UX1-3) completely missing from v3 FR table. FR-TOOLSANITIZE undercounted (1 vs actual 3). Claims "19 Capability Areas" but only 18 listed. |
| D3 | 6/10 | 15% | 0.90 | **5 factual errors**: (1) Go/No-Go #11 = "cost ceiling" but PRD says "Tool Sanitization" (L604). (2) FR-TOOLSANITIZE = 1 but PRD has 3 (L2487-2489). (3) NFR Security = 10 but actual = 9 (S7 deleted, L2535). (4) NFR Data Integrity = 8 but actual = 7 (D7 deleted, L2584). (5) NFR per-category sum = 78 (17+10+9+3+7+8+3+11+3+3+3+1) but claimed total = 76. The 76 total is correct per PRD but category cells are wrong. |
| D4 | 8/10 | 10% | 0.80 | Sprint assignments clear. Docker configurations actionable. Memory budget breakdown implementable. File paths specified (soul-enricher.ts, office-channel.ts, memory-reflection.ts). |
| D5 | 7/10 | 15% | 1.05 | Go/No-Go #11 label inconsistent with PRD. Frontmatter (L13) says "74 NFR" but body says 76 and PRD says 76. **Cross-section**: pre-existing L375 `@google/genai` and L1335 "Gemini Embedding 768차원" contradict v3 "Gemini API 전면 금지" (L189). Pre-existing L1332 says "N8N-SEC 6-layer" but Step 2 correctly says 8-layer — document is internally inconsistent. |
| D6 | 8/10 | 25% | 2.00 | Strong security risk coverage: 3 independent sanitization chains as separate attack surfaces (L216-219), Neon LISTEN/NOTIFY verification + 500ms polling fallback (L191), advisory lock + Neon serverless check (L193), n8n OOM monitoring (L187), CPU contention with n8n Docker on same server (L151), 14 Go/No-Go gates as sprint blockers. **Missing**: (1) Voyage AI rate limit/quota exhaustion risk during Pre-Sprint bulk re-embed migration. (2) No mention of attack surface created by n8n proxy path traversal through `/admin/n8n/*`. (3) No advisory lock timeout/deadlock behavior on Neon serverless. |

### Weighted Average: 7.30/10 ✅ PASS

---

### Issues (5 HIGH, 3 MEDIUM, 2 LOW)

**H1 [D3] Go/No-Go #11 mislabeled (L88)**
Architecture says "+#11 cost ceiling" but PRD (L604) says #11 = "에이전트 보안 Tool Sanitization". Cost ceiling is incorporated into #7 (Reflection 크론 + 비용 검증). The Stage 1 confirmed decisions originally numbered #11 as "cost ceiling" but the PRD renumbered it. Architecture must use PRD's final numbering.
- **Fix**: Change "+#11 cost ceiling" → "+#11 tool sanitization"

**H2 [D2] FR-UX (CEO앱 페이지 통합) missing from v3 FR table (L80-88)**
PRD L2491-2497 defines FR-UX1, FR-UX2, FR-UX3 (3 FRs). These are GATE decision features (2026-03-20). Not listed in the Step 2 v3 capability area table. Architecture claims "19 Capability Areas" at L59 but only 18 are listed.
- **Fix**: Add row `| CEO앱 페이지 통합 (FR-UX) | 3 | 병행 | 14→6 그룹 통합, 라우트 redirect, 기능 100% 유지 |` to v3 FR table.

**H3 [D3] FR-TOOLSANITIZE count = 1, actual = 3 (L87)**
PRD L2487-2489 defines FR-TOOLSANITIZE1 (detect), FR-TOOLSANITIZE2 (block+log), FR-TOOLSANITIZE3 (100% adversarial pass rate). Architecture says 1.
- **Fix**: Change `| 도구 응답 보안 (FR-TOOLSANITIZE) | 1 |` → `| 도구 응답 보안 (FR-TOOLSANITIZE) | 3 |`

**H4 [D3] NFR Security count = 10, actual = 9 (L97)**
NFR-S7 deleted (CLI Max 월정액, cost-tracker 정확도 불필요 — L2535). Active = S1-S6, S8-S10 = 9, all P0.
- **Fix**: Change `| Security | 10 | 10 |` → `| Security | 9 | 9 |`

**H5 [D3] NFR Data Integrity count = 8, actual = 7 (L101)**
NFR-D7 deleted (비용 기록 보관 불필요 — L2584). Active = D1-D6, D8 = 7.
- **Fix**: Change `| Data Integrity | 8 | 0 |` → `| Data Integrity | 7 | 0 |`

**M1 [D6] Voyage AI bulk migration rate limit risk not mentioned**
Pre-Sprint requires re-embedding all knowledge_docs (potentially thousands) from 768d→1024d. Voyage AI has rate limits (requests/min, tokens/min). No risk callout for migration duration or rate limit exhaustion. Could block Pre-Sprint timeline.
- **Fix**: Add to constraints or risk section: "Voyage AI rate limit — Pre-Sprint bulk re-embed (기존 knowledge_docs 전수) 시간 추정 필수. Rate limit 초과 시 2-3일 마이그레이션 기간 연장 가능"

**M2 [D6] n8n proxy path traversal attack surface**
Architecture correctly specifies JWT + Admin 권한 on `/admin/n8n/*` proxy. But doesn't mention path traversal risk: Hono `proxy()` could allow `../` or encoded path sequences to bypass the intended n8n API scope. Need explicit path normalization or allowlist.
- **Fix**: Add to constraints or cross-cutting: "n8n proxy 경로 normalization — `/admin/n8n/*` Hono proxy()에서 path traversal 공격 방지 (decodeURI + allowlist 검증)"

**M3 [D5] Frontmatter NFR count mismatch (L13)**
Architecture frontmatter says "74 NFR" but the Step 2 body (L90-107) and PRD (L2648) both say 76 active.
- **Fix**: Update frontmatter to "76 NFR"

**L1 [D5] Pre-existing Gemini remnants (L375, L1335)**
Phase 4 dependencies table still lists `@google/genai | Gemini Embedding API`. Later section L1335 says "Gemini Embedding 768차원 벡터화". Both contradict "Gemini API 전면 금지" (L189). These are pre-existing v2 sections not updated in Step 2, but create document-internal contradictions. May be addressed in later steps.

**L2 [D3] FR total "116" vs actual count**
With FR-TOOLSANITIZE = 3 (not 1) and FR-UX = 3 added, the v3 FR count from Step 2 table would change. However, the PRD frontmatter also says 116 — a cross-document consistency check is needed. The actual line-by-line count from PRD: v2 = 70 active, v3 = 53 active = 123 total. This may indicate the PRD's own "116" is outdated after validation fixes added FR-UX1-3 and expanded FR-TOOLSANITIZE.

---

### Security-Specific Assessment

| Security Area | Status | Evidence |
|--------------|--------|----------|
| PER-1 4-layer sanitization | ✅ Documented | L217, 4 layers specified |
| MEM-6 4-layer observation poisoning | ✅ Documented | L218, 4 layers specified |
| TOOLSANITIZE injection defense | ⚠️ Undercounted | L87 says 1 FR, actual 3 (detect/block/verify) |
| N8N-SEC 8-layer | ✅ Documented | L83, 8-layer in Step 2 (but L1332 pre-existing says 6-layer) |
| Advisory lock | ✅ Documented | L86, L193 |
| WS limits (50/500, 10msg/s) | ✅ Documented | L82, L154 |
| Voyage AI (no Gemini) | ⚠️ Partial | Step 2 correct (L152, L189) but pre-existing L375, L1335 still Gemini |
| Token security | ✅ Inherited | v2 section intact (L499-502) |
| Go/No-Go #9 (obs poisoning) | ✅ Documented | L88, L218 |
| Go/No-Go #11 (tool sanitize) | ⚠️ Mislabeled | L88 says "cost ceiling", should be "tool sanitization" |

9/12 security areas fully correct. 3 have issues (all fixable).

---

### Cross-talk Notes

Awaiting Winston's (Critic-A) review. Key area of likely agreement: D3 count errors are mechanical fixes. Key area of potential divergence: whether pre-existing Gemini remnants (L375, L1335) are Step 2 scope or deferred.

### Verdict

**7.30/10 PASS.** Strong v3 additions with excellent specificity and risk awareness. 5 factual count errors (all mechanical fixes) and 1 missing FR area (FR-UX) are the main blockers. No auto-fail conditions triggered. After H1-H5 fixes and FR-UX addition, score would reach ~8.5+.

---

## R2 Verification — 2026-03-22

### Fix Verification (10/10 R1 issues)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| H1 | Go/No-Go #11 "cost ceiling"→"tool sanitization" | ✅ Fixed | L89: "+#11 tool sanitization" |
| H2 | FR-UX missing from v3 FR table | ✅ Fixed | L88: FR-UX row added (3 FRs), L59: "20 Capability Areas" |
| H3 | FR-TOOLSANITIZE 1→3 | ✅ Fixed | L87: count=3, description expanded (detect+block+audit+verify), `engine/hooks/tool-sanitizer.ts` path |
| H4 | NFR Security 10→9 | ✅ Fixed | L98: "9 \| 9" with "(NFR-S7 삭제)" annotation |
| H5 | NFR Data Integrity 8→7 | ✅ Fixed | L102: "7 \| 0" with "(NFR-D7 삭제)" annotation |
| M1 | Voyage AI migration rate limit risk | ✅ Fixed | L153: "Voyage AI Pre-Sprint 일정 리스크" with bulk rate limit, batch 간격 |
| M2 | n8n proxy path traversal | ✅ Fixed | L154: "path prefix strict match + double-dot 차단" — Step 4 scope |
| M3 | Frontmatter 74→76 NFR | ✅ Fixed | L13: "76 NFR" |
| L1 | Gemini remnants (L375, L1335) | ✅ Fixed | L385: `voyageai` (~~@google/genai~~ strikethrough). L1345: "Voyage AI voyage-3 1024d". grep confirms 0 active Gemini-as-provider references |
| L2 | FR total 116→123 | ✅ Fixed | L13, L59, L1337 all say "123" (v2:70 + v3:53). PRD frontmatter discrepancy flagged as carry-forward |

### Additional Fixes Verified (from other critics)

| Fix | Status | Evidence |
|-----|--------|----------|
| Hook 5개 (cost-tracker retained for SSE done.costUsd) | ✅ | L70: "Hook 5개" with nuanced explanation |
| n8n 8-layer everywhere | ✅ | L83, L232, L1342, L1360 — all say 8-layer, grep "6-layer" = 0 matches |
| Option B memory model consistent | ✅ | L86, L1345, L1349-1353, L1508 — all Option B, no stale "3-테이블" |
| soul-enricher.ts → `services/soul-enricher.ts` | ✅ | L166, L223 — explicit path with E8 safety note |
| Lower section FR/NFR counts reconciled | ✅ | L1337: "53개 신규, v2 70개", L1355: "76개 활성" |
| HNSW rebuild + CPU contention risks | ✅ | L145-146, L150-154 — 4 new risk items |

### R2 Dimension Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 8 | 9/10 | 10% | 0.90 | All specificity maintained. tool-sanitizer.ts path added. soul-enricher.ts explicit services/ path. |
| D2 | 7 | 9/10 | 25% | 2.25 | FR-UX added (20 areas complete). TOOLSANITIZE=3. Upper↔lower section reconciled. All 12 confirmed decisions intact. |
| D3 | 6 | 9/10 | 15% | 1.35 | All 5 count errors fixed. FR total 123 correct. NFR category sum now = 76 (17+9+9+3+7+7+3+11+3+3+3+1). **Minor pre-existing**: Scalability P0=5 in upper table, actual PRD count=4 (SC1/SC2/SC6/SC9). Inherited from v2 architecture — not introduced in Step 2. |
| D4 | 8 | 9/10 | 10% | 0.90 | tool-sanitizer.ts, soul-enricher.ts paths concrete. Option B memory model unambiguous. |
| D5 | 7 | 9/10 | 15% | 1.35 | Frontmatter 76 consistent. Upper↔lower reconciled. Gemini cleaned. Option B consistent throughout. Go/No-Go numbering matches PRD. |
| D6 | 8 | 9/10 | 25% | 2.25 | 4 new risk items added (HNSW rebuild memory, CI/CD+n8n CPU, Voyage migration schedule, proxy path traversal). All 3 sanitization chains documented with separate attack surface labels. |

### Weighted Average: 9.00/10 ✅ PASS (R1: 7.30 → R2: 9.00)

### Remaining Notes (2 LOW, informational)

**N1 [D3 LOW]**: Upper NFR table Scalability P0=5 (L99). Actual PRD count = 4 (SC1, SC2, SC6, SC9 are P0; SC3 is P1). Pre-existing v2 error — v2 architecture had "4 P0" for 7 items but actual was 3 P0. Step 2 correctly added SC9 P0 (+1) to inherited count, reaching 5. True value = 4. Carry-forward for next full NFR review.

**N2 [D3 LOW]**: Lower v3 NFR table COST3 P0 shown as "—" (L1364). PRD L2617 says NFR-COST3 is P0. Upper table correctly shows "Cost | 3 | 1" (1 P0). Lower table's "P0" column for COST3 should show "COST3 P0". Minor — does not affect upper table accuracy.

### Security R2 Assessment

| Security Area | R1 | R2 | Evidence |
|--------------|-----|-----|----------|
| PER-1 4-layer | ✅ | ✅ | L226 unchanged |
| MEM-6 4-layer | ✅ | ✅ | L227 unchanged |
| TOOLSANITIZE | ⚠️ | ✅ | L87: 3 FRs + tool-sanitizer.ts path + adversarial verify |
| N8N-SEC 8-layer | ✅ | ✅ | All 4 occurrences 8-layer, 0 stale "6-layer" |
| Advisory lock | ✅ | ✅ | L86, L202 |
| WS limits | ✅ | ✅ | L82, L163 |
| Voyage AI (no Gemini) | ⚠️ | ✅ | All Gemini-as-provider cleaned. L385 voyageai. L1345 Voyage AI 1024d |
| Token security | ✅ | ✅ | v2 section intact |
| Go/No-Go #9 | ✅ | ✅ | L89, L227 |
| Go/No-Go #11 | ⚠️ | ✅ | L89: "tool sanitization" correct |
| Proxy path traversal | — | ✅ NEW | L154: path normalization risk documented |
| Voyage migration risk | — | ✅ NEW | L153: bulk rate limit risk documented |

**12/12 security areas verified. 0 gaps.**

### Verdict

**[Verified] R2 = 9.00/10 PASS.** All 10 R1 issues fixed. Upper↔lower sections reconciled. Gemini fully cleaned. 4 new risk items strengthen D6. Two pre-existing LOW items (SC P0 count, COST3 P0 label) carried forward as informational — neither affects implementation correctness.
