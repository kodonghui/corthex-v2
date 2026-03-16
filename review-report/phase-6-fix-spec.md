# Phase 6: Fix Spec

## Fix #1: P7 — WorkflowStep 타입 3곳 분산 → shared 통합
- **Source**: critic-architecture
- **Priority**: P7 (but must fix FIRST — other fixes depend on this)
- **File**: packages/shared/types.ts
- **Issue**: WorkflowStep defined in 3 locations with shared version missing 7 fields
- **Fix**: Update shared/types.ts WorkflowStep to include all fields (name, agentId, trueBranch, falseBranch, systemPrompt, timeout, retryCount). Export Workflow, WorkflowExecution types too.
- **Verify**: tsc --noEmit -p packages/app/tsconfig.json
- **Risk**: MEDIUM — many consumers of shared/types.ts

## Fix #2: P0 — workflows.tsx 쿼리 중복 제거 + use-queries.ts 훅 사용
- **Source**: critic-architecture, critic-ux-perf (cross-talk)
- **Priority**: P0 (most critical)
- **File**: packages/app/src/pages/workflows.tsx, packages/app/src/hooks/use-queries.ts
- **Issue**: 6 types + 7 queries duplicated inline. Query keys diverge causing cache bugs.
- **Fix**: Remove all inline types and queries from workflows.tsx. Import from use-queries.ts and @corthex/shared. Ensure query keys match.
- **Verify**: tsc --noEmit -p packages/app/tsconfig.json
- **Risk**: HIGH — large refactor of 830-line file

## Fix #3: P6 — sessionId UUID 미검증
- **Source**: critic-security
- **Priority**: P6
- **File**: packages/server/src/routes/workspace/chat.ts
- **Issue**: No UUID format validation on sessionId path param in cancel endpoint
- **Fix**: Add z.string().uuid() validation before processing
- **Verify**: tsc --noEmit -p packages/server/tsconfig.json
- **Risk**: LOW

## Fix #4: P3 — cancel TOCTOU 레이스
- **Source**: critic-security, critic-architecture
- **Priority**: P3
- **File**: packages/server/src/routes/workspace/chat.ts
- **Issue**: TOCTOU between isSessionStreaming() and cancelStreamingSession()
- **Fix**: Remove separate isSessionStreaming check. Call cancelStreamingSession directly. If returns false, return 409 "session already completed" instead of 500.
- **Verify**: tsc --noEmit -p packages/server/tsconfig.json
- **Risk**: LOW

## Fix #5: P5 — API 응답 포맷 불일치
- **Source**: critic-architecture
- **Priority**: P5
- **File**: packages/server/src/routes/workspace/chat.ts
- **Issue**: Cancel endpoint uses { success, data } but rest of file uses { data }
- **Fix**: Keep cancel endpoint's { success, data } format (matches CLAUDE.md convention). No change needed — the OTHER endpoints are the ones that should eventually be updated, but that's out of scope.
- **Verify**: N/A (no code change)
- **Risk**: NONE

## Fix #6: P4 — cancel 에러 시 무음 폴백
- **Source**: critic-security, critic-ux-perf
- **Priority**: P4
- **File**: packages/app/src/components/chat/chat-area.tsx
- **Issue**: Cancel API failure silently falls back to local stopStream() without user notification
- **Fix**: Add toast.warning in catch block: "서버 중단 실패, 로컬 스트림만 중지됨". Wrap handleCancel in useCallback.
- **Verify**: tsc --noEmit -p packages/app/tsconfig.json
- **Risk**: LOW

## Fix #7: P1 — workflows.tsx 모달 접근성
- **Source**: critic-ux-perf
- **Priority**: P1
- **File**: packages/app/src/pages/workflows.tsx
- **Issue**: Modals lack focus trap, aria-modal, aria-labelledby. Escape key doesn't close. Clickable divs have no role/tabIndex/onKeyDown.
- **Fix**: Add role="dialog", aria-modal="true", aria-labelledby on modals. Add Escape key handler. Add role="button", tabIndex={0}, onKeyDown for clickable divs.
- **Verify**: tsc --noEmit -p packages/app/tsconfig.json
- **Risk**: LOW

## Fix #8: P2 — workflows.tsx 터치 타겟 미달
- **Source**: critic-ux-perf
- **Priority**: P2
- **File**: packages/app/src/pages/workflows.tsx
- **Issue**: Back button, Edit/Delete, Accept/Reject buttons below 44px touch target
- **Fix**: Add min-h-[44px] and appropriate padding to all interactive elements
- **Verify**: tsc --noEmit -p packages/app/tsconfig.json
- **Risk**: LOW

## Execution Plan
- Batch 1: Fix #1 (shared types) — sequential, prerequisite
- Batch 2: Fix #2 (workflows refactor) — sequential, depends on Batch 1
- Batch 3-5: Fix #3-8 — parallel (server fixes + client fixes independent)
