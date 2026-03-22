# Stage 4 Step 4 — dev (Critic-Implementation) Review

**Reviewer:** dev (Critic-Implementation)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` — v3 Core Architectural Decisions (D22-D34)
**Focus:** Code implementability, E8 boundary compliance, schema correctness, hook chain accuracy

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | SQL schemas with CHECK constraints, indexes, column types 전부 명시. Docker compose 구체적 (ports, env, healthcheck, resources). TypeScript code blocks 실행 가능 수준. Implementation sequence Sprint별 명시. BUT: "regex 10종" 미열거, Big Five presets "3종+" 미명명. |
| D2 완전성 | 15% | 7/10 | 13 decisions (D22-D34) covering observations, soul-enricher, WS, n8n, polling, tool-sanitizer, reflection, JSONB, office, Voyage, sprint split, Big Five, UX routing. 3 sanitization chains 상세. n8n 8-layer 완전. GAPS: memoryTypeEnum 'reflection' 마이그레이션 누락, Voyage credential vault 설정 누락, 768→1024 기존 임베딩 재생성 계획 누락, renderSoul 호출 패턴 (8+ callers) 분석 누락. |
| D3 정확성 | 25% | 5/10 | **6건 오류**: (1) D23 renderSoul이 agent-loop.ts 내부에서 호출된다고 기술 — 실제로는 callers(hub.ts, call-agent.ts 등 8곳)에서 호출, agent-loop.ts는 pre-rendered soul만 수신. (2) D22 agent_memories ALTER confidence REAL DEFAULT 0.7 — 컬럼 이미 존재: `integer('confidence').notNull().default(50)` (0-100 스케일). (3) D28 reflection INSERT `memory_type='reflection'` — memoryTypeEnum에 'reflection' 값 없음, ALTER TYPE 필요. (4) D27 tool-sanitizer PostToolUse 배치 — toolResults.push() 후 hooks 실행되므로 LLM에 전달되는 원본 응답 차단 불가 (보안 아키텍처 결함). (5) D25→D27 의존성 — n8n proxy 경로 ≠ engine tool pipeline, webhook 응답은 tool-sanitizer 미경유. (6) D31 Voyage 클라이언트 env var 싱글턴 — 기존 패턴은 per-company credential vault (`getCredentials(companyId, 'google_ai')`). |
| D4 실행가능성 | 20% | 6/10 | D22 observations 테이블 OK. D25 n8n proxy OK. D26 polling OK. D28 croner OK. D30 office OK. **BUT**: D27 PostToolUse 배치로는 FR-TOOLSANITIZE 목적 달성 불가 (LLM이 unsanitized 응답 수신). D23 흐름도대로 구현 시 agent-loop.ts 수정 + 8개 caller 리팩토링 필요 (E8 최소 침습 위반). D22 ALTER 무시됨 (IF NOT EXISTS + 타입 불일치). D28 reflection INSERT 실패 (enum 미포함). |
| D5 일관성 | 15% | 6/10 | D22 confidence: REAL 0-1 vs 기존 INTEGER 0-100. D23 "agent-loop.ts 1행 삽입" vs 실제 패턴 (callers가 renderSoul 호출). D27 "PostToolUse 4번째" vs hook chain이 results 차단 불가. D31 env var vs credential vault. D25→D27 의존성이 실제 데이터 경로와 불일치. |
| D6 리스크 | 10% | 6/10 | 긍정: Neon LISTEN/NOTIFY 제약 식별, advisory lock, 메모리 예산. **미언급 리스크**: D27 보안 허점 (tool results unsanitized → prompt injection 가능), memoryTypeEnum 마이그레이션 실패 시 reflection 전체 불가, 768→1024 차원 변경 시 기존 knowledge_docs 임베딩 무효화, credential vault 어댑터 미구현 시 Voyage 클라이언트 multi-tenant 불가. |

## 가중 평균: 6.20/10 ❌ FAIL

계산: (8×0.15)+(7×0.15)+(5×0.25)+(6×0.20)+(6×0.15)+(6×0.10) = 1.20+1.05+1.25+1.20+0.90+0.60 = **6.20**

---

## 이슈 목록

### 1. [D3/D4 Critical — Security] D27 tool-sanitizer PostToolUse 배치: LLM 응답 차단 불가

**위치:** architecture.md L363, L450-455

**D27 주장**: `engine/hooks/tool-sanitizer.ts` — PostToolUse 경로 4번째 Hook. 패턴 탐지 시 `[BLOCKED: suspected injection]` 교체.

**실제 코드 (agent-loop.ts L277-285):**
```typescript
// L277-280: 원본 mcpOutput이 toolResults에 PUSH
toolResults.push({
  type: 'tool_result',
  tool_use_id: block.id,
  content: mcpOutput,  // ← 원본 (unsanitized)
})
// L282-285: PostToolUse hooks는 COPY만 처리
let mcpScrubbedOutput = credentialScrubber(ctx, block.name, mcpOutput)
mcpScrubbedOutput = outputRedactor(ctx, block.name, mcpScrubbedOutput)
delegationTracker(ctx, block.name, mcpScrubbedOutput, toolInput)
```

**문제**: `toolResults.push()`가 PostToolUse hooks **보다 먼저** 실행됨. Hooks는 side-effect용 COPY만 처리 (WebSocket, 로깅). tool-sanitizer를 PostToolUse에 배치하면:
- Sanitizer가 injection 감지해도 → `toolResults` 배열의 원본은 이미 push됨
- LLM의 다음 `messages.create()` 호출 시 **unsanitized 원본**이 전달됨
- FR-TOOLSANITIZE의 핵심 목적 (prompt injection 차단) 달성 불가

**보안 영향**: 도구 응답에 `ignore previous instructions` 등의 injection payload가 포함될 경우, LLM이 그대로 수신 → 행동 변조 가능.

**권고 (택 1):**
- **(A) PreToolResult 패턴**: `toolResults.push()` 직전에 sanitizer 실행. mcpOutput을 먼저 검사하고, injection 감지 시 교체 후 push:
  ```typescript
  const sanitized = toolSanitizer(ctx, block.name, mcpOutput)
  toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: sanitized })
  ```
- **(B) PostToolUse 배열 mutation**: hooks가 `toolResults` 배열의 마지막 항목을 직접 수정하는 패턴. 기존 hook 계약 변경 필요.
- **권고: (A)** — 기존 PostToolUse hook 계약 유지하면서 별도 삽입 지점으로 해결. Architecture에 "tool-sanitizer는 PostToolUse가 아닌 **PreToolResult** 지점 (toolResults.push 직전)" 명시.

### 2. [D3 Critical] D23 soul-enricher 흐름도: renderSoul 호출 위치 오류

**위치:** architecture.md L359, L476-482

**D23 주장**: "agent-loop.ts에서 `renderSoul(await soulEnricher.enrich(...))` 1행 삽입"

**흐름도 (L476-482):**
```
[허브 요청] → agent-loop.ts
  ↓ (1행 추가)
  const extraVars = await soulEnricher.enrich(agentId, companyId);
  ↓
  renderSoul(agent.soul, extraVars)  // 기존 함수, extraVars 파라미터 활용
  ↓
  messages.create({system: renderedSoul, ...})
```

**실제 코드 검증:**

1. `agent-loop.ts:49`: `export async function* runAgent(options: RunAgentOptions)` — `options.soul`은 **pre-rendered string**
2. `agent-loop.ts:142`: `text: soul || ''` — soul을 직접 사용, renderSoul 호출 없음
3. `grep renderSoul agent-loop.ts` → **0건**
4. renderSoul 호출자 (8곳):
   - `routes/workspace/hub.ts:105-106` (extraVars 이미 지원)
   - `tool-handlers/builtins/call-agent.ts:67-68` (extraVars 이미 지원)
   - `routes/commands.ts:55`
   - `services/telegram-bot.ts:96`
   - `services/argos-evaluator.ts:379`
   - `services/agora-engine.ts:170, 301`
   - `routes/workspace/presets.ts:45`
   - `routes/public-api/v1.ts:46`

**문제**: renderSoul을 agent-loop.ts 내부로 이동하면 8개 caller 전부 리팩토링 필요 → "E8 최소 침습" 위반. 또한 agent-loop.ts는 soul을 string으로 받는 것이 의도적 설계 (E8 경계: engine은 DB/template 로직을 모름).

**권고**: 흐름도를 실제 호출 패턴으로 수정:
```
[허브 요청] → hub.ts (기존 renderSoul 호출 지점)
  ↓ (기존 extraVars 로직에 1행 추가)
  const personalityVars = await soulEnricher.enrich(agentId, companyId);
  const extraVars = { ...knowledgeVars, ...personalityVars };
  ↓
  renderSoul(agent.soul, agentId, companyId, extraVars)  // 기존 호출, extraVars 확장
  ↓
  runAgent({ soul: renderedSoul, ... })  // pre-rendered string 전달
```
"agent-loop.ts 1행 삽입" → "callers(hub.ts, call-agent.ts 등)의 기존 renderSoul 호출에 extraVars 확장"으로 수정. E8 경계 유지.

### 3. [D3/D5] D22 agent_memories ALTER: confidence 컬럼 타입/스케일 불일치

**위치:** architecture.md L422-423

**Architecture:**
```sql
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS confidence REAL DEFAULT 0.7;
```

**실제 코드 (schema.ts:1598):**
```typescript
confidence: integer('confidence').notNull().default(50),  // 0-100
```

**문제 3중:**
1. `IF NOT EXISTS` → 컬럼 이미 존재 → **ALTER 무시됨** (no-op)
2. 타입 불일치: 기존 `INTEGER` vs architecture `REAL`
3. 스케일 불일치: 기존 `0-100 (default 50)` vs architecture `0-1 (default 0.7)`

**영향**: observations 테이블은 confidence REAL 0-1, agent_memories는 INTEGER 0-100. 같은 "confidence"가 두 테이블에서 다른 스케일 → reflection 크론 구현 시 스케일 변환 로직 필요하지만 미언급.

**권고 (택 1):**
- **(A)** observations.confidence도 INTEGER 0-100으로 통일 (기존 패턴 유지). ALTER 행 삭제.
- **(B)** agent_memories.confidence를 REAL 0-1로 마이그레이션 + 기존 데이터 `/100` 변환. 영향 범위 분석 필수.
- **권고: (A)** — 기존 코드 변경 최소화. observations.confidence를 `INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100)`으로 변경.

### 4. [D3/D4 Critical] D28 reflection: memoryTypeEnum에 'reflection' 없음

**위치:** architecture.md L557

**Architecture (L557):**
```
→ INSERT INTO agent_memories (memory_type='reflection', embedding=...)
```

**실제 코드 (schema.ts:28):**
```typescript
export const memoryTypeEnum = pgEnum('memory_type', ['learning', 'insight', 'preference', 'fact'])
```

**문제**: `'reflection'` 값이 enum에 없음. INSERT 시 PostgreSQL `invalid input value for enum memory_type: "reflection"` 에러 → **reflection 크론 전체 실패**.

**권고**: D22 Data Architecture 섹션에 추가:
```sql
-- memoryTypeEnum 확장 (reflection 크론 필수)
ALTER TYPE memory_type ADD VALUE IF NOT EXISTS 'reflection';
```
+ Drizzle schema 업데이트: `memoryTypeEnum` 배열에 `'reflection'` 추가.

### 5. [D3] D25→D27 Cross-Component Dependency 오류

**위치:** architecture.md L611

**Architecture:** `D25 (n8n proxy) → D27 (tool-sanitizer) | n8n webhook 응답도 tool-sanitizer 경유`

**문제**: D25는 `/admin/n8n-editor/*` (UI)와 `/admin/n8n/*` (API)의 Hono reverse proxy. 이 경로의 응답은 HTTP response로 Admin 브라우저에 반환됨. engine tool pipeline과 무관.

tool-sanitizer (D27)는 `engine/hooks/tool-sanitizer.ts`로, MCP tool 응답을 처리하는 PostToolUse hook. n8n proxy 응답이 이 hook을 경유하려면 n8n이 MCP tool로 등록되어야 하지만, architecture에서 n8n은 Admin UI 도구 (워크플로우 빌더)이지 agent tool이 아님.

**권고**: D25→D27 의존성 삭제. n8n webhook 보안은 SEC-4 (HMAC) + SEC-2 (Admin JWT)로 이미 커버됨. 만약 향후 n8n 워크플로우를 agent tool로 노출한다면, 그때 별도 의존성 추가.

### 6. [D3/D5] D31 Voyage 클라이언트: env var 싱글턴 vs per-company credential vault

**위치:** architecture.md L494-497

**Architecture:**
```typescript
import VoyageAI from 'voyageai';
const client = new VoyageAI();  // VOYAGE_API_KEY 환경변수
```

**실제 코드 (embedding-service.ts):**
```typescript
import { getCredentials } from './credential-vault'
// ...
const credentials = await getCredentials(companyId, 'google_ai')
const apiKey = extractApiKey(credentials)
```

**문제**: 기존 임베딩 서비스는 **per-company credential vault** 패턴. 회사별로 다른 API 키 사용 가능. D31은 글로벌 env var 싱글턴으로 변경 → multi-tenant 지원 불가.

**추가**: `embedDocument()`, `embedAllDocuments()` 등 기존 함수는 knowledge_docs 테이블에 특화. voyage-client.ts가 이들을 대체하려면 knowledge_docs + observations + agent_memories 3개 테이블의 embedding을 지원해야 함.

**권고**: voyage-client.ts도 credential vault 패턴 유지:
```typescript
export async function getEmbedding(companyId: string, text: string): Promise<number[]> {
  const credentials = await getCredentials(companyId, 'voyage_ai')
  const client = new VoyageAI({ apiKey: extractApiKey(credentials) })
  // ...
}
```
+ credential vault에 `voyage_ai` provider 타입 추가 언급.

---

## 구현 관점 소견

### 긍정 평가

1. **D22 observations 테이블 스키마 우수**: CHECK constraints, partial index (`WHERE reflected = false`), HNSW embedding index, TTL index — 실무 즉시 사용 가능. `flagged` 컬럼으로 MEM-6 layer 4 지원.

2. **D25 n8n 8-layer 매핑 완전**: 확정 결정 #2(2g memory), #3(8-layer), #12(host.docker.internal/172.17.0.1) 전부 반영. Docker compose 실행 가능. SEC-1~SEC-8 각 검증 방법 명시.

3. **D26 polling 결정 합리적**: Neon serverless LISTEN/NOTIFY 제약 정확히 식별. 500ms polling 부하 계산 (50 에이전트 기준 초당 2쿼리) 현실적. 향후 전환 경로 명시.

4. **D28 croner + advisory lock 패턴 실용적**: croner 10.x 이미 설치 확인, company_id hash % 12 오프셋으로 부하 분산, pg_advisory_xact_lock 중복 방지 — 세 가지 모두 검증됨.

5. **D30 packages/office 번들 격리 정확**: React.lazy + Turborepo workspace로 PixiJS가 메인 번들에 영향 0. Go/No-Go #5 (≤200KB) 측정 포인트 명확.

6. **D29 JSONB jsonb_set() 결정 적절**: Admin 단일 사용자이므로 read-modify-write race 회피. 별도 테이블 과설계 방지.

### 주의 사항

- **D27이 이 Step의 최대 리스크**: PostToolUse hook chain의 실제 동작을 이해하지 않고 배치하면 FR-TOOLSANITIZE가 무력화됨. Go/No-Go #11 (10종 adversarial payload 100% 차단율) 통과 불가능.
- **D23 흐름도 오류가 구현 시 혼동 유발**: agent-loop.ts를 수정하려는 시도 → 8개 caller 리팩토링 → Sprint 1 범위 초과 가능.
- **memoryTypeEnum 'reflection' 누락은 Sprint 3 blocker**: reflection 크론이 첫 INSERT에서 실패.

---

## [Verified] R2 Score — 8.90/10 ✅ PASS

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|---------|
| D1 구체성 | 8 | 9 | +1: observations 전체 컬럼 명시 (session_id, outcome, tool_used, importance, observed_at), D27 PreToolResult 코드 패턴 구체적, D23 8개 caller 목록, confidence 스케일 차이 문서화 |
| D2 완전성 | 7 | 9 | +2: memoryTypeEnum 'reflection' migration 추가, credential vault voyage_ai 패턴, confidence 스케일 변환 명시, Tier 한도 (Tier 1-2 무제한/Tier 3-4 주1회), observations 7개 신규 컬럼 (PRD FR-MEM1/MEM9 완전 반영) |
| D3 정확성 | 5 | 9 | +4: 6건 전부 수정 — D27 PreToolResult 배치 ✅, D23 caller-based 흐름 ✅, confidence ALTER 삭제 ✅, memoryTypeEnum migration ✅, D25→D27 의존성 삭제 ✅, Voyage credential vault ✅. D25 proxy 방향(127.0.0.1 vs 172.17.0.1) 정확히 구분 |
| D4 실행가능성 | 6 | 9 | +3: D27 PreToolResult 즉시 구현 가능, D23 callers extraVars 확장 패턴 명확, D28 reflection INSERT 성공 (enum 추가), agents personality_traits ALTER 포함 |
| D5 일관성 | 6 | 9 | +3: confidence 스케일 차이 문서화 (×100 변환), D23 caller 패턴 = 실제 코드 정합, D27 PreToolResult = hook chain과 정합, D25→D27 의존성 제거로 내부 모순 해소 |
| D6 리스크 | 6 | 8 | +2: D27 보안 허점 해소 (PreToolResult), memoryTypeEnum migration으로 Sprint 3 blocker 방지, Tier cap으로 비용 리스크 관리. 768→1024 기존 임베딩 재생성 리스크는 여전히 간략하나 확정 결정 #1에서 이미 "re-embed 필수" 명시 |

**Verified weighted avg:** (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.80+1.35+0.80 = **8.90/10 ✅ PASS**

전수 검증: 6건 fix 전부 확인.
1. D27 tool-sanitizer → PreToolResult 지점 (L363, L468-478) ✅
2. D23 soul-enricher → hub.ts 중심 흐름도 + 8개 caller 명시 (L359, L498-510) ✅
3. D22 confidence ALTER 삭제 + 스케일 차이 문서화 (L423-426, L434) ✅
4. memoryTypeEnum 'reflection' ADD VALUE (L431-432, 트랜잭션 외부 주석) ✅
5. D25→D27 의존성 삭제 + 근거 명시 (L657) ✅
6. D31 Voyage credential vault + companyId 시그니처 (L522-551) ✅

추가 검증 (타 크리틱 fixes):
- D22 observations: 7개 신규 컬럼 (session_id, task_execution_id, domain, outcome, tool_used, importance, observed_at) ✅
- D22 agents ALTER personality_traits + CHECK (L442-446) ✅
- D24 ws/channels.ts 패턴 (L360) ✅
- D25 proxy 방향 127.0.0.1 + extra_hosts 주석 (L361, L632) ✅
- D25 DB_TYPE=sqlite (L618) ✅
- D28 daily cron 03:00 + 60분 분산 + Tier cap (L369, L586-602) ✅

**잔여 이슈: 0건.**
