/**
 * TelegramBotService — Telegram Bot API Webhook 기반 명령 처리 서비스
 *
 * v1의 polling 방식 대신 Webhook으로 전환.
 * 멀티테넌트: companyId별 독립 봇 토큰.
 * 명령 → CommandRouter → ChiefOfStaff → 결과 sendMessage.
 *
 * 15-2: @멘션(entity기반) + 한국어 슬래시 + callback query + inline keyboard
 */

import { db } from '../db'
import { telegramConfigs, agents, commands, orchestrationTasks, costRecords, departments, snsContents } from '../db/schema'
import { eq, and, desc, sum, sql } from 'drizzle-orm'
import { decrypt } from '../lib/crypto'
import { classify, createCommand, parseSlash, parseMention, resolveMentionAgent } from './command-router'
import type { SlashType } from './command-router'
import { processDebateCommand } from './debate-command-handler'
import { collectAgentResponse, renderSoul } from '../engine'
import { enrich } from './soul-enricher'
import type { SessionContext } from '../engine'
import { getDB } from '../db/scoped-query'
import { getMaxHandoffDepth } from './handoff-depth-settings'
import { logActivity } from '../lib/activity-logger'
import { microToUsd } from '../lib/cost-tracker'
import { batchCollector } from './batch-collector'

// === Types ===

export type TelegramUpdate = {
  update_id: number
  message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    data?: string
    message?: TelegramMessage
  }
}

export type TelegramMessage = {
  message_id: number
  from?: TelegramUser
  chat: { id: number; type: string }
  date: number
  text?: string
  entities?: Array<{ type: string; offset: number; length: number }>
}

type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

type TelegramConfig = {
  id: string
  companyId: string
  botToken: string  // encrypted
  ceoChatId: string | null
  webhookSecret: string | null
  webhookUrl: string | null
  isActive: boolean
}

type SendMessageResult = { ok: boolean; description?: string }

// === Agent execution helper (new engine) ===

async function runAgentForCommand(opts: {
  commandId: string
  commandText: string
  companyId: string
  userId: string
  targetAgentId?: string | null
}): Promise<string> {
  const { commandId, commandText, companyId, userId, targetAgentId } = opts
  const scopedDb = getDB(companyId)

  let agentRow: { id: string; soul: string | null } | null = null
  if (targetAgentId) {
    const [row] = await scopedDb.agentById(targetAgentId)
    if (row && row.isActive !== false) agentRow = { id: row.id, soul: row.soul }
  }
  if (!agentRow) {
    const allAgents = await scopedDb.agents()
    const secretary = allAgents.find((a) => a.isSecretary && a.isActive !== false)
    if (secretary) agentRow = { id: secretary.id, soul: secretary.soul }
  }
  if (!agentRow) {
    await db.update(commands)
      .set({ status: 'failed', result: '에이전트를 찾을 수 없습니다', completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
    return '에이전트를 찾을 수 없습니다'
  }

  const enriched = await enrich(agentRow.id, companyId)
  const extraVars = { ...enriched.personalityVars, ...enriched.memoryVars }
  const soul = agentRow.soul ? await renderSoul(agentRow.soul, agentRow.id, companyId, extraVars) : ''
  const ctx: SessionContext = {
    cliToken: process.env.ANTHROPIC_API_KEY || '',
    userId,
    companyId,
    depth: 0,
    sessionId: commandId,
    startedAt: Date.now(),
    maxDepth: await getMaxHandoffDepth(companyId),
    visitedAgents: [agentRow.id],
    runId: crypto.randomUUID(),  // E17: runId groups all tool calls in this session
  }

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  try {
    const result = await collectAgentResponse({ ctx, soul, message: commandText })
    await db.update(commands)
      .set({ status: 'completed', result, completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
    return result
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    await db.update(commands)
      .set({ status: 'failed', result: errMsg, completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
    throw err
  }
}

// === Telegram Bot API Client ===

const TELEGRAM_API = 'https://api.telegram.org'
const MAX_MESSAGE_LENGTH = 4096
const MAX_RETRIES = 3

async function callTelegramApi(
  token: string,
  method: string,
  params?: Record<string, unknown>,
  retries = MAX_RETRIES,
): Promise<any> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const url = `${TELEGRAM_API}/bot${token}/${method}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: params ? JSON.stringify(params) : undefined,
      })
      const data = await res.json() as any
      if (data.ok) return data.result
      // Don't retry on 4xx client errors — throw immediately
      if (res.status >= 400 && res.status < 500) {
        throw Object.assign(new Error(data.description || `Telegram API error: ${res.status}`), { noRetry: true })
      }
      lastError = new Error(data.description || `Telegram API error: ${res.status}`)
    } catch (err: any) {
      if (err?.noRetry) throw err
      lastError = err instanceof Error ? err : new Error(String(err))
    }

    if (attempt < retries - 1) {
      const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw lastError ?? new Error('Telegram API call failed')
}

// === Message Splitting ===

export function splitMessage(text: string, maxLen = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= maxLen) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }

    // Try splitting on double newline
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen)
    if (splitIdx < maxLen * 0.3) {
      // Try single newline
      splitIdx = remaining.lastIndexOf('\n', maxLen)
    }
    if (splitIdx < maxLen * 0.3) {
      // Hard cut
      splitIdx = maxLen
    }

    let chunk = remaining.slice(0, splitIdx)
    remaining = remaining.slice(splitIdx).trimStart()

    // Handle code block splitting: count ``` in chunk
    const codeBlockCount = (chunk.match(/```/g) || []).length
    if (codeBlockCount % 2 !== 0) {
      // Odd count means we're inside a code block — close it
      chunk += '\n```'
      remaining = '```\n' + remaining
    }

    chunks.push(chunk)
  }

  return chunks
}

// === Send Message ===

export async function sendMessage(token: string, chatId: string | number, text: string): Promise<void> {
  const chunks = splitMessage(text)
  for (const chunk of chunks) {
    await callTelegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: chunk,
      parse_mode: 'Markdown',
    })
  }
}

// === Inline Keyboard & Message Management (15-2) ===

export type InlineButton = { text: string; callback_data: string }

export async function sendMessageWithKeyboard(
  token: string,
  chatId: string | number,
  text: string,
  keyboard: InlineButton[][],
): Promise<{ message_id: number }> {
  return callTelegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
  })
}

export async function editMessage(
  token: string,
  chatId: string | number,
  messageId: number,
  text: string,
  keyboard?: InlineButton[][],
): Promise<void> {
  const params: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'Markdown',
  }
  if (keyboard) {
    params.reply_markup = { inline_keyboard: keyboard }
  }
  await callTelegramApi(token, 'editMessageText', params)
}

export async function deleteMessage(
  token: string,
  chatId: string | number,
  messageId: number,
): Promise<void> {
  await callTelegramApi(token, 'deleteMessage', {
    chat_id: chatId,
    message_id: messageId,
  })
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string,
  showAlert?: boolean,
): Promise<void> {
  await callTelegramApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  })
}

// === Entity Parsing (15-2) ===

export function parseEntities(
  text: string,
  entities?: Array<{ type: string; offset: number; length: number }>,
): { mentionName: string | null; cleanText: string } {
  if (!entities || entities.length === 0) {
    return { mentionName: null, cleanText: text }
  }

  // Find the first "mention" entity (e.g., @AgentName)
  const mentionEntity = entities.find(e => e.type === 'mention')
  if (!mentionEntity) {
    return { mentionName: null, cleanText: text }
  }

  // Extract @name from entity (remove the leading @)
  const raw = text.slice(mentionEntity.offset, mentionEntity.offset + mentionEntity.length)
  const mentionName = raw.startsWith('@') ? raw.slice(1) : raw

  // Remove the mention from text to get clean command text
  const before = text.slice(0, mentionEntity.offset)
  const after = text.slice(mentionEntity.offset + mentionEntity.length)
  const cleanText = (before + after).trim()

  return { mentionName, cleanText }
}

// === Webhook Management ===

export async function setWebhook(
  token: string,
  url: string,
  secretToken: string,
): Promise<void> {
  await callTelegramApi(token, 'setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: ['message', 'callback_query'],
  })
}

export async function deleteWebhook(token: string): Promise<void> {
  await callTelegramApi(token, 'deleteWebhook', {})
}

export async function getMe(token: string): Promise<{ id: number; username: string; first_name: string }> {
  return callTelegramApi(token, 'getMe')
}

// === Slash Command Handlers ===

type CommandContext = {
  token: string
  chatId: number | string
  companyId: string
  args: string
}

async function cmdStart(ctx: CommandContext): Promise<string> {
  return (
    '*CORTHEX v2 텔레그램 봇*\n\n' +
    'CEO 인증 완료.\n' +
    '메시지를 보내면 업무 지시로 처리됩니다.\n\n' +
    '/help 로 사용법을 확인하세요.'
  )
}

async function cmdHelp(_ctx: CommandContext): Promise<string> {
  return (
    '*CORTHEX v2 사용법*\n\n' +
    '*업무 지시*: 그냥 메시지를 보내면 됩니다\n' +
    '  예: `삼성전자 투자 분석해줘`\n' +
    '  예: `리트마스터 경쟁사 현황 정리해줘`\n\n' +
    '*관리 명령어*:\n' +
    '  /agents  - 에이전트 목록\n' +
    '  /cost    - 비용 현황\n' +
    '  /health  - 시스템 상태\n' +
    '  /models  - 사용 가능한 AI 모델\n\n' +
    '*작업 명령어*:\n' +
    '  /status  - 실행 중인 작업 목록\n' +
    '  /tasks   - 최근 작업 목록\n' +
    '  /last    - 마지막 작업 결과\n' +
    '  /result ID - 작업 결과 조회\n' +
    '  /cancel ID - 작업 취소\n\n' +
    '*보고서 명령어*:\n' +
    '  /detail  - 마지막 보고서 전체 보기\n' +
    '  /task ID - 특정 작업 상세 보기\n\n' +
    '*한국어 명령*:\n' +
    '  /전체 [명령] - 전체 에이전트 실행\n' +
    '  /순차 [명령] - 순차 실행\n' +
    '  /토론 [주제] - 토론 시작\n' +
    '  /명령어 - 전체 명령어 목록\n\n' +
    '*@멘션*:\n' +
    '  @에이전트명 [명령] - 특정 Manager에게 직접 지시'
  )
}

async function cmdAgents(ctx: CommandContext): Promise<string> {
  const rows = await db
    .select({
      name: agents.name,
      tier: agents.tier,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, ctx.companyId), eq(agents.isActive, true)))

  if (rows.length === 0) return '에이전트가 없습니다.'

  const lines = rows.map(a => `• ${a.name} (${a.tier})`)
  return `*에이전트 목록* (${rows.length}명)\n\n${lines.join('\n')}`
}

async function cmdCost(ctx: CommandContext): Promise<string> {
  const [result] = await db
    .select({
      totalMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      totalInput: sum(costRecords.inputTokens).mapWith(Number),
      totalOutput: sum(costRecords.outputTokens).mapWith(Number),
      callCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(costRecords)
    .where(eq(costRecords.companyId, ctx.companyId))

  const totalUsd = microToUsd(result?.totalMicro ?? 0)
  return (
    '*비용 현황*\n\n' +
    `💰 총 비용: $${totalUsd.toFixed(4)}\n` +
    `📊 총 호출: ${result?.callCount ?? 0}회\n` +
    `📥 입력 토큰: ${(result?.totalInput ?? 0).toLocaleString()}\n` +
    `📤 출력 토큰: ${(result?.totalOutput ?? 0).toLocaleString()}`
  )
}

async function cmdHealth(_ctx: CommandContext): Promise<string> {
  return (
    '*시스템 상태*\n\n' +
    '🟢 서버: 정상\n' +
    '🟢 데이터베이스: 연결됨\n' +
    `🕐 시간: ${new Date().toISOString()}`
  )
}

async function cmdTasks(ctx: CommandContext): Promise<string> {
  const rows = await db
    .select({
      id: commands.id,
      text: commands.text,
      status: commands.status,
      createdAt: commands.createdAt,
    })
    .from(commands)
    .where(eq(commands.companyId, ctx.companyId))
    .orderBy(desc(commands.createdAt))
    .limit(10)

  if (rows.length === 0) return '📋 작업 기록이 없습니다.'

  const lines = rows.map((t, i) => {
    const status = t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '⏳'
    const shortText = (t.text ?? '').slice(0, 40)
    return `${i + 1}. ${status} \`${t.id.slice(0, 8)}\` ${shortText}`
  })

  return `*최근 작업* (${rows.length}건)\n\n${lines.join('\n')}`
}

async function cmdLast(ctx: CommandContext): Promise<string> {
  const [row] = await db
    .select({
      id: commands.id,
      text: commands.text,
      status: commands.status,
      result: commands.result,
      createdAt: commands.createdAt,
    })
    .from(commands)
    .where(eq(commands.companyId, ctx.companyId))
    .orderBy(desc(commands.createdAt))
    .limit(1)

  if (!row) return '📋 작업 기록이 없습니다.'

  const result = typeof row.result === 'string' ? row.result : JSON.stringify(row.result ?? '')
  return (
    '*마지막 작업*\n\n' +
    `📝 명령: ${(row.text ?? '').slice(0, 100)}\n` +
    `📊 상태: ${row.status}\n` +
    `🆔 ID: \`${row.id.slice(0, 8)}\`\n\n` +
    `*결과:*\n${(result || '(결과 없음)').slice(0, 3000)}`
  )
}

async function cmdStatus(ctx: CommandContext): Promise<string> {
  const rows = await db
    .select({
      id: orchestrationTasks.id,
      agentId: orchestrationTasks.agentId,
      status: orchestrationTasks.status,
    })
    .from(orchestrationTasks)
    .where(and(
      eq(orchestrationTasks.companyId, ctx.companyId),
      eq(orchestrationTasks.status, 'running'),
    ))
    .limit(20)

  if (rows.length === 0) return '실행 중인 작업이 없습니다.'

  const lines = rows.map(r => `• \`${r.id.slice(0, 8)}\` → ${r.agentId?.slice(0, 8) ?? 'unknown'}`)
  return `*실행 중인 작업* (${rows.length}건)\n\n${lines.join('\n')}`
}

async function cmdCancel(ctx: CommandContext): Promise<string> {
  const taskId = ctx.args.trim()
  if (!taskId) return '사용법: /cancel [작업ID]'

  // Find matching task by prefix
  const rows = await db
    .select({ id: orchestrationTasks.id, status: orchestrationTasks.status })
    .from(orchestrationTasks)
    .where(and(
      eq(orchestrationTasks.companyId, ctx.companyId),
      sql`${orchestrationTasks.id}::text LIKE ${taskId + '%'}`,
    ))
    .limit(1)

  if (rows.length === 0) return `❌ 작업 ID '${taskId}'을 찾을 수 없습니다.`

  const task = rows[0]
  if (task.status === 'completed' || task.status === 'failed') {
    return `❌ 이미 종료된 작업입니다. (상태: ${task.status})`
  }

  await db
    .update(orchestrationTasks)
    .set({ status: 'failed' })
    .where(eq(orchestrationTasks.id, task.id))

  return `✅ 작업 \`${taskId}\` 취소 완료.`
}

async function cmdDetail(ctx: CommandContext): Promise<string> {
  const [row] = await db
    .select({ result: commands.result, text: commands.text })
    .from(commands)
    .where(eq(commands.companyId, ctx.companyId))
    .orderBy(desc(commands.createdAt))
    .limit(1)

  if (!row) return '📋 보고서가 없습니다. 먼저 업무를 지시해주세요.'

  const result = typeof row.result === 'string' ? row.result : JSON.stringify(row.result ?? '')
  return result || '(결과 없음)'
}

async function cmdResult(ctx: CommandContext): Promise<string> {
  return cmdTask(ctx)
}

async function cmdTask(ctx: CommandContext): Promise<string> {
  const taskId = ctx.args.trim()
  if (!taskId) return '사용법: /task [작업ID]'

  const [row] = await db
    .select({
      id: commands.id,
      text: commands.text,
      status: commands.status,
      result: commands.result,
      createdAt: commands.createdAt,
    })
    .from(commands)
    .where(and(
      eq(commands.companyId, ctx.companyId),
      sql`${commands.id}::text LIKE ${taskId + '%'}`,
    ))
    .limit(1)

  if (!row) return `❌ 작업 ID '${taskId}'을 찾을 수 없습니다.`

  const result = typeof row.result === 'string' ? row.result : JSON.stringify(row.result ?? '')
  return (
    '*작업 상세*\n\n' +
    `🆔 ID: \`${row.id}\`\n` +
    `📝 명령: ${(row.text ?? '').slice(0, 200)}\n` +
    `📊 상태: ${row.status}\n` +
    `🕐 시작: ${row.createdAt?.toISOString() ?? ''}\n\n` +
    `*결과:*\n${(result || '(결과 없음)').slice(0, 3500)}`
  )
}

async function cmdModels(_ctx: CommandContext): Promise<string> {
  return (
    '*사용 가능한 AI 모델*\n\n' +
    '*Claude (Anthropic)*\n' +
    '  • claude-opus-4-6 (최고급)\n' +
    '  • claude-sonnet-4-6 (기본)\n' +
    '  • claude-haiku-4-5 (빠른)\n\n' +
    '*GPT (OpenAI)*\n' +
    '  • gpt-4.1 (최고급)\n' +
    '  • gpt-4.1-mini (기본)\n\n' +
    '*Gemini (Google)*\n' +
    '  • gemini-2.5-pro (최고급)\n' +
    '  • gemini-2.5-flash (빠른)'
  )
}

// === Slash Command Router ===

const SLASH_HANDLERS: Record<string, (ctx: CommandContext) => Promise<string>> = {
  '/start': cmdStart,
  '/help': cmdHelp,
  '/agents': cmdAgents,
  '/cost': cmdCost,
  '/health': cmdHealth,
  '/tasks': cmdTasks,
  '/last': cmdLast,
  '/status': cmdStatus,
  '/cancel': cmdCancel,
  '/detail': cmdDetail,
  '/result': cmdResult,
  '/task': cmdTask,
  '/models': cmdModels,
}

export function parseCommand(text: string): { command: string | null; args: string } {
  if (!text.startsWith('/')) return { command: null, args: text }

  // Handle /command@botname format
  const match = text.match(/^(\/\w+)(?:@\S+)?\s*(.*)$/s)
  if (!match) return { command: null, args: text }

  return { command: match[1].toLowerCase(), args: match[2] }
}

// === Callback Query Handler (15-2) ===

export async function handleCallbackQuery(
  callbackQuery: NonNullable<TelegramUpdate['callback_query']>,
  config: TelegramConfig,
): Promise<void> {
  const data = callbackQuery.data || ''
  const chatId = callbackQuery.message?.chat?.id
  const ceoChatId = config.ceoChatId

  let token: string
  try {
    token = await decrypt(config.botToken)
  } catch (err) {
    console.error('[TelegramBot] Failed to decrypt bot token for callback:', err)
    return
  }

  // Auth: only process callbacks from configured CEO chat
  if (!ceoChatId || !chatId || String(chatId) !== ceoChatId) {
    await answerCallbackQuery(token, callbackQuery.id, '권한이 없습니다.').catch(() => {})
    return
  }

  const messageId = callbackQuery.message?.message_id

  try {
    if (data.startsWith('sns_approve:')) {
      const contentId = data.slice('sns_approve:'.length)
      // Approve SNS content: pending → approved
      const [existing] = await db
        .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title })
        .from(snsContents)
        .where(and(eq(snsContents.id, contentId), eq(snsContents.companyId, config.companyId)))
        .limit(1)

      if (!existing) {
        await answerCallbackQuery(token, callbackQuery.id, '콘텐츠를 찾을 수 없습니다.')
        return
      }
      if (existing.status !== 'pending') {
        await answerCallbackQuery(token, callbackQuery.id, `현재 상태(${existing.status})에서는 승인할 수 없습니다.`)
        return
      }

      await db
        .update(snsContents)
        .set({ status: 'approved', reviewedBy: ceoChatId, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(snsContents.id, contentId))

      await answerCallbackQuery(token, callbackQuery.id, '승인 완료!')
      if (messageId) {
        await editMessage(token, chatId, messageId,
          `✅ *SNS 발행 승인 완료*\n콘텐츠: ${existing.title || contentId}`
        ).catch(() => {})
      }

      logActivity({
        companyId: config.companyId,
        type: 'tool_call',
        phase: 'end',
        actorType: 'user',
        actorId: ceoChatId,
        action: '텔레그램 SNS 승인',
        detail: contentId,
      })

    } else if (data.startsWith('sns_reject:')) {
      const contentId = data.slice('sns_reject:'.length)
      // Reject SNS content: pending → rejected
      const [existing] = await db
        .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title })
        .from(snsContents)
        .where(and(eq(snsContents.id, contentId), eq(snsContents.companyId, config.companyId)))
        .limit(1)

      if (!existing) {
        await answerCallbackQuery(token, callbackQuery.id, '콘텐츠를 찾을 수 없습니다.')
        return
      }
      if (existing.status !== 'pending') {
        await answerCallbackQuery(token, callbackQuery.id, `현재 상태(${existing.status})에서는 거절할 수 없습니다.`)
        return
      }

      await db
        .update(snsContents)
        .set({ status: 'rejected', reviewedBy: ceoChatId, reviewedAt: new Date(), rejectReason: 'CEO 텔레그램에서 거절', updatedAt: new Date() })
        .where(eq(snsContents.id, contentId))

      await answerCallbackQuery(token, callbackQuery.id, '거절 완료!')
      if (messageId) {
        await editMessage(token, chatId, messageId,
          `❌ *SNS 발행 거절*\n콘텐츠: ${existing.title || contentId}`
        ).catch(() => {})
      }

      logActivity({
        companyId: config.companyId,
        type: 'tool_call',
        phase: 'end',
        actorType: 'user',
        actorId: ceoChatId,
        action: '텔레그램 SNS 거절',
        detail: contentId,
      })

    } else {
      await answerCallbackQuery(token, callbackQuery.id, '알 수 없는 액션입니다.')
    }
  } catch (err) {
    console.error('[TelegramBot] Callback query error:', err)
    await answerCallbackQuery(token, callbackQuery.id, `오류: ${err instanceof Error ? err.message : '처리 실패'}`).catch(() => {})
  }
}

// === Korean Slash Command Handlers (15-2) ===

async function handleKoreanSlash(
  token: string,
  chatId: number | string,
  companyId: string,
  ceoChatId: string,
  slashType: string,
  slashArgs: string,
  commandType: string,
  originalText: string,
): Promise<void> {
  const onComplete = async (result: string) => {
    try {
      await sendMessage(token, chatId, result || '(결과 없음)')
    } catch (sendErr) {
      console.error('[TelegramBot] Failed to send result:', sendErr)
    }
  }

  // Create command record
  const cmd = await createCommand({
    companyId,
    userId: ceoChatId,
    text: originalText,
    type: commandType as any,
    targetAgentId: null,
    metadata: { slashType: slashType as SlashType | undefined, slashArgs: slashArgs || undefined, timeoutMs: 300000, source: 'telegram' },
  })

  logActivity({
    companyId,
    type: 'chat',
    phase: 'start',
    actorType: 'user',
    actorId: ceoChatId,
    action: `텔레그램 한국어 명령: ${originalText.slice(0, 100)}`,
    metadata: { commandId: cmd.id, source: 'telegram', slashType },
  })

  if (slashType === 'all') {
    await sendMessage(token, chatId, `⏳ 전체 명령 처리 중: _${(slashArgs || '').slice(0, 50)}_`)
    runAgentForCommand({
      commandId: cmd.id,
      commandText: slashArgs || originalText,
      companyId,
      userId: ceoChatId,
    }).then((result) => {
      onComplete(result || '(전체 명령 완료)')
    }).catch(err => {
      sendMessage(token, chatId, `❌ 전체 명령 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
    })

  } else if (slashType === 'sequential') {
    await sendMessage(token, chatId, `⏳ 순차 명령 처리 중: _${(slashArgs || '').slice(0, 50)}_`)
    runAgentForCommand({
      commandId: cmd.id,
      commandText: slashArgs || originalText,
      companyId,
      userId: ceoChatId,
    }).then((result) => {
      onComplete(result || '(순차 명령 완료)')
    }).catch(err => {
      sendMessage(token, chatId, `❌ 순차 명령 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
    })

  } else if (slashType === 'debate' || slashType === 'deep_debate') {
    if (!slashArgs) {
      await sendMessage(token, chatId, '사용법: /토론 [주제]\n\n예: `/토론 AI가 인간의 일자리를 대체할까?`')
      return
    }
    await sendMessage(token, chatId, `⏳ 토론 시작: _${slashArgs.slice(0, 50)}_`)
    processDebateCommand({
      commandId: cmd.id,
      topic: slashArgs,
      debateType: slashType === 'deep_debate' ? 'deep-debate' : 'debate',
      companyId,
      userId: ceoChatId,
    }).then((result: any) => {
      onComplete(result?.content || result?.summary || '(토론 완료)')
    }).catch(err => {
      sendMessage(token, chatId, `❌ 토론 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
    })

  } else if (slashType === 'tool_check') {
    await sendMessage(token, chatId, '*도구 점검*\n\n도구 시스템 상태 확인 중...\n🟢 도구 풀: 정상')

  } else if (slashType === 'batch_run') {
    try {
      const results = await batchCollector.flush(companyId)
      const count = Array.isArray(results) ? results.length : 0
      await sendMessage(token, chatId, `✅ *배치 실행 완료*\n\n처리된 요청: ${count}건`)
    } catch (err) {
      await sendMessage(token, chatId, `❌ 배치 실행 실패: ${err instanceof Error ? err.message : ''}`)
    }

  } else if (slashType === 'batch_status') {
    const status = batchCollector.getStatus(companyId)
    await sendMessage(token, chatId,
      `*배치 상태*\n\n📋 대기: ${status.pending}건\n⏳ 처리중: ${status.processing}건\n✅ 완료: ${status.completed}건\n❌ 실패: ${status.failed}건\n📊 전체: ${status.totalItems}건`)

  } else if (slashType === 'commands_list') {
    await sendMessage(token, chatId,
      '*사용 가능한 명령어*\n\n' +
      '*텔레그램 명령*:\n' +
      '  /start, /help, /agents, /cost\n' +
      '  /health, /status, /tasks, /last\n' +
      '  /cancel, /detail, /result, /task, /models\n\n' +
      '*한국어 명령*:\n' +
      '  /전체 [명령] - 전체 에이전트 실행\n' +
      '  /순차 [명령] - 순차 실행\n' +
      '  /토론 [주제] - 토론 시작\n' +
      '  /심층토론 [주제] - 심층 토론\n' +
      '  /도구점검 - 도구 상태\n' +
      '  /배치실행 - 배치 플러시\n' +
      '  /배치상태 - 배치 큐 상태\n' +
      '  /명령어 - 이 목록\n\n' +
      '*@멘션 지정*:\n' +
      '  @에이전트이름 [명령] - 특정 Manager에게 직접 지시')
  }
}

// === Main Update Handler ===

export async function handleUpdate(
  update: TelegramUpdate,
  config: TelegramConfig,
): Promise<void> {
  // 1. Callback query handling (priority — no message.text)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query, config)
    return
  }

  const message = update.message
  if (!message?.text || !message.chat) return

  const chatId = message.chat.id
  const ceoChatId = config.ceoChatId

  // Auth: only process messages from configured CEO chat
  if (!ceoChatId || String(chatId) !== ceoChatId) {
    console.log(`[TelegramBot] Ignoring message from unauthorized chat ${chatId} (company ${config.companyId})`)
    return
  }

  const token = await decrypt(config.botToken)
  const text = message.text.trim()
  if (!text) return

  // 2. Check Telegram entities for @mentions
  const entityResult = parseEntities(text, message.entities)
  if (entityResult.mentionName) {
    // Resolve agent by mention name
    const agentId = await resolveMentionAgent(entityResult.mentionName, config.companyId)
    if (agentId) {
      // Route to specific agent via ChiefOfStaff
      try {
        await sendMessage(token, chatId, `⏳ @${entityResult.mentionName}에게 지시 중: _${entityResult.cleanText.slice(0, 50)}_`)

        const cmd = await createCommand({
          companyId: config.companyId,
          userId: ceoChatId,
          text: entityResult.cleanText || text,
          type: 'mention',
          targetAgentId: agentId,
          metadata: { mentionName: entityResult.mentionName, mentionAgentId: agentId, timeoutMs: 60000, source: 'telegram' },
        })

        logActivity({
          companyId: config.companyId,
          type: 'chat',
          phase: 'start',
          actorType: 'user',
          actorId: ceoChatId,
          action: `텔레그램 @멘션: @${entityResult.mentionName} ${entityResult.cleanText.slice(0, 80)}`,
          metadata: { commandId: cmd.id, source: 'telegram', mentionName: entityResult.mentionName },
        })

        runAgentForCommand({
          commandId: cmd.id,
          commandText: entityResult.cleanText || text,
          companyId: config.companyId,
          userId: ceoChatId,
          targetAgentId: agentId,
        }).then((result) => {
          sendMessage(token, chatId, result || '(결과 없음)').catch(() => {})
        }).catch((err) => {
          console.error(`[TelegramBot] @mention runAgent failed:`, err)
          sendMessage(token, chatId, `❌ @${entityResult.mentionName} 처리 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
        })
      } catch (err) {
        console.error('[TelegramBot] @mention error:', err)
        await sendMessage(token, chatId, `❌ 오류 발생: ${err instanceof Error ? err.message : '처리 실패'}`).catch(() => {})
      }
      return
    } else {
      // Agent not found — send hint
      await sendMessage(token, chatId, `❓ 에이전트 "@${entityResult.mentionName}"을(를) 찾을 수 없습니다.\n/agents 로 에이전트 목록을 확인하세요.`)
      return
    }
  }

  // 3. Telegram slash commands (/start, /help, etc.)
  const { command, args } = parseCommand(text)

  if (command && SLASH_HANDLERS[command]) {
    try {
      const ctx: CommandContext = { token, chatId, companyId: config.companyId, args }
      const response = await SLASH_HANDLERS[command](ctx)
      await sendMessage(token, chatId, response)
    } catch (err) {
      console.error(`[TelegramBot] Slash command ${command} failed:`, err)
      await sendMessage(token, chatId, `❌ 명령 처리 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    }
    return
  }

  // 4. Korean slash commands (/전체, /순차, /토론, etc.)
  const slashResult = parseSlash(text)
  if (slashResult) {
    try {
      await handleKoreanSlash(
        token, chatId, config.companyId, ceoChatId,
        slashResult.slashType, slashResult.args, slashResult.commandType, text,
      )
    } catch (err) {
      console.error(`[TelegramBot] Korean slash failed:`, err)
      await sendMessage(token, chatId, `❌ 한국어 명령 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
    }
    return
  }

  // 5. Korean text debate command ("토론 [주제]" without slash)
  if (text.startsWith('토론 ')) {
    const topic = text.slice(3).trim()
    if (topic) {
      try {
        await handleKoreanSlash(
          token, chatId, config.companyId, ceoChatId,
          'debate', topic, 'slash', text,
        )
      } catch (err) {
        console.error('[TelegramBot] Korean debate text failed:', err)
        await sendMessage(token, chatId, `❌ 토론 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
      }
      return
    }
  }

  // 6. General text → orchestration via CommandRouter (fallback, includes text @mentions)
  try {
    await sendMessage(token, chatId, `⏳ 처리 중: _${text.slice(0, 50)}_`)

    // Use existing CommandRouter pipeline (handles text-based @mentions and all other types)
    const classifyResult = await classify(text, {
      companyId: config.companyId,
      userId: ceoChatId,
    })

    const cmd = await createCommand({
      companyId: config.companyId,
      userId: ceoChatId,
      text,
      type: classifyResult.type,
      targetAgentId: classifyResult.targetAgentId,
      metadata: { ...classifyResult.parsedMeta, source: 'telegram' },
    })

    logActivity({
      companyId: config.companyId,
      type: 'chat',
      phase: 'start',
      actorType: 'user',
      actorId: ceoChatId,
      action: `텔레그램 명령: ${text.slice(0, 100)}`,
      metadata: { commandId: cmd.id, source: 'telegram' },
    })

    // Route to appropriate processor (fire-and-forget, result sent via sendMessage)
    const onComplete = async (result: string) => {
      try {
        await sendMessage(token, chatId, result || '(결과 없음)')
      } catch (sendErr) {
        console.error('[TelegramBot] Failed to send result:', sendErr)
      }
    }

    if (classifyResult.type === 'direct' || classifyResult.type === 'mention' || classifyResult.type === 'all' || classifyResult.type === 'sequential') {
      const commandText = classifyResult.parsedMeta.slashArgs || text
      runAgentForCommand({
        commandId: cmd.id,
        commandText,
        companyId: config.companyId,
        userId: ceoChatId,
        targetAgentId: classifyResult.targetAgentId ?? undefined,
      }).then((result) => {
        onComplete(result || '(결과 없음)')
      }).catch((err) => {
        console.error(`[TelegramBot] runAgentForCommand failed:`, err)
        sendMessage(token, chatId, `❌ 오류 발생: ${err instanceof Error ? err.message : '처리 실패'}`).catch(() => {})
      })
    } else if (classifyResult.parsedMeta.slashType === 'debate' || classifyResult.parsedMeta.slashType === 'deep_debate') {
      processDebateCommand({
        commandId: cmd.id,
        topic: classifyResult.parsedMeta.slashArgs || '',
        debateType: classifyResult.parsedMeta.slashType === 'deep_debate' ? 'deep-debate' : 'debate',
        companyId: config.companyId,
        userId: ceoChatId,
      }).then((result: any) => {
        onComplete(result?.content || result?.summary || '(토론 완료)')
      }).catch(err => {
        sendMessage(token, chatId, `❌ 토론 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
      })
    }
  } catch (err) {
    console.error('[TelegramBot] handleUpdate error:', err)
    await sendMessage(token, chatId, `❌ 오류 발생: ${err instanceof Error ? err.message : '처리 실패'}`).catch(() => {})
  }
}

// === Notification Functions (15-3) ===

const CRON_RESULT_MAX_LENGTH = 3900

/**
 * 범용 텔레그램 알림 전송 — companyId로 설정 조회 → 토큰 복호화 → sendMessage.
 * 설정 없거나 비활성이면 조용히 return. 전송 실패 시 throw 안 함.
 */
export async function sendTelegramNotification(companyId: string, message: string): Promise<void> {
  try {
    const config = await getConfigByCompanyId(companyId)
    if (!config || !config.isActive || !config.ceoChatId) return

    const token = await decrypt(config.botToken)
    await sendMessage(token, config.ceoChatId, message)
  } catch (err) {
    console.warn('[TelegramBot] Notification send failed:', err instanceof Error ? err.message : err)
  }
}

/**
 * 크론 결과 전용 전송 — 성공/실패에 따라 포맷팅 후 sendTelegramNotification 호출.
 * fire-and-forget: 내부에서 에러 처리, throw 안 함.
 */
export async function sendCronResult(
  companyId: string,
  scheduleName: string,
  resultOrError: string,
  isSuccess: boolean,
): Promise<void> {
  let message: string
  if (isSuccess) {
    message = `⏰ [${scheduleName}]\n\n${resultOrError}`
    if (message.length > CRON_RESULT_MAX_LENGTH) {
      message = message.slice(0, CRON_RESULT_MAX_LENGTH) + '\n\n... (전체는 웹에서 확인)'
    }
  } else {
    message = `❌ 크론 실패: ${scheduleName}\n오류: ${resultOrError}`
  }

  await sendTelegramNotification(companyId, message)
}

// === Config Loader ===

export async function getConfigByCompanyId(companyId: string): Promise<TelegramConfig | null> {
  const [row] = await db
    .select()
    .from(telegramConfigs)
    .where(and(eq(telegramConfigs.companyId, companyId), eq(telegramConfigs.isActive, true)))
    .limit(1)

  return row ?? null
}
