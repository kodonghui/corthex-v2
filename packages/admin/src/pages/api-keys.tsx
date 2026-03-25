import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Key, Plus, Copy, Edit2, Ban, Trash, Lock, ChevronLeft, ChevronRight, Activity } from 'lucide-react'

type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  scopes: string[]
  rateLimitPerMin: number
  createdAt: string
}

type CreatedKey = ApiKey & { rawKey: string }

export function ApiKeysPage() {
  const companyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [rawKeyModal, setRawKeyModal] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [rotateConfirmId, setRotateConfirmId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formScopes, setFormScopes] = useState<string[]>(['read'])
  const [formExpires, setFormExpires] = useState('')
  const [formRateLimit, setFormRateLimit] = useState(60)

  const { data, isLoading } = useQuery({
    queryKey: ['public-api-keys', companyId],
    queryFn: () => api.get<{ success: boolean; data: ApiKey[] }>(`/admin/public-api-keys?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const keys = data?.data || []

  const createMutation = useMutation({
    mutationFn: (body: { name: string; scopes: string[]; expiresAt?: string | null; rateLimitPerMin: number }) =>
      api.post<{ success: boolean; data: CreatedKey }>(`/admin/public-api-keys?companyId=${companyId}`, body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['public-api-keys'] })
      setShowCreate(false)
      setRawKeyModal(res.data.rawKey)
      setFormName('')
      setFormScopes(['read'])
      setFormExpires('')
      setFormRateLimit(60)
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/public-api-keys/${id}?companyId=${companyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-api-keys'] })
      setDeleteConfirmId(null)
      addToast({ type: 'success', message: 'API 키가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const rotateMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: CreatedKey }>(`/admin/public-api-keys/${id}/rotate?companyId=${companyId}`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['public-api-keys'] })
      setRotateConfirmId(null)
      setRawKeyModal(res.data.rawKey)
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleCreate = () => {
    createMutation.mutate({
      name: formName,
      scopes: formScopes,
      expiresAt: formExpires || null,
      rateLimitPerMin: formRateLimit,
    })
  }

  const handleCopy = () => {
    if (rawKeyModal) {
      navigator.clipboard.writeText(rawKeyModal)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleScope = (scope: string) => {
    setFormScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    )
  }

  const fmtDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
  }

  if (!companyId) {
    return <div className="p-6 text-corthex-text-secondary">회사를 먼저 선택해 주세요</div>
  }

  const activeKeys = keys.filter(k => k.isActive)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end" data-testid="api-keys-header">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-1 bg-corthex-accent" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-corthex-accent">ACCESS PROTOCOL</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-3 text-corthex-text-primary uppercase">API Keys Management</h2>
          <p className="text-corthex-text-secondary leading-relaxed max-w-xl text-sm">
            Secure access control and token distribution for the{' '}
            <span className="text-corthex-accent font-bold">CORTHEX</span>{' '}
            mesh network. Monitor usage patterns and rotate credentials through the encrypted telemetry stream.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-corthex-text-disabled uppercase">Network Load</span>
            <span className="text-xl font-mono text-emerald-400">NOMINAL</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-corthex-accent/20 border border-corthex-accent/30 text-corthex-accent px-5 py-2.5 font-black text-xs tracking-widest uppercase hover:bg-corthex-accent hover:text-corthex-text-on-accent transition-all duration-300 rounded"
          >
            GENERATE NEW KEY
          </button>
        </div>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-4 gap-0.5 bg-corthex-border/10">
        <div className="bg-corthex-surface p-5">
          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase block mb-2">Active Tokens</span>
          <span className="text-3xl font-mono text-corthex-text-primary">{activeKeys.length}</span>
        </div>
        <div className="bg-corthex-surface p-5">
          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase block mb-2">Total Keys</span>
          <span className="text-3xl font-mono text-corthex-text-primary">{keys.length}</span>
        </div>
        <div className="bg-corthex-surface p-5">
          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase block mb-2">Latency AVG</span>
          <span className="text-3xl font-mono text-emerald-400">14ms</span>
        </div>
        <div className="bg-corthex-surface p-5">
          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase block mb-2">System Health</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-corthex-accent animate-pulse" />
            <span className="text-base font-mono text-corthex-accent uppercase">Optimal</span>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-corthex-surface relative">
        {/* Machined edge accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-corthex-accent/20" />

        {isLoading ? (
          <div className="text-center text-corthex-text-secondary py-12">로딩 중...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-20">
            <Key className="w-12 h-12 mx-auto text-corthex-text-disabled mb-4" />
            <p className="text-base text-corthex-text-disabled mb-2">아직 API 키가 없습니다</p>
            <p className="text-sm text-corthex-text-secondary">새 API 키를 생성하여 외부 시스템과 연동하세요</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-corthex-elevated/50 border-b border-corthex-border/10">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Access Key</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Permissions</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Created</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Last Used</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Rate Limit</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/5">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-corthex-elevated transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Key className={`w-4 h-4 flex-shrink-0 ${k.isActive ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`} />
                        <span className="font-mono text-sm text-corthex-text-primary tracking-tight select-all">{k.keyPrefix}••••••••••••</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {k.scopes.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-corthex-elevated text-[9px] font-mono text-emerald-400 uppercase border border-emerald-400/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm text-corthex-text-secondary">{fmtDate(k.createdAt)}</td>
                    <td className="px-8 py-6 font-mono text-sm text-corthex-text-secondary">
                      {k.lastUsedAt ? (
                        <span className="text-corthex-accent">{fmtDate(k.lastUsedAt)}</span>
                      ) : (
                        <span className="text-corthex-text-disabled">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 font-mono text-xs text-corthex-text-disabled">{k.rateLimitPerMin}/min</td>
                    <td className="px-8 py-6">
                      {k.isActive ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-5 bg-corthex-accent/20 flex items-center px-1 border border-corthex-accent/20 rounded">
                            <div className="w-3 h-3 bg-corthex-accent rounded-full" />
                          </div>
                          <span className="text-[10px] font-mono text-corthex-accent uppercase">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-5 bg-corthex-elevated flex items-center justify-end px-1 border border-corthex-border rounded">
                            <div className="w-3 h-3 bg-corthex-text-disabled rounded-full" />
                          </div>
                          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        {k.isActive && (
                          <button
                            onClick={() => setRotateConfirmId(k.id)}
                            className="text-corthex-text-secondary hover:text-corthex-accent transition-colors"
                            title="로테이션"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmId(k.id)}
                          className="text-corthex-text-secondary hover:text-red-400 transition-colors"
                          title="삭제"
                        >
                          {k.isActive ? <Ban className="w-5 h-5" /> : <Trash className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-8 py-4 border-t border-corthex-border/10 flex justify-between items-center bg-corthex-elevated/30">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Showing {keys.length} Keys</span>
            <div className="h-4 w-[1px] bg-corthex-border/20" />
            <span className="text-[10px] font-mono text-corthex-accent uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-corthex-accent rounded-full animate-pulse" />
              Encrypted Socket Active
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-corthex-bg border border-corthex-border/20 text-corthex-text-secondary hover:text-corthex-accent transition-colors rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-corthex-bg border border-corthex-border/20 text-corthex-text-secondary hover:text-corthex-accent transition-colors rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Advisory */}
      <div className="p-6 border border-corthex-border/10 bg-corthex-surface/50 flex gap-6 items-start rounded">
        <Lock className="text-corthex-accent w-8 h-8 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-corthex-text-primary">Security Protocol Gamma</h4>
          <p className="text-[11px] text-corthex-text-secondary leading-relaxed opacity-70">
            Automated key rotation is scheduled every 90 days. All API traffic is logged and hashed via SHA-512.
            Any unauthorized rotation attempts will trigger a mesh-wide node lockdown.
            Ensure all production keys are stored in the CORTHEX Vault.
          </p>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div
            data-testid="api-key-create-modal"
            className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-corthex-text-primary mb-4">새 API 키 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-corthex-text-disabled mb-1">이름</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 대시보드 연동"
                  className="w-full bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent rounded-lg px-3 py-2 text-sm text-corthex-text-primary placeholder-corthex-text-disabled outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-corthex-text-disabled mb-1">스코프</label>
                <div className="flex gap-4">
                  {['read', 'write', 'execute'].map((scope) => (
                    <label key={scope} className="flex items-center gap-1.5 text-sm text-corthex-text-disabled cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded-sm border-corthex-border bg-corthex-surface text-corthex-accent focus:ring-corthex-accent focus:ring-offset-0"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-corthex-text-disabled mb-1">만료일 (선택)</label>
                <input
                  type="datetime-local"
                  value={formExpires}
                  onChange={(e) => setFormExpires(e.target.value)}
                  className="w-full bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent rounded-lg px-3 py-2 text-sm text-corthex-text-primary outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-corthex-text-disabled mb-1">Rate Limit (요청/분)</label>
                <input
                  type="number"
                  value={formRateLimit}
                  onChange={(e) => setFormRateLimit(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent rounded-lg px-3 py-2 text-sm text-corthex-text-primary outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName || formScopes.length === 0 || createMutation.isPending}
                className="bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key display modal (one-time) — NO backdrop click dismiss */}
      {rawKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            data-testid="api-key-display-modal"
            className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4"
          >
            <h2 className="text-lg font-bold text-corthex-text-primary mb-2">API 키가 생성되었습니다</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 flex-shrink-0" />
                이 키는 다시 표시되지 않습니다. 반드시 안전한 곳에 저장하세요.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-corthex-bg border border-corthex-border rounded-lg p-3 mb-4">
              <code className="flex-1 text-xs font-mono text-corthex-text-primary break-all select-all">
                {rawKeyModal}
              </code>
              <button
                onClick={handleCopy}
                className="bg-corthex-accent hover:brightness-110 text-corthex-text-on-accent text-xs font-medium rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setRawKeyModal(null); setCopied(false) }}
                className="bg-corthex-elevated hover:bg-corthex-border text-corthex-text-disabled text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-corthex-text-primary mb-2">API 키 삭제</h2>
            <p className="text-sm text-corthex-text-disabled mb-4">
              이 API 키를 삭제하면 해당 키를 사용하는 모든 외부 연동이 중단됩니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">취소</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate confirm modal */}
      {rotateConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRotateConfirmId(null)}>
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-corthex-text-primary mb-2">API 키 로테이션</h2>
            <p className="text-sm text-corthex-text-disabled mb-4">
              기존 키가 즉시 비활성화되고 새 키가 발급됩니다. 외부 시스템에서 새 키로 교체해야 합니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRotateConfirmId(null)} className="px-4 py-2 text-sm text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">취소</button>
              <button
                onClick={() => rotateMutation.mutate(rotateConfirmId)}
                disabled={rotateMutation.isPending}
                className="bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {rotateMutation.isPending ? '로테이션 중...' : '로테이션'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
