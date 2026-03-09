# Party Mode Round 1 — Spec 03 Dashboard (Collaborative Lens)

**날짜:** 2026-03-09
**대상:** `_uxui-refactoring/specs/03-dashboard.md`
**모드:** Collaborative (건설적 개선)

---

## Expert Reviews

### Sally (UX)
대시보드 핵심 동선은 잘 설계되어 있습니다. 요약 카드 → 차트 → 퀵 액션까지 자연스러운 스캔 흐름이에요. 다만 **비용 카드 클릭 → /costs 드릴다운이 유일한 카드 인터랙션인데, 다른 카드(작업, 에이전트)도 클릭하면 해당 페이지로 이동할 것으로 기대하는 사용자가 있을 수 있습니다.** 카드별 클릭 동작을 명시하면 좋겠습니다. 퀵 액션 상단 이동은 좋은 방향이에요.

### Winston (Architect)
컴포넌트 7개 모두 dashboard.tsx 인라인이라 단일 파일 크기가 커질 수 있지만, UI-only 리팩토링 범위에서는 합리적입니다. **다만 SummaryCards 컴포넌트가 4개 카드를 하나로 묶고 있는데, 개별 카드 단위로 재사용할 수 있도록 `SummaryCard` (단수형) 단위 분리를 고려할 필요가 있습니다.** 데이터 바인딩은 기존 API 그대로 유지하므로 안전합니다.

### Amelia (Dev)
data-testid 목록이 잘 정의되어 있습니다. **하지만 `quick-action-btn`이 여러 개인데 개별 구분이 안 됩니다 — `quick-action-btn-{id}` 같은 동적 testid 패턴이 필요합니다.** 또한 예산 프로그레스 바의 퍼센트 텍스트(`budget-percentage`)와 projected spend 마커에 대한 testid가 누락되어 있습니다. Playwright 테스트 시 이 값들을 검증해야 합니다.

### Quinn (QA)
에러 상태(`dashboard-error`)와 로딩 스켈레톤(`dashboard-skeleton`)이 정의되어 있어 좋습니다. **하지만 Empty 상태가 정의되어 있지 않습니다 — 조직에 에이전트가 0명이거나 오늘 작업이 0건일 때 각 카드/차트가 어떻게 표시되는지 명시해야 합니다.** 또한 WebSocket 연결 끊김 후 재연결 시 데이터 refresh 동작도 명시하면 좋겠습니다.

### John (PM)
v1 기능 대부분 커버되어 있습니다. **하지만 v1 spec 9.4에 있는 "최근 사용 명령어" 기능이 퀵 액션 섹션에서 언급되지 않았습니다.** 퀵 액션이 프리셋 실행 + 네비게이션만 다루고, 최근 사용 히스토리 기반 명령어 표시가 빠져 있어요. 이 기능이 현재 구현에 없는 건지, 있는데 spec에서 누락된 건지 확인이 필요합니다.

### Bob (SM)
범위가 UI-only로 잘 한정되어 있고, "절대 건드리면 안 되는 것" 리스트가 명확합니다. 7개 컴포넌트 스타일 개선은 현실적인 범위입니다. 예상 작업량도 적절합니다.

### Mary (BA)
CEO가 아침에 한눈에 상태를 파악한다는 시나리오가 명확하고, 비즈니스 가치가 잘 드러납니다. 예산 위험도 색상 체계(초록/노랑/빨강)가 즉각적인 의사결정을 지원합니다. 만족도 트렌드도 CEO의 핵심 관심사를 잘 반영합니다.

---

## Cross-talk

**Sally → Amelia:** "비용 카드 외에 다른 카드도 클릭 가능하다면 각 카드에 `summary-card-tasks-link`, `summary-card-agents-link` 같은 testid도 필요하지 않을까요?"

**Amelia → Sally:** "맞습니다. 다만 현재 코드를 보면 비용 카드만 navigate('/costs')가 있고 다른 카드는 클릭 동작이 없어요. UI-only 범위를 벗어나지 않으려면 기존 동작 그대로 유지하고, 비용 카드의 클릭 가능 힌트만 강화하는 게 맞을 것 같습니다."

**Quinn → John:** "최근 사용 명령어 기능이 v1에 있다면 Empty 상태도 정의해야 해요 — 첫 사용 시 최근 명령어가 0개일 때 어떻게 보이는지."

**John → Quinn:** "확인해보니 현재 코드의 퀵 액션은 서버에서 고정 리스트를 내려주는 방식이라 '최근 사용'은 별도 UI가 아닌 서버 정렬로 처리됩니다. spec에 이 점을 명시하면 혼동이 줄겠네요."

---

## Issues Found

| # | 심각도 | 내용 | 조치 |
|---|--------|------|------|
| 1 | **Medium** | Empty 상태 미정의 (작업 0건, 에이전트 0명 등) | spec에 Empty 상태 섹션 추가 |
| 2 | **Medium** | `quick-action-btn` testid가 개별 구분 불가 | `quick-action-btn-{id}` 패턴으로 변경 |
| 3 | **Low** | 예산 퍼센트 텍스트, projected marker testid 누락 | `budget-percentage`, `budget-projected` 추가 |
| 4 | **Low** | v1의 "최근 사용 명령어" 기능 언급 없음 | 퀵 액션 설명에 서버 정렬 방식 명시 |

**Round 1 결과:** 4개 이슈 발견, 수정 적용 필요
