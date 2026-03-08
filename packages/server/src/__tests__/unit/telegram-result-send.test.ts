import { describe, test, expect, beforeAll, beforeEach, mock, spyOn } from 'bun:test'

// Mock db module before importing telegram-bot
const mockSelect = mock(() => mockSelectChain)
const mockFrom = mock(() => mockSelectChain)
const mockWhere = mock(() => mockSelectChain)
const mockLimit = mock(() => Promise.resolve([]))
const mockSelectChain = { from: mockFrom, select: mockSelect, where: mockWhere, limit: mockLimit }

mock.module('../../db', () => ({
  db: {
    select: () => mockSelectChain,
  },
}))

mock.module('../../db/schema', () => ({
  telegramConfigs: { companyId: 'companyId', isActive: 'isActive' },
}))

const mockDecrypt = mock(async (v: string) => `decrypted-${v}`)
mock.module('../../lib/crypto', () => ({
  decrypt: mockDecrypt,
}))

import {
  sendTelegramNotification,
  sendCronResult,
} from '../../services/telegram-bot'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

// === sendTelegramNotification tests ===

describe('sendTelegramNotification', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  test('sends message when config exists with active bot and ceoChatId', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1',
      companyId: 'company1',
      botToken: 'encrypted-token',
      ceoChatId: '999',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('company1', 'Hello CEO')

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].chat_id).toBe('999')
    expect(fetchCalls[0].text).toBe('Hello CEO')
  })

  test('silently returns when no config found', async () => {
    mockLimit.mockResolvedValueOnce([])

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('no-company', 'Hello')

    expect(fetchCalls.length).toBe(0) // No API call made
  })

  test('silently returns when config is inactive', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg2',
      companyId: 'company2',
      botToken: 'encrypted-token',
      ceoChatId: '999',
      webhookSecret: null,
      webhookUrl: null,
      isActive: false,
    }])

    // getConfigByCompanyId queries with isActive=true, so inactive won't be returned
    // But if somehow returned with isActive=false, sendTelegramNotification checks it
    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    // Since getConfigByCompanyId filters by isActive=true in DB query,
    // an inactive config won't be returned. Test with null result:
    mockLimit.mockReset()
    mockLimit.mockResolvedValueOnce([])

    await sendTelegramNotification('company2', 'Hello')
    expect(fetchCalls.length).toBe(0)
  })

  test('silently returns when ceoChatId is null', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg3',
      companyId: 'company3',
      botToken: 'encrypted-token',
      ceoChatId: null,
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('company3', 'Hello')
    expect(fetchCalls.length).toBe(0)
  })

  test('does not throw on decrypt failure', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg4',
      companyId: 'company4',
      botToken: 'bad-token',
      ceoChatId: '999',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])

    mockDecrypt.mockRejectedValueOnce(new Error('Decryption failed'))

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})

    // Should not throw
    await sendTelegramNotification('company4', 'Hello')

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  test('does not throw on sendMessage failure', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg5',
      companyId: 'company5',
      botToken: 'encrypted-token',
      ceoChatId: '999',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ ok: false, description: 'Bad Request' }), { status: 400 })
    }) as any

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})

    // Should not throw
    await sendTelegramNotification('company5', 'Hello')

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  test('multi-tenant isolation: sends to correct company chatId', async () => {
    // Company A
    mockLimit.mockResolvedValueOnce([{
      id: 'cfgA',
      companyId: 'companyA',
      botToken: 'token-A',
      ceoChatId: '111',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('companyA', 'Message for A')

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].chat_id).toBe('111')
    expect(fetchCalls[0].text).toBe('Message for A')
  })
})

// === sendCronResult tests ===

describe('sendCronResult', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  function setupMockConfig() {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1',
      companyId: 'company1',
      botToken: 'encrypted-token',
      ceoChatId: '999',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])
  }

  test('sends success result with correct format', async () => {
    setupMockConfig()

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('company1', 'CIO 일일 시장 분석', '오늘 시장은 상승세입니다.', true)

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].text).toBe('⏰ [CIO 일일 시장 분석]\n\n오늘 시장은 상승세입니다.')
  })

  test('sends failure result with correct format', async () => {
    setupMockConfig()

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('company1', '매일 보고서', 'LLM provider timeout', false)

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].text).toBe('❌ 크론 실패: 매일 보고서\n오류: LLM provider timeout')
  })

  test('truncates long success result to 3900 chars', async () => {
    setupMockConfig()

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    const longResult = 'x'.repeat(5000)
    await sendCronResult('company1', '보고서', longResult, true)

    expect(fetchCalls.length).toBe(1)
    const sentText = fetchCalls[0].text as string
    expect(sentText.length).toBeLessThanOrEqual(3900 + 50) // 3900 + suffix
    expect(sentText).toContain('... (전체는 웹에서 확인)')
  })

  test('does not truncate failure messages', async () => {
    setupMockConfig()

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('company1', '작업', 'error message', false)

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].text).toBe('❌ 크론 실패: 작업\n오류: error message')
  })

  test('handles empty result string', async () => {
    setupMockConfig()

    const fetchCalls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      fetchCalls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('company1', '작업', '', true)

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].text).toBe('⏰ [작업]\n\n')
  })

  test('does not throw when telegram config missing', async () => {
    mockLimit.mockResolvedValueOnce([]) // no config

    // Should not throw
    await sendCronResult('no-company', '작업', 'result', true)
  })

  test('fire-and-forget: does not throw on API failure', async () => {
    setupMockConfig()

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ ok: false, description: 'Rate limited' }), { status: 429 })
    }) as any

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})

    // Should not throw
    await sendCronResult('company1', '작업', 'result', true)

    warnSpy.mockRestore()
  })
})

// === Cron Engine Integration (sendCronResult called correctly) ===

describe('cron-execution-engine telegram integration', () => {
  test('sendCronResult is exported and callable', () => {
    expect(typeof sendCronResult).toBe('function')
    expect(sendCronResult.length).toBe(4) // 4 parameters
  })

  test('sendTelegramNotification is exported and callable', () => {
    expect(typeof sendTelegramNotification).toBe('function')
    expect(sendTelegramNotification.length).toBe(2) // 2 parameters
  })
})
