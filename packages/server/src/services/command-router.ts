import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { agents, commands } from '../db/schema'

// === Types ===

export type CommandType = 'direct' | 'mention' | 'slash' | 'preset' | 'batch' | 'all' | 'sequential' | 'deepwork'

export type SlashType =
  | 'all'           // /전체
  | 'sequential'    // /순차
  | 'tool_check'    // /도구점검
  | 'batch_run'     // /배치실행
  | 'batch_status'  // /배치상태
  | 'commands_list' // /명령어
  | 'debate'        // /토론
  | 'deep_debate'   // /심층토론
  | 'sketch'        // /스케치

export type ParsedMeta = {
  slashType?: SlashType
  slashArgs?: string
  mentionName?: string
  mentionAgentId?: string
  presetId?: string
  timeoutMs: number
  source?: string
}

export type ClassifyOptions = {
  companyId: string
  userId: string
  targetAgentId?: string | null
  presetId?: string | null
  useBatch?: boolean
}

export type ClassifyResult = {
  type: CommandType
  text: string
  targetAgentId: string | null
  parsedMeta: ParsedMeta
}

// === Slash Command Definitions ===

const SLASH_COMMANDS: Record<string, { slashType: SlashType; commandType: CommandType }> = {
  '/전체':     { slashType: 'all',           commandType: 'all' },
  '/순차':     { slashType: 'sequential',    commandType: 'sequential' },
  '/도구점검': { slashType: 'tool_check',    commandType: 'slash' },
  '/배치실행': { slashType: 'batch_run',     commandType: 'slash' },
  '/배치상태': { slashType: 'batch_status',  commandType: 'slash' },
  '/명령어':   { slashType: 'commands_list', commandType: 'slash' },
  '/토론':     { slashType: 'debate',        commandType: 'slash' },
  '/심층토론': { slashType: 'deep_debate',   commandType: 'slash' },
  '/스케치':   { slashType: 'sketch',        commandType: 'slash' },
}

// === Timeout Defaults (ms) ===

const TIMEOUT_MAP: Record<CommandType, number> = {
  direct:     60_000,
  mention:    60_000,
  slash:      30_000,
  preset:     60_000,
  batch:      300_000,
  all:        300_000,
  sequential: 300_000,
  deepwork:   300_000,
}

// Slash subtypes with longer timeouts
const SLASH_TIMEOUT_OVERRIDES: Partial<Record<SlashType, number>> = {
  debate:      300_000,
  deep_debate: 300_000,
  all:         300_000,
  sequential:  300_000,
  sketch:      60_000,
}

// === Parsing Functions ===

// Sorted longest-first to prevent prefix conflicts (e.g. /심층토론 before /토론)
const SORTED_SLASH_ENTRIES = Object.entries(SLASH_COMMANDS)
  .sort((a, b) => b[0].length - a[0].length)

export function parseSlash(text: string): { slashType: SlashType; commandType: CommandType; args: string } | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('/')) return null

  for (const [cmd, def] of SORTED_SLASH_ENTRIES) {
    if (trimmed === cmd || trimmed.startsWith(cmd + ' ')) {
      const args = trimmed.slice(cmd.length).trim()
      return { slashType: def.slashType, commandType: def.commandType, args }
    }
  }

  return null
}

export function parseMention(text: string): { mentionName: string; cleanText: string } | null {
  const trimmed = text.trim()
  // Match @Name at the beginning of the text
  const match = trimmed.match(/^@(\S+)\s*(.*)$/s)
  if (!match) return null

  return {
    mentionName: match[1],
    cleanText: match[2].trim(),
  }
}

export async function resolveMentionAgent(
  mentionName: string,
  companyId: string,
): Promise<string | null> {
  try {
    // Try Korean name first
    const [byName] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          eq(agents.companyId, companyId),
          eq(agents.name, mentionName),
          eq(agents.isActive, true),
        ),
      )
      .limit(1)

    if (byName) return byName.id

    // Fallback: try English name
    const [byNameEn] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          eq(agents.companyId, companyId),
          eq(agents.nameEn, mentionName),
          eq(agents.isActive, true),
        ),
      )
      .limit(1)

    return byNameEn?.id ?? null
  } catch {
    // DB unavailable — treat as agent not found
    return null
  }
}

// === Main Classify Function ===

export async function classify(
  rawText: string,
  options: ClassifyOptions,
): Promise<ClassifyResult> {
  const text = rawText.trim()

  // 1. Preset check (explicit presetId provided)
  if (options.presetId) {
    return {
      type: 'preset',
      text,
      targetAgentId: options.targetAgentId ?? null,
      parsedMeta: {
        presetId: options.presetId,
        timeoutMs: TIMEOUT_MAP.preset,
      },
    }
  }

  // 2. Batch mode check
  if (options.useBatch) {
    return {
      type: 'batch',
      text,
      targetAgentId: options.targetAgentId ?? null,
      parsedMeta: {
        timeoutMs: TIMEOUT_MAP.batch,
      },
    }
  }

  // 3. Slash command check
  const slashResult = parseSlash(text)
  if (slashResult) {
    const timeoutMs = SLASH_TIMEOUT_OVERRIDES[slashResult.slashType] ?? TIMEOUT_MAP[slashResult.commandType]
    return {
      type: slashResult.commandType,
      text,
      targetAgentId: options.targetAgentId ?? null,
      parsedMeta: {
        slashType: slashResult.slashType,
        slashArgs: slashResult.args || undefined,
        timeoutMs,
      },
    }
  }

  // 4. @Mention check
  const mentionResult = parseMention(text)
  if (mentionResult) {
    const agentId = await resolveMentionAgent(mentionResult.mentionName, options.companyId)
    if (agentId) {
      return {
        type: 'mention',
        text,
        targetAgentId: agentId,
        parsedMeta: {
          mentionName: mentionResult.mentionName,
          mentionAgentId: agentId,
          timeoutMs: TIMEOUT_MAP.mention,
        },
      }
    }
    // Mention not resolved -> fallback to direct (preserve raw text)
  }

  // 5. Direct command with explicit targetAgentId
  if (options.targetAgentId) {
    return {
      type: 'mention',
      text,
      targetAgentId: options.targetAgentId,
      parsedMeta: {
        timeoutMs: TIMEOUT_MAP.mention,
      },
    }
  }

  // 6. Default: direct text command
  return {
    type: 'direct',
    text,
    targetAgentId: null,
    parsedMeta: {
      timeoutMs: TIMEOUT_MAP.direct,
    },
  }
}

// === DB Persistence ===

export type CreateCommandInput = {
  companyId: string
  userId: string
  text: string
  type: CommandType
  targetAgentId: string | null
  metadata: ParsedMeta
}

export async function createCommand(input: CreateCommandInput) {
  const [command] = await db
    .insert(commands)
    .values({
      companyId: input.companyId,
      userId: input.userId,
      text: input.text,
      type: input.type,
      targetAgentId: input.targetAgentId,
      status: 'pending',
      metadata: input.metadata,
    })
    .returning()

  return command
}
