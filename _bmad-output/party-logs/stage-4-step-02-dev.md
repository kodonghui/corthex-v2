# Stage 4 Step 2 — dev (Critic-Implementation) Review

**Reviewer:** dev (Critic-Implementation)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` — Project Context Analysis v3 Update
**Focus:** Code implementability, E8 boundary compliance, existing v2 code patterns

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | Docker 버전(n8n:2.12.3), 메모리 한도(2G/4G), 벡터 차원(1024d), 포트(5678), 연결 제한(50/500), FR-ID 전부 명시. "적절한" 표현 거의 없음. soul-enricher.ts 파일 위치(services/ vs engine/) 미명시 1건. |
| D2 완전성 | 15% | 8/10 | v3 6개 영역 전부 아키텍처 영향 기술, NFR 76개 P0 포함, 메모리 예산, Cross-Cutting 7-12 추가, Sprint 구조 명시. **gap**: FR-TOOLSANITIZE 3개인데 1개로 표기. |
| D3 정확성 | 25% | 7/10 | **4건 오류**: (1) cost-tracker "제거" 표기 but 실제 코드 활성, (2) Phase 4 deps `@google/genai` 잔류, (3) FR-TOOLSANITIZE 1→3, (4) SessionContext Decision 1 `runId` 누락. 반면 Go/No-Go 14개✅, WS 16→17✅, FR-OC 11/N8N 6/MKT 7/PERS 9/MEM 14 전부 PRD 일치✅, Voyage AI 1024d✅. |
| D4 실행가능성 | 20% | 8/10 | soul-enricher가 기존 `renderSoul()`의 `extraVars` 파라미터(soul-renderer.ts:16)를 활용 가능 — 구현 경로 명확. 3개 sanitization 체인 레이어별 방어 명확. n8n Docker 제약 구체적. agent-loop.ts 1행 삽입 지점(L100-140, systemBlocks 생성 전) 식별 가능. |
| D5 일관성 | 15% | 7/10 | v2 영역 테이블 "Hook 4개" (L70) vs Decision 3 "Hook 5개 (cost-tracker 포함)" (L275-278) 내부 모순. Phase 4 deps에 `@google/genai` 잔류 vs v3 제약 "Gemini 금지" (L189). v3 추가 부분은 PRD/확정 결정과 정합. |
| D6 리스크 | 10% | 8/10 | n8n OOM 리스크, Neon advisory lock, LISTEN/NOTIFY 미지원 가능성, pgvector 메모리 영향 — 전부 적절히 식별. **미언급**: cost-tracker 제거 시 SSE `done` 이벤트의 `costUsd` 필드 처리 방안(프론트 영향). |

## 가중 평균: 7.60/10 ✅ PASS

계산: (8×0.15)+(8×0.15)+(7×0.25)+(8×0.20)+(7×0.15)+(8×0.10) = 1.20+1.20+1.75+1.60+1.05+0.80 = **7.60**

---

## 이슈 목록

### 1. [D3 Critical] cost-tracker "제거" 표기 — 실제 코드 활성

**위치:** architecture.md L69-70 (v2 area table)

v2 영역 테이블:
- L69: `Tier & Cost | 4 | (~~cost-tracker~~ CLI Max 월정액, GATE 2026-03-20 제거)`
- L70: `Security & Audit | Hook 4개 (permission/credential/delegation/redactor) + cost-tracker 제거`

**실제 코드 검증:**
- `engine/agent-loop.ts:12`: `import { costTracker } from './hooks/cost-tracker'`
- `engine/hooks/cost-tracker.ts`: 완전히 구현됨 (MODEL_PRICES, UsageInfo, 캐시 토큰 비용 계산)
- `engine/__tests__/agent-loop-hooks.test.ts:203,272`: 활성 테스트 2건

**또한 Decision 3 (L275-278) 자체가 cost-tracker를 Stop hook으로 유지:**
```
Stop (세션 종료):
  1. cost-tracker → 비용 기록
```

**문제:** CLI Max 월정액으로 사용자 대면 비용 페이지(FR37/FR39)는 삭제됐지만, cost-tracker Hook 자체는 SSE `done` 이벤트의 `costUsd`/`tokensUsed` 전달 + 기술 모니터링용으로 여전히 필수. "제거"는 사실과 다름.

**권고:** "~~cost-tracker~~ 제거" → "cost-tracker: 사용자 대면 비용 UI 제거 (FR37/FR39 삭제). Hook 자체는 SSE done 이벤트 비용 필드 + 기술 모니터링용 유지" 로 수정. Hook count는 5개 유지.

### 2. [D3/D5] Phase 4 deps `@google/genai` 잔류 — Gemini 금지 위반

**위치:** architecture.md L375 vs L189

- L375 (v2 baseline): `| @google/genai | Gemini Embedding API | server/ |`
- L189 (v3 constraints): `Gemini API 전면 금지 | 임베딩 포함 Voyage AI voyage-3 사용. @google/genai 제거 필수`

v2 baseline 섹션에서 Phase 4 deps를 업데이트하지 않음. Step 2가 "v3 additions to existing v2 section"이므로 v2 baseline 내 모순을 catch해서 수정 또는 strikethrough 처리 필요.

**권고:** L375을 `| ~~@google/genai~~ → `voyageai` | ~~Gemini~~ Voyage AI Embedding API (확정 결정 #1) | server/ |` 로 수정.

### 3. [D3] FR-TOOLSANITIZE FR count: 1 → 3

**위치:** architecture.md L87

- Architecture: `도구 응답 보안 (FR-TOOLSANITIZE) | 1`
- PRD 실제:
  - FR-TOOLSANITIZE1: 프롬프트 주입 패턴 감지
  - FR-TOOLSANITIZE2: 감지 시 교체 + 감사 로그
  - FR-TOOLSANITIZE3: 10종 adversarial payload 100% 차단율

**영향:** v3 FR 합계가 48→50으로 변동. 전체 "116개" 표기와의 정합성 재확인 필요.

**권고:** `| 1 |` → `| 3 |`

### 4. [D3] SessionContext Decision 1 — `runId` 9번째 필드 누락

**위치:** architecture.md L235-245

Decision 1의 SessionContext 정의에 8개 필드만 표시. 실제 코드:
```typescript
// engine/types.ts:14
readonly runId: string  // UUID v4 generated at session start (E17)
```

Epic 15에서 E17로 추가된 필드. v2 baseline 섹션이 Epic 15 이후 업데이트되지 않음.

**권고:** Decision 1 SessionContext에 `runId: string; // E17: 전체 세션 도구 호출 그룹핑` 추가.

### 5. [D4] soul-enricher.ts 파일 위치 미명시

**위치:** architecture.md L157 (Infrastructure Additions), L214 (Cross-Cutting #7)

PRD FR-PERS3는 `packages/server/src/services/soul-enricher.ts` 명시. architecture에서는 "soul-enricher.ts 단일 진입점" + "E8 최소 침습"이라고만 기술.

**검증:** services/ 위치는 E8 위반 없음 — E8는 외부→engine/ import를 금지하지, engine/→services/ import는 허용 (현재 agent-loop.ts가 `../db/`, `../lib/`에서 이미 import 중).

**권고:** Infrastructure Additions 테이블에 `services/soul-enricher.ts` 위치 명시. Cross-cutting #7에 "위치: `packages/server/src/services/soul-enricher.ts` — engine/ 외부, E8 위반 없음" 추가.

### 6. [D6] cost-tracker 제거 시 프론트엔드 영향 미언급

**위치:** 리스크 전반

cost-tracker가 실제로 제거된다면 (`done` SSE 이벤트 → `{ type: 'done', costUsd: number, tokensUsed: number }` — `engine/types.ts:24`):
- CEO앱/Admin앱에서 `done` 이벤트의 `costUsd` 필드를 참조하는 코드 영향
- SSEEvent 타입 정의 변경 → shared/types.ts 파급

단, Issue #1 권고대로 Hook 유지하면 이 리스크는 해소.

---

## 구현 관점 소견

### 긍정 평가

1. **soul-enricher 패턴 우수**: 기존 `renderSoul()`의 `extraVars?: Record<string, string>` (soul-renderer.ts:16)를 그대로 활용. 실제 구현 시 agent-loop.ts L140 직전에 `const enrichedSoul = await soulEnricher.enrich(soul, agentName, ctx.companyId)` 1행 삽입 → `text: enrichedSoul || ''` 변경만으로 완성. E8 최소 침습 약속 이행 가능.

2. **3개 sanitization 체인 정확히 구분**: PER-1(API입력 경계), MEM-6(저장 데이터 경계), TOOLSANITIZE(런타임 응답 경계) — 각각 다른 공격 표면, 다른 데이터 흐름, 다른 방어 지점. 구현 시 혼동 없음.

3. **메모리 예산 현실적**: ~11GB/24GB로 13GB 여유. pgvector HNSW 3개 인덱스(1024d)가 PG 4GB 내에서 소화 가능한 규모 (초기 데이터 수천 행 수준).

4. **v2 보존 우수**: HTML 주석(`<!-- v2 areas -->`, `<!-- v3 areas -->`)으로 명확 구분. v2 결정 사항(D1-D21) 원본 유지하면서 v3 추가분만 별도 섹션.

5. **Neon 제약 식별 적절**: advisory lock + LISTEN/NOTIFY 모두 serverless 환경에서 검증 필요한 항목으로 정확히 플래그.

### 주의 사항

- **v2 baseline 업데이트 일관성**: Step 2가 "v3 additions"이면 v2 baseline은 건드리지 않는 게 맞지만, v2 baseline 내 정보가 v3와 직접 모순되는 경우(Gemini deps, cost-tracker Hook count)는 적어도 strikethrough 처리 필요. 현재는 같은 문서 내에서 "Gemini 제거 필수" vs "Gemini deps listed"가 공존하여 구현자 혼동 유발.
