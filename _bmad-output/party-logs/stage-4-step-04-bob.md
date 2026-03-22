# Stage 4 Step 04 — Bob (Critic-C, Scrum Master) Review

**Reviewer:** Bob (Critic-C, Product + Delivery / Scrum Master)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` Step 4 — v3 Core Architectural Decisions D22-D34 (L348-624)
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## 코드베이스 검증 결과

| 항목 | 문서 주장 | 실제 코드 | 판정 |
|------|----------|----------|------|
| soul-renderer.ts extraVars | L359 "extraVars 파라미터 활용 (soul-renderer.ts:16)" | `engine/soul-renderer.ts:16` `extraVars?: Record<string, string>` | ✅ 정확 |
| PostToolUse 순서 | L363 "scrubber→redactor→delegation→sanitizer (4번째)" | `engine/hooks/delegation-tracker.ts:5` "PostToolUse Hook (3rd)" | ✅ 정확 |
| WsChannel 16개 → 17번째 | L360 "17번째 WS 채널" | `shared/types.ts:484-500` — 16개 채널 나열 | ✅ 정확 |
| croner 10.x 설치 | L369 "croner 10.x 이미 설치+검증됨" | `server/package.json` `"croner": "^10.0.1"` | ✅ 존재 |
| services/ 디렉토리 | L359 "services/soul-enricher.ts" | `packages/server/src/services/` 55+ 파일 존재 | ✅ 경로 유효 |
| delegation-channel.ts | L360 "delegation-channel.ts 패턴 복제" | **파일 미존재**. WS는 `ws/channels.ts` switch/case 패턴 | ❌ 오류 |
| lib/embedding.ts | L372 "기존 lib/embedding.ts의 getEmbedding()" | **파일 미존재**. 실제: `services/embedding-service.ts` | ❌ 오류 |
| agent_memories.confidence | L423 "ADD COLUMN IF NOT EXISTS confidence REAL DEFAULT 0.7" | `schema.ts:1598` `confidence: integer('confidence').default(50)` — **이미 존재, 타입 불일치** | ❌ 충돌 |
| memoryTypeEnum 'reflection' | L428 `WHERE memory_type = 'reflection'` | `schema.ts:28` `['learning', 'insight', 'preference', 'fact']` — 'reflection' 없음 | ⚠️ 마이그레이션 누락 |
| agents.personality_traits | L374 `agents.personality_traits JSONB` | `schema.ts:145-170` — 해당 컬럼 없음 | ⚠️ ALTER 누락 |
| n8n 2.12.3 / 2g | L568, L580 | Step 3에서 통일 확인 | ✅ 일관 |
| 172.17.0.1:5678 | L361 | 확정 결정 #12 | ✅ 일관 |
| VECTOR(768) 기존 | — | `schema.ts:1556` `vector('embedding', { dimensions: 768 })` | 참고: Pre-Sprint 전환 대상 |

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | SQL DDL(constraints, indexes, partial index), TypeScript 코드, Docker Compose YAML, 크론 pseudo-code 모두 구체적. 폴링 간격(500ms), 배치 사이즈(32), rate limit(100ms), WS 제한(50/500), regex 10종, Haiku ≤$0.10/일 등 수치 명시. soul-renderer.ts:16 라인 번호까지 정확. |
| D2 완전성 | 20% | 8/10 | 13개 결정(D22-D34) + 구현 순서 + 교차 의존성 + PRD carry-forward 6건 해소. **누락 3건**: (1) `memoryTypeEnum`에 'reflection' 추가 ALTER TYPE 미명시. (2) `agents.personality_traits JSONB` 컬럼 ALTER TABLE 미명시. (3) 기존 VECTOR(768) → VECTOR(1024) 마이그레이션 상세 (Step 3 Pre-Sprint으로 넘겼으나 Step 4 D22에서 재확인 필요). |
| D3 정확성 | 15% | 7/10 | 확정 결정 12건 전부 정확 반영. **오류 3건**: (1) `delegation-channel.ts` 미존재 (실제 `ws/channels.ts`). (2) `lib/embedding.ts` 미존재 (실제 `services/embedding-service.ts`). (3) `agent_memories.confidence` ALTER가 silent no-op — 이미 integer(0-100)로 존재하는데 REAL(0-1) ADD COLUMN은 실행되지 않음. |
| D4 실행가능성 | 15% | 8/10 | Implementation Sequence (Pre-Sprint→1→2→3→4→병행) 논리적. Cross-Component Dependencies 5건 명확. **우려 1건**: D22 "observations migration 준비"가 Pre-Sprint에 있고 "observations 테이블 생성"이 Sprint 3에 있음 — 준비와 생성의 경계가 모호. 준비=스키마 파일 작성? 생성=마이그레이션 실행? 명확화 필요. |
| D5 일관성 | 15% | 7/10 | 13개 결정 간 내부 참조 일관적 (D23↔D33, D28↔D22, D24↔D26 등). **불일치 3건**: (1) D22 `confidence REAL 0-1` vs 기존 `integer 0-100` 이중 스케일. (2) D31 `lib/embedding.ts` vs 실제 `services/embedding-service.ts`. (3) D24 `office-channel.ts` 별도 파일 vs 현재 `channels.ts` 단일 switch 패턴 — 아키텍처 변경인지 기존 패턴 유지인지 모호. |
| D6 리스크 | 20% | 8/10 | Neon LISTEN/NOTIFY 제약 명시, advisory lock 동시성 방지, 비용 ceiling, SEC 8-layer 매핑, 번들 사이즈 Go/No-Go #5. **미식별 2건**: (1) `confidence` 타입 충돌 시 런타임 에러 리스크 — 기존 코드가 `integer` 기대하는데 새 코드가 `REAL` 기대하면 파싱 불일치. (2) `memoryTypeEnum` ALTER TYPE은 PostgreSQL에서 제약 있음 (`ALTER TYPE ... ADD VALUE`는 트랜잭션 내 사용 제한) — Drizzle migration에서 처리 방법 미명시. |

---

## 가중 평균: 7.85/10 ✅ PASS

계산: (9×0.15) + (8×0.20) + (7×0.15) + (8×0.15) + (7×0.15) + (8×0.20) = 1.35 + 1.60 + 1.05 + 1.20 + 1.05 + 1.60 = **7.85**

---

## 이슈 목록

### HIGH — 수정 필요

#### 1. [D3/D5] agent_memories.confidence 타입 충돌 — Silent No-Op ALTER

**현재 코드** (`schema.ts:1598`):
```typescript
confidence: integer('confidence').notNull().default(50),  // 0-100
```

**D22 ALTER** (L423):
```sql
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS confidence REAL DEFAULT 0.7;
```

`ADD COLUMN IF NOT EXISTS`는 컬럼이 이미 존재하므로 **아무 일도 하지 않음**. 결과: 기존 `integer(0-100)` 유지, 새 코드는 `REAL(0-1)` 기대 → **런타임 스케일 불일치**.

**권고** (택1):
- A) 기존 integer(0-100) 유지 → 새 reflection 코드도 0-100 스케일 사용. observations만 REAL(0-1).
- B) `ALTER COLUMN confidence TYPE REAL USING confidence::real / 100.0` + DEFAULT 변경. 기존 코드 영향 분석 필수.
- C) 새 컬럼명 `reflection_confidence REAL` 추가하여 충돌 회피. 기존 `confidence`는 학습 메모리용 유지.

**권고 A가 가장 안전** (Zero Regression). Observations와 agent_memories의 confidence 스케일이 다르다는 점만 문서에 명시하면 됨.

#### 2. [D3] delegation-channel.ts 미존재 — D24 참조 오류

D24 (L360): "기존 WS 인프라(delegation-channel.ts) 패턴 복제"

실제 WS 아키텍처:
- `ws/server.ts` — WebSocket 서버 + 인증
- `ws/channels.ts` — 단일 파일, switch/case로 16개 채널 처리
- `shared/types.ts:484` — `WsChannel` union type

**`delegation-channel.ts`라는 파일은 존재하지 않음.** Delegation은 `channels.ts` 내 switch case.

**권고**: "기존 WS 인프라(delegation-channel.ts) 패턴 복제" → "기존 WS 인프라(`ws/channels.ts` switch/case + `shared/types.ts` WsChannel union) 패턴. `WsChannel`에 `'office'` 추가 + `channels.ts`에 case 추가"

#### 3. [D3] lib/embedding.ts 미존재 — D31 참조 오류

D31 (L372): "기존 `lib/embedding.ts`의 `getEmbedding()` 인터페이스 유지"

실제: `packages/server/src/services/embedding-service.ts`. `lib/` 디렉토리에 embedding 관련 파일 없음.

**권고**: `lib/embedding.ts` → `services/embedding-service.ts` 수정. 또는 D31의 `lib/voyage-client.ts` 배치를 `services/voyage-client.ts`로 변경하여 기존 embedding-service.ts와 같은 디렉토리에 배치.

### MEDIUM — 권고

#### 4. [D2] memoryTypeEnum ALTER TYPE 누락

D22 인덱스: `WHERE memory_type = 'reflection'` (L428)
현재 enum: `['learning', 'insight', 'preference', 'fact']` (schema.ts:28)

`'reflection'` 값이 enum에 없으면 INSERT 시 에러. PostgreSQL ALTER TYPE:
```sql
ALTER TYPE memory_type ADD VALUE 'reflection';
```
이 명령은 **트랜잭션 내 사용 불가** (PG 제약). Drizzle migration에서 별도 처리 필요.

**권고**: D22 SQL 블록에 `ALTER TYPE memory_type ADD VALUE IF NOT EXISTS 'reflection';` 추가 + "트랜잭션 외부 실행 필요" 주석.

#### 5. [D2] agents.personality_traits ALTER TABLE 누락

D33 (L374): `agents.personality_traits JSONB` + CHECK 제약. 현재 agents 테이블(schema.ts:145-170)에 해당 컬럼 없음.

**권고**: D33에 ALTER TABLE 명시:
```sql
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits JSONB;
ALTER TABLE agents ADD CONSTRAINT chk_personality_traits CHECK (...);
```

#### 6. [D4] D22 "준비" vs "생성" 시점 모호

Implementation Sequence (L596):
- Pre-Sprint: `D22(observations migration 준비)`
- Sprint 3: `D22(observations 테이블 생성)`

"준비"가 무엇인지 불명확. Drizzle 스키마 파일 작성? SQL 작성? 코드 리뷰?

**권고**: Pre-Sprint D22 → "observations Drizzle 스키마 정의 + migration SQL 작성 (실행은 Sprint 3)" 명확화.

### LOW — 참고

#### 7. [D5] office-channel.ts 별도 파일 vs channels.ts 확장

D24가 `office-channel.ts`를 별도 파일로 명시하지만, 현재 16개 채널은 모두 `channels.ts` 단일 파일. 이슈 #2에서 참조 오류는 수정하되, 아키텍처적으로 office 채널만 별도 파일로 분리하는 것이 의도인지 명확화 필요.

---

## Scrum Master 관점 — Sprint 2 분할 평가 (D32)

### D32 판정: 🟢 분할 불필요 — 동의

D32 근거 검증:

| Sprint | FR 수 | 실제 볼륨 분석 |
|--------|-------|--------------|
| Sprint 1 | 9 FRs (Big Five) + FR-UX 병행 | personality CRUD + soul-enricher 통합 + UX 6그룹 리팩토링 |
| Sprint 2 | 16 FRs (N8N 6 + MKT 7 + TOOLSANITIZE 3) | Docker compose 1파일 + proxy route 1파일 + n8n 프리셋 설정(MKT) + Hook 1파일(TOOLSANITIZE) |

**Sprint 2의 16 FRs는 숫자가 크지만 구현 볼륨이 작음**:
- N8N 6 FRs: Docker Compose + Hono proxy (인프라 작업, 코드량 적음)
- MKT 7 FRs: n8n 워크플로우 프리셋 설정 (n8n UI 작업, 코드 아님)
- TOOLSANITIZE 3 FRs: Hook 1파일 + regex 10종 (engine/hooks/ 추가)

Sprint 1의 Big Five + soul-enricher + FR-UX 병행이 오히려 더 복잡. **분할 시 Sprint 간 n8n↔TOOLSANITIZE 의존성이 불필요하게 복잡해짐.** 동의.

### Cross-Component 리스크

D25↔D27 의존성 (L611): "n8n webhook 응답도 tool-sanitizer 경유" — 이 의존성은 Sprint 2 내부에서 해소되므로 분할 시 깨짐. 분할 안 함이 올바른 결정.

### Pre-Sprint → Sprint 3 크리티컬 패스

```
Pre-Sprint D31 (Voyage client) → D22 준비
     ↓
Sprint 3 D22 (observations 생성) → D28 (reflection 크론) → D23 확장
```

**Sprint 3이 가장 무거움**: 테이블 생성 + 마이그레이션 + 크론 + soul-enricher memory 확장. Step 5(Sprint 상세 계획)에서 Sprint 3 태스크 분해가 핵심.

---

## 우수 사항

1. **3개 독립 Sanitization 체인** (PER-1, MEM-6, TOOLSANITIZE) 각각의 Layer 1-4 상세 분해가 보안 아키텍처 모범 사례
2. **N8N-SEC 8-layer 구현 매핑 테이블** — Layer별 구현 위치 + 검증 방법까지 명시
3. **PRD carry-forward 6건 전부 해소** — 누적 기술 부채 0으로 정리
4. **Neon serverless LISTEN/NOTIFY 제약** 정확히 식별하고 polling 대안 제시 (문서 출처 명시)
5. **D29 JSONB race condition** — 과설계 거부하고 `jsonb_set()` atomic으로 해결. Solo dev 현실 반영
