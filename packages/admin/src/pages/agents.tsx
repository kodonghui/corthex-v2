import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type Agent = {
  id: string; companyId: string; name: string; role: string
  soul: string | null; status: string; departmentId: string | null
  isSecretary: boolean; isActive: boolean; createdAt: string
}
type Department = { id: string; name: string }

export function AgentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [showCreate, setShowCreate] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [form, setForm] = useState({ name: '', role: '', departmentId: '', soul: '' })

  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const agents = agentData?.data || []
  const depts = deptData?.data || []
  const deptMap = new Map(depts.map((d) => [d.id, d.name]))

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/agents', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setShowCreate(false)
      setForm({ name: '', role: '', departmentId: '', soul: '' })
      addToast({ type: 'success', message: '에이전트가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      api.patch(`/admin/agents/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setEditAgent(null)
      addToast({ type: 'success', message: '에이전트가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/agents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      addToast({ type: 'success', message: '에이전트가 비활성화되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const statusColors: Record<string, string> = {
    online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    working: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    offline: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">AI 에이전트</h1>
          <p className="text-sm text-zinc-500 mt-1">{agents.length}개 에이전트</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 에이전트 추가
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 에이전트</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedCompanyId) return
              createMutation.mutate({
                companyId: selectedCompanyId,
                name: form.name,
                role: form.role,
                ...(form.departmentId ? { departmentId: form.departmentId } : {}),
                ...(form.soul ? { soul: form.soul } : {}),
              })
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="예: 마케팅 매니저"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">역할</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="예: SNS 콘텐츠 제작"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">소속 부서</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">미배정</option>
                  {depts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Soul (성격/페르소나)</label>
              <textarea
                value={form.soul}
                onChange={(e) => setForm({ ...form, soul: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                placeholder="에이전트의 성격과 행동 방식을 정의합니다..."
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

      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              {editAgent?.id === a.id ? (
                <div className="space-y-3">
                  <input
                    value={editAgent.name}
                    onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    value={editAgent.role}
                    onChange={(e) => setEditAgent({ ...editAgent, role: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                    placeholder="역할"
                  />
                  <textarea
                    value={editAgent.soul || ''}
                    onChange={(e) => setEditAgent({ ...editAgent, soul: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 resize-none"
                    placeholder="Soul"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          id: a.id,
                          name: editAgent.name,
                          role: editAgent.role,
                          soul: editAgent.soul,
                        })
                      }
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      저장
                    </button>
                    <button onClick={() => setEditAgent(null)} className="text-xs text-zinc-500">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{a.name}</h3>
                      <p className="text-sm text-zinc-500">{a.role || '역할 미정'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status] || statusColors.offline}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">부서:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {a.departmentId ? deptMap.get(a.departmentId) || '-' : '미배정'}
                      </span>
                    </div>
                    {a.isSecretary && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        비서 에이전트
                      </span>
                    )}
                    {a.soul && (
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{a.soul}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button onClick={() => setEditAgent(a)} className="text-xs text-indigo-600 hover:text-indigo-700">
                      수정
                    </button>
                    {a.isActive && (
                      <button
                        onClick={() => {
                          if (confirm(`"${a.name}" 에이전트를 비활성화하시겠습니까?`)) {
                            deactivateMutation.mutate(a.id)
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        비활성화
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
