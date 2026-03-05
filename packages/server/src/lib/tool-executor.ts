/**
 * 도구 실행 엔진
 *
 * 1. 에이전트에 할당된 도구 로드
 * 2. Claude API tool 정의로 변환
 * 3. 도구 호출 실행 + 결과 반환
 */

import type Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { toolDefinitions, agentTools, toolCalls } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { registry } from './tool-handlers'
import type { ToolExecContext } from './tool-handlers'

// === Claude API tool 타입 ===
export type ClaudeTool = Anthropic.Messages.Tool
export type { ToolExecContext }

type ToolRecord = {
  id: string
  name: string
  description: string | null
  inputSchema: unknown
  handler: string | null
}

/**
 * 에이전트에 할당된 활성 도구 목록 로드
 */
export async function loadAgentTools(agentId: string, companyId: string): Promise<ToolRecord[]> {
  const result = await db
    .select({
      id: toolDefinitions.id,
      name: toolDefinitions.name,
      description: toolDefinitions.description,
      inputSchema: toolDefinitions.inputSchema,
      handler: toolDefinitions.handler,
    })
    .from(agentTools)
    .innerJoin(toolDefinitions, eq(agentTools.toolId, toolDefinitions.id))
    .where(
      and(
        eq(agentTools.agentId, agentId),
        eq(agentTools.companyId, companyId),
        eq(agentTools.isEnabled, true),
        eq(toolDefinitions.isActive, true),
      ),
    )

  return result
}

/**
 * DB 도구 레코드 → Claude API tool 정의로 변환
 */
export function toClaudeTools(toolRecords: ToolRecord[]): ClaudeTool[] {
  return toolRecords.map((t) => ({
    name: t.name,
    description: t.description || '',
    input_schema: (t.inputSchema as Anthropic.Messages.Tool['input_schema']) || {
      type: 'object' as const,
      properties: {},
    },
  }))
}

/**
 * 입력값 기본 스키마 검증 (required 필드 + type 체크)
 */
function validateInput(
  input: Record<string, unknown>,
  schema: Record<string, unknown>,
): string | null {
  if (!schema || typeof schema !== 'object') return null

  const properties = schema.properties as Record<string, { type?: string }> | undefined
  const required = schema.required as string[] | undefined

  if (required && Array.isArray(required)) {
    for (const field of required) {
      if (input[field] === undefined || input[field] === null || input[field] === '') {
        return `필수 입력 '${field}'이(가) 누락되었습니다.`
      }
    }
  }

  if (properties && typeof properties === 'object') {
    for (const [key, prop] of Object.entries(properties)) {
      const value = input[key]
      if (value === undefined || value === null) continue
      if (prop.type === 'string' && typeof value !== 'string') {
        return `'${key}'은(는) 문자열이어야 합니다.`
      }
      if (prop.type === 'number' && typeof value !== 'number') {
        return `'${key}'은(는) 숫자여야 합니다.`
      }
    }
  }

  return null
}

/**
 * 도구 실행 — handler 이름에 따라 레지스트리에서 조회
 */
const TOOL_TIMEOUT_MS = 30_000

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  ctx: ToolExecContext,
  toolRecord: ToolRecord,
): Promise<string> {
  const startTime = Date.now()

  // 입력 스키마 검증
  if (toolRecord.inputSchema) {
    const error = validateInput(input, toolRecord.inputSchema as Record<string, unknown>)
    if (error) return `[오류] 입력값이 올바르지 않습니다: ${error}`
  }

  // 도구 호출 기록 생성
  const [callLog] = await db
    .insert(toolCalls)
    .values({
      companyId: ctx.companyId,
      sessionId: ctx.sessionId,
      agentId: ctx.agentId,
      toolId: toolRecord.id,
      toolName,
      input,
      status: 'success',
    })
    .returning()

  try {
    let timeoutId: ReturnType<typeof setTimeout>
    const handlerName = toolRecord.handler || toolName
    const fn = registry.get(handlerName)
    if (!fn) {
      const durationMs = Date.now() - startTime
      const msg = `도구 '${handlerName}' 의 핸들러가 아직 구현되지 않았습니다.`
      await db.update(toolCalls).set({ output: msg, durationMs }).where(eq(toolCalls.id, callLog.id))
      return msg
    }

    const result = await Promise.race([
      Promise.resolve(fn(input, ctx)),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TOOL_TIMEOUT')), TOOL_TIMEOUT_MS)
      }),
    ])
    clearTimeout(timeoutId!)

    const durationMs = Date.now() - startTime
    await db
      .update(toolCalls)
      .set({ output: result, durationMs })
      .where(eq(toolCalls.id, callLog.id))

    return result
  } catch (err) {
    clearTimeout(timeoutId!)
    const durationMs = Date.now() - startTime
    const isTimeout = err instanceof Error && err.message === 'TOOL_TIMEOUT'
    const errMsg = isTimeout
      ? '도구 응답 시간이 초과되었습니다 (30초)'
      : err instanceof Error ? err.message : '도구 실행 실패'

    await db
      .update(toolCalls)
      .set({ output: errMsg, status: isTimeout ? 'timeout' : 'error', durationMs })
      .where(eq(toolCalls.id, callLog.id))

    return `[오류] ${errMsg}`
  }
}
