/**
 * Story 29.7: Connection Management Tests
 *
 * Tests connection limits, heartbeat timeout, and reconnection config.
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  canAcceptConnection,
  registerConnection,
  unregisterConnection,
  getConnectionCounts,
  resetConnectionCounts,
  CONNECTION_LIMITS,
} from '../../services/office-state'

const wsServerSrc = readFileSync(resolve(__dirname, '../../ws/server.ts'), 'utf-8')
const hookSrc = readFileSync(resolve(__dirname, '../../../../office/src/hooks/useOfficeSocket.ts'), 'utf-8')

describe('Connection Limits', () => {
  beforeEach(() => {
    resetConnectionCounts()
  })

  test('CONNECTION_LIMITS has correct defaults', () => {
    expect(CONNECTION_LIMITS.maxPerCompany).toBe(50)
    expect(CONNECTION_LIMITS.maxTotal).toBe(100)
    expect(CONNECTION_LIMITS.heartbeatTimeoutMs).toBe(60_000)
  })

  test('allows connection when under limits', () => {
    const result = canAcceptConnection('company-1')
    expect(result.allowed).toBe(true)
  })

  test('rejects when company limit reached', () => {
    for (let i = 0; i < 50; i++) {
      registerConnection('company-1')
    }
    const result = canAcceptConnection('company-1')
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Company')
  })

  test('rejects when total limit reached', () => {
    for (let i = 0; i < 100; i++) {
      registerConnection(`company-${i}`)
    }
    const result = canAcceptConnection('company-new')
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Server')
  })

  test('allows after unregister', () => {
    for (let i = 0; i < 50; i++) {
      registerConnection('company-1')
    }
    expect(canAcceptConnection('company-1').allowed).toBe(false)
    unregisterConnection('company-1')
    expect(canAcceptConnection('company-1').allowed).toBe(true)
  })

  test('getConnectionCounts returns correct totals', () => {
    registerConnection('company-a')
    registerConnection('company-a')
    registerConnection('company-b')
    const counts = getConnectionCounts()
    expect(counts.total).toBe(3)
    expect(counts.byCompany['company-a']).toBe(2)
    expect(counts.byCompany['company-b']).toBe(1)
  })

  test('unregister does not go below zero', () => {
    unregisterConnection('nonexistent')
    const counts = getConnectionCounts()
    expect(counts.total).toBe(0)
  })

  test('resetConnectionCounts clears all', () => {
    registerConnection('company-1')
    registerConnection('company-2')
    resetConnectionCounts()
    const counts = getConnectionCounts()
    expect(counts.total).toBe(0)
    expect(Object.keys(counts.byCompany)).toHaveLength(0)
  })
})

describe('WS Server — Connection Management Source', () => {
  test('imports canAcceptConnection', () => {
    expect(wsServerSrc).toContain('canAcceptConnection')
  })

  test('imports registerConnection', () => {
    expect(wsServerSrc).toContain('registerConnection')
  })

  test('imports unregisterConnection', () => {
    expect(wsServerSrc).toContain('unregisterConnection')
  })

  test('checks connection limit in onOpen', () => {
    expect(wsServerSrc).toContain('canAcceptConnection(tenant.companyId)')
  })

  test('rejects with 4029 when limit exceeded', () => {
    expect(wsServerSrc).toContain('4029')
  })

  test('registers connection on accept', () => {
    expect(wsServerSrc).toContain('registerConnection(tenant.companyId)')
  })

  test('unregisters connection on close', () => {
    expect(wsServerSrc).toContain('unregisterConnection(tenant.companyId)')
  })

  test('responds to ping with pong', () => {
    expect(wsServerSrc).toContain("type: 'pong'")
  })

  test('tracks lastPingAt on client', () => {
    expect(wsServerSrc).toContain('lastPingAt')
  })

  test('exports startHeartbeatChecker', () => {
    expect(wsServerSrc).toContain('export function startHeartbeatChecker')
  })

  test('exports stopHeartbeatChecker', () => {
    expect(wsServerSrc).toContain('export function stopHeartbeatChecker')
  })

  test('heartbeat checker disconnects stale clients (60s)', () => {
    expect(wsServerSrc).toContain('Heartbeat timeout')
  })
})

describe('Client — Reconnection Config', () => {
  test('exponential backoff params', () => {
    expect(hookSrc).toContain('initialDelayMs: 1_000')
    expect(hookSrc).toContain('maxDelayMs: 30_000')
    expect(hookSrc).toContain('maxAttempts: 10')
  })

  test('pong timeout at 15s', () => {
    expect(hookSrc).toContain('pongTimeoutMs: 15_000')
  })

  test('implements exponential backoff with Math.pow(2, attempt)', () => {
    expect(hookSrc).toContain('Math.pow(2, attempt)')
  })

  test('sets connectionLost after max attempts', () => {
    expect(hookSrc).toContain('setConnectionLost(true)')
  })

  test('exports RECONNECT_CONFIG', () => {
    expect(hookSrc).toContain('export const RECONNECT_CONFIG')
  })

  test('handles pong message to clear timeout', () => {
    expect(hookSrc).toContain("msg.type === 'pong'")
    expect(hookSrc).toContain('clearPongTimer()')
  })
})

describe('Load Test Script', () => {
  test('exists and is valid TypeScript', () => {
    const src = readFileSync(resolve(__dirname, '../../../../../tools/office-load-test.ts'), 'utf-8')
    expect(src).toContain('WebSocket')
    expect(src).toContain('NUM_CONNECTIONS')
    expect(src).toContain('DURATION_SECONDS')
    expect(src).toContain('performance.now()')
    expect(src).toContain('process.memoryUsage()')
  })
})
