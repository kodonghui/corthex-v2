import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

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
    return <div className="p-6 text-slate-500">회사를 먼저 선택해 주세요</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-testid="api-keys-header">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50">공개 API 키 관리</h1>
          <p className="text-sm text-slate-400 mt-1">외부 시스템에서 CORTHEX API를 호출하기 위한 키를 관리합니다</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          + 새 API 키
        </button>
      </div>

      {/* Key list table */}
      {isLoading ? (
        <div className="text-center text-slate-500 py-8">로딩 중...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-slate-600 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <p className="text-base text-slate-400 mb-2">아직 API 키가 없습니다</p>
          <p className="text-sm text-slate-500">새 API 키를 생성하여 외부 시스템과 연동하세요</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">이름</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">키 접두사</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">스코프</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">Rate Limit</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">마지막 사용</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">만료일</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">상태</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-50">{k.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{k.keyPrefix}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {k.scopes.map((s) => (
                          <span key={s} className="inline-flex items-center px-1.5 py-0.5 text-xs rounded font-medium bg-slate-700 text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{k.rateLimitPerMin}/min</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{fmtDate(k.lastUsedAt)}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{fmtDate(k.expiresAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${k.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {k.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {k.isActive && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRotateConfirmId(k.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            로테이션
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(k.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div
            data-testid="api-key-create-modal"
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-50 mb-4">새 API 키 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">이름</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 대시보드 연동"
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">스코프</label>
                <div className="flex gap-4">
                  {['read', 'write', 'execute'].map((scope) => (
                    <label key={scope} className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded-sm border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">만료일 (선택)</label>
                <input
                  type="datetime-local"
                  value={formExpires}
                  onChange={(e) => setFormExpires(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rate Limit (요청/분)</label>
                <input
                  type="number"
                  value={formRateLimit}
                  onChange={(e) => setFormRateLimit(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName || formScopes.length === 0 || createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
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
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4"
          >
            <h2 className="text-lg font-bold text-slate-50 mb-2">API 키가 생성되었습니다</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                이 키는 다시 표시되지 않습니다. 반드시 안전한 곳에 저장하세요.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4">
              <code className="flex-1 text-xs font-mono text-slate-50 break-all select-all">
                {rawKeyModal}
              </code>
              <button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
              >
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setRawKeyModal(null); setCopied(false) }}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-50 mb-2">API 키 삭제</h2>
            <p className="text-sm text-slate-400 mb-4">
              이 API 키를 삭제하면 해당 키를 사용하는 모든 외부 연동이 중단됩니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-50 mb-2">API 키 로테이션</h2>
            <p className="text-sm text-slate-400 mb-4">
              기존 키가 즉시 비활성화되고 새 키가 발급됩니다. 외부 시스템에서 새 키로 교체해야 합니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRotateConfirmId(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>
              <button
                onClick={() => rotateMutation.mutate(rotateConfirmId)}
                disabled={rotateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
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
