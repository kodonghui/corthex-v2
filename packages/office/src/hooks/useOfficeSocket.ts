import { useEffect, useRef, useState, useCallback } from 'react'
import type { AgentOfficeState } from '@corthex/shared'

type OfficeSocketOptions = {
  companyId: string
  token: string
}

export const RECONNECT_CONFIG = {
  initialDelayMs: 1_000,
  maxDelayMs: 30_000,
  maxAttempts: 10,
  pongTimeoutMs: 15_000,
  pingIntervalMs: 30_000,
} as const

export function useOfficeSocket({ companyId, token }: OfficeSocketOptions) {
  const [agents, setAgents] = useState<AgentOfficeState[]>([])
  const [connected, setConnected] = useState(false)
  const [connectionLost, setConnectionLost] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const manualCloseRef = useRef(false)

  const clearPongTimer = useCallback(() => {
    if (pongTimerRef.current) {
      clearTimeout(pongTimerRef.current)
      pongTimerRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (manualCloseRef.current) return

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setConnectionLost(false)
      reconnectAttemptRef.current = 0
      // Subscribe to the office channel
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'office' }))
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)

        // Handle pong — reset pong timeout
        if (msg.type === 'pong') {
          clearPongTimer()
          return
        }

        if (msg.type !== 'data' || msg.channel !== 'office') return
        const payload = msg.data
        if (!payload?.type) return

        if (payload.type === 'office_state') {
          setAgents(payload.agents)
        } else if (payload.type === 'agent_update') {
          setAgents((prev) => {
            const exists = prev.some((a) => a.agentId === payload.agent.agentId)
            if (exists) {
              return prev.map((a) =>
                a.agentId === payload.agent.agentId ? payload.agent : a,
              )
            }
            return [...prev, payload.agent]
          })
        } else if (payload.type === 'agent_activity') {
          setAgents((prev) =>
            prev.map((a) =>
              a.agentId === payload.agentId
                ? { ...a, currentTask: payload.activity, lastActiveAt: new Date().toISOString() }
                : a,
            ),
          )
        }
      } catch {
        // Ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
      clearPongTimer()

      // Auto-reconnect with exponential backoff (unless manually closed)
      if (!manualCloseRef.current) {
        const attempt = reconnectAttemptRef.current
        if (attempt >= RECONNECT_CONFIG.maxAttempts) {
          setConnectionLost(true)
          return
        }

        const delay = Math.min(
          RECONNECT_CONFIG.initialDelayMs * Math.pow(2, attempt),
          RECONNECT_CONFIG.maxDelayMs,
        )
        reconnectAttemptRef.current = attempt + 1
        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, delay)
      }
    }

    ws.onerror = () => {
      // onclose will fire after onerror
    }
  }, [companyId, token, clearPongTimer])

  const reconnect = useCallback(() => {
    // Reset reconnection state
    reconnectAttemptRef.current = 0
    manualCloseRef.current = false
    setConnectionLost(false)
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    wsRef.current?.close()
    wsRef.current = null
    connect()
  }, [connect])

  useEffect(() => {
    manualCloseRef.current = false
    connect()

    // Keepalive ping every 30s with pong timeout
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))

        // Start pong timeout — if no pong in 15s, reconnect
        clearPongTimer()
        pongTimerRef.current = setTimeout(() => {
          wsRef.current?.close()
        }, RECONNECT_CONFIG.pongTimeoutMs)
      }
    }, RECONNECT_CONFIG.pingIntervalMs)

    return () => {
      manualCloseRef.current = true
      clearInterval(interval)
      clearPongTimer()
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect, clearPongTimer])

  return { agents, connected, connectionLost, reconnect }
}
