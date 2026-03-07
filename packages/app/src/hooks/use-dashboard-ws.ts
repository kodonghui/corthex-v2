import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore } from '../stores/ws-store'
import type { WsChannel } from '@corthex/shared'

const DASHBOARD_CHANNELS: WsChannel[] = ['cost', 'agent-status', 'command']

/**
 * Subscribe to WS channels relevant to dashboard and auto-invalidate react-query cache.
 * Replaces 30s polling with instant push updates.
 */
export function useDashboardWs() {
  const queryClient = useQueryClient()
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (!isConnected) {
      subscribedRef.current = false
      return
    }

    if (!subscribedRef.current) {
      for (const ch of DASHBOARD_CHANNELS) {
        subscribe(ch)
      }
      subscribedRef.current = true
    }

    const handleCost = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-usage'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-budget'] })
    }

    const handleAgentStatus = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }

    const handleCommand = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }

    addListener('cost', handleCost)
    addListener('agent-status', handleAgentStatus)
    addListener('command', handleCommand)

    return () => {
      removeListener('cost', handleCost)
      removeListener('agent-status', handleAgentStatus)
      removeListener('command', handleCommand)
    }
  }, [isConnected, subscribe, addListener, removeListener, queryClient])
}
