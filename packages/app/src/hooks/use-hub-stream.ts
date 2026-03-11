/**
 * Story 6.1 + 6.3: Hub stream hook
 *
 * Wraps use-sse-state-machine with backward-compatible interface.
 * Adds tool call tracking (tool-start/tool-progress/tool-end events)
 * via onRawEvent callback — no duplicate HTTP requests.
 *
 * Hub uses SSE (POST /api/workspace/hub/stream).
 * Regular chat uses WebSocket (use-chat-stream.ts) — separate, not replaced.
 */

import { useState, useCallback, useRef } from 'react'
import {
  useSSEStateMachine,
  type SSEConnectionState,
  type ParsedSSEEvent,
} from './use-sse-state-machine'

export type HubStreamState = 'idle' | 'connecting' | 'accepted' | 'processing' | 'streaming' | 'error' | 'done'

export type HandoffEntry = {
  fromAgent: string
  toAgent: string
  toAgentId: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
  depth?: number
}

export type HubToolCall = {
  toolId: string
  toolName: string
  status: 'running' | 'done'
  input?: string
  result?: string
  progressText?: string
  durationMs?: number
  error?: boolean
}

export function useHubStream() {
  const [toolCalls, setToolCalls] = useState<HubToolCall[]>([])
  const [handoffChainExt, setHandoffChainExt] = useState<HandoffEntry[]>([])

  // Handle extended events (tool-start/tool-end/handoff-complete) via onRawEvent
  const handleRawEvent = useCallback((evt: ParsedSSEEvent) => {
    switch (evt.event) {
      case 'handoff':
        setHandoffChainExt((prev) => [
          ...prev,
          {
            fromAgent: (evt.data.fromAgent as string) || (evt.data.from as string) || '',
            toAgent: (evt.data.toAgent as string) || (evt.data.to as string) || '',
            toAgentId: (evt.data.toAgentId as string) || '',
            status: 'delegating',
            depth: evt.data.depth as number | undefined,
          },
        ])
        break

      case 'handoff-complete':
        setHandoffChainExt((prev) =>
          prev.map((h) =>
            h.toAgentId === evt.data.toAgentId
              ? {
                  ...h,
                  status: ((evt.data.status as string) || 'completed') as 'completed' | 'failed',
                  durationMs: evt.data.durationMs as number | undefined,
                }
              : h,
          ),
        )
        break

      case 'tool-start':
        setToolCalls((prev) => [
          ...prev,
          {
            toolId: (evt.data.toolId as string) || '',
            toolName: (evt.data.toolName as string) || '',
            status: 'running',
            input: evt.data.input as string | undefined,
          },
        ])
        break

      case 'tool-progress':
        setToolCalls((prev) =>
          prev.map((t) =>
            t.toolId === evt.data.toolId
              ? { ...t, progressText: evt.data.content as string }
              : t,
          ),
        )
        break

      case 'tool-end':
        setToolCalls((prev) =>
          prev.map((t) =>
            t.toolId === evt.data.toolId
              ? {
                  ...t,
                  status: 'done' as const,
                  result: evt.data.result as string | undefined,
                  progressText: undefined,
                  durationMs: evt.data.durationMs as number | undefined,
                  error: evt.data.error as boolean | undefined,
                }
              : t,
          ),
        )
        break
    }
  }, [])

  const sse = useSSEStateMachine({ onRawEvent: handleRawEvent })

  const sendMessage = useCallback(async (message: string, currentSessionId?: string | null) => {
    setToolCalls([])
    setHandoffChainExt([])
    return sse.sendMessage(message, currentSessionId)
  }, [sse])

  const stopStream = useCallback(() => {
    sse.stop()
  }, [sse])

  const clearError = useCallback(() => {
    sse.clearError()
  }, [sse])

  const reset = useCallback(() => {
    setToolCalls([])
    setHandoffChainExt([])
    sse.reset()
  }, [sse])

  // Map SSE handoff chain to compat format if no extended data received
  const handoffChain: HandoffEntry[] = handoffChainExt.length > 0
    ? handoffChainExt
    : sse.handoffChain.map((h) => ({
        fromAgent: h.from,
        toAgent: h.to,
        toAgentId: '',
        status: h.status,
        depth: h.depth,
      }))

  // Map state — 'connecting' maps to 'idle' for backward compat
  const streamState: HubStreamState = sse.state === 'connecting' ? 'idle' : sse.state

  return {
    streamState,
    streamingText: sse.streamingText,
    processingAgent: sse.processingAgent,
    handoffChain,
    toolCalls,
    error: sse.errorInfo?.message ?? null,
    errorInfo: sse.errorInfo,
    costUsd: sse.costInfo?.costUsd ?? null,
    tokensUsed: sse.costInfo?.tokensUsed ?? null,
    learnedCount: sse.costInfo?.learnedCount ?? 0,
    sessionId: sse.sessionId,
    retryCount: sse.retryCount,
    sendMessage,
    stopStream,
    clearError,
    reset,
  }
}
