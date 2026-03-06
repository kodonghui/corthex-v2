# Story 12.3: 위임 실시간 UI — delegation-chain 컴포넌트 + 체인 이벤트 처리

Status: done

## Story

As a 사용자,
I want 비서 채팅 시 위임 체인을 실시간으로 시각적으로 확인하고, 다단계 위임 진행 과정을 한눈에 파악한다,
so that 비서가 어떤 에이전트에게 업무를 맡기고 있는지 투명하게 볼 수 있다.

## Acceptance Criteria

1. **Given** delegation-chain 이벤트 수신 **When** 3단계 이상 위임 **Then** 채팅 헤더에 화살표 체인 표시 (비서실장 → 금융분석팀장 → 리서치팀원)
2. **Given** 채팅 헤더 **When** 2단계 위임 **Then** "금융분석팀장에게 위임 중..." 인라인 표시
3. **Given** 3단계+ 체인 표시 **When** 접힌 상태 **Then** "🔀 2단계 위임 중 ▾" 표시, 클릭 시 전체 체인 펼침
4. **Given** delegation-chain 이벤트 **When** use-chat-stream 핸들러 **Then** delegationChain 상태 업데이트 (chain 배열)
5. **Given** delegation-end 이벤트 **When** 모든 위임 완료 **Then** 체인 표시 자동 해제, 원래 에이전트 정보 복귀
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: use-chat-stream.ts — delegation-chain 이벤트 핸들러 추가 (AC: #4)
  - [x] StreamEvent 타입에 'delegation-chain' 추가 + chain 필드(string[])
  - [x] delegationChain 상태 추가 (string[] | null)
  - [x] delegation-chain 이벤트: setDelegationChain(event.chain)
  - [x] done/error 이벤트: setDelegationChain(null) 초기화
  - [x] return에 delegationChain 추가

- [x] Task 2: chat-area.tsx — 위임 체인 헤더 표시 개선 (AC: #1, #2, #3, #5)
  - [x] delegationChain을 useChatStream에서 추출
  - [x] 헤더 위임 표시 로직 리팩터링:
    - chain이 3개+ → 접힌 상태: "🔀 N단계 위임 중 ▾", 클릭 시 펼침
    - chain이 2개 → "{마지막}에게 위임 중..."
    - chain이 null → 기존 delegationStatuses 기반 표시 (병렬 위임)
  - [x] 펼친 상태: 화살표 체인 + "현재 활성: {마지막}" 표시
  - [x] chainExpanded 로컬 상태로 토글

- [x] Task 3: 빌드 검증 (AC: #6)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **use-chat-stream.ts** — 현재 delegation 이벤트 처리
   - delegation-start/end: delegationStatus(단일) + delegationStatuses(복수) 동시 업데이트
   - delegation-chain 이벤트는 orchestrator.ts에서 이미 발행 중 (Story 12-1)
   - StreamEvent 타입에 'delegation-chain' 미등록 → 추가 필요

2. **orchestrator.ts** — delegation-chain 이벤트 발행 (이미 구현)
   - executeChainDelegation 내부에서 `onEvent?.({ type: 'delegation-chain', chain: [...chain] })` 발행
   - chain 배열: 에이전트 이름 순서 (예: ['비서실장', '금융분석팀장', '리서치팀원'])
   - 비서→비서 연쇄 위임 시에만 발행 (일반 위임에는 미발행)

3. **chat-area.tsx** — 현재 위임 헤더 표시 (line 287-308)
   - delegationStatuses 기반 병렬 진행률 표시 (12-2에서 구현)
   - delegation-chain 이벤트 미처리 → 연쇄 위임 체인 표시 없음

4. **chat.ts** — broadcastToChannel (line 194)
   - onEvent 콜백으로 모든 이벤트 전달 → WS 채널로 브로드캐스트
   - delegation-chain 이벤트도 자동으로 클라이언트에 도달

### UX 스펙 참조

```
// 위임 없음 또는 1단계
[아바타] 비서실장  ● online

// 2단계 위임
[아바타] 비서실장  ● online  |  금융분석팀장에게 위임 중...

// 3단계 이상 — 접힌 상태
[아바타] 비서실장  ● online  |  🔀 2단계 위임 중 ▾

// 3단계 이상 — 펼친 상태
[아바타] 비서실장  ● online
🔀 비서실장 → 금융분석팀장 → 리서치팀원
       현재 활성: 리서치팀원
```

### 구현 설계

```typescript
// use-chat-stream.ts — 새 상태
const [delegationChain, setDelegationChain] = useState<string[] | null>(null)

// delegation-chain 이벤트 핸들러
case 'delegation-chain':
  setDelegationChain(event.chain || null)
  break

// chat-area.tsx — 헤더 위임 체인 로직
const [chainExpanded, setChainExpanded] = useState(false)

// 우선순위: delegationChain > delegationStatuses > agent.role
if (delegationChain && delegationChain.length >= 3) {
  // 접힌 상태: "🔀 2단계 위임 중 ▾"
  // 펼친 상태: 전체 체인 + 현재 활성
} else if (delegationChain && delegationChain.length === 2) {
  // "금융분석팀장에게 위임 중..."
} else {
  // 기존 delegationStatuses 기반 (병렬 위임)
}
```

### 이전 스토리 교훈 (12-1, 12-2)

- GET 라우트 순서: 고정 경로를 :id보다 위에 등록
- 미사용 import/변수 정리 필수
- Promise.allSettled 결과에서 빈 배열 처리 필수
- delegation-chain 이벤트는 orchestrator.ts에서 이미 발행 중 (추가 서버 작업 불필요)

### Project Structure Notes

- `packages/app/src/hooks/use-chat-stream.ts` — delegation-chain 이벤트 핸들러 + delegationChain 상태
- `packages/app/src/components/chat/chat-area.tsx` — 헤더 체인 표시 개선

### References

- [Source: packages/server/src/lib/orchestrator.ts:243,281] — delegation-chain 이벤트 발행
- [Source: packages/app/src/hooks/use-chat-stream.ts:85-113] — delegation 이벤트 핸들러
- [Source: packages/app/src/components/chat/chat-area.tsx:287-308] — 헤더 위임 표시
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:795-819] — 위임 체인 UX 스펙
