import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore } from '../stores/ws-store'

export type ToolCall = {
  toolId: string
  toolName: string
  status: 'running' | 'done'
  result?: string
}

type StreamEvent = {
  type: 'token' | 'tool-start' | 'tool-end' | 'done' | 'error'
  content?: string
  toolName?: string
  toolId?: string
  result?: string
  sessionId?: string
  code?: string
  message?: string
}

export function useChatStream(sessionId: string | null) {
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [error, setError] = useState<string | null>(null)
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
            { toolId: event.toolId || '', toolName: event.toolName || '', status: 'running' },
          ])
          break
        case 'tool-end':
          setToolCalls((prev) =>
            prev.map((t) =>
              t.toolId === event.toolId
                ? { ...t, status: 'done' as const, result: event.result }
                : t,
            ),
          )
          break
        case 'done':
          // refetch 완료 후 스트리밍 상태 초기화 (깜빡임 방지)
          Promise.all([
            queryClient.invalidateQueries({ queryKey: ['messages', sessionId] }),
            queryClient.invalidateQueries({ queryKey: ['sessions'] }),
          ]).then(() => {
            setIsStreaming(false)
            setStreamingText('')
            setToolCalls([])
          })
          break
        case 'error':
          setIsStreaming(false)
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
  }, [])

  const stopStream = useCallback(() => {
    setIsStreaming(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { streamingText, isStreaming, toolCalls, error, startStream, stopStream, clearError }
}
