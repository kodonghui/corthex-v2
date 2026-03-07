# Party Mode Log: Architecture - Step 04 Decisions - Round 1
- Date: 2026-03-07
- Document: _bmad-output/planning-artifacts/architecture.md (Core Architectural Decisions)
- Reviewers: 7-expert panel

## Expert Debate

### John (PM)
10개 결정이 PRD 76 FRs를 아키텍처적으로 완전 커버:
- Decision 1(오케스트레이션) -> FR13-25 (사령관실+오케스트레이션 13개)
- Decision 2(에이전트) -> FR2,11,30,31 (에이전트 정의+Soul+모델)
- Decision 3(LLM Router) -> FR32-34 (멀티프로바이더+Batch+fallback)
- Decision 4(도구) -> FR26-29 (도구 시스템 4개)
- Decision 5(동적 조직) -> FR1-12 (조직 관리 12개)
- Decision 6(품질 게이트) -> FR50-55 (품질 6개)
- Decision 7(비용 추적) -> FR35-41 (모니터링 7개)
- Decision 8(실시간) -> FR17 (위임 체인 실시간)
- Decision 9(테넌트 격리) -> FR42-49 (보안 8개)
- Decision 10(데이터) -> 전체 DB 기반
- Deferred 11-14 -> FR56-76 (Phase 2/3)
CEO 아이디어 반영: #007(5번째 분석가) Decision 1+2에 명시, #010(편집장) Decision 1에 명시. 반대 없음.

### Winston (Architect)
아키텍처 설계 품질 우수:
- Strategy 패턴(LLM Router)이 프로바이더 추가에 OCP 준수
- Agent=설정(DB) + AgentRunner(무상태)가 관심사 분리 + 수평 확장 가능
- ToolPool 레지스트리가 도구 등록을 런타임 확장 가능하게 함
- 이벤트 기반 파이프라인이 단계별 비동기 실행 + WebSocket 푸시 자연스러움
- 구현 순서 10단계가 의존성 그래프와 정확히 일치
- Cross-Component Dependencies 테이블이 순환 의존 없이 DAG 구조
- Deferred Decisions 4개가 Post-MVP에 적절히 지연됨 (벡터DB, 마켓플레이스 등)
반대 없음.

### Sally (UX)
사용자 체감에 직결되는 아키텍처 결정 확인:
- Decision 1: WebSocket 단계별 상태 이벤트 -> 위임 체인 실시간 표시(FR17)
- Decision 5: cascade 분석 표시(FR6) + wait/force 선택(FR7) -> CEO 안전한 조직 변경
- Decision 8: 7채널 멀티플렉싱으로 에이전트/위임/비용/도구 상태 각각 실시간 반영
- Decision 3: fallback이 사용자 모르게 자동 전환 -> 체감 장애 최소화
반대 없음.

### Amelia (Developer)
코드 구조가 구현 가능하고 명확:
- TypeScript 인터페이스(Agent, TaskRequest, LLMProvider, Tool, CostRecord 등)가 타입 안전성 보장
- AgentRunner 무상태 패턴이 테스트 용이(mock LLM + mock ToolPool)
- ToolPool.invoke()의 6단계 실행 흐름(권한->검증->실행->절삭->로그->반환)이 명확
- OrganizationService.deleteDepartment()의 cascade 처리가 5단계로 안전
- models.yaml 가격표 외부 설정이 모델 추가/가격 변경 시 코드 수정 불필요
- 15 P0 테이블 + 8 Phase 2 테이블이 전체 데이터 구조 제시
반대 없음.

### Quinn (QA)
테스트 전략 수립에 충분한 아키텍처 정보:
- 각 결정마다 인터페이스 정의 -> 테스트 대상 명확
- Quality Gate 검수 기준(평균>=3.5, 개별>=2) -> 검증 가능한 수치
- Fallback 트리거(3회 연속 실패 또는 5초 타임아웃) -> NFR26과 일치
- cascade 안전 처리의 5단계가 각각 검증 가능한 단위
- Batch API 임계치 + 자동 플러시 -> 비용 절감 효과 측정 가능
- audit_logs 테이블 삭제 불가 설계 -> NFR13 검증 가능
반대 없음.

### Mary (Business Analyst)
비즈니스 가치와 아키텍처 연결:
- 3계급 모델 매핑(Sonnet/Haiku/Haiku)이 비용 40% 절감 목표(NFR30) 직결
- Batch API 50% 할인 활용이 비용 효율성 극대화
- 예산 한도 자동 차단이 비용 통제 비즈니스 요구 반영
- 조직 템플릿 2분 적용(NFR35)이 온보딩 비즈니스 가치 실현
- #005(메모리 금지) 원칙이 아키텍처 전반에 "모든 정보=DB 레코드" 원칙으로 관철
반대 없음.

### Bob (Scrum Master)
구현 계획 수립에 유용한 구조:
- Critical 5 -> Important 5 -> Deferred 4 우선순위가 스프린트 배치에 직결
- 구현 순서 10단계가 에픽/스토리 분할 기준 제시
- Cross-Component Dependencies가 병렬 작업 가능 범위 식별에 유용
- 각 결정에 Phase(P0/P1/Phase 2) 표시로 MVP 범위 명확
반대 없음.

## Cross-check Summary
- PRD 76 FRs 커버리지: ✅ 10개 결정 + 4개 지연으로 전체 커버
- CEO 아이디어 반영: ✅ #001(Phase 2 테이블), #005(DB 원칙), #007(Decision 1+2), #010(Decision 1)
- NFR 핵심 항목 반영: ✅ 성능 타임아웃(60s/5min), 보안(서버 강제), fallback(<5s)
- 구현 순서 의존성: ✅ DAG 구조, 순환 없음
- FR5-FR8 cascade 반영: ✅ Decision 5에 isSystem 보호 + cascade 5단계 + wait/force
- 디자인 패턴: ✅ Strategy(LLM), Registry(Tool), Event-driven(Orchestration)

## Issues Found
없음. 전원 반대 없음.
