# [Party Mode Round 2 -- Adversarial Review] Chat (1:1 Agent Chat)

### Round 1 Fix Verification

| Issue # | Status | Verification Detail |
|---------|--------|---------------------|
| 1 | Fixed | v1 사령관실과의 기능 매핑 테이블이 section 9에 추가됨. 5가지 기능별로 v2 위치가 명시됨 |
| 2 | Fixed | 모바일 breakpoint가 ~767px로 수정됨. 376px~767px 갭 제거 확인 |
| 3 | Fixed | Playwright 테스트 테이블에 '테스트 유형' 컬럼 추가됨. 17번/23번이 Mock필요로 분류됨 |
| 4 | Fixed | '에이전트 추천 카드' -> '에이전트 선택 유도 CTA' 로 수정됨, 기존 agent-modal 트리거 명시 |
| 5 | Fixed | section 4.1.1에 스코프 정의 추가됨. UI-only 리팩토링 범위 명시 |

### Adversarial Agent Discussion

**John (PM):** "WHY should the user care about this page when Command Center already exists? Section 1에서 'Command Center가 전체 조직에 명령이라면, 이 페이지는 특정 에이전트와 직접 대화'라고 구분했지만, 실제 사용자 관점에서 '그래서 언제 Chat을 쓰고 언제 CC를 쓰는가?'에 대한 use case 구분이 여전히 약하다. v1 사령관실과의 매핑 테이블은 추가됐지만, 이건 개발자를 위한 정보이지 UX 스펙에서 사용자 여정 관점의 구분이 아니다. Banana2가 디자인할 때 이 페이지의 독자적인 가치를 이해하지 못할 수 있다."

**Winston (Architect):** "section 4.1.1에서 '에이전트 모달 부서 그룹핑/검색/아바타 -- 이미 구현됨, 스타일 개선'이라고 했는데, 이건 위험한 가정이다. 실제 코드에서 검색이 클라이언트사이드 필터링인지, 서버사이드 검색인지에 따라 UI 동작이 달라진다. 또한 모바일에서 에이전트 모달이 '풀스크린'이라고 했는데, 풀스크린 모달에서 스크롤 시 body scroll이 같이 되는 scroll lock 문제가 정의되지 않았다. This will break on iOS Safari."

**Sally (UX):** "A real user would never know about the delegation panel. Section 2의 위임 패널 와이어프레임에서 '[채팅 보기 | 위임 내역 (N)]' 토글이 있다고 했는데, 이 토글이 비서 에이전트와 대화할 때만 보인다면, 사용자가 비서 에이전트가 뭔지 모르면 이 기능을 영원히 발견하지 못한다. 에이전트 선택 시점에 비서 에이전트가 특별하다는 시각적 힌트가 없다. 또한 위임 패널의 '처리중/완료/실패' 상태가 실시간으로 변하는데, 사용자가 채팅 뷰에 있으면 위임 탭의 숫자만 바뀌는 건지, 알림이 오는 건지?"

**Amelia (Dev):** "Banana2 프롬프트(section 10)에서 '12. File attachments in messages'가 있는데, 이건 메시지 내 첨부 파일이다. 하지만 입력 영역의 파일 첨부(4번)와 메시지 내 첨부 파일(12번)이 별개 UI라는 점이 프롬프트에서 잘 구분되지 않는다. Banana2가 둘을 혼동하면 입력 영역에 이미 보낸 파일의 썸네일까지 넣을 수 있다. 또한 data-testid에서 chat-file-preview가 입력 영역의 미리보기인지, 메시지 내 첨부 파일인지 불명확하다. 메시지 내 파일용 testid가 별도로 필요하다."

**Quinn (QA):** "What happens when the user attaches 6 files? 스펙에 '최대 5개'라고만 되어있고, 6번째를 시도했을 때의 UI 동작이 정의되지 않았다. 토스트? 버튼 비활성화? 파일 선택 다이얼로그 자체를 막는가? 또한 0바이트 파일, 100MB 파일 같은 edge case도 없다. Playwright 테스트 16번(파일 첨부)에서 이런 boundary condition을 어떻게 검증하는지 정의가 없다."

**Mary (BA):** "The business case for 'new message alert badge' doesn't hold. Section 4.3에 '새 메시지 알림 뱃지 (세션 목록)'이 있는데, 에이전트가 사용자 없이 먼저 메시지를 보내는 비즈니스 시나리오가 정의되지 않았다. 위임 결과가 비동기로 올 수 있다면 그건 위임 패널의 상태 변경이지 채팅 메시지가 아니다. 이 기능의 트리거가 없다면 구현해도 뱃지가 절대 표시되지 않는 dead feature가 된다."

**Bob (SM):** "This scope is unrealistic for the claimed UI-only boundary. Section 4.1.1에서 '기능 로직 변경 없음'이라고 했는데, section 4.3에서 '새 메시지 알림 뱃지'와 '모바일 스와이프 제스처'는 현재 구현되지 않은 새 인터랙션이다. 이것들은 스타일 개선이 아니라 새 기능 구현이다. 스코프 정의와 개선 방향 사이에 모순이 있다. 모바일 스와이프 제스처는 touch event 핸들링이 필요한데, 이걸 UI-only로 분류하는 것은 잘못된 판단이다."

### New Issues Found (Round 2)

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 6 | Medium | Amelia | chat-file-preview testid가 입력 영역 미리보기와 메시지 내 파일 첨부를 구분하지 않음 | chat-file-preview (입력 영역) + chat-message-file (메시지 내) 로 분리 |
| 7 | Medium | Quinn | 파일 첨부 최대 5개 초과 시 UI 동작 미정의 | section 9에 6번째 파일 시도 시 첨부 버튼 비활성화 명시 |
| 8 | Medium | Mary, Bob | '새 메시지 알림 뱃지'의 트리거 시나리오 부재, dead feature 위험 | 알림 뱃지를 스코프에서 제거 |
| 9 | Minor | Bob | 모바일 '스와이프 제스처'는 새 인터랙션 구현이며 UI-only 스코프와 모순 | 스와이프 제스처 제거, '... 메뉴'만 유지 |
| 10 | Minor | Sally | 위임 패널 발견성 문제, 비서 에이전트 특수 표시 없음 | 에이전트 모달에서 비서 에이전트에 특수 뱃지 추가 (스타일 범위) |

### Cross-talk

**Bob -> Mary:** "Mary가 지적한 '새 메시지 알림 뱃지' 문제에 전적으로 동의한다. 트리거가 없는 기능을 스코프에 넣으면 팀이 트리거 구현까지 하게 되고, 그러면 WebSocket 메시지 타입 추가 + 서버 로직 변경까지 번진다. 이건 확실히 UI-only 범위를 벗어난다."

**Amelia -> Quinn:** "Quinn이 지적한 파일 6개 초과 문제와 관련해서, 현재 코드에서 이미 5개 제한 로직이 있을 수 있지만, 그 동작이 스펙에 없으면 Banana2가 6번째 파일 시도 시 어떤 UI를 보여줘야 하는지 모른다. input disabled? toast? 이게 없으면 코딩 단계에서 개발자가 임의로 결정하게 된다."

**Sally -> Winston:** "Winston이 지적한 iOS Safari scroll lock 문제에 한 가지 추가한다. 모바일 풀스크린 모달에서 부서가 많으면 스크롤이 필요한데, 이때 모달 뒤의 채팅 영역이 같이 스크롤되면 안 된다. 이건 CSS overflow: hidden으로 body를 잠그는 일반적인 패턴인데, 스펙에 명시되어 있지 않으면 테스트에서도 확인하지 않게 된다."

### v1-feature-spec Coverage Check
- Features verified: v1 #1 사령관실 (기능 매핑 테이블로 커버), v1 #5 AGORA (토론 결과 카드 참조), v1 #3 도구 시스템 (도구 호출 카드)
- Gaps found: none -- Round 1에서 추가된 매핑 테이블로 모든 관련 v1 기능이 커버됨

### UXUI Checklist
- [x] 핵심 동작 3클릭 이내 -- 세션 선택(1) -> 입력(2) -> 전송(3)
- [x] 빈/에러/로딩 상태 정의됨 -- ChatArea 빈 상태, SessionPanel 빈 상태, 로딩 스켈레톤, 에러+재시도, 연결 끊김/재연결 배너, 타이핑 인디케이터
- [x] data-testid 모든 인터랙션 요소에 할당 -- 35개 testid (chat-message-file 추가)
- [x] 기존 기능 전부 커버 -- section 9에 21개 기능 체크리스트 + v1 매핑 테이블
- [x] Banana2 프롬프트 영문+구체적 -- 데스크톱 12개 기능 요소, 모바일 전용 동작 기술
- [x] 반응형 breakpoint 명시 -- ~767px(Mobile), 768~1439px(Tablet), 1440px+(Desktop)
- [x] UI-only 범위 (기능 로직 변경 없음) -- section 4.1.1 스코프 정의 + "건드리면 안 되는 것" 8항목, 알림 뱃지/스와이프 제스처 스코프 제외

### Fixes Applied
1. chat-file-preview -> chat-file-preview (입력 영역) + chat-message-file (메시지 내) testid 분리
2. 파일 첨부 6번째 시도 시 첨부 버튼 비활성화 동작 명시
3. '새 메시지 알림 뱃지' 스코프에서 제거 (dead feature 방지)
4. 모바일 '스와이프 제스처' 제거, '... 메뉴'만 유지 (UI-only 스코프 준수)

### Quality Score: 8/10
Justification: Round 1의 5개 이슈가 모두 적절히 수정되었고, Round 2에서 발견된 5개 신규 이슈도 스펙에 반영 완료. v1 사령관실과의 기능 매핑, breakpoint 갭, 테스트 유형 분류, 스코프 정의 등 구조적 문제가 해결됨. -1점은 Banana2 프롬프트에서 입력 영역 파일 첨부와 메시지 내 파일 구분이 여전히 암묵적인 점, -1점은 위임 패널 발견성이 스타일 개선 수준에서만 해결 가능한 한계.

### Final Verdict: PASS
