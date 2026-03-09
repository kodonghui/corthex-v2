# [Party Mode Round 1 -- Collaborative Review] Chat (1:1 Agent Chat)

### Agent Discussion

**John (PM):** "이 스펙에서 '새 메시지 알림 뱃지 (세션 목록)'이라고 써있는데, WHY? 사용자가 1:1 채팅을 하고 있으면 다른 세션에서 새 메시지가 올 수 있나? 에이전트가 먼저 메시지를 보내는 시나리오가 있는지 증거가 없다. 만약 비동기 위임 결과가 나중에 오는 거라면 그걸 명시해야 한다. 또한 section 9에서 'v1-feature-spec.md에 직접 대응하는 항목은 없지만'이라고 하는데, v1의 1번 사령관실과 이 채팅의 관계가 전혀 설명되어 있지 않다. 사령관실의 명령 처리 흐름(비서실장 자동 라우팅, @멘션 등)과 이 1:1 채팅은 어떻게 구분되는 건지 명확히 해야 한다."

**Winston (Architect):** "모바일 breakpoint에서 '~375px'이라고 되어있는데, 이건 '375px 이하'인지 '768px 미만'인지 불분명하다. Tablet은 768px~1439px인데 모바일 상한이 375px이면 376px~767px는 어떤 레이아웃을 적용하는가? 또한 무한 스크롤이 언급되어 있는데, 위로 스크롤 시 이전 메시지 로드의 실패 모드가 정의되어 있지 않다. 네트워크 끊김 시 무한 스크롤 spinner가 영원히 돌 수 있다. timeout이나 에러 핸들링이 필요하다."

**Sally (UX):** "빈 상태가 ChatArea와 SessionPanel 두 곳 모두 언급되어 있는 건 좋다. 하지만 실제 사용자가 처음 /chat에 진입했을 때의 여정이 불명확하다. 세션이 0개일 때 SessionPanel에 'session-empty-state'가 보이고, ChatArea에 'chat-empty-state'가 보인다고 했는데, 그 두 빈 상태가 동시에 보이면 화면이 텅 비어 보인다. 첫 사용자가 뭘 해야 하는지 강력한 CTA가 필요하다. 또한 에이전트 모달에서 부서별 그룹핑이 있다고 했는데, 부서가 20개 이상일 때의 스크롤 처리나 검색 우선순위가 없다."

**Amelia (Dev):** "section 5의 컴포넌트 목록에 ChatArea가 하나의 파일 chat-area.tsx로 되어있는데, 이 안에 메시지 스타일, 헤더, 파일 첨부, 위임 패널이 전부 들어있다. 실제 코드에서 이 파일이 이미 수백 줄일 텐데, UI 개선 범위가 불분명하다. AC-02-03 같은 구체적인 acceptance criteria ID가 없어서 어디까지가 이번 리팩토링 범위인지 테스트가 불가능하다. data-testid 30개 중 chat-message-user와 chat-message-agent는 복수 존재할 텐데 nth-child 전략이 명시되지 않았다."

**Quinn (QA):** "Playwright 테스트 23개 항목 중, 23번 '연결 상태 배너 -- WebSocket 끊김 시'는 어떻게 테스트하는가? 실제 배포 URL 대상이면 WebSocket을 의도적으로 끊을 수 없다. 테스트 불가능한 항목이 포함되어 있다. 또한 17번 '에러 재시도'도 마찬가지로 실제 환경에서 에러를 유발하기 어렵다. 이런 항목들은 테스트 가능 여부를 명시하거나 mock 전략을 정의해야 한다. 22번 타이핑 인디케이터도 timing-sensitive해서 flaky test의 원인이 된다."

**Mary (BA):** "토론 명령어(/토론, /심층토론)가 기존 기능 참고사항에 체크되어 있는데, 이게 v1 사령관실의 핵심 기능이다. 하지만 section 9에서 'v1-feature-spec에 직접 대응하는 항목은 없다'고 쓰여있어 모순이다. v1의 사령관실 명령 처리(자동 라우팅, @멘션, 슬래시 명령어, 프리셋)가 v2에서는 chat 페이지로 이동한 건지, command-center에 남아있는 건지 명확한 매핑이 필요하다. 비즈니스적으로 사용자가 어디서 명령을 내리는지 혼란을 야기한다."

**Bob (SM):** "컴포넌트 5개, data-testid 30개, Playwright 테스트 23개인데, 이게 UXUI 리팩토링 하나의 스토리 범위로 현실적인가? 특히 무한 스크롤, 에이전트 모달 부서 그룹핑+검색, 타이핑 인디케이터, 파일 미리보기 등은 각각 독립적인 작업이다. 스코프가 '스타일 개선'인지 '기능 추가'인지 구분이 모호하다. section 12 끝에 UI 변경 시 건드리면 안 되는 것이 8개나 있는데, 이 제약과 개선 범위 사이의 의존성이 정리되지 않았다."

### Cross-talk

**Mary -> John:** "John, 너가 지적한 v1 사령관실과의 관계 문제에 동의한다. v1-feature-spec 1번(사령관실)의 명령 처리 흐름이 v2에서 Command Center와 Chat 중 어디에 대응하는지가 이 스펙에서 완전히 빠져있다. 사용자가 /토론 명령을 chat에서 쓸 수 있다고 했는데, 그러면 사령관실의 슬래시 명령어 8종 중 일부가 chat에도 있는 건지?"

**Winston -> Quinn:** "Quinn의 테스트 불가능 항목 지적이 정확하다. 23번(WebSocket 끊김)과 17번(에러 재시도)은 Playwright로 실제 배포 URL 대상 테스트할 때 시뮬레이션이 어렵다. 이 항목들을 'network-mock 필요'로 분류하고, 테스트 전략을 별도로 명시해야 한다."

**Amelia -> Bob:** "Bob의 스코프 문제에 한 가지 추가한다. section 4.2에서 '빈 상태: 에이전트 추천 카드로 첫 대화 유도'라고 했는데, 이건 새로운 UX 패턴을 만드는 것이지 기존 스타일 개선이 아니다. '추천 카드'가 어떤 데이터를 기반으로 추천하는 건지도 없다."

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Major | John, Mary | v1 사령관실과 v2 chat 페이지의 관계가 정의되지 않음. 토론 명령어가 chat에도 있다면 command center와의 기능 중복/분리 기준 필요 | section 9에 v1 사령관실과의 기능 매핑 테이블 추가 |
| 2 | Major | Winston | 모바일 breakpoint 376px~767px 구간이 정의되지 않음 | breakpoint를 ~767px (Mobile) / 768px~1439px (Tablet) 으로 수정 |
| 3 | Medium | Quinn | Playwright 테스트 23번(WebSocket), 17번(에러 재시도), 22번(타이핑)은 실제 배포 URL에서 테스트 불가 또는 flaky | 각 항목에 테스트 가능 여부(E2E/Mock필요) 컬럼 추가 |
| 4 | Medium | Sally, Amelia | 빈 상태에서 '에이전트 추천 카드'는 UI-only 범위를 초과하는 새 기능. 추천 로직 없음 | '에이전트 추천 카드' -> '에이전트 선택 유도 CTA 버튼'으로 축소 |
| 5 | Minor | Bob | 스코프가 UI 스타일 개선인지 기능 추가인지 불분명 | section 4에 '이미 구현됨/스타일만 개선' 스코프 정의 추가 |

### Consensus Status
- Major objections: 2
- Minor opinions: 3
- Cross-talk exchanges: 3

### v1-feature-spec Coverage Check
- Features verified: v1 #5 AGORA (토론 결과 카드 재사용), v1 #1 사령관실 (토론 명령어 부분 커버)
- Gaps found: v1 #1 사령관실과 chat 페이지의 기능 분리/매핑이 명시되지 않음 -- 기능 매핑 테이블 추가로 해결

### Fixes Applied
1. section 9: v1 사령관실과의 기능 매핑 테이블 추가 (어떤 기능이 Command Center에 있고 어떤 것이 Chat에도 있는지)
2. section 8: 모바일 breakpoint를 ~767px로 수정 (376px~767px 갭 제거)
3. section 12: Playwright 테스트 테이블에 '테스트 유형' 컬럼 추가 (E2E / Mock필요 구분)
4. section 4.2: '에이전트 추천 카드' -> '에이전트 선택 유도 CTA 버튼'으로 수정 (UI-only 범위 준수)
5. section 4: 스코프 정의 추가 (이미 구현된 기능의 스타일 개선만, 기능 로직 변경 없음)
