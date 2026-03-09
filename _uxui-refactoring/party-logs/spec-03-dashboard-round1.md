# [Party Mode Round 1 -- Collaborative Review] Dashboard (작전현황)

### Agent Discussion

**John (PM):** "Section 1에서 '아침에 접속해서 오늘 AI가 처리한 작업 수, 비용, 에이전트 상태 확인'이라고 했는데, WHY is this the first page the CEO sees? 이 페이지가 로그인 후 랜딩 페이지인지, 별도로 /dashboard로 이동해야 하는 건지 명시가 없다. 또한 v1-feature-spec #9에서 '일일 한도 / 월 한도'가 있는데, 스펙에는 '월 예산 진행률'만 있고 일일 한도 표시가 없다. v1에서 되던 게 v2에서 빠진 건지 확인이 필요하다."

**Winston (Architect):** "section 6에서 API 엔드포인트가 5개인데, 페이지 로드 시 5개 API를 동시에 호출하면 waterfall이 발생한다. 또한 WebSocket으로 실시간 업데이트를 한다고 했는데, 어떤 데이터가 WebSocket으로 오고 어떤 데이터가 polling인지 구분이 없다. 5개 API 전부 WebSocket으로 실시간 갱신되는 건지? 이 구분이 없으면 프론트엔드 캐시 무효화 전략을 세울 수 없다."

**Sally (UX):** "section 3에서 '퀵 액션 노출도 -- 페이지 하단에 위치해 스크롤 필요'를 문제로 지적하고, section 4.2에서 '퀵 액션 상단 이동'을 개선 방향으로 제시했다. 하지만 퀵 액션을 상단으로 올리면 차트/예산 영역이 아래로 밀려서, CEO가 가장 먼저 봐야 하는 '비용/예산 상태'를 확인하려면 오히려 스크롤해야 한다. Banana2에게 최적 배치를 맡기겠다면 '퀵 액션 상단 이동'이라는 구체적인 지시를 제거해야 한다."

**Amelia (Dev):** "section 5에서 모든 컴포넌트가 pages/dashboard.tsx (인라인)이라고 되어있다. dashboard.tsx 하나에 SummaryCards, UsageChart, BudgetBar, SatisfactionChart, QuickActionsPanel, DashboardSkeleton이 전부 인라인으로 들어있다는 뜻인데, 이 파일이 이미 수백 줄일 것이다. 또한 data-testid에 quick-action-btn-{id}라는 동적 testid가 있는데, Playwright에서 이걸 어떻게 select하는지 전략이 없다."

**Quinn (QA):** "Playwright 테스트 14개 항목 중, 12번 '에러 상태 -- API 실패 시뮬레이션'은 실제 배포 URL에서 어떻게 테스트하는가? chat 스펙에는 테스트 유형 컬럼이 추가됐는데, dashboard 스펙에는 이 컬럼이 없다. 또한 11번 '로딩 스켈레톤'도 네트워크 속도가 빠르면 스켈레톤이 순식간에 사라져서 테스트가 flaky할 수 있다."

**Mary (BA):** "v1-feature-spec #9.2에서 'AI 사용량 -- 프로바이더별 호출 횟수'라고 되어있는데, 현재 스펙의 사용량 차트는 '일별 비용(spend)'을 보여준다. 호출 횟수와 비용은 다른 지표인데, v1에서 호출 횟수를 보여줬다면 v2에서도 호출 횟수를 보여야 하는 게 아닌가? 또한 v1 #9.3에서 '일일 한도'가 있었는데 현재 스펙에는 월 예산만 있다."

**Bob (SM):** "section 8에 상태별 UI 정의가 잘 되어있는 건 좋지만, Empty 상태에서 '에이전트 0명: AI 에이전트를 추가해보세요'라고 안내한다고 했다. 이건 관리자 콘솔(admin)에서 에이전트를 추가하는 건데, 일반 사용자(app)에게 '추가해보세요'라고 안내하는 건 잘못된 유도다. app 사용자는 에이전트를 추가할 권한이 없을 수 있다."

### Cross-talk

**Mary -> John:** "John, 일일 한도와 호출 횟수 문제는 v1 기능 회귀에 해당한다. v1-feature-spec이 '최우선 참조'인데, 이 스펙이 v1의 일일 한도를 빼먹은 건 심각한 누락이다. Banana2 프롬프트에도 '일일 한도' 관련 UI가 전혀 없다."

**Quinn -> Amelia:** "Amelia가 지적한 quick-action-btn-{id} 동적 testid 문제에 동의한다. Playwright에서 [data-testid^='quick-action-btn-']로 prefix match를 쓸 수 있지만, 이런 전략이 스펙에 명시되어 있지 않으면 테스트 작성자가 혼란스러울 것이다."

**Sally -> Bob:** "Bob이 지적한 '에이전트 추가해보세요' 안내 문제에 동의한다. app 사용자에게 admin 액션을 유도하는 건 UX 안티패턴이다. '관리자에게 에이전트 등록을 요청하세요' 같은 안내가 더 적절하다."

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Major | Mary, John | v1의 일일 예산 한도가 스펙에서 누락됨. v1 #9.3에 '일일 한도'가 있었으나 현재 월 예산만 표시 | 월 예산으로 통합된 근거 명시, 일일 비용은 요약 카드에서 표시 |
| 2 | Medium | Mary | v1의 사용량 차트가 '호출 횟수'인데 v2에서 '비용(spend)'으로 변경됨 | tooltip에 호출 횟수도 함께 표시하도록 Banana2 프롬프트 수정 |
| 3 | Medium | Quinn | Playwright 테스트에 테스트 유형(E2E/Mock필요) 컬럼 없음 | chat 스펙과 동일하게 테스트 유형 컬럼 추가 |
| 4 | Medium | Sally | '퀵 액션 상단 이동'이 Banana2 재량과 모순 | 레이아웃 지시를 제거하고 Banana2에게 최적 배치 위임 |
| 5 | Minor | Bob, Sally | Empty 상태에서 '에이전트를 추가해보세요'는 app 사용자에게 잘못된 유도 | '관리자에게 문의하세요' 등으로 변경 |
| 6 | Minor | Amelia | quick-action-btn-{id} 동적 testid의 Playwright select 전략 미명시 | prefix match 전략 명시 |

### Consensus Status
- Major objections: 1
- Minor opinions: 5
- Cross-talk exchanges: 3

### v1-feature-spec Coverage Check
- Features verified: v1 #9.1 요약 카드 (4개), v1 #9.4 퀵 액션, v1 #9.5 CEO 만족도
- Gaps found: v1 #9.3 일일 예산 한도 누락 (월 예산으로 통합 근거 추가), v1 #9.2 호출 횟수 지표 불명확 (tooltip 표시로 보완)

### Fixes Applied
1. section 10: '퀵 액션 상단 이동' -> 'Banana2가 최적 위치 결정' 으로 수정
2. section 8.3: '에이전트를 추가해보세요' -> '관리자에게 AI 에이전트 등록을 요청하세요' 수정
3. section 10: v1 일일 한도가 월 예산으로 통합된 근거 명시
4. section 13: Playwright 테스트에 테스트 유형 컬럼 추가, 퀵 액션을 네비게이션/프리셋으로 분리, 예산 색상 전환 테스트 추가 (14개 -> 16개)
5. section 13: 동적 testid prefix match 전략 안내 추가
6. Banana2 프롬프트: 사용량 차트 tooltip에 호출 횟수도 표시하도록 수정
