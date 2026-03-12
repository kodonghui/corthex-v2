/**
 * Story 6.3: SSE 상태 머신 + 에러 투명성
 *
 * 상태 전이: idle → connecting → accepted → processing → streaming → done / error
 * fetch() + ReadableStream 기반 (POST 지원, EventSource는 GET 전용이라 사용 불가)
 * 네트워크 에러 시 최대 2회 재시도 (지수 백오프: 3초 → 6초)
 * 연결 타임아웃 30초, 세션 타임아웃 120초
 */

import { useState, useCallback, useRef } from 'react'
import {
  getErrorMessage,
  getHandoffErrorMessage,
  isHandoffError,
} from '../lib/error-messages'

// ─── Types ──────────────────────────────────────────────────────────────────

export type SSEConnectionState =
  | 'idle'
  | 'connecting'
  | 'accepted'
  | 'processing'
  | 'streaming'
  | 'done'
  | 'error'

export interface HandoffEntry {
  from: string
  to: string
  depth: number
  status: 'delegating' | 'completed' | 'failed'
}

export interface SSEErrorInfo {
  code: string
  message: string
  agentName?: string
  isHandoffError: boolean
}

export interface SSECostInfo {
  costUsd: number
  tokensUsed: number
  learnedCount: number
}

export interface SSEStateMachineResult {
  /** Current state of the SSE connection */
  state: SSEConnectionState
  /** Accumulated streaming text */
  streamingText: string
  /** Currently processing agent name */
  processingAgent: string | null
  /** Handoff chain tracking */
  handoffChain: HandoffEntry[]
  /** Error information (null when no error) */
  errorInfo: SSEErrorInfo | null
  /** Cost info (available after done) */
  costInfo: SSECostInfo | null
  /** Session ID from accepted event */
  sessionId: string | null
  /** Retry count (0-2) */
  retryCount: number
  /** Send a message to hub stream */
  sendMessage: (message: string, currentSessionId?: string | null) => Promise<void>
  /** Stop the current stream */
  stop: () => void
  /** Clear error and return to idle */
  clearError: () => void
  /** Reset all state to initial */
  reset: () => void
}

export interface SSEStateMachineOptions {
  /** Callback for every raw SSE event (for tool-start, tool-end, etc.) */
  onRawEvent?: (event: ParsedSSEEvent) => void
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CONNECTION_TIMEOUT_MS = 30_000
const SESSION_TIMEOUT_MS = 120_000
const MAX_RETRIES = 2
const BASE_RETRY_DELAY_MS = 3_000

// ─── Valid state transitions ────────────────────────────────────────────────

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

// ─── SSE Chunk Parser ───────────────────────────────────────────────────────

export interface ParsedSSEEvent {
  event: string
  data: Record<string, unknown>
}

function parseSSEChunk(chunk: string): ParsedSSEEvent[] {
  const events: ParsedSSEEvent[] = []
  const blocks = chunk.split('\n\n').filter(Boolean)

  for (const block of blocks) {
    const lines = block.split('\n')
    let eventType = 'message'
    let dataStr = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        dataStr += line.slice(6)
      }
    }

    if (dataStr) {
      try {
        events.push({ event: eventType, data: JSON.parse(dataStr) })
      } catch {
        // skip malformed JSON
      }
    }
  }
  return events
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSSEStateMachine(options?: SSEStateMachineOptions): SSEStateMachineResult {
  const [state, setState] = useState<SSEConnectionState>('idle')
  const [streamingText, setStreamingText] = useState('')
  const [processingAgent, setProcessingAgent] = useState<string | null>(null)
  const [handoffChain, setHandoffChain] = useState<HandoffEntry[]>([])
  const [errorInfo, setErrorInfo] = useState<SSEErrorInfo | null>(null)
  const [costInfo, setCostInfo] = useState<SSECostInfo | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef('')
  const stateRef = useRef<SSEConnectionState>('idle')
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const lastMessageRef = useRef<string>('')
  const lastSessionIdRef = useRef<string | null>(null)

  // Keep stateRef in sync
  const setStateTracked = useCallback((newState: SSEConnectionState) => {
    stateRef.current = newState
    setState(newState)
  }, [])

  // Transition only if valid
  const transition = useCallback(
    (to: SSEConnectionState): boolean => {
      const from = stateRef.current
      if (from === to && to === 'streaming') {
        // streaming → streaming is allowed (append text)
        return true
      }
      if (canTransition(from, to)) {
        setStateTracked(to)
        return true
      }
      // Invalid transition — ignore silently
      return false
    },
    [setStateTracked]
  )

  const clearTimers = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = null
    }
  }, [])

  const setErrorState = useCallback(
    (code: string, message: string, agentName?: string) => {
      const info: SSEErrorInfo = {
        code,
        message: isHandoffError(code)
          ? getHandoffErrorMessage(code, { agentName })
          : getErrorMessage(code),
        agentName,
        isHandoffError: isHandoffError(code),
      }
      setErrorInfo(info)
      transition('error')
    },
    [transition]
  )

  const executeStream = useCallback(
    async (message: string, currentSessionId?: string | null) => {
      // Abort previous stream
      if (abortRef.current) {
        abortRef.current.abort()
      }

      const controller = new AbortController()
      abortRef.current = controller

      // Reset streaming state (keep retryCount if retrying)
      setStreamingText('')
      setProcessingAgent(null)
      setHandoffChain([])
      setErrorInfo(null)
      setCostInfo(null)
      bufferRef.current = ''
      clearTimers()

      // Transition to connecting
      setStateTracked('connecting')

      // Connection timeout (30s)
      connectionTimeoutRef.current = setTimeout(() => {
        if (stateRef.current === 'connecting') {
          controller.abort()
          setErrorState('CONNECTION_TIMEOUT', '연결 시간이 초과되었습니다')
        }
      }, CONNECTION_TIMEOUT_MS)

      // Session timeout (120s)
      sessionTimeoutRef.current = setTimeout(() => {
        const activeStates: SSEConnectionState[] = [
          'connecting',
          'accepted',
          'processing',
          'streaming',
        ]
        if (activeStates.includes(stateRef.current)) {
          controller.abort()
          setErrorState('SESSION_TIMEOUT', '세션 시간이 초과되었습니다')
        }
      }, SESSION_TIMEOUT_MS)

      const token = localStorage.getItem('corthex_token')
      const body: Record<string, string> = { message }
      if (currentSessionId) {
        body.sessionId = currentSessionId
      }

      try {
        const response = await fetch('/api/workspace/hub/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        // Clear connection timeout on response
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = null
        }

        if (!response.ok) {
          const errBody = await response.text().catch(() => '')
          let errCode = `HTTP_${response.status}`
          let errMsg = `서버 오류 (${response.status})`

          // Try to parse error body for structured error
          try {
            const parsed = JSON.parse(errBody)
            if (parsed.error?.code) errCode = parsed.error.code
            if (parsed.error?.message) errMsg = parsed.error.message
          } catch {
            // use defaults
          }

          setErrorState(errCode, errMsg)
          clearTimers()
          return
        }

        if (!response.body) {
          setErrorState('NO_RESPONSE_BODY', '서버 응답을 받을 수 없습니다')
          clearTimers()
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          bufferRef.current += decoder.decode(value, { stream: true })

          // Process complete SSE events (delimited by \n\n)
          const parts = bufferRef.current.split('\n\n')
          bufferRef.current = parts.pop() || ''

          const chunk = parts.join('\n\n') + '\n\n'
          const events = parseSSEChunk(chunk)

          for (const evt of events) {
            // Fire raw event callback for extended event handling
            options?.onRawEvent?.(evt)

            switch (evt.event) {
              case 'accepted':
                // Story 15.3: 300ms delay before showing spinner (base ux-design-spec override)
                // Semantic cache hits resolve in <=100ms — immediate spinner causes flicker
                setTimeout(() => transition('accepted'), 300)
                if (evt.data.sessionId) {
                  setSessionId(evt.data.sessionId as string)
                }
                break

              case 'processing':
                transition('processing')
                if (evt.data.agentName) {
                  setProcessingAgent(evt.data.agentName as string)
                }
                break

              case 'handoff':
                setHandoffChain((prev) => [
                  ...prev,
                  {
                    from: (evt.data.from as string) || '',
                    to: (evt.data.to as string) || '',
                    depth: (evt.data.depth as number) || 0,
                    status: 'delegating',
                  },
                ])
                break

              case 'message':
                transition('streaming')
                if (evt.data.content) {
                  setStreamingText((prev) => prev + (evt.data.content as string))
                }
                break

              case 'error': {
                const code = (evt.data.code as string) || 'UNKNOWN'
                const message =
                  (evt.data.message as string) || '응답 중 오류가 발생했습니다'
                const agentName = evt.data.agentName as string | undefined

                // Mark handoff as failed if relevant
                if (isHandoffError(code) && agentName) {
                  setHandoffChain((prev) =>
                    prev.map((h) =>
                      h.to === agentName || h.from === agentName
                        ? { ...h, status: 'failed' as const }
                        : h
                    )
                  )
                }

                setErrorState(code, message, agentName)
                break
              }

              case 'done':
                transition('done')
                setCostInfo({
                  costUsd: (evt.data.costUsd as number) || 0,
                  tokensUsed: (evt.data.tokensUsed as number) || 0,
                  learnedCount: (evt.data.learnedCount as number) || 0,
                })
                break
            }
          }
        }

        // Stream ended without done event
        if (
          stateRef.current !== 'error' &&
          stateRef.current !== 'done'
        ) {
          setStateTracked('done')
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // Intentional abort — don't set error unless it was a timeout
          if (stateRef.current !== 'error') {
            return
          }
          // Error already set by timeout handler
          return
        }

        // Network error — attempt retry
        const isNetworkError =
          (err as Error).message === 'Failed to fetch' ||
          (err as Error).message.includes('NetworkError') ||
          (err as Error).message.includes('network')

        if (isNetworkError && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1
          setRetryCount(retryCountRef.current)
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current - 1)
          // Wait then retry
          await new Promise((resolve) => setTimeout(resolve, delay))
          // Retry with same message
          return executeStream(message, currentSessionId)
        }

        setErrorState(
          'NETWORK_ERROR',
          (err as Error).message || '네트워크 연결 오류가 발생했습니다'
        )
      } finally {
        clearTimers()
      }
    },
    [transition, setStateTracked, clearTimers, setErrorState]
  )

  const sendMessage = useCallback(
    async (message: string, currentSessionId?: string | null) => {
      // Reset retry counter for new message
      retryCountRef.current = 0
      setRetryCount(0)
      lastMessageRef.current = message
      lastSessionIdRef.current = currentSessionId ?? null

      return executeStream(message, currentSessionId)
    },
    [executeStream]
  )

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    clearTimers()
    setStateTracked('idle')
  }, [clearTimers, setStateTracked])

  const clearError = useCallback(() => {
    setErrorInfo(null)
    setStateTracked('idle')
  }, [setStateTracked])

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    clearTimers()
    setStateTracked('idle')
    setStreamingText('')
    setProcessingAgent(null)
    setHandoffChain([])
    setErrorInfo(null)
    setCostInfo(null)
    setSessionId(null)
    setRetryCount(0)
    retryCountRef.current = 0
    bufferRef.current = ''
  }, [clearTimers, setStateTracked])

  return {
    state,
    streamingText,
    processingAgent,
    handoffChain,
    errorInfo,
    costInfo,
    sessionId,
    retryCount,
    sendMessage,
    stop,
    clearError,
    reset,
  }
}
