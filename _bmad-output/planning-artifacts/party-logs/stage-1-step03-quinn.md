# Critic-B (QA + Security) Review — Stage 1 Step 03: Integration Patterns

**Reviewer**: Quinn (QA Engineer)
**Date**: 2026-03-20
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 3: Integration Patterns" (L485-L932)
**Rubric**: Critic-B weights — D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Code snippets with exact file paths (soul-renderer.ts, ws/server.ts). Docker compose yaml with resource limits. Migration file numbers (0061-0063). WS protocol message types. API route structure. EventBus channel map. |
| D2 완전성 | 9/10 | 6 domains all covered with integration patterns. Step 2 carry-forwards addressed: Neon pooling (3.4 L800-804), WS scaling (3.8 carry-forward). Cross-domain patterns (3.7). EventBus map. Migration strategy. Type extensions. Carry-forward table (3.8). |
| D3 정확성 | 7/10 | **(1) `cosineDistance` import path WRONG**: L786 `import { cosineDistance, desc } from 'drizzle-orm/pg-core'` — actual code: `import { cosineDistance } from './pgvector'` (local helper at `packages/server/src/db/pgvector.ts:33`). v2 does NOT use drizzle-orm's built-in cosineDistance. **(2) 3-connection limit verified** ✅ (ws/server.ts:53-58). **(3) clientMap verified** ✅. **(4) WsChannel 16개 (not 14)** — minor, Brief count is off but Step 3 doesn't repeat that claim. |
| D4 실행가능성 | 9/10 | Docker compose copy-paste ready. Hono proxy pattern with tenantMiddleware. personality-injector.ts complete function. Observation schema with indexes. Migration SQL. Asset loading pattern. Near-production code quality. |
| D5 일관성 | **6/10** | **(1) [CRITICAL] Big Five range conflict across 3 locations**: Step 2 L296 Layer A: `z.number().min(0).max(1)` (0.0-1.0, matches Brief §4). Step 3 L700 Layer A: `z.number().min(0).max(100)` (0-100). Step 4 outline L938: `z.number().min(0).max(1)` (0.0-1.0). Step 2 presets (L276-289) use 0-100 values. Step 2 prompt pattern (L268) uses `/100`. Brief §4: "0.0~1.0". Three different documents disagree on the fundamental scale. **(2) observations.importance range**: Step 2 SQL (L337): `importance INTEGER DEFAULT 50` comment "0-100". Step 3 Drizzle (L748): `importance: integer('importance').notNull().default(5)` comment "1-10". Range and default value both different. |
| D6 리스크 | 8/10 | 4-layer sanitization integrated into call chain. Go/No-Go #2 resolution with default personality fallback. n8n security: 127.0.0.1 binding, tenantMiddleware, API key, HMAC webhooks. Neon pooling assessed ("within 100 concurrent limit"). Carry-forward table for unresolved items. **BUT**: (1) n8n company isolation via "workflow tagging by companyId" (L648) — no detail on enforcement mechanism (what prevents Company A from triggering Company B's workflow via proxy?). (2) office:move message abuse — rate limiting acknowledged in carry-forward but not elaborated for Step 4. |

---

## 가중 평균

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 7 | 15% | 1.05 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 6 | 15% | 0.90 |
| D6 리스크 | 8 | 25% | 2.00 |
| **합계** | | **100%** | **8.00/10 ✅ PASS** |

---

## 이슈 목록

### Issue 1 — [D5 일관성] Big Five range 0-1 vs 0-100 CONFLICT (HIGH)
- **Step 2 L296**: `z.number().min(0).max(1)` — 0.0~1.0 range (matches Brief §4 "5개 특성 각 0.0~1.0")
- **Step 3 L700**: `z.number().min(0).max(100)` — 0~100 range
- **Step 4 outline L938**: `z.number().min(0).max(1)` — 0.0~1.0 range
- **Step 2 presets** (L276-289): values 15-95 — 0-100 range
- **Step 2 prompt** (L268): `{{personality_openness}}/100` — implies 0-100
- **Brief §4**: "0.0~1.0"
- **영향**: 이 불일치가 해결되지 않으면 API validation, DB storage, prompt injection, preset templates이 전부 다른 scale을 가정하게 됨. Sprint 1에서 즉시 충돌.
- **권장**: Brief가 authority — **0.0~1.0 (float) 채택**. Step 2 presets를 0.0~1.0로 변환 (e.g., 70→0.70). Prompt pattern을 `{{personality_openness}}` (no /100)로 변경. Step 3 L700을 `z.number().min(0).max(1)` 로 정정. 또는 **0~100 (integer) 채택** 결정 시 Brief §4 + Step 2 L296 + Step 4 outline 전부 수정. 어느 쪽이든 **하나의 scale로 통일 필수**.

### Issue 2 — [D3 정확성] cosineDistance import path WRONG (Medium)
- **Doc L786**: `import { cosineDistance, desc } from 'drizzle-orm/pg-core'`
- **실제 코드**: `import { cosineDistance } from './pgvector'` (packages/server/src/db/pgvector.ts:33 — custom helper)
- **scoped-query.ts:7**: `import { cosineDistance } from './pgvector'`
- **영향**: Step 3 코드를 그대로 복사하면 import 에러 발생 (drizzle-orm에 cosineDistance 없음).
- **권장**: `from 'drizzle-orm/pg-core'` → `from '../db/pgvector'` 또는 "v2 기존 패턴: `db/pgvector.ts` custom helper 사용" 명시.

### Issue 3 — [D5 일관성] observations.importance range 불일치 (Medium)
- **Step 2 SQL** (L337): `importance INTEGER DEFAULT 50` — range 0-100
- **Step 3 Drizzle** (L748): `importance: integer('importance').notNull().default(5)` — range 1-10
- **영향**: Step 4에서 reflection threshold 설계 시 어떤 scale을 기준으로 할지 모호.
- **권장**: 하나로 통일. Stanford Generative Agents 원논문은 1-10 사용 → 1-10 채택 권장.

### Issue 4 — [D6 리스크] n8n company isolation 메커니즘 미상세 (Low)
- L648 "Company isolation: workflow tagging by companyId" — tag 기반 격리의 구체적 enforcement 미기술.
- **질문**: Company A 사용자가 Hono proxy를 통해 Company B의 workflow ID를 알면 실행 가능한가? tenantMiddleware가 workflow ownership을 검증하는가?
- **권장**: Step 4에서 n8n workflow → companyId 매핑 테이블 또는 tag 검증 로직 명시.

---

## 자동 불합격 체크

| 조건 | 결과 |
|------|------|
| 할루시네이션 | ⚠️ cosineDistance import path가 부정확하나 함수 자체는 실존 — hallucination이 아닌 import 경로 오류. CLEAR. |
| 보안 구멍 | ✅ CLEAR — n8n 127.0.0.1 binding, JWT auth, HMAC webhooks. Company isolation 상세 부족하나 구조 자체는 안전. |
| 빌드 깨짐 | ⚠️ cosineDistance import 오류 시 빌드 실패하지만 연구 문서 수준에서는 CLEAR. |
| 데이터 손실 위험 | ✅ CLEAR — 전부 additive migrations. |
| 아키텍처 위반 (E8) | ✅ CLEAR — personality-injector, observation-recorder, memory-reflection 전부 services/. |

---

## Cross-talk Notes

- **Winston에게**: Big Five range 0-1 vs 0-100 불일치가 Step 2~4 전반에 걸쳐 있습니다. Architecture decision 필요 — Brief authority(0.0~1.0) 따를지 아니면 integer(0-100) 채택할지. cosineDistance import path도 아키텍처 차원에서 `db/pgvector.ts` custom helper 사용 패턴 확인 필요.
- **John에게**: Big Five range conflict는 Sprint 1 시작 전 반드시 통일 필요. 0-100 채택 시 Brief §4 수정, 0.0-1.0 채택 시 presets + prompt pattern 수정.

---

## 최종 판정

**8.00/10 ✅ PASS**

Integration patterns 품질이 전반적으로 높음 — Docker compose, Hono proxy, personality-injector, observation schema 모두 near-production 수준. 특히 4-layer sanitization의 call chain 통합(3.3)과 3-phase memory data flow(3.4)가 구체적이고 실행 가능. 그러나 **Big Five range 0-1 vs 0-100 불일치가 Step 2~4 전반에 걸쳐 존재**하며, 이는 Sprint 1 착수 전 반드시 해결해야 할 D5 critical issue.

4개 이슈 (1 HIGH, 2 Medium, 1 Low). 수정 적용 시 8.7+ 예상.

---

## 🔄 Fix Verification (Post-Review)

**Dev 수정 확인 일시**: 2026-03-20

### Issue 1 — Big Five range CONFLICT → ✅ VERIFIED (0-100 integer 통일)
- **결정**: 0-100 integer 채택 (Brief §4 "0.0~1.0" 대신 cross-talk consensus override)
- **Architecture Decision (L294)**: BIG5-CHAT/Big5-Scaler 논문 기반, LLM "70/100" 이해도 우위, INTEGER 부동소수점 회피, UX=DB=API zero conversion. Brief §4 annotation → Step 4 이월.
- **Step 2 검증**: L275-279 `/100` prompt ✅, L282 "0-100 integer scale" ✅, L284-289 presets 15-95 ✅, L298 `z.number().int().min(0).max(100)` ✅, L291-292 defaults O=60,C=75 ✅
- **Step 3 검증**: L716 defaults O=60 ✅, L743 `z.number().int().min(0).max(100)` ✅, L755 "0-100 integer" ✅
- **내부 일관성**: Step 2 ↔ Step 3 완전 통일 ✅. Brief deviation은 L294 Architecture Decision으로 문서화 + Step 4 이월.

### Issue 2 — cosineDistance import path → ✅ VERIFIED
- **L840**: `import { cosineDistance } from '../db/pgvector'  // custom helper, NOT drizzle-orm/pg-core`
- v2 기존 패턴 (`scoped-query.ts:7`) 정확히 반영 ✅

### Issue 3 — observations.importance range → ✅ VERIFIED (1-10 통일)
- **Step 2 SQL (L347)**: `importance INTEGER DEFAULT 5 -- 1-10 (Park et al.)` ✅
- **Step 3 Drizzle (L791)**: `importance: integer('importance').notNull().default(5), // 1-10` ✅
- **L808, L827**: LLM-scored 1-10 일관 ✅

### Issue 4 — n8n company isolation → ✅ ACKNOWLEDGED (carry-forward to Step 4)
- Low 이슈, Step 4 아키텍처 결정으로 적절히 이월됨

---

## 수정 후 점수 재산정

| 차원 | 기존 | 수정후 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9 | 9 | 변동 없음 |
| D2 완전성 | 9 | 9 | 변동 없음 |
| D3 정확성 | 7 | **9** | cosineDistance import 정정 → 모든 코드 스니펫 정확 |
| D4 실행가능성 | 9 | 9 | 변동 없음 |
| D5 일관성 | 6 | **9** | Big Five 0-100 통일 (Architecture Decision 문서화), importance 1-10 통일 |
| D6 리스크 | 8 | 8 | n8n isolation carry-forward 유지 |

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 8 | 25% | 2.00 |
| **합계** | | **100%** | **8.75/10 ✅ PASS** |

---

## Verified 최종 판정

**8.75/10 ✅ PASS (Verified)**

4개 이슈 전부 해결 또는 적절히 이월됨. Big Five range 통일(0-100 integer)은 Brief §4와 다르지만, Architecture Decision(L294)에 4가지 rationale과 함께 문서화되어 있고 Brief annotation update가 Step 4로 이월. 내부 일관성 완전 확보. cosineDistance import 정정으로 코드 정확도 향상. observations.importance 1-10 통일로 reflection threshold 설계 기반 확립.

---

## 🔄 Round 2 Verification — Cross-talk 결정 반영

**Dev Round 2 수정 확인 일시**: 2026-03-20

### Big Five 0-100 integer 전 문서 통일 → ✅ VERIFIED (이전 Round 1에서 이미 확인)
- L294 Architecture Decision: cross-talk consensus 기반 Brief override 문서화 ✅
- L298 Step 2 Zod, L743 Step 3 Zod: 모두 `z.number().int().min(0).max(100)` ✅
- L991 carry-forward: Brief §4 annotation update 권고 → Step 4 이월 ✅

### Observation lifecycle 3 sub-risks → ✅ VERIFIED (NEW)
- **Carry-forward L989**: 3가지 하위 리스크 전부 명시 확인:
  - **(A) Neon tier**: ~1.4GB/year → Free(0.5GB) 4개월 초과, Pro(10GB) 필요 ✅ — 정량적 근거 포함
  - **(B) Cron failure backlog**: `is_processed=false` 무한 축적 → massive batch → LLM 비용 폭등 + timeout. ARGOS health check + 실패 알림 ✅ — failure cascade 시나리오 구체적
  - **(C) Retention**: `is_processed=true` 90-day TTL + archival ✅
- **Source attribution**: "Step 3 John #3 + Quinn" — cross-talk 출처 정확 ✅

### D6 리스크 점수 재평가
- 기존 D6=8: n8n isolation 미상세 + observation lifecycle 미언급
- Round 2 후: observation lifecycle 3 sub-risks carry-forward에 정량적 근거와 함께 명시 → D6 **8→9**

### Round 2 최종 점수 재산정

| 차원 | Round 1 | Round 2 | 근거 |
|------|---------|---------|------|
| D6 리스크 | 8 | **9** | Observation lifecycle 3 sub-risks 정량적 carry-forward 추가 |

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

**9.00/10 ✅ PASS (Round 2 Verified)**

Round 1 4개 이슈 + Round 2 observation lifecycle 리스크 전부 해결. Big Five 0-100 integer 전 문서 통일, cosineDistance import 정정, importance 1-10 통일, n8n isolation carry-forward, observation lifecycle 3 sub-risks (Neon tier/cron failure/retention) 정량적 carry-forward 완비. Step 3 Integration Patterns — production-ready 연구 문서 수준.
