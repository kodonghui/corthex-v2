# Story 12.2: 에이전트 병렬 위임 — 동시 실행 + 개별 진행률 + 위임 체인 UI

Status: done

## Story

As a 사용자,
I want 비서가 여러 부서에 동시 위임하여 응답 시간을 줄이고, 각 위임의 진행 상황을 개별적으로 실시간 확인한다,
so that 복수 부서 관련 요청의 처리 시간이 단축되고 진행 과정을 명확히 파악할 수 있다.

## Acceptance Criteria

1. **Given** 비서 채팅에서 복수 부서 위임 **When** LLM 또는 규칙이 2개+ 부서 결정 **Then** 순차 `for` 루프 대신 `Promise.allSettled`로 병렬 실행
2. **Given** 병렬 위임 실행 중 **When** 각 에이전트 응답 완료/실패 **Then** 개별적으로 delegation-start/delegation-end WebSocket 이벤트 발행 (기존 패턴 유지)
3. **Given** 병렬 위임 중 **When** 한 위임이 실패 **Then** 다른 위임은 영향 없이 계속 실행 (격리)
4. **Given** 채팅 UI **When** 비서 위임 진행 중 **Then** 헤더에 현재 진행 중인 위임 수/전체 수 표시 (예: "3개 부서 위임 중 (2/3 완료)")
5. **Given** 채팅 위임 내역 패널 **When** 각 위임 완료 **Then** 개별 위임 결과가 실시간으로 업데이트 (완료된 것부터 표시)
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: orchestrator.ts — 병렬 위임 실행 개선 (AC: #1, #2, #3)
  - [x] LLM 분석 기반 위임: `for` 루프를 `Promise.allSettled`로 변경
  - [x] 규칙 기반 위임: `for` 루프를 `Promise.allSettled`로 변경
  - [x] 각 Promise 내에서 delegation-start/delegation-end 이벤트 개별 발행
  - [x] 실패한 위임은 `[오류]`로 결과에 포함 (기존 패턴 유지)

- [x] Task 2: 프론트엔드 — 위임 진행 상태 UI 개선 (AC: #4, #5)
  - [x] use-chat-stream.ts: delegationStatuses (Record<agentId, status>) 추가
  - [x] chat-area.tsx: 헤더에 "N개 부서 위임 중 (M/N 완료)" 표시
  - [x] chat-area.tsx: 타이핑 인디케이터에도 병렬 위임 진행률 표시

- [x] Task 3: 빌드 검증 (AC: #6)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Agent Record

### Completion Notes

- orchestrator: 규칙 기반 + LLM 기반 위임 모두 Promise.allSettled로 병렬화
- 각 Promise 내 delegation-start/delegation-end 이벤트 개별 발행 유지
- use-chat-stream: delegationStatuses (Record) 추가, 기존 delegationStatus 하위호환 유지
- chat-area: 복수 위임 시 "N개 부서 위임 중 (M/N 완료)" 표시, 단일 위임은 기존 패턴 유지

### File List

**Modified Files:**
- `packages/server/src/lib/orchestrator.ts` — for 루프 → Promise.allSettled 병렬 위임
- `packages/app/src/hooks/use-chat-stream.ts` — DelegationStatuses 타입 + delegationStatuses 상태 추가
- `packages/app/src/components/chat/chat-area.tsx` — 헤더 + 타이핑 인디케이터 병렬 진행률 표시

## Dev Notes

### 기존 인프라 활용

1. **orchestrator.ts** — orchestrateSecretary (line 303-532)
   - 2곳의 위임 for 루프: 규칙 기반(line 355-413)과 LLM 기반(line 442-515)
   - 각 루프에서 delegation DB insert → executeDelegation/executeChainDelegation → DB update
   - delegation-start/delegation-end WS 이벤트 발행
   - 결과: `delegationResults[]` 배열에 push → compileReport

2. **chat.ts** — streamTask (line 172-250)
   - `broadcastToChannel(channelKey, event)` — WS 이벤트 브로드캐스트
   - 비서 분기: `orchestrateSecretary` 호출, onEvent 콜백으로 이벤트 전달
   - 변경 필요 없음 — 이벤트 발행 순서만 병렬로 바뀌어도 WS는 정상 동작

3. **use-chat-stream.ts** — delegationStatus (line 79-95)
   - 현재: `{ targetAgentName, targetAgentId, status, durationMs }` 단일 객체
   - delegation-start → 'delegating', delegation-end → 'completed'/'failed'
   - delegation-end 시 `queryClient.invalidateQueries` 호출

4. **chat-area.tsx** — 위임 표시 (line 287-291, 308-352, 486-492)
   - 헤더: `{delegationStatus.targetAgentName}에게 위임 중...`
   - 위임 내역 패널: delegationList map → 각 위임 카드
   - 비서 상태: `"부서 위임 분석 중..."` 또는 `"{이름}에게 위임 중..."`

### 병렬 위임 설계

```typescript
// 변경 전 (순차)
for (const del of analysis.delegations) {
  const delegation = await db.insert(delegations)...
  onEvent?.({ type: 'delegation-start', ... })
  const response = await executeDelegation(...)  // 대기
  onEvent?.({ type: 'delegation-end', ... })
  delegationResults.push(...)
}

// 변경 후 (병렬)
const delegationPromises = analysis.delegations.map(async (del) => {
  const delegation = await db.insert(delegations)...
  onEvent?.({ type: 'delegation-start', ... })
  try {
    const response = await executeDelegation(...)
    onEvent?.({ type: 'delegation-end', status: 'completed', ... })
    return { departmentName, agentName, response }
  } catch (err) {
    onEvent?.({ type: 'delegation-end', status: 'failed', ... })
    return { departmentName, agentName, response: '[오류]...' }
  }
})
const settled = await Promise.allSettled(delegationPromises)
const delegationResults = settled
  .filter(s => s.status === 'fulfilled')
  .map(s => s.value)
```

### 프론트엔드 변경 설계

```typescript
// use-chat-stream.ts — 복수 위임 추적
const [delegationStatuses, setDelegationStatuses] = useState<Record<string, {
  targetAgentName: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
}>>({})

// delegation-start: 에이전트별 추가
case 'delegation-start':
  setDelegationStatuses(prev => ({
    ...prev,
    [event.targetAgentId]: { targetAgentName: event.targetAgentName, status: 'delegating' }
  }))
  break

// delegation-end: 에이전트별 업데이트
case 'delegation-end':
  setDelegationStatuses(prev => ({
    ...prev,
    [event.targetAgentId]: { targetAgentName: event.targetAgentName, status: event.status, durationMs: event.durationMs }
  }))
  queryClient.invalidateQueries({ queryKey: ['delegations', sessionId] })
  break
```

```
// 헤더 UI: "3개 부서 위임 중 (2/3 완료)"
const total = Object.keys(delegationStatuses).length
const completed = Object.values(delegationStatuses).filter(s => s.status !== 'delegating').length
→ `${total}개 부서 위임 중 (${completed}/${total} 완료)`
```

### 이전 스토리 교훈 (12-1)

- GET 라우트 순서: 고정 경로를 `:id` 파라미터 라우트보다 위에 등록
- 미사용 import 정리 필수
- try-catch 누락: 재귀 위임 실패 시 delegation 상태 업데이트 누락 수정됨
- 자기 자신 위임 금지: sourceAgentId === targetAgentId 검증 추가

### Project Structure Notes

- `packages/server/src/lib/orchestrator.ts` — for 루프 → Promise.allSettled 변경
- `packages/app/src/hooks/use-chat-stream.ts` — delegationStatus → delegationStatuses
- `packages/app/src/pages/chat-area.tsx` — 헤더 위임 진행률 표시

### References

- [Source: packages/server/src/lib/orchestrator.ts:355-413] — 규칙 기반 위임 순차 실행
- [Source: packages/server/src/lib/orchestrator.ts:442-515] — LLM 기반 위임 순차 실행
- [Source: packages/server/src/routes/workspace/chat.ts:187-200] — 비서 이벤트 콜백
- [Source: packages/app/src/hooks/use-chat-stream.ts:79-95] — delegation 이벤트 핸들러
- [Source: packages/app/src/pages/chat-area.tsx:287-291] — 위임 중 헤더 표시
- [Source: packages/app/src/pages/chat-area.tsx:308-352] — 위임 내역 패널
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:793-819] — 위임 체인 UX
