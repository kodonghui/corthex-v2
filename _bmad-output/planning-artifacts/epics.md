---
stepsCompleted: [1, 2, 3]
partyModeRounds: 9
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-engine-refactor-2026-03-10.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
workflowType: 'epics-and-stories'
project_name: 'corthex-v2'
date: '2026-03-11'
---

# CORTHEX v2 — Epics & User Stories

_Agent Engine Refactor: SDK 기반 엔진 교체 + 동적 조직 관리 + 지능화_

## Overview

| 항목 | 값 |
|------|-----|
| Total Epics | 12 |
| Total Stories | 64 |
| Total Story Points | 174 SP |
| Phases | 4 (Engine → Orchestration → Tier/Viz → Intelligence) |
| Duration | ~9 weeks |
| Architecture Decisions | D1~D16 |
| Engine Patterns | E1~E10 |

### Phase-Epic Mapping

| Phase | Duration | Epics | Focus |
|-------|----------|-------|-------|
| Phase 1: Engine | 2 weeks | Epic 1~4 | SDK 엔진 교체, Hook 보안, 마이그레이션 |
| Phase 2: Orchestration | 3 weeks | Epic 5~7 | 비서 시스템, Hub UX, 조직 관리 |
| Phase 3: Tier & Visualization | 2 weeks | Epic 8~9 | N-Tier 계층, NEXUS React Flow |
| Phase 4: Intelligence | 2 weeks | Epic 10~11 | 의미검색, NotebookLM, SketchVibe MCP |
| Supporting | Ongoing | Epic 12 | 테스트 인프라, CI, 품질 게이트 |

---

## Epic 1: Engine Foundation & Infrastructure

**Phase:** 1 (Week 1)
**Priority:** P0 — 모든 후속 Epic의 전제
**Story Points:** 13 SP
**Dependencies:** None (첫 번째)
**Architecture:** D1 (getDB), D3 (에러 코드), D9 (로거), E3, E10

### Goal
SDK 엔진의 기반 인프라를 구축한다: 멀티테넌시 격리(getDB), 구조화 로거, 에러 코드 체계, 세션 제한, CI 경계 검증. 이 인프라가 없으면 엔진 코어(Epic 2)와 Hook(Epic 3)을 구현할 수 없다.

### Stories

#### Story 1.1: Phase 1 의존성 검증 및 설치
**Points:** 3 SP | **Priority:** P0

**As a** 개발자
**I want** Phase 1에 필요한 모든 패키지가 설치되고 빌드가 통과하는 것을
**So that** 이후 구현 시 의존성 문제로 차단되지 않는다

**Acceptance Criteria:**
- [ ] `@anthropic-ai/claude-agent-sdk@0.2.72` exact pin 설치 (^ 없음)
- [ ] `@zapier/secret-scrubber` 설치 + ARM64 빌드 확인
- [ ] `hono-rate-limiter` 설치
- [ ] `croner` 설치 (Bun 네이티브 호환)
- [ ] `pino` 설치 + Bun 호환 테스트 → 실패 시 `consola` 폴백 설치 (D9)
- [ ] `turbo build` 성공 (전체 패키지)
- [ ] `bun test` 기존 테스트 전체 통과
- [ ] Zod v4 ↔ 기존 Zod v3 충돌 여부 확인 (`grep -r "from 'zod'" packages/`)
- [ ] Dockerfile COPY 목록 업데이트
- [ ] ARM64 Docker 빌드 성공
- [ ] `bun.lockb` 커밋 추적 확인 (V11)

**Technical Notes:**
- SDK 0.x → exact pin 필수 (아키텍처 V1, V6)
- pino Bun 호환 테스트 → 실패 시 consola 폴백 (D9)

---

#### Story 1.2: getDB(companyId) 멀티테넌시 래퍼
**Points:** 3 SP | **Priority:** P0

**As a** 서버 개발자
**I want** 모든 DB 접근이 companyId로 자동 격리되는 것을
**So that** 타사 데이터에 접근할 수 없다

**Acceptance Criteria:**
- [ ] `packages/server/src/db/scoped-query.ts` (~30줄) 생성
- [ ] READ: agents(), departments(), tierConfigs(), knowledgeDocs() 스코프 쿼리
- [ ] WRITE: insertAgent(), updateAgent(), deleteAgent() — companyId 자동 주입
- [ ] UPDATE/DELETE에 companyId WHERE 자동 적용 (E3)
- [ ] companyId 빈 문자열 시 throw Error (가드)
- [ ] 단위 테스트: `scoped-query.test.ts` — 격리 검증 3케이스
- [ ] 기존 `tenant-isolation.test.ts`에 getDB 케이스 추가

**Technical Notes:**
- Anti-Pattern: `db.select().from(agents)` 직접 쿼리 금지 (E3)
- Phase 1에서는 engine이 사용하는 테이블만. 나머지 점진 추가
- 기존 코드와 공존 (Phase 1에서는 강제 전환 안 함)

---

#### Story 1.3: 구조화 로거 어댑터
**Points:** 2 SP | **Priority:** P0

**As a** 운영자
**I want** 모든 로그에 sessionId, companyId, agentId가 자동 포함되는 것을
**So that** 문제 발생 시 세션 단위로 추적할 수 있다

**Acceptance Criteria:**
- [ ] `packages/server/src/db/logger.ts` (~10줄) 생성
- [ ] pino 우선 시도 → Bun 미호환 시 consola 폴백 (D9)
- [ ] 어댑터 인터페이스: `{ info, warn, error, child }` — 교체 비용 0
- [ ] child logger 패턴: `log.child({ sessionId, companyId, agentId })`
- [ ] 구조화 출력: `{ timestamp, level, sessionId, agentId, companyId, event, data }`
- [ ] console.log 직접 사용 금지 (Anti-Pattern 등록)

**Technical Notes:**
- NFR-LOG1~3 요구사항 충족
- 30일 보관은 인프라 설정 (이 스토리 범위 외)

---

#### Story 1.4: 에러 코드 레지스트리
**Points:** 2 SP | **Priority:** P0

**As a** 프론트엔드/백엔드 개발자
**I want** 모든 에러가 도메인 프리픽스 코드로 통일되는 것을
**So that** HTTP와 SSE 양쪽에서 일관된 에러 처리가 가능하다

**Acceptance Criteria:**
- [ ] `packages/server/src/lib/error-codes.ts` (~30줄) 생성
- [ ] 프리픽스 6종: AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, ORG_ (D3)
- [ ] 기존 숫자 코드 → 서술 별명 매핑 (AUTH_001 → AUTH_INVALID_CREDENTIALS)
- [ ] 신규 코드: AGENT_SPAWN_FAILED, AGENT_TIMEOUT, SESSION_LIMIT_EXCEEDED, HANDOFF_DEPTH_EXCEEDED, HANDOFF_CIRCULAR, HANDOFF_TARGET_NOT_FOUND, TOOL_PERMISSION_DENIED, HOOK_PIPELINE_ERROR
- [ ] `as const` 타입 안전성
- [ ] 단위 테스트: `error-codes.test.ts` — 중복 코드 없음 검증
- [ ] 기존 에러 코드와 충돌 없음 확인

**Technical Notes:**
- 신규 engine 코드: 영어 메시지 (디버깅용)
- 프론트: Phase 2에서 `error-messages.ts` 코드→한국어 변환 (S10)
- 미등록 코드 fallback: "오류가 발생했습니다 (코드: {code})" (P11)

---

#### Story 1.5: 세션 Rate Limiter 미들웨어
**Points:** 2 SP | **Priority:** P1

**As a** 시스템 관리자
**I want** 동시 에이전트 세션이 20개를 초과하지 않는 것을
**So that** 4코어 서버의 CPU가 포화되지 않는다

**Acceptance Criteria:**
- [ ] `packages/server/src/middleware/rate-limiter.ts` 생성
- [ ] `hono-rate-limiter` 기반 동시 세션 제한 (NFR-SC1: 20)
- [ ] 초과 시 HTTP 429 + `SESSION_LIMIT_EXCEEDED` 에러 코드
- [ ] 세션 종료 시 카운트 감소 (SSE done 이벤트 연동)
- [ ] 설정 가능: 환경변수 `MAX_CONCURRENT_SESSIONS` (기본 20)

**Technical Notes:**
- 4코어 ARM64, HT 없음 → 동시 spawn 시 CPU 스파이크 주의
- CLI rate limit에 의해 추가 하향 가능 (Phase 1 부하 테스트로 확정)

---

#### Story 1.6: CI Engine 경계 검증 스크립트
**Points:** 1 SP | **Priority:** P1

**As a** 개발자
**I want** engine/ 내부 모듈이 외부에서 직접 import되면 CI가 실패하는 것을
**So that** 아키텍처 경계(E8, E10)가 자동으로 보호된다

**Acceptance Criteria:**
- [ ] `.github/scripts/engine-boundary-check.sh` 생성
- [ ] `grep -rn "from.*engine/hooks/"` routes/, lib/ → 발견 시 exit 1
- [ ] `grep -rn "from.*engine/soul-renderer"` routes/, lib/ → 발견 시 exit 1
- [ ] `grep -rn "from.*engine/model-selector"` routes/, lib/ → 발견 시 exit 1
- [ ] `deploy.yml`에 step 추가 (빌드 전 실행)
- [ ] 허용: `engine/agent-loop`, `engine/types` import만

**Technical Notes:**
- engine/ 공개 API = agent-loop.ts + types.ts 2개만 (E8)
- barrel export(index.ts) 만들지 않음

---

## Epic 2: Agent Engine Core

**Phase:** 1 (Week 1~2)
**Priority:** P0 — 핵심 엔진
**Story Points:** 18 SP
**Dependencies:** Epic 1 (getDB, logger, error-codes)
**Architecture:** D5 (SessionContext), D6 (단일 진입점), E1, E4, E5, E6, E7, E8

### Goal
SDK query() 래퍼인 agent-loop.ts를 구현하고, Soul 템플릿 변수 치환, 모델 선택, SSE 어댑터, call_agent 핸드오프를 완성한다. 이 Epic이 완료되면 "에이전트에게 메시지를 보내면 응답을 받는다"가 동작한다.

### Stories

#### Story 2.1: engine/types.ts — SessionContext & SSE 타입 정의
**Points:** 2 SP | **Priority:** P0

**As a** 엔진 개발자
**I want** SessionContext, SSEEvent, PreToolHookResult 등 핵심 타입이 정의되는 것을
**So that** 모든 엔진 모듈이 일관된 타입을 사용한다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/types.ts` 생성
- [ ] SessionContext 인터페이스 — 9 readonly 필드 (E1): cliToken, userId, companyId, depth, sessionId, startedAt, maxDepth, visitedAgents
- [ ] `readonly string[]` for visitedAgents (병렬 핸드오프 시 독립 복사)
- [ ] SSEEvent 유니언 타입 — 6종: accepted, processing, handoff, message, error, done (E5)
- [ ] PreToolHookResult: `{ allow: boolean; reason?: string }`
- [ ] RunAgentOptions: `{ ctx: SessionContext; soul: string; message: string; tools?: Tool[] }`
- [ ] **server 내부 전용** — shared re-export 금지 (P1, S1)
- [ ] `ctx.depth = 1` → 컴파일 에러 확인 (readonly)

**Technical Notes:**
- Anti-Pattern: engine/types.ts를 shared re-export → 프론트에 cliToken 타입 노출
- 타입 경계 맵: shared/types.ts (공용) ↔ server/types.ts (Hono) ↔ engine/types.ts (엔진)

---

#### Story 2.2: agent-loop.ts — SDK query() 래퍼 + 단일 진입점
**Points:** 5 SP | **Priority:** P0

**As a** 시스템
**I want** 모든 에이전트 실행이 agent-loop.ts를 통과하는 것을
**So that** Hook 파이프라인이 우회 불가하고 보안이 보장된다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/agent-loop.ts` (~50줄) 생성
- [ ] `runAgent(options: RunAgentOptions)` 단일 export (D6)
- [ ] SessionContext 생성 (최초 호출 시) 또는 전파 (핸드오프 시)
- [ ] Pre-spawn "accepted" SSE 이벤트 발행 (SDK spawn ~2초 흡수)
- [ ] SDK `Agent.query()` 호출: `env: { ANTHROPIC_API_KEY: ctx.cliToken }`
- [ ] query() 호출 후 cliToken 변수 즉시 null (NFR-S2)
- [ ] Hook 파이프라인 연결: PreToolUse → PostToolUse → Stop (D4)
- [ ] 세션 레지스트리: Map<sessionId, SessionContext> — graceful shutdown용 (NFR-O1)
- [ ] 세션 완료 시 레지스트리 제거 + SSE "done" 이벤트
- [ ] SDK query() 실패 시 AGENT_SPAWN_FAILED 에러 + SSE error 이벤트 + 세션 레지스트리 정리
- [ ] SDK rate limit(429) 시 적절한 에러 메시지 + 재시도 안내
- [ ] AsyncGenerator<SSEEvent> 반환 (sse-adapter 연동용)

**Technical Notes:**
- 결정 2(D6): 허브/텔레그램/ARGOS/AGORA/자동매매/스케치바이브 전부 이 함수 통과
- Phase 1: 순차 핸드오프만 (E7). 병렬은 Phase 2+ branchId 추가 후
- Soul에 cliToken 절대 주입 안 함 (SEC-6)

---

#### Story 2.3: soul-renderer.ts — Soul 템플릿 변수 치환
**Points:** 3 SP | **Priority:** P0

**As a** 에이전트 시스템
**I want** Soul 마크다운에 DB 데이터가 동적 주입되는 것을
**So that** 에이전트가 조직/도구/부하 정보를 실시간으로 인지한다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/soul-renderer.ts` (~40줄) 생성
- [ ] 6개 변수 치환: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}` (E4)
- [ ] getDB(companyId)로 DB 데이터 조회 (E3)
- [ ] 치환 실패 시 빈 문자열 대체 (에러 아님)
- [ ] Soul에 사용자 입력 직접 삽입 절대 금지 (prompt injection 방지)
- [ ] 단위 테스트: `soul-renderer.test.ts` — 6변수 치환 + 누락 변수 + 빈 DB 케이스
- [ ] engine 내부 전용 (E8: 외부 import 금지)

**Technical Notes:**
- v1: agents.yaml 고정 → v2: DB 동적 조회 (조직 CRUD와 연동)
- `{{변수명}}` 이중 중괄호만. soul-renderer.ts만 치환 수행

---

#### Story 2.4: model-selector.ts — 티어→모델 매핑
**Points:** 1 SP | **Priority:** P0

**As a** 에이전트 시스템
**I want** 에이전트 tier에 따라 적절한 Claude 모델이 자동 선택되는 것을
**So that** Manager는 Sonnet, Worker는 Haiku로 비용이 최적화된다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/model-selector.ts` (~20줄) 생성
- [ ] tier_configs 테이블에서 modelPreference 조회 (getDB)
- [ ] Phase 1~4: Claude 전용 (claude-sonnet-4-6, claude-haiku-4-5 등) (E6)
- [ ] tier 미설정 시 기본값: claude-haiku-4-5
- [ ] 단위 테스트: `model-selector.test.ts` — tier별 매핑 + 기본값 케이스

**Technical Notes:**
- llm-router.ts는 동결 (Phase 5+ 재설계). 라우팅 로직 추가 금지
- 현재 v1: agents.yaml model_name → v2: tier_configs DB

---

#### Story 2.5: sse-adapter.ts — SDK→기존 SSE 변환
**Points:** 2 SP | **Priority:** P0

**As a** 프론트엔드
**I want** SDK 메시지가 기존 SSE 이벤트 형식으로 변환되는 것을
**So that** Phase 1에서 프론트엔드 수정 0으로 엔진을 교체할 수 있다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/sse-adapter.ts` (~30줄) 생성
- [ ] SDK AsyncGenerator<SDKMessage> → SSEEvent 변환
- [ ] 매핑: SDK text → message, SDK tool_use → processing, SDK 종료 → done
- [ ] 기존 프론트엔드 SSE 파싱 호환 확인
- [ ] handoff 이벤트: delegation-tracker Hook에서 주입 (별도)
- [ ] engine 내부 전용 (E8)

**Technical Notes:**
- Phase 1 핵심 전략: 프론트 수정 최소화 → SSE 어댑터가 호환 보장
- WebSocket 이벤트는 Phase 1 기존 형식 유지 (D11)

---

#### Story 2.6: call-agent.ts — N단계 핸드오프 도구
**Points:** 5 SP | **Priority:** P0

**As a** 비서/매니저 에이전트
**I want** call_agent 도구로 하위 에이전트에게 작업을 위임할 수 있는 것을
**So that** 자동 분류→부서 배분→병렬 위임→종합이 동작한다

**Acceptance Criteria:**
- [ ] `packages/server/src/tool-handlers/builtins/call-agent.ts` (~40줄) 생성
- [ ] MCP 도구 스키마: `{ targetAgentId: string, message: string, priority?: string }`
- [ ] SessionContext spread 복사: `{ ...ctx, depth: ctx.depth + 1, visitedAgents: [...ctx.visitedAgents, targetId] }` (E1)
- [ ] 깊이 제한: `ctx.depth >= ctx.maxDepth` → HANDOFF_DEPTH_EXCEEDED 에러
- [ ] 순환 감지: `ctx.visitedAgents.includes(targetId)` → HANDOFF_CIRCULAR 에러 (FR9)
- [ ] 대상 에이전트 조회: getDB(ctx.companyId).agents() (E3)
- [ ] 대상 미존재 → HANDOFF_TARGET_NOT_FOUND 에러
- [ ] 재귀 runAgent() 호출 (agent-loop.ts)
- [ ] SSE "handoff" 이벤트 발행: `{ from, to, depth }`
- [ ] Phase 1: 순차 실행만 (for..of). Promise.all은 Phase 2+ (E7)

**Technical Notes:**
- v1 오케스트레이션: chief-of-staff → manager → specialist (하드코딩)
- v2: Soul 기반 자율 위임. call_agent = 범용 핸드오프 도구
- 병렬 핸드오프 시 visitedAgents가 분기별 독립 (글로벌 Set 아님)

---

## Epic 3: Hook System & Security Pipeline

**Phase:** 1 (Week 2)
**Priority:** P0 — 보안 필수
**Story Points:** 15 SP
**Dependencies:** Epic 2 (agent-loop.ts, types.ts)
**Architecture:** D4 (Hook 순서), E2, SEC-1~6

### Goal
5개 Hook을 구현하여 보안 파이프라인을 완성한다. 도구 권한 제어, 민감 정보 마스킹, 핸드오프 추적, 비용 기록. Hook 순서 위반 = 보안 사고 (마스킹 안 된 토큰이 WebSocket으로 노출).

### Stories

#### Story 3.1: tool-permission-guard — PreToolUse Hook
**Points:** 3 SP | **Priority:** P0

**As a** 보안 시스템
**I want** 에이전트가 허용된 도구만 호출할 수 있는 것을
**So that** CMO가 kr_stock을 쓰거나 CIO가 sns_manager를 쓸 수 없다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/hooks/tool-permission-guard.ts` (~20줄) 생성
- [ ] PreToolUse 시그니처: `(ctx, toolName, toolInput) => PreToolHookResult` (E2)
- [ ] `agent.allowedTools.includes(toolName)` 확인 (D7: agents.allowed_tools jsonb)
- [ ] 비허용 → `{ allow: false, reason: TOOL_PERMISSION_DENIED }`
- [ ] 허용 → `{ allow: true }`
- [ ] deny 시 이후 Hook 실행 안 함 (D4 순서)
- [ ] call_agent 도구는 항상 허용 (내장 도구)
- [ ] 단위 테스트: 허용/거부/call_agent 예외 3케이스

**Technical Notes:**
- v1: agents.yaml allowed_tools → v2: DB jsonb 배열 (D7)
- 도구 리네임 시: `UPDATE agents SET allowed_tools = replace(...)::jsonb`

---

#### Story 3.2: credential-scrubber — PostToolUse Hook (보안 최우선)
**Points:** 3 SP | **Priority:** P0

**As a** 보안 시스템
**I want** 도구 출력에서 민감 패턴(API 키, 토큰, 비밀번호)이 자동 마스킹되는 것을
**So that** AI가 민감 정보를 학습하거나 WebSocket으로 노출하지 않는다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/hooks/credential-scrubber.ts` (~20줄) 생성
- [ ] PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (E2)
- [ ] `@zapier/secret-scrubber` 기반 패턴 탐지
- [ ] 추가 패턴: CLI 토큰 (`sk-ant-*`), KIS API 키, 텔레그램 봇 토큰
- [ ] 마스킹 형식: `***REDACTED***`
- [ ] PostToolUse 순서: **1번째** — redactor, delegation-tracker보다 먼저 (D4)
- [ ] 단위 테스트: 5개+ 패턴 마스킹 확인

**Technical Notes:**
- **순서 위반 시 보안 사고**: delegation-tracker가 먼저 실행되면 마스킹 안 된 토큰이 WebSocket 노출
- `@zapier/secret-scrubber`는 순수 함수 → 모킹 불필요, 실제 실행 (E9)

---

#### Story 3.3: output-redactor — PostToolUse Hook
**Points:** 2 SP | **Priority:** P0

**As a** 보안 시스템
**I want** credential-scrubber가 놓친 추가 민감 패턴도 마스킹되는 것을
**So that** 이중 방어선으로 정보 유출을 방지한다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/hooks/output-redactor.ts` (~15줄) 생성
- [ ] PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (E2)
- [ ] 커스텀 패턴: 이메일, 전화번호, 주민번호, 계좌번호
- [ ] 회사별 추가 패턴 설정 가능 (DB에서 로드)
- [ ] PostToolUse 순서: **2번째** — scrubber 이후, delegation-tracker 이전 (D4)

**Technical Notes:**
- credential-scrubber와 분리: scrubber = 범용 라이브러리, redactor = 도메인 특화

---

#### Story 3.4: delegation-tracker — PostToolUse Hook
**Points:** 3 SP | **Priority:** P0

**As a** 사용자
**I want** 핸드오프 과정이 실시간으로 화면에 표시되는 것을
**So that** "비서실장 → CMO → 콘텐츠 전문가" 체인을 볼 수 있다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/hooks/delegation-tracker.ts` (~30줄) 생성
- [ ] PostToolUse 시그니처: call_agent 도구 실행 후 트리거
- [ ] WebSocket 이벤트 발행: `{ type: 'handoff', from, to, depth, timestamp }`
- [ ] **마스킹된 안전한 데이터만** 발행 (scrubber + redactor 이후) (D4)
- [ ] EventEmitter 기반 (단일 서버 충분. Phase 5+ Redis 교체 대비 인터페이스 추상화)
- [ ] PostToolUse 순서: **3번째** — scrubber, redactor 이후 (D4)
- [ ] v1 대응: 기존 delegation-tracker.ts 교체 (코드 처분 매트릭스)
- [ ] 기존 프론트 WebSocket 채널 호환 (D11: Phase 1 기존 형식 유지)

**Technical Notes:**
- v1: delegation-tracker.ts → v2: engine/hooks/ 로 이동 + Hook 파이프라인 통합
- 프론트: 허브 트래커 → 위임 체인 표시 ("비서실장 분석 중..." → "CMO에게 위임")

---

#### Story 3.5: cost-tracker — Stop Hook
**Points:** 2 SP | **Priority:** P1

**As a** 관리자/CEO
**I want** 모든 에이전트 호출의 토큰 사용량과 비용이 자동 기록되는 것을
**So that** 에이전트별/모델별/부서별 비용을 추적할 수 있다

**Acceptance Criteria:**
- [ ] `packages/server/src/engine/hooks/cost-tracker.ts` (~20줄) 생성
- [ ] Stop 시그니처: `(ctx, usage: { inputTokens, outputTokens }) => void` (E2)
- [ ] 비용 계산: 모델별 가격 × 토큰 수 (models config 참조)
- [ ] DB 기록: agent_id, model, input_tokens, output_tokens, cost_usd, session_id
- [ ] 핸드오프 체인 내 각 에이전트별 개별 기록
- [ ] SSE "done" 이벤트에 비용 포함: `{ costUsd, tokensUsed }` (E5)

**Technical Notes:**
- v1: 비용 관리 대시보드 존재 (v1 spec #21) → v2에서도 동일 데이터 제공
- Stop Hook이므로 세션 종료 시 1회만 호출

---

#### Story 3.6: Hook 파이프라인 통합 테스트
**Points:** 2 SP | **Priority:** P0

**As a** 보안 검증자
**I want** Hook 실행 순서가 보장되고 에러 시 세션이 중단되는 것을
**So that** 보안 파이프라인의 무결성이 검증된다

**Acceptance Criteria:**
- [ ] `packages/server/src/__tests__/integration/hook-pipeline.test.ts` 생성
- [ ] 순서 검증: PreToolUse(permission) → PostToolUse(scrubber→redactor→delegation) → Stop(cost)
- [ ] permission deny 시 PostToolUse 실행 안 됨 확인
- [ ] Hook 에러 → HOOK_PIPELINE_ERROR 코드 + SSE error 이벤트 + 세션 중단 (P4)
- [ ] scrubber 전 delegation-tracker 실행 → FAIL (순서 위반 테스트)
- [ ] SDK 모킹 사용 (E9): Agent.query() 모킹, Hook은 실제 실행

---

## Epic 4: Engine Migration & Regression

**Phase:** 1 (Week 2)
**Priority:** P0 — 무중단 전환
**Story Points:** 14 SP
**Dependencies:** Epic 2, Epic 3
**Architecture:** D2 (CLI 토큰 만료), D11 (WebSocket 유지), S11 (호출자 6곳), S12 (불가침)

### Goal
기존 agent-runner.ts를 engine/agent-loop.ts로 교체하고, 6개 호출자(허브, 텔레그램, ARGOS, AGORA, 자동매매, 스케치바이브)의 import를 전환한다. 기존 서비스 삭제 후 회귀 테스트.

### Stories

#### Story 4.1: hub.ts — SSE 스트리밍 진입점
**Points:** 3 SP | **Priority:** P0

**As a** CEO/사용자
**I want** 허브에서 에이전트에게 메시지를 보내면 SSE로 실시간 응답을 받는 것을
**So that** 사령관실 핵심 기능이 동작한다

**Acceptance Criteria:**
- [ ] `packages/server/src/routes/workspace/hub.ts` — SSE 엔드포인트 신규 작성 (S3, S7)
- [ ] HTTP POST → SessionContext 생성 (JWT → userId, companyId)
- [ ] runAgent() 호출 → AsyncGenerator<SSEEvent> → SSE 스트림 응답
- [ ] 기존 chat.ts는 세션 REST CRUD 유지 (S3: 역할 분리)
- [ ] Pre-spawn "accepted" 이벤트 50ms 이내 (체감 지연 0)
- [ ] 에러 시 SSE error 이벤트 → 프론트 에러 표시
- [ ] `@mention` 파싱: `@투자분석팀장` → 해당 에이전트 직접 지정
- [ ] 일반 텍스트: 비서실장(is_secretary=true) 자동 라우팅

**Technical Notes:**
- v1 핵심 흐름: CEO 명령 → 비서실장 → 팀장 → 전문가 → 종합 → 보고
- 슬래시 명령어(/전체, /순차, /토론 등) 파싱은 Phase 2 Epic 5에서

---

#### Story 4.2: 호출자 Import 전환 (텔레그램, ARGOS, AGORA, 자동매매)
**Points:** 3 SP | **Priority:** P0

**As a** 시스템
**I want** 4개 호출 경로가 agent-runner 대신 agent-loop를 사용하는 것을
**So that** 모든 에이전트 실행이 새 엔진을 통과한다

**Acceptance Criteria:**
- [ ] `services/telegram/handler.ts` — import 교체 + SessionContext 생성 코드 추가
- [ ] `services/argos/scheduler.ts` — import 교체 + SessionContext 생성 코드 추가
- [ ] `routes/workspace/agora.ts` — import 교체 + SessionContext 생성 코드 추가
- [ ] `services/trading/executor.ts` — import 교체 + SessionContext 생성 코드 추가
- [ ] 불가침 원칙: 비즈니스 로직/기능 변경 없음 (S12)
- [ ] SessionContext 소스: 각 서비스의 설정/JWT에서 companyId 추출
- [ ] 기존 에러 핸들링 패턴 통합 (새 에러 코드 사용)

**Technical Notes:**
- 호출자 6곳 중 4곳 (S11). hub.ts는 4.1, sketchvibe-mcp는 Phase 4
- 불가침 = 비즈니스 로직 변경 없음. import 교체 + SessionContext 추가만

---

#### Story 4.3: 기존 서비스 교체/삭제
**Points:** 2 SP | **Priority:** P0

**As a** 개발자
**I want** 교체 완료된 기존 서비스 파일이 삭제되는 것을
**So that** 코드베이스에 중복 경로가 남지 않는다

**Acceptance Criteria:**
- [ ] `services/agent-runner.ts` 삭제 (코드 처분 매트릭스: Phase 1 교체)
- [ ] `services/delegation-tracker.ts` 삭제 (코드 처분 매트릭스: Phase 1 교체)
- [ ] 삭제 전: `grep -r "agent-runner\|delegation-tracker" packages/server/src/` → 0건 확인
- [ ] `tsc --noEmit` 성공 (참조 없음 확인)
- [ ] `bun test` 전체 통과

**Technical Notes:**
- chief-of-staff.ts, manager-delegate.ts, cio-orchestrator.ts → Phase 2 삭제 (Soul 검증 후)
- llm-router.ts → 동결 (Phase 5+)

---

#### Story 4.4: Graceful Shutdown 구현
**Points:** 2 SP | **Priority:** P1

**As a** 운영자
**I want** 서버 재시작 시 진행 중인 에이전트 세션이 완료된 후 종료되는 것을
**So that** 사용자가 응답 중간에 연결이 끊기지 않는다

**Acceptance Criteria:**
- [ ] `packages/server/src/index.ts` — SIGTERM 핸들러 추가
- [ ] 세션 레지스트리(agent-loop.ts)의 활성 세션 확인
- [ ] 활성 세션 > 0: 새 요청 거부 (503) + 기존 세션 완료 대기
- [ ] 타임아웃: 120초 후 강제 종료 (NFR-P8)
- [ ] 로그: "Graceful shutdown initiated, N active sessions remaining"

**Technical Notes:**
- NFR-O1 요구사항
- Docker STOPSIGNAL SIGTERM 확인

---

#### Story 4.5: 3단계 핸드오프 통합 테스트
**Points:** 2 SP | **Priority:** P0

**As a** QA
**I want** 비서→매니저→전문가 3단계 핸드오프가 정상 동작하는 것을
**So that** v1의 핵심 오케스트레이션이 v2에서도 동작한다

**Acceptance Criteria:**
- [ ] `packages/server/src/__tests__/integration/handoff-chain.test.ts` 생성
- [ ] SDK 모킹 (E9): 3개 에이전트(비서/매니저/전문가) 모킹
- [ ] 깊이 추적: depth 0→1→2 확인
- [ ] visitedAgents 누적: [비서] → [비서, 매니저] → [비서, 매니저, 전문가]
- [ ] SSE 이벤트 순서: accepted → processing → handoff × 2 → message → done
- [ ] 순환 감지: 비서→매니저→비서 시도 → HANDOFF_CIRCULAR 에러 확인
- [ ] 깊이 초과: maxDepth=2에서 3단계 시도 → HANDOFF_DEPTH_EXCEEDED 확인
- [ ] 비용 합산: 3개 에이전트 각각 cost-tracker 기록 확인

**Technical Notes:**
- v1 핵심 흐름 재현: CEO → 비서실장 → 팀장 → 전문가

---

#### Story 4.6: Epic 1~20 회귀 테스트
**Points:** 2 SP | **Priority:** P0

**As a** QA
**I want** 엔진 교체 후 기존 Epic 1~20의 기능이 모두 정상인 것을
**So that** "v1에서 되던 건 v2에서도 반드시 된다"

**Acceptance Criteria:**
- [ ] `tsc --noEmit -p packages/server/tsconfig.json` 통과
- [ ] `bun test` 전체 통과 (기존 테스트 0 실패)
- [ ] SSE 이벤트 형식 호환 확인 (기존 프론트 파싱과 일치)
- [ ] WebSocket 이벤트 기존 형식 유지 (D11)
- [ ] AGORA 토론 API 동작 확인
- [ ] 기존 도구 125개 타입 체크 + 샘플 5개 실행
- [ ] 배포 후 수동 확인: 텔레그램 봇, ARGOS 크론잡, 자동매매

**Technical Notes:**
- Phase 1 회귀 테스트 매트릭스: CI 자동화 8개 + 수동 3개 + 반자동 1개 (S15, S18)

---

## Epic 5: Secretary System & Soul Orchestration

**Phase:** 2 (Week 3)
**Priority:** P0 — 핵심 오케스트레이션
**Story Points:** 16 SP
**Dependencies:** Epic 2 (agent-loop, soul-renderer), Epic 4 (migration complete)
**Architecture:** FR11~20 (Secretary & Orchestration), E4 (Soul 변수)

### Goal
비서실장 Soul 기반 오케스트레이션을 구현하고, 슬래시 명령어/프리셋을 처리한다. 기존 하드코딩 오케스트레이터(chief-of-staff.ts)를 Soul + call_agent으로 대체.

### Stories

#### Story 5.1: 비서 에이전트 DB 필드 및 설정
**Points:** 2 SP | **Priority:** P0

**As a** 관리자
**I want** 에이전트를 비서실장으로 지정할 수 있는 것을
**So that** 사용자 메시지가 비서를 통해 자동 라우팅된다

**Acceptance Criteria:**
- [ ] agents 테이블에 `is_secretary boolean DEFAULT false` 컬럼 추가
- [ ] agents 테이블에 `owner_user_id uuid REFERENCES users(id)` 컬럼 추가
- [ ] 회사당 is_secretary=true 에이전트 최대 1명 제약 (unique partial index)
- [ ] 비서 삭제 방지 → ORG_SECRETARY_DELETE_DENIED 에러
- [ ] 마이그레이션 파일 생성 + 기존 데이터 무중단

**Technical Notes:**
- v1: chief-of-staff 하드코딩 → v2: DB 플래그로 동적 지정
- owner_user_id: 인간 직원 1명 = CLI 1개 매핑의 기반

---

#### Story 5.2: 비서 Soul 템플릿 작성
**Points:** 3 SP | **Priority:** P0

**As a** 비서 에이전트
**I want** 사용자 명령을 분석하여 적절한 부서/에이전트에 위임하는 Soul을
**So that** 하드코딩 없이 자연어로 라우팅이 동작한다

**Acceptance Criteria:**
- [ ] 비서 Soul 마크다운 (~2,000자) 작성
- [ ] 역할 정의: 명령 분류, 부서 라우팅, 결과 종합, CEO 눈높이 보고
- [ ] `{{agent_list}}` 변수로 가용 에이전트 자동 주입
- [ ] `{{department_name}}` 변수로 부서 정보 자동 주입
- [ ] call_agent 도구 사용 지시: "분석이 필요하면 해당 전문가에게 call_agent으로 위임"
- [ ] 종합 보고 지시: "여러 에이전트 결과를 CEO가 이해하기 쉽게 종합"
- [ ] QA 검수 지시 (v1 spec #19): 결론/근거/리스크/형식/논리 5항목
- [ ] v1 비서실장 기능 재현: 자동 분류 → 부서 배분 → 병렬 위임 → 종합

**Technical Notes:**
- v1: Orchestrator.process_command() 하드코딩 → v2: Soul 기반 자율 판단
- call_agent = 범용 도구. Soul이 "누구에게 위임할지" 판단

---

#### Story 5.3: 슬래시 명령어 파서
**Points:** 3 SP | **Priority:** P0

**As a** CEO
**I want** /전체, /순차, /토론, /심층토론 등 슬래시 명령어가 동작하는 것을
**So that** v1에서 쓰던 명령 방식이 그대로 된다

**Acceptance Criteria:**
- [ ] 슬래시 명령어 파서 구현 (hub.ts 또는 별도 모듈)
- [ ] `/전체` — 모든 매니저급 에이전트에게 동시 지시 (call_agent × N)
- [ ] `/순차` — 에이전트 릴레이 모드 (순차 핸드오프)
- [ ] `/도구점검` — 전체 도구 상태 확인
- [ ] `/배치실행` — 대기 중인 AI 요청 일괄 전송
- [ ] `/배치상태` — 배치 작업 진행 확인
- [ ] `/명령어` — 전체 명령어 목록
- [ ] `/토론` — AGORA 2라운드 토론 시작
- [ ] `/심층토론` — AGORA 3라운드 토론 시작
- [ ] 프리셋: 사용자 정의 단축어 (DB 저장)

**Technical Notes:**
- v1: 8종 슬래시 명령어 (v1 spec §1.1)
- /토론, /심층토론은 AGORA 엔진 연동

---

#### Story 5.4: 매니저 Soul 표준 템플릿
**Points:** 2 SP | **Priority:** P0

**As a** 매니저 에이전트
**I want** 부하 전문가들에게 작업을 배분하고 결과를 종합하는 Soul을
**So that** v1의 팀장 역할이 동작한다

**Acceptance Criteria:**
- [ ] 매니저 Soul 표준 템플릿 작성 (~1,500자)
- [ ] `{{subordinate_list}}` 변수로 부하 에이전트 자동 주입
- [ ] `{{tool_list}}` 변수로 사용 가능 도구 주입
- [ ] 작업 분해 → 배분 → 종합 지시
- [ ] CEO 아이디어 #007: "처장 = 5번째 분석가" → 매니저도 독자 분석 후 종합
- [ ] 부서별 표준 보고서 형식 (CEO 아이디어 #011)

**Technical Notes:**
- v1: manager-delegate.ts 하드코딩 → v2: Soul + call_agent
- 부서별 커스텀 Soul은 관리자가 웹 UI에서 편집 (Phase 2 후반)

---

#### Story 5.5: 기존 오케스트레이터 삭제
**Points:** 2 SP | **Priority:** P0

**As a** 개발자
**I want** Soul 기반 오케스트레이션이 검증된 후 하드코딩 파일을 삭제하는 것을
**So that** 중복 코드가 없다

**Acceptance Criteria:**
- [ ] `services/chief-of-staff.ts` 삭제 (코드 처분 매트릭스)
- [ ] `services/manager-delegate.ts` 삭제
- [ ] `services/cio-orchestrator.ts` 삭제
- [ ] 삭제 전: grep 0건 확인
- [ ] `tsc --noEmit` + `bun test` 통과

**Technical Notes:**
- Phase 2에서 삭제 (Soul 검증 후). Phase 1에서 미리 삭제하지 않음

---

#### Story 5.6: @멘션 + 프리셋 시스템
**Points:** 2 SP | **Priority:** P1

**As a** CEO
**I want** @팀장이름으로 직접 지시하고, 자주 쓰는 명령을 프리셋으로 저장하는 것을
**So that** 효율적으로 AI를 지휘할 수 있다

**Acceptance Criteria:**
- [ ] @멘션 파싱: `@투자분석팀장 삼성전자 분석` → 비서 우회, 직접 해당 에이전트
- [ ] 에이전트 이름/별칭으로 매칭 (fuzzy match 아님, 정확 일치)
- [ ] 프리셋 CRUD: 단축어→전체 명령 매핑 (DB 저장)
- [ ] 예: "시황" → "현재 주식시장 시황을 분석해줘"
- [ ] 프리셋 실행: 단축어 입력 시 자동 확장 + 실행

**Technical Notes:**
- v1 spec §1.1: @멘션 + 프리셋 동작 확인

---

#### Story 5.7: 자율 딥워크 + 품질 게이트
**Points:** 2 SP | **Priority:** P1

**As a** 에이전트
**I want** 1번 답하는 게 아니라 다단계 자율 작업 후 보고하는 것을
**So that** v1의 심층 분석 품질이 유지된다

**Acceptance Criteria:**
- [ ] Soul에 자율 딥워크 패턴 주입: 계획→수집→분석→초안→최종
- [ ] 품질 게이트: 비서실장이 편집장 역할 — 5항목 QA (v1 spec #19)
- [ ] 결론/근거/리스크/형식/논리 점검 → 미달 시 재작업 지시
- [ ] 재작업 = call_agent로 동일 에이전트 재호출 (message에 피드백 포함)

**Technical Notes:**
- v1 spec §2.4: 자율 딥워크 (계획→수집→분석→초안→최종)
- v1 spec #19: quality_rules.yaml 기반 QA

---

## Epic 6: Hub UX — 2 Layout Variants

**Phase:** 2 (Week 3~4)
**Priority:** P0 — 핵심 사용자 인터페이스
**Story Points:** 14 SP
**Dependencies:** Epic 5 (비서 시스템)
**Architecture:** UX Design (비서 유무 분기), D11→WebSocket 전환

### Goal
비서 유무에 따른 허브 레이아웃 2종을 구현한다. 비서 있음 = 채팅만 (자동 라우팅), 비서 없음 = 에이전트 선택 + 채팅.

### Stories

#### Story 6.1: 비서 있음 레이아웃 (풀 위드 채팅)
**Points:** 3 SP | **Priority:** P0

**As a** CEO
**I want** 비서가 있으면 채팅 입력만으로 모든 명령을 내릴 수 있는 것을
**So that** 에이전트를 일일이 선택하지 않아도 된다

**Acceptance Criteria:**
- [ ] `hasSecretary: boolean` 상태에 따라 레이아웃 분기
- [ ] 비서 있음: 채팅 영역 풀 위드 (에이전트 목록 숨김)
- [ ] assistant-ui 또는 커스텀 채팅 UI (React 19 호환성 확인 후 결정)
- [ ] SSE 스트리밍: accepted→processing→handoff→message→error→done UI 상태 반영
- [ ] 핸드오프 트래커: 실시간 "비서실장 → CMO → 콘텐츠전문가" 표시
- [ ] 마크다운 렌더링 (v1 호환)
- [ ] 파일 첨부 (v1 호환)

**Technical Notes:**
- UX Design: Direction A "Command Center" 선택
- assistant-ui → Phase 2 시작 전 React 19 호환성 확인 (폴백: 직접 구현 ~300줄)

---

#### Story 6.2: 비서 없음 레이아웃 (에이전트 선택 + 채팅)
**Points:** 3 SP | **Priority:** P0

**As a** 사용자 (비서 미설정)
**I want** 에이전트 목록에서 선택하여 직접 대화하는 것을
**So that** 비서 없이도 AI를 사용할 수 있다

**Acceptance Criteria:**
- [ ] 좌측 패널: 에이전트 목록 (부서별 그룹핑)
- [ ] 50+ 에이전트 시: 부서별 접힘/펼침 + lastUsedAt 정렬
- [ ] 에이전트 선택 → 우측 채팅 영역에서 대화
- [ ] 에이전트 아바타, 이름, 소속 부서 표시
- [ ] 검색/필터 기능

**Technical Notes:**
- UX Design: 비서 없음 variant

---

#### Story 6.3: SSE 상태 머신 + 에러 투명성
**Points:** 3 SP | **Priority:** P0

**As a** 사용자
**I want** 에이전트 작업 상태가 실시간으로 표시되고 에러가 명확히 보이는 것을
**So that** 블랙박스 에러 0건을 달성한다

**Acceptance Criteria:**
- [ ] SSE 6개 이벤트 → UI 상태 매핑 (E5):
  - accepted → "명령 접수됨" + 로딩 스피너
  - processing → "비서실장 분석 중..." + 에이전트 이름
  - handoff → 트래커 업데이트 (from → to)
  - message → 스트리밍 텍스트 표시
  - error → 에러 배너 (코드 + 한국어 메시지)
  - done → 비용 표시 + 스피너 종료
- [ ] 에러 메시지 한국어 변환: `error-messages.ts` (S10)
- [ ] 미등록 코드 fallback: "오류가 발생했습니다 (코드: {code})" (P11)
- [ ] 핸드오프 실패 시 사용자에게 명시적 표시

**Technical Notes:**
- "블랙박스 에러 0건" = 모든 핸드오프 실패를 사용자에게 명시적 표시

---

#### Story 6.4: 대화 기록 + autoLearn
**Points:** 2 SP | **Priority:** P1

**As a** CEO
**I want** 이전 대화 기록이 보존되고 에이전트가 자동 학습하는 것을
**So that** 같은 질문을 반복하지 않아도 된다

**Acceptance Criteria:**
- [ ] 대화 기록 무제한 보관 (NFR-DI: chat_messages 테이블)
- [ ] 이전 대화 로드 + 스크롤 페이지네이션
- [ ] autoLearn: 작업 완료 후 핵심 학습 포인트 자동 추출 (v1 spec #20)
- [ ] 학습 포인트 → 다음 유사 작업 시 Soul에 자동 주입

**Technical Notes:**
- v1 spec #20: 에이전트 메모리 (자동 학습 + 지식 주입)
- Phase 2 후반 구현 → Phase 4 pgvector와 연동 강화

---

#### Story 6.5: WebSocket 핸드오프 채널 전환
**Points:** 3 SP | **Priority:** P1

**As a** 프론트엔드
**I want** WebSocket 이벤트가 Hook 기반 delegation-tracker에서 발행되는 것을
**So that** 기존 7채널 멀티플렉싱과 통합된다

**Acceptance Criteria:**
- [ ] Phase 1 기존 형식 → Phase 2 Hook 기반 전환 (D11)
- [ ] delegation-tracker Hook → EventBus → WebSocket 채널
- [ ] 기존 WebSocket 구독자 호환
- [ ] TanStack Query 캐시 자동 무효화 (핸드오프 상태 변경 시)

---

## Epic 7: Organization Management

**Phase:** 2 (Week 4~5)
**Priority:** P0 — v2 핵심 차별점
**Story Points:** 16 SP
**Dependencies:** Epic 5 (비서/Soul 시스템)
**Architecture:** FR30~37 (Organization), UX (NEXUS 읽기전용)

### Goal
관리자가 부서/에이전트를 자유롭게 생성/수정/삭제할 수 있는 동적 조직 관리. v1의 29명 고정 구조를 탈피하여 v2의 핵심 차별점을 구현.

### Stories

#### Story 7.1: 부서 CRUD API + UI
**Points:** 3 SP | **Priority:** P0

**As a** 관리자
**I want** 부서를 자유롭게 생성/수정/삭제하는 것을
**So that** 회사 구조에 맞는 조직을 구성할 수 있다

**Acceptance Criteria:**
- [ ] REST API: POST/PUT/DELETE `/api/admin/departments`
- [ ] 부서명, 설명, 상위 부서 ID (계층 구조)
- [ ] 삭제 시 소속 에이전트 처리: 미할당으로 변경 (cascade 아님)
- [ ] getDB(companyId) 격리 (E3)
- [ ] Admin UI: 부서 목록 + 생성/편집/삭제 모달

**Technical Notes:**
- v2 핵심: 관리자가 언제든 부서 구성 변경 가능

---

#### Story 7.2: 에이전트 CRUD API + UI (Soul 편집 포함)
**Points:** 5 SP | **Priority:** P0

**As a** 관리자
**I want** AI 에이전트를 자유롭게 생성/편집/삭제하고 Soul을 편집하는 것을
**So that** v1의 29명 고정이 아닌 동적 조직을 운영할 수 있다

**Acceptance Criteria:**
- [ ] REST API: POST/PUT/DELETE `/api/admin/agents`
- [ ] 필드: 이름, 소속 부서, tier, allowed_tools(jsonb), is_secretary, owner_user_id
- [ ] Soul 편집: 마크다운 에디터 (웹 UI에서 CEO가 직접 편집, v1 spec §2.3)
- [ ] Soul 변수 자동 프리뷰: `{{agent_list}}` 등이 실제 값으로 치환된 결과 표시
- [ ] 비서 에이전트 삭제 방지: ORG_SECRETARY_DELETE_DENIED
- [ ] 에이전트 생성 시 기본 Soul 템플릿 자동 적용
- [ ] Admin UI: 에이전트 목록 + 상세 편집 페이지

**Technical Notes:**
- v1 spec §2.3: 웹 UI에서 Soul 직접 편집 (서버 재시작 불필요)
- 에이전트 생성 = DB INSERT + Soul 기본 템플릿 생성

---

#### Story 7.3: 조직 템플릿 + 온보딩
**Points:** 3 SP | **Priority:** P1

**As a** 신규 회사 관리자
**I want** 가입 시 기본 조직 구조가 자동 생성되는 것을
**So that** 빈 화면에서 시작하지 않아도 된다

**Acceptance Criteria:**
- [ ] 기본 조직 템플릿: CEO + 비서 + 3개 부서 + 부서당 매니저 1명
- [ ] 가입 완료 시 자동 생성 (FR: Onboarding)
- [ ] 템플릿 커스터마이징: 관리자가 선택 가능 (기본/기술/마케팅/투자)
- [ ] CLI 토큰 등록 가이드 (온보딩 위저드)

**Technical Notes:**
- v1: 29명 사전 구성 → v2: 템플릿 기반 자동 생성 + 이후 자유 편집

---

#### Story 7.4: Cascade 규칙 + 삭제 방지
**Points:** 2 SP | **Priority:** P0

**As a** 관리자
**I want** 비서 삭제가 방지되고, 부서 삭제 시 에이전트가 안전하게 처리되는 것을
**So that** 실수로 핵심 구조를 파괴하지 않는다

**Acceptance Criteria:**
- [ ] 비서(is_secretary=true) 삭제 시도 → ORG_SECRETARY_DELETE_DENIED 에러
- [ ] 부서 삭제 시 소속 에이전트 → department_id = null (미할당)
- [ ] 에이전트 삭제 시 진행 중 세션 → 세션 완료 후 삭제 (soft delete)
- [ ] 삭제 확인 모달: "이 에이전트는 현재 3개 세션이 진행 중입니다"

**Technical Notes:**
- 하드 삭제 아님. is_active = false로 soft delete

---

#### Story 7.5: NEXUS 읽기 전용 조직도
**Points:** 3 SP | **Priority:** P1

**As a** 관리자/CEO
**I want** 현재 조직 구조를 시각적으로 확인하는 것을
**So that** 부서/에이전트 관계를 한눈에 파악할 수 있다

**Acceptance Criteria:**
- [ ] React Flow 기반 읽기 전용 조직도
- [ ] ELK.js 계층 레이아웃 (상위→하위 자동 배치)
- [ ] 노드: 부서(파란), 에이전트(초록), 비서(금색) 구분
- [ ] 에이전트 노드: 이름, tier, 상태(active/inactive) 표시
- [ ] 드래그 이동 + 줌 인/아웃
- [ ] 에이전트 50+ 시: React.lazy() 동적 로드 (번들 최적화)

**Technical Notes:**
- Phase 3 NEXUS 편집기의 전단계. 읽기 전용만 먼저 구현
- React Flow + ELK.js (아키텍처 선택). Cytoscape는 스케치바이브 전용

---

## Epic 8: N-Tier Hierarchy System

**Phase:** 3 (Week 6)
**Priority:** P1
**Story Points:** 12 SP
**Dependencies:** Epic 7 (에이전트 CRUD)
**Architecture:** FR24~29 (Tier & Cost), E6 (model-selector), D1 (tier_configs 테이블)

### Goal
고정 3계급(Manager/Specialist/Worker)에서 회사별 N단계 계층으로 전환. tier_configs 테이블 기반 동적 관리.

### Stories

#### Story 8.1: tier_configs 테이블 + enum→integer 마이그레이션
**Points:** 3 SP | **Priority:** P0

**As a** 시스템
**I want** 에이전트 tier가 enum이 아닌 integer(1~N)로 관리되는 것을
**So that** 회사별로 자유롭게 계층을 추가할 수 있다

**Acceptance Criteria:**
- [ ] tier_configs 테이블: id, company_id, tier_level(int), name, model_preference, max_tools, description
- [ ] 기존 agents.tier enum → agents.tier_level integer 마이그레이션
- [ ] 마이그레이션 매핑: Manager=1, Specialist=2, Worker=3
- [ ] 무중단 마이그레이션 (NFR-DI)
- [ ] getDB(companyId).tierConfigs() 스코프 쿼리 추가

**Technical Notes:**
- v1: 3계급 고정 → v2: N계급 동적 (회사별 configurable)

---

#### Story 8.2: Tier CRUD API + UI
**Points:** 3 SP | **Priority:** P1

**As a** 관리자
**I want** 회사별 계층 구조를 자유롭게 관리하는 것을
**So that** "인턴→사원→대리→팀장→임원" 같은 커스텀 계층을 만들 수 있다

**Acceptance Criteria:**
- [ ] REST API: POST/PUT/DELETE `/api/admin/tier-configs`
- [ ] tier_level 순서 자동 관리 (드래그 정렬)
- [ ] model_preference 설정: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5
- [ ] max_tools: tier별 사용 가능 도구 수 제한
- [ ] Admin UI: Tier 관리 페이지

---

#### Story 8.3: 모델 자동 배정 + 비용 최적화
**Points:** 3 SP | **Priority:** P1

**As a** 관리자
**I want** tier별로 AI 모델이 자동 배정되어 비용이 최적화되는 것을
**So that** 상위 tier = 고성능 모델, 하위 tier = 저비용 모델

**Acceptance Criteria:**
- [ ] model-selector.ts에서 tier_configs 조회 → 모델 매핑 (E6)
- [ ] 에이전트 생성 시 tier에 따라 모델 자동 배정
- [ ] 관리자가 개별 에이전트 모델 오버라이드 가능
- [ ] 비용 대시보드: tier별 비용 집계 표시

---

#### Story 8.4: maxDepth 회사별 설정
**Points:** 3 SP | **Priority:** P1

**As a** 관리자
**I want** 핸드오프 최대 깊이를 회사별로 설정하는 것을
**So that** 복잡한 조직은 깊이를 늘리고, 단순 조직은 줄일 수 있다

**Acceptance Criteria:**
- [ ] company_settings 테이블 또는 tier_configs에 max_handoff_depth 추가
- [ ] SessionContext.maxDepth = 회사 설정값 (기본 5)
- [ ] Admin UI: 핸드오프 깊이 설정 슬라이더 (1~10)
- [ ] 깊이 변경 시 진행 중 세션에는 영향 없음 (새 세션부터 적용)

---

## Epic 9: NEXUS Visual Organization Editor

**Phase:** 3 (Week 6~7)
**Priority:** P1
**Story Points:** 16 SP
**Dependencies:** Epic 7 (조직 관리 API), Epic 8 (tier 시스템)
**Architecture:** React Flow + ELK.js, FR30~37

### Goal
React Flow + ELK.js 기반 NEXUS 시각적 조직 편집기. 드래그&드롭으로 에이전트를 부서 간 이동하고, 계층 구조를 시각적으로 편집.

### Stories

#### Story 9.1: NEXUS React Flow 캔버스 기반
**Points:** 3 SP | **Priority:** P0

**As a** 관리자
**I want** 조직 구조를 시각적 캔버스에서 보고 편집하는 것을
**So that** 직관적으로 조직을 관리할 수 있다

**Acceptance Criteria:**
- [ ] React Flow 캔버스: 줌, 팬, 미니맵
- [ ] ELK.js 계층 레이아웃 자동 배치 (위→아래)
- [ ] 60fps 렌더링 (NFR-P: Canvas 렌더링)
- [ ] aria 접근성 내장 (React Flow 기본)
- [ ] React.lazy() 동적 로드 (번들 최적화)
- [ ] admin 패키지에 위치

**Technical Notes:**
- SketchVibe(Cytoscape) ≠ NEXUS(React Flow). 완전 분리 (아키텍처)

---

#### Story 9.2: NEXUS 노드 시각화
**Points:** 3 SP | **Priority:** P0

**As a** 관리자
**I want** 부서, 에이전트, 인간 직원이 구분되는 노드로 표시되는 것을
**So that** 한눈에 조직 구성을 파악할 수 있다

**Acceptance Criteria:**
- [ ] 노드 타입: 부서(직사각형, 파란), 에이전트(원형, 초록), 인간(사각형, 보라), 비서(팔각형, 금색)
- [ ] 에이전트 노드: 이름, tier 레벨, 상태 아이콘 (active/inactive/busy)
- [ ] 부서 노드: 이름, 소속 에이전트 수, 매니저 표시
- [ ] 엣지: 부서→에이전트 소속 관계, 매니저→부하 위임 관계
- [ ] 인간 노드: 이름, 역할, CLI 토큰 상태 (등록/미등록)

---

#### Story 9.3: 드래그&드롭 편집
**Points:** 5 SP | **Priority:** P1

**As a** 관리자
**I want** 에이전트를 드래그하여 다른 부서로 이동하는 것을
**So that** UI에서 직관적으로 조직을 재편할 수 있다

**Acceptance Criteria:**
- [ ] 에이전트 노드 드래그 → 부서 노드 위 드롭 → API 호출 (department_id 변경)
- [ ] 드롭 가능 영역 하이라이트 (부서 노드 호버)
- [ ] 실시간 레이아웃 재배치 (ELK.js)
- [ ] Undo 기능 (Ctrl+Z)
- [ ] 비서 이동 불가 (is_secretary → CEO 직속 고정)
- [ ] 멀티 선택 (Ctrl+클릭) → 일괄 이동

---

#### Story 9.4: 속성 패널
**Points:** 3 SP | **Priority:** P1

**As a** 관리자
**I want** 노드를 선택하면 우측 패널에서 상세 정보를 편집하는 것을
**So that** 캔버스에서 벗어나지 않고 에이전트 설정을 변경할 수 있다

**Acceptance Criteria:**
- [ ] 노드 클릭 → 우측 속성 패널 표시
- [ ] 에이전트 속성: 이름, tier, 모델, allowed_tools, Soul 편집 링크
- [ ] 부서 속성: 이름, 설명, 매니저 지정 드롭다운
- [ ] 인라인 저장 (자동 저장 + 낙관적 업데이트)

---

#### Story 9.5: NEXUS 내보내기 + 인쇄
**Points:** 2 SP | **Priority:** P2

**As a** 관리자
**I want** 조직도를 이미지/PDF로 내보내는 것을
**So that** 보고서나 발표에 사용할 수 있다

**Acceptance Criteria:**
- [ ] PNG 내보내기 (React Flow fitView → toImage)
- [ ] SVG 내보내기
- [ ] 인쇄 최적화 (배경 흰색, 고해상도)

---

## Epic 10: Semantic Search & Knowledge Enhancement

**Phase:** 4 (Week 8)
**Priority:** P1
**Story Points:** 14 SP
**Dependencies:** Epic 2 (agent-loop), Epic 7 (조직 관리)
**Architecture:** pgvector, Gemini Embedding, FR47~53

### Goal
기존 Jaccard 키워드 매칭을 pgvector 의미 검색으로 교체. 부서별 지식 자동 주입 강화.

### Stories

#### Story 10.1: pgvector 확장 설치 + 스키마
**Points:** 2 SP | **Priority:** P0

**As a** 시스템
**I want** PostgreSQL에 pgvector 확장이 설치되고 벡터 컬럼이 추가되는 것을
**So that** 의미 기반 유사도 검색이 가능하다

**Acceptance Criteria:**
- [ ] `CREATE EXTENSION IF NOT EXISTS vector` 실행
- [ ] knowledge_docs 테이블에 `embedding vector(768)` 컬럼 추가 (Gemini dim)
- [ ] NULL 허용 (기존 문서는 점진적 임베딩)
- [ ] 마이그레이션 파일 생성
- [ ] pgvector-node 설치 + Drizzle ORM 연동 확인

**Technical Notes:**
- 동일 서버 PostgreSQL → pgvector 확장 지원 확인
- Gemini Embedding 768차원

---

#### Story 10.2: Gemini Embedding 파이프라인
**Points:** 3 SP | **Priority:** P0

**As a** 시스템
**I want** 지식 문서가 업로드되면 자동으로 벡터 임베딩이 생성되는 것을
**So that** 의미 검색이 가능하다

**Acceptance Criteria:**
- [ ] `@google/genai` 기반 Gemini Embedding API 호출
- [ ] 문서 업로드/수정 시 자동 임베딩 생성
- [ ] 기존 문서 일괄 임베딩 스크립트 (마이그레이션)
- [ ] 임베딩 실패 시 embedding = NULL (검색에서 제외, 에러 아님)
- [ ] 비용 제한: 월 $5 이하 (NFR-C2)

---

#### Story 10.3: 의미 검색 API
**Points:** 3 SP | **Priority:** P0

**As a** 에이전트/사용자
**I want** "삼성전자 투자 분석"으로 검색하면 관련 문서가 의미적으로 매칭되는 것을
**So that** 키워드 일치 없이도 관련 문서를 찾을 수 있다

**Acceptance Criteria:**
- [ ] `/api/workspace/knowledge/search` 엔드포인트
- [ ] 쿼리 → Gemini Embedding → pgvector cosine similarity
- [ ] Top-K 결과 반환 (기본 5개)
- [ ] 유사도 점수(score) 포함
- [ ] fallback: 임베딩 없는 문서는 기존 LIKE 검색 병행

---

#### Story 10.4: 부서별 지식 자동 주입 강화
**Points:** 3 SP | **Priority:** P1

**As a** 에이전트
**I want** 부서별 관련 지식이 Soul에 자동 주입되는 것을
**So that** 추가 검색 없이 전문 지식을 활용할 수 있다

**Acceptance Criteria:**
- [ ] soul-renderer.ts 확장: 부서별 상위 K개 관련 문서 자동 주입
- [ ] `{{knowledge_context}}` 새 변수 추가 (E4 확장)
- [ ] 주입 크기 제한: 최대 2,000 토큰 (비용 최적화)
- [ ] v1 spec #16: RAG 문서 저장소 + 부서별 지식 자동 주입

**Technical Notes:**
- v1: knowledge-injector 서비스 → v2: soul-renderer.ts에 통합

---

#### Story 10.5: 지식 관리 UI 개선
**Points:** 3 SP | **Priority:** P1

**As a** 관리자
**I want** 지식 문서를 부서별로 관리하고 임베딩 상태를 확인하는 것을
**So that** 효과적으로 지식 베이스를 운영할 수 있다

**Acceptance Criteria:**
- [ ] 폴더 구조 유지 (v1 호환)
- [ ] 드래그&드롭 업로드
- [ ] 임베딩 상태 표시: 완료 / 진행 중 / 실패
- [ ] 부서별 지식 할당 UI
- [ ] 유사 문서 추천 (correlation)

---

## Epic 11: NotebookLM & SketchVibe MCP

**Phase:** 4 (Week 8~9)
**Priority:** P1
**Story Points:** 14 SP
**Dependencies:** Epic 2 (agent-loop), Epic 10 (지식 시스템)
**Architecture:** NotebookLM MCP 29 tools, SketchVibe Stdio MCP, FR54~60

### Goal
NotebookLM MCP 연동(오디오 브리핑, 마인드맵, 슬라이드)과 SketchVibe MCP 서버 분리.

### Stories

#### Story 11.1: NotebookLM MCP 클라이언트 연동
**Points:** 3 SP | **Priority:** P1

**As a** CEO
**I want** 지식 문서로 오디오 브리핑을 생성하는 것을
**So that** 이동 중에 음성으로 보고를 들을 수 있다

**Acceptance Criteria:**
- [ ] `notebooklm-mcp` Python Stdio 프로세스 연동
- [ ] 주요 도구 6개: create_notebook, add_source, generate_audio, get_mindmap, create_slides, summarize
- [ ] 오디오 생성 → 파일 저장 + URL 반환
- [ ] 텔레그램 전송 연동 (음성 파일 → 텔레그램 봇 → CEO)

**Technical Notes:**
- NotebookLM MCP: 29개 도구 중 핵심 6개 우선 연동
- Python Stdio: Bun에서 child_process.spawn으로 실행

---

#### Story 11.2: SketchVibe MCP 서버 분리
**Points:** 5 SP | **Priority:** P1

**As a** CEO/개발자
**I want** SketchVibe를 MCP 서버로 분리하여 독립 운영하는 것을
**So that** 스케치바이브가 별도 프로세스로 안정적으로 동작한다

**Acceptance Criteria:**
- [ ] `packages/server/src/mcp/sketchvibe-mcp.ts` — MCP Stdio 서버 구현
- [ ] `@modelcontextprotocol/sdk` 기반
- [ ] 도구: read_canvas, add_node, update_node, delete_node, add_edge, save_diagram
- [ ] Cytoscape.js 유지 (v1 호환)
- [ ] Mermaid <-> Cytoscape 양방향 변환 (v1 spec 7.3)
- [ ] 별도 엔트리포인트: `bun run mcp:sketchvibe`

**Technical Notes:**
- NEXUS(React Flow) != SketchVibe(Cytoscape). 완전 분리
- v1 spec 7: SketchVibe 기능 전부 유지

---

#### Story 11.3: SketchVibe AI 실시간 편집
**Points:** 3 SP | **Priority:** P1

**As a** CEO
**I want** AI가 실시간으로 캔버스에 노드를 추가/수정하는 것을
**So that** "그림 그려서 AI랑 같이 보면서 대화"할 수 있다

**Acceptance Criteria:**
- [ ] MCP SSE 연동: AI가 add_node/update_node 호출 → 프론트 캔버스 반영
- [ ] 8종 노드 타입: agent, system, api, decide, db, start, end, note (v1 호환)
- [ ] 드래그 이동, 더블클릭 이름 편집, Delete 삭제
- [ ] 연결 모드: Space바 토글 + Ctrl+클릭 멀티선택
- [ ] edgehandles: 드래그로 화살표 생성
- [ ] compound parent: subgraph 그룹핑

**Technical Notes:**
- v1 spec 7.2~7.4 전체 기능 재현

---

#### Story 11.4: 저장/불러오기 + 지식 연동
**Points:** 3 SP | **Priority:** P1

**As a** CEO
**I want** 다이어그램을 저장하고 지식 베이스에서 불러오는 것을
**So that** 이전 작업을 이어서 할 수 있다

**Acceptance Criteria:**
- [ ] 확인된 다이어그램 저장 (`/api/sketchvibe/confirmed`)
- [ ] 지식 베이스에서 flowchart 불러오기
- [ ] 저장 시 Mermaid 코드 + Cytoscape JSON 둘 다 저장
- [ ] 버전 히스토리 (최근 10개)

---

## Epic 12: Testing & Quality Infrastructure

**Phase:** Supporting (전 Phase에 걸쳐)
**Priority:** P0 — 품질 보증
**Story Points:** 12 SP
**Dependencies:** Epic 1 (기반), Epic 2 (엔진)
**Architecture:** D10 (테스트 전략), E9 (SDK 모킹), E10 (CI 경계)

### Goal
SDK 모킹 표준, 단위/통합/주간 테스트 인프라, Graceful Shutdown, 주간 실제 SDK 통합 테스트를 구축.

### Stories

#### Story 12.1: SDK 모킹 표준 + 헬퍼
**Points:** 3 SP | **Priority:** P0

**As a** 개발자
**I want** SDK query()를 손쉽게 모킹하여 테스트하는 것을
**So that** CI에서 비용 $0으로 엔진 전체를 테스트할 수 있다

**Acceptance Criteria:**
- [ ] `packages/server/src/__tests__/helpers/sdk-mock.ts` 생성 (S4)
- [ ] `mock.module('@anthropic-ai/claude-agent-sdk', ...)` 표준 패턴 (E9)
- [ ] Agent.query() 모킹: AsyncGenerator 반환
- [ ] 커스텀 응답 설정: `mockAgent({ responses: ['response1', 'response2'] })`
- [ ] call_agent 도구 호출 시뮬레이션: `mockAgent({ toolCalls: [{ name: 'call_agent', input: {...} }] })`
- [ ] agent-loop.ts 함수 자체는 실제 실행 (Hook, SessionContext 전파 테스트)

**Technical Notes:**
- `@zapier/secret-scrubber`는 순수 함수 → 모킹 불필요, 실제 실행

---

#### Story 12.2: 주간 실제 SDK 통합 테스트
**Points:** 2 SP | **Priority:** P1

**As a** QA
**I want** 주 1회 실제 SDK query()를 사용한 통합 테스트가 자동 실행되는 것을
**So that** SDK 업데이트로 인한 호환성 문제를 조기에 발견한다

**Acceptance Criteria:**
- [ ] `.github/workflows/weekly-sdk-test.yml` 생성
- [ ] 매주 월요일 03:00 UTC 스케줄 + workflow_dispatch
- [ ] `packages/server/src/__tests__/sdk/real-sdk.test.ts` 생성
- [ ] 실제 query() 호출 → 응답 수신 확인 (비용 ~$1/회)
- [ ] 토큰 로그 금지 (보안)
- [ ] 실패 시 GitHub Actions 알림

---

#### Story 12.3: 단위 테스트 스위트
**Points:** 3 SP | **Priority:** P0

**As a** 개발자
**I want** 엔진 핵심 모듈의 단위 테스트가 CI에서 자동 실행되는 것을
**So that** 회귀를 즉시 발견한다

**Acceptance Criteria:**
- [ ] soul-renderer.test.ts — 6변수 치환 + 누락 + 빈 DB (Story 2.3과 연동)
- [ ] model-selector.test.ts — tier 매핑 + 기본값 (Story 2.4와 연동)
- [ ] scoped-query.test.ts — 격리 검증 (Story 1.2와 연동)
- [ ] error-codes.test.ts — 중복 없음 (Story 1.4와 연동)
- [ ] 전체 CI 실행 시간 < 30초

---

#### Story 12.4: A/B 품질 테스트 프레임워크
**Points:** 2 SP | **Priority:** P2

**As a** QA
**I want** v1 엔진과 v2 엔진의 응답 품질을 비교하는 것을
**So that** 엔진 교체가 품질 저하 없이 이루어졌음을 확인한다

**Acceptance Criteria:**
- [ ] 10개 표준 프롬프트 세트 정의
- [ ] v1 결과 스냅샷 저장
- [ ] v2 결과 생성 → 비교 매트릭스
- [ ] 평가 기준: 응답 길이, 도구 호출 수, 핸드오프 체인, 완성도
- [ ] 릴리스 전 수동 실행 (비용 ~$5/회)

**Technical Notes:**
- NFR-O2: 응답 품질 A/B 테스트

---

#### Story 12.5: .dockerignore + Dockerfile 최적화
**Points:** 2 SP | **Priority:** P1

**As a** DevOps
**I want** Docker 빌드에 불필요한 파일이 포함되지 않는 것을
**So that** 이미지 크기와 빌드 시간이 최적화된다

**Acceptance Criteria:**
- [ ] .dockerignore 업데이트: `.github/`, `_bmad*`, `_poc/`, `_uxui*` (S6)
- [ ] Dockerfile COPY 목록: 새 의존성 반영
- [ ] ARM64 Docker 빌드 확인
- [ ] 이미지 크기 < 500MB

---

## Dependency Graph (Epic 간)

```
Epic 1 (Foundation) ──→ Epic 2 (Engine Core) ──→ Epic 3 (Hooks)
                                  │                    │
                                  ├────────────────────┤
                                  ▼                    ▼
                           Epic 4 (Migration) ──→ Epic 5 (Secretary)
                                                       │
                                                       ├──→ Epic 6 (Hub UX)
                                                       └──→ Epic 7 (Org Mgmt) ──→ Epic 8 (N-Tier)
                                                                    │                    │
                                                                    └────────────────────┤
                                                                                         ▼
                                                                                  Epic 9 (NEXUS)

Epic 2 ──→ Epic 10 (Semantic Search)
Epic 2 ──→ Epic 11 (NotebookLM/SketchVibe)
Epic 1 ──→ Epic 12 (Testing) ─── spans all phases ───
```

## v1 Feature Coverage Matrix

| v1 기능 (spec) | Epic | Story | 상태 |
|----------------|------|-------|------|
| 사령관실 (명령 입력) | 5 | 5.3, 5.6 | Covered: 슬래시/멘션/프리셋 |
| 명령 처리 흐름 | 5 | 5.2 | Covered: Soul 기반 라우팅 |
| 실시간 상태 표시 | 6 | 6.3 | Covered: SSE 상태 머신 |
| 에이전트 조직 | 7 | 7.1~7.4 | Covered: 동적 CRUD |
| 에이전트 3계급 | 8 | 8.1~8.3 | Covered: N-Tier 확장 |
| Soul 시스템 | 7 | 7.2 | Covered: 웹 UI 편집 |
| 자율 딥워크 | 5 | 5.7 | Covered: Soul 패턴 |
| 도구 시스템 125+ | 3 | 3.1 | Covered: 권한 제어 |
| LLM 멀티 프로바이더 | 2 | 2.4 | Covered: Phase 1~4 Claude, Phase 5+ 멀티 |
| AGORA 토론 | 4 | 4.2 | Covered: import 교체 |
| 전략실 자동매매 | 4 | 4.2 | Covered: import 교체 (불가침) |
| 스케치바이브 | 11 | 11.2~11.4 | Covered: MCP 분리 |
| SNS 통신국 | — | — | 유지 (불가침) |
| 대시보드 | — | — | 유지 (기존 Epic) |
| 통신로그 | — | — | 유지 (기존 Epic) |
| 작전일지 | — | — | 유지 (기존 Epic) |
| 기밀문서 | — | — | 유지 (기존 Epic) |
| 전력분석 | — | — | 유지 (기존 Epic) |
| 워크플로우 | — | — | 유지 (기존 Epic) |
| 크론기지 | — | — | 유지 (기존 Epic) |
| 정보국 (Knowledge) | 10 | 10.4~10.5 | Covered: pgvector 강화 |
| ARGOS | 4 | 4.2 | Covered: import 교체 (불가침) |
| 텔레그램 | 4 | 4.2 | Covered: import 교체 (불가침) |
| 품질 게이트 | 5 | 5.7 | Covered: Soul 기반 QA |
| 에이전트 메모리 | 6 | 6.4 | Covered: autoLearn |
| 비용 관리 | 3 | 3.5 | Covered: cost-tracker Hook |
| CEO 아이디어 | 5, 7 | 5.4 | Covered: 반영 |

## Architecture Decision Coverage

| 결정 | Epic | 참조 |
|------|------|------|
| D1 getDB(companyId) | 1 | Story 1.2 |
| D2 CLI 토큰 만료 | 4 | Story 4.1 |
| D3 에러 코드 체계 | 1 | Story 1.4 |
| D4 Hook 파이프라인 순서 | 3 | Story 3.1~3.6 |
| D5 SessionContext | 2 | Story 2.1 |
| D6 단일 진입점 | 2 | Story 2.2 |
| D7 도구 권한 저장 | 3 | Story 3.1 |
| D8 캐싱 없음 | — | Phase 5+ |
| D9 로거 | 1 | Story 1.3 |
| D10 테스트 전략 | 12 | Story 12.1~12.4 |
| D11 WebSocket 유지 | 4, 6 | Story 4.6, 6.5 |
| D12 토큰 등록시만 검증 | 5 | Story 5.1 |
| D13~D16 Deferred | — | Phase 5+ |

## Engine Pattern Coverage

| 패턴 | Epic | 참조 |
|------|------|------|
| E1 SessionContext 전파 | 2 | Story 2.1, 2.6 |
| E2 Hook 구현 표준 | 3 | Story 3.1~3.5 |
| E3 getDB CRUD 격리 | 1 | Story 1.2 |
| E4 Soul 템플릿 변수 | 2 | Story 2.3 |
| E5 SSE 이벤트 발행 | 2 | Story 2.1, 2.5 |
| E6 model-selector 매핑 | 2, 8 | Story 2.4, 8.3 |
| E7 순차 핸드오프 | 2 | Story 2.6 |
| E8 engine/ 공개 API 경계 | 1 | Story 1.6 |
| E9 SDK 모킹 표준 | 12 | Story 12.1 |
| E10 CI 경계 검증 | 1 | Story 1.6 |

## Summary Statistics

| 항목 | 수치 |
|------|------|
| Epics | 12 |
| Stories | 64 |
| Total SP | 174 |
| Phase 1 SP | 60 (33%) |
| Phase 2 SP | 46 (26%) |
| Phase 3 SP | 28 (16%) |
| Phase 4 SP | 28 (16%) |
| Supporting SP | 12 (7%) |
| P0 Stories | 42 (58%) |
| P1 Stories | 24 (33%) |
| P2 Stories | 6 (8%) |
| D1~D16 Coverage | 12/16 (4 deferred to Phase 5+) |
| E1~E10 Coverage | 10/10 (100%) |
| v1 Feature Coverage | 22/22 (100%) |
