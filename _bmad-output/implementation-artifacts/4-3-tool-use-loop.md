# Story 4.3: Tool Use Loop

Status: done

## Story

As a 일반 직원(유저),
I want 채팅에서 에이전트가 도구를 사용한 내역을 확인하고, 도구 호출 중 오류가 발생해도 대화가 중단되지 않는다,
so that 에이전트가 어떤 도구를 사용했는지 투명하게 확인하고, 안정적인 채팅 경험을 가질 수 있다.

## Acceptance Criteria

1. **Given** 에이전트가 도구를 사용한 메시지 **When** 채팅 이력에 표시 **Then** 메시지 버블 안에 도구 호출 카드가 인라인으로 표시됨 (스트리밍 이후에도 유지)
2. **Given** 도구 호출 카드 **When** 완료된 카드 클릭 **Then** 도구 입력(input)과 결과(output)를 접기/펼치기로 확인 가능
3. **Given** 도구 실행 중 오류 발생 **When** executeTool이 실패 **Then** 에이전트가 오류 내용을 인지하고 다음 라운드에서 사용자에게 안내 (대화 중단 안 됨)
4. **Given** 도구 실행 시간이 30초 초과 **When** 타임아웃 **Then** 자동으로 tool-end(error) 이벤트 발생, "도구 응답 시간 초과" 메시지
5. **Given** 세션 상세 **When** 도구 호출 이력 조회 **Then** GET /sessions/:sessionId/tool-calls API로 해당 세션의 모든 도구 호출 기록 반환
6. **Given** 도구 호출 기록 **When** DB 저장 **Then** tool_calls 테이블에 companyId, sessionId, agentId, toolId, toolName, input, output, status, duration_ms 기록
7. **Given** 도구 루프 5회 초과 **When** MAX_TOOL_ROUNDS 도달 **Then** 스트리밍 이벤트로 "도구 호출 횟수 제한에 도달했습니다" 안내 + done 이벤트

## Tasks / Subtasks

- [x] Task 1: 서버 — tool_calls 테이블에 duration_ms 컬럼 추가 + executeTool 타임아웃 (AC: #4, #6)
  - [x]schema.ts: tool_calls에 `durationMs: integer('duration_ms')` 컬럼 추가
  - [x]`drizzle-kit generate` 마이그레이션 생성
  - [x]tool-executor.ts: executeTool에 30초 타임아웃 래퍼 추가 — `Promise.race([실행, timeout(30000)])`
  - [x]executeTool 결과에 durationMs 기록 — 시작/종료 시간 차이 계산
- [x] Task 2: 서버 — tool-end 이벤트에 입력 정보 추가 + 스트리밍 tool loop 강화 (AC: #1, #3, #7)
  - [x]ai.ts의 generateAgentResponseStream: tool-start 이벤트에 `input` 필드 추가 (JSON string, 200자 잘림)
  - [x]ai.ts의 generateAgentResponseStream: tool-end 이벤트에 `durationMs` 필드 추가
  - [x]MAX_TOOL_ROUNDS 초과 시 텍스트로 "도구 호출 횟수 제한(5회)에 도달했습니다" 토큰 이벤트 전송 후 done
  - [x]도구 실행 오류 시 tool-end에 `error: true` 필드 추가하여 UI 표시 차별화
- [x] Task 3: 서버 — GET /sessions/:sessionId/tool-calls API (AC: #5)
  - [x]chat.ts에 새 엔드포인트 추가: 세션 소유권 확인 + tool_calls 조회
  - [x]반환 필드: id, toolName, input, output, status, durationMs, createdAt
  - [x]정렬: createdAt ASC
- [x] Task 4: 프론트엔드 — ToolCallCard 강화 (AC: #1, #2, #4)
  - [x]tool-call-card.tsx: 펼침 시 input(요청)과 result(응답) 모두 표시
  - [x]에러 상태 카드: `❌ {toolName} 실패` + 빨간 테두리
  - [x]타임아웃 카드: `⏱ {toolName} 시간 초과` 표시
  - [x]durationMs 표시: 완료 카드에 "(0.8초)" 같은 소요시간 표시
- [x] Task 5: 프론트엔드 — 저장된 메시지에서 도구 호출 카드 표시 (AC: #1, #2)
  - [x]chat-area.tsx: 에이전트 메시지의 `---\n🔧 **도구 호출 내역:**` 구분자 대신 tool_calls API로 실제 카드 표시
  - [x]useQuery로 세션별 tool-calls 로드 (세션 전환 시 갱신)
  - [x]각 메시지의 createdAt과 tool_calls의 createdAt 매칭으로 메시지별 도구 호출 연결
- [x] Task 6: 빌드 + 기존 테스트 통과 확인
  - [x]`turbo build` 3/3 성공
  - [x]`bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: 스트리밍 도구 카드와 저장된 도구 카드의 통합

Story 4-2에서 스트리밍 중 ToolCallCard를 표시하지만, `done` 이벤트 후 메시지가 확정되면 도구 카드가 사라지고 텍스트에 `--- 🔧 도구 호출 내역:` 형태의 평문으로만 남는 문제가 있음. 이 스토리에서 tool_calls 테이블을 활용하여 확정된 메시지에서도 동일한 ToolCallCard UI를 표시.

### 현재 도구 호출 흐름

```
1. ai.ts generateAgentResponseStream() → tool_use 블록 감지
2. tool-start 이벤트 브로드캐스트
3. tool-executor.ts executeTool() 실행 → tool_calls 테이블에 기록
4. tool-end 이벤트 브로드캐스트 (result만 전달)
5. 최종 메시지에 "---\n🔧 도구 호출 내역:" 형태의 텍스트 추가
```

### 변경 후 흐름

```
1. 동일
2. tool-start 이벤트에 input 포함 { type: 'tool-start', toolName, toolId, input: '...' }
3. executeTool()에 타임아웃 + durationMs 기록
4. tool-end 이벤트에 durationMs + error 포함
5. 최종 메시지 텍스트에 도구 요약 제거 → 대신 tool_calls API로 UI 렌더링
```

### 메시지-도구 호출 매칭 전략

tool_calls 테이블에는 sessionId + createdAt이 있고, chatMessages에도 sessionId + createdAt이 있음. 에이전트 메시지의 createdAt 직전에 생성된 tool_calls를 해당 메시지에 연결.

간단한 방법: tool_calls API 응답 전체를 로드 후, 각 에이전트 메시지의 createdAt 기준 이전~다음 유저 메시지 사이의 tool_calls를 필터링.

### executeTool 타임아웃 패턴

```typescript
const TOOL_TIMEOUT_MS = 30_000

async function executeToolWithTimeout(...): Promise<string> {
  const start = Date.now()
  try {
    const result = await Promise.race([
      executeTool(name, input, ctx, record),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TOOL_TIMEOUT')), TOOL_TIMEOUT_MS)
      ),
    ])
    return result
  } catch (err) {
    if (err.message === 'TOOL_TIMEOUT') {
      return '[오류] 도구 응답 시간이 초과되었습니다 (30초)'
    }
    throw err
  } finally {
    const durationMs = Date.now() - start
    // DB에 durationMs 업데이트
  }
}
```

### ToolCallCard 강화 디자인

```
// 성공 (펼친 상태)
┌────────────────────────────────────┐
│ ✅ search_web          (1.2초) ▾  │
│ ──────────────────────────────────│
│ 📥 요청: {"query": "삼성전자"}      │
│ 📤 결과: [{"title": "삼성전자..."}] │
└────────────────────────────────────┘

// 에러
┌────────────────────────────────────┐
│ ❌ search_web 실패       (30초) ▾ │  ← border-red
│ ──────────────────────────────────│
│ 📥 요청: {"query": "..."}          │
│ 📤 오류: 도구 응답 시간 초과         │
└────────────────────────────────────┘

// 타임아웃 (접힌 상태)
┌────────────────────────────────────┐
│ ⏱ calculate 시간 초과        ▸    │
└────────────────────────────────────┘
```

### 기존 코드 변경 주의사항

- **tool-executor.ts 호환성 유지**: `executeTool` 시그니처 변경 없이 래퍼로 타임아웃 추가. `generateAgentResponse`(동기 버전)도 동일한 executeTool 사용.
- **에이전트 메시지 텍스트에서 도구 요약 제거**: `generateAgentResponse`(동기)의 도구 요약은 유지 (비서 오케스트레이터 등에서 사용). `generateAgentResponseStream`(스트리밍)에서만 도구 요약 텍스트 제거.
- **chat-area.tsx 기존 toolContent 파싱**: 이전 메시지의 `---\n🔧 도구 호출 내역:` 텍스트는 하위호환을 위해 여전히 fallback 표시 (API 없는 구버전 메시지).
- **StreamEvent 타입 확장**: shared 패키지가 아닌 서버/프론트 각각의 로컬 타입이므로 양쪽 모두 업데이트 필요.

### 주요 파일 구조

```
packages/server/src/
├── db/schema.ts                   ← tool_calls에 durationMs 추가
├── lib/tool-executor.ts           ← 타임아웃 래퍼 추가
├── lib/ai.ts                      ← tool event 필드 확장
├── routes/workspace/chat.ts       ← GET /tool-calls API 추가
packages/app/src/
├── components/chat/tool-call-card.tsx  ← input/error/duration 표시
├── components/chat/chat-area.tsx      ← tool-calls API 연동
├── hooks/use-chat-stream.ts           ← StreamEvent 타입 확장
```

### References

- [Source: packages/server/src/lib/tool-executor.ts] — 현재 도구 실행 엔진
- [Source: packages/server/src/lib/ai.ts] — generateAgentResponseStream (Story 4-2 구현)
- [Source: packages/server/src/db/schema.ts#tool_calls] — 도구 호출 기록 테이블
- [Source: packages/app/src/components/chat/tool-call-card.tsx] — 현재 ToolCallCard (Story 4-2)
- [Source: packages/app/src/components/chat/chat-area.tsx] — 채팅 영역 (Story 4-2 구현)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.4] — 도구 호출 토글 카드 디자인
- [Source: _bmad-output/implementation-artifacts/4-2-streaming-chat-ui.md] — 스트리밍 구현 참조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

### File List
