/**
 * Admin Memory Management Page — Natural Organic Theme
 *
 * Story 28.9: Flagged observation review, per-agent memory stats,
 * memory system settings, agent memory reset.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Brain, AlertTriangle, Trash2, ShieldCheck, RotateCcw, Save, Settings } from 'lucide-react'
import { api } from '../lib/api'
import { olive, oliveBg, cream, sand, warmBrown, terracotta, muted, lightMuted } from '../lib/colors'

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
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      <div className="p-8 max-w-6xl mx-auto w-full" data-testid="memory-management-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
            Memory Management
          </h1>
          <p className="text-sm mt-1" style={{ color: muted }}>Agent memory system administration</p>
        </div>

        {/* Flagged Observations */}
        <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden" style={{ borderColor: sand }}>
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Flagged Observations</h3>
              <p className="text-xs" style={{ color: lightMuted }}>Review auto-flagged sensitive content</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold" style={{
              backgroundColor: flagged.length > 0 ? 'rgba(239,68,68,0.1)' : oliveBg,
              color: flagged.length > 0 ? '#ef4444' : olive,
            }}>
              {flagged.length} flagged
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: `${sand}60` }}>
            {flaggedLoading ? (
              <div className="px-6 py-8 text-center text-sm animate-pulse" style={{ color: lightMuted }}>Loading...</div>
            ) : flagged.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: oliveBg }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: olive }} />
                </div>
                <p className="text-sm font-medium" style={{ color: olive }}>No flagged observations</p>
                <p className="text-xs mt-1" style={{ color: lightMuted }}>All clear</p>
              </div>
            ) : flagged.map(obs => (
              <div key={obs.id} className="px-6 py-4 flex items-start gap-4" style={{ borderColor: `${sand}60` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${sand}80`, color: muted }}>{obs.domain}</span>
                    <span className="text-xs font-mono" style={{ color: lightMuted }}>
                      {new Date(obs.observedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: warmBrown }}>{obs.content}</p>
                  <p className="text-xs mt-1 font-mono" style={{ color: lightMuted }}>Agent: {obs.agentId.slice(0, 8)}...</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => dismissMut.mutate(obs.id)}
                    disabled={dismissMut.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    style={{ backgroundColor: oliveBg, color: olive }}
                    title="Dismiss (unflag)"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => deleteMut.mutate(obs.id)}
                    disabled={deleteMut.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
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
        <div className="bg-white rounded-xl border shadow-sm mb-6 overflow-hidden" style={{ borderColor: sand }}>
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
              <Brain className="w-5 h-5" style={{ color: olive }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Agent Memory Stats</h3>
          </div>
          {statsLoading ? (
            <div className="px-6 py-8 text-center text-sm animate-pulse" style={{ color: lightMuted }}>Loading...</div>
          ) : agents.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: lightMuted }}>No agents with memory data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium" style={{ color: muted }}>
                    <th className="px-6 py-3">Agent ID</th>
                    <th className="px-4 py-3">Observations</th>
                    <th className="px-4 py-3">Reflected</th>
                    <th className="px-4 py-3">Unreflected</th>
                    <th className="px-4 py-3">Memories</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Avg Conf</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: `${sand}60` }}>
                  {agents.map(a => (
                    <tr key={a.agentId} className="text-sm" style={{ color: warmBrown }}>
                      <td className="px-6 py-3 font-mono text-xs">{a.agentId.slice(0, 8)}...</td>
                      <td className="px-4 py-3">{a.totalObservations}</td>
                      <td className="px-4 py-3" style={{ color: olive }}>{a.reflectedObservations}</td>
                      <td className="px-4 py-3" style={{ color: terracotta }}>{a.unreflectedObservations}</td>
                      <td className="px-4 py-3">{a.totalMemories}</td>
                      <td className="px-4 py-3">{a.activeMemories}</td>
                      <td className="px-4 py-3">{a.avgConfidence}%</td>
                      <td className="px-4 py-3">
                        {resettingAgent === a.agentId ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => resetMut.mutate(a.agentId)}
                              disabled={resetMut.isPending}
                              className="px-2 py-1 rounded text-xs font-bold text-white"
                              style={{ backgroundColor: '#ef4444' }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setResettingAgent(null)}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ backgroundColor: sand, color: muted }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResettingAgent(a.agentId)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
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
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }}>
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
              <Settings className="w-5 h-5" style={{ color: olive }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Memory System Settings</h3>
          </div>
          {!currentSettings ? (
            <div className="px-6 py-8 text-center text-sm animate-pulse" style={{ color: lightMuted }}>Loading...</div>
          ) : (
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium w-56" style={{ color: warmBrown }}>Master Switch</label>
                <button
                  onClick={() => {
                    const next = { ...currentSettings, enabled: !currentSettings.enabled }
                    setSettingsForm(next)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: currentSettings.enabled ? oliveBg : 'rgba(239,68,68,0.1)',
                    color: currentSettings.enabled ? olive : '#ef4444',
                  }}
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
                  <label className="text-sm font-medium w-56" style={{ color: warmBrown }}>{label}</label>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={currentSettings[key]}
                    onChange={(e) => setSettingsForm({ ...currentSettings, [key]: Number(e.target.value) })}
                    className="w-28 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                    style={{ borderColor: sand, color: warmBrown }}
                  />
                </div>
              ))}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium w-56" style={{ color: warmBrown }}>Min Avg Confidence</label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={currentSettings.minAvgConfidence}
                  onChange={(e) => setSettingsForm({ ...currentSettings, minAvgConfidence: Number(e.target.value) })}
                  className="w-28 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: sand, color: warmBrown }}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium w-56" style={{ color: warmBrown }}>Max Daily Cost (USD)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={currentSettings.maxDailyCostUsd}
                  onChange={(e) => setSettingsForm({ ...currentSettings, maxDailyCostUsd: Number(e.target.value) })}
                  className="w-28 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: sand, color: warmBrown }}
                />
              </div>
              {settingsForm && (
                <div className="pt-2">
                  <button
                    onClick={() => saveMut.mutate(settingsForm)}
                    disabled={saveMut.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: olive, boxShadow: '0 10px 15px -3px rgba(90,114,71,0.2)' }}
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
    </div>
  )
}
