/**
 * 회원가입 (register) 유효성 검증 단위 테스트
 */
import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// registerSchema와 동일한 스키마 (auth.ts에서 직접 export하지 않으므로 복제)
const registerSchema = z.object({
  companyName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

describe('Register Schema Validation', () => {
  test('유효한 입력 → 성공', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test-corp',
      username: 'testadmin',
      password: 'secure123',
      name: '테스트 관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(true)
  })

  test('빈 companyName → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: '',
      slug: 'test-corp',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(false)
  })

  test('대문자 slug → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'Test-Corp',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(false)
  })

  test('특수문자 slug → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test_corp!',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(false)
  })

  test('짧은 username (1자) → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test-corp',
      username: 'a',
      password: 'secure123',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(false)
  })

  test('짧은 password (5자) → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test-corp',
      username: 'testadmin',
      password: '12345',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(false)
  })

  test('유효하지 않은 email → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test-corp',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  test('email 누락 → 실패', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp',
      slug: 'test-corp',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
    })
    expect(result.success).toBe(false)
  })

  test('숫자 포함 slug → 성공', () => {
    const result = registerSchema.safeParse({
      companyName: 'Test Corp 2',
      slug: 'test-corp-2',
      username: 'testadmin',
      password: 'secure123',
      name: '관리자',
      email: 'admin@test.com',
    })
    expect(result.success).toBe(true)
  })
})
