# Story 5.2: ChiefOfStaff 자동 분류 + 위임

Status: done

## Story

As a **CEO/Human 직원 (사령관실 사용자)**,
I want **자연어 명령(슬래시/@멘션 아닌 일반 텍스트)을 입력하면 비서실장(ChiefOfStaff)이 LLM으로 자동 분류하여 적합한 부서/Manager에게 위임하고, 결과물에 대해 5항목 품질 검수를 수행하는 서비스**,
so that **CEO가 부서를 일일이 지정하지 않아도 명령이 최적의 Manager에게 자동 라우팅되고, 품질이 보장된 결과물을 받을 수 있다**.

## Acceptance Criteria

1. **ChiefOfStaff.classify(command)**: LLM 호출로 명령을 분석하여 적합한 부서/Manager 결정
   - 입력: command text + 현재 조직 구조(부서 목록 + Manager 목록)
   - 출력: `{ departmentId, managerId, confidence, reasoning }`
   - confidence < 0.5이면 비서실장이 직접 처리 (fallback)
   - 조직에 Manager가 없으면 에러 반환

2. **ChiefOfStaff.delegate(classifyResult, command)**: 분류 결과에 따라 Manager에게 TaskRequest 전송
   - @멘션 명령은 분류 건너뛰고 직접 해당 Manager에게 위임
   - orchestration_tasks 테이블에 classify/delegate 타입 레코드 생성
   - WebSocket command 채널로 "분류 중..." / "위임 중..." 상태 전송

3. **ChiefOfStaff.qualityGate(result, command)**: 5항목 품질 검수
   - 결론 명확성 (conclusionClarity): 1-5점
   - 근거 충분성 (evidenceSufficiency): 1-5점
   - 리스크 언급 (riskMention): 1-5점
   - 형식 적절성 (formatAdequacy): 1-5점
   - 논리 일관성 (logicalConsistency): 1-5점
   - 합계 >= 15점 → PASS, < 15점 → FAIL
   - quality_reviews 테이블에 결과 기록

4. **자동 재작업 (rework)**: 품질 게이트 FAIL 시
   - 피드백과 함께 동일 Manager에게 재작업 지시
   - 최대 2회 재작업 (attemptNumber 1→2→3)
   - 2회 재작업 후에도 FAIL → 경고 플래그(`warningFlag: true`) 달아 결과 전달
   - 각 시도마다 quality_reviews 레코드 생성

5. **CommandRouter 통합**: direct 타입 명령이 들어오면 ChiefOfStaff.process() 호출
   - commands 테이블 status: pending → processing → completed/failed
   - commands.result에 최종 결과 텍스트 저장
   - commands.metadata.qualityGate에 품질 검수 요약 저장

6. **WebSocket 상태 전송**: 각 단계마다 command 채널로 이벤트 푸시
   - `{ type: 'command:status', commandId, phase: 'classifying'|'delegating'|'executing'|'reviewing'|'reworking'|'completed'|'failed' }`

## Tasks / Subtasks

- [x] Task 1: ChiefOfStaffService 구현 (AC: #1, #2, #3, #4)
  - [x] 1.1 `packages/server/src/services/chief-of-staff.ts` 생성
  - [x] 1.2 `classify(commandText, companyId)`: 조직 구조 로드 + LLM 호출 → 부서/Manager 결정
  - [x] 1.3 `delegate(classifyResult, command)`: Manager에게 AgentRunner.execute() 호출
  - [x] 1.4 `qualityGate(result, command)`: LLM으로 5항목 점수 산출 + quality_reviews INSERT
  - [x] 1.5 `rework(feedback, command, previousResult)`: 피드백 포함 재작업 지시
  - [x] 1.6 `process(command)`: 전체 파이프라인 (classify → delegate → qualityGate → rework loop)

- [x] Task 2: CommandRouter 통합 (AC: #5)
  - [x] 2.1 `packages/server/src/routes/commands.ts` 수정: POST /api/commands에서 direct 타입이면 ChiefOfStaff.process() 호출
  - [x] 2.2 commands 테이블 status/result/metadata 업데이트 로직
  - [x] 2.3 비동기 처리: 명령 수신 즉시 응답 → 백그라운드에서 처리 → WebSocket으로 결과 전송

- [x] Task 3: WebSocket 상태 전송 (AC: #6)
  - [x] 3.1 EventBus command 채널 활용: 단계별 phase 이벤트 전송
  - [x] 3.2 companyId 격리된 채널로만 전송

- [x] Task 4: 단위 테스트 (AC: all)
  - [x] 4.1 classify() 테스트: LLM 응답 파싱, confidence threshold, fallback
  - [x] 4.2 delegate() 테스트: Manager 에이전트 호출, orchestration_tasks 생성
  - [x] 4.3 qualityGate() 테스트: 5항목 점수 계산, PASS/FAIL 판정, quality_reviews 저장
  - [x] 4.4 rework() 테스트: 재작업 루프 (최대 2회), 경고 플래그
  - [x] 4.5 process() 통합 테스트: 전체 파이프라인, 상태 전이, WebSocket 이벤트
  - [x] 4.6 엣지 케이스: Manager 없는 조직, LLM 실패, 타임아웃

## Dev Notes

### 기존 코드 현황

**이미 존재하는 인프라 (Story 5-1에서 구축):**

1. **CommandRouter** (`packages/server/src/services/command-router.ts`):
   - `classify()`: 명령 타입 분류 (direct/mention/slash/preset/batch/all/sequential/deepwork)
   - `createCommand()`: commands 테이블 INSERT
   - **direct 타입**이 이 스토리의 진입점 — ChiefOfStaff.process()로 라우팅해야 함

2. **Commands API** (`packages/server/src/routes/commands.ts`):
   - POST /api/workspace/commands: 명령 수신 엔드포인트
   - 현재는 classify + DB 저장만 수행 → ChiefOfStaff 호출 추가 필요

3. **AgentRunner** (`packages/server/src/services/agent-runner.ts`):
   - `execute(agent, task, context, toolExecutor)`: LLM 호출 + 도구 실행
   - `executeStream()`: 스트리밍 버전
   - AgentConfig 타입: { id, companyId, name, tier, modelName, soul, allowedTools, isActive }
   - TaskRequest 타입: { messages, context?, maxToolIterations? }
   - TaskResponse 타입: { content, toolCalls, usage, cost, finishReason, iterations }

4. **LLM Router** (`packages/server/src/services/llm-router.ts`):
   - llmRouter.call(request, context): LLM 호출
   - resolveModel({ tier, modelName }): 모델 결정
   - LLMRouterContext: { companyId, agentId, tier }

5. **Organization Service** (`packages/server/src/services/organization.ts`):
   - `getDepartments(companyId)`: 부서 목록 조회
   - `getAgents(companyId, filters)`: 에이전트 목록 조회
   - `getAgentById(companyId, agentId)`: 단일 에이전트 조회

6. **DB 스키마** (`packages/server/src/db/schema.ts`):
   - `commands`: id, companyId, userId, type, text, targetAgentId, status, result, metadata(jsonb)
   - `orchestrationTasks`: id, companyId, commandId, agentId, parentTaskId, type(classify|delegate|execute|synthesize|review), input, output, status, startedAt, completedAt, durationMs, metadata
   - `qualityReviews`: id, companyId, commandId, taskId, reviewerAgentId, conclusion(pass|fail), scores(jsonb), feedback, attemptNumber

7. **EventBus WebSocket** (`packages/server/src/websocket/`):
   - 7채널 멀티플렉싱: command, delegation, tool, cost, agent, system, notification
   - `eventBus.emit('command', { companyId, ... })` 패턴

8. **비서실장 시스템 에이전트**: 시드 데이터에서 isSystem=true로 생성됨
   - 모든 회사에 자동 생성되는 시스템 에이전트
   - tier='manager', modelName='claude-sonnet-4-6'

### v1 참고 (매우 중요)

**v1 분류 로직** (`/home/ubuntu/CORTHEX_HQ/web/ai_handler.py:551-581`):
- `classify_task(text)`: 가장 저렴한 모델(Gemini Flash → GPT Mini → Claude Haiku)로 분류
- 시스템 프롬프트에 에이전트 목록 + 전문 분야를 제공하고 JSON 응답 요구
- 반환: `{ agent_id, reason, cost_usd }`
- AI 미연결 시 fallback: chief_of_staff에게 라우팅

**v1 라우팅** (`/home/ubuntu/CORTHEX_HQ/web/agent_router.py`):
- `_ROUTING_KEYWORDS`: 부서별 키워드 매핑 (전략/법무/마케팅/금융/콘텐츠)
- `_detect_explicit_target(text)`: 한국어 에이전트 이름으로 직접 지정 감지
- `_BROADCAST_KEYWORDS`: "전체", "모든 부서" 등 → 모든 Manager에게 동시 위임
- `_MANAGER_SPECIALISTS`: 팀장 → 소속 전문가 매핑

**v1 품질 검수** (`/home/ubuntu/CORTHEX_HQ/web/handlers/quality_handler.py`):
- quality_rules.yaml 기반 검수 규칙
- 부서별 루브릭 (default + 부서별 커스텀)
- 5항목 채점: 각 1-5점
- pass_criteria: all_required_pass + min_average_score >= 3.0
- 재작업: max_retry 횟수 설정 가능

**v2에서 달라지는 점:**
- v1은 키워드 기반 + LLM fallback → v2는 LLM 기반 분류 (조직 구조가 동적이므로 키워드 테이블 불가)
- v1은 에이전트 29명 고정 → v2는 동적 조직이므로 분류 시 현재 조직 구조를 LLM에게 제공
- v1은 품질 검수가 별도 모듈 → v2는 ChiefOfStaff 서비스에 통합
- v1은 품질 검수 비활성 상태 → v2는 P0 필수 기능

### 아키텍처 결정 참고

**Decision #1: Orchestration Engine** (architecture.md):
```
CommandRouter → OrchestratorService.process(command)
  → ChiefOfStaff.classify(command)           // LLM 호출
    → Returns: {departmentId, priority, taskBreakdown}
  → Manager.delegate(task)                    // LLM 호출
  → Manager.synthesize(results)               // Story 5-3, 5-4
  → ChiefOfStaff.review(report)              // LLM 호출 (#010: 편집장)
```

**Decision #6: Quality Gate Pipeline**:
- P0: 비서실장이 LLM으로 5항목 검수 (간이)
- Pass 기준: 평균 >= 3.0 (아키텍처), 합계 >= 15 (Epic 수용기준에서 15점 = 평균 3.0)
- Fail: 피드백 포함 자동 재작업 (최대 2회)
- 2회 실패 후: 경고 플래그 달아 CEO에게 전달

### LLM 프롬프트 설계 (핵심)

**분류 프롬프트 구조:**
```
시스템: "당신은 CORTHEX의 비서실장입니다. CEO의 명령을 분석하여 가장 적합한 부서/Manager를 결정하세요."
+ 현재 조직 구조 (부서 목록 + 각 부서의 Manager 이름/전문분야/역할)
+ JSON 응답 형식: { departmentId, managerId, confidence (0-1), reasoning }

사용자: CEO 명령 텍스트
```

**품질 검수 프롬프트 구조:**
```
시스템: "당신은 품질 검수관입니다. 다음 결과물을 5가지 항목으로 평가하세요."
+ 5항목 루브릭 설명 (각 1-5점)
+ JSON 응답 형식: { scores: { conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency }, totalScore, passed, feedback? }

사용자: 원본 명령 + 에이전트 결과물
```

### 아키텍처 제약사항

- **tenant 격리**: 모든 쿼리에 companyId WHERE 필수
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`chief-of-staff.ts`)
- **테스트**: bun:test 프레임워크 사용
- **import 경로**: 실제 파일 대소문자와 일치 필수 (Linux CI)
- **LLM 단일 호출 타임아웃**: 30초 (NFR3)
- **전체 체인 타임아웃**: 5분 (NFR2)
- **비서실장은 시스템 에이전트**: isSystem=true, 모든 회사에 시드 데이터로 생성됨
- **비용 기록**: AgentRunner가 자동으로 cost 포함 반환 → costRecords 저장은 별도 (이 스토리에서는 AgentRunner 반환값에 포함된 cost 정보를 metadata에 기록)

### Project Structure Notes

- 새 파일: `packages/server/src/services/chief-of-staff.ts`
- 수정: `packages/server/src/routes/commands.ts` (ChiefOfStaff 호출 추가)
- 테스트: `packages/server/src/__tests__/unit/chief-of-staff.test.ts`
- 참고: `packages/server/src/services/agent-runner.ts` (AgentRunner 호출 패턴)
- 참고: `packages/server/src/services/organization.ts` (조직 구조 조회)
- 참고: `packages/server/src/db/schema.ts` (orchestrationTasks, qualityReviews 테이블)

### 구현 시 주의사항

1. **LLM 응답 파싱**: JSON 응답을 요구하더라도 LLM이 마크다운 코드블록으로 감쌀 수 있음 → `\`\`\`json ... \`\`\`` 스트리핑 필요
2. **비서실장 에이전트 조회**: 시드 데이터에서 isSystem=true, name='비서실장' 또는 nameEn='ChiefOfStaff'로 조회
3. **Manager 필터**: agents 테이블에서 tier='manager', isActive=true, companyId 격리
4. **비동기 처리**: POST /api/commands는 즉시 commandId 반환, 실제 처리는 백그라운드 → WebSocket으로 결과 전송
5. **에러 핸들링**: LLM 호출 실패 시 commands.status='failed' + 에러 메시지 → WebSocket 알림
6. **orchestration_tasks 기록**: classify, delegate 각 단계마다 레코드 생성 (추적 가능)
7. **quality_reviews의 reviewerAgentId**: 비서실장 에이전트 ID 사용

### References

- [Source: packages/server/src/services/command-router.ts] CommandRouter - classify(), createCommand()
- [Source: packages/server/src/routes/commands.ts] Commands API 엔드포인트
- [Source: packages/server/src/services/agent-runner.ts] AgentRunner.execute() 패턴
- [Source: packages/server/src/services/llm-router.ts] LLM Router + resolveModel()
- [Source: packages/server/src/services/organization.ts] getDepartments(), getAgents(), getAgentById()
- [Source: packages/server/src/db/schema.ts#orchestrationTasks] 오케스트레이션 작업 추적
- [Source: packages/server/src/db/schema.ts#qualityReviews] 품질 검수 결과
- [Source: packages/server/src/db/schema.ts#commands] 명령 테이블
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision1] Orchestration Engine 아키텍처
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision6] Quality Gate Pipeline
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S2] 스토리 수용 기준
- [Source: _bmad-output/planning-artifacts/prd.md#FR19] 비서실장 자동 분류 + 위임
- [Source: _bmad-output/planning-artifacts/prd.md#FR50-FR51] 5항목 검수 + 자동 재작업
- [Source: /home/ubuntu/CORTHEX_HQ/web/ai_handler.py:551-581] v1 classify_task() 분류 로직
- [Source: /home/ubuntu/CORTHEX_HQ/web/agent_router.py] v1 라우팅 키워드 + Manager-Specialist 매핑
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/quality_handler.py] v1 품질 검수 규칙/루브릭
- [Source: /home/ubuntu/CORTHEX_HQ/src/divisions/secretary/chief_of_staff.py] v1 비서실장 에이전트

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- ChiefOfStaffService: classify(), delegate(), qualityGate(), rework(), process() — full pipeline
- LLM-based classification with org structure context (departments + managers list)
- 5-item quality gate: conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency
- Auto-rework loop: max 2 attempts, warningFlag on exceeded
- parseLLMJson helper: strips markdown code blocks, extracts JSON from surrounding text
- CommandRouter integration: direct/mention commands trigger async ChiefOfStaff processing
- WebSocket events via eventBus: command:status with phase tracking
- orchestration_tasks records for classify/delegate phases
- quality_reviews records for each quality gate attempt
- 46 unit tests covering: parseLLMJson, classification logic, quality gate scoring, rework logic, prompt building, pipeline phases, result structure
- No regressions: 59 existing command-router tests still pass (105 total)
- No new TS errors introduced

### Change Log

- 2026-03-07: Story 5-2 implementation complete — ChiefOfStaff service + CommandRouter integration + 46 tests
- 2026-03-07: TEA risk-based tests added — 54 additional tests (100 total)
- 2026-03-07: Code review fixes — import ordering, toAgentConfig helper (3x dedup), NaN confidence guard, startedAt null safety, unused userId removed

### File List

- packages/server/src/services/chief-of-staff.ts (NEW)
- packages/server/src/routes/commands.ts (MODIFIED — ChiefOfStaff integration for direct/mention commands)
- packages/server/src/__tests__/unit/chief-of-staff.test.ts (NEW)
