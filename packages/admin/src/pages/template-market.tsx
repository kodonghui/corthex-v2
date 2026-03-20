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

type MarketTemplate = {
  id: string
  name: string
  description: string | null
  templateData: { departments: TemplateDepartment[] }
  isBuiltin: boolean
  downloadCount: number
  tags: string[] | null
  publishedAt: string | null
}

// ============================================================
// Constants
// ============================================================
const TIER_LABELS: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  specialist: { label: 'Specialist', color: 'bg-[#5a7247]/20 text-[#a3c48a] border border-[#5a7247]/30' },
  worker: { label: 'Worker', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
}

// ============================================================
// Preview + Clone Modal
// ============================================================
function MarketPreviewModal({
  template,
  onClose,
  onClone,
  cloning,
}: {
  template: MarketTemplate
  onClose: () => void
  onClone: () => void
  cloning: boolean
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
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{template.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {depts.length}개 부서 · {totalAgents}명 에이전트 · {template.downloadCount}회 다운로드
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="px-6 pt-3 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#283618]/30 text-[#a3c48a]">
                {tag}
              </span>
            ))}
          </div>
        )}

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
                <div className="divide-y divide-slate-700/50">
                  {dept.agents.map((agent) => {
                    const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                    return (
                      <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-sm text-slate-50">{agent.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                        <span className="text-xs text-slate-400 ml-auto">{agent.modelName}</span>
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
            onClick={onClone}
            disabled={cloning}
            className="px-4 py-2 bg-[#5a7247] hover:bg-[#6b8a55] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {cloning ? '복제 중...' : '내 조직에 복제'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Market Template Card
// ============================================================
function MarketCard({ template, onClick }: { template: MarketTemplate; onClick: () => void }) {
  const depts = template.templateData?.departments || []
  const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-5 transition-all cursor-pointer group bg-slate-800/50 border border-slate-700 hover:border-[#5a7247] hover:shadow-lg hover:shadow-[#283618]/10 focus:outline-none focus:ring-2 focus:ring-[#5a7247]/40"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-50 group-hover:text-[#a3c48a] transition-colors">
          {template.name}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {template.isBuiltin && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#283618] text-[#a3c48a]">
              기본
            </span>
          )}
          <span className="text-[10px] text-slate-500">{template.downloadCount} DL</span>
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{template.description}</p>
      )}

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#283618]/30 text-[#a3c48a]">
              {tag}
            </span>
          ))}
          {template.tags.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 text-slate-500">+{template.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{depts.length}개 부서</span>
        <span>{totalAgents}명 에이전트</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {depts.slice(0, 5).map((d) => (
          <span
            key={d.name}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400"
          >
            {d.name}
          </span>
        ))}
        {depts.length > 5 && (
          <span className="text-[10px] px-2 py-0.5 text-slate-500">+{depts.length - 5}</span>
        )}
      </div>
    </button>
  )
}

// ============================================================
// Main Page
// ============================================================
export function TemplateMarketPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()

  const [previewTemplate, setPreviewTemplate] = useState<MarketTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const queryParams = new URLSearchParams()
  if (searchQuery) queryParams.set('q', searchQuery)
  if (selectedTag) queryParams.set('tag', selectedTag)
  const qs = queryParams.toString()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['template-market', selectedCompanyId, searchQuery, selectedTag],
    queryFn: () => api.get<{ data: MarketTemplate[] }>(`/workspace/template-market${qs ? `?${qs}` : ''}`),
    enabled: !!selectedCompanyId,
  })

  const cloneMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: unknown }>(`/workspace/template-market/${templateId}/clone`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-templates'] })
      qc.invalidateQueries({ queryKey: ['template-market'] })
      setPreviewTemplate(null)
      addToast({ type: 'success', message: '템플릿이 복제되었습니다. 조직 템플릿 페이지에서 확인하세요.' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const templates = data?.data || []

  // Collect all unique tags for filter
  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags || [])))

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">템플릿 마켓</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">템플릿 마켓</h1>
        <div className="text-center text-slate-500 py-8">로딩 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">템플릿 마켓</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">마켓 데이터를 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-[#5a7247] text-white hover:bg-[#6b8a55] transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">템플릿 마켓</h1>
        <p className="text-sm text-slate-400 mt-1">
          다른 회사가 공유한 조직 구조 템플릿을 찾아보고, 마음에 드는 것을 복제하여 사용할 수 있습니다.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="템플릿 이름 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-600 text-slate-50 placeholder-slate-500 focus:border-[#5a7247] focus:ring-2 focus:ring-[#5a7247]/40 focus:outline-none"
        />
        {allTags.length > 0 && (
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-600 text-slate-50 focus:border-[#5a7247] focus:ring-2 focus:ring-[#5a7247]/40 focus:outline-none"
          >
            <option value="">모든 태그</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">
              {searchQuery || selectedTag ? '검색 결과가 없습니다.' : '공개된 템플릿이 아직 없습니다.'}
            </p>
            {!searchQuery && !selectedTag && (
              <p className="text-xs text-slate-600 mt-2">
                여러 회사가 조직 구조 템플릿을 공개하면 여기에 표시됩니다.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <MarketCard key={t.id} template={t} onClick={() => setPreviewTemplate(t)} />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <MarketPreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onClone={() => cloneMutation.mutate(previewTemplate.id)}
          cloning={cloneMutation.isPending}
        />
      )}
    </div>
  )
}
