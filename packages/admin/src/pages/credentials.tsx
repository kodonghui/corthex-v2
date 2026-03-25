/**
 * CLI Credentials Management — Stitch Design
 *
 * API Endpoints:
 *   GET    /api/admin/users?companyId=...
 *   GET    /api/admin/cli-credentials?userId=...
 *   POST   /api/admin/cli-credentials
 *   DELETE /api/admin/cli-credentials/:id
 *   GET    /api/admin/api-keys?userId=...
 *   POST   /api/admin/api-keys
 *   DELETE /api/admin/api-keys/:id
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Plus, Filter, ArrowUpDown, MoreVertical, KeyRound, Database, Cloud, Shield, Activity, Lock, Users } from 'lucide-react'

type User = { id: string; name: string; username: string; role: string }
type CliCredential = { id: string; companyId: string; userId: string; label: string; isActive: boolean; createdAt: string }
type ApiKey = { id: string; companyId: string; userId: string; provider: string; label: string | null; createdAt: string }

export function CredentialsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showAddToken, setShowAddToken] = useState(false)
  const [tokenForm, setTokenForm] = useState({ label: '', token: '' })
  const [showAddApiKey, setShowAddApiKey] = useState(false)
  const [apiKeyForm, setApiKeyForm] = useState({ provider: 'kis' as string, label: '', key: '', scope: 'user' as 'company' | 'user' })

  const { data: userData } = useQuery({
    queryKey: ['users', selectedCompanyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const users = userData?.data || []

  const { data: credData } = useQuery({
    queryKey: ['cli-credentials', selectedUserId],
    queryFn: () =>
      api.get<{ data: CliCredential[] }>(`/admin/cli-credentials?userId=${selectedUserId}`),
    enabled: !!selectedUserId,
  })

  const { data: apiKeyData } = useQuery({
    queryKey: ['api-keys', selectedUserId],
    queryFn: () =>
      api.get<{ data: ApiKey[] }>(`/admin/api-keys?userId=${selectedUserId}`),
    enabled: !!selectedUserId,
  })

  const creds = credData?.data || []
  const apiKeys = apiKeyData?.data || []

  const addTokenMutation = useMutation({
    mutationFn: (body: { companyId: string; userId: string; label: string; token: string }) =>
      api.post('/admin/cli-credentials', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cli-credentials'] })
      setShowAddToken(false)
      setTokenForm({ label: '', token: '' })
      addToast({ type: 'success', message: 'CLI 토큰이 등록되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateTokenMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/cli-credentials/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cli-credentials'] })
      addToast({ type: 'success', message: 'CLI 토큰이 비활성화되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const addApiKeyMutation = useMutation({
    mutationFn: (body: { companyId: string; userId: string; provider: string; label?: string; credentials: Record<string, string>; scope: 'company' | 'user' }) =>
      api.post('/admin/api-keys', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      setShowAddApiKey(false)
      setApiKeyForm({ provider: 'kis', label: '', key: '', scope: 'user' })
      addToast({ type: 'success', message: 'API 키가 등록되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteApiKeyMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/api-keys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      addToast({ type: 'success', message: 'API 키가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const selectedUser = users.find((u) => u.id === selectedUserId)

  if (!selectedCompanyId) return (
    <div className="p-8 text-center font-mono text-corthex-text-disabled">회사를 선택하세요</div>
  )

  return (
    <div data-testid="credentials-page" className="p-4 lg:p-8 bg-corthex-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

        {/* PAGE HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 pl-6"
          style={{ borderLeftColor: 'var(--color-corthex-accent)' }}>
          <div>
            <h1 className="text-2xl lg:text-4xl font-black tracking-tighter uppercase font-mono text-corthex-text-primary">
              Credential Manager
            </h1>
            <p className="font-mono text-xs mt-2 uppercase tracking-widest text-corthex-text-disabled">
              SECURE_STORAGE // ACCESS_CONTROL_v4
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 lg:gap-8">
            <div className="text-right">
              <div className="text-[10px] font-mono text-corthex-text-disabled uppercase">Active_Keys</div>
              <div className="text-2xl font-mono font-bold" style={{ color: 'var(--color-corthex-accent)' }}>
                {creds.filter(c => c.isActive).length + apiKeys.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-corthex-text-disabled uppercase">CLI_Tokens</div>
              <div className="text-2xl font-mono font-bold text-corthex-text-secondary">{creds.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-corthex-text-disabled uppercase">API_Keys</div>
              <div className="text-2xl font-mono font-bold text-corthex-text-primary">{apiKeys.length}</div>
            </div>
          </div>
        </div>

        {/* USER SELECTOR + ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-corthex-surface border border-corthex-border p-4">
          <div className="flex gap-3 flex-wrap" data-testid="credentials-user-list">
            <span className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled flex items-center">
              <Users className="w-3 h-3 mr-2" />
              Select_User:
            </span>
            {users.map((u) => (
              <button
                key={u.id}
                data-testid={`credentials-user-${u.id}`}
                onClick={() => {
                  setSelectedUserId(u.id)
                  setShowAddToken(false)
                  setShowAddApiKey(false)
                }}
                className="px-3 py-1 font-mono text-xs uppercase tracking-widest transition-all min-h-[44px] flex items-center"
                style={selectedUserId === u.id
                  ? { backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }
                  : { color: 'var(--color-corthex-text-secondary)' }}
              >
                {u.name}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              data-testid="credentials-cli-add-btn"
              onClick={() => setShowAddToken(true)}
              className="flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest uppercase font-bold min-h-[44px]"
              style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
            >
              <Plus className="w-3 h-3" />
              Add Credential
            </button>
          </div>
        </div>

        {!selectedUserId ? (
          <div data-testid="credentials-no-selection"
            className="bg-corthex-surface border border-corthex-border p-8 text-center font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">
            Select a user above to manage credentials
          </div>
        ) : (
          <>
            {/* CLI CREDENTIALS TABLE */}
            <section data-testid="credentials-cli-section" className="bg-corthex-bg border border-corthex-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-corthex-surface border-b border-corthex-border">
                <h2 data-testid="credentials-cli-title" className="font-mono text-xs uppercase tracking-widest font-bold text-corthex-text-primary">
                  CLI OAuth Tokens — {selectedUser?.name}
                </h2>
                <button
                  data-testid="credentials-cli-add-btn"
                  onClick={() => setShowAddToken(!showAddToken)}
                  className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-widest uppercase border border-corthex-border hover:bg-corthex-elevated transition-colors text-corthex-text-secondary"
                >
                  <Plus className="w-3 h-3" />
                  Add Token
                </button>
              </div>

              {showAddToken && (
                <form
                  data-testid="credentials-cli-add-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!selectedCompanyId || !selectedUserId) return
                    addTokenMutation.mutate({
                      companyId: selectedCompanyId,
                      userId: selectedUserId,
                      label: tokenForm.label,
                      token: tokenForm.token,
                    })
                  }}
                  className="p-6 border-b border-corthex-border space-y-4 bg-corthex-surface"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">Label</label>
                      <input
                        data-testid="credentials-cli-label-input"
                        value={tokenForm.label}
                        onChange={(e) => setTokenForm({ ...tokenForm, label: e.target.value })}
                        className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                        placeholder="예: CI/CD Pipeline A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">Token String</label>
                      <input
                        data-testid="credentials-cli-token-input"
                        value={tokenForm.token}
                        onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })}
                        type="password"
                        className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                        placeholder="sk-ant-oat01-..."
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      data-testid="credentials-cli-cancel"
                      type="button"
                      onClick={() => setShowAddToken(false)}
                      className="px-6 py-2 font-mono text-xs uppercase tracking-widest border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="credentials-cli-submit"
                      type="submit"
                      disabled={addTokenMutation.isPending}
                      className="px-6 py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50 min-h-[44px]"
                      style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
                    >
                      {addTokenMutation.isPending ? 'Saving...' : 'Create Token'}
                    </button>
                  </div>
                  {addTokenMutation.isError && (
                    <p className="text-xs font-mono" style={{ color: 'var(--color-corthex-error)' }}>{(addTokenMutation.error as Error).message}</p>
                  )}
                </form>
              )}

              {creds.length === 0 ? (
                <div data-testid="credentials-cli-empty"
                  className="px-6 py-8 text-center font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">
                  No CLI tokens registered
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-corthex-surface border-b border-corthex-border">
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Provider</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Label</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">User</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Created_At</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled text-center">Status</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-corthex-border">
                        {creds.map((c) => (
                          <tr key={c.id} data-testid={`credentials-cli-token-${c.id}`}
                            className="hover:bg-corthex-surface transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center">
                                  <KeyRound className="w-4 h-4 text-corthex-text-secondary" />
                                </div>
                                <span className="font-mono font-bold uppercase text-sm text-corthex-text-primary">CLI_OAUTH</span>
                              </div>
                            </td>
                            <td data-testid={`credentials-cli-token-label-${c.id}`}
                              className="p-4 font-mono text-xs text-corthex-text-secondary tracking-widest">
                              {c.label}
                            </td>
                            <td className="p-4">
                              <div className="font-mono text-xs text-corthex-text-primary">{selectedUser?.username || c.userId}</div>
                              <div className="font-mono text-[10px] text-corthex-text-disabled">{selectedUser?.name}</div>
                            </td>
                            <td className="p-4 font-mono text-[10px] text-corthex-text-disabled">
                              {new Date(c.createdAt).toLocaleDateString('ko')} // {new Date(c.createdAt).toLocaleTimeString('ko')}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <div
                                  data-testid={`credentials-cli-token-status-${c.id}`}
                                  className="flex items-center gap-2"
                                >
                                  <div className={`w-1.5 h-1.5 ${c.isActive ? 'bg-corthex-success' : 'bg-corthex-text-disabled'}`} />
                                  <span className="font-mono text-[10px] uppercase tracking-widest"
                                    style={{ color: c.isActive ? 'var(--color-corthex-success)' : undefined }}>
                                    {c.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {c.isActive && (
                                <button
                                  data-testid={`credentials-cli-deactivate-${c.id}`}
                                  onClick={() => {
                                    if (confirm('이 토큰을 비활성화하시겠습니까?')) {
                                      deactivateTokenMutation.mutate(c.id)
                                    }
                                  }}
                                  className="font-mono text-xs uppercase tracking-widest hover:underline"
                                  style={{ color: 'var(--color-corthex-error)' }}
                                >
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="lg:hidden divide-y divide-corthex-border">
                    {creds.map((c) => (
                      <div key={c.id} data-testid={`credentials-cli-token-${c.id}`} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center">
                              <KeyRound className="w-4 h-4 text-corthex-text-secondary" />
                            </div>
                            <span className="font-mono font-bold uppercase text-sm text-corthex-text-primary">CLI_OAUTH</span>
                          </div>
                          <div data-testid={`credentials-cli-token-status-${c.id}`} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 ${c.isActive ? 'bg-corthex-success' : 'bg-corthex-text-disabled'}`} />
                            <span className="font-mono text-[10px] uppercase tracking-widest"
                              style={{ color: c.isActive ? 'var(--color-corthex-success)' : undefined }}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div data-testid={`credentials-cli-token-label-${c.id}`} className="font-mono text-xs text-corthex-text-secondary tracking-widest">{c.label}</div>
                          <div className="font-mono text-xs text-corthex-text-primary">{selectedUser?.username || c.userId} <span className="text-corthex-text-disabled">({selectedUser?.name})</span></div>
                          <div className="font-mono text-[10px] text-corthex-text-disabled">{new Date(c.createdAt).toLocaleDateString('ko')}</div>
                        </div>
                        {c.isActive && (
                          <button
                            data-testid={`credentials-cli-deactivate-${c.id}`}
                            onClick={() => { if (confirm('이 토큰을 비활성화하시겠습니까?')) deactivateTokenMutation.mutate(c.id) }}
                            className="font-mono text-xs uppercase tracking-widest hover:underline min-h-[44px]"
                            style={{ color: 'var(--color-corthex-error)' }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="px-6 py-4 bg-corthex-surface border-t border-corthex-border flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-corthex-text-disabled">
                  SHOWING {creds.length} CLI TOKENS
                </span>
                <div className="flex gap-2">
                  <button className="bg-corthex-elevated w-8 h-8 flex items-center justify-center text-corthex-text-disabled hover:bg-corthex-border transition-all" disabled>
                    <span className="font-mono text-xs">{'<'}</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-[10px] font-mono"
                    style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}>01</button>
                </div>
              </div>
            </section>

            {/* API KEYS TABLE */}
            <section data-testid="credentials-api-section" className="bg-corthex-bg border border-corthex-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-corthex-surface border-b border-corthex-border">
                <h2 data-testid="credentials-api-title" className="font-mono text-xs uppercase tracking-widest font-bold text-corthex-text-primary">
                  External API Keys
                </h2>
                <button
                  data-testid="credentials-api-add-btn"
                  onClick={() => setShowAddApiKey(!showAddApiKey)}
                  className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-widest uppercase border border-corthex-border hover:bg-corthex-elevated transition-colors text-corthex-text-secondary"
                >
                  <Plus className="w-3 h-3" />
                  Add API Key
                </button>
              </div>

              {showAddApiKey && (
                <form
                  data-testid="credentials-api-add-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!selectedCompanyId || !selectedUserId) return
                    addApiKeyMutation.mutate({
                      companyId: selectedCompanyId,
                      userId: selectedUserId,
                      provider: apiKeyForm.provider,
                      ...(apiKeyForm.label ? { label: apiKeyForm.label } : {}),
                      credentials: { key: apiKeyForm.key },
                      scope: apiKeyForm.scope,
                    })
                  }}
                  className="p-6 border-b border-corthex-border space-y-4 bg-corthex-surface"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">Provider</label>
                      <select
                        data-testid="credentials-api-provider"
                        value={apiKeyForm.provider}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, provider: e.target.value })}
                        className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                      >
                        <option value="kis">KIS (한국투자증권)</option>
                        <option value="notion">Notion</option>
                        <option value="email">Email</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">Scope</label>
                      <select
                        data-testid="credentials-api-scope"
                        value={apiKeyForm.scope}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, scope: e.target.value as 'company' | 'user' })}
                        className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                      >
                        <option value="user">개인용</option>
                        <option value="company">회사 공용</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">Label</label>
                      <input
                        data-testid="credentials-api-label-input"
                        value={apiKeyForm.label}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, label: e.target.value })}
                        className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-2">API Key</label>
                    <input
                      data-testid="credentials-api-key-input"
                      type="password"
                      value={apiKeyForm.key}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, key: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-sm font-mono px-3 py-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      data-testid="credentials-api-cancel"
                      type="button"
                      onClick={() => setShowAddApiKey(false)}
                      className="px-6 py-2 font-mono text-xs uppercase tracking-widest border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      data-testid="credentials-api-submit"
                      type="submit"
                      disabled={addApiKeyMutation.isPending}
                      className="px-6 py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50 min-h-[44px]"
                      style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
                    >
                      {addApiKeyMutation.isPending ? 'Saving...' : 'Register'}
                    </button>
                  </div>
                  {addApiKeyMutation.isError && (
                    <p className="text-xs font-mono" style={{ color: 'var(--color-corthex-error)' }}>{(addApiKeyMutation.error as Error).message}</p>
                  )}
                </form>
              )}

              {apiKeys.length === 0 ? (
                <p data-testid="credentials-api-empty"
                  className="px-6 py-8 text-center font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">
                  No API keys registered
                </p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-corthex-surface border-b border-corthex-border">
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Provider</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Masked_Key</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Label</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Created_At</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-corthex-border">
                        {apiKeys.map((k) => (
                          <tr key={k.id} data-testid={`credentials-api-key-${k.id}`}
                            className="hover:bg-corthex-surface transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-corthex-text-secondary" />
                                </div>
                                <span
                                  data-testid={`credentials-api-provider-${k.id}`}
                                  className="font-mono font-bold uppercase text-sm text-corthex-text-primary"
                                >
                                  {k.provider.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs text-corthex-text-disabled tracking-widest">
                              ••••••••••••••{k.id.slice(-4)}
                            </td>
                            <td data-testid={`credentials-api-key-label-${k.id}`}
                              className="p-4 font-mono text-xs text-corthex-text-secondary">
                              {k.label || '(no label)'}
                            </td>
                            <td className="p-4 font-mono text-[10px] text-corthex-text-disabled">
                              {new Date(k.createdAt).toLocaleDateString('ko')}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                data-testid={`credentials-api-delete-${k.id}`}
                                onClick={() => {
                                  if (confirm('이 API 키를 삭제하시겠습니까?')) {
                                    deleteApiKeyMutation.mutate(k.id)
                                  }
                                }}
                                className="font-mono text-xs uppercase tracking-widest hover:underline"
                                style={{ color: 'var(--color-corthex-error)' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="lg:hidden divide-y divide-corthex-border">
                    {apiKeys.map((k) => (
                      <div key={k.id} data-testid={`credentials-api-key-${k.id}`} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center">
                              <Shield className="w-4 h-4 text-corthex-text-secondary" />
                            </div>
                            <span data-testid={`credentials-api-provider-${k.id}`} className="font-mono font-bold uppercase text-sm text-corthex-text-primary">
                              {k.provider.toUpperCase()}
                            </span>
                          </div>
                          <button
                            data-testid={`credentials-api-delete-${k.id}`}
                            onClick={() => { if (confirm('이 API 키를 삭제하시겠습니까?')) deleteApiKeyMutation.mutate(k.id) }}
                            className="font-mono text-xs uppercase tracking-widest hover:underline min-h-[44px]"
                            style={{ color: 'var(--color-corthex-error)' }}
                          >
                            Delete
                          </button>
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono text-xs text-corthex-text-disabled tracking-widest">••••••••••••••{k.id.slice(-4)}</div>
                          <div data-testid={`credentials-api-key-label-${k.id}`} className="font-mono text-xs text-corthex-text-secondary">{k.label || '(no label)'}</div>
                          <div className="font-mono text-[10px] text-corthex-text-disabled">{new Date(k.createdAt).toLocaleDateString('ko')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* SECONDARY INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-corthex-surface border-l-2 border-corthex-border p-6" style={{ borderLeftColor: 'var(--color-corthex-info)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4" style={{ color: 'var(--color-corthex-info)' }} />
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary">System_Uptime</h3>
                </div>
                <div className="text-3xl font-black font-mono tracking-tighter mb-1 text-corthex-text-primary">99.998%</div>
                <div className="h-1 w-full bg-corthex-bg mt-4">
                  <div className="h-full w-[99.9%]" style={{ backgroundColor: 'var(--color-corthex-info)' }} />
                </div>
              </div>
              <div className="bg-corthex-surface border-l-2 border-corthex-border p-6" style={{ borderLeftColor: 'var(--color-corthex-accent)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4" style={{ color: 'var(--color-corthex-accent)' }} />
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary">Encryption_Status</h3>
                </div>
                <div className="text-2xl font-black font-mono tracking-tighter mb-1 uppercase text-corthex-text-primary">AES_256_GCM</div>
                <div className="text-[10px] font-mono uppercase mt-2" style={{ color: 'var(--color-corthex-accent)' }}>Verified_Secure</div>
              </div>
              <div className="bg-corthex-surface border-l-2 border-corthex-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-corthex-text-disabled" />
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary">Access_Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[9px] uppercase">
                    <span className="text-corthex-text-disabled">CLI_Tokens</span>
                    <span style={{ color: 'var(--color-corthex-accent)' }}>{creds.filter(c => c.isActive).length} Active</span>
                  </div>
                  <div className="flex justify-between font-mono text-[9px] uppercase">
                    <span className="text-corthex-text-disabled">API_Keys</span>
                    <span className="text-corthex-text-secondary">{apiKeys.length} Registered</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
