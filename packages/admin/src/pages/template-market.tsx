import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Plus, Filter, Download, Layers, X, ChevronRight } from 'lucide-react'

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
  specialist: { label: 'Specialist', color: 'bg-corthex-accent/20 text-corthex-accent-hover border border-corthex-accent/30' },
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
        className="bg-corthex-bg rounded-xl border border-corthex-border shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-border">
          <div>
            <h2 className="text-lg font-semibold text-corthex-text-primary">{template.name}</h2>
            <p className="text-sm text-corthex-text-disabled mt-0.5">
              {depts.length}개 부서 · {totalAgents}명 에이전트 · {template.downloadCount}회 다운로드
            </p>
          </div>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-text-disabled">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="px-6 pt-3 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-corthex-accent-deep/30 text-corthex-accent-hover">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {template.description && (
            <p className="text-sm text-corthex-text-disabled">{template.description}</p>
          )}

          {depts.map((dept) => (
            <div key={dept.name} className="border border-corthex-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-corthex-surface">
                <span className="text-sm font-medium text-corthex-text-primary">{dept.name}</span>
                {dept.description && (
                  <span className="text-xs text-corthex-text-secondary truncate">— {dept.description}</span>
                )}
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-corthex-elevated text-corthex-text-disabled ml-auto flex-shrink-0">
                  {dept.agents.length}명
                </span>
              </div>
              {dept.agents.length > 0 && (
                <div className="divide-y divide-corthex-border/50">
                  {dept.agents.map((agent) => {
                    const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                    return (
                      <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-sm text-corthex-text-primary">{agent.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                        <span className="text-xs text-corthex-text-disabled ml-auto">{agent.modelName}</span>
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
            className="px-4 py-2 text-sm text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
          >
            닫기
          </button>
          <button
            onClick={onClone}
            disabled={cloning}
            className="px-4 py-2 bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded-lg transition-colors"
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
    <div
      onClick={onClick}
      className="group bg-corthex-surface border border-transparent hover:border-corthex-accent/30 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Card visual area */}
      <div className="relative aspect-video overflow-hidden bg-corthex-elevated">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Layers className="w-16 h-16 text-corthex-accent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-corthex-surface to-transparent" />
        {template.isBuiltin && (
          <div className="absolute top-3 right-3 bg-corthex-bg/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-corthex-accent border border-corthex-accent/20">
            VERIFIED_CORE
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-corthex-accent">
          <span className="text-xs font-mono font-bold">{template.downloadCount}</span>
          <Download className="w-3 h-3" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold tracking-tight uppercase group-hover:text-corthex-accent transition-colors text-corthex-text-primary leading-tight">
            {template.name}
          </h3>
        </div>

        {template.description && (
          <p className="text-sm text-corthex-text-disabled mb-3 line-clamp-2">{template.description}</p>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-corthex-elevated text-corthex-text-disabled font-mono uppercase">
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-corthex-text-secondary">+{template.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Dept/Agent summary */}
        <div className="flex items-center gap-4 text-xs text-corthex-text-disabled font-mono mb-3">
          <span>{depts.length} DEPTS</span>
          <span>{totalAgents} AGENTS</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {depts.slice(0, 4).map((d) => (
            <span key={d.name} className="text-[10px] px-2 py-0.5 bg-corthex-elevated text-corthex-text-disabled font-mono">
              {d.name}
            </span>
          ))}
          {depts.length > 4 && (
            <span className="text-[10px] text-corthex-text-secondary">+{depts.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-corthex-border/30 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="px-4 py-1.5 bg-corthex-elevated hover:bg-corthex-accent hover:text-corthex-text-on-accent text-corthex-text-primary font-black text-[10px] tracking-tighter uppercase transition-all"
          >
            CLONE TEMPLATE
          </button>
          <ChevronRight className="w-4 h-4 text-corthex-text-disabled group-hover:text-corthex-accent transition-colors" />
        </div>
      </div>
    </div>
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
  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags || [])))

  if (!selectedCompanyId) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-corthex-text-primary">Template Market</h1>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl">
          <p className="text-sm text-corthex-text-secondary text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-corthex-text-primary">Template Market</h1>
        <div className="text-center text-corthex-text-secondary py-12">로딩 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-corthex-text-primary">Template Market</h1>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">마켓 데이터를 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-corthex-accent text-corthex-text-on-accent hover:brightness-110 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <section className="px-8 pt-8 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 bg-corthex-accent" />
            <span className="text-xs font-mono text-corthex-accent tracking-widest uppercase">Central Repository</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-corthex-text-primary">Template Market</h1>
          <p className="text-corthex-text-secondary text-sm max-w-xl">
            다른 회사가 공유한 조직 구조 템플릿을 찾아보고, 마음에 드는 것을 복제하여 사용할 수 있습니다.
          </p>
        </div>
        <div className="bg-corthex-surface p-1 flex items-center border border-corthex-border shadow-sm">
          <button className="bg-corthex-elevated text-corthex-accent px-5 py-2.5 font-mono text-xs uppercase tracking-tighter flex items-center gap-2 active:scale-95 transition-transform">
            <Plus className="w-4 h-4" />
            Submit Template
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="bg-corthex-surface mx-8 mb-6 sticky top-0 z-30 p-4 border-l-4 border-corthex-accent shadow-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none border-b border-corthex-border/30 focus:border-corthex-accent focus:ring-0 text-sm font-mono text-corthex-text-primary py-2 pl-10 placeholder-corthex-text-disabled/50 outline-none"
            placeholder="FILTER_BY_KEYWORD..."
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase tracking-widest mr-2 whitespace-nowrap">Tags:</span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase whitespace-nowrap transition-colors ${
                !selectedTag ? 'bg-corthex-accent text-corthex-text-on-accent' : 'bg-corthex-elevated text-corthex-text-secondary opacity-70 hover:opacity-100'
              }`}
            >
              All_Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase whitespace-nowrap transition-colors ${
                  selectedTag === tag ? 'bg-corthex-accent text-corthex-text-on-accent' : 'bg-corthex-elevated text-corthex-text-secondary opacity-70 hover:opacity-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Marketplace Grid */}
      <div className="px-8 pb-8">
        {templates.length === 0 ? (
          <div className="bg-corthex-surface border border-corthex-border rounded-xl">
            <div className="text-center py-16">
              <p className="text-sm text-corthex-text-secondary">
                {searchQuery || selectedTag ? '검색 결과가 없습니다.' : '공개된 템플릿이 아직 없습니다.'}
              </p>
              {!searchQuery && !selectedTag && (
                <p className="text-xs text-corthex-text-secondary mt-2">
                  여러 회사가 조직 구조 템플릿을 공개하면 여기에 표시됩니다.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((t) => (
              <MarketCard key={t.id} template={t} onClick={() => setPreviewTemplate(t)} />
            ))}
          </div>
        )}
      </div>

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
