# Stage 2 Step 11 — Quinn (Critic-B) Review: Functional Requirements

**Critic:** Quinn (QA + Security)
**Date:** 2026-03-22
**Section:** PRD lines 2285–2494 (## Functional Requirements)
**Grade:** A (2사이클 필수, avg ≥ 8.0)
**Cycle:** 1

---

## Rubric (Critic-B Weights)

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| D1 Specificity | 10% | 8.5 | 0.85 |
| D2 Completeness | 25% | 7.5 | 1.875 |
| D3 Accuracy | 15% | 8.5 | 1.275 |
| D4 Implementability | 10% | 8.5 | 0.85 |
| D5 Consistency | 15% | 7.0 | 1.05 |
| D6 Risk | 25% | 7.0 | 1.75 |
| **Total** | **100%** | | **7.65** |

**Verdict (pre-cross-talk): ✅ PASS (7.65 ≥ 7.0) — 6 issues (1M + 4m + 1low). Below Grade A target (8.0), R2 needed.**

---

## Strengths

1. **FR granularity excellent** — Each FR is testable with clear success criteria. FR-OC2 has connection limits + eviction strategy + auth method. FR-PERS2 has Zod schema + DB CHECK. FR-MKT2 has partial failure handling ("실패 플랫폼만 Admin에게 알린다").
2. **Option B compliance thorough** — All 5 FR-MEM agent_memories(reflection) references correct. "별도 reflections 테이블 없음" explicit in FR-MEM4. Proactive fixes verified.
3. **GATE handling clean** — FR37/39 strikethrough with reason. L2344 GATE annotation. Cost-related FRs properly removed.
4. **Error handling specified** — FR7 (SDK retry), FR-OC8 (package isolation), FR-N8N5 (n8n degradation), FR-MEM7 (pgvector fallback), FR-MKT7 (engine fallback). 5 explicit degradation FRs.
5. **Cross-references present** — FR-OC1 → Go/No-Go #5 + Brief §4. FR-OC2 → NRT-5 + 확정 결정 #10. FR-N8N4 → Brief 필수. FR-MEM4 → NFR-COST3.
6. **Sprint assignments consistent** — All v3 FRs match Sprint Strategy table (Step 10).
7. **n8n security comprehensive in FR-N8N4** — 5/8 N8N-SEC layers with implementation specifics. CORTHEX↔n8n integration model clear (REST API-only, no iframe).
8. **Accessibility included** — FR-OC9 (mobile list view), FR-OC10 (aria-live panel), FR-OC11 (Admin read-only). Rarely seen in FR sections.

---

## Issues (6 total: 1M + 4m + 1low)

### MAJOR (1)

**M1: MEM-6 Observation Sanitization has NO functional requirement**

L2287 declares: "**여기에 없는 기능은 최종 제품에 존재하지 않는다.**"

MEM-6 4-layer defense (Go/No-Go #9, Risk R10 🟠 High) is defined in:
- Domain Requirements L1484: "max 10KB + control char strip + prompt hardening + content classification"
- Compliance L2010-2019: Full 4-layer table with code locations
- Go/No-Go #9 (L464): "4-layer sanitization E2E 검증"
- Risk R10 (L413): "Observation content poisoning → reflection LLM 오염"
- Scoping Must-Have #9 (L2169): "Observation → Reflection E2E + Go/No-Go #9"

**But there is NO FR-MEM* that specifies:**
- Observation content must undergo size cap (10KB)
- Control characters must be stripped before storage
- Reflection LLM prompt must include hardening tags
- Content classification must flag/block suspicious observations

FR-MEM1 just says: "결과가 observations 테이블에 자동 저장된다" — no sanitization step.

**Impact:** A developer implementing FR-MEM1→FR-MEM11 would build the complete memory pipeline WITHOUT the 4-layer defense. The most dangerous injection path (arbitrary text → reflection LLM → Soul injection → agent behavior manipulation) has no functional contract.

**This is NOT a non-functional requirement** — sanitization modifies data (truncates, strips, blocks). It changes observable behavior (Admin sees flagged content). It's a FEATURE.

**Fix:** Add FR-MEM12:
```
FR-MEM12: [Sprint 3] observation 저장 시 4-layer 콘텐츠 방어가 적용된다:
(1) content max 10KB 초과 시 truncate + 경고 로그
(2) 제어문자(U+0000-U+001F, U+007F-U+009F) 자동 제거
(3) Reflection 크론 LLM 프롬프트에 adversarial 무시 지시 포함
(4) 콘텐츠 분류: 악성 판정 시 reflected=false 유지 + Admin 플래그
(Go/No-Go #9, MEM-6, R10)
```

### MINOR (4)

**m1: MEM-7 Observation TTL (30-day auto-delete) has no FR**
- Domain L1485: "reflected=true 관찰 30일 후 자동 삭제 크론. Admin 보존 정책 설정 가능"
- GDPR L2052: "reflected=true observations 30일 후 자동 삭제 (MEM-7, Sprint 3 필수)"
- No FR-MEM* describes this data retention behavior
- Auto-deletion is user-visible: observations disappear from Admin view after 30 days
- **Fix:** Add FR-MEM13: "[Sprint 3] reflected=true observations이 30일 후 자동 삭제된다 (MEM-7). Admin이 회사별 보존 기간을 설정할 수 있다"

**m2: FR-MEM3 missing advisory lock (confirmed decision #9)**
- FR-MEM3: "백그라운드 워커가 에이전트별 미처리 관찰 20개 누적 시 자동 실행된다"
- Missing: `pg_advisory_xact_lock(hashtext(companyId))` for concurrent execution prevention
- Product Scope L953 and Tech Architecture L2083 both specify this mechanism
- Without FR mention: developer could implement cron without lock → duplicate reflections for same company
- **Fix:** FR-MEM3에 추가: "동일 회사 동시 실행 방지: pg_advisory_xact_lock (confirmed #9)"

**m3: FR-N8N4 covers 5/8 N8N-SEC layers — 3 missing**
- FR-N8N4's 5 points map to: SEC-1 (port), SEC-2 (JWT proxy), SEC-3 (tag), SEC-5 (Docker 2G), SEC-6 (DB isolation)
- Missing from FRs:
  - **SEC-4**: per-company HMAC webhook validation — critical for multi-tenant integrity (companyA cannot forge companyB's webhooks)
  - **SEC-7**: N8N_ENCRYPTION_KEY (AES-256-GCM credential encryption)
  - **SEC-8**: n8n API rate limit 60/min
- Integration table (L1901, Step 9 Fix 4) shows 8/8, but FRs only cover 5/8
- SEC-4 (HMAC) is the most critical gap — without it, cross-tenant webhook forgery is possible
- **Fix:** FR-N8N4에 3항 추가: "(6) per-company HMAC webhook 서명 검증 (SEC-4). (7) N8N_ENCRYPTION_KEY AES-256-GCM 크레덴셜 암호화 (SEC-7). (8) n8n API rate limit 60/min (SEC-8)"

**m4: Reflection cost auto-pause mechanism has no FR**
- MEM-2 (L1480): "비용 초과 시 크론 자동 일시 중지 (ECC 2.2, Go/No-Go #7)"
- Success Criteria L597: "비용 초과 시 크론 자동 일시 중지"
- FR-MEM4 references "NFR-COST3 Haiku ≤ $0.10/일" but doesn't describe auto-pause behavior
- Auto-pause is functional: cron stops running, visible to Admin, requires acknowledgment
- **Fix:** FR-MEM3 or new FR-MEM14: "[Sprint 3] Reflection 크론 비용이 일일 한도 ($0.10)를 초과하면 자동 일시 중지되고 Admin에게 알림이 전송된다 (ECC 2.2, Go/No-Go #7)"

### LOW (1)

**l1: Some FRs are overly implementation-specific**
- FR-PERS2: migration filename, Zod schema, DB CHECK SQL formula
- FR-N8N4: 5-point implementation checklist with Docker flags
- FR-OC7: PostgreSQL LISTEN/NOTIFY + 500ms polling fallback query
- FRs should describe WHAT, not HOW. But in solo-dev context with AI pair-programming, implementation specifics in FRs are practical — the developer IS the reader
- Not an error; a style observation. Acceptable.

---

## John's Checkpoint Verification

| # | Checkpoint | Verdict | Details |
|---|-----------|---------|---------|
| 1 | 확정 결정 정합 | ⚠️ | Option B ✅. NRT-5 #10 ✅. n8n 2G ✅. BUT MEM-6 (sanitization), MEM-7 (TTL), advisory lock (#9) have no FRs |
| 2 | Phase/Sprint 매핑 | ✅ | All 112+ FRs correctly assigned. Sprint assignments match Strategy table |
| 3 | Go/No-Go 연동 | ⚠️ | #5 ✅ (FR-OC1), #7 partial (cost ceiling but no auto-pause), #9 ❌ (no FR), #10 ✅ (FR-MEM2), #11 ✅ (FR-TOOLSANITIZE) |
| 4 | FR 완전성 | ⚠️ | 112+ FRs comprehensive for features. But 4 security/data mechanisms missing FRs (M1, m1, m2, m4) |
| 5 | GATE 결정 반영 | ✅ | FR37/39 삭제 clean. L2344 GATE annotation. cost-tracker reflected |
| 6 | Cross-section 일관성 | ⚠️ | Domain MEM-6/MEM-7 not propagated. N8N-SEC 5/8. Advisory lock missing |
| 7 | Option B 정합 | ✅ | All FR-MEM references correct: agent_memories(reflection), observations separate table |

---

## Confirmed Decisions Cross-Reference

| # | Decision | FR Coverage | Status |
|---|----------|------------|--------|
| 1 | Voyage AI 1024d | FR-MEM2 (voyage-3, 1024d) | ✅ |
| 2 | n8n Docker 2G | FR-N8N4 (memory: 2G + NODE_OPTIONS) | ✅ |
| 3 | n8n 8-layer | FR-N8N4 (5/8) + FR-N8N6 (CSRF) | ⚠️ (SEC-4/7/8 missing) |
| 5 | 30-day TTL | No FR | ❌ (m1) |
| 8 | Observation poisoning | No FR | ❌ (M1) |
| 9 | Advisory lock | FR-MEM3 (trigger only, no lock) | ⚠️ (m2) |
| 10 | WebSocket limits | FR-OC2 (50/co, 500/server, NRT-5) | ✅ |

---

## Score Rationale (pre-cross-talk)

- **D1 (8.5)**: FRs are detailed — validation schemas, connection limits, error handling per FR. Cross-references to Go/No-Go gates. Sprint assignments per FR. High specificity overall.
- **D2 (7.5)**: 112+ FRs covering extensive functionality including v3 innovations, error handling, accessibility. BUT 4 security/data mechanisms defined elsewhere have no FR (MEM-6 sanitization, MEM-7 TTL, advisory lock, cost auto-pause). N8N-SEC 5/8.
- **D3 (8.5)**: Phase/Sprint assignments all correct. Option B references all correct. GATE decisions properly reflected. N8N-SEC mapping accurate for the 5 covered. Cross-references accurate.
- **D4 (8.5)**: Developer-ready with validation rules, file paths, fallback behaviors. Error handling FRs clear. Sprint dependencies implicit. But missing security FRs would lead to incomplete implementation.
- **D5 (7.0)**: Sprint assignments consistent ✅. Option B consistent ✅. BUT Domain MEM-6/MEM-7 not propagated to FRs. N8N-SEC 8-layer not fully propagated. Advisory lock in 2 other sections but not FRs. Same propagation pattern.
- **D6 (7.0)**: MEM-6 (most dangerous injection path) has no FR. N8N-SEC missing 3 layers including HMAC (multi-tenant integrity). Advisory lock absent → duplicate reflection risk. Cost auto-pause absent → runaway cost. The FR section is where implementation starts — missing security FRs = missing security implementations.

---

## Questions for Cross-Talk

1. **M1 severity**: Is MEM-6 sanitization a functional requirement (changes observable behavior: data truncated, content blocked, Admin flagged) or a non-functional quality attribute?
2. **N8N-SEC scope**: Should all 8 layers be in FR-N8N4, or are some (credential encryption, rate limit) better placed in NFR?
3. **Advisory lock in FR**: Should FR-MEM3 include the locking mechanism, or is this implementation detail that belongs in architecture?

---

## Cross-Talk Results (Post R1)

### Consensus

| Issue | Quinn | Winston | Sally | Bob | Consensus |
|-------|-------|---------|-------|-----|-----------|
| M1 MEM-6 no FR | MAJOR | MAJOR (M1) | MAJOR (M1) | should-fix (#3) | **4/4 unanimous MAJOR** |
| m1 MEM-7 TTL | MINOR | MAJOR (M2) | MINOR (m2) | — | 3/4, Winston argues MAJOR (precedent: cron FRs) |
| m2 FR-MEM3 incomplete | MINOR | — | MINOR (m4) | should-fix (#2) | 3/4, Bob expands scope (4 conditions missing) |
| m3 N8N-SEC 5/8 | MINOR | — | — (Q3 to Winston) | — | Quinn only, but Sally asks Winston to confirm |
| m4 cost auto-pause | MINOR | Q2 (severity?) | — | — | 2/4, Winston asks if MINOR sufficient |

### Adopted Findings (2 new)

**m5 (from Bob #1): FR-TOOLSANITIZE Sprint 2 vs Go/No-Go #11 Sprint 3**
- All 3 FR-TOOLSANITIZE are [Sprint 2] but Go/No-Go #11 is Sprint 3
- FR-TOOLSANITIZE3 "10종 100% 차단" is a gate verification, not Sprint 2 acceptance
- **Fix:** FR-TOOLSANITIZE3 Sprint label: "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]"

**m6 (from Sally m3): FR-PERS a11y missing**
- Go/No-Go L601: "Big Five 슬라이더: aria-valuenow + 키보드 조작 (←→ 키)"
- FR-PERS1 says "슬라이더(0-100 정수)" but no accessibility spec
- FR-PERS8 covers tooltips only, not keyboard navigation or ARIA attributes
- **Fix:** FR-PERS1에 추가: "키보드 조작(←→ 키) + aria-valuenow 접근성 지원 (Go/No-Go 접근성)"

### Expanded Findings (from cross-talk)

**m2 expanded (Bob #2):** FR-MEM3 missing not just advisory lock but 4 MEM-2 conditions:
1. ~~"20개 누적 시 자동 실행" (event-triggered)~~ → "일 1회 크론 + ≥20 threshold" (daily cron)
2. confidence ≥ 0.7 filter missing
3. Tier별 일일 한도 missing
4. advisory lock missing (original m2)
- Bob correctly identified the trigger model discrepancy: FR implies event-triggered, MEM-2 specifies daily cron

### Cross-Talk Questions Resolved

1. **M1 severity** → MAJOR confirmed unanimously. FR-TOOLSANITIZE covers tool response attacks only; MEM-6 covers observation content attacks. Different attack surfaces, different defenses, different code paths. Separate FR required.
2. **N8N-SEC scope** → SEC-4 (HMAC) is FR-critical (multi-tenant integrity). SEC-7/SEC-8 debatable but should be in FR for implementation completeness. Sally's Q3 to Winston pending.
3. **Advisory lock in FR** → FR-worthy per Bob/Sally. Without FR mention, sprint checklist omits it → duplicate reflections.

### Updated Issue Count (post-cross-talk)

**8 issues: 1M + 6m + 1low** (was 6: 1M + 4m + 1low)

**Verdict (post-cross-talk): ✅ PASS (7.65 ≥ 7.0) — 8 issues. Below Grade A (8.0). R2 required.**

---

## R2 Verification (Post-Fix)

### Fix Status — All 8 Issues + 2 Adopted

| # | Issue | Severity | Status | Line Evidence |
|---|-------|----------|--------|---------------|
| M1 | MEM-6 Observation Sanitization no FR | MAJOR | **FIXED** | L2481: FR-MEM12 — 4-layer (10KB + strip + hardening + classification) + Admin flag + audit. MEM-6/Go/No-Go #9/확정 #8. PER-1 distinction explicit. |
| m1 | MEM-7 30-day TTL no FR | MINOR | **FIXED** | L2482: FR-MEM13 — reflected=true 30일 삭제 (MEM-7, 확정 #5). Admin 보존 기간 설정. |
| m2 | FR-MEM3 missing 5 MEM-2 conditions | MINOR | **FIXED** | L2472: FR-MEM3 — 일 1회 크론 + ≥20 AND + confidence ≥0.7 + Tier 한도 + advisory lock (확정 #9) + ECC 2.2 auto-pause. 5/5 conditions present. |
| m3 | FR-N8N4 covers 5/8 N8N-SEC | MINOR | **FIXED** | L2440: FR-N8N4 8/8 — SEC-4 HMAC webhook + SEC-7 AES-256-GCM + SEC-8 rate limit 60/min added. |
| m4 | Cost auto-pause no FR | MINOR | **FIXED** | L2483: FR-MEM14 — 일일 한도 초과 → 크론 자동 중지 + Admin 알림 + 확인 후 재개 (ECC 2.2, Go/No-Go #7). |
| m5 | FR-TOOLSANITIZE Sprint 2 vs #11 Sprint 3 | MINOR (Bob) | **FIXED** | L2489: "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]" — implementation vs verification clearly separated. |
| m6 | FR-PERS a11y missing | MINOR (Sally) | **FIXED** | L2466: FR-PERS9 — 키보드 ←→ + aria-valuenow + aria-valuetext. Go/No-Go L601 a11y covered. |
| — | FR-MEM1 MEM-6 reference (Bob) | — | **FIXED** | L2470: "MEM-6 4-layer 방어 적용 후" + "방어 실패 시 저장 거부 + 감사 로그". FR-MEM1→FR-MEM12 pipeline clear. |
| l1 | FRs overly implementation-specific | LOW | Deferred | Solo-dev context accepted. |
| — | FR-OC7 LISTEN/NOTIFY Neon | — | Deferred | Sprint 4 착수 전 검증, 500ms 폴링 폴백 명시. |

**Resolution: 8/8 Major+Minor fixed. 1 LOW deferred. 1 cross-talk item deferred.**

### Confirmed Decisions Coverage (R2)

| # | Decision | Status |
|---|----------|--------|
| 1 | Voyage AI 1024d | ✅ FR-MEM2 (voyage-3, 1024d) |
| 2 | n8n Docker 2G | ✅ FR-N8N4 (memory: 2G + NODE_OPTIONS) |
| 3 | n8n 8-layer | ✅ FR-N8N4 8/8 SEC layers |
| 5 | 30-day TTL | ✅ FR-MEM13 (MEM-7, 확정 #5) |
| 8 | Observation poisoning | ✅ FR-MEM12 (MEM-6, Go/No-Go #9) |
| 9 | Advisory lock | ✅ FR-MEM3 (pg_advisory_xact_lock, 확정 #9) |
| 10 | WebSocket limits | ✅ FR-OC2 (50/co, 500/server, NRT-5) |

### Go/No-Go Gate Coverage (R2)

| Gate | FR Coverage | Status |
|------|-----------|--------|
| #5 PixiJS bundle | FR-OC1 (≤200KB) | ✅ |
| #7 Reflection cost | FR-MEM14 (auto-pause) + FR-MEM3 (ECC 2.2) | ✅ |
| #9 Obs poisoning | FR-MEM12 (4-layer) + FR-MEM1 (reference) | ✅ |
| #10 Voyage AI | FR-MEM2 (1024d) | ✅ |
| #11 Tool sanitization | FR-TOOLSANITIZE3 (Sprint 2→3 검증) | ✅ |
| #12 v1 parity | FR62-68 | ✅ |
| #13 Usability | FR59-61 | ✅ |

### Three Sanitization Chains — Now Differentiated in FRs

| Chain | Attack Surface | FR | Defense |
|-------|---------------|-----|---------|
| PER-1 | personality_traits JSONB injection | FR-PERS2 | Zod schema + DB CHECK + string rejection |
| MEM-6 | observation free text → reflection LLM | FR-MEM12 + FR-MEM1 | 10KB + char strip + prompt hardening + classification |
| TOOLSANITIZE | external tool response → agent context | FR-TOOLSANITIZE1-3 | Pattern detect + block + audit |

### Dimension Scores (R2 [Verified])

| Dimension | R1 | R2 | Weight | Weighted | Evidence |
|-----------|-----|-----|--------|----------|----------|
| D1 Specificity | 8.5 | 9.0 | 10% | 0.90 | FR-MEM3: 5 AND conditions with specific values. FR-MEM12: 4 layers. FR-N8N4: 8/8 SEC with measures. FR-PERS9: ARIA attributes. |
| D2 Completeness | 7.5 | 9.0 | 25% | 2.25 | All 4 security/data FRs added. N8N-SEC 8/8. PERS a11y added. TOOLSANITIZE Sprint timing. 7/7 confirmed decisions ✅. 7/7 Go/No-Go gates ✅. |
| D3 Accuracy | 8.5 | 9.0 | 15% | 1.35 | All confirmed decisions accurately reflected. Sprint assignments verified. MEM-2 conditions correctly propagated. Cross-references all accurate. |
| D4 Implementability | 8.5 | 9.0 | 10% | 0.90 | FR-MEM3 fully implementable (5 conditions). FR-MEM12 implementation-ready (4 layers). FR-PERS9 specific (ARIA). FR-MEM1→FR-MEM12 pipeline clear. |
| D5 Consistency | 7.0 | 9.0 | 15% | 1.35 | All propagation failures resolved. 3 sanitization chains differentiated. Confirmed decisions consistent. Sprint assignments consistent including TOOLSANITIZE3 Sprint 2→3. |
| D6 Risk | 7.0 | 9.0 | 25% | 2.25 | MEM-6 injection path has FR-MEM12. N8N HMAC in FR-N8N4. Advisory lock in FR-MEM3. Cost auto-pause in FR-MEM14. No remaining security blind spots in FR section. |

### Weighted Average: 9.00/10

### Verdict

**[Verified] 9.00/10 — ✅ PASS (Grade A: ≥ 8.0)**

Score: 7.65 → **9.00**. All 8 Major+Minor fixes verified. The recurring propagation failure pattern (Domain/Compliance/Risk → FR) is now resolved for Step 11. Three sanitization chains clearly differentiated. All confirmed decisions and Go/No-Go gates have FR-level coverage.
