# Critic-A (Architecture) Review — Step 4: Architectural Patterns

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 4: Architectural Patterns" (L993-1324)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Code snippets for every decision point — OfficeStateStore, sanitizeExtraVars, key-aware fallback, backpressure handler. Migration numbers correct (0061-0063, after existing 0060). Rate limiting pinned (10 msg/s). Cost model ($1.80 vs $39). Batch caps (50 per run, 500 alert). TTL (90 days). Map size (2560×1440). **Gaps**: (1) `DEFAULT_PERSONALITY` constant referenced at L1142 but values never defined in Step 4 (Step 3 had O=60,C=75,E=50,A=70,N=25 — should cross-reference). (2) Rate limiting mechanism unspecified — token bucket? sliding window? per-connection or per-user? (3) HNSW index memory footprint for 768-dim embeddings at 365K/year not estimated against 24GB VPS headroom. |
| D2 완전성 | 9/10 | All 6 domains covered with binding architecture decisions. 9 carry-forwards from Steps 2-3 claimed resolved — verified all 9: Layer C regex (4.3.4), key shadowing (4.3.2), WS rate limiting (4.1.3), trait range (4.3.1), embedding backfill (4.4.1), observation retention (4.4.3C), Go/No-Go #2 (4.3.3), Step 4 outline (implicit). Cross-layer section (4.6) ties migrations, services, and Go/No-Go gates. **Gap**: `DEFAULT_PERSONALITY` constant definition missing — should be in 4.3.3 or 4.6 as a shared constant. |
| D3 정확성 | 9/10 | soul-renderer.ts L34-45 code verified ✅ — `...extraVars` at L41 after built-ins, `[^}]+` regex at L45. Migration 0060 is latest → 0061-0063 correct ✅. memoryTypeEnum `['learning', 'insight', 'preference', 'fact']` at schema.ts:28 ✅. 0039 enum extension pattern exists ✅. EventBus `night-job` payload shape `{ companyId, payload: { type, ... } }` matches existing usage in cron-execution-engine.ts and job-queue.ts ✅. **Issue**: Migration 0061 shows `ALTER TYPE memory_type ADD VALUE 'reflection'` without `IF NOT EXISTS` — existing pattern (0039) uses `IF NOT EXISTS`. Minor but inconsistent. |
| D4 실행가능성 | 9/10 | Extremely implementation-ready. Key-aware fallback code (4.3.3) is copy-paste-and-test. sanitizeExtraVars with BUILT_IN_KEYS Set (4.3.2) is clean. Backpressure handler with MAX_BATCH/MAX_UNPROCESSED_ALERT (4.4.3B) actionable. Tier-based reflection model selection via existing tier_configs table (4.4.2) leverages v2 infrastructure. Migration SQL follows established patterns. **Gap**: `personality_traits` JSONB column (migration 0063) has no DEFAULT specified — existing agents get NULL. Go/No-Go #1 (zero regression) needs test confirming soul-renderer handles NULL personality_traits gracefully. |
| D5 일관성 | 9/10 | E8 boundary sacrosanct — all 5 new services in `services/`, never in `engine/`. 0-100 integer unified with Brief §4 override documented. Migration numbering sequential from 0060. EventBus night-job channel naming matches existing pattern. Service file organization extends existing `services/` directory logically. Key shadowing Option A and Layer C regex decisions consistent with Steps 2-3 cross-talk consensus. **Issue**: Migration 0061 should use `IF NOT EXISTS` to match 0039 pattern for idempotency. |
| D6 리스크 | 8/10 | Neon Pro upgrade identified as Sprint 0 prerequisite (good). Cron backpressure handled (50 cap, 500 alert). 90-day TTL with optional JSONL archive. Tier-based cost ceilings. Docker healthcheck from Step 3 applied. **Missing**: (1) `personality_traits` NULL default for existing agents — what happens when soul-renderer hits `personality_openness` in template but `personality_traits` is NULL? Key-aware fallback (4.3.3) catches empty string but does `personality-injector.ts` even run when column is NULL? This is a Go/No-Go #1/#2 intersection risk. (2) HNSW index memory cost — 365K×768-dim vectors ≈ ~1.1GB RAM for index alone. Step 2 calculated 15.5GB headroom but HNSW cost not included. (3) Rate limiting mechanism (token bucket vs sliding window) has different failure modes under burst traffic. |

### 가중 평균: 8.75/10 ✅ PASS

Calculation: (8×0.15) + (9×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (8×0.10) = 1.20 + 1.35 + 2.25 + 1.80 + 1.35 + 0.80 = **8.75**

---

## 이슈 목록

### Major

1. **[D6 리스크] `personality_traits` NULL → soul-renderer 폭발 경로** — Migration 0063 adds `personality_traits JSONB` with no DEFAULT. Existing agents get NULL. When `personality-injector.ts` reads NULL and passes empty extraVars to soul-renderer, the key-aware fallback (4.3.3) catches missing personality template vars. BUT: the fallback relies on the *template containing* `{{personality_openness}}` etc. If the soul template was written before v3 and has NO personality placeholders, the fallback is never triggered and personality is silently absent. This is correct behavior (no personality = no injection), but the doc should **explicitly state** that personality injection is opt-in via soul template content, not automatic for all agents. Otherwise a developer may assume all agents get personality.

2. **[D1 구체성] `DEFAULT_PERSONALITY` 상수 미정의** — L1142 `DEFAULT_PERSONALITY[k] ?? ''` — this constant is the lynch-pin of Go/No-Go #2 fallback, but its values are nowhere in Step 4. Step 3 mentioned defaults (O=60, C=75, E=50, A=70, N=25) but this Step should define the constant explicitly or cross-reference with line number.

### Minor

3. **[D3 정확성] Migration 0061 `IF NOT EXISTS` 누락** — L1256 `ALTER TYPE memory_type ADD VALUE 'reflection'` — 0039 pattern uses `IF NOT EXISTS`. Without it, migration is not idempotent. If migration runs twice (e.g., Neon branch merge), it fails with "enum label already exists". Add `IF NOT EXISTS`.

4. **[D6 리스크] HNSW 인덱스 메모리 미산정** — L1249 observations table has HNSW index on embeddings. 365K rows/year × 768-dim × 4 bytes = ~1.1GB for vectors alone. HNSW graph overhead typically 1.5-2× → ~1.7-2.2GB RAM. This erodes the 15.5GB headroom calculated in Step 2. Should note in VPS resource planning.

5. **[D1 구체성] Rate limiting 메커니즘 미지정** — L1033 "Max 10 messages/second per client" but no algorithm specified. Token bucket (allows bursts) vs sliding window (strict) have different UX implications for movement smoothness. Also unclear: per-WebSocket-connection or per-userId? A user with multiple tabs creates multiple WS connections.

6. **[D4 실행가능성] `personality_traits` JSONB DEFAULT 미지정** — Migration 0063 `ADD COLUMN personality_traits JSONB` — no DEFAULT clause. Should be `DEFAULT NULL` (explicit) or `DEFAULT '{}'::jsonb`. NULL means `personality-injector.ts` must handle NULL check before accessing properties. `'{}'` means no null-check needed but empty object semantics differ. Architecture decision needed.

---

## Cross-talk 요청

- **Quinn**: (1) `DEFAULT_PERSONALITY` 상수 — Go/No-Go #2 테스트 설계 시 이 값이 확정되어야 함. 테스트 관점에서 default 값의 검증 기준. (2) `personality_traits` NULL 핸들링 — personality-injector.ts가 NULL JSONB를 받았을 때의 동작 테스트 케이스. (3) Migration 0061 `IF NOT EXISTS` — 리그레션 테스트 관점.
- **John**: (1) HNSW 인덱스 메모리 비용 — VPS 자원 계획에 반영 필요. 15.5GB headroom에서 ~2GB 차감. (2) `personality_traits` opt-in vs automatic — PM 관점에서 "모든 에이전트가 성격을 가지는가?" 아니면 "soul template에 placeholder가 있는 에이전트만?"

## Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | 9 | DEFAULT_PERSONALITY 10-key constant defined inline (L1140-1147). Token bucket rate limiting per-userId specified (L1035-1036). PixiJS bundle "target TBD (Sprint 0 benchmark)" — acceptable deferral. |
| D2 완전성 | 9 | 9 | Already high. Personality "automatic" documented with Brief §4 references (L1161-1165). Migration 0064 added to ordering (L1318). |
| D3 정확성 | 9 | 9 | IF NOT EXISTS fixed (L1280). Migration 0063 DEFAULT backfill correct (L1317). **One new issue**: L1274 attributes HNSW ~2.5-3GB to VPS headroom ("15.5→12.5GB"), but pgvector runs on **Neon compute node**, not VPS (John PM verified). VPS headroom 15.5GB is unaffected by HNSW. Should note as Neon compute cost, not VPS RAM cost. Minor — doesn't affect correctness of architecture, only resource attribution. |
| D4 실행가능성 | 9 | 10 | Migration 0063 now has DEFAULT jsonb with backfill values — existing agents get personality automatically. Token bucket implementation in `routes/workspace/office.ts` with `Map<userId, { tokens, lastRefill }>` — copy-paste ready. Ephemeral state restart behavior documented (L1024). |
| D5 일관성 | 9 | 9 | IF NOT EXISTS matches 0039 pattern. Migration 0064 in ordering. Personality "automatic" aligns with Brief §4. |
| D6 리스크 | 8 | 9 | NULL personality → automatic with defaults eliminates opt-in ambiguity. Ephemeral office state decision documented. HNSW memory noted (attribution location wrong but risk acknowledged). Neon Pro in Sprint 0 budget. |

**가중 평균: 9.20/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (10×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 2.00 + 1.35 + 0.90 = **9.20**

All 6 original issues resolved. Cross-talk items 7-9 resolved (PixiJS TBD, 0064 ordering, ephemeral state). One minor D3 note: HNSW memory should be attributed to Neon compute, not VPS headroom — carry-forward to Step 5.

**Note on personality architecture evolution**: Dev's initial fix documented personality as "opt-in via template." John PM's Brief analysis (§4 L102, L343, L345) confirmed Brief intent is "automatic for all agents." Dev corrected to "automatic" with migration 0063 DEFAULT backfill. Quinn QA confirmed data flow: `buildPersonalityVars` always injects defaults even for NULL traits. This is the correct outcome — architecture now matches Brief intent.

---

## Cross-talk Additions (post-review)

7. **[D1 구체성] Go/No-Go #5 PixiJS 번들 한도 완화** (from Quinn cross-talk) — PixiJS 8 + @pixi/react + AnimatedSprite + Container + Sprite, tree-shaking `extend()` 패턴으로도 200KB gzipped는 빠듯함. **Architecture recommendation**: 200KB → **300KB gzipped (office route chunk)** 로 완화. Sprint 0에서 실측 benchmark 후 확정. 300KB 초과 시 AnimatedSprite lazy-load + office route code-split. Go/No-Go #5 gate 수정 필요.

8. **[D5 일관성] Migration 0064 순서 누락** (from John cross-talk, Winston verified) — agent_memories HNSW 인덱스가 Migration 0064로 추가됨 (L1266-1268). 그러나 4.6.1 Migration Ordering에는 0061-0063만 명시. 0064 추가 필요:
   ```
   0064_agent-memories-embedding-hnsw.sql — HNSW index on agent_memories.embedding (Sprint 3)
   ```

9. **[D6 리스크] OfficeStateStore 상태 소실 명시** (from John cross-talk, Winston architecture decision) — VPS 재시작/배포 시 in-memory Map 소실. **아키텍처 결정: 소실 허용**. Transient state (x,y 좌표, 애니메이션)는 in-memory 적합. Persistent state (desk assignment)는 DB. Doc에 "State is ephemeral — server restart resets all agents to assigned desk positions" 한 줄 추가 권장.

---

*Winston, Architect — "8.75. The strongest Step so far architecturally — every carry-forward resolved, E8 boundary clean, and the 4-layer sanitization is production-grade. The personality_traits NULL path is the key risk: not a bug, but an ambiguity that will bite during Sprint 1 if not clarified. Is personality opt-in or opt-out? Cross-talk added 3 items: PixiJS bundle 300KB, migration 0064 ordering, and office state ephemeral decision."*
