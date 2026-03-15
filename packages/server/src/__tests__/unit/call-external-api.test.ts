import { describe, test, expect } from 'bun:test'
import { callExternalApi } from '../../lib/call-external-api'
import { ToolError } from '../../lib/tool-error'

// --- Tests: callExternalApi (E16) ---

describe('callExternalApi — E16 External API Typed Error Pattern', () => {
  test('returns result when fn succeeds', async () => {
    const result = await callExternalApi('TestService', () => Promise.resolve('ok'))
    expect(result).toBe('ok')
  })

  test('401 → TOOL_CREDENTIAL_INVALID with correct message', async () => {
    const err = Object.assign(new Error('Unauthorized'), { status: 401 })
    await expect(callExternalApi('Tistory API', () => Promise.reject(err)))
      .rejects.toMatchObject({
        code: 'TOOL_CREDENTIAL_INVALID',
        message: 'Tistory API: auth failed (401). Check API credential in Admin settings.',
      })
  })

  test('403 → TOOL_CREDENTIAL_INVALID', async () => {
    const err = Object.assign(new Error('Forbidden'), { status: 403 })
    await expect(callExternalApi('R2 Storage', () => Promise.reject(err)))
      .rejects.toMatchObject({
        code: 'TOOL_CREDENTIAL_INVALID',
        message: 'R2 Storage: auth failed (403). Check API credential in Admin settings.',
      })
  })

  test('429 → TOOL_QUOTA_EXHAUSTED', async () => {
    const err = Object.assign(new Error('Rate limit'), { status: 429 })
    await expect(callExternalApi('Jina Reader', () => Promise.reject(err)))
      .rejects.toMatchObject({
        code: 'TOOL_QUOTA_EXHAUSTED',
        message: 'Jina Reader: rate limit exceeded',
      })
  })

  test('500 → TOOL_EXTERNAL_SERVICE_ERROR', async () => {
    const err = Object.assign(new Error('Server error'), { status: 500 })
    await expect(callExternalApi('Tistory API', () => Promise.reject(err)))
      .rejects.toMatchObject({
        code: 'TOOL_EXTERNAL_SERVICE_ERROR',
        message: 'Tistory API: server error (500)',
      })
  })

  test('503 → TOOL_EXTERNAL_SERVICE_ERROR', async () => {
    const err = Object.assign(new Error('Service unavailable'), { status: 503 })
    await expect(callExternalApi('ExternalService', () => Promise.reject(err)))
      .rejects.toMatchObject({ code: 'TOOL_EXTERNAL_SERVICE_ERROR' })
  })

  test('network error (no status) → TOOL_EXTERNAL_SERVICE_ERROR with message', async () => {
    const err = new Error('ECONNREFUSED')
    await expect(callExternalApi('API', () => Promise.reject(err)))
      .rejects.toMatchObject({
        code: 'TOOL_EXTERNAL_SERVICE_ERROR',
        message: 'API: ECONNREFUSED',
      })
  })

  test('re-throws ToolError as-is without wrapping', async () => {
    const toolErr = new ToolError('TOOL_QUOTA_EXHAUSTED', 'already typed')
    const rejected = callExternalApi('API', () => Promise.reject(toolErr))
    await expect(rejected).rejects.toBe(toolErr)  // same object identity
  })

  test('thrown error is instance of ToolError', async () => {
    const err = Object.assign(new Error('auth'), { status: 401 })
    try {
      await callExternalApi('TestSvc', () => Promise.reject(err))
      throw new Error('should not reach')
    } catch (e) {
      expect(e).toBeInstanceOf(ToolError)
    }
  })
})

// --- TEA P0: ToolError class tests ---

describe('ToolError class', () => {
  test('has code, message, optional details', () => {
    const err = new ToolError('TOOL_CREDENTIAL_INVALID', 'auth failed', { service: 'tistory' })
    expect(err.code).toBe('TOOL_CREDENTIAL_INVALID')
    expect(err.message).toBe('auth failed')
    expect(err.details).toEqual({ service: 'tistory' })
    expect(err.name).toBe('ToolError')
  })

  test('is an instance of Error', () => {
    const err = new ToolError('TOOL_QUOTA_EXHAUSTED', 'rate limited')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ToolError)
  })

  test('works without details', () => {
    const err = new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'server down')
    expect(err.details).toBeUndefined()
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: call-external-api source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../lib/call-external-api.ts'),
    'utf-8',
  )

  test('exports callExternalApi function', () => {
    expect(src).toContain('export async function callExternalApi')
  })

  test('handles 401, 403, 429, 5xx status codes', () => {
    expect(src).toContain('401')
    expect(src).toContain('403')
    expect(src).toContain('429')
    expect(src).toContain('500')
  })

  test('throws ToolError, never generic Error', () => {
    expect(src).toContain('ToolError')
    // Should not use generic Error for error returns
    expect(src).not.toMatch(/throw new Error\(/)
  })

  test('re-throws ToolError without wrapping (instanceof ToolError check)', () => {
    expect(src).toContain('instanceof ToolError')
  })
})
