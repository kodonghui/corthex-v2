import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore } from '../stores/ws-store'
import type { WsChannel } from '@corthex/shared'

const ACTIVITY_CHANNELS: WsChannel[] = ['activity-log', 'delegation', 'tool', 'command']

/**
 * Subscribe to WS channels relevant to activity log and auto-invalidate
 * the active tab's react-query cache on new events.
 */
export function useActivityWs(activeTab: string) {
  const queryClient = useQueryClient()
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (!isConnected) {
      subscribedRef.current = false
      return
    }

    if (!subscribedRef.current) {
      for (const ch of ACTIVITY_CHANNELS) {
        subscribe(ch)
      }
      subscribedRef.current = true
    }

    const invalidateTab = () => {
      switch (activeTab) {
        case 'agents':
          queryClient.invalidateQueries({ queryKey: ['activity-agents'] })
          break
        case 'delegations':
          queryClient.invalidateQueries({ queryKey: ['activity-delegations'] })
          break
        case 'quality':
          queryClient.invalidateQueries({ queryKey: ['activity-quality'] })
          break
        case 'tools':
          queryClient.invalidateQueries({ queryKey: ['activity-tools'] })
          break
      }
    }

    addListener('activity-log', invalidateTab)
    addListener('delegation', invalidateTab)
    addListener('tool', invalidateTab)
    addListener('command', invalidateTab)

    return () => {
      removeListener('activity-log', invalidateTab)
      removeListener('delegation', invalidateTab)
      removeListener('tool', invalidateTab)
      removeListener('command', invalidateTab)
    }
  }, [isConnected, activeTab, subscribe, addListener, removeListener, queryClient])
}
