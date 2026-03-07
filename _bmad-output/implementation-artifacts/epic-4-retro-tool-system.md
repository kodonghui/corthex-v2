# Epic 4 회고: Tool System

**날짜:** 2026-03-07
**참여:** Bob (SM), Alice (PO), Winston (Architect), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), ubuntu (Project Lead)

---

## Epic 요약

| 항목 | 수치 |
|------|------|
| 완료 스토리 | 6/6 (100%) |
| 스토리 포인트 | 16 SP |
| 총 테스트 수 | ~475개 (단위+통합+UI) |
| 빌드/타입 실패 | 0건 |
| 리그레션 발생 | 0건 |
| 기술 부채 항목 | 2건 |
| 프로덕션 인시던트 | 0건 |

**스토리별 상세:**

| # | 스토리 | SP | 테스트 | 핵심 성과 |
|---|--------|----|----|-----------|
| 4-1 | ToolPool Registry + Zod Framework | 3 | 51 | ToolPool 클래스, Zod 검증, AgentRunner 통합 |
| 4-2 | Server-Side Allowed Tools Enforcement | 2 | 33 | 이중 권한 레이어 (예방+방어), NFR14 준수 |
| 4-3 | Common Tools 16 Implementation | 3 | 148 | 16개 범용 도구 (CSV, 차트, 날짜, URL 등) |
| 4-4 | Domain Tools 15 Implementation | 3 | 123 | 15개 도메인 도구 (금융, 법률, 기술) |
| 4-5 | Tool Invocation Log System | 3 | 70 | 크리덴셜 마스킹(NFR12), fire-and-forget 로깅 |
| 4-6 | Admin Tool Management UI (A5) | 2 | 50 | 카탈로그 뷰 + 에이전트별 권한 매트릭스 |

---

## 잘 된 점

### 1. 레이어드 빌드 패턴 3연속 성공

Epic 2 -> Epic 3 -> Epic 4로 이어지는 레이어드 빌드 패턴이 완전히 확립되었다. 레지스트리(4-1) -> 권한(4-2) -> 공통 도구(4-3) -> 도메인 도구(4-4) -> 로그(4-5) -> UI(4-6) 순서로 각 스토리가 이전 스토리의 코드를 안정적으로 재사용했다. Epic 3 회고에서 "Epic 4에도 이 패턴 적용 가능"이라고 예측한 것이 정확히 맞았다.

### 2. Epic 3 기술 부채 해소 성공

Epic 3 회고에서 최고 영향도로 지적된 `getToolDefinitions() 스텁`을 Story 4-1에서 실제 ToolPool로 완전히 교체했다. AgentRunner의 `setToolDefinitionProvider()`를 통한 연결이 깨끗하게 이루어졌고, 3-4에서 만든 도구 호출 루프가 이제 실제 48개 도구를 실행한다.

### 3. 이중 권한 레이어 설계 (NFR14)

v1의 패턴을 참고하여 예방 레이어(LLM에게 허용 도구만 전송) + 방어 레이어(실행 시점 재검증)를 모두 구현했다. 프롬프트 인젝션으로 에이전트가 조작되더라도 권한 외 도구가 차단되며, `TOOL_NOT_PERMITTED` 에러로 재시도 루프도 방지한다.

### 4. Anti-Pattern Prevention 문서화 일관 적용

Epic 3 회고에서 효과를 확인한 "하지 말 것" 목록이 Epic 4 모든 스토리에 포함되었다. 특히 4-2의 "ToolPool에 권한 체크 넣지 말 것", 4-3/4-4의 "외부 npm 패키지 불필요", 4-5의 "await 없이 fire-and-forget" 등이 품질 보호에 효과적이었다.

### 5. 48개 도구 구현 -- 제로 외부 의존성

Common 16개 + Domain 15개 도구를 Bun/Node 내장 API만으로 구현했다. 한글 자모 분해(trademark_similarity), 한국어 감성 사전(sentiment_analyzer), CSV 파싱(spreadsheet_tool) 등 복잡한 기능도 외부 패키지 없이 구현하여 의존성 관리 부담을 최소화했다. 유일한 추가 패키지는 4-1의 `zod-to-json-schema`뿐이다.

### 6. 크리덴셜 마스킹 시스템 (NFR12)

도구 호출 로그에서 API 키, 토큰, 비밀번호를 자동 마스킹하는 `credential-masker.ts`를 구현했다. 20+ 민감 필드명 + 인라인 패턴 매칭(sk-, Bearer, Basic, AKIA 등)으로 재귀적 객체 탐색까지 지원한다. 이 유틸리티는 향후 다른 로그 시스템에서도 재사용 가능하다.

---

## 어려웠던 점

### 1. ToolPool vs HandlerRegistry 이중 구조

Story 4-1에서 ToolPool(Zod 기반)을 만들었지만, 기존 HandlerRegistry(간단 함수 레지스트리)가 이미 존재했다. 두 시스템이 병행하면서 도구 등록 경로가 복잡해졌다. 4-3/4-4에서는 HandlerRegistry에 핸들러를 등록하고, ToolPool은 상위 래퍼로 사용하는 구조로 정리했지만, 새로운 개발자에게는 혼란을 줄 수 있다.

### 2. tool_calls 스키마 변경 필요 (4-5)

기존 `tool_calls` 테이블의 `sessionId`와 `toolId`가 NOT NULL FK로 설정되어 있어 오케스트레이션 밖 도구 호출에서 사용 불가했다. nullable로 변경하는 마이그레이션이 필요했고, 이는 Epic 1에서의 스키마 설계 시 사용 시나리오를 충분히 고려하지 못한 결과다.

### 3. 도메인 도구 외부 API 테스트 복잡성 (4-4)

DART API, law.go.kr, KIPRIS, KIS API 등 한국 특화 외부 API에 의존하는 도구들은 실제 API 호출 없이 테스트해야 했다. fetch mock 패턴으로 해결했지만, 실제 API 응답 형식이 변경되면 런타임에서만 발견될 수 있다. API 응답 스냅샷 테스트가 추가로 필요하다.

### 4. Admin UI 전면 리팩토링 범위 (4-6)

기존 tools.tsx가 `agent_tools` 매핑 테이블 기반이었는데, `agents.allowedTools` 배열 기반으로 전환하면서 전면 재작성이 필요했다. 기존 코드와의 호환성 유지보다 깨끗한 재작성이 더 효율적이었지만, 기존 CRUD 기능 일부가 새 UI에서 누락되지 않았는지 확인이 필요하다.

---

## 핵심 교훈

### 1. 레이어드 빌드는 검증된 패턴

3개 에픽(Epic 2, 3, 4) 연속으로 레이어드 빌드 패턴이 성공했다. 하위 레이어부터 상위까지 순서대로 빌드하면 각 스토리가 자연스럽게 이전 코드를 활용하고, 리그레션 없이 기능이 쌓인다. Epic 5(오케스트레이션)에서도 반드시 이 패턴을 유지할 것.

### 2. 기술 부채는 다음 에픽에서 반드시 해소

Epic 3에서 "getToolDefinitions() 스텁"을 기술 부채로 기록하고, Epic 4-1에서 즉시 해소했다. 이 패턴이 효과적이었다. 부채를 기록만 하고 방치하면 누적되므로, 회고에서 식별된 부채는 다음 에픽 첫 스토리에서 우선 해소하는 습관을 유지할 것.

### 3. 이중 안전장치가 보안의 핵심

도구 권한(예방+방어), 크리덴셜 보호(AgentRunner 스크러빙+로그 마스킹) 모두 이중 레이어로 구현했다. 단일 레이어는 우회 가능하지만 이중 레이어는 방어 깊이(defense in depth)를 제공한다. 향후 보안 관련 기능도 이 원칙을 따를 것.

### 4. 중앙 레지스트리 패턴의 확장성

models.yaml(Epic 3) -> ToolPool(Epic 4)으로 이어지는 중앙 레지스트리 패턴이 확립됐다. 하나의 진실 소스(source of truth)에서 여러 소비자가 참조하는 구조가 일관성과 유지보수성을 크게 향상시킨다. Epic 5의 CommandRouter, DelegationEngine도 유사 패턴으로 설계하면 좋겠다.

---

## 이전 회고(Epic 3) 액션 아이템 추적

| # | 액션 아이템 | 상태 | Epic 4에서의 결과 |
|---|------------|------|-------------------|
| 1 | AgentRunner-ToolPool 인터페이스 확정 | 완료 | 4-1에서 `setToolDefinitionProvider()` + `createExecutor()` 연결 완료. 스텁 완전 교체 |
| 2 | JWT blocklist 해결 시점 결정 | 미착수 | Epic 4 범위 아님. Epic 9(Multi-tenancy)에서 해결 예정. 3개 에픽째 미해결 |
| 3 | 프론트엔드 테스트 전략 수립 | 부분 진행 | 4-6에서 Admin UI 38개 단위 테스트 작성. 하지만 체계적 전략 문서는 아직 없음 |
| 4 | Epic 3 코드 정리 (getToolDefinitions 스텁 등) | 완료 | 4-1에서 ToolPool으로 완전 교체. TODO 주석 제거 |

**분석:** 4개 중 2개 완료, 1개 부분 진행, 1개 미착수. JWT blocklist 이슈는 3개 에픽 연속 미해결로, 의식적 수용(accept) 또는 명확한 해결 시점 지정이 필요하다.

---

## 기술 부채

| # | 항목 | 영향도 | 출처 | 해결 시점 |
|---|------|--------|------|-----------|
| 1 | ToolPool vs HandlerRegistry 이중 구조 통합 | 중 | 4-1/4-3 | 도구 추가 시 혼란 가능. Epic 5 시작 전 문서화 또는 통합 권장 |
| 2 | 도메인 도구 외부 API 스냅샷 테스트 부재 | 낮음 | 4-4 | API 응답 형식 변경 시 런타임 실패 가능. 통합 테스트 강화 필요 |
| 3 | JWT blocklist 미해결 (Epic 2부터 계속) | 중 | Epic 2/3/4 | Epic 9에서 해결 또는 의식적 수용 결정 필요 |

---

## Epic 5 준비 사항

**Epic 5: Orchestration Engine & Command Center** (11 stories, 27 SP)

Epic 5는 v2의 핵심 수렴 지점(convergence point)으로, Epic 2(조직), Epic 4(도구)의 결과물을 통합하여 실제 명령 처리 파이프라인을 구축한다.

**주요 스토리:**
1. 5-1: CommandRouter 유형 분류
2. 5-2: 비서실장 자동 분류 -> 부서 라우팅 -> 병렬 위임 -> 종합
3. 5-3: Manager 위임 -> 병렬 Specialist -> 결과 종합
4. 5-4: Manager 종합 + Quality Gate
5. 5-5: All 순차 명령 처리
6. 5-6: DeepWork 자율 다단계
7. 5-7: Command Center UI (채팅 + @멘션 + /슬래시)
8. 5-8: 위임 체인 실시간 WebSocket
9. 5-9: 보고서 뷰 + 피드백
10. 5-10: Preset CRUD + 슬래시 팝업
11. 5-11: 오케스트레이션 통합 테스트

**Epic 4에서 Epic 5로의 의존성:**

1. **ToolPool + 48개 도구** -- Epic 5의 에이전트 실행에서 실제 도구 호출. `toolPool.createExecutor(agent)` 사용
2. **이중 권한 레이어** -- 비서실장/Manager/Specialist/Worker 각 역할의 allowedTools가 다름. 권한 검증 자동 적용
3. **도구 호출 로그** -- 오케스트레이션 중 발생하는 모든 도구 호출이 자동 기록
4. **Admin 도구 관리 UI** -- 관리자가 에이전트별 도구 권한을 설정한 것이 오케스트레이션에 반영

**필수 준비 작업:**

- [x] ToolPool + AgentRunner 통합 완료 (4-1에서 완료)
- [x] 서버 사이드 도구 권한 강제 (4-2에서 완료)
- [x] 48개 도구 구현 + 등록 (4-3, 4-4에서 완료)
- [x] 도구 호출 로깅 (4-5에서 완료)
- [ ] CommandRouter 타입 분류 설계 (5-1 스토리에서)
- [ ] 비서실장 오케스트레이션 흐름 설계 (5-2 스토리에서)
- [ ] Command Center UI 와이어프레임 확인 (UX spec CEO #2 참조)
- [ ] WebSocket 채널 설계 -- 위임 체인 실시간 스트리밍 (기존 EventBus 확장)

**Epic 5에 적용할 패턴 (Epic 4에서 검증됨):**
- 레이어드 빌드: 라우터(5-1) -> 비서실장(5-2) -> Manager(5-3) -> 품질(5-4) -> 순차/DeepWork(5-5,5-6) -> UI(5-7,5-8,5-9,5-10) -> 통합(5-11)
- Anti-Pattern Prevention 목록 필수 포함
- "기존 코드 확장, 재생성 금지" 원칙 유지
- 이중 안전장치 패턴 (오케스트레이션 권한 검증에도 적용)
- 통합 테스트 마지막 스토리(5-11)에서 전체 파이프라인 검증

---

## 액션 아이템

### 프로세스 개선

1. **ToolPool/HandlerRegistry 관계 문서화**
   - 담당: Architect (Winston)
   - 기한: Epic 5 첫 스토리 시작 전
   - 완료 기준: 새 도구 추가 시 어디에 등록해야 하는지 명확한 가이드 작성

2. **프론트엔드 테스트 전략 확정**
   - 담당: QA (Dana) + Senior Dev (Charlie)
   - 기한: Epic 5 UI 스토리(5-7) 시작 전
   - 완료 기준: smoke test vs 컴포넌트 테스트 범위 결정, 테스트 도구 선택

### 기술 부채

1. **JWT blocklist 최종 결정**
   - 담당: PM (John) + Architect (Winston)
   - 우선도: 중
   - 완료 기준: Epic 9에 스토리로 포함하거나, 현 상태를 의식적으로 수용(accept)하는 문서화된 결정

2. **도메인 도구 API 스냅샷 테스트**
   - 담당: QA (Dana)
   - 우선도: 낮음
   - 완료 기준: 주요 외부 API(DART, law.go.kr, KIPRIS) 응답 형식 스냅샷 저장 + 검증 테스트

### 팀 합의

- **레이어드 빌드 패턴을 Epic 5에서도 유지**: 라우터 -> 오케스트레이터 -> UI -> 통합 테스트 순서
- **Anti-Pattern Prevention 목록 필수 포함**: 모든 스토리에 "하지 말 것" 섹션
- **기존 코드 확장 원칙 유지**: ToolPool, AgentRunner, EventBus 등 기존 서비스 확장만 허용
- **이중 안전장치 원칙**: 보안/권한 관련 기능은 반드시 2개 레이어로 구현

---

## Epic 5 준비 태스크

| # | 태스크 | 담당 | 우선도 |
|---|--------|------|--------|
| 1 | CommandRouter 유형 분류 설계 (slash/mention/natural/preset) | Architect | 필수 |
| 2 | 비서실장 오케스트레이션 상태 머신 설계 | Architect | 필수 |
| 3 | WebSocket 위임 체인 채널 프로토콜 설계 | Architect | 필수 |
| 4 | UX spec CEO #2 (Command Center) 최종 확인 | PO | 필수 |
| 5 | ToolPool/HandlerRegistry 관계 문서 | Architect | 권장 |
| 6 | 프론트엔드 테스트 전략 | QA + Dev | 권장 |

---

## 종합 평가

Epic 4는 6개 스토리를 100% 완료하고 475+개 테스트로 검증된 도구 시스템을 구축했다. 제로 리그레션, 제로 프로덕션 인시던트를 달성했으며, Epic 3의 핵심 기술 부채(getToolDefinitions 스텁)를 즉시 해소했다.

특히 주목할 성과:
- **48개 실제 동작하는 도구** (stub/mock이 아닌 진짜 기능)
- **이중 권한 레이어**로 NFR14(서버 사이드 도구 권한 강제) 완전 준수
- **크리덴셜 마스킹**으로 NFR12(로그 내 API 키 노출 금지) 완전 준수
- **fire-and-forget 로깅**으로 도구 실행 성능에 영향 없는 감사 추적

레이어드 빌드 패턴, Anti-Pattern Prevention, 중앙 레지스트리, 이중 안전장치 등 재사용 가능한 개발 원칙이 3개 에픽에 걸쳐 검증되었다. 이 원칙들은 Epic 5(오케스트레이션)의 성공적 구현을 위한 탄탄한 기반이 된다.

다음 에픽(Epic 5: Orchestration Engine & Command Center)은 v2의 핵심 수렴 지점으로, Epic 2(조직) + Epic 4(도구)를 통합하여 실제 명령 처리 파이프라인을 구축한다. Epic 4에서 구축한 ToolPool, 이중 권한 레이어, 도구 호출 로그가 오케스트레이션의 핵심 인프라로 활용된다.

---

*Retrospective facilitated by Bob (Scrum Master)*
*Date: 2026-03-07*
