import { describe, test, expect, beforeAll, mock, beforeEach } from 'bun:test'
import {
  splitMessage,
  parseCommand,
  handleUpdate,
  sendMessage,
  setWebhook,
  deleteWebhook,
  getMe,
  getConfigByCompanyId,
  type TelegramUpdate,
} from '../../services/telegram-bot'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

// === splitMessage tests ===

describe('splitMessage', () => {
  test('returns single chunk for short messages', () => {
    const result = splitMessage('Hello world')
    expect(result).toEqual(['Hello world'])
  })

  test('returns single chunk at exactly max length', () => {
    const text = 'a'.repeat(4096)
    const result = splitMessage(text)
    expect(result).toEqual([text])
  })

  test('splits on double newline when possible', () => {
    const part1 = 'a'.repeat(3000)
    const part2 = 'b'.repeat(3000)
    const text = part1 + '\n\n' + part2
    const result = splitMessage(text)
    expect(result.length).toBe(2)
    expect(result[0]).toBe(part1)
    expect(result[1]).toBe(part2)
  })

  test('splits on single newline as fallback', () => {
    const part1 = 'a'.repeat(3000)
    const part2 = 'b'.repeat(3000)
    const text = part1 + '\n' + part2
    const result = splitMessage(text)
    expect(result.length).toBe(2)
    expect(result[0]).toBe(part1)
    expect(result[1]).toBe(part2)
  })

  test('hard cuts when no newlines available', () => {
    const text = 'a'.repeat(8192)
    const result = splitMessage(text)
    expect(result.length).toBe(2)
    expect(result[0].length).toBe(4096)
    expect(result[1].length).toBe(4096)
  })

  test('handles code block splitting', () => {
    const before = 'a'.repeat(3000)
    const code = '```\n' + 'x'.repeat(2000) + '\n```'
    const text = before + '\n' + code
    const result = splitMessage(text)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // Verify code blocks are properly closed/opened
    for (const chunk of result) {
      const count = (chunk.match(/```/g) || []).length
      expect(count % 2).toBe(0) // even count = balanced
    }
  })

  test('handles empty string', () => {
    const result = splitMessage('')
    expect(result).toEqual([''])
  })

  test('splits very long message into multiple chunks', () => {
    const text = 'a'.repeat(12288) // 3x max
    const result = splitMessage(text)
    expect(result.length).toBe(3)
  })
})

// === parseCommand tests ===

describe('parseCommand', () => {
  test('parses /start command', () => {
    const result = parseCommand('/start')
    expect(result).toEqual({ command: '/start', args: '' })
  })

  test('parses /cancel with args', () => {
    const result = parseCommand('/cancel abc123')
    expect(result).toEqual({ command: '/cancel', args: 'abc123' })
  })

  test('parses /task with ID argument', () => {
    const result = parseCommand('/task 12345678')
    expect(result).toEqual({ command: '/task', args: '12345678' })
  })

  test('parses command with @botname', () => {
    const result = parseCommand('/help@corthex_bot')
    expect(result).toEqual({ command: '/help', args: '' })
  })

  test('parses command with @botname and args', () => {
    const result = parseCommand('/cancel@corthex_bot abc123')
    expect(result).toEqual({ command: '/cancel', args: 'abc123' })
  })

  test('returns null command for plain text', () => {
    const result = parseCommand('삼성전자 투자 분석해줘')
    expect(result).toEqual({ command: null, args: '삼성전자 투자 분석해줘' })
  })

  test('returns null command for empty string', () => {
    const result = parseCommand('')
    expect(result).toEqual({ command: null, args: '' })
  })

  test('handles multiline args', () => {
    const result = parseCommand('/task abc\ndef')
    expect(result.command).toBe('/task')
    expect(result.args).toBe('abc\ndef')
  })

  test('lowercases command', () => {
    const result = parseCommand('/HELP')
    expect(result.command).toBe('/help')
  })

  test('parses /models command', () => {
    const result = parseCommand('/models')
    expect(result).toEqual({ command: '/models', args: '' })
  })

  test('parses /result with ID', () => {
    const result = parseCommand('/result abc-def')
    expect(result).toEqual({ command: '/result', args: 'abc-def' })
  })

  test('parses /detail command', () => {
    const result = parseCommand('/detail')
    expect(result).toEqual({ command: '/detail', args: '' })
  })
})

// === handleUpdate auth tests ===

describe('handleUpdate - authentication', () => {
  test('ignores messages without text', async () => {
    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 123, type: 'private' },
        date: Date.now(),
        // no text field
      },
    }

    // Should not throw
    await handleUpdate(update, {
      id: 'cfg-1',
      companyId: 'company-1',
      botToken: 'encrypted-token',
      ceoChatId: '123',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    })
  })

  test('ignores messages from unauthorized chat', async () => {
    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 999, type: 'private' },
        date: Date.now(),
        text: '/help',
      },
    }

    // Should not throw - just silently ignore
    await handleUpdate(update, {
      id: 'cfg-1',
      companyId: 'company-1',
      botToken: 'encrypted-token',
      ceoChatId: '123', // different from 999
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    })
  })

  test('ignores messages when ceoChatId is not set', async () => {
    const update: TelegramUpdate = {
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 123, type: 'private' },
        date: Date.now(),
        text: '/help',
      },
    }

    await handleUpdate(update, {
      id: 'cfg-1',
      companyId: 'company-1',
      botToken: 'encrypted-token',
      ceoChatId: null, // not configured
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    })
  })

  test('ignores updates without message', async () => {
    const update: TelegramUpdate = {
      update_id: 1,
      // no message
    }

    await handleUpdate(update, {
      id: 'cfg-1',
      companyId: 'company-1',
      botToken: 'encrypted-token',
      ceoChatId: '123',
      webhookSecret: null,
      webhookUrl: null,
      isActive: true,
    })
  })
})

// === Telegram API Client tests (mocked fetch) ===

describe('Telegram API functions', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    // Reset fetch mock
    globalThis.fetch = originalFetch
  })

  test('sendMessage splits and sends long messages', async () => {
    const calls: any[] = []
    globalThis.fetch = mock(async (url: string, opts: any) => {
      calls.push({ url, body: JSON.parse(opts.body) })
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    const longText = 'a'.repeat(5000)
    await sendMessage('test-token', '123', longText)

    expect(calls.length).toBe(2) // split into 2 chunks
    expect(calls[0].url).toBe('https://api.telegram.org/bottest-token/sendMessage')
    expect(calls[0].body.chat_id).toBe('123')
    expect(calls[0].body.parse_mode).toBe('Markdown')
  })

  test('sendMessage sends short message as single chunk', async () => {
    const calls: any[] = []
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      calls.push(JSON.parse(opts.body))
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }))
    }) as any

    await sendMessage('test-token', '456', 'Hello')
    expect(calls.length).toBe(1)
    expect(calls[0].text).toBe('Hello')
  })

  test('setWebhook calls Telegram API with correct params', async () => {
    let capturedBody: any
    globalThis.fetch = mock(async (_url: string, opts: any) => {
      capturedBody = JSON.parse(opts.body)
      return new Response(JSON.stringify({ ok: true, result: true }))
    }) as any

    await setWebhook('test-token', 'https://example.com/webhook', 'secret123')

    expect(capturedBody.url).toBe('https://example.com/webhook')
    expect(capturedBody.secret_token).toBe('secret123')
    expect(capturedBody.allowed_updates).toEqual(['message', 'callback_query'])
  })

  test('deleteWebhook calls Telegram API', async () => {
    let calledUrl = ''
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url as string
      return new Response(JSON.stringify({ ok: true, result: true }))
    }) as any

    await deleteWebhook('test-token')
    expect(calledUrl).toContain('bottest-token/deleteWebhook')
  })

  test('getMe returns bot info', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({
        ok: true,
        result: { id: 123, username: 'test_bot', first_name: 'Test' },
      }))
    }) as any

    const result = await getMe('test-token')
    expect(result.id).toBe(123)
    expect(result.username).toBe('test_bot')
  })

  test('retries on server error with exponential backoff', async () => {
    let callCount = 0
    globalThis.fetch = mock(async () => {
      callCount++
      if (callCount < 3) {
        return new Response(JSON.stringify({ ok: false, description: 'Server error' }), { status: 500 })
      }
      return new Response(JSON.stringify({ ok: true, result: { id: 1, username: 'bot', first_name: 'Bot' } }))
    }) as any

    const result = await getMe('test-token')
    expect(callCount).toBe(3) // 2 failures + 1 success
    expect(result.username).toBe('bot')
  })

  test('does not retry on 4xx client error', async () => {
    let callCount = 0
    globalThis.fetch = mock(async () => {
      callCount++
      return new Response(JSON.stringify({ ok: false, description: 'Bad Request' }), { status: 400 })
    }) as any

    try {
      await getMe('test-token')
      expect(true).toBe(false) // should not reach here
    } catch (err) {
      expect(callCount).toBe(1) // no retries
      expect((err as Error).message).toContain('Bad Request')
    }
  })

  test('throws after max retries exceeded', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ ok: false, description: 'Service Unavailable' }), { status: 503 })
    }) as any

    try {
      await getMe('test-token')
      expect(true).toBe(false)
    } catch (err) {
      expect((err as Error).message).toContain('Service Unavailable')
    }
  })
})
