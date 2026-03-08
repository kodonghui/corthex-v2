import { useEffect, useRef, useCallback, useState } from 'react'
import { useWsStore } from '../stores/ws-store'
import type { DebateWsEvent } from '@corthex/shared'

type DebateWsHandler = (event: DebateWsEvent) => void

/**
 * Subscribe to a specific debate's WebSocket channel.
 * Handles subscribe/unsubscribe lifecycle and dispatches typed events.
 */
export function useAgoraWs(debateId: string | null, onEvent: DebateWsHandler) {
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const subscribedIdRef = useRef<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  // Stable callback ref to avoid re-subscribe on handler change
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  const stableHandler = useCallback((data: unknown) => {
    const event = data as DebateWsEvent
    handlerRef.current(event)
  }, [])

  useEffect(() => {
    if (!isConnected || !debateId) {
      setIsStreaming(false)
      subscribedIdRef.current = null
      return
    }

    const channelKey = `debate::${debateId}`

    // Subscribe to the debate channel
    subscribe('debate', { id: debateId })
    subscribedIdRef.current = debateId
    setIsStreaming(true)

    addListener(channelKey, stableHandler)

    return () => {
      removeListener(channelKey, stableHandler)
      setIsStreaming(false)
    }
  }, [isConnected, debateId, subscribe, addListener, removeListener, stableHandler])

  return { isStreaming }
}
