import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type Department = { id: string; companyId: string; name: string; description: string | null; isActive: boolean; createdAt: string }
type Agent = { id: string; name: string; role: string; departmentId: string | null; status: string }

type AgentBreakdown = {
  id: string
  name: string
  tier: 'manager' | 'specialist' | 'worker'
  isSystem: boolean
  activeTaskCount: number
  totalCostUsdMicro: number
}

type CascadeAnalysis = {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number
  knowledgeCount: number
  agentBreakdown: AgentBreakdown[]
}

type CascadeMode = 'force' | 'wait_completion'

const tierLabels: Record<string, string> = {
  manager: 'Manager',
  specialist: 'Specialist',
  worker: 'Worker',
}

function formatCost(usdMicro: number): string {
  return `$${(usdMicro / 1_000_000).toFixed(2)}`
}

export function DepartmentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  // Form states
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  // Cascade modal state
  const [cascadeTarget, setCascadeTarget] = useState<Department | null>(null)
  const [cascadeData, setCascadeData] = useState<CascadeAnalysis | null>(null)
  const [cascadeMode, setCascadeMode] = useState<CascadeMode>('wait_completion')
  const [cascadeLoading, setCascadeLoading] = useState(false)

  const { data: deptData, isLoading } = useQuery({
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
  const allAgents = agentData?.data || []
  const agentCountByDept = (deptId: string) => allAgents.filter((a) => a.departmentId === deptId).length

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
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
    mutationFn: ({ id, mode }: { id: string; mode: CascadeMode }) =>
      api.delete(`/admin/departments/${id}?mode=${mode}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      qc.invalidateQueries({ queryKey: ['agents'] })
      closeCascadeModal()
      addToast({ type: 'success', message: '부서가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  async function openCascadeModal(dept: Department) {
    setCascadeTarget(dept)
    setCascadeData(null)
    setCascadeLoading(true)
    setCascadeMode('wait_completion')
    try {
      const result = await api.get<{ data: CascadeAnalysis }>(`/admin/departments/${dept.id}/cascade-analysis`)
      setCascadeData(result.data)
    } catch (err) {
      addToast({ type: 'error', message: (err as Error).message })
      setCascadeTarget(null)
      setCascadeData(null)
    } finally {
      setCascadeLoading(false)
    }
  }

  function closeCascadeModal() {
    setCascadeTarget(null)
    setCascadeData(null)
    setCascadeMode('wait_completion')
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">부서 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{depts.length}개 부서</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 새 부서 만들기
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 부서</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate({
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
              })
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">부서명 *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="예: 마케팅부"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">설명</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="부서의 역할과 목적"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm({ name: '', description: '' }) }}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
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
          </form>
        </div>
      )}

      {/* Department Table */}
      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : depts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 mb-4">등록된 부서가 없습니다</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + 새 부서 만들기
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">부서명</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">설명</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">에이전트</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">상태</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {depts.map((d) => {
                const count = agentCountByDept(d.id)
                const isEditing = editId === d.id

                if (isEditing) {
                  return (
                    <tr key={d.id} className="bg-indigo-50/50 dark:bg-indigo-900/10">
                      <td className="px-5 py-3">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-2 py-1 border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="설명"
                        />
                      </td>
                      <td colSpan={2} />
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => updateMutation.mutate({ id: d.id, name: editForm.name, description: editForm.description || undefined })}
                          disabled={updateMutation.isPending}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mr-3"
                        >
                          저장
                        </button>
                        <button onClick={() => setEditId(null)} className="text-xs text-zinc-500 hover:text-zinc-700">
                          취소
                        </button>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{d.name}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-zinc-500">{d.description || '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[24px] text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        d.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {d.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditId(d.id)
                          setEditForm({ name: d.name, description: d.description || '' })
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => openCascadeModal(d)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cascade Wizard Modal */}
      {cascadeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeCascadeModal}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                부서 삭제 - {cascadeTarget.name}
              </h2>
              <button onClick={closeCascadeModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {cascadeLoading ? (
                <div className="text-center text-zinc-500 py-8">영향 분석 중...</div>
              ) : cascadeData ? (
                <>
                  {/* Impact Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                      &quot;{cascadeData.departmentName}&quot;을(를) 삭제하면 다음이 영향 받습니다:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">소속 에이전트</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{cascadeData.agentCount}명</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">진행 중 작업</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{cascadeData.activeTaskCount}건</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">학습 기록</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{cascadeData.knowledgeCount}건</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">누적 비용</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatCost(cascadeData.totalCostUsdMicro)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Breakdown */}
                  {cascadeData.agentBreakdown.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">영향 받는 에이전트</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {cascadeData.agentBreakdown.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-900 dark:text-zinc-100">{a.name}</span>
                              <span className="text-xs text-zinc-500">{tierLabels[a.tier] || a.tier}</span>
                              {a.isSystem && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                  시스템
                                </span>
                              )}
                            </div>
                            {a.activeTaskCount > 0 && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">작업 {a.activeTaskCount}건</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode Selection */}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">삭제 방식 선택</h4>
                    <div className="space-y-2">
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        cascadeMode === 'wait_completion'
                          ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}>
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="wait_completion"
                          checked={cascadeMode === 'wait_completion'}
                          onChange={() => setCascadeMode('wait_completion')}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">완료 대기 (권장)</p>
                          <p className="text-xs text-zinc-500 mt-0.5">진행 중 작업이 끝난 후 삭제합니다. 에이전트는 미배속으로 전환됩니다.</p>
                        </div>
                      </label>
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        cascadeMode === 'force'
                          ? 'border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}>
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="force"
                          checked={cascadeMode === 'force'}
                          onChange={() => setCascadeMode('force')}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">강제 종료</p>
                          <p className="text-xs text-zinc-500 mt-0.5">진행 중 작업을 즉시 중단하고 삭제합니다.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Confirmation info */}
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
                    <p>* 학습 기록은 아카이브에 보존됩니다</p>
                    <p>* 비용 기록은 영구 보존됩니다 (회계 추적)</p>
                    <p>* 에이전트는 미배속으로 전환됩니다</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={closeCascadeModal}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (cascadeTarget) {
                    deleteMutation.mutate({ id: cascadeTarget.id, mode: cascadeMode })
                  }
                }}
                disabled={deleteMutation.isPending || cascadeLoading || !cascadeData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제 실행'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
