import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore } from '../stores/ws-store'

export type ToolCall = {
  toolId: string
  toolName: string
  status: 'running' | 'done'
  input?: string
  result?: string
  durationMs?: number
  error?: boolean
}

export type DelegationStatusEntry = {
  targetAgentName: string
  targetAgentId: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
}

export type DelegationStatus = DelegationStatusEntry | null

// 복수 위임 상태 추적 (agentId → status)
export type DelegationStatuses = Record<string, DelegationStatusEntry>

type StreamEvent = {
  type: 'token' | 'tool-start' | 'tool-end' | 'done' | 'error' | 'delegation-start' | 'delegation-end' | 'delegation-chain'
  content?: string
  toolName?: string
  toolId?: string
  input?: string
  result?: string
  durationMs?: number
  error?: boolean
  sessionId?: string
  code?: string
  message?: string
  targetAgentName?: string
  targetAgentId?: string
  status?: string
  chain?: string[]
}

export function useChatStream(sessionId: string | null) {
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [error, setError] = useState<string | null>(null)
  const [delegationStatus, setDelegationStatus] = useState<DelegationStatus>(null)
  const [delegationStatuses, setDelegationStatuses] = useState<DelegationStatuses>({})
  const [delegationChain, setDelegationChain] = useState<string[] | null>(null)
  const queryClient = useQueryClient()
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const subscribedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!sessionId || !isConnected) return

    // 세션 채널 구독
    if (subscribedRef.current !== sessionId) {
      subscribe('chat-stream', { id: sessionId })
      subscribedRef.current = sessionId
    }

    const handler = (data: unknown) => {
      const event = data as StreamEvent
      switch (event.type) {
        case 'token':
          setStreamingText((prev) => prev + (event.content || ''))
          break
        case 'tool-start':
          setToolCalls((prev) => [
            ...prev,
            { toolId: event.toolId || '', toolName: event.toolName || '', status: 'running', input: event.input },
          ])
          break
        case 'tool-end':
          setToolCalls((prev) =>
            prev.map((t) =>
              t.toolId === event.toolId
                ? { ...t, status: 'done' as const, result: event.result, durationMs: event.durationMs, error: event.error }
                : t,
            ),
          )
          break
        case 'delegation-start': {
          const startEntry = {
            targetAgentName: event.targetAgentName || '',
            targetAgentId: event.targetAgentId || '',
            status: 'delegating' as const,
          }
          setDelegationStatus(startEntry)
          setDelegationStatuses(prev => ({
            ...prev,
            [event.targetAgentId || '']: startEntry,
          }))
          break
        }
        case 'delegation-end': {
          const endEntry = {
            targetAgentName: event.targetAgentName || '',
            targetAgentId: event.targetAgentId || '',
            status: (event.status as 'completed' | 'failed') || 'completed',
            durationMs: event.durationMs,
          }
          setDelegationStatus(endEntry)
          setDelegationStatuses(prev => ({
            ...prev,
            [event.targetAgentId || '']: endEntry,
          }))
          // 위임 완료 시 위임 내역 쿼리 갱신
          queryClient.invalidateQueries({ queryKey: ['delegations', sessionId] })
          break
        }
        case 'delegation-chain':
          setDelegationChain(event.chain || null)
          break
        case 'done':
          // refetch 완료 후 스트리밍 상태 초기화 (깜빡임 방지)
          setDelegationStatus(null)
          setDelegationStatuses({})
          setDelegationChain(null)
          Promise.all([
            queryClient.invalidateQueries({ queryKey: ['messages', sessionId] }),
            queryClient.invalidateQueries({ queryKey: ['sessions'] }),
            queryClient.invalidateQueries({ queryKey: ['tool-calls', sessionId] }),
            queryClient.invalidateQueries({ queryKey: ['delegations', sessionId] }),
          ]).then(() => {
            setIsStreaming(false)
            setStreamingText('')
            setToolCalls([])
          })
          break
        case 'error':
          setIsStreaming(false)
          setDelegationStatus(null)
          setDelegationStatuses({})
          setDelegationChain(null)
          setError(event.message || '응답 중 오류가 발생했습니다')
          break
      }
    }

    const channelKey = `chat-stream::${sessionId}`
    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [sessionId, isConnected, subscribe, addListener, removeListener, queryClient])

  const startStream = useCallback(() => {
    setIsStreaming(true)
    setStreamingText('')
    setToolCalls([])
    setError(null)
    setDelegationStatus(null)
    setDelegationStatuses({})
    setDelegationChain(null)
  }, [])

  const stopStream = useCallback(() => {
    setIsStreaming(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { streamingText, isStreaming, toolCalls, error, delegationStatus, delegationStatuses, delegationChain, startStream, stopStream, clearError }
}
