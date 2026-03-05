import { describe, test, expect, beforeAll } from 'bun:test'
import {
  validateCredentials,
  encryptCredentials,
  decryptCredentials,
  PROVIDER_SCHEMAS,
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
  test('5개 provider 스키마 정의됨', () => {
    expect(Object.keys(PROVIDER_SCHEMAS)).toHaveLength(5)
    expect(PROVIDER_SCHEMAS.kis).toEqual(['app_key', 'app_secret', 'account_no'])
    expect(PROVIDER_SCHEMAS.smtp).toEqual(['host', 'port', 'user', 'password', 'from'])
    expect(PROVIDER_SCHEMAS.instagram).toEqual(['access_token', 'page_id'])
    expect(PROVIDER_SCHEMAS.serper).toEqual(['api_key'])
    expect(PROVIDER_SCHEMAS.notion).toEqual(['api_key'])
  })
})
