/**
 * useSSE — EventSource wrapper with auto-reconnect and typed events.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

export type SSEConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export interface UseSSEOptions<T = unknown> {
  /** SSE endpoint URL */
  url: string | null
  /** Whether to enable the connection */
  enabled?: boolean
  /** Event handlers by event type */
  onMessage?: (data: T) => void
  /** Named event handlers */
  onEvent?: Record<string, (data: unknown) => void>
  /** Error handler */
  onError?: (error: Event) => void
  /** Max reconnect attempts (default 5) */
  maxRetries?: number
  /** Base retry delay in ms (default 1000) */
  retryDelay?: number
  /** Auth token to send as query param */
  token?: string
}

export interface UseSSEResult {
  /** Current connection state */
  state: SSEConnectionState
  /** Manually close the connection */
  close: () => void
  /** Manually reconnect */
  reconnect: () => void
  /** Number of reconnect attempts */
  retryCount: number
}

export function useSSE<T = unknown>({
  url,
  enabled = true,
  onMessage,
  onEvent,
  onError,
  maxRetries = 5,
  retryDelay = 1000,
  token,
}: UseSSEOptions<T>): UseSSEResult {
  const [state, setState] = useState<SSEConnectionState>('disconnected')
  const [retryCount, setRetryCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = undefined
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!url) return
    cleanup()

    setState('connecting')
    const fullUrl = token ? `${url}${url.includes('?') ? '&' : '?'}token=${token}` : url
    const es = new EventSource(fullUrl)
    eventSourceRef.current = es

    es.onopen = () => {
      setState('connected')
      setRetryCount(0)
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T
        onMessage?.(data)
      } catch {
        onMessage?.(event.data as T)
      }
    }

    // Register named event handlers
    if (onEvent) {
      for (const [eventName, handler] of Object.entries(onEvent)) {
        es.addEventListener(eventName, (event: MessageEvent) => {
          try {
            handler(JSON.parse(event.data))
          } catch {
            handler(event.data)
          }
        })
      }
    }

    es.onerror = (error) => {
      onError?.(error)
      es.close()
      eventSourceRef.current = null

      setRetryCount((prev) => {
        const next = prev + 1
        if (next <= maxRetries) {
          setState('reconnecting')
          const delay = retryDelay * Math.pow(2, prev)
          retryTimerRef.current = setTimeout(() => connect(), delay)
        } else {
          setState('disconnected')
        }
        return next
      })
    }
  }, [url, token, onMessage, onEvent, onError, maxRetries, retryDelay, cleanup])

  useEffect(() => {
    if (enabled && url) {
      connect()
    } else {
      cleanup()
      setState('disconnected')
      setRetryCount(0)
    }
    return cleanup
  }, [url, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    cleanup()
    setState('disconnected')
    setRetryCount(0)
  }, [cleanup])

  const reconnect = useCallback(() => {
    setRetryCount(0)
    connect()
  }, [connect])

  return { state, close, reconnect, retryCount }
}
