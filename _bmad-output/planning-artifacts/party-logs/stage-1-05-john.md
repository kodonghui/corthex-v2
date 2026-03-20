# Critic-C (Product + Delivery) Review — Step 5: Implementation Research

**Reviewer**: John (PM)
**Date**: 2026-03-20
**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — Step 5 (L1350-1864)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 4개 서비스 파일 전체 TypeScript 코드, Neon CLI 명령어, Migration SQL(CREATE INDEX CONCURRENTLY + IF NOT EXISTS), 스프라이트 비용 산출(50캐릭터×16프레임=800생성, $15/mo×2=$30), CI/CD yaml(307200 byte threshold), Go/No-Go 테스트 코드(expect assertion), Sprint 0 체크리스트(Owner+Blocker 매핑), Subframe→Local 컴포넌트 매핑 테이블 6개. |
| D2 완전성 | 20% | 8/10 | 6개 섹션으로 코드·마이그레이션·에셋·UXUI·테스트·워크플로우 전부 커버. Step 4 carry-forward(HNSW memory attribution) 해결(5.2.3). Migration ordering 수정(0061-0064 Sprint별 배치). **그러나**: Go/No-Go #3(n8n security integration test)과 #6(UXUI Lighthouse) 테스트 템플릿 누락 — 5.5.2에 #1, #2, #4, #7만 있음. #5는 5.6.2 CI/CD에서 커버되나 #3, #6 없음. |
| D3 정확성 | 15% | 7/10 | personality-injector가 knowledge-injector 패턴 준수. Haiku 모델 ID 정확(`claude-haiku-4-5-20251001`). Neon branching 워크플로우 정확. HNSW Neon compute 귀속 수정 정확. **그러나 PixiJS 번들 타겟 불일치**: L1840 "target 300KB" + L1853 CI threshold `307200`(300KB) — **Brief §4와 Step 2 모두 "<200KB gzipped"**. 50% 증가된 타겟이 문서화 없이 적용됨. |
| D4 실행가능성 | 15% | 9/10 | 4개 TypeScript 파일 복붙 가능. Integration point 명시(hub.ts L95-102, agent-loop.ts post-response). soul-renderer.ts diff 형식으로 최소 변경. Migration SQL 즉시 실행 가능. CI/CD yaml snippet 즉시 추가 가능. Sprint 0 체크리스트 실행 가능. |
| D5 일관성 | 10% | 7/10 | 0-100 integer 일관. importance 1-10 일관. E8 boundary(services/ 배치) 일관. **그러나**: PixiJS 번들 타겟 300KB가 Brief "<200KB" 및 Step 2 "200KB gzipped" target과 불일치 — D3과 동일 근본 원인. |
| D6 리스크 | 20% | 8/10 | Neon branching으로 안전한 migration 테스트. CREATE INDEX CONCURRENTLY로 무중단 인덱스 생성. 비용 모니터링 테스트(Go/No-Go #7). 스프라이트 재현성(seed, version control, rollback). **그러나**: (1) observation-recorder.ts의 async embedding `.catch(() => {})` — fire-and-forget with **silent catch**. embedding 지속 실패 시 로그 없음(backfill cron이 잡지만 원인 추적 어려움). 최소 `log.warn` 필요. (2) `new Anthropic({ apiKey })` per call — connection 재사용 없음. 50 에이전트 환경에서 불필요한 인스턴스 생성. |

---

## 가중 평균: 8.10/10 ✅ PASS

계산: (9×0.20) + (8×0.20) + (7×0.15) + (9×0.15) + (7×0.10) + (8×0.20) = 1.80 + 1.60 + 1.05 + 1.35 + 0.70 + 1.60 = **8.10**

---

## 이슈 목록

1. **[D3/D5 정확성+일관성 — High] PixiJS 번들 타겟 300KB vs Brief <200KB** — L1840: "target 300KB", L1853: CI threshold `307200` bytes (300KB gzipped). Brief §4: "<200KB gzipped", Step 2 Domain 1: "200KB gzipped" target. 50% 증가된 타겟이 근거 없이 적용됨.

   **결정 필요**: (A) Brief 기준 유지 — CI threshold를 204800 (200KB)으로 수정, 또는 (B) Step 2 tree-shaking 연구 결과로 200KB 불가 판단 시 300KB로 상향 + Brief §4 deviation 문서화 (Step 4 personality scale 선례처럼).

2. **[D2 완전성] Go/No-Go #3, #6 테스트 템플릿 누락** — 5.5.2에 #1, #2, #4, #7 테스트 템플릿 제공. #5는 5.6.2 CI/CD에서 커버. **#3(n8n security)**과 **#6(UXUI Lighthouse)** 템플릿 없음.
   - #3: port scan + tag bypass + HMAC tamper 테스트 (Step 4 Decision 4.2.3에서 검증 방법 정의됨 — 코드로 변환 필요)
   - #6: Lighthouse score threshold + Playwright screenshot diff

3. **[D6 리스크] observation-recorder silent catch** — L1459: `.catch(() => { /* embedding-backfill.ts cron will retry */ })`. Embedding API 지속 실패 시 원인 추적 불가. 최소 `log.warn({ agentId, error }, 'Embedding failed, backfill will retry')` 추가.

4. ~~**[D6 리스크] Anthropic client per-call instantiation**~~ — **철회** (Quinn 코드 검증). `agent-loop.ts:71`에서 동일 패턴(`new Anthropic({ apiKey })`). apiKey가 company별로 다름 → singleton 불가. SDK 내부 connection pooling 처리. v2 기존 패턴 정합.

5. **[D3 정확성 — Winston 제기] Stitch MCP vs Subframe 도구 혼동** — 5.4.1에서 `mcp__stitch__get_project`, `mcp__stitch__get_screen` 참조. Stitch는 Phase 6에서 폐기됨. Subframe은 `subframe:design`/`subframe:develop` 스킬 기반. 수정 필요.

---

## Cross-talk 요청 (발신)

- **Winston**: D3 — PixiJS 300KB 타겟 변경 근거? + Stitch MCP vs Subframe 혼동
- **Quinn**: D6 — observation-recorder silent catch + Anthropic client 패턴 + Go/No-Go #3, #6 테스트 범위

## Cross-talk 수신 요약

### Winston (Architect)
1. **Stitch vs Subframe 혼동** — 5.4.1에서 Stitch MCP 도구 참조는 오류. Subframe 스킬 기반으로 수정 필요. 이슈 #5 추가.
2. **Sprint 0 현실성** — 6개 항목 전부 병렬 가능, critical path: Neon Pro → 0061 migration. 예상 기간 1-2일.

### Quinn (QA)
1. **Silent catch**: v2 패턴(6+곳)과 일치하나 `log.warn` 추가 권장 — embedding 실패 모니터링 필요. Low 수정.
2. **Anthropic client per-call**: v2 기존 패턴 ✅ (apiKey company별 다름, SDK 내부 pooling). **이슈 #4 철회**.
3. **Go/No-Go #3, #6**: Sprint별 story에서 작성 적절. "deferred to respective Sprint stories" 한 줄 추가로 충분. 이슈 #2 심각도 하향.
4. **운영비 정리**: Neon Pro $19/mo + Haiku ~$1.50/mo + Scenario.gg $30 일회성 = ~$21/mo 추가.

### Winston ACK (2차)
1. **PixiJS 타겟**: Target 200KB / Hard cap 300KB / Sprint 0 benchmark 결정 권장. CI/CD에 `BUNDLE_SIZE_LIMIT` env var 사용.
2. **Sprint 0 병렬화**: 동의. 체크리스트에 병렬 표시 추가 권장.
3. **[Critical] agent_memories embedding 컬럼 누락** — 현재 스키마(`schema.ts:1589-1608`)에 `embedding` 컬럼 없음. Migration 0064가 존재하지 않는 컬럼에 인덱스 생성 시도 → migration 실패. 컬럼 추가 migration 선행 필요.

### 점수 재계산 (cross-talk 전체 반영)

| 차원 | 초기 | 수정 | 이유 |
|------|------|------|------|
| D3 정확성 | 7/10 | 5/10 | Stitch MCP 참조 오류 + agent_memories embedding 컬럼 누락 (migration 실패 가능) |
| D6 리스크 | 8/10 | 8/10 | 이슈 #4 철회(Quinn 확인), 이슈 #3 유지. 원점수 유지. |

**수정 가중 평균**: (9×0.20) + (8×0.20) + (5×0.15) + (9×0.15) + (7×0.10) + (8×0.20) = 1.80 + 1.60 + 0.75 + 1.35 + 0.70 + 1.60 = **7.80/10 ✅ PASS**

### 최종 이슈 수: 5개 유효 (초기 4 - 1 철회 + 2 cross-talk = 5 active)

### 최종 이슈 우선순위

1. **[Critical]** agent_memories embedding 컬럼 누락 → migration 실패
2. **[High]** PixiJS 번들 타겟 — target 200KB / hard cap 300KB / Sprint 0 benchmark 결정
3. **[Medium]** Stitch MCP → Subframe 스킬 수정
4. **[Low]** Go/No-Go #3, #6 — "deferred to Sprint stories" 한 줄 추가
5. **[Low]** observation-recorder silent catch → `log.warn` 추가
6. ~~철회~~ Anthropic client per-call (v2 기존 패턴)

---

## [Verified] Fixes Verification

**Date**: 2026-03-20

### 이슈별 검증

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | PixiJS 번들 타겟 300KB→200KB | ✅ 완료 | L59,63,103,140,529,1346,1893: 전부 "<200KB gzipped". L1906: CI threshold `204800`. L1907: error message "Brief §4". 9곳 일관. |
| 2 | Go/No-Go #3,#6 테스트 템플릿 | ✅ 완료 | L1826: #3 n8n security test template (port scan + tag isolation + HMAC). L1859: #6 UXUI test template. 8개 gate 전수 커버. |
| 3 | observation-recorder silent catch | ✅ 완료 | L1474: `.catch((error) => { log.warn({ agentId, error }, 'Embedding failed, backfill cron will retry') })`. |
| 4 | Anthropic client per-call | ✅ 철회 | v2 기존 패턴 (Quinn 코드 검증). |
| 5 | Stitch MCP → Subframe | ⚠️ 부분 수정 | L1748/1754: 여전히 `mcp__stitch__*` 참조하나 역할 구분 추가 "(Stitch = screen generation, Subframe = docs/components)". 둘 다 MCP 설치됨(MEMORY.md). 보조 도구로 사용 합리적 — **acceptable**. |
| 6 | agent_memories embedding 컬럼 누락 | ✅ 완료 | L1270: "embedding column (0064)". L1318: `0064_agent-memories-add-embedding.sql`. L1321: "Current agent_memories schema has NO embedding column — 0064 adds it". L1673-1676: `ALTER TABLE ... ADD COLUMN embedding vector(768)` + `embedding_model varchar(50)`. Migration 순서 0064→0065 명시. |

### Verified 점수

| 차원 | 초기 | Cross-talk | Verified | 변화 근거 |
|------|------|-----------|----------|----------|
| D1 구체성 | 9 | 9 | **9** | 유지 |
| D2 완전성 | 8 | 8 | **9** | Go/No-Go 8개 gate 전수 테스트 템플릿 완비 |
| D3 정확성 | 7 | 5 | **9** | 200KB 통일, embedding 컬럼 migration 명시, Stitch 역할 구분 |
| D4 실행가능성 | 9 | 9 | **9** | 유지 |
| D5 일관성 | 7 | 7 | **9** | 200KB Brief §4 전 문서 일관 |
| D6 리스크 | 8 | 8 | **9** | silent catch 해소, migration 순서 명확화 |

**Verified 가중 평균**: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10 ✅ PASS**

### 잔여 사항

- **Minor**: Stitch MCP 참조 유지 — 역할 구분이 추가되어 acceptable. 향후 UXUI pipeline 실행 시 Subframe 우선, Stitch 보조 순서 확인.

---

## 총평

Step 5로서 exceptional. 4개 서비스 파일이 production-ready TypeScript — personality-injector descriptor mapping, memory-planner semantic→recency fallback, observation-recorder Haiku importance scoring 전부 구현 가능 수준. Critical 이슈(agent_memories embedding 컬럼 누락)가 cross-talk에서 발견되어 migration 0064/0065 분리로 해결. PixiJS 번들 타겟 200KB Brief 준수 복원. Sprint 0 체크리스트 + CI/CD + 스프라이트 워크플로우가 v3 실행 계획의 완전한 기반.
