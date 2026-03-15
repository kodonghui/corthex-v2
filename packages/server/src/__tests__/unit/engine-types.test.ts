import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('engine/types.ts 타입 정의 (E1, E5)', () => {
  test('SessionContext에 9개 readonly 필드 정의', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    const fields = ['cliToken', 'userId', 'companyId', 'depth', 'sessionId', 'startedAt', 'maxDepth', 'visitedAgents', 'runId']
    for (const field of fields) {
      expect(source).toContain(`readonly ${field}`)
    }
    // visitedAgents는 readonly string[]
    expect(source).toContain('readonly visitedAgents: readonly string[]')
    // runId: UUID v4, injected at session start (E17)
    expect(source).toContain('readonly runId: string')
  })

  test('SSEEvent 6종 유니언 타입 정의', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    const eventTypes = ['accepted', 'processing', 'handoff', 'message', 'error', 'done']
    for (const t of eventTypes) {
      expect(source).toContain(`type: '${t}'`)
    }
  })

  test('PreToolHookResult 타입 정의', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    expect(source).toContain('PreToolHookResult')
    expect(source).toContain('allow: boolean')
    expect(source).toContain('reason?: string')
  })

  test('RunAgentOptions 타입 정의', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    expect(source).toContain('RunAgentOptions')
    expect(source).toContain('ctx: SessionContext')
    expect(source).toContain('soul: string')
    expect(source).toContain('message: string')
    expect(source).toContain('tools?: Tool[]')
  })

  test('shared re-export 금지 — engine/types.ts가 shared에서 import되지 않음', () => {
    const sharedDir = join(import.meta.dir, '../../../../shared/src')
    const { execSync } = require('child_process')
    const output = execSync(
      `grep -rn "engine/types" ${sharedDir} 2>/dev/null || true`,
      { encoding: 'utf8' }
    )
    expect(output.trim()).toBe('')
  })
})

describe('TEA P0: SSEEvent discriminated union 필드 검증', () => {
  test('각 SSEEvent variant에 고유 필드 존재', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    // accepted → sessionId
    expect(source).toContain("type: 'accepted'; sessionId: string")
    // handoff → from, to, depth
    expect(source).toContain("from: string; to: string; depth: number")
    // error → code, message
    expect(source).toContain("code: string; message: string")
    // done → costUsd, tokensUsed
    expect(source).toContain("costUsd: number; tokensUsed: number")
  })
})

describe('TEA P1: barrel export (index.ts) — E8 public API barrel', () => {
  test('engine/index.ts exists as E8 public API barrel (exports engine public API only)', () => {
    const { existsSync } = require('fs')
    const indexPath = join(import.meta.dir, '../../engine/index.ts')
    expect(existsSync(indexPath)).toBe(true)
  })

  test('engine/index.ts exports ToolCallContext and BuiltinToolHandler (Story 17.1a)', () => {
    const src = readFileSync(
      join(import.meta.dir, '../../engine/index.ts'), 'utf8'
    )
    expect(src).toContain('ToolCallContext')
    expect(src).toContain('BuiltinToolHandler')
  })
})

describe('TEA P1: server-internal 주석 포함', () => {
  test('types.ts에 shared re-export 금지 주석 존재', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/types.ts'), 'utf8'
    )
    expect(source).toContain('server internal only')
    expect(source).toContain('re-export')
  })
})
