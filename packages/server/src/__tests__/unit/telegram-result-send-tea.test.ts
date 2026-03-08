/**
 * TEA (Test Architect) Risk-Based Tests — Story 15-3
 * 결과 전송 + 크론 결과 자동 전송
 *
 * Risk Coverage:
 * - P0: Core notification path, format parity with v1, Telegram limits
 * - P1: Error resilience, edge cases, boundary conditions
 * - P2: Concurrency, ordering, special characters
 */

import { describe, test, expect, beforeAll, beforeEach, mock, spyOn } from 'bun:test'

// Mock db module
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

// === P0: Core Notification Path Tests ===

describe('TEA-P0: sendTelegramNotification core path', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  function setupActiveConfig(companyId: string, ceoChatId: string) {
    mockLimit.mockResolvedValueOnce([{
      id: `cfg-${companyId}`,
      companyId,
      botToken: `encrypted-${companyId}`,
      ceoChatId,
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    }])
  }

  test('correctly passes decrypted token to Telegram API', async () => {
    setupActiveConfig('co1', '100')

    let capturedUrl = ''
    globalThis.fetch = mock(async (url: string, opts: any) => {
      capturedUrl = url as string
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('co1', 'test')

    expect(capturedUrl).toContain('botdecrypted-encrypted-co1/sendMessage')
  })

  test('uses Markdown parse_mode in sent messages', async () => {
    setupActiveConfig('co2', '200')

    let capturedBody: any
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      capturedBody = JSON.parse(opts.body)
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('co2', '*bold* message')

    expect(capturedBody.parse_mode).toBe('Markdown')
  })

  test('handles concurrent notifications to different companies', async () => {
    // Company A
    mockLimit.mockResolvedValueOnce([{
      id: 'cfgA', companyId: 'companyA', botToken: 'tokenA',
      ceoChatId: '111', webhookSecret: null, webhookUrl: null, isActive: true,
    }])
    // Company B
    mockLimit.mockResolvedValueOnce([{
      id: 'cfgB', companyId: 'companyB', botToken: 'tokenB',
      ceoChatId: '222', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    const chatIds: string[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      const body = JSON.parse(opts.body)
      chatIds.push(body.chat_id)
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await Promise.all([
      sendTelegramNotification('companyA', 'msg A'),
      sendTelegramNotification('companyB', 'msg B'),
    ])

    expect(chatIds).toContain('111')
    expect(chatIds).toContain('222')
  })
})

// === P0: sendCronResult Format Parity with v1 ===

describe('TEA-P0: sendCronResult v1 format parity', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  function setupConfig() {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1', companyId: 'co1', botToken: 'enc-tok',
      ceoChatId: '999', webhookSecret: null, webhookUrl: null, isActive: true,
    }])
  }

  test('success format matches v1: ⏰ [name]\\n\\nresult', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'CIO 일일 분석', '한국 시장 상승', true)

    expect(sentText).toBe('⏰ [CIO 일일 분석]\n\n한국 시장 상승')
  })

  test('failure format matches v1: ❌ 크론 실패: name\\n오류: msg', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', '보고서 생성', 'timeout exceeded', false)

    expect(sentText).toBe('❌ 크론 실패: 보고서 생성\n오류: timeout exceeded')
  })

  test('Korean characters in schedule name preserved correctly', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', '금융분석팀장 시장 동향 보고', '결과입니다', true)

    expect(sentText).toContain('금융분석팀장 시장 동향 보고')
  })
})

// === P0: 3900 Character Truncation Boundary ===

describe('TEA-P0: 3900 char truncation boundary', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  function setupConfig() {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1', companyId: 'co1', botToken: 'enc-tok',
      ceoChatId: '999', webhookSecret: null, webhookUrl: null, isActive: true,
    }])
  }

  test('message at exactly 3900 chars is NOT truncated', async () => {
    setupConfig()

    // Header "⏰ [test]\n\n" = 10 chars (⏰ is 1 char + space + brackets + newlines)
    const headerLen = '⏰ [test]\n\n'.length
    const resultText = 'x'.repeat(3900 - headerLen)

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'test', resultText, true)

    expect(sentText).not.toContain('전체는 웹에서 확인')
    expect(sentText.length).toBeLessThanOrEqual(3900)
  })

  test('message at 3901 chars IS truncated', async () => {
    setupConfig()

    const headerLen = '⏰ [test]\n\n'.length
    const resultText = 'x'.repeat(3901 - headerLen)

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'test', resultText, true)

    expect(sentText).toContain('전체는 웹에서 확인')
  })

  test('failure messages are NOT truncated by sendCronResult (sendMessage may split)', async () => {
    setupConfig()

    const longError = 'e'.repeat(5000)

    const sentTexts: string[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentTexts.push(JSON.parse(opts.body).text)
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'job', longError, false)

    // sendCronResult does NOT add the "전체는 웹에서 확인" suffix for failures
    const combined = sentTexts.join('')
    expect(combined).not.toContain('전체는 웹에서 확인')
    // The full error content is sent (possibly split across messages by sendMessage)
    expect(combined).toContain('❌ 크론 실패: job')
  })

  test('truncation preserves header and adds suffix', async () => {
    setupConfig()

    const longResult = 'y'.repeat(5000)

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'job', longResult, true)

    expect(sentText).toStartWith('⏰ [job]\n\n')
    expect(sentText).toEndWith('... (전체는 웹에서 확인)')
  })
})

// === P1: Error Resilience ===

describe('TEA-P1: error resilience', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  test('DB query failure does not throw', async () => {
    mockLimit.mockRejectedValueOnce(new Error('DB connection lost'))

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})
    await sendTelegramNotification('co1', 'test') // should not throw
    warnSpy.mockRestore()
  })

  test('network timeout does not throw', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1', companyId: 'co1', botToken: 'tok',
      ceoChatId: '999', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    globalThis.fetch = mock(async () => {
      throw new Error('network timeout')
    }) as any

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})
    await sendTelegramNotification('co1', 'test')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  test('sendCronResult swallows all internal errors', async () => {
    mockLimit.mockRejectedValueOnce(new Error('DB error'))

    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {})
    // Should complete without throwing
    await sendCronResult('co1', 'job', 'result', true)
    warnSpy.mockRestore()
  })

  test('empty companyId handled gracefully', async () => {
    mockLimit.mockResolvedValueOnce([])

    // Should not throw
    await sendTelegramNotification('', 'test')
  })

  test('empty message handled gracefully', async () => {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1', companyId: 'co1', botToken: 'tok',
      ceoChatId: '999', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('co1', '')

    expect(sentText).toBe('')
  })
})

// === P1: Multi-tenant Isolation ===

describe('TEA-P1: multi-tenant isolation', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  test('different companies get different bot tokens', async () => {
    const tokens: string[] = []

    // Two sequential calls for different companies
    mockLimit.mockResolvedValueOnce([{
      id: 'cfgA', companyId: 'companyA', botToken: 'tokenA',
      ceoChatId: '111', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    globalThis.fetch = mock(async (url: string) => {
      tokens.push(url as string)
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendTelegramNotification('companyA', 'msg')

    mockLimit.mockResolvedValueOnce([{
      id: 'cfgB', companyId: 'companyB', botToken: 'tokenB',
      ceoChatId: '222', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    await sendTelegramNotification('companyB', 'msg')

    expect(tokens[0]).toContain('decrypted-tokenA')
    expect(tokens[1]).toContain('decrypted-tokenB')
  })

  test('company without telegram config gets no notification', async () => {
    // Company A has config, Company B does not
    mockLimit.mockResolvedValueOnce([{
      id: 'cfgA', companyId: 'companyA', botToken: 'tokenA',
      ceoChatId: '111', webhookSecret: null, webhookUrl: null, isActive: true,
    }])

    let callCount = 0
    globalThis.fetch = mock(async () => {
      callCount++
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('companyA', 'job', 'result', true)

    mockLimit.mockResolvedValueOnce([]) // no config for B

    await sendCronResult('companyB', 'job', 'result', true)

    expect(callCount).toBe(1) // Only company A got a message
  })
})

// === P2: Special Characters & Edge Cases ===

describe('TEA-P2: special characters and edge cases', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
    mockLimit.mockReset()
    mockDecrypt.mockReset()
    mockDecrypt.mockImplementation(async (v: string) => `decrypted-${v}`)
  })

  function setupConfig() {
    mockLimit.mockResolvedValueOnce([{
      id: 'cfg1', companyId: 'co1', botToken: 'enc-tok',
      ceoChatId: '999', webhookSecret: null, webhookUrl: null, isActive: true,
    }])
  }

  test('handles newlines in result text', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'job', 'line1\nline2\nline3', true)

    expect(sentText).toContain('line1\nline2\nline3')
  })

  test('handles markdown special chars in schedule name', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', '*bold* _italic_ [link]', 'result', true)

    expect(sentText).toContain('*bold* _italic_ [link]')
  })

  test('handles emojis in result text', async () => {
    setupConfig()

    let sentText = ''
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      sentText = JSON.parse(opts.body).text
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendCronResult('co1', 'job', '🟢 시장 상승 📈 +2.3%', true)

    expect(sentText).toContain('🟢 시장 상승 📈 +2.3%')
  })
})
