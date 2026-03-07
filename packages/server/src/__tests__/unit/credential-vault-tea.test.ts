/**
 * TEA (Test Architect) — Credential Vault Story 0-3
 * Risk-based test generation for credential vault changes
 *
 * Risk Analysis:
 * - HIGH: Credential value leakage in responses
 * - HIGH: Provider schema validation completeness
 * - MEDIUM: SUPPORTED_PROVIDERS sync with PROVIDER_SCHEMAS
 * - MEDIUM: Encryption roundtrip for all new providers
 * - LOW: Edge cases in validation
 */
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

// =============================================================
// HIGH RISK: Provider schema completeness and validation
// =============================================================

describe('[TEA-HIGH] Provider Schema Completeness', () => {
  test('모든 LLM 프로바이더가 PROVIDER_SCHEMAS에 포함됨', () => {
    const llmProviders = ['anthropic', 'openai', 'google_ai']
    for (const p of llmProviders) {
      expect(PROVIDER_SCHEMAS[p]).toBeDefined()
      expect(PROVIDER_SCHEMAS[p]).toContain('api_key')
    }
  })

  test('모든 통신 프로바이더가 PROVIDER_SCHEMAS에 포함됨', () => {
    expect(PROVIDER_SCHEMAS.telegram).toBeDefined()
    expect(PROVIDER_SCHEMAS.telegram).toContain('bot_token')
    expect(PROVIDER_SCHEMAS.telegram).toContain('chat_id')
  })

  test('모든 금융 프로바이더가 PROVIDER_SCHEMAS에 포함됨', () => {
    expect(PROVIDER_SCHEMAS.kis).toEqual(['app_key', 'app_secret', 'account_no'])
  })

  test('SUPPORTED_PROVIDERS 배열이 PROVIDER_SCHEMAS와 정확히 일치', () => {
    const schemaKeys = Object.keys(PROVIDER_SCHEMAS)
    expect(SUPPORTED_PROVIDERS.length).toBe(schemaKeys.length)
    for (const key of schemaKeys) {
      expect(SUPPORTED_PROVIDERS).toContain(key)
    }
  })

  test('SUPPORTED_PROVIDERS는 비어있지 않은 튜플 타입', () => {
    expect(SUPPORTED_PROVIDERS.length).toBeGreaterThan(0)
    expect(typeof SUPPORTED_PROVIDERS[0]).toBe('string')
  })
})

// =============================================================
// HIGH RISK: Encryption roundtrip for ALL providers
// =============================================================

describe('[TEA-HIGH] 전체 프로바이더 암호화 왕복 검증', () => {
  const providerTestData: Record<string, Record<string, string>> = {
    anthropic: { api_key: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxx' },
    openai: { api_key: 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    google_ai: { api_key: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    kis: { app_key: 'PSxxxxxxxx', app_secret: 'xxxxxxxxxxxx', account_no: '12345678' },
    smtp: { host: 'smtp.gmail.com', port: '587', user: 'u@g.com', password: 'pw', from: 's@g.com' },
    email: { host: 'smtp.naver.com', port: '465', user: 'u@n.com', password: 'pw2', from: 's@n.com' },
    telegram: { bot_token: '123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', chat_id: '-1001234567890' },
    instagram: { access_token: 'IGQVJxxxxxxxxx', page_id: '12345678901234567' },
    serper: { api_key: 'serper-key-xxxxx' },
    notion: { api_key: 'ntn_xxxxxxxxxxxxxxxxxxxxx' },
    google_calendar: { api_key: 'AIzaSyxxxxxxxxx' },
    tts: { api_key: 'tts-key-xxx' },
  }

  for (const [provider, fields] of Object.entries(providerTestData)) {
    test(`${provider}: 암호화 → 복호화 왕복 정확성`, async () => {
      const encrypted = await encryptCredentials(fields)

      // 모든 필드가 암호화되어야 함
      for (const key of Object.keys(fields)) {
        expect(encrypted[key]).toBeDefined()
        expect(encrypted[key]).not.toBe(fields[key])
        expect(encrypted[key].length).toBeGreaterThan(0)
      }

      const decrypted = await decryptCredentials(encrypted)
      expect(decrypted).toEqual(fields)
    })
  }

  test('빈 객체도 암호화/복호화 가능', async () => {
    const encrypted = await encryptCredentials({})
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual({})
  })

  test('동일 값 암호화 시 매번 다른 결과 (IV 랜덤)', async () => {
    const fields = { api_key: 'same-key' }
    const enc1 = await encryptCredentials(fields)
    const enc2 = await encryptCredentials(fields)
    expect(enc1.api_key).not.toBe(enc2.api_key) // 랜덤 IV
  })
})

// =============================================================
// MEDIUM RISK: Validation edge cases
// =============================================================

describe('[TEA-MED] 프로바이더 검증 엣지 케이스', () => {
  test('필수 필드가 빈 문자열이면 누락으로 처리', () => {
    expect(() =>
      validateCredentials('anthropic', { api_key: '' }),
    ).toThrow('필수 필드 누락')
  })

  test('추가 필드가 있어도 필수 필드 충족 시 통과', () => {
    expect(() =>
      validateCredentials('anthropic', { api_key: 'sk-test', extra_field: 'value' }),
    ).not.toThrow()
  })

  test('KIS 3개 필드 중 1개만 있으면 나머지 2개 누락 에러', () => {
    try {
      validateCredentials('kis', { app_key: 'key' } as Record<string, string>)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.message).toContain('app_secret')
      expect(e.message).toContain('account_no')
    }
  })

  test('SMTP 5개 필드 중 password만 누락 시 정확한 에러', () => {
    try {
      validateCredentials('smtp', {
        host: 'smtp.gmail.com',
        port: '587',
        user: 'u@g.com',
        from: 's@g.com',
      } as Record<string, string>)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.message).toContain('password')
      expect(e.message).not.toContain('host')
    }
  })

  test('Telegram bot_token만 제공 시 chat_id 누락 에러', () => {
    try {
      validateCredentials('telegram', { bot_token: '123:ABC' } as Record<string, string>)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.message).toContain('chat_id')
    }
  })

  test('알려지지 않은 프로바이더는 어떤 필드든 통과', () => {
    expect(() => validateCredentials('future_provider', {})).not.toThrow()
    expect(() => validateCredentials('future_provider', { a: 'b', c: 'd' })).not.toThrow()
  })
})

// =============================================================
// MEDIUM RISK: Encryption security properties
// =============================================================

describe('[TEA-MED] 암호화 보안 속성', () => {
  test('암호화된 값은 base64 형식', async () => {
    const encrypted = await encryptCredentials({ api_key: 'test' })
    const base64Regex = /^[A-Za-z0-9+/]+=*$/
    expect(base64Regex.test(encrypted.api_key)).toBe(true)
  })

  test('암호화된 값은 원본보다 길어야 함 (IV + tag overhead)', async () => {
    const short = 'x'
    const encrypted = await encryptCredentials({ key: short })
    expect(encrypted.key.length).toBeGreaterThan(short.length)
  })

  test('유니코드 문자열 암호화/복호화', async () => {
    const original = { api_key: '한국어테스트키🔑' }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('특수문자 포함 암호화/복호화', async () => {
    const original = { password: 'p@$$w0rd!#%^&*()[]{}|<>?/\\' }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('긴 API 키 암호화/복호화 (1KB)', async () => {
    const longKey = 'x'.repeat(1024)
    const original = { api_key: longKey }
    const encrypted = await encryptCredentials(original)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted.api_key).toBe(longKey)
  })
})
