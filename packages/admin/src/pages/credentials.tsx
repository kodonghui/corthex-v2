import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

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

  const inputCls = 'w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none'

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div data-testid="credentials-page" className="space-y-6">
      <div>
        <h1 data-testid="credentials-title" className="text-3xl font-bold tracking-tight text-slate-50">CLI 토큰 / API 키 관리</h1>
        <p className="text-sm text-slate-400 mt-1">직원별 Claude OAuth 토큰 및 외부 API 키를 관리합니다</p>
      </div>

      {/* 가이드 */}
      <div data-testid="credentials-guide-banner" className="bg-amber-900/10 border border-amber-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-300 mb-2">
          Claude OAuth 토큰 찾는 법
        </h3>
        <ol className="text-sm text-amber-400 space-y-1 list-decimal list-inside">
          <li>Claude Desktop 앱에서 로그인 상태 확인</li>
          <li>파일 탐색기에서 <code className="bg-amber-900/30 px-1 rounded">~/.claude/.credentials.json</code> 열기</li>
          <li><code className="bg-amber-900/30 px-1 rounded">claudeAiOauth.accessToken</code> 값 복사 (sk-ant-oat01-... 형식)</li>
          <li>아래에서 해당 직원 선택 후 토큰 등록</li>
        </ol>
        <p className="text-xs text-amber-500 mt-2">
          * API 키(sk-ant-api...)가 아닌 OAuth 토큰(sk-ant-oat01-...)을 등록해야 합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 유저 목록 */}
        <div data-testid="credentials-user-list" className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-50 mb-3">직원 선택</h2>
          <div className="space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                data-testid={`credentials-user-${u.id}`}
                onClick={() => {
                  setSelectedUserId(u.id)
                  setShowAddToken(false)
                  setShowAddApiKey(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedUserId === u.id
                    ? 'bg-blue-950 text-blue-300 font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{u.name}</span>
                  <span className="text-xs text-slate-400">@{u.username}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 토큰/키 관리 */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedUserId ? (
            <div data-testid="credentials-no-selection" className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
              좌측에서 직원을 선택하세요
            </div>
          ) : (
            <>
              {/* CLI OAuth 토큰 */}
              <div data-testid="credentials-cli-section" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 data-testid="credentials-cli-title" className="text-lg font-semibold text-slate-50">
                    CLI OAuth 토큰 — {selectedUser?.name}
                  </h2>
                  <button
                    data-testid="credentials-cli-add-btn"
                    onClick={() => setShowAddToken(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    + 토큰 등록
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
                    className="mb-4 p-4 bg-slate-800/50 rounded-lg space-y-3"
                  >
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">라벨</label>
                      <input
                        data-testid="credentials-cli-label-input"
                        value={tokenForm.label}
                        onChange={(e) => setTokenForm({ ...tokenForm, label: e.target.value })}
                        className={inputCls}
                        placeholder="예: 대표님 노트북"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        OAuth 토큰 (sk-ant-oat01-...)
                      </label>
                      <textarea
                        data-testid="credentials-cli-token-input"
                        value={tokenForm.token}
                        onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })}
                        rows={2}
                        className={`${inputCls} resize-none font-mono`}
                        placeholder="sk-ant-oat01-..."
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        data-testid="credentials-cli-cancel"
                        type="button"
                        onClick={() => setShowAddToken(false)}
                        className="px-3 py-1.5 text-sm text-slate-400"
                      >
                        취소
                      </button>
                      <button
                        data-testid="credentials-cli-submit"
                        type="submit"
                        disabled={addTokenMutation.isPending}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {addTokenMutation.isPending ? '등록 중...' : '등록'}
                      </button>
                    </div>
                    {addTokenMutation.isError && (
                      <p className="text-sm text-red-500">{(addTokenMutation.error as Error).message}</p>
                    )}
                  </form>
                )}

                {creds.length === 0 ? (
                  <p data-testid="credentials-cli-empty" className="text-sm text-slate-400">등록된 CLI 토큰이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {creds.map((c) => (
                      <div
                        key={c.id}
                        data-testid={`credentials-cli-token-${c.id}`}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50"
                      >
                        <div>
                          <p data-testid={`credentials-cli-token-label-${c.id}`} className="text-sm font-medium text-slate-50">{c.label}</p>
                          <p className="text-xs text-slate-400">
                            등록: {new Date(c.createdAt).toLocaleDateString('ko')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            data-testid={`credentials-cli-token-status-${c.id}`}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              c.isActive
                                ? 'bg-emerald-900/30 text-emerald-300'
                                : 'bg-red-900/30 text-red-300'
                            }`}
                          >
                            {c.isActive ? '활성' : '비활성'}
                          </span>
                          {c.isActive && (
                            <button
                              data-testid={`credentials-cli-deactivate-${c.id}`}
                              onClick={() => {
                                if (confirm('이 토큰을 비활성화하시겠습니까?')) {
                                  deactivateTokenMutation.mutate(c.id)
                                }
                              }}
                              className="text-xs text-red-500 hover:text-red-400"
                            >
                              비활성화
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 외부 API 키 */}
              <div data-testid="credentials-api-section" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 data-testid="credentials-api-title" className="text-lg font-semibold text-slate-50">외부 API 키</h2>
                  <button
                    data-testid="credentials-api-add-btn"
                    onClick={() => setShowAddApiKey(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    + API 키 등록
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
                    className="mb-4 p-4 bg-slate-800/50 rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">제공자</label>
                        <select
                          data-testid="credentials-api-provider"
                          value={apiKeyForm.provider}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, provider: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100"
                        >
                          <option value="kis">KIS (한국투자증권)</option>
                          <option value="notion">Notion</option>
                          <option value="email">Email</option>
                          <option value="telegram">Telegram</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">범위</label>
                        <select
                          data-testid="credentials-api-scope"
                          value={apiKeyForm.scope}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, scope: e.target.value as 'company' | 'user' })}
                          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100"
                        >
                          <option value="user">개인용</option>
                          <option value="company">회사 공용</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">라벨</label>
                        <input
                          data-testid="credentials-api-label-input"
                          value={apiKeyForm.label}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, label: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100"
                          placeholder="선택사항"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">API 키</label>
                      <input
                        data-testid="credentials-api-key-input"
                        type="password"
                        value={apiKeyForm.key}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, key: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        data-testid="credentials-api-cancel"
                        type="button"
                        onClick={() => setShowAddApiKey(false)}
                        className="px-3 py-1.5 text-sm text-slate-400"
                      >
                        취소
                      </button>
                      <button
                        data-testid="credentials-api-submit"
                        type="submit"
                        disabled={addApiKeyMutation.isPending}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {addApiKeyMutation.isPending ? '등록 중...' : '등록'}
                      </button>
                    </div>
                    {addApiKeyMutation.isError && (
                      <p className="text-sm text-red-500">{(addApiKeyMutation.error as Error).message}</p>
                    )}
                  </form>
                )}

                {apiKeys.length === 0 ? (
                  <p data-testid="credentials-api-empty" className="text-sm text-slate-400">등록된 API 키가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((k) => (
                      <div
                        key={k.id}
                        data-testid={`credentials-api-key-${k.id}`}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span data-testid={`credentials-api-provider-${k.id}`} className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 uppercase">
                              {k.provider}
                            </span>
                            <p data-testid={`credentials-api-key-label-${k.id}`} className="text-sm font-medium text-slate-50">
                              {k.label || '(라벨 없음)'}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            등록: {new Date(k.createdAt).toLocaleDateString('ko')}
                          </p>
                        </div>
                        <button
                          data-testid={`credentials-api-delete-${k.id}`}
                          onClick={() => {
                            if (confirm('이 API 키를 삭제하시겠습니까?')) {
                              deleteApiKeyMutation.mutate(k.id)
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-400"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
