import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Schema validation tests for invitation endpoints ===

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user'),
})

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
})

describe('Invitation - createInvitationSchema', () => {
  test('valid invitation with email and role', () => {
    const result = createInvitationSchema.safeParse({ email: 'test@example.com', role: 'user' })
    expect(result.success).toBe(true)
  })

  test('valid invitation with admin role', () => {
    const result = createInvitationSchema.safeParse({ email: 'admin@co.kr', role: 'admin' })
    expect(result.success).toBe(true)
  })

  test('defaults role to user when not provided', () => {
    const result = createInvitationSchema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('user')
    }
  })

  test('rejects invalid email', () => {
    const result = createInvitationSchema.safeParse({ email: 'not-email' })
    expect(result.success).toBe(false)
  })

  test('rejects empty email', () => {
    const result = createInvitationSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  test('rejects invalid role', () => {
    const result = createInvitationSchema.safeParse({ email: 'test@ex.com', role: 'superadmin' })
    expect(result.success).toBe(false)
  })
})

describe('Invitation - acceptInviteSchema', () => {
  test('valid accept invite data', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123def456',
      username: 'newuser',
      password: 'password123',
      name: 'New User',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty token', () => {
    const result = acceptInviteSchema.safeParse({
      token: '',
      username: 'newuser',
      password: 'password123',
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })

  test('rejects short username (< 2 chars)', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123',
      username: 'a',
      password: 'password123',
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })

  test('rejects short password (< 6 chars)', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123',
      username: 'newuser',
      password: '12345',
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })

  test('rejects empty name', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123',
      username: 'newuser',
      password: 'password123',
      name: '',
    })
    expect(result.success).toBe(false)
  })

  test('rejects long username (> 50 chars)', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123',
      username: 'a'.repeat(51),
      password: 'password123',
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })

  test('rejects long name (> 100 chars)', () => {
    const result = acceptInviteSchema.safeParse({
      token: 'abc123',
      username: 'newuser',
      password: 'password123',
      name: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })
})

describe('Invitation - Token generation', () => {
  test('randomBytes generates 64-char hex token', () => {
    const { randomBytes } = require('crypto')
    const token = randomBytes(32).toString('hex')
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  test('tokens are unique', () => {
    const { randomBytes } = require('crypto')
    const token1 = randomBytes(32).toString('hex')
    const token2 = randomBytes(32).toString('hex')
    expect(token1).not.toBe(token2)
  })
})

describe('Invitation - Expiry logic', () => {
  test('7-day expiry is correctly calculated', () => {
    const now = Date.now()
    const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000)
    const diffMs = expiresAt.getTime() - now
    const diffDays = diffMs / (24 * 60 * 60 * 1000)
    expect(diffDays).toBe(7)
  })

  test('expired invitation is detected', () => {
    const pastDate = new Date(Date.now() - 1000) // 1 second ago
    expect(pastDate < new Date()).toBe(true)
  })

  test('valid invitation is not expired', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    expect(futureDate < new Date()).toBe(false)
  })
})
