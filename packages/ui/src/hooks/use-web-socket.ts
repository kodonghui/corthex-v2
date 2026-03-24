/**
 * useWebSocket — Generic WebSocket hook with auto-reconnect and JSON parsing.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

export type WebSocketState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export interface UseWebSocketOptions<TIn = unknown, TOut = unknown> {
  /** WebSocket endpoint URL (ws:// or wss://) */
  url: string | null
  /** Whether to enable the connection */
  enabled?: boolean
  /** Message handler */
  onMessage?: (data: TIn) => void
  /** Open handler */
  onOpen?: () => void
  /** Close handler */
  onClose?: (event: CloseEvent) => void
  /** Error handler */
  onError?: (event: Event) => void
  /** Max reconnect attempts (default 5) */
  maxRetries?: number
  /** Base retry delay in ms (default 1000) */
  retryDelay?: number
  /** Protocols */
  protocols?: string | string[]
}

export interface UseWebSocketResult<TOut = unknown> {
  /** Current connection state */
  state: WebSocketState
  /** Send a message (auto-serialized to JSON if object) */
  send: (data: TOut | string) => void
  /** Close the connection */
  close: () => void
  /** Manually reconnect */
  reconnect: () => void
  /** Number of reconnect attempts */
  retryCount: number
}

export function useWebSocket<TIn = unknown, TOut = unknown>({
  url,
  enabled = true,
  onMessage,
  onOpen,
  onClose,
  onError,
  maxRetries = 5,
  retryDelay = 1000,
  protocols,
}: UseWebSocketOptions<TIn, TOut>): UseWebSocketResult<TOut> {
  const [state, setState] = useState<WebSocketState>('disconnected')
  const [retryCount, setRetryCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = undefined
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!url) return
    cleanup()

    setState('connecting')
    const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setState('connected')
      setRetryCount(0)
      onOpen?.()
    }

    ws.onmessage = (event) => {
      if (!onMessage) return
      try {
        const data = JSON.parse(event.data) as TIn
        onMessage(data)
      } catch {
        onMessage(event.data as TIn)
      }
    }

    ws.onclose = (event) => {
      onClose?.(event)
      wsRef.current = null

      // Don't reconnect on normal close (code 1000)
      if (event.code === 1000) {
        setState('disconnected')
        return
      }

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

    ws.onerror = (error) => {
      onError?.(error)
    }
  }, [url, protocols, onMessage, onOpen, onClose, onError, maxRetries, retryDelay, cleanup])

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

  const send = useCallback((data: TOut | string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg = typeof data === 'string' ? data : JSON.stringify(data)
      wsRef.current.send(msg)
    }
  }, [])

  const close = useCallback(() => {
    cleanup()
    setState('disconnected')
    setRetryCount(0)
  }, [cleanup])

  const reconnect = useCallback(() => {
    setRetryCount(0)
    connect()
  }, [connect])

  return { state, send, close, reconnect, retryCount }
}
