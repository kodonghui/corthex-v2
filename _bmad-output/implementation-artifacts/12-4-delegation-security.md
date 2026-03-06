# Story 12.4: 위임 보안 강화 — 순환 감지, 권한 제어, 속도 제한

Status: done

## Story

As a 시스템 관리자,
I want 위임 규칙에 순환 참조 방지, 역할 기반 권한 제어, 속도 제한이 적용되길 원한다,
so that 악의적이거나 실수로 인한 무한 위임 루프, 무단 규칙 변경, 과도한 위임 요청을 방지할 수 있다.

## Acceptance Criteria

1. **Given** 위임 규칙 생성 시 **When** A→B→C→A 순환 경로가 존재 **Then** 400 에러 + "순환 위임 경로가 감지되었습니다" 메시지
2. **Given** 일반 유저(member 역할) **When** 위임 규칙 생성/삭제 시도 **Then** 403 에러 반환 (admin/manager만 허용)
3. **Given** 한 회사에 위임 규칙 50개 존재 **When** 추가 생성 시도 **Then** 400 에러 + "위임 규칙 최대 개수(50)를 초과했습니다"
4. **Given** 위임 실행 중 **When** 에이전트 응답이 10,000자 초과 **Then** 10,000자에서 잘라서 저장
5. **Given** 위임 규칙 변경(생성/삭제) **When** 활동 로그 기록 **Then** 변경자 ID, 변경 내용, 타임스탬프 포함 (이미 구현됨 — 검증만)
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 순환 위임 규칙 감지 (AC: #1)
  - [x] `orchestrator.ts`에 `detectCycleInDelegationRules(companyId, sourceAgentId, targetAgentId)` 함수 추가
  - [x] 위임 규칙 테이블에서 회사 전체 규칙 로드 → 방향 그래프 구성 → DFS로 순환 감지
  - [x] `agents.ts` POST delegation-rules에서 생성 전 순환 검사 호출
  - [x] 순환 감지 시 400 에러 (RULE_003 코드)

- [x] Task 2: 위임 규칙 CRUD 역할 기반 권한 (AC: #2)
  - [x] `agents.ts` POST/DELETE delegation-rules에 `tenant.role` 체크 추가
  - [x] admin, manager 역할만 허용, 그 외 403 에러 (AUTH_003 코드)

- [x] Task 3: 위임 규칙 개수 제한 (AC: #3)
  - [x] POST delegation-rules에서 현재 회사 규칙 수 COUNT 확인
  - [x] 50개 초과 시 400 에러 (RULE_004 코드)

- [x] Task 4: 위임 응답 크기 제한 (AC: #4)
  - [x] `orchestrator.ts`의 executeDelegation 응답에 `.slice(0, 10000)` 적용
  - [x] compileReport 결과에도 동일 제한 적용

- [x] Task 5: 빌드 검증 (AC: #6)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **agents.ts** — 위임 규칙 CRUD (line 172-254)
   - POST: 이미 sourceAgentId === targetAgentId 검사 + 소속 확인 있음
   - DELETE: companyId 격리 이미 적용
   - 활동 로그 이미 기록 중 (logActivity)
   - **누락:** 역할 검사, 순환 감지, 개수 제한

2. **orchestrator.ts** — 위임 실행 엔진 (512줄)
   - executeChainDelegation: depth >= 3 제한 이미 존재
   - executeDelegation: max_tokens 2048로 Anthropic 측 제한 있음
   - **누락:** 응답 문자열 길이 제한 (LLM 응답이 2048 토큰이라도 한글은 1글자=여러토큰이므로 10000자 초과 가능성 낮지만 안전장치 필요)

3. **schema.ts** — 관련 테이블
   - `agentDelegationRules` (line 548-559): companyId, sourceAgentId, targetAgentId, condition, priority, isActive
   - `delegations` (line 232-253): companyId, sessionId, parentDelegationId, depth 등

4. **authMiddleware** — tenant 객체 구조
   - `tenant.role`: 'admin' | 'manager' | 'member' (users 테이블의 role 컬럼)

### 순환 감지 알고리즘

```typescript
// DFS 기반 순환 감지
async function detectCycleInDelegationRules(
  companyId: string,
  newSourceId: string,
  newTargetId: string,
): Promise<boolean> {
  // 1. 회사 전체 활성 규칙 로드
  const rules = await db.select(...)...

  // 2. 인접 리스트 구성 (source → [targets])
  const graph = new Map<string, string[]>()
  for (const r of rules) { ... }

  // 3. 새 규칙 추가
  graph.get(newSourceId)?.push(newTargetId) 또는 새 항목

  // 4. newTargetId에서 DFS → newSourceId 도달 가능하면 순환
  const visited = new Set<string>()
  function dfs(node: string): boolean { ... }
  return dfs(newTargetId)
}
```

### 이전 스토리 교훈 (12-1, 12-2, 12-3)

- GET 라우트 순서: 고정 경로를 :id보다 위에 등록
- 미사용 import/변수 정리 필수
- Promise.allSettled 결과에서 빈 배열 처리 필수
- db.transaction() 래핑 잊지 말 것 (11-6 코드리뷰 수정)

### Project Structure Notes

- `packages/server/src/routes/workspace/agents.ts` — 위임 규칙 CRUD (보안 강화 대상)
- `packages/server/src/lib/orchestrator.ts` — 위임 실행 엔진 (응답 크기 제한 대상)

### References

- [Source: packages/server/src/routes/workspace/agents.ts:172-254] — 위임 규칙 CRUD
- [Source: packages/server/src/lib/orchestrator.ts:158-201] — matchDelegationRules
- [Source: packages/server/src/lib/orchestrator.ts:206-298] — executeChainDelegation
- [Source: packages/server/src/db/schema.ts:547-559] — agentDelegationRules 테이블
