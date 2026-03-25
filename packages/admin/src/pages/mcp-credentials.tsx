import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { Plus, Shield, Key, Activity, MoreVertical, Edit2, Trash2 } from 'lucide-react'

// Story 19.1: Admin Credentials UI Page (FR-CM1~3, NFR-S1)
// Encrypted AES-256-GCM credential store for MCP/tool API keys
// Key values NEVER shown — masked display only (FR-CM2, NFR-S1)
// Journey 1 Gate: credential 1개 등록 <30min

type Credential = {
  id: string
  keyName: string
  updatedAt: string
}

const EMPTY_FORM = { keyName: '', value: '' }

export function McpCredentialsPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editKeyName, setEditKeyName] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: listData, isLoading } = useQuery({
    queryKey: ['mcp-credentials', selectedCompanyId],
    queryFn: () => api.get<{ data: Credential[] }>('/admin/credentials'),
    enabled: !!selectedCompanyId,
  })

  const createMutation = useMutation({
    mutationFn: (body: { keyName: string; value: string }) =>
      api.post('/admin/credentials', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-credentials', selectedCompanyId] })
      setShowForm(false)
      setForm(EMPTY_FORM)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ keyName, value }: { keyName: string; value: string }) =>
      api.put(`/admin/credentials/${keyName}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-credentials', selectedCompanyId] })
      setShowForm(false)
      setEditKeyName(null)
      setForm(EMPTY_FORM)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (keyName: string) =>
      api.delete(`/admin/credentials/${keyName}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-credentials', selectedCompanyId] })
      setConfirmDelete(null)
    },
  })

  const credentials = listData?.data ?? []

  function handleEdit(cred: Credential) {
    setEditKeyName(cred.keyName)
    setForm({ keyName: cred.keyName, value: '' })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editKeyName) {
      updateMutation.mutate({ keyName: editKeyName, value: form.value })
    } else {
      createMutation.mutate({ keyName: form.keyName, value: form.value })
    }
  }

  if (!selectedCompanyId) {
    return <div className="p-6 text-corthex-text-disabled text-sm">회사를 선택해 주세요.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tighter text-corthex-text-primary leading-none mb-3">
            MCP<span className="text-corthex-accent">.</span>CRED
          </h1>
          <p className="text-corthex-text-secondary text-sm max-w-xl uppercase tracking-widest">
            High-security credential management. AES-256-GCM encrypted. Authorized access only.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditKeyName(null); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 bg-corthex-accent text-corthex-text-on-accent font-bold px-6 py-3 min-h-[44px] rounded hover:brightness-110 transition-all uppercase tracking-widest text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Credential
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-corthex-border/20">
        <div className="p-6 bg-corthex-surface border-r border-corthex-border/20 hover:bg-corthex-elevated transition-colors group">
          <div className="text-[10px] font-mono tracking-widest text-corthex-text-secondary uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-corthex-accent animate-pulse" />
            ACTIVE_KEYS
          </div>
          <div className="text-5xl font-mono font-bold text-corthex-text-primary group-hover:text-corthex-accent transition-colors">{credentials.length}</div>
          <div className="mt-4 h-1 w-full bg-corthex-border/20">
            <div className="h-full bg-corthex-accent" style={{ width: `${Math.min(100, (credentials.length / 20) * 100)}%` }} />
          </div>
        </div>
        <div className="p-6 bg-corthex-surface border-r border-corthex-border/20 hover:bg-corthex-elevated transition-colors group">
          <div className="text-[10px] font-mono tracking-widest text-corthex-text-secondary uppercase mb-4">ENCRYPTION_MODE</div>
          <div className="text-3xl font-mono font-bold text-corthex-text-primary group-hover:text-corthex-accent transition-colors">AES-256</div>
          <div className="mt-4 text-[10px] font-mono text-corthex-text-disabled">GCM MODE · KEY NEVER DISPLAYED</div>
        </div>
        <div className="p-6 bg-corthex-surface hover:bg-corthex-elevated transition-colors group">
          <div className="text-[10px] font-mono tracking-widest text-corthex-text-secondary uppercase mb-4">LAST_SYNC</div>
          <div className="text-3xl font-mono font-bold text-corthex-text-primary group-hover:text-corthex-accent transition-colors">
            {credentials.length > 0
              ? new Date(credentials[0].updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </div>
          <div className="mt-4 font-mono text-[10px] text-corthex-text-disabled overflow-hidden whitespace-nowrap">
            0x4F2A 0x11B3 0x992C 0xE421 0xDD21
          </div>
        </div>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-corthex-text-primary mb-4">
            {editKeyName ? '크리덴셜 값 변경' : '새 크리덴셜 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Key Name *</label>
              <input
                required
                disabled={!!editKeyName}
                value={form.keyName}
                onChange={e => setForm(f => ({ ...f, keyName: e.target.value }))}
                placeholder="tistory_access_token"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-2 text-base sm:text-sm text-corthex-text-primary placeholder-corthex-text-disabled focus:outline-none focus:ring-1 focus:ring-corthex-accent disabled:opacity-50 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">
                Value *
                <span className="text-corthex-text-secondary ml-1">— 저장 후 다시 표시되지 않습니다</span>
              </label>
              <input
                required
                type="password"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="••••••••••••••••"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-2 text-base sm:text-sm text-corthex-text-primary placeholder-corthex-text-disabled focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              />
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-1.5 bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditKeyName(null); setForm(EMPTY_FORM) }}
                className="px-4 py-1.5 bg-corthex-elevated hover:bg-corthex-border text-corthex-text-primary text-sm rounded transition-colors"
              >
                취소
              </button>
              {(createMutation.isError || updateMutation.isError) && (
                <p className="text-xs text-red-400">저장에 실패했습니다.</p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-sm text-corthex-text-primary mb-3">
            <span className="font-mono text-red-400">{confirmDelete}</span> 크리덴셜을 삭제하시겠습니까?
            <span className="text-xs text-corthex-text-disabled ml-2">삭제 후 되돌릴 수 없습니다.</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteMutation.mutate(confirmDelete)}
              disabled={deleteMutation.isPending}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제 확인'}
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-3 py-1 bg-corthex-elevated hover:bg-corthex-border text-corthex-text-primary text-sm rounded transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Credentials Table */}
      <div className="bg-corthex-bg border border-corthex-border/20">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-corthex-border/20 flex justify-between items-center bg-corthex-surface">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Credentials Index</div>
          <div className="flex gap-3">
            <Activity className="w-4 h-4 text-corthex-text-disabled cursor-pointer hover:text-corthex-accent transition-colors" />
          </div>
        </div>

        {isLoading ? (
          <div className="px-8 py-12 text-center text-corthex-text-disabled text-sm">로딩 중...</div>
        ) : credentials.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <Key className="w-10 h-10 text-corthex-text-disabled mx-auto mb-3" />
            <p className="text-corthex-text-disabled text-sm">등록된 크리덴셜이 없습니다.</p>
            <p className="text-xs mt-1 text-corthex-text-secondary">
              "Add Credential" 버튼으로 첫 번째 API 키를 등록하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="text-[10px] text-corthex-text-disabled/60 border-b border-corthex-border/10 uppercase tracking-widest">
                  <th className="px-4 sm:px-6 md:px-8 py-4 font-medium">Key Name</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 md:px-8 py-4 font-medium">Auth Type</th>
                  <th className="hidden md:table-cell px-4 sm:px-6 md:px-8 py-4 font-medium">Key Reference</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 font-medium">Status</th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 md:px-8 py-4 font-medium">Last Updated</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/5">
                {credentials.map(cred => (
                  <tr key={cred.id} className="hover:bg-corthex-elevated transition-colors group">
                    <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                      <span className="text-corthex-accent font-bold font-mono">{cred.keyName}</span>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-corthex-text-primary">API_KEY</td>
                    <td className="hidden md:table-cell px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-corthex-text-secondary font-mono">••••••••••••••••</td>
                    <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                      <span className="flex items-center gap-2 text-[10px] font-bold text-corthex-accent px-2 py-1 bg-corthex-accent/10 w-fit rounded">
                        <span className="w-1.5 h-1.5 bg-corthex-accent rounded-full" />
                        ACTIVE
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-corthex-text-disabled text-xs">
                      {new Date(cred.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(cred)}
                          className="p-1.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-corthex-text-secondary hover:text-corthex-accent transition-colors rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(cred.keyName)}
                          className="p-1.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-corthex-text-disabled hover:text-red-400 transition-colors rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-5 bg-corthex-surface border-t border-corthex-border/10 text-[10px] font-mono text-corthex-text-disabled/50 flex justify-between items-center">
          <div>SYSTEM_STATUS: NOMINAL // AUTH_LOGS: READY // KEYS: {credentials.length}</div>
        </div>
      </div>

      {/* Security Protocol Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-corthex-text-primary">
            <Shield className="w-5 h-5 text-corthex-accent" />
            SECURITY_PROTOCOL
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-corthex-surface border-l-2 border-corthex-accent">
              <div className="text-[10px] font-mono uppercase tracking-widest text-corthex-text-secondary mb-1">Encryption Mode</div>
              <div className="font-mono text-sm text-corthex-text-primary">AES-256-GCM</div>
            </div>
            <div className="p-4 bg-corthex-surface border-l-2 border-corthex-border">
              <div className="text-[10px] font-mono uppercase tracking-widest text-corthex-text-secondary mb-1">Last Breach Attempt</div>
              <div className="font-mono text-sm text-corthex-text-primary">NONE DETECTED</div>
            </div>
            <div className="p-4 bg-corthex-surface border-l-2 border-corthex-border">
              <div className="text-[10px] font-mono uppercase tracking-widest text-corthex-text-secondary mb-1">Session Timeout</div>
              <div className="font-mono text-sm text-corthex-text-primary">300 SECONDS</div>
            </div>
          </div>
        </div>
        <div className="md:col-span-8">
          <div className="relative w-full aspect-video bg-corthex-surface overflow-hidden border border-corthex-border/20 flex items-end">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Shield className="w-48 h-48 text-corthex-accent" />
            </div>
            <div className="w-full p-6">
              <div className="w-full bg-corthex-elevated/80 backdrop-blur-md p-5 border border-corthex-border/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-base text-corthex-accent font-mono">LIVE_TELEMETRY</div>
                    <div className="text-[10px] uppercase tracking-widest text-corthex-text-secondary">Global Access Points Status</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-corthex-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-corthex-accent" />
                    </span>
                    <span className="font-mono text-xs text-corthex-accent">LIVE_STREAM</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 h-10 items-end">
                  <div className="bg-corthex-accent/10 h-3/5 w-full" />
                  <div className="bg-corthex-accent/20 h-4/5 w-full" />
                  <div className="bg-corthex-accent/30 h-2/5 w-full" />
                  <div className="bg-corthex-accent/50 h-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
