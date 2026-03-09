# [Party Mode Round 2 -- Adversarial Review] departments

> 대상: `_uxui-refactoring/specs/08-departments.md`
> 일시: 2026-03-09
> 렌즈: Adversarial (적대적 검토)

---

### Round 1 Fix Verification

| # | Round 1 Issue | Fixed? | Verification |
|---|--------------|--------|-------------|
| 1 | 모바일 카드 레이아웃 미정의 | YES | Section 8 모바일 행에 카드 구성(부서명+뱃지+상태), kebab 메뉴, 풀스크린 모달 명시 확인 |
| 2 | 부서 '비활성' 상태 비즈니스 의미 미정의 | YES | Section 9에 active/inactive 정의 추가: 비활성 = 새 작업 배정 불가, 기존 작업 완료 허용 |
| 3 | 부서 색상 인덱스 기반 할당 -> 색상 변동 | YES | Section 4.5에서 `departmentId % palette.length` 해시로 변경 확인 |
| 4 | allAgents 전체 fetch 비효율 + 정확성 리스크 | YES | Section 6에 "서버에 agentCount가 있으면 우선 사용" 명시 확인 |
| 5 | 생성 폼 컨테이너 미결정 | YES | Section 4.4에서 "모달로 확정" + CreateDepartmentModal 컴포넌트 추가 (목록 3개) |
| 6 | cascade API 에러 시 모달 내 동작 미정의 | YES | Section 6 cascadeData 행에 "모달 내부에 에러 메시지 + 재시도, 모달은 닫지 않음" 명시 |
| 7 | cascade 비용 카드 실질적 도움 없음 | YES | Section 2 모달 다이어그램에 "아카이브에 보존됩니다" 안심 문구 추가 |
| 8 | 중복 부서명 validation 소스 불명 | YES | Test #13에 "서버 400 에러 -> 에러 토스트 (서버 unique 제약)" 명시 |

**Round 1 이슈 8건 전부 정상 반영 확인.**

---

### Adversarial Agent Discussion

**John (PM):**
"Round 1에서 cascade 비용 카드에 '아카이브에 보존됩니다' 문구를 추가했는데, 이건 좋아요 -- 하지만 WHY do we show the knowledge records count at all? If I'm deleting a department, I need to know: (1) will agents be orphaned, (2) will tasks be interrupted. Knowledge records and cost are *archival* concerns, not *operational* concerns. The modal mixes operational risk (agents, tasks) with archival info (knowledge, cost) without visual hierarchy. The 4 cards are all the same size, giving equal weight to 'N agents affected' and 'N knowledge records archived.' Operationally, these have vastly different severity. However, this is a Banana2 design decision -- the spec correctly provides the data, and the design should differentiate visual weight. Not a spec issue, but worth noting for the Banana2 prompt."

**Winston (Architect):**
"The CreateDepartmentModal addition is sound. Three components is a reasonable decomposition. However, I notice the spec says `showCreate: useState` for toggling the create form -- but now that it's a modal, the state name should semantically reflect that (`showCreateModal` or `isCreateModalOpen`). This is a cosmetic naming issue, not a functional one. **New observation: Section 4.3 says 'inline edit auto-cancels when clicking another row,' but what about when the user opens the create modal while editing? Does the inline edit auto-cancel? Or does the create modal overlay the editing state? The spec should address this interaction conflict.** If both are open simultaneously, the user could get confused about which action they're performing."

**Sally (UX):**
"The mobile breakpoint now specifies card content, kebab menus, and full-screen modals -- good. **New observation: the kebab menu on mobile cards needs to specify its behavior when tapped.** Does it open a bottom sheet (iOS pattern), a dropdown menu (Android pattern), or a popover? This affects how Banana2 designs it and how Playwright tests interact with it. Also, the inline editing on mobile says 'expand card into edit mode' in the Banana2 prompt -- but is this actually feasible if the card only shows name+badge+status? Expanding would need to reveal the description field too. The transition from compact card to edit mode needs more thought -- maybe tapping 'edit' from the kebab should navigate to a dedicated edit screen or open a modal instead of inline expansion."

**Amelia (Dev):**
"The testid list is at 29 items, which is comprehensive. **New observation: there's no `departments-status-badge` testid.** We have `departments-agent-count` for the agent badge, but no testid for the active/inactive status badge itself. If Quinn wants to test that inactive departments show a grey badge (as defined in Section 7), there's no selector for it. We need `departments-status-badge` in the testid table. Also, the cascade modal now has an error state (API failure) -- should there be a `departments-cascade-error` testid for testing that scenario? Currently the cascade modal shares testids with its success state."

**Quinn (QA):**
"Test coverage at 14 items is good for happy paths and basic edge cases. **New observation: there's no test for the inline edit + create modal interaction conflict that Winston raised.** If a user is editing row 3 and then clicks '+ New Department,' does the inline edit auto-cancel? This is a real user scenario. Also, test #8 says '375px viewport -> card layout' but doesn't verify the kebab menu works. We need a mobile-specific test: 'tap kebab -> see edit/delete options -> tap edit -> card expands to edit mode.' Without this, we're testing the layout but not the mobile interaction path."

**Mary (BA):**
"The business definition for inactive status is clear now -- 'new task assignment blocked, existing tasks allowed to complete.' **New observation: should an inactive department be editable?** Can the admin change its name or description while it's inactive? Intuitively yes -- you might rename a department before reactivating it. But it's not explicitly stated. If someone assumes inactive means 'locked,' they might skip edit functionality for inactive departments. The spec should add one line: 'inactive departments remain fully editable (name, description).'"

**Bob (SM):**
"Scope is clean: 3 components (1 modified, 2 extracted), API unchanged. The CreateDepartmentModal is essentially the existing inline form wrapped in a modal shell -- minimal new code. **New observation: the Banana2 desktop prompt lists 9 required elements but doesn't mention the inline edit + create modal conflict resolution. Since both are modal-like (one is a true modal, one is an inline transformation), the Banana2 designer might not realize they can coexist on screen.** Suggest adding a note to the prompt: 'Note: inline editing and the create modal can be active at the same time -- when the create modal opens, any active inline edit should be auto-cancelled.'"

---

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Medium | Winston, Quinn, Bob | 인라인 편집 중 생성 모달 열기 시 충돌 미정의 -- 두 편집 상태가 동시에 존재할 수 있음 | Section 4.3에 규칙 추가: "생성 모달 열기 시 진행 중 인라인 편집 자동 취소" |
| 2 | Low | Amelia | `departments-status-badge` testid 누락 -- 활성/비활성 상태 뱃지 테스트 불가 | testid 목록에 `departments-status-badge` 추가 |
| 3 | Low | Sally | 모바일 kebab 메뉴 동작 방식 미명시 (bottom sheet vs dropdown) | Banana2 재량이지만, 모바일 프롬프트에 "kebab opens a dropdown or action sheet" 힌트 추가 |
| 4 | Low | Mary | 비활성 부서 편집 가능 여부 미명시 | Section 9 비활성 정의에 "비활성 부서도 이름/설명 편집 가능" 한 줄 추가 |
| 5 | Low | Sally | 모바일 인라인 편집 -- 카드 확장 방식의 실현 가능성 의문 | 모바일 편집은 모달로 통일 권장 (카드 확장보다 UX 일관성 높음) |

---

### Cross-talk

**Winston -> Bob:** "Bob의 Banana2 프롬프트 수정 제안에 동의합니다. 'inline edit auto-cancels when create modal opens'를 프롬프트에 한 줄 추가하면 디자이너가 두 상태의 공존 문제를 인지할 수 있어요. 이건 기능 로직이 아니라 시각적 전환 규칙이므로 프롬프트에 포함하는 것이 적절합니다."

**Quinn -> Amelia:** "status-badge testid 누락은 동의합니다. 특히 Section 9에 비활성 상태 정의가 추가되었으니, 그 상태를 시각적으로 검증할 수 있는 testid가 반드시 있어야 합니다. cascade-error도 있으면 좋지만, cascade 모달 자체가 열려있는 상태에서 에러를 검증하는 건 기존 `departments-cascade-modal` + 에러 텍스트 assertion으로 대체 가능합니다."

**Sally -> Mary:** "비활성 부서 편집 가능 여부는 UX 관점에서도 중요합니다. 만약 편집이 불가능하면 수정 버튼을 숨기거나 비활성화해야 하는데, 그건 추가 UI 로직이에요. '편집 가능'으로 명시하면 가장 간단한 구현이 됩니다."

---

### v1-feature-spec Coverage Check

| v1 기능 | 커버 여부 | 비고 |
|---------|----------|------|
| 조직 구조 (부서 단위) -- Section 2.1 | O | 부서 CRUD + cascade 완비 |
| 에이전트 배정 (부서별 그룹핑) -- Section 2.1 | O | 에이전트 수 뱃지 + cascade 에이전트 목록 |
| v2 동적 관리 (생성-수정-삭제) -- Section 23 | O | 핵심 기능, 모달/인라인 편집 모두 정의 |
| 부서별 비용 추적 -- Section 21 | 부분 | cascade에서 비용 표시 (별도 대시보드는 performance 페이지 관할) |
| 에이전트 메모리/학습 -- Section 20 | 간접 | cascade의 '학습 기록' 카드로 참조 (상세는 knowledge 페이지) |

v1-feature-spec에서 부서 관리 관련 기능은 모두 커버됨. 부서 자체의 CRUD + 에이전트 연관 + 삭제 영향 분석이 스펙의 핵심이며, 이 세 가지 모두 충분히 정의되어 있음.

---

### UXUI Checklist

- [x] 핵심 동작 3클릭 이내 (생성: 모달 열기 1 + 입력 + 제출 1 = 2클릭, 편집: 편집 1 + 저장 1 = 2클릭, 삭제: 삭제 1 + 모드선택 + 실행 1 = 3클릭)
- [x] 빈 상태 / 에러 상태 / 로딩 상태 정의됨 (Section 4.4 + Banana2 프롬프트 항목 6-8)
- [x] data-testid가 모든 인터랙션 요소에 할당됨 (29개 + Round 2에서 1개 추가 = 30개)
- [x] 기존 기능 전부 커버 (Section 9 체크리스트 6항목 전체 체크)
- [x] Banana2 프롬프트가 영문으로 구체적으로 작성됨 (데스크톱 + 모바일)
- [x] 반응형 breakpoint (375px, 768px, 1440px) 명시 (Section 8)
- [x] 기능 로직은 안 건드리고 UI만 변경하는 범위 (Section 9 "절대 건드리면 안 되는 것" 4항목)
- [x] 부서 상태 비즈니스 의미 정의됨 (Section 9 active/inactive)
- [x] 색상 안정성 보장 (Section 4.5 ID 해시 기반)

---

### Fixes Applied

1. **인라인 편집 + 생성 모달 충돌 해결** -- Section 4.3에 "생성 모달 열기 시 진행 중 인라인 편집 자동 취소" 규칙 추가
2. **`departments-status-badge` testid 추가** -- Section 11 testid 목록에 추가 (총 30개)
3. **모바일 kebab 메뉴 힌트** -- 모바일 Banana2 프롬프트에 "kebab opens dropdown or action sheet" 추가
4. **비활성 부서 편집 가능 명시** -- Section 9 비활성 정의에 "비활성 부서도 이름/설명 편집 가능" 추가
5. **모바일 편집 모달 권장** -- 모바일 Banana2 프롬프트에서 inline edit -> edit modal 권장으로 변경

---

### Quality Score: 8/10

감점 사유:
- -1: Round 1에서 High 이슈 2건 발생 (수정 완료)
- -1: Round 2에서 인라인편집+모달 충돌이라는 실질적 인터랙션 이슈 발견 (Medium 1건, 수정 완료)

### Final Verdict: PASS
