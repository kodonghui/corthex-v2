# Epic: Autonomous Execution Tools — CORTHEX를 기업용 Manus로

> **사용법**: `/kdh-full-auto-pipeline planning` 실행 후 이 파일 전체를 컨텍스트로 제공
> **최종 업데이트**: 2026-03-19 (코드 직접 읽고 검증됨)

---

## 한 줄 요약

AI 에이전트가 **웹 검색 + 코드 실행 + 브라우저 조작**을 혼자서 할 수 있게 만든다. 지금은 도구 65+개가 DB에 등록돼 있는데 엔진에서 실행 자체가 안 됨 — 이걸 먼저 고치고, 3개 핵심 도구를 업그레이드/추가한다.

---

## 현재 문제 (코드로 확인된 사실)

### 도구 실행 경로가 2개로 분리되어 있다

```
System A (registry) — 65+개 도구 등록됨, 실행 가능하지만 엔진에서 안 씀
├── lib/tool-handlers/registry.ts    → HandlerRegistry 클래스
├── lib/tool-handlers/index.ts       → registry.register('search_web', fn) 등 65+개
├── lib/tool-handlers/types.ts       → ToolHandler 타입
├── lib/tool-executor.ts             → executeTool() 함수
└── lib/ai.ts                        → 레거시 경로 (hub.ts가 아닌 옛날 호출부)

System B (engine) — agent-loop.ts, 실제 에이전트가 쓰는 경로
├── engine/agent-loop.ts             → runAgent() — 메인 루프
├── engine/types.ts                  → RunAgentOptions, SessionContext, SSEEvent
├── engine/mcp/mcp-manager.ts        → MCP 8-Stage 라이프사이클
└── tool-handlers/builtins/call-agent.ts → 핸드오프 전용
```

**문제**: `agent-loop.ts`에서 도구 실행 분기가 이렇게 됨:
1. `block.name === 'call_agent'` → 핸드오프 처리 ✅
2. `block.name.includes('__')` → MCP 실행 ✅
3. **그 외 전부** → `"Tool not executable in this context"` 에러 ❌

즉 에이전트가 `search_web`, `calculate`, `send_email` 등을 tool_use로 요청하면 **전부 실패**.

---

## 검증된 타입 정의 (코드에서 직접 복사)

### SessionContext (engine/types.ts)
```typescript
interface SessionContext {
  readonly cliToken: string              // Anthropic API key
  readonly userId: string
  readonly companyId: string
  readonly depth: number                 // 핸드오프 깊이 (0 = 루트)
  readonly sessionId: string             // 에이전트 세션 고유 ID
  readonly startedAt: number
  readonly maxDepth: number              // 핸드오프 깊이 제한
  readonly visitedAgents: readonly string[]  // 순환 감지
  readonly runId: string                 // UUID v4, 세션 내 모든 tool_call 공유 (E17)
}
```

### RunAgentOptions (engine/types.ts)
```typescript
interface RunAgentOptions {
  ctx: SessionContext
  soul: string         // 시스템 프롬프트
  message: string      // 사용자 메시지
  tools?: Tool[]       // 사전 정의 도구 (거의 안 씀)
  // ⚠️ maxTurns 필드 없음 — Story 4에서 추가해야 함
}
```

### ToolCallContext (engine/types.ts — 엔진 전용)
```typescript
interface ToolCallContext {
  readonly companyId: string
  readonly agentId: string
  readonly runId: string      // E17 텔레메트리 토큰
  readonly sessionId: string
}
```

### ToolHandler (lib/tool-handlers/types.ts — registry 전용)
```typescript
type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext
) => Promise<string>
```

### ToolExecContext (lib/tool-handlers/types.ts — registry 전용)
```typescript
interface ToolExecContext {
  companyId: string
  agentId: string
  sessionId: string
  departmentId: string | null
  userId: string
  getCredentials: (provider: string) => Promise<Record<string, string>>
}
```

### SSEEvent (engine/types.ts — 6가지만)
```typescript
type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number }
  // ⚠️ turnsUsed 필드 없음 — Story 4에서 추가
```

### BuiltinToolHandler (engine/types.ts — 엔진 전용, registry와 별개)
```typescript
interface BuiltinToolHandler {
  name: string
  schema: z.ZodObject<any>
  execute: (input: Record<string, unknown>, ctx: ToolCallContext) => Promise<string>
}
```

> **핵심**: `ToolExecContext`(registry)와 `ToolCallContext`(engine)는 **다른 인터페이스**. 브릿지에서 변환 필요.

---

## agent-loop.ts 실행 흐름 상세

```
runAgent(options) 호출
  ├── 1. 세션 초기화: runId 생성, activeSessions에 등록
  ├── 2. 시맨틱 캐시 체크 (enableSemanticCache 있으면)
  ├── 3. credential scrubber 초기화
  ├── 4. 도구 로드:
  │     ├── 에이전트 도구: DB에서 로드 + input schema
  │     ├── MCP 도구: lazy spawn → namespace prefix (e.g. notion__create_page)
  │     └── CALL_AGENT_TOOL: 항상 포함 (핸드오프용)
  ├── 5. 메인 루프: for (let turn = 0; turn < 10; turn++)  ← 하드코딩!
  │     ├── Claude API 호출 (model, system, messages, tools)
  │     ├── stop_reason 체크: end_turn이면 break
  │     └── tool_use 블록 처리:
  │           ├── PreToolUse 훅 (permission guard) → 거부 시 에러
  │           ├── call_agent → 핸드오프
  │           ├── __포함 → MCP execute
  │           ├── 그 외 → ❌ "not executable" ← 여기를 고쳐야 함
  │           └── PostToolUse: credentialScrubber → outputRedactor → delegationTracker
  ├── 6. 시맨틱 캐시 저장 (있으면)
  └── 7. finally: MCP teardown, credential scrubber 해제, 비용 추적
```

---

## 기존 빌트인 도구 6개 (패턴 참조)

| 도구 | 파일 | 외부 서비스 | 크리덴셜 | E17 텔레메트리 |
|------|------|-------------|----------|---------------|
| `read_web_page` | `builtins/read-web-page.ts` | Jina Reader API | 없음 | ✅ INSERT→실행→UPDATE |
| `send_email` | `builtins/send-email.ts` | SMTP | smtp_* (4개) | ✅ |
| `upload_media` | `builtins/upload-media.ts` | Cloudflare R2 | r2_* (5개) | ✅ |
| `publish_tistory` | `builtins/publish-tistory.ts` | Tistory API | tistory_access_token | ✅ |
| `save_report` | `builtins/save-report.ts` | DB + SMTP | smtp_* (pdf_email일 때) | ✅ + E15 |
| `call_agent` | `builtins/call-agent.ts` | 재귀 runAgent() | 없음 | ❌ (자체 이벤트) |

### 새 도구 구현 시 반드시 따라야 할 패턴 (E17)

```typescript
// 1. 시작 전 INSERT
const [{ id: eventId }] = await getDB(ctx.companyId).insertToolCallEvent({
  agentId: ctx.agentId,
  runId: ctx.runId,
  toolName: 'my_tool',
  startedAt: new Date(),
})

// 2. 실행
try {
  const result = await doSomething()
  // 3a. 성공 UPDATE
  await getDB(ctx.companyId).updateToolCallEvent(eventId, {
    completedAt: new Date(),
    success: true,
    durationMs: Date.now() - startTime,
  })
  return JSON.stringify(result)
} catch (err) {
  // 3b. 실패 UPDATE
  await getDB(ctx.companyId).updateToolCallEvent(eventId, {
    completedAt: new Date(),
    success: false,
    errorCode: err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR',
    durationMs: Date.now() - startTime,
  })
  throw err
}
```

### 외부 API 호출 패턴 (callExternalApi)

```typescript
import { callExternalApi } from '../../lib/call-external-api'

// 자동 에러 매핑:
// 401/403 → TOOL_CREDENTIAL_INVALID
// 429    → TOOL_QUOTA_EXHAUSTED
// 5xx    → TOOL_EXTERNAL_SERVICE_ERROR
// 네트워크 → TOOL_EXTERNAL_SERVICE_ERROR

const result = await callExternalApi('Perplexity', () =>
  fetch(url).then(r => {
    if (!r.ok) return Promise.reject({ status: r.status })
    return r.json()
  })
)
```

---

## Story 0 (선행 필수): agent-loop.ts ↔ tool-executor.ts 브릿지

> **이것 없이는 Story 1-5 전부 의미 없음. 반드시 먼저 구현.**
> **이 Story는 swarm에 맡기지 말고 단독으로 신중하게 구현할 것.**

### 현재 상태
- `agent-loop.ts`의 "그 외" 분기 → `"Tool not executable in this context"` 에러 반환
- `lib/tool-executor.ts`의 `executeTool()` → 완전히 동작하지만 engine에서 호출 안 됨

### 해야 할 것: 4단계

#### (A) import 추가 — agent-loop.ts 상단
```typescript
import { executeTool, loadAgentTools, toClaudeTools } from '../lib/tool-executor'
```

#### (B) 에이전트 도구 목록 로드 — runAgent() 초반 (MCP 로드 부근)
```typescript
// Load agent's assigned tools from DB (registry tools)
const agentToolRecords = await loadAgentTools(ctx.agentId, ctx.companyId)
const registryClaudeTools = toClaudeTools(agentToolRecords)
```
- `loadAgentTools()`: DB에서 에이전트에 할당된 도구 목록 + input_schema 로드
- `toClaudeTools()`: DB 레코드 → Claude API `Tool[]` 형식 변환

#### (C) Claude API 호출 시 도구 목록 병합
현재: `[CALL_AGENT_TOOL, ...mcpTools]`
변경: `[CALL_AGENT_TOOL, ...registryClaudeTools, ...mcpTools]`

#### (D) "그 외" 분기를 executeTool() 호출로 교체
```typescript
// === 현재 코드 (삭제 대상) ===
// "Tool not executable in this context" 에러 반환

// === 교체 코드 ===
try {
  // ToolCallContext(engine) → ToolExecContext(registry) 변환
  const toolExecCtx: ToolExecContext = {
    companyId: ctx.companyId,
    agentId: ctx.agentId,
    sessionId: ctx.sessionId,
    departmentId: ctx.departmentId ?? null,  // SessionContext에 departmentId 있는지 확인!
    userId: ctx.userId,
    getCredentials: async (provider: string) => {
      // credential-vault.ts의 vaultGetCredentials 사용
      const { vaultGetCredentials } = await import('../lib/credential-vault')
      return vaultGetCredentials(ctx.companyId, provider)
    },
  }

  // DB에서 로드한 도구 레코드에서 현재 도구 찾기
  const toolRecord = agentToolRecords.find(t => t.name === block.name)
  if (!toolRecord) {
    throw new Error(`Tool "${block.name}" not assigned to this agent`)
  }

  const result = await executeTool(block.name, toolInput, toolExecCtx, toolRecord)
  toolResults.push({
    type: 'tool_result',
    tool_use_id: block.id,
    content: result,
  })
  yield { type: 'tool_output', toolName: block.name, output: result }
} catch (err) {
  const errMsg = err instanceof Error ? err.message : String(err)
  toolResults.push({
    type: 'tool_result',
    tool_use_id: block.id,
    content: `[도구 실행 실패] ${errMsg}`,
    is_error: true,
  })
}
// PostToolUse 훅 체인 — 반드시 MCP/call_agent과 동일하게 적용
let output = credentialScrubber(ctx, block.name, toolResults.at(-1)!.content as string)
output = outputRedactor(ctx, block.name, output)
delegationTracker(ctx, block.name, output, toolInput)
```

### 주의사항 (지뢰밭)

1. **타입 변환**: `SessionContext`(engine)에 `departmentId`, `userId` 필드가 있는지 먼저 확인. 없으면 `runAgent()` 호출 시 전달하거나 DB에서 조회
2. **getCredentials 래핑**: `ToolExecContext`는 `getCredentials(provider) → Record<string,string>` 함수를 요구. `vaultGetCredentials`의 시그니처와 반환값 확인 필수
3. **executeTool 내부 동작**:
   - `registry.get(handlerName)` → 핸들러 조회
   - 30초 timeout 내장 (`TOOL_TIMEOUT_MS = 30_000`)
   - 에러 시 `[오류]` 프리픽스 문자열 반환 (throw 안 함) — try/catch는 예비용
   - DB에 `tool_call_events` 로그 자체 기록 (E17) — 중복 기록 주의
4. **PostToolUse 훅**: credentialScrubber → outputRedactor → delegationTracker 순서. MCP, call_agent과 동일하게 적용해야 함
5. **tool_output 이벤트**: `yield { type: 'tool_output' }` — SSEEvent 타입에 이 이벤트가 정의돼 있는지 확인. 없으면 추가하거나 생략

### 테스트 시나리오
- 에이전트가 `search_web` tool_use → 실제 검색 결과 반환 (더 이상 "not executable" 아님)
- 에이전트가 `calculate` tool_use → 계산 결과 반환
- 에이전트에 할당 안 된 도구 요청 → `"Tool not assigned to this agent"` 에러
- PostToolUse 훅 체인 정상 작동 (민감 정보 스크러빙)
- `bunx tsc --noEmit` 통과

---

## Story 1: search_web — Perplexity Sonar 업그레이드

### 현재
- 파일: `packages/server/src/lib/tool-handlers/builtins/search-web.ts` (58줄)
- Serper API (`POST https://google.serper.dev/search`)
- `ctx.getCredentials('serper')` → `api_key`
- 반환: `{ query, results: [{title, url, snippet}], count }`

### 변경
- Perplexity Sonar API (`POST https://api.perplexity.ai/chat/completions`)로 교체
- Serper는 폴백으로 유지 (Perplexity 키 없는 회사용)
- 반환 형식: `{ query, answer: "요약 답변", sources: ["url1", "url2"] }`

### 구현 상세

```typescript
import type { ToolHandler } from '../types'
import { callExternalApi } from '../../lib/call-external-api'

export const searchWeb: ToolHandler = async (input, ctx) => {
  const query = String(input.query || '')
  if (!query) return JSON.stringify({ query: '', answer: '', sources: [], error: '검색어가 비어있습니다.' })

  const mode = String(input.mode || 'sonar')  // sonar (저렴) or sonar-pro (고품질)

  // 1차: Perplexity 시도
  try {
    const creds = await ctx.getCredentials('perplexity')
    return await callExternalApi('Perplexity', async () => {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: mode === 'sonar-pro' ? 'sonar-pro' : 'sonar',
          messages: [{ role: 'user', content: query }],
        }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw { status: res.status }
      const data = await res.json()
      return JSON.stringify({
        query,
        answer: data.choices?.[0]?.message?.content || '',
        sources: data.citations || [],
      })
    })
  } catch {
    // Perplexity 실패 또는 키 없음 → Serper 폴백
  }

  // 2차: Serper 폴백
  try {
    const creds = await ctx.getCredentials('serper')
    return await callExternalApi('Serper', async () => {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': creds.api_key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query }),
        signal: AbortSignal.timeout(15_000),
      })
      if (!res.ok) throw { status: res.status }
      const data = await res.json()
      const results = (data.organic || []).slice(0, 5).map((r: any) => ({
        title: r.title, url: r.link, snippet: r.snippet,
      }))
      return JSON.stringify({ query, results, count: results.length })
    })
  } catch {
    // 둘 다 없음
  }

  return JSON.stringify({
    query, answer: '', sources: [],
    error: '웹 검색 API 키가 등록되지 않았습니다. 설정에서 Perplexity 또는 Serper API 키를 등록하세요.',
  })
}
```

### seed-common-tools.ts 업데이트
기존 `search_web` 항목 수정:
```typescript
{
  name: 'search_web',
  description: '웹 검색 (Perplexity Sonar AI 요약 + 출처 / Serper 폴백)',
  handler: 'search_web',
  category: 'search',
  tags: ['web', 'search', 'perplexity', 'serper'],
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '검색할 내용' },
      mode: { type: 'string', enum: ['sonar', 'sonar-pro'], description: '검색 모델 (기본: sonar, 고품질: sonar-pro)' },
    },
    required: ['query'],
  },
}
```

### Perplexity API 참고
- 엔드포인트: `POST https://api.perplexity.ai/chat/completions`
- 모델: `sonar` (빠름, 저렴) / `sonar-pro` (고품질, 비쌈)
- 인증: `Authorization: Bearer {api_key}`
- 응답: `{ choices: [{ message: { content: "답변" } }], citations: ["url1", "url2"] }`
- 가격: sonar ~$1/1000req, sonar-pro ~$5/1000req (2025 기준, 최신 확인 필요)

### 테스트
- Perplexity 키 있을 때 → `{ query, answer: "...", sources: [...] }` 반환
- Perplexity 키 없고 Serper 키 있을 때 → `{ query, results: [...], count }` 반환
- 둘 다 없을 때 → API 키 등록 안내 메시지
- timeout 30초 동작 확인
- callExternalApi 에러 매핑 (429 → TOOL_QUOTA_EXHAUSTED 등)

---

## Story 2: execute_code — Bun 샌드박스 코드 실행

### 파일: `packages/server/src/lib/tool-handlers/builtins/execute-code.ts` (신규 생성)

### 하는 일
에이전트가 JavaScript 코드를 제출하면 격리된 Bun subprocess에서 실행, stdout/stderr 반환.

### 구현

```typescript
import type { ToolHandler } from '../types'

export const executeCode: ToolHandler = async (input, _ctx) => {
  const code = String(input.code || '')
  if (!code) return JSON.stringify({ success: false, error: '코드가 비어있습니다.' })
  if (code.length > 10_000) return JSON.stringify({ success: false, error: '코드가 10,000자를 초과합니다.' })

  const timeoutSec = Math.min(Math.max(Number(input.timeout_seconds) || 5, 1), 30)
  const tmpFile = `/tmp/corthex-exec-${Date.now()}-${Math.random().toString(36).slice(2)}.js`

  try {
    await Bun.write(tmpFile, code)
    const proc = Bun.spawn(['bun', 'run', tmpFile], {
      timeout: timeoutSec * 1000,
      env: {},       // 환경변수 완전 차단 (DB_URL, API_KEY 등 접근 불가)
      cwd: '/tmp',   // 프로젝트 디렉토리 접근 차단
    })

    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    const exitCode = await proc.exited

    if (exitCode === 0) {
      return JSON.stringify({ success: true, output: stdout.slice(0, 4000) })
    }
    return JSON.stringify({ success: false, exitCode, error: stderr.slice(0, 2000) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timed out') || msg.includes('timeout')) {
      return JSON.stringify({ success: false, error: `실행 시간 초과 (${timeoutSec}초)` })
    }
    return JSON.stringify({ success: false, error: msg.slice(0, 2000) })
  } finally {
    // 임시 파일 정리
    try {
      const { unlink } = await import('node:fs/promises')
      await unlink(tmpFile)
    } catch { /* 이미 없으면 무시 */ }
  }
}
```

### 등록 — lib/tool-handlers/index.ts에 추가
```typescript
import { executeCode } from './builtins/execute-code'
// ... 기존 등록들 사이에:
registry.register('execute_code', executeCode)
```

### 시드 — seed-common-tools.ts에 추가
```typescript
{
  name: 'execute_code',
  description: 'JavaScript 코드를 실행합니다. 계산, 데이터 변환, 분석에 활용하세요.',
  handler: 'execute_code',
  category: 'compute',
  tags: ['code', 'javascript', 'compute', 'sandbox'],
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string', description: '실행할 JavaScript 코드' },
      timeout_seconds: { type: 'number', description: '제한 시간 (1-30초, 기본 5초)' },
    },
    required: ['code'],
  },
}
```

### 기본 권한
- **manager tier 에이전트만** 기본 할당
- 일반 에이전트는 admin이 수동으로 도구 할당해야 사용 가능
- seed에서 `agent_tools` INSERT 시 `agents.tier = 'manager'` 조건

### ⚠️ 보안 제한 (알려진 문제 — 코드 주석에 반드시 명시)

| 위협 | 차단됨? | 설명 |
|------|---------|------|
| 환경변수 접근 | ✅ | `env: {}` → `process.env` 비어있음 |
| 프로젝트 파일 접근 | ⚠️ 부분 | `cwd: '/tmp'`이지만 절대경로(`/home/...`)로 우회 가능 |
| localhost API 접근 | ❌ | `fetch('http://localhost:3000/api/...')` 가능 |
| 시스템 파일 읽기 | ❌ | `Bun.file('/etc/passwd').text()` 가능 |
| 네트워크 접근 | ❌ | 외부 URL fetch 가능 |
| 무한 루프 | ✅ | timeout으로 차단 |
| 디스크 폭탄 | ❌ | `/tmp`에 대량 파일 생성 가능 |

**v1 전략**: manager tier 제한으로 리스크 관리 (실질적으로 CEO/CTO만 사용)
**v2 로드맵**: Docker/nsjail 네트워크 격리 검토 (별도 Epic)

### 테스트
- `console.log('hello')` → `{ success: true, output: 'hello\n' }`
- `while(true){}` → `{ success: false, error: '실행 시간 초과 (5초)' }`
- `const x = ;` (문법 에러) → `{ success: false, exitCode: 1, error: '...' }`
- `console.log(process.env.DATABASE_URL)` → `{ success: true, output: 'undefined\n' }`
- 실행 후 `/tmp/corthex-exec-*` 파일 남아있지 않은지 확인
- 코드 길이 10,001자 → 거부
- timeout_seconds: 0 → 1초로 클램프 / 31 → 30초로 클램프

---

## Story 3: Playwright MCP 에이전트 연결

### 하는 일
Playwright MCP를 DB에 등록 → 에이전트가 브라우저 조작 가능. MCP 도구는 이미 `agent-loop.ts`에서 `__` 네임스페이스로 실행되므로 **코드 변경 최소**.

### MCP 8-Stage 라이프사이클 (이미 구현됨)
```
RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN
```
- COLD_START_TIMEOUT: 120초 (npx 다운로드 포함)
- SIGTERM_TIMEOUT: 5초 (graceful shutdown)
- 네임스페이스: `playwright_browser__navigate`, `playwright_browser__take_screenshot` 등

### 구현

#### (A) DB 시드 — mcp_server_configs 테이블
```typescript
// seed-mcp-servers.ts 또는 기존 시드 파일에 추가
{
  id: crypto.randomUUID(),      // 고정 UUID (재실행 시 중복 방지)
  displayName: 'Playwright Browser',
  transport: 'stdio',
  command: 'npx',
  args: ['-y', '@playwright/mcp', '--headless'],
  env: {},                       // 추가 환경변수 없음
  isActive: true,
  companyId: null,               // null = 전사 공용 (모든 회사에서 사용 가능)
  createdAt: new Date(),
}
```

스키마 참조: `db/schema.ts` — `mcp_server_configs` 테이블 컬럼:
```
id (uuid PK), displayName, transport, command, args (json),
env (json), isActive (bool), companyId (uuid nullable FK),
createdAt, updatedAt
```

#### (B) agent_mcp_access 시드 — 권한 부여
```typescript
// manager tier 에이전트에 Playwright 접근 권한
// agent_mcp_access 테이블: (agentId uuid, mcpServerId uuid) composite PK
// seed 시: 모든 회사의 manager 에이전트 → Playwright MCP 매핑
```

#### (C) 호환성 확인사항
- **Oracle VPS ARM64**: `.mcp.json`에 이미 chromium 경로 설정됨 → 확인만
- **Windows 로컬**: Playwright가 알아서 chromium 다운로드 (npx -y)
- **동시 세션**: 에이전트 A가 브라우저 쓰는 동안 에이전트 B도 → 각각 별도 프로세스 (agentSessionId로 격리)

#### (D) Admin UI 확인
- `routes/admin/mcp-servers.ts` — MCP CRUD API 이미 존재하는지 확인
- 있으면 UI에서 on/off 가능. 없으면 시드로만 등록

### 에이전트가 사용하게 되는 도구들 (Playwright MCP 제공)
```
playwright_browser__navigate       — URL 이동
playwright_browser__take_screenshot — 스크린샷
playwright_browser__click          — 요소 클릭
playwright_browser__fill_form      — 폼 입력
playwright_browser__snapshot       — DOM 스냅샷
playwright_browser__evaluate       — JS 실행
playwright_browser__press_key      — 키보드 입력
... (총 20+개)
```

### 테스트
- DB에 Playwright MCP 서버 등록 확인
- 에이전트 allTools에 `playwright_browser__*` 도구 포함 확인
- `playwright_browser__navigate` → 실제 페이지 로드
- `playwright_browser__take_screenshot` → 스크린샷 반환
- MCP teardown 후 chromium 프로세스 남아있지 않은지 확인

---

## Story 4: deepwork 턴 확장 (maxTurns 동적화)

### 현재
- `agent-loop.ts`: `for (let turn = 0; turn < 10; turn++)` **하드코딩**
- `RunAgentOptions`에 `maxTurns` 필드 없음
- deepwork 명령(`/deepwork 분석해줘`)이 일반 채팅과 동일한 10턴 제한

### 변경 4단계

#### (A) RunAgentOptions에 maxTurns 추가
```typescript
// engine/types.ts
interface RunAgentOptions {
  ctx: SessionContext
  soul: string
  message: string
  tools?: Tool[]
  maxTurns?: number  // 미지정 시 DEFAULT_MAX_TURNS (10)
}
```

#### (B) agent-loop.ts 루프 변경
```typescript
const DEFAULT_MAX_TURNS = 10
const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS
for (let turn = 0; turn < maxTurns; turn++) {
```

#### (C) done 이벤트에 turnsUsed 추가
```typescript
// SSEEvent 'done' 타입 확장
| { type: 'done'; costUsd: number; tokensUsed: number; turnsUsed?: number }

// yield 시:
yield { type: 'done', costUsd, tokensUsed, turnsUsed: turn + 1 }
```

#### (D) 호출부별 maxTurns 전달

| 호출 위치 | 파일 | maxTurns | 이유 |
|-----------|------|----------|------|
| 일반 채팅 | `routes/workspace/hub.ts` | 10 (기본) | 현재와 동일 |
| deepwork | `routes/workspace/hub.ts` | 50 | 복잡한 분석/코드 실행 |
| call_agent | `builtins/call-agent.ts` | 부모 전파 | 하위 에이전트도 깊은 작업 |
| agora (토론) | `routes/workspace/agora.ts` 등 | 5 | 짧은 발언 |
| argos (트리거) | 해당 라우트 | 20 | 자동 실행 |
| cron (크론) | 해당 라우트 | 15 | 예약 작업 |

#### (E) hub.ts에서 deepwork 감지

현재 `hub.ts`가 `command-router.ts`를 import하지 않음. 3가지 방법:

1. **방법 1** (권장): 프론트엔드에서 `commandType`을 payload에 포함
   ```typescript
   // hub.ts
   const maxTurns = body.commandType === 'deepwork' ? 50 : 10
   ```
   - 프론트엔드 변경 필요: Chat 컴포넌트에서 `/deepwork` 감지 시 payload에 `commandType: 'deepwork'` 추가

2. **방법 2**: hub.ts에서 메시지 파싱
   ```typescript
   const isDeepwork = message.startsWith('/deepwork ')
   const maxTurns = isDeepwork ? 50 : 10
   const cleanMessage = isDeepwork ? message.slice('/deepwork '.length) : message
   ```

3. **방법 3**: `command-router.ts`의 `classifyCommand()` import
   ```typescript
   import { classifyCommand } from '../services/command-router'
   const cmd = classifyCommand(message)
   const maxTurns = cmd.type === 'deepwork' ? 50 : 10
   ```

### 테스트
- `maxTurns` 미지정 → 기본 10턴
- `maxTurns: 3` → 3턴 후 자동 종료
- `maxTurns: 50` + 도구를 계속 호출하는 에이전트 → 50턴까지 실행
- `done` 이벤트에 `turnsUsed` 포함 확인
- `call_agent` 핸드오프 시 부모의 `maxTurns` 전파 확인
- `bunx tsc --noEmit` — `SSEEvent` 타입 확장 후 모든 소비자 정상

---

## Story 5: 통합 + 시드 정리 + 검증 업데이트

### 시드 데이터 최종 정리
- `seed-common-tools.ts`: `search_web` description/schema 업데이트 + `execute_code` 추가
- `seed-mcp-servers.ts` (또는 기존 시드): Playwright MCP 등록
- 기본 soul template 업데이트: 도구 사용 가이드 추가
  ```
  "사용 가능한 도구: search_web(웹 검색), execute_code(코드 실행),
   read_web_page(URL 읽기), send_email(이메일), save_report(보고서 저장) 등"
  ```

### cross-check.sh 규칙 추가
```bash
# 브릿지 연결 확인
grep -q "executeTool" packages/server/src/engine/agent-loop.ts || echo "FAIL: agent-loop.ts에 executeTool 브릿지 없음"

# execute_code 보안 격리 확인
grep -q 'env: {}' packages/server/src/lib/tool-handlers/builtins/execute-code.ts || echo "FAIL: execute_code env 격리 없음"
grep -q "cwd: '/tmp'" packages/server/src/lib/tool-handlers/builtins/execute-code.ts || echo "FAIL: execute_code cwd 격리 없음"

# 새 도구 registry 등록 확인
grep -q "execute_code" packages/server/src/lib/tool-handlers/index.ts || echo "FAIL: execute_code 미등록"
```

### smoke-test.sh 규칙 추가
```bash
# 배포 후 도구 존재 확인 (DB 쿼리 또는 API 호출)
# search_web, execute_code가 tool_definitions에 있는지
```

### 통합 E2E 시나리오 (수동 검증)
1. 에이전트 채팅: "최근 AI 뉴스 검색해줘" → `search_web` tool_use → 출처 포함 답변
2. 에이전트 채팅: "1부터 100까지 소수를 구해줘" → `execute_code` tool_use → 코드 결과
3. Playwright 에이전트: "corthex-hq.com 접속해서 스크린샷 찍어" → 브라우저 동작
4. deepwork: "/deepwork 경쟁사 분석해줘" → 50턴 limit, search_web + execute_code 혼합 사용

---

## 코드 작성 전 반드시 읽어야 할 파일

```
=== Story 0 (브릿지) — 가장 중요, 반드시 전체 읽기 ===
packages/server/src/engine/agent-loop.ts          # 전체 (350줄). 특히 도구 실행 분기
packages/server/src/engine/types.ts               # SessionContext, RunAgentOptions, SSEEvent, ToolCallContext
packages/server/src/lib/tool-executor.ts          # executeTool(), loadAgentTools(), toClaudeTools()
packages/server/src/lib/tool-handlers/registry.ts # HandlerRegistry 클래스 (get, register)
packages/server/src/lib/tool-handlers/types.ts    # ToolHandler, ToolExecContext
packages/server/src/lib/tool-handlers/index.ts    # 65+개 도구 등록 목록
packages/server/src/lib/credential-vault.ts       # vaultGetCredentials 시그니처

=== Story 1 (search_web) ===
packages/server/src/lib/tool-handlers/builtins/search-web.ts  # 현재 Serper 구현 (58줄)
packages/server/src/lib/call-external-api.ts                   # callExternalApi 에러 매핑

=== Story 2 (execute_code) — 패턴 참조 ===
packages/server/src/lib/tool-handlers/builtins/read-web-page.ts   # 가장 간단한 빌트인 패턴
packages/server/src/lib/tool-handlers/builtins/send-email.ts      # 크리덴셜 사용 패턴
packages/server/src/lib/tool-error.ts                              # ToolError 클래스

=== Story 3 (Playwright MCP) ===
packages/server/src/engine/mcp/mcp-manager.ts    # 8-Stage 라이프사이클, getOrSpawnSession, execute
packages/server/src/db/schema.ts                  # mcp_server_configs, agent_mcp_access 테이블 정의
.mcp.json                                         # 현재 MCP 설정 (chromium 경로 등)

=== Story 4 (maxTurns) ===
packages/server/src/routes/workspace/hub.ts       # runAgent 호출 지점
packages/server/src/services/command-router.ts    # classifyCommand(), CommandType, TIMEOUT_MAP
packages/server/src/tool-handlers/builtins/call-agent.ts  # 핸드오프 시 옵션 전파

=== Story 5 (통합) ===
packages/server/src/db/seed-common-tools.ts       # 도구 시드 (search_web 항목)
.claude/hooks/cross-check.sh                      # 일관성 검증 스크립트
.claude/hooks/smoke-test.sh                       # 배포 후 검증 스크립트
```

---

## 구현 순서 (의존성)

```
Story 0 (브릿지) ──→ Story 1 (search_web) ─┐
      │             Story 2 (execute_code)──├──→ Story 5 (통합)
      │             Story 3 (Playwright) ───┘
      └──→ Story 4 (maxTurns) ─────────────────→ Story 5
```

- **Story 0 먼저**. 이것 없이는 1, 2, 3 전부 의미 없음
- **Story 0은 swarm에 맡기지 말 것** — 엔진 코어 수정이라 충돌 위험
- Story 1, 2, 3은 서로 독립 → Story 0 완료 후 **병렬 가능**
- Story 4도 독립 → Story 0과 병렬 가능
- Story 5는 모든 Story 완료 후

---

## 실행 방법

```bash
# 1단계: 계획
/kdh-full-auto-pipeline planning
# → 이 파일 전체를 컨텍스트로 제공

# 2단계: Story 0 단독 구현 (수동 또는 단일 에이전트)
/kdh-full-auto-pipeline story-0-engine-bridge

# 3단계: Story 0 완료 확인 후 나머지 병렬
/kdh-full-auto-pipeline parallel story-1 story-2 story-3 story-4

# 4단계: 통합
/kdh-full-auto-pipeline story-5-integration
```
