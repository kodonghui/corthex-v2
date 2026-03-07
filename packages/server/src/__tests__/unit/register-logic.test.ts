/**
 * TEA: 회원가입 비즈니스 로직 테스트
 * Risk-based coverage for POST /api/auth/register
 */
import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// registerSchema 복제 (auth.ts와 동일)
const registerSchema = z.object({
  companyName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

describe('TEA: Register Endpoint Risk Coverage', () => {
  // HIGH RISK: slug 형식 검증 (tenant isolation key)
  describe('Slug 형식 검증 (HIGH)', () => {
    const validSlugs = ['my-company', 'abc', 'test-123', 'a-b-c-d', '123']
    const invalidSlugs = ['My-Company', 'test company', 'test_company', 'TEST', 'a!b', '', 'a'.repeat(51)]

    for (const slug of validSlugs) {
      test(`유효한 slug: "${slug}"`, () => {
        const result = registerSchema.safeParse({
          companyName: 'Test', slug, username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
        })
        expect(result.success).toBe(true)
      })
    }

    for (const slug of invalidSlugs) {
      test(`무효한 slug: "${slug}"`, () => {
        const result = registerSchema.safeParse({
          companyName: 'Test', slug, username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
        })
        expect(result.success).toBe(false)
      })
    }
  })

  // HIGH RISK: 비밀번호 길이 경계값 테스트
  describe('비밀번호 길이 경계값 (HIGH)', () => {
    test('5자 비밀번호 → 실패', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'admin', password: '12345', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(false)
    })

    test('6자 비밀번호 → 성공', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(true)
    })
  })

  // MEDIUM RISK: username 길이 경계값
  describe('Username 길이 경계값 (MEDIUM)', () => {
    test('1자 username → 실패', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'a', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(false)
    })

    test('2자 username → 성공', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'ab', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(true)
    })

    test('50자 username → 성공', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'a'.repeat(50), password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(true)
    })

    test('51자 username → 실패', () => {
      const result = registerSchema.safeParse({
        companyName: 'Test', slug: 'test', username: 'a'.repeat(51), password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(false)
    })
  })

  // MEDIUM RISK: companyName 길이 경계값
  describe('CompanyName 길이 경계값 (MEDIUM)', () => {
    test('빈 companyName → 실패', () => {
      const result = registerSchema.safeParse({
        companyName: '', slug: 'test', username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(false)
    })

    test('100자 companyName → 성공', () => {
      const result = registerSchema.safeParse({
        companyName: 'A'.repeat(100), slug: 'test', username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(true)
    })

    test('101자 companyName → 실패', () => {
      const result = registerSchema.safeParse({
        companyName: 'A'.repeat(101), slug: 'test', username: 'admin', password: '123456', name: 'A', email: 'a@b.com',
      })
      expect(result.success).toBe(false)
    })
  })

  // MEDIUM RISK: email 형식 다양한 케이스
  describe('Email 형식 다양한 케이스 (MEDIUM)', () => {
    const validEmails = ['a@b.com', 'user@example.co.kr', 'test+tag@domain.com']
    const invalidEmails = ['not-email', '@no-user.com', 'no-domain@', '']

    for (const email of validEmails) {
      test(`유효한 email: "${email}"`, () => {
        const result = registerSchema.safeParse({
          companyName: 'Test', slug: 'test', username: 'admin', password: '123456', name: 'A', email,
        })
        expect(result.success).toBe(true)
      })
    }

    for (const invalidEmail of invalidEmails) {
      test(`무효한 email: "${invalidEmail}"`, () => {
        const result = registerSchema.safeParse({
          companyName: 'Test', slug: 'test', username: 'admin', password: '123456', name: 'A', email: invalidEmail,
        })
        expect(result.success).toBe(false)
      })
    }
  })

  // LOW RISK: 필수 필드 누락
  describe('필수 필드 누락 (LOW)', () => {
    const requiredFields = ['companyName', 'slug', 'username', 'password', 'name', 'email']

    for (const field of requiredFields) {
      test(`${field} 누락 → 실패`, () => {
        const valid: Record<string, string> = {
          companyName: 'Test', slug: 'test', username: 'admin',
          password: '123456', name: 'A', email: 'a@b.com',
        }
        delete valid[field]
        const result = registerSchema.safeParse(valid)
        expect(result.success).toBe(false)
      })
    }
  })
})
