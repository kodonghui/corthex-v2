# Epics & Stories - CORTHEX v2

**Author:** ubuntu
**Date:** 2026-03-07

---

## Epic Design

### Design Approach

에픽은 PRD의 9개 기능 영역(76 FRs), Architecture의 구현 순서(10단계 의존성 기반), UX Design의 22개 화면 인벤토리, Product Brief의 Phase 전략을 통합하여 설계한다.

**에픽 분할 원칙:**
1. 각 에픽은 독립적으로 배포 가능한 가치 단위
2. 아키텍처 의존성 순서를 존중 (하위 레이어 먼저)
3. PRD Phase(P0/P1/Phase 2/Phase 3)와 정렬
4. 에픽당 5~10개 스토리 범위 유지 (관리 가능 단위)

**기존 완료:** Epic 0 (Foundation) -- Turborepo 모노레포, Hono+Bun 서버, React+Vite SPA 2개, PostgreSQL+Drizzle, WebSocket EventBus, AES-256-GCM 볼트, JWT 인증, bun:test 201건 통과. 이미 커밋됨.

---

## Phase 1 MVP -- P0 (Must Have)

### Epic 1: Data Layer & Security Foundation

**설명:** v2의 모든 기능이 의존하는 데이터 스키마 확장, 테넌트 격리 미들웨어, RBAC 미들웨어를 구축한다. Architecture 결정 #9(Tenant Isolation)와 #10(Data Architecture)을 구현하며, 모든 후속 에픽의 기반이 된다.

**목표:**
- Drizzle ORM 스키마에 Phase 1 핵심 테이블 추가 (companies, departments, agents, commands, tasks, tool_invocations, cost_records, credentials, quality_reviews, presets, org_templates, audit_logs)
- 모든 DB 쿼리에 companyId WHERE 절을 자동 주입하는 테넌트 미들웨어
- JWT payload에서 역할(Super Admin/Company Admin/CEO/Human 직원) 추출 + API 엔드포인트별 접근 제어
- 시스템 에이전트 + 기본 조직 템플릿 시드 데이터

**수용 기준:**
- [ ] 모든 companyId 격리 테이블에 대해 테넌트 미들웨어가 자동으로 WHERE 절 주입
- [ ] JWT 토큰에 userId + companyId + role 포함, 역할별 API 접근 제한 동작
- [ ] 감사 로그 테이블에 삭제 불가(soft delete 포함) 제약 적용
- [ ] 시드 데이터: 비서실장(시스템 에이전트) + 3종 조직 템플릿 생성
- [ ] 기존 201건 테스트 유지 + 테넌트 격리 테스트 추가

**의존성:** Epic 0 (Foundation) -- 완료됨
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR42(companyId 격리), FR46(AES-256-GCM), FR48(JWT RBAC), FR49(감사 로그), NFR10(companyId WHERE 필수), NFR13(감사 로그 영구)
**Architecture 매핑:** Decision #9(Tenant Isolation), #10(Data Architecture)
**UX 매핑:** 해당 없음 (백엔드 인프라)

---

### Epic 2: Dynamic Organization Management

**설명:** v2의 핵심 차별점인 동적 조직 관리를 구현한다. 부서/AI 에이전트 CRUD, 시스템 에이전트 보호, cascade 처리, 조직 템플릿, 조직도 트리 뷰를 포함한다. 관리자 콘솔(admin 앱)의 핵심 화면들(A1 조직도, A2 부서 관리, A3 에이전트 관리, A7 조직 템플릿)을 구축한다.

**목표:**
- 부서 CRUD API + cascade 분석/처리 엔진 (OrganizationService)
- AI 에이전트 CRUD API (이름, 계급, 모델, allowed_tools, Soul, isSystem)
- 시스템 에이전트 삭제 차단 (403)
- 조직 템플릿 적용 API (부서/에이전트 일괄 생성, < 2분 NFR35)
- 관리자 콘솔 UI: 조직도 트리 뷰, 부서 관리 화면, 에이전트 관리 + Soul 편집
- CEO 앱: 조직도 읽기 전용 뷰

**수용 기준:**
- [ ] 부서 생성/수정/삭제 API 동작, cascade 시 영향 분석(작업 수, 에이전트 수, 비용) 반환
- [ ] 부서 삭제 시 "완료 대기" / "강제 종료" 모드 선택 가능
- [ ] 에이전트 미배속 전환 (삭제 대신), 메모리 아카이브, 비용 기록 영구 보존
- [ ] 시스템 에이전트(isSystem=true) 삭제 시도 시 403 반환
- [ ] 에이전트 CRUD + Soul 마크다운 편집 + 저장 동작
- [ ] 조직 템플릿 3종("투자분석", "마케팅", "올인원") 적용 시 부서+에이전트 일괄 생성
- [ ] 조직도 트리 뷰에서 부서-팀장-전문가 계층 표시, 에이전트 상태 뱃지(유휴/작업중/에러)
- [ ] 드래그 앤 드롭으로 에이전트 부서 이동

**의존성:** Epic 1 (스키마 + 테넌트 미들웨어)
**예상 스토리 수:** 8~10개

**PRD 매핑:** FR1-FR12 (조직 관리 12개 전체)
**Architecture 매핑:** Decision #5(Dynamic Org + Cascade Engine)
**UX 매핑:** Admin A1(조직도), A2(부서 관리), A3(에이전트 관리), A7(조직 템플릿), CEO 앱 에이전트 페이지

---

### Epic 3: LLM Multi-Provider & Agent Execution

**설명:** AI 에이전트의 두뇌를 구현한다. Claude/GPT/Gemini 3사 LLM 라우터, 3계급 자동 모델 배정, fallback 전략, Batch API 수집기, AgentRunner(무상태 실행기)를 구축한다.

**목표:**
- LLMRouter: 프로바이더별 어댑터(Anthropic, OpenAI, Google) + Strategy 패턴 라우팅
- 3계급 자동 모델 배정 (Manager=Sonnet, Specialist=Haiku, Worker=Haiku)
- 프로바이더 장애 시 자동 fallback (Claude -> GPT -> Gemini, < 5초 NFR26)
- BatchCollector: 비긴급 요청 수집 + /배치실행 시 일괄 플러시
- AgentRunner: Soul + 지식 + 도구 정의로 시스템 프롬프트 조립 + LLM 호출
- 비용 기록: 모든 LLM 호출마다 토큰 수 + 비용 산출 (models.yaml 가격표)
- models.yaml: 모델별 input/output 1M 토큰당 가격 정의

**수용 기준:**
- [ ] Claude/GPT/Gemini 3사 API 호출 성공
- [ ] 에이전트 계급에 따라 모델 자동 배정 (Admin 수동 변경 가능)
- [ ] 프로바이더 장애 시 5초 내 fallback 전환
- [ ] Batch API 큐에 요청 수집 + /배치실행으로 일괄 전송
- [ ] AgentRunner가 Soul + allowed_tools로 시스템 프롬프트 조립 후 LLM 호출
- [ ] 모든 LLM 호출에 대해 cost_records 테이블에 비용 기록
- [ ] 에이전트 프롬프트에 크리덴셜 노출 금지 (NFR11)

**의존성:** Epic 1 (스키마 -- agents 테이블 정의 포함)
**예상 스토리 수:** 7~9개

**PRD 매핑:** FR26-FR34 (도구&LLM 9개 중 LLM 부분), FR30(3계급 자동 배정), FR31(수동 모델 변경), FR32(3사 라우팅), FR33(Batch API), FR34(fallback)
**Architecture 매핑:** Decision #2(Agent Execution Model), #3(LLM Provider Router), #7(Cost Tracking)
**UX 매핑:** 해당 없음 (서버 내부, UI는 Epic 5에서)

---

### Epic 4: Tool System

**설명:** 에이전트가 실제 작업을 수행하는 수단인 도구 시스템을 구현한다. ToolPool 레지스트리, 서버 사이드 권한 검증, 핵심 30+ 도구, 도구 호출 로그를 구축한다.

**목표:**
- ToolPool: 도구 레지스트리 + Zod 파라미터 검증 + 실행 + 결과 반환 (4000자 초과 시 요약)
- 서버 사이드 allowed_tools 권한 검증 (에이전트 응답이 아닌 서버에서 차단, NFR14)
- 핵심 30+ 도구 구현 (common 카테고리 우선): real_web_search, calculator, translator, spreadsheet_tool, chart_generator, email_sender, file_manager, date_utils 등
- 도구 호출 로그: agent, tool, input, output, duration 기록 (tool_invocations 테이블)
- 관리자 콘솔 도구 관리 화면 (A5): 도구 카탈로그 + 에이전트별 체크박스 권한 매트릭스

**수용 기준:**
- [ ] ToolPool에 30+ 도구 등록, 각 도구 Zod 스키마 + execute() 구현
- [ ] 에이전트가 allowed_tools에 없는 도구 호출 시 서버에서 자동 차단 + 로그
- [ ] 도구 결과 > 4000자 시 자동 요약 절삭
- [ ] 모든 도구 호출이 tool_invocations 테이블에 기록
- [ ] 관리자 콘솔에서 에이전트별 도구 권한 체크박스 매트릭스로 설정/변경

**의존성:** Epic 1 (스키마), Epic 3 (AgentRunner -- 도구 호출은 AgentRunner 내부에서)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR26(도구 호출), FR27(서버 사이드 권한 강제), FR28(도구 권한 설정), FR29(도구 호출 로그)
**Architecture 매핑:** Decision #4(Tool System)
**UX 매핑:** Admin A5(도구 관리)

---

### Epic 5: Orchestration Engine & Command Center

**설명:** CORTHEX의 핵심 경험을 구현한다. CEO가 사령관실에서 명령을 입력하면 비서실장이 자동 분류하고, Manager에게 위임하며, Specialist들이 병렬 작업하고, 결과를 종합하여 품질 검수 후 CEO에게 보고하는 전체 파이프라인. 사령관실 UI(명령 입력, @멘션, 슬래시 8종, 프리셋, 위임 체인 실시간 표시)를 포함한다.

**목표:**
- OrchestratorService: 명령 수명주기 관리 (수신 -> 분류 -> 위임 -> 병렬 실행 -> 종합 -> 검수 -> 보고)
- ChiefOfStaff: 명령 자동 분류 + 최종 검수 5항목(결론/근거/리스크/형식/논리) + 자동 재작업(최대 2회)
- Manager 위임: 자체 분석(#007 5번째 분석가) + 하위 전문가 병렬 배분 + 결과 종합
- /전체: 모든 Manager 동시 위임 + 결과 종합
- /순차: Manager 순차 위임 + 결과 누적
- 딥워크: 에이전트 자율 다단계 작업 (계획 -> 수집 -> 분석 -> 초안 -> 최종)
- 사령관실 UI: 채팅형 입력 바, @멘션 자동완성, 슬래시 명령 팝업 8종, 프리셋 CRUD
- 위임 체인 실시간 표시: WebSocket command+delegation+tool 채널 구독
- 보고서 뷰: 마크다운 렌더링 + 품질 뱃지(PASS/FAIL) + 비용 요약 + 피드백(thumbs up/down)
- 단계별 타임아웃 (LLM 단일 < 30초, 전체 체인 < 5분)

**수용 기준:**
- [ ] "삼성전자 분석해줘" -> 비서실장 분류 -> Manager 위임 -> Specialist 병렬 실행 -> Manager 종합 -> 비서실장 검수 -> CEO 보고서 수신
- [ ] @멘션으로 특정 Manager 직접 지정 동작 (자동완성 팝업에 현재 활성 Manager 표시)
- [ ] 슬래시 8종(/전체, /순차, /도구점검, /배치실행, /배치상태, /명령어, /토론, /심층토론) 동작
- [ ] 프리셋 CRUD + 프리셋에서 명령 실행
- [ ] 위임 체인 실시간 표시: 에이전트 이름 + 현재 단계 + 경과 시간 + 도구 호출 표시
- [ ] 품질 게이트 5항목 검수 -> FAIL 시 자동 재작업(최대 2회) -> 2회 실패 후 경고 플래그 달아 전달
- [ ] 보고서에 thumbs up/down 피드백 기능
- [ ] 오케스트레이션 성공률 > 95% (NFR20)
- [ ] 단순 명령 < 60초, 복합 명령 < 5분 (NFR1, NFR2)

**의존성:** Epic 2 (조직 데이터), Epic 3 (LLM Router + AgentRunner), Epic 4 (ToolPool)
**예상 스토리 수:** 10~12개 (가장 큰 에픽 -- 내부 마일스톤으로 Backend/Frontend/QualityGate 3개 트랙 관리 권장)

**PRD 매핑:** FR13-FR25 (사령관실 6 + 오케스트레이션 7), FR50-FR51 (품질 게이트 P0)
**Architecture 매핑:** Decision #1(Orchestration Engine), #6(Quality Gate), #8(Real-time Communication)
**UX 매핑:** CEO 앱 #2(사령관실), Core User Flow 1(명령 -> 위임 -> 결과)

---

## Phase 1 MVP -- P1 (Should Have)

### Epic 6: Dashboard & Activity Monitoring

**설명:** 작전현황(홈 대시보드)과 통신로그 4탭을 구현한다. CEO/Admin이 조직 현황, 비용, 에이전트 활동을 실시간으로 모니터링하는 화면을 제공한다.

**목표:**
- 작전현황(홈) 대시보드: 요약 카드 4개(작업/비용/에이전트/연동 상태), AI 사용량 그래프(프로바이더별), 예산 진행 바, 퀵 액션(루틴+시스템 명령), 만족도 원형 차트
- 통신로그 4탭: 활동(에이전트 활동), 통신(위임 기록 from->to, 비용, 토큰), QA(품질 검수 결과), 도구(도구 호출 기록)
- 실시간 데이터: WebSocket cost + agent-status 채널 연동

**수용 기준:**
- [ ] 작전현황에 4개 요약 카드 실시간 갱신
- [ ] AI 사용량 막대 그래프 (Anthropic/OpenAI/Google 프로바이더별)
- [ ] 예산 진행 바 (초록->노랑->빨강 색상 변화)
- [ ] 퀵 액션 버튼 클릭 시 사령관실에 해당 명령 자동 입력
- [ ] 만족도 원형 차트 (thumbs up/down 집계)
- [ ] 통신로그 4탭 각각 필터 + 상세 모달 동작
- [ ] WebSocket으로 실시간 데이터 반영 (새로고침 불필요)

**의존성:** Epic 5 (오케스트레이션 -- 활동/통신/QA/도구 데이터 생성원)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR35-FR37, FR41 (모니터링 4개)
**Architecture 매핑:** Decision #8(Real-time Communication) WebSocket 채널 활용
**UX 매핑:** CEO 앱 #1(작전현황), #7(통신로그)

---

### Epic 7: Cost Management System

**설명:** 에이전트별/모델별/부서별 3축 비용 추적, 일일/월 예산 한도, 예산 초과 시 자동 차단을 구현한다. 비용 투명성은 3명 페르소나 모두의 핵심 관심사이다.

**목표:**
- CostTracker: LLM 호출마다 models.yaml 기반 비용 산출 + cost_records 기록
- 3축 집계 API: 에이전트별, 모델별, 부서별 실시간 합산
- 예산 관리: 일일 한도 + 월 한도 설정 (회사별)
- 한도 초과: 자동 차단 + WebSocket cost 채널로 CEO 알림
- 비용 대시보드 UI (관리자 콘솔 A6): 도넛 차트(부서별) + 막대 차트(에이전트별) + 예산 진행 바 + 한도 설정 폼
- CEO 앱 비용 뷰: 작전현황 내 비용 카드 + 드릴다운

**수용 기준:**
- [ ] 모든 LLM 호출에 대해 모델별 가격표 기반 비용 자동 산출
- [ ] 에이전트별/모델별/부서별 비용 집계 API 응답
- [ ] 일일/월 예산 한도 설정 + 한도 도달 시 LLM 호출 자동 차단
- [ ] 예산 초과 시 WebSocket으로 CEO에게 실시간 알림
- [ ] 비용 대시보드에 도넛/막대 차트 렌더링
- [ ] 3계급 모델 배정으로 전체 비용 40%+ 절감 (NFR30)

**의존성:** Epic 3 (LLM Router -- 비용 기록 삽입 지점)
**예상 스토리 수:** 5~7개

**PRD 매핑:** FR38-FR40 (비용 추적/한도/차트)
**Architecture 매핑:** Decision #7(Cost Tracking System)
**UX 매핑:** Admin A6(비용 대시보드), CEO 앱 작전현황 비용 카드

---

### Epic 8: Quality Gate Enhancement

**설명:** P0에서 구현한 비서실장 5항목 간이 검수를 고도화한다. quality_rules.yaml 기반 자동 규칙 검수, 환각 탐지 자동화, 프롬프트 인젝션 방어를 구현한다.

**목표:**
- quality_rules.yaml: 완전성(길이, 출처, 구조) + 정확성(팩트체크, 환각 방지) 규칙 정의
- 자동 규칙 검수 엔진: yaml 규칙 기반 + LLM 기반 하이브리드 검수
- 환각 탐지: 도구를 통한 실제 데이터 조회 결과와 에이전트 응답 비교
- 프롬프트 인젝션 방어: 시스템 프롬프트/사용자 입력 분리, 에이전트 출력에서 크리덴셜 패턴 필터링
- 통신로그 QA 탭 강화: 규칙별 검수 결과 상세 표시

**수용 기준:**
- [ ] quality_rules.yaml 파일 기반 자동 규칙 검수 동작
- [ ] 환각 탐지: 사실과 다른 내용 감지 시 자동 반려 + 재작업
- [ ] 프롬프트 인젝션: 시스템 프롬프트 유출 시도 차단 + 로그
- [ ] 에이전트 출력에서 크리덴셜/API 키 패턴 자동 필터링
- [ ] QA 탭에서 규칙별 검수 상세 결과 확인 가능

**의존성:** Epic 5 (P0 품질 게이트 기반)
**예상 스토리 수:** 5~6개

**PRD 매핑:** FR52-FR55 (품질 관리 P1)
**Architecture 매핑:** Decision #6(Quality Gate Pipeline) P1 확장
**UX 매핑:** CEO 앱 통신로그 QA 탭 확장

---

### Epic 9: Multi-tenancy & Admin Console

**설명:** 멀티테넌시 완성과 관리자 콘솔의 회사/직원 관리 화면을 구현한다. 회사 CRUD, Human 직원 워크스페이스, 부서별 접근 권한, 관리자 콘솔 <-> CEO 앱 전환을 포함한다.

**목표:**
- 회사 CRUD API: companyId 자동 발급, 관리자 계정 생성, 초기 비밀번호 발급
- Human 직원 관리: 워크스페이스 생성, 부서별 접근 권한 부여
- 직원 사령관실 제한: @멘션에 자기 부서 Manager만, 비용은 자기 부서만
- 관리자 콘솔 UI (A4 직원 관리, A8 회사 설정): 직원 테이블 + 초대 폼 + 권한 체크리스트 + 회사 정보 + API 키 관리
- Admin <-> CEO 앱 전환: JWT 세션 공유, 재로그인 불필요
- 온보딩 위저드: Admin 첫 접속 시 5단계 가이드

**수용 기준:**
- [ ] 회사 생성 -> companyId 발급 -> 관리자 계정 생성 -> 접속 링크 동작
- [ ] Human 직원 초대 + 워크스페이스 생성 + 부서별 접근 권한 설정
- [ ] 직원이 사령관실에서 자기 부서의 Manager만 @멘션 가능
- [ ] 직원이 자기 워크스페이스 내에서만 명령/비용/이력 확인
- [ ] Admin 콘솔 <-> CEO 앱 전환 시 재로그인 없이 매끄럽게 이동
- [ ] 크로스 테넌트 접근 완전 차단 (Admin도 개별 회사 명령 내용 열람 불가)

**의존성:** Epic 1 (테넌트 미들웨어 + RBAC), Epic 2 (조직 관리 -- 부서/에이전트)
**예상 스토리 수:** 7~9개

**PRD 매핑:** FR43-FR45, FR47 (멀티테넌시 & 사용자 관리 4개)
**Architecture 매핑:** Decision #9(Tenant Isolation Middleware)
**UX 매핑:** Admin A4(직원 관리), A8(회사 설정), 온보딩 위저드, Admin<->CEO 전환

---

## Phase 2 -- v1 기능 이식 (6개월)

> **도구 확장 전략:** Epic 4에서 ToolPool 프레임워크 + 30+ 공통 도구를 구축한다. Phase 2의 도메인별 도구(Finance, Marketing, Legal, Tech)는 해당 기능 에픽의 스토리로 구현한다. 예: Finance 도구(kr_stock, kis_trading 등)는 Epic 10(Strategy Room) 스토리에 포함. 이는 도구가 해당 기능과 함께 테스트/배포되도록 보장한다.

### Epic 10: Strategy Room & Trading (높음)

**설명:** 투자 분석 + KIS 자동매매를 구현한다. 포트폴리오 대시보드, 관심종목 60초 시세 갱신, CIO+VECTOR 분리(#001), 자율/승인 실행, 투자 성향별 리스크 제어, 실/모의거래 분리를 포함한다. 이사장 페르소나의 핵심 Journey(J2).

**목표:**
- 전략실 UI: 포트폴리오 카드(현금/보유종목/수익률/총자산), 관심종목 리스트(드래그 정렬, KR/US 필터, 60초 갱신), 차트 모달
- KIS 증권 API 연동: 시세 조회 + 주문 전송 + 체결 확인
- CIO(분석) + VECTOR(실행봇) 분리: CIO 종합 분석 -> VECTOR 주문 실행
- 자율/승인 실행 모드: CEO 설정에서 선택
- 투자 성향(보수/균형/공격): 종목당 최대 비중%, 일일 매매 한도
- 실거래/모의거래 분리: 서버 설정으로 완전 분리, 실거래 전환 시 2단계 확인
- 모의거래(Paper Trading): 초기자금 설정 + 실제 시장 데이터로 가상 매매
- 주문 이력 영구 보존 (삭제 불가)
- Finance 도구 추가: kr_stock, dart_api, sec_edgar, backtest_engine, kis_trading

**수용 기준:**
- [ ] 포트폴리오 대시보드에 보유 종목 + 실시간 시세(60초 갱신) 표시
- [ ] "/전체 리밸런싱 제안" -> CIO + 4명 전문가 병렬 분석 -> CIO 종합 -> 매매 제안
- [ ] VECTOR가 KIS API로 한국/미국 시장 주문 전송 + 체결 확인
- [ ] 자율/승인 실행 모드 선택 + 승인 모드에서 CEO 확인 후 실행
- [ ] 실거래/모의거래 환경 완전 분리 + 실거래 전환 시 2단계 확인
- [ ] 모든 매매 주문(실행/취소/거부/체결/미체결) 영구 보존

**의존성:** Epic 5 (오케스트레이션), Epic 4 (도구 시스템 -- Finance 도구 추가)
**예상 스토리 수:** 8~10개

**PRD 매핑:** FR56-FR62 (투자 & 금융 7개 전체)
**Architecture 매핑:** Phase 2 추가 테이블 (watchlist, portfolio, trade_orders)
**UX 매핑:** CEO 앱 #3(전략실), Journey J2(이사장)

---

### Epic 11: AGORA Debate Engine (높음)

**설명:** Manager급 에이전트들이 주제에 대해 라운드 기반 토론을 수행하는 AGORA 엔진을 구현한다. 2/3라운드 토론, SSE 스트리밍, 합의/비합의 판정, Diff 뷰를 포함한다.

**목표:**
- 토론 오케스트레이션: /토론(2라운드) + /심층토론(3라운드) 명령 처리
- 라운드 관리: 각 라운드에서 Manager들이 순차 발언 -> 반론/보완
- SSE 스트리밍: 토론 과정 실시간 전송 (WebSocket debate 채널)
- 합의/비합의 판정: 라운드 종료 후 AI가 합의 수준 평가
- AGORA UI: 라운드 타임라인 뷰 + 에이전트 아바타 + 발언 카드 + 합의 결과
- 사령관실 -> AGORA 자동 전환: /토론 입력 시 AGORA 화면으로 이동

**수용 기준:**
- [ ] /토론 명령 -> 모든 Manager가 2라운드 토론 + 합의 결과 반환
- [ ] /심층토론 -> 3라운드 심층 토론
- [ ] 토론 과정 WebSocket으로 실시간 스트리밍
- [ ] AGORA UI에서 라운드별 발언 확인 + Diff 뷰
- [ ] 사령관실 대화 이력에 토론 결과 요약 카드 자동 삽입

**의존성:** Epic 5 (오케스트레이션 + 사령관실), Epic 3 (LLM -- 다수 에이전트 동시 호출)
**예상 스토리 수:** 6~7개

**PRD 매핑:** FR63 (AGORA 토론)
**Architecture 매핑:** services/agora-engine.ts, WebSocket debate 채널
**UX 매핑:** CEO 앱 #5(AGORA 토론)

---

### Epic 12: SNS Publishing (높음)

**설명:** 5개 플랫폼(Instagram, YouTube, 티스토리, 다음카페, LinkedIn) 콘텐츠 자동 발행을 구현한다. AI 콘텐츠 생성, 승인 플로우, 예약 발행, Selenium 자동화를 포함한다.

**목표:**
- SNS 콘텐츠 관리: AI 생성 + 미디어 갤러리 + 승인/반려 플로우
- 예약 발행 큐 + 카드뉴스 시리즈(5~10장)
- Selenium 기반 자동 발행: 로그인 -> 콘텐츠 입력 -> 발행 (60초 타임아웃 NFR29)
- Marketing 도구 추가: sns_manager, seo_analyzer, hashtag_recommender

**수용 기준:**
- [ ] AI가 콘텐츠 생성 + CEO 승인 후 발행
- [ ] 5개 플랫폼 각각 Selenium 자동 발행 동작
- [ ] 예약 발행 큐에서 지정 시간에 자동 발행
- [ ] 카드뉴스 시리즈 5~10장 일괄 생성/발행

**의존성:** Epic 4 (도구 시스템 -- Marketing 도구 추가), Epic 5 (사령관실 명령)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR65 (SNS 통신국)
**Architecture 매핑:** routes/sns.ts, tools/marketing/
**UX 매핑:** CEO 앱 #6(SNS 통신국)

---

### Epic 13: SketchVibe Canvas (중간)

**설명:** Cytoscape.js 기반 인터랙티브 캔버스에서 AI와 함께 다이어그램을 그리며 대화하는 SketchVibe를 구현한다. Mermaid<->Cytoscape 양방향 변환, MCP SSE 실시간 AI 편집을 포함한다.

**목표:**
- Cytoscape.js 캔버스: 8종 노드(agent, system, api, decide, db, start, end, note), 드래그 이동, 더블클릭 편집, Delete 삭제
- 연결 모드: Space바 토글, edgehandles 드래그 화살표, compound parent subgraph
- Mermaid <-> Cytoscape 양방향 변환: classDef/style 커스텀 색상, subgraph 변환
- MCP SSE 연동: AI가 실시간 캔버스 조작 (WebSocket nexus 채널)
- 저장/불러오기: 확인된 다이어그램 저장 + 지식 베이스 연동

**수용 기준:**
- [ ] 캔버스에서 8종 노드 생성/편집/삭제/연결 동작
- [ ] Mermaid 코드 -> Cytoscape 변환 + 역변환 동작
- [ ] AI가 "이 플로우에서 병목은?" 질문에 캔버스 노드 실시간 추가/수정
- [ ] 다이어그램 저장/불러오기 동작

**의존성:** Epic 5 (사령관실 -- AI 대화), Epic 3 (LLM)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR64 (SketchVibe)
**Architecture 매핑:** routes/sketches.ts, WebSocket nexus 채널
**UX 매핑:** CEO 앱 #4(SketchVibe)

---

### Epic 14: Cron Scheduler & ARGOS (중간)

**설명:** 반복 명령 자동화(크론 스케줄러)와 조건 트리거 자동 수집(ARGOS)을 구현한다. 두 기능은 "자동 실행"이라는 공통 패턴을 공유한다.

**목표:**
- 크론 스케줄러: cron 일정 CRUD, 프리셋(매일 9시 등) + 커스텀 cron 표현식, 활성/비활성 토글, last_run/next_run 추적
- 사령관실 명령을 지정 시간에 자동 실행 + 결과 전송 (텔레그램/대시보드)
- ARGOS: 트리거 조건 설정(키워드, 가격 변동 등) -> 조건 만족 시 자동 수집 -> 분석 연결
- 상태 바: 데이터 OK/NG, AI OK/NG, 트리거 수, 비용
- 크론기지 UI + ARGOS UI

**수용 기준:**
- [ ] 크론 일정 CRUD + 프리셋/커스텀 cron 표현식 동작
- [ ] 지정 시간에 사령관실 명령 자동 실행 + 결과 기록
- [ ] ARGOS 트리거 조건 설정 + 조건 만족 시 자동 분석 실행
- [ ] 크론기지 UI에서 활성 토글 + next_run 표시

**의존성:** Epic 5 (사령관실 명령 API 재사용), Epic 4 (도구 -- 데이터 수집 도구)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR66(크론 스케줄러), FR67(ARGOS)
**Architecture 매핑:** services/cron-scheduler.ts, services/argos-collector.ts
**UX 매핑:** CEO 앱 #11(크론기지), #12(ARGOS)

---

### Epic 15: Telegram Integration (중간)

**설명:** 텔레그램 봇을 통해 모바일에서 AI 조직에 명령을 보내고 결과를 수신하는 기능을 구현한다.

**목표:**
- 텔레그램 Bot API 연동: Webhook 방식
- 사령관실과 동일한 명령 체계: @멘션, 일반 텍스트
- 부서별 보고서/비용 텔레그램 푸시 알림
- 크론 스케줄러 결과 텔레그램 전송

**수용 기준:**
- [ ] 텔레그램에서 명령 전송 -> 오케스트레이션 실행 -> 결과 텔레그램 메시지로 수신
- [ ] @멘션으로 특정 Manager 지정 가능
- [ ] 크론 결과 텔레그램 자동 전송

**의존성:** Epic 5 (사령관실 명령 API), Epic 14 (크론 -- 결과 전송)
**예상 스토리 수:** 4~5개

**PRD 매핑:** FR68 (텔레그램)
**Architecture 매핑:** routes/telegram.ts
**UX 매핑:** 해당 없음 (Bot API, UI 없음)

---

### Epic 16: Knowledge Base & Agent Memory (중간)

**설명:** 지식 관리(정보국)와 에이전트 자동 학습 메모리를 구현한다. 초기 구현은 파일 기반 지식 주입 방식(v1 접근법)을 사용하며, 벡터 DB 기반 RAG는 아키텍처 결정 #13 확정 후 선택적 강화로 추가한다.

**목표:**
- 정보국: 문서 저장소, 폴더 구조, 드래그&드롭 업로드, 문서 CRUD
- 부서별 지식 자동 주입: 파일 기반 부서별 폴더에서 에이전트 시스템 프롬프트에 관련 지식 포함 (벡터 DB RAG는 선택적 강화)
- 에이전트 메모리: 작업 완료 후 핵심 학습 포인트 자동 추출 + 저장
- 다음 유사 작업에서 이전 학습 자동 참고 (시스템 프롬프트 주입)
- 메모리 금지 원칙: 모든 메모리는 명시적 파일로 관리 (#005)

**수용 기준:**
- [ ] 정보국에 문서 업로드/편집/삭제 + 폴더 관리
- [ ] 에이전트 시스템 프롬프트에 부서별 지식 자동 주입
- [ ] 작업 완료 후 학습 포인트 자동 추출 + 저장
- [ ] 유사 작업 수행 시 이전 학습 내용 자동 참고

**의존성:** Epic 3 (AgentRunner -- 프롬프트 주입 지점), Epic 5 (오케스트레이션)
**예상 스토리 수:** 6~8개

**PRD 매핑:** FR69(RAG), FR70(에이전트 메모리)
**Architecture 매핑:** routes/knowledge.ts, Phase 2 테이블 (knowledge_docs, agent_memories)
**UX 매핑:** CEO 앱 #13(정보국)

---

### Epic 17: History, Archive & Performance (낮음)

**설명:** 작전일지(명령 이력), 기밀문서(보고서 아카이브), 전력분석(에이전트 성능/Soul Gym)을 구현한다. 세 기능은 "과거 데이터 조회/분석"이라는 공통 패턴을 공유한다.

**목표:**
- 작전일지: CEO 명령 이력 검색/필터, 북마크, 태그, A/B 비교, 리플레이
- 기밀문서: 보고서 아카이브, 부서별/등급별 필터, 유사 문서 찾기
- 전력분석: Soul Gym(에이전트별 개선 제안, 신뢰도), 품질 대시보드(통과율, 평균 점수), 에이전트 성능(호출 수, 성공률, 비용, 시간)

**수용 기준:**
- [ ] 작전일지에서 과거 명령 검색 + A/B 비교 + 리플레이 동작
- [ ] 기밀문서에 보고서 아카이브 + 필터 + 유사 문서 추천
- [ ] 전력분석에서 에이전트별 성능 지표 + Soul Gym 개선 제안

**의존성:** Epic 5 (명령/보고서 데이터), Epic 7 (비용 데이터), Epic 8 (품질 데이터)
**예상 스토리 수:** 7~9개

**PRD 매핑:** FR71(작전일지), FR72(기밀문서), FR73(전력분석)
**Architecture 매핑:** 해당 라우트 + 기존 테이블 활용
**UX 매핑:** CEO 앱 #8(작전일지), #9(기밀문서), #10(전력분석)

---

### Epic 18: Workflow Automation (낮음)

**설명:** 다단계 자동화 파이프라인과 예측 워크플로우(#004)를 구현한다.

**목표:**
- 워크플로우 CRUD: 순차/병렬 다단계 스텝 정의 (데이터 수집 -> 분석 -> 보고서)
- 실행 상태 추적: currentStep, done, error 실시간 모니터링
- 예측 워크플로우 (#004): 사용자 명령 패턴 분석 -> 자주 사용하는 워크플로우 자동 제안

**수용 기준:**
- [ ] 워크플로우 생성/편집/삭제 + 다단계 스텝 빌더 동작
- [ ] 워크플로우 실행 시 스텝별 진행 상태 실시간 표시
- [ ] 자주 사용하는 명령 패턴 기반 워크플로우 자동 제안

**의존성:** Epic 14 (크론 -- 자동 실행), Epic 5 (오케스트레이션)
**예상 스토리 수:** 5~7개

**PRD 매핑:** FR74(워크플로우), FR75(예측 워크플로우 #004)
**Architecture 매핑:** CEO 앱 자동화 화면
**UX 매핑:** CEO 앱 자동화 화면

---

## Phase 3 -- 확장 (12개월+)

### Epic 19: Internal Messenger (Phase 3)

**설명:** Human 직원 간 실시간 채팅 기능을 구현한다. 멀티테넌시 안정화 후 진행.

**목표:**
- 실시간 채팅: Human 직원 간 1:1 및 그룹 메시지
- AI 분석 결과 공유: 보고서를 메신저로 전달
- companyId 기반 격리

**의존성:** Epic 9 (멀티테넌시 안정화)
**예상 스토리 수:** 5~7개

**PRD 매핑:** FR76 (사내 메신저)

---

### Epic 20: Platform Extensions (Phase 3)

**설명:** 플랫폼 확장 기능을 구현한다. 조직 템플릿 마켓, 에이전트 마켓플레이스, 공개 API, 노코드 워크플로우 빌더.

**목표:**
- 조직 템플릿 마켓: 사용자가 만든 조직 구조 공유/복제
- 에이전트 마켓플레이스: 공유 Soul/도구 세트 교환
- API 공개: 외부 시스템 연동
- 워크플로우 빌더 (노코드): 비주얼 자동화

**의존성:** Epic 18 (워크플로우 기본), Epic 2 (조직 템플릿)
**예상 스토리 수:** 8~12개

**PRD 매핑:** PRD Vision (Phase 3)

---

## Epic Prioritization Summary

| Phase | Epic | 우선순위 | 스토리 수 | 핵심 PRD FRs |
|-------|------|---------|----------|-------------|
| **P0** | Epic 1: Data Layer & Security | 최우선 | 6~8 | FR42,46,48,49 |
| **P0** | Epic 2: Dynamic Organization | 최우선 | 8~10 | FR1-12 |
| **P0** | Epic 3: LLM & Agent Execution | 최우선 | 7~9 | FR26-34 (LLM) |
| **P0** | Epic 4: Tool System | 최우선 | 6~8 | FR26-29 (도구) |
| **P0** | Epic 5: Orchestration & Command | 최우선 | 10~12 | FR13-25, FR50-51 |
| **P1** | Epic 6: Dashboard & Monitoring | 높음 | 6~8 | FR35-37, FR41 |
| **P1** | Epic 7: Cost Management | 높음 | 5~7 | FR38-40 |
| **P1** | Epic 8: Quality Gate Enhancement | 높음 | 5~6 | FR52-55 |
| **P1** | Epic 9: Multi-tenancy & Admin | 높음 | 7~9 | FR42-49 |
| **Phase 2** | Epic 10: Strategy & Trading | 높음 | 8~10 | FR56-62 |
| **Phase 2** | Epic 11: AGORA Debate | 높음 | 6~7 | FR63 |
| **Phase 2** | Epic 12: SNS Publishing | 높음 | 6~8 | FR65 |
| **Phase 2** | Epic 13: SketchVibe Canvas | 중간 | 6~8 | FR64 |
| **Phase 2** | Epic 14: Cron & ARGOS | 중간 | 6~8 | FR66-67 |
| **Phase 2** | Epic 15: Telegram | 중간 | 4~5 | FR68 |
| **Phase 2** | Epic 16: Knowledge & Memory | 중간 | 6~8 | FR69-70 |
| **Phase 2** | Epic 17: History/Archive/Perf | 낮음 | 7~9 | FR71-73 |
| **Phase 2** | Epic 18: Workflow Automation | 낮음 | 5~7 | FR74-75 |
| **Phase 3** | Epic 19: Internal Messenger | 미래 | 5~7 | FR76 |
| **Phase 3** | Epic 20: Platform Extensions | 미래 | 8~12 | Vision |
| | **총계** | | **~120~160** | **76 FRs + Vision** |

---

## Epic Dependency Graph

```
Epic 0 (Foundation) [완료]
  |
  v
Epic 1 (Data Layer & Security)
  |
  +----------------------+
  v                      v
Epic 2 (Organization)   Epic 3 (LLM & Agent)  [parallel -- both depend on Epic 1 only]
  |                      |
  |                      +----------+
  |                      v          v
  |                    Epic 4    Epic 7
  |                    (Tools)   (Cost Mgmt)
  |                      |
  |                      v
  +---------------> Epic 5 (Orchestration & Command)  [needs Epic 2 + Epic 4]
  |                      |
  |                      +----------+----------+
  |                      v          v          v
  |                    Epic 6    Epic 8    Epic 11
  |                    (Dashboard) (Quality+) (AGORA)
  |                      |
  |                      v
  |                    Epic 17
  |                    (History/Archive/Perf)
  |
  +---------------> Epic 9 (Multi-tenancy & Admin)
  |                      |
  |                      v
  |                    Epic 19 (Messenger, Phase 3)
  |
  v
Epic 10 (Strategy) <-- Epic 4 (Finance tools)
Epic 12 (SNS) <---- Epic 4 (Marketing tools)
Epic 13 (SketchVibe) <-- Epic 5 (Command Center)
Epic 14 (Cron & ARGOS) <-- Epic 5
Epic 15 (Telegram) <-- Epic 5 + Epic 14
Epic 16 (Knowledge & Memory) <-- Epic 3 + Epic 5
Epic 18 (Workflow) <-- Epic 14 + Epic 5
Epic 20 (Platform) <-- Epic 2 + Epic 18
```

**Critical Path (Phase 1 MVP):**
```
Epic 0 -> Epic 1 -> Epic 2 + Epic 3 (parallel) -> Epic 4 -> Epic 5 -> Epic 6 + Epic 7 + Epic 8 + Epic 9 (parallel)
```

---

## PRD FR Coverage Validation

| FR Group | FR Numbers | Epic | Phase |
|----------|-----------|------|-------|
| Organization Mgmt | FR1-FR12 (12) | Epic 2 | P0 |
| Command Center | FR13-FR18 (6) | Epic 5 | P0 |
| Orchestration | FR19-FR25 (7) | Epic 5 | P0 |
| Tool & LLM | FR26-FR34 (9) | Epic 3 + Epic 4 | P0 |
| Monitoring | FR35-FR37, FR41 (4) | Epic 6 | P1 |
| Cost Management | FR38-FR40 (3) | Epic 7 | P1 |
| Security Foundation | FR42,46,48,49 (4) | Epic 1 | P0 |
| Multi-tenancy & Users | FR43-45,47 (4) | Epic 9 | P1 |
| Quality Mgmt (P0) | FR50-FR51 (2) | Epic 5 | P0 |
| Quality Mgmt (P1) | FR52-FR55 (4) | Epic 8 | P1 |
| Investment & Finance | FR56-FR62 (7) | Epic 10 | Phase 2 |
| AGORA | FR63 (1) | Epic 11 | Phase 2 |
| SketchVibe | FR64 (1) | Epic 13 | Phase 2 |
| SNS | FR65 (1) | Epic 12 | Phase 2 |
| Cron | FR66 (1) | Epic 14 | Phase 2 |
| ARGOS | FR67 (1) | Epic 14 | Phase 2 |
| Telegram | FR68 (1) | Epic 15 | Phase 2 |
| Knowledge RAG | FR69 (1) | Epic 16 | Phase 2 |
| Agent Memory | FR70 (1) | Epic 16 | Phase 2 |
| History | FR71 (1) | Epic 17 | Phase 2 |
| Archive | FR72 (1) | Epic 17 | Phase 2 |
| Performance | FR73 (1) | Epic 17 | Phase 2 |
| Workflow | FR74 (1) | Epic 18 | Phase 2 |
| Predictive WF | FR75 (1) | Epic 18 | Phase 2 |
| Messenger | FR76 (1) | Epic 19 | Phase 3 |
| **Total** | **76 FRs** | **20 Epics** | **100% coverage** |

---

## UX Design Coverage

| UX Screen | Epic | Phase |
|-----------|------|-------|
| CEO App #1 Dashboard | Epic 6 | P1 |
| CEO App #2 Command Center | Epic 5 | P0 |
| CEO App #3 Strategy Room | Epic 10 | Phase 2 |
| CEO App #4 SketchVibe | Epic 13 | Phase 2 |
| CEO App #5 AGORA Debate | Epic 11 | Phase 2 |
| CEO App #6 SNS Publishing | Epic 12 | Phase 2 |
| CEO App #7 Activity Log | Epic 6 | P1 |
| CEO App #8 History | Epic 17 | Phase 2 |
| CEO App #9 Archive | Epic 17 | Phase 2 |
| CEO App #10 Performance | Epic 17 | Phase 2 |
| CEO App #11 Cron | Epic 14 | Phase 2 |
| CEO App #12 ARGOS | Epic 14 | Phase 2 |
| CEO App #13 Knowledge | Epic 16 | Phase 2 |
| CEO App #14 Settings | Epic 9 | P1 |
| Admin A1 Org Tree | Epic 2 | P0 |
| Admin A2 Dept Mgmt | Epic 2 | P0 |
| Admin A3 Agent Mgmt | Epic 2 | P0 |
| Admin A4 Employee Mgmt | Epic 9 | P1 |
| Admin A5 Tool Mgmt | Epic 4 | P0 |
| Admin A6 Cost Dashboard | Epic 7 | P1 |
| Admin A7 Org Templates | Epic 2 | P0 |
| Admin A8 Company Settings | Epic 9 | P1 |

---

## v1 Feature Spec Coverage

| v1 Feature (#) | Epic | Phase | Note |
|----------------|------|-------|------|
| #1 Command Center | Epic 5 | P0 | Command input + delegation chain |
| #2 Agent Organization | Epic 2 | P0 | Extended to dynamic CRUD |
| #3 Tool System | Epic 4 | P0 | 30+ core tools |
| #4 LLM Router | Epic 3 | P0 | 3 providers + Batch |
| #5 AGORA Debate | Epic 11 | Phase 2 | |
| #6 Strategy Room | Epic 10 | Phase 2 | |
| #7 SketchVibe | Epic 13 | Phase 2 | |
| #8 SNS Publishing | Epic 12 | Phase 2 | |
| #9 Dashboard | Epic 6 | P1 | |
| #10 Activity Log | Epic 6 | P1 | |
| #11 History | Epic 17 | Phase 2 | |
| #12 Archive | Epic 17 | Phase 2 | |
| #13 Performance | Epic 17 | Phase 2 | |
| #14 Workflow | Epic 18 | Phase 2 | |
| #15 Cron | Epic 14 | Phase 2 | |
| #16 Knowledge | Epic 16 | Phase 2 | |
| #17 ARGOS | Epic 14 | Phase 2 | |
| #18 Telegram | Epic 15 | Phase 2 | |
| #19 Quality Gate | Epic 5 (P0) + Epic 8 (P1) | P0/P1 | |
| #20 Agent Memory | Epic 16 | Phase 2 | |
| #21 Cost Management | Epic 7 | P1 | |
| #22 CEO Ideas | Distributed across epics | All | #001->E10, #005->All, #007->E5, #009->E13, #010->E5, #011->E2 |
| **Total** | **22/22 covered** | | **100%** |

---

## User Stories

> 각 스토리는 1~2일 구현 가능한 단위로 분할. ID 형식: E{epic}-S{story}. 스토리 포인트(SP): 1=반나절, 2=하루, 3=하루 반, 5=이틀.

---

### Epic 1: Data Layer & Security Foundation

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E1-S1 | Phase 1 Drizzle 스키마 확장 | 3 | FR42 | Epic 0 |
| E1-S2 | 테넌트 격리 미들웨어 | 3 | FR42, NFR10 | E1-S1 |
| E1-S3 | RBAC 미들웨어 | 2 | FR48 | E1-S1 |
| E1-S4 | 감사 로그 시스템 | 2 | FR49, NFR13 | E1-S1 |
| E1-S5 | 크리덴셜 볼트 확장 | 2 | FR46 | E1-S1 |
| E1-S6 | 시드 데이터 + 조직 템플릿 데이터 | 2 | FR10 | E1-S1 |
| E1-S7 | 테넌트 격리 통합 테스트 | 2 | NFR10 | E1-S2, E1-S3 |

**E1-S1: Phase 1 Drizzle 스키마 확장**
- **설명:** companies, departments, agents, commands, tasks, tool_invocations, cost_records, credentials, quality_reviews, presets, org_templates, audit_logs 테이블을 Drizzle ORM 스키마로 정의하고 마이그레이션 생성
- **수용 기준:**
  - [ ] 12개 Phase 1 테이블 스키마 정의 완료 (모든 테이블에 companyId 칼럼 포함)
  - [ ] Drizzle 마이그레이션 파일 생성 + 적용 성공
  - [ ] 기존 admin_users, users 테이블과의 관계 정의 (FK)
  - [ ] 모든 테이블에 createdAt, updatedAt 타임스탬프 포함

**E1-S2: 테넌트 격리 미들웨어**
- **설명:** Hono 미들웨어로 JWT에서 companyId를 추출하고, 모든 DB 쿼리에 companyId WHERE 절을 자동 주입하는 테넌트 격리 시스템 구현
- **수용 기준:**
  - [ ] JWT payload에서 companyId 자동 추출
  - [ ] Drizzle 쿼리 헬퍼가 모든 SELECT/UPDATE/DELETE에 companyId 필터 자동 추가
  - [ ] companyId 불일치 시 403 반환
  - [ ] companyId 없는 요청은 인증 실패 처리

**E1-S3: RBAC 미들웨어**
- **설명:** JWT에서 role(super_admin/company_admin/ceo/employee) 추출 후 API 엔드포인트별 접근 제어 미들웨어 구현
- **수용 기준:**
  - [ ] 역할별 허용 엔드포인트 매트릭스 정의
  - [ ] 권한 없는 접근 시 403 반환 + 감사 로그 기록
  - [ ] Super Admin은 전체 접근, Employee는 자기 부서만 접근
  - [ ] 미들웨어 체이닝: auth -> tenant -> rbac 순서

**E1-S4: 감사 로그 시스템**
- **설명:** 금융 거래/조직 변경/권한 변경을 삭제 불가 감사 로그에 기록하는 시스템 구현
- **수용 기준:**
  - [ ] audit_logs 테이블에 who/what/when/result 기록
  - [ ] DELETE/UPDATE 쿼리 금지 (INSERT ONLY)
  - [ ] 조직 변경(부서/에이전트 CRUD) 시 자동 감사 기록
  - [ ] API 응답에 감사 로그 ID 포함

**E1-S5: 크리덴셜 볼트 확장**
- **설명:** Epic 0의 AES-256-GCM 볼트를 회사별(companyId)로 분리하여 LLM API 키, KIS API 키 등을 회사별로 관리
- **수용 기준:**
  - [ ] credentials 테이블에 companyId 기반 격리 적용
  - [ ] 회사별 독립 API 키 저장/조회/갱신
  - [ ] 크리덴셜 접근 시 감사 로그 기록
  - [ ] 로그에 크리덴셜 평문 노출 금지 (NFR12)

**E1-S6: 시드 데이터 + 조직 템플릿 데이터**
- **설명:** 비서실장(시스템 에이전트) + 3종 조직 템플릿("투자분석", "마케팅", "올인원") 시드 데이터 생성
- **수용 기준:**
  - [ ] 비서실장 시스템 에이전트 시드: isSystem=true, tier=manager, Soul 문서 포함
  - [ ] 3종 조직 템플릿 시드: 각 템플릿에 부서 + 에이전트 정의
  - [ ] 시드 스크립트 실행 시 멱등성 보장 (중복 실행 시 에러 없음)

**E1-S7: 테넌트 격리 통합 테스트**
- **설명:** 테넌트 격리 + RBAC가 정상 동작하는지 검증하는 통합 테스트 작성
- **수용 기준:**
  - [ ] 회사A 데이터가 회사B 쿼리에 절대 노출되지 않는 테스트
  - [ ] 역할별 API 접근 제한 테스트 (CEO가 Admin 전용 API 접근 시 403)
  - [ ] companyId 조작 시도 시 차단 테스트
  - [ ] 기존 201건 테스트 전부 통과 유지

---

### Epic 2: Dynamic Organization Management

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E2-S1 | 부서 CRUD API | 3 | FR1 | E1-S1 |
| E2-S2 | 에이전트 CRUD API | 3 | FR2-FR5 | E1-S1 |
| E2-S3 | Cascade 분석/처리 엔진 | 3 | FR6-FR8 | E2-S1, E2-S2 |
| E2-S4 | 조직 템플릿 적용 API | 2 | FR10, NFR35 | E2-S1, E2-S2 |
| E2-S5 | 조직도 트리 뷰 UI (Admin) | 3 | FR9, UX A1 | E2-S1, E2-S2 |
| E2-S6 | 부서 관리 UI (Admin) | 2 | FR1, UX A2 | E2-S1 |
| E2-S7 | 에이전트 관리 + Soul 편집 UI (Admin) | 3 | FR2-3, FR11, UX A3 | E2-S2 |
| E2-S8 | 조직 템플릿 UI + 에이전트 부서 이동 | 2 | FR4, FR10, FR12, UX A7 | E2-S4 |
| E2-S9 | CEO 앱 조직도 읽기 전용 뷰 | 2 | FR9 | E2-S5 |

**E2-S1: 부서 CRUD API**
- **설명:** departments 테이블에 대한 CRUD REST API 구현 (OrganizationService)
- **수용 기준:**
  - [ ] POST/GET/PUT/DELETE /api/departments 엔드포인트 동작
  - [ ] companyId 기반 격리 적용
  - [ ] 부서명 중복 검증 (같은 회사 내)
  - [ ] 감사 로그 자동 기록

**E2-S2: 에이전트 CRUD API**
- **설명:** agents 테이블에 대한 CRUD API + 시스템 에이전트 보호 로직 구현
- **수용 기준:**
  - [ ] POST/GET/PUT/DELETE /api/agents 엔드포인트 동작
  - [ ] 에이전트 생성 시 이름, tier, modelName, allowedTools, soulMarkdown, departmentId 지정
  - [ ] isSystem=true 에이전트 삭제 시 403 반환 (FR5)
  - [ ] 에이전트 삭제 대신 미배속 전환 (departmentId=null, isActive=false)
  - [ ] 메모리/학습 기록 아카이브 + 비용 기록 영구 보존 (FR8)

**E2-S3: Cascade 분석/처리 엔진**
- **설명:** 부서 삭제 시 영향 분석 + cascade 처리 (진행 중 작업 대기/강제 종료, 에이전트 미배속 전환)
- **수용 기준:**
  - [ ] DELETE /api/departments/:id 시 cascade 영향 분석 반환 (작업 수, 에이전트 수, 비용)
  - [ ] mode=wait_completion: 진행 중 작업 완료까지 삭제 보류
  - [ ] mode=force: 즉시 작업 종료 + 부분 결과 저장
  - [ ] 하위 에이전트 전원 미배속 전환 + 메모리 아카이브
  - [ ] 비용 기록 영구 보존 (아카이브 부서 항목으로)

**E2-S4: 조직 템플릿 적용 API**
- **설명:** 조직 템플릿 선택 시 부서 + 에이전트를 일괄 생성하는 API 구현
- **수용 기준:**
  - [ ] POST /api/org-templates/:id/apply -> 부서 + 에이전트 일괄 생성
  - [ ] 3종 템플릿("투자분석", "마케팅", "올인원") 각각 정상 적용
  - [ ] 적용 시간 < 2분 (NFR35)
  - [ ] 중복 적용 시 기존 조직과 병합 옵션 제공

**E2-S5: 조직도 트리 뷰 UI (Admin)**
- **설명:** 관리자 콘솔에서 부서-팀장-전문가 계층을 트리 형태로 표시하는 조직도 UI
- **수용 기준:**
  - [ ] 트리 뷰에서 부서 > Manager > Specialist/Worker 계층 표시
  - [ ] 에이전트 상태 뱃지 표시 (유휴/작업중/에러)
  - [ ] 미배속 에이전트 별도 영역 표시
  - [ ] 에이전트 클릭 시 상세 정보 사이드패널

**E2-S6: 부서 관리 UI (Admin)**
- **설명:** 관리자 콘솔 부서 관리 화면 (A2) -- 부서 목록, 생성/편집/삭제 폼, cascade 경고
- **수용 기준:**
  - [ ] 부서 목록 테이블 (이름, 에이전트 수, 상태)
  - [ ] 부서 생성/편집 폼
  - [ ] 부서 삭제 시 cascade 경고 팝업 (영향 분석 표시)
  - [ ] "완료 대기" / "강제 종료" 모드 선택

**E2-S7: 에이전트 관리 + Soul 편집 UI (Admin)**
- **설명:** 관리자 콘솔 에이전트 관리 화면 (A3) -- 에이전트 목록, CRUD 폼, Soul 마크다운 편집기
- **수용 기준:**
  - [ ] 에이전트 목록 (이름, 계급, 모델, 부서, 상태)
  - [ ] 에이전트 생성/편집 폼 (이름, tier, model, departmentId)
  - [ ] Soul 마크다운 편집기 (textarea + 미리보기)
  - [ ] 시스템 에이전트는 삭제 버튼 비활성화 + 시각적 구분 (FR5)

**E2-S8: 조직 템플릿 UI + 에이전트 부서 이동**
- **설명:** 조직 템플릿 선택/적용 UI (A7) + 드래그 앤 드롭 에이전트 부서 이동
- **수용 기준:**
  - [ ] 조직 템플릿 3종 카드 표시 + "적용" 버튼
  - [ ] 템플릿 적용 시 진행 상태 표시
  - [ ] 조직도에서 드래그 앤 드롭으로 에이전트 부서 이동 (FR4)
  - [ ] 부서별 표준 템플릿(Soul/도구 기본값) 설정 UI (FR12)

**E2-S9: CEO 앱 조직도 읽기 전용 뷰**
- **설명:** CEO 앱에서 현재 조직 구조를 읽기 전용으로 확인하는 화면
- **수용 기준:**
  - [ ] 트리 뷰 조직도 표시 (Admin 뷰와 동일 데이터, 편집 불가)
  - [ ] 에이전트 상태 뱃지 (유휴/작업중/에러) 실시간 반영
  - [ ] 에이전트 클릭 시 상세 정보 표시 (Soul 요약, 허용 도구)

---

### Epic 3: LLM Multi-Provider & Agent Execution

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E3-S1 | LLM 프로바이더 어댑터 (Claude/GPT/Gemini) | 3 | FR32 | Epic 0 |
| E3-S2 | LLMRouter + 3계급 자동 모델 배정 | 3 | FR30, FR31 | E3-S1 |
| E3-S3 | 프로바이더 Fallback 전략 | 2 | FR34, NFR26 | E3-S2 |
| E3-S4 | AgentRunner 무상태 실행기 | 3 | FR26, NFR11 | E3-S2, E1-S5 |
| E3-S5 | 비용 기록 시스템 (models.yaml + CostTracker) | 2 | FR38 | E3-S2 |
| E3-S6 | BatchCollector + /배치실행 | 2 | FR33 | E3-S2 |
| E3-S7 | LLM 통합 테스트 + Fallback 테스트 | 2 | NFR22, NFR26 | E3-S3, E3-S4 |

**E3-S1: LLM 프로바이더 어댑터 (Claude/GPT/Gemini)**
- **설명:** Anthropic, OpenAI, Google 3사 SDK를 래핑하는 LLMProvider 인터페이스 + 어댑터 구현
- **수용 기준:**
  - [ ] LLMProvider 인터페이스: call(request), estimateCost(tokens), supportsBatch
  - [ ] AnthropicAdapter: Claude Sonnet/Haiku 호출 + 도구 호출 응답 파싱
  - [ ] OpenAIAdapter: GPT-4.1/mini 호출 + 도구 호출 응답 파싱
  - [ ] GoogleAdapter: Gemini Pro/Flash 호출 + 도구 호출 응답 파싱
  - [ ] 각 어댑터에 타임아웃 30초 적용 (NFR3)

**E3-S2: LLMRouter + 3계급 자동 모델 배정**
- **설명:** 에이전트 계급(tier)에 따라 LLM 모델을 자동 배정하고, 수동 변경도 가능한 라우터
- **수용 기준:**
  - [ ] Manager=claude-sonnet-4-6, Specialist=claude-haiku-4-5, Worker=claude-haiku-4-5 자동 배정
  - [ ] agents.modelName 수동 설정 시 자동 배정 오버라이드 (FR31)
  - [ ] models.yaml: 모델별 input/output 1M 토큰당 가격 정의
  - [ ] 라우팅 결정 로그 기록

**E3-S3: 프로바이더 Fallback 전략**
- **설명:** 프로바이더 장애 시 자동 fallback (Claude -> GPT -> Gemini) 구현
- **수용 기준:**
  - [ ] 프로바이더 호출 실패 시 5초 내 다음 프로바이더로 전환 (NFR26)
  - [ ] fallback 순서: Claude -> GPT -> Gemini (같은 등급 모델로)
  - [ ] 모든 프로바이더 실패 시 에러 반환 + 사용자 알림
  - [ ] fallback 발생 시 감사 로그 기록

**E3-S4: AgentRunner 무상태 실행기**
- **설명:** Soul + 지식 + 도구 정의로 시스템 프롬프트를 조립하고 LLM을 호출하는 무상태 실행기
- **수용 기준:**
  - [ ] buildSystemPrompt(agent): Soul 마크다운 + allowed_tools 정의 조립
  - [ ] LLM 호출 후 도구 호출 응답 감지 -> ToolPool에 위임 -> 결과를 LLM에 피드백
  - [ ] 에이전트 프롬프트에 크리덴셜 평문 노출 금지 (NFR11)
  - [ ] 실행 결과: {content, toolsUsed, tokenCount, cost}

**E3-S5: 비용 기록 시스템 (models.yaml + CostTracker)**
- **설명:** 모든 LLM 호출마다 models.yaml 기반 비용을 산출하고 cost_records에 기록
- **수용 기준:**
  - [ ] models.yaml: 모델별 input/output 토큰 가격 정의
  - [ ] CostTracker: LLM 응답의 usage(input_tokens, output_tokens)로 비용 계산
  - [ ] cost_records 테이블에 agentId, modelName, inputTokens, outputTokens, cost, companyId 기록
  - [ ] companyId 기반 격리 적용

**E3-S6: BatchCollector + /배치실행**
- **설명:** 비긴급 LLM 요청을 큐에 수집하고, /배치실행 명령 시 일괄 전송하는 Batch API 수집기
- **수용 기준:**
  - [ ] BatchCollector: 비긴급 요청 큐에 저장 (최대 1000건 NFR19)
  - [ ] /배치실행 명령 시 큐의 모든 요청 일괄 전송
  - [ ] /배치상태 명령 시 큐 현황 반환 (대기/진행/완료 건수)
  - [ ] Anthropic Batch API 활용 (50% 할인)

**E3-S7: LLM 통합 테스트 + Fallback 테스트**
- **설명:** 3사 LLM 호출 성공 + fallback 전환 동작을 검증하는 통합 테스트
- **수용 기준:**
  - [ ] Claude/GPT/Gemini 각각 단독 호출 성공 테스트
  - [ ] 프로바이더 모킹을 통한 fallback 전환 테스트
  - [ ] 비용 기록 정확성 테스트 (models.yaml 가격 기반)
  - [ ] AgentRunner + 도구 호출 연동 테스트

---

### Epic 4: Tool System

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E4-S1 | ToolPool 레지스트리 + Zod 검증 프레임워크 | 3 | FR26 | E3-S4 |
| E4-S2 | 서버 사이드 allowed_tools 권한 검증 | 2 | FR27, NFR14 | E4-S1, E2-S2 |
| E4-S3 | 공통 도구 15종 구현 (common) | 3 | FR26 | E4-S1 |
| E4-S4 | 도메인 도구 15종 구현 (analysis/legal/tech) | 3 | FR26 | E4-S1 |
| E4-S5 | 도구 호출 로그 시스템 | 2 | FR29 | E4-S1 |
| E4-S6 | 관리자 콘솔 도구 관리 UI (A5) | 3 | FR28, UX A5 | E4-S1, E4-S2 |

**E4-S1: ToolPool 레지스트리 + Zod 검증 프레임워크**
- **설명:** 도구 등록, Zod 파라미터 검증, 실행, 결과 반환(4000자 초과 시 요약) 프레임워크
- **수용 기준:**
  - [ ] ToolDefinition 인터페이스: name, description, parameters(Zod), execute()
  - [ ] ToolPool.register(tool): 도구 등록
  - [ ] ToolPool.execute(name, params): Zod 검증 -> 실행 -> 결과 반환
  - [ ] 결과 > 4000자 시 자동 요약 절삭

**E4-S2: 서버 사이드 allowed_tools 권한 검증**
- **설명:** 에이전트가 LLM 응답에서 도구를 호출할 때 서버에서 allowed_tools 검증
- **수용 기준:**
  - [ ] AgentRunner가 도구 호출 전 agent.allowedTools에 포함 여부 서버에서 검증
  - [ ] 권한 없는 도구 호출 시 자동 차단 + 로그 기록
  - [ ] 차단 시 에이전트에게 "권한 없음" 메시지 반환 (재시도 방지)

**E4-S3: 공통 도구 15종 구현 (common)**
- **설명:** real_web_search, calculator, translator, spreadsheet_tool, chart_generator, email_sender, file_manager, date_utils, json_parser, text_summarizer, url_fetcher, markdown_converter, regex_matcher, unit_converter, random_generator
- **수용 기준:**
  - [ ] 15종 도구 각각 Zod 스키마 + execute() 구현
  - [ ] 각 도구 단위 테스트 통과
  - [ ] real_web_search: 실제 웹 검색 결과 반환

**E4-S4: 도메인 도구 15종 구현 (analysis/legal/tech)**
- **설명:** stock_price_checker, news_aggregator, sentiment_analyzer, company_analyzer, market_overview, law_search, contract_reviewer, trademark_similarity, patent_search, uptime_monitor, security_scanner, code_quality, dns_lookup, ssl_checker, port_scanner
- **수용 기준:**
  - [ ] 15종 도구 각각 Zod 스키마 + execute() 구현
  - [ ] 각 도구 단위 테스트 통과
  - [ ] 외부 API 연동 도구는 타임아웃 설정

**E4-S5: 도구 호출 로그 시스템**
- **설명:** 모든 도구 호출을 tool_invocations 테이블에 기록하는 로그 시스템
- **수용 기준:**
  - [ ] tool_invocations에 agentId, toolName, input, output, duration, status, companyId 기록
  - [ ] 크리덴셜/API 키 자동 마스킹 (NFR12)
  - [ ] 쿼리 API: 에이전트별/도구별/시간별 필터

**E4-S6: 관리자 콘솔 도구 관리 UI (A5)**
- **설명:** 관리자 콘솔에서 도구 카탈로그 조회 + 에이전트별 허용 도구 체크박스 매트릭스
- **수용 기준:**
  - [ ] 도구 카탈로그: 전체 도구 목록 (이름, 카테고리, 설명)
  - [ ] 에이전트별 체크박스 매트릭스: 에이전트 x 도구 권한 설정
  - [ ] 권한 변경 시 감사 로그 기록
  - [ ] 카테고리별 일괄 선택/해제

---

### Epic 5: Orchestration Engine & Command Center

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E5-S1 | CommandRouter + 명령 타입 분류 | 2 | FR13, FR15 | E2-S2 |
| E5-S2 | ChiefOfStaff 자동 분류 + 위임 | 3 | FR19 | E3-S4, E5-S1 |
| E5-S3 | Manager 위임 + 병렬 Specialist 실행 | 3 | FR20, FR21 | E5-S2, E4-S1 |
| E5-S4 | Manager 종합 + ChiefOfStaff 품질 검수 | 3 | FR22, FR50, FR51 | E5-S3 |
| E5-S5 | /전체 + /순차 명령 처리 | 2 | FR24, FR25 | E5-S3 |
| E5-S6 | 딥워크 자율 다단계 작업 | 2 | FR23 | E3-S4, E4-S1 |
| E5-S7 | 사령관실 UI: 채팅 입력 + @멘션 + 슬래시 | 3 | FR13-15, UX #2 | E5-S1 |
| E5-S8 | 위임 체인 실시간 표시 (WebSocket) | 3 | FR17, NFR4 | E5-S2 |
| E5-S9 | 보고서 뷰 + 피드백 | 2 | FR18, FR22 | E5-S4 |
| E5-S10 | 프리셋 CRUD + 슬래시 팝업 | 2 | FR16, FR15 | E5-S7 |
| E5-S11 | 오케스트레이션 통합 테스트 | 2 | NFR20 | E5-S4 |

**E5-S1: CommandRouter + 명령 타입 분류**
- **설명:** POST /api/commands로 수신된 명령을 타입별로 분류 (일반텍스트/@멘션/슬래시)
- **수용 기준:**
  - [ ] 명령 타입 분류: text(일반), mention(@), slash(/)
  - [ ] @멘션 파싱: "@CIO 분석해줘" -> targetAgentId + text 추출
  - [ ] 슬래시 파싱: "/전체 시장 분석" -> slashType + text 추출
  - [ ] commands 테이블에 명령 저장 (companyId, userId, text, type, status)

**E5-S2: ChiefOfStaff 자동 분류 + 위임**
- **설명:** 비서실장 에이전트가 LLM으로 명령을 분석하여 적합한 부서/Manager에게 위임
- **수용 기준:**
  - [ ] ChiefOfStaff.classify(command): LLM 호출 -> {departmentId, managerId, priority, taskBreakdown}
  - [ ] 분류 결과에 따라 해당 Manager에게 TaskRequest 전송
  - [ ] @멘션 시 분류 건너뛰고 직접 해당 Manager에게 위임
  - [ ] WebSocket command 채널로 "분류 중..." 상태 전송

**E5-S3: Manager 위임 + 병렬 Specialist 실행**
- **설명:** Manager가 작업을 분해하여 하위 Specialist에게 병렬 배분 + 결과 수집
- **수용 기준:**
  - [ ] Manager.delegate(task): LLM 호출 -> 하위 작업 분해 + Specialist 배정
  - [ ] Promise.allSettled로 Specialist 병렬 실행 (부서당 최대 10명 NFR7)
  - [ ] Manager 자체 분석 수행 (#007 5번째 분석가)
  - [ ] WebSocket delegation 채널로 각 Specialist 진행 상태 전송

**E5-S4: Manager 종합 + ChiefOfStaff 품질 검수**
- **설명:** Manager 결과 종합 + 비서실장 5항목 품질 검수 + 자동 재작업
- **수용 기준:**
  - [ ] Manager.synthesize(): 자체 분석 + Specialist 결과 종합 -> 부서 보고서
  - [ ] ChiefOfStaff.review(): 5항목 검수 (결론/근거/리스크/형식/논리)
  - [ ] FAIL 시 자동 재작업 (최대 2회) -> 2회 실패 후 경고 플래그 달아 전달
  - [ ] quality_reviews 테이블에 검수 결과 기록

**E5-S5: /전체 + /순차 명령 처리**
- **설명:** /전체(모든 Manager 동시 위임) + /순차(Manager 순차 위임) 명령 구현
- **수용 기준:**
  - [ ] /전체: 모든 활성 Manager에게 동시 위임 -> 결과 종합
  - [ ] /순차: Manager 순차 위임 -> 이전 결과를 다음 Manager에게 전달 -> 누적 종합
  - [ ] WebSocket으로 진행 상태 실시간 전송

**E5-S6: 딥워크 자율 다단계 작업**
- **설명:** 에이전트가 자율적으로 다단계 작업(계획 -> 수집 -> 분석 -> 초안 -> 최종)을 수행
- **수용 기준:**
  - [ ] 단계별 자율 진행: 도구 호출 -> 결과 분석 -> 추가 도구 호출 반복
  - [ ] 최대 도구 호출 횟수 제한 (기본 10회)
  - [ ] 각 단계별 WebSocket 상태 전송
  - [ ] 전체 체인 5분 타임아웃 (NFR2)

**E5-S7: 사령관실 UI: 채팅 입력 + @멘션 + 슬래시**
- **설명:** CEO 앱 사령관실의 채팅형 입력 UI -- @멘션 자동완성, 슬래시 명령 팝업
- **수용 기준:**
  - [ ] 채팅형 입력 바 (텍스트 입력 + 전송 버튼)
  - [ ] @ 입력 시 활성 Manager 목록 자동완성 팝업
  - [ ] / 입력 시 슬래시 8종 명령 팝업
  - [ ] 명령 전송 후 대화 이력에 추가

**E5-S8: 위임 체인 실시간 표시 (WebSocket)**
- **설명:** 오케스트레이션 진행 중 에이전트 이름 + 단계 + 경과 시간 + 도구 호출을 실시간 표시
- **수용 기준:**
  - [ ] WebSocket command/delegation/tool 3채널 구독
  - [ ] 위임 체인 시각화: 에이전트 이름 + 현재 단계 + 경과 시간
  - [ ] 도구 호출 시 도구 이름 + 상태 표시
  - [ ] < 500ms 이벤트 전달 (NFR4)

**E5-S9: 보고서 뷰 + 피드백**
- **설명:** 최종 보고서 마크다운 렌더링 + 품질 뱃지(PASS/FAIL) + 비용 요약 + 피드백
- **수용 기준:**
  - [ ] 마크다운 보고서 렌더링
  - [ ] 품질 게이트 뱃지 (PASS=초록, FAIL=빨강, WARNING=노랑)
  - [ ] 비용 요약 (토큰 수 + 비용 합계)
  - [ ] thumbs up/down 피드백 버튼 (FR18)

**E5-S10: 프리셋 CRUD + 슬래시 팝업**
- **설명:** 자주 쓰는 명령을 프리셋으로 저장/실행 + 슬래시 명령 전체 팝업 UI
- **수용 기준:**
  - [ ] 프리셋 CRUD API: POST/GET/PUT/DELETE /api/presets
  - [ ] 프리셋 목록 UI + 클릭 시 사령관실에 명령 자동 입력
  - [ ] 프리셋에서 직접 실행 기능
  - [ ] /명령어 입력 시 전체 슬래시 명령 목록 표시

**E5-S11: 오케스트레이션 통합 테스트**
- **설명:** 전체 오케스트레이션 파이프라인 E2E 테스트
- **수용 기준:**
  - [ ] "삼성전자 분석" -> 비서실장 분류 -> Manager 위임 -> Specialist 병렬 -> 종합 -> 검수 -> 보고서
  - [ ] @멘션 직접 지정 동작 테스트
  - [ ] /전체, /순차 명령 동작 테스트
  - [ ] 타임아웃, 에러 복구 시나리오 테스트

---

### Epic 6: Dashboard & Activity Monitoring

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E6-S1 | 대시보드 집계 API (4개 요약 카드) | 2 | FR35 | E5-S4 |
| E6-S2 | 작전현황 대시보드 UI | 3 | FR35-36, FR41, UX #1 | E6-S1 |
| E6-S3 | 통신로그 4탭 API | 2 | FR37 | E5-S4, E4-S5 |
| E6-S4 | 통신로그 4탭 UI | 3 | FR37, UX #7 | E6-S3 |
| E6-S5 | WebSocket 실시간 대시보드 갱신 | 2 | FR35, NFR4 | E6-S2 |
| E6-S6 | 퀵 액션 + 만족도 차트 | 2 | FR41 | E6-S2 |

**E6-S1: 대시보드 집계 API**
- **수용 기준:** 4개 요약 카드(작업 현황/비용/에이전트 수/연동 상태) API, AI 사용량 프로바이더별 집계 API, 예산 진행률 API

**E6-S2: 작전현황 대시보드 UI**
- **수용 기준:** 4개 요약 카드 렌더링, AI 사용량 막대 그래프 (프로바이더별), 예산 진행 바 (초록→노랑→빨강), UI 초기 로딩 < 3초 (NFR5)

**E6-S3: 통신로그 4탭 API**
- **수용 기준:** 활동(에이전트 활동 로그), 통신(위임 기록 from→to, 비용, 토큰), QA(품질 검수 결과), 도구(도구 호출 기록) 각 탭 필터+페이지네이션 API

**E6-S4: 통신로그 4탭 UI**
- **수용 기준:** 4탭 네비게이션, 각 탭별 테이블 + 필터, 상세 모달 (클릭 시), 실시간 새 항목 자동 추가

**E6-S5: WebSocket 실시간 대시보드 갱신**
- **수용 기준:** cost + agent-status WebSocket 채널 구독, 새 데이터 발생 시 카드/차트 자동 갱신 (새로고침 불필요)

**E6-S6: 퀵 액션 + 만족도 차트**
- **수용 기준:** 퀵 액션 버튼(루틴+시스템 명령) 클릭 시 사령관실에 명령 자동 입력, 만족도 원형 차트(thumbs up/down 집계), 최근 사용 명령어 표시

---

### Epic 7: Cost Management System

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E7-S1 | 3축 비용 집계 API | 2 | FR38 | E3-S5 |
| E7-S2 | 예산 한도 설정 + 자동 차단 | 3 | FR39 | E7-S1 |
| E7-S3 | 비용 대시보드 UI (Admin A6) | 3 | FR40, UX A6 | E7-S1 |
| E7-S4 | CEO 앱 비용 카드 + 드릴다운 | 2 | FR40 | E7-S1 |
| E7-S5 | 예산 초과 WebSocket 알림 | 1 | FR39 | E7-S2 |

**E7-S1: 3축 비용 집계 API**
- **수용 기준:** GET /api/costs/summary 에이전트별/모델별/부서별 실시간 합산, 일일/주간/월간 집계, companyId 격리

**E7-S2: 예산 한도 설정 + 자동 차단**
- **수용 기준:** 일일/월 예산 한도 설정 API, 한도 도달 시 LLM 호출 자동 차단, 차단 시 WebSocket cost 채널로 CEO 알림, 예산 초과 발생률 < 5% (NFR33)

**E7-S3: 비용 대시보드 UI (Admin A6)**
- **수용 기준:** 도넛 차트(부서별 비용), 막대 차트(에이전트별 비용), 예산 진행 바 + 한도 설정 폼, 기간 필터(일/주/월)

**E7-S4: CEO 앱 비용 카드 + 드릴다운**
- **수용 기준:** 작전현황 내 비용 카드 (오늘 비용 + 누적), 클릭 시 부서별/에이전트별 드릴다운

**E7-S5: 예산 초과 WebSocket 알림**
- **수용 기준:** 예산 80%/100% 도달 시 WebSocket cost 채널로 알림 전송, CEO 앱에 토스트 알림 표시

---

### Epic 8: Quality Gate Enhancement

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E8-S1 | quality_rules.yaml 정의 + 파서 | 2 | FR53 | E5-S4 |
| E8-S2 | 자동 규칙 검수 엔진 (yaml + LLM 하이브리드) | 3 | FR53, FR54 | E8-S1 |
| E8-S3 | 환각 탐지 자동화 | 2 | FR54 | E8-S2, E4-S1 |
| E8-S4 | 프롬프트 인젝션 방어 | 2 | FR55 | E3-S4 |
| E8-S5 | QA 탭 강화 UI | 2 | FR52 | E6-S4 |

**E8-S1~S5 요약:**
- S1: yaml 규칙 파일 구조 정의(완전성/정확성/형식) + 파싱 로직
- S2: yaml 규칙 기반 자동 검수 + LLM 기반 세밀 검수 하이브리드 엔진
- S3: 도구 조회 실제 데이터 vs 에이전트 응답 비교로 환각 탐지
- S4: 시스템/사용자 프롬프트 분리, 출력에서 크리덴셜/시스템프롬프트 패턴 필터링
- S5: 통신로그 QA 탭에서 규칙별 검수 상세 결과 확인 UI

---

### Epic 9: Multi-tenancy & Admin Console

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E9-S1 | 회사 CRUD API | 2 | FR43 | E1-S2 |
| E9-S2 | Human 직원 관리 API | 3 | FR44, FR45 | E9-S1 |
| E9-S3 | 직원 사령관실 접근 제한 | 2 | FR45 | E9-S2, E5-S7 |
| E9-S4 | 직원 관리 UI (Admin A4) | 2 | FR44, UX A4 | E9-S2 |
| E9-S5 | 회사 설정 UI (Admin A8) | 2 | UX A8 | E9-S1 |
| E9-S6 | Admin ↔ CEO 앱 전환 | 2 | | E9-S1 |
| E9-S7 | 온보딩 위저드 | 2 | NFR34 | E2-S4, E9-S6 |
| E9-S8 | CEO 앱 설정 화면 (UX #14) | 2 | UX #14 | E9-S1 |

**E9-S1~S8 요약:**
- S1: 회사 생성 -> companyId 발급 -> 관리자 계정 생성 API
- S2: 직원 초대 + 워크스페이스 생성 + 부서별 접근 권한 API
- S3: 직원이 @멘션에 자기 부서 Manager만, 비용은 자기 부서만 보이도록 제한
- S4: 직원 테이블 + 초대 폼 + 권한 체크리스트 UI
- S5: 회사 정보 + API 키 관리 UI
- S6: JWT 세션 공유로 Admin ↔ CEO 앱 재로그인 없이 전환
- S7: Admin 첫 접속 시 5단계 온보딩 가이드 (10분 이내 목표 NFR34)
- S8: CEO 앱 설정 화면 (프로필, 알림, 투자 성향 등)

---

### Epic 10: Strategy Room & Trading

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E10-S1 | 전략실 스키마 (watchlist, portfolio, trade_orders) | 2 | FR56 | E1-S1 |
| E10-S2 | KIS 증권 API 어댑터 (시세 + 주문) | 3 | FR58, NFR27 | E1-S5 |
| E10-S3 | Finance 도구 5종 구현 | 3 | FR26 | E4-S1 |
| E10-S4 | CIO+VECTOR 분리 오케스트레이션 | 3 | FR57, FR58 | E5-S3, E10-S2 |
| E10-S5 | 자율/승인 실행 + 투자 성향 리스크 제어 | 2 | FR59, FR60 | E10-S4 |
| E10-S6 | 실거래/모의거래 분리 | 2 | FR61 | E10-S2 |
| E10-S7 | 전략실 UI: 포트폴리오 + 관심종목 | 3 | FR56, UX #3 | E10-S1 |
| E10-S8 | 매매 승인/이력 UI | 2 | FR59, FR62 | E10-S5 |

---

### Epic 11: AGORA Debate Engine

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E11-S1 | AGORA 엔진: 라운드 관리 + 합의 판정 | 3 | FR63 | E3-S4 |
| E11-S2 | /토론 + /심층토론 명령 통합 | 2 | FR63 | E5-S1, E11-S1 |
| E11-S3 | WebSocket debate 채널 스트리밍 | 2 | FR63 | E11-S1 |
| E11-S4 | AGORA UI: 라운드 타임라인 + 발언 카드 | 3 | FR63, UX #5 | E11-S3 |
| E11-S5 | Diff 뷰 + 토론 결과 사령관실 삽입 | 2 | FR63 | E11-S4 |

---

### Epic 12: SNS Publishing

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E12-S1 | SNS 콘텐츠 관리 API (생성/승인/반려) | 2 | FR65 | E5-S1 |
| E12-S2 | Marketing 도구 3종 구현 | 2 | FR26 | E4-S1 |
| E12-S3 | Selenium 자동 발행 엔진 (5개 플랫폼) | 5 | FR65, NFR29 | E12-S1 |
| E12-S4 | 예약 발행 큐 + 카드뉴스 | 2 | FR65 | E12-S1 |
| E12-S5 | SNS 통신국 UI | 3 | FR65, UX #6 | E12-S1 |

---

### Epic 13: SketchVibe Canvas

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E13-S1 | Cytoscape.js 캔버스: 8종 노드 + 연결 | 3 | FR64 | |
| E13-S2 | Mermaid ↔ Cytoscape 양방향 변환 | 3 | FR64 | E13-S1 |
| E13-S3 | MCP SSE 연동: AI 실시간 캔버스 조작 | 3 | FR64 | E13-S2, E3-S4 |
| E13-S4 | 저장/불러오기 + 지식 베이스 연동 | 2 | FR64 | E13-S1 |
| E13-S5 | SketchVibe UI 통합 (사령관실 연동) | 2 | FR64, UX #4 | E13-S3, E5-S7 |

---

### Epic 14: Cron Scheduler & ARGOS

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E14-S1 | 크론 스케줄러 서비스 + CRUD API | 3 | FR66 | E5-S1 |
| E14-S2 | 크론 실행 엔진 (명령 자동 실행 + 결과 기록) | 2 | FR66 | E14-S1 |
| E14-S3 | ARGOS 트리거 조건 설정 + 자동 수집 | 3 | FR67 | E4-S1 |
| E14-S4 | 크론기지 UI (UX #11) | 2 | FR66, UX #11 | E14-S1 |
| E14-S5 | ARGOS UI (UX #12) | 2 | FR67, UX #12 | E14-S3 |
| E14-S6 | 상태 바: 데이터/AI OK/NG + 비용 | 1 | FR67 | E14-S3 |

---

### Epic 15: Telegram Integration

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E15-S1 | 텔레그램 Bot API Webhook 연동 | 2 | FR68 | E5-S1 |
| E15-S2 | 텔레그램 명령 파싱 (@멘션 + 텍스트) | 2 | FR68 | E15-S1 |
| E15-S3 | 결과 전송 + 크론 결과 자동 전송 | 2 | FR68 | E15-S2, E14-S2 |

---

### Epic 16: Knowledge Base & Agent Memory

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E16-S1 | 정보국 스키마 (knowledge_docs, agent_memories) | 1 | FR69 | E1-S1 |
| E16-S2 | 문서 저장소 CRUD API + 폴더 관리 | 2 | FR69 | E16-S1 |
| E16-S3 | 부서별 지식 자동 주입 (AgentRunner 연동) | 3 | FR69 | E16-S2, E3-S4 |
| E16-S4 | 에이전트 메모리: 자동 학습 추출 + 저장 | 3 | FR70 | E16-S1, E5-S4 |
| E16-S5 | 정보국 UI (UX #13) + 드래그&드롭 업로드 | 2 | FR69, UX #13 | E16-S2 |
| E16-S6 | 유사 작업 시 이전 학습 자동 참고 | 2 | FR70 | E16-S4 |

---

### Epic 17: History, Archive & Performance

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E17-S1 | 작전일지 API (검색/필터/북마크/태그) | 2 | FR71 | E5-S1 |
| E17-S2 | 작전일지 UI + A/B 비교 + 리플레이 | 3 | FR71, UX #8 | E17-S1 |
| E17-S3 | 기밀문서 API (아카이브/필터/유사 문서) | 2 | FR72 | E5-S4 |
| E17-S4 | 기밀문서 UI | 2 | FR72, UX #9 | E17-S3 |
| E17-S5 | 전력분석 API (Soul Gym + 성능 지표) | 2 | FR73 | E3-S5, E5-S4 |
| E17-S6 | 전력분석 UI + Soul Gym 제안 | 3 | FR73, UX #10 | E17-S5 |
| E17-S7 | 품질 대시보드 (통과율/평균점수/실패목록) | 2 | FR73 | E5-S4, E8-S2 |

---

### Epic 18: Workflow Automation

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E18-S1 | 워크플로우 CRUD API + 다단계 스텝 정의 | 3 | FR74 | E5-S1 |
| E18-S2 | 워크플로우 실행 엔진 (순차/병렬 스텝) | 3 | FR74 | E18-S1, E14-S2 |
| E18-S3 | 예측 워크플로우: 패턴 분석 + 자동 제안 | 2 | FR75 | E18-S1 |
| E18-S4 | 워크플로우 빌더 UI | 3 | FR74 | E18-S1 |
| E18-S5 | 실행 상태 실시간 모니터링 UI | 2 | FR74 | E18-S2 |

---

### Epic 19: Internal Messenger

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E19-S1 | 메신저 스키마 (conversations, messages) | 1 | FR76 | E9-S2 |
| E19-S2 | 실시간 채팅 API + WebSocket 채널 | 3 | FR76 | E19-S1 |
| E19-S3 | 1:1 + 그룹 메시지 UI | 3 | FR76 | E19-S2 |
| E19-S4 | AI 분석 결과 공유 (보고서 → 메신저 전달) | 2 | FR76 | E19-S3, E5-S9 |
| E19-S5 | companyId 기반 채팅 격리 | 1 | FR76 | E19-S2 |

---

### Epic 20: Platform Extensions

| ID | Title | SP | PRD | 의존성 |
|----|-------|-----|-----|--------|
| E20-S1 | 조직 템플릿 마켓 API + UI | 3 | Vision | E2-S4 |
| E20-S2 | 에이전트 마켓플레이스 (Soul/도구 교환) | 3 | Vision | E2-S7 |
| E20-S3 | 공개 API + API 키 발급 | 3 | Vision | E9-S1 |
| E20-S4 | 워크플로우 빌더 (노코드 비주얼) | 5 | Vision | E18-S4 |
| E20-S5 | 플랫폼 통합 테스트 | 2 | Vision | E20-S1~S4 |

---

## Story Count Summary

| Epic | Stories | Total SP |
|------|---------|----------|
| Epic 1: Data Layer & Security | 7 | 16 |
| Epic 2: Dynamic Organization | 9 | 23 |
| Epic 3: LLM & Agent Execution | 7 | 17 |
| Epic 4: Tool System | 6 | 16 |
| Epic 5: Orchestration & Command | 11 | 27 |
| Epic 6: Dashboard & Monitoring | 6 | 14 |
| Epic 7: Cost Management | 5 | 11 |
| Epic 8: Quality Gate Enhancement | 5 | 11 |
| Epic 9: Multi-tenancy & Admin | 8 | 17 |
| Epic 10: Strategy & Trading | 8 | 20 |
| Epic 11: AGORA Debate | 5 | 12 |
| Epic 12: SNS Publishing | 5 | 14 |
| Epic 13: SketchVibe Canvas | 5 | 13 |
| Epic 14: Cron & ARGOS | 6 | 13 |
| Epic 15: Telegram | 3 | 6 |
| Epic 16: Knowledge & Memory | 6 | 13 |
| Epic 17: History/Archive/Perf | 7 | 16 |
| Epic 18: Workflow Automation | 5 | 13 |
| Epic 19: Internal Messenger | 5 | 10 |
| Epic 20: Platform Extensions | 5 | 16 |
| **Total** | **124** | **298 SP** |

**Phase 분포:**
- P0 (Epic 1~5): 40 stories, 99 SP
- P1 (Epic 6~9): 24 stories, 53 SP
- Phase 2 (Epic 10~18): 50 stories, 120 SP
- Phase 3 (Epic 19~20): 10 stories, 26 SP

---

## Final Validation

> 모든 기획 산출물(PRD, Architecture, UX Design, v1 Feature Spec)과 에픽/스토리를 교차 검증하여 누락, 불일치, 리스크를 식별한다.

---

### 1. PRD Functional Requirements Coverage Matrix

모든 76개 FR이 최소 1개 스토리에 매핑되었는지 검증.

| FR | 설명 | Story | Epic | Phase | Status |
|----|------|-------|------|-------|--------|
| FR1 | 부서 CRUD | E2-S1, E2-S6 | Epic 2 | P0 | Covered |
| FR2 | 에이전트 생성 (이름/계급/모델/도구/Soul) | E2-S2, E2-S7 | Epic 2 | P0 | Covered |
| FR3 | 에이전트 수정/삭제 | E2-S2, E2-S7 | Epic 2 | P0 | Covered |
| FR4 | 에이전트 부서 이동 | E2-S8 | Epic 2 | P0 | Covered |
| FR5 | 시스템 에이전트 삭제 차단 | E2-S2, E2-S7 | Epic 2 | P0 | Covered |
| FR6 | cascade 영향 분석 | E2-S3, E2-S6 | Epic 2 | P0 | Covered |
| FR7 | cascade 완료 대기/강제 종료 | E2-S3, E2-S6 | Epic 2 | P0 | Covered |
| FR8 | 메모리 아카이브 + 비용 영구 보존 + 미배속 전환 | E2-S2, E2-S3 | Epic 2 | P0 | Covered |
| FR9 | 조직도 트리 뷰 | E2-S5, E2-S9 | Epic 2 | P0 | Covered |
| FR10 | 조직 템플릿 일괄 생성 | E2-S4, E2-S8 | Epic 2 | P0 | Covered |
| FR11 | Soul 편집 | E2-S7 | Epic 2 | P0 | Covered |
| FR12 | 부서별 표준 템플릿 | E2-S8 | Epic 2 | P0 | Covered |
| FR13 | 자연어 텍스트 명령 | E5-S1, E5-S7 | Epic 5 | P0 | Covered |
| FR14 | @멘션 특정 Manager 지정 | E5-S1, E5-S7 | Epic 5 | P0 | Covered |
| FR15 | 슬래시 8종 | E5-S1, E5-S7, E5-S10 | Epic 5 | P0 | Covered |
| FR16 | 프리셋 저장/실행 | E5-S10 | Epic 5 | P0 | Covered |
| FR17 | 위임 체인 실시간 표시 | E5-S8 | Epic 5 | P0 | Covered |
| FR18 | thumbs up/down 피드백 | E5-S9 | Epic 5 | P0 | Covered |
| FR19 | 비서실장 자동 분류 + 위임 | E5-S2 | Epic 5 | P0 | Covered |
| FR20 | Manager 병렬 배분 | E5-S3 | Epic 5 | P0 | Covered |
| FR21 | Manager 자체 분석 (#007) | E5-S3 | Epic 5 | P0 | Covered |
| FR22 | 비서실장 최종 보고서 (#010) | E5-S4, E5-S9 | Epic 5 | P0 | Covered |
| FR23 | 딥워크 자율 다단계 | E5-S6 | Epic 5 | P0 | Covered |
| FR24 | /전체 동시 위임 | E5-S5 | Epic 5 | P0 | Covered |
| FR25 | /순차 순차 위임 | E5-S5 | Epic 5 | P0 | Covered |
| FR26 | 에이전트 도구 호출 | E4-S1, E4-S3, E4-S4 | Epic 4 | P0 | Covered |
| FR27 | 서버 사이드 도구 권한 강제 | E4-S2 | Epic 4 | P0 | Covered |
| FR28 | 에이전트별 허용 도구 설정 | E4-S6 | Epic 4 | P0 | Covered |
| FR29 | 도구 호출 로그 | E4-S5 | Epic 4 | P0 | Covered |
| FR30 | 계급별 LLM 모델 자동 배정 | E3-S2 | Epic 3 | P0 | Covered |
| FR31 | LLM 모델 수동 변경 | E3-S2 | Epic 3 | P0 | Covered |
| FR32 | 3사 프로바이더 라우팅 | E3-S1, E3-S2 | Epic 3 | P0 | Covered |
| FR33 | Batch API 일괄 처리 | E3-S6 | Epic 3 | P0 | Covered |
| FR34 | 프로바이더 fallback | E3-S3 | Epic 3 | P0 | Covered |
| FR35 | 홈 대시보드 요약 카드 | E6-S1, E6-S2 | Epic 6 | P1 | Covered |
| FR36 | AI 사용량 그래프 | E6-S2 | Epic 6 | P1 | Covered |
| FR37 | 통신로그 4탭 | E6-S3, E6-S4 | Epic 6 | P1 | Covered |
| FR38 | 3축 비용 추적 | E7-S1, E3-S5 | Epic 7 | P1 | Covered |
| FR39 | 예산 한도 + 자동 차단 | E7-S2, E7-S5 | Epic 7 | P1 | Covered |
| FR40 | 비용 차트 시각화 | E7-S3, E7-S4 | Epic 7 | P1 | Covered |
| FR41 | 만족도 통계 대시보드 | E6-S6 | Epic 6 | P1 | Covered |
| FR42 | companyId 데이터 격리 | E1-S2, E1-S7 | Epic 1 | P0 | Covered |
| FR43 | 회사 생성 + 관리자 계정 | E9-S1 | Epic 9 | P1 | Covered |
| FR44 | Human 직원 워크스페이스 | E9-S2, E9-S4 | Epic 9 | P1 | Covered |
| FR45 | 직원 자기 워크스페이스 제한 | E9-S3 | Epic 9 | P1 | Covered |
| FR46 | AES-256-GCM 크리덴셜 | E1-S5 | Epic 1 | P0 | Covered |
| FR47 | 크리덴셜 프롬프트 노출 금지 | E3-S4, E8-S4 | Epic 3/8 | P0/P1 | Covered |
| FR48 | JWT RBAC | E1-S3 | Epic 1 | P0 | Covered |
| FR49 | 삭제 불가 감사 로그 | E1-S4 | Epic 1 | P0 | Covered |
| FR50 | 비서실장 5항목 검수 | E5-S4 | Epic 5 | P0 | Covered |
| FR51 | 자동 재작업 | E5-S4 | Epic 5 | P0 | Covered |
| FR52 | QA 탭 검수 결과 확인 | E8-S5 | Epic 8 | P1 | Covered |
| FR53 | quality_rules.yaml 자동 검수 | E8-S1, E8-S2 | Epic 8 | P1 | Covered |
| FR54 | 환각 탐지 | E8-S3 | Epic 8 | P1 | Covered |
| FR55 | 프롬프트 인젝션 방어 | E8-S4 | Epic 8 | P1 | Covered |
| FR56 | 포트폴리오 대시보드 | E10-S1, E10-S7 | Epic 10 | Phase 2 | Covered |
| FR57 | CIO + 4명 전문가 병렬 투자 분석 | E10-S4 | Epic 10 | Phase 2 | Covered |
| FR58 | KIS API 매매 주문 | E10-S2, E10-S4 | Epic 10 | Phase 2 | Covered |
| FR59 | 자율/승인 실행 모드 | E10-S5, E10-S8 | Epic 10 | Phase 2 | Covered |
| FR60 | 투자 성향 리스크 제어 | E10-S5 | Epic 10 | Phase 2 | Covered |
| FR61 | 실거래/모의거래 분리 | E10-S6 | Epic 10 | Phase 2 | Covered |
| FR62 | 주문 이력 영구 보존 | E10-S8 | Epic 10 | Phase 2 | Covered |
| FR63 | AGORA 토론 | E11-S1~S5 | Epic 11 | Phase 2 | Covered |
| FR64 | SketchVibe 캔버스 | E13-S1~S5 | Epic 13 | Phase 2 | Covered |
| FR65 | SNS 5개 플랫폼 발행 | E12-S1~S5 | Epic 12 | Phase 2 | Covered |
| FR66 | 크론 스케줄러 | E14-S1, E14-S2, E14-S4 | Epic 14 | Phase 2 | Covered |
| FR67 | ARGOS 트리거 수집 | E14-S3, E14-S5, E14-S6 | Epic 14 | Phase 2 | Covered |
| FR68 | 텔레그램 명령/수신 | E15-S1~S3 | Epic 15 | Phase 2 | Covered |
| FR69 | 정보국 RAG 지식 관리 | E16-S1~S3, E16-S5 | Epic 16 | Phase 2 | Covered |
| FR70 | 에이전트 자동 학습 메모리 | E16-S4, E16-S6 | Epic 16 | Phase 2 | Covered |
| FR71 | 작전일지 이력/리플레이 | E17-S1, E17-S2 | Epic 17 | Phase 2 | Covered |
| FR72 | 기밀문서 아카이브 | E17-S3, E17-S4 | Epic 17 | Phase 2 | Covered |
| FR73 | 전력분석 Soul Gym | E17-S5~S7 | Epic 17 | Phase 2 | Covered |
| FR74 | 워크플로우 파이프라인 | E18-S1, E18-S2, E18-S4 | Epic 18 | Phase 2 | Covered |
| FR75 | 예측 워크플로우 (#004) | E18-S3 | Epic 18 | Phase 2 | Covered |
| FR76 | 사내 메신저 | E19-S1~S5 | Epic 19 | Phase 3 | Covered |

**Result: 76/76 FRs covered. 0 gaps.**

---

### 2. v1 Feature Spec Coverage Matrix

v1-feature-spec.md의 22개 기능 영역 + 7개 CEO 아이디어가 모두 스토리에 매핑되었는지 검증.

| # | v1 Feature | Story Coverage | Epic | Phase | Status |
|---|-----------|----------------|------|-------|--------|
| 1 | 사령관실 (명령 입력/라우팅/@멘션/슬래시/프리셋) | E5-S1, E5-S7, E5-S10 | Epic 5 | P0 | Covered |
| 2 | 에이전트 조직 (3계급/Soul/딥워크) | E2-S1~S9, E5-S6 | Epic 2/5 | P0 | Covered |
| 3 | 도구 시스템 (125+/권한/ToolPool) | E4-S1~S6, E10-S3, E12-S2 | Epic 4/10/12 | P0/Phase 2 | Covered |
| 4 | LLM 멀티 프로바이더 (10종/Batch) | E3-S1~S7 | Epic 3 | P0 | Covered |
| 5 | AGORA 토론 (2/3라운드/SSE/Diff) | E11-S1~S5 | Epic 11 | Phase 2 | Covered |
| 6 | 전략실 (포트폴리오/자동매매/CIO+VECTOR) | E10-S1~S8 | Epic 10 | Phase 2 | Covered |
| 7 | SketchVibe (Cytoscape/Mermaid/MCP SSE) | E13-S1~S5 | Epic 13 | Phase 2 | Covered |
| 8 | SNS 통신국 (5플랫폼/승인/Selenium) | E12-S1~S5 | Epic 12 | Phase 2 | Covered |
| 9 | 작전현황 대시보드 (카드/차트/퀵액션) | E6-S1~S6 | Epic 6 | P1 | Covered |
| 10 | 통신로그 (활동/통신/QA/도구 4탭) | E6-S3, E6-S4 | Epic 6 | P1 | Covered |
| 11 | 작전일지 (검색/A/B비교/리플레이) | E17-S1, E17-S2 | Epic 17 | Phase 2 | Covered |
| 12 | 기밀문서 (아카이브/필터/유사 문서) | E17-S3, E17-S4 | Epic 17 | Phase 2 | Covered |
| 13 | 전력분석 (Soul Gym/품질/성능) | E17-S5~S7 | Epic 17 | Phase 2 | Covered |
| 14 | 자동화 워크플로우 (다단계/상태) | E18-S1~S5 | Epic 18 | Phase 2 | Covered |
| 15 | 크론기지 (cron CRUD/활성화) | E14-S1, E14-S2, E14-S4 | Epic 14 | Phase 2 | Covered |
| 16 | 정보국 (RAG/폴더/드래그&드롭) | E16-S1~S3, E16-S5 | Epic 16 | Phase 2 | Covered |
| 17 | ARGOS (트리거/자동 수집/상태) | E14-S3, E14-S5, E14-S6 | Epic 14 | Phase 2 | Covered |
| 18 | 텔레그램 (명령/결과/크론 전송) | E15-S1~S3 | Epic 15 | Phase 2 | Covered |
| 19 | 품질 게이트 (5항목/yaml/환각/재작업) | E5-S4(P0), E8-S1~S5(P1) | Epic 5/8 | P0/P1 | Covered |
| 20 | 에이전트 메모리 (자동 학습/주입) | E16-S4, E16-S6 | Epic 16 | Phase 2 | Covered |
| 21 | 비용 관리 (3축/예산/차트) | E3-S5, E7-S1~S5 | Epic 3/7 | P0/P1 | Covered |
| 22 | CEO 아이디어 7개 | (아래 상세) | 분산 | 분산 | Covered |

**CEO 아이디어 매핑:**

| # | 아이디어 | Story | 구현 위치 |
|---|---------|-------|----------|
| #001 | CIO+VECTOR 분리 | E10-S4 | Strategy Room 오케스트레이션 |
| #004 | 예측 워크플로우 | E18-S3 | 패턴 분석 + 자동 제안 |
| #005 | 메모리 금지 원칙 | 모든 에픽 | 아키텍처 원칙으로 전체 적용 |
| #007 | 처장=5번째 분석가 | E5-S3 | Manager 자체 분석 수행 |
| #009 | SketchVibe 캔버스 | E13-S1~S5 | Cytoscape + MCP SSE |
| #010 | 비서실장=편집장 | E5-S4 | 5항목 품질 검수 |
| #011 | 부서별 표준 템플릿 | E2-S8 | Soul/도구 기본값 설정 |

**Result: 22/22 v1 features covered. 7/7 CEO ideas covered. 0 gaps.**

---

### 3. UX Screen Coverage Matrix

UX Design의 22개 화면(CEO 앱 14 + Admin 8)이 모두 스토리에 매핑되었는지 검증.

| UX Screen | v1 Spec # | Story | Epic | Phase | Status |
|-----------|-----------|-------|------|-------|--------|
| CEO #1 작전현황 | #9 | E6-S2, E6-S5, E6-S6 | Epic 6 | P1 | Covered |
| CEO #2 사령관실 | #1 | E5-S7, E5-S8, E5-S9, E5-S10 | Epic 5 | P0 | Covered |
| CEO #3 전략실 | #6 | E10-S7, E10-S8 | Epic 10 | Phase 2 | Covered |
| CEO #4 SketchVibe | #7 | E13-S5 | Epic 13 | Phase 2 | Covered |
| CEO #5 AGORA 토론 | #5 | E11-S4, E11-S5 | Epic 11 | Phase 2 | Covered |
| CEO #6 SNS 통신국 | #8 | E12-S5 | Epic 12 | Phase 2 | Covered |
| CEO #7 통신로그 | #10 | E6-S4 | Epic 6 | P1 | Covered |
| CEO #8 작전일지 | #11 | E17-S2 | Epic 17 | Phase 2 | Covered |
| CEO #9 기밀문서 | #12 | E17-S4 | Epic 17 | Phase 2 | Covered |
| CEO #10 전력분석 | #13 | E17-S6, E17-S7 | Epic 17 | Phase 2 | Covered |
| CEO #11 크론기지 | #15 | E14-S4 | Epic 14 | Phase 2 | Covered |
| CEO #12 ARGOS | #17 | E14-S5 | Epic 14 | Phase 2 | Covered |
| CEO #13 정보국 | #16 | E16-S5 | Epic 16 | Phase 2 | Covered |
| CEO #14 설정 | - | E9-S8 | Epic 9 | P1 | Covered |
| Admin A1 조직도 | - | E2-S5 | Epic 2 | P0 | Covered |
| Admin A2 부서 관리 | - | E2-S6 | Epic 2 | P0 | Covered |
| Admin A3 에이전트 관리 | - | E2-S7 | Epic 2 | P0 | Covered |
| Admin A4 직원 관리 | - | E9-S4 | Epic 9 | P1 | Covered |
| Admin A5 도구 관리 | - | E4-S6 | Epic 4 | P0 | Covered |
| Admin A6 비용 대시보드 | - | E7-S3 | Epic 7 | P1 | Covered |
| Admin A7 조직 템플릿 | - | E2-S8 | Epic 2 | P0 | Covered |
| Admin A8 회사 설정 | - | E9-S5 | Epic 9 | P1 | Covered |

**Result: 22/22 UX screens covered. 0 gaps.**

---

### 4. Gap Analysis

#### 4.1 PRD Requirements Gap

**Gaps found: 0**

모든 76개 FR이 최소 1개 스토리에 매핑됨. P0 FR(FR1-FR34, FR42, FR46, FR48-FR51)은 모두 P0 에픽(Epic 1-5)에 포함. P1 FR(FR35-FR41, FR43-FR45, FR47, FR52-FR55)은 모두 P1 에픽(Epic 6-9)에 포함. Phase 2/3 FR은 해당 Phase 에픽에 포함.

#### 4.2 v1 Feature Gap

**Gaps found: 0**

v1-feature-spec.md의 22개 기능 영역과 7개 CEO 아이디어가 모두 스토리에 매핑됨. 도구 수량 관련: v1은 125+ 도구였으나, P0에서 30+ 핵심 도구(E4-S3, E4-S4)를 구현하고, Phase 2에서 도메인별 도구(Finance=E10-S3, Marketing=E12-S2)를 추가하는 단계적 접근. 최종적으로 v1 수준의 도구 커버리지 달성.

#### 4.3 Architecture Alignment

10개 Architecture Decision과의 정렬:

| Decision # | 내용 | 매핑 에픽 | Status |
|-----------|------|----------|--------|
| #1 | Orchestration Engine | Epic 5 | Aligned |
| #2 | Agent Execution Model | Epic 3 | Aligned |
| #3 | LLM Provider Router | Epic 3 | Aligned |
| #4 | Tool System | Epic 4 | Aligned |
| #5 | Dynamic Org + Cascade | Epic 2 | Aligned |
| #6 | Quality Gate Pipeline | Epic 5 (P0) + Epic 8 (P1) | Aligned |
| #7 | Cost Tracking System | Epic 3 (CostTracker) + Epic 7 (비용 관리) | Aligned |
| #8 | Real-time Communication | Epic 5 (WebSocket), Epic 6 (대시보드) | Aligned |
| #9 | Tenant Isolation | Epic 1 (미들웨어), Epic 9 (멀티테넌시) | Aligned |
| #10 | Data Architecture | Epic 1 (스키마) | Aligned |

---

### 5. Dependency Validation

#### 5.1 Circular Dependency Check

에픽 간 의존성 그래프에서 순환 의존성 검사:

```
Epic 0 -> Epic 1 -> Epic 2 -> (Epic 5, Epic 9)
                  -> Epic 3 -> (Epic 4, Epic 7)
                                Epic 4 -> Epic 5
Epic 5 -> (Epic 6, Epic 8, Epic 10, Epic 11, Epic 12, Epic 13, Epic 14, Epic 16, Epic 17, Epic 18)
Epic 9 -> Epic 19
Epic 14 -> (Epic 15, Epic 18)
Epic 18 -> Epic 20
Epic 2 -> Epic 20
```

**Result: No circular dependencies detected.** 모든 의존성은 방향성 비순환 그래프(DAG).

#### 5.2 Cross-Epic Story Dependency Validation

Phase가 역전되는 의존성(P1 스토리가 P0 스토리에 의존 등)은 정상 방향임을 확인:

- E9-S3 (P1) depends on E5-S7 (P0): P1 -> P0 의존 (정상)
- E8-S5 (P1) depends on E6-S4 (P1): 같은 Phase (정상)
- E8-S3 (P1) depends on E4-S1 (P0): P1 -> P0 의존 (정상)
- E15-S3 (Phase 2) depends on E14-S2 (Phase 2): 같은 Phase (정상)
- E20-S4 (Phase 3) depends on E18-S4 (Phase 2): Phase 3 -> Phase 2 (정상)

**Result: No reverse-phase dependencies. All dependencies flow from earlier to later phases.**

---

### 6. Story Quality Check

#### 6.1 Acceptance Criteria Coverage

| Phase | Stories | Stories with AC | AC Coverage |
|-------|---------|----------------|-------------|
| P0 (Epic 1-5) | 40 | 40 | 100% |
| P1 (Epic 6-9) | 24 | 24 | 100% |
| Phase 2 (Epic 10-18) | 50 | 50 | 100% |
| Phase 3 (Epic 19-20) | 10 | 10 | 100% |

P0 스토리는 상세 AC (4-5개 체크박스), P1은 간결 AC, Phase 2/3는 요약 AC. 모든 스토리에 최소 1개 이상 AC 포함.

#### 6.2 Story Point Distribution

| SP | Count | Percentage |
|----|-------|-----------|
| 1 | 5 | 4.0% |
| 2 | 68 | 54.8% |
| 3 | 49 | 39.5% |
| 5 | 2 | 1.6% |

- SP 2~3이 전체의 94.4%로 적절한 분포 (1~2일 작업 단위)
- SP 5 스토리 2개: E12-S3 (Selenium 5플랫폼), E20-S4 (노코드 워크플로우 빌더) -- sprint planning 시 분할 검토 필요

#### 6.3 Story Sizing Outliers

| Story | SP | 우려 | 권장 |
|-------|----|------|------|
| E12-S3 | 5 | Selenium 5개 플랫폼 자동 발행 | sprint planning 시 플랫폼별 분할 검토 |
| E20-S4 | 5 | 노코드 워크플로우 빌더 | Phase 3이므로 구현 시점에 분할 |
| E5-S3 | 3 | 5개 컴포넌트 (위임+병렬+종합+자체분석+WebSocket) | v1 코드 참조로 SP=3 달성 가능 |

---

### 7. Risk Assessment

#### 7.1 High-Risk Stories

| Story | Risk | Impact | Mitigation |
|-------|------|--------|------------|
| E5-S2~S4 | 오케스트레이션 복잡도 | 전체 시스템 핵심 기능 | v1 코드 참조 + E5-S11 통합 테스트 |
| E3-S1 | 3사 LLM SDK 호환성 | 에이전트 작동 불가 | E3-S3 fallback + E3-S7 통합 테스트 |
| E1-S2 | 테넌트 격리 누락 | 데이터 유출 (Critical) | E1-S7 격리 통합 테스트 |
| E10-S2 | KIS API 연동 복잡도 | 자동매매 기능 불가 | 모의거래 우선 + E10-S6 환경 분리 |
| E12-S3 | Selenium 5 플랫폼 | 각 플랫폼 anti-bot 대응 | 플랫폼별 분할 구현 |
| E5-S8 | WebSocket 실시간 안정성 | UX 저하 | Epic 0 EventBus 재사용 + 재연결 로직 |

#### 7.2 Technical Debt Risks

| 영역 | Risk | Phase | Mitigation |
|------|------|-------|------------|
| 도구 수량 | P0에서 30+, v1의 125+까지 단계적 확장 필요 | Phase 2 | 도메인 에픽에서 도구 추가 (E10-S3, E12-S2) |
| 테스트 커버리지 | Epic 2, 4에 전용 테스트 스토리 없음 | P0 | TEA 단계에서 자동 생성 (BMAD 워크플로우) |
| P1 스토리 상세도 | P1 스토리 AC가 P0보다 간결 | P1 | create-story BMAD 단계에서 상세화 |

---

### 8. Implementation Order Recommendation

#### Phase 1 MVP -- P0 (Critical Path)

```
Sprint 1: Epic 1 (Data Layer) -- 7 stories, 16 SP
  E1-S1 스키마 -> E1-S2 테넌트 -> E1-S3 RBAC -> E1-S4 감사 -> E1-S5 볼트 -> E1-S6 시드 -> E1-S7 테스트

Sprint 2-3: Epic 2 + Epic 3 (병렬 가능)
  Epic 2: 부서/에이전트 CRUD -> cascade -> 템플릿 -> UI (9 stories, 23 SP)
  Epic 3: LLM 어댑터 -> 라우터 -> fallback -> AgentRunner -> 비용 -> 배치 -> 테스트 (7 stories, 17 SP)

Sprint 4: Epic 4 (Tool System) -- 6 stories, 16 SP
  ToolPool -> 권한 -> 30+ 도구 -> 로그 -> UI

Sprint 5-6: Epic 5 (Orchestration) -- 11 stories, 27 SP
  Backend: S1~S6 -> Frontend: S7~S10 -> Test: S11
```

#### Phase 1 MVP -- P1

```
Sprint 7: Epic 6 + Epic 7 (병렬 가능)
  Epic 6: 대시보드 API -> UI -> WebSocket -> 퀵 액션 (6 stories, 14 SP)
  Epic 7: 비용 API -> 예산 한도 -> UI -> 알림 (5 stories, 11 SP)

Sprint 8: Epic 8 + Epic 9 (병렬 가능)
  Epic 8: yaml 정의 -> 검수 엔진 -> 환각 탐지 -> 인젝션 방어 -> UI (5 stories, 11 SP)
  Epic 9: 회사 CRUD -> 직원 관리 -> 권한 제한 -> UI -> 온보딩 (8 stories, 17 SP)
```

#### Phase 2 (우선순위 순)

```
1. Epic 10: Strategy Room (8 stories, 20 SP) -- 높음
2. Epic 11: AGORA Debate (5 stories, 12 SP) -- 높음
3. Epic 12: SNS Publishing (5 stories, 14 SP) -- 높음
4. Epic 13: SketchVibe (5 stories, 13 SP) -- 중간
5. Epic 14: Cron & ARGOS (6 stories, 13 SP) -- 중간
6. Epic 15: Telegram (3 stories, 6 SP) -- 중간 (Epic 14 이후)
7. Epic 16: Knowledge & Memory (6 stories, 13 SP) -- 중간
8. Epic 17: History/Archive/Perf (7 stories, 16 SP) -- 낮음
9. Epic 18: Workflow Automation (5 stories, 13 SP) -- 낮음
```

#### Phase 3

```
Epic 19: Internal Messenger (5 stories, 10 SP)
Epic 20: Platform Extensions (5 stories, 16 SP)
```

---

### 9. Summary Statistics

| Metric | Value |
|--------|-------|
| Total Epics | 20 (+ Epic 0 완료) |
| Total Stories | 124 |
| Total Story Points | 298 SP |
| P0 Stories / SP | 40 / 99 |
| P1 Stories / SP | 24 / 53 |
| Phase 2 Stories / SP | 50 / 120 |
| Phase 3 Stories / SP | 10 / 26 |
| PRD FR Coverage | 76/76 (100%) |
| v1 Feature Coverage | 22/22 (100%) |
| CEO Ideas Coverage | 7/7 (100%) |
| UX Screen Coverage | 22/22 (100%) |
| Architecture Decisions Aligned | 10/10 (100%) |
| Circular Dependencies | 0 |
| Reverse-Phase Dependencies | 0 |
| High-Risk Stories | 6 (all with mitigations) |
| SP=5 Outliers | 2 (flagged for sprint split) |
| Average SP per Story | 2.40 |
| Average Stories per Epic | 6.2 |

**Final Assessment: Implementation Ready.** 모든 PRD 요구사항, v1 기능, UX 화면, 아키텍처 결정이 124개 스토리에 매핑되었으며, 순환 의존성 없이 단계적 구현이 가능하다.
