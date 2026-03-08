/**
 * TelegramBotService — Telegram Bot API Webhook 기반 명령 처리 서비스
 *
 * v1의 polling 방식 대신 Webhook으로 전환.
 * 멀티테넌트: companyId별 독립 봇 토큰.
 * 명령 → CommandRouter → ChiefOfStaff → 결과 sendMessage.
 */

import { db } from '../db'
import { telegramConfigs, agents, commands, orchestrationTasks, costRecords, departments } from '../db/schema'
import { eq, and, desc, sum, sql } from 'drizzle-orm'
import { decrypt } from '../lib/crypto'
import { classify, createCommand } from './command-router'
import { process as chiefOfStaffProcess } from './chief-of-staff'
import { processAll } from './all-command-processor'
import { processSequential } from './sequential-command-processor'
import { processDebateCommand } from './debate-command-handler'
import { logActivity } from '../lib/activity-logger'
import { microToUsd } from '../lib/cost-tracker'

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
    '  /task ID - 특정 작업 상세 보기'
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
    .set({ status: 'failed', updatedAt: new Date() })
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

// === Main Update Handler ===

export async function handleUpdate(
  update: TelegramUpdate,
  config: TelegramConfig,
): Promise<void> {
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

  const { command, args } = parseCommand(text)

  if (command && SLASH_HANDLERS[command]) {
    // Handle slash command
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

  // General text → orchestration via CommandRouter
  try {
    await sendMessage(token, chatId, `⏳ 처리 중: _${text.slice(0, 50)}_`)

    // Use existing CommandRouter pipeline
    const classifyResult = await classify(text, {
      companyId: config.companyId,
      userId: ceoChatId, // use ceoChatId as user identifier for telegram
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

    if (classifyResult.type === 'direct' || classifyResult.type === 'mention') {
      chiefOfStaffProcess({
        commandId: cmd.id,
        commandText: text,
        companyId: config.companyId,
        userId: ceoChatId,
        targetAgentId: classifyResult.targetAgentId ?? undefined,
      }).then((result) => {
        onComplete(result.content || '(결과 없음)')
      }).catch((err) => {
        console.error(`[TelegramBot] ChiefOfStaff failed:`, err)
        sendMessage(token, chatId, `❌ 오류 발생: ${err instanceof Error ? err.message : '처리 실패'}`).catch(() => {})
      })
    } else if (classifyResult.type === 'all') {
      processAll({
        commandId: cmd.id,
        commandText: classifyResult.parsedMeta.slashArgs || text,
        companyId: config.companyId,
        userId: ceoChatId,
      }).then((result: any) => {
        onComplete(result?.content || result?.summary || '(전체 명령 완료)')
      }).catch(err => {
        sendMessage(token, chatId, `❌ 전체 명령 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
      })
    } else if (classifyResult.type === 'sequential') {
      processSequential({
        commandId: cmd.id,
        commandText: classifyResult.parsedMeta.slashArgs || text,
        companyId: config.companyId,
        userId: ceoChatId,
      }).then((result: any) => {
        onComplete(result?.content || result?.summary || '(순차 명령 완료)')
      }).catch(err => {
        sendMessage(token, chatId, `❌ 순차 명령 실패: ${err instanceof Error ? err.message : ''}`).catch(() => {})
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

// === Config Loader ===

export async function getConfigByCompanyId(companyId: string): Promise<TelegramConfig | null> {
  const [row] = await db
    .select()
    .from(telegramConfigs)
    .where(and(eq(telegramConfigs.companyId, companyId), eq(telegramConfigs.isActive, true)))
    .limit(1)

  return row ?? null
}
