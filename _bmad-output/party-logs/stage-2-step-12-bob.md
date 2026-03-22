# Stage 2 Step 12 — Bob (Critic-C: Scrum Master) Review

**Section:** PRD L2499-2647 (## Non-Functional Requirements)
**Rubric Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%
**Focus:** Sprint planning, delivery risk, scope management, dependency tracking

---

## R1 Review

### Verified john's Check Points

1. **확정 결정 정합**: ⚠️ Partial gap.
   - #2 n8n 2G: NFR-SC9 "≤ 2G RAM (Brief mandate), ≤ 2 CPU, NODE_OPTIONS=--max-old-space-size=1536" ✅
   - #3 n8n 8-layer: NFR-S9 "N8N-SEC-1~8 100% 통과" with all 8 layers enumerated ✅
   - #5 30일 TTL: NFR-D8 "reflected=true observations 30일 TTL (MEM-7, 확정 결정 #5)" ✅
   - #8 Observation Poisoning: ⚠️ No Security NFR for MEM-6. See should-fix #1.
   - #9 Advisory lock: NFR-O10 "advisory lock(동시 실행 방지)" ✅
   - #10 WebSocket: NFR-SC8 "50 + 서버 500 + oldest 연결 해제 (NRT-5, 확정 결정 #10)" ✅

2. **FR ↔ NFR 연동**: ⚠️ Partial gap.
   - NFR-D8 → FR-MEM13 cross-reference ✅ explicit
   - NFR-COST3 → FR-MEM14 cross-reference ✅ (via Go/No-Go #7)
   - NFR-S8 → PER-1 ✅, but no NFR for MEM-6 → FR-MEM12 linkage. See should-fix #1.
   - NFR-O10 → FR-MEM3 advisory lock ✅
   - NFR-P16 → FR-MEM3 reflection cron performance ✅
   - NFR-SC8 → FR-OC2 WebSocket ✅

3. **측정 가능성**: ✅ Excellent. All 74 active NFRs have quantifiable targets with measurement methods specified. NFR-P5 (API P95 baseline), NFR-O4/O5/O6 (A/B test protocols with sample size + scoring), NFR-COST3 ($0.10/day threshold) — all objectively measurable.

4. **우선순위 정합**: ✅ Verified.
   - P0 count: 21 (I counted: P5/P6/P8/P13 + S1-S6/S8/S9 + SC1/SC2/SC6/SC9 + EXT1/EXT2 + O4 + COST3 + B1 = 21) ✅
   - P1 count: 42 ✅
   - P2 count: 10 ✅
   - CQ: 1, Deleted: 2 (S7, D7) ✅
   - Sprint-specific P0s: NFR-S8 Sprint 1, NFR-S9/SC9 Sprint 2, NFR-COST3 Sprint 3, NFR-P13 Sprint 4 — correctly aligned to Sprint gate schedule.

5. **Go/No-Go 연동**: ✅ Generally good.
   - NFR-P13 → Go/No-Go #5 (PixiJS bundle) ✅
   - NFR-COST3 → Go/No-Go #7 (Reflection cost) ✅
   - NFR-S9 → Go/No-Go #3 (n8n security) — implicit but inferable
   - NFR-SC8 → 확정 결정 #10 ✅ explicit

6. **GATE 결정 반영**: ✅ NFR-S7 (cost-tracker) and NFR-D7 (비용 보관) properly deleted with strikethrough + reason. CLI Max 월정액 GATE 2026-03-20 consistent.

7. **수치 일관성**: ✅ Spot-checked:
   - 200KB: NFR-P4 "허브 ≤ 200KB" + NFR-P13 "PixiJS ≤ 200KB" — consistent with FR-OC1, Go/No-Go #5
   - 50MB: NFR-SC2 "세션당 ≤ 50MB" + NFR-P7 "메모리 ≤ 50MB" — consistent
   - $0.10: NFR-COST3 = Go/No-Go #7 = FR-MEM14 — consistent
   - 50/500: NFR-SC8 = NRT-5 = FR-OC2 = 확정 결정 #10 — consistent
   - 2G: NFR-SC9 = FR-N8N4 SEC-5 = 확정 결정 #2 — consistent

8. **v3 NFR 완전성**: ⚠️ Partial gap. See should-fix #1.
   - Sprint 1: NFR-S8 (PER-1), NFR-A5 (Big Five 슬라이더) ✅
   - Sprint 2: NFR-S9 (n8n 8-layer), NFR-SC9 (Docker 리소스), NFR-O9 (health check), NFR-P17 (MKT E2E) ✅
   - Sprint 3: NFR-COST3 (Reflection 비용), NFR-P16 (크론 성능), NFR-O10 (크론 안정), NFR-D8 (TTL) ✅ — but missing MEM-6 Security NFR
   - Sprint 4: NFR-P13/P14/P15 (/office 성능), NFR-SC8 (WS 부하), NFR-A6/A7 (/office 접근성) ✅

---

### Should-Fix Items

**#1 Security NFR Missing MEM-6 Observation Sanitization** (D2/D5/D6)
- NFR-S8 covers PER-1 personality sanitization: "4-layer 100% 통과 | 🔴 P0 | Sprint 1"
- No equivalent NFR for **MEM-6** observation content sanitization.
- FR-MEM12 (Step 11 Fix 1) defines the feature. Go/No-Go #9 defines the gate (10종 100% 차단). Compliance section (L2010-2019) details the defense chain.
- But the Security NFR section — the canonical quality requirements location — has no entry.
- **Pattern**: NFR-S8 (PER-1, Sprint 1) → NFR-S?? (MEM-6, Sprint 3) — missing peer.
- MEM-6 is a **more dangerous** attack surface than PER-1 (free-text vs bounded integer, per Compliance L2012). If PER-1 warrants a P0 Security NFR, MEM-6 must as well.
- Same gap pattern as Step 11 FR section (FR-MEM12 was missing) and Step 9 Compliance section (MEM-6 was missing). Third section with same omission.
- Proposed: `NFR-S10 | observation content sanitization | MEM-6 4-layer 100% 통과 + 10종 adversarial payload 100% 차단 (Go/No-Go #9, 확정 결정 #8). PER-1과 별개 공격 체인 | 🔴 P0 | Sprint 3`

**#2 NFR-COST2 Voyage AI Phase "4" Stale** (L2614, D3/D5)
- NFR-COST2: "Voyage AI Embedding | 월 $5 이하 (문서 1,000건 기준) | P2 | **4**"
- Step 9 Fix 9 already corrected Voyage AI from "Phase 4" to "Pre-Sprint→유지" in the integration table (L1892). NFR-COST2 wasn't updated.
- Voyage AI is used from Pre-Sprint (Go/No-Go #10 migration) through Sprint 3 (observation + reflection embedding, FR-MEM2/MEM5).
- "문서 1,000건 기준" scope only covers knowledge_docs — Sprint 3 observation embeddings (every agent execution = 1 observation) create additional volume not in this estimate.
- Same propagation pattern: Step 9 integration table fixed but NFR section wasn't updated. Seen in Steps 7-11 (4G→2G, 15→17, 20→50, N8N-SEC 6→8).
- Phase should be "Pre-Sprint→유지" and scope should include observations cost estimate.

### Observations (non-blocking)

**#3** NFR-S9 (L2537) is the most detailed NFR in the section — all 8 security layers enumerated with specific mechanisms. Directly testable with Go/No-Go #3. Model for complex security NFRs.

**#4** NFR-P15 (L2521) /ws/office heartbeat has excellent design: "적응형 간격 idle 30초 / active 5초" + "WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개" — clear distinction between transport-level heartbeat and application-level state transitions. Sprint 4 planner can implement directly.

**#5** NFR-O4 (L2601) "응답 품질 유지" — A/B blind test with 2 evaluators, 5-point scale, 10 prompts. This is the only NFR with a human evaluation protocol. Good scientific rigor for subjective quality measurement.

**#6** NFR-D8 (L2584) correctly distinguishes two retention policies: observations TTL (30일) vs agent_memories(reflection) 무기한 보관. Explicitly cross-references FR-MEM13. Good Option B compliance.

**#7** NFR-COST3 (L2615) "Stage 1 추정: ~$0.06/day" — the only NFR with a pre-validation estimate. Provides Sprint 3 developer with confidence that the $0.10 ceiling has margin (~40%).

**#8** P0 count analysis: 21 P0 NFRs across 12 categories. Sprint distribution:
- Phase 1/유지: 14 (core security + performance + stability)
- Sprint 1: 1 (PER-1)
- Sprint 2: 2 (n8n security + Docker resources)
- Sprint 3: 1 (Reflection cost)
- Sprint 4: 1 (PixiJS bundle)
- Cross-cutting: 2 (Chrome + 응답 품질)
Sprint 3 has the fewest Sprint-specific P0 (1), which is surprising given it's the most gate-heavy Sprint (5 gates). Adding MEM-6 Security NFR (should-fix #1) would bring it to 2.

**#9** NFR-A5 Big Five 슬라이더 접근성 (L2569) correctly mirrors FR-PERS9 (Step 11 Fix 7). "aria-valuenow + Arrow keys" — both FR and NFR aligned. Good FR↔NFR linkage.

**#10** TOOLSANITIZE has no Security NFR entry — FR-TOOLSANITIZE3 includes "10종 100% 차단율" quality target within the FR itself. Pattern inconsistency with NFR-S8/S9 (where quality targets are in NFR, not FR). Acceptable since information is present, but less structured for Sprint planning — a QA tester looking only at NFR-S won't find tool response sanitization requirements.

**#11** NFR-SC7 "pgvector HNSW 인덱스 포함 ≤ 3GB (PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB)" — Sprint 3 will add observation + reflection embeddings to pgvector. This 3GB ceiling should remain achievable (observations are text-heavy but embedding dimension is fixed 1024d), but Sprint 3 planner should validate with projected observation volume.

**#12** NFR table structure inconsistency: Performance (L2505-2523) has 6 columns (ID/요구사항/목표/측정/우선순위/Phase), Security (L2527-2537) has 5 columns (no 측정), others vary. The inconsistency doesn't affect usability — security NFRs have testing embedded in the 목표 column — but a consistent 6-column format would be cleaner for Sprint planning extraction.

**#13** (Adopted from Sally m2) NFR-A5 `aria-label` vs FR-PERS9 `aria-valuetext` inconsistency. FR-PERS9 (L2466): `aria-valuenow` + `aria-valuetext`. NFR-A5 (L2569): `aria-valuenow` + `aria-label`. PER-5 (L1472): `aria-valuenow` only. These are different ARIA attributes — both needed but currently inconsistent across 3 locations. NFR-A5 should include both `aria-label` (element name) + `aria-valuetext` (value meaning) to align with FR-PERS9.

**#14** (Adopted from Sally m3) Go/No-Go #13 CEO daily task path has no matching NFR. #13 (L468): "CEO: /office→에이전트 식별→Chat→태스크→/office 확인, 5분 이내". NFR-O7 = Admin 온보딩 (15분), NFR-O8 = CEO NEXUS (10분) — neither covers the CEO daily workflow. Gap between gate criteria and NFR coverage.

---

### Scoring (R1)

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 9.0 | All 74 NFRs have quantifiable targets with measurement methods. NFR-S9 8-layer enumeration, NFR-P15 adaptive heartbeat, NFR-O4 A/B protocol. |
| D2 Completeness | 20% | 8.0 | 12 categories comprehensive. P0/P1/P2 counts verified (21/42/10). MEM-6 Security NFR missing. COST2 scope limited to knowledge_docs. |
| D3 Accuracy | 15% | 8.0 | Proactive fixes all verified (SC8 50/500, S9 8-layer, D8 Option B). COST2 Phase "4" stale (should be Pre-Sprint→유지). |
| D4 Implementability | 15% | 8.5 | Sprint-specific NFRs clearly mapped. Go/No-Go linkage explicit for key NFRs. NFR-P5 baseline protocol actionable. |
| D5 Consistency | 15% | 7.5 | MEM-6 Security NFR missing (PER-1 has one, MEM-6 doesn't). COST2 Phase "4" vs integration table "Pre-Sprint→유지". TOOLSANITIZE quality target in FR not NFR. |
| D6 Risk Awareness | 20% | 8.0 | MEM-6 absent from Security NFR — same gap as Steps 9/11. COST3 $0.10 with $0.06 estimate margin. SC9 2G Brief mandate. O10 advisory lock. |

**Weighted Total: 9.0×0.15 + 8.0×0.20 + 8.0×0.15 + 8.5×0.15 + 7.5×0.15 + 8.0×0.20 = 8.10**

**R1 Score: 8.10/10 — PASS (Grade A threshold)**

Strong section. The NFR structure is well-organized with 12 categories, 74 active items, and clear priority tiering. Measurement methods are consistently provided. The 2 should-fix items are both **additive** — MEM-6 Security NFR (#1) follows the exact NFR-S8 template, and COST2 Phase update (#2) is a 2-word change. The section's main strength is its comprehensive v3 Sprint mapping and quantifiable targets.

---

### Fix Priority

1. **#1** (MEM-6 Security NFR) — Add NFR-S10 following NFR-S8 pattern. ~1 row.
2. **#2** (COST2 Phase + scope) — Update Phase "4"→"Pre-Sprint→유지" + add observation embedding scope. ~1 cell edit.

Both are additive. Expected R2 path: 8.5+ PASS.

---

## R2 Review

### Fix Verification (6/6 verified ✅)

| Fix | Description | Verified |
|-----|-------------|----------|
| 1 | NFR-S10 추가 — MEM-6 observation sanitization (L2538) | ✅ "MEM-6 4-layer 100% 통과 + 10종 adversarial 100% 차단. Go/No-Go #9, 확정 #8. PER-1(NFR-S8)과 별개 공격 체인 — FR-MEM12 품질 기준." 🔴 P0 Sprint 3. 3대 sanitization chain 전부 NFR/FR 품질 게이트 확보 |
| 2 | NFR-A5 ARIA attributes 정합 (L2570) | ✅ "aria-valuenow + aria-valuetext (값 의미 설명) + aria-label (슬라이더 특성명) + Arrow keys. FR-PERS9 정합" — 두 ARIA 속성 통합 + FR 교차 참조 |
| 3 | NFR-COST2 Phase + scope 확장 (L2616) | ✅ Phase "Pre-Sprint~Sprint 4" + "knowledge docs + observations/reflections 임베딩 포함. Pre-Sprint Go/No-Go #10 마이그레이션 후 계속" — Step 9 Fix 9 integration table과 정합 |
| 4 | NFR-SC7 Phase "4"→"Sprint 3~4" (L2550) | ✅ "Sprint 3 observations + agent_memories VECTOR(1024) HNSW 추가 시 측정 시작" — Sprint 3 메모리 영향 측정 시점 명시 |
| 5 | NFR-P4 Go/No-Go #5 참조 수정 (L2510) | ✅ "(Brief §4). Go/No-Go #5는 PixiJS 번들 전용 (NFR-P13)" — #5 범위 명확화 |
| 6 | NFR-O11 추가 — CEO 일상 태스크 (L2609) | ✅ "/office→에이전트 식별→Chat→태스크→/office 확인 ≤ 5분 (Go/No-Go #13). NFR-O7·O8과 별개" P1 전체 |

### My Should-Fix Resolution

| Item | Fix | Status |
|------|-----|--------|
| #1 Security NFR MEM-6 | Fix 1 | ✅ RESOLVED — NFR-S10 P0 Sprint 3, 4-layer + 10종 adversarial |
| #2 NFR-COST2 Phase + scope | Fix 3 | ✅ RESOLVED — "Pre-Sprint~Sprint 4" + observations/reflections 포함 |

### Cross-talk Items Resolution

| Critic | Item | Fix | Status |
|--------|------|-----|--------|
| Winston | M1 MEM-6 quality NFR | Fix 1 | ✅ NFR-S10 |
| Winston | M2 SC7 Phase | Fix 4 | ✅ Sprint 3~4 |
| Sally | m2 A5 aria-valuetext | Fix 2 | ✅ aria-valuenow + valuetext + label 통합 |
| Sally | m3 CEO daily task NFR | Fix 6 | ✅ NFR-O11, Go/No-Go #13 |
| Sally | m4 COST2 Phase (adopted from Bob) | Fix 3 | ✅ |
| Quinn | m1 MEM-6 quality | Fix 1 | ✅ |
| Quinn | m2 P4 Go/No-Go #5 | Fix 5 | ✅ |
| Quinn | m4 COST2 scope | Fix 3 | ✅ |

### Priority Count Verification

| Priority | R1 | R2 | Delta |
|----------|-----|-----|-------|
| 🔴 P0 | 21 | 22 | +1 (NFR-S10) |
| P1 | 42 | 43 | +1 (NFR-O11) |
| P2 | 10 | 10 | — |
| CQ | 1 | 1 | — |
| ~~삭제~~ | 2 | 2 | — |
| **총 활성** | **74** | **76** | **+2** (v3 16→18) |

✅ Summary table (L2643-2648) matches: 22/43/10/1/2 = 76.

### Residuals (non-blocking, 2건)

1. **TOOLSANITIZE quality target asymmetry** — PER-1 target in NFR-S8, MEM-6 target in NFR-S10, but TOOLSANITIZE 100% target only in FR-TOOLSANITIZE3 (not in NFR-S). Quinn confirmed acceptable — information exists, QA plan should consolidate at implementation. Not worth adding NFR-S11 for duplication.

2. **PER-5 (L1472) aria attributes still partial** — Domain Requirements PER-5 only lists "aria-valuenow, aria-valuemin=0, aria-valuemax=100" — no aria-valuetext or aria-label. FR-PERS9 and NFR-A5 are now aligned, but PER-5 lags. Cross-section residual — will be caught if Domain Requirements gets reviewed.

### R2 Scoring

| Dimension | Weight | R1 | R2 | Delta |
|-----------|--------|-----|-----|-------|
| D1 Specificity | 15% | 9.0 | 9.0 | 0 |
| D2 Completeness | 20% | 8.0 | 9.5 | +1.5 |
| D3 Accuracy | 15% | 8.0 | 9.0 | +1.0 |
| D4 Implementability | 15% | 8.5 | 9.0 | +0.5 |
| D5 Consistency | 15% | 7.5 | 9.0 | +1.5 |
| D6 Risk Awareness | 20% | 8.0 | 9.5 | +1.5 |

**Weighted R2: 9.0×0.15 + 9.5×0.20 + 9.0×0.15 + 9.0×0.15 + 9.0×0.15 + 9.5×0.20 = 9.20**

**R2 Score: 9.20/10 — ✅ PASS (FINAL)**

Biggest improvements: D2 (+1.5, NFR-S10 completes 3-chain security coverage + NFR-O11 fills Go/No-Go #13 gap + COST2 scope expansion), D5 (+1.5, MEM-6 NFR symmetry with PER-1 + COST2 Phase alignment + A5 aria attributes FR↔NFR unified), D6 (+1.5, MEM-6 observation sanitization now has dedicated P0 NFR — all 12 confirmed decisions have NFR backing). This section's R2 ties with Step 11 FR at 9.20, reflecting the comprehensive additive fixes — 2 new NFRs + 4 amendments addressing all 4 critics' findings.
