# [Party Mode Round 2 -- Adversarial Review] Dashboard (작전현황)

### Round 1 Fix Verification

| Issue # | Status | Verification Detail |
|---------|--------|---------------------|
| 1 | Fixed | v1 일일 한도 -> 월 예산 통합 근거가 section 10에 명시됨 |
| 2 | Fixed | Banana2 프롬프트에 tooltip에 cost + call count 모두 표시 |
| 3 | Fixed | Playwright 테스트에 테스트 유형 컬럼 추가됨 |
| 4 | Fixed | '퀵 액션 상단 이동' -> 'Banana2가 최적 위치 결정' |
| 5 | Fixed | '에이전트를 추가해보세요' -> '관리자에게 등록을 요청하세요' |
| 6 | Fixed | 동적 testid prefix match 전략 명시됨 |

### Adversarial Agent Discussion

**John (PM):** "WHY should the user care about 'integrations' status on a daily dashboard? 연동 상태 카드는 Anthropic/OpenAI/Google의 up/down 상태를 보여주는데, 프로바이더가 down이면 작업 실패 수에 이미 반영될 텐데, 별도 카드의 비즈니스 가치가 의문이다. 하지만 이건 기존 구현된 기능이고 UI-only 범위이므로 현재 스펙에서 변경할 사항은 아니다."

**Winston (Architect):** "This will break under load. section 9 반응형에서 모바일 breakpoint가 ~375px로 되어있다. Chat 스펙에서는 이미 ~767px로 수정됐는데, Dashboard는 여전히 ~375px이다. 376px~767px 사이 디바이스에서 요약 카드 4컬럼 레이아웃이 깨질 수 있다. 또한 WebSocket dashboard 채널이 어떤 데이터를 push하는지 명시가 없어서 Banana2가 실시간 업데이트 인디케이터를 어디에 넣어야 하는지 모른다."

**Sally (UX):** "A real user would get confused by inconsistent period selectors. 사용량 차트의 7/30일 토글과 만족도 차트의 7d/30d/all 선택기가 서로 다른 UI 패턴이면 사용자가 일관성 부족으로 혼란을 느낀다. 두 기간 선택기가 같은 segmented button 패턴이어야 한다. Banana2 프롬프트에 이 일관성을 명시해야 한다."

**Amelia (Dev):** "dashboard-empty testid가 하나인데, Empty 상태가 카드별로 5가지(작업/에이전트/사용량/만족도/퀵 액션)다. Playwright에서 '어떤 empty 상태가 표시되었는지' 구분할 수 없다. 최소한 dashboard-empty-tasks, dashboard-empty-usage 같은 개별 testid가 필요하다. 또한 section 5에서 모든 컴포넌트가 인라인인데, 컴포넌트 분리는 후속 작업이라는 점을 명시해야 한다."

**Quinn (QA):** "What happens when budget API returns 0 or null for budget? 예산이 설정되지 않은 상태에서 프로그레스 바가 division by zero로 뻗을 수 있다. '예산 미설정' Empty 상태가 section 8.3에 없다. 또한 Playwright 테스트 16번 '예산 색상 전환'이 데이터 의존이라 실제 환경에서 항상 skip될 위험이 있다."

**Mary (BA):** "The business case for projected month-end spend doesn't hold without explaining how it's calculated. Banana2 프롬프트에 'projected month-end spend as a dashed marker'가 있는데, 사용자가 이 마커를 보고 '이게 뭐지?'라고 생각할 수 있다. tooltip이나 라벨로 '현재 사용 추세 기반 예상'임을 표시해야 한다."

**Bob (SM):** "section 10에서 '건드리면 안 되는 것'에 getBudgetColor가 있는데, 이 함수의 threshold(0-59%/60-79%/80%+)가 section 7의 색상 정의와 일치하는지 검증이 필요하다. 코드와 스펙 불일치 시 Banana2 디자인과 실제 동작이 다를 수 있다. 또한 'WS 실시간 업데이트 확인' 테스트가 빠져있지만, 이건 WS 로직 자체를 테스트하는 것이라 UI-only 범위 밖이므로 현재 생략이 합리적이다."

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 7 | Major | Winston | 모바일 breakpoint ~375px로 chat 스펙(~767px)과 불일치 | ~767px로 통일 |
| 8 | Medium | Quinn | 예산 미설정(budget=0/null) 시 Empty 상태 미정의 | section 8.3에 예산 미설정 empty 추가 |
| 9 | Medium | Amelia, Quinn | dashboard-empty testid 1개로 5가지 empty 구분 불가 | 카드별 개별 empty testid 추가 |
| 10 | Minor | Sally, Winston | 사용량 토글과 만족도 기간 선택기 UI 패턴 불일치 가능성 | Banana2 프롬프트에 동일 패턴 지시 |
| 11 | Minor | Mary | projected month-end spend 마커에 설명 없음 | tooltip으로 '현재 추세 기반 예상' 명시 |

### Cross-talk

**Winston -> Sally:** "Sally가 지적한 기간 선택기 UI 일관성 문제에 동의한다. 사용량 토글은 usage-toggle이고 만족도는 satisfaction-period인데, 이 둘이 같은 UI 패턴(segmented button)이어야 사용자 학습 비용이 줄어든다. Banana2 프롬프트에서 두 기간 선택기를 동일한 UI 패턴으로 처리하라고 명시해야 한다."

**Quinn -> Amelia:** "Amelia가 지적한 dashboard-empty 단일 testid 문제에 동의한다. Empty 상태가 5가지인데 testid가 1개면, Playwright에서 어떤 empty 상태가 표시되었는지 구분할 수 없다. 최소한 dashboard-empty-tasks, dashboard-empty-usage 같은 개별 testid가 필요하다."

### v1-feature-spec Coverage Check
- Features verified: v1 #9.1 요약 카드 4개, v1 #9.2 AI 사용량 (비용+호출 횟수 tooltip), v1 #9.3 예산 관리 (월 예산 통합 근거 명시), v1 #9.4 퀵 액션 (서버 정렬), v1 #9.5 CEO 만족도
- Gaps found: none -- Round 1에서 추가된 보완으로 모든 v1 기능 커버됨

### UXUI Checklist
- [x] 핵심 동작 3클릭 이내 -- 요약 카드 스캔(0클릭) -> 기간 토글(1클릭) -> 퀵 액션(1클릭)
- [x] 빈/에러/로딩 상태 정의됨 -- 로딩 스켈레톤, 에러+재시도, 6가지 Empty 상태 (작업/에이전트/사용량/만족도/퀵액션/예산)
- [x] data-testid 모든 인터랙션 요소에 할당 -- 23개 testid (기존 19 - dashboard-empty + 5개 개별 empty)
- [x] 기존 기능 전부 커버 -- v1 spec 9번 전체 체크 + 일일 한도 통합 근거
- [x] Banana2 프롬프트 영문+구체적 -- 9개 기능 요소, 기간 선택기 패턴 통일 지시, projected spend tooltip, empty 상태
- [x] 반응형 breakpoint 명시 -- ~767px(Mobile), 768~1439px(Tablet), 1440px+(Desktop)
- [x] UI-only 범위 (기능 로직 변경 없음) -- "건드리면 안 되는 것" 6항목 명시

### Fixes Applied
1. 모바일 breakpoint ~375px -> ~767px로 수정 (chat 스펙과 통일)
2. section 8.3에 예산 미설정 Empty 상태 추가
3. dashboard-empty testid -> 5개 개별 testid로 분리
4. Banana2 프롬프트에 만족도 기간 선택기 = 사용량 토글과 동일 패턴 지시
5. Banana2 프롬프트에 projected month-end spend tooltip 설명 추가
6. Banana2 프롬프트에 예산 미설정 시 placeholder 표시 지시 추가

### Quality Score: 8/10
Justification: Round 1의 6개 이슈가 모두 수정되었고, Round 2에서 발견된 5개 신규 이슈도 스펙에 반영 완료. v1 기능 회귀 없이 모든 기능이 커버되며, 예산 edge case(미설정), Empty 상태 세분화, breakpoint 통일, 기간 선택기 패턴 일관성 등 실질적인 품질 개선. -1점은 WebSocket이 어떤 데이터를 push하는지 명시 없는 점(기존 로직 불변이므로 UI 스펙 범위 밖), -1점은 컴포넌트가 모두 인라인이라 코드 구조가 복잡한 점(후속 리팩토링 필요).

### Final Verdict: PASS
