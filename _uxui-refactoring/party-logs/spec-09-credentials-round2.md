# Party Mode Round 2 — Adversarial Lens
## Spec: 09-credentials (CLI Token / API Key Management)

**Date:** 2026-03-09
**Reviewers:** Sally (UX), Winston (Architect), Amelia (Dev), Quinn (QA), John (PM), Bob (SM), Mary (BA)

---

### Round 1 수정 사항 검증

| Round 1 이슈 | 수정 확인 |
|-------------|----------|
| 컴포넌트 목록 누락 (모달/다이얼로그) | OK -- AddTokenModal, AddApiKeyModal, ConfirmDialog 추가됨 |
| data-testid 누락 (6건+) | OK -- 15개 항목 추가 (submit/cancel/label/key/scope-badge/confirm-dialog/loading/error/guide-collapse) |
| 로딩/에러 상태 정의 없음 | OK -- 섹션 4.4 신설, 스켈레톤/에러/빈 상태 구체화 |
| API 키 목록 scope 표시 누락 | OK -- 레이아웃 다이어그램 + apikey-scope-badge testid 추가 |
| 가이드 접기 기능 | OK -- 4.3에 추가, guide-collapse-btn testid 추가 |
| 로딩/에러 testid | OK -- credentials-loading, credentials-error 추가 |

**모든 Round 1 이슈가 정상 수정되었습니다.**

---

### Adversarial Review

### Sally (UX)
모바일에서 "직원 선택 -> 토큰/키 목록 전환"이라고 했는데, **뒤로 가기(직원 목록으로 돌아가기) 동선이 정의되지 않았습니다.** 모바일에서 직원을 선택하면 토큰 섹션으로 전환되는데, 다른 직원을 선택하려면 어떻게 돌아가나요? 뒤로 가기 버튼이 필요합니다. 이것은 새로운 이슈입니다.

### Winston (Architect)
컴포넌트 목록이 잘 정리되었습니다. ConfirmDialog를 "공유 UI 컴포넌트 활용"이라고 했는데, 프로젝트에 이미 공유 ConfirmDialog가 있는지 확인이 필요합니다. 없다면 새로 만들어야 하므로 스코프에 영향을 줍니다. 다만 이는 구현 시 판단할 사항이므로 스펙 레벨에서는 문제없습니다.

### Amelia (Dev)
data-testid 목록이 완전합니다. 토큰/API키 각각 폼의 submit, cancel, 입력 필드 전부 커버되어 있습니다. Playwright 테스트 항목도 14개로 충분합니다. **한 가지 주의**: `token-add-form`과 `apikey-add-form`이 모달로 변경되므로, testid는 모달 내부에 위치하게 됩니다. 스펙에 이 점을 명시하면 좋겠지만, 구현 시 자연스럽게 반영될 내용이라 minor입니다.

### Quinn (QA)
Round 1에서 지적한 로딩/에러 상태가 잘 반영되었습니다. Playwright 테스트 10~14번이 추가된 것도 좋습니다. **한 가지 엣지케이스**: 직원을 선택한 상태에서 해당 직원이 (다른 관리자에 의해) 삭제되었을 때의 처리가 없습니다. 다만 이는 극단적 동시성 케이스이므로 Minor로 봅니다.

### John (PM)
기능 커버리지가 완전합니다. CLI OAuth 토큰 CRUD, API 키 CRUD, scope 관리, 가이드 박스 모두 포함. "절대 건드리면 안 되는 것" 섹션이 명확하게 mutation 로직을 보호하고 있습니다. 문제 없습니다.

### Bob (SM)
Round 1에서 컴포넌트 4개로 늘었지만, ConfirmDialog는 공유 컴포넌트이고 모달 2개도 기존 인라인 폼을 감싸는 수준이라 스코프 증가는 미미합니다. **모바일 뒤로 가기 버튼 추가는 스코프에 거의 영향 없습니다.** 현실적 범위입니다.

### Mary (BA)
비즈니스 가치가 명확합니다. Round 1에서 지적된 토큰 만료/갱신 안내는 이 스펙의 범위 밖이라고 판단합니다 -- 서버 로직 변경이 필요하므로 UI-only 리팩토링에서는 제외가 맞습니다.

---

### Round 2 신규 이슈

| # | 이슈 | 심각도 | 제기자 |
|---|------|--------|--------|
| 1 | 모바일 뒤로 가기(직원 목록 복귀) 동선 미정의 | Medium | Sally |

**이 이슈는 스펙에 즉시 반영합니다.**

---

### UXUI 체크리스트

| 항목 | 상태 |
|------|------|
| 페이지 목적 명확 | OK |
| 현재 레이아웃 분석 | OK |
| 문제점 도출 | OK (8건) |
| 개선 방향 (디자인/레이아웃/인터랙션/상태) | OK |
| 컴포넌트 목록 | OK (4개) |
| 데이터 바인딩 | OK |
| 색상/톤 | OK |
| 반응형 대응 | OK (모바일 뒤로가기 추가 후) |
| 기존 기능 참고 | OK |
| Banana2 프롬프트 | OK |
| data-testid 목록 | OK (32개) |
| Playwright 테스트 항목 | OK (14개) |

---

### 최종 점수: 9/10

**판정: PASS**

감점 사유: 모바일 뒤로 가기 동선이 Round 2에서야 발견됨 (-1). 그 외 Round 1 이슈가 모두 정상 수정되었고, 기능 커버리지, data-testid 완전성, 상태 UI 정의 모두 충분합니다.
