# Party Log — Stage 1, Step 02: Technical Overview
## Critic-B (Quinn) — QA + Security Review

**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md:112-484`
**Date**: 2026-03-21 (Reverification — Cycle 3, code-verified)
**Previous Scores**: Cycle 1: 6.90 ❌ → Cycle 2: 6.25 ❌
**Review Type**: Reverification (Grade B → target A)

---

### Code Verification Performed (Pre-Review)

| Claim | Verification | Result |
|-------|-------------|--------|
| Gemini embedding 768d | `embedding-service.ts:1,8-9` imports `@google/generative-ai`, EMBEDDING_DIMENSIONS=768 | ✅ Current state correct |
| generateEmbedding() signature | `embedding-service.ts:45-48` = `(apiKey: string, text: string) → Promise<number[] \| null>` | ✅ Correct |
| vector(768) in schema | `schema.ts:1556` knowledge_docs, `schema.ts:1888` semantic_cache | ✅ Both 768d |
| agent_memories has NO vector column | Grep for `vector(` in agent_memories section — absent | ✅ Confirmed |
| agent_memories.confidence exists | `schema.ts:1598` = `integer('confidence').notNull().default(50) // 0-100` | ✅ 0-100 scale |
| memoryTypeEnum values | `schema.ts:28` = `['learning', 'insight', 'preference', 'fact']` | ✅ No reflection/observation yet |
| soul-renderer extraVars | `soul-renderer.ts:41` = `...extraVars` spread AFTER built-ins | ✅ extraVars can override built-ins |
| knowledge_context is extraVar | `hub.ts:99`, `call-agent.ts:63` inject via extraVars | ✅ Not a built-in |
| Brief --memory=2g | Brief L408, L490, L507 all say `--memory=2g` | ✅ 3 occurrences |

---

### 차원별 점수

| 차원 | 점수 | 가중치 | 가중점수 | 근거 |
|------|------|--------|---------|------|
| D1 구체성 | 8/10 | 10% | 0.80 | 핀 버전(PixiJS 8.17.1, n8n 2.12.3, pgvector 0.2.1), 번들(216KB→<200KB tree-shaken), 비용($0.06/day Haiku, $1.31/day Sonnet), hex 색상(#faf8f5, #283618), 파일 경로+라인(schema.ts:1556, soul-renderer.ts:41,45, deploy.yml:17, ci.yml:9). Docker env vars 명시. 감점: n8n API 키 저장 위치·교체 주기 미명시, pgvector PG ext 버전 미확인(MEDIUM confidence). |
| D2 완전성 | 5/10 | **25%** | 1.25 | **Voyage AI 연구 완전 누락** — brief Gemini 금지 + Voyage AI 1024d 명시인데 SDK/API/pricing/migration 연구 0건. observations 스키마 brief 필수 필드 `domain`(대화/도구/에러) 누락. `confidence`→`importance` 변경 무승인. 30일 purge 메커니즘 미기술. 6개 도메인 테스트 시나리오 0건. `agent_memories`에 `vector(1024)` 추가 계획 없음. n8n OOM kill 후 실행 복구 전략 없음. `NODE_OPTIONS=--max-old-space-size=4096` + `--memory=4g` 충돌 미분석. |
| D3 정확성 | 6/10 | 15% | 0.90 | (1) n8n 메모리 한도 `--memory=4g`(L200,244) vs brief `--memory=2g`(L408,490,507) — 직접 모순. (2) observations `importance`(1-10, Park) vs brief `confidence`(0.3-0.9) — 다른 개념·스케일 무승인 치환. (3) Gemini 768d 현황은 사실이나 v3 타겟(Voyage AI 1024d) 부재로 오해 유발. (4) architecture.md:303 여전히 `@google/genai` Phase 4 deps. 양호: n8n API `POST /api/v1/workflows/:id/execute` 정확, PixiJS 번들 분석 정확, co-residence 산술 정확. |
| D4 실행가능성 | 7/10 | 10% | 0.70 | observations SQL DDL(L340-354) 복붙 가능. Big Five prompt 패턴+프리셋 테이블 즉시 적용. 4-layer sanitization 코드 참조(soul-renderer.ts:34,41,45). PixiJS `extend()` 6클래스 목록. 감점: Voyage AI SDK 통합 예시 없음, n8n Docker compose 없음, observations 스키마가 Step 3 Drizzle 스키마와 불일치(2개 경쟁 스키마). |
| D5 일관성 | 5/10 | 15% | 0.75 | 5가지 불일치: (1) n8n 메모리: brief 2GB vs doc 4GB. (2) 임베딩: brief Voyage AI 1024d vs doc Gemini 768d. (3) observations: brief `confidence`(0.3-0.9)+`domain` vs doc `importance`(1-10) only. (4) 기존 `agent_memories.confidence`(0-100, schema.ts:1598)와 3번째 스케일. (5) UXUI 도구: doc "Subframe sole tool"(L435) vs MEMORY.md "Stitch 2(메인), Subframe(폐기)". 양호: Big Five 0-100 override 명시적 근거 제시. |
| D6 리스크 | 6/10 | **25%** | 1.50 | 양호: Big Five 4-layer sanitization 상세, co-residence RAM 분석(15.5GB headroom), ComfyUI GPU 경고, `knowledge_context` allowlist 예외, extraVars override 방어(Layer 0 reorder). **누락 7건**: (1) n8n DNS rebinding(Docker port binding 미명시), (2) Reflection cron 동시 실행(advisory lock 없음), (3) n8n API 키 rotation, (4) n8n credential isolation(`N8N_ENCRYPTION_KEY`), (5) observations purge 전략, (6) n8n OOM kill = 실행 상실 + PG recovery, (7) n8n memory leak(GitHub #16980). |

### 가중 평균: 5.90/10 ❌ FAIL

계산: (8×0.10) + (5×0.25) + (6×0.15) + (7×0.10) + (5×0.15) + (6×0.25) = 0.80 + 1.25 + 0.90 + 0.70 + 0.75 + 1.50 = **5.90**

---

### Security/QA Verification

#### 🔴 CRITICAL-1: Voyage AI Migration Research Missing (D2+D5)
- **현황 코드**: `embedding-service.ts` = `@google/generative-ai`, `text-embedding-004`, 768d
- **Brief 명령**: Voyage AI `voyage-3` (1024d), Gemini **금지** (MEMORY.md `feedback_no_gemini.md`)
- **Schema**: `knowledge_docs.embedding` = `vector(768)` (schema.ts:1556), `semantic_cache.queryEmbedding` = `vector(768)` (schema.ts:1888), `agent_memories` = vector 컬럼 **없음**
- **Document**: Domain 4 L329 "768 (our Gemini Embedding)" — v3 Voyage AI 타겟 연구 0건
- **영향**: Sprint 3 착수 불가 — Voyage AI SDK, rate limits, pricing, 768→1024 마이그레이션, re-embedding batch, HNSW 재구축 전부 미결
- **필수 추가 연구**: `voyageai` npm SDK, API endpoint, pricing/token, 768→1024 ALTER COLUMN, re-embed batch job, `agent_memories`에 `vector(1024)` 추가, HNSW 재구축 비용/시간

#### 🔴 CRITICAL-2: Observation Schema Brief 불일치 (D2+D5)

| 필드 | Brief §4 (L156) | Document (L340-354) | 기존 코드 (schema.ts) |
|------|----------------|---------------------|---------------------|
| confidence | `confidence` FLOAT 0.3-0.9 | `importance` INT 1-10 (Park et al.) | `agent_memories.confidence` INT 0-100 (L1598) |
| domain | `domain` (대화/도구/에러) | **완전 누락** | — |
| threshold trigger | confidence ≥ 0.7 우선 (ECC 2.3) | importance 누적합 > 150 (Park) | — |

**3가지 서로 다른 스케일 혼재**: brief 0.3-0.9, document 1-10, existing code 0-100. Park et al. `importance` 채택은 연구 근거 있으나 brief ECC 2.3과 직접 충돌. `domain` 필드 누락은 brief 위반.

#### 🟡 HIGH-1: n8n Memory Limit Contradiction (D3+D5)
- Brief: `--memory=2g` (3곳: L408, L490, L507)
- Document: `--memory=4g` (L200), `deploy.resources.limits: {memory: 4G}` (L244)
- n8n idle 860MB 대비 2GB 한도 적정성 재검토 필요 — n8n 공식 문서는 4GB 권장이나 brief은 2GB

#### 🟡 HIGH-2: n8n DNS Rebinding (D6)
- Docker `-p 5678:5678` = `0.0.0.0` 바인딩 → DNS rebinding으로 브라우저 경유 n8n API 접근 가능
- n8n `/healthz` 엔드포인트는 인증 없음
- **필요**: `127.0.0.1:5678:5678` Docker binding + `N8N_HOST=127.0.0.1` + iptables UID 제한(Hono proxy만 접근)

#### 🟡 HIGH-3: Reflection Cron Race Condition (D6)
- L375: "Separation prevents race condition" — immediate extraction vs cron 분리만 해결
- **미해결**: cron 중복 실행 시 `reflected=FALSE` observations 동시 처리 → 중복 reflection
- **필요**: `pg_advisory_xact_lock(hashtext('reflection-' || company_id::text))` 또는 `SELECT ... FOR UPDATE SKIP LOCKED`

#### 🟡 HIGH-4: n8n OOM Kill = Execution Loss (D6)
- `NODE_OPTIONS=--max-old-space-size=4096` + `--memory=4g` → V8 heap 4GB + V8 overhead → 컨테이너 OOM kill
- In-flight workflow 실행 **복구 불가** (n8n known issue)
- n8n memory leak (GitHub #16980) → OOM kill은 이론적 위험이 아닌 **예상 운영 이벤트**
- **필요**: `max-old-space-size=2560`(4GB 컨테이너 기준) 또는 `2048`(2GB brief 기준), execution recovery 전략

#### 🟡 MEDIUM-1: n8n Credential Isolation (D6)
- n8n 내부 credential 저장소에 Telegram/Slack/웹훅 토큰 저장
- **필요**: `N8N_ENCRYPTION_KEY` 환경변수(AES-256-GCM), 별도 시크릿 관리

#### 🟡 MEDIUM-2: Observation Purge Strategy (D6)
- Brief §4: "Reflection 처리 후 30일 purge"
- Document: purge 메커니즘 완전 부재
- **필요**: ARGOS cron purge job, batch DELETE(1000 rows/batch), VACUUM ANALYZE

#### 🟡 MEDIUM-3: UXUI Tooling Direction Reversed (D5)
- Document L435: "Google Stitch deprecated. Subframe is sole UXUI tool"
- MEMORY.md: "Stitch 2(메인) + Subframe(폐기)"
- CLAUDE.md: "Stitch MCP가 생성한 HTML = 디자인 기준"
- **결과**: 정반대 결론 — UXUI 파이프라인 전체 방향 혼란

---

### Missing Test Scenarios (11건)

| # | 도메인 | 시나리오 | 우선순위 |
|---|--------|---------|---------|
| T1 | PixiJS | Tree-shaken bundle < 200KB gzipped CI 자동 검증 | P0 |
| T2 | n8n | Docker health check → CORTHEX 연동 smoke test | P0 |
| T3 | n8n | 포트 5678 외부 노출 차단 (curl from external IP) | P0 |
| T4 | n8n | DNS rebinding 공격 시뮬레이션 (Singularity tool) | P1 |
| T5 | n8n | OOM kill 중 workflow 실행 → 실행 상태 검증 (lost, not hanging) | P0 |
| T6 | n8n | 72h+ soak test → memory leak rate 측정 | P1 |
| T7 | Big Five | extraVars personality injection → soul output 반영 검증 | P0 |
| T8 | Big Five | extraVars key collision (built-in var override 시도) | P0 |
| T9 | Memory | 768→1024 embedding migration → ALTER COLUMN + search 동작 | P0 |
| T10 | Memory | Reflection cron concurrent execution → lock 작동 검증 | P1 |
| T11 | Memory | observations purge cron → 30일+ reflected rows 삭제 검증 | P1 |

---

### 이슈 목록 (11건, 우선순위순)

1. **[D2+D5 CRITICAL]** Voyage AI migration research 완전 누락 — brief Gemini 금지, Voyage AI 1024d 명시. SDK/API/pricing/migration 연구 0건.
2. **[D2+D5 CRITICAL]** observations 스키마 brief 불일치 — `confidence`/`domain` 필드 누락, `importance`(1-10) 무승인 치환, 3개 스케일 혼재.
3. **[D3+D5 HIGH]** n8n memory limit 모순 — brief `--memory=2g` (3곳) vs document `--memory=4g`.
4. **[D6 HIGH]** n8n DNS rebinding — Docker port binding `0.0.0.0` vs `127.0.0.1` 미명시.
5. **[D6 HIGH]** Reflection cron race condition — advisory lock/SKIP LOCKED 미설계.
6. **[D6 HIGH]** n8n OOM kill = execution loss — `max-old-space-size=4096` + `--memory=4g` 충돌, memory leak known issue.
7. **[D6 MEDIUM]** n8n credential isolation — `N8N_ENCRYPTION_KEY` 전략 부재.
8. **[D6 MEDIUM]** observations purge mechanism 미설계 (brief 30일 규칙).
9. **[D5 MEDIUM]** UXUI tooling 방향 역전 — doc "Subframe sole" vs MEMORY.md "Stitch 2 main".
10. **[D2 MEDIUM]** 6개 도메인 테스트 시나리오 0건.
11. **[D3 LOW]** architecture.md:303 `@google/genai` Phase 4 deps 잔존.

---

### Cross-talk

**From Winston (Critic-A, 8.30 → 7.75/10 PASS, revised):**
- `task_executions` FK in observations schema (L345) references non-existent table — **code-verified: 0 grep matches in schema.ts**. Migration-order dependency risk. → **내 이슈 목록에 추가 (D3 accuracy)**
- `reflected` boolean update atomicity — cron marking `reflected=TRUE` 동시 실행 시 중복 처리 가능. → **내 reflection cron race condition 이슈(#5)와 동일 근인. advisory lock으로 해결 가능.**
- **[REVISED]** Winston 점수 8.30 → 7.75로 하향. Gemini→Voyage AI 이슈를 CRITICAL로 승격. `feedback_no_gemini.md` 확인 — CEO가 Gemini API 키 자체를 제공한 적 없음 → Gemini 코드가 v3에 남으면 non-existent API 키 참조.
- **[NEW SECURITY]** Observations poisoning via tool response — ECC §2.1 "84% agents vulnerable to tool response prompt injection". 악성 tool output이 observation으로 기록 → reflection cron이 poisoned insight 합성 → agent_memories에 오염된 지식 주입. **Transitive prompt injection** 경로. → **내 이슈 목록에 추가 (#13, D6 security)**
- ECC §2.3 confidence + domain 필드 필요성 재확인 — 내 CRITICAL-2 이슈 근거 강화.

**From John (Critic-C, 7.25 → 7.15/10 PASS, revised):**
- v2 failure pattern — 10,154 테스트 + 485 API인데 실사용 0 → 폐기. Step 2는 100% 기술 검증, 제품 검증 0건. Go/No-Go #11(사용성)에 연구 근거 없음. → **유효한 지적. D2 완전성 영역이나 Step 2 scope(기술 리서치)의 한계 내에서는 "제품 검증 연구"를 요구하기 어려움. 단, 리스크 섹션에 v2 교훈 언급 추가 권장.**
- 임베딩 768→1024 동의 + Sprint 0에 2-3일 미반영 지적. → **동의. 스코프 블로커.**
- DNS rebinding 동의.
- **[ACK]** 3가지 findings 전부 검증 완료:
  - (1) Voyage AI Sprint 0 blocker — "2-3 days unplanned work that blows sprint schedule"
  - (2) n8n memory — **PM 권고: brief를 4GB로 업데이트**. 2GB는 n8n 실사용 프로파일 대비 과도하게 공격적. VPS 4GB 할당 후에도 ~13.5GB headroom.
  - (3) 3개 스케일 혼재 — schema.ts:1598 `agent_memories.confidence` 0-100 확인. 구현 혼란 우려.
- John D5 6→5 하향, 전체 7.25→7.15.

**ECC 문서 반영 (.claude/logs/2026-03-21/ecc-analysis-plan.md):**
- §2.1: 에이전트 84% tool response 프롬프트 주입 취약 + CORTHEX = "root access agent" 패턴. Step 2 Big Five 4-layer sanitization은 personality vars만 커버 — tool response 공격 벡터는 별도 방어 필요 (FR-TOOLSANITIZE로 brief에 이미 존재하나 Step 2 연구에 미반영).
- §2.3: ECC instinct 시스템이 confidence(0.3-0.9) + domain 필드를 명시적 언급 → observations 스키마에 이 필드들이 필요하다는 근거 강화.
- §2.4: AI 회귀 테스트 author-bias — 우리 파이프라인(Writer≠Critic)이 이미 해결하나, Step 2에 sandbox/production 경로 불일치 리스크 미언급.

**새로 추가된 이슈 (cross-talk 후):**
12. **[D3 HIGH]** observations `task_execution_id` FK가 `task_executions` 테이블 참조 — 해당 테이블 schema.ts에 **미존재**. (Winston 발견, code-verified)
13. **[D6 HIGH]** Observations poisoning via transitive prompt injection — 악성 tool output → observation 기록 → reflection cron → poisoned insight → agent_memories 오염. ECC §2.1 "84% agents vulnerable". 4-layer sanitization은 personality vars만 커버, tool response → observation 경로 미방어. (Winston+ECC 근거)

---

### Verdict (Pre-Fix)
**FAIL — 5.90/10** (below 7.0 pass threshold). Two CRITICAL issues: (1) Voyage AI migration research completely absent despite brief mandate — every vector schema in the document and existing code affected. (2) Observations schema deviates from brief without acknowledgment — 3 competing confidence/importance scales, missing `domain` field. Four HIGH issues: n8n memory contradiction, DNS rebinding, reflection race condition, OOM execution loss. UXUI tooling direction reversed from MEMORY.md/CLAUDE.md.

---

## Post-Fix Verification (19 fixes applied)

### Fix Verification Results

| # | Issue | Fix | Verified |
|---|-------|-----|----------|
| 1 | 🔴 Voyage AI research missing | FIX-1: `voyage-3` 1024d SDK, pricing, migration SQL, Sprint 0 blocker (L336-344) | ✅ Comprehensive |
| 2 | 🔴 Observations schema brief 불일치 | FIX-2: `confidence REAL 0.3-0.9` + `domain VARCHAR` added (L365-366). Scale Reconciliation note (L376-380). `task_executions` FK deferred with annotation (L360-362). | ✅ Complete |
| 3 | n8n memory contradiction | FIX-3: `--memory=2g` per Brief (L200). Escalation path documented (L204). | ✅ Matches Brief |
| 4 | n8n DNS rebinding | FIX-4: `127.0.0.1:5678:5678` + `N8N_HOST=127.0.0.1` + iptables UID (L220-222) | ✅ Defense-in-depth |
| 5 | Reflection cron race | FIX-5: `pg_advisory_xact_lock` + SKIP LOCKED (L402). Purge cron added (L403). | ✅ Both guards present |
| 6 | n8n OOM kill | FIX-6: `max-old-space-size=1536` for 2GB container (L249). GitHub #16980 documented (L251). | ✅ Correct sizing |
| 7 | n8n credential isolation | FIX-7: `N8N_ENCRYPTION_KEY` AES-256-GCM (L225) | ✅ |
| 8 | Observation purge | FIX-8: ARGOS cron, 30-day, batch DELETE + VACUUM (L403) | ✅ |
| 9 | UXUI tooling reversed | FIX-9: Accurate Phase 6/7 history, tool choice deferred to Phase 0 (L472) | ✅ Corrected |
| 10 | Subframe MCP tools | FIX-10: Status column shows installed vs requires-full (L474-482) | ✅ |
| 11 | Co-residence recalc | FIX-12: n8n peak 2GB, total 6.5GB, headroom 17.5GB (L246-247) | ✅ |
| 12 | task_executions FK | FIX-2: Deferred with migration 0062 note (L360-362) | ✅ |
| 13 | Observations poisoning | Deferred to Step 4 (architecture-level) | ⚠️ Acceptable |

### Remaining Minor Issues (2)

1. **L520**: "15.5GB headroom" — stale. Co-residence table (L247) now shows 17.5GB. Should be updated.
2. **Version Matrix** (L117-128): Missing `voyageai` npm SDK entry (now a pinned v3 dependency per L338).

### Re-Scored Dimensions

| 차원 | Before | After | 가중치 | 가중점수 | 근거 |
|------|--------|-------|--------|---------|------|
| D1 구체성 | 8 | **9** | 10% | 0.90 | Voyage AI SDK + API endpoint + pricing 추가. Asset pipeline timeline + estimates. DNS defense 3-layer 구체적. Advisory lock SQL 구체적. |
| D2 완전성 | 5 | **8** | **25%** | 2.00 | Voyage AI 연구 포괄적. observations confidence+domain+purge. Go/No-Go gate table. v2 failure warning. Scale Reconciliation. 잔여: test scenarios deferred (acceptable), tool response poisoning deferred to Step 4 (acceptable). |
| D3 정확성 | 6 | **8** | 15% | 1.20 | n8n 2g 일치. observations Brief 일치. Voyage AI target 명시. task_executions FK annotated. 잔여: L520 headroom stale (15.5→17.5). |
| D4 실행가능성 | 7 | **8** | 10% | 0.80 | Voyage AI migration SQL, advisory lock code, purge SQL, asset timeline 모두 복붙 가능. |
| D5 일관성 | 5 | **8** | 15% | 1.20 | n8n memory Brief 일치. Voyage AI 1024d target 명시. observations Brief 일치. Scale Reconciliation 3-scale 해결. UXUI 방향 수정. 잔여: L520 headroom inconsistency (1곳). |
| D6 리스크 | 6 | **8** | **25%** | 2.00 | DNS rebinding 3-layer defense. Reflection race advisory lock. OOM GitHub #16980. Credential AES-256. Purge cron. v2 failure warning. 잔여: tool response poisoning (deferred, acceptable), LoRA supply chain (minor). |

### 가중 평균: 8.10/10 ✅ PASS

계산: (9×0.10) + (8×0.25) + (8×0.15) + (8×0.10) + (8×0.15) + (8×0.25) = 0.90 + 2.00 + 1.20 + 0.80 + 1.20 + 2.00 = **8.10**

### Final Verdict
**PASS — 8.10/10** (Grade B+ → A-). All 2 CRITICAL and 4 HIGH issues resolved. Scale Reconciliation note is excellent — acknowledges 3 scales with clear purpose differentiation. Voyage AI migration plan is comprehensive with Sprint 0 blocker estimate. DNS rebinding defense is defense-in-depth (Docker binding + env var + iptables). Two minor residuals (L520 headroom stale, version matrix missing voyageai) do not affect pass threshold.
