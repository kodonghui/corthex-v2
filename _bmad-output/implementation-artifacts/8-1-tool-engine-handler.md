# Story 8.1: 도구 엔진 핸들러 레지스트리 — switch/case → 플러그인 방식 전환

Status: done

## Story

As a 개발자 (도구 시스템),
I want 하드코딩된 switch/case 핸들러를 플러그인 레지스트리 패턴으로 교체하고, 도구 입력 검증 + 기존 도구 DB 등록을 완성한다,
so that 새 도구 추가 시 코드 배포 없이 핸들러를 등록하고, 입력 검증으로 안전성을 높인다.

## Acceptance Criteria

1. **Given** 새 핸들러 함수 **When** `registerHandler('name', fn)` 호출 **Then** switch/case 수정 없이 도구 사용 가능
2. **Given** tool_definitions.inputSchema 존재 **When** 도구 실행 **Then** 입력값이 스키마에 따라 검증되고, 실패 시 명확한 오류 반환
3. **Given** 기존 6개 핸들러 (get_current_time, calculate, search_department_knowledge, get_company_info, search_web, create_report) **When** 레지스트리로 이관 **Then** 기존과 동일하게 동작
4. **Given** create_report 등 미등록 도구 **When** seed 실행 **Then** tool_definitions 테이블에 올바른 handler, inputSchema와 함께 등록
5. **Given** 등록되지 않은 handler **When** 도구 실행 **Then** "핸들러가 구현되지 않았습니다" 오류 반환 (기존 동작 유지)
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 핸들러 레지스트리 모듈 생성 (AC: #1, #3)
  - [x]`packages/server/src/lib/tool-handlers/registry.ts` — HandlerRegistry 클래스: registerHandler, getHandler, listHandlers
  - [x]`packages/server/src/lib/tool-handlers/index.ts` — 모든 내장 핸들러를 레지스트리에 등록하는 barrel 파일
  - [x]핸들러 타입 정의: `ToolHandler = (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>`

- [x] Task 2: 기존 6개 핸들러를 개별 파일로 분리 (AC: #3)
  - [x]`packages/server/src/lib/tool-handlers/builtins/get-current-time.ts`
  - [x]`packages/server/src/lib/tool-handlers/builtins/calculate.ts` (safeEvalMath 포함)
  - [x]`packages/server/src/lib/tool-handlers/builtins/search-department-knowledge.ts`
  - [x]`packages/server/src/lib/tool-handlers/builtins/get-company-info.ts`
  - [x]`packages/server/src/lib/tool-handlers/builtins/search-web.ts`
  - [x]`packages/server/src/lib/tool-handlers/builtins/create-report.ts`

- [x] Task 3: tool-executor.ts 리팩토링 — switch → registry.getHandler() (AC: #1, #3, #5)
  - [x]`runHandler()` 함수에서 switch/case 제거 → `registry.getHandler(handler)` 호출
  - [x]미등록 핸들러 시 기존과 동일한 오류 메시지 반환
  - [x]기존 public API (executeTool, loadAgentTools, toClaudeTools) 변경 없음

- [x] Task 4: 입력 스키마 검증 추가 (AC: #2)
  - [x]`executeTool()` 에서 toolRecord.inputSchema 존재 시 input 검증
  - [x]JSON Schema 기본 검증: required 필드 존재 확인 + type 체크 (간단한 인라인 검증, 외부 라이브러리 미사용)
  - [x]검증 실패 시 `[오류] 입력값이 올바르지 않습니다: {상세}` 반환

- [x] Task 5: seed 데이터에 기존 도구 등록 (AC: #4)
  - [x]`packages/server/src/db/seed.ts`에 6개 내장 도구의 tool_definitions INSERT (upsert)
  - [x]각 도구에 handler 이름 + inputSchema 포함
  - [x]create_report: `{ title: string (required), content: string (optional) }` 스키마

- [x] Task 6: 빌드 검증 (AC: #6)

## Dev Notes

### 핸들러 레지스트리 설계

```typescript
// packages/server/src/lib/tool-handlers/registry.ts
type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string

class HandlerRegistry {
  private handlers = new Map<string, ToolHandler>()

  register(name: string, handler: ToolHandler): void {
    this.handlers.set(name, handler)
  }

  get(name: string): ToolHandler | undefined {
    return this.handlers.get(name)
  }
}

export const registry = new HandlerRegistry()
```

### tool-executor.ts 변경 최소화

```typescript
// 변경 전 (switch/case)
async function runHandler(handler, input, ctx) {
  switch (handler) {
    case 'get_current_time': return handleGetCurrentTime()
    case 'calculate': return handleCalculate(input)
    // ... 6개
    default: return `도구 '${handler}' 의 핸들러가 아직 구현되지 않았습니다.`
  }
}

// 변경 후 (registry)
import { registry } from './tool-handlers'

async function runHandler(handler, input, ctx) {
  const fn = registry.get(handler)
  if (!fn) return `도구 '${handler}' 의 핸들러가 아직 구현되지 않았습니다.`
  return fn(input, ctx)
}
```

### 입력 검증 (간단 인라인)

JSON Schema 전체 구현 대신, 최소 필수 검증만 수행:
- `required` 필드 존재 확인
- `type: "string"` / `"number"` 기본 타입 체크
- 외부 라이브러리(ajv 등) 미사용 — 번들 크기 유지

### seed.ts 도구 등록 예시

```typescript
const builtinTools = [
  {
    name: 'get_current_time',
    description: '현재 시각(KST)을 반환합니다',
    handler: 'get_current_time',
    scope: 'platform',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'calculate',
    description: '수학 수식을 계산합니다',
    handler: 'calculate',
    scope: 'platform',
    inputSchema: {
      type: 'object',
      properties: { expression: { type: 'string', description: '수식' } },
      required: ['expression'],
    },
  },
  {
    name: 'create_report',
    description: '보고서를 자동 생성합니다',
    handler: 'create_report',
    scope: 'platform',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '보고서 제목 (200자 이내)' },
        content: { type: 'string', description: '보고서 본문 (마크다운)' },
      },
      required: ['title'],
    },
  },
  // ... search_department_knowledge, get_company_info, search_web
]
```

### 파일 구조

```
packages/server/src/lib/
  tool-executor.ts          (MODIFIED — switch → registry.get())
  tool-handlers/
    index.ts                (NEW — barrel, 모든 핸들러 등록)
    registry.ts             (NEW — HandlerRegistry 클래스)
    types.ts                (NEW — ToolHandler, ToolExecContext 타입)
    builtins/
      get-current-time.ts   (NEW — 기존 handleGetCurrentTime 이관)
      calculate.ts          (NEW — safeEvalMath + handleCalculate 이관)
      search-department-knowledge.ts (NEW — handleSearchKnowledge 이관)
      get-company-info.ts   (NEW — handleGetCompanyInfo 이관)
      search-web.ts         (NEW — handleSearchWeb 이관)
      create-report.ts      (NEW — handleCreateReport 이관)
packages/server/src/db/
  seed.ts                   (MODIFIED — 내장 도구 6개 upsert 추가)
```

### 주의사항

- **ToolExecContext 타입**은 현재 tool-executor.ts에만 있음 → `types.ts`로 이동 후 양쪽에서 import
- **db import**: 각 핸들러 파일에서 `../../db`를 직접 import (DI 미도입, 현재 패턴 유지)
- **기존 public API 변경 없음**: executeTool, loadAgentTools, toClaudeTools 시그니처 동일
- **crypto import**: create-report.ts에서 `crypto.randomUUID()` 사용 (Node 내장)

### Project Structure Notes

- 모노레포: packages/server (Hono + Bun), packages/app (React + Vite), packages/ui (공유 컴포넌트)
- DB: PostgreSQL + Drizzle ORM, 스키마 `packages/server/src/db/schema.ts`
- 기존 도구 관리 Admin API: `packages/server/src/routes/admin/tools.ts`
- 기존 도구 할당 Admin UI: `packages/admin/src/pages/tools.tsx`

### References

- [Source: packages/server/src/lib/tool-executor.ts] — 현재 switch/case 핸들러 (352줄)
- [Source: packages/server/src/db/schema.ts:189-215] — tool_definitions + agentTools 스키마
- [Source: packages/server/src/routes/admin/tools.ts] — 도구 CRUD Admin API (85줄)
- [Source: packages/server/src/db/seed.ts] — 시드 데이터
- [Source: _bmad-output/implementation-artifacts/epic-7-retro-2026-03-05.md] — create_report DB 미등록 부채 언급
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml:131-137] — Epic 8 스토리 목록

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: HandlerRegistry 클래스 + ToolHandler/ToolExecContext 타입 정의 + barrel 파일
- Task 2: 6개 핸들러를 builtins/ 하위 개별 파일로 분리 (동일 로직 유지)
- Task 3: tool-executor.ts에서 switch/case 제거 → registry.get() 호출, 기존 public API 변경 없음
- Task 4: validateInput() 함수 추가 — required 필드 + type 체크 (ajv 미사용, 인라인)
- Task 5: seed.ts에 6개 내장 도구의 handler + inputSchema 포함 INSERT 추가
- Task 6: turbo build 3/3 성공 (--force)

### File List
- packages/server/src/lib/tool-handlers/types.ts (NEW — ToolHandler, ToolExecContext 타입)
- packages/server/src/lib/tool-handlers/registry.ts (NEW — HandlerRegistry 클래스)
- packages/server/src/lib/tool-handlers/index.ts (NEW — barrel, 6개 핸들러 등록)
- packages/server/src/lib/tool-handlers/builtins/get-current-time.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/calculate.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/search-department-knowledge.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/get-company-info.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/search-web.ts (NEW)
- packages/server/src/lib/tool-handlers/builtins/create-report.ts (NEW)
- packages/server/src/lib/tool-executor.ts (MODIFIED — switch→registry, validateInput 추가, 352→163줄)
- packages/server/src/db/seed.ts (MODIFIED — 내장 도구 6개 handler+inputSchema 추가)
