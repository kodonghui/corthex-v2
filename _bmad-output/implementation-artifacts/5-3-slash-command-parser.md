# Story 5.3: 슬래시 명령어 파서

Status: review

## Story

As a **CEO/사령관실 사용자**,
I want **/전체, /순차, /도구점검, /배치실행, /배치상태, /명령어, /토론, /심층토론 슬래시 명령어와 프리셋 단축어가 동작하는 것을**,
so that **v1에서 쓰던 슬래시 명령 방식이 v2에서도 그대로 동작하고, 사용자 정의 단축어로 반복 작업을 간편하게 실행할 수 있다**.

## Acceptance Criteria

1. **슬래시 명령어 파서**: hub.ts 또는 별도 모듈에서 슬래시 명령어 파싱 → 적절한 핸들러로 라우팅
2. `/전체` — 모든 매니저급 에이전트에게 동시 지시 (call_agent × N)
3. `/순차` — 에이전트 릴레이 모드 (순차 핸드오프)
4. `/도구점검` — 전체 도구 상태 확인
5. `/배치실행` — 대기 중인 AI 요청 일괄 전송
6. `/배치상태` — 배치 작업 진행 확인
7. `/명령어` — 전체 명령어 목록 + 사용자 프리셋 포함
8. `/토론` — AGORA 2라운드 토론 시작
9. `/심층토론` — AGORA 3라운드 토론 시작
10. **프리셋**: 사용자 정의 단축어 (DB 저장 + 실행 통합)

## Tasks / Subtasks

### ALREADY COMPLETE (이전 스토리에서 구현됨):

- [x] Task 0-A: 슬래시 명령어 파서 (AC: #1) — `command-router.ts`
  - [x] `parseSlash()`: 9종 명령어 파싱 (longest-first prefix matching)
  - [x] `classify()`: slash → type/meta 분류 + timeout 설정
  - [x] SLASH_COMMANDS 레지스트리 (9 commands)
  - [x] 59 unit tests (`command-router.test.ts` + `command-router-tea.test.ts`)

- [x] Task 0-B: /전체 핸들러 (AC: #2) — `all-command-processor.ts`
  - [x] 모든 Manager에게 `managerDelegate()` 병렬 dispatch
  - [x] Secretary agent 종합 보고서 합성
  - [x] WebSocket delegation tracking
  - [x] commands.ts dispatch 연동 완료

- [x] Task 0-C: /순차 핸들러 (AC: #3) — `sequential-command-processor.ts`
  - [x] LLM이 Manager 순서 결정 (`planOrder()`)
  - [x] 순차 실행 (이전 결과를 다음 에이전트 context에 추가)
  - [x] Secretary 종합 합성
  - [x] commands.ts dispatch 연동 완료

- [x] Task 0-D: /토론 + /심층토론 핸들러 (AC: #8, #9) — `debate-command-handler.ts`
  - [x] AGORA engine (`createDebate`, `startDebate`, `getDebate`) 통합
  - [x] 참여자 자동 선택 (Manager/Specialist 우선)
  - [x] 토론 결과 포맷팅 (합의/비합의/부분합의)
  - [x] commands.ts dispatch 연동 완료

- [x] Task 0-E: 프리셋 CRUD + 실행 (AC: #10) — `routes/workspace/presets.ts`
  - [x] POST/GET/PATCH/DELETE + POST /:id/execute
  - [x] 프리셋 실행 시 command text를 classify → 적절한 핸들러로 dispatch
  - [x] sortOrder 자동 증가 (사용 빈도 추적)
  - [x] isGlobal, category 지원

### NEW TASKS (이 스토리에서 구현):

- [x] Task 1: `/도구점검` 핸들러 (AC: #4)
  - [x] 1.1 `packages/server/src/services/tool-check-handler.ts` 생성
  - [x] 1.2 `processToolCheck(options)` — 에이전트별 허용 도구 목록 + 실제 사용 가능 여부 확인
  - [x] 1.3 도구 상태 보고서 포맷: 에이전트별 허용 도구 + DB 연결 상태 + 외부 API 상태
  - [x] 1.4 commands.ts에 tool_check dispatch 추가

- [x] Task 2: `/배치실행` 핸들러 (AC: #5)
  - [x] 2.1 `packages/server/src/services/batch-command-handler.ts` 생성
  - [x] 2.2 `processBatchRun(options)` — pending 상태 commands 일괄 실행
  - [x] 2.3 각 pending command를 타입별 프로세서로 dispatch (fire-and-forget)
  - [x] 2.4 실행 결과 요약 반환 (실행 N건, 건너뜀 N건)
  - [x] 2.5 commands.ts에 batch_run dispatch 추가

- [x] Task 3: `/배치상태` 핸들러 (AC: #6)
  - [x] 3.1 같은 `batch-command-handler.ts`에 `processBatchStatus(options)` 추가
  - [x] 3.2 processing 중인 commands 상태 조회 (company-scoped)
  - [x] 3.3 상태 보고서: 진행 중 N건, 완료 N건, 실패 N건, 대기 N건
  - [x] 3.4 commands.ts에 batch_status dispatch 추가

- [x] Task 4: `/명령어` 핸들러 (AC: #7)
  - [x] 4.1 `packages/server/src/services/commands-list-handler.ts` 생성
  - [x] 4.2 `processCommandsList(options)` — 전체 명령어 목록 + 사용자 프리셋 반환
  - [x] 4.3 빌트인 명령어 9종 + 사용법 설명 포맷팅
  - [x] 4.4 사용자 프리셋 목록 (이름 + 카테고리 + 설명) 병합
  - [x] 4.5 commands.ts에 commands_list dispatch 추가

- [x] Task 5: commands.ts dispatch 통합 (AC: #4, #5, #6, #7)
  - [x] 5.1 commands.ts에 4개 신규 핸들러 import
  - [x] 5.2 slashType === 'tool_check' → processToolCheck()
  - [x] 5.3 slashType === 'batch_run' → processBatchRun()
  - [x] 5.4 slashType === 'batch_status' → processBatchStatus()
  - [x] 5.5 slashType === 'commands_list' → processCommandsList()
  - [x] 5.6 preset type dispatch 연동 (현재 presets.ts에서 이미 처리 — commands.ts에서는 presetId가 있을 때 type='preset'으로 분류만, 실행은 presets/:id/execute에서)

- [x] Task 6: 단위 테스트 (AC: all)
  - [x] 6.1 `tool-check-handler.test.ts` — 6 tests: 도구 그룹핑, 에이전트 목록, 요약 계산, null 처리, 빈 상태
  - [x] 6.2 `batch-command-handler.test.ts` — 8 tests: 배치 실행 보고서, 상태 보고서, 카운트, 트렁케이션, 빈 상태
  - [x] 6.3 `commands-list-handler.test.ts` — 8 tests: 빌트인 목록, @멘션, 프리셋 병합, 카테고리, 트렁케이션, 푸터
  - [x] 6.4 기존 command-router 136 tests 회귀 확인 — 0 failures

## Dev Notes

### 기존 코드 현황 (매우 중요 — 대부분 구현 완료)

**이 스토리의 10개 AC 중 6개는 이전 스토리(5-1, 5-2)와 별도 작업에서 이미 구현되어 있다:**

| AC | 기능 | 상태 | 파일 |
|----|------|------|------|
| #1 | 슬래시 파서 | ✅ 완료 | `services/command-router.ts` |
| #2 | /전체 | ✅ 완료 | `services/all-command-processor.ts` |
| #3 | /순차 | ✅ 완료 | `services/sequential-command-processor.ts` |
| #4 | /도구점검 | ❌ **미구현** | 파싱만 있음, 핸들러 없음 |
| #5 | /배치실행 | ❌ **미구현** | 파싱만 있음, 핸들러 없음 |
| #6 | /배치상태 | ❌ **미구현** | 파싱만 있음, 핸들러 없음 |
| #7 | /명령어 | ❌ **미구현** | 파싱만 있음, 핸들러 없음 |
| #8 | /토론 | ✅ 완료 | `services/debate-command-handler.ts` |
| #9 | /심층토론 | ✅ 완료 | `services/debate-command-handler.ts` |
| #10 | 프리셋 | ✅ 완료 | `routes/workspace/presets.ts` |

**즉, Task 1~6만 구현하면 됨 (4개 핸들러 + dispatch + 테스트)**

### 기존 인프라 참조

**1. CommandRouter** (`packages/server/src/services/command-router.ts`):
```typescript
// 이미 9종 슬래시 명령어 파싱 완료
const SLASH_COMMANDS: Record<string, { slashType: SlashType; commandType: CommandType }> = {
  '/전체':     { slashType: 'all',           commandType: 'all' },
  '/순차':     { slashType: 'sequential',    commandType: 'sequential' },
  '/도구점검': { slashType: 'tool_check',    commandType: 'slash' },
  '/배치실행': { slashType: 'batch_run',     commandType: 'slash' },
  '/배치상태': { slashType: 'batch_status',  commandType: 'slash' },
  '/명령어':   { slashType: 'commands_list', commandType: 'slash' },
  '/토론':     { slashType: 'debate',        commandType: 'slash' },
  '/심층토론': { slashType: 'deep_debate',   commandType: 'slash' },
  '/스케치':   { slashType: 'sketch',        commandType: 'slash' },
}

// SlashType 타입도 이미 정의됨
export type SlashType = 'all' | 'sequential' | 'tool_check' | 'batch_run' | 'batch_status' | 'commands_list' | 'debate' | 'deep_debate' | 'sketch'
```

**2. Commands API** (`packages/server/src/routes/commands.ts`):
- POST /api/workspace/commands에서 classify → createCommand → type별 dispatch
- 현재 dispatch 누락: tool_check, batch_run, batch_status, commands_list
- 패턴: fire-and-forget async (`.catch()` 로깅)

**3. 기존 핸들러 패턴** (모든 핸들러가 같은 패턴):
```typescript
export type XxxOptions = {
  commandId: string
  commandText: string  // or topic, prompt
  companyId: string
  userId: string
}

export async function processXxx(options: XxxOptions): Promise<void> {
  // 1. Update command status → 'processing'
  // 2. Business logic
  // 3. Update command status → 'completed' + result
  // 4. Catch → status='failed' + error message
}
```

**4. DB 스키마** (`packages/server/src/db/schema.ts`):
- `commands` 테이블: id, companyId, userId, type, text, status, result, metadata(jsonb), completedAt
- `agents` 테이블: id, companyId, name, tier, isActive, allowedTools(text[]), isSecretary
- `presets` 테이블: id, companyId, userId, name, command, description, category, isGlobal, sortOrder

**5. DelegationTracker** (`packages/server/src/services/delegation-tracker.ts`):
- `delegationTracker.startCommand()` / `.completed()` / `.failed()` — WebSocket 이벤트
- 새 핸들러에서도 WebSocket 상태 전송 필요

**6. Tool System** (`packages/server/src/engine/` + `packages/server/src/tools/`):
- 도구 목록은 `packages/server/src/tools/index.ts`에서 export
- 에이전트별 허용 도구: `agents.allowedTools` (text[] 컬럼)
- 도구 실행은 agent-loop.ts 내부에서 처리

### 핸들러별 구현 가이드

**Task 1: `/도구점검` (tool-check-handler.ts)**

v1 참조: `/home/ubuntu/CORTHEX_HQ/web/handlers/tool_handler.py`
- v1은 125+ 도구의 상태를 확인 (API 키 유효, 엔드포인트 응답 등)
- v2 구현 범위:
  1. DB에서 모든 활성 에이전트 + 각자의 allowedTools 조회
  2. 도구 등록부(tools/index.ts)에서 전체 도구 목록 확인
  3. 에이전트별 "허용된 도구 N개" 보고
  4. 외부 API 연결 상태 (가능한 경우) — Phase 1에서는 도구 목록 + 에이전트 매핑만
  5. 보고서 포맷: 마크다운 테이블

```
## 🔧 도구 점검 결과

### 도구 등록 현황
| 도구 | 카테고리 | 상태 |
|------|---------|------|
| web_search | 검색 | ✅ 등록됨 |
...

### 에이전트별 도구 배정
| 에이전트 | 부서 | 허용 도구 수 |
|---------|------|------------|
| 투자분석팀장 | 전략기획부 | 12 |
...
```

**Task 2: `/배치실행` (batch-command-handler.ts)**

v1 참조: `/home/ubuntu/CORTHEX_HQ/web/handlers/batch_handler.py`
- v1은 Claude Batch API(50% 할인)로 비긴급 작업 일괄 전송
- v2 구현:
  1. pending 상태 commands 조회 (companyId scoped)
  2. 각 pending command를 타입별 프로세서로 dispatch
  3. 결과: "N건 실행 시작, M건 건너뜀 (이미 처리 중)"
  4. 실제 Batch API 연동은 Phase 3+ → 지금은 기존 프로세서로 순차 dispatch

**Task 3: `/배치상태` (같은 batch-command-handler.ts)**

- pending/processing/completed/failed 상태별 카운트
- 최근 processing 중인 command 요약 (최대 10건)
- 포맷: 마크다운 상태 보고서

**Task 4: `/명령어` (commands-list-handler.ts)**

v1 참조: 비서실장이 자동으로 명령어 목록 응답
- v2 구현:
  1. 빌트인 9종 명령어 + 각각의 사용법/설명
  2. 사용자 프리셋 목록 (presets 테이블 조회)
  3. 포맷: 카테고리별 그룹핑

```
## 📋 사용 가능한 명령어

### 기본 명령어
| 명령어 | 설명 | 사용법 |
|--------|------|--------|
| /전체 | 모든 부서에 동시 지시 | /전체 [명령] |
| /순차 | 부서 순차 협업 | /순차 [명령] |
| /토론 | AGORA 토론 (2라운드) | /토론 [주제] |
| /심층토론 | AGORA 심층 토론 (3라운드) | /심층토론 [주제] |
| /도구점검 | 도구 상태 확인 | /도구점검 |
| /배치실행 | 대기 명령 일괄 실행 | /배치실행 |
| /배치상태 | 배치 진행 상황 | /배치상태 |
| /스케치 | AI 다이어그램 생성 | /스케치 [설명] |
| /명령어 | 이 목록 표시 | /명령어 |

### 내 프리셋
| 이름 | 카테고리 | 명령어 |
|------|---------|--------|
| 일일보고 | 보고 | /전체 오늘의 핵심 업무 보고 |
...
```

### 아키텍처 제약사항

- **tenant 격리**: 모든 쿼리에 companyId WHERE 필수
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`tool-check-handler.ts`, `batch-command-handler.ts`)
- **테스트**: bun:test 프레임워크 사용
- **import 경로**: 실제 파일 대소문자와 일치 필수 (Linux CI)
- **명령어 핸들러 패턴**: 기존 핸들러(all/sequential/debate/sketch)와 동일 패턴
  - Options 타입 정의
  - async processXxx() 함수 export
  - 성공 시 commands.status='completed' + result 텍스트
  - 실패 시 commands.status='failed' + error 메시지
  - delegationTracker로 WebSocket 이벤트 전송
- **commands.ts dispatch**: fire-and-forget `.catch(console.error)` 패턴
- **No LLM calls for utility commands**: /도구점검, /배치상태, /명령어는 DB 조회만 (LLM 불필요)
- **engine/ 경계 위반 금지**: engine/ 폴더에서 import는 agent-loop.ts + types.ts만

### 이전 스토리 인텔리전스 (5-2)

- `parseLLMJson()`: LLM JSON 응답 파싱 (마크다운 코드블록 스트리핑) — chief-of-staff.ts에서 export
- `toAgentConfig()`: DB row → AgentConfig 변환 유틸리티
- `findSecretaryAgent()` / `getActiveManagers()`: 비서+매니저 조회 유틸리티
- `delegationTracker`: WebSocket 이벤트 발행기
- `makeContext()`: AgentRunner 실행 context 생성
- 테스트 패턴: mock DB, mock agentRunner, describe/it 구조

### v1 참고

- v1 슬래시 명령어: `/home/ubuntu/CORTHEX_HQ/web/ai_handler.py` — 8종 명령어
- v1 도구 점검: `/home/ubuntu/CORTHEX_HQ/web/handlers/tool_handler.py` — 125+ 도구 상태
- v1 배치: `/home/ubuntu/CORTHEX_HQ/web/handlers/batch_handler.py` — Claude Batch API 연동
- v1 명령어 목록: 비서실장이 자동 응답 (하드코딩 목록)

### Project Structure Notes

- 새 파일: `packages/server/src/services/tool-check-handler.ts`
- 새 파일: `packages/server/src/services/batch-command-handler.ts`
- 새 파일: `packages/server/src/services/commands-list-handler.ts`
- 수정: `packages/server/src/routes/commands.ts` (4개 dispatch 추가)
- 테스트: `packages/server/src/__tests__/unit/tool-check-handler.test.ts`
- 테스트: `packages/server/src/__tests__/unit/batch-command-handler.test.ts`
- 테스트: `packages/server/src/__tests__/unit/commands-list-handler.test.ts`

### References

- [Source: packages/server/src/services/command-router.ts] 슬래시 파서 + classify() — parseSlash(), SLASH_COMMANDS
- [Source: packages/server/src/routes/commands.ts] 명령 제출 API — dispatch 패턴
- [Source: packages/server/src/services/all-command-processor.ts] /전체 핸들러 패턴 (참조 구현)
- [Source: packages/server/src/services/sequential-command-processor.ts] /순차 핸들러 패턴
- [Source: packages/server/src/services/debate-command-handler.ts] /토론 핸들러 + AGORA 연동
- [Source: packages/server/src/services/sketch-command-handler.ts] /스케치 핸들러 패턴
- [Source: packages/server/src/routes/workspace/presets.ts] 프리셋 CRUD + 실행
- [Source: packages/server/src/services/chief-of-staff.ts] parseLLMJson, toAgentConfig, findSecretaryAgent, getActiveManagers
- [Source: packages/server/src/services/delegation-tracker.ts] WebSocket 이벤트 발행
- [Source: packages/server/src/db/schema.ts#commands] commands 테이블
- [Source: packages/server/src/db/schema.ts#agents] agents 테이블 (allowedTools)
- [Source: packages/server/src/db/schema.ts#presets] presets 테이블
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S3] 스토리 수용 기준
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/tool_handler.py] v1 도구 점검
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/batch_handler.py] v1 배치 처리

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- 10 AC 중 6개 이미 구현 완료 확인 (command-router, all/sequential/debate processors, presets)
- 4개 신규 핸들러 구현 완료: tool-check, batch-run, batch-status, commands-list
- commands.ts에 4개 dispatch 추가 완료
- 22 new tests (6 tool-check + 8 batch + 8 commands-list), all pass
- 136 existing command-router tests — 0 regressions
- tsc --noEmit: 0 errors
- 기존 핸들러와 동일한 패턴 사용: delegationTracker, status update, fire-and-forget dispatch

### Change Log

- 2026-03-11: Story 5-3 implementation complete — 4 slash command handlers + commands.ts dispatch + 22 tests

### File List

- packages/server/src/services/tool-check-handler.ts (NEW)
- packages/server/src/services/batch-command-handler.ts (NEW)
- packages/server/src/services/commands-list-handler.ts (NEW)
- packages/server/src/routes/commands.ts (MODIFIED — 4 new slash command dispatches)
- packages/server/src/__tests__/unit/tool-check-handler.test.ts (NEW)
- packages/server/src/__tests__/unit/batch-command-handler.test.ts (NEW)
- packages/server/src/__tests__/unit/commands-list-handler.test.ts (NEW)
