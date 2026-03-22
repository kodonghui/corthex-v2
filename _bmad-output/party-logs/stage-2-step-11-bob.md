# Stage 2 Step 11 — Bob (Critic-C: Scrum Master) Review

**Section:** PRD L2285-2494 (## Functional Requirements)
**Rubric Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%
**Focus:** Sprint planning, delivery risk, scope management, dependency tracking

---

## R1 Review

### Verified john's Check Points

1. **확정 결정 정합**: ✅ Comprehensive.
   - Option B: FR-MEM4 "agent_memories memoryType='reflection'" ✅, FR-MEM8 "observations 테이블과 agent_memories(reflection)" ✅. Proactive fix 5건 all verified.
   - n8n 2G: FR-N8N4 "memory: 2G, cpus: '2', NODE_OPTIONS=--max-old-space-size=1536 (Brief 필수, 4G=OOM 확정)" ✅
   - WebSocket 50/co: FR-OC2 "회사별 최대 50개, 서버 전체 500개 — NRT-5, 확정 결정 #10" ✅
   - Advisory lock: Not in FR-MEM section — see should-fix #2.

2. **Phase/Sprint 매핑**: ✅ Generally accurate.
   - v2 FRs: Phase 1 (FR1-10, FR23, FR38, FR40-45, FR48), Phase 2 (FR11-22, FR24-29, FR32-33, FR46-47, FR49, FR59-68), Phase 3 (FR30-31, FR34-36), Phase 4 (FR50-58), Phase 5+ (FR69-72).
   - v3 FRs: Sprint 1 (FR-PERS1-8), Sprint 2 (FR-N8N1-6, FR-MKT1-7, FR-TOOLSANITIZE1-3), Sprint 3 (FR-MEM1-11), Sprint 4 (FR-OC1-11), 병행 (FR-UX1-3).
   - ⚠️ FR-TOOLSANITIZE1-3 = Sprint 2 but Go/No-Go #11 = Sprint 3. See should-fix #1.

3. **Go/No-Go 연동**: ⚠️ Partial gap.
   - FR-OC1 references Go/No-Go #5 (bundle) ✅
   - FR-OC2 references 확정 결정 #10 ✅
   - FR-MEM4 references NFR-COST3 (Haiku cost) → Go/No-Go #7 connection implicit
   - FR-TOOLSANITIZE3 mentions "PER-1과 별도" but doesn't reference Go/No-Go #11
   - FR-MEM section doesn't reference Go/No-Go #9 (Obs Poisoning) or #14 (Capability Eval)

4. **FR 완전성**: ✅ Comprehensive. 70 v2 FRs + 49 v3 FRs = 119 total. All User Journeys and Domain Requirements appear to have corresponding FRs.

5. **GATE 결정 반영**: ✅ FR37/FR39 properly deleted with strikethrough + reason. "Hook 4개" (was 5) in Scoping reflects GATE deletion.

6. **Cross-section 일관성**: ⚠️ See should-fix #2 (MEM-2 trigger conditions).

7. **Option B 정합**: ✅ All 5 proactive fixes verified. No "reflections 테이블" residuals in FR section.

---

### Should-Fix Items

**#1 FR-TOOLSANITIZE Sprint vs Go/No-Go #11 Mismatch** (L2481-2485, D5)
- FR-TOOLSANITIZE1-3 are all `[Sprint 2]`.
- Go/No-Go #11 (Tool Sanitization) is assigned to **Sprint 3** (L466).
- Sprint strategy table (Step 10 Fix 1) shows #11 in Sprint 2 AND Sprint 3 ("계속").
- This creates ambiguity: are the FRs implemented in Sprint 2 but the gate verified in Sprint 3? If so, the FRs should note this: `[Sprint 2, Go/No-Go #11 검증 Sprint 3]`.
- Or should FR-TOOLSANITIZE be split: basic detection (Sprint 2) + full adversarial verification (Sprint 3)?
- Currently a Sprint planner reading FRs would think Tool Sanitization is Sprint 2 complete, while the gate says Sprint 3.

**#2 FR-MEM3 Trigger Conditions Incomplete vs MEM-2** (L2471, D1/D5)
- FR-MEM3: "에이전트별 미처리 관찰 20개 누적 시 자동 실행"
- MEM-2 (L1480): "일 1회 크론 (새벽 3시) + reflected=false ≥ 20 AND 조건. confidence ≥ 0.7 우선. Tier별 한도. advisory lock"
- FR-MEM3 is missing 4 critical conditions:
  1. **일 1회 크론** — FR implies event-triggered (20개 누적 시), MEM-2 says daily cron that checks the 20 threshold
  2. **confidence ≥ 0.7** filter
  3. **Tier별 한도** (Tier 3-4: 주 1회 cap)
  4. **advisory lock** (확정 결정 #9)
- These are functional requirements, not NFRs — they define how the feature works. Sprint 3 developers using FR-MEM3 alone would implement wrong trigger logic.

**#3 FR-MEM1 Missing MEM-6 Sanitization Reference** (L2469, D6)
- FR-MEM1: "에이전트 실행 완료 시 결과가 observations 테이블에 자동 저장된다"
- No mention of MEM-6 4-layer sanitization before storage (10KB cap + control char strip + prompt hardening + content classification).
- MEM-6 is a Go/No-Go #9 requirement. The FR should state: "저장 전 MEM-6 4-layer 콘텐츠 방어 적용 (§Compliance 참조)"
- Without this, observation storage FR appears to accept raw content without sanitization — a security gap in the functional contract.

### Observations (non-blocking)

**#4** FR-N8N4 (L2440) is exceptionally detailed — 5 security constraints in a single FR with implementation specifics. This is the most Sprint-planning-ready FR in the section. Good model for other complex FRs.

**#5** FR-OC7 (L2429) correctly identifies LISTEN/NOTIFY vs polling fallback for Neon serverless. This deferred decision is properly annotated with "Sprint 4 착수 전 검증 필수". Good risk management.

**#6** FR-PERS2 (L2459) has the most detailed validation spec: Zod schema + DB CHECK + prompt injection defense in one FR. Directly implementable.

**#7** FR-MKT2 (L2449) is dense but complete — 6-stage pipeline + partial failure handling + multi-platform. Sprint 2 workload implications are significant (this alone could be a Sprint).

**#8** FR-MEM9 (L2477) "성장 지표" — success metric defined as `observations.outcome='success'`. This is the only FR that defines its own success measurement. Good practice.

**#9** v2 FR numbering gap: FR37/FR39 deleted but numbers not re-used. This is correct — maintaining original numbering prevents confusion in references.

**#10** FR-UX1-3 (L2489-2493) "병행" — running parallel across all Sprints. Well-scoped: redirect compatibility (FR-UX2) + 100% feature parity (FR-UX3) as explicit requirements.

**#11** (Adopted from Winston M1 — upgraded) MEM-6 should be a **separate FR** (FR-MEM12), not just a reference in FR-MEM1. L2287 "여기에 없는 기능은 존재하지 않는다" is the deciding factor. MEM-6 4-layer observation defense = functional behavior, not just a domain constraint. My original #3 was "add reference" — Winston correctly escalated to "add FR".

**#12** (Adopted from Winston M2) MEM-7 30-day TTL missing as FR. Confirmed decision #5. FR-MEM3 precedent: automated cron behavior is FR-level. TTL cron (reflected=true 30일 후 삭제 + Admin 보존 정책) should be FR-MEM13.

**#13** Sprint 3 FR count analysis: Current 11 FRs + MEM-12 (MEM-6) + MEM-13 (TTL) = 13. Combined with 5 Go/No-Go gates = highest compound workload. Not yet split-worthy (pipeline is sequential), but validates Step 10's Sprint 3 overload risk entry.

**#14** (Adopted from Sally m3) FR-PERS missing accessibility FR — Go/No-Go L601 requires slider keyboard navigation + aria-valuenow. FR-PERS1 defines the slider but doesn't specify a11y requirements. Should add FR-PERS9 or annotate FR-PERS1.

**#15** (Adopted from Quinn m3) FR-N8N4 covers N8N-SEC 1-5 only (5/8 layers). Missing from FR: HMAC webhook verification (SEC-4 partially), credential encryption (SEC-7), n8n API rate limit 60/min (SEC-8). Sprint 2 acceptance criteria would miss 3 security layers. Integration table (L1901, Step 9) lists all 8 but FR doesn't match.

---

### Scoring (R1)

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 8.5 | FR-N8N4, FR-PERS2, FR-OC7 exceptionally detailed. FR-MEM3 trigger conditions incomplete. |
| D2 Completeness | 20% | 7.5 | 119 FRs comprehensive. FR-MEM3 missing 4 MEM-2 conditions. FR-MEM1 missing MEM-6 sanitization. |
| D3 Accuracy | 15% | 8.0 | Option B compliance verified. Phase/Sprint assignments accurate. FR-TOOLSANITIZE Sprint vs gate mismatch. |
| D4 Implementability | 15% | 8.0 | FR-N8N4/PERS2 directly implementable. FR-MEM3 would lead to wrong implementation without MEM-2 cross-ref. |
| D5 Consistency | 15% | 7.5 | TOOLSANITIZE Sprint 2 vs #11 Sprint 3. FR-MEM3 vs MEM-2 trigger discrepancy. |
| D6 Risk Awareness | 20% | 7.5 | FR-MEM1 missing security sanitization (MEM-6). FR-MEM7 pgvector fallback good. FR-OC8 isolation good. TOOLSANITIZE gate timing unclear. |

**Weighted Total: 8.5×0.15 + 7.5×0.20 + 8.0×0.15 + 8.0×0.15 + 7.5×0.15 + 7.5×0.20 = 7.83**

**R1 Score: 7.83/10 — FAIL (< 8.0, Grade A threshold)**

Close to passing. The FRs are comprehensive and well-structured — 119 total with excellent detail on security (FR-N8N4), validation (FR-PERS2), and fallback (FR-MEM7). The failures are concentrated in the **Memory subsection** (FR-MEM1 missing MEM-6, FR-MEM3 missing 4 trigger conditions) and the **TOOLSANITIZE Sprint timing**. All 3 are cross-reference additions, not structural rewrites.

---

### Fix Priority

1. **#2** (FR-MEM3 trigger conditions) — Add 4 MEM-2 conditions. Most impactful: wrong trigger = wrong implementation. ~2-3 lines.
2. **#3** (FR-MEM1 MEM-6 reference) — Add sanitization before storage. ~1 clause.
3. **#1** (TOOLSANITIZE Sprint timing) — Clarify Sprint 2 impl + Sprint 3 gate. ~1 annotation per FR.

All 3 are additive. Expected R2 path: 8.5+ PASS.

---

## R2 Review

### Fix Verification (8/8 verified ✅)

| Fix | Description | Verified |
|-----|-------------|----------|
| 1 | FR-MEM12 추가 — Observation 4-layer 방어 (L2481) | ✅ 10KB + 제어문자 + 프롬프트 하드닝 + 콘텐츠 분류. Admin 플래그 + 감사 로그. Go/No-Go #9, 확정 #8. PER-1/TOOLSANITIZE와 별개 공격 표면 명시 |
| 2 | FR-MEM13 추가 — 30일 TTL (L2482) | ✅ reflected=true 자동 삭제 + Admin 보존 기간 조정. MEM-7, 확정 #5 |
| 3 | FR-MEM14 추가 — 비용 자동 차단 (L2483) | ✅ 일일 한도 초과 → 크론 자동 중지 + Admin 알림 + 확인 후 재개. ECC 2.2, Go/No-Go #7 |
| 4 | FR-MEM3 트리거 조건 보완 (L2472) | ✅ 일 1회 크론 + reflected=false ≥ 20 AND + confidence ≥ 0.7 + Tier 한도 + advisory lock(확정 #9) + ECC 2.2 auto-pause. R1 4개 누락 조건 전부 반영 |
| 5 | FR-N8N4 SEC-4/7/8 추가 (L2440) | ✅ HMAC webhook(4), AES-256-GCM credential encryption(7), rate limit 60/min(8) — 8/8 layer 완전 반영 |
| 6 | FR-TOOLSANITIZE3 Sprint 명확화 (L2489) | ✅ "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]" — 구현 Sprint ≠ 검증 Sprint 패턴 명시 |
| 7 | FR-PERS9 추가 — 슬라이더 접근성 (L2466) | ✅ 키보드 ←→ + aria-valuenow + aria-valuetext |
| 8 | FR-MEM1 MEM-6 참조 추가 (L2470) | ✅ "MEM-6 4-layer 방어 적용 후 자동 저장. 방어 실패 시 저장 거부 + 감사 로그" |

### My Should-Fix Resolution

| Item | Fix | Status |
|------|-----|--------|
| #1 FR-TOOLSANITIZE Sprint timing | Fix 6 | ✅ RESOLVED — "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]" |
| #2 FR-MEM3 trigger conditions | Fix 4 | ✅ RESOLVED — 4개 누락 조건 전부 반영 (daily cron, confidence, Tier, advisory lock) + ECC 2.2 |
| #3 FR-MEM1 MEM-6 reference | Fix 8 + Fix 1 | ✅ RESOLVED — FR-MEM1 참조 + FR-MEM12 별도 FR (Winston 상향) |

### Cross-talk Items Resolution

| Critic | Item | Fix | Status |
|--------|------|-----|--------|
| Winston | M1 MEM-6 separate FR | Fix 1 | ✅ FR-MEM12 — L2287 기준 별도 FR |
| Winston | M2 MEM-7 TTL FR | Fix 2 | ✅ FR-MEM13 — 확정 #5 |
| Sally | m3 FR-PERS a11y | Fix 7 | ✅ FR-PERS9 — aria-valuenow + 키보드 |
| Sally | m4 FR-MEM3 trigger | Fix 4 | ✅ "무엇을 vs 어떻게" framework 반영 |
| Quinn | m3 FR-N8N4 5/8→8/8 | Fix 5 | ✅ SEC-4/7/8 추가 |
| Quinn | m5 TOOLSANITIZE Sprint | Fix 6 | ✅ 구현 vs 검증 분리 표기 |
| Quinn | ECC 2.2 cost auto-pause | Fix 3 + Fix 4 | ✅ FR-MEM14 별도 FR + FR-MEM3 auto-pause 참조 |

### Residuals (non-blocking, 2건)

1. **FR-MEM14 비용 한도 구체값 미명시** — NFR-COST3 "Haiku ≤ $0.10/일"을 참조하지만 FR-MEM14 자체에는 구체 금액 없음. NFR에서 정의하므로 FR-level에서는 "일일 한도" 참조로 충분. 아키텍처에서 구체 설정.

2. **Sprint 3 FR count 11→14** — FR-MEM12/13/14 추가로 Sprint 3 FR이 14개. 5 Go/No-Go gates와 합산하면 최대 복합 부하. Step 10 리스크 행에서 이미 식별 + 완화 전략 기록. 분할 불필요 판단 유지 (순차 파이프라인 + Quinn Week 1-2-3 시퀀싱).

### R2 Scoring

| Dimension | Weight | R1 | R2 | Delta |
|-----------|--------|-----|-----|-------|
| D1 Specificity | 15% | 8.5 | 9.0 | +0.5 |
| D2 Completeness | 20% | 7.5 | 9.5 | +2.0 |
| D3 Accuracy | 15% | 8.0 | 9.0 | +1.0 |
| D4 Implementability | 15% | 8.0 | 9.0 | +1.0 |
| D5 Consistency | 15% | 7.5 | 9.0 | +1.5 |
| D6 Risk Awareness | 20% | 7.5 | 9.5 | +2.0 |

**Weighted R2: 9.0×0.15 + 9.5×0.20 + 9.0×0.15 + 9.0×0.15 + 9.0×0.15 + 9.5×0.20 = 9.20**

**R2 Score: 9.20/10 — ✅ PASS (FINAL)**

Biggest improvements: D2 (+2.0, FR-MEM12/13/14 three new FRs + FR-MEM3 trigger completion + FR-N8N4 8/8 SEC) and D6 (+2.0, MEM-6 observation sanitization now has dedicated FR + ECC 2.2 cost auto-pause FR + TOOLSANITIZE gate timing clarified). D5 (+1.5) from FR-MEM3 daily cron alignment with MEM-2 + TOOLSANITIZE Sprint annotation resolving implementation vs verification ambiguity. This is the highest-scoring section across all 3 Steps, reflecting the comprehensive fix scope — 3 new FRs + 5 amendments addressed all 4 critics' findings with unanimous consensus items (MEM-6 FR, MEM-7 TTL, N8N-SEC 8/8).
