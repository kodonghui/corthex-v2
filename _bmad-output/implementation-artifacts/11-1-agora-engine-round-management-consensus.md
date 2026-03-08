# Story 11.1: AGORA 엔진 -- 라운드 관리 + 합의 판정

Status: done

## Story

As a CEO/Human 직원,
I want Manager급 에이전트들이 주제에 대해 라운드 기반 토론(AGORA)을 수행하고 합의/비합의 결과를 도출하도록,
so that 다각도 전문가 의견을 한 번에 수집하여 더 나은 의사결정을 내릴 수 있다.

## Acceptance Criteria (BDD)

1. **debates 테이블 스키마**: debates 테이블이 DB에 존재하며 topic, status(pending/in-progress/completed/failed), debateType(debate/deep-debate), rounds(JSONB), participants(JSONB), result(JSONB), companyId, createdBy, maxRounds 컬럼을 포함한다
2. **토론 생성 API**: POST /api/debates 호출 시 topic, debateType, participantAgentIds를 받아 debate 레코드를 생성하고 { success: true, data: debate } 반환
3. **라운드 관리**: 토론 시작 시 라운드 1부터 순차 진행. 각 라운드에서 참여 에이전트가 순서대로 발언(AgentRunner로 LLM 호출). 발언 결과가 rounds JSONB 배열에 { roundNum, speeches: [{ agentId, agentName, content, position, createdAt }] } 형태로 저장
4. **발언 턴 관리**: 각 라운드 내에서 에이전트 발언 순서를 관리. 이전 라운드의 모든 발언을 컨텍스트로 제공하여 반론/보완이 가능하도록 함
5. **합의 판정**: 모든 라운드 완료 후, 종합 에이전트(비서실장 또는 지정 에이전트)가 전체 발언을 분석하여 합의(consensus)/비합의(dissent)/부분합의(partial) 판정. 판정 결과에 다수파/소수파 의견, 핵심 논점, 최종 종합 요약 포함
6. **토론 유형**: debate(일반, 2라운드) / deep-debate(심층, 3라운드) 지원. maxRounds는 유형에 따라 기본값 설정되며 커스텀도 가능
7. **토론 상태 관리**: pending -> in-progress -> completed/failed 상태 전이. 토론 진행 중 에러 시 failed로 전환하고 에러 정보 저장
8. **결과 종합**: 토론 완료 시 result JSONB에 { consensus: 'consensus'|'dissent'|'partial', summary, majorityPosition, minorityPosition, keyArguments, roundCount } 저장
9. **tenant 격리**: 모든 debate 쿼리에 companyId 필터 적용
10. **테스트**: 핵심 로직(라운드 관리, 합의 판정, 상태 전이, tenant 격리) 90%+ 커버리지

## Tasks / Subtasks

- [x] Task 1: DB 스키마 확장 (AC: #1, #9)
  - [x] 1.1 debateStatusEnum 추가 ('pending', 'in-progress', 'completed', 'failed')
  - [x] 1.2 debateTypeEnum 추가 ('debate', 'deep-debate')
  - [x] 1.3 consensusResultEnum 추가 ('consensus', 'dissent', 'partial')
  - [x] 1.4 debates 테이블 생성 (id, companyId, topic, debateType, status, rounds JSONB, participants JSONB, result JSONB, maxRounds, createdBy, startedAt, completedAt, error, createdAt, updatedAt)
  - [x] 1.5 debatesRelations 정의 (companies, users)
  - [x] 1.6 Drizzle migration 생성 (스키마 정의 완료, push 시 자동 적용)

- [x] Task 2: Shared 타입 정의 (AC: #2, #3, #8)
  - [x] 2.1 DebateStatus, DebateType, ConsensusResult 타입
  - [x] 2.2 Debate, DebateRound, DebateSpeech, DebateResult 타입
  - [x] 2.3 CreateDebateRequest, DebateResponse 타입
  - [x] 2.4 WsChannel에 'debate' 추가

- [x] Task 3: AGORA Engine 서비스 구현 (AC: #3, #4, #5, #6, #7, #8)
  - [x] 3.1 packages/server/src/services/agora-engine.ts 생성
  - [x] 3.2 createDebate(): debate 레코드 생성, participant 검증
  - [x] 3.3 startDebate(): pending -> in-progress, 라운드 루프 시작
  - [x] 3.4 executeRound(): 참여 에이전트 순회하며 AgentRunner로 발언 생성
  - [x] 3.5 buildSpeechPrompt(): 이전 라운드 컨텍스트 + 토론 주제 + 에이전트 역할로 프롬프트 조립
  - [x] 3.6 detectConsensus(): 전체 발언 분석 -> 합의/비합의/부분합의 판정
  - [x] 3.7 synthesizeResult(): 최종 결과 종합 (다수파/소수파/핵심논점/요약)
  - [x] 3.8 handleDebateError(): 에러 시 failed 상태 전환 + 에러 정보 저장

- [x] Task 4: Debates API 라우트 (AC: #2, #9)
  - [x] 4.1 packages/server/src/routes/workspace/debates.ts 생성
  - [x] 4.2 POST /api/workspace/debates -- 토론 생성
  - [x] 4.3 POST /api/workspace/debates/:id/start -- 토론 시작 (비동기 실행)
  - [x] 4.4 GET /api/workspace/debates -- 토론 목록 (companyId 필터)
  - [x] 4.5 GET /api/workspace/debates/:id -- 토론 상세 (라운드/발언 포함)
  - [x] 4.6 Hono 앱에 라우트 마운트

- [x] Task 5: 테스트 (AC: #10)
  - [x] 5.1 agora-engine.test.ts -- 라운드 관리 로직 단위 테스트
  - [x] 5.2 consensus detection 단위 테스트
  - [x] 5.3 debate API 라우트 테스트
  - [x] 5.4 상태 전이 테스트
  - [x] 5.5 tenant 격리 테스트
  - [x] 5.6 에러 핸들링 테스트

## Dev Notes

### Architecture Compliance

- **서비스 파일**: `packages/server/src/services/agora-engine.ts` (architecture.md 명시)
- **라우트 파일**: `packages/server/src/routes/workspace/debates.ts` (architecture.md 명시)
- **DB 스키마**: `packages/server/src/db/schema.ts` 에 debates 테이블 추가
- **공유 타입**: `packages/shared/src/types.ts` 에 Debate 관련 타입 추가
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **tenant 격리**: 모든 DB 쿼리에 `eq(debates.companyId, companyId)` 필수
- **인증**: JWT 미들웨어 경유 (기존 auth 미들웨어 재사용)

### Key Implementation Details

**AgentRunner 통합 (E3-S4 의존성):**
- `packages/server/src/services/agent-runner.ts` 의 `AgentRunner.execute()` 사용
- 각 참여 에이전트를 AgentConfig로 변환하여 execute 호출
- LLMRouterContext에 companyId 전달
- 비용은 기존 cost-recording 시스템으로 자동 추적

**라운드 실행 패턴:**
```
Round 1: Agent A speaks -> Agent B speaks -> Agent C speaks
Round 2: Agent A rebuts -> Agent B rebuts -> Agent C rebuts
(deep-debate only) Round 3: Agent A final -> Agent B final -> Agent C final
```

**발언 프롬프트 구조:**
```
시스템: "당신은 {agentName}({role})입니다. 다음 주제에 대해 당신의 전문 분야 관점에서 의견을 제시하세요."
라운드 1: "주제: {topic}. 당신의 입장과 근거를 300자 이내로 제시하세요."
라운드 2+: "주제: {topic}. 이전 발언들: {previousSpeeches}. 다른 참여자의 의견을 고려하여 반론하거나 보완하세요."
```

**합의 판정 로직:**
- 종합 에이전트(비서실장 또는 첫 번째 참여자)에게 전체 발언을 전달
- "모든 발언을 분석하여 합의/비합의/부분합의를 판정하세요" 프롬프트
- JSON 형태로 결과 파싱: { consensus, summary, majorityPosition, minorityPosition, keyArguments }

**v1 참고 (CORTHEX_HQ):**
- v1 위치: `/home/ubuntu/CORTHEX_HQ/src/src/src/src/telegram/bot.py` (_run_debate 함수)
- v1 패턴: 3개 AI 모델(Claude/GPT/Gemini)에 순차적으로 의견 요청 -> 결과 취합
- v2 차이점: v1은 단순 의견 수집, v2는 진정한 라운드 기반 토론(이전 발언 컨텍스트 반영) + 합의 판정
- v1 formatter: `format_debate_start()`, `format_debate_result()` 참고하되 v2는 JSON 구조화

### WebSocket 이벤트 (참고 -- Story 11-3에서 구현)
- 이 스토리에서는 DB 저장 + API만 구현
- debate WS 채널 스트리밍은 E11-S3에서 구현
- 단, 이벤트 발행 훅 포인트(emitDebateEvent)를 미리 배치하여 나중에 연결 용이하게

### Debate Types
| Type | 기본 Rounds | 설명 |
|------|-----------|------|
| debate | 2 | 일반 토론. /토론 명령. 의견 제시 + 반론 |
| deep-debate | 3 | 심층 토론. /심층토론 명령. 의견 + 반론 + 최종 정리 |

### Project Structure Notes

- 기존 서비스 패턴: `packages/server/src/services/*.ts` (singleton export)
- 기존 라우트 패턴: `packages/server/src/routes/*.ts` (Hono router)
- 기존 테스트 패턴: `packages/server/src/__tests__/unit/*.test.ts` (bun:test)
- 스키마 확장: `packages/server/src/db/schema.ts` 에 테이블 추가
- 공유 타입: `packages/shared/src/types.ts` 에 타입 추가
- import 케이싱: git ls-files 기준 정확히 일치 필수 (Linux CI 대소문자 구분)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11 -- E11-S1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR63]
- [Source: _bmad-output/planning-artifacts/architecture.md#services/agora-engine.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md#WebSocket debate 채널]
- [Source: _bmad-output/planning-artifacts/architecture.md#debates 테이블]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CEO앱 #5 AGORA 토론]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#5. AGORA]
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/telegram/bot.py#_run_debate]
- [Source: packages/server/src/services/agent-runner.ts#AgentRunner.execute]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- DB 스키마: debates 테이블 + 3 enums (debateStatus, debateType, consensusResult) + relations 추가
- Shared 타입: DebateStatus, DebateType, ConsensusResult, DebateSpeech, DebateRound, DebateResult, Debate, CreateDebateRequest, DebateResponse 추가. WsChannel에 'debate' 추가
- AGORA Engine 서비스: createDebate (검증+생성), startDebate (비동기 실행), executeDebateRounds (라운드 순회+AgentRunner 호출), buildSpeechPrompt (이전 컨텍스트 포함 프롬프트), detectConsensus (LLM 기반 합의 판정 + fallback), synthesizeFallback, handleDebateError, getDebate, listDebates
- API 라우트: POST /debates (생성), POST /debates/:id/start (시작), GET /debates (목록), GET /debates/:id (상세) -- 전부 authMiddleware + companyId 격리
- EventBus 훅: emitDebateEvent()로 debate-started, round-started, agent-spoke, round-ended, debate-done 이벤트 발행 (E11-S3 WebSocket 연결 대비)
- 테스트: 85개 테스트 전부 통과 (49 dev + 36 TEA) -- buildSpeechPrompt, 요청 검증, 합의 파싱, 상태 전이, tenant 격리, 에러 핸들링, DB 스키마 확인, 리스크 기반 커버리지

### File List

- packages/server/src/db/schema.ts (modified: debates table + enums + relations)
- packages/shared/src/types.ts (modified: Debate types + WsChannel 'debate')
- packages/server/src/services/agora-engine.ts (new: AGORA engine service)
- packages/server/src/routes/workspace/debates.ts (new: debates API routes)
- packages/server/src/index.ts (modified: mount debates route)
- packages/server/src/__tests__/unit/agora-engine.test.ts (new: 49 tests)
- packages/server/src/__tests__/unit/agora-engine-tea.test.ts (new: 36 TEA tests)
