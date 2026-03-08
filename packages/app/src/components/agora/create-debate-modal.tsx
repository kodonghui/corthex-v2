import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal, Button, Input, cn } from '@corthex/ui'
import { api } from '../../lib/api'
import type { Debate, DebateType } from '@corthex/shared'

type Agent = {
  id: string
  name: string
  role: string
  departmentName: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (debate: Debate) => void
}

export function CreateDebateModal({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient()
  const [topic, setTopic] = useState('')
  const [debateType, setDebateType] = useState<DebateType>('debate')
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])

  const { data: agentsData } = useQuery({
    queryKey: ['agents-for-debate'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents?limit=100'),
    enabled: open,
  })
  const agents = agentsData?.data ?? []

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: Debate }>('/workspace/debates', {
        topic,
        debateType,
        participantAgentIds: selectedAgentIds,
      })
      // Auto-start the debate
      const started = await api.post<{ data: Debate }>(`/workspace/debates/${res.data.id}/start`, {})
      return started.data
    },
    onSuccess: (debate) => {
      queryClient.invalidateQueries({ queryKey: ['debates'] })
      onCreated(debate)
      resetForm()
    },
  })

  const resetForm = () => {
    setTopic('')
    setDebateType('debate')
    setSelectedAgentIds([])
  }

  const toggleAgent = (id: string) => {
    setSelectedAgentIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const canSubmit = topic.trim().length > 0 && selectedAgentIds.length >= 2 && !createMutation.isPending

  return (
    <Modal isOpen={open} onClose={onClose} title="새 토론 시작">
      <div className="space-y-4">
        {/* Topic */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">토론 주제</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 신규 사업 진출 전략에 대한 논의"
          />
        </div>

        {/* Debate type */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">토론 유형</label>
          <div className="flex gap-2">
            {([
              { value: 'debate' as DebateType, label: '토론 (2라운드)' },
              { value: 'deep-debate' as DebateType, label: '심층토론 (3라운드)' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDebateType(opt.value)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
                  debateType === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agent selection */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 block">
            참여 에이전트 (최소 2명)
          </label>
          <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800">
            {agents.map((agent) => {
              const selected = selectedAgentIds.includes(agent.id)
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                    selected ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center text-[10px]',
                      selected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-zinc-300 dark:border-zinc-600',
                    )}
                  >
                    {selected && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{agent.name}</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">{agent.role}</span>
                  </div>
                  {agent.departmentName && (
                    <span className="text-[10px] text-zinc-400 shrink-0">{agent.departmentName}</span>
                  )}
                </button>
              )
            })}
            {agents.length === 0 && (
              <p className="text-xs text-zinc-400 p-3 text-center">에이전트를 불러오는 중...</p>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{selectedAgentIds.length}명 선택됨</p>
        </div>

        {/* Error */}
        {createMutation.isError && (
          <p className="text-xs text-red-500">
            {createMutation.error instanceof Error ? createMutation.error.message : '토론 생성에 실패했습니다'}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => createMutation.mutate()} disabled={!canSubmit}>
            {createMutation.isPending ? '생성 중...' : '토론 시작'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
