import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@corthex/ui'
import { api } from '../../lib/api'
import { X, Check } from 'lucide-react'
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

  if (!open) return null

  return (
    <div data-testid="create-debate-modal" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-corthex-surface border border-stone-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-accent/10">
          <h2 className="text-base font-bold text-corthex-text-primary">새 토론 시작</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:text-corthex-text-primary hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Topic */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">토론 주제</label>
            <input
              data-testid="debate-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 신규 사업 진출 전략에 대한 논의"
              className="w-full bg-stone-100/50 border border-stone-200 text-corthex-text-primary rounded-lg px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:border-corthex-accent/50 focus:ring-1 focus:ring-corthex-accent/20 transition-all"
            />
          </div>

          {/* Debate type */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">토론 유형</label>
            <div className="flex gap-2">
              {([
                { value: 'debate' as DebateType, label: '토론 (2라운드)', testId: 'debate-type-debate' },
                { value: 'deep-debate' as DebateType, label: '심층토론 (3라운드)', testId: 'debate-type-deep' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  data-testid={opt.testId}
                  onClick={() => setDebateType(opt.value)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-xs font-medium border transition-colors',
                    debateType === opt.value
                      ? 'border-corthex-accent/50 bg-corthex-accent/10 text-corthex-accent'
                      : 'border-stone-200 text-stone-400 hover:border-stone-300',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agent selection */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">
              참여 에이전트 (최소 2명)
            </label>
            <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-corthex-border/50">
              {agents.map((agent) => {
                const selected = selectedAgentIds.includes(agent.id)
                return (
                  <button
                    key={agent.id}
                    data-testid={`debate-agent-${agent.id}`}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selected ? 'bg-corthex-accent/5' : 'hover:bg-stone-100/50',
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center',
                        selected
                          ? 'bg-corthex-accent border-corthex-accent text-corthex-text-primary'
                          : 'border-stone-300',
                      )}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-corthex-text-primary">{agent.name}</span>
                      <span className="text-[10px] text-stone-500 ml-1.5">{agent.role}</span>
                    </div>
                    {agent.departmentName && (
                      <span className="text-[10px] text-stone-400 shrink-0">{agent.departmentName}</span>
                    )}
                  </button>
                )
              })}
              {agents.length === 0 && (
                <p className="text-xs text-stone-500 p-3 text-center">에이전트를 불러오는 중...</p>
              )}
            </div>
            <p className="text-[10px] text-stone-500 mt-1.5">{selectedAgentIds.length}명 선택됨</p>
          </div>

          {/* Error */}
          {createMutation.isError && (
            <p className="text-xs text-red-500">
              {createMutation.error instanceof Error ? createMutation.error.message : '토론 생성에 실패했습니다'}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              data-testid="debate-cancel-btn"
              onClick={onClose}
              className="text-stone-500 hover:text-stone-600 hover:bg-stone-100 text-sm rounded-lg px-4 py-2 transition-colors"
            >
              취소
            </button>
            <button
              data-testid="debate-submit-btn"
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit}
              className={cn(
                'text-sm rounded-lg px-4 py-2 font-medium transition-colors',
                canSubmit
                  ? 'bg-corthex-accent/20 hover:bg-corthex-accent/30 text-corthex-accent border border-corthex-accent/30'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200',
              )}
            >
              {createMutation.isPending ? '생성 중...' : '토론 시작'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
