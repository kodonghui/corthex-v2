import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useToastStore } from '../stores/toast-store'
import { Grid, BarChart2, Truck, BadgeCheck, Plus, X, Download, Search, Settings } from 'lucide-react'

type MarketSoulTemplate = {
  id: string
  name: string
  description: string | null
  content: string
  category: string | null
  tier: string | null
  allowedTools: string[] | null
  isBuiltin: boolean
  downloadCount: number
  publishedAt: string | null
}

function tierLabel(tier: string | null) {
  if (!tier) return null
  const map: Record<string, string> = { manager: '매니저', specialist: '전문가', worker: '워커' }
  return map[tier] || tier
}

function tierColor(tier: string | null) {
  if (!tier) return 'bg-corthex-elevated text-corthex-text-disabled'
  const map: Record<string, string> = {
    manager: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    specialist: 'bg-corthex-accent/20 text-corthex-accent-hover border border-corthex-accent/30',
    worker: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  }
  return map[tier] || 'bg-corthex-elevated text-corthex-text-disabled'
}

function MarketPreviewModal({
  template,
  onClose,
  onImport,
  importing,
}: {
  template: MarketSoulTemplate
  onClose: () => void
  onImport: () => void
  importing: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        data-testid="marketplace-preview-modal"
        className="bg-corthex-surface border border-corthex-border shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-corthex-text-primary">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {template.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-corthex-elevated text-corthex-text-disabled">
                  {template.category}
                </span>
              )}
              {template.tier && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColor(template.tier)}`}>
                  {tierLabel(template.tier)}
                </span>
              )}
              {template.isBuiltin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  내장
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-text-disabled transition-colors p-1 rounded-lg hover:bg-corthex-elevated">
            <X className="w-5 h-5" />
          </button>
        </div>

        {template.description && (
          <p className="text-sm text-corthex-text-disabled mb-4">{template.description}</p>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium text-corthex-text-disabled mb-2">Soul 내용</h4>
          <pre className="text-sm text-corthex-text-disabled whitespace-pre-wrap font-mono bg-corthex-bg rounded-lg p-4 max-h-60 overflow-y-auto border border-corthex-border">
            {template.content}
          </pre>
        </div>

        {template.allowedTools && (template.allowedTools as string[]).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-corthex-text-disabled mb-2">
              추천 도구 ({(template.allowedTools as string[]).length}개)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(template.allowedTools as string[]).map((tool) => (
                <span
                  key={tool}
                  className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-corthex-border">
          <span className="text-xs text-corthex-text-secondary flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.downloadCount}회
          </span>
          <button
            onClick={onImport}
            disabled={importing}
            className="bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            {importing ? '가져오는 중...' : '가져오기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MarketCard({
  template,
  onClick,
}: {
  template: MarketSoulTemplate
  onClick: () => void
}) {
  const preview = template.content.split('\n').slice(0, 3).join('\n')
  const truncated = preview.length < template.content.length ? preview + '...' : preview

  return (
    <div
      data-testid={`marketplace-card-${template.id}`}
      onClick={onClick}
      className="bg-corthex-surface border border-transparent hover:border-corthex-accent/30 transition-all duration-300 flex flex-col group cursor-pointer"
    >
      {/* Card visual area */}
      <div className="h-32 w-full bg-corthex-elevated relative overflow-hidden">
        <div className="absolute inset-0 flex items-end p-3">
          <div className="flex gap-1">
            <div className="w-1 h-8 bg-corthex-accent opacity-60" />
            <div className="w-1 h-6 bg-corthex-accent opacity-40" />
            <div className="w-1 h-4 bg-corthex-accent opacity-20" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-corthex-surface to-transparent" />
        <div className="absolute top-3 left-3">
          <div className="font-mono text-[10px] text-corthex-accent tracking-widest uppercase mb-1">UNIT // TYPE</div>
        </div>
        {template.isBuiltin && (
          <div className="absolute top-3 right-3 bg-corthex-bg/80 px-2 py-0.5 text-[10px] font-mono text-corthex-accent border border-corthex-accent/20">
            BUILTIN
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-black tracking-tight uppercase text-corthex-text-primary group-hover:text-corthex-accent transition-colors line-clamp-1">
            {template.name}
          </h3>
          <span className="text-xs text-corthex-text-secondary whitespace-nowrap ml-2 font-mono flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.downloadCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {template.category && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-corthex-elevated text-corthex-text-disabled uppercase">
              {template.category}
            </span>
          )}
          {template.tier && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColor(template.tier)}`}>
              {tierLabel(template.tier)}
            </span>
          )}
        </div>

        {template.description && (
          <p className="text-sm text-corthex-text-disabled line-clamp-2 mb-3">{template.description}</p>
        )}

        <pre className="text-xs text-corthex-text-secondary whitespace-pre-wrap line-clamp-3 font-mono leading-relaxed mb-4 flex-1">{truncated}</pre>

        <div className="flex items-center justify-between pt-4 border-t border-corthex-border/30">
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="px-4 py-1.5 bg-corthex-accent-deep hover:bg-corthex-accent text-corthex-text-on-accent font-black text-[10px] tracking-tighter uppercase transition-all"
          >
            DEPLOY UNIT
          </button>
        </div>
      </div>
    </div>
  )
}

export function AgentMarketplacePage() {
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [preview, setPreview] = useState<MarketSoulTemplate | null>(null)

  const params = new URLSearchParams()
  if (search.trim()) params.set('q', search.trim())
  if (categoryFilter) params.set('category', categoryFilter)
  if (tierFilter) params.set('tier', tierFilter)

  const { data, isLoading } = useQuery({
    queryKey: ['agent-marketplace', search, categoryFilter, tierFilter],
    queryFn: () =>
      api.get<{ data: MarketSoulTemplate[] }>(`/workspace/agent-marketplace?${params.toString()}`),
  })

  const templates = data?.data || []

  const categories = useMemo(() => {
    const cats = new Set<string>()
    templates.forEach((t) => { if (t.category) cats.add(t.category) })
    return Array.from(cats).sort()
  }, [templates])

  const importMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/agent-marketplace/${id}/import`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-marketplace'] })
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      setPreview(null)
      addToast({ type: 'success', message: '에이전트 템플릿을 가져왔습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-corthex-accent px-6 py-6 mb-6">
        <div data-testid="marketplace-header">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-corthex-accent shadow-[0_0_8px_rgba(202,138,4,0.4)]" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-corthex-accent">System Online</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none text-corthex-text-primary">
            Available<br />Operational Units
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] text-corthex-text-disabled leading-relaxed uppercase">
          Active Templates: {templates.length}<br />
          Status: ONLINE
        </div>
      </div>

      {/* Filters */}
      <div data-testid="marketplace-filters" className="px-6 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ASSETS..."
            className="w-full bg-corthex-elevated border-none text-[10px] font-mono tracking-widest pl-10 pr-4 py-2 focus:ring-1 focus:ring-corthex-accent text-corthex-text-secondary placeholder-corthex-text-disabled/50 rounded"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent rounded px-3 py-2 text-xs font-mono text-corthex-text-primary outline-none min-w-[160px]"
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent rounded px-3 py-2 text-xs font-mono text-corthex-text-primary outline-none min-w-[130px]"
        >
          <option value="">전체 티어</option>
          <option value="manager">매니저</option>
          <option value="specialist">전문가</option>
          <option value="worker">워커</option>
        </select>
      </div>

      {/* Agent Grid */}
      <div className="px-6 flex-1">
        {isLoading ? (
          <div className="text-center text-corthex-text-secondary py-16">로딩 중...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-corthex-text-disabled">
              {search || categoryFilter || tierFilter
                ? '검색 결과가 없습니다'
                : '공개된 에이전트 템플릿이 없습니다'}
            </p>
            {!search && !categoryFilter && !tierFilter && (
              <p className="text-xs text-corthex-text-secondary mt-2">
                다른 회사가 에이전트 Soul 템플릿을 공개하면 여기에서 가져올 수 있습니다.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1">
            {templates.map((t) => (
              <MarketCard key={t.id} template={t} onClick={() => setPreview(t)} />
            ))}
            {/* Initialize Custom Unit Placeholder */}
            <div className="bg-corthex-bg border border-dashed border-corthex-border p-6 flex flex-col items-center justify-center group hover:border-corthex-accent transition-colors cursor-pointer min-h-[200px]">
              <div className="w-14 h-14 rounded-full border border-dashed border-corthex-border flex items-center justify-center mb-4 group-hover:border-corthex-accent">
                <Plus className="w-8 h-8 text-corthex-text-disabled group-hover:text-corthex-accent" />
              </div>
              <div className="font-black text-corthex-text-disabled uppercase tracking-tight text-center group-hover:text-corthex-text-primary">Initialize Custom Unit</div>
              <div className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest mt-2">Bespoke Configuration</div>
            </div>
          </div>
        )}
      </div>

      {/* System Stats Footer */}
      {templates.length > 0 && (
        <footer className="grid grid-cols-2 md:grid-cols-4 gap-1 py-8 px-6 mt-6 border-t border-corthex-border/30">
          <div className="bg-corthex-surface p-4">
            <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-1">Available Units</div>
            <div className="text-xl font-mono text-corthex-text-primary">{templates.length}</div>
          </div>
          <div className="bg-corthex-surface p-4">
            <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-1">Categories</div>
            <div className="text-xl font-mono text-corthex-accent">{categories.length}</div>
          </div>
          <div className="bg-corthex-surface p-4">
            <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-1">Total Downloads</div>
            <div className="text-xl font-mono text-corthex-text-primary">
              {templates.reduce((acc, t) => acc + t.downloadCount, 0)}
            </div>
          </div>
          <div className="bg-corthex-surface p-4">
            <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-1">System Health</div>
            <div className="text-xl font-mono text-emerald-400">OPTIMAL</div>
          </div>
        </footer>
      )}

      {/* Preview modal */}
      {preview && (
        <MarketPreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onImport={() => importMutation.mutate(preview.id)}
          importing={importMutation.isPending}
        />
      )}
    </div>
  )
}
