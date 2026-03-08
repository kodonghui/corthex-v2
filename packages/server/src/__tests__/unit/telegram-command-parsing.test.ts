/**
 * Story 15-2: 텔레그램 명령 파싱 (@멘션 + 텍스트) 테스트
 *
 * @멘션(entity 기반), 한국어 슬래시, callback query, inline keyboard, editMessage, deleteMessage
 */
import { describe, test, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test'

// ---- DB + Service Mocks ----
const mockDbSelect = mock(() => ({ from: mock(() => ({ where: mock(() => ({ limit: mock(() => []) })), orderBy: mock(() => ({ limit: mock(() => []) })) })) }))
const mockDbUpdate = mock(() => ({ set: mock(() => ({ where: mock(() => ({ returning: mock(() => [{}]) })) })) }))
const mockDbInsert = mock(() => ({ values: mock(() => ({ returning: mock(() => [{ id: 'cmd-123' }]) })) }))

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

const mockDecrypt = mock(() => Promise.resolve('decrypted-token'))
mock.module('../../lib/crypto', () => ({ decrypt: mockDecrypt }))

const mockClassify = mock(() => Promise.resolve({ type: 'direct', text: 'test', targetAgentId: null, parsedMeta: { timeoutMs: 60000 } }))
const mockCreateCommand = mock(() => Promise.resolve({ id: 'cmd-123' }))
const mockParseSlash = mock(() => null)
const mockParseMention = mock(() => null)
const mockResolveMentionAgent = mock(() => Promise.resolve(null))

mock.module('../../services/command-router', () => ({
  classify: mockClassify,
  createCommand: mockCreateCommand,
  parseSlash: mockParseSlash,
  parseMention: mockParseMention,
  resolveMentionAgent: mockResolveMentionAgent,
}))

const mockChiefProcess = mock(() => Promise.resolve({ content: 'ChiefOfStaff result' }))
mock.module('../../services/chief-of-staff', () => ({ process: mockChiefProcess }))
mock.module('../../services/all-command-processor', () => ({ processAll: mock(() => Promise.resolve({ content: 'all result' })) }))
mock.module('../../services/sequential-command-processor', () => ({ processSequential: mock(() => Promise.resolve({ content: 'seq result' })) }))
mock.module('../../services/debate-command-handler', () => ({ processDebateCommand: mock(() => Promise.resolve({ content: 'debate result' })) }))
mock.module('../../lib/activity-logger', () => ({ logActivity: mock(() => {}) }))
mock.module('../../lib/cost-tracker', () => ({ microToUsd: mock((v: number) => v / 1000000) }))
mock.module('../../services/batch-collector', () => ({
  batchCollector: {
    flush: mock(() => Promise.resolve([])),
    getStatus: mock(() => ({ pending: 2, processing: 0, completed: 5, failed: 0, totalItems: 7, estimatedSavingsMicro: 0 })),
  },
}))

// Mock fetch for Telegram API calls
const mockFetch = mock(() => Promise.resolve({
  status: 200,
  json: () => Promise.resolve({ ok: true, result: { message_id: 42 } }),
}))
const originalFetch = globalThis.fetch
beforeEach(() => { globalThis.fetch = mockFetch as any })
afterEach(() => { globalThis.fetch = originalFetch })

// Import AFTER mocks
import {
  parseCommand,
  parseEntities,
  splitMessage,
  handleUpdate,
  handleCallbackQuery,
  sendMessage,
  sendMessageWithKeyboard,
  editMessage,
  deleteMessage,
  answerCallbackQuery,
  type TelegramUpdate,
} from '../../services/telegram-bot'

const BASE_CONFIG = {
  id: 'cfg-1',
  companyId: 'company-1',
  botToken: 'encrypted-token',
  ceoChatId: '12345',
  webhookSecret: 'secret-123',
  webhookUrl: 'https://example.com/webhook',
  isActive: true,
}

// ========== parseEntities tests ==========

describe('parseEntities', () => {
  test('returns null mentionName when no entities', () => {
    const result = parseEntities('hello world')
    expect(result.mentionName).toBeNull()
    expect(result.cleanText).toBe('hello world')
  })

  test('returns null mentionName when entities have no mention type', () => {
    const result = parseEntities('/start', [{ type: 'bot_command', offset: 0, length: 6 }])
    expect(result.mentionName).toBeNull()
    expect(result.cleanText).toBe('/start')
  })

  test('extracts mention name from entity', () => {
    const result = parseEntities('@투자분석팀장 삼성전자 분석해줘', [
      { type: 'mention', offset: 0, length: 7 },
    ])
    expect(result.mentionName).toBe('투자분석팀장')
    expect(result.cleanText).toBe('삼성전자 분석해줘')
  })

  test('extracts mention in the middle of text', () => {
    const result = parseEntities('안녕 @CIO 분석해줘', [
      { type: 'mention', offset: 3, length: 4 },
    ])
    expect(result.mentionName).toBe('CIO')
    expect(result.cleanText).toBe('안녕  분석해줘')
  })

  test('handles mention at end of text', () => {
    const result = parseEntities('분석해줘 @CMO', [
      { type: 'mention', offset: 5, length: 4 },
    ])
    expect(result.mentionName).toBe('CMO')
    expect(result.cleanText).toBe('분석해줘')
  })

  test('only picks first mention entity', () => {
    const result = parseEntities('@A @B 테스트', [
      { type: 'mention', offset: 0, length: 2 },
      { type: 'mention', offset: 3, length: 2 },
    ])
    expect(result.mentionName).toBe('A')
  })

  test('ignores non-mention entities', () => {
    const result = parseEntities('/help @bot test', [
      { type: 'bot_command', offset: 0, length: 5 },
      { type: 'mention', offset: 6, length: 4 },
    ])
    expect(result.mentionName).toBe('bot')
  })
})

// ========== parseCommand tests (existing + Korean) ==========

describe('parseCommand (existing)', () => {
  test('parses /command@botname format', () => {
    const result = parseCommand('/start@mybot hello')
    expect(result.command).toBe('/start')
    expect(result.args).toBe('hello')
  })

  test('returns null command for non-slash text', () => {
    const result = parseCommand('hello world')
    expect(result.command).toBeNull()
    expect(result.args).toBe('hello world')
  })

  test('handles Korean slash commands (does not match English handler)', () => {
    const result = parseCommand('/전체 분석해줘')
    // parseCommand won't match Korean because it only extracts /\w+ (ASCII)
    // Korean chars are not \w in JS regex
    expect(result.command).toBeNull()
  })
})

// ========== sendMessageWithKeyboard tests ==========

describe('sendMessageWithKeyboard', () => {
  test('sends message with inline keyboard', async () => {
    const result = await sendMessageWithKeyboard('token', '12345', 'Choose:', [
      [{ text: '승인', callback_data: 'sns_approve:abc' }, { text: '거절', callback_data: 'sns_reject:abc' }],
    ])
    expect(result.message_id).toBe(42)
    expect(mockFetch).toHaveBeenCalled()
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup.inline_keyboard).toHaveLength(1)
    expect(body.reply_markup.inline_keyboard[0]).toHaveLength(2)
    expect(body.reply_markup.inline_keyboard[0][0].text).toBe('승인')
  })
})

// ========== editMessage tests ==========

describe('editMessage', () => {
  test('calls editMessageText API', async () => {
    await editMessage('token', '12345', 42, 'Updated text')
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    expect(lastCall[0]).toContain('editMessageText')
    const body = JSON.parse(lastCall[1].body)
    expect(body.message_id).toBe(42)
    expect(body.text).toBe('Updated text')
  })

  test('includes keyboard when provided', async () => {
    await editMessage('token', '12345', 42, 'Updated', [[{ text: 'OK', callback_data: 'ok' }]])
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    const body = JSON.parse(lastCall[1].body)
    expect(body.reply_markup.inline_keyboard).toHaveLength(1)
  })
})

// ========== deleteMessage tests ==========

describe('deleteMessage', () => {
  test('calls deleteMessage API', async () => {
    await deleteMessage('token', '12345', 42)
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    expect(lastCall[0]).toContain('deleteMessage')
    const body = JSON.parse(lastCall[1].body)
    expect(body.message_id).toBe(42)
  })
})

// ========== answerCallbackQuery tests ==========

describe('answerCallbackQuery', () => {
  test('calls answerCallbackQuery API', async () => {
    await answerCallbackQuery('token', 'cq-1', '승인 완료!', false)
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    expect(lastCall[0]).toContain('answerCallbackQuery')
    const body = JSON.parse(lastCall[1].body)
    expect(body.callback_query_id).toBe('cq-1')
    expect(body.text).toBe('승인 완료!')
  })
})

// ========== handleUpdate — @mention via entity ==========

describe('handleUpdate — @mention via entity', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockResolveMentionAgent.mockReset()
  })

  test('routes @mention entity to agent via ChiefOfStaff', async () => {
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve('agent-uuid'))
    mockChiefProcess.mockImplementation(() => Promise.resolve({ content: 'mention result' }))

    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '@투자팀장 삼성전자 분석',
        entities: [{ type: 'mention', offset: 0, length: 5 }],
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    // Should call resolveMentionAgent with parsed name
    expect(mockResolveMentionAgent).toHaveBeenCalledWith('투자팀장', 'company-1')
  })

  test('sends not-found message when agent does not exist', async () => {
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve(null))

    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '@존재하지않는에이전트 분석',
        entities: [{ type: 'mention', offset: 0, length: 11 }],
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    // Should send a "not found" message
    const fetchCalls = mockFetch.mock.calls
    const sendCalls = fetchCalls.filter((c: any) => c[0].includes('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('찾을 수 없습니다')
  })

  test('ignores messages from unauthorized chat', async () => {
    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 99999, type: 'private' },
        date: Date.now(),
        text: '@CIO test',
        entities: [{ type: 'mention', offset: 0, length: 4 }],
      },
    }

    mockFetch.mockClear()
    await handleUpdate(update, BASE_CONFIG)
    // Should not call any Telegram API (no sendMessage)
    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBe(0)
  })
})

// ========== handleUpdate — Korean slash commands ==========

describe('handleUpdate — Korean slash commands', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockParseSlash.mockReset()
  })

  test('/전체 routes to processAll', async () => {
    mockParseSlash.mockImplementation((text: string) => {
      if (text.startsWith('/전체')) return { slashType: 'all', commandType: 'all', args: '분석해줘' }
      return null
    })

    const update: TelegramUpdate = {
      update_id: 2,
      message: {
        message_id: 2,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '/전체 분석해줘',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    expect(mockParseSlash).toHaveBeenCalledWith('/전체 분석해줘')
    // Should have sent "전체 명령 처리 중" message
    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
  })

  test('/토론 without topic sends usage hint', async () => {
    mockParseSlash.mockImplementation((text: string) => {
      if (text.startsWith('/토론')) return { slashType: 'debate', commandType: 'slash', args: '' }
      return null
    })

    const update: TelegramUpdate = {
      update_id: 3,
      message: {
        message_id: 3,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '/토론',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('사용법')
  })

  test('/명령어 returns command list', async () => {
    mockParseSlash.mockImplementation((text: string) => {
      if (text === '/명령어') return { slashType: 'commands_list', commandType: 'slash', args: '' }
      return null
    })

    const update: TelegramUpdate = {
      update_id: 4,
      message: {
        message_id: 4,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '/명령어',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('사용 가능한 명령어')
    expect(lastBody.text).toContain('/전체')
  })

  test('/배치상태 returns batch status', async () => {
    mockParseSlash.mockImplementation((text: string) => {
      if (text === '/배치상태') return { slashType: 'batch_status', commandType: 'slash', args: '' }
      return null
    })

    const update: TelegramUpdate = {
      update_id: 5,
      message: {
        message_id: 5,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '/배치상태',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('배치 상태')
    expect(lastBody.text).toContain('대기: 2건')
  })

  test('/도구점검 returns tool check info', async () => {
    mockParseSlash.mockImplementation((text: string) => {
      if (text === '/도구점검') return { slashType: 'tool_check', commandType: 'slash', args: '' }
      return null
    })

    const update: TelegramUpdate = {
      update_id: 6,
      message: {
        message_id: 6,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '/도구점검',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    const lastBody = JSON.parse(sendCalls[sendCalls.length - 1][1].body)
    expect(lastBody.text).toContain('도구 점검')
  })
})

// ========== handleUpdate — Korean text debate "토론 주제" ==========

describe('handleUpdate — Korean text debate', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockParseSlash.mockReset()
    mockParseSlash.mockImplementation(() => null)
  })

  test('"토론 AI의 미래" triggers debate', async () => {
    const update: TelegramUpdate = {
      update_id: 10,
      message: {
        message_id: 10,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '토론 AI의 미래',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    // Should send debate starting message
    const sendCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('sendMessage'))
    expect(sendCalls.length).toBeGreaterThan(0)
  })
})

// ========== handleCallbackQuery tests ==========

describe('handleCallbackQuery', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockDbSelect.mockReset()
    mockDbUpdate.mockReset()
  })

  test('handles sns_approve callback', async () => {
    // Mock DB select to return pending content
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => [{ id: 'content-1', status: 'pending', title: 'Test SNS' }],
        }),
      }),
    }))
    mockDbUpdate.mockImplementation(() => ({
      set: () => ({
        where: () => ({ returning: () => [{}] }),
      }),
    }))

    await handleCallbackQuery(
      {
        id: 'cq-1',
        from: { id: 12345, first_name: 'CEO' },
        data: 'sns_approve:content-1',
        message: { message_id: 42, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    // Should call answerCallbackQuery with "승인 완료!"
    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    const body = JSON.parse(answerCalls[0][1].body)
    expect(body.text).toBe('승인 완료!')

    // Should call editMessageText
    const editCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('editMessageText'))
    expect(editCalls.length).toBe(1)
  })

  test('handles sns_reject callback', async () => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => [{ id: 'content-2', status: 'pending', title: 'Reject SNS' }],
        }),
      }),
    }))
    mockDbUpdate.mockImplementation(() => ({
      set: () => ({
        where: () => ({ returning: () => [{}] }),
      }),
    }))

    await handleCallbackQuery(
      {
        id: 'cq-2',
        from: { id: 12345, first_name: 'CEO' },
        data: 'sns_reject:content-2',
        message: { message_id: 43, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    const body = JSON.parse(answerCalls[0][1].body)
    expect(body.text).toBe('거절 완료!')
  })

  test('rejects callback from unauthorized chat', async () => {
    await handleCallbackQuery(
      {
        id: 'cq-3',
        from: { id: 99999, first_name: 'Hacker' },
        data: 'sns_approve:x',
        message: { message_id: 44, chat: { id: 99999, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    const body = JSON.parse(answerCalls[0][1].body)
    expect(body.text).toBe('권한이 없습니다.')
  })

  test('handles unknown callback data', async () => {
    await handleCallbackQuery(
      {
        id: 'cq-4',
        from: { id: 12345, first_name: 'CEO' },
        data: 'unknown_action:123',
        message: { message_id: 45, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
    const body = JSON.parse(answerCalls[0][1].body)
    expect(body.text).toBe('알 수 없는 액션입니다.')
  })

  test('handles sns_approve when content not found', async () => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => [],
        }),
      }),
    }))

    await handleCallbackQuery(
      {
        id: 'cq-5',
        from: { id: 12345, first_name: 'CEO' },
        data: 'sns_approve:nonexistent',
        message: { message_id: 46, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    const body = JSON.parse(answerCalls[answerCalls.length - 1][1].body)
    expect(body.text).toBe('콘텐츠를 찾을 수 없습니다.')
  })

  test('handles sns_approve when status is not pending', async () => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => [{ id: 'c1', status: 'approved', title: 'Already approved' }],
        }),
      }),
    }))

    await handleCallbackQuery(
      {
        id: 'cq-6',
        from: { id: 12345, first_name: 'CEO' },
        data: 'sns_approve:c1',
        message: { message_id: 47, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      BASE_CONFIG,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    const body = JSON.parse(answerCalls[answerCalls.length - 1][1].body)
    expect(body.text).toContain('승인할 수 없습니다')
  })
})

// ========== handleUpdate — callback_query dispatching ==========

describe('handleUpdate — callback_query dispatching', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockDbSelect.mockReset()
  })

  test('routes callback_query update to handleCallbackQuery', async () => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => [],
        }),
      }),
    }))

    const update: TelegramUpdate = {
      update_id: 100,
      callback_query: {
        id: 'cq-dispatch',
        from: { id: 12345, first_name: 'CEO' },
        data: 'sns_approve:xyz',
        message: { message_id: 50, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    // Should have called answerCallbackQuery (callback was processed)
    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    expect(answerCalls.length).toBe(1)
  })
})

// ========== handleUpdate — fallback to classify ==========

describe('handleUpdate — general text fallback', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockParseSlash.mockReset()
    mockParseSlash.mockImplementation(() => null)
    mockResolveMentionAgent.mockReset()
    mockResolveMentionAgent.mockImplementation(() => Promise.resolve(null))
    mockClassify.mockReset()
    mockClassify.mockImplementation(() => Promise.resolve({
      type: 'direct',
      text: 'general text',
      targetAgentId: null,
      parsedMeta: { timeoutMs: 60000 },
    }))
  })

  test('general text without @mention or slash goes to classify', async () => {
    const update: TelegramUpdate = {
      update_id: 200,
      message: {
        message_id: 200,
        chat: { id: 12345, type: 'private' },
        date: Date.now(),
        text: '삼성전자 투자 분석해줘',
      },
    }

    await handleUpdate(update, BASE_CONFIG)

    expect(mockClassify).toHaveBeenCalledWith('삼성전자 투자 분석해줘', expect.objectContaining({
      companyId: 'company-1',
    }))
  })
})

// ========== Multitenant isolation ==========

describe('multitenant isolation', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockDbSelect.mockReset()
  })

  test('callback from different company chat is rejected', async () => {
    const otherConfig = { ...BASE_CONFIG, companyId: 'other-company', ceoChatId: '99999' }

    await handleCallbackQuery(
      {
        id: 'cq-multi',
        from: { id: 12345, first_name: 'Wrong' },
        data: 'sns_approve:x',
        message: { message_id: 60, chat: { id: 12345, type: 'private' }, date: Date.now() },
      },
      otherConfig,
    )

    const answerCalls = mockFetch.mock.calls.filter((c: any) => c[0]?.includes?.('answerCallbackQuery'))
    const body = JSON.parse(answerCalls[answerCalls.length - 1][1].body)
    expect(body.text).toBe('권한이 없습니다.')
  })
})
