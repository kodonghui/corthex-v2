import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { useCommandStore } from '../stores/command-store'
import type { CommandMessage } from '../stores/command-store'

type CommandResponse = {
  id: string
  type: string
  text: string
  targetAgentId: string | null
  status: string
  result: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  completedAt: string | null
}

type SubmitPayload = {
  text: string
  targetAgentId?: string | null
}

type OrgAgent = {
  id: string
  name: string
  role: string
  tier: string
  departmentId: string
  status: string
}

type OrgDept = {
  id: string
  name: string
  parentId: string | null
}

type OrgChartData = {
  company: { id: string; name: string }
  departments: OrgDept[]
  agents: OrgAgent[]
}

export function useCommandCenter() {
  const queryClient = useQueryClient()
  const {
    messages,
    addMessage,
    setMessages,
    setActiveCommand,
    addDelegationStep,
    clearDelegation,
    updateMessageResult,
    setSelectedReport,
    setViewMode,
  } = useCommandStore()

  // Fetch command history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['commands'],
    queryFn: () => api.get<{ data: CommandResponse[] }>('/workspace/commands?limit=50'),
  })

  // Fetch org chart for @mentions
  const { data: orgData } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => api.get<{ data: OrgChartData }>('/workspace/org-chart'),
  })

  // Convert history to messages on load
  useEffect(() => {
    if (!historyData?.data) return
    const msgs: CommandMessage[] = historyData.data
      .slice()
      .reverse()
      .flatMap((cmd) => {
        const items: CommandMessage[] = [
          {
            id: `user-${cmd.id}`,
            role: 'user',
            text: cmd.text,
            commandId: cmd.id,
            createdAt: cmd.createdAt,
          },
        ]
        if (cmd.status === 'completed' && cmd.result) {
          const meta = cmd.metadata as Record<string, unknown> | null
          const sketchRes = meta?.sketchResult as { mermaid: string; description: string } | undefined
          items.push({
            id: `agent-${cmd.id}`,
            role: 'agent',
            text: cmd.result,
            commandId: cmd.id,
            status: 'completed',
            result: cmd.result,
            sketchResult: sketchRes ? { mermaid: sketchRes.mermaid, description: sketchRes.description } : undefined,
            createdAt: cmd.completedAt || cmd.createdAt,
          })
        } else if (cmd.status === 'failed') {
          items.push({
            id: `err-${cmd.id}`,
            role: 'system',
            text: '명령 처리에 실패했습니다.',
            commandId: cmd.id,
            status: 'failed',
            createdAt: cmd.completedAt || cmd.createdAt,
          })
        }
        return items
      })
    setMessages(msgs)
  }, [historyData, setMessages])

  // Submit command
  const submitMutation = useMutation({
    mutationFn: (payload: SubmitPayload) =>
      api.post<{ data: { id: string; type: string; status: string; createdAt: string } }>(
        '/workspace/commands',
        payload,
      ),
    onSuccess: (res, payload) => {
      const cmd = res.data
      // Clear previous delegation before setting new active command
      clearDelegation()
      // Optimistic: add user message
      addMessage({
        id: `user-${cmd.id}`,
        role: 'user',
        text: payload.text,
        commandId: cmd.id,
        createdAt: cmd.createdAt,
      })
      // Track active command for delegation chain
      setActiveCommand(cmd.id)
    },
  })

  // WebSocket subscriptions
  useEffect(() => {
    const ws = useWsStore.getState()
    ws.subscribe('command')
    ws.subscribe('delegation')
    ws.subscribe('tool')
    ws.subscribe('nexus')
  }, [])

  // Command channel listener
  useEffect(() => {
    const { addListener, removeListener } = useWsStore.getState()

    const handleCommand = (data: unknown) => {
      const evt = data as { commandId?: string; event?: string; result?: string; quality?: { passed: boolean; score?: number }; sketchResult?: { mermaid: string; description: string } }
      if (!evt.commandId) return

      if (evt.event === 'COMPLETED' && evt.result) {
        // For sketch commands, the nexus channel already handles the preview card
        // Only add a standard agent message if there's no sketch result being shown via nexus
        if (evt.sketchResult) {
          // Sketch command completed — update any existing loading card or add result
          const current = useCommandStore.getState().messages
          const hasSketchCard = current.some((m) => m.commandId === evt.commandId && (m.sketchResult || m.sketchLoading))
          if (!hasSketchCard) {
            addMessage({
              id: `agent-${evt.commandId}`,
              role: 'agent',
              text: evt.result,
              commandId: evt.commandId,
              status: 'completed',
              result: evt.result,
              sketchResult: evt.sketchResult,
              createdAt: new Date().toISOString(),
            })
          }
          setActiveCommand(null)
          queryClient.invalidateQueries({ queryKey: ['commands'] })
        } else {
          addMessage({
            id: `agent-${evt.commandId}`,
            role: 'agent',
            text: evt.result,
            commandId: evt.commandId,
            status: 'completed',
            result: evt.result,
            quality: evt.quality,
            createdAt: new Date().toISOString(),
          })
          setActiveCommand(null)
          setSelectedReport(evt.commandId)
          setViewMode('report')
          queryClient.invalidateQueries({ queryKey: ['commands'] })
        }
      } else if (evt.event === 'FAILED') {
        addMessage({
          id: `err-${evt.commandId}`,
          role: 'system',
          text: '명령 처리에 실패했습니다.',
          commandId: evt.commandId,
          status: 'failed',
          createdAt: new Date().toISOString(),
        })
        setActiveCommand(null)
        queryClient.invalidateQueries({ queryKey: ['commands'] })
      }
    }

    const handleDelegation = (data: unknown) => {
      const evt = data as {
        commandId: string
        event: string
        agentId?: string
        agentName?: string
        phase: string
        elapsed: number
        timestamp: string
        data?: Record<string, unknown>
      }
      addDelegationStep({
        id: `${evt.commandId}-${evt.event}-${evt.timestamp}`,
        commandId: evt.commandId,
        event: evt.event,
        agentId: evt.agentId,
        agentName: evt.agentName,
        phase: evt.phase,
        elapsed: evt.elapsed,
        data: evt.data,
        timestamp: evt.timestamp,
      })
    }

    const handleTool = (data: unknown) => {
      const evt = data as {
        commandId: string
        event: string
        toolName?: string
        agentName?: string
        elapsed: number
        timestamp: string
      }
      addDelegationStep({
        id: `tool-${evt.commandId}-${evt.timestamp}`,
        commandId: evt.commandId,
        event: evt.event,
        agentName: evt.agentName,
        phase: `tool:${evt.toolName || 'unknown'}`,
        elapsed: evt.elapsed,
        timestamp: evt.timestamp,
      })
    }

    // Nexus channel listener for sketch commands
    const handleNexus = (data: unknown) => {
      const evt = data as {
        type: string
        commandId?: string
        mermaid?: string
        description?: string
        error?: string
      }

      if (evt.type === 'canvas_ai_start' && evt.commandId) {
        // Show loading card in message list
        addMessage({
          id: `sketch-loading-${evt.commandId}`,
          role: 'agent',
          text: '다이어그램 생성 중...',
          agentName: 'SketchVibe AI',
          commandId: evt.commandId,
          sketchLoading: true,
          createdAt: new Date().toISOString(),
        })
      } else if (evt.type === 'canvas_update' && evt.commandId && evt.mermaid) {
        // Replace loading card with preview card
        const { setMessages: setMsgs } = useCommandStore.getState()
        const current = useCommandStore.getState().messages
        const updatedMsgs = current.map((m) =>
          m.commandId === evt.commandId && m.sketchLoading
            ? {
                ...m,
                text: evt.description || '다이어그램이 생성되었습니다',
                sketchLoading: false,
                sketchResult: {
                  mermaid: evt.mermaid!,
                  description: evt.description || '',
                },
              }
            : m,
        )
        setMsgs(updatedMsgs)
      } else if (evt.type === 'canvas_ai_error' && evt.commandId) {
        // Replace loading card with error card
        const { setMessages: setMsgs } = useCommandStore.getState()
        const current = useCommandStore.getState().messages
        const updatedMsgs = current.map((m) =>
          m.commandId === evt.commandId && m.sketchLoading
            ? {
                ...m,
                role: 'system' as const,
                text: evt.error || '다이어그램 생성에 실패했습니다',
                sketchLoading: false,
              }
            : m,
        )
        setMsgs(updatedMsgs)
      }
    }

    addListener('command', handleCommand)
    addListener('delegation', handleDelegation)
    addListener('tool', handleTool)
    addListener('nexus', handleNexus)

    return () => {
      removeListener('command', handleCommand)
      removeListener('delegation', handleDelegation)
      removeListener('tool', handleTool)
      removeListener('nexus', handleNexus)
    }
  }, [addDelegationStep, addMessage, clearDelegation, queryClient, setActiveCommand, setSelectedReport, setViewMode, updateMessageResult])

  const submitCommand = useCallback(
    (text: string, targetAgentId?: string) => {
      submitMutation.mutate({ text, targetAgentId: targetAgentId || null })
    },
    [submitMutation],
  )

  // Extract managers from org chart for @mention
  const managers = (orgData?.data?.agents || []).filter(
    (a) => a.tier === 'manager' && a.status === 'active',
  )
  const deptMap = new Map(
    (orgData?.data?.departments || []).map((d) => [d.id, d.name]),
  )

  return {
    messages,
    historyLoading,
    submitCommand,
    isSubmitting: submitMutation.isPending,
    managers,
    deptMap,
  }
}
