# Story 5.1: CommandRouter + 명령 타입 분류

Status: done

## Story

As a **CEO/Human 직원 (사령관실 사용자)**,
I want **사령관실에서 입력한 명령(텍스트/@멘션/슬래시/프리셋)이 자동으로 타입별 분류되어 DB에 기록되고, 적절한 핸들러로 라우팅되는 CommandRouter 서비스**,
so that **모든 명령이 일관된 파이프라인으로 처리되고, 이후 오케스트레이션(비서실장 분류, Manager 위임 등)의 진입점이 확보된다**.

## Acceptance Criteria

1. **명령 타입 분류**: CommandRouter.classify()가 입력 텍스트를 다음 타입으로 정확히 분류
   - `direct`: 일반 텍스트 명령 (슬래시/멘션 없음)
   - `mention`: @멘션 명령 (예: "@마케팅부장 삼성전자 분석해줘")
   - `slash`: 슬래시 명령 8종 (/전체, /순차, /도구점검, /배치실행, /배치상태, /명령어, /토론, /심층토론)
   - `preset`: 프리셋 실행 명령 (presetId 포함)
   - `batch`: 배치 모드 명령 (useBatch=true)
   - `all`: /전체 명령의 별도 타입
   - `sequential`: /순차 명령의 별도 타입
   - `deepwork`: 딥워크 자율 다단계 작업

2. **@멘션 파싱**: "@에이전트이름 메시지" 형식에서 targetAgentId + 순수 텍스트 추출
   - 에이전트 이름은 DB agents 테이블에서 검증 (companyId 격리)
   - 매칭 실패 시 direct 타입으로 폴백 (멘션 텍스트는 rawText에 보존)

3. **슬래시 파싱**: "/명령어 [인자]" 형식에서 slashType + 인자 텍스트 추출
   - 8종 슬래시: /전체, /순차, /도구점검, /배치실행, /배치상태, /명령어, /토론, /심층토론
   - /전체 -> type='all', /순차 -> type='sequential'
   - /토론, /심층토론 -> type='slash', metadata.slashType='debate'|'deep_debate'
   - /도구점검, /배치실행, /배치상태, /명령어 -> type='slash', metadata.slashType 포함

4. **commands 테이블 저장**: 분류 결과를 commands 테이블에 INSERT
   - 필드: id, companyId, userId, type, text(rawText), targetAgentId, status('pending'), metadata(jsonb), createdAt
   - metadata에는 slashType, slashArgs, mentionName, presetId 등 파싱 결과 포함

5. **POST /api/commands API**: 명령 수신 엔드포인트
   - body: `{ text: string, targetAgentId?: string, presetId?: string, useBatch?: boolean }`
   - 응답: `{ success: true, data: { id, type, status, parsedMeta } }`
   - companyId/userId는 JWT에서 추출 (tenant 격리)

6. **타임아웃 메타데이터**: 명령 타입별 기본 타임아웃 설정
   - direct/mention: 60초 (NFR1)
   - all/sequential: 300초 (NFR2, 복합 명령)
   - slash(debate/deep_debate): 300초
   - 기타 slash: 30초
   - metadata.timeoutMs에 기록

## Tasks / Subtasks

- [x] Task 1: CommandRouter 서비스 구현 (AC: #1, #2, #3, #6)
  - [x] 1.1 `packages/server/src/services/command-router.ts` 생성
  - [x] 1.2 classify(text, options) 메서드: 텍스트 파싱 -> CommandType + ParsedMeta 반환
  - [x] 1.3 parseMention(text, companyId): @멘션 추출 + agents 테이블 조회로 검증
  - [x] 1.4 parseSlash(text): 슬래시 명령 8종 파싱 + slashType/args 추출
  - [x] 1.5 타입별 타임아웃 매핑 상수 정의

- [x] Task 2: Commands API 라우트 (AC: #4, #5)
  - [x] 2.1 `packages/server/src/routes/commands.ts` 생성
  - [x] 2.2 POST /api/commands: 명령 수신 -> classify -> DB insert -> 응답
  - [x] 2.3 GET /api/commands: 명령 이력 조회 (companyId 격리, 페이지네이션)
  - [x] 2.4 GET /api/commands/:id: 단일 명령 조회
  - [x] 2.5 Hono 앱에 라우트 등록

- [x] Task 3: 단위 테스트 (AC: all)
  - [x] 3.1 classify() 테스트: 모든 타입 분류 정확성
  - [x] 3.2 parseMention() 테스트: 멘션 추출/검증/폴백
  - [x] 3.3 parseSlash() 테스트: 8종 슬래시 파싱
  - [x] 3.4 API 엔드포인트 테스트: 인증/격리/CRUD
  - [x] 3.5 엣지 케이스: 빈 텍스트, 잘못된 멘션, 복합 명령

## Dev Notes

### 기존 코드 현황

**이미 존재하는 인프라:**

1. **commands 테이블** (`packages/server/src/db/schema.ts:718`):
   - 이미 정의됨: id, companyId, userId, type(commandTypeEnum), text, targetAgentId, status, result, metadata(jsonb), createdAt, completedAt
   - commandTypeEnum: ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork']
   - 인덱스: company_idx, company_user_idx, company_created_idx

2. **orchestrationTasks 테이블** (`schema.ts:737`):
   - commands와 연결 (commandId FK)
   - type: classify|delegate|execute|synthesize|review
   - 이 스토리에서는 아직 사용하지 않음 (5-2 이후)

3. **qualityReviews 테이블** (`schema.ts:758`):
   - commands와 연결 (commandId FK)
   - 이 스토리에서는 아직 사용하지 않음 (5-4)

4. **AgentRunner** (`packages/server/src/services/agent-runner.ts`):
   - LLM 호출 + 도구 실행 인프라 -- 이 스토리에서는 직접 사용 안 함
   - 5-2(ChiefOfStaff)에서 활용 예정

5. **EventBus WebSocket** (`packages/server/src/websocket/`):
   - 7채널 멀티플렉싱 -- command 채널 존재
   - 5-8(위임 체인 실시간)에서 활용 예정

6. **기존 라우트 패턴** (`packages/server/src/routes/`):
   - health.ts, auth.ts 참고하여 동일 패턴 사용
   - Hono + JWT 미들웨어 패턴

### v1 참고 (매우 중요)

**v1 명령 처리 흐름** (`/home/ubuntu/CORTHEX_HQ/web/arm_server.py`):
- 클라이언트가 WebSocket으로 `{ type: 'command', text, batch, target_agent_id }` 전송
- 서버에서 /토론, /심층토론을 startsWith로 감지 -> 별도 백그라운드 처리
- 나머지 명령은 `_process_ai_command(text, task_id, target_agent_id)` 호출
- target_agent_id가 있으면 해당 에이전트에 직접 위임

**v1 슬래시 명령 정의** (`corthex-app.js:195-203`):
```
/전체 [메시지] - 모든 팀장 동시 지시
/순차 [메시지] - 릴레이 모드
/도구점검 - 전체 도구 상태 확인
/배치실행 - 대기 중인 AI 요청 일괄 전송
/배치상태 - 배치 작업 진행 확인
/명령어 - 전체 명령어 목록
/토론 [주제] - 임원 토론 (2라운드)
/심층토론 [주제] - 심층 토론 (3라운드)
```

**v2에서 달라지는 점:**
- v1은 WebSocket에서 직접 명령 분기 -> v2는 CommandRouter 서비스가 타입 분류 후 DB 저장
- v1은 에이전트 29명 고정 -> v2는 동적 조직이므로 @멘션 시 DB agents 테이블 조회 필요
- v1은 명령 이력 없음 -> v2는 commands 테이블에 전부 기록
- v1은 target_agent_id를 클라이언트가 전송 -> v2도 동일하되, @멘션 텍스트 파싱도 서버에서 수행

### 아키텍처 제약사항

- **tenant 격리**: 모든 쿼리에 companyId WHERE 필수 (Epic 1 tenant-isolation 미들웨어 활용)
- **API 응답 표준**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **파일명**: kebab-case (`command-router.ts`, `commands.ts`)
- **테스트**: bun:test 프레임워크 사용
- **import 경로**: 실제 파일 대소문자와 일치 필수 (Linux CI)

### Project Structure Notes

- 새 파일: `packages/server/src/services/command-router.ts`
- 새 파일: `packages/server/src/routes/commands.ts`
- 수정: `packages/server/src/index.ts` (라우트 등록)
- 테스트: `packages/server/src/__tests__/unit/command-router.test.ts`

### References

- [Source: packages/server/src/db/schema.ts#commands] commands 테이블 정의
- [Source: packages/server/src/db/schema.ts#commandTypeEnum] 명령 타입 enum
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S1] 스토리 수용 기준
- [Source: _bmad-output/planning-artifacts/prd.md#FR13-FR15] 사령관실 명령 입력 요구사항
- [Source: /home/ubuntu/CORTHEX_HQ/web/arm_server.py:322-428] v1 명령 처리 흐름
- [Source: /home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js:195-203] v1 슬래시 8종 정의
- [Source: packages/server/src/services/agent-runner.ts] AgentRunner 패턴 참고
- [Source: _bmad-output/planning-artifacts/architecture.md] NFR1(60초), NFR2(5분) 타임아웃

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- All existing infrastructure (schema, enums, tables) already in place from Epic 1
- v1 command processing flow thoroughly analyzed for feature parity
- CommandRouter service: classify(), parseSlash(), parseMention(), resolveMentionAgent(), createCommand()
- Commands API: POST /api/workspace/commands, GET /api/workspace/commands, GET /api/workspace/commands/:id
- Classification priority: preset > batch > slash > @mention > targetAgentId > direct
- Timeout mapping: direct/mention=60s, slash=30s, all/sequential/debate/batch=300s
- 59 unit tests covering all 8 slash commands, mention parsing, classify logic, timeout mapping, edge cases
- No regressions introduced (pre-existing failures unrelated to this story)
- TEA: 77 additional risk-based tests added (136 total)
- Code review: slash sort longest-first, nameEn mention fallback added

### Change Log

- 2026-03-07: Story 5-1 implementation complete -- CommandRouter service + Commands API + 59 tests
- 2026-03-07: TEA: 77 risk-based tests added (136 total)
- 2026-03-07: Code review: slash sort fix, nameEn mention fallback, File List update

### File List

- packages/server/src/services/command-router.ts (NEW)
- packages/server/src/routes/commands.ts (NEW)
- packages/server/src/index.ts (MODIFIED - added commandsRoute import + registration)
- packages/server/src/__tests__/unit/command-router.test.ts (NEW)
- packages/server/src/__tests__/unit/command-router-tea.test.ts (NEW)
