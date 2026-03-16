/**
 * Admin Departments — Minimal Warm Theme
 *
 * API Endpoints:
 *   GET    /admin/departments?companyId={id}
 *   POST   /admin/departments
 *   PATCH  /admin/departments/{id}
 *   DELETE /admin/departments/{id}?mode={force|wait_completion}
 *   GET    /admin/departments/{id}/cascade-analysis
 *   GET    /admin/agents?companyId={id}
 */
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

/* Minimal Warm colors */
const olive = '#e57373'
const oliveDark = '#e57373'
const oliveBg = 'rgba(229,115,115,0.1)'
const oliveLight = '#f5f3ec'
const cream = '#fcfbf9'

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
    mutationFn: (body: { name: string; description?: string }) => api.post('/admin/departments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      addToast({ type: 'success', message: '부서가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name: string; description?: string }) => api.patch(`/admin/departments/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setEditId(null)
      addToast({ type: 'success', message: '부서가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: CascadeMode }) => api.delete(`/admin/departments/${id}?mode=${mode}`),
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

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: cream, fontFamily: "'Inter', sans-serif" }} data-testid="departments-page">
      {/* Page Content */}
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Content Header */}
        <div className="flex items-center justify-between mb-8" data-purpose="page-header">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }} data-testid="departments-title">부서 관리</h1>
            <p className="text-slate-500">조직 내 부서를 생성하고 팀원 현황을 관리하세요.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="text-white px-6 py-3 rounded-2xl font-semibold flex items-center shadow-sm transition-all transform hover:-translate-y-0.5"
            style={{ backgroundColor: olive }}
            data-testid="departments-create-btn"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            새 부서 생성
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6" data-testid="departments-create-form">
            <h3 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>새 부서</h3>
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
                  <label className="block text-sm text-slate-500 mb-1">부서명 *</label>
                  <input
                    data-testid="departments-create-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:outline-none"
                    style={{ outlineColor: olive }}
                    placeholder="예: 마케팅부"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">설명</label>
                  <input
                    data-testid="departments-create-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:outline-none"
                    placeholder="부서의 역할과 목적"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  data-testid="departments-create-cancel"
                  type="button"
                  onClick={() => { setShowCreate(false); setForm({ name: '', description: '' }) }}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  취소
                </button>
                <button
                  data-testid="departments-create-submit"
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: olive }}
                >
                  {createMutation.isPending ? '생성 중...' : '생성'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Department Grid */}
        {isLoading ? (
          <div data-testid="departments-loading" className="text-center text-slate-400 py-8">로딩 중...</div>
        ) : depts.length === 0 ? (
          <div data-testid="departments-empty-state" className="flex flex-col items-center justify-center py-16">
            <p className="text-slate-400 mb-4">등록된 부서가 없습니다</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-white px-6 py-3 rounded-2xl font-semibold transition-all"
              style={{ backgroundColor: olive }}
            >
              + 새 부서 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="departments-table" data-purpose="department-grid">
            {depts.map((d) => {
              const count = agentCountByDept(d.id)
              const isEditing = editId === d.id

              if (isEditing) {
                return (
                  <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-300">
                    <div className="space-y-3">
                      <input
                        data-testid={`departments-edit-name-${d.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none"
                        style={{ outlineColor: olive }}
                      />
                      <input
                        data-testid={`departments-edit-desc-${d.id}`}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none"
                        placeholder="설명"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          data-testid={`departments-edit-save-${d.id}`}
                          onClick={() => updateMutation.mutate({ id: d.id, name: editForm.name, description: editForm.description || undefined })}
                          disabled={updateMutation.isPending}
                          className="text-xs font-medium mr-3"
                          style={{ color: olive }}
                        >
                          저장
                        </button>
                        <button
                          data-testid={`departments-edit-cancel-${d.id}`}
                          onClick={() => setEditId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={d.id} data-testid={`departments-row-${d.id}`} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: oliveLight }}>
                      <svg className="w-6 h-6" style={{ color: olive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        data-testid={`departments-edit-${d.id}`}
                        onClick={() => {
                          setEditId(d.id)
                          setEditForm({ name: d.name, description: d.description || '' })
                        }}
                        className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                        style={{ }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = olive)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </button>
                      <button
                        data-testid={`departments-delete-${d.id}`}
                        onClick={() => openCascadeModal(d)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }} data-testid={`departments-name-${d.id}`}>{d.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{d.description || '설명이 없습니다.'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium text-slate-600 flex items-center" data-testid={`departments-agent-count-${d.id}`}>
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      {count} Members
                    </span>
                    <span
                      data-testid={`departments-status-${d.id}`}
                      className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
                      style={d.isActive
                        ? { backgroundColor: '#ecfdf5', color: '#059669' }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }
                      }
                    >
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Empty State / CTA Card */}
            <button
              onClick={() => setShowCreate(true)}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 transition-all group"
              style={{}}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = olive; e.currentTarget.style.color = olive }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8' }}
              data-purpose="create-new-card"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:transition-colors" style={{}}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </div>
              <span className="font-semibold text-lg">새 부서 생성</span>
              <p className="text-xs mt-1">새로운 팀과 권한을 설정하세요</p>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto p-8 border-t border-slate-200 text-sm text-slate-400 text-center">
        <p>&copy; 2024 CORTHEX v2. All rights reserved.</p>
      </footer>

      {/* Cascade Wizard Modal */}
      {cascadeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeCascadeModal}>
          <div
            data-testid="departments-cascade-modal"
            className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
                부서 삭제 - {cascadeTarget.name}
              </h2>
              <button data-testid="departments-cascade-close" onClick={closeCascadeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {cascadeLoading ? (
                <div className="text-center text-slate-400 py-8">영향 분석 중...</div>
              ) : cascadeData ? (
                <>
                  {/* Impact Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-3">
                      &quot;{cascadeData.departmentName}&quot;을(를) 삭제하면 다음이 영향 받습니다:
                    </h3>
                    <div data-testid="departments-impact-summary" className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">소속 에이전트</p>
                        <p className="text-lg font-semibold text-slate-900">{cascadeData.agentCount}명</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">진행 중 작업</p>
                        <p className="text-lg font-semibold text-slate-900">{cascadeData.activeTaskCount}건</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">학습 기록</p>
                        <p className="text-lg font-semibold text-slate-900">{cascadeData.knowledgeCount}건</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">누적 비용</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCost(cascadeData.totalCostUsdMicro)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Breakdown */}
                  {cascadeData.agentBreakdown.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">영향 받는 에이전트</h4>
                      <div data-testid="departments-agent-breakdown" className="space-y-1 max-h-32 overflow-y-auto">
                        {cascadeData.agentBreakdown.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900">{a.name}</span>
                              <span className="text-xs text-slate-400">{tierLabels[a.tier] || a.tier}</span>
                              {a.isSystem && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">
                                  시스템
                                </span>
                              )}
                            </div>
                            {a.activeTaskCount > 0 && (
                              <span className="text-xs" style={{ color: olive }}>작업 {a.activeTaskCount}건</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode Selection */}
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">삭제 방식 선택</h4>
                    <div className="space-y-2">
                      <label
                        data-testid="departments-mode-wait"
                        className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                        style={cascadeMode === 'wait_completion'
                          ? { borderColor: olive, backgroundColor: oliveBg }
                          : { borderColor: '#e2e8f0' }
                        }
                      >
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="wait_completion"
                          checked={cascadeMode === 'wait_completion'}
                          onChange={() => setCascadeMode('wait_completion')}
                          className="mt-0.5"
                          style={{ accentColor: olive }}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">완료 대기 (권장)</p>
                          <p className="text-xs text-slate-400 mt-0.5">진행 중 작업이 끝난 후 삭제합니다. 에이전트는 미배속으로 전환됩니다.</p>
                        </div>
                      </label>
                      <label
                        data-testid="departments-mode-force"
                        className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                        style={cascadeMode === 'force'
                          ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' }
                          : { borderColor: '#e2e8f0' }
                        }
                      >
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="force"
                          checked={cascadeMode === 'force'}
                          onChange={() => setCascadeMode('force')}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">강제 종료</p>
                          <p className="text-xs text-slate-400 mt-0.5">진행 중 작업을 즉시 중단하고 삭제합니다.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preservation notice */}
                  <div data-testid="departments-preservation-notice" className="bg-slate-50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                    <p>* 학습 기록은 아카이브에 보존됩니다</p>
                    <p>* 비용 기록은 영구 보존됩니다 (회계 추적)</p>
                    <p>* 에이전트는 미배속으로 전환되지만 활성 상태가 유지됩니다</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                data-testid="departments-cascade-cancel"
                onClick={closeCascadeModal}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                취소
              </button>
              <button
                data-testid="departments-cascade-confirm"
                onClick={() => {
                  if (cascadeTarget) {
                    deleteMutation.mutate({ id: cascadeTarget.id, mode: cascadeMode })
                  }
                }}
                disabled={deleteMutation.isPending || cascadeLoading || !cascadeData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
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
