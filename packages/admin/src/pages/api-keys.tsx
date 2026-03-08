import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

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
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/public-api-keys/${id}?companyId=${companyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-api-keys'] })
      setDeleteConfirmId(null)
    },
  })

  const rotateMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: CreatedKey }>(`/admin/public-api-keys/${id}/rotate?companyId=${companyId}`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['public-api-keys'] })
      setRotateConfirmId(null)
      setRawKeyModal(res.data.rawKey)
    },
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
    return <div className="p-6 text-zinc-500">회사를 먼저 선택해 주세요</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">공개 API 키 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">외부 시스템에서 CORTHEX API를 호출하기 위한 키를 관리합니다</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 새 API 키
        </button>
      </div>

      {/* 키 목록 테이블 */}
      {isLoading ? (
        <div className="text-zinc-500">로딩 중...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg mb-2">아직 API 키가 없습니다</p>
          <p className="text-sm">새 API 키를 생성하여 외부 시스템과 연동하세요</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">이름</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">키 접두사</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">스코프</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">Rate Limit</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">마지막 사용</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">만료일</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">상태</th>
                <th className="pb-2 font-medium text-zinc-600 dark:text-zinc-400">작업</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">{k.name}</td>
                  <td className="py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{k.keyPrefix}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {k.scopes.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-xs rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{k.rateLimitPerMin}/min</td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{fmtDate(k.lastUsedAt)}</td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{fmtDate(k.expiresAt)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${k.isActive ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                      {k.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="py-3">
                    {k.isActive && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRotateConfirmId(k.id)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          로테이션
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(k.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
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
      )}

      {/* 생성 모달 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">새 API 키 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">이름</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 대시보드 연동"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">스코프</label>
                <div className="flex gap-3">
                  {['read', 'write', 'execute'].map((scope) => (
                    <label key={scope} className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={formScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">만료일 (선택)</label>
                <input
                  type="datetime-local"
                  value={formExpires}
                  onChange={(e) => setFormExpires(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rate Limit (요청/분)</label>
                <input
                  type="number"
                  value={formRateLimit}
                  onChange={(e) => setFormRateLimit(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName || formScopes.length === 0 || createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 키 표시 모달 (1회만) */}
      {rawKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">API 키가 생성되었습니다</h2>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                이 키는 다시 표시되지 않습니다. 반드시 안전한 곳에 저장하세요.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-4">
              <code className="flex-1 text-xs font-mono text-zinc-900 dark:text-zinc-100 break-all select-all">
                {rawKeyModal}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setRawKeyModal(null); setCopied(false) }}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">API 키 삭제</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              이 API 키를 삭제하면 해당 키를 사용하는 모든 외부 연동이 중단됩니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm text-zinc-600">취소</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로테이션 확인 모달 */}
      {rotateConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRotateConfirmId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">API 키 로테이션</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              기존 키가 즉시 비활성화되고 새 키가 발급됩니다. 외부 시스템에서 새 키로 교체해야 합니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRotateConfirmId(null)} className="px-4 py-2 text-sm text-zinc-600">취소</button>
              <button
                onClick={() => rotateMutation.mutate(rotateConfirmId)}
                disabled={rotateMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
