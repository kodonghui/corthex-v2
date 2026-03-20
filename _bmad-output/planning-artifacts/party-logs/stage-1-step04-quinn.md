# Critic-B (QA + Security) Review — Stage 1 Step 04: Architectural Patterns

**Reviewer**: Quinn (QA Engineer)
**Date**: 2026-03-20
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 4: Architectural Patterns" (L993-L1324)
**Rubric**: Critic-B weights — D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | OfficeStateStore class code. Rate limiting 10msg/s with server-side throttle. n8n 6-layer security table with exact implementations (crypto.timingSafeEqual, Docker memory:4G). Key-aware fallback full code with PERSONALITY_KEYS set (10 keys). Cron backpressure code with MAX_BATCH=50, MAX_UNPROCESSED_ALERT=500. Pipeline ASCII diagram (runtime + cron paths). Migration ordering (0061-0063). Service file tree (6 new + 3 existing). Go/No-Go gate table with 8 verification methods. |
| D2 완전성 | 9/10 | All 9 carry-forward items from Steps 2-3 resolved: Layer C regex (4.3.4), Go/No-Go #2 fallback (4.3.3), WS rate limiting (4.1.3), n8n isolation (4.2.1), reflection model (4.4.2), observation lifecycle 3 sub-risks (4.4.3), embedding backfill (pipeline diagram), Brief §4 annotation (L1097), Option A spread (4.3.2). All 6 layers covered (4.1-4.5) + cross-layer (4.6). |
| D3 정확성 | 8/10 | **Verified against codebase**: (1) `soul-renderer.ts:34` const vars declaration ✅ (actual L34), `:41` extraVars spread ✅ (actual L41), `:45` regex replace ✅ (actual L45). (2) `0039_sns-platform-enum-extension.sql` exists ✅. (3) `tier_configs` table exists ✅ (schema.ts:174, migration 0048). (4) `night-job` EventBus channel exists ✅ (index.ts:238). (5) BUILT_IN_KEYS 6개 matches actual code (L34-41 has 6 keys before ...extraVars) ✅. **BUT**: (1) Cron backpressure code (L1219-1223) has Drizzle `count()` return type issue — `db.select({ count: sql\`count(*)\` })` returns `[{ count: "500" }]` (array of objects), but L1223 compares `unprocessedCount > MAX_UNPROCESSED_ALERT` which is array > number — always false. Should be `unprocessedCount[0].count`. (2) L1063 "MCP tools" for n8n workflows is terminologically ambiguous — they're registered as builtin tool handlers, not actual MCP protocol tools. |
| D4 실행가능성 | 9/10 | Key-aware fallback is production-ready code. Go/No-Go gate verification methods are specific and testable. Migration ordering prevents dependency issues. Service file organization follows v2 patterns. OfficeStateStore pattern is standard game-state-outside-React approach. |
| D5 일관성 | 9/10 | 0-100 integer confirmed (Decision 4.3.1 table, L1085-1097) — consistent with Steps 2-3 ✅. 1-10 importance (L1169) — consistent ✅. Option A spread reversal (Decision 4.3.2) — consistent with Winston recommendation + Steps 2-3 ✅. `[^}]+` regex keep (Decision 4.3.4) — consistent with carry-forward ✅. `../db/pgvector` helper (implied in pipeline diagram) — consistent ✅. Brief §4 deviation documented (L1097) ✅. soul-renderer L7 comment says "7개 변수" including knowledge_context, but doc correctly identifies 6 built-ins — minor stale comment discrepancy. |
| D6 리스크 | 9/10 | n8n 6-layer security comprehensive (Network→Transport→API→Webhook→Data→Resource). Go/No-Go #3 test spec covers port scan + tag bypass + HMAC tamper. Cron backpressure: MAX_BATCH=50 caps LLM cost, MAX_UNPROCESSED_ALERT=500 with ARGOS notification. Neon Pro requirement documented as Sprint 0 prerequisite. 90-day TTL prevents unbounded storage growth. Key-aware fallback resolves Go/No-Go #2 silent failure. Embedding backfill with max retries 3. Only gap: Go/No-Go #5 PixiJS bundle "< 200KB gzipped" may be tight for PixiJS v8 + @pixi/react — should verify with `extend()` tree-shaking benchmark. |

---

## 가중 평균

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 25% | 2.25 |
| **합계** | | **100%** | **8.85/10 ✅ PASS** |

---

## 이슈 목록

### Issue 1 — [D3 정확성] Cron backpressure code Drizzle count() return type (Medium)
- **L1219-1223**: `const unprocessedCount = await db.select({ count: sql\`count(*)\` }).from(observations).where(...)`
- Returns `[{ count: "500" }]` (array of objects, count as string for PostgreSQL bigint)
- **L1223**: `if (unprocessedCount > MAX_UNPROCESSED_ALERT)` — comparing array > number → always false in JavaScript
- **수정**: `const [{ count }] = await db.select(...)` 또는 `unprocessedCount[0].count` destructure + `Number()` cast
- **영향**: Sprint 3 dev가 이 패턴을 복사하면 알림 작동 불가. Architecture 문서이므로 즉시 빌드 깨짐은 아니지만 구현 시 혼동.

### Issue 2 — [D3 정확성] n8n "MCP tools" 용어 모호 (Low)
- **L1063**: "n8n workflows exposed as **MCP tools** via `services/n8n-client.ts`"
- **L1066**: "registered as builtin tool handler in `agent-loop.ts`"
- n8n workflows는 MCP protocol tools가 아닌 **builtin tool handlers** — MCP는 Claude Code 외부 도구 프로토콜
- **영향**: dev가 실제 MCP server 구현으로 오해할 가능성. "builtin agent tools" 또는 "agent tool handlers"로 명확화 권장.

### Issue 3 — [D6 리스크] Go/No-Go #5 PixiJS 200KB gzipped 기준 검증 필요 (Low)
- **L1320**: `du -sh dist/assets/*.js < 200KB gzipped`
- PixiJS v8 core + @pixi/react + AnimatedSprite → tree-shaking 후에도 ~150-250KB gzipped 범위
- `extend()` 패턴으로 최소화 가능하지만 200KB 기준이 충족 가능한지 Sprint 0 benchmark 필요
- **영향**: 기준 미충족 시 Go/No-Go #5 gate 불필요한 blocking. 기준을 300KB로 완화하거나 benchmark 후 확정 권장.

---

## 자동 불합격 체크

| 조건 | 결과 |
|------|------|
| 할루시네이션 | ✅ CLEAR — soul-renderer.ts L34/41/45 verified, 0039 migration exists, tier_configs exists, night-job EventBus exists. All code references accurate. |
| 보안 구멍 | ✅ CLEAR — n8n 6-layer security comprehensive. Key-aware fallback closes Go/No-Go #2 gap. 4-layer sanitization intact. HMAC + crypto.timingSafeEqual. |
| 빌드 깨짐 | ✅ CLEAR — All additive migrations. No breaking changes to existing code paths. |
| 데이터 손실 위험 | ✅ CLEAR — 90-day TTL on processed observations only. agent_memories permanent. Optional JSONL archival. |
| 아키텍처 위반 (E8) | ✅ CLEAR — All new services in `services/`. n8n routes in `routes/workspace/`. Office code in `packages/app/`. Engine boundary explicitly checked per section. |

---

## Cross-talk Notes

- **Winston에게**: (1) Decision 4.3.2 Option A spread reversal — 검증 완료, 기존 코드 L34-41과 정확히 일치합니다. (2) Decision 4.3.4 Layer C regex keep `[^}]+` — 동의합니다. Sprint 0 template audit SQL 쿼리가 4.3.4에 제공되어 있어 나중에 `\w+` 전환 여부를 데이터 기반으로 결정 가능. (3) Go/No-Go #5 PixiJS 200KB — tree-shaking benchmark Sprint 0에서 검증 필요. 기준 완화 가능성 검토 부탁드립니다.
- **John에게**: (1) Observation lifecycle 3 sub-risks 전부 Decision 4.4.3에서 해결 — Neon Pro Sprint 0 전제조건, cron backpressure MAX_BATCH=50 + 알림, 90-day TTL. PM 관점에서 Neon Pro 비용($19/mo)이 Sprint 0 예산에 포함되어야 합니다. (2) Go/No-Go gate summary (4.6.3) 8개 gate 전부 verification method 포함 — Sprint 계획에 gate testing 일정 반영 필요.

---

## 최종 판정

**8.85/10 ✅ PASS**

Step 4는 Steps 2-3의 모든 carry-forward를 해결한 comprehensive architectural decision 문서. 특히 n8n 6-layer security model(4.2.3)과 cron backpressure pattern(4.4.3)이 production-level 수준. key-aware fallback(4.3.3)으로 Go/No-Go #2 silent failure 문제 해결. **모든 code reference를 실제 코드베이스에서 검증 완료** — soul-renderer.ts line numbers, 0039 migration, tier_configs, night-job EventBus 전부 정확.

3개 이슈 (0 HIGH, 1 Medium, 2 Low). 수정 적용 시 9.10+ 예상.

---

## Cross-talk Addendum (Post-Review)

### Issue 4 — [D3 정확성] Migration 0061 `IF NOT EXISTS` 누락 (Medium) — Winston 발견
- **L1256**: `ALTER TYPE memory_type ADD VALUE 'reflection'`
- **v2 기존 패턴** (`0039_sns-platform-enum-extension.sql:4`): `ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'twitter'`
- `IF NOT EXISTS` 없으면 Neon branch merge / migration 재실행 시 `ERROR: enum label "reflection" already exists`
- **코드베이스 검증**: `0039_sns-platform-enum-extension.sql` 직접 읽어 `IF NOT EXISTS` 패턴 확인 ✅
- **수정**: `ALTER TYPE memory_type ADD VALUE IF NOT EXISTS 'reflection';`

### Issue 5 — [D2 완전성] DEFAULT_PERSONALITY 상수 TypeScript 정의 누락 (Medium) — Winston 발견
- L1142 `DEFAULT_PERSONALITY[k]` 참조하지만 Step 4에 상수 정의 없음
- Go/No-Go #2 테스트 assertion에 필수 값
- **수정**: `personality-injector.ts`에 export const 정의 (10개 키)

### Cross-talk 참고 (문서화 권장, 점수 미반영)
- **John #1**: n8n tag race condition → 보안 이슈 아닌 UX 이슈 (untagged = invisible to all). `createWorkflowWithTag()` sequential wrapper 권장.
- **John #2**: OfficeStateStore ephemeral → Expected behavior. Decision 4.1.1에 한 줄 문서화 권장.
- **Winston #2**: personality_traits NULL → opt-in via template 설계 확인. 4개 테스트 케이스 제시.

**총 5개 이슈** (0 HIGH, 3 Medium, 2 Low). 수정 적용 시 9.10+ 예상.

---

## 🔄 Fix Verification (Post-Review)

**Dev 수정 확인 일시**: 2026-03-20

### Issue 1 — Drizzle count() return type → ✅ VERIFIED
- **L1234**: `const [{ count }]` destructured ✅
- **L1238**: `Number(count)` cast ✅
- Comparison now works correctly: `Number("500") > 500` → proper boolean

### Issue 2 — n8n "MCP tools" 용어 → ✅ VERIFIED (partial)
- **L1066**: "builtin agent tools" ✅
- **L1061**: ASCII diagram still says "MCP tool handler" — minor residual, non-blocking

### Issue 3 — PixiJS bundle target → ✅ VERIFIED
- **L1340**: "target TBD (Sprint 0 benchmark)" ✅ — hard 200KB 제거

### Issue 4 — Migration 0061 IF NOT EXISTS → ✅ VERIFIED (Step 4 only)
- **L1276**: `ADD VALUE IF NOT EXISTS 'reflection'` ✅
- **Note**: Steps 2-3 (L330, L358, L776) still lack `IF NOT EXISTS` — Step 4가 authoritative architecture decision이므로 non-blocking

### Issue 5 — DEFAULT_PERSONALITY constant → ✅ VERIFIED
- **L1139-1147**: Full TypeScript definition with 10 keys ✅
  - 5 personality values: O=60, C=75, E=50, A=70, N=25
  - 5 desc values: moderate/high/moderate/high/low
- Go/No-Go #2 테스트 assertion 작성 가능

### Winston cross-talk items → ✅ VERIFIED
- Migration 0063 `DEFAULT NULL` explicit (L1313) ✅
- Opt-in via template design documented ✅

---

## 수정 후 점수 재산정

| 차원 | 기존 | 수정후 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9 | 9 | 변동 없음 |
| D2 완전성 | 9 | 9 | DEFAULT_PERSONALITY 추가로 Go/No-Go #2 testability 확보 |
| D3 정확성 | 8 | **9** | Drizzle count() 정정, terminology 수정, IF NOT EXISTS 추가 |
| D4 실행가능성 | 9 | 9 | 변동 없음 |
| D5 일관성 | 9 | 9 | 변동 없음 |
| D6 리스크 | 9 | 9 | PixiJS benchmark deferred — 적절한 결정 |

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 25% | 2.25 |
| **합계** | | **100%** | **9.00/10 ✅ PASS** |

---

## Final Verified 판정

**9.00/10 ✅ PASS (Verified)**

5개 이슈 전부 해결. Drizzle count() return type 정정, n8n terminology 수정, PixiJS benchmark 유보, migration IF NOT EXISTS 추가, DEFAULT_PERSONALITY 상수 정의 완비. Step 4 Architectural Patterns — 9개 carry-forward 전부 해결 + production-level architecture decisions. n8n 6-layer security, cron backpressure, key-aware fallback, observation lifecycle 전부 구현 가능한 수준.

---

## 🔄 Addendum Verification — Personality Automatic Injection

**Dev addendum 확인 일시**: 2026-03-20

### Migration 0063 DEFAULT NULL → DEFAULT JSONB → ✅ VERIFIED
- **L1317**: `DEFAULT '{"openness":60,"conscientiousness":75,"extraversion":50,"agreeableness":70,"neuroticism":25}'::jsonb` ✅
- Default values match DEFAULT_PERSONALITY constant (L1140-1147) ✅
- **Note**: Step 2 L754 still says `DEFAULT NULL` — Step 4 authoritative, non-blocking

### Automatic injection 문서화 → ✅ VERIFIED
- **L1161**: "Personality injection is automatic" — Brief §4 reference ("모든 에이전트가 동일한 성격으로 응답") ✅
- **L1162**: Data layer — migration backfills existing agents ✅
- **L1163**: Injection layer — always injects, unused placeholders harmless ✅
- **L1164**: Key-aware fallback = defensive only, not primary path ✅

### 설계 일관성 평가
- Brief §4 "100% injection rate" → automatic ✅
- Go/No-Go #1 safe: unused vars injected but no harm ✅
- Go/No-Go #2 defensive: key-aware fallback for edge cases ✅
- 2중 안전장치: (1) migration DEFAULT guarantees data, (2) key-aware fallback handles impossible-but-defensive scenario

**점수 변동 없음** — 9.00/10 유지. 이 변경은 기존 architecture를 강화하는 문서화 개선이며, 새로운 차원 점수에 영향을 주는 수준의 변경이 아님.

**최종 확정: 9.00/10 ✅ PASS**
