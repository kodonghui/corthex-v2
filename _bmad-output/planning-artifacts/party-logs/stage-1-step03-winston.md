# Critic-A (Architecture) Review — Step 3: Integration Patterns

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 3: Integration Patterns" (L485-932)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Code snippets for every integration point (PixiJS component, Docker compose, personality-injector, observations schema, n8n proxy). File paths explicit (`packages/app/src/pages/office/office-canvas.tsx`, `services/personality-injector.ts`). WS message protocol typed with exact fields. Migration filenames numbered (0061-0063). One gap: observation `importance` scoring algorithm unspecified — "auto-scored" at L765 without method. |
| D2 완전성 | 9/10 | All 6 domains covered with integration patterns. Cross-domain section (3.7) covers EventBus map, shared types, migrations, API routes. Carry-forward table (3.8) captures all 5 pending items. Step 2 carry-forwards addressed (Neon pooling, key shadowing, regex). WsChannel extension correctly identified. One omission: no mention of `observation-recorder.ts` error handling — what if Gemini Embedding API call fails during async embedding? |
| D3 정확성 | 8/10 | WsChannel union type verified: 14 existing channels ✅. `handleSubscription`/`broadcastToCompany` confirmed in `ws/server.ts:4`/`ws/channels.ts:10` ✅. EventBus bridge at `index.ts:228-234` ✅. `cosineDistance` exists at `db/pgvector.ts:33` ✅. **Error**: L786 shows `import { cosineDistance, desc } from 'drizzle-orm/pg-core'` — actual import is `from './pgvector'` (custom helper), NOT from drizzle-orm. Also: L700 says Zod validation `z.number().min(0).max(100)` — Brief §4 says traits are 0.0-1.0, Step 2 Domain 3 says `z.number().min(0).max(1)`. Self-contradiction: is the range 0-100 or 0.0-1.0? |
| D4 실행가능성 | 9/10 | Extremely implementation-ready. Docker compose YAML copy-pasteable. Hono proxy pattern follows existing route conventions. personality-injector.ts function signature and return type clear. observations table schema in Drizzle ORM format. Migration files numbered following existing pattern. 3-phase memory flow diagram actionable. |
| D5 일관성 | 8/10 | E8 boundary consistently respected — all new services in `services/`, not `engine/`. EventBus channel naming follows v2 pattern. Migration numbering sequential (0061-0063). API routes under `workspace/` matching existing structure. **Issue**: trait range inconsistency (0-100 at L700/712 vs 0.0-1.0 at Step 2 L288/296). Also Step 4 outline at L937-942 still shows old 3-layer description — should reference 4-layer from 3.3 section. |
| D6 리스크 | 8/10 | n8n security model thorough (Go/No-Go #3). Company isolation via tagging noted. Neon pooling confirmed adequate. ARGOS scheduler reuse reduces new infrastructure. **Missing**: (1) What if n8n Docker container crashes? Auto-restart via `unless-stopped` but no health check endpoint. (2) Observation embedding failure — async Gemini call at L766 could fail silently, creating observations without embeddings. (3) `/ws/office` message flooding — carry-forward mentions rate limiting but no specific numbers proposed. |

### 가중 평균: 8.50/10 ✅ PASS

Calculation: (9×0.15) + (9×0.15) + (8×0.25) + (9×0.20) + (8×0.15) + (8×0.10) = 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.80 = **8.50**

---

## 이슈 목록

### Major

1. **[D3 정확성] cosineDistance import path 오류** — L786 `import { cosineDistance, desc } from 'drizzle-orm/pg-core'` 는 실제 코드와 다름. 실제: `import { cosineDistance } from './pgvector'` (custom helper at `packages/server/src/db/pgvector.ts:33`). `desc`는 `drizzle-orm`에서 import. Copy-paste하면 빌드 깨짐 — Rubric 자동 불합격 #3 (빌드 깨짐) 근접.

2. **[D5 일관성] Big Five trait range 자기모순** — 문서 내 2곳에서 범위가 다름:
   - L700 (3.3 API validation): `z.number().min(0).max(100)` → 0-100 범위
   - L712 (3.3 DB schema): `{ openness: 60, conscientiousness: 75 }` → 0-100 값 사용
   - Step 2 L288/296 (Domain 3): `z.number().min(0).max(1)` → 0.0-1.0 범위
   - Brief §4: "5개 특성 각 0.0~1.0"

   **Brief가 권위**: 0.0-1.0이 맞음. L700과 L712를 0.0-1.0으로 통일 필요. Prompt pattern에서 `/100`을 `/1.0`으로 변경하거나, DB에 0.0-1.0 저장 후 표시 시 ×100 변환.

### Minor

3. **[D6 리스크] Observation embedding 실패 핸들링 미정의** — L766 "embedding via Gemini Embedding API (async, non-blocking)" — 실패 시 embedding이 NULL인 observation이 생성됨. Phase 3 Planning에서 pgvector 검색 시 NULL embedding row가 결과에서 제외되는 것은 좋으나, 재시도 메커니즘 없으면 embedding 없는 observation이 누적됨.

4. **[D1 구체성] Observation importance 자동 스코어링 미정의** — L765 "importance=auto-scored" — 어떤 알고리즘으로 1-10 점수를 매기는지 미정의. LLM 기반? 규칙 기반? 이 값이 Reflection threshold를 결정하므로 중요.

5. **[D6 리스크] n8n Docker 헬스체크 미정의** — Docker compose에 `restart: unless-stopped`만 있고 `healthcheck` 없음. n8n이 OOM으로 죽으면 재시작되지만, 내부적으로 데드락 상태가 되면 컨테이너는 살아있지만 API 응답 불가능. `healthcheck: curl -f http://localhost:5678/api/v1/audit || exit 1` 추가 권장.

6. **[D5 일관성] Step 4 outline 구식** — L937-942의 Step 4 outline이 여전히 "3-layer sanitization"으로 표기. 3.3에서 4-layer로 확장했으므로 outline도 업데이트 필요.

---

## Cross-talk 요청

- **Quinn**: cosineDistance import 오류 — QA 관점에서 빌드 검증. 또한 trait range 0-100 vs 0.0-1.0 자기모순에 대한 테스트 케이스 설계 관점.
- **John**: trait range 자기모순 — delivery 관점에서 Brief 기준 확정. 0-100은 UX 표시용, 0.0-1.0은 DB/API 저장용으로 분리할지, 아니면 통일할지.

---

## Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 9 | 9 | Importance scoring method specified (L806-807: Haiku call "Rate importance 1-10"). |
| D2 완전성 | 9 | 9 | Embedding backfill cron added to carry-forward (L988). Observation retention policy added (L987). |
| D3 정확성 | 8 | 9 | cosineDistance import fixed: `from '../db/pgvector'` + "custom helper, NOT drizzle-orm/pg-core" note (L838). Memory retrieval formula added with Park et al. source (L819-827). |
| D4 실행가능성 | 9 | 10 | Phase 1 now has complete data flow including importance scoring, embedding failure handling, and backfill. Copy-paste ready. |
| D5 일관성 | 8 | 9 | Trait range unified to 0.0-1.0 throughout (Brief §4 compliant). Presets converted (L285: O=0.70). Step 4 outline updated to 4-layer. |
| D6 리스크 | 8 | 9 | n8n healthcheck added to Docker compose. Embedding failure → NULL + backfill cron. Observation retention carry-forward (365K rows/year, 1.4GB). |

**가중 평균: 9.15/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (10×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 2.00 + 1.35 + 0.90 = **9.20**

All 6 issues resolved. No auto-fail conditions.

**Note on trait range decision**: Dev accepted cross-talk consensus — **0-100 integer** unified across Steps 2 and 3. Architecture Decision box (L294) documents Brief §4 override with 4 rationale points (research alignment, LLM comprehension, integer precision, zero conversion). Brief annotation update deferred to Step 4. This is the correct outcome.

---

*Winston, Architect — "From 8.50 to 9.20. The cosineDistance fix prevents a build-breaking copy-paste. The trait range unification — while I'd have preferred 0-100 — is at least now consistent. The memory data flow with Park et al. retrieval formula is the standout addition."*
