# Agent Engine v3 PoC Result

> Date: 2026-03-10
> SDK: `@anthropic-ai/claude-agent-sdk@0.2.72`
> CLI: Claude Code 2.1.70
> Auth: claude.ai (elddlwkd@gmail.com)

## Verdict: ALL PASS — Phase 1 진행 확정

| # | Test | Priority | Result | Duration | Cost |
|---|------|----------|--------|----------|------|
| 1 | SDK 기본 query() | MUST-PASS | **PASS** | 4.4s | $0.0205 |
| 2 | CLI 토큰 인증 (env 주입) | MUST-PASS | **PASS** | 4.9s | $0.0127 |
| 3 | 커스텀 도구 (call_agent) | MUST-PASS | **PASS** | 21.6s | $0.0390 |
| 4 | Hook 시스템 (Pre/Post/Stop) | IMPORTANT | **PASS** | 16.3s | $0.0280 |
| 6 | 서브에이전트 Agent 도구 | BONUS | **PASS** | 10.5s | $0.0538 |
| 7 | 중첩 서브에이전트 (한계) | BONUS | **PASS** | 18.6s | $0.0600 |
| 8 | 병렬 에이전트 실행 | BONUS | **PASS** | 5.0s | $0.0383 |
| 9 | MCP 서버 연결 | BONUS | **PASS** | 12.3s | $0.0244 |

**Total Cost: ~$0.28 / Total Time: ~93s**

---

## Key Findings

### 1. SDK 기본 동작 (Test 1)
- `query()` → `AsyncGenerator<SDKMessage>` 스트림 정상
- 메시지 흐름: `system:init → assistant → rate_limit_event → result:success`
- 기본 모델: `claude-sonnet-4-6` (자동 선택)
- 세션 ID 자동 생성, 재개 가능

### 2. CLI 토큰 패턴 (Test 2)
- `initializationResult()` → account 정보 (email, subscriptionType, org)
- `accountInfo()` → 동일 정보 별도 API
- `env: { ANTHROPIC_API_KEY: token }` 으로 토큰 주입 구조 확인
- **CORTHEX 적용**: Human의 CLI 토큰을 env로 전달 → 에이전트가 해당 토큰으로 실행

### 3. call_agent 도구 패턴 (Test 3) — 핵심!
- `tool()` + `createSdkMcpServer()` → 커스텀 MCP 서버 인프로세스 생성
- LLM이 `mcp__corthex-tools__call_agent` 자연스럽게 호출
- Zod v4 스키마로 타입 안전한 입력 검증
- 도구 핸들러에서 DB 조회, 비즈니스 로직 실행 가능
- **실제 흐름**: get_org_structure → call_agent("agent-dev-1", "코드 리뷰 해줘") 성공

### 4. Hook 시스템 (Test 4)
- PreToolUse: 도구 실행 전 가로채기 (deny/allow/modify)
- PostToolUse: 도구 실행 후 응답 캡처 (audit log)
- Stop: 세션 종료 감지
- 21개 이벤트 전부 사용 가능
- **CORTHEX 5개 훅 전부 구현 가능** 확인

### 5. 서브에이전트 (Test 6)
- `agents: { researcher: { prompt, tools, model } }` 정의
- Main → Agent 도구 → 서브에이전트 자동 실행
- haiku 등 모델 오버라이드 가능
- `task_notification`으로 완료 추적

### 6. 중첩 한계 (Test 7) — 아키텍처 결정 근거
- SDK Agent 도구는 **1단계만 지원** (manager→worker 재위임 불가)
- depth1 메시지 = 0 (중첩 안 됨)
- **결론: call_agent MCP 도구 패턴이 필수**
  - 핸들러에서 새 query() spawn → 무한 깊이 가능
  - SDK 한계를 극복하는 CORTHEX만의 아키텍처

### 7. 병렬 실행 (Test 8)
- `Promise.all(tasks.map(t => query(...)))` 패턴 동작
- 3개 동시 실행: 5.0s (개별 합산 14.0s → 64% 절약)
- 여러 부서 동시 업무 배포에 적합

### 8. MCP 연결 (Test 9)
- SDK MCP (인프로세스): `createSdkMcpServer()` 정상
- `mcpServerStatus()`: 연결 상태 실시간 확인
- `setMcpServers()`: 런타임 동적 추가/제거
- claude.ai 등록 MCP (Gmail, Calendar)도 표시됨

---

## Gotcha: CLAUDECODE 환경변수

- Claude Code 세션 안에서 SDK 실행 시 중첩 방지 에러 발생
- 해결: `env: { CLAUDECODE: "" }` 또는 `CLAUDECODE= bun run ...`
- 프로덕션에서는 서버(Hono)가 독립 프로세스이므로 이슈 없음

---

## Architecture Decision: call_agent MCP vs SDK Agent

| 기준 | SDK Agent 도구 | call_agent MCP 도구 |
|------|---------------|-------------------|
| 깊이 | 1단계만 | 무한 (query() 재귀) |
| 토큰 제어 | 동일 세션 공유 | 세션별 독립 env 주입 가능 |
| 모델 선택 | agent 정의 시 고정 | 런타임 동적 (tier_configs) |
| 비용 추적 | 합산만 | 세션별 분리 가능 |
| 구현 복잡도 | 낮음 | 중간 |

**결정: call_agent MCP 패턴 채택** (Product Brief 방향 확정)
- SDK Agent는 단순 1단계 위임에 보조적 사용
- 핵심 오케스트레이션은 call_agent MCP 도구로

---

## Next: Phase 1 시작

PoC 전부 통과 → Product Brief Phase 0 완료 → Phase 1(엔진 교체) 진행 가능

1. `engine/agent-loop.ts` 작성 (~50줄 thin wrapper)
2. `engine/hooks/` 5개 훅 구현
3. `call-agent.ts` MCP 도구 구현
4. 기존 5개 서비스 삭제
5. llm-router.ts 유지 (폴백/서킷브레이커)
