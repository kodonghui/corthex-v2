# [Party Mode Round 1 -- Collaborative Review] Agents (에이전트 관리)

### Agent Discussion

**John (PM):** "WHY is there no 'unsaved changes' warning for the Soul editor? The Soul is a 16KB+ markdown document -- v1's CIO Soul had MPT, Kelly Criterion, and complex investment principles. If an admin spends 20 minutes editing a Soul and then accidentally clicks the backdrop to close the slide panel, all changes vanish. No warning, no confirmation, no autosave. This is a data loss risk that directly undermines WHY an admin would use this tool. Every serious text editor has this -- VS Code, Google Docs, even WordPress. We need a 'You have unsaved changes' confirmation dialog when closing the panel with dirty state."

**Winston (Architect):** "The component table has exactly one row: 'AgentsPage -- pages/agents.tsx'. This file contains the table, the filter bar, the create form, the detail slide panel with 3 tabs, the Soul editor with preview, the deactivation modal -- all inline. During UXUI refactoring, any CSS change to the Soul editor preview styling could accidentally break the deactivation modal's layout because they share the same scope. The spec should at minimum enumerate the logical sub-components within this file, even if they stay inline. Also, the deactivation modal says 'basic modal, impact info missing' in problems but the fix in Section 4 doesn't specify what impact information should be shown."

**Sally (UX):** "A real admin managing 50+ AI agents would use the search and filter constantly. But Section 3 problem #6 says 'filter bar uses basic select styling' and Section 4 says 'filter bar style unification' -- that's too vague. What does unification mean? Matching the search input's border radius? Using the same dropdown component as the tier selector in the detail panel? Also, when all filters return zero results, there's no defined 'empty search results' state. That's different from the 'empty state' (no agents at all) -- one needs a 'Clear filters' CTA, the other needs a '+ New Agent' CTA."

**Amelia (Dev):** "The detail panel has 3 tabs: info, soul, tools. The Soul tab has 'split view with markdown editor (left) and rendered preview (right).' But Section 3 says the height is only 400px min, which is a problem for long Souls. The fix in Section 4 says 'Soul editor height expanded.' To what? 600px? Full panel height minus header/tabs? Without a concrete value or rule (like `calc(100vh - 200px)`), every developer will interpret it differently. Also, `agents-soul-template-select` testid was missing from the original list."

**Quinn (QA):** "The Playwright tests have 16 items but no test for the 'search results empty' state or the filter reset interaction. If I apply 3 filters simultaneously and get zero results, how does the user recover? Also, there's no test for the unsaved changes scenario -- if Soul editing doesn't have a save confirmation, we can't test it, but if we add one (per John's request), we need a test for it. Test #16 'tier auto-matching' is good but doesn't verify that the model dropdown actually updates -- it just says 'model automatically changes.' Changes to what value?"

**Mary (BA):** "The business case for this page is strong -- v2's core differentiator is dynamic org management. But the spec undersells the 'secretary agent' concept. v1 had a Chief of Staff (비서실장) who orchestrated all commands. If this page lets admins create/edit secretary agents but doesn't visually distinguish them from regular agents, admins might accidentally deactivate the secretary and break the entire command routing. The isSecretary attribute exists in the code (Section 3 problem #11), but the spec only mentions it as a problem without a solution in Section 4."

**Bob (SM):** "The scope note in Section 4 says 'card view option separated as Enhancement.' Good scope control. But Section 8 says mobile layout uses 'card list' -- so cards ARE in scope for mobile but NOT for desktop? That's confusing. Either cards are out of scope entirely (mobile uses a simplified table/list), or cards are the mobile default (which means card component must be built anyway). This ambiguity needs resolution. Also, the Banana2 mobile prompt says 'Agent list as cards instead of table' which contradicts removing cards from scope."

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High | John | Soul 편집 중 패널 닫기 시 미저장 경고 없음. 데이터 유실 위험. | 패널 닫기 시 dirty 상태면 "저장하지 않은 변경" 확인 다이얼로그 표시 |
| 2 | High | Sally, Quinn | 상태별 UI 정의 누락 -- 로딩 skeleton, 에러+재시도, 검색결과 없음 등. | Section 3에 상태별 UI 정의 테이블 추가 |
| 3 | Medium | Winston | 비활성화 모달의 "영향 범위 정보"가 무엇인지 미구체화. | 비활성화 시 해당 에이전트가 연결된 워크플로우/스케줄 수를 표시하는 것을 명시 |
| 4 | Medium | Mary | isSecretary(비서 에이전트) 시각 표시 미정의. 실수로 비활성화 위험. | Section 9 체크리스트에 비서 에이전트 표시 추가. 비서 뱃지 정의. |

### Consensus Status

4개 이슈 모두 즉시 수정 합의. 주요 반대 의견 0개.
- #1: 모든 전문가 동의 (데이터 유실 방지는 필수)
- #2: Sally + Quinn + Amelia 합의 (상태 정의 없으면 테스트 불가)
- #3: Winston + Mary 합의 (비활성화 영향 범위 표시)
- #4: Mary + John 합의 (비서 에이전트 보호 필수)

### Cross-talk

**John -> Mary:** "비서 에이전트 보호 문제에 동감합니다. 시스템 에이전트는 이미 isSystem 보호 로직이 있는데, 비서 에이전트도 비활성화 시 추가 경고가 필요해요. '이 에이전트는 명령 라우팅의 핵심입니다. 비활성화하면 자동 라우팅이 중단됩니다' 같은 경고요."

**Mary -> John:** "맞아요. 비서 뱃지를 보라색으로 시스템 뱃지(앰버)와 구분하면 시각적으로도 명확해지겠죠."

**Quinn -> Sally:** "검색 결과 없음 상태와 빈 목록 상태를 구분해서 정의하면, 테스트에서도 두 시나리오를 명확히 분리할 수 있어요. '필터 초기화' 링크의 testid도 필요하겠네요."

**Sally -> Quinn:** "동의합니다. `agents-search-empty`와 `agents-filter-reset` testid를 추가하면 되겠어요."

### v1-feature-spec Coverage Check

| v1 기능 (Section 2) | 스펙 커버 여부 | 비고 |
|---------------------|--------------|------|
| 에이전트 CRUD (생성/수정/비활성화) | O | Section 9 |
| 3계급 (Manager/Specialist/Worker) + 모델 배정 | O | |
| 부서 배정 | O | |
| Soul(성격) 편집 + 미리보기 | O | |
| Soul 템플릿 불러오기 | O | |
| 시스템 에이전트 보호 (삭제 불가) | O | |
| 도구 허용 목록 확인 | O | |
| 필터 (부서/계급/상태/검색) | O | |
| 비서 에이전트(isSecretary) 표시 | **X -> 수정 완료** | Section 9에 추가 |

### Fixes Applied

1. **Section 3**: 문제점 #12 "미저장 경고 없음" 추가. "상태별 UI 정의" 테이블 신규 추가 (11개 상태: 로딩, 저장, 에러, 빈 목록, 검색 결과 없음, Soul 미저장 경고 등)
2. **Section 3**: 문제점 #7에 "이 에이전트가 어떤 워크플로우/스케줄에 연결되어 있는지 미표시" 구체화
3. **Section 9**: 비서 에이전트(isSecretary) 시각적 구분 체크리스트 항목 추가
4. **Section 11**: `agents-unsaved-dialog`, `agents-search-empty`, `agents-filter-reset` testid 3개 추가
5. **Section 12**: 테스트 #17 미저장 경고, #18 검색 결과 없음, #19 비서 에이전트 뱃지 추가
