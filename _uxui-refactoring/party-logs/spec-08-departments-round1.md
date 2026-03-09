# [Party Mode Round 1 -- Collaborative Review] departments

> 대상: `_uxui-refactoring/specs/08-departments.md`
> 일시: 2026-03-09
> 렌즈: Collaborative (협력적 검토)

---

### Agent Discussion

**John (PM):**
"WHY does the cascade analysis modal show 'cost' (비용) as one of the four impact cards? From the admin's perspective, what decision does cost information actually help them make? If a department has $500 accumulated cost, does that change whether I delete it? I suspect not -- it's a sunk cost. The admin cares about *ongoing* impact: active tasks that will be interrupted, agents that need reassignment. The cost card is noise that dilutes the signal of the truly actionable metrics. WHY should the admin care about historical cost at deletion time? I'd argue the card should at minimum explain that the cost record is *preserved* after deletion, so the admin knows nothing is lost -- otherwise the number just creates anxiety without a clear action."

**Winston (Architect):**
"The spec says 'department color/icon is UI-only, not stored in DB, assigned by index order.' This is practical for now, but it will break when departments are reordered, deleted, or created in non-sequential order. If department A (index 0, blue) is deleted, department B (formerly index 1, green) becomes index 0 and turns blue. Users will see colors shifting randomly after any deletion. A deterministic hash of the department ID would be more stable -- `colors[departmentId % palette.length]` ensures colors never change regardless of list mutations. Also, the inline edit rule says 'auto-cancel current edit when clicking another row' -- fine, but the spec doesn't address what happens when the cascade-analysis API returns an error while the modal is already open. Does the modal show a spinner-then-error inside, or does it close? This needs to be specified."

**Sally (UX):**
"Looking at the mobile breakpoint (375px), the spec just says 'card list' -- but it doesn't describe what the card contains or how edit/delete are accessed. A card with name, description, agent count, status, AND edit/delete buttons is going to be extremely cramped at 375px. Real users on mobile are more likely scanning than editing. The mobile card should show name + agent count badge + status badge, with edit/delete behind a kebab menu (three dots). Also, the 'create form' -- on desktop we're told 'Banana2 decides modal or inline,' but this non-decision makes Playwright tests impossible to write reliably. We need to commit to one. Given the identified layout-shift problem with inline forms, modal is the clear winner."

**Amelia (Dev):**
"`allAgents` query in Section 6 fetches ALL agents via `/admin/agents?companyId=X` just to count per-department. With 200 agents across 10 departments, that's 200 records pulled client-side for 10 badge numbers. The server should ideally return `agentCount` per department, but since 'API 변경 없음' is a constraint, at minimum the spec should acknowledge this pattern and note that if the server response already includes agentCount, it should be preferred. Also: `departments-row` as a shared testid means `getByTestId` returns multiple elements. For cascade test #6, we need to target a specific row's delete button -- the spec should clarify that `departments-delete-btn` inside a specific `departments-row` is the targeting pattern."

**Quinn (QA):**
"Test #13 says 'duplicate department name -> error toast or validation message' but the spec never defines whether duplicate names are even validated. Is this a frontend-only check, a server 400, or a DB unique constraint? If the server doesn't enforce uniqueness, this test will always pass (no error ever fires). The spec needs to explicitly state the validation source. Additionally, there's no test for what happens when cascade-analysis API fails -- the modal opens, the API call fires, and then what? This is a real user scenario (network timeout) with no defined behavior."

**Mary (BA):**
"The business case for 'department status (active/inactive)' is poorly defined. v1 had a fixed 29-agent structure with no concept of deactivating a department. v2 adds dynamic management, but the spec doesn't define what 'inactive' actually means operationally. Can an inactive department still receive tasks? Do its agents stop working? If inactive means 'soft delete,' then cascade analysis should behave differently -- an inactive department with 0 active tasks needs different messaging than an active one. This is a pattern I see across admin pages: status badges without defined business semantics. The admin sees a grey 'inactive' badge but has no idea what it implies for operations."

**Bob (SM):**
"Section 4.4 says 'create form: Banana2 decides modal or inline.' That's a scope gap -- we can't write Playwright tests for the create flow if we don't know whether it's a modal or inline form. The testid list includes `departments-create-form` and `departments-create-name`, implying a form exists, but its container type (modal vs inline) affects how Playwright locates and interacts with it. This needs a decision NOW, not deferred to a design tool. Also, the component list has only 2 entries but after adding a create modal that becomes 3 -- update the table."

---

### Cross-talk

**Winston -> Sally:** "Sally's point about mobile cards connects to my color concern. If departments have color indicators on desktop (left border stripe), the mobile card needs to carry that color ID as well, or users lose the color-association they built on desktop. The kebab menu suggestion is solid -- it keeps the card compact while preserving all actions."

**Quinn -> Mary:** "Mary raises the active/inactive business rule question -- and this directly impacts my test coverage. If 'inactive' has no defined behavior, I can't write meaningful tests for it. Does an inactive department show a different cascade modal? Can you still edit an inactive department? The spec needs at minimum a 2-line definition of what each status means operationally."

**John -> Amelia:** "Amelia's concern about fetching all agents is also a PM concern. If the agent count badge is wrong due to a client-side counting bug, the cascade analysis loses trust. The 'API 변경 없음' constraint is understood, but the spec should at least note the preference for server-side counts when available."

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High | Sally, Bob | 모바일 카드 레이아웃 미정의 -- 375px에서 카드 내용, 편집/삭제 접근 방식, 생성 폼 형태 미명시 | 모바일 카드: 이름+에이전트수+상태, 편집/삭제는 kebab 메뉴, 생성 폼은 풀스크린 모달 |
| 2 | High | Mary, Quinn | 부서 '비활성' 상태의 비즈니스 의미 미정의 -- inactive가 운영에 미치는 영향 불명 | 비활성 = 새 작업 배정 불가, 기존 작업은 완료 허용으로 정의 |
| 3 | Medium | Winston | 부서 색상 인덱스 기반 할당 -- 삭제/재정렬 시 색상 변동 | `colors[departmentId % palette.length]` ID 기반 해시로 변경 |
| 4 | Medium | Amelia | allAgents 전체 fetch로 에이전트 수 계산 -- 비효율 + 정확성 리스크 | 서버에 agentCount 있으면 우선 사용 명시, 프론트 계산은 폴백 |
| 5 | Medium | Bob, Sally | 생성 폼 컨테이너 타입 미결정 -- Banana2 위임으로 테스트 작성 불가 | 모달로 확정 + 컴포넌트 목록에 CreateDepartmentModal 추가 |
| 6 | Medium | Quinn, Winston | cascade-analysis API 에러 시 모달 내 동작 미정의 | 모달 내부에 에러 메시지 + 재시도 표시 (모달은 닫지 않음) |
| 7 | Low | John | cascade 모달 '비용' 카드가 삭제 결정에 실질적 도움 안됨 | 비용 카드에 "아카이브에 보존됩니다" 안심 문구 추가 |
| 8 | Low | Quinn | 중복 부서명 validation 소스 불명 | 서버 unique 제약 기반 400 에러 -> 에러 토스트로 명시 |

---

### Consensus Status

- 주요 반대 의견: 0개 (8개 이슈 전원 동의)
- 합의: **수정 필요** -- High 2건 + Medium 4건 수정 후 Round 2 진행

---

### v1-feature-spec Coverage Check

| v1 기능 | 스펙 커버 여부 | 비고 |
|---------|-------------|------|
| 조직 구조 (부서 단위) -- Section 2.1 | O | 부서 CRUD 완비 |
| 에이전트 3계급 배정 -- Section 2.2 | 해당없음 | 계급은 에이전트 페이지(07) 관할 |
| 부서별 지식 자동 주입 -- Section 16 | 해당없음 | 정보국(knowledge) 페이지 관할 |
| 부서별 비용 추적 -- Section 21 | 부분 | cascade에서 비용 표시, 별도 비용 대시보드는 performance 페이지 |
| v2 동적 조직 관리 -- Section 23 | O | 생성-수정-삭제 자유롭게 가능 |
| 에이전트 메모리/학습 -- Section 20 | 해당없음 | cascade의 '학습 기록' 카드로 간접 참조만 |

---

### Fixes Applied

1. **모바일 카드 레이아웃 상세화** -- Section 8 모바일 행에 카드 구성(이름+뱃지+상태), kebab 메뉴, 풀스크린 모달 명시
2. **비활성 상태 비즈니스 정의** -- Section 9에 active/inactive 운영 의미 추가 (비활성 = 새 작업 배정 불가, 기존 작업 완료 허용)
3. **부서 색상 할당 방식 변경** -- Section 4.5에서 인덱스 -> `departmentId % palette.length` 해시로 변경
4. **에이전트 수 계산 방식 명시** -- Section 6 allAgents 행에 서버 agentCount 우선 사용 + 프론트 계산 폴백 주석
5. **생성 폼 모달 확정** -- Section 4.4에서 "Banana2 결정" -> "모달로 확정" + CreateDepartmentModal 컴포넌트 추가 (목록 3개로)
6. **cascade API 에러 처리** -- Section 6 cascadeData 행에 에러 시 모달 내부 에러+재시도 명시
7. **cascade 비용 카드 안심 문구** -- Section 2 모달 다이어그램에 "아카이브에 보존됩니다" 추가
8. **중복 부서명 validation 명확화** -- Test #13에 "서버 400 에러 -> 에러 토스트" 명시
9. **Banana2 프롬프트 업데이트** -- 데스크톱: create form = modal 확정, 색상 = ID hash. 모바일: kebab 메뉴, card 내용 명시
