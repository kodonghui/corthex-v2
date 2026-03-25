import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">MCP / 툴 API 키 관리</h2>
          <p className="text-xs text-corthex-text-disabled mt-0.5">
            에이전트 툴 실행 시 사용하는 외부 API 키를 암호화 저장합니다. 값은 표시되지 않습니다. (FR-CM2)
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditKeyName(null); setForm(EMPTY_FORM) }}
          className="px-3 py-1.5 bg-corthex-accent hover:bg-corthex-accent text-white text-sm font-medium rounded transition-colors"
        >
          + 크리덴셜 추가
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editKeyName ? '크리덴셜 값 변경' : '새 크리덴셜 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Key Name *</label>
              <input
                required
                disabled={!!editKeyName}
                value={form.keyName}
                onChange={e => setForm(f => ({ ...f, keyName: e.target.value }))}
                placeholder="tistory_access_token"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-corthex-accent disabled:opacity-50 font-mono"
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
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-1.5 bg-corthex-accent hover:bg-corthex-accent disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditKeyName(null); setForm(EMPTY_FORM) }}
                className="px-4 py-1.5 bg-corthex-elevated hover:bg-slate-600 text-white text-sm rounded transition-colors"
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
          <p className="text-sm text-white mb-3">
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
              className="px-3 py-1 bg-corthex-elevated hover:bg-slate-600 text-white text-sm rounded transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-corthex-text-disabled text-sm">로딩 중...</div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 text-corthex-text-disabled text-sm">
          <p>등록된 크리덴셜이 없습니다.</p>
          <p className="text-xs mt-1 text-corthex-text-secondary">
            "크리덴셜 추가" 버튼으로 첫 번째 API 키를 등록하여 외부 툴을 활성화하세요.
          </p>
        </div>
      ) : (
        <div className="bg-corthex-surface border border-corthex-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-corthex-text-disabled border-b border-corthex-border bg-corthex-surface/80">
                <th className="px-4 py-3 font-medium">Key Name</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map(cred => (
                <tr key={cred.id} className="border-b border-corthex-border/50 hover:bg-corthex-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white">{cred.keyName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-corthex-text-secondary font-mono">••••••••••••••••</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-corthex-text-disabled">
                      {new Date(cred.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cred)}
                        className="text-xs px-2 py-1 bg-corthex-elevated hover:bg-slate-600 text-white rounded transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cred.keyName)}
                        className="text-xs px-2 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-corthex-border bg-corthex-surface/50">
            <p className="text-xs text-corthex-text-secondary">
              총 {credentials.length}개의 크리덴셜. 값은 AES-256-GCM으로 암호화 저장됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
