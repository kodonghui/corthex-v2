# Story 18-1: Workflow CRUD API & Multistep Definition

## 1. Story Foundation
**Epic:** Epic 18 (Workflow Automation)
**Story ID:** 18-1
**Title:** Workflow CRUD API 및 다단계 스텝 정의 백엔드
**Status:** ready-for-dev

### User Story
As a CEO or Admin, I want to create, read, update, and soft-delete automation workflows with multi-step definitions, so that I can chain complex AI tasks together and run them automatically.

### Acceptance Criteria
- [ ] 워크플로우 생성 API (이름, 설명, 스텝 배열) 구현.
- [ ] 워크플로우 단건/목록 조회 API 구현.
- [ ] 워크플로우 수정 API (스텝 순서 변경, 추가, 삭제 지원) 구현.
- [ ] 워크플로우 삭제 API (실행 중이거나 스케줄된 시스템 붕괴를 막기 위해 **Soft-Delete** 적용).
- [ ] 테넌트 격리 미들웨어 (companyId 기반) 철저하게 적용.
- [ ] API 접근 권한 설정 (Admin/CEO만 수정 가능, 일반 직원은 읽기나 실행만 허용).
- [ ] **성공 지표:** API 응답 속도 < 200ms 보장, 유효성 검사 실패 시 구체적인 에러 메시지(어느 스텝의 어느 필드가 틀렸는지) 반환.

### Business Context
This is the foundational data layer for Phase 2's core "Workflow Automation" feature (#004). Without this robust CRUD and schema validation layer, the execution engine (18-2) and visual builder (18-4) cannot function. This saves CEO hours of repetitive manual command inputs.

## 2. Developer Context & Guardrails

### Technical Requirements
- 백엔드는 기존 Hono.js 서버리스 아키텍처 패턴을 따른다.
- ORM은 Drizzle을 사용하며 기존 데이터베이스 연결 풀을 재사용한다.
- **Zod Schema (Critical):** `steps` 배열은 아래의 구조를 엄격하게 따라야 한다.
  ```typescript
  const StepSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['tool', 'llm', 'condition']),
    action: z.string(), // e.g., 'real_web_search' or prompt ID
    params: z.record(z.any()).optional(),
    dependsOn: z.array(z.string().uuid()).optional() // for DAG/parallel execution
  });
  ```
- 최대 스텝 수 제한: `z.array(StepSchema).max(20)` (보안/과부하 방지).

### Database Schema (Target)
`workflows` DB 테이블:
- `id` (uuid, PK)
- `companyId` (uuid, FK) -> 테넌트 격리 필수
- `name` (varchar)
- `description` (text)
- `steps` (jsonb) -> 타입 세이프 필수
- `isActive` (boolean, default: true) -> **Soft Delete 용도**
- `createdBy` (uuid)
- `createdAt` / `updatedAt`

### Architecture Compliance
- 기존 `services/`, `routes/`, `db/schema/` 패턴 준수.
- 에러 핸들링은 전역 `ErrorHandler` 미들웨어를 통해 표준 규격으로 반환.
- RESTful 원칙: `POST /api/workflows`, `GET /api/workflows`, `PUT /api/workflows/:id`, `DELETE /api/workflows/:id` (내부적으로 is_active = false 처리).

### Testing Requirements (Negative Paths)
다음 5가지 엣지 케이스는 반드시 `bun:test`로 테스트 코드를 작성해야 한다.
1. `companyId`가 다른 워크플로우에 접근, 수정, 삭제 시도 시 403 반환.
2. 스텝 수가 20개를 초과하는 JSON 페이로드 전송 시 400 에러 및 구체적 원인 반환.
3. `steps` 배열에 필수 필드(`type`, `action`)가 누락된 경우의 Zod 400 에러 포맷 검증.
4. 존재하지 않는 workflow UUID로 PUT/DELETE 요청 시 404 처리.
5. Soft-Delete 된 워크플로우를 GET 목록 조회 시 기본적으로 노출되지 않는지 확인.

## 3. Latest Tech & Security
- JSONB 스키마를 업데이트할 때 Drizzle 마이그레이션 적용 시 주의 (단순 텍스트가 아닌 구조화된 JSON 파싱 안전성 확보).
- 사용자가 악의적인 거대한 JSON 배열을 보내 서버를 마비시키는 것을 방지하기 위해 payload size limit을 Hono 라우터 단에서 체크할 것.
