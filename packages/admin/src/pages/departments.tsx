import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type Department = { id: string; companyId: string; name: string; description: string | null; createdAt: string }
type Agent = { id: string; name: string; role: string; departmentId: string | null; status: string }

export function DepartmentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: agentData } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const depts = deptData?.data || []
  const agents = agentData?.data || []

  const agentsByDept = (deptId: string) => agents.filter((a) => a.departmentId === deptId)

  const createMutation = useMutation({
    mutationFn: (body: { companyId: string; name: string; description?: string }) =>
      api.post('/admin/departments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      addToast({ type: 'success', message: '부서가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name: string; description?: string }) =>
      api.patch(`/admin/departments/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setEditId(null)
      addToast({ type: 'success', message: '부서가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/departments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      addToast({ type: 'success', message: '부서가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">부서 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{depts.length}개 부서</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 부서 추가
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 부서</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedCompanyId) return
              createMutation.mutate({
                companyId: selectedCompanyId,
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
              })
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">부서명</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">설명</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-zinc-600">
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
            {createMutation.isError && (
              <p className="text-sm text-red-600">{(createMutation.error as Error).message}</p>
            )}
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map((d) => {
          const deptAgents = agentsByDept(d.id)
          const isEditing = editId === d.id

          return (
            <div
              key={d.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="설명"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMutation.mutate({ id: d.id, ...editForm })}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      저장
                    </button>
                    <button onClick={() => setEditId(null)} className="text-xs text-zinc-500">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{d.name}</h3>
                      {d.description && (
                        <p className="text-sm text-zinc-500 mt-0.5">{d.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(d.id)
                          setEditForm({ name: d.name, description: d.description || '' })
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${d.name}" 부서를 삭제하시겠습니까?`)) {
                            deleteMutation.mutate(d.id)
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 mb-2">소속 에이전트 ({deptAgents.length})</p>
                    {deptAgents.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          a.status === 'online' ? 'bg-green-500' : 'bg-zinc-400'
                        }`} />
                        <span className="text-zinc-700 dark:text-zinc-300">{a.name}</span>
                        <span className="text-xs text-zinc-500">· {a.role}</span>
                      </div>
                    ))}
                    {deptAgents.length === 0 && (
                      <p className="text-xs text-zinc-400">소속 에이전트 없음</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
