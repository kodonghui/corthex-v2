# Critic-A Review — Stage 0, Step 02: Vision (Executive Summary + Core Vision)

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (L65–185)
**Cross-checked:** `v3-corthex-v2-audit.md`, `v3-openclaw-planning-brief.md`, `architecture.md`, `MEMORY.md`
**Code verified:** `packages/server/src/engine/soul-renderer.ts` (extraVars), `packages/server/src/db/schema.ts` (L1589 agent_memories), `packages/server/src/services/memory-extractor.ts`

---

## 수치 검증 (D3 우선)

| Vision 주장 | Audit 실제값 | 일치 |
|-------------|-------------|------|
| API 485개 (L79, L123, L177) | 485개 | ✅ |
| DB 테이블 86개 (L79, L177) | 86개 | ✅ |
| 프론트엔드 71개 (L79, L177) | 71개 | ✅ |
| 테스트 10,154개 (L79) | 10,154개 | ✅ |
| Built-in 도구 68개 (L123) | 68개 | ✅ |
| WebSocket 14채널 (L162) | 14개 | ✅ |
| `engine/soul-renderer.ts` extraVars (L136) | 실존 확인 (`soul-renderer.ts` L16) | ✅ |

---

## [Fixes Applied] 검증 결과

| 이슈 | 수정 내용 | 검증 |
|------|---------|------|
| Issue 1 (UXUI Subframe) | L86 Executive Summary + L185 Differentiator #5에 "Subframe(메인)" + "5개 아키타입 테마 중 선택" 명시 | ✅ |
| Issue 2 (성격 주입 메커니즘) | L136 "기존 `engine/soul-renderer.ts`의 `extraVars` 메커니즘 확장 → `{{personality_traits}}` 변수 추가, E8 경계 준수" — `soul-renderer.ts` 실존 + `extraVars?: Record<string, string>` 파라미터 코드 직접 확인 | ✅ |
| Issue 3 (n8n 포트 보안) | L140-141 "포트 5678 내부망 한정 + Hono 리버스 프록시 `/admin/n8n/*`" | ✅ |

**Issue 2 특이사항**: 내가 제안한 `soul-enricher.ts`(미존재)보다 훨씬 나은 해법. `soul-renderer.ts`는 이미 `extraVars` 파라미터로 외부 변수 주입을 지원하도록 설계됨 (`// extraVars: 호출자가 외부에서 계산한 변수를 주입 (E8 경계 준수 — services/ import 불가)`). `{{personality_traits}}`를 여기에 추가하면 engine 수정 없이 완전 구현 가능. D3 상향 근거.

**Issue 4 (메모리 스키마 충돌)** — 미처리: L148-154 Layer 4가 `observations` + `memories` 신규 테이블을 기술하지만 기존 `agent_memories` 테이블(schema.ts L1589)과의 관계 미정의. 별도 잔존 이슈로 기록.

---

## 차원별 점수 (최종)

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Subframe 명시 ✅. "5개 아키타입 테마 중 선택 — Phase 0 후 확정"은 구조화된 deferral (없는 것보다 확실히 낫다). soul-renderer.ts extraVars 메커니즘 구체 명시 ✅. |
| D2 완전성 | 7/10 | Issue 1-3 모두 fix됨. **미처리: `agent_memories` 기존 테이블과 v3 `memories` 테이블 관계 미정의** — Layer 4 Epic 스토리 작성 시 두 테이블 중복 구현 위험. |
| D3 정확성 | 9/10 | **상향**: soul-renderer.ts + extraVars 코드 직접 검증. "engine 경계 E8 준수" 설명 정확. 기존 6개 v2 수치 전부 일치. |
| D4 실행가능성 | 8/10 | **상향**: 구현 순서 L130 명시 (Bob 요청 반영) ✅. 픽셀 에셋 전략 L159 명시 ✅. soul-renderer.ts extraVars = 복붙 수준 구현 가이드. |
| D5 일관성 | 9/10 | engine-untouched 원칙 soul-renderer.ts 방식으로 더 강하게 구현됨 ✅. n8n ARGOS 크론잡 유지 명시 (L143) ✅. VPS 제약 정합 ✅. |
| D6 리스크 | 6/10 | **상향**: Issue 2(agent-loop.ts 위험 제거) + Issue 3(n8n 보안) fix됨. 잔존: `agent_memories` vs `memories` 두 시스템 공존 정책 미언급. Reflection 비용 모델은 L151에 명시됨 ✅. |

### 가중 평균: **8.05/10 ✅ PASS**

- D1: 8 × 0.15 = 1.20
- D2: 7 × 0.15 = 1.05
- D3: 9 × 0.25 = 2.25
- D4: 8 × 0.20 = 1.60
- D5: 9 × 0.15 = 1.35
- D6: 6 × 0.10 = 0.60
- **합계: 8.05/10**

---

## 잔존 이슈 (다음 Step으로 이월)

### 🟡 Issue 4 — [D2/D6] agent_memories vs memories 관계 미정의

**위치:** L148-154 Layer 4 + schema.ts L1589

**Winston:** "기존 `agent_memories` 테이블(Epic 16에서 추가, `memory-extractor.ts`가 활성 사용)과 v3 신규 `memories` 테이블의 관계가 없다. Vision이 'Zero Regression = 86개 테이블 유지'를 약속했는데, 신규 테이블 추가 자체는 위반이 아니지만 같은 에이전트 학습 목적의 두 시스템이 병존하면 PRD 작성자가 어느 쪽에 쿼리해야 하는지 모른다. Step 5(Scope)에서 'Layer 4는 agent_memories 확장 vs 신규 테이블'을 명시할 것."

---

## Cross-talk 요약

- **Bob(SM)**: 구현 순서 fix 확인됨 ✅. Layer 4 메모리 관계 결정은 Epic 스토리 작성 전에 필요 — Step 5 Scope에서 해소 권장.
- **Sally**: D1 상향 근거 (Subframe + 아키타입 구조화 deferral). soul-renderer.ts 실존으로 D5=9 강화.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **8.05/10 ✅ PASS** |
| **이월 이슈** | 🟡 Issue 4 (agent_memories vs memories 관계) → Step 5 Scope에서 결정 |
| **특기사항** | soul-renderer.ts extraVars 발견 — 내 soul-enricher.ts 제안보다 우수. 기존 E8 설계가 이미 이 확장을 지원하도록 설계됨. |

Step 3 진행 가능. Issue 4는 Step 5 Scope에서 반드시 결정할 것.
