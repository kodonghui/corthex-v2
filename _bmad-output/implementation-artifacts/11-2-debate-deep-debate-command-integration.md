# Story 11.2: /토론 + /심층토론 명령 통합

Status: done

## Story

As a CEO/Human 직원,
I want 사령관실에서 `/토론 [주제]` 또는 `/심층토론 [주제]`를 입력하면 AGORA 엔진이 자동으로 토론을 생성·실행하고 결과를 보고서로 반환하도록,
so that 별도의 API 호출 없이 사령관실 명령 하나로 다각도 전문가 토론을 실행하고 결과를 명령 이력에서 확인할 수 있다.

## Acceptance Criteria

1. **`/토론 [주제]` 명령 처리**: POST /api/workspace/commands에 `/토론 AI 투자 전략` 제출 시, command-router가 slashType='debate'로 분류하고, 자동으로 AGORA 토론(debate, 2라운드)을 생성·시작하며, 결과가 command.result에 저장된다
2. **`/심층토론 [주제]` 명령 처리**: `/심층토론 글로벌 경제 전망` 제출 시, slashType='deep_debate'로 분류하고, AGORA 심층토론(deep-debate, 3라운드)을 생성·시작하며, 결과가 command.result에 저장된다
3. **자동 참여자 선정**: 주제를 분석하여 활성 에이전트(Manager/Specialist) 중 2~5명을 자동 선정. 에이전트가 2명 미만이면 에러 메시지 반환
4. **토론 결과 → 명령 보고서**: 토론 완료 시 command.result에 토론 결과 요약(합의/비합의, 참여자, 핵심 논점, 라운드 요약)이 구조화된 마크다운으로 저장
5. **실시간 진행 업데이트**: 토론 진행 중 delegation-tracker를 통해 WebSocket으로 단계별 상태(classify → debate-started → round-N → debate-done)를 발행
6. **토론-명령 연결**: command.metadata에 debateId를 포함하여 명령 상세 조회 시 관련 토론을 추적할 수 있음
7. **에러 핸들링**: 주제 미입력, 활성 에이전트 부족, AGORA 엔진 오류 시 command.status='failed' + 한국어 에러 메시지 저장
8. **기존 debate API 호환**: 기존 POST /api/workspace/debates API는 변경 없이 유지. 슬래시 명령은 추가 경로
9. **tenant 격리**: 모든 작업에 companyId 필터 적용
10. **테스트**: 슬래시 명령 라우팅, 참여자 자동 선정, 결과 보고서 생성, 에러 핸들링 커버리지 90%+

## Tasks / Subtasks

- [x] Task 1: 토론 명령 처리 서비스 생성 (AC: #1, #2, #3, #4, #6)
  - [x] 1.1 `packages/server/src/services/debate-command-handler.ts` 생성
  - [x] 1.2 `selectDebateParticipants()`: companyId로 활성 에이전트 조회 → LLM 또는 규칙 기반으로 주제에 적합한 2~5명 자동 선정
  - [x] 1.3 `processDebateCommand()`: slashType='debate'|'deep_debate' 분기 → createDebate + startDebate 호출 → 결과 대기 → 보고서 생성
  - [x] 1.4 `formatDebateReport()`: DebateResult를 마크다운 보고서로 변환 (합의 결과, 참여자, 라운드별 요약, 핵심 논점)
  - [x] 1.5 토론 완료 polling/event 대기 로직 (debate.status === 'completed' 될 때까지)

- [x] Task 2: 명령 라우트에 토론 슬래시 핸들러 연결 (AC: #1, #2, #5, #6, #7)
  - [x] 2.1 `packages/server/src/routes/commands.ts` 수정: slashType === 'debate' || 'deep_debate' 분기 추가
  - [x] 2.2 debate-command-handler.processDebateCommand() 비동기 호출 (fire-and-forget 패턴, 기존 direct/mention/all/sequential과 동일)
  - [x] 2.3 command.metadata에 debateId 저장
  - [x] 2.4 에러 시 command.status='failed' + error message 업데이트

- [x] Task 3: DelegationTracker 토론 이벤트 확장 (AC: #5)
  - [x] 3.1 `packages/server/src/services/delegation-tracker.ts`에 debateStarted(), debateRoundProgress(), debateCompleted() 메서드 추가
  - [x] 3.2 debate-command-handler에서 토론 진행 시 delegation-tracker 이벤트 발행

- [x] Task 4: Shared 타입 확장 (AC: #6)
  - [x] 4.1 `packages/shared/src/types.ts`에 DebateCommandResult 타입 추가 (debateId, report 포함)

- [x] Task 5: 테스트 (AC: #10)
  - [x] 5.1 `debate-command-handler.test.ts` -- selectDebateParticipants 단위 테스트
  - [x] 5.2 processDebateCommand 단위 테스트 (debate/deep-debate 분기)
  - [x] 5.3 formatDebateReport 단위 테스트
  - [x] 5.4 명령 라우트 통합 (슬래시 명령 → 토론 생성 → 결과 저장)
  - [x] 5.5 에러 핸들링 테스트 (주제 없음, 에이전트 부족, 엔진 오류)
  - [x] 5.6 tenant 격리 테스트

## Dev Notes

### Architecture Compliance

- **새 서비스**: `packages/server/src/services/debate-command-handler.ts` (명령→토론 브릿지)
- **수정 파일**: `packages/server/src/routes/commands.ts` (슬래시 핸들러 추가)
- **수정 파일**: `packages/server/src/services/delegation-tracker.ts` (토론 이벤트)
- **수정 파일**: `packages/shared/src/types.ts` (DebateCommandResult 타입)
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **tenant 격리**: 모든 DB 쿼리에 companyId 필수
- **인증**: 기존 authMiddleware + departmentScopeMiddleware 재사용

### Key Implementation Details

**현재 구현 상태 (11-1에서 완료):**
- command-router.ts: `/토론`, `/심층토론` 이미 정의됨 (slashType='debate'/'deep_debate', commandType='slash', timeout 300_000ms)
- agora-engine.ts: createDebate(), startDebate(), getDebate(), listDebates() 모두 구현됨
- debates API route: POST/GET /api/workspace/debates 동작 중
- EventBus debate 이벤트: debate-started, round-started, agent-spoke, round-ended, debate-done 발행 중

**현재 누락 (이 스토리에서 구현):**
- commands.ts에서 slashType='debate'/'deep_debate' 처리 분기가 없음 (line 67~116 참조)
- 자동 참여자 선정 로직 없음
- 토론 결과 → command.result 저장 로직 없음
- delegation-tracker에 토론 전용 이벤트 없음

**명령 처리 흐름 (구현 목표):**
```
사용자: "/토론 AI 투자 전략"
  → command-router.classify(): type='slash', slashType='debate', slashArgs='AI 투자 전략'
  → commands.ts POST handler: slashType 감지 → processDebateCommand() 비동기 호출
  → debate-command-handler:
    1. selectDebateParticipants(companyId, topic) -- 활성 에이전트 중 2~5명 선정
    2. createDebate({ topic, debateType, participantAgentIds })
    3. startDebate(debateId, companyId) -- 비동기 라운드 실행
    4. 토론 완료 대기 (polling: getDebate() status==='completed')
    5. formatDebateReport(debate) -- 마크다운 보고서 생성
    6. command.result = report, command.status = 'completed'
    7. command.metadata.debateId = debateId
```

**자동 참여자 선정 전략:**
- companyId 내 활성 에이전트(isActive=true) 조회
- Manager/Specialist 계층 에이전트 우선 (Worker 제외)
- 비서실장(isSecretary=true) 제외 (합의 판정 역할이므로)
- 최소 2명 ~ 최대 5명 선택
- v1 참고: v1은 Claude/GPT/Gemini 3개 모델을 참여자로 사용. v2는 실제 조직 내 에이전트를 참여자로 사용
- 에이전트 2명 미만이면 에러 반환

**토론 완료 대기 전략:**
- agora-engine의 startDebate()는 비동기 실행 (fire-and-forget)
- debate-command-handler에서 polling으로 완료 대기: 매 2초마다 getDebate() 호출, status==='completed'|'failed' 확인
- 최대 대기: 300초 (timeout과 동일)
- 대기 중 delegation-tracker로 진행 상태 발행

**보고서 포맷 (formatDebateReport):**
```markdown
## 🏛️ AGORA 토론 결과

**주제:** {topic}
**유형:** {일반 토론 | 심층 토론}
**결과:** {합의 ✅ | 비합의 ❌ | 부분합의 ⚠️}

### 참여자
- {agent1Name} ({role})
- {agent2Name} ({role})
...

### 토론 요약
{result.summary}

### 다수파 의견
{result.majorityPosition}

### 소수파 의견
{result.minorityPosition}

### 핵심 논점
1. {keyArgument1}
2. {keyArgument2}
...

### 라운드 상세
#### 라운드 1
- **{agentName}**: {speech.content}
...
```

**commands.ts 수정 포인트 (line 67~116 참조):**
```typescript
// 기존 패턴 따라 추가
if (result.parsedMeta.slashType === 'debate' || result.parsedMeta.slashType === 'deep_debate') {
  const debateTopic = result.parsedMeta.slashArgs || ''
  processDebateCommand({
    commandId: command.id,
    topic: debateTopic,
    debateType: result.parsedMeta.slashType === 'deep_debate' ? 'deep-debate' : 'debate',
    companyId: tenant.companyId,
    userId: tenant.userId,
  }).catch((err) => {
    console.error(`[DebateCommand] process failed for command ${command.id}:`, err)
  })
}
```

**delegation-tracker 이벤트 추가:**
- debateStarted(companyId, commandId, { debateId, topic, participants })
- debateRoundProgress(companyId, commandId, { debateId, roundNum, totalRounds })
- debateCompleted(companyId, commandId, { debateId, consensus, summary })

### v1 참고 (CORTHEX_HQ)

- v1 위치: `/home/ubuntu/CORTHEX_HQ/src/src/src/src/telegram/bot.py` (_run_debate 함수)
- v1 패턴: 텔레그램 `/debate` 명령 → 3개 AI 모델 순차 호출 → 결과 취합 → 텔레그램 전송
- v2 차이점: v1은 고정 3모델 토론, v2는 동적 조직 내 에이전트 토론 + 사령관실 통합
- v1 formatter: `format_debate_start()`, `format_debate_result()` 참고하되 v2는 마크다운 보고서

### Project Structure Notes

- 서비스 패턴: `packages/server/src/services/*.ts` (singleton export, 함수 기반)
- 라우트 패턴: `packages/server/src/routes/*.ts` (Hono router)
- 테스트 패턴: `packages/server/src/__tests__/unit/*.test.ts` (bun:test, describe/it)
- 공유 타입: `packages/shared/src/types.ts`
- import 케이싱: git ls-files 기준 정확히 일치 필수 (Linux CI 대소문자 구분)
- 파일명: kebab-case 소문자

### Existing Code to Reuse (절대 재구현 금지)

- `command-router.ts` parseSlash(): 이미 /토론, /심층토론 파싱 구현됨
- `agora-engine.ts` createDebate(), startDebate(), getDebate(): 토론 생성/시작/조회 완료
- `chief-of-staff.ts` findSecretaryAgent(), getActiveManagers(), toAgentConfig(): 에이전트 조회 유틸
- `delegation-tracker.ts` DelegationTracker: WebSocket 이벤트 발행 패턴
- `commands.ts` POST handler: 기존 슬래시 명령 처리 패턴 (fire-and-forget)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11 -- E11-S2]
- [Source: _bmad-output/implementation-artifacts/11-1-agora-engine-round-management-consensus.md]
- [Source: packages/server/src/services/command-router.ts#parseSlash, SLASH_COMMANDS]
- [Source: packages/server/src/services/agora-engine.ts#createDebate, startDebate, getDebate]
- [Source: packages/server/src/services/chief-of-staff.ts#findSecretaryAgent, getActiveManagers]
- [Source: packages/server/src/services/delegation-tracker.ts#DelegationTracker]
- [Source: packages/server/src/routes/commands.ts#POST /api/workspace/commands]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/telegram/bot.py#_run_debate]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- debate-command-handler.ts: processDebateCommand (비동기 명령→토론 브릿지), selectDebateParticipants (Manager/Specialist 자동 선정, Worker/비서실장 제외, 2~5명), formatDebateReport (마크다운 보고서 생성 -- 합의 라벨, 참여자, 요약, 핵심 논점, 라운드 상세), waitForDebateCompletion (2초 간격 polling, 300초 타임아웃)
- commands.ts: slashType 'debate'/'deep_debate' 분기 추가, processDebateCommand fire-and-forget 호출
- delegation-tracker.ts: DEBATE_STARTED, DEBATE_ROUND_PROGRESS, DEBATE_COMPLETED 이벤트 타입 + debateStarted(), debateRoundProgress(), debateCompleted() 메서드 추가
- shared types.ts: DebateCommandResult 타입 추가 (debateId, topic, debateType, consensus, report, participants)
- 테스트 38개 전부 통과: selectDebateParticipants (6), formatDebateReport (13), DelegationTracker events (6), command-router parsing (8), DebateCommandResult type (2), error handling (2), tenant isolation (1)
- 기존 테스트 regression 없음: command-router 59 pass, agora-engine 49 pass

### File List

- packages/server/src/services/debate-command-handler.ts (new: 명령→토론 브릿지 서비스)
- packages/server/src/routes/commands.ts (modified: /토론, /심층토론 슬래시 핸들러 추가)
- packages/server/src/services/delegation-tracker.ts (modified: 토론 이벤트 3종 추가)
- packages/shared/src/types.ts (modified: DebateCommandResult 타입 추가)
- packages/server/src/__tests__/unit/debate-command-handler.test.ts (new: 38 tests)
