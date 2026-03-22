## Critic-B (Quinn) Review — Stage 4 Step 4: v3 Core Architectural Decisions (GATE)

### Review Date
2026-03-22 ([Verified] R2 FINAL)

### Content Reviewed
`_bmad-output/planning-artifacts/architecture.md` — Step 4 (L348-670): 13 new decisions (D22-D34), SQL schemas, security architecture, infrastructure, implementation sequence, PRD carry-forward resolution.

---

### R1 Summary
7.30/10 PASS. 3 HIGH: observations schema missing 3 PRD fields, cron frequency 24× mismatch, proxy IP wrong direction. 1 MEDIUM: tool-sanitizer PostToolUse can't modify LLM results. 2 LOW: Docker Compose gaps. Winston applied 34 fixes from 4 critics.

---

### R2 Independent Verification

#### Fix Verification (14 fix categories, all confirmed)

**D22 observations schema (9 column fixes):**
1. ✅ `session_id UUID` added (L391) — FR-MEM1 compliant
2. ✅ `outcome VARCHAR(20) DEFAULT 'unknown'` added (L395) — FR-MEM9 `outcome='success'` tracking enabled
3. ✅ `tool_used VARCHAR(100)` added (L396) — FR-MEM1 compliant
4. ✅ `importance INTEGER DEFAULT 5` added (L397) — Park et al. sum>150 trigger
5. ✅ `observed_at TIMESTAMPTZ` added (L403)
6. ✅ `task_execution_id UUID` added (L392) — FK deferred
7. ✅ `source` → `domain VARCHAR(50)` renamed (L394)
8. ✅ Index updated: `importance DESC` in partial index (L410)
9. ✅ `flagged` retained with MEM-6 layer 4 documentation (L402)

**D22 agent_memories/agents ALTER (4 fixes):**
10. ✅ `confidence REAL DEFAULT 0.7` ALTER removed (L434 comment: 기존 integer(0-100) 유지)
11. ✅ `ALTER TYPE memory_type ADD VALUE IF NOT EXISTS 'reflection'` + 트랜잭션 외부 주석 (L431-432)
12. ✅ `ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits JSONB CHECK(...)` (L443-446)
13. ✅ Confidence scale documentation added (L423-426): observations REAL 0-1 vs agent_memories INTEGER 0-100

**D23 soul-enricher (REWRITE verified):**
14. ✅ Flow: hub.ts 중심 (L498-517). "agent-loop.ts에는 renderSoul 호출 없음 (grep 0건)" — independently verified: agent-loop.ts imports 0 renderSoul references. renderSoul callers: hub.ts, commands.ts, presets.ts, public-api/v1.ts, telegram-bot.ts, agora-engine.ts, argos-evaluator.ts, organization.ts, call-agent.ts = **9 production files** (architecture says 8 — close approximation). PASS.
15. ✅ 4-param signature: `renderSoul(soul, agentId, companyId, extraVars?)` matches existing soul-renderer.ts:12-16

**D25 n8n proxy (3 fixes):**
16. ✅ Proxy target: `127.0.0.1:5678` (L361). Direction clarification: "확정결정 #12는 컨테이너→호스트". PASS.
17. ✅ Docker Compose: `DB_TYPE=sqlite` added (L618). SEC-6 explicit. PASS.
18. ✅ extra_hosts comment: "n8n→CORTHEX API webhook 호출용" (L632). PASS.

**D27 tool-sanitizer (REWRITE verified):**
19. ✅ "PreToolResult 지점" (L363): `toolResults.push 직전 삽입 (PostToolUse 아님)`. Code flow explained (L474-478): sanitize → push. PostToolUse = side-effect COPY only. PASS.
20. ✅ TOOLSANITIZE chain updated (L468-478): "engine/agent-loop.ts — PreToolResult 지점". PASS.

**D28 reflection cron (REWRITE verified):**
21. ✅ Schedule: `0 3 * * *` (L586) — PRD FR-MEM3 "일 1회 크론" compliant
22. ✅ Company distribution: `hash % 60` → 03:00~03:59 (L588)
23. ✅ Trigger: `reflected=false AND confidence >= 0.7 ORDER BY importance DESC LIMIT 20` + 미달 시 스킵 (L591-595)
24. ✅ Tier caps: Tier 1-2 무제한, Tier 3-4 주 1회 (L596-598)
25. ✅ Cost check: Haiku ≤$0.10/일 (L602)

**D31 Voyage client (REWRITE verified):**
26. ✅ Path: `services/voyage-embedding.ts` (L522). `services/embedding-service.ts` exists in codebase — pattern inheritance confirmed.
27. ✅ `services/credential-vault.ts` exists in codebase — `getCredentials(companyId, 'voyage_ai')` pattern confirmed (L524, L527).
28. ✅ Signature: `getEmbedding(companyId, text)` (L526) — per-company isolation.

**Cross-component + misc:**
29. ✅ D25→D27 independence: L657 explicit note with rationale (proxy = HTTP→Admin, sanitizer = engine pipeline). PASS.
30. ✅ SEC-8 rationale: "PRD 100/min 대비 보수적" (L492). PASS.
31. ✅ Carry-forward D28: "일 1회 03:00 + 60분 분산" (L666). PASS.

#### Remaining Issues (1 LOW)

**L1 [D2]** renderSoul caller count: Architecture says "8개 caller" but grep found 9 production files. Minor approximation — no functional impact.

---

### Verification Method
- PRD FR-MEM1/MEM3/MEM9 fields compared against D22 observations schema
- Actual engine/hooks/ files inspected (5 existing hooks: tool-permission-guard, credential-scrubber, output-redactor, delegation-tracker, cost-tracker)
- agent-loop.ts PostToolUse code flow verified (L220-290)
- soul-renderer.ts extraVars parameter verified (line 16)
- Docker networking: confirmed `127.0.0.1:5678:5678` port mapping vs 172.17.0.1 bridge gateway
- Confirmed decisions 1-12 cross-referenced
- n8n SEC 8-layer mapped against PRD FR-N8N4

---

### Dimension Scores (R2)

| Dim | Score | Wt | Wtd | Evidence |
|-----|-------|-----|-----|----------|
| D1 | 9/10 | 10% | 0.90 | 17-column observations schema with types, constraints, 3 indexes. TypeScript (voyage-embedding.ts with credential-vault pattern, soul-enricher hub.ts flow). Docker Compose with DB_TYPE + extra_hosts comments. PreToolResult code flow. Tier caps. Confidence scale documentation. |
| D2 | 9/10 | 25% | 2.25 | All 3 missing PRD fields added (session_id, outcome, tool_used). Plus bonus: importance, observed_at, task_execution_id. agent_memories enum ALTER + agents personality ALTER. D25→D27 independence clarification. 6 carry-forwards. SEC 8-layer 8/8. |
| D3 | 9/10 | 15% | 1.35 | Proxy IP corrected to 127.0.0.1 with direction clarification. Cron matches PRD "일 1회" (0 3 * * *). Schema matches FR-MEM1 (session_id, outcome, tool_used). Confidence scale difference documented. soul-enricher flow matches actual codebase (9 renderSoul callers, 0 in agent-loop.ts). Voyage client patterns verified against existing embedding-service.ts + credential-vault.ts. |
| D4 | 9/10 | 10% | 0.90 | Tool-sanitizer now PreToolResult (sanitize→push). Implementation sequence updated (D25+D27 independent). Per-company credential vault for Voyage. Tier caps for reflection. Cron trigger: ≥20건 + confidence≥0.7 + importance DESC. |
| D5 | 9/10 | 15% | 1.35 | D25→D27 independence explicitly documented with rationale (L657). Carry-forward D28 updated. Proxy direction documented. SEC-8 60rpm rationale. Docker Compose DB_TYPE+extra_hosts. Confidence scale cross-table documentation. |
| D6 | 9/10 | 25% | 2.25 | Tool-sanitizer effectiveness restored (PreToolResult before push). Confidence scale mismatch flagged proactively. Tier caps prevent reflection cost overrun (Tier 3-4 주 1회). DB_TYPE=sqlite explicit (SEC-6 defense-in-depth). Memory_type enum ALTER notes transaction requirement. PostToolUse side-effect limitation clearly documented. |

### Weighted Average: 9.00/10 ✅ PASS

---

### Issues (3 HIGH, 1 MEDIUM, 2 LOW)

**H1 [D3/D2] observations schema missing 3 PRD-specified fields**

PRD FR-MEM1 explicitly lists observation fields: `(company_id, agent_id, session_id, content, outcome, tool_used)`.

D22 schema has: `company_id` ✅, `agent_id` ✅, `content` ✅. **Missing**:
- `session_id` — connects observations to conversation sessions
- `outcome` — tracks success/failure. **FR-MEM9 explicitly needs this**: "성공 기준: observations.outcome='success'" for success rate tracking
- `tool_used` — records which tool generated the observation

Without `outcome`, FR-MEM9's growth metrics (유사 태스크 성공률 추이) cannot be implemented as specified.

**Fix**: Add 3 columns to D22 schema:
```sql
session_id UUID,  -- NULL = non-session observation
outcome VARCHAR(20) DEFAULT 'unknown',  -- success|failure|partial|unknown (FR-MEM9)
tool_used VARCHAR(100),  -- tool name that generated observation (FR-MEM1)
```

**H2 [D3] Reflection cron frequency mismatch with PRD**

D28 proposes: `croner "*/5 * * * *"` (every 5 min) with `company_id hash % 12 × 5분 오프셋` → each company runs reflection **once per hour** (12 slots × 5min = 60min).

PRD FR-MEM3 says: "백그라운드 워커(memory-reflection.ts)가 **일 1회** 크론으로 실행되며"

This is a **24× frequency increase** (hourly vs daily). This may be a deliberate architectural improvement (faster reflection = fresher memories), but the deviation from PRD is unacknowledged.

**Fix**: Either:
- (a) Acknowledge PRD deviation with rationale: "PRD FR-MEM3은 일 1회 명시하나, 20개 관찰 축적 속도 감안 시 시간당 1회가 현실적. 회사별 오프셋으로 PG 부하 분산."
- (b) Change to daily: `"0 3 * * *"` (매일 03:00) with company offset minutes

**H3 [D3] n8n proxy target IP wrong**

D25 says: `Hono proxy() → http://172.17.0.1:5678 (확정 결정 #12)`

**172.17.0.1 is the Docker bridge gateway** — used by containers to reach the HOST. But the Hono proxy runs ON THE HOST, not inside Docker. The Docker Compose maps `"127.0.0.1:5678:5678"` (SEC-1 localhost only). From the host:

- `127.0.0.1:5678` ✅ — reaches container via port mapping
- `172.17.0.1:5678` ❌ — Docker bridge gateway; port mapping only binds to 127.0.0.1, not docker0 interface

확정 결정 #12 ("host.docker.internal 미작동 → 172.17.0.1 또는 host-gateway") applies to **containers reaching the host**. The Docker Compose correctly uses `extra_hosts: host.docker.internal:host-gateway` for n8n→CORTHEX API calls. But D25 misapplies this decision to the reverse direction (host→container).

**Fix**: Change proxy target to `http://127.0.0.1:5678`. Add note: "확정 결정 #12는 n8n→CORTHEX API (extra_hosts) 방향. Proxy 방향(Hono→n8n)은 127.0.0.1:5678 (port mapping)."

**M1 [D4/D6] tool-sanitizer PostToolUse can't modify LLM-bound results**

Current agent-loop.ts code (L238-247):
```typescript
toolResults.push({ content: callAgentOutput })  // ← pushed FIRST
// PostToolUse hook chain
let output = credentialScrubber(ctx, block.name, callAgentOutput)
output = outputRedactor(ctx, block.name, output)
delegationTracker(ctx, block.name, output, toolInput)
```

Tool result is pushed to `toolResults` BEFORE PostToolUse hooks run. Hooks operate on a COPY for side-effects (logging, event emission). They don't modify what gets sent to the LLM.

D27's tool-sanitizer says "감지 시 `[BLOCKED: suspected injection]` 교체" — but as a PostToolUse hook, it can't replace the already-pushed tool result.

**Fix**: Note in D27 that tool-sanitizer requires code flow adjustment: either (a) defer toolResults.push until after all hooks, or (b) sanitizer runs BEFORE push as a pre-result filter distinct from PostToolUse hooks.

**L1 [D5] Docker Compose missing explicit DB_TYPE=sqlite**

SEC-6 states "n8n DB_TYPE=sqlite (내부 SQLite). CORTHEX PG 접근 경로 없음". But the Docker Compose environment section doesn't set `DB_TYPE=sqlite`. n8n defaults to SQLite, but making it explicit reinforces SEC-6 as defense-in-depth.

**Fix**: Add `- DB_TYPE=sqlite` to Docker Compose environment.

**L2 [D5] extra_hosts purpose should be documented**

Docker Compose has `extra_hosts: host.docker.internal:host-gateway`. This is for n8n (inside Docker) to call CORTHEX API (on host) — e.g., n8n webhook execution → `http://host.docker.internal:3000/api/...`. But this purpose isn't documented.

**Fix**: Add comment: `# n8n→CORTHEX API 경유 (webhook 실행 시 호스트 API 호출용)`

---

### Security-Specific Assessment (R2)

| Area | Status | Evidence |
|------|--------|----------|
| PER-1 4-layer | ✅ | D23+D33: Key boundary + Zod API + extraVars strip + template regex. soul-enricher.ts in services/ (E8 compliant). hub.ts caller flow verified |
| MEM-6 4-layer | ✅ | D22: 10KB CHECK + control char + prompt hardening + flagged boolean. observations schema now complete (17 columns) |
| TOOLSANITIZE | ✅ Fixed | D27 rewritten as PreToolResult (before toolResults.push). Code flow: sanitize → push. PostToolUse limitation explicitly documented |
| N8N-SEC 8-layer | ✅ | All 8 layers mapped. Docker Compose: SEC-1(127.0.0.1 ports) + SEC-5(memory 2g) + SEC-6(DB_TYPE=sqlite) + SEC-7(encryption key) + SEC-12(extra_hosts). Direction clarified |
| Advisory lock | ✅ | D28: pg_advisory_xact_lock in daily cron 03:00 + 60분 분산 |
| Voyage AI | ✅ | D31: per-company credential vault (services/credential-vault.ts verified in codebase). getEmbedding(companyId, text) signature |
| Observations schema | ✅ Fixed | session_id, outcome, tool_used added. Plus importance, observed_at, task_execution_id. FR-MEM1/MEM9 compliant |
| Proxy networking | ✅ Fixed | 127.0.0.1:5678 (Docker ports mapping). 확정 결정 #12 direction clarified |
| Confidence scale | ✅ NEW | Cross-table mismatch documented (observations REAL 0-1 vs agent_memories INTEGER 0-100) |
| Tier caps | ✅ NEW | D28: Tier 3-4 주 1회 reflection cap. Cost overrun protection |

---

### To Analyst

**[Verified] Step 4 R2 = 9.00/10 PASS.**

QA/Security 관점 검증 결과:
1. **observations 스키마 완결**: PRD FR-MEM1 전체 필드 반영 (session_id, outcome, tool_used). FR-MEM9 성공률 추적용 outcome 컬럼 확인. Plus importance(Park et al.), observed_at, task_execution_id.
2. **tool-sanitizer PreToolResult**: PostToolUse 한계 정확히 파악 — toolResults.push 직전 삽입으로 LLM-bound 결과 수정 가능. PostToolUse = side-effect COPY 전용 명시.
3. **Proxy IP 방향**: 127.0.0.1:5678 (호스트→컨테이너 port mapping). 확정 결정 #12(172.17.0.1)는 컨테이너→호스트 방향으로 정확히 구분.
4. **Reflection 크론 PRD 일치**: `0 3 * * *` (일 1회) + 60분 분산. Tier 3-4 주 1회 cap + Haiku ≤$0.10/일. advisory lock.
5. **Voyage client 패턴 검증**: services/embedding-service.ts + services/credential-vault.ts 존재 확인. per-company credential 격리.
6. **soul-enricher E8 검증**: agent-loop.ts에 renderSoul 호출 0건 독립 확인. 9개 production caller 존재. hub.ts 중심 flow 정확.
7. **confidence 스케일 차이**: observations REAL 0-1 vs agent_memories INTEGER 0-100. 교차 비교 시 ×100 변환 필요. 구현 시 버그 방지.
8. **n8n SEC 8-layer**: Docker Compose에 DB_TYPE=sqlite 명시적 추가 (SEC-6). extra_hosts 용도 주석.

**GATE 결정 승인. Sprint 구현 준비 완료.**

### Verdict

**[Verified] 9.00/10 PASS.** All 34 fixes confirmed. GATE-level accuracy errors (proxy IP, schema fields, cron frequency) fully resolved. Tool-sanitizer rewritten as PreToolResult with clear code flow explanation. Confidence scale cross-table documentation is a valuable addition. Voyage client patterns verified against actual codebase (embedding-service.ts + credential-vault.ts exist). One LOW remaining: renderSoul caller count 8 vs 9.
