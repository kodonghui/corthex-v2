## [Party Mode Round 2 -- Adversarial Review] UX Step-02 Discovery

### R1 Fix Verification

| R1 Issue | Fix Applied | Genuine? | Verdict |
|----------|------------|----------|---------|
| Navigation Model missing | Added 73-line Navigation Model section (lines 289-361) with Phase strategy, sidebars, transition flows, screen paths | Yes -- concrete sidebar trees, phase table, AGORA flow, Soul access clarification | PASS |
| Admin<->CEO transition | Included within Navigation Model (lines 341-345) with JWT shared session, header badge | Yes -- actionable spec | PASS |
| Competitive UX thin | Added "차용할 UX 패턴" column to all 6 rows | Yes -- specific patterns cited (Artifacts, template cards, etc.) | PASS |
| Soul editing access | Clarified in Navigation Model (lines 363-366): admin primary, CEO read-only, RBAC note | Yes -- explicit v1->v2 migration reasoning | PASS |
| Cascade wizard reference | Referenced in Onboarding Friction Points context + Core Task Analysis "비정기 태스크" table | Partial -- 4 steps still not enumerated anywhere | MINOR GAP |

### Agent Discussion (Adversarial Lens)

**John (PM) -- "이 문서로 개발팀에 핸드오프할 수 있는가?":**
이 Discovery 문서의 Persona UX Priority Matrix(lines 154-178)는 23행으로 포괄적이지만 **Phase 배정 근거가 없다**. 왜 AGORA는 Phase 2이고 품질 게이트는 P0인가? PRD의 MoSCoW 분류와 매핑되어야 하는데, 문서 내에 PRD 참조가 없다. 또한 Core Task Analysis에서 "최빈도 태스크" 순위 1~5를 매겼는데 **순위의 근거(사용 빈도 데이터나 추정치)가 없다**. 이건 저자의 직관일 뿐이다.

**Sally (UX Designer) -- "이 디자인이 사용자를 실패하게 할 수 있는가?":**
Navigation Model의 Phase 1 전략에서 "4개 메뉴만" 노출한다고 했는데, 관리자 콘솔은 Phase 1에서도 **8개 화면 전부** 노출된다(lines 324-338). 이건 DP4(점진적 복잡성) 원칙과 모순된다. 관리자 콘솔도 Phase별 점진적 노출이 필요하지 않은가? 또한 Screen Inventory에서 CEO 앱 14개 화면(lines 182-199)과 사이드바 구조(lines 299-321)의 화면 수가 일치하지 않는다 -- 사이드바에 "자동화" 화면이 있지만 Screen Inventory에는 별도 행이 없고 "사령관실 내 서브뷰 또는 별도 화면"(line 216)으로만 언급된다.

**Winston (Architect) -- "이 스펙으로 시스템을 설계할 수 있는가?":**
Screen Inventory에서 데이터 갱신 패턴을 정의했는데, **WebSocket 채널 매핑이 부정확하다**. Architecture에서 7개 채널(command, delegation, agent-status, tool, cost, debate, nexus)을 정의했는데, 통신로그(#7)에 "WS: delegation, tool"이라고 쓴 건 맞지만, 작전현황(#1)에 "WS: cost, agent-status"라고 쓰면서 command 채널이 빠져있다. 작전현황의 퀵 액션에서 명령을 보내면 command 채널도 필요하다. 또한 AGORA(#5)에 "실시간(SSE)"라고 썼는데 Architecture에서는 debate 채널을 WebSocket으로 정의했다. SSE vs WS 불일치.

**Amelia (Dev) -- "이걸 실제로 구현할 수 있는가?":**
v1 22개 기능 UX 패턴 매핑 테이블(lines 264-287)에서 모든 기능에 UI 패턴을 지정했지만, **v1 #22(CEO 아이디어 7개)에 대한 UX 패턴이 매핑에 없다**. v1-feature-spec의 #22는 "CEO의 핵심 아이디어"로 7개 아이디어가 있다. 이 중 #007(처장=5번째 분석가)와 #010(비서실장=편집장)은 오케스트레이션 내부 로직이라 UI 패턴이 불필요할 수 있지만, #001(분석자/실행자 분리)과 #009(NEXUS 스케치바이브)는 UX에 직접 영향이 있다. 매핑 테이블이 "22개 기능"이라고 주장하면서 실제로는 21행만 있다(#22 누락).

**Quinn (QA) -- "이 문서의 주장을 검증할 수 있는가?":**
Design Opportunities 12개(lines 234-261)가 나열되었지만 **Design Challenges 7개(lines 218-232)와의 매핑이 없다**. Challenge #1(복잡한 조직 관리)의 해결이 Opportunity #7(드래그 앤 드롭)이라면 명시해야 한다. 또한 Onboarding Friction Points 7개(lines 370-378)도 Design Opportunities와 1:1로 연결되지 않는다. Discovery 단계에서 도전과 기회의 관계를 밝혀야 후속 스텝에서 우선순위를 매길 수 있다.

**Mary (BA) -- "비즈니스 요구사항이 빠짐없이 반영되었는가?":**
PRD에서 6개 User Journey를 정의했는데, Core Task Analysis(lines 118-148)가 이 6개 Journey를 직접 참조하지 않는다. 특히 Journey 4(김대표 위기 대응 -- ARGOS 트리거 -> cascade)의 UX 흐름이 "비정기 태스크" 한 줄(line 148)로만 언급된다. 위기 대응은 시간이 critical하므로 별도의 UX 고려가 필요하다.

**Bob (SM) -- "이 문서가 다음 스텝에 충분한 입력을 제공하는가?":**
다음 스텝(step-03 Information Architecture, step-04 Interaction Patterns)에 필요한 입력이 무엇인지 생각하면, **Screen Inventory가 "화면 목록"만 있고 "화면별 정보 요소(Information Elements)" 목록이 없다**. 각 화면에 어떤 데이터 필드/위젯이 들어가는지의 1차 목록이 Discovery에서 나와야 IA 스텝에서 정보 구조를 설계할 수 있다.

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | Major | Winston | AGORA 데이터 갱신이 "SSE"로 표기되었으나 Architecture에서는 debate WebSocket 채널로 정의. SSE vs WS 불일치 | Screen Inventory와 v1 매핑 테이블에서 AGORA를 "실시간(WS: debate)"로 수정 |
| 2 | Minor | Sally | 관리자 콘솔은 Phase별 점진적 노출 전략이 없음. CEO 앱만 Phase별 사이드바 전략 있음 | Navigation Model에 관리자 콘솔 Phase별 전략 추가 (Phase 1: 핵심 4-5개, Phase 2: 전체) |
| 3 | Minor | Sally | Screen Inventory 14개 화면과 사이드바 메뉴 불일치 -- "자동화" 화면이 별도 행 없음 | Screen Inventory에 자동화(#14) 화면 행을 명확히 분리하거나 사령관실 서브뷰로 확정 |
| 4 | Minor | John | Persona UX Priority Matrix의 Phase 배정에 PRD MoSCoW 참조 없음 | Phase 배정 근거를 PRD FR 우선순위와 연결하는 각주 추가 |
| 5 | Minor | Quinn | Design Challenges 7개와 Design Opportunities 12개의 매핑 관계 없음 | Opportunities에 "(Challenge #N 해결)" 태그 추가 |
| 6 | Minor | Amelia | v1 매핑 테이블이 "22개"라 했지만 #22(CEO 아이디어)가 누락되어 실제 21행 | #22는 구현 원칙이므로 매핑 불필요한 이유를 각주로 명시하거나 별도 행 추가 |

### Cross-Step Consistency Check
- Navigation Model <-> Screen Inventory: 대체로 일치하나 자동화 화면 분류 미확정 (Issue #3)
- Design Principles <-> 관리자 콘솔: DP4(점진적 복잡성)가 CEO 앱에만 적용, 관리자 콘솔 미적용 (Issue #2)
- v1-feature-spec 22개 커버리지: 21/22 매핑 (Issue #6), 실질 커버리지는 22/22 (CEO 아이디어는 UI가 아닌 구현 원칙)

### v1-Feature-Spec Coverage Check
- #1~#21: 모두 Screen Inventory 또는 v1 매핑 테이블에 존재
- #22(CEO 아이디어): 7개 아이디어 중 UX 관련(#001 분석자/실행자 분리, #009 SketchVibe)은 각각 전략실, SketchVibe 화면에 반영됨. 나머지는 백엔드 로직. 테이블에 행 없음
- SSE vs WS 불일치는 기술 정확성 문제 (Issue #1)

### Consensus Status
- Major objections: 1 (SSE vs WS 불일치) / Minor opinions: 5 / Cross-talk exchanges: 3
- Primary consensus: SSE vs WS 불일치 수정 필수. 나머지는 명확화 수준의 개선

### Fixes Applied
1. AGORA 데이터 갱신을 SSE -> WS: debate로 수정 (Screen Inventory + v1 매핑 테이블)
2. 관리자 콘솔 Phase별 전략 추가 (Navigation Model)
3. 자동화 화면을 사령관실 서브뷰로 확정하는 명시적 노트 추가
4. Design Opportunities에 Challenge 연결 태그 추가
5. v1 매핑 테이블에 #22 각주 추가
