# Story 8.3: 자격증명 봉투 통합 — 도구 핸들러에서 Credential Vault 접근

Status: done

## Story

As a 도구 핸들러 개발자,
I want 핸들러 함수에서 ToolExecContext를 통해 Credential Vault에 안전하게 접근한다,
so that 외부 API 연동 도구 (Serper, SMTP, KIS 등)가 암호화된 자격증명을 사용할 수 있다.

## Acceptance Criteria

1. **Given** ToolExecContext **When** 핸들러에서 `ctx.getCredentials(provider)` 호출 **Then** 복호화된 자격증명 반환 (user > company 우선순위)
2. **Given** search_web 핸들러 **When** Serper API 키가 등록되어 있을 때 **Then** 실제 웹 검색 수행 (현재 stub 교체)
3. **Given** 자격증명 미등록 **When** 핸들러에서 getCredentials 호출 **Then** 사용자에게 명확한 오류 메시지 반환 ("API 키가 등록되지 않았습니다")
4. **Given** tool_definitions.config **When** 핸들러에 config 전달 **Then** 도구별 설정값 접근 가능 (예: API base URL)
5. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x]Task 1: ToolExecContext에 getCredentials 헬퍼 추가 (AC: #1, #3)
  - [x]types.ts에 getCredentials: (provider: string) => Promise<Record<string, string>> 추가
  - [x]tool-executor.ts에서 executeTool 시 ctx에 getCredentials 바인딩 (credential-vault의 getCredentials 래핑)
  - [x]자격증명 미등록 시 JSON 오류 반환 (throw 대신)

- [x]Task 2: ToolExecContext에 config 전달 (AC: #4)
  - [x]types.ts에 config?: Record<string, unknown> 추가
  - [x]executeTool에서 toolRecord의 config 필드를 ctx.config에 전달
  - [x]tool_definitions 로드 시 config 필드 포함 (loadAgentTools 수정)

- [x]Task 3: search_web 핸들러 Serper 연동 (AC: #2)
  - [x]builtins/search-web.ts에서 ctx.getCredentials('serper') 호출
  - [x]Serper API 호출 (https://google.serper.dev/search, POST, json)
  - [x]자격증명 없을 시 기존 stub 유지 ("개발 중" 메시지)

- [x]Task 4: 빌드 검증 (AC: #5)

## Dev Notes

### getCredentials 설계

```typescript
// types.ts 확장
export type ToolExecContext = {
  companyId: string
  agentId: string
  sessionId: string
  departmentId: string | null
  userId: string
  config?: Record<string, unknown>
  getCredentials: (provider: string) => Promise<Record<string, string>>
}
```

### tool-executor.ts에서 ctx 구성

```typescript
import { getCredentials } from '../services/credential-vault'

// executeTool 내부에서 ctx 확장
const enrichedCtx = {
  ...ctx,
  config: toolRecord.config || undefined,
  getCredentials: async (provider: string) => {
    try {
      return await getCredentials(ctx.companyId, provider, ctx.userId)
    } catch {
      throw new Error(`'${provider}' API 키가 등록되지 않았습니다. 설정에서 API 키를 등록하세요.`)
    }
  },
}
```

### Serper API 연동 (search-web.ts)

```typescript
const creds = await ctx.getCredentials('serper')
const res = await fetch('https://google.serper.dev/search', {
  method: 'POST',
  headers: { 'X-API-KEY': creds.api_key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ q: query }),
})
```

### loadAgentTools config 추가

현재 loadAgentTools는 config를 SELECT하지 않음. config 필드를 추가해야 함.

### Project Structure Notes

- Credential Vault: packages/server/src/services/credential-vault.ts
- Handler Types: packages/server/src/lib/tool-handlers/types.ts
- Tool Executor: packages/server/src/lib/tool-executor.ts
- Search Web: packages/server/src/lib/tool-handlers/builtins/search-web.ts

### References

- [Source: packages/server/src/services/credential-vault.ts] — getCredentials 함수 (93줄)
- [Source: packages/server/src/lib/tool-handlers/types.ts] — ToolExecContext 타입
- [Source: packages/server/src/lib/tool-executor.ts] — executeTool 함수 (163줄)
- [Source: packages/server/src/db/schema.ts:189-203] — tool_definitions.config 필드

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: ToolExecContext에 getCredentials 추가, tool-executor.ts에서 credential-vault 래핑하여 바인딩
- Task 2: ToolRecord/loadAgentTools에 config 추가, enrichedCtx에 config 전달
- Task 3: search-web.ts Serper API 연동 — getCredentials('serper') 호출, 미등록 시 안내 메시지
- Task 4: turbo build 3/3 성공

### File List
- packages/server/src/lib/tool-handlers/types.ts (MODIFIED — getCredentials, config 필드 추가)
- packages/server/src/lib/tool-executor.ts (MODIFIED — enrichedCtx 생성, config 로드, Omit 타입)
- packages/server/src/lib/tool-handlers/builtins/search-web.ts (MODIFIED — Serper API 연동)
