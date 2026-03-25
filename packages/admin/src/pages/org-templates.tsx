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
  manager: { label: 'Manager', color: 'bg-corthex-accent-muted text-corthex-accent border border-corthex-border' },
  specialist: { label: 'Specialist', color: 'bg-corthex-elevated text-corthex-text-secondary border border-corthex-border' },
  worker: { label: 'Worker', color: 'bg-corthex-elevated text-corthex-text-disabled border border-corthex-border' },
}

const modalInput = 'bg-corthex-elevated border border-corthex-border focus:border-corthex-border-strong focus:ring-2 focus:ring-corthex-accent/30 focus:outline-none px-3 py-2 text-sm font-mono text-corthex-text-primary w-full'

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
        className="bg-corthex-surface border border-corthex-border shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="preview-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-border">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary">{template.name}</h2>
            <p className="text-sm text-corthex-text-disabled mt-0.5">
              {depts.length}개 부서 · {totalAgents}명 에이전트
            </p>
          </div>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-text-disabled">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {template.description && (
            <p className="text-sm text-corthex-text-disabled">{template.description}</p>
          )}

          {depts.map((dept) => (
            <div key={dept.name} className="border border-corthex-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-corthex-surface">
                <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{dept.name}</span>
                {dept.description && (
                  <span className="text-xs text-corthex-text-secondary truncate">— {dept.description}</span>
                )}
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-corthex-elevated text-corthex-text-disabled ml-auto flex-shrink-0">
                  {dept.agents.length}명
                </span>
              </div>
              {dept.agents.length > 0 && (
                <div className="divide-y divide-corthex-border">
                  {dept.agents.map((agent) => {
                    const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                    return (
                      <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-xs font-mono font-bold text-corthex-text-primary">{agent.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                        <span className="text-xs text-corthex-text-secondary ml-auto">{agent.modelName}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-corthex-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-corthex-text-disabled hover:text-corthex-text-disabled"
          >
            닫기
          </button>
          <button
            onClick={onApply}
            disabled={applying}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-50 transition-colors"
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
        className="bg-corthex-surface border border-corthex-border shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
        data-testid="apply-result-modal"
      >
        <div className="px-6 py-4 border-b border-corthex-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary">적용 완료</h2>
          <p className="text-sm text-corthex-text-disabled mt-0.5">{result.templateName}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-corthex-elevated border border-corthex-border px-4 py-3 text-center">
              <p className="text-2xl font-bold font-mono text-corthex-success">{result.departmentsCreated}</p>
              <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-widest mt-0.5">부서 생성</p>
            </div>
            <div className="bg-corthex-elevated border border-corthex-border px-4 py-3 text-center">
              <p className="text-2xl font-bold font-mono text-corthex-accent">{result.agentsCreated}</p>
              <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-widest mt-0.5">에이전트 생성</p>
            </div>
          </div>

          {/* Skipped info */}
          {(result.departmentsSkipped > 0 || result.agentsSkipped > 0) && (
            <div className="bg-corthex-surface rounded-lg px-4 py-3">
              <p className="text-xs text-corthex-text-secondary">
                이미 존재하는 항목: 부서 {result.departmentsSkipped}개, 에이전트 {result.agentsSkipped}명 (건너뜀)
              </p>
            </div>
          )}

          {/* Detail per department */}
          <div className="space-y-2">
            {result.details.map((d) => (
              <div key={d.departmentName} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-1.5 py-0.5 border uppercase tracking-widest ${d.action === 'created' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-corthex-elevated text-corthex-text-secondary border-corthex-border'}`}>
                    {d.action === 'created' ? '생성' : '기존'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{d.departmentName}</span>
                </div>
                {d.agentsCreated.length > 0 && (
                  <p className="text-xs text-corthex-text-secondary ml-12 mt-0.5">
                    + {d.agentsCreated.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-corthex-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover transition-colors"
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
      className="text-left p-5 transition-all cursor-pointer group bg-corthex-surface border border-corthex-border hover:border-corthex-border-strong focus:outline-none focus:ring-2 focus:ring-corthex-accent/30"
      data-testid={`template-card-${template.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary group-hover:text-corthex-accent transition-colors">
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
        <p className="text-sm text-corthex-text-disabled mb-4 line-clamp-2">{template.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-corthex-text-secondary">
        <span>{depts.length}개 부서</span>
        <span>{totalAgents}명 에이전트</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {depts.map((d) => (
          <span
            key={d.name}
            className="text-[10px] px-2 py-0.5 rounded-full bg-corthex-elevated text-corthex-text-disabled"
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
        <div className="bg-corthex-surface/50 border border-corthex-border rounded-xl">
          <p className="text-sm text-corthex-text-secondary text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="org-templates-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
        <div className="text-center text-corthex-text-secondary py-8">로딩 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6" data-testid="org-templates-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">조직 템플릿</h1>
        <div className="bg-corthex-surface/50 border border-corthex-border rounded-xl">
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
    <div className="p-8 space-y-6" data-testid="org-templates-page">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-corthex-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-corthex-accent"></div>
            <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">System / Templates / Registry</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-corthex-text-primary">
            Organization Templates
          </h1>
          <p className="text-xs font-mono text-corthex-text-disabled mt-1 uppercase tracking-widest">
            템플릿을 선택하면 부서와 에이전트가 자동으로 생성됩니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-corthex-accent text-corthex-text-on-accent text-xs font-bold uppercase tracking-widest hover:bg-corthex-accent-hover transition-colors flex-shrink-0 flex items-center gap-2"
        >
          현재 조직 → 템플릿 저장
        </button>
      </div>

      {/* Template Table */}
      {templates.length === 0 ? (
        <div className="bg-corthex-surface border border-corthex-border p-12 text-center">
          <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">등록된 템플릿이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-corthex-surface border border-corthex-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-corthex-elevated border-b border-corthex-border px-6 py-3">
            <div className="col-span-4 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Template Identification</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-center">Depts</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-center">Agents</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-center">Status</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-right">Operations</div>
          </div>

          <div className="divide-y divide-corthex-border">
            {templates.map((t) => {
              const depts = t.templateData?.departments || []
              const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)
              return (
                <div key={t.id} className="grid grid-cols-12 px-6 py-6 hover:bg-corthex-elevated transition-colors group">
                  <div className="col-span-4 flex items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary mb-1">{t.name}</h3>
                      {t.description && (
                        <p className="text-xs font-mono text-corthex-text-disabled line-clamp-1">{t.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.isBuiltin && (
                          <span className="text-xs px-1.5 py-0.5 bg-corthex-accent-muted text-corthex-accent border border-corthex-border font-mono uppercase tracking-widest">기본</span>
                        )}
                        {t.isPublished && (
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase tracking-widest">공개</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl font-bold text-corthex-text-primary">{depts.length}</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-corthex-text-disabled">Depts</span>
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl font-bold text-corthex-text-primary">{totalAgents}</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-corthex-text-disabled">Agents</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {t.downloadCount > 0 && (
                      <span className="text-xs font-mono text-corthex-text-disabled">{t.downloadCount}회</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    {t.companyId && !t.isBuiltin && (
                      t.isPublished ? (
                        <button
                          onClick={() => unpublishMutation.mutate(t.id)}
                          disabled={unpublishMutation.isPending}
                          className="text-xs font-mono text-corthex-error hover:text-red-400 transition-colors disabled:opacity-50 uppercase tracking-widest"
                        >
                          회수
                        </button>
                      ) : (
                        <button
                          onClick={() => setPublishConfirmId(t.id)}
                          disabled={publishMutation.isPending}
                          className="text-xs font-mono text-corthex-text-disabled hover:text-corthex-accent transition-colors disabled:opacity-50 uppercase tracking-widest"
                        >
                          공개
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="px-4 py-2 bg-corthex-accent text-corthex-text-on-accent text-xs font-bold uppercase tracking-widest hover:bg-corthex-accent-hover transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
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

      {/* Publish Confirm Modal */}
      {publishConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPublishConfirmId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-corthex-surface border border-corthex-border shadow-2xl w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-corthex-border bg-corthex-elevated">
              <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">마켓에 공개</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-mono text-corthex-text-secondary">
                이 템플릿을 마켓에 공개하시겠습니까? 다른 회사에서 이 조직 구조를 복제할 수 있게 됩니다.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-corthex-border">
              <button
                onClick={() => setPublishConfirmId(null)}
                className="px-4 py-2 text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors uppercase tracking-widest"
              >
                취소
              </button>
              <button
                onClick={() => { publishMutation.mutate(publishConfirmId); setPublishConfirmId(null) }}
                className="px-4 py-2 bg-corthex-accent text-corthex-text-on-accent text-xs font-bold uppercase tracking-widest hover:bg-corthex-accent-hover transition-colors"
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
            className="bg-corthex-surface border border-corthex-border shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
            data-testid="create-template-modal"
          >
            <div className="px-6 py-4 border-b border-corthex-border bg-corthex-elevated">
              <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">현재 조직을 템플릿으로 저장</h2>
              <p className="text-xs font-mono text-corthex-text-disabled mt-1">현재 부서와 에이전트 구조가 템플릿으로 저장됩니다.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">템플릿 이름</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="예: 스타트업 기본 조직"
                  className={modalInput}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">설명 (선택)</label>
                <textarea
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="이 템플릿에 대한 간단한 설명..."
                  rows={3}
                  className={`${modalInput} resize-none`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-corthex-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors uppercase tracking-widest"
              >
                취소
              </button>
              <button
                onClick={() => createMutation.mutate({ name: newTemplateName, description: newTemplateDesc || undefined })}
                disabled={!newTemplateName.trim() || createMutation.isPending}
                className="px-4 py-2 bg-corthex-accent text-corthex-text-on-accent text-xs font-bold uppercase tracking-widest hover:bg-corthex-accent-hover disabled:opacity-50 transition-colors"
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
