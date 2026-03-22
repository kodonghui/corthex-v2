# Stage 2 Step 10 — Bob (Critic-C: Scrum Master) Review

**Section:** PRD L2085-2272 (## Project Scoping & Phased Development)
**Rubric Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%
**Focus:** Sprint planning, delivery risk, scope management, dependency tracking

---

## R1 Review

### Verified john's Check Points

1. **확정 결정 정합**: ✅ Comprehensive.
   - #2 n8n 2G: Not directly in Scoping (covered in Technical Architecture). Appropriate — Scoping is strategic, not implementation detail.
   - #5 30일 TTL: Not directly in Scoping. Covered in Domain Requirements (MEM-7). Appropriate.
   - #10 WebSocket 50/co: L2112 "Sprint 1~3 (activity_logs 데이터 필요)" — Sprint 4 dependency. NRT-5 not re-stated here but covered in Technical Architecture. Appropriate.
   - Sprint strategy table (L2107-2112) correctly maps Sprint 1~4 to Go/No-Go gates.

2. **Go/No-Go 게이트 정합**: ⚠️ Partial gap. Sprint strategy table (L2107-2112) references:
   - Sprint 1: #2 ✅
   - Sprint 2: #3 ✅
   - Sprint 3: #4, #7 ✅ — BUT missing **#9** (Observation Poisoning) and **#14** (Capability Evaluation)
   - Sprint 4: #5, #8 ✅
   - Cross-cutting gates (#1, #6, #12, #13) omitted — acceptable for per-Sprint table.
   - #9 and #14 are Sprint 3-specific gates that were added in Steps 5+8. See should-fix #1.

3. **Sprint 의존성**: ✅ Excellent. Sprint 순서 근거 (L2114-2118) is logically sound:
   - Sprint 1→2: soul-enricher.ts 주입 경로 선제 확보
   - Sprint 2 병렬: n8n Docker 독립 컨테이너
   - Sprint 3: DB migration + Sprint 1 경로 활용
   - Sprint 4: Sprint 1~3 activity_logs 데이터 필요
   - Sprint 1 지연 완화 (L2198): n8n Docker 병렬 착수 — 실용적

4. **리스크 구체성**: ✅ Good. v2 기술 리스크 4행 all have 확률/영향/완화. v3 추가 리스크 2행 have **분할 트리거** (Sprint 2 중간 리뷰) — actionable Scrum advice.

5. **오픈소스 목록**: ✅ Comprehensive. Phase 1~4 + v3 Sprint 1~4 + Phase 5+ + 직접 구현 유지. pg-boss "조건부" correctly defers to architecture decision. v3 직접 구현 목록 (L2256-2266) accurately reflects CORTHEX 고유 가치.

6. **Must-Have vs Nice-to-Have**: ⚠️ Partial gap. v2 Must-Have 6개 / Nice-to-Have 5개 well-classified. BUT no v3 Must-Have items. See should-fix #2.

7. **Cross-section 일관성**: ✅ Generally good. Sprint mapping matches Innovation (Step 8), Domain (Step 7). v3 여정 지원 테이블 (L2141-2150) aligns with User Journeys (Step 6). ⚠️ Sprint 2 overload count discrepancy — see should-fix #3.

---

### Should-Fix Items

**#1 Sprint 3 Go/No-Go Missing #9, #11, and #14** (L2111, D2/D5)
- Sprint strategy table lists Sprint 3 gates as `#4 + #7` only.
- **#9** (Observation Poisoning 4-layer E2E) is Sprint 3-specific — added in Step 5, confirmed by all 4 critics in Step 8.
- **#11** (Tool Sanitization — tool response 프롬프트 주입 방어) is Sprint 3-specific (L466).
- **#14** (Capability Evaluation — 3회차 재수정 ≤ 50%) is Sprint 3-specific — added in Step 8.
- The 14-gate list (L453-469) assigns all 3 to Sprint 3. Sprint 3 has **5 gates** (#4, #7, #9, #11, #14) — the most gate-heavy Sprint.
- Same pattern as Innovation Step 8 Fix 1 (Go/No-Go cross-reference expansion).
- **Updated per Winston M2 cross-talk**: originally flagged #9/#14 only, Winston correctly identified #11 as also missing.

**#2 Must-Have v3 Clarity** (L2152-2158, D2/D4)
- Must-Have list only covers v2 Phase 1-2 (6 items). Section title is "MVP 기능셋 (Phase 1~2)" so v3 omission is by design.
- v3 priority model is expressed differently: Sprint ordering + 독립 롤백 + Go/No-Go gates.
- **Minimum fix**: Add one-line note under Nice-to-Have: "v3 우선순위는 Sprint 순서로 결정 (§Sprint 전략 참조)" to eliminate ambiguity.
- **Updated per Sally cross-talk**: downgraded from structural gap to annotation fix. The information exists in the Sprint strategy table — just needs a cross-reference pointer.

**#3 Sprint 2 Overload Count "15건+"→"17건+"** (L2197, D3/D5)
- v3 추가 리스크 table says "Sprint 2 과부하 (15건+ 동시)"
- L2077 (Step 9 scope, just corrected) now says "17건+" (N8N-SEC 8건 + MKT 5건 + soul-enricher + etc.)
- Same propagation pattern: Step 9 L2077 was fixed but Step 10 L2197 wasn't updated.
- The discrepancy affects the split trigger assessment — 17 items is more severe than 15.

### Observations (non-blocking)

**#4** llm-cost-tracker (L2213) marked as "v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20". This is correctly flagged but still listed in Phase 1 table. Consider moving to a "deprecated" or "removed" annotation to avoid confusion during Sprint planning.

**#5** Sprint strategy table (L2107-2112) "블로커 조건" column is excellent Scrum practice — explicit criteria for when a Sprint is blocked, not just what it delivers.

**#6** v3 실패 시 전략 (L2120-2122) — Sprint별 독립 롤백 + Sprint 2.5 분할. This is the strongest risk mitigation pattern in the PRD. Each Sprint's isolation is well-designed.

**#7** Open-source "직접 구현 유지" list (L2256-2266) now includes v3 items (soul-enricher.ts, memory-reflection.ts, office-channel.ts, Hono proxy n8n). Complete and well-categorized.

**#8** pg-boss listed as "조건부" (L2244) while L2082 (Step 9 scope) mentions "BullMQ/pg-boss" — pg-boss is the preferred option (PostgreSQL native, no Redis → no Deferred Item D21 conflict). The open-source table correctly narrowed to pg-boss only. Minor inconsistency between sections but directionally correct.

**#9** Nice-to-Have list (L2160-2165) is all v2 Phase 3-4 items. No v3 Nice-to-Have items listed (e.g., /office 3D upgrade, advanced marketing analytics, memory export). Acceptable — v3 Nice-to-Have items would be Phase 5+ scope.

**#10** (Adopted from Sally m2) Sprint strategy table (L2107-2112) missing Pre-Sprint row. Pre-Sprint is a critical blocker (Voyage AI migration Go/No-Go #10, Neon Pro upgrade, design token). Sprint roadmap L430 includes it but the strategy table omits it.

**#11** (Adopted from Sally m4) v3 여정 지원 테이블 (L2141-2150) missing J2 (투자자 이사장 n8n result view, Sprint 2) and J3 (Human 직원 memory growth Sprint 3 + /office Sprint 4). User Journeys Step 6 documents these but Scoping table omits them.

**#12** (Adopted from Winston Q1 confirmation) L2082 "BullMQ/pg-boss" should narrow to "크론 오프셋 또는 pg-boss" — BullMQ requires Redis → conflicts with Deferred Item D21. L2244 (OSS table) already correctly lists pg-boss only. Cross-section inconsistency between L2082 (Step 9 scope) and L2244 (Step 10 scope).

**#13** (From Quinn Q2 + cross-talk consensus) Sprint 3 gate overload risk: 5 gates (#4, #7, #9, #11, #14) make Sprint 3 the most testing-intensive Sprint. Quinn's sequencing (Week 1 pipeline → Week 2 security → Week 3 evaluation) shows natural ordering, but 3 weeks is tight for solo dev. This risk is NOT in the v3 추가 리스크 table (L2193-2198) — only Sprint 2 overload is listed. Sprint 3 overload is arguably higher risk due to gate count.

**#14** (From Quinn/Winston consensus on Must-Have) v3 Must-Have should be explicit (Option a), not just annotation. Recommended 3 items: (1) Big Five 4-layer sanitization Sprint 1, (2) n8n 8-layer security Sprint 2, (3) Memory 3-stage E2E Sprint 3. Sprint 4 OpenClaw = Nice-to-Have (failure doesn't affect v2+v3 S1-S3).

---

### Scoring (R1)

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 8.5 | Sprint strategy table with Go/No-Go, blocker conditions, dependencies. Risk tables with probability/impact/mitigation. Open-source with specific versions. |
| D2 Completeness | 20% | 7.5 | Sprint 3 missing 2 gates (#9, #14). Must-Have missing v3 items. Otherwise comprehensive 4-subsection structure. |
| D3 Accuracy | 15% | 8.0 | Sprint dependencies logically sound. Open-source versions match Technical Architecture. Sprint 2 count "15건+" outdated (should be 17건+). |
| D4 Implementability | 15% | 8.0 | Sprint순서 근거 directly usable for planning. Sprint 2.5 split trigger actionable. v3 Must-Have absence slightly hinders Sprint planning. |
| D5 Consistency | 15% | 7.5 | Sprint 2 overload 15 vs 17. Sprint 3 gates incomplete vs 14-gate list. pg-boss vs BullMQ minor. |
| D6 Risk Awareness | 20% | 8.5 | v2 4+3+2 risks + v3 2 risks. Sprint 2.5 split trigger. Sprint 1 지연 병렬 완화. 독립 롤백 전략. Excellent. |

**Weighted Total: 8.5×0.15 + 7.5×0.20 + 8.0×0.15 + 8.0×0.15 + 7.5×0.15 + 8.5×0.20 = 8.05**

**R1 Score: 8.05/10 — PASS**

Strong section overall. The Sprint strategy table, dependency analysis, and risk mitigation are among the best in the PRD. The 3 should-fix items are all mechanical additions (gate references, count correction, v3 Must-Have subsection) — no structural changes needed.

---

### Fix Priority

1. **#1** (Sprint 3 Go/No-Go #9/#14) — Add to Sprint 3 row. ~1 cell edit.
2. **#2** (v3 Must-Have) — Add 3-4 v3 Must-Have items or reference Go/No-Go as v3 minimum bar. ~4 lines.
3. **#3** (Sprint 2 count 15→17) — Update risk table. ~1 word change.

All 3 are additive. Expected R2 path: 8.5+ PASS.

---

## R2 Review

### Fix Verification (7/7 verified ✅)

| Fix | Description | Verified |
|-----|-------------|----------|
| 1 | Sprint table Go/No-Go expansion + Pre-Sprint row (L2109-2115) | ✅ Pre-Sprint: #10/#6. Sprint 2: +#11. Sprint 3: +#9/#11/#14 = 5 gates total. 각주 "전 Sprint 공통 #1/#12/#13" 추가. 14-gate 완전 매핑 |
| 2 | L2208 "15건+" → "17건+" | ✅ N8N-SEC 8건 반영 |
| 3 | v3 Must-Have 4항목 추가 (L2165-2169) | ✅ #7 Big Five (#2), #8 n8n 8-layer (#3), #9 Memory E2E (#4/#7/#9), #10 PixiJS (#5/#8). Sprint+Go/No-Go 매핑 정확 |
| 4 | "Hook 5개" → "Hook 4개" (L2159) | ✅ cost-tracker GATE 제거 반영 |
| 5 | Sprint 3 게이트 과밀 리스크 행 추가 (L2209) | ✅ 5 gates 명시 + 완화: #9/#11 Sprint 2 선행, #14 회고 성격 |
| 6 | Voyage AI "신규" → "Pre-Sprint #10 마이그레이션 후 계속" (L2255) | ✅ Pre-Sprint→Sprint 3 연속성 명시 |
| 7 | v3 여정 J2/J3 추가 (L2152-2153) | ✅ J2 박과장 Sprint 2 n8n 결과, J3 투자자 Sprint 3 메모리+Sprint 4 /office |

### My Should-Fix Resolution

| Item | Fix | Status |
|------|-----|--------|
| #1 Sprint 3 Go/No-Go missing | Fix 1 | ✅ RESOLVED — 5 gates (#4/#7/#9/#11/#14) + Pre-Sprint row + 각주 |
| #2 Must-Have v3 clarity | Fix 3 | ✅ RESOLVED — 4 explicit v3 Must-Have items with Sprint+Go/No-Go mapping |
| #3 Sprint 2 count 15→17 | Fix 2 | ✅ RESOLVED |

### Cross-talk Items Resolution

| Critic | Item | Fix | Status |
|--------|------|-----|--------|
| Sally | m2 Pre-Sprint row | Fix 1 | ✅ |
| Sally | m4 J2/J3 journey | Fix 7 | ✅ |
| Winston | M2 Sprint 3 gates (#11 included) | Fix 1 | ✅ |
| Quinn | m5 v3 Must-Have | Fix 3 | ✅ |
| Quinn | Hook 5→4 | Fix 4 | ✅ |
| Quinn | Sprint 3 overload risk | Fix 5 | ✅ |
| Quinn | Voyage AI labeling | Fix 6 | ✅ |

### Residuals (non-blocking, 2건)

1. **L2082 "BullMQ/pg-boss"** — Step 9 scope. Open-source table (L2244, Step 10) correctly narrows to pg-boss only. L2082 still mentions BullMQ — will be caught if Step 9 gets a global sweep. Not a Step 10 issue.

2. **Sprint 4 Must-Have #10 vs Nice-to-Have tension** — v3 Must-Have #10 lists PixiJS/office as Must-Have, but L2124 says "Sprint 4 실패 시 해당 Layer만 비활성화". Winston/Quinn suggested Sprint 4 could be Nice-to-Have. john resolved by making it Must-Have with independent rollback — meaning it's "Must-Have to attempt, Nice-to-Have to succeed". Pragmatic interpretation. Acceptable.

### R2 Scoring

| Dimension | Weight | R1 | R2 | Delta |
|-----------|--------|-----|-----|-------|
| D1 Specificity | 15% | 8.5 | 9.0 | +0.5 |
| D2 Completeness | 20% | 7.5 | 9.0 | +1.5 |
| D3 Accuracy | 15% | 8.0 | 9.0 | +1.0 |
| D4 Implementability | 15% | 8.0 | 9.0 | +1.0 |
| D5 Consistency | 15% | 7.5 | 9.0 | +1.5 |
| D6 Risk Awareness | 20% | 8.5 | 9.5 | +1.0 |

**Weighted R2: 9.0×0.15 + 9.0×0.20 + 9.0×0.15 + 9.0×0.15 + 9.0×0.15 + 9.5×0.20 = 9.10**

**R2 Score: 9.10/10 — ✅ PASS (FINAL)**

Biggest improvements: D2 (+1.5, Sprint 3 5-gate complete + v3 Must-Have 4 items) and D5 (+1.5, 17건+ count + 14-gate Sprint mapping consistent). D6 (+1.0) from Sprint 3 overload risk addition — now both Sprint 2 AND Sprint 3 overload risks are documented. This is the highest-scoring section so far, reflecting the strong strategic foundation that was already present in R1.
