import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

// ============================================================
// Types
// ============================================================
type TemplateAgent = {
  name: string
  nameEn?: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  soul: string
  allowedTools: string[]
}

type TemplateDepartment = {
  name: string
  description?: string
  agents: TemplateAgent[]
}

type OrgTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  templateData: { departments: TemplateDepartment[] }
  isBuiltin: boolean
  isActive: boolean
  isPublished: boolean
  publishedAt: string | null
  downloadCount: number
  tags: string[] | null
  createdAt: string
}

type ApplyResult = {
  templateId: string
  templateName: string
  departmentsCreated: number
  departmentsSkipped: number
  agentsCreated: number
  agentsSkipped: number
  details: Array<{
    departmentName: string
    action: 'created' | 'skipped'
    departmentId: string
    agentsCreated: string[]
    agentsSkipped: string[]
  }>
}

// ============================================================
// Constants
// ============================================================
const TIER_LABELS: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-corthex-accent-deep text-corthex-accent-hover' },
  specialist: { label: 'Specialist', color: 'bg-cyan-900 text-cyan-300' },
  worker: { label: 'Worker', color: 'bg-slate-700 text-slate-400' },
}

const modalInput = 'bg-slate-800 border border-slate-600 focus:border-corthex-accent focus:ring-2 focus:ring-corthex-accent/40 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-50 w-full'

// ============================================================
// Preview Modal
// ============================================================
function PreviewModal({
  template,
  onClose,
  onApply,
  applying,
}: {
  template: OrgTemplate
  onClose: () => void
  onApply: () => void
  applying: boolean
}) {
  const depts = template.templateData?.departments || []
  const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="preview-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{template.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {depts.length}개 부서 · {totalAgents}명 에이전트
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {template.description && (
            <p className="text-sm text-slate-400">{template.description}</p>
          )}

          {depts.map((dept) => (
            <div key={dept.name} className="border border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800">
                <span className="text-sm font-medium text-slate-50">{dept.name}</span>
                {dept.description && (
                  <span className="text-xs text-slate-500 truncate">— {dept.description}</span>
                )}
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 ml-auto flex-shrink-0">
                  {dept.agents.length}명
                </span>
              </div>
              {dept.agents.length > 0 && (
                <div className="divide-y divide-slate-700">
                  {dept.agents.map((agent) => {
                    const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                    return (
                      <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-sm text-slate-50">{agent.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                        <span className="text-xs text-slate-500 ml-auto">{agent.modelName}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            닫기
          </button>
          <button
            onClick={onApply}
            disabled={applying}
            className="px-4 py-2 bg-corthex-accent hover:bg-corthex-accent disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {applying ? '적용 중...' : '이 템플릿 적용'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Apply Result Modal
// ============================================================
function ApplyResultModal({ result, onClose }: { result: ApplyResult; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
        data-testid="apply-result-modal"
      >
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-50">적용 완료</h2>
          <p className="text-sm text-slate-400 mt-0.5">{result.templateName}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-900/20 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-300">{result.departmentsCreated}</p>
              <p className="text-xs text-emerald-400">부서 생성</p>
            </div>
            <div className="bg-corthex-accent-deep/20 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-corthex-accent-hover">{result.agentsCreated}</p>
              <p className="text-xs text-corthex-accent-hover">에이전트 생성</p>
            </div>
          </div>

          {/* Skipped info */}
          {(result.departmentsSkipped > 0 || result.agentsSkipped > 0) && (
            <div className="bg-slate-800 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-500">
                이미 존재하는 항목: 부서 {result.departmentsSkipped}개, 에이전트 {result.agentsSkipped}명 (건너뜀)
              </p>
            </div>
          )}

          {/* Detail per department */}
          <div className="space-y-2">
            {result.details.map((d) => (
              <div key={d.departmentName} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${d.action === 'created' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    {d.action === 'created' ? '생성' : '기존'}
                  </span>
                  <span className="font-medium text-slate-50">{d.departmentName}</span>
                </div>
                {d.agentsCreated.length > 0 && (
                  <p className="text-xs text-slate-500 ml-12 mt-0.5">
                    + {d.agentsCreated.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-corthex-accent hover:bg-corthex-accent text-white text-sm font-medium rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Template Card
// ============================================================
function TemplateCard({ template, onClick }: { template: OrgTemplate; onClick: () => void }) {
  const depts = template.templateData?.departments || []
  const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 transition-all cursor-pointer group bg-slate-800/50 border border-slate-700 hover:border-corthex-accent hover:shadow-lg hover:shadow-corthex-accent-deep/10 focus:outline-none focus:ring-2 focus:ring-corthex-accent/40"
      data-testid={`template-card-${template.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-50 group-hover:text-corthex-accent-hover transition-colors">
          {template.name}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {template.isBuiltin && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-corthex-accent-deep text-corthex-accent-hover">
              기본
            </span>
          )}
          {template.isPublished && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-400">
              공개
            </span>
          )}
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{template.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{depts.length}개 부서</span>
        <span>{totalAgents}명 에이전트</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {depts.map((d) => (
          <span
            key={d.name}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400"
          >
            {d.name}
          </span>
        ))}
      </div>
    </button>
  )
}

// ============================================================
// Main Page
// ============================================================
export function OrgTemplatesPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()

  const [previewTemplate, setPreviewTemplate] = useState<OrgTemplate | null>(null)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDesc, setNewTemplateDesc] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-templates', selectedCompanyId],
    queryFn: () => api.get<{ data: OrgTemplate[] }>(`/admin/org-templates?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const applyMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: ApplyResult }>(`/admin/org-templates/${templateId}/apply`, {}),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['org-chart'] })
      qc.invalidateQueries({ queryKey: ['departments'] })
      qc.invalidateQueries({ queryKey: ['agents'] })
      setPreviewTemplate(null)
      setApplyResult(result.data)
      addToast({ type: 'success', message: '조직 템플릿이 적용되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      api.post<{ data: OrgTemplate }>('/admin/org-templates', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-templates'] })
      setShowCreateModal(false)
      setNewTemplateName('')
      setNewTemplateDesc('')
      addToast({ type: 'success', message: '현재 조직이 템플릿으로 저장되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const publishMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: OrgTemplate }>(`/admin/org-templates/${templateId}/publish`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-templates'] })
      addToast({ type: 'success', message: '템플릿이 마켓에 공개되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: OrgTemplate }>(`/admin/org-templates/${templateId}/unpublish`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-templates'] })
      addToast({ type: 'success', message: '템플릿이 마켓에서 회수되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const templates = data?.data || []

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6" data-testid="org-templates-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="org-templates-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
        <div className="text-center text-slate-500 py-8">로딩 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6" data-testid="org-templates-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">템플릿을 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-corthex-accent text-white hover:bg-corthex-accent transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="org-templates-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
          <p className="text-sm text-slate-400 mt-1">
            템플릿을 선택하면 부서와 에이전트가 자동으로 생성됩니다. 기존 조직과 중복되는 항목은 건너뜁니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-corthex-accent hover:bg-corthex-accent text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
        >
          현재 조직을 템플릿으로 저장
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">등록된 템플릿이 없습니다.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onClick={() => setPreviewTemplate(t)} />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={() => applyMutation.mutate(previewTemplate.id)}
          applying={applyMutation.isPending}
        />
      )}

      {/* Apply Result Modal */}
      {applyResult && (
        <ApplyResultModal result={applyResult} onClose={() => setApplyResult(null)} />
      )}

      {/* Publish Controls per template (below the grid) */}
      {templates.some((t) => t.companyId && !t.isBuiltin) && (
        <div className="border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-50 mb-3">마켓 공개 관리</h3>
          <div className="space-y-2">
            {templates.filter((t) => t.companyId && !t.isBuiltin).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-50">{t.name}</span>
                  {t.isPublished ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300">공개</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-500">비공개</span>
                  )}
                  {t.downloadCount > 0 && (
                    <span className="text-[10px] text-slate-500">{t.downloadCount}회 다운로드</span>
                  )}
                </div>
                {t.isPublished ? (
                  <button
                    onClick={() => unpublishMutation.mutate(t.id)}
                    disabled={unpublishMutation.isPending}
                    className="px-3 py-1 text-xs text-red-400 border border-red-800 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    마켓에서 회수
                  </button>
                ) : (
                  <button
                    onClick={() => setPublishConfirmId(t.id)}
                    disabled={publishMutation.isPending}
                    className="px-3 py-1 text-xs text-corthex-accent-hover border border-corthex-accent-deep rounded-lg hover:bg-corthex-accent-deep/20 transition-colors disabled:opacity-50"
                  >
                    마켓에 공개
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {publishConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPublishConfirmId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-50">마켓에 공개</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400">
                이 템플릿을 마켓에 공개하시겠습니까? 다른 회사에서 이 조직 구조를 복제할 수 있게 됩니다.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setPublishConfirmId(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                취소
              </button>
              <button
                onClick={() => { publishMutation.mutate(publishConfirmId); setPublishConfirmId(null) }}
                className="px-4 py-2 bg-corthex-accent hover:bg-corthex-accent text-white text-sm font-medium rounded-lg transition-colors"
              >
                공개
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreateModal(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
            data-testid="create-template-modal"
          >
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-50">현재 조직을 템플릿으로 저장</h2>
              <p className="text-sm text-slate-400 mt-0.5">현재 부서와 에이전트 구조가 템플릿으로 저장됩니다.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">템플릿 이름</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="예: 스타트업 기본 조직"
                  className={modalInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">설명 (선택)</label>
                <textarea
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="이 템플릿에 대한 간단한 설명..."
                  rows={3}
                  className={`${modalInput} resize-none`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                취소
              </button>
              <button
                onClick={() => createMutation.mutate({ name: newTemplateName, description: newTemplateDesc || undefined })}
                disabled={!newTemplateName.trim() || createMutation.isPending}
                className="px-4 py-2 bg-corthex-accent hover:bg-corthex-accent disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
