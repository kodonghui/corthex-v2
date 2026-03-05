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
  const [apiKeyForm, setApiKeyForm] = useState({ provider: 'kis' as string, label: '', key: '' })

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
    mutationFn: (body: { companyId: string; userId: string; provider: string; label?: string; key: string }) =>
      api.post('/admin/api-keys', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      setShowAddApiKey(false)
      setApiKeyForm({ provider: 'kis', label: '', key: '' })
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

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">CLI 토큰 / API 키 관리</h1>
        <p className="text-sm text-zinc-500 mt-1">직원별 Claude OAuth 토큰 및 외부 API 키를 관리합니다</p>
      </div>

      {/* 가이드 */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
          Claude OAuth 토큰 찾는 법
        </h3>
        <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-decimal list-inside">
          <li>Claude Desktop 앱에서 로그인 상태 확인</li>
          <li>파일 탐색기에서 <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">~/.claude/.credentials.json</code> 열기</li>
          <li><code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">claudeAiOauth.accessToken</code> 값 복사 (sk-ant-oat01-... 형식)</li>
          <li>아래에서 해당 직원 선택 후 토큰 등록</li>
        </ol>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
          * API 키(sk-ant-api...)가 아닌 OAuth 토큰(sk-ant-oat01-...)을 등록해야 합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 유저 목록 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">직원 선택</h2>
          <div className="space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id)
                  setShowAddToken(false)
                  setShowAddApiKey(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedUserId === u.id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{u.name}</span>
                  <span className="text-xs text-zinc-500">@{u.username}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 토큰/키 관리 */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedUserId ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
              좌측에서 직원을 선택하세요
            </div>
          ) : (
            <>
              {/* CLI OAuth 토큰 */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    CLI OAuth 토큰 — {selectedUser?.name}
                  </h2>
                  <button
                    onClick={() => setShowAddToken(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    + 토큰 등록
                  </button>
                </div>

                {showAddToken && (
                  <form
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
                    className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3"
                  >
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">라벨</label>
                      <input
                        value={tokenForm.label}
                        onChange={(e) => setTokenForm({ ...tokenForm, label: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="예: 대표님 노트북"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                        OAuth 토큰 (sk-ant-oat01-...)
                      </label>
                      <textarea
                        value={tokenForm.token}
                        onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
                        placeholder="sk-ant-oat01-..."
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddToken(false)}
                        className="px-3 py-1.5 text-sm text-zinc-600"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={addTokenMutation.isPending}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {addTokenMutation.isPending ? '등록 중...' : '등록'}
                      </button>
                    </div>
                    {addTokenMutation.isError && (
                      <p className="text-sm text-red-600">{(addTokenMutation.error as Error).message}</p>
                    )}
                  </form>
                )}

                {creds.length === 0 ? (
                  <p className="text-sm text-zinc-500">등록된 CLI 토큰이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {creds.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.label}</p>
                          <p className="text-xs text-zinc-500">
                            등록: {new Date(c.createdAt).toLocaleDateString('ko')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              c.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {c.isActive ? '활성' : '비활성'}
                          </span>
                          {c.isActive && (
                            <button
                              onClick={() => {
                                if (confirm('이 토큰을 비활성화하시겠습니까?')) {
                                  deactivateTokenMutation.mutate(c.id)
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
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
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">외부 API 키</h2>
                  <button
                    onClick={() => setShowAddApiKey(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    + API 키 등록
                  </button>
                </div>

                {showAddApiKey && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!selectedCompanyId || !selectedUserId) return
                      addApiKeyMutation.mutate({
                        companyId: selectedCompanyId,
                        userId: selectedUserId,
                        provider: apiKeyForm.provider,
                        ...(apiKeyForm.label ? { label: apiKeyForm.label } : {}),
                        key: apiKeyForm.key,
                      })
                    }}
                    className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">제공자</label>
                        <select
                          value={apiKeyForm.provider}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, provider: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="kis">KIS (한국투자증권)</option>
                          <option value="notion">Notion</option>
                          <option value="email">Email</option>
                          <option value="telegram">Telegram</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">라벨</label>
                        <input
                          value={apiKeyForm.label}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, label: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                          placeholder="선택사항"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">API 키</label>
                      <input
                        type="password"
                        value={apiKeyForm.key}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, key: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddApiKey(false)}
                        className="px-3 py-1.5 text-sm text-zinc-600"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={addApiKeyMutation.isPending}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {addApiKeyMutation.isPending ? '등록 중...' : '등록'}
                      </button>
                    </div>
                    {addApiKeyMutation.isError && (
                      <p className="text-sm text-red-600">{(addApiKeyMutation.error as Error).message}</p>
                    )}
                  </form>
                )}

                {apiKeys.length === 0 ? (
                  <p className="text-sm text-zinc-500">등록된 API 키가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((k) => (
                      <div
                        key={k.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase">
                              {k.provider}
                            </span>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {k.label || '(라벨 없음)'}
                            </p>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            등록: {new Date(k.createdAt).toLocaleDateString('ko')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('이 API 키를 삭제하시겠습니까?')) {
                              deleteApiKeyMutation.mutate(k.id)
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
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
