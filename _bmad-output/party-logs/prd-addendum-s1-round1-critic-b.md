# CRITIC-B Review: PRD Addendum Section 1 — Epic 15 Functional Requirements
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## Issue 1 — FR-CACHE-2.2: "sortedParams" 정의 누락 → 캐시 키 충돌 위험
**[Amelia — Dev 관점]**

FR-CACHE-2.2는 캐시 키를 `${companyId}:${toolName}:${JSON.stringify(sortedParams)}`로 명시하지만, "sortedParams"가 무엇인지 정의하지 않는다. JavaScript 객체를 `JSON.stringify()` 직접 호출하면 키 순서가 삽입 순서에 의존하므로 `{a:1, b:2}`와 `{b:2, a:1}`이 서로 다른 캐시 키를 생성한다 — 동일 파라미터인데도 캐시 미스가 발생하여 외부 API가 중복 호출된다.

**요구사항:** `JSON.stringify(Object.fromEntries(Object.entries(params).sort()))` 또는 동등한 키 정렬 로직을 FR에 명시해야 한다. "sortedParams" 표현을 "키를 알파벳 오름차순으로 정렬한 뒤 JSON.stringify"로 교체할 것.

---

## Issue 2 — FR-CACHE-2.6: Tool Cache miss 로그 누락 → KPI-3 분모 불명
**[Quinn — QA 관점]**

FR-CACHE-2.6은 `tool_cache_hit` 이벤트 로그만 요구한다. KPI-3 히트율(hit/total)을 계산하려면 전체 도구 호출 수(분모)가 필요한데, miss 로그가 없으면 분모를 알 수 없다. FR-CACHE-3.10은 Semantic Cache에 대해 miss 로그(`semantic_cache_miss`)를 명시했는데 Tool Cache에서는 같은 요건이 빠졌다 — 일관성 결여이자 측정 불가 리스크.

**요구사항:** `log.info({ event: 'tool_cache_miss', toolName, companyId })` 또한 필수로 추가해야 한다. 또는 "전체 도구 호출 수는 별도 로그에서 집계한다"는 대안 측정 방법을 FR에 명시해야 한다. Brief KPI-3 측정 방법("log.info({ event: 'tool_cache_hit' }) 카운트 / 전체 도구 호출 수")의 "전체" 출처를 FR이 보장해야 한다.

---

## Issue 3 — FR-CACHE-3.6: E8 경계 체크 패턴이 false positive 유발
**[Winston — Architect 관점]**

FR-CACHE-3.6의 `check_pattern "from.*engine/semantic-cache"` 명령은 `engine/semantic-cache.ts` 파일 자체와 `engine/agent-loop.ts`를 포함한 engine/ 내부 import도 매칭한다. architecture.md E10은 현재 `routes/`, `lib/` 경로만 체크하도록 범위를 한정하고 있는데, FR은 이 제외 조건을 명시하지 않았다.

**요구사항:** 스크립트 패턴에 `engine/` 디렉토리 자체 제외 조건을 추가해야 한다:
```bash
grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
  | grep -v 'engine/agent-loop.ts' \
  | grep -v 'engine/semantic-cache.ts'
```
Brief의 Implementation Notes §Story 15.3 구현 가이드에 이미 이 형태가 명시되어 있으므로 FR이 이를 그대로 반영해야 일관성이 확보된다.

---

## Issue 4 — FR-CACHE-2.4: 메모리 초과 시 대응 행동 미정의
**[Winston — Architect 관점]**

FR-CACHE-2.4는 `process.memoryUsage()`로 100MB 초과를 "모니터링"하도록 요구하지만, 초과 시 어떤 행동을 해야 하는지(로그 경고? LRU 강제 실행? 에러?) 정의하지 않는다. LRU + 10,000 항목 상한이 정상 동작 시 100MB 이내를 보장하지만 "모니터링 코드를 포함한다"는 표현은 모니터링만으로 끝나는지 action까지 요구하는지 모호하다.

**요구사항:** "100MB 초과 감지 시 `log.warn({ event: 'tool_cache_memory_high', usedMB })` 경고 로그를 발행한다" 수준의 명확한 행동 정의가 필요하다. 이것이 MVP 범위 외라면 FR에서 해당 문장을 삭제하고 Out of Scope로 이동해야 한다.

---

## Issue 5 — FR-CACHE-1.4: 기존 Stop Hook 구현 업데이트 범위 미언급
**[Bob — SM 관점]**

FR-CACHE-1.4는 `StopHookUsage` 타입에 필드를 추가하지만, 기존에 구현된 `cost-tracker` Stop Hook이 이 타입을 사용하고 있을 경우 업데이트가 필요하다. TypeScript optional 필드(`?:`)이므로 컴파일 에러는 없지만, `cost-tracker`가 새 필드를 무시하면 FR-CACHE-1.7의 캐시 비용 로깅이 동작하지 않는다. architecture.md E2의 현행 Stop Hook 시그니처는 `usage: { inputTokens: number; outputTokens: number }`이며 캐시 필드가 없다.

**요구사항:** FR-CACHE-1.4에 "기존 `cost-tracker` Hook 구현이 `cacheReadInputTokens`, `cacheCreationInputTokens`를 읽어 FR-CACHE-1.7의 비용 계산을 수행하도록 업데이트해야 한다"는 내용을 명시해야 한다. 이것이 Story 15.1 scope인지 별도 Story인지도 확정 필요.

---

## Issue 6 — FR-CACHE-3.3: Admin UI 구현 위치 불특정
**[Bob — SM 관점]**

FR-CACHE-3.3은 "`packages/admin` 에이전트 편집 페이지에 `enableSemanticCache` 토글을 추가한다"고 명시하지만 구체적인 컴포넌트/파일 경로가 없다. 워커가 에이전트 편집 페이지를 찾기 위해 `packages/admin/src` 전체를 탐색해야 하며, 잘못된 위치에 추가하면 QA 단계에서 재작업이 발생한다.

**요구사항:** "에이전트 편집 페이지(예: `packages/admin/src/pages/AgentEdit.tsx` 또는 상응하는 컴포넌트)"처럼 현행 admin 코드에서 실제 파일 경로를 조회하여 명시해야 한다. Brief MVP Scope의 Story 15.3에서 "packages/admin (에이전트 편집 페이지 enableSemanticCache toggle UI)"로 이미 언급하고 있으나 FR은 이보다 구체적이어야 한다.

---

## 종합 평가

| 이슈 | 심각도 | 유형 |
|------|--------|------|
| Issue 1: sortedParams 미정의 | **High** (런타임 캐시 미스 버그) | 구현 모호성 |
| Issue 2: Tool Cache miss 로그 누락 | **High** (KPI 측정 불가) | 요구사항 누락 |
| Issue 3: E8 check 패턴 false positive | **Medium** (CI 오탐) | 아키텍처 일관성 |
| Issue 4: 메모리 초과 행동 미정의 | **Medium** (모호성) | 불완전 요구사항 |
| Issue 5: cost-tracker 업데이트 미언급 | **Medium** (기능 누락 리스크) | 범위 누락 |
| Issue 6: Admin UI 위치 불특정 | **Low** (개발 비효율) | 구체성 결여 |

**전체 판정:** 수정 필요. Issue 1, 2는 구현 시 버그 직결 항목으로 반드시 수정 후 재검토.
