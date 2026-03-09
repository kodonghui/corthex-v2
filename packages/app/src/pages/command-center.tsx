import { useState, useMemo, useCallback } from 'react'
import {
  CommandHistory,
  MessageThread,
  DeliverableViewer,
  CommandInput,
  DelegationPipelineBar,
  PresetManager,
  mockCommands,
  mockAgents,
  mockPresets,
  mockDepartments,
} from '../components/command-center'
import type { Command, Deliverable, CommandPreset, DelegationStep } from '../components/command-center'

export function CommandCenterPage() {
  // State
  const [commands, setCommands] = useState<Command[]>(mockCommands)
  const [presets, setPresets] = useState<CommandPreset[]>(mockPresets)
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(mockCommands[0]?.id || null)
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null)
  const [showPresetManager, setShowPresetManager] = useState(false)
  const [showDeliverablePanel, setShowDeliverablePanel] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  // Derived state
  const selectedCommand = useMemo(
    () => commands.find(cmd => cmd.id === selectedCommandId) || null,
    [commands, selectedCommandId]
  )

  // Get active delegation steps from processing commands
  const activeDelegationSteps = useMemo(() => {
    const processingCommands = commands.filter(c => c.status === 'processing')
    const steps: DelegationStep[] = []
    for (const cmd of processingCommands) {
      const lastMessage = cmd.messages[cmd.messages.length - 1]
      if (lastMessage?.delegationSteps) {
        steps.push(...lastMessage.delegationSteps)
      }
    }
    return steps
  }, [commands])

  // Handlers
  const handleSelectCommand = useCallback((id: string) => {
    setSelectedCommandId(id)
    setSelectedDeliverable(null)
  }, [])

  const handleNewCommand = useCallback(() => {
    const newCommand: Command = {
      id: `cmd-${Date.now()}`,
      title: '새 지시',
      status: 'queued',
      createdAt: new Date().toISOString(),
      messages: [],
    }
    setCommands(prev => [newCommand, ...prev])
    setSelectedCommandId(newCommand.id)
    setSelectedDeliverable(null)
  }, [])

  const handleDeliverableClick = useCallback((deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable)
    setShowDeliverablePanel(true)
  }, [])

  const handleCloseDeliverable = useCallback(() => {
    setSelectedDeliverable(null)
    setShowDeliverablePanel(false)
  }, [])

  const handleSubmitCommand = useCallback((content: string, targetAgentId?: string) => {
    if (!selectedCommandId) return

    // Find target agent
    const targetAgent = targetAgentId 
      ? mockAgents.find(a => a.id === targetAgentId)
      : mockAgents.find(a => a.isSecretary) || mockAgents[0]

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    }

    setCommands(prev => prev.map(cmd => {
      if (cmd.id !== selectedCommandId) return cmd
      return {
        ...cmd,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        status: 'processing' as const,
        assignedAgentId: targetAgent?.id,
        assignedAgentName: targetAgent?.name,
        messages: [...cmd.messages, userMessage],
      }
    }))

    // Simulate streaming response
    setIsStreaming(true)
    setStreamingContent('')

    const mockResponse = `네, 말씀하신 내용을 처리하겠습니다.

## 분석 결과

요청하신 "${content.slice(0, 30)}..." 에 대해 다음과 같이 분석했습니다:

1. **현황 파악**: 관련 데이터를 수집하고 분석 중입니다.
2. **핵심 인사이트**: 주요 패턴과 트렌드를 도출했습니다.
3. **권장 사항**: 구체적인 실행 계획을 수립했습니다.

자세한 내용은 첨부된 보고서를 참고해주세요.`

    let charIndex = 0
    const interval = setInterval(() => {
      if (charIndex < mockResponse.length) {
        setStreamingContent(mockResponse.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        setStreamingContent('')

        // Add assistant message
        const assistantMessage = {
          id: `msg-${Date.now()}-response`,
          role: 'assistant' as const,
          content: mockResponse,
          qualityGrade: 'A' as const,
          cost: 0.08,
          durationMs: 5200,
          deliverables: [
            {
              id: `del-${Date.now()}`,
              type: 'report' as const,
              title: '분석_보고서.pdf',
              summary: '요청 내용에 대한 상세 분석 보고서',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        }

        setCommands(prev => prev.map(cmd => {
          if (cmd.id !== selectedCommandId) return cmd
          return {
            ...cmd,
            status: 'completed' as const,
            qualityGrade: 'A' as const,
            totalCost: (cmd.totalCost || 0) + 0.08,
            completedAt: new Date().toISOString(),
            messages: [...cmd.messages, assistantMessage],
          }
        }))
      }
    }, 20)
  }, [selectedCommandId])

  const handleCreatePreset = useCallback((preset: Omit<CommandPreset, 'id' | 'createdAt'>) => {
    const newPreset: CommandPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setPresets(prev => [...prev, newPreset])
  }, [])

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleSelectPreset = useCallback((preset: CommandPreset) => {
    // Will be handled by CommandInput
    setShowPresetManager(false)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Delegation pipeline bar */}
      <DelegationPipelineBar
        activeSteps={activeDelegationSteps}
        totalAgents={mockAgents.length}
      />

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Command history sidebar */}
        <div className="hidden md:block w-72 shrink-0">
          <CommandHistory
            commands={commands}
            selectedCommandId={selectedCommandId}
            onSelectCommand={handleSelectCommand}
            onNewCommand={handleNewCommand}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200 dark:border-zinc-800">
          {/* Header */}
          <div className="px-4 md:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="font-semibold text-sm">사령관실</h2>
                <p className="text-xs text-zinc-500">
                  {selectedCommand?.assignedAgentName || '에이전트 대기 중'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCommand?.status === 'processing' && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  처리 중
                </span>
              )}
              {selectedCommand?.qualityGrade && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  selectedCommand.qualityGrade === 'S' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' :
                  selectedCommand.qualityGrade === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {selectedCommand.qualityGrade}등급
                </span>
              )}
            </div>
          </div>

          {/* Message thread */}
          <MessageThread
            messages={selectedCommand?.messages || []}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onDeliverableClick={handleDeliverableClick}
            className="flex-1"
          />

          {/* Command input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <CommandInput
              agents={mockAgents}
              presets={presets}
              onSubmit={handleSubmitCommand}
              onOpenPresetManager={() => setShowPresetManager(true)}
              disabled={isStreaming}
            />
          </div>
        </div>

        {/* Deliverable viewer (desktop) */}
        <div className="hidden lg:block w-80 shrink-0">
          <DeliverableViewer
            deliverable={selectedDeliverable}
            onClose={handleCloseDeliverable}
          />
        </div>
      </div>

      {/* Preset manager modal */}
      <PresetManager
        isOpen={showPresetManager}
        onClose={() => setShowPresetManager(false)}
        presets={presets}
        agents={mockAgents}
        onCreatePreset={handleCreatePreset}
        onDeletePreset={handleDeletePreset}
        onSelectPreset={handleSelectPreset}
      />

      {/* Mobile deliverable panel (slide up) */}
      {showDeliverablePanel && selectedDeliverable && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseDeliverable}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-white dark:bg-zinc-900 rounded-t-2xl animate-slide-up">
            <DeliverableViewer
              deliverable={selectedDeliverable}
              onClose={handleCloseDeliverable}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
