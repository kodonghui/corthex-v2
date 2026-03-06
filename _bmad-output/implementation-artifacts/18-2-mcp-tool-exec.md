# Story 18.2: MCP 도구 실행

Status: done

## Story

As a 워크스페이스 일반 유저,
I want 등록된 MCP 서버의 도구를 에이전트 채팅에서 실제로 호출하고 결과를 받을 수 있도록,
so that 외부 MCP 서버의 도구를 채팅 대화에서 자연스럽게 사용할 수 있다.

## Acceptance Criteria

1. **Given** 등록된 MCP 서버가 있고 연결 성공 상태 **When** `GET /settings/mcp/:id/tools` 호출 **Then** MCP 서버 URL로 실제 HTTP 요청(Streamable HTTP `POST /mcp` with JSON-RPC `tools/list`)을 보내서 도구 목록(name, description, inputSchema)을 반환. stub 빈 배열 대체
2. **Given** MCP 서버에 도구 3개 등록 **When** 설정 페이지에서 서버 카드 아코디언 펼침 **Then** 실제 도구 이름 + 설명이 표시됨 (기존 UI 그대로, 이제 실제 데이터)
3. **Given** `POST /settings/mcp/test` 호출 **When** URL이 유효한 MCP 서버 **Then** 실제 `tools/list` JSON-RPC 호출로 toolCount 정확히 반환. 성공 메시지에 실제 도구 수 표시
4. **Given** 에이전트 채팅 세션 **When** AI가 도구 호출 결정 **Then** MCP 도구가 Claude API tools 배열에 포함되어 호출 가능. 결과가 채팅에 표시
5. **Given** MCP 도구 실행 요청 **When** `POST /mcp/execute` 호출 **Then** MCP 서버 URL로 JSON-RPC `tools/call` 요청 전달. 결과 문자열 반환
6. **Given** MCP 서버가 응답 없음 **When** 도구 실행 시도 **Then** 5초 타임아웃 후 에러 메시지 반환. 채팅 버블: "MCP 서버 응답 없음"
7. **Given** MCP 도구 실행 중 **When** 채팅 스트리밍 UI **Then** 기존 도구 호출 UI와 동일하게 `tool-start`/`tool-end` 이벤트로 표시. 도구명 뒤에 `[MCP]` 태그 추가
8. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: MCP 클라이언트 유틸리티 — JSON-RPC 요청 모듈 (AC: #1, #3, #5, #6)
  - [x] `packages/server/src/lib/mcp-client.ts` 신규 생성
  - [x] `mcpListTools(url: string)` — MCP 서버에 `tools/list` JSON-RPC 요청. Streamable HTTP (`POST` with `Content-Type: application/json`, JSON-RPC 2.0 `method: "tools/list"`)
  - [x] `mcpCallTool(url: string, toolName: string, args: Record<string, unknown>)` — `tools/call` JSON-RPC 요청. 결과에서 `content[0].text` 추출
  - [x] SSRF 방지: `isPrivateUrl` 함수를 mcp-client.ts에 포함 (localhost 개발용 허용)
  - [x] 타임아웃 5초, AbortController 사용
  - [x] 에러 핸들링: 타임아웃, 네트워크 오류, JSON-RPC error response, 비-JSON 응답, HTTP 에러 처리

- [x] Task 2: 서버 API — 도구 목록 실제 구현 (AC: #1, #2)
  - [x] `GET /settings/mcp/:id/tools` stub을 실제 `mcpListTools` 호출로 교체
  - [x] 응답 포맷: `{ tools: [{ name, description, inputSchema }] }`
  - [x] MCP 서버 연결 실패 시 빈 배열 + 에러 메시지 반환 (UI 깨지지 않게)

- [x] Task 3: 서버 API — 연결 테스트 실제 구현 (AC: #3)
  - [x] `POST /settings/mcp/test` stub을 `mcpListTools` 호출로 교체
  - [x] 성공: `{ success: true, toolCount: N, message: "연결 성공 (도구 N개 발견)" }`
  - [x] 실패: `{ success: false, toolCount: 0, message: "연결 실패: {오류}" }`

- [x] Task 4: 서버 API — MCP 도구 실행 엔드포인트 (AC: #5, #6)
  - [x] `POST /settings/mcp/execute` 신규 엔드포인트
  - [x] 요청: `{ serverId, toolName, arguments }` (zValidator)
  - [x] 서버 조회 → companyId 테넌트 격리 → `mcpCallTool(server.url, toolName, args)` 호출
  - [x] 결과 문자열 반환. 에러 시 에러 메시지 반환

- [x] Task 5: 도구 실행 엔진 통합 — MCP 도구를 에이전트 채팅에 연동 (AC: #4, #7)
  - [x] `packages/server/src/lib/ai.ts` 수정: `loadAgentTools` 후 MCP 도구도 추가 로드
  - [x] `loadMcpToolsForCompany(companyId)` 함수: companyId의 활성 MCP 서버들에서 도구 목록 수집
  - [x] MCP 도구를 Claude API tools 배열에 추가 (이름 충돌 방지: 내장 도구 우선, 동명 MCP 도구 건너뛰기)
  - [x] MCP 도구 호출 시 `mcpCallTool`로 위임 (기존 registry 핸들러 대신)
  - [x] `tool-start` / `tool-end` 이벤트에서 MCP 도구 구분: toolName에 `[MCP]` 표시

- [x] Task 6: 빌드 검증 (AC: #8)
  - [x] `bunx turbo build type-check` 8/8 success

## Dev Notes

### 18-1 스토리에서 만든 Stub (이번 스토리에서 교체)

1. **`GET /settings/mcp/:id/tools`** — 현재 `{ tools: [] }` 반환 → 실제 MCP `tools/list` 호출로 교체
2. **`POST /settings/mcp/test`** — 현재 HTTP HEAD 요청만 → 실제 MCP `tools/list` 호출로 교체 (도구 수 정확히 반환)
3. 연결 테스트 `safeFetch`는 제거/교체 가능 (MCP JSON-RPC로 대체)

### MCP 프로토콜 — Streamable HTTP (JSON-RPC 2.0)

MCP (Model Context Protocol) Streamable HTTP 전송 방식:
- **엔드포인트**: 서버 URL (예: `http://host:port/mcp`)
- **Method**: `POST`
- **Content-Type**: `application/json`
- **요청 형식**: JSON-RPC 2.0
  ```json
  { "jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {} }
  ```
- **응답 (tools/list)**:
  ```json
  {
    "jsonrpc": "2.0", "id": 1,
    "result": {
      "tools": [
        { "name": "get_stock_price", "description": "주가 조회", "inputSchema": { "type": "object", "properties": { "symbol": { "type": "string" } }, "required": ["symbol"] } }
      ]
    }
  }
  ```
- **도구 호출 (tools/call)**:
  ```json
  { "jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": { "name": "get_stock_price", "arguments": { "symbol": "AAPL" } } }
  ```
- **도구 호출 응답**:
  ```json
  {
    "jsonrpc": "2.0", "id": 2,
    "result": { "content": [{ "type": "text", "text": "AAPL: $150.25" }] }
  }
  ```

### 기존 도구 실행 아키텍처 (변경 최소화)

현재 도구 실행 흐름:
1. `ai.ts:loadAgentTools()` → DB `agentTools` + `toolDefinitions` 테이블에서 로드
2. `toClaudeTools()` → Claude API `tools` 배열로 변환
3. Claude가 `tool_use` 블록 반환 → `executeTool()` → `registry.get(handler)` → 핸들러 함수 실행
4. 결과 → `tool_result`로 다시 Claude에 전달

**MCP 도구 통합 전략 (registry 확장 방식)**:
- `ai.ts`에서 `loadAgentTools` 호출 후, `loadMcpTools(companyId)` 추가 호출
- MCP 도구를 같은 `ToolRecord[]` 형식으로 변환하여 `toolRecords`에 합침
- MCP 도구의 `handler`는 `mcp::{serverId}` 같은 특수 prefix 사용
- `executeTool`에서 handler가 `mcp::` prefix면 `mcpCallTool`로 위임
- **장점**: 기존 tool_use 루프, 스트리밍, 비용 기록 로직 전혀 변경 없음

### 도구 이름 충돌 방지

MCP 도구 이름이 기존 내장 도구와 충돌할 수 있음:
- 전략: MCP 도구 이름 그대로 사용 (충돌 시 내장 도구 우선)
- 이유: MCP 프로토콜 표준은 도구 이름을 그대로 사용. 네임스페이스 prefix는 Claude가 혼란스러울 수 있음
- 충돌 감지: `loadMcpTools`에서 이미 존재하는 도구 이름은 건너뛰기 + 경고 로그

### SSRF 방지

`isPrivateUrl` 함수가 `settings-mcp.ts`에 이미 있음. 이걸 `mcp-client.ts`에서도 재사용:
- `settings-mcp.ts`에서 `isPrivateUrl`을 export
- 또는 `mcp-client.ts`에 동일 로직 포함 (중복이지만 간단)
- 모든 MCP 서버 URL 요청 전 SSRF 체크

### 프론트엔드 변경사항

**변경 없음** — 프론트엔드는 이미 18-1에서 완성:
- 설정 페이지 도구 목록 UI: 이미 `GET /mcp/:id/tools` 호출하고 도구 표시하는 로직 있음
- 채팅 `tool-start`/`tool-end` UI: 이미 도구명 표시하는 로직 있음
- 연결 테스트: 이미 toolCount 표시하는 로직 있음
- 백엔드만 stub → 실제로 교체하면 UI 자동으로 동작

### API 경로 요약

| Method | Path | 설명 | 변경 |
|--------|------|------|------|
| GET | `/api/workspace/settings/mcp/:id/tools` | 도구 목록 | stub → 실제 |
| POST | `/api/workspace/settings/mcp/test` | 연결 테스트 | stub → 실제 |
| POST | `/api/workspace/settings/mcp/execute` | 도구 실행 | **신규** |

### 기존 코드 패턴 재사용

1. **`isPrivateUrl`** → `settings-mcp.ts`의 SSRF 방지 함수
2. **`executeTool`** → `tool-executor.ts`의 도구 실행 + DB 기록 로직
3. **`loadAgentTools` + `toClaudeTools`** → `tool-executor.ts`의 도구 로드 + 변환
4. **`registry`** → `tool-handlers/registry.ts`의 핸들러 레지스트리
5. **`tool-start`/`tool-end` 이벤트** → `ai.ts` 스트리밍의 도구 실행 이벤트

### Project Structure Notes

```
packages/server/src/
  lib/mcp-client.ts                        <- 신규: MCP JSON-RPC 클라이언트
  lib/ai.ts                                <- 수정: MCP 도구 로드 + 실행 통합
  lib/tool-executor.ts                     <- 수정: MCP handler 위임 로직 추가
  routes/workspace/settings-mcp.ts         <- 수정: stub → 실제 MCP 호출
```

### References

- [Source: packages/server/src/routes/workspace/settings-mcp.ts] — MCP CRUD + stub 엔드포인트 (18-1)
- [Source: packages/server/src/lib/tool-executor.ts] — 도구 실행 엔진
- [Source: packages/server/src/lib/tool-handlers/registry.ts] — 핸들러 레지스트리
- [Source: packages/server/src/lib/tool-handlers/types.ts] — ToolHandler, ToolExecContext 타입
- [Source: packages/server/src/lib/ai.ts] — AI 응답 생성 (sync + stream), tool_use 루프
- [Source: packages/server/src/db/schema.ts:666-676] — mcpServers 테이블
- [Source: packages/app/src/components/settings/settings-mcp.tsx] — MCP 설정 UI (변경 없음)
- [Source: packages/app/src/hooks/use-chat-stream.ts] — tool-start/tool-end 이벤트 처리
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:2063-2108] — MCP 연동 UX

### Previous Story Intelligence (18-1)

- MCP 서버 CRUD API + 설정 UI 완성
- `isPrivateUrl` SSRF 방지 + `safeFetch` 유틸리티
- `/mcp/:id/tools`와 `/mcp/test`가 stub — 이번 스토리에서 실제 구현
- UX 스펙: 에이전트 도구 연동 = 등록 즉시 사용 가능, 채팅 버블 `[MCP]` 태그
- turbo build 8/8, TEA 169건 테스트 통과

### Git Intelligence

Recent commits:
- `092cf1a` feat: Story 18-1 MCP 서버 관리 — CRUD API + 설정 UI + 연결 테스트 + SSRF 방지 + TEA 169건
- `4939550` docs: Epic 17 회고 완료
- `26972d2` feat: Story 17-5 NEXUS 모바일 접근

커밋 메시지 패턴: `feat: Story X-Y 한글 제목 — 핵심 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: mcp-client.ts — mcpListTools + mcpCallTool + isPrivateUrl SSRF 방지 + 5초 타임아웃 + JSON-RPC 2.0 프로토콜 + 에러 핸들링
- Task 2: GET /mcp/:id/tools stub → 실제 mcpListTools 호출. 연결 실패 시 빈 배열 + error 필드 graceful degradation
- Task 3: POST /mcp/test stub → 실제 mcpListTools로 toolCount 정확히 반환. safeFetch + isPrivateUrl 로컬 함수 제거
- Task 4: POST /mcp/execute 신규 — serverId/toolName/arguments zValidator + 테넌트 격리 + mcpCallTool 위임
- Task 5: ai.ts — generateAgentResponse + generateAgentResponseStream 모두 MCP 도구 통합. loadMcpToolsForCompany로 companyId별 MCP 서버 도구 수집, Claude tools 배열에 합침, tool_use 루프에서 MCP/내장 도구 분기 실행, tool-start/end에 [MCP] 태그
- Task 6: turbo build type-check 8/8 success + 22 unit tests pass + 기존 38 MCP tests 통과

### File List

- packages/server/src/lib/mcp-client.ts (신규 — MCP JSON-RPC 클라이언트)
- packages/server/src/lib/ai.ts (수정 — MCP 도구 로드 + 실행 통합, 양쪽 함수)
- packages/server/src/routes/workspace/settings-mcp.ts (수정 — stub→실제 MCP 호출 + execute 엔드포인트 + safeFetch/isPrivateUrl 제거)
- packages/server/src/__tests__/unit/mcp-tool-exec.test.ts (신규 — 22 tests)
