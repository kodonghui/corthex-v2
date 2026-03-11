# Story 7.4: Cascade 규칙 + 삭제 방지

Status: done

## Story

As a 관리자,
I want 비서 삭제가 방지되고, 부서 삭제 시 에이전트가 안전하게 처리되는 것을,
so that 실수로 핵심 구조를 파괴하지 않는다.

## Acceptance Criteria

1. **비서 삭제 방지**: isSecretary=true 에이전트 삭제 시도 → ORG_SECRETARY_DELETE_DENIED 에러 (HTTP 403)
2. **부서 삭제 cascade**: 부서 삭제 시 소속 에이전트 → departmentId = null (미할당) but **isActive 유지** (비활성화하지 않음)
3. **에이전트 삭제 시 세션 체크**: 진행 중 세션(orchestrationTasks pending/running) → 세션 정보 반환 (프론트엔드 모달용)
4. **강제 삭제 옵션**: force=true 쿼리 파라미터 전달 시 진행 중 세션 무시하고 즉시 soft delete
5. **프론트엔드 삭제 확인 모달**: "이 에이전트는 현재 N개 세션이 진행 중입니다" 표시 + 강제 삭제 옵션

## Tasks / Subtasks

- [x] Task 1: 부서 cascade 행동 수정 (AC: #2)
  - [x] 1.1 `organization.ts` executeCascade() — 에이전트 업데이트에서 `isActive: false` 제거, `departmentId: null`만 유지
  - [x] 1.2 `status: 'offline'` 제거 — 에이전트 상태 보존

- [x] Task 2: 에이전트 삭제 시 세션 체크 추가 (AC: #3, #4)
  - [x] 2.1 `organization.ts` deactivateAgent() — orchestrationTasks에서 pending/running 작업 수 카운트
  - [x] 2.2 활성 세션 있고 force=false → 에러 응답 + activeTaskCount 정보 반환
  - [x] 2.3 활성 세션 있고 force=true → 기존대로 soft delete 진행
  - [x] 2.4 `routes/admin/agents.ts` DELETE — `force` 쿼리 파라미터 파싱 + deactivateAgent에 전달

- [x] Task 3: 프론트엔드 에이전트 삭제 모달 개선 (AC: #5)
  - [x] 3.1 `admin/src/pages/agents.tsx` — 삭제 클릭 시 활성 세션 수 API 조회
  - [x] 3.2 모달에 세션 수 표시 + "강제 비활성화" 체크박스 옵션 추가
  - [x] 3.3 비서 에이전트 삭제 시도 시 에러 메시지 처리 (이미 구현됨, UI 에러 핸들링 확인)

- [x] Task 4: 프론트엔드 부서 삭제 모달 메시지 업데이트 (AC: #2 관련)
  - [x] 4.1 `admin/src/pages/departments.tsx` — preservation notice에 "에이전트는 활성 상태 유지" 메시지 반영

- [x] Task 5: 테스트 (AC: 전체)
  - [x] 5.1 단위 테스트: cascade에서 에이전트 isActive 유지 확인
  - [x] 5.2 단위 테스트: 세션 체크 + force 옵션 동작 확인
  - [x] 5.3 단위 테스트: 비서 삭제 방지 (이미 구현 — 회귀 테스트)

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지!)

**이미 동작하는 기능 (건드리지 마라!):**
1. **비서 삭제 방지** — `deactivateAgent()` organization.ts 라인 420-421 이미 ORG_SECRETARY_DELETE_DENIED 반환
2. **시스템 에이전트 보호** — `deactivateAgent()` organization.ts 라인 415-416 이미 AGENT_003 반환
3. **Cascade 분석** — `analyzeCascade()` organization.ts 라인 477-573 완전 동작
4. **Cascade 실행** — `executeCascade()` organization.ts 라인 584-701 완전 동작 (mode=force/wait_completion)
5. **부서 삭제 라우트** — `departments.ts` DELETE 이미 cascade mode 지원
6. **에이전트 삭제 라우트** — `agents.ts` DELETE 이미 존재
7. **Admin 에이전트 페이지** — `admin/src/pages/agents.tsx` 이미 deactivate 모달 있음
8. **Admin 부서 페이지** — `admin/src/pages/departments.tsx` 이미 cascade 모달 + impact 분석 있음

### 수정이 필요한 부분 (딱 이것만!)

**1. `packages/server/src/services/organization.ts` — executeCascade() 수정**
- **현재 코드** (라인 643-649):
  ```typescript
  await db.update(agents).set({
    departmentId: null,
    isActive: false,    // ← 이 줄 제거!
    status: 'offline',  // ← 이 줄 제거!
    updatedAt: new Date(),
  })
  ```
- **수정 후**: `departmentId: null`, `updatedAt: new Date()` 만 남김
- `executeCascade` 반환 메시지도 "에이전트 N명 미배속 전환" (비활성화 아님) 확인

**2. `packages/server/src/services/organization.ts` — deactivateAgent() 수정**
- 현재: 비서/시스템 체크 → 즉시 soft delete
- **추가 로직**: 비서/시스템 체크 후, orchestrationTasks에서 해당 에이전트의 pending/running 작업 수 카운트
  ```typescript
  // 이 로직 추가 (비서/시스템 체크 이후)
  const [taskResult] = await db
    .select({ cnt: count() })
    .from(orchestrationTasks)
    .where(and(
      withTenant(orchestrationTasks.companyId, tenant.companyId),
      eq(orchestrationTasks.agentId, agentId),
      inArray(orchestrationTasks.status, ['pending', 'running']),
    ))
  const activeTaskCount = Number(taskResult?.cnt ?? 0)

  if (activeTaskCount > 0 && !force) {
    return {
      error: {
        status: 409,
        message: `이 에이전트는 현재 ${activeTaskCount}개 세션이 진행 중입니다`,
        code: 'AGENT_ACTIVE_SESSIONS',
      },
      data: { activeTaskCount },
    }
  }
  ```
- `deactivateAgent` 시그니처에 `force?: boolean` 파라미터 추가

**3. `packages/server/src/routes/admin/agents.ts` — DELETE 수정**
- 현재 (라인 98-104):
  ```typescript
  agentsRoute.delete('/agents/:id', async (c) => {
    const tenant = c.get('tenant')
    const id = c.req.param('id')
    const result = await deactivateAgent(tenant, id)
  ```
- **수정**: `force` 쿼리 파라미터 파싱
  ```typescript
  const forceParam = c.req.query('force')
  const force = forceParam === 'true'
  const result = await deactivateAgent(tenant, id, force)
  ```

**4. `packages/admin/src/pages/agents.tsx` — 삭제 모달 개선**
- 현재: 단순 확인 모달 (라인 794-838)
- **추가**:
  - 삭제 클릭 시 먼저 `DELETE /admin/agents/:id` 호출 (force 없이)
  - 409 + AGENT_ACTIVE_SESSIONS 응답이면 → 세션 수 표시 + "강제 비활성화" 옵션 제공
  - 강제 비활성화 클릭 → `DELETE /admin/agents/:id?force=true` 재호출
  - 또는: 삭제 버튼 클릭 → 별도 활성 세션 조회 API → 모달에 반영
  - **더 나은 접근**: deactivateTarget 설정 시 활성 세션 수도 조회하여 모달에 표시

**5. `packages/admin/src/pages/departments.tsx` — preservation notice 수정**
- 라인 449-453 메시지 업데이트:
  - "에이전트는 미배속으로 전환됩니다" → "에이전트는 미배속으로 전환되지만 **활성 상태가 유지**됩니다"

### 아키텍처 준수 사항

1. **API 응답 형식** (CLAUDE.md): `{ success: true, data }` / `{ success: false, error: { code, message } }`
2. **파일명 규칙**: kebab-case lowercase
3. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로
4. **Import**: `git ls-files` 케이싱 정확히 매칭 (Linux CI case-sensitive)
5. **에러 코드**: AGENT_ACTIVE_SESSIONS (새로 추가) — 기존: AGENT_001(Not Found), AGENT_002(Duplicate Name), AGENT_003(System Agent), ORG_SECRETARY_DELETE_DENIED
6. **Soft delete**: 항상 isActive=false, 하드 삭제 절대 안함
7. **DB 접근**: `withTenant()`, `scopedWhere()` 등 tenant helper 사용 (직접 db import는 비즈니스 로직에서 금지하나 organization.ts는 서비스 레이어이므로 직접 db import 기존 패턴 따름)
8. **멀티테넌시**: 모든 쿼리에 companyId 스코핑 필수

### DB 스키마 참고 (변경 불필요)

```
agents: id(uuid), companyId(uuid FK), departmentId(uuid FK nullable), name(varchar 100),
        isSecretary(bool), isSystem(bool), isActive(bool), status(enum: online|working|error|offline),
        tier(enum: manager|specialist|worker), ...

orchestrationTasks: id(uuid), companyId(uuid FK), agentId(uuid FK), status(enum: pending|running|completed|failed|cancelled),
                    parentTaskId(uuid nullable), type(varchar), input(jsonb), output(jsonb), ...

departments: id(uuid), companyId(uuid FK), name(varchar), isActive(bool), ...
```

### 이전 스토리에서 배운 것 (Story 7.2 Intelligence)

- 백엔드는 대부분 이미 구현됨 — 최소한의 수정만
- Admin UI 패턴: TanStack Query + 모달 + toast notification (기존 패턴 그대로 확장)
- agents.tsx 이미 842줄 규모 — 최소한의 변경으로 세션 체크 추가
- departments.tsx cascade 모달이 이미 매우 잘 되어있음 — preservation notice만 수정
- 에러 응답에 추가 데이터(activeTaskCount) 포함 가능 — data 필드로

### Git Intelligence (최근 커밋 패턴)

```
2841249 feat: Story 11.3 SketchVibe AI 실시간 편집
85fb31d feat: Story 7.2 에이전트 CRUD + Soul 편집
ed2e226 feat: Story 11.2 SketchVibe MCP 서버 분리
```
- 커밋 메시지: `feat: Story X.Y 제목 — 변경 요약 + N tests`
- 파일 구조: 기존 파일 수정 위주 (새 파일 최소화)

### Project Structure Notes

- `packages/server/src/services/organization.ts` — MODIFY: executeCascade + deactivateAgent
- `packages/server/src/routes/admin/agents.ts` — MODIFY: force 쿼리 파라미터 추가
- `packages/admin/src/pages/agents.tsx` — MODIFY: 삭제 모달에 세션 체크 추가
- `packages/admin/src/pages/departments.tsx` — MODIFY: preservation notice 메시지 업데이트
- `packages/server/src/__tests__/unit/story-7-4-cascade-delete-protection.test.ts` — NEW: 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7, Story 7.4]
- [Source: _bmad-output/implementation-artifacts/7-2-agent-crud-api-ui-soul-edit.md — 이전 스토리 패턴]
- [Source: packages/server/src/services/organization.ts — executeCascade (라인 584-701), deactivateAgent (라인 402-448)]
- [Source: packages/server/src/routes/admin/agents.ts — DELETE /agents/:id (라인 97-104)]
- [Source: packages/admin/src/pages/agents.tsx — deactivate 모달 (라인 793-838)]
- [Source: packages/admin/src/pages/departments.tsx — cascade 모달 + preservation notice (라인 329-483)]
- [Source: packages/server/src/db/schema.ts — agents, orchestrationTasks 테이블]
- [Source: CLAUDE.md — API 응답 형식, 에러 코드, soft delete]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: executeCascade()에서 에이전트 isActive/status 변경 제거 → departmentId=null만 설정
- Task 2: deactivateAgent()에 active session check 추가 + force 파라미터 + AGENT_ACTIVE_SESSIONS 에러 코드
- Task 3: agents.tsx 삭제 모달에 세션 경고 + 강제 비활성화 체크박스 추가
- Task 4: departments.tsx preservation notice에 "활성 상태 유지" 메시지 반영
- Task 5: 14개 단위 테스트 작성 (cascade, session check, force option, error patterns)
- tsc --noEmit 통과 (server + admin 모두)

### Change Log

- 2026-03-11: Story 7.4 구현 완료
  - Backend: executeCascade() — agents에서 isActive: false, status: 'offline' 제거
  - Backend: deactivateAgent() — force 파라미터 추가 + orchestrationTasks 세션 체크
  - Backend: DELETE /agents/:id — force 쿼리 파라미터 파싱 + AGENT_ACTIVE_SESSIONS 409 응답
  - Frontend: agents.tsx — 삭제 모달에 세션 경고 + 강제 비활성화 옵션
  - Frontend: departments.tsx — preservation notice 메시지 업데이트
  - Tests: 14개 단위 테스트

### File List

- `packages/server/src/services/organization.ts` — MODIFIED: executeCascade cascade behavior + deactivateAgent session check + countActiveTasks helper
- `packages/server/src/routes/admin/agents.ts` — MODIFIED: force query param + AGENT_ACTIVE_SESSIONS 409 response
- `packages/admin/src/lib/api.ts` — MODIFIED: ApiError class with code + data fields
- `packages/admin/src/pages/agents.tsx` — MODIFIED: deactivate modal with session warning + force option + ApiError handling
- `packages/admin/src/pages/departments.tsx` — MODIFIED: preservation notice message update
- `packages/server/src/__tests__/unit/story-7-4-cascade-delete-protection.test.ts` — NEW: 34 unit tests
