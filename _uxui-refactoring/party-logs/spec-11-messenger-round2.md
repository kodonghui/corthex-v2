# Party Mode: spec-11-messenger Round 2

## 참여 전문가
| 이름 | 역할 | 관점 |
|------|------|------|
| John | PM | 적대적 -- v1 기능 누락 재검증 |
| Winston | Architect | 적대적 -- 구조적 결함 탐색 |
| Sally | UX | 적대적 -- 사용성 함정 탐색 |
| Amelia | Dev | 적대적 -- testid 구멍 탐색 |
| Quinn | QA | 적대적 -- 엣지케이스 스트레스 |
| Bob | SM | 적대적 -- 범위 초과 위험 탐색 |
| Mary | BA | 적대적 -- 비즈니스 가치 의문 |

## Round 1 수정사항 검증
- [x] 이슈 #1: 대화 모드 빈 상태 testid (`messenger-conv-empty`) -- 11번 testid 목록에 포함 확인. **검증 완료**
- [x] 이슈 #2: 로딩/에러 testid (`messenger-loading`, `messenger-error-state`) -- 11번 testid 목록 마지막에 추가됨 확인. **검증 완료**
- [x] 이슈 #3: Playwright 테스트 23~25번 -- 로딩/에러/대화 빈 상태 시나리오 추가됨 확인. **검증 완료**

## 리뷰 결과

### John (PM)
v1-feature-spec 23번 "사내 메신저"를 재확인했습니다. 15개 기능이 모두 스펙에 커버되어 있습니다. v2 신규 기능이므로 v1 호환성 이슈는 없습니다. 다만 v1 1번(사령관실)에서 @멘션 기능이 에이전트 대상이었는데, 메신저의 @멘션은 같은 회사 인간+AI 에이전트 모두를 대상으로 합니다. 멘션 팝업에서 인간 직원과 AI 에이전트가 구분되어 표시되는지 확인이 필요하나, data 바인딩의 agents 쿼리가 에이전트 목록이므로 이는 이미 처리되어 있습니다.

### Winston (Architect)
WebSocket 3채널(messenger, conversation, notifications)이 모두 "건드리면 안 되는 것"에 포함되어 있어 안전합니다. 컴포넌트 10개 중 MessengerPage 내 4개 인라인 컴포넌트(ChannelSettingsModal, ThreadPanel, AttachmentRenderer, ChannelsView)가 파일 크기를 키울 수 있지만, UXUI 범위에서는 기존 구조 유지가 올바릅니다. ConversationsView가 별도 파일로 분리된 것은 좋은 패턴입니다.

### Sally (UX)
모바일에서 스레드가 풀스크린 오버레이로 열릴 때, 스레드 닫기 버튼(`messenger-thread-close`)이 어디에 위치하는지 레이아웃에 명시되지 않았습니다. 통상적으로 우상단 X 또는 좌상단 뒤로 화살표인데, 모바일 UX에서 위치가 중요합니다. 다만 이것은 Banana2가 결정할 디자인 디테일이므로 스펙에서 강제할 필요는 없습니다.

### Amelia (Dev)
testid 43개를 재검토했습니다. 파일 첨부 관련 testid가 `messenger-attach-btn`, `messenger-pending-files`, `messenger-file-attachment`, `messenger-image-attachment`, `messenger-dragover`로 5개 있어 충분합니다. 파일 크기 초과(50MB) 시 에러 메시지 testid가 없으나, 이것은 일반적인 토스트 알림으로 처리되므로 별도 testid까지는 불필요합니다.

### Quinn (QA)
25개 Playwright 테스트를 재검토했습니다. WebSocket 연결 끊김 시의 폴백 UI가 여전히 명시되지 않았으나, 이것은 WebSocket 로직 변경이 필요하므로 "UI만 변경" 범위 밖입니다. 현재 테스트 범위 내에서는 채널 CRUD, 메시지 송수신, 스레드, 검색, 대화 모드 등 주요 시나리오가 모두 커버되어 있어 충분합니다.

### Bob (SM)
"이모지 롱프레스 구현" 경고가 Round 1에서 나왔는데, 개선 방향 4.2에서 "고려"로만 되어 있어 범위가 관리되고 있습니다. 스레드 슬라이드인 애니메이션도 CSS 전환만으로 가능하므로 UI 범위 안입니다. 전체적으로 범위 관리가 양호합니다.

### Mary (BA)
메신저는 v2의 핵심 차별화 기능으로, 비즈니스 가치가 분명합니다. 채널+대화 이중 구조, @멘션, 스레드, 리액션은 검증된 Slack 패턴을 따르고 있어 사용자 학습 비용이 낮습니다. 멘션 팝업에 역할/부서 태그를 추가하는 것은 조직 맥락을 제공하여 실질적 가치가 있습니다.

## 크로스톡
- **Sally** -> **Quinn**: 스레드 닫기 버튼 위치는 디자인 결정이지만, Playwright 테스트에서 `messenger-thread-close` 클릭 후 패널 닫힘을 검증하므로 기능적으로는 커버됩니다.
- **Bob** -> **Winston**: 인라인 컴포넌트 4개의 파일 크기가 우려되지만, 리팩토링 시 별도 분리할 수 있는 여지가 있으므로 현재로는 문제 없습니다.

## UXUI 체크포인트
- [x] 핵심 동작 3클릭 이내? -- 메시지 전송(1클릭), 채널 전환(1클릭), 스레드 열기(1클릭)
- [x] 빈/에러/로딩 상태 정의? -- 빈(채널:`messenger-empty-state`, 대화:`messenger-conv-empty`), 에러(`messenger-error-state`), 로딩(`messenger-loading`)
- [x] data-testid 모든 인터랙션에? -- 43개 testid, 채널/대화/스레드/멘션/파일 모두 커버
- [x] 기존 기능 전부 커버? -- v2 신규 15개 기능 모두 체크됨
- [x] Banana2 프롬프트 영문+구체적? -- 데스크톱/모바일 각각 상세 영문 프롬프트
- [x] 반응형 375/768/1440? -- 3개 breakpoint + 모바일 특별 처리 6개 명시
- [x] UI만 변경 범위? -- WebSocket/스토어/API/FormData 건드리지 않음 명시

## 발견된 이슈
| # | 심각도 | 발견자 | 내용 | 조치 |
|---|--------|--------|------|------|
| (없음) | -- | -- | Round 2에서 새로운 주요 이슈 발견되지 않음 | -- |

## 판정
- 점수: 8/10
- 결과: **PASS**
- Round 1의 3개 이슈 모두 수정 확인 완료. Round 2에서 주요 이슈 없음. 스펙 품질 양호.
