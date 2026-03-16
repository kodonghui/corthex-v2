# Code Review Verdict: CHANGES REQUESTED

## Score: 7.0/10
- Security: 7/10 (weight 3x) = 21
- Architecture: 7/10 (weight 2x) = 14
- UX & Performance: 7/10 (weight 1x) = 7
- **Weighted total: 42/6 = 7.0**

## Risk Classification: Ask (score: 68)

## Phase 1 (Static): PASS
- tsc (app): 0 errors
- tsc (server): 0 errors
- ESLint: SKIPPED (no config)
- Tests: 18,632 pass / 1,568 fail (pre-existing, unrelated)
- Bundle: not measured

## Phase 2 (Visual): SKIPPED
- Playwright not configured in project

---

## Critical Issues (8) — Must fix before next release

### P0: workflows.tsx 쿼리 중복 + 캐시 불일치 (3 critics 공통)
- **file:** `packages/app/src/pages/workflows.tsx` lines 94-165
- **what:** 6개 타입 + 7개 useQuery/useMutation이 `use-queries.ts`와 중복 선언. 쿼리 키 불일치 (`['workflows']` vs `['workflows', page, limit]`)로 캐시 무효화 버그 발생
- **fix:** inline 쿼리 삭제 → `use-queries.ts` 훅 import 사용. 타입은 `@corthex/shared`로 통합

### P1: workflows.tsx 접근성 결함 (UX)
- **file:** `packages/app/src/pages/workflows.tsx`
- **what:** 모달 focus trap 없음, `aria-modal` 누락, 클릭 가능 div에 `role="button"` + `tabIndex` + `onKeyDown` 없음, Escape 키 미지원
- **fix:** focus trap 추가, ARIA 속성 보강, 키보드 네비게이션 구현

### P2: workflows.tsx 터치 타겟 미달 (UX)
- **file:** `packages/app/src/pages/workflows.tsx`
- **what:** "← 목록" 버튼, Edit/Delete 버튼, Accept/Reject 버튼 모두 44px 미만
- **fix:** `min-h-[44px]` + 적절한 패딩 추가

### P3: cancel TOCTOU 레이스 (Security + Architecture)
- **file:** `packages/server/src/routes/workspace/chat.ts` lines 450-454
- **what:** `isSessionStreaming()` → `cancelStreamingSession()` 사이에 세션 종료 가능 → 잘못된 500 에러
- **fix:** 분리 체크 제거, `cancelStreamingSession` 단일 호출 + false면 409 "session already completed"

### P4: cancel 에러 시 무음 폴백 (Security + UX)
- **file:** `packages/app/src/components/chat/chat-area.tsx` lines 242-244
- **what:** cancel API 실패 시 `stopStream()` 호출하지만 사용자 알림 없음. 서버는 계속 생성 (비용 낭비)
- **fix:** `toast.warning('서버 중단 실패, 로컬 스트림만 중지됨')` 추가

### P5: API 응답 포맷 불일치 (Architecture)
- **file:** `packages/server/src/routes/workspace/chat.ts`
- **what:** cancel 엔드포인트만 `{ success, data }` 사용, 같은 파일의 다른 엔드포인트는 `{ data }` 패턴
- **fix:** 파일 내 일관성 유지 (CLAUDE.md 기준 `{ success, data }` 표준이므로 다른 엔드포인트도 맞추거나, cancel만 맞추기)

### P6: sessionId UUID 미검증 (Security)
- **file:** `packages/server/src/routes/workspace/chat.ts` line 437
- **what:** sessionId path param에 UUID 포맷 검증 없음
- **fix:** `z.string().uuid()` 검증 추가

### P7: WorkflowStep 타입 3곳 분산 (Architecture)
- **file:** `shared/types.ts`, `use-queries.ts`, `workflows.tsx`
- **what:** WorkflowStep가 3곳에서 다르게 정의됨. shared 버전에 7개 필드 누락
- **fix:** `@corthex/shared` WorkflowStep 업데이트 → 나머지 2곳에서 import

---

## Suggestions (6) — Recommended improvements

1. **Toast 스팸 방지** (`ws-store.ts`): 연결 불안정 시 disconnect/reconnect 토스트 디바운싱 + toast ID 중복 제거
2. **Cancel 미드스트림 전파** (`ai.ts`): tool 실행 중에도 cancel 체크, `stream.controller.abort()` 사용
3. **workflows.tsx 파일 분할**: 830줄 → 4개 파일 (`index.tsx`, `workflow-form-modal.tsx`, `execution-card.tsx`, `delete-confirm-modal.tsx`)
4. **handleCancel useCallback** (`chat-area.tsx`): 매 렌더마다 새 함수 생성 방지
5. **에러 메시지 새니타이징** (`ai.ts`): 내부 에러 → 클라이언트에 generic 메시지만 전달
6. **encodeURIComponent** (`use-queries.ts`): URL 경로에 삽입되는 ID 인코딩

---

## Praise (8) — Well done

1. **E8 경계 준수**: cancel 로직이 `lib/ai.ts`에 정확히 위치 (engine 미침범)
2. **세션 소유권 검증**: cancel API에서 companyId + userId 기반 인가 확인
3. **스마트 reconnect guard**: `wasDisconnected` 플래그로 초기 연결 시 토스트 방지
4. **반응형 레이아웃 일관성**: 18개 페이지에 동일한 spacing 패턴 적용
5. **Sovereign Sage 디자인 시스템 준수**: 색상, 타이포그래피, 간격 일관적
6. **워크플로우 UX**: 단계 시각화, 20단계 제한, 자동 체이닝, 스켈레톤 로딩
7. **Cancel 조건부 렌더링**: 스트리밍 중에만 표시, spinner 피드백
8. **use-queries.ts 훅 패턴**: compound mutation 훅 추상화가 깔끔

---

## Cross-Talk Summary

3 critics 공통 지적:
1. **workflows.tsx 쿼리/타입 중복** — Security(defense-in-depth), Architecture(DRY), UX-Perf(cache bug) 모두 지적
2. **cancel 에러 무음** — Security(비용 낭비), UX(사용자 혼란) 동시 지적
3. **TOCTOU 레이스** — Security + Architecture 동시 지적

## Action Required
8개 Critical issues 수정 후 재리뷰 (Phase 4만 재실행).
Priority: P0 (쿼리 중복) > P1-P2 (접근성) > P3-P6 (서버) > P7 (타입)
