# Story 8.2: 도구 정의 API 고도화 — handler/inputSchema CRUD + 관리 UI 확장

Status: done

## Story

As a 관리자,
I want 도구 정의에 handler, inputSchema를 설정/수정하고, 관리 UI에서 도구의 전체 설정을 편집한다,
so that 코드 배포 없이 도구 정의를 관리하고 에이전트에 할당할 수 있다.

## Acceptance Criteria

1. **Given** POST /api/admin/tools **When** handler, inputSchema 포함 **Then** 도구 생성 + 핸들러 등록 여부 경고 반환
2. **Given** PUT /api/admin/tools/:id **When** 도구 정의 수정 **Then** name, description, handler, inputSchema, config, isActive 업데이트 가능
3. **Given** GET /api/admin/tools/:id **When** 개별 도구 조회 **Then** 모든 필드 + 핸들러 등록 여부 (handlerRegistered: boolean) 반환
4. **Given** 관리 UI 도구 목록 **When** 도구 클릭 **Then** handler, inputSchema JSON 에디터, isActive 토글 표시
5. **Given** 관리 UI 도구 생성 **When** handler, inputSchema 입력 **Then** API로 전달되어 저장
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x]Task 1: Admin API — POST /tools에 handler, inputSchema 필드 추가 (AC: #1)
  - [x]createToolSchema에 handler (string, optional), inputSchema (json, optional) 추가
  - [x]응답에 `handlerRegistered: boolean` 필드 추가 (registry.get(handler) 존재 여부)

- [x]Task 2: Admin API — PUT /tools/:id 엔드포인트 추가 (AC: #2)
  - [x]updateToolSchema: name?, description?, handler?, inputSchema?, config?, isActive?
  - [x]도구 존재 확인 후 업데이트, 404 처리

- [x]Task 3: Admin API — GET /tools/:id 개별 조회 (AC: #3)
  - [x]도구 상세 조회 + handlerRegistered 필드 포함

- [x]Task 4: Admin UI — 도구 상세 편집 패널 (AC: #4, #5)
  - [x]도구 선택 시 상세 편집 패널: name, description, handler, inputSchema (textarea JSON), isActive 토글
  - [x]도구 생성 폼에 handler, inputSchema 필드 추가
  - [x]저장 시 PUT API 호출, handlerRegistered 표시

- [x]Task 5: 빌드 검증 (AC: #6)

## Dev Notes

### 현재 Admin API 상태 (`packages/server/src/routes/admin/tools.ts`, 85줄)

```
GET  /api/admin/tools          — 전체 목록 (companyId 필터)
POST /api/admin/tools          — 도구 생성 (handler/inputSchema 미포함)
GET  /api/admin/agent-tools    — 에이전트별 도구 매핑
POST /api/admin/agent-tools    — 도구 할당
PATCH /api/admin/agent-tools/:id — isEnabled 토글
DELETE /api/admin/agent-tools/:id — 매핑 삭제
```

**누락된 것:**
- handler, inputSchema 필드가 POST 스키마에 없음
- PUT (수정) 엔드포인트 없음
- GET /:id (개별 조회) 없음

### 핸들러 등록 여부 확인

```typescript
import { registry } from '../../lib/tool-handlers'

// 응답에 포함
handlerRegistered: handler ? !!registry.get(handler) : false
```

### Admin UI (`packages/admin/src/pages/tools.tsx`, 277줄)

현재 UI:
- 도구 목록 (name, scope 표시)
- 도구 생성 (name, description, scope)
- 도구 선택 → 에이전트 할당 목록

필요 변경:
- 도구 선택 → 상세 편집 패널 (handler, inputSchema JSON, isActive)
- 생성 폼에 handler, inputSchema 추가

### inputSchema JSON 편집

textarea + JSON.parse 검증만 사용 (monaco-editor 미도입). 간단한 구현:
```tsx
<textarea value={schemaText} onChange={...} rows={8} className="font-mono text-xs" />
// 저장 시: JSON.parse(schemaText) → API 전달
```

### Project Structure Notes

- Server: packages/server/src/routes/admin/tools.ts
- Admin UI: packages/admin/src/pages/tools.tsx
- Handler Registry: packages/server/src/lib/tool-handlers/ (Story 8-1에서 생성)
- DB Schema: packages/server/src/db/schema.ts (tool_definitions 테이블)

### References

- [Source: packages/server/src/routes/admin/tools.ts] — 현재 도구 Admin API (85줄)
- [Source: packages/admin/src/pages/tools.tsx] — 현재 도구 관리 UI (277줄)
- [Source: packages/server/src/lib/tool-handlers/registry.ts] — HandlerRegistry (Story 8-1)
- [Source: packages/server/src/lib/tool-executor.ts] — validateInput 함수 (Story 8-1)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: createToolSchema에 handler, inputSchema 필드 추가 + 응답에 handlerRegistered 포함
- Task 2: PUT /tools/:id 엔드포인트 — name, description, handler, inputSchema, config, isActive 업데이트
- Task 3: GET /tools/:id — 개별 조회 + handlerRegistered 반환
- Task 4: Admin UI 레이아웃 3컬럼 변경 — 도구 목록 | 상세 편집(handler/inputSchema/isActive) + 에이전트 배정
- Task 5: turbo build 3/3 성공 (--force)

### File List
- packages/server/src/routes/admin/tools.ts (MODIFIED — 85→141줄, PUT/GET:id 추가, handler/inputSchema 스키마)
- packages/admin/src/pages/tools.tsx (MODIFIED — 277→280줄, 상세 편집 패널 + 생성 폼 확장)
