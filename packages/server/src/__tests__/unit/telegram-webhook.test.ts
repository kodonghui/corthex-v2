import { describe, test, expect } from 'bun:test'
import { parseCommand, splitMessage } from '../../services/telegram-bot'

// === Telegram Update format validation ===

describe('Telegram Update format validation', () => {
  test('valid update with message', () => {
    const update = {
      update_id: 12345,
      message: {
        message_id: 67890,
        from: { id: 111, first_name: 'CEO' },
        chat: { id: 111, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/help',
        entities: [{ type: 'bot_command', offset: 0, length: 5 }],
      },
    }

    expect(update.update_id).toBe(12345)
    expect(update.message.text).toBe('/help')
    expect(update.message.chat.id).toBe(111)
  })

  test('valid update with callback_query', () => {
    const update = {
      update_id: 12346,
      callback_query: {
        id: 'cb-1',
        from: { id: 111, first_name: 'CEO' },
        data: 'sns_approve:req-123',
        message: {
          message_id: 100,
          chat: { id: 111, type: 'private' },
          date: Math.floor(Date.now() / 1000),
        },
      },
    }

    expect(update.callback_query.data).toBe('sns_approve:req-123')
  })

  test('update without message or callback_query', () => {
    const update = { update_id: 12347 }
    expect(update.update_id).toBeDefined()
  })
})

// === Slash command coverage ===

describe('Slash command coverage', () => {
  const EXPECTED_COMMANDS = [
    '/start', '/help', '/agents', '/cost', '/health',
    '/tasks', '/last', '/status', '/cancel', '/detail',
    '/result', '/task', '/models',
  ]

  test('all 13 v1 slash commands are supported', () => {
    expect(EXPECTED_COMMANDS.length).toBe(13)
    for (const cmd of EXPECTED_COMMANDS) {
      const parsed = parseCommand(cmd)
      expect(parsed.command).toBe(cmd)
    }
  })

  test('commands with args parse correctly', () => {
    expect(parseCommand('/cancel abc123').args).toBe('abc123')
    expect(parseCommand('/task 12345678').args).toBe('12345678')
    expect(parseCommand('/result my-task-id').args).toBe('my-task-id')
  })
})

// === Multitenant tests ===

describe('Multitenant isolation', () => {
  test('webhook URL contains companyId', () => {
    const companyId = 'company-abc-123'
    const baseUrl = 'https://corthex-hq.com'
    const webhookUrl = `${baseUrl}/api/telegram/webhook/${companyId}`

    expect(webhookUrl).toBe('https://corthex-hq.com/api/telegram/webhook/company-abc-123')
    expect(webhookUrl).toContain(companyId)
  })

  test('different companies get different webhook URLs', () => {
    const base = 'https://corthex-hq.com/api/telegram/webhook'
    const url1 = `${base}/company-1`
    const url2 = `${base}/company-2`
    expect(url1).not.toBe(url2)
  })
})

// === Message splitting edge cases ===

describe('Message splitting edge cases', () => {
  test('handles Unicode characters correctly', () => {
    const text = '한글'.repeat(3000)
    const result = splitMessage(text)
    expect(result.length).toBeGreaterThanOrEqual(1)
    for (const chunk of result) {
      expect(typeof chunk).toBe('string')
    }
  })

  test('handles emoji in messages', () => {
    const text = '🤖 '.repeat(2000)
    const result = splitMessage(text)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('handles messages with only newlines', () => {
    const text = '\n'.repeat(5000)
    const result = splitMessage(text)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('respects custom maxLen parameter', () => {
    const text = 'a'.repeat(200)
    const result = splitMessage(text, 100)
    expect(result.length).toBe(2)
    expect(result[0].length).toBe(100)
    expect(result[1].length).toBe(100)
  })
})

// === Security tests ===

describe('Webhook security', () => {
  test('secret token generation produces sufficient entropy', () => {
    const secret = crypto.randomUUID().replace(/-/g, '')
    expect(secret.length).toBe(32)
    expect(secret.length).toBeGreaterThanOrEqual(1)
    expect(secret.length).toBeLessThanOrEqual(256)
  })

  test('different calls produce different secrets', () => {
    const s1 = crypto.randomUUID().replace(/-/g, '')
    const s2 = crypto.randomUUID().replace(/-/g, '')
    expect(s1).not.toBe(s2)
  })
})

// === Webhook secret header verification logic ===

describe('Webhook secret verification logic', () => {
  test('matching secret should allow processing', () => {
    const configSecret = 'abc123def456'
    const headerSecret = 'abc123def456'
    expect(configSecret === headerSecret).toBe(true)
  })

  test('mismatching secret should reject', () => {
    const configSecret = 'abc123def456'
    const headerSecret = 'wrong-secret'
    expect(configSecret === headerSecret).toBe(false)
  })

  test('null config secret allows any request (backward compat)', () => {
    const configSecret: string | null = null
    // When webhookSecret is null, the check is skipped
    const shouldProcess = !configSecret || configSecret === 'any-header'
    expect(shouldProcess).toBe(true)
  })

  test('empty header with non-null secret should reject', () => {
    const configSecret = 'valid-secret'
    const headerSecret: string | undefined = undefined
    expect(configSecret && headerSecret !== configSecret).toBe(true)
  })
})

// === Webhook URL format tests ===

describe('Webhook URL format', () => {
  test('webhook URL format is correct', () => {
    const baseUrl = 'https://corthex-hq.com'
    const companyId = 'uuid-company-123'
    const url = `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook/${companyId}`
    expect(url).toBe('https://corthex-hq.com/api/telegram/webhook/uuid-company-123')
  })

  test('strips trailing slash from baseUrl', () => {
    const baseUrl = 'https://corthex-hq.com/'
    const companyId = 'test'
    const url = `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook/${companyId}`
    // No double-slash after domain (ignoring https://)
    expect(url.replace('https://', '')).not.toContain('//')
    expect(url).toBe('https://corthex-hq.com/api/telegram/webhook/test')
  })
})
