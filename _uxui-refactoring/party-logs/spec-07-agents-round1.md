# Party Mode Log: spec-07-agents — Round 1 (Collaborative)
> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/07-agents.md
> 리뷰어: 7-expert panel

---

## Expert Debate

### John (PM)
v1-feature-spec.md 2번 항목(에이전트 조직 시스템)의 핵심 기능 8개가 모두 섹션 9 체크리스트에 포함되어 있어 안심됩니다. 다만 **isSecretary(비서 에이전트) 속성**이 실제 코드에 존재하는데 설명서에 언급이 없어요. 비서 에이전트가 v1에서 특별한 역할을 했다면 이 속성의 UI 표시 방식도 정의가 필요합니다. 또한 Soul 템플릿 "불러오기" 플로우가 시나리오에는 있지만 Playwright 테스트 항목에 빠져 있어요.

### Winston (Architect)
컴포넌트 목록이 1행뿐입니다. "단일 파일에 모든 컴포넌트가 인라인"이라고 되어 있는데, UXUI 리팩토링 이후에도 단일 파일을 유지할지 결정이 필요해요. 에이전트 테이블, 디테일 패널, 생성 폼, Soul 에디터 등 최소 4~5개 서브 컴포넌트로 분리하는 게 유지보수와 재사용성 면에서 훨씬 낫습니다. 다만 이번 범위가 "UI만 변경"이라면, 컴포넌트 분리는 별도 작업으로 남겨두고 현재 구조 내에서 스타일만 개선하는 방향을 명시해야 합니다.

### Sally (UX)
섹션 4.3에서 "에이전트 카드 뷰 옵션 (테이블 <-> 카드)" 토글을 제안하는데, 이 토글 UI가 레이아웃 분석(섹션 2)이나 data-testid 목록에 반영되지 않았습니다. 사용자가 뷰를 전환하는 인터랙션이 정의되지 않으면 구현 시 혼란이 생겨요. 또한 **로딩 상태(skeleton)와 에러 상태 UI 정의가 없습니다** — Banana2 프롬프트에 "Loading state, error state" 요청은 있지만 설명서 본문에 구체적 설명이 빠져 있어요.

### Amelia (Dev)
data-testid 22개로 주요 요소는 커버되지만, 누락이 보입니다: (1) `agents-loading` — 목록 로딩 중 skeleton/spinner, (2) `agents-error` — API 에러 상태, (3) `agents-view-toggle` — 카드/테이블 뷰 전환 (4.3에서 제안), (4) `agents-soul-template-select` — Soul 템플릿 선택 드롭다운. 생성 폼 내부 필드별 testid(name, role, tier 등)도 테스트 자동화 시 필요할 수 있지만, 폼 전체를 `agents-create-form`으로 묶는 것도 실용적이니 우선순위는 낮습니다.

### Quinn (QA)
Playwright 테스트 10개 중 **에러 핸들링 테스트가 전혀 없습니다**. 최소한: (1) 에이전트 생성 시 필수 필드 누락 → 에러 메시지, (2) API 실패 시 에러 UI 표시, (3) 중복 이름 생성 시도 처리. 또한 Soul 템플릿 불러오기 테스트와 카드/테이블 뷰 전환 테스트도 빠져 있어요. 현재 테스트는 happy path에 치우쳐 있어 edge case 커버리지가 부족합니다.

### Bob (SM)
범위가 적절합니다 — 단일 파일 수정, API 변경 없음. "절대 건드리면 안 되는 것" 5개 항목도 명확해서 좋아요. 다만 **섹션 4.3의 "카드 뷰 옵션"은 새로운 기능 추가**에 해당하며, 순수 UI 리팩토링 범위를 넘을 수 있습니다. 테이블 뷰를 유지하면서 스타일만 개선하고, 카드 뷰 전환은 별도 Enhancement로 분리하는 게 스코프 관리에 안전합니다.

### Mary (BA)
에이전트 관리는 CORTHEX v2의 "동적 조직 관리" 핵심 가치와 직결되는 페이지예요. 관리자가 AI 직원을 자유롭게 생성/편집할 수 있는 경험이 v1과 차별화되는 포인트인데, 설명서가 그 가치를 잘 보존하면서 비주얼만 개선하는 방향이라 비즈니스 관점에서 적절합니다. Banana2 프롬프트에 "scannable agent list"를 강조한 것도 관리 효율을 높이는 데 핵심이에요.

---

## Cross-talk

**Bob -> Winston:** 카드 뷰 옵션 건에 동의합니다. 현재 범위에서는 테이블 스타일 개선에 집중하고, 카드 뷰 토글은 Enhancement로 빼는 게 맞겠어요. Winston이 말씀하신 컴포넌트 분리도 마찬가지로 별도 작업으로.

**Winston -> Bob:** 네, 이번 작업에서는 "UI만 변경, 구조 유지"를 명확히 하고, 컴포넌트 분리와 카드 뷰는 후속 작업으로 명시하는 게 좋겠습니다.

**Sally -> Quinn:** 로딩/에러 상태 정의가 빠진 건 UX와 QA 모두에게 영향이 커요. 로딩 중 skeleton UI와 에러 시 재시도 버튼이 정의되어야 테스트도 작성할 수 있죠.

**Quinn -> Amelia:** 로딩/에러 testid 추가 동의합니다. `agents-loading`과 `agents-error`는 필수이고, 에러 상태에서 재시도 버튼 `agents-retry-btn`도 있으면 좋겠어요.

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|-----------|
| 1 | Medium | Sally, Amelia, Quinn | 로딩 상태(skeleton) / 에러 상태 UI 정의 누락 | 섹션 3에 로딩/에러 상태 추가, data-testid 2개 추가 (`agents-loading`, `agents-error`) |
| 2 | Medium | Bob, Winston | 섹션 4.3의 "카드 뷰 옵션"이 UI 리팩토링 범위를 넘는 새 기능 | 카드 뷰 토글을 별도 Enhancement로 분리, 현재 범위에서 제거 |
| 3 | Low | John | isSecretary(비서 에이전트) 속성이 코드에 존재하나 설명서에 미언급 | 비서 에이전트 표시 방식 추가 (시스템 뱃지와 유사한 비서 뱃지) |
| 4 | Low | Amelia | `agents-soul-template-select` data-testid 누락 | Soul 템플릿 선택 testid 추가 |
| 5 | Low | Quinn | Soul 템플릿 불러오기 / 에러 핸들링 테스트 항목 누락 | Playwright 테스트 3개 추가 |
