# [Party Mode Round 2 -- Adversarial Review] credentials

> 대상: `_uxui-refactoring/specs/09-credentials.md`
> 일시: 2026-03-09
> 렌즈: Adversarial (적대적 검토)

---

### Round 1 Fix Verification

| # | Round 1 Issue | Fixed? | Verification |
|---|--------------|--------|-------------|
| 1 | Banana2 프롬프트 "inline or modal" 모순 | YES | Section 10 항목 #5를 "modal dialogs (not inline)" 으로 수정 확인 |
| 2 | 토큰 마스킹 프리뷰 데이터 소스 미정의 | YES | Section 6 creds 행에 "서버 maskedToken 필드 있으면 표시, 없으면 라벨만" 명시 확인 |
| 3 | `credentials-no-selection` testid 누락 | YES | Section 11에 추가 + Section 4.4에 "직원 미선택 상태" 정의 확인 |
| 4 | 가이드 접기 상태 지속성 미정의 | YES | Section 4.3에 "localStorage에 저장" 명시 확인 |
| 5 | 토큰 비활성화 시 에이전트 경고 없음 | PARTIAL | Section 9에 "비활성화 = soft delete, 재활성화 불가" 추가됨. 에이전트 경고는 mutation 로직 영역이라 UI 범위 밖 -- 수용 |
| 6 | `apikey-provider-badge` testid 누락 | YES | Section 11에 추가 확인 |
| 7 | 토큰 비활성화 vs 삭제 의미 차이 미명시 | YES | Section 9에 "비활성화 = soft delete, 재활성화 없음, 목록에 남음" 명시 확인 |

**Round 1 이슈 7건 중 6건 완전 반영, 1건 부분 반영 (UI 범위 밖이라 수용).**

---

### Adversarial Agent Discussion

**John (PM):**
"Round 1 수정이 잘 적용되었습니다. 그런데 WHY doesn't the spec address the scenario where ALL tokens for an employee are deactivated? If employee A has 3 tokens and all are deactivated, their AI agents can't function at all. The admin should see some kind of warning state on the employee list item -- maybe a red dot or 'No active tokens' indicator next to the employee name. Currently the employee list (Section 4.2) shows avatar + role but says nothing about token health. An admin managing 20 employees needs to quickly scan which ones have functioning tokens and which don't. This is a visibility gap that goes beyond individual token status."

**Winston (Architect):**
"The masking clarification is good -- 'server maskedToken field or label-only fallback.' **New observation: the `employee-search` in Section 4.2 says 'displayed when 10+ employees, frontend filtering.' But the data binding (Section 6) shows `users` query fetches all users. What if there are 100 employees? The search input does frontend filtering on an already-loaded list, which is fine. But the conditional rendering ('10+') means the search input isn't always present. This creates a testability issue: test for `employee-search` can only run when there are 10+ employees in the test data. Consider always showing the search input (hidden when < 10 is a UX optimization that complicates testing) or noting this condition in the test spec.**"

**Sally (UX):**
"**New observation: the mobile flow has a UX gap at the 'back' transition.** Section 8 says '1-column: employee selection -> token/key list transition' with a back button. But what happens to the right panel content when the user navigates back? If the user was viewing Employee A's tokens, navigates back, then selects Employee B -- does the token section immediately load B's data? Or is there a flash of A's stale data? The spec should clarify: on mobile, navigating back should clear the selected employee state (`selectedUserId = null`), and selecting a new employee starts fresh. This prevents stale data confusion. Also, the mobile Banana2 prompt says 'employee selection as a dropdown or full-width list' -- dropdown is wrong for mobile; a full-width list (master view) is what the spec describes. Remove the dropdown option from the prompt."

**Amelia (Dev):**
"The testid count is now 39 items -- very thorough. **New observation: the `token-add-form` testid is on the form element, but since the form is now inside a modal (AddTokenModal), should there be a `token-add-modal` testid for the modal backdrop/container separate from the form content? Playwright tests often need to verify the modal opened (backdrop visible) before interacting with form elements inside it. Same for `apikey-add-form` -> should have `apikey-add-modal`.** This is a Low issue since tests can assert on `token-add-form` visibility as a proxy for modal open state, but explicit modal container testids are cleaner."

**Quinn (QA):**
"19 tests cover a good range. **New observation: there's no test for the guide box collapse state persistence.** Section 4.3 now says 'localStorage 저장', so we need a test: 'collapse guide -> reload page -> guide stays collapsed.' This is important because it validates the localStorage integration, which is a new behavior. Also, test #17 (token masking) has a conditional dependency: 'when server has maskedToken field.' This means the test might need to be skipped or adapted based on the actual API response structure. The test spec should note: 'if server does not return maskedToken, verify label-only display instead.'"

**Mary (BA):**
"**New observation: the API key scope business rule needs more context.** Section 9 says 'API 키 범위 (company/user)' but doesn't explain the business impact. A 'company' scope API key is shared across all AI agents in the company; a 'user' scope key is tied to one employee's agents. This matters for the ConfirmDialog when deleting a company-scope key -- the warning should be more severe because it affects all agents, not just one employee's. Currently the ConfirmDialog is generic for all delete/deactivate actions. Consider different warning text based on scope: company = 'This key is used by all AI agents in the company' vs user = 'This key is used by this employee's AI agents only.'"

**Bob (SM):**
"Scope review: 4 components, 39 testids, 19 tests, 7 API endpoints. This is well-contained. **New observation: the mobile Banana2 prompt lists 4 mobile-specific items but doesn't mention the 'no selection' placeholder state.** On mobile, when the user first loads the page, they see the employee list. But on desktop, the right panel shows 'select an employee' placeholder. On mobile, since it's a single-column master view, the placeholder isn't visible -- the user just sees the employee list. The prompt should clarify this mobile flow difference so Banana2 doesn't try to show a placeholder on the mobile employee list screen."

---

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Medium | Sally | 모바일 Banana2 프롬프트에 "dropdown" 옵션 부적절 -- 스펙은 full-width 리스트인데 프롬프트에 dropdown 포함 | 모바일 프롬프트에서 "dropdown" 제거, "full-width employee list as master view" 로 변경 |
| 2 | Low | John | 직원 목록에 토큰 건강 상태(active token 유무) 표시 없음 -- 20명 관리 시 스캔 어려움 | Section 4.2에 "직원 항목에 활성 토큰 수 뱃지 표시" 힌트 추가 (선택적 기능) |
| 3 | Low | Winston | `employee-search` 조건부 렌더링(10+)이 테스트 복잡도 높임 | 테스트 스펙에 "10명 이상 테스트 데이터 필요" 조건 명시 |
| 4 | Low | Quinn | 가이드 접기 상태 지속성(localStorage) 테스트 누락 | Test #20 추가: "가이드 접기 -> 페이지 새로고침 -> 접힌 상태 유지" |
| 5 | Low | Mary | API 키 삭제 시 scope에 따른 차별 경고 없음 | ConfirmDialog 경고 문구에 scope 정보 포함 권장 (선택적) |
| 6 | Low | Sally | 모바일 뒤로가기 시 selectedUserId 초기화 필요 -- stale data 방지 | Section 8 모바일 설명에 "뒤로가기 시 selectedUserId 초기화" 추가 |

---

### Cross-talk

**Winston -> Quinn:** "localStorage 테스트는 Playwright에서 `page.evaluate(() => localStorage.getItem('guide-collapsed'))` 로 검증 가능합니다. 테스트 #20 추가에 동의합니다. 이건 UI 동작이 아니라 상태 지속성 검증이라 별도 테스트가 필요해요."

**Sally -> Bob:** "모바일 placeholder 건 동의합니다. 모바일에서는 employee list가 곧 initial screen이므로 별도 placeholder가 필요 없어요. Banana2 프롬프트에 'On mobile, the employee list IS the initial screen -- no placeholder needed' 한 줄 추가하면 혼란을 방지할 수 있습니다."

**Mary -> John:** "John의 '토큰 건강 상태 뱃지' 아이디어는 좋지만, 현재 users 쿼리(`/admin/users?companyId=X`)에 토큰 정보가 포함되는지 확인이 필요합니다. 포함되지 않으면 추가 API 호출이 필요한데, 이는 'API 변경 없음' 원칙을 위반할 수 있어요. 프론트에서 각 직원의 creds를 prefetch하는 방식은 N+1 문제를 일으킵니다. 선택적 기능으로 남기는 게 현실적입니다."

---

### v1-feature-spec Coverage Check

| v1 기능 | 커버 여부 | 비고 |
|---------|----------|------|
| CLI 격리 (사람 1명 = CLI 1개) -- Section 23 | O | 직원별 토큰 관리로 구현 |
| 에이전트 두뇌 (CLI 토큰으로 AI 실행) | O | Section 9에 명시 |
| 도구 시스템 API 키 (KIS, Notion 등) -- Section 3.1 | O | 외부 API 키 CRUD |
| 멀티테넌시 (companyId 격리) -- Section 23 | O | selectedCompanyId 기반 |
| "API 과금" 표현 금지 규칙 | O | "CLI 토큰" 용어 일관 사용 |
| 도구 권한 제어 -- Section 3.2 | 간접 | API 키 scope(company/user)가 권한 범위 역할 |

v1-feature-spec에 credentials 직접 대응 항목은 없지만, AI 에이전트 운영의 핵심 인프라 페이지로서 도구 시스템, CLI 격리, 멀티테넌시를 모두 지원. 커버리지 충분.

---

### UXUI Checklist

- [x] 핵심 동작 3클릭 이내 (직원 선택 1 + 등록 버튼 1 + 폼 제출 1 = 3클릭)
- [x] 빈 상태 / 에러 상태 / 로딩 상태 / 미선택 상태 정의됨 (Section 4.4)
- [x] data-testid가 모든 인터랙션 요소에 할당됨 (39개)
- [x] 기존 기능 전부 커버 (Section 9 체크리스트 5항목 전체 체크)
- [x] Banana2 프롬프트가 영문으로 구체적으로 작성됨 (데스크톱 + 모바일)
- [x] 반응형 breakpoint (375px, 768px, 1440px) 명시 (Section 8)
- [x] 기능 로직은 안 건드리고 UI만 변경하는 범위 (Section 9 "절대 건드리면 안 되는 것" 4항목)
- [x] 보안 관련 시각적 단서 정의됨 (Section 4.1 + Banana2 프롬프트 항목 #7)
- [x] 토큰 비활성화 비즈니스 의미 정의됨 (Section 9 soft delete)
- [x] 가이드 접기 상태 지속성 정의됨 (Section 4.3 localStorage)

---

### Fixes Applied

1. **모바일 Banana2 프롬프트 수정** -- "dropdown or full-width list" -> "full-width employee list (master view). On mobile, employee list IS the initial screen." 변경
2. **가이드 접기 지속성 테스트 추가** -- Test #20 추가
3. **모바일 뒤로가기 시 selectedUserId 초기화** -- Section 8 모바일 설명에 추가
4. **직원 검색 테스트 조건 주석** -- employee-search testid 설명에 "(선택적: 직원 10명+ 시)" 이미 있으므로 충분

---

### Quality Score: 9/10

감점 사유:
- -1: Round 1에서 Banana2 프롬프트 모순 High 이슈 1건 (수정 완료)

### Final Verdict: PASS
