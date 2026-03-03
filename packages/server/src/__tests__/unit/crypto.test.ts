/**
 * crypto.ts 유닛 테스트 — AES-256-GCM 암복호화
 * 서버 없이 실행 가능: bun test src/__tests__/unit/crypto.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import { encrypt, decrypt } from '../../lib/crypto'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-must-be-at-least-32-characters'
})

describe('crypto: encrypt/decrypt', () => {
  test('라운드트립: 암호화 후 복호화하면 원본 반환', async () => {
    const original = 'my-secret-api-key-12345'
    const encrypted = await encrypt(original)
    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(original)
  })

  test('빈 문자열 라운드트립', async () => {
    const encrypted = await encrypt('')
    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe('')
  })

  test('한글 텍스트 라운드트립', async () => {
    const original = '한국어 테스트 문자열 🔐'
    const encrypted = await encrypt(original)
    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(original)
  })

  test('같은 평문이라도 다른 암호문 생성 (랜덤 IV)', async () => {
    const plaintext = 'same-input-different-output'
    const enc1 = await encrypt(plaintext)
    const enc2 = await encrypt(plaintext)
    expect(enc1).not.toBe(enc2)
    // 둘 다 복호화하면 동일
    expect(await decrypt(enc1)).toBe(plaintext)
    expect(await decrypt(enc2)).toBe(plaintext)
  })

  test('변조된 암호문 복호화 시 에러', async () => {
    const encrypted = await encrypt('test-data')
    // base64 문자열 일부 변조
    const tampered = encrypted.slice(0, -4) + 'XXXX'
    expect(decrypt(tampered)).rejects.toThrow()
  })
})
