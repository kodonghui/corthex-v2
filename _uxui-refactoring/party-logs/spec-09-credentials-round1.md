# [Party Mode Round 1 -- Collaborative Review] credentials

> 대상: `_uxui-refactoring/specs/09-credentials.md`
> 일시: 2026-03-09
> 렌즈: Collaborative (협력적 검토)

---

### Agent Discussion

**John (PM):**
"WHY is the 'guide box' always visible by default? For a first-time admin, it's essential -- they need to know how to find the Claude OAuth token. But for a returning admin who's registered tokens 50 times, that guide box is dead space eating up valuable vertical real estate on every single page load. The spec mentions 'collapsible' in Section 4.3, which is good. But WHY doesn't the spec define whether the collapse state is persisted? If I collapse it today and it pops back open tomorrow, that's a frustrating experience. The collapse state should be persisted in localStorage at minimum, so the guide stays hidden once the admin dismisses it. Without this, the 'collapse' feature is practically useless because the admin has to close it every session."

**Winston (Architect):**
"The Banana2 desktop prompt (Section 10) says 'Registration forms -- could be inline expandable or modal.' But Section 4.3 explicitly says 'modal' for both token and API key registration. This is a contradiction -- the Banana2 prompt should match the spec decision. If Banana2 designs an inline form based on the prompt, the implementation will diverge from the spec. The prompt needs to say 'modal dialogs' not 'could be inline expandable or modal.' Also, the data binding section doesn't mention the masking behavior for tokens. The `creds` query returns token data, but the spec doesn't specify whether the server response includes a `maskedToken` field or if the frontend should derive it. If the server doesn't provide it, the frontend can't display 'sk-ant-oat01-***' because it never sees the token after registration."

**Sally (UX):**
"The mobile experience (Section 8) describes a 1-column layout with a back button for navigating between employee list and token/key details. This is a good pattern -- it's essentially a master-detail navigation. But the spec doesn't define what happens as the *initial* state on mobile. Does the user see the employee list first (with no tokens visible), or a placeholder saying 'select an employee'? On desktop, the left panel always shows employees, so there's no ambiguity. On mobile, the initial screen matters because it sets the user's mental model. Also, the back button `mobile-back-btn` -- does it appear in the content area or in the top header? If in the header, it's outside our content area scope."

**Amelia (Dev):**
"The testid list at 36 items is comprehensive, but I notice a gap: there's no `credentials-no-selection` testid for the state when no employee is selected. Test #8 says 'initial state -> 직원을 선택하세요 안내' but there's no testid to assert on this placeholder element. Also, `apikey-provider-badge` is missing -- the API key list shows provider badges (KIS, Notion, etc.) per Section 4 item 4b in the Banana2 prompt, but there's no testid to verify the correct provider is displayed. Finally, the `employee-search` testid exists but the feature is described only in Section 4.2 as 'when 10+ employees' -- this conditional rendering logic needs to be clarified: is the search input always rendered but only visible above 10, or is it conditionally mounted?"

**Quinn (QA):**
"Test #17 says 'token registration -> masked preview displays' but this test has a dependency on the server returning a masked token. If the server doesn't return a `maskedToken` field, the test will fail through no fault of the UI. The spec needs to clarify: is `token-masked-preview` shown conditionally (only when server provides maskedToken), or always (with frontend generating the mask)? Also, there's no test for a critical user flow: 'register a token -> verify it appears in the list -> deactivate it -> verify status changes to inactive.' Tests #4 and #5 cover registration and deactivation separately, but the sequential flow isn't tested."

**Mary (BA):**
"The business relationship between CLI tokens and AI agent operation is well-stated in Section 9 -- 'AI agents need human employees' CLI tokens to operate.' But the spec doesn't address a critical business question: **what happens in the UI when a token is deactivated but agents are currently using it?** Is there a warning? Does the deactivate button show a count of affected agents? The ConfirmDialog for deactivation (Section 4.3) should probably mention how many agents are currently running with that token. Without this, an admin might deactivate a production token and cause agent failures without realizing it. This connects to the cascade analysis pattern in 08-departments."

**Bob (SM):**
"Scope check: 4 components, 36+ testids, 7 API endpoints, 3 breakpoints. This is a moderately complex page. The ConfirmDialog is listed as 'shared UI component' which is correct -- it should be reused from the departments page or the UI package. However, the Banana2 prompt item #5 still says 'could be inline or modal' for registration forms, contradicting Section 4.3's explicit 'modal' decision. This discrepancy will cause rework if Banana2 designs inline forms. Fix the prompt. Also, there's no definition for what 'deactivate' means vs 'delete' for CLI tokens. API keys have DELETE, but CLI tokens have 'deactivate' -- is a deactivated token recoverable (re-activatable)?"

---

### Cross-talk

**Winston -> Bob:** "Bob's catch on the Banana2 prompt contradiction is critical. If we ship a prompt saying 'could be inline or modal,' we'll get a 50/50 chance of the wrong design. The prompt should unambiguously say 'modal dialogs' to match Section 4.3. This is a documentation sync issue, not a design decision."

**Quinn -> Mary:** "Mary's point about deactivating a token while agents are using it is a business logic question that affects UI. If we add an 'affected agents' count to the ConfirmDialog, that requires a new API call or data from the existing response. We need to determine: does the `DELETE /admin/cli-credentials/:id` endpoint return or check for active agent usage? If not, this is out of scope for UI-only refactoring."

**Sally -> Amelia:** "Amelia's observation about `credentials-no-selection` testid is correct. Test #8 exists but has no testid to assert on. Also, the mobile initial state question -- on mobile, the first screen should be the employee list (master view), with the detail view appearing only after selection. The `mobile-back-btn` brings you back to the master view. This needs to be in the spec."

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High | Winston, Bob | Banana2 프롬프트 항목 #5가 "inline or modal" -- Section 4.3의 "모달" 결정과 모순 | 프롬프트를 "modal dialogs" 로 수정 |
| 2 | Medium | Winston, Quinn | 토큰 마스킹 프리뷰 데이터 소스 미정의 -- 서버 maskedToken 필드 여부에 따라 구현 완전히 달라짐 | Section 6 creds 행에 "서버에 maskedToken 있으면 표시, 없으면 라벨만" 명시 |
| 3 | Medium | Amelia, Sally | `credentials-no-selection` testid 누락 -- 직원 미선택 시 placeholder 검증 불가 | testid 추가 + Section 4.4에 "직원 미선택 상태" 정의 |
| 4 | Medium | John | 가이드 박스 접기 상태 지속성(persistence) 미정의 -- 세션마다 다시 열림 | "localStorage에 접기 상태 저장" 한 줄 추가 |
| 5 | Low | Mary | 토큰 비활성화 시 영향 받는 에이전트 경고 없음 | ConfirmDialog에 경고 문구는 추가하되, 에이전트 수 API는 "절대 건드리면 안 되는" mutation 로직이므로 UI 문구만 |
| 6 | Low | Amelia | `apikey-provider-badge` testid 누락 -- 제공자 뱃지 검증 불가 | testid 추가 |
| 7 | Low | Bob | 토큰 '비활성화' vs '삭제' 의미 차이 미명시 -- 비활성 토큰 재활성화 가능 여부 불명 | Section 9에 "비활성화 = soft delete, 재활성화 불가 (현재 API)" 또는 "재활성화 가능" 명시 |

---

### Consensus Status

- 주요 반대 의견: 0개 (7개 이슈 전원 동의)
- 합의: **수정 필요** -- High 1건 + Medium 3건 수정 후 Round 2 진행

---

### v1-feature-spec Coverage Check

| v1 기능 | 스펙 커버 여부 | 비고 |
|---------|-------------|------|
| CLI 격리 (사람 1명 = CLI 1개) -- Section 23 | O | 직원별 토큰 관리가 이 원칙을 구현 |
| 에이전트 두뇌 (CLI 토큰으로 AI 실행) | O | Section 9에 명시 |
| 도구 시스템 API 키 (KIS, Notion 등) -- Section 3.1 | O | 외부 API 키 CRUD로 커버 |
| 멀티테넌시 (companyId 격리) -- Section 23 | O | selectedCompanyId 기반 쿼리 |
| "API 과금" 표현 금지 | O | "CLI 토큰" 용어 일관 사용 |

v1-feature-spec에 "credentials" 직접 대응 항목은 없지만, CLI 토큰은 v2의 핵심 인프라. 에이전트 실행, 도구 시스템, 멀티테넌시 모두 이 페이지의 토큰/키 등록에 의존.

---

### Fixes Applied

1. **Banana2 프롬프트 수정** -- 항목 #5를 "modal dialogs (not inline)" 으로 변경
2. **토큰 마스킹 데이터 소스 명시** -- Section 6 creds 행에 "서버 maskedToken 필드 있으면 표시, 없으면 라벨만" 추가
3. **직원 미선택 상태 정의** -- Section 4.4에 "직원 미선택 상태" 추가 + `credentials-no-selection` testid 추가
4. **`apikey-provider-badge` testid 추가** -- Section 11에 추가
5. **직원 미선택 placeholder 테스트 추가** -- Test #18 추가
6. **토큰 등록 모달 테스트 추가** -- Test #19 추가 (모달 열림 확인)
