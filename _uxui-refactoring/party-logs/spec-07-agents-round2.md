# Party Mode Log: spec-07-agents — Round 2 (Adversarial)
> 날짜: 2026-03-09
> 문서: _uxui-refactoring/specs/07-agents.md
> 리뷰어: 7-expert panel (Adversarial Lens)

---

## Round 1 Fix Verification

| # | Round 1 Issue | Fixed? | Verification |
|---|--------------|--------|-------------|
| 1 | 로딩/에러 상태 UI 정의 누락 | Yes | 섹션 3 문제점 #10, 섹션 4.3에 로딩/에러 정의 추가, testid 3개 추가 (`agents-loading`, `agents-error`, `agents-retry-btn`) |
| 2 | 카드 뷰 옵션이 범위 초과 | Yes | 섹션 4.3에서 제거, "별도 Enhancement로 분리" 명시 |
| 3 | isSecretary 미언급 | Yes | 문제점 #11, 색상 테이블, testid (`agents-secretary-badge`) 추가 |
| 4 | Soul 템플릿 testid 누락 | Yes | `agents-soul-template-select` 추가 |
| 5 | 테스트 항목 부족 | Yes | 테스트 #11~#15 추가 (Soul 템플릿, 로딩, 에러, 필수 필드, 부서 필터) |

---

## Expert Debate (Adversarial)

### John (PM)
Round 1 수정이 잘 반영되었습니다. 하지만 한 가지 놓친 것이 있어요: **계급 변경 시 모델 자동 매칭(handleTierChange)**이 "절대 건드리면 안 되는 것"에 있는데, 이 동작이 사용자 시나리오에 명시되어 있지 않습니다. 관리자가 계급을 바꾸면 모델이 자동으로 변경되는 건 중요한 UX 동작인데, 시나리오나 테스트에서 이걸 검증하지 않고 있어요.

### Winston (Architect)
컴포넌트 목록이 여전히 1행인 건 의도적인 것으로 이해합니다 — "UI만 변경, 구조 유지" 원칙에 맞아요. 다만 섹션 5에서 "(단일 파일에 모든 컴포넌트가 인라인으로 정의되어 있음)" 주석이 있으니, 향후 리팩토링 시 분리 대상 컴포넌트를 주석 수준으로라도 나열해두면 좋겠지만 현재 범위에서는 문제없습니다.

### Sally (UX)
로딩/에러 상태가 추가되어 좋습니다. 한 가지 더: **슬라이드 패널의 "실수로 닫기 쉬움" 문제**(문제점 #2)에 대한 개선 방향이 섹션 4에 없습니다. 배경 클릭 시 닫히는 동작을 비활성화하거나, "저장하지 않은 변경이 있습니다" 경고를 추가하는 등의 방향이 필요해요. 다만 이것은 동작 로직 변경에 해당할 수 있어 범위 밖일 수도 있습니다.

### Amelia (Dev)
testid 28개 — 충분한 커버리지입니다. Banana2 프롬프트도 로딩/에러/빈 상태를 모두 요청하고 있어 일관성이 있어요. 한 가지 **testid 네이밍 일관성 점검**: `agents-row`는 복수의 행이 있을 때 구분이 안 됩니다. `agents-row-{id}` 패턴이어야 Playwright에서 특정 에이전트 행을 선택할 수 있어요. 다만 이건 구현 시 동적으로 처리하면 되니 설명서에서는 `agents-row` 기본 패턴만 명시해도 괜찮습니다.

### Quinn (QA)
테스트 15개로 확장되어 커버리지가 많이 좋아졌습니다. 아직 빠진 것: **계급 변경 → 모델 자동 변경 테스트**. 이건 John이 지적한 것과 같은 건데, handleTierChange가 핵심 동작이라면 테스트가 있어야 해요. 추가 제안: 테스트 #16으로 "계급 변경 시 모델 자동 매칭 확인" 항목 추가.

### Bob (SM)
범위가 깔끔하게 정리되었어요. 카드 뷰가 Enhancement로 분리된 것, 로딩/에러 추가된 것 모두 적절합니다. Sally가 지적한 슬라이드 패널 닫기 문제는 동작 로직이라 현재 범위 밖으로 보는 게 맞습니다. 현재 설명서는 "스타일 개선"에 집중하고 있으니 그 방향을 유지하세요.

### Mary (BA)
비서 에이전트 표시가 추가된 건 좋습니다. CORTHEX에서 비서는 CEO의 주 인터페이스이므로 시각적으로 구분되는 건 비즈니스 가치가 있어요. 전체적으로 설명서가 v1 기능을 보존하면서 비주얼만 개선하는 방향이 명확하게 유지되고 있습니다.

---

## New Issue Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|-----------|
| 6 | Low | John, Quinn | 계급 변경 → 모델 자동 매칭(handleTierChange) 동작이 테스트 항목에 없음 | Playwright 테스트 #16 추가 |

---

## UXUI Checklist Verification

```
[UXUI 체크리스트 — 07-agents]
[x] 1. 페이지 목적 + 핵심 시나리오 정의
[x] 2. 현재 레이아웃 분석 (ASCII)
[x] 3. 현재 문제점 (11개)
[x] 4. 개선 방향 (디자인 톤 / 레이아웃 / 인터랙션)
[x] 5. 컴포넌트 목록
[x] 6. 데이터 바인딩 + API 엔드포인트
[x] 7. 색상/톤 앤 매너
[x] 8. 반응형 대응 (Desktop / Tablet / Mobile)
[x] 9. 기존 기능 참고사항 + 보호 항목
[x] 10. Banana2 프롬프트 (Desktop + Mobile)
[x] 11. data-testid 목록 (28개)
[x] 12. Playwright 테스트 항목 (16개 — #16 추가 후)
```

---

## Score & Verdict

| Category | Score | Notes |
|----------|-------|-------|
| 기능 커버리지 | 9/10 | v1 기능 전부 커버, handleTierChange 테스트 추가로 완전 |
| UX 플로우 | 9/10 | 핵심 동작 3클릭 이내, 로딩/에러/빈 상태 정의됨 |
| 구현 가능성 | 9/10 | 단일 파일 수정, API 변경 없음, 명확한 보호 항목 |
| 테스트 충분성 | 9/10 | 16개 테스트로 happy path + edge case 커버 |
| 범위 적절성 | 10/10 | 카드 뷰 분리, UI만 변경 원칙 명확 |

**Final Score: 9/10**

**Verdict: PASS**

주요 반대 의견 0개, 남은 이슈 모두 "사소한 것"(Low severity) — 합의 달성.
