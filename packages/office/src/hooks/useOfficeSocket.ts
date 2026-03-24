import { useEffect, useRef, useState, useCallback } from 'react'
import type { AgentOfficeState } from '@corthex/shared'

type OfficeSocketOptions = {
  companyId: string
  token: string
}

export function useOfficeSocket({ companyId, token }: OfficeSocketOptions) {
  const [agents, setAgents] = useState<AgentOfficeState[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      // Subscribe to the office channel
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'office' }))
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
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
    }

    ws.onerror = () => {
      // onclose will fire after onerror
    }
  }, [companyId, token])

  const reconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    // Keepalive ping every 30s
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30_000)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])

  return { agents, connected, reconnect }
}
