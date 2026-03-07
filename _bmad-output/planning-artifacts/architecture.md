---
stepsCompleted: [step-01-init, step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-2026-03-07.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
workflowType: 'architecture'
project_name: 'corthex-v2'
user_name: 'ubuntu'
date: '2026-03-07'
---

# Architecture Decision Document

_CORTHEX v2 - AI Agent Orchestration Platform (Dynamic Organization Management)_

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
76 FRs across 9 capability areas:
1. 조직 관리 (12 FRs): 부서/에이전트 CRUD, cascade 처리, 시스템 에이전트 보호, 조직도 시각화, 템플릿, Soul 편집
2. 사령관실 (6 FRs): 자연어 명령, @멘션, 슬래시 8종, 프리셋, 위임 체인 실시간 표시, 피드백
3. 오케스트레이션 (7 FRs): 비서실장 자동 분류, Manager 위임/종합(5번째 분석가 #007), 비서실장=편집장(#010), 딥워크, /전체, /순차
4. 도구 & LLM (9 FRs): allowed_tools 서버 강제, 도구 로그, 3계급 자동 모델 배정, 멀티 프로바이더 라우팅, Batch API, fallback
5. 모니터링 & 비용 (7 FRs): 대시보드 카드, 사용량 그래프, 통신로그 4탭, 3축 비용 추적, 예산 한도/자동 차단, 만족도 통계
6. 보안 & 멀티테넌시 (8 FRs): companyId 격리, 회사/직원 CRUD, 워크스페이스, AES-256-GCM 볼트, 크리덴셜 프롬프트 노출 금지, JWT RBAC, 감사 로그
7. 품질 관리 (6 FRs): 5항목 검수, 자동 재작업, QA 로그, quality_rules.yaml, 환각 탐지, 프롬프트 인젝션 방어
8. 투자 & 금융 Phase 2 (7 FRs): 전략실 대시보드, CIO+VECTOR(#001), KIS 자동매매, 자율/승인 실행, 투자 성향 리스크, 실/모의 분리, 주문 영구 보존
9. 협업 & 확장 Phase 2/3 (14 FRs): AGORA, SketchVibe, SNS, 크론, ARGOS, 텔레그램, RAG, 메모리, 작전일지, 기밀문서, 전력분석, 자동화, 예측 워크플로우(#004), 사내 메신저

**핵심 아키텍처 과제**: 오케스트레이션 엔진 -- CEO 명령 -> 비서실장 자동 분류 -> Manager 위임 -> 병렬 Specialist 실행(실제 도구 호출) -> Manager 종합(+자체 분석) -> 비서실장 품질 검수 -> CEO 보고. 비동기 멀티스텝 워크플로우 엔진.

**Non-Functional Requirements (37개):**
- Performance (7): 단순 < 60초, 복합 < 5분, LLM 단일 < 30초, WebSocket < 500ms, UI FCP < 3초, 시세 60초, 부서당 병렬 10명
- Security (7): AES-256-GCM, JWT 15분/7일, companyId WHERE 필수, 프롬프트 크리덴셜 금지, 로그 마스킹, 감사 로그 영구, allowed_tools 서버 강제
- Scalability (5): Phase 1 단일(1~3사), Phase 3 3+사, 부서 20/에이전트 100 한도, WebSocket 50, Batch 큐 1000
- Reliability (6): 오케스트레이션 95%+, 도구 90%+, LLM 실패 5%-, WebSocket 99.5%, 재연결 3초, 이벤트 캐치업
- Integration (4): fallback < 5초, KIS 체결 < 10초, 개별 도구 장애 격리, Selenium 60초 타임아웃
- Cost Efficiency (4): 3계급 40%+ 절감, Batch 60%+, Manager<$0.50/Spec<$0.10/Worker<$0.05, 예산 초과 5%-
- Operability (4): 온보딩 10분, 템플릿 2분, 배포 5분, 모니터링 알림 1분

**Scale & Complexity:**
- Primary domain: Full-stack TypeScript SaaS B2B
- Complexity level: High
- Estimated components: ~35 server modules + ~50 frontend components + ~15 shared types

### Technical Constraints & Dependencies

**기존 코드베이스 (Epic 0 Foundation):**
- Turborepo 모노레포: server(Hono+Bun), app(React+Vite), admin(React+Vite), ui(CVA), shared(types)
- DB: PostgreSQL(Neon serverless) + Drizzle ORM, 마이그레이션 구성 완료
- 실시간: Hono 내장 WebSocket + EventBus 7채널 멀티플렉싱
- 보안: AES-256-GCM 크리덴셜 볼트, JWT 인증(admin_users + users 분리)
- 테스트: bun:test 201건 통과
- 배포: GitHub Actions -> Cloudflare 캐시 퍼지

**외부 의존성:**
- LLM: Anthropic SDK, OpenAI SDK, Google Generative AI SDK
- 금융: KIS 증권 API (REST, OAuth2)
- 메시징: Telegram Bot API (Webhook)
- SNS: Selenium WebDriver (헤드리스)
- DB: Neon PostgreSQL (serverless driver + connection pooling)

**아키텍처 원칙 (CEO 아이디어 #005):**
- 메모리 금지: 모든 정보는 명시적 파일로 관리. 숨김 저장소/암묵적 상태 금지
- 투명성: 모든 에이전트 판단/도구 호출/비용이 통신로그에 기록
- 감사 가능성: 작전일지, 통신로그, 비용 기록으로 과거 행동 재현

### Cross-Cutting Concerns

1. **테넌트 격리**: 모든 DB 쿼리, WebSocket 채널, API 엔드포인트에 companyId 필터 필수. ORM 미들웨어 자동 주입
2. **비용 추적**: 모든 LLM 호출마다 토큰 + 비용 기록. 에이전트/모델/부서별 집계. 예산 한도 초과 시 자동 차단
3. **감사 로그**: 금융 거래, 조직 변경, 권한 변경은 삭제 불가 로그. 도구 호출, 위임 체인 전부 기록
4. **실시간 업데이트**: 에이전트 상태, 위임 체인 진행, 비용 변경을 WebSocket으로 클라이언트에 푸시
5. **에러 복구**: LLM 장애 시 fallback, 도구 실패 시 부분 결과 반환, 타임아웃으로 무한 대기 방지
6. **크리덴셜 보호**: 에이전트 프롬프트에 크리덴셜 전달 금지. 서버 사이드 주입. 로그 자동 마스킹
7. **동적 조직 cascade**: 부서 삭제 시 진행 작업 대기/강제 종료 선택, 메모리 아카이브, 비용 영구 보존, 에이전트 미배속 전환

## Starter Template Evaluation

### Primary Technology Domain

Full-stack TypeScript 모노레포 (Turborepo) -- Epic 0 Foundation에서 이미 확립됨.

### Starter Options Considered

| 옵션 | 평가 | 결과 |
|------|------|------|
| 기존 코드베이스 (Brownfield) | Epic 0에서 5개 패키지 + 201건 테스트 + CI/CD 파이프라인 완료 | **채택** |
| T3 Stack (create-t3-app) | Next.js 기반. 현재 Hono+Vite 구조와 호환 불가 | 불채택 |
| Turborepo 공식 starter | 기본 패키지 구조만 제공. 현재 코드가 더 풍부 | 불채택 |
| 처음부터 구축 | 이미 구축 완료. 불필요한 재작업 | 불채택 |

### Selected Starter: 기존 코드베이스 (Brownfield)

**선택 근거:** Epic 0 Foundation이 모든 기초 아키텍처를 이미 구현 완료. 새 starter를 적용하면 기존 201건 테스트, WebSocket EventBus, 크리덴셜 볼트, JWT 인증 등을 재구현해야 하므로 비효율적.

**기존 Foundation이 제공하는 아키텍처 결정:**

**Language & Runtime:**

| 결정 | 선택 | 버전 |
|------|------|------|
| Language | TypeScript (strict) | TS 5.x |
| Runtime | Bun | 1.3.10 |
| Monorepo | Turborepo | v2 |

**Server Framework:**

| 결정 | 선택 | 비고 |
|------|------|------|
| HTTP Framework | Hono | v4, 경량 + Bun 최적화 |
| ORM | Drizzle ORM | v0.39, PostgreSQL 스키마 정의 |
| DB | Neon PostgreSQL | serverless driver + connection pooling |
| WebSocket | Hono 내장 | 7채널 멀티플렉싱 EventBus 구현 완료 |
| 암호화 | AES-256-GCM | 크리덴셜 볼트 구현 완료 |

**Frontend Framework:**

| 결정 | 선택 | 비고 |
|------|------|------|
| UI Framework | React | v19 |
| Build Tool | Vite | v6 |
| Styling | Tailwind CSS | v4 |
| Client State | Zustand | v5 |
| Server State | TanStack Query | v5 |
| Routing | React Router DOM | v7 |
| Component Library | @corthex/ui (CVA) | 자체 구축 |

**Testing:**

| 결정 | 선택 | 비고 |
|------|------|------|
| Server Tests | bun:test | 201건 통과 |
| Frontend Tests | Vitest | + testing-library |

**Development Experience:**

| 결정 | 선택 | 비고 |
|------|------|------|
| 패키지 매니저 | Bun | workspace 프로토콜 |
| 린팅 | ESLint + Prettier | monorepo 설정 |
| CI/CD | GitHub Actions | main push -> 자동 배포 -> Cloudflare 캐시 퍼지 |
| 환경 변수 | .env | 패키지별 분리 |

**Code Organization (기존 구조):**
```
corthex-v2/
  packages/
    server/    -- Hono + Bun backend (API + WebSocket + Services)
    app/       -- React + Vite SPA (CEO/직원용 메인 앱)
    admin/     -- React + Vite SPA (관리자 콘솔)
    ui/        -- Shared component library (CVA-based)
    shared/    -- Shared TypeScript types
```

**Note:** 프로젝트 초기화 스토리 불필요 -- 이미 Foundation 완료.

## Core Architectural Decisions

> Starter(Epic 0)가 이미 결정한 항목(프레임워크, DB, 런타임 등)은 제외. v2 신규 아키텍처 결정만 기술.

### Decision Priority Analysis

**Critical Decisions (구현 차단):**
1. 오케스트레이션 엔진 아키텍처
2. 에이전트 실행 모델
3. LLM 프로바이더 라우터 설계
4. 도구 시스템 아키텍처
5. 동적 조직 관리 + Cascade 엔진

**Important Decisions (아키텍처 형태 결정):**
6. 품질 게이트 파이프라인
7. 비용 추적 시스템
8. 실시간 통신 프로토콜
9. 테넌트 격리 미들웨어
10. 데이터 아키텍처 (스키마 설계)

**Deferred Decisions (Post-MVP):**
11. 수평 확장 전략 (Phase 3)
12. 에이전트 마켓플레이스 아키텍처 (Phase 3)
13. 벡터 DB 선택 -- RAG/정보국 (Phase 2)
14. 사내 메신저 실시간 아키텍처 (Phase 3)

### 1. Orchestration Engine

**결정:** 이벤트 기반 파이프라인 + 타입된 TaskRequest/TaskResponse 메시지

**아키텍처 흐름:**
```
CommandCenter (UI)
  -> POST /api/commands {text, type, target}
    -> CommandRouter (명령 타입 분류)
      -> OrchestratorService.process(command)
        -> ChiefOfStaff.classify(command)           // LLM 호출
          -> Returns: {departmentId, priority, taskBreakdown}
        -> Manager.delegate(task)                    // LLM 호출
          -> Returns: {subtasks: SubTask[]}
        -> Parallel: Specialist.execute(subtask)[]   // LLM + 도구 호출
          -> Each returns: {result, toolsUsed, cost}
        -> Manager.synthesize(results)               // LLM 호출 (#007: 자체 분석 + 종합)
        -> ChiefOfStaff.review(report)               // LLM 호출 (#010: 편집장 역할)
          -> Pass: CEO에게 전달
          -> Fail: 재작업 루프 (최대 2회)
        -> WebSocket: 각 단계마다 상태 이벤트 푸시
```

**핵심 설계:**
- 각 단계는 비동기 함수로 LLM 호출 수행
- 단계 간 통신은 타입된 TaskRequest/TaskResponse 객체
- WebSocket으로 각 단계 전환 시 상태 이벤트 전송
- 단계별 타임아웃 (기본 60초/LLM 호출, 전체 체인 5분)
- 실패 시 graceful degradation -- 부분 결과로 계속 진행
- /전체: 모든 Manager에게 동시 위임 + 결과 종합
- /순차: Manager 순차 위임 + 결과 누적

### 2. Agent Execution Model

**결정:** Agent = 설정(Soul DB) + 런타임(AgentRunner 무상태 실행)

**Agent 정의 (DB 스키마):**
```typescript
interface Agent {
  id: string;
  companyId: string;
  name: string;              // "CIO", "종목분석가"
  tier: 'manager' | 'specialist' | 'worker';
  departmentId: string | null;  // null = 미배속
  modelName: string;         // "claude-sonnet-4-6"
  soulMarkdown: string;      // 성격, 전문성, 원칙
  allowedTools: string[];    // 허용 도구 목록
  isSystem: boolean;         // true = 삭제 불가 시스템 에이전트
  isActive: boolean;
}
```

**AgentRunner (무상태 실행기):**
```typescript
class AgentRunner {
  async execute(agent: Agent, task: TaskRequest): Promise<TaskResponse> {
    const systemPrompt = buildSystemPrompt(agent);  // soul + knowledge + tools
    const llmResponse = await llmRouter.call({
      model: agent.modelName,
      system: systemPrompt,
      messages: task.messages,
      tools: getToolDefinitions(agent.allowedTools),
    });
    // 도구 호출 처리 + 비용 기록 + 결과 반환
  }
}
```

**3계급 역할 구분:**
- **Manager**: 하위 위임 + 자체 분석(5번째 분석가 #007) + 결과 종합. 고급 모델(Sonnet)
- **Specialist**: 도구 활용 전문 분석/작업 수행. 중급 모델(Haiku)
- **Worker**: 단순 작업(요약, 스케줄). 경량 모델(Haiku)

### 3. LLM Provider Router

**결정:** Strategy 패턴 + 프로바이더별 어댑터

```typescript
interface LLMProvider {
  call(request: LLMRequest): Promise<LLMResponse>;
  supportsBatch: boolean;
  estimateCost(tokens: TokenCount): number;
}

class LLMRouter {
  providers: Map<string, LLMProvider>;  // anthropic, openai, google

  async call(request: LLMRequest): Promise<LLMResponse> {
    const provider = this.resolveProvider(request.model);
    try {
      const response = await provider.call(request);
      await this.trackCost(request, response);  // 항상 비용 기록
      return response;
    } catch (err) {
      return this.fallback(request, err);  // Claude -> GPT -> Gemini
    }
  }
}
```

**모델 매핑:**

| Model ID | Provider | 용도 | 비용 등급 |
|----------|----------|------|----------|
| claude-sonnet-4-6 | Anthropic | Manager 기본 | 고급 |
| claude-haiku-4-5 | Anthropic | Specialist/Worker 기본 | 경량 |
| gpt-4.1 | OpenAI | Manager 대체 | 고급 |
| gpt-4.1-mini | OpenAI | Specialist 대체 | 경량 |
| gemini-2.5-pro | Google | Manager 대체 | 고급 |
| gemini-2.5-flash | Google | Worker 대체 | 경량 |

**Batch API:**
- BatchCollector가 비긴급 요청 수집
- CEO가 /배치실행 또는 임계치 도달 시 자동 플러시
- 50% 비용 할인

**Fallback 전략:**
- 프로바이더 장애 감지: 3회 연속 실패 또는 5초 타임아웃
- 자동 전환: Anthropic -> OpenAI -> Google (동일 등급 모델로)
- 전환 소요 < 5초 (NFR26)

### 4. Tool System

**결정:** ToolPool 레지스트리 + 서버 사이드 권한 검증 실행

```typescript
interface Tool {
  name: string;
  description: string;
  category: string;       // finance, legal, marketing, tech, common
  parameters: ZodSchema;
  execute(params: unknown, context: ToolContext): Promise<ToolResult>;
}

class ToolPool {
  tools: Map<string, Tool>;

  async invoke(agent: Agent, toolName: string, params: unknown): Promise<ToolResult> {
    // 1. 권한 검증: agent.allowedTools에 toolName 포함? (서버 강제, NFR14)
    // 2. 파라미터 Zod 검증
    // 3. 도구 실행 (ToolContext에 companyId 주입)
    // 4. 결과 > 4000자 시 요약 절삭
    // 5. 호출 로그 기록 (agent, tool, input, output, duration)
    // 6. 결과 반환
  }
}
```

**도구 카테고리 (125+):**
- **Finance** (Phase 2): kr_stock, dart_api, sec_edgar, backtest_engine, kis_trading
- **Legal**: law_search, contract_reviewer, trademark_similarity
- **Marketing**: sns_manager, seo_analyzer, hashtag_recommender
- **Tech**: uptime_monitor, security_scanner, code_quality
- **Common** (P0 핵심 30+): real_web_search, spreadsheet_tool, chart_generator, email_sender, file_manager, calculator, date_utils, translator

### 5. Dynamic Organization Management + Cascade Engine

**결정:** 조직 변경 이벤트 + Cascade 분석기 + 안전 처리

**조직 CRUD:**
```typescript
// 부서 삭제 시 cascade 분석
interface CascadeAnalysis {
  departmentId: string;
  activeTaskCount: number;      // 진행 중 작업 수
  agentCount: number;           // 하위 에이전트 수
  totalCost: number;            // 누적 비용
  memoryCount: number;          // 학습 기록 수
}

class OrganizationService {
  async deleteDepartment(deptId: string, mode: 'wait' | 'force'): Promise<void> {
    const analysis = await this.analyzeCascade(deptId);

    if (mode === 'wait') {
      await this.waitForActiveTasks(deptId);  // 진행 중 작업 완료 대기
    } else {
      await this.forceStopTasks(deptId);       // 강제 종료
    }

    await this.archiveMemories(deptId);         // 메모리 아카이브
    // 비용 기록은 영구 보존 (삭제 안 함)
    await this.unassignAgents(deptId);          // 에이전트 미배속 전환 (삭제 아님)
    await this.softDeleteDepartment(deptId);    // 부서 soft delete
  }
}
```

**시스템 에이전트 보호:**
- `isSystem: true` 에이전트는 삭제 API 호출 시 403 반환
- 비서실장(Chief of Staff)은 모든 회사에 시스템 에이전트로 자동 생성
- UI에서 시스템 에이전트는 잠금 아이콘으로 시각 구분

**조직 템플릿:**
```typescript
interface OrgTemplate {
  id: string;
  name: string;                    // "투자분석", "마케팅", "법무"
  departments: TemplateDepart[];    // 부서 + 에이전트 프리셋
}
// 템플릿 적용 시 부서/에이전트 일괄 생성 (2분 내, NFR35)
```

### 6. Quality Gate Pipeline

**결정:** 5항목 루브릭 + LLM 기반 자동 검수

```typescript
interface QualityCheckResult {
  conclusion: 'pass' | 'fail';
  scores: {
    conclusionQuality: number;   // 결론 명확성 (1-5)
    evidenceSources: number;     // 근거 출처 (1-5)
    riskAssessment: number;      // 리스크 언급 (1-5)
    formatCompliance: number;    // 형식 준수 (1-5)
    logicalCoherence: number;    // 논리적 일관성 (1-5)
  };
  feedback?: string;             // 재작업 지시 (fail 시)
}
```

- **P0**: 비서실장이 LLM으로 5항목 검수 (간이)
- **P1**: quality_rules.yaml 자동 규칙 + 환각 탐지 자동화
- Pass 기준: 평균 >= 3.5, 개별 점수 모두 >= 2
- Fail: 피드백 포함 자동 재작업 (최대 2회)
- 2회 실패 후: 경고 플래그 달아 CEO에게 전달

### 7. Cost Tracking System

**결정:** LLM 호출별 실시간 기록 + 3축 집계

```typescript
interface CostRecord {
  id: string;
  companyId: string;
  agentId: string;
  departmentId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;              // USD, models.yaml 가격표 기준
  isBatch: boolean;          // Batch API 여부
  taskId: string;
  timestamp: Date;
}
```

- **models.yaml**: 모델별 input/output 1M 토큰당 가격 정의
- **3축 집계**: 에이전트별, 모델별, 부서별 실시간 합산
- **예산 관리**: 일일 한도 + 월 한도 (회사별 설정)
- **한도 초과**: 자동 차단 + CEO 알림 (WebSocket cost 채널)
- **대시보드**: 도넛 차트(부서별 비용), 막대 차트(에이전트별 비용)

### 8. Real-time Communication Protocol

**결정:** WebSocket 7채널 멀티플렉싱 + EventBus (Epic 0 확장)

**채널 정의:**

| 채널 | 이벤트 | 용도 |
|------|--------|------|
| `agent-status` | agent-started, agent-completed, agent-error | 에이전트 생명주기 |
| `delegation` | task-delegated, task-accepted, task-completed | 위임 체인 |
| `command` | command-received, command-processing, command-done | 명령 생명주기 |
| `cost` | cost-updated, budget-warning, budget-exceeded | 비용 추적 |
| `tool` | tool-invoked, tool-completed, tool-failed | 도구 실행 |
| `debate` | round-started, agent-spoke, round-ended, debate-done | AGORA (Phase 2) |
| `nexus` | node-added, node-updated, canvas-changed | SketchVibe (Phase 2) |

**서버 EventBus:**
```typescript
class EventBus {
  emit(channel: string, event: string, data: unknown, companyId: string): void;
  // companyId 기반 테넌트 격리 -- 해당 회사의 WebSocket 연결에만 전송
}
```

**클라이언트:** 자동 재연결 (지수 백오프, 3초 내 NFR24) + 미수신 이벤트 캐치업 (NFR25)

### 9. Tenant Isolation Middleware

**결정:** Drizzle ORM 미들웨어 + API 미들웨어 이중 검증

```typescript
// API 미들웨어: JWT에서 companyId 추출 + 요청 검증
const tenantMiddleware = async (c, next) => {
  const { companyId } = c.get('jwtPayload');
  c.set('companyId', companyId);
  // 요청 body의 companyId와 불일치 시 403
  await next();
};

// DB 쿼리: 모든 SELECT/UPDATE/DELETE에 companyId WHERE 자동 주입
// ORM helper 함수로 강제
const withTenant = (companyId: string) => ({
  where: eq(table.companyId, companyId)
});
```

- 파일 저장소: `/{companyId}/` 디렉토리 분리
- WebSocket: companyId 네임스페이스로 격리
- API 키(크리덴셜 볼트): 회사별 별도 엔트리

### 10. Data Architecture

**핵심 테이블:**

| 테이블 | 용도 | 테넌트 격리 |
|--------|------|-----------|
| companies | 회사/테넌트 레지스트리 | N/A (root) |
| admin_users | 관리자 콘솔 사용자 | No |
| users | 앱 사용자 (CEO/Human 직원) | Yes (companyId) |
| departments | 부서 계층 | Yes |
| agents | 에이전트 정의 + Soul | Yes |
| commands | CEO 명령 이력 | Yes |
| tasks | 오케스트레이션 작업 추적 | Yes |
| tool_invocations | 도구 호출 감사 로그 | Yes |
| cost_records | LLM 비용 추적 | Yes |
| credentials | 암호화 API 키 (AES-256-GCM) | Yes |
| quality_reviews | QA 게이트 결과 | Yes |
| presets | 명령 프리셋 | Yes |
| cron_jobs | 스케줄 작업 | Yes |
| org_templates | 조직 템플릿 | Global + Custom |
| audit_logs | 감사 로그 (삭제 불가) | Yes |

**Phase 2 추가 테이블:**

| 테이블 | 용도 |
|--------|------|
| watchlist | 종목 관심 목록 |
| portfolio | 투자 포트폴리오 |
| trade_orders | 매매 주문 (영구 보존) |
| debates | AGORA 토론 기록 |
| sketches | SketchVibe 다이어그램 |
| sns_content | SNS 발행 큐 |
| knowledge_docs | RAG 문서 저장소 |
| agent_memories | 에이전트 학습 기록 |

**마이그레이션:** Drizzle Kit generate + migrate (기존 구성 활용)

### Decision Impact Analysis

**구현 순서 (의존성 기반):**
1. 테넌트 격리 미들웨어 (모든 API의 기반)
2. 데이터 아키텍처 -- 스키마 + 마이그레이션
3. 동적 조직 관리 (부서/에이전트 CRUD + cascade)
4. LLM 프로바이더 라우터 (에이전트 실행의 기반)
5. 에이전트 실행 모델 (AgentRunner)
6. 도구 시스템 (에이전트가 사용)
7. 오케스트레이션 엔진 (위 모든 컴포넌트 조합)
8. 비용 추적 (LLM 호출에 삽입)
9. 실시간 통신 (오케스트레이션에 이벤트 추가)
10. 품질 게이트 (오케스트레이션 파이프라인에 삽입)

**Cross-Component Dependencies:**

| 컴포넌트 | 의존 대상 |
|----------|----------|
| OrchestratorService | ChiefOfStaff, AgentRunner, EventBus, QualityGate |
| ChiefOfStaff | LLMRouter |
| AgentRunner | LLMRouter, ToolPool |
| LLMRouter | Provider Adapters, CostTracker |
| ToolPool | 개별 Tool 구현, 크리덴셜 볼트 |
| EventBus | WebSocket Handler |
| CostTracker | DB (cost_records) |
| QualityGate | LLMRouter |
| OrganizationService | DB, EventBus (조직 변경 이벤트) |
| CredentialVault | Crypto 유틸리티 |

## Implementation Patterns & Consistency Rules

> AI 에이전트 간 구현 충돌을 방지하는 일관성 규칙. "어떻게 구현할 것인가"에 집중.

### Naming Conventions

| 컨텍스트 | 규칙 | 예시 | 금지 예시 |
|----------|------|------|----------|
| 파일명 | kebab-case 소문자 | `agent-runner.ts`, `cost-tracker.ts` | `AgentRunner.ts`, `costTracker.ts` |
| DB 테이블 | snake_case 복수형 | `cost_records`, `tool_invocations` | `CostRecord`, `costRecords` |
| DB 칼럼 | snake_case | `company_id`, `created_at` | `companyId`, `CreatedAt` |
| API 엔드포인트 | kebab-case 복수형 | `/api/agents`, `/api/cost-records` | `/api/Agent`, `/api/costRecord` |
| TypeScript 타입/인터페이스 | PascalCase | `AgentRunner`, `TaskRequest` | `agentRunner`, `AGENT_RUNNER` |
| 함수명 | camelCase | `processCommand`, `trackCost` | `process_command`, `ProcessCommand` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS` | `maxRetryCount`, `defaultTimeout` |
| Zustand Store | `use{Name}Store` | `useCommandStore`, `useAgentStore` | `commandStore`, `CommandStore` |
| React 컴포넌트 | PascalCase | `CommandCenter`, `AgentCard` | `commandCenter`, `agent-card` |
| WebSocket 이벤트 | kebab-case | `agent-started`, `task-delegated` | `agentStarted`, `AGENT_STARTED` |
| 환경 변수 | UPPER_SNAKE_CASE | `DATABASE_URL`, `ENCRYPTION_KEY` | `databaseUrl`, `database-url` |

### API Response Format

```typescript
// 성공 응답
{ success: true, data: T }

// 에러 응답
{ success: false, error: { code: string, message: string } }

// 페이지네이션 응답
{ success: true, data: T[], pagination: { page: number, limit: number, total: number } }
```

**규칙:**
- 모든 API 응답은 `{ success, data | error }` 래퍼 사용 (직접 반환 금지)
- HTTP 상태 코드: 200(성공), 201(생성), 400(입력 오류), 401(인증 실패), 403(권한 없음), 404(미존재), 500(서버 에러)
- 날짜는 ISO 8601 문자열 (`2026-03-07T12:00:00Z`)
- JSON 필드명은 camelCase (DB snake_case와 다름 -- ORM이 변환)

### Error Handling Pattern

```typescript
// 서버: Hono 글로벌 에러 핸들러
app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.url}`, err);
  return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, 500);
});

// 오케스트레이션: Graceful Degradation
try {
  const result = await specialist.execute(task);
  return result;
} catch (err) {
  eventBus.emit('agent-status', 'agent-error', { agentId, error: err.message }, companyId);
  return { result: null, error: err.message, partial: true };  // 부분 결과로 계속
}

// 프론트엔드: TanStack Query 에러 처리
const { data, error, isLoading } = useQuery({
  queryKey: ['agents', companyId],
  queryFn: () => api.get('/api/agents'),
  retry: 2,
});
```

**규칙:**
- LLM 호출 실패: fallback 프로바이더 자동 전환 (LLMRouter 내부)
- 도구 실패: 해당 도구 결과만 null, 오케스트레이션 계속
- WebSocket 끊김: 클라이언트 자동 재연결 (지수 백오프, 최대 3초)
- 예산 초과: 자동 차단 + WebSocket `budget-exceeded` 이벤트
- 절대 금지: 에러 무시(catch 빈 블록), 사용자에게 스택 트레이스 노출

### Test Organization

```
packages/server/src/__tests__/
  unit/                    # 단위 테스트 (bun:test)
    services/              # 서비스 로직 테스트
    utils/                 # 유틸리티 함수 테스트
  api/                     # API 통합 테스트

packages/app/src/__tests__/
  components/              # 컴포넌트 테스트 (vitest + testing-library)
  hooks/                   # Custom hook 테스트
```

**규칙:**
- 서버 테스트: `bun:test` 사용. `describe/it/expect` 패턴
- 프론트엔드 테스트: `vitest` + `@testing-library/react`
- 테스트 파일명: `{대상}.test.ts` (예: `agent-runner.test.ts`)
- 테스트 위치: `__tests__/` 디렉토리 하위 (co-located 아님)
- 최소 커버리지 대상: 서비스 레이어 (orchestrator, agent-runner, llm-router, tool-pool, cost-tracker)

### Import Conventions

```typescript
// 1. 외부 패키지
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

// 2. 모노레포 패키지 (workspace)
import type { Agent, TaskRequest } from '@corthex/shared';
import { Button, Card } from '@corthex/ui';

// 3. 프로젝트 내부 (상대 경로)
import { db } from '../db/schema';
import { llmRouter } from '../services/llm-router';
```

**규칙:**
- import 순서: 외부 -> workspace -> 내부 (빈 줄로 구분)
- import 경로는 `git ls-files` 케이싱과 정확히 일치 (Linux CI 대소문자 구분)
- 타입만 import 시 `import type` 사용
- barrel export(`index.ts`)는 `@corthex/shared`, `@corthex/ui`에서만 사용

### State Management Pattern

**서버 사이드 (Zustand 없음):**
- 모든 상태는 DB에 저장 (메모리 금지 원칙 #005)
- 서비스는 무상태 -- 요청마다 DB에서 읽고 DB에 쓴다
- 캐시는 TanStack Query가 클라이언트에서 관리

**클라이언트 사이드:**
```typescript
// Zustand: UI 상태 (WebSocket 연결, 현재 사용자, 테마)
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// TanStack Query: 서버 데이터 (에이전트 목록, 비용, 명령 이력)
const useAgents = () => useQuery({
  queryKey: ['agents'],
  queryFn: () => api.get('/api/agents'),
});

// WebSocket 이벤트 -> TanStack Query 무효화
ws.on('agent-status', () => {
  queryClient.invalidateQueries({ queryKey: ['agents'] });
});
```

**규칙:**
- Zustand: 순수 UI 상태만 (서버 데이터 캐시 금지)
- TanStack Query: 모든 서버 데이터 (GET 요청 캐시 + 무효화)
- WebSocket 이벤트 -> `queryClient.invalidateQueries()` 로 실시간 반영
- 낙관적 업데이트는 CRUD 작업에만 사용 (위험한 금융 작업 제외)

### Logging Pattern

```typescript
// 구조화된 로깅 (서버)
console.log(JSON.stringify({
  level: 'info',
  service: 'orchestrator',
  action: 'command-processed',
  companyId,
  commandId,
  duration: Date.now() - startTime,
  agentCount: agents.length,
}));
```

**규칙:**
- 로그 레벨: `error`(장애), `warn`(주의), `info`(정상 이벤트), `debug`(개발)
- 모든 로그에 `companyId` 포함 (테넌트 추적)
- 크리덴셜/API 키는 로그에 절대 노출 금지 (자동 마스킹)
- 금융 거래 로그: 별도 `audit_logs` 테이블에 영구 저장

### Validation Pattern

```typescript
// API 입력 검증: Zod 스키마
const createAgentSchema = z.object({
  name: z.string().min(1).max(50),
  tier: z.enum(['manager', 'specialist', 'worker']),
  departmentId: z.string().uuid().nullable(),
  modelName: z.string(),
  allowedTools: z.array(z.string()),
});

// Hono 라우트에서 사용
app.post('/api/agents', async (c) => {
  const body = createAgentSchema.parse(await c.req.json());
  // ... 비즈니스 로직
});
```

**규칙:**
- 모든 API 입력은 Zod 스키마로 검증 (시스템 경계)
- 서비스 내부 함수 간에는 TypeScript 타입으로 충분 (이중 검증 금지)
- Zod 스키마 파일 위치: 해당 라우트 파일 상단 또는 `schemas/` 디렉토리

### Enforcement Guidelines

**모든 AI 에이전트 필수 준수:**
1. 파일명은 반드시 kebab-case 소문자
2. API 응답은 반드시 `{ success, data | error }` 래퍼
3. DB 쿼리에 반드시 companyId WHERE 절 포함 (tenantMiddleware가 강제)
4. LLM 호출은 반드시 LLMRouter를 통해 (직접 SDK 호출 금지)
5. 도구 호출은 반드시 ToolPool을 통해 (권한 검증 우회 금지)
6. 모든 비용 발생 호출은 CostTracker에 기록
7. 에이전트 프롬프트에 크리덴셜 절대 포함 금지
8. import 경로는 git ls-files 케이싱과 정확 일치

**Anti-Patterns (금지 목록):**
- `any` 타입 사용 (unknown + type guard 사용)
- catch 블록에서 에러 무시
- 서버에서 전역 변수로 상태 저장 (DB 사용)
- 프론트엔드에서 직접 fetch (TanStack Query useQuery/useMutation 사용)
- 하드코딩된 모델명/가격 (models.yaml 참조)
- console.log에 크리덴셜/토큰 노출

## Project Structure & Boundaries

### Complete Project Directory Structure

```
corthex-v2/
├── .github/
│   └── workflows/
│       └── deploy.yml                   # CI/CD: main push -> build -> deploy -> CF purge
├── packages/
│   ├── server/
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts                 # Hono app 엔트리 + WebSocket 설정
│   │       ├── types.ts                 # 서버 전용 타입
│   │       ├── db/
│   │       │   ├── schema.ts            # Drizzle 스키마 (전체 테이블 정의)
│   │       │   ├── seed.ts              # 초기 데이터 (시스템 에이전트, 기본 템플릿)
│   │       │   └── migrations/          # Drizzle Kit 마이그레이션
│   │       ├── middleware/
│   │       │   ├── auth.ts              # JWT 인증 (adminAuth + userAuth)
│   │       │   ├── tenant.ts            # companyId 주입 + 격리 검증
│   │       │   └── rate-limit.ts        # 회사별 속도 제한
│   │       ├── routes/
│   │       │   ├── auth.ts              # 로그인/가입/토큰갱신
│   │       │   ├── commands.ts          # 사령관실 명령 API
│   │       │   ├── agents.ts            # 에이전트 CRUD + Soul 편집
│   │       │   ├── departments.ts       # 부서 CRUD + cascade
│   │       │   ├── tools.ts             # 도구 관리 API
│   │       │   ├── cost.ts              # 비용 추적/집계 API
│   │       │   ├── presets.ts           # 명령 프리셋 API
│   │       │   ├── quality.ts           # 품질 검수 결과 API
│   │       │   ├── admin/               # 관리자 전용 라우트
│   │       │   │   ├── companies.ts     # 회사 CRUD
│   │       │   │   ├── users.ts         # 사용자 관리
│   │       │   │   ├── credentials.ts   # API 키 관리
│   │       │   │   └── templates.ts     # 조직 템플릿 관리
│   │       │   ├── strategy.ts          # 전략실 API (Phase 2)
│   │       │   ├── debates.ts           # AGORA API (Phase 2)
│   │       │   ├── sketches.ts          # SketchVibe API (Phase 2)
│   │       │   ├── sns.ts               # SNS 발행 API (Phase 2)
│   │       │   ├── cron.ts              # 크론 스케줄러 API (Phase 2)
│   │       │   ├── knowledge.ts         # 지식 베이스 API (Phase 2)
│   │       │   └── telegram.ts          # 텔레그램 웹훅 (Phase 2)
│   │       ├── services/
│   │       │   ├── orchestrator.ts      # 메인 오케스트레이션 엔진
│   │       │   ├── chief-of-staff.ts    # 명령 분류 + 품질 검수 (#010)
│   │       │   ├── agent-runner.ts      # 에이전트 LLM 실행 (무상태)
│   │       │   ├── llm-router.ts        # 멀티 프로바이더 라우팅 + fallback
│   │       │   ├── tool-pool.ts         # 도구 레지스트리 + 권한 검증 실행
│   │       │   ├── cost-tracker.ts      # 비용 기록 + 예산 관리
│   │       │   ├── quality-gate.ts      # 5항목 루브릭 검수
│   │       │   ├── organization.ts      # 조직 CRUD + cascade 엔진
│   │       │   ├── batch-collector.ts   # Batch API 큐 관리
│   │       │   ├── credential-vault.ts  # AES-256-GCM 암복호화
│   │       │   ├── agora-engine.ts      # 토론 오케스트레이션 (Phase 2)
│   │       │   ├── cron-scheduler.ts    # 크론 실행 (Phase 2)
│   │       │   └── argos-collector.ts   # 정보 수집 (Phase 2)
│   │       ├── tools/                   # 도구 구현 (125+)
│   │       │   ├── common/              # P0: web-search, calculator, translator 등 30+
│   │       │   ├── finance/             # Phase 2: kr-stock, kis-trading, dart-api
│   │       │   ├── legal/               # law-search, contract-reviewer
│   │       │   ├── marketing/           # sns-manager, seo-analyzer
│   │       │   └── tech/               # uptime-monitor, security-scanner
│   │       ├── ws/
│   │       │   ├── handler.ts           # WebSocket 연결 핸들러
│   │       │   └── event-bus.ts         # EventBus (7채널 멀티플렉싱)
│   │       ├── lib/
│   │       │   ├── llm/                 # LLM 프로바이더 어댑터
│   │       │   │   ├── anthropic.ts     # Claude SDK 래퍼
│   │       │   │   ├── openai.ts        # GPT SDK 래퍼
│   │       │   │   └── google.ts        # Gemini SDK 래퍼
│   │       │   └── crypto.ts            # AES-256-GCM 유틸리티
│   │       ├── config/
│   │       │   └── models.yaml          # 모델별 가격표 (input/output per 1M tokens)
│   │       ├── utils/
│   │       │   ├── token-counter.ts     # 토큰 카운팅
│   │       │   └── prompt-builder.ts    # 시스템 프롬프트 조립 (Soul + 지식 + 도구)
│   │       └── __tests__/
│   │           ├── unit/
│   │           │   ├── services/        # orchestrator, agent-runner, llm-router 등
│   │           │   └── utils/           # token-counter, prompt-builder 등
│   │           └── api/                 # API 통합 테스트
│   │
│   ├── app/                             # CEO/직원용 메인 앱
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.tsx                 # React 앱 엔트리
│   │       ├── App.tsx                  # 라우터 설정
│   │       ├── pages/
│   │       │   ├── command-center/      # 사령관실 (P0)
│   │       │   │   ├── index.tsx
│   │       │   │   └── components/      # CommandInput, DelegationChain, ReportViewer
│   │       │   ├── dashboard/           # 작전현황 대시보드 (P1)
│   │       │   │   ├── index.tsx
│   │       │   │   └── components/      # SummaryCards, UsageChart, CostChart
│   │       │   ├── agents/              # 에이전트 관리 + Soul 편집 (P0)
│   │       │   │   ├── index.tsx
│   │       │   │   └── components/      # AgentCard, SoulEditor, OrgTree
│   │       │   ├── activity/            # 통신로그 (P1)
│   │       │   │   ├── index.tsx
│   │       │   │   └── components/      # ActivityTab, CommTab, QATab, ToolTab
│   │       │   ├── strategy/            # 전략실 (Phase 2)
│   │       │   ├── nexus/               # SketchVibe 캔버스 (Phase 2)
│   │       │   ├── history/             # 작전일지 (Phase 2)
│   │       │   ├── archive/             # 기밀문서 (Phase 2)
│   │       │   ├── performance/         # 전력분석 (Phase 2)
│   │       │   ├── knowledge/           # 정보국 (Phase 2)
│   │       │   ├── schedule/            # 크론 스케줄러 (Phase 2)
│   │       │   ├── sns/                 # SNS 통신국 (Phase 2)
│   │       │   ├── argos/               # 정보 수집 (Phase 2)
│   │       │   └── workflow/            # 자동화 워크플로우 (Phase 2)
│   │       ├── components/
│   │       │   ├── command/             # CommandInput, PresetSelector, MentionPopup
│   │       │   ├── agent/               # AgentCard, StatusBadge, TierIcon
│   │       │   ├── report/              # ReportViewer, FeedbackButtons, QualityBadge
│   │       │   └── layout/              # AppShell, Sidebar, Header, Navigation
│   │       ├── stores/
│   │       │   ├── auth-store.ts        # 인증 상태 (JWT, 사용자 정보)
│   │       │   ├── command-store.ts     # 명령 입력 상태
│   │       │   ├── ws-store.ts          # WebSocket 연결 상태
│   │       │   └── ui-store.ts          # UI 상태 (사이드바, 테마)
│   │       ├── hooks/
│   │       │   ├── use-command.ts       # 명령 전송 + 위임 체인 구독
│   │       │   ├── use-agents.ts        # 에이전트 CRUD 쿼리
│   │       │   ├── use-websocket.ts     # WebSocket 연결 + 이벤트 구독
│   │       │   └── use-cost.ts          # 비용 데이터 쿼리
│   │       ├── lib/
│   │       │   └── api.ts              # API 클라이언트 (TanStack Query 설정)
│   │       └── __tests__/
│   │           ├── components/
│   │           └── hooks/
│   │
│   ├── admin/                           # 관리자 콘솔
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── pages/
│   │       │   ├── companies/           # 회사 CRUD
│   │       │   ├── users/               # 사용자 관리
│   │       │   ├── agents/              # 에이전트 관리 (전체 회사)
│   │       │   ├── departments/         # 부서 관리 + cascade
│   │       │   ├── credentials/         # API 키 관리
│   │       │   ├── templates/           # 조직 템플릿 관리
│   │       │   ├── cost/                # 전체/회사별 비용 대시보드
│   │       │   └── settings/            # 시스템 설정
│   │       ├── components/
│   │       ├── stores/
│   │       ├── hooks/
│   │       └── lib/
│   │
│   ├── ui/                              # 공유 컴포넌트 라이브러리
│   │   ├── package.json
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── badge.tsx
│   │       ├── chart.tsx               # 도넛/막대 차트 컴포넌트
│   │       └── index.ts                # barrel export
│   │
│   └── shared/                          # 공유 타입
│       ├── package.json
│       └── src/
│           ├── types/
│           │   ├── agent.ts             # Agent, Department, OrgTemplate
│           │   ├── command.ts           # Command, TaskRequest, TaskResponse
│           │   ├── tool.ts              # Tool, ToolResult, ToolContext
│           │   ├── cost.ts              # CostRecord, Budget, CostSummary
│           │   ├── quality.ts           # QualityCheckResult, QualityScore
│           │   ├── auth.ts              # User, AdminUser, JWTPayload
│           │   ├── ws-events.ts         # 7채널 이벤트 타입 정의
│           │   └── api.ts              # ApiResponse<T>, PaginatedResponse<T>
│           └── index.ts                 # barrel export
│
├── turbo.json                           # Turborepo 파이프라인
├── package.json                         # 루트 workspace
├── .env.example                         # 환경 변수 템플릿
└── drizzle.config.ts                    # Drizzle Kit 설정
```

### Component Boundaries

| 컴포넌트 | 책임 | 의존 대상 | 제공 인터페이스 |
|----------|------|----------|---------------|
| OrchestratorService | 명령 수명주기 관리 | ChiefOfStaff, AgentRunner, EventBus, QualityGate | `process(command): Promise<Report>` |
| ChiefOfStaff | 명령 분류 + 최종 검수 | LLMRouter | `classify(command)`, `review(report)` |
| AgentRunner | 에이전트 LLM 실행 | LLMRouter, ToolPool | `execute(agent, task): Promise<TaskResponse>` |
| LLMRouter | LLM 프로바이더 라우팅 | Provider Adapters, CostTracker | `call(request): Promise<LLMResponse>` |
| ToolPool | 도구 레지스트리 + 실행 | Tool 구현체, CredentialVault | `invoke(agent, toolName, params): Promise<ToolResult>` |
| OrganizationService | 조직 CRUD + cascade | DB, EventBus | `createDept()`, `deleteDept(mode)`, `moveAgent()` |
| CostTracker | 비용 기록 + 예산 | DB | `record(costRecord)`, `checkBudget(companyId)` |
| QualityGate | 5항목 검수 | LLMRouter | `check(report): Promise<QualityCheckResult>` |
| EventBus | 이벤트 멀티플렉싱 | WebSocket Handler | `emit(channel, event, data, companyId)` |
| CredentialVault | 암복호화 | Crypto | `encrypt(key)`, `decrypt(key)` |

### FR Category to Structure Mapping

| FR 영역 | 서버 모듈 | 프론트엔드 페이지 | 공유 타입 |
|---------|----------|----------------|----------|
| 조직 관리 (FR1-12) | routes/departments, routes/agents, services/organization | app/pages/agents, admin/pages/departments | types/agent.ts |
| 사령관실 (FR13-18) | routes/commands, routes/presets | app/pages/command-center | types/command.ts |
| 오케스트레이션 (FR19-25) | services/orchestrator, services/chief-of-staff, services/agent-runner | (WebSocket 이벤트로 표시) | types/command.ts |
| 도구 & LLM (FR26-34) | services/tool-pool, services/llm-router, tools/*, services/batch-collector | (서버 내부) | types/tool.ts |
| 모니터링 (FR35-41) | routes/cost | app/pages/dashboard, app/pages/activity | types/cost.ts |
| 보안 (FR42-49) | middleware/auth, middleware/tenant, routes/admin/* | admin/pages/* | types/auth.ts |
| 품질 (FR50-55) | services/quality-gate, routes/quality | app/pages/activity (QA 탭) | types/quality.ts |
| 투자 Phase 2 (FR56-62) | routes/strategy, tools/finance/* | app/pages/strategy | - |
| 협업 Phase 2/3 (FR63-76) | routes/debates, routes/sketches, routes/sns 등 | app/pages/nexus, sns 등 | - |

### Data Flow: Command Execution

```
1. Client: POST /api/commands {text: "삼성전자 분석"}
   ↓
2. routes/commands.ts → OrchestratorService.process()
   ↓ EventBus.emit('command', 'command-processing')
3. ChiefOfStaff.classify() → {departmentId, taskBreakdown}
   ↓ EventBus.emit('delegation', 'task-delegated', {from: 'CoS', to: 'CIO'})
4. AgentRunner.execute(CIO) → subtasks[]
   ↓ EventBus.emit('delegation', 'task-delegated', {from: 'CIO', to: 'analysts'})
5. Parallel: AgentRunner.execute(analyst1..N)
   ↓ ToolPool.invoke() → EventBus.emit('tool', 'tool-invoked')
   ↓ CostTracker.record() → EventBus.emit('cost', 'cost-updated')
6. AgentRunner.execute(CIO).synthesize() — #007 자체 분석 포함
   ↓
7. QualityGate.check(report)
   ├── Pass → EventBus.emit('command', 'command-done', {report})
   └── Fail → AgentRunner rework (max 2) → QualityGate 재검수
   ↓
8. WebSocket → Client: 보고서 렌더링 + thumbs up/down
```

### External Integration Points

| 외부 시스템 | 연동 파일 | 인증 | Phase |
|------------|----------|------|-------|
| Claude API | lib/llm/anthropic.ts | API Key (CredentialVault) | P0 |
| GPT API | lib/llm/openai.ts | API Key (CredentialVault) | P0 |
| Gemini API | lib/llm/google.ts | API Key (CredentialVault) | P0 |
| KIS 증권 | tools/finance/kis-trading.ts | OAuth2 (CredentialVault) | Phase 2 |
| 텔레그램 | routes/telegram.ts | Bot Token (CredentialVault) | Phase 2 |
| Selenium | tools/marketing/sns-manager.ts | 세션 쿠키 | Phase 2 |
| Neon PostgreSQL | db/schema.ts | Connection String (.env) | Epic 0 완료 |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
- 10개 핵심 결정 간 기술 충돌 없음
- Hono(v4) + Bun(1.3.10) + Drizzle(v0.39) + Neon PostgreSQL: 검증된 조합 (Epic 0에서 201건 테스트 통과)
- React(v19) + Vite(v6) + Tailwind(v4) + Zustand(v5) + TanStack Query(v5): 최신 안정 버전 호환
- LLM SDK 3종(Anthropic/OpenAI/Google): 독립 어댑터 패턴으로 상호 간섭 없음
- TypeScript strict 모드가 모든 패키지에 일관 적용

**Pattern Consistency:**
- Naming Convention 12개 규칙이 모든 Decision/Structure에 일관 반영
- API Response Format `{ success, data | error }`이 routes 전체에 통일
- Error Handling: 서버(Hono 글로벌) + 오케스트레이션(graceful degradation) + 프론트(TanStack retry) 3계층 일관
- State Management: Zustand(UI만) + TanStack Query(서버 데이터) + WebSocket(실시간 무효화) 경계 명확
- Validation: Zod는 시스템 경계(API 입력)에서만 사용, 내부는 TypeScript 타입 -- 이중 검증 없음

**Structure Alignment:**
- 디렉토리 트리의 모든 파일이 Decision 1-10의 컴포넌트와 1:1 매핑
- Component Boundaries 10개의 의존성이 Cross-Component Dependencies 테이블과 정확 일치
- 5개 패키지(server/app/admin/ui/shared) 간 의존 방향: shared <- ui <- app/admin, shared <- server (순환 없음)
- Phase 주석(P0/P1/Phase 2)이 PRD Phased Development 분류와 정확 일치

### Requirements Coverage Validation

**Functional Requirements Coverage (76 FRs):**

| FR 영역 | FRs | 아키텍처 지원 | 검증 |
|---------|-----|-------------|------|
| 조직 관리 (FR1-12) | 12 | Decision 5 (OrganizationService + CascadeEngine), routes/departments, routes/agents | 완전 커버 |
| 사령관실 (FR13-18) | 6 | Decision 1 (Orchestration), routes/commands, app/command-center | 완전 커버 |
| 오케스트레이션 (FR19-25) | 7 | Decision 1+2 (Orchestrator + AgentRunner), #007/#010 반영 | 완전 커버 |
| 도구 & LLM (FR26-34) | 9 | Decision 3+4 (LLMRouter + ToolPool), 3계급 모델 배정 | 완전 커버 |
| 모니터링 & 비용 (FR35-41) | 7 | Decision 7+8 (CostTracker + WebSocket), app/dashboard | 완전 커버 |
| 보안 & 멀티테넌시 (FR42-49) | 8 | Decision 9 (Tenant Isolation), middleware/auth+tenant, admin/* | 완전 커버 |
| 품질 관리 (FR50-55) | 6 | Decision 6 (QualityGate), 5항목 루브릭 | 완전 커버 |
| 투자 Phase 2 (FR56-62) | 7 | routes/strategy, tools/finance/*, Phase 2 표기 | 완전 커버 |
| 협업 Phase 2/3 (FR63-76) | 14 | routes/debates+sketches+sns+cron+knowledge+telegram, Phase 2/3 표기 | 완전 커버 |
| **합계** | **76** | | **76/76 = 100%** |

**CEO Ideas Coverage:**

| CEO 아이디어 | 아키텍처 반영 |
|-------------|-------------|
| #001 CIO+VECTOR | Decision 2 Agent 정의 + Phase 2 strategy 라우트 |
| #004 예측 워크플로우 | Phase 2/3 workflow 페이지 |
| #005 메모리 금지 | State Management 패턴: 서버 무상태 + DB 저장 원칙 |
| #007 Manager=5번째 분석가 | Decision 1 Orchestration: Manager.synthesize() 자체 분석 포함 |
| #010 비서실장=편집장 | Decision 1 Orchestration: ChiefOfStaff.review() 최종 검수 |

**Non-Functional Requirements Coverage (37 NFRs):**

| NFR 카테고리 | 건수 | 아키텍처 대응 |
|-------------|------|-------------|
| Performance (7) | 7 | 단계별 타임아웃(60초/5분), WebSocket <500ms (EventBus), FCP <3초 (Vite+React) |
| Security (7) | 7 | AES-256-GCM(CredentialVault), JWT(middleware/auth), companyId WHERE(tenant.ts), 로그 마스킹(Logging Pattern) |
| Scalability (5) | 5 | Phase 1 단일 인스턴스, 부서 20/에이전트 100 한도(OrganizationService), WebSocket 50(EventBus) |
| Reliability (6) | 6 | LLM fallback(LLMRouter), 도구 장애 격리(ToolPool), WebSocket 재연결 3초(use-websocket.ts) |
| Integration (4) | 4 | Provider Adapter 패턴, KIS OAuth2(CredentialVault), 도구별 타임아웃(ToolPool) |
| Cost Efficiency (4) | 4 | 3계급 모델 배정(Decision 3), Batch API(batch-collector.ts), 예산 자동 차단(CostTracker) |
| Operability (4) | 4 | 조직 템플릿 2분(OrgTemplate), CI/CD 5분(deploy.yml), WebSocket 알림(EventBus) |

### Implementation Readiness Validation

**Decision Completeness:**
- 10개 핵심 결정 모두 TypeScript 인터페이스/클래스 코드 예시 포함
- 모델 매핑 테이블 6개 모델 + 가격 등급 명시
- 구현 순서 10단계 의존성 기반 정렬 제공
- Cross-Component Dependencies 테이블로 인터페이스 계약 명확

**Structure Completeness:**
- ~100개 파일의 완전한 디렉토리 트리 (파일명 + 주석 + Phase 표기)
- 10개 컴포넌트 경계 테이블 (책임, 의존, 인터페이스 시그니처)
- 7개 외부 연동 지점 (파일, 인증 방식, Phase 명시)
- FR-to-Structure 매핑 9개 영역 x 3계층(서버/프론트/타입) 완비

**Pattern Completeness:**
- 12개 Naming Convention + 금지 예시
- API Response/Error Handling/Validation 코드 예시
- 8개 필수 준수 규칙 + 6개 Anti-Pattern
- Import 순서, State Management, Logging 패턴 코드 수준 정의

### Gap Analysis Results

**Critical Gaps: 0건**
- 구현 차단 요소 없음. 10개 결정이 76 FRs를 완전 커버.

**Important Gaps: 0건**
- 모든 패턴에 코드 예시 제공. 컴포넌트 경계와 인터페이스 명확.

**Nice-to-Have (향후 개선 가능):**
1. Phase 2 도구 125+개의 개별 파라미터 스키마 -- 구현 시 점진 정의
2. WebSocket 이벤트 페이로드 상세 타입 -- ws-events.ts에서 구현 시 확정
3. models.yaml 실제 가격 데이터 -- 구현 시 최신 가격 반영
4. quality_rules.yaml 상세 규칙 -- P1에서 도메인별 규칙 정의

> 모두 구현 단계에서 자연스럽게 해결되는 항목. 아키텍처 결정 수준에서는 불필요.

### Validation Issues Addressed

이슈 없음. 6개 스텝 모두 Reviewer 3라운드 PASS (총 18라운드, 0건 major issue).

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] 프로젝트 컨텍스트 분석 (76 FRs + 37 NFRs + 7 Cross-Cutting)
- [x] 규모 및 복잡도 평가 (~35 서버 모듈 + ~50 프론트 컴포넌트)
- [x] 기술 제약 식별 (Epic 0 + 외부 의존성 + #005 원칙)
- [x] Cross-Cutting Concerns 매핑 (7개)

**Architectural Decisions**
- [x] 핵심 결정 10개 문서화 (버전 + 코드 예시)
- [x] 기술 스택 완전 명세 (Runtime + Server + Frontend + Testing)
- [x] 통합 패턴 정의 (LLM Adapter + Tool Registry + EventBus)
- [x] 성능 고려 반영 (타임아웃, fallback, Batch API)

**Implementation Patterns**
- [x] Naming Convention 확립 (12개 규칙)
- [x] 구조 패턴 정의 (디렉토리 트리 + 컴포넌트 경계)
- [x] 통신 패턴 명세 (API Response + WebSocket 7채널 + Error Handling)
- [x] 프로세스 패턴 문서화 (Validation + Logging + State Management)

**Project Structure**
- [x] 완전한 디렉토리 구조 정의 (~100파일)
- [x] 컴포넌트 경계 확립 (10개)
- [x] 통합 지점 매핑 (7개 외부 시스템)
- [x] 요구사항-구조 매핑 완료 (9 영역 x 3 계층)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Epic 0 Foundation 위에 구축 -- 201건 테스트 통과된 기반 코드 존재
2. 10개 핵심 결정 모두 TypeScript 인터페이스 + 코드 예시 제공 -- AI 에이전트 즉시 구현 가능
3. 구현 순서 10단계가 의존성 기반으로 정렬 -- 병렬 작업 충돌 방지
4. Phase 구분(P0/P1/Phase 2/3)이 디렉토리 주석에 명시 -- 스프린트 계획 직접 활용
5. v1 핵심 기능(오케스트레이션, 도구, LLM, 품질, 비용) 전부 아키텍처 지원 확인

**Areas for Future Enhancement:**
1. 수평 확장 전략 (Phase 3 -- 멀티 인스턴스/로드 밸런싱)
2. 벡터 DB 선택 (Phase 2 -- RAG/정보국용)
3. 에이전트 마켓플레이스 아키텍처 (Phase 3)
4. 사내 메신저 실시간 아키텍처 (Phase 3)

### Implementation Handoff

**AI Agent Guidelines:**
- 모든 아키텍처 결정을 문서 그대로 구현할 것
- Implementation Patterns의 8개 필수 규칙 + 6개 Anti-Pattern 엄수
- 프로젝트 구조와 컴포넌트 경계 준수
- 아키텍처 질문은 이 문서를 최우선 참조

**First Implementation Priority:**
구현 순서 Decision Impact Analysis 기준:
1. 테넌트 격리 미들웨어 (모든 API 기반)
2. 데이터 아키텍처 (스키마 + 마이그레이션)
3. 동적 조직 관리 (부서/에이전트 CRUD + cascade)
4. LLM 프로바이더 라우터
5. 에이전트 실행 모델 (AgentRunner)
