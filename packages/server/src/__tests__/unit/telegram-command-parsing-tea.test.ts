/**
 * TEA-generated risk-based tests for Story 15-2: Telegram Command Parsing
 *
 * Risk areas covered:
 * - P0: parseEntities edge cases (empty entities, Unicode, multi-byte offsets)
 * - P0: handleUpdate routing priority (callback > entity > slash > korean slash > text)
 * - P0: handleCallbackQuery error resilience (decrypt failure, DB errors, missing fields)
 * - P1: Korean slash command argument handling edge cases
 * - P1: @mention + Korean slash combined scenarios
 * - P2: sendMessageWithKeyboard reply_markup structure validation
 * - P2: editMessage with/without keyboard
 */
import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'

// ---- DB + Service Mocks ----
const mockDbSelect = mock(() => ({ from: mock(() => ({ where: mock(() => ({ limit: mock(() => []) })), orderBy: mock(() => ({ limit: mock(() => []) })) })) }))
const mockDbUpdate = mock(() => ({ set: mock(() => ({ where: mock(() => ({ returning: mock(() => [{}]) })) })) }))
const mockDbInsert = mock(() => ({ values: mock(() => ({ returning: mock(() => [{ id: 'cmd-tea' }]) })) }))

mock.module('../../db', () => ({
  db: { select: mockDbSelect, update: mockDbUpdate, insert: mockDbInsert },
}))

mock.module('../../db/schema', () => ({
  telegramConfigs: { companyId: 'companyId', isActive: 'isActive' },
  agents: { companyId: 'companyId', name: 'name', nameEn: 'nameEn', isActive: 'isActive', id: 'id', tier: 'tier', departmentId: 'departmentId' },
  commands: { companyId: 'companyId', id: 'id', text: 'text', status: 'status', result: 'result', createdAt: 'createdAt' },
  orchestrationTasks: { companyId: 'companyId', id: 'id', agentId: 'agentId', status: 'status' },
  costRecords: { companyId: 'companyId', costUsdMicro: 'costUsdMicro', inputTokens: 'inputTokens', outputTokens: 'outputTokens' },
  departments: {},
  snsContents: { id: 'id', companyId: 'companyId', status: 'status', title: 'title', reviewedBy: 'reviewedBy', reviewedAt: 'reviewedAt', rejectReason: 'rejectReason', updatedAt: 'updatedAt' },
}))

mock.module('../../lib/crypto', () => ({ decrypt: mock(() => Promise.resolve('dec-tok')) }))

const mockClassify = mock(() => Promise.resolve({ type: 'direct', text: 'test', targetAgentId: null, parsedMeta: { timeoutMs: 60000 } }))
const mockCreateCommand = mock(() => Promise.resolve({ id: 'cmd-tea' }))
const mockParseSlash = mock(() => null)
const mockResolveMentionAgent = mock(() => Promise.resolve(null))

mock.module('../../services/command-router', () => ({
  classify: mockClassify,
  createCommand: mockCreateCommand,
  parseSlash: mockParseSlash,
  parseMention: mock(() => null),
  resolveMentionAgent: mockResolveMentionAgent,
}))

mock.module('../../services/chief-of-staff', () => ({ process: mock(() => Promise.resolve({ content: 'result' })) }))
mock.module('../../services/all-command-processor', () => ({ processAll: mock(() => Promise.resolve({ content: 'all' })) }))
mock.module('../../services/sequential-command-processor', () => ({ processSequential: mock(() => Promise.resolve({ content: 'seq' })) }))
mock.module('../../services/debate-command-handler', () => ({ processDebateCommand: mock(() => Promise.resolve({ content: 'debate' })) }))
mock.module('../../lib/activity-logger', () => ({ logActivity: mock(() => {}) }))
mock.module('../../lib/cost-tracker', () => ({ microToUsd: mock((v: number) => v / 1000000) }))
mock.module('../../services/batch-collector', () => ({
  batchCollector: {
    flush: mock(() => Promise.resolve([{}, {}])),
    getStatus: mock(() => ({ pending: 0, processing: 0, completed: 0, failed: 0, totalItems: 0, estimatedSavingsMicro: 0 })),
  },
}))

const mockFetch = mock(() => Promise.resolve({
  status: 200,
  json: () => Promise.resolve({ ok: true, result: { message_id: 99 } }),
}))
const origFetch = globalThis.fetch
beforeEach(() => { globalThis.fetch = mockFetch as any })
afterEach(() => { globalThis.fetch = origFetch })

import {
  parseEntities,
  parseCommand,
  handleUpdate,
  handleCallbackQuery,
  sendMessageWithKeyboard,
  editMessage,
  deleteMessage,
  answerCallbackQuery,
  type TelegramUpdate,
} from '../../services/telegram-bot'

const CFG = {
  id: 'cfg-tea',
  companyId: 'co-tea',
  botToken: 'enc-tok',
  ceoChatId: '777',
  webhookSecret: 'sec',
  webhookUrl: 'https://example.com/wh',
  isActive: true,
}

// ===== P0: parseEntities edge cases =====

describe('TEA P0: parseEntities edge cases', () => {
  test('empty string with empty entities array', () => {
    const r = parseEntities('', [])
    expect(r.mentionName).toBeNull()
    expect(r.cleanText).toBe('')
  })

  test('text with only bot_command entities (no mention)', () => {
    const r = parseEntities('/help extra text', [
      { type: 'bot_command', offset: 0, length: 5 },
    ])
    expect(r.mentionName).toBeNull()
    expect(r.cleanText).toBe('/help extra text')
  })

  test('mention entity at offset 0 with zero-length text after', () => {
    const r = parseEntities('@Agent', [{ type: 'mention', offset: 0, length: 6 }])
    expect(r.mentionName).toBe('Agent')
    expect(r.cleanText).toBe('')
  })

  test('handles multi-byte Korean mention correctly', () => {
    // Korean chars are multi-byte in UTF-8 but JS uses UTF-16 code units for string indexing
    const text = '@마케팅팀장 SNS 콘텐츠 기획'
    const r = parseEntities(text, [{ type: 'mention', offset: 0, length: 6 }])
    expect(r.mentionName).toBe('마케팅팀장')
  })

  test('text_mention entity type is NOT treated as mention', () => {
    // text_mention is different from mention (user without username)
    const r = parseEntities('Hello John test', [
      { type: 'text_mention', offset: 6, length: 4 },
    ])
    expect(r.mentionName).toBeNull()
  })

  test('multiple entities of mixed types — picks first mention only', () => {
    const r = parseEntities('/cmd @A @B text', [
      { type: 'bot_command', offset: 0, length: 4 },
      { type: 'mention', offset: 5, length: 2 },
      { type: 'mention', offset: 8, length: 2 },
    ])
    expect(r.mentionName).toBe('A')
  })

  test('mention in middle with whitespace preservation', () => {
    const r = parseEntities('분석 @CIO 해줘', [
      { type: 'mention', offset: 3, length: 4 },
    ])
    expect(r.mentionName).toBe('CIO')
    // cleanText preserves both sides with possible double space
    expect(r.cleanText).toContain('분석')
    expect(r.cleanText).toContain('해줘')
  })
})

// ===== P0: handleUpdate routing priority =====

describe('TEA P0: handleUpdate routing priority', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockParseSlash.mockReset()
    mockResolveMentionAgent.mockReset()
    mockClassify.mockReset()
    mockParseSlash.mockImplementation(() => null)
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve(null))
    mockClassify.mockImplementation(() => Promise.resolve({ type: 'direct', text: 't', targetAgentId: null, parsedMeta: { timeoutMs: 60000 } }))
  })

  test('callback_query takes priority over message', async () => {
    // Update has BOTH callback_query and message
    const update: TelegramUpdate = {
      update_id: 1,
      callback_query: {
        id: 'cq-prio',
        from: { id: 777, first_name: 'CEO' },
        data: 'unknown:x',
        message: { message_id: 1, chat: { id: 777, type: 'private' }, date: Date.now() },
      },
      message: {
        message_id: 2,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '이 메시지는 무시되어야 함',
      },
    }

    await handleUpdate(update, CFG)

    // Should answer callback query, not process message
    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    // classify should NOT be called (message was not processed)
    expect(mockClassify).not.toHaveBeenCalled()
  })

  test('entity @mention takes priority over Korean slash in text', async () => {
    // Text looks like it could be a Korean slash, but has a mention entity
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve('agent-x'))
    mockParseSlash.mockImplementation(() => ({ slashType: 'all', commandType: 'all', args: '' }))

    const update: TelegramUpdate = {
      update_id: 2,
      message: {
        message_id: 3,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '@Agent /전체 분석',
        entities: [{ type: 'mention', offset: 0, length: 6 }],
      },
    }

    await handleUpdate(update, CFG)

    // resolveMentionAgent should be called (entity path taken)
    expect(mockResolveMentionAgent).toHaveBeenCalled()
    // parseSlash should NOT be called (entity path short-circuits)
    expect(mockParseSlash).not.toHaveBeenCalled()
  })

  test('Telegram /start takes priority over Korean slash parsing', async () => {
    // If parseSlash returns something but /start is also handled by Telegram handler
    // /start is ASCII so parseCommand handles it first
    const update: TelegramUpdate = {
      update_id: 3,
      message: {
        message_id: 4,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '/start',
      },
    }

    await handleUpdate(update, CFG)

    // Should send the /start response message
    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
    const body = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(body.text).toContain('CORTHEX v2')
  })

  test('Korean text "토론 주제" is processed when no entity or slash matches', async () => {
    const update: TelegramUpdate = {
      update_id: 4,
      message: {
        message_id: 5,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '토론 기술과 예술의 경계',
      },
    }

    await handleUpdate(update, CFG)

    // Should send a processing message (debate started)
    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
  })
})

// ===== P0: handleCallbackQuery error resilience =====

describe('TEA P0: handleCallbackQuery error resilience', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockDbSelect.mockReset()
  })

  test('handles missing message in callback_query gracefully', async () => {
    // callback_query without message field
    await handleCallbackQuery(
      {
        id: 'cq-nomsg',
        from: { id: 777, first_name: 'CEO' },
        data: 'sns_approve:abc',
        // message is undefined
      } as any,
      CFG,
    )

    // Should handle gracefully (chatId will be undefined, auth fails)
    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    const body = JSON.parse(answerCalls[0][1].body)
    expect(body.text).toBe('권한이 없습니다.')
  })

  test('handles empty callback data string', async () => {
    await handleCallbackQuery(
      {
        id: 'cq-empty',
        from: { id: 777, first_name: 'CEO' },
        data: '',
        message: { message_id: 1, chat: { id: 777, type: 'private' }, date: Date.now() },
      },
      CFG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    const body = JSON.parse(answerCalls[answerCalls.length - 1][1].body)
    expect(body.text).toBe('알 수 없는 액션입니다.')
  })

  test('handles callback data with colon but no ID', async () => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({ where: () => ({ limit: () => [] }) }),
    }))

    await handleCallbackQuery(
      {
        id: 'cq-noid',
        from: { id: 777, first_name: 'CEO' },
        data: 'sns_approve:',
        message: { message_id: 2, chat: { id: 777, type: 'private' }, date: Date.now() },
      },
      CFG,
    )

    // Should process (empty contentId → not found in DB)
    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
  })

  test('handles config with null ceoChatId', async () => {
    const noIdConfig = { ...CFG, ceoChatId: null }

    await handleCallbackQuery(
      {
        id: 'cq-nul',
        from: { id: 777, first_name: 'CEO' },
        data: 'sns_approve:x',
        message: { message_id: 3, chat: { id: 777, type: 'private' }, date: Date.now() },
      },
      noIdConfig,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    const body = JSON.parse(answerCalls[answerCalls.length - 1][1].body)
    expect(body.text).toBe('권한이 없습니다.')
  })
})

// ===== P1: Korean slash command edge cases =====

describe('TEA P1: Korean slash argument edge cases', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockParseSlash.mockReset()
  })

  test('/순차 with multi-line argument', async () => {
    mockParseSlash.mockImplementation(() => ({
      slashType: 'sequential',
      commandType: 'sequential',
      args: '1단계: 분석\n2단계: 보고서',
    }))

    const update: TelegramUpdate = {
      update_id: 10,
      message: {
        message_id: 10,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '/순차 1단계: 분석\n2단계: 보고서',
      },
    }

    await handleUpdate(update, CFG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
  })

  test('/배치실행 returns result count', async () => {
    mockParseSlash.mockImplementation(() => ({
      slashType: 'batch_run',
      commandType: 'slash',
      args: '',
    }))

    const update: TelegramUpdate = {
      update_id: 11,
      message: {
        message_id: 11,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '/배치실행',
      },
    }

    await handleUpdate(update, CFG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('배치 실행 완료')
  })

  test('/심층토론 with topic routes to deep-debate type', async () => {
    mockParseSlash.mockImplementation(() => ({
      slashType: 'deep_debate',
      commandType: 'slash',
      args: '기후변화 대응',
    }))

    const update: TelegramUpdate = {
      update_id: 12,
      message: {
        message_id: 12,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '/심층토론 기후변화 대응',
      },
    }

    await handleUpdate(update, CFG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
    const firstBody = JSON.parse(sendCalls[0][1].body)
    expect(firstBody.text).toContain('토론 시작')
  })
})

// ===== P1: @mention combined with other text =====

describe('TEA P1: @mention combined scenarios', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockResolveMentionAgent.mockReset()
  })

  test('@mention where name matches Korean agent', async () => {
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve('kr-agent-id'))

    const update: TelegramUpdate = {
      update_id: 20,
      message: {
        message_id: 20,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '@투자분석팀장 삼성전자 올해 실적 전망',
        entities: [{ type: 'mention', offset: 0, length: 7 }],
      },
    }

    await handleUpdate(update, CFG)

    expect(mockResolveMentionAgent).toHaveBeenCalledWith('투자분석팀장', 'co-tea')
  })

  test('message with mention entity but no text after mention', async () => {
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve('agent-only'))

    const update: TelegramUpdate = {
      update_id: 21,
      message: {
        message_id: 21,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '@Agent',
        entities: [{ type: 'mention', offset: 0, length: 6 }],
      },
    }

    await handleUpdate(update, CFG)

    // Should still work even with empty cleanText
    expect(mockResolveMentionAgent).toHaveBeenCalled()
  })
})

// ===== P2: API function structure validation =====

describe('TEA P2: sendMessageWithKeyboard structure', () => {
  test('keyboard with multiple rows', async () => {
    await sendMessageWithKeyboard('tok', '777', 'Choose action:', [
      [{ text: '승인', callback_data: 'approve:1' }],
      [{ text: '거절', callback_data: 'reject:1' }],
      [{ text: '보류', callback_data: 'hold:1' }],
    ])

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup.inline_keyboard).toHaveLength(3)
    expect(body.reply_markup.inline_keyboard[2][0].text).toBe('보류')
  })

  test('keyboard with multiple buttons per row', async () => {
    await sendMessageWithKeyboard('tok', '777', 'Rate:', [
      [
        { text: '1', callback_data: 'rate:1' },
        { text: '2', callback_data: 'rate:2' },
        { text: '3', callback_data: 'rate:3' },
      ],
    ])

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup.inline_keyboard[0]).toHaveLength(3)
  })
})

describe('TEA P2: editMessage variations', () => {
  test('editMessage without keyboard omits reply_markup', async () => {
    await editMessage('tok', '777', 99, 'Updated text')
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup).toBeUndefined()
    expect(body.parse_mode).toBe('Markdown')
  })

  test('editMessage with empty keyboard array', async () => {
    await editMessage('tok', '777', 99, 'No buttons', [])
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup.inline_keyboard).toHaveLength(0)
  })
})

describe('TEA P2: answerCallbackQuery variations', () => {
  test('answerCallbackQuery without text', async () => {
    await answerCallbackQuery('tok', 'cq-silent')
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.callback_query_id).toBe('cq-silent')
    expect(body.text).toBeUndefined()
  })

  test('answerCallbackQuery with show_alert=true', async () => {
    await answerCallbackQuery('tok', 'cq-alert', '경고!', true)
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.show_alert).toBe(true)
  })
})

// ===== P2: handleUpdate with no message and no callback =====

describe('TEA P2: handleUpdate edge cases', () => {
  test('update with neither message nor callback_query', async () => {
    mockFetch.mockClear()
    const update: TelegramUpdate = { update_id: 999 }
    await handleUpdate(update, CFG)
    // No API calls should be made
    expect(mockFetch.mock.calls.length).toBe(0)
  })

  test('update with message but no text', async () => {
    mockFetch.mockClear()
    const update: TelegramUpdate = {
      update_id: 998,
      message: {
        message_id: 1,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        // no text field
      },
    }
    await handleUpdate(update, CFG)
    expect(mockFetch.mock.calls.length).toBe(0)
  })

  test('update with empty text', async () => {
    mockFetch.mockClear()
    const update: TelegramUpdate = {
      update_id: 997,
      message: {
        message_id: 1,
        chat: { id: 777, type: 'private' },
        date: Date.now(),
        text: '   ',
      },
    }
    await handleUpdate(update, CFG)
    // Empty text after trim should result in no processing
    expect(mockFetch.mock.calls.length).toBe(0)
  })
})
