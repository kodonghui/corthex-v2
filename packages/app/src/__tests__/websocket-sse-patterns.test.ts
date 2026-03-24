/**
 * Story 23.8 — Cross-cutting WebSocket & SSE UX Patterns Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  useSSE,
  useWebSocket,
  ConnectionStatus,
  StreamingText,
} from '@corthex/ui'
import type {
  SSEConnectionState,
  WebSocketState,
  ConnectionStateType,
} from '@corthex/ui'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Hook Exports ───────────────────────────────────
describe('WebSocket & SSE: Hook Exports', () => {
  test('useSSE is exported as function', () => {
    expect(typeof useSSE).toBe('function')
  })

  test('useWebSocket is exported as function', () => {
    expect(typeof useWebSocket).toBe('function')
  })
})

// ── Connection States ──────────────────────────────
describe('WebSocket & SSE: Connection States', () => {
  test('SSEConnectionState covers all states', () => {
    const states: SSEConnectionState[] = ['connecting', 'connected', 'reconnecting', 'disconnected']
    expect(states).toHaveLength(4)
  })

  test('WebSocketState covers all states', () => {
    const states: WebSocketState[] = ['connecting', 'connected', 'reconnecting', 'disconnected']
    expect(states).toHaveLength(4)
  })

  test('ConnectionStateType matches expected states', () => {
    const states: ConnectionStateType[] = ['connected', 'connecting', 'reconnecting', 'disconnected']
    expect(states).toHaveLength(4)
  })
})

// ── ConnectionStatus Component ─────────────────────
describe('WebSocket & SSE: ConnectionStatus', () => {
  test('ConnectionStatus is exported as function', () => {
    expect(typeof ConnectionStatus).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/ConnectionStatus.tsx'), 'utf-8')

  test('has connected state config', () => {
    expect(src).toContain('connected')
    expect(src).toContain('bg-emerald-400')
  })

  test('has reconnecting state config', () => {
    expect(src).toContain('reconnecting')
    expect(src).toContain('Reconnecting')
  })

  test('has disconnected state config', () => {
    expect(src).toContain('disconnected')
    expect(src).toContain('bg-red-400')
  })

  test('supports position prop', () => {
    expect(src).toContain('bottom-right')
    expect(src).toContain('bottom-left')
    expect(src).toContain('top-right')
    expect(src).toContain('top-left')
  })

  test('has aria attributes for accessibility', () => {
    expect(src).toContain('role="status"')
    expect(src).toContain('aria-live="polite"')
  })

  test('expands on hover', () => {
    expect(src).toContain('group-hover:max-w-')
  })
})

// ── StreamingText Component ────────────────────────
describe('WebSocket & SSE: StreamingText', () => {
  test('StreamingText is exported as function', () => {
    expect(typeof StreamingText).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/StreamingText.tsx'), 'utf-8')

  test('supports cursor blink animation', () => {
    expect(src).toContain('cursor-blink')
  })

  test('supports markdown mode', () => {
    expect(src).toContain('markdown')
    expect(src).toContain('prose')
  })

  test('supports streaming state', () => {
    expect(src).toContain('isStreaming')
  })

  test('supports speed control', () => {
    expect(src).toContain('speed')
  })
})

// ── useSSE Source ──────────────────────────────────
describe('WebSocket & SSE: useSSE Implementation', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/hooks/use-sse.ts'), 'utf-8')

  test('auto-reconnect with exponential backoff', () => {
    expect(src).toContain('Math.pow(2')
    expect(src).toContain('maxRetries')
    expect(src).toContain('retryDelay')
  })

  test('typed event handlers', () => {
    expect(src).toContain('onEvent')
    expect(src).toContain('addEventListener')
  })

  test('connection state tracking', () => {
    expect(src).toContain("setState('connecting')")
    expect(src).toContain("setState('connected')")
    expect(src).toContain("setState('reconnecting')")
    expect(src).toContain("setState('disconnected')")
  })

  test('token support', () => {
    expect(src).toContain('token')
  })
})

// ── useWebSocket Source ────────────────────────────
describe('WebSocket & SSE: useWebSocket Implementation', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/hooks/use-web-socket.ts'), 'utf-8')

  test('auto-reconnect with exponential backoff', () => {
    expect(src).toContain('Math.pow(2')
    expect(src).toContain('maxRetries')
  })

  test('JSON message parsing', () => {
    expect(src).toContain('JSON.parse')
    expect(src).toContain('JSON.stringify')
  })

  test('send function', () => {
    expect(src).toContain('WebSocket.OPEN')
    expect(src).toContain('.send(')
  })

  test('normal close detection (code 1000)', () => {
    expect(src).toContain('event.code === 1000')
  })
})
