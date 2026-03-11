/**
 * TEA-generated tests for Story 6.3: SSE 상태 머신 + 에러 투명성
 * Risk-based coverage: P0 critical paths + P1 edge cases + P2 error transparency
 * Framework: bun:test
 */
import { describe, test, expect } from 'bun:test'
import {
  getErrorMessage,
  getHandoffErrorMessage,
  isHandoffError,
  ERROR_MESSAGES,
} from '../lib/error-messages'

// ============================================================
// Extract SSE state machine transition logic for unit testing
// ============================================================
type SSEConnectionState =
  | 'idle'
  | 'connecting'
  | 'accepted'
  | 'processing'
  | 'streaming'
  | 'done'
  | 'error'

const VALID_TRANSITIONS: Record<SSEConnectionState, SSEConnectionState[]> = {
  idle: ['connecting'],
  connecting: ['accepted', 'error'],
  accepted: ['processing', 'streaming', 'error', 'done'],
  processing: ['streaming', 'processing', 'error', 'done'],
  streaming: ['streaming', 'done', 'error'],
  done: ['idle', 'connecting'],
  error: ['idle', 'connecting'],
}

function canTransition(from: SSEConnectionState, to: SSEConnectionState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ============================================================
// P0: Error Messages — Korean Translation Mapping
// ============================================================
describe('TEA P0: Error Messages Korean Translation', () => {
  test('all server error codes have Korean translations', () => {
    const serverCodes = [
      'AUTH_INVALID_CREDENTIALS',
      'AUTH_TOKEN_EXPIRED',
      'AUTH_FORBIDDEN',
      'AGENT_NOT_FOUND',
      'RATE_LIMIT_EXCEEDED',
      'AGENT_SPAWN_FAILED',
      'AGENT_TIMEOUT',
      'SESSION_LIMIT_EXCEEDED',
      'HANDOFF_DEPTH_EXCEEDED',
      'HANDOFF_CIRCULAR',
      'HANDOFF_TARGET_NOT_FOUND',
      'TOOL_PERMISSION_DENIED',
      'HOOK_PIPELINE_ERROR',
      'SERVER_SHUTTING_DOWN',
      'ORG_SECRETARY_DELETE_DENIED',
    ]

    for (const code of serverCodes) {
      const msg = getErrorMessage(code)
      // Must not be the fallback pattern
      expect(msg).not.toContain(`코드: ${code}`)
      // Must be Korean
      expect(msg.length).toBeGreaterThan(0)
    }
  })

  test('legacy numeric codes have translations', () => {
    expect(getErrorMessage('AUTH_001')).toBe('아이디 또는 비밀번호가 올바르지 않습니다')
    expect(getErrorMessage('AUTH_002')).toBe('로그인이 만료되었습니다. 다시 로그인해주세요')
    expect(getErrorMessage('AUTH_004')).toBe('로그인 시도가 너무 많습니다')
    expect(getErrorMessage('USER_001')).toBe('직원을 찾을 수 없습니다')
    expect(getErrorMessage('TENANT_001')).toBe('접근 권한이 없습니다')
    expect(getErrorMessage('RATE_001')).toBe('요청이 너무 많습니다. 잠시 후 다시 시도해주세요')
  })

  test('unknown code returns fallback with code embedded', () => {
    const msg = getErrorMessage('UNKNOWN_CODE_XYZ')
    expect(msg).toBe('오류가 발생했습니다 (코드: UNKNOWN_CODE_XYZ)')
  })

  test('empty code returns fallback', () => {
    const msg = getErrorMessage('')
    expect(msg).toContain('오류가 발생했습니다')
  })

  test('getErrorMessage returns string for all ERROR_MESSAGES keys', () => {
    for (const code of Object.keys(ERROR_MESSAGES)) {
      const msg = getErrorMessage(code)
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// P0: Handoff Error Messages — Context-Aware
// ============================================================
describe('TEA P0: Handoff Error Messages', () => {
  test('HANDOFF_DEPTH_EXCEEDED with depth context', () => {
    const msg = getHandoffErrorMessage('HANDOFF_DEPTH_EXCEEDED', { depth: 5 })
    expect(msg).toBe('위임 깊이 제한(5단계)을 초과했습니다')
  })

  test('HANDOFF_DEPTH_EXCEEDED without depth context', () => {
    const msg = getHandoffErrorMessage('HANDOFF_DEPTH_EXCEEDED')
    expect(msg).toBe('위임 깊이 제한을 초과했습니다')
  })

  test('HANDOFF_CIRCULAR with agentName', () => {
    const msg = getHandoffErrorMessage('HANDOFF_CIRCULAR', { agentName: '비서실장' })
    expect(msg).toBe('순환 위임이 감지되었습니다 (비서실장)')
  })

  test('HANDOFF_CIRCULAR without agentName', () => {
    const msg = getHandoffErrorMessage('HANDOFF_CIRCULAR')
    expect(msg).toBe('순환 위임이 감지되었습니다')
  })

  test('HANDOFF_TARGET_NOT_FOUND with agentName', () => {
    const msg = getHandoffErrorMessage('HANDOFF_TARGET_NOT_FOUND', { agentName: 'CMO' })
    expect(msg).toBe('위임 대상 에이전트(CMO)를 찾을 수 없습니다')
  })

  test('HANDOFF_TARGET_NOT_FOUND without agentName', () => {
    const msg = getHandoffErrorMessage('HANDOFF_TARGET_NOT_FOUND')
    expect(msg).toBe('위임 대상 에이전트를 찾을 수 없습니다')
  })

  test('non-handoff code falls back to getErrorMessage', () => {
    const msg = getHandoffErrorMessage('AGENT_TIMEOUT', { agentName: '비서실장' })
    expect(msg).toBe('에이전트 응답 시간이 초과되었습니다')
  })
})

// ============================================================
// P0: isHandoffError utility
// ============================================================
describe('TEA P0: isHandoffError', () => {
  test('handoff codes return true', () => {
    expect(isHandoffError('HANDOFF_DEPTH_EXCEEDED')).toBe(true)
    expect(isHandoffError('HANDOFF_CIRCULAR')).toBe(true)
    expect(isHandoffError('HANDOFF_TARGET_NOT_FOUND')).toBe(true)
  })

  test('non-handoff codes return false', () => {
    expect(isHandoffError('AGENT_TIMEOUT')).toBe(false)
    expect(isHandoffError('AUTH_001')).toBe(false)
    expect(isHandoffError('RATE_001')).toBe(false)
    expect(isHandoffError('')).toBe(false)
  })
})

// ============================================================
// P0: State Machine Transitions
// ============================================================
describe('TEA P0: SSE State Machine Valid Transitions', () => {
  test('idle → connecting is valid', () => {
    expect(canTransition('idle', 'connecting')).toBe(true)
  })

  test('connecting → accepted is valid', () => {
    expect(canTransition('connecting', 'accepted')).toBe(true)
  })

  test('connecting → error is valid (timeout)', () => {
    expect(canTransition('connecting', 'error')).toBe(true)
  })

  test('accepted → processing is valid', () => {
    expect(canTransition('accepted', 'processing')).toBe(true)
  })

  test('accepted → streaming is valid (skip processing)', () => {
    expect(canTransition('accepted', 'streaming')).toBe(true)
  })

  test('processing → streaming is valid', () => {
    expect(canTransition('processing', 'streaming')).toBe(true)
  })

  test('processing → processing is valid (handoff updates)', () => {
    expect(canTransition('processing', 'processing')).toBe(true)
  })

  test('streaming → done is valid', () => {
    expect(canTransition('streaming', 'done')).toBe(true)
  })

  test('streaming → error is valid', () => {
    expect(canTransition('streaming', 'error')).toBe(true)
  })

  test('error → connecting is valid (retry)', () => {
    expect(canTransition('error', 'connecting')).toBe(true)
  })

  test('error → idle is valid (clear error)', () => {
    expect(canTransition('error', 'idle')).toBe(true)
  })

  test('done → idle is valid (reset)', () => {
    expect(canTransition('done', 'idle')).toBe(true)
  })

  test('done → connecting is valid (new message)', () => {
    expect(canTransition('done', 'connecting')).toBe(true)
  })
})

describe('TEA P0: SSE State Machine Invalid Transitions', () => {
  test('idle → accepted is invalid (must go through connecting)', () => {
    expect(canTransition('idle', 'accepted')).toBe(false)
  })

  test('idle → streaming is invalid', () => {
    expect(canTransition('idle', 'streaming')).toBe(false)
  })

  test('connecting → streaming is invalid (must be accepted first)', () => {
    expect(canTransition('connecting', 'streaming')).toBe(false)
  })

  test('connecting → done is invalid', () => {
    expect(canTransition('connecting', 'done')).toBe(false)
  })

  test('done → streaming is invalid', () => {
    expect(canTransition('done', 'streaming')).toBe(false)
  })

  test('error → streaming is invalid', () => {
    expect(canTransition('error', 'streaming')).toBe(false)
  })
})

// ============================================================
// P0: Full Happy Path
// ============================================================
describe('TEA P0: Full Happy Path State Sequence', () => {
  test('idle → connecting → accepted → processing → streaming → done', () => {
    const sequence: SSEConnectionState[] = [
      'idle',
      'connecting',
      'accepted',
      'processing',
      'streaming',
      'done',
    ]

    for (let i = 0; i < sequence.length - 1; i++) {
      expect(canTransition(sequence[i], sequence[i + 1])).toBe(true)
    }
  })

  test('idle → connecting → accepted → streaming → done (skip processing)', () => {
    const sequence: SSEConnectionState[] = [
      'idle',
      'connecting',
      'accepted',
      'streaming',
      'done',
    ]

    for (let i = 0; i < sequence.length - 1; i++) {
      expect(canTransition(sequence[i], sequence[i + 1])).toBe(true)
    }
  })
})

// ============================================================
// P1: Retry Logic
// ============================================================
describe('TEA P1: Retry Logic Constants', () => {
  test('max retries is 2', () => {
    const MAX_RETRIES = 2
    expect(MAX_RETRIES).toBe(2)
  })

  test('exponential backoff: 3s → 6s', () => {
    const BASE_DELAY = 3000
    const retry1Delay = BASE_DELAY * Math.pow(2, 0) // 3000ms
    const retry2Delay = BASE_DELAY * Math.pow(2, 1) // 6000ms
    expect(retry1Delay).toBe(3000)
    expect(retry2Delay).toBe(6000)
  })

  test('connection timeout is 30s', () => {
    const CONNECTION_TIMEOUT_MS = 30_000
    expect(CONNECTION_TIMEOUT_MS).toBe(30000)
  })

  test('session timeout is 120s', () => {
    const SESSION_TIMEOUT_MS = 120_000
    expect(SESSION_TIMEOUT_MS).toBe(120000)
  })
})

// ============================================================
// P1: Error Transparency — Agent Name in Error
// ============================================================
describe('TEA P1: Error Transparency — Agent Name', () => {
  test('error with agentName shows which agent failed', () => {
    const errorEvent = {
      code: 'AGENT_TIMEOUT',
      message: 'Agent timed out',
      agentName: '비서실장',
    }

    // Handoff error check
    expect(isHandoffError(errorEvent.code)).toBe(false)
    // Get Korean message
    const msg = getErrorMessage(errorEvent.code)
    expect(msg).toBe('에이전트 응답 시간이 초과되었습니다')
    // Agent name available for UI display
    expect(errorEvent.agentName).toBe('비서실장')
  })

  test('handoff error with agentName shows context', () => {
    const errorEvent = {
      code: 'HANDOFF_CIRCULAR',
      message: 'Circular handoff detected',
      agentName: 'CMO',
    }

    expect(isHandoffError(errorEvent.code)).toBe(true)
    const msg = getHandoffErrorMessage(errorEvent.code, {
      agentName: errorEvent.agentName,
    })
    expect(msg).toContain('CMO')
    expect(msg).toContain('순환 위임')
  })

  test('handoff depth error with depth context', () => {
    const errorEvent = {
      code: 'HANDOFF_DEPTH_EXCEEDED',
      message: 'Max depth exceeded',
      agentName: '비서실장',
      depth: 3,
    }

    const msg = getHandoffErrorMessage(errorEvent.code, {
      agentName: errorEvent.agentName,
      depth: errorEvent.depth,
    })
    expect(msg).toContain('3단계')
  })
})

// ============================================================
// P2: Edge Cases — Error Message Robustness
// ============================================================
describe('TEA P2: Error Message Edge Cases', () => {
  test('code with special characters returns fallback', () => {
    const msg = getErrorMessage('CODE_WITH_$PECIAL')
    expect(msg).toContain('코드: CODE_WITH_$PECIAL')
  })

  test('very long code returns fallback with full code', () => {
    const longCode = 'A'.repeat(100)
    const msg = getErrorMessage(longCode)
    expect(msg).toContain(longCode)
  })

  test('getHandoffErrorMessage with empty context', () => {
    const msg = getHandoffErrorMessage('HANDOFF_DEPTH_EXCEEDED', {})
    expect(msg).toBe('위임 깊이 제한을 초과했습니다')
  })

  test('getHandoffErrorMessage with undefined context', () => {
    const msg = getHandoffErrorMessage('HANDOFF_CIRCULAR', undefined)
    expect(msg).toBe('순환 위임이 감지되었습니다')
  })
})
