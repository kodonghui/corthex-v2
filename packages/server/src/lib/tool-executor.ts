/**
 * 도구 실행 엔진
 *
 * 1. 에이전트에 할당된 도구 로드
 * 2. Claude API tool 정의로 변환
 * 3. 도구 호출 실행 + 결과 반환
 */

import type Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { toolDefinitions, agentTools, departmentKnowledge, toolCalls, reports, activityLogs } from '../db/schema'
import { eq, and, ilike } from 'drizzle-orm'
import { decrypt } from './crypto'

// === Claude API tool 타입 ===
export type ClaudeTool = Anthropic.Messages.Tool

type ToolExecContext = {
  companyId: string
  agentId: string
  sessionId: string
  departmentId: string | null
  userId: string
}

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
 * 도구 실행 — handler 이름에 따라 분기
 */
const TOOL_TIMEOUT_MS = 30_000

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  ctx: ToolExecContext,
  toolRecord: ToolRecord,
): Promise<string> {
  const startTime = Date.now()

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
    const result = await Promise.race([
      runHandler(toolRecord.handler || toolName, input, ctx),
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

/**
 * 핸들러 라우팅 — 각 도구별 실제 로직
 */
async function runHandler(
  handler: string,
  input: Record<string, unknown>,
  ctx: ToolExecContext,
): Promise<string> {
  switch (handler) {
    case 'get_current_time':
      return handleGetCurrentTime()

    case 'calculate':
      return handleCalculate(input)

    case 'search_department_knowledge':
      return handleSearchKnowledge(input, ctx)

    case 'get_company_info':
      return handleGetCompanyInfo(ctx)

    case 'search_web':
      return handleSearchWeb(input)

    case 'create_report':
      return handleCreateReport(input, ctx)

    default:
      return `도구 '${handler}' 의 핸들러가 아직 구현되지 않았습니다.`
  }
}

// === 내장 도구 핸들러 ===

function handleGetCurrentTime(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return JSON.stringify({
    utc: now.toISOString(),
    kst: kst.toISOString().replace('T', ' ').slice(0, 19) + ' KST',
    date: kst.toISOString().slice(0, 10),
    dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][kst.getUTCDay()] + '요일',
  })
}

// 안전한 수학 평가기 (new Function/eval 대신 재귀 파서)
function safeEvalMath(expr: string): number {
  const tokens = expr.replace(/\s+/g, '').replace(/\^/g, '**')
  let pos = 0

  function parseExpr(): number {
    let left = parseTerm()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      const right = parseTerm()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  function parseTerm(): number {
    let left = parsePower()
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++]
      const right = parsePower()
      left = op === '*' ? left * right : left / right
    }
    return left
  }

  function parsePower(): number {
    let base = parseUnary()
    if (pos < tokens.length - 1 && tokens[pos] === '*' && tokens[pos + 1] === '*') {
      pos += 2
      const exp = parsePower()
      base = Math.pow(base, exp)
    }
    return base
  }

  function parseUnary(): number {
    if (tokens[pos] === '-') { pos++; return -parseAtom() }
    if (tokens[pos] === '+') { pos++ }
    return parseAtom()
  }

  function parseAtom(): number {
    if (tokens[pos] === '(') {
      pos++
      const val = parseExpr()
      if (tokens[pos] === ')') pos++
      return val
    }
    const start = pos
    while (pos < tokens.length && /[\d.]/.test(tokens[pos])) pos++
    if (pos === start) throw new Error('unexpected token')
    return parseFloat(tokens.slice(start, pos))
  }

  const result = parseExpr()
  if (!isFinite(result)) throw new Error('invalid result')
  return result
}

function handleCalculate(input: Record<string, unknown>): string {
  const expression = String(input.expression || '')
  if (!expression) return '수식이 비어있습니다.'

  // 안전한 수학 연산만 허용 (숫자, 연산자, 괄호, 공백, 소수점)
  if (!/^[\d\s+\-*/().^]+$/.test(expression)) {
    return '허용되지 않는 문자가 포함되어 있습니다.'
  }

  try {
    // 간단한 재귀 파서로 안전하게 평가
    const result = safeEvalMath(expression)
    return JSON.stringify({ expression, result })
  } catch {
    return `계산 오류: '${expression}'을(를) 처리할 수 없습니다.`
  }
}

async function handleSearchKnowledge(
  input: Record<string, unknown>,
  ctx: ToolExecContext,
): Promise<string> {
  const query = String(input.query || '')
  if (!query) return '검색어가 비어있습니다.'

  if (!ctx.departmentId) {
    return '이 에이전트는 부서에 배정되지 않아 지식 검색을 할 수 없습니다.'
  }

  // 부서별 격리: 자기 부서의 지식만 검색
  const results = await db
    .select({
      title: departmentKnowledge.title,
      content: departmentKnowledge.content,
      category: departmentKnowledge.category,
    })
    .from(departmentKnowledge)
    .where(
      and(
        eq(departmentKnowledge.companyId, ctx.companyId),
        eq(departmentKnowledge.departmentId, ctx.departmentId),
        ilike(departmentKnowledge.content, `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`),
      ),
    )
    .limit(5)

  if (results.length === 0) {
    return `'${query}'에 대한 부서 지식이 없습니다.`
  }

  return JSON.stringify(results)
}

function handleGetCompanyInfo(ctx: ToolExecContext): string {
  return JSON.stringify({
    companyId: ctx.companyId,
    message: '회사 상세 정보는 관리자 권한이 필요합니다.',
  })
}

function handleSearchWeb(input: Record<string, unknown>): string {
  const query = String(input.query || '')
  return JSON.stringify({
    query,
    results: [],
    message: '웹 검색은 현재 개발 중입니다. 추후 외부 API 연동 예정.',
  })
}

async function handleCreateReport(
  input: Record<string, unknown>,
  ctx: ToolExecContext,
): Promise<string> {
  const title = String(input.title || '').trim()
  const content = String(input.content || '').trim()

  if (!title) return JSON.stringify({ error: '보고서 제목이 필요합니다.' })
  if (title.length > 200) return JSON.stringify({ error: '보고서 제목은 200자 이내여야 합니다.' })

  const [report] = await db
    .insert(reports)
    .values({
      companyId: ctx.companyId,
      authorId: ctx.userId,
      title,
      content,
      status: 'draft',
    })
    .returning()

  // 활동 로그 (fire-and-forget)
  db.insert(activityLogs)
    .values({
      companyId: ctx.companyId,
      eventId: crypto.randomUUID(),
      type: 'system',
      phase: 'end',
      actorType: 'agent',
      actorId: ctx.agentId,
      actorName: '',
      action: '보고서 자동 생성',
      detail: title,
    })
    .catch(() => {})

  return JSON.stringify({
    reportId: report.id,
    title: report.title,
    url: `/reports/${report.id}`,
    message: `보고서 "${title}"이(가) 생성되었습니다. [보고서 보기](/reports/${report.id})`,
  })
}
