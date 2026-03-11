import { useState, useCallback, useRef } from 'react'

export type HubStreamState = 'idle' | 'accepted' | 'processing' | 'streaming' | 'error' | 'done'

export type HandoffEntry = {
  fromAgent: string
  toAgent: string
  toAgentId: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
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

type SSEEvent = {
  event: string
  data: Record<string, unknown>
}

function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = []
  const blocks = chunk.split('\n\n').filter(Boolean)

  for (const block of blocks) {
    const lines = block.split('\n')
    let eventType = 'message'
    let dataStr = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        dataStr += line.slice(6)
      }
    }

    if (dataStr) {
      try {
        events.push({ event: eventType, data: JSON.parse(dataStr) })
      } catch {
        // skip malformed JSON
      }
    }
  }
  return events
}

export function useHubStream() {
  const [streamState, setStreamState] = useState<HubStreamState>('idle')
  const [streamingText, setStreamingText] = useState('')
  const [processingAgent, setProcessingAgent] = useState<string | null>(null)
  const [handoffChain, setHandoffChain] = useState<HandoffEntry[]>([])
  const [toolCalls, setToolCalls] = useState<HubToolCall[]>([])
  const [error, setError] = useState<string | null>(null)
  const [costUsd, setCostUsd] = useState<number | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef('')

  const sendMessage = useCallback(async (message: string, currentSessionId?: string | null) => {
    // Abort previous stream if any
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    // Reset state
    setStreamState('accepted')
    setStreamingText('')
    setProcessingAgent(null)
    setHandoffChain([])
    setToolCalls([])
    setError(null)
    setCostUsd(null)
    setTokensUsed(null)
    bufferRef.current = ''

    const token = localStorage.getItem('corthex_token')
    const body: Record<string, string> = { message }
    if (currentSessionId) {
      body.sessionId = currentSessionId
    }

    try {
      const response = await fetch('/api/workspace/hub/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errBody = await response.text()
        setStreamState('error')
        setError(`HTTP ${response.status}: ${errBody}`)
        return
      }

      if (!response.body) {
        setStreamState('error')
        setError('No response body')
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        bufferRef.current += decoder.decode(value, { stream: true })

        // Process complete SSE events (delimited by \n\n)
        const parts = bufferRef.current.split('\n\n')
        // Keep the last incomplete part in the buffer
        bufferRef.current = parts.pop() || ''

        const chunk = parts.join('\n\n') + '\n\n'
        const events = parseSSEChunk(chunk)

        for (const evt of events) {
          switch (evt.event) {
            case 'accepted':
              setStreamState('accepted')
              if (evt.data.sessionId) {
                setSessionId(evt.data.sessionId as string)
              }
              break

            case 'processing':
              setStreamState('processing')
              if (evt.data.agentName) {
                setProcessingAgent(evt.data.agentName as string)
              }
              break

            case 'handoff':
              setHandoffChain((prev) => [
                ...prev,
                {
                  fromAgent: (evt.data.fromAgent as string) || '',
                  toAgent: (evt.data.toAgent as string) || '',
                  toAgentId: (evt.data.toAgentId as string) || '',
                  status: 'delegating',
                },
              ])
              break

            case 'handoff-complete':
              setHandoffChain((prev) =>
                prev.map((h) =>
                  h.toAgentId === evt.data.toAgentId
                    ? { ...h, status: ((evt.data.status as string) || 'completed') as 'completed' | 'failed', durationMs: evt.data.durationMs as number | undefined }
                    : h,
                ),
              )
              break

            case 'message':
              setStreamState('streaming')
              if (evt.data.content) {
                setStreamingText((prev) => prev + (evt.data.content as string))
              }
              break

            case 'token':
              setStreamState('streaming')
              if (evt.data.content) {
                setStreamingText((prev) => prev + (evt.data.content as string))
              }
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

            case 'error':
              setStreamState('error')
              setError((evt.data.message as string) || '응답 중 오류가 발생했습니다')
              break

            case 'done':
              setStreamState('done')
              if (evt.data.costUsd != null) setCostUsd(evt.data.costUsd as number)
              if (evt.data.tokensUsed != null) setTokensUsed(evt.data.tokensUsed as number)
              break
          }
        }
      }

      // If we reach end of stream without done event, mark as done
      if (streamState !== 'error') {
        setStreamState('done')
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setStreamState('error')
      setError((err as Error).message || '스트리밍 연결 오류')
    }
  }, [streamState])

  const stopStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setStreamState('idle')
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setStreamState('idle')
  }, [])

  const reset = useCallback(() => {
    setStreamState('idle')
    setStreamingText('')
    setProcessingAgent(null)
    setHandoffChain([])
    setToolCalls([])
    setError(null)
    setCostUsd(null)
    setTokensUsed(null)
  }, [])

  return {
    streamState,
    streamingText,
    processingAgent,
    handoffChain,
    toolCalls,
    error,
    costUsd,
    tokensUsed,
    sessionId,
    sendMessage,
    stopStream,
    clearError,
    reset,
  }
}
