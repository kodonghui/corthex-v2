# Stage 2 Step 09 — Bob (Critic-C: Scrum Master) Review

**Section:** PRD L1784-2057 (## Technical Architecture Context)
**Rubric Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%
**Focus:** Sprint planning, delivery risk, scope management, dependency tracking

---

## R1 Review

### Verified john's Check Points

1. **v3 멀티테넌트 vs Domain Requirements**: ✅ Comprehensive. L1815-1826 covers n8n tag (N8N-SEC-3), webhook HMAC (N8N-SEC-4), editor JWT (N8N-SEC-2), Big Five row-level, memory FK chain, Reflection cron isolation (MEM-3), /office WS, external API keys (MKT-1). All Domain Requirements isolation items present.

2. **RBAC vs User Journeys**: ✅ Aligned. Admin: Big Five edit, n8n editor, memory delete (MEM-4). CEO: /office main use, n8n results read-only, memory read-only. Matches J5 (Admin Big Five), J8 (Admin n8n), J9 (CEO /office), J10 (Memory roles).

3. **Integration list completeness**: ✅ 9 v2 + 7 v3 = 16 integrations. All v3 features represented (n8n Docker, n8n editor, /office WS, Reflection cron, soul-enricher, AI tools, SNS).

4. **Compliance PER-1**: ✅ 4-layer detailed at L1987-1994 with Layer 0/A/B/C. Matches Innovation section and Domain Requirements PER-1. ⚠️ BUT MEM-6 (observation 4-layer) is NOT in Compliance section — see should-fix #2.

5. **Audit log vs MEM-4/MEM-5**: ✅ L2005 "메모리 삭제 (MEM-4, MEM-5)" + L2006 "Soul 주입 시 memory_id, agent_id, relevance score 기록". Matches Step 7 Fix 6 corrections exactly.

6. **n8n Docker 2G/2CPU**: ✅ L1867 "memory: 2G, cpus: 2, NODE_OPTIONS=--max-old-space-size=1536 (N8N-SEC-5)". L1901 "Docker 2G/2CPU(N8N-SEC-5)". 0 residuals of 4G.

### Proactive fix verification
- L1841 → L1849: "Reflection/Observation 삭제" ✅ (was "Reflection/Planning")
- L1859 → L1867: "memory: 2G" + NODE_OPTIONS ✅ (was "4G")
- L1893 → L1901: "Docker 2G/2CPU" ✅ (was "4G")
- L1998 → L2006: "Reflection 적용" + Soul 주입 기록 ✅ (was "Planning 적용")

---

### Should-Fix Items

**#1 API Surface Missing v3 Endpoints** (L1934-1946, D2/D4)
- Lists only 7 v2 APIs. Zero v3 API endpoints:
  - No Big Five: `PATCH /api/admin/agents/:id/personality` (Sprint 1)
  - No n8n proxy: `GET/POST /api/admin/n8n/*`, `/admin/n8n-editor/*` (Sprint 2)
  - No /ws/office: WebSocket 17th channel (Sprint 4)
  - No Memory APIs: observation read, reflection history, memory growth metrics (Sprint 3)
  - No external API key management: `CRUD /api/admin/api-keys` (Sprint 2)
- L1946 says "논리적 구조" but even logical structure should represent v3 additions.
- This is the canonical API reference in the PRD — developers will use this to plan Sprint implementation.

**#2 Compliance Missing MEM-6 Observation Sanitization** (L1985-1994, D2/D6)
- Prompt Injection Defense section only details **PER-1** (personality 4-layer).
- **MEM-6** (observation 4-layer) is a SEPARATE attack surface with a DIFFERENT defense chain:
  - PER-1: 0-100 integer → extraVars → Soul template (personality)
  - MEM-6: free-text content → observation → reflection LLM → pgvector → Soul injection (memory)
- MEM-6 is defined at L1484 (Domain Requirements) and referenced in R10 (Risk Registry). But the Compliance section — the canonical security requirements location — omits it entirely.
- The R10 attack chain (malicious obs → reflection → Soul injection) is more dangerous than PER-1 (bounded integer) because MEM-6 handles free-text input.

**#3 /ws/office Connection Limit: 20 vs NRT-5's 50** (L1903, D5)
- L1903: "per-company 연결 상한 **20**"
- L2385 (FR-OC2): "회사별 최대 **20**개 동시 연결"
- NRT-5 (L1516): "**50** conn/company, 500 conn/server"
- Confirmed decision #10 (R15, L418): "**50**conn/company"
- If 20 is a channel-specific subset of the 50 total, this needs explicit annotation: "20 conn/company on /ws/office (of 50 total NRT-5 limit)"
- If 20 replaces 50 for /ws/office, NRT-5 needs updating.
- Currently reads as a conflict.

### Observations (non-blocking)

**#4** Migration Guide (L1948-1963) covers v2 Phase 1-3 only. v3 schema changes (observations table, memoryType enum, personality_traits JSONB) are in Product Scope but not here. Acceptable — v3 is additive, not transformative migration.

**#5** Sprint 2 overload risk (L2050-2052) well-identified: 15+ items (N8N-SEC 6 + MKT 5 + soul-enricher). "Sprint 2.5 분리 가능" mitigation is practical Scrum advice. Good carry-forward from Step 4.

**#6** Reflection cron scheduling (L2054-2057) correctly delegates to architecture: "크론 오프셋 또는 큐잉(BullMQ/pg-boss)". Appropriate for PRD scope.

**#7** RBAC decision rationale (L1846-1850) is excellent — each permission has a "왜" explanation. This is best practice for RBAC documentation.

**#8** JSONB race condition (L1826, L2016) correctly flagged as Deferred Item with two options: `jsonb_set` atomic or separate table. Consistent tracking across multi-tenant and token management sections.

**#9** (Adopted from Sally MINOR 5) /office responsive symbol inconsistency (L1921): Tablet "△ (리스트 뷰 대체)" vs Mobile "❌ (리스트 뷰 대체, PIX-3)". Both offer list view fallback but use different symbols. If both get list view, both should be △. If Mobile truly has no access, ❌ shouldn't mention list view. Contradictory.

**#10** (Adopted from Winston M1 addition) /ws/office eviction policy: L1903 "idle 연결 graceful eviction" vs NRT-5 (L1516) "oldest 연결 해제". Different eviction strategies (idle-based vs age-based).

**#11** (Adopted from Winston M3) L1901 n8n integration detail lists N8N-SEC-1~6 but omits N8N-SEC-7 (encryption AES-256-GCM) and N8N-SEC-8 (rate limiting). These were added in Step 7 but integration table wasn't updated.

**#12** (Adopted from Sally rate limit flag) 2-tier rate limit undocumented relationship: N8N-SEC-8 (L1462) "분당 60회" = n8n internal API limit, while L1779/L1901/L2494 "100 req/min" = Hono proxy limit. Architecturally sound (outer 100 > inner 60) but PRD doesn't explain the 2-tier relationship. Sprint 2 developers will see conflicting numbers without context. Integration table should annotate: "Hono proxy 100 req/min + n8n API 60 req/min (2-tier)".

**#13** (Adopted from Quinn m2) L2051 "N8N-SEC 6건" → should be 8건. N8N-SEC-7/8 were added in Step 7 but Implementation Considerations count wasn't updated. Same propagation pattern as 4G/< 200KB.

**#14** (Adopted from Quinn m4) MEM-7 (30-day TTL) not referenced in GDPR data retention section. Observation TTL is a data retention policy — compliance section should cross-reference MEM-7 alongside existing audit log retention.

**#15** Sprint 2.5 security sequencing concern (from Quinn + Bob analysis): If Sprint 2 splits into 2A/2B, N8N-SEC-7 (credential encryption) and N8N-SEC-8 (rate limiting) MUST be in Sprint 2A, not deferred to 2B. Running n8n without encryption creates a security exposure window. john should clarify SEC-7/8 as Sprint 2A mandatory.

---

### Scoring (R1)

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 8.0 | Multi-tenant, RBAC, compliance highly specific. API Surface lacks v3 detail. |
| D2 Completeness | 20% | 6.5 | v3 API Surface empty, Compliance missing MEM-6. Otherwise comprehensive. |
| D3 Accuracy | 15% | 8.0 | Proactive fixes all verified. MEM-4/5 audit log accurate. PER-1 4-layer correct. |
| D4 Implementability | 15% | 7.5 | RBAC directly implementable. Missing v3 API Surface hinders Sprint planning. |
| D5 Consistency | 15% | 7.0 | /ws/office 20 vs NRT-5 50 conflict. Cross-references generally good. |
| D6 Risk Awareness | 20% | 7.0 | AES-256 단일 장애점, Sprint 2 overload, JSONB race all identified. MEM-6 absent from Compliance. |

**Weighted Total: 8.0×0.15 + 6.5×0.20 + 8.0×0.15 + 7.5×0.15 + 7.0×0.15 + 7.0×0.20 = 7.28**

**R1 Score: 7.28/10 — PASS (conditional)**

Passing but with 3 clear should-fix items. #1 (API Surface) is the biggest gap — the v3 API absence makes Sprint planning harder. #2 (MEM-6 compliance) and #3 (/ws/office 20 vs 50) are precision fixes.

---

### Fix Priority

1. **#1** (API Surface v3) — Add 5-7 v3 API rows. ~10 lines.
2. **#2** (MEM-6 compliance) — Add MEM-6 4-layer table alongside PER-1. ~8 lines.
3. **#3** (/ws/office limit) — Clarify 20 vs 50 relationship. ~1 annotation.

All 3 are additive — no rewrites needed. Expected R2 path: 8.5+ PASS.

---

## R2 Review

### Fix Verification (11/11 verified ✅)

| Fix | Description | Verified |
|-----|-------------|----------|
| 1 | /ws/office 20→50 conn/company + eviction "idle"→"oldest" (L1903) | ✅ NRT-5/확정 결정 #10 정합. "50 conn/company, 500 conn/server, 10 msg/s" + "oldest 연결 해제" |
| 2 | API Surface v3 9행 추가 (L1946-1958) | ✅ Big Five PATCH/GET, n8n proxy/editor, Memory CRUD+growth, API keys, /ws/office. Sprint 매핑 정확 |
| 3 | Compliance MEM-6 4-layer 테이블 (L2010-2019) | ✅ Size cap→Control char→Prompt hardening→Content classification. 공격 체인 명시. PER-1 vs MEM-6 차이 설명 |
| 4 | N8N-SEC-7/8 통합 목록 추가 (L1901) | ✅ "크레덴셜 암호화(N8N-SEC-7), n8n API rate limit 60/min(N8N-SEC-8)" — 8-layer 완전 반영 |
| 5 | L2077 "N8N-SEC 6건"→"8건", "15건+"→"17건+" | ✅ Step 7 전파 해결 |
| 6 | /office Mobile ❌→△ (L1921) | ✅ "△ (리스트 뷰 대체, PIX-3)" |
| 7 | MEM-7 GDPR 섹션 "옵션"→"필수" (L2052) | ✅ "reflected=true observations 30일 후 자동 삭제 (MEM-7, Sprint 3 필수). Admin 보존 정책 설정 가능" |
| 8 | soul-enricher.ts E8 위치 (L1905) | ✅ "engine/ 외부, E8 경계 밖 — lib/ 레벨" + MEM-6 방어 참조 + cosine ≥ 0.75 |
| 9 | Voyage AI Phase "4"→"Pre-Sprint→유지" (L1892 area) | ✅ Go/No-Go #10 참조 |
| 10 | 보안 토큰 N8N-SEC-7 행 (L2043) | ✅ "N8N_ENCRYPTION_KEY (AES-256-GCM, N8N-SEC-7)" 전체 라이프사이클 명시 |
| 11 | Reflection 크론 advisory lock (L2083) | ✅ `pg_advisory_xact_lock(hashtext(companyId))` (확정 결정 #9, MEM-2) |

### My Should-Fix Resolution

| Item | Fix | Status |
|------|-----|--------|
| #1 API Surface v3 | Fix 2 | ✅ RESOLVED — 9 endpoints with Sprint/user mapping |
| #2 MEM-6 Compliance | Fix 3 | ✅ RESOLVED — Full 4-layer + attack chain |
| #3 /ws/office 20→50 | Fix 1 | ✅ RESOLVED — NRT-5 정합 + eviction 통일 |

### Cross-talk Items Resolution

| Critic | Item | Fix | Status |
|--------|------|-----|--------|
| Sally | MINOR 5 responsive symbols | Fix 6 | ✅ ❌→△ |
| Sally | rate limit 2-tier | Fix 4 | ✅ Both limits now visible in L1901 |
| Winston | M1 /ws/office 20 error | Fix 1 | ✅ 50 + oldest |
| Winston | M3 N8N-SEC-7/8 integration | Fix 4 | ✅ 8-layer complete |
| Quinn | M1 MEM-6 Compliance | Fix 3 | ✅ |
| Quinn | m2 N8N-SEC 6→8 | Fix 5 | ✅ |
| Quinn | m4 MEM-7 GDPR | Fix 7 | ✅ |
| Quinn | l2 advisory lock | Fix 11 | ✅ |

### Residuals (non-blocking, 3건)

1. **SDK pinning `@0.2.x`** (L2066) — Quinn raised 0.2.x wildcard vs CLAUDE.md "SDK pin version (no ^)". `0.2.x` is looser than exact pin (e.g., 0.2.3) but tighter than `^0.2.0`. Winston accepted as "reasonable for fast-moving SDK". PRD-level acceptable — architecture will specify exact version.

2. **2-tier rate limit annotation** — L1901 now shows BOTH "proxy rate limit(100 req/min/Admin)" and "n8n API rate limit 60/min(N8N-SEC-8)" side by side, making the 2-tier relationship visible. Explicit "2-tier" label would be ideal but relationship is inferable from context.

3. **Sprint 2.5 security sequencing** — L2078 mentions 2.5 split possibility but doesn't explicitly mandate SEC-7/8 in Sprint 2A. Architecture/Sprint planning will need to clarify. Recorded in Observation #15.

### R2 Scoring

| Dimension | Weight | R1 | R2 | Delta |
|-----------|--------|-----|-----|-------|
| D1 Specificity | 15% | 8.0 | 8.5 | +0.5 |
| D2 Completeness | 20% | 6.5 | 9.0 | +2.5 |
| D3 Accuracy | 15% | 8.0 | 8.5 | +0.5 |
| D4 Implementability | 15% | 7.5 | 9.0 | +1.5 |
| D5 Consistency | 15% | 7.0 | 8.5 | +1.5 |
| D6 Risk Awareness | 20% | 7.0 | 8.5 | +1.5 |

**Weighted R2: 8.5×0.15 + 9.0×0.20 + 8.5×0.15 + 9.0×0.15 + 8.5×0.15 + 8.5×0.20 = 8.68**

**R2 Score: 8.68/10 — ✅ PASS (FINAL)**

Biggest improvements: D2 (+2.5, API Surface 9 rows + MEM-6 Compliance) and D4 (+1.5, v3 APIs now directly implementable with Sprint mapping). D5 (+1.5) from /ws/office 50/oldest alignment and N8N-SEC 8건 count correction. All 3 should-fix items resolved through additive fixes — no structural changes needed.
