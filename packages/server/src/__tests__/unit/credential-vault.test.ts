import { describe, test, expect, beforeAll } from 'bun:test'
import {
  validateCredentials,
  encryptCredentials,
  decryptCredentials,
  PROVIDER_SCHEMAS,
  SUPPORTED_PROVIDERS,
} from '../../services/credential-vault'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

describe('encryptCredentials + decryptCredentials', () => {
  test('KIS 3필드 왕복 암호화 정확성', async () => {
    const original = { app_key: 'my-key', app_secret: 'my-secret', account_no: '12345678' }
    const encrypted = await encryptCredentials(original)

    // 암호화된 값은 원본과 달라야 함
    expect(encrypted.app_key).not.toBe(original.app_key)
    expect(encrypted.app_secret).not.toBe(original.app_secret)

    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('SMTP 5필드 왕복 암호화 정확성', async () => {
    const original = {
      host: 'smtp.gmail.com',
      port: '587',
      user: 'user@gmail.com',
      password: 'super-secret-pw',
      from: 'sender@gmail.com',
    }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('단일 필드 provider (serper) 왕복', async () => {
    const original = { api_key: 'serper-api-key-123' }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })
})

describe('validateCredentials', () => {
  test('KIS 필수 필드 누락 시 에러', () => {
    expect(() => validateCredentials('kis', { app_key: 'only-key' } as Record<string, string>)).toThrow('필수 필드 누락')
  })

  test('KIS 필수 필드 2개 누락 시 에러 메시지에 누락 필드 표시', () => {
    try {
      validateCredentials('kis', { app_key: 'key' } as Record<string, string>)
      expect(true).toBe(false) // should not reach
    } catch (e: any) {
      expect(e.message).toContain('app_secret')
      expect(e.message).toContain('account_no')
    }
  })

  test('SMTP 5필드 완전 충족 시 통과', () => {
    expect(() =>
      validateCredentials('smtp', {
        host: 'smtp.gmail.com',
        port: '587',
        user: 'user@gmail.com',
        password: 'pw',
        from: 'user@gmail.com',
      }),
    ).not.toThrow()
  })

  test('Instagram 2필드 완전 충족 시 통과', () => {
    expect(() =>
      validateCredentials('instagram', {
        access_token: 'token-123',
        page_id: 'page-456',
      }),
    ).not.toThrow()
  })

  test('알려지지 않은 provider는 스킵 (에러 없음)', () => {
    expect(() => validateCredentials('unknown-provider', { any: 'field' })).not.toThrow()
  })
})

describe('PROVIDER_SCHEMAS', () => {
  test('12개 provider 스키마 정의됨', () => {
    expect(Object.keys(PROVIDER_SCHEMAS)).toHaveLength(12)
    expect(PROVIDER_SCHEMAS.anthropic).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.openai).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.google_ai).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.kis).toEqual(['app_key', 'app_secret', 'account_no'])
    expect(PROVIDER_SCHEMAS.smtp).toEqual(['host', 'port', 'user', 'password', 'from'])
    expect(PROVIDER_SCHEMAS.email).toEqual(['host', 'port', 'user', 'password', 'from'])
    expect(PROVIDER_SCHEMAS.telegram).toEqual(['bot_token', 'chat_id'])
    expect(PROVIDER_SCHEMAS.instagram).toEqual(['access_token', 'page_id'])
    expect(PROVIDER_SCHEMAS.serper).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.notion).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.google_calendar).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.tts).toEqual(['api_key'])
  })
})

describe('SUPPORTED_PROVIDERS', () => {
  test('PROVIDER_SCHEMAS의 모든 키와 일치', () => {
    expect(SUPPORTED_PROVIDERS).toEqual(Object.keys(PROVIDER_SCHEMAS))
  })

  test('LLM 프로바이더 포함 확인', () => {
    expect(SUPPORTED_PROVIDERS).toContain('anthropic')
    expect(SUPPORTED_PROVIDERS).toContain('openai')
    expect(SUPPORTED_PROVIDERS).toContain('google_ai')
  })
})

describe('새 프로바이더 검증', () => {
  test('Anthropic api_key 검증 통과', () => {
    expect(() => validateCredentials('anthropic', { api_key: 'sk-ant-xxx' })).not.toThrow()
  })

  test('Anthropic api_key 누락 시 에러', () => {
    expect(() => validateCredentials('anthropic', {} as Record<string, string>)).toThrow('필수 필드 누락')
  })

  test('Google AI api_key 검증 통과', () => {
    expect(() => validateCredentials('google_ai', { api_key: 'AIzaSy-xxx' })).not.toThrow()
  })

  test('Telegram 2필드 검증 통과', () => {
    expect(() => validateCredentials('telegram', { bot_token: '123:ABC', chat_id: '-100123' })).not.toThrow()
  })

  test('Telegram bot_token 누락 시 에러', () => {
    expect(() => validateCredentials('telegram', { chat_id: '-100123' } as Record<string, string>)).toThrow('필수 필드 누락')
  })

  test('Anthropic api_key 왕복 암호화', async () => {
    const original = { api_key: 'sk-ant-api03-test-key-12345' }
    const encrypted = await encryptCredentials(original)
    expect(encrypted.api_key).not.toBe(original.api_key)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('Telegram 2필드 왕복 암호화', async () => {
    const original = { bot_token: '123456:ABC-DEF', chat_id: '-1001234567890' }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })
})
