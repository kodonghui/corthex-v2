import { describe, it, expect } from 'bun:test'
import { filterOutput, hasCredentialPatterns } from '../../services/output-filter'

describe('Output Filter Service', () => {
  // ==========================================================
  // 1. API Key Detection
  // ==========================================================
  describe('API Key Patterns', () => {
    it('redacts Anthropic API keys', () => {
      const text = 'Use this key: sk-ant-api03-abcdefghijklmnopqrst'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:API_KEY]')
      expect(result.filtered).not.toContain('sk-ant-api03')
      expect(result.redactedCount).toBe(1)
      expect(result.redactedTypes).toContain('anthropic_key')
    })

    it('redacts OpenAI API keys', () => {
      const text = 'API key: sk-abcdefghijklmnopqrstuvwxyz12345'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:API_KEY]')
      expect(result.filtered).not.toContain('sk-abcdefghij')
      expect(result.redactedCount).toBe(1)
    })

    it('redacts Google AI keys', () => {
      const text = 'Google key: AIzaSyCdefghijklmnopqrstuvwxyz01234567890'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:API_KEY]')
      expect(result.redactedCount).toBe(1)
      expect(result.redactedTypes).toContain('google_key')
    })

    it('redacts AWS keys', () => {
      const text = 'AWS access: AKIAIOSFODNN7EXAMPLE'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:API_KEY]')
      expect(result.redactedCount).toBe(1)
      expect(result.redactedTypes).toContain('aws_key')
    })
  })

  // ==========================================================
  // 2. Token & Auth Patterns
  // ==========================================================
  describe('Token and Auth Patterns', () => {
    it('redacts Bearer tokens', () => {
      const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpv'
      const result = filterOutput(text)
      expect(result.filtered).toContain('Bearer [REDACTED]')
      expect(result.redactedCount).toBe(1)
      expect(result.redactedTypes).toContain('bearer_token')
    })

    it('redacts Basic auth', () => {
      const text = 'Header: Basic dXNlcm5hbWU6cGFzc3dvcmQxMjM0NTY='
      const result = filterOutput(text)
      expect(result.filtered).toContain('Basic [REDACTED]')
      expect(result.redactedCount).toBe(1)
    })

    it('redacts generic tokens', () => {
      const text = 'Use token-abcdef1234567890xyz'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:TOKEN]')
      expect(result.redactedCount).toBe(1)
    })
  })

  // ==========================================================
  // 3. Connection Strings
  // ==========================================================
  describe('Connection String Patterns', () => {
    it('redacts PostgreSQL connection strings', () => {
      const text = 'Connect with: postgres://user:password@host:5432/mydb'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:CONNECTION_STRING]')
      expect(result.filtered).not.toContain('password@host')
      expect(result.redactedTypes).toContain('connection_string')
    })

    it('redacts MySQL connection strings', () => {
      const text = 'mysql://root:secret@localhost:3306/db'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:CONNECTION_STRING]')
    })

    it('redacts MongoDB connection strings', () => {
      const text = 'mongodb://admin:pass123@cluster0.example.net/mydb'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:CONNECTION_STRING]')
    })

    it('redacts Redis connection strings', () => {
      const text = 'redis://default:secret@redis.example.com:6379'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:CONNECTION_STRING]')
    })
  })

  // ==========================================================
  // 4. Password Patterns
  // ==========================================================
  describe('Password Patterns', () => {
    it('redacts password= patterns', () => {
      const text = 'Config: password=mySecretPass123'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:PASSWORD]')
      expect(result.filtered).not.toContain('mySecretPass')
    })

    it('redacts passwd: patterns', () => {
      const text = 'passwd: "supersecretvalue"'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:PASSWORD]')
    })

    it('redacts pwd= patterns', () => {
      const text = 'pwd=longpasswordvalue123'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:PASSWORD]')
    })
  })

  // ==========================================================
  // 5. Secret & API Key Assignment Patterns
  // ==========================================================
  describe('Secret Assignment Patterns', () => {
    it('redacts secret= patterns', () => {
      const text = 'client_secret = "a1b2c3d4e5f6g7h8i9j0klmnopqrst"'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:SECRET]')
    })

    it('redacts api_key= patterns', () => {
      const text = 'api_key="my-very-long-api-key-value"'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:SECRET]')
    })

    it('redacts auth_token= patterns', () => {
      const text = 'auth_token=abcdefghij1234567890'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:SECRET]')
    })
  })

  // ==========================================================
  // 6. Private Keys
  // ==========================================================
  describe('Private Key Patterns', () => {
    it('redacts RSA private keys', () => {
      const text = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQ...\n-----END RSA PRIVATE KEY-----'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:PRIVATE_KEY]')
      expect(result.filtered).not.toContain('MIIEpAIBAAKCAQ')
      expect(result.redactedTypes).toContain('private_key')
    })

    it('redacts generic private keys', () => {
      const text = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByq...\n-----END PRIVATE KEY-----'
      const result = filterOutput(text)
      expect(result.filtered).toContain('[REDACTED:PRIVATE_KEY]')
    })
  })

  // ==========================================================
  // 7. Environment Variable Patterns
  // ==========================================================
  describe('.env Patterns', () => {
    it('redacts DATABASE_URL= patterns', () => {
      const text = 'DATABASE_URL=postgres://user:pass@host/db'
      const result = filterOutput(text)
      // Should match both env_variable and connection_string
      expect(result.redactedCount).toBeGreaterThanOrEqual(1)
    })

    it('redacts ENCRYPTION_KEY= patterns', () => {
      const text = 'ENCRYPTION_KEY=my-super-secret-encryption-key-32chars'
      const result = filterOutput(text)
      expect(result.redactedCount).toBeGreaterThanOrEqual(1)
    })

    it('redacts JWT_SECRET= patterns', () => {
      const text = 'JWT_SECRET=very-long-jwt-secret-value-here'
      const result = filterOutput(text)
      expect(result.redactedCount).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================================
  // 8. Safe Content (no redaction)
  // ==========================================================
  describe('Safe Content', () => {
    it('passes through normal text unchanged', () => {
      const text = '삼성전자 주가가 80,000원을 돌파했습니다.'
      const result = filterOutput(text)
      expect(result.filtered).toBe(text)
      expect(result.redactedCount).toBe(0)
      expect(result.redactedTypes).toEqual([])
    })

    it('passes through code discussions', () => {
      const text = 'Use the fetch() API to make HTTP requests'
      const result = filterOutput(text)
      expect(result.filtered).toBe(text)
      expect(result.redactedCount).toBe(0)
    })

    it('passes through short strings', () => {
      const text = 'sk-short'
      const result = filterOutput(text)
      expect(result.filtered).toBe(text) // Too short to match
    })
  })

  // ==========================================================
  // 9. Multiple Redactions
  // ==========================================================
  describe('Multiple Redactions', () => {
    it('redacts multiple different patterns in one text', () => {
      const text = 'API: sk-abcdefghijklmnopqrstuvwxyz12345\nDB: postgres://user:pass@host/db'
      const result = filterOutput(text)
      expect(result.redactedCount).toBeGreaterThanOrEqual(2)
      expect(result.redactedTypes.length).toBeGreaterThanOrEqual(2)
    })

    it('redacts multiple same-type patterns', () => {
      const text = 'Key1: AKIAIOSFODNN7EXAMPLE Key2: AKIAIOSFODNN7EXAMPL2'
      const result = filterOutput(text)
      expect(result.redactedCount).toBe(2)
    })
  })

  // ==========================================================
  // 10. hasCredentialPatterns
  // ==========================================================
  describe('hasCredentialPatterns', () => {
    it('returns true when credentials present', () => {
      expect(hasCredentialPatterns('use sk-abcdefghijklmnopqrstuvwxyz12345')).toBe(true)
    })

    it('returns false for safe text', () => {
      expect(hasCredentialPatterns('just a normal message')).toBe(false)
    })

    it('returns true for connection strings', () => {
      expect(hasCredentialPatterns('postgres://user:pass@host/db')).toBe(true)
    })
  })
})
