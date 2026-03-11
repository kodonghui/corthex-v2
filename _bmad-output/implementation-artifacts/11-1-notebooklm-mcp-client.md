# Story 11.1: NotebookLM MCP 클라이언트 연동

Status: ready-for-dev

## Story

As a CEO,
I want 지식 문서로 오디오 브리핑을 생성하는 것을,
so that 이동 중에 음성으로 보고를 들을 수 있다.

## Acceptance Criteria

1. `notebooklm-mcp` Python Stdio 프로세스 연동 — TypeScript에서 `child_process.spawn('python3', ...)` 으로 Python MCP 브릿지 프로세스를 실행하고 JSON stdin/stdout으로 통신
2. 주요 도구 6개 구현 및 레지스트리 등록:
   - `notebooklm_create_notebook` — 여러 소스를 하나의 노트북으로 묶음
   - `notebooklm_add_source` — 기존 노트북에 소스 추가
   - `notebooklm_generate_audio` — 노트북/텍스트 → 오디오 브리핑 생성
   - `notebooklm_get_mindmap` — 마인드맵 Mermaid/JSON 생성
   - `notebooklm_create_slides` — 프레젠테이션 슬라이드 생성
   - `notebooklm_summarize` — 노트북/텍스트 요약
3. 오디오 생성 → 파일 저장 + URL 반환 (비동기, 최대 120초 타임아웃)
4. 텔레그램 전송 연동 — 생성된 음성 파일 URL을 `send_telegram` 도구로 전달 가능
5. Google OAuth 자격증명 — `ctx.getCredentials('google')` 를 통해 credential vault에서 조회
6. 모든 도구가 에이전트에 할당 가능 (tool_definitions DB에 insert + agent_tools 할당)

## Tasks / Subtasks

- [ ] Task 1: NotebookLM Python 브릿지 구현 (AC: #1)
  - [ ] 1.1 `packages/server/scripts/notebooklm-bridge.py` 생성 — stdin JSON → notebooklm-py 호출 → stdout JSON 응답
  - [ ] 1.2 `packages/server/src/lib/notebooklm/bridge.ts` 생성 — `child_process.spawn` 래퍼, 120초 타임아웃, JSON 파싱
  - [ ] 1.3 `packages/server/src/lib/notebooklm/types.ts` 생성 — NotebookLMRequest, NotebookLMResponse 타입
- [ ] Task 2: 도구 핸들러 6개 구현 (AC: #2, #3, #5)
  - [ ] 2.1 `notebooklm-create-notebook.ts` — create_notebook 액션
  - [ ] 2.2 `notebooklm-add-source.ts` — add_source 액션
  - [ ] 2.3 `notebooklm-generate-audio.ts` — generate_audio 액션 (120초 타임아웃)
  - [ ] 2.4 `notebooklm-get-mindmap.ts` — get_mindmap 액션 (mermaid/json 포맷)
  - [ ] 2.5 `notebooklm-create-slides.ts` — create_slides 액션
  - [ ] 2.6 `notebooklm-summarize.ts` — summarize 액션
- [ ] Task 3: 레지스트리 등록 (AC: #2)
  - [ ] 3.1 `packages/server/src/lib/tool-handlers/index.ts` 에 6개 도구 import + registry.register()
- [ ] Task 4: DB 시드 — tool_definitions 테이블에 6개 도구 정의 삽입 (AC: #6)
  - [ ] 4.1 seed 스크립트 또는 마이그레이션에 6개 도구 정의 추가
- [ ] Task 5: 텔레그램 연동 확인 (AC: #4)
  - [ ] 5.1 generate_audio 응답의 audioUrl을 send_telegram 도구에서 사용 가능하도록 JSON 구조 검증

## Dev Notes

### Architecture Constraints (MUST follow)

- **Engine boundary**: 모든 도구 실행은 `engine/agent-loop.ts` → `tool-executor.ts` → `registry.get(handlerName)` 경로만 사용. 직접 import 금지
- **DB access**: 도구 핸들러에서 직접 `db` import 금지. 필요 시 `ctx.getCredentials()` 등 context 메서드만 사용
- **Tool handler 패턴**: `(input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>` — 항상 JSON.stringify 문자열 반환
- **API response**: `{ success: true, ... }` / `{ success: false, message: '...' }` 패턴 (기존 도구 참조)
- **파일명**: kebab-case lowercase
- **Import casing**: `git ls-files` 와 정확히 일치 (Linux CI case-sensitive)

### Existing Tool Handler Pattern (COPY THIS)

참조 파일: `packages/server/src/lib/tool-handlers/builtins/text-to-speech.ts`

```typescript
import type { ToolHandler } from '../types'

export const myTool: ToolHandler = async (input, ctx) => {
  const param = String(input.param || '')
  if (!param) return JSON.stringify({ success: false, message: '필수 입력 누락' })

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google')
  } catch {
    return JSON.stringify({ success: false, message: 'Google API 키 미등록' })
  }

  try {
    // ... 실행 로직
    return JSON.stringify({ success: true, data: result })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
```

### Registry Registration Pattern

참조: `packages/server/src/lib/tool-handlers/index.ts`

```typescript
import { notebooklmCreateNotebook } from './builtins/notebooklm-create-notebook'
// ... 5 more imports
registry.register('notebooklm_create_notebook', notebooklmCreateNotebook)
// ... 5 more registrations
```

### Python Bridge Design

`notebooklm-bridge.py` 는 stdin으로 JSON 수신 → notebooklm-py 라이브러리 호출 → stdout으로 JSON 응답:

```python
#!/usr/bin/env python3
"""NotebookLM MCP Bridge — stdin JSON → notebooklm-py → stdout JSON"""
import sys, json

def main():
    request = json.loads(sys.stdin.read())
    action = request['action']
    # ... notebooklm-py 호출
    result = {"success": True, "notebookId": "...", "outputUrl": "..."}
    print(json.dumps(result))

if __name__ == '__main__':
    main()
```

TypeScript bridge (`bridge.ts`):

```typescript
import { spawn } from 'child_process'
import type { NotebookLMRequest, NotebookLMResponse } from './types'

const BRIDGE_SCRIPT = new URL('../../scripts/notebooklm-bridge.py', import.meta.url).pathname
const BRIDGE_TIMEOUT = 120_000

export async function callNotebookLM(request: NotebookLMRequest): Promise<NotebookLMResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [BRIDGE_SCRIPT], {
      timeout: BRIDGE_TIMEOUT,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = '', stderr = ''
    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })
    proc.on('close', (code) => {
      if (code === 0) {
        try { resolve(JSON.parse(stdout)) }
        catch { reject(new Error(`Invalid JSON from bridge: ${stdout.slice(0, 200)}`)) }
      } else {
        reject(new Error(`NotebookLM bridge failed (code ${code}): ${stderr.slice(0, 500)}`))
      }
    })
    proc.on('error', reject)
    proc.stdin.write(JSON.stringify(request))
    proc.stdin.end()
  })
}
```

### Types (notebooklm/types.ts)

```typescript
export type NotebookLMAction =
  | 'create_notebook'
  | 'add_source'
  | 'generate_audio'
  | 'get_mindmap'
  | 'create_slides'
  | 'summarize'

export type NotebookLMSource = {
  type: 'text' | 'url' | 'file' | 'notebook'
  content: string
  title?: string
}

export type NotebookLMRequest = {
  action: NotebookLMAction
  sources: NotebookLMSource[]
  options?: Record<string, unknown>
  credentials: { googleToken: string }
}

export type NotebookLMResponse = {
  success: boolean
  notebookId?: string
  outputUrl?: string
  outputData?: unknown
  error?: string
}
```

### File Structure (exact paths)

```
packages/server/
  scripts/
    notebooklm-bridge.py        ← Python bridge (stdin/stdout JSON)
  src/
    lib/
      notebooklm/
        bridge.ts               ← child_process.spawn wrapper
        types.ts                ← NotebookLMRequest/Response types
      tool-handlers/
        builtins/
          notebooklm-create-notebook.ts
          notebooklm-add-source.ts
          notebooklm-generate-audio.ts
          notebooklm-get-mindmap.ts
          notebooklm-create-slides.ts
          notebooklm-summarize.ts
        index.ts                ← 6 imports + 6 registry.register() 추가
```

### Tool Definitions DB Schema (for seed)

tool_definitions 테이블 스키마 참조: `packages/server/src/db/schema.ts`

각 도구의 inputSchema 예시:

| 도구명 | required 입력 | optional 입력 |
|--------|--------------|---------------|
| notebooklm_create_notebook | sources (array) | title (string) |
| notebooklm_add_source | notebookId (string), sources (array) | — |
| notebooklm_generate_audio | — | notebookId, text, topic, style ('briefing'/'deep_dive'/'conversation') |
| notebooklm_get_mindmap | — | notebookId, text, format ('mermaid'/'json'/'image') |
| notebooklm_create_slides | — | notebookId, text, slideCount, style ('professional'/'minimal'/'data_heavy') |
| notebooklm_summarize | — | notebookId, text, maxLength |

### Enhancement Plan Reference

상세 도구 사양 + 부서별 활용 시나리오: `_enhancement-plans/02-notebooklm-agent-integration.md` (747줄)

### Testing Standards

- Framework: bun:test
- 단위 테스트 위치: `packages/server/src/__tests__/unit/`
- SDK 모킹 패턴: `packages/server/src/__tests__/helpers/` (sdk-mock.ts, tool-mock.ts, db-mock.ts)
- Bridge 테스트: child_process.spawn mock + JSON 입출력 검증
- Tool handler 테스트: ctx mock + 핸들러 함수 직접 호출

### Dependencies

- `notebooklm-py` Python 패키지 (pip3 install) — 서버 Docker에 Python 포함 필요
- Epic 2 (agent-loop, tool-executor, tool-handlers) — ✅ done
- `ctx.getCredentials('google')` — credential vault (Epic 3) — ✅ done

### Regression Prevention

- 기존 56개 도구 핸들러에 영향 없음 (새 파일 추가만)
- index.ts 수정: import 추가 + register 추가만 (기존 코드 수정 안 함)
- tool-executor.ts: 수정 불필요 (handler 이름으로 registry 조회하므로)

### Project Structure Notes

- `packages/server/scripts/` 디렉토리가 없으면 생성 필요
- `packages/server/src/lib/notebooklm/` 새 디렉토리 생성
- 나머지는 기존 `builtins/` 디렉토리에 파일 추가

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.1] — AC + 기술 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md] — D1 (getDB), D6 (single entry), E8 (public API boundary)
- [Source: _enhancement-plans/02-notebooklm-agent-integration.md] — 상세 도구 사양, 브릿지 아키텍처, DB 스키마
- [Source: packages/server/src/lib/tool-handlers/types.ts] — ToolHandler, ToolExecContext 타입
- [Source: packages/server/src/lib/tool-handlers/index.ts] — 등록 패턴
- [Source: packages/server/src/lib/tool-handlers/builtins/text-to-speech.ts] — 핸들러 구현 패턴
- [Source: packages/server/src/lib/tool-executor.ts] — 도구 실행 엔진 (30초 기본 타임아웃 주의)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
