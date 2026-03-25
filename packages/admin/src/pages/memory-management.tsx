/**
 * Admin Memory Management Page — Command Theme (Dark)
 *
 * Story 28.9: Flagged observation review, per-agent memory stats,
 * memory system settings, agent memory reset.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Brain, AlertTriangle, Trash2, ShieldCheck, RotateCcw, Save, Settings } from 'lucide-react'
import { api } from '../lib/api'

type AgentMemoryStats = {
  agentId: string
  totalObservations: number
  reflectedObservations: number
  unreflectedObservations: number
  totalMemories: number
  activeMemories: number
  avgConfidence: number
}

type FlaggedObservation = {
  id: string
  agentId: string
  content: string
  domain: string
  flagged: boolean
  observedAt: string
}

type MemorySettings = {
  reflectedTtlDays: number
  unreflectedTtlDays: number
  minObservationsForReflection: number
  minAvgConfidence: number
  maxDailyCostUsd: number
  memoryDecayDays: number
  enabled: boolean
}

export function MemoryManagementPage() {
  const qc = useQueryClient()
  const [resettingAgent, setResettingAgent] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState<MemorySettings | null>(null)

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-memory-stats'],
    queryFn: () => api.get<{ data: { agents: AgentMemoryStats[] } }>('/admin/memory-management/agents'),
  })

  const { data: flaggedData, isLoading: flaggedLoading } = useQuery({
    queryKey: ['admin-memory-flagged'],
    queryFn: () => api.get<{ data: { observations: FlaggedObservation[] } }>('/admin/memory-management/flagged'),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['admin-memory-settings'],
    queryFn: () => api.get<{ data: MemorySettings }>('/admin/memory-management/settings'),
  })

  const currentSettings = settingsForm ?? settingsData?.data

  const dismissMut = useMutation({
    mutationFn: (obsId: string) => api.post('/admin/memory-management/flagged/' + obsId + '/dismiss', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-memory-flagged'] }),
  })

  const deleteMut = useMutation({
    mutationFn: (obsId: string) => api.post('/admin/memory-management/flagged/' + obsId + '/delete', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-memory-flagged'] }),
  })

  const resetMut = useMutation({
    mutationFn: (agentId: string) => api.delete('/admin/memory-management/agent/' + agentId + '/reset'),
    onSuccess: () => {
      setResettingAgent(null)
      qc.invalidateQueries({ queryKey: ['admin-memory-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-memory-flagged'] })
    },
  })

  const saveMut = useMutation({
    mutationFn: (body: Partial<MemorySettings>) => api.put('/admin/memory-management/settings', body),
    onSuccess: () => {
      setSettingsForm(null)
      qc.invalidateQueries({ queryKey: ['admin-memory-settings'] })
    },
  })

  const agents = statsData?.data?.agents ?? []
  const flagged = flaggedData?.data?.observations ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto w-full" data-testid="memory-management-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-corthex-text-primary">
          Memory Management
        </h1>
        <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-widest mt-1">
          Agent memory system administration
        </p>
      </div>

      {/* Flagged Observations */}
      <div className="bg-corthex-surface border border-corthex-border mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-corthex-border flex items-center gap-3 bg-corthex-elevated">
          <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-corthex-error" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
              Flagged Observations
            </h3>
            <p className="text-xs text-corthex-text-disabled mt-0.5">Review auto-flagged sensitive content</p>
          </div>
          <span className={`ml-auto px-2.5 py-1 text-xs font-bold font-mono uppercase tracking-widest ${
            flagged.length > 0
              ? 'bg-red-500/10 text-corthex-error border border-red-500/20'
              : 'bg-corthex-accent-muted text-corthex-accent border border-corthex-border'
          }`}>
            {flagged.length} FLAGGED
          </span>
        </div>
        <div className="divide-y divide-corthex-border">
          {flaggedLoading ? (
            <div className="px-6 py-8 text-center text-sm animate-pulse text-corthex-text-disabled">Loading...</div>
          ) : flagged.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="w-10 h-10 mx-auto bg-corthex-accent-muted border border-corthex-border flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-corthex-accent" />
              </div>
              <p className="text-sm font-bold text-corthex-accent uppercase tracking-widest">No flagged observations</p>
              <p className="text-xs text-corthex-text-disabled mt-1">All clear</p>
            </div>
          ) : flagged.map(obs => (
            <div key={obs.id} className="px-6 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 bg-corthex-elevated border border-corthex-border text-corthex-text-disabled uppercase tracking-widest">
                    {obs.domain}
                  </span>
                  <span className="text-xs font-mono text-corthex-text-disabled">
                    {new Date(obs.observedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3 text-corthex-text-primary">{obs.content}</p>
                <p className="text-xs mt-1 font-mono text-corthex-text-disabled">
                  Agent: {obs.agentId.slice(0, 8)}...
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => dismissMut.mutate(obs.id)}
                  disabled={dismissMut.isPending}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors bg-corthex-accent-muted text-corthex-accent border border-corthex-border hover:bg-corthex-elevated disabled:opacity-50"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => deleteMut.mutate(obs.id)}
                  disabled={deleteMut.isPending}
                  className="p-1.5 text-xs font-bold transition-colors bg-red-500/10 text-corthex-error border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
                  title="Delete permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Memory Stats */}
      <div className="bg-corthex-surface border border-corthex-border mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-corthex-border flex items-center gap-3 bg-corthex-elevated">
          <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
            <Brain className="w-4 h-4 text-corthex-accent" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
            Agent Memory Stats
          </h3>
        </div>
        {statsLoading ? (
          <div className="px-6 py-8 text-center text-sm animate-pulse text-corthex-text-disabled">Loading...</div>
        ) : agents.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-corthex-text-disabled">No agents with memory data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-corthex-border bg-corthex-elevated">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Agent ID</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Observations</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Reflected</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Unreflected</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Memories</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Active</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Avg Conf</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border">
                {agents.map(a => (
                  <tr key={a.agentId} className="text-sm hover:bg-corthex-elevated/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-corthex-text-primary">{a.agentId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-mono text-corthex-text-primary">{a.totalObservations}</td>
                    <td className="px-4 py-3 font-mono text-corthex-accent">{a.reflectedObservations}</td>
                    <td className="px-4 py-3 font-mono text-corthex-error">{a.unreflectedObservations}</td>
                    <td className="px-4 py-3 font-mono text-corthex-text-primary">{a.totalMemories}</td>
                    <td className="px-4 py-3 font-mono text-corthex-text-primary">{a.activeMemories}</td>
                    <td className="px-4 py-3 font-mono text-corthex-text-primary">{a.avgConfidence}%</td>
                    <td className="px-4 py-3">
                      {resettingAgent === a.agentId ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => resetMut.mutate(a.agentId)}
                            disabled={resetMut.isPending}
                            className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-corthex-error text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setResettingAgent(null)}
                            className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-corthex-elevated border border-corthex-border text-corthex-text-secondary hover:bg-corthex-border transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResettingAgent(a.agentId)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-widest transition-colors bg-red-500/10 text-corthex-error border border-red-500/20 hover:bg-red-500/20"
                          title="Reset all memories"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Memory Settings */}
      <div className="bg-corthex-surface border border-corthex-border overflow-hidden">
        <div className="px-6 py-4 border-b border-corthex-border flex items-center gap-3 bg-corthex-elevated">
          <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
            <Settings className="w-4 h-4 text-corthex-accent" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
            Memory System Settings
          </h3>
        </div>
        {!currentSettings ? (
          <div className="px-6 py-8 text-center text-sm animate-pulse text-corthex-text-disabled">Loading...</div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary w-56">
                Master Switch
              </label>
              <button
                onClick={() => {
                  const next = { ...currentSettings, enabled: !currentSettings.enabled }
                  setSettingsForm(next)
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-colors ${
                  currentSettings.enabled
                    ? 'bg-corthex-accent-muted text-corthex-accent border-corthex-border'
                    : 'bg-red-500/10 text-corthex-error border-red-500/20'
                }`}
              >
                {currentSettings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            {([
              ['reflectedTtlDays', 'Reflected Obs TTL (days)', 1, 365],
              ['unreflectedTtlDays', 'Unreflected Obs TTL (days)', 1, 365],
              ['minObservationsForReflection', 'Min Observations for Reflection', 1, 1000],
              ['memoryDecayDays', 'Memory Decay (days)', 1, 365],
            ] as const).map(([key, label, min, max]) => (
              <div key={key} className="flex items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary w-56">
                  {label}
                </label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={currentSettings[key]}
                  onChange={(e) => setSettingsForm({ ...currentSettings, [key]: Number(e.target.value) })}
                  className="w-28 px-3 py-1.5 text-sm font-mono border border-corthex-border bg-corthex-elevated text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary w-56">
                Min Avg Confidence
              </label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={currentSettings.minAvgConfidence}
                onChange={(e) => setSettingsForm({ ...currentSettings, minAvgConfidence: Number(e.target.value) })}
                className="w-28 px-3 py-1.5 text-sm font-mono border border-corthex-border bg-corthex-elevated text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary w-56">
                Max Daily Cost (USD)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={currentSettings.maxDailyCostUsd}
                onChange={(e) => setSettingsForm({ ...currentSettings, maxDailyCostUsd: Number(e.target.value) })}
                className="w-28 px-3 py-1.5 text-sm font-mono border border-corthex-border bg-corthex-elevated text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
              />
            </div>
            {settingsForm && (
              <div className="pt-2">
                <button
                  onClick={() => saveMut.mutate(settingsForm)}
                  disabled={saveMut.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-corthex-accent text-corthex-text-on-accent text-sm font-bold uppercase tracking-widest transition-all hover:bg-corthex-accent-hover disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveMut.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
