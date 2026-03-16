/**
 * CLI Credentials Management — Minimal Warm Theme
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

  if (!selectedCompanyId) return <div className="p-8 text-center" style={{ color: '#81b29a' }}>회사를 선택하세요</div>

  return (
    <div data-testid="credentials-page" className="min-h-screen flex" style={{ backgroundColor: '#fcfbf9', fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#2c2c2c' }}>
      {/* BEGIN: Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto" style={{ backgroundColor: '#fcfbf9' }}>
        {/* BEGIN: Header Section */}
        <header className="bg-white border-b px-8 py-6 flex items-center justify-between sticky top-0 z-10" style={{ borderColor: '#f5f3ec' }}>
          <div>
            <h2 data-testid="credentials-title" className="text-2xl font-bold" style={{ color: '#2c2c2c' }}>CLI 인증 관리</h2>
            <p className="text-sm text-gray-500 mt-1">시스템 배포 및 CLI 도구 사용을 위한 관리자 인증 토큰을 관리합니다.</p>
          </div>
          <button
            data-testid="credentials-cli-add-btn"
            onClick={() => setShowAddToken(true)}
            className="text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium"
            style={{ backgroundColor: '#e57373' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
            인증 토큰 추가
          </button>
        </header>
        {/* END: Header Section */}

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* BEGIN: Info Card */}
          <section data-testid="credentials-guide-banner" className="bg-white rounded-xl border p-6 flex items-start gap-4 shadow-sm" style={{ borderColor: '#f5f3ec' }}>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#f5f3ec' }}>
              <svg className="w-6 h-6" style={{ color: '#e57373' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: '#2c2c2c' }}>보안 정책 안내</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                모든 CLI 인증 토큰은 <span className="font-bold" style={{ color: '#2c2c2c' }}>AES-256</span> 알고리즘을 사용하여 강력하게 암호화되어 저장됩니다.
                토큰은 생성 시 단 한 번만 노출되며, 이후에는 관리자도 값을 확인할 수 없습니다. 유출이 의심되는 경우 즉시 삭제하고 재발급하시기 바랍니다.
              </p>
            </div>
          </section>
          {/* END: Info Card */}

          {/* BEGIN: User Selection */}
          <section data-testid="credentials-user-list" className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#f5f3ec' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: '#f5f3ec' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>직원 선택</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  data-testid={`credentials-user-${u.id}`}
                  onClick={() => {
                    setSelectedUserId(u.id)
                    setShowAddToken(false)
                    setShowAddApiKey(false)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedUserId === u.id
                      ? 'font-semibold text-white'
                      : 'text-gray-600 hover:bg-[#f5f3ec]'
                  }`}
                  style={selectedUserId === u.id ? { backgroundColor: '#e57373' } : {}}
                >
                  {u.name} <span className="text-xs opacity-70">@{u.username}</span>
                </button>
              ))}
            </div>
          </section>

          {!selectedUserId ? (
            <div data-testid="credentials-no-selection" className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#f5f3ec', color: '#81b29a' }}>
              좌측에서 직원을 선택하세요
            </div>
          ) : (
            <>
              {/* BEGIN: CLI Credentials Table Section */}
              <section data-testid="credentials-cli-section" className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#f5f3ec' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#f5f3ec' }}>
                  <h3 data-testid="credentials-cli-title" className="font-semibold" style={{ color: '#2c2c2c' }}>
                    CLI OAuth 토큰 — {selectedUser?.name}
                  </h3>
                  <button
                    data-testid="credentials-cli-add-btn"
                    onClick={() => setShowAddToken(true)}
                    className="text-xs px-3 py-1.5 text-white font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#e57373' }}
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
                    className="mx-6 my-4 p-4 rounded-lg space-y-3"
                    style={{ backgroundColor: '#fcfbf9' }}
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2c2c2c' }}>식별 레이블</label>
                      <input
                        data-testid="credentials-cli-label-input"
                        value={tokenForm.label}
                        onChange={(e) => setTokenForm({ ...tokenForm, label: e.target.value })}
                        className="w-full rounded-lg border text-sm focus:border-[#e57373] focus:ring-[#e57373]"
                        style={{ borderColor: '#f5f3ec' }}
                        placeholder="예: CI/CD Pipeline A"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">토큰의 용도를 구분하기 위한 이름입니다.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2c2c2c' }}>토큰 문자열 (비밀값)</label>
                      <div className="relative">
                        <textarea
                          data-testid="credentials-cli-token-input"
                          value={tokenForm.token}
                          onChange={(e) => setTokenForm({ ...tokenForm, token: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border text-sm font-mono resize-none focus:border-[#e57373] focus:ring-[#e57373]"
                          style={{ borderColor: '#f5f3ec' }}
                          placeholder="sk-ant-oat01-..."
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button
                        data-testid="credentials-cli-cancel"
                        type="button"
                        onClick={() => setShowAddToken(false)}
                        className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#f5f3ec' }}
                      >
                        취소
                      </button>
                      <button
                        data-testid="credentials-cli-submit"
                        type="submit"
                        disabled={addTokenMutation.isPending}
                        className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: '#e57373' }}
                      >
                        {addTokenMutation.isPending ? '등록 중...' : '토큰 생성'}
                      </button>
                    </div>
                    {addTokenMutation.isError && (
                      <p className="text-sm text-red-500">{(addTokenMutation.error as Error).message}</p>
                    )}
                  </form>
                )}

                {creds.length === 0 ? (
                  <div data-testid="credentials-cli-empty" className="px-6 py-8 text-center text-sm" style={{ color: '#81b29a' }}>
                    등록된 CLI 토큰이 없습니다
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider font-semibold border-b" style={{ backgroundColor: '#fcfbf9', color: '#2c2c2c', borderColor: '#f5f3ec' }}>
                          <th className="px-6 py-4">사용자 ID / 이름</th>
                          <th className="px-6 py-4">식별 레이블</th>
                          <th className="px-6 py-4">생성일</th>
                          <th className="px-6 py-4">상태</th>
                          <th className="px-6 py-4 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm" style={{ divideColor: '#f5f3ec' }}>
                        {creds.map((c) => (
                          <tr key={c.id} data-testid={`credentials-cli-token-${c.id}`} className="hover:bg-[#fcfbf9] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium" style={{ color: '#2c2c2c' }}>{selectedUser?.username || c.userId}</div>
                              <div className="text-xs text-gray-500">{selectedUser?.name}</div>
                            </td>
                            <td data-testid={`credentials-cli-token-label-${c.id}`} className="px-6 py-4 text-gray-600">{c.label}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(c.createdAt).toLocaleString('ko')}</td>
                            <td className="px-6 py-4">
                              <span
                                data-testid={`credentials-cli-token-status-${c.id}`}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  c.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {c.isActive ? '활성' : '비활성'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {c.isActive && (
                                <button
                                  data-testid={`credentials-cli-deactivate-${c.id}`}
                                  onClick={() => {
                                    if (confirm('이 토큰을 비활성화하시겠습니까?')) {
                                      deactivateTokenMutation.mutate(c.id)
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 font-medium hover:underline"
                                >
                                  삭제
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="px-6 py-4 bg-white border-t flex items-center justify-between text-xs text-gray-500" style={{ borderColor: '#f5f3ec' }}>
                  <span>총 {creds.length}개의 인증 토큰이 검색되었습니다.</span>
                  <div className="flex gap-2">
                    <button className="p-1 px-2 border rounded hover:bg-[#fcfbf9] disabled:opacity-50" style={{ borderColor: '#f5f3ec' }} disabled>이전</button>
                    <button className="p-1 px-2 border rounded hover:bg-[#fcfbf9]" style={{ borderColor: '#f5f3ec' }}>다음</button>
                  </div>
                </div>
              </section>
              {/* END: CLI Credentials Table Section */}

              {/* BEGIN: API Keys Section */}
              <section data-testid="credentials-api-section" className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#f5f3ec' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#f5f3ec' }}>
                  <h3 data-testid="credentials-api-title" className="font-semibold" style={{ color: '#2c2c2c' }}>외부 API 키</h3>
                  <button
                    data-testid="credentials-api-add-btn"
                    onClick={() => setShowAddApiKey(true)}
                    className="text-xs px-3 py-1.5 text-white font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#e57373' }}
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
                    className="mx-6 my-4 p-4 rounded-lg space-y-3"
                    style={{ backgroundColor: '#fcfbf9' }}
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: '#2c2c2c' }}>제공자</label>
                        <select
                          data-testid="credentials-api-provider"
                          value={apiKeyForm.provider}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, provider: e.target.value })}
                          className="w-full rounded-lg border text-sm focus:border-[#e57373] focus:ring-[#e57373]"
                          style={{ borderColor: '#f5f3ec' }}
                        >
                          <option value="kis">KIS (한국투자증권)</option>
                          <option value="notion">Notion</option>
                          <option value="email">Email</option>
                          <option value="telegram">Telegram</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: '#2c2c2c' }}>범위</label>
                        <select
                          data-testid="credentials-api-scope"
                          value={apiKeyForm.scope}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, scope: e.target.value as 'company' | 'user' })}
                          className="w-full rounded-lg border text-sm focus:border-[#e57373] focus:ring-[#e57373]"
                          style={{ borderColor: '#f5f3ec' }}
                        >
                          <option value="user">개인용</option>
                          <option value="company">회사 공용</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: '#2c2c2c' }}>라벨</label>
                        <input
                          data-testid="credentials-api-label-input"
                          value={apiKeyForm.label}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, label: e.target.value })}
                          className="w-full rounded-lg border text-sm focus:border-[#e57373] focus:ring-[#e57373]"
                          style={{ borderColor: '#f5f3ec' }}
                          placeholder="선택사항"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: '#2c2c2c' }}>API 키</label>
                      <input
                        data-testid="credentials-api-key-input"
                        type="password"
                        value={apiKeyForm.key}
                        onChange={(e) => setApiKeyForm({ ...apiKeyForm, key: e.target.value })}
                        className="w-full rounded-lg border text-sm font-mono focus:border-[#e57373] focus:ring-[#e57373]"
                        style={{ borderColor: '#f5f3ec' }}
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        data-testid="credentials-api-cancel"
                        type="button"
                        onClick={() => setShowAddApiKey(false)}
                        className="px-3 py-1.5 text-sm text-gray-500"
                      >
                        취소
                      </button>
                      <button
                        data-testid="credentials-api-submit"
                        type="submit"
                        disabled={addApiKeyMutation.isPending}
                        className="px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#e57373' }}
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
                  <p data-testid="credentials-api-empty" className="px-6 py-8 text-center text-sm" style={{ color: '#81b29a' }}>등록된 API 키가 없습니다</p>
                ) : (
                  <div className="divide-y" style={{ divideColor: '#f5f3ec' }}>
                    {apiKeys.map((k) => (
                      <div
                        key={k.id}
                        data-testid={`credentials-api-key-${k.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-[#fcfbf9] transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span data-testid={`credentials-api-provider-${k.id}`} className="text-xs px-2 py-0.5 rounded-full uppercase font-medium" style={{ backgroundColor: '#f5f3ec', color: '#e57373' }}>
                              {k.provider}
                            </span>
                            <p data-testid={`credentials-api-key-label-${k.id}`} className="text-sm font-medium" style={{ color: '#2c2c2c' }}>
                              {k.label || '(라벨 없음)'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
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
                          className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              {/* END: API Keys Section */}
            </>
          )}
        </div>
      </main>
      {/* END: Main Content */}
    </div>
  )
}
