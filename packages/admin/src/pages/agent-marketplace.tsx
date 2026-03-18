import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useToastStore } from '../stores/toast-store'

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
  if (!tier) return 'bg-slate-700 text-slate-300'
  const map: Record<string, string> = {
    manager: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    specialist: 'bg-[#5a7247]/20 text-[#a3c48a] border border-[#5a7247]/30',
    worker: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  }
  return map[tier] || 'bg-slate-700 text-slate-300'
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
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {template.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
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
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {template.description && (
          <p className="text-sm text-slate-400 mb-4">{template.description}</p>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Soul 내용</h4>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 rounded-lg p-4 max-h-60 overflow-y-auto border border-slate-700">
            {template.content}
          </pre>
        </div>

        {template.allowedTools && (template.allowedTools as string[]).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">
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

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="text-xs text-slate-500">다운로드 {template.downloadCount}회</span>
          <button
            onClick={onImport}
            disabled={importing}
            className="bg-[#5a7247] hover:bg-[#6b8a55] disabled:opacity-50 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
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
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-[#5a7247]/50 hover:bg-slate-800 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-slate-50 line-clamp-1">
          {template.name}
        </h3>
        <span className="text-xs text-slate-500 whitespace-nowrap ml-2 font-mono">
          ↓ {template.downloadCount}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {template.category && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
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
      {template.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-2">{template.description}</p>
      )}
      <pre className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3 font-mono leading-relaxed">{truncated}</pre>
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

  // Extract unique categories from results
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
    <div className="space-y-6">
      <div data-testid="marketplace-header">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">에이전트 마켓</h1>
        <p className="text-sm text-slate-400 mt-1">다른 회사가 공유한 에이전트 Soul 템플릿을 찾아 가져올 수 있습니다</p>
      </div>

      {/* Filters */}
      <div data-testid="marketplace-filters" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="템플릿 검색..."
          className="flex-1 bg-slate-800 border border-slate-600 focus:border-[#5a7247] focus:ring-1 focus:ring-[#5a7247] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 focus:border-[#5a7247] focus:ring-1 focus:ring-[#5a7247] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors min-w-[160px]"
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 focus:border-[#5a7247] focus:ring-1 focus:ring-[#5a7247] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors min-w-[130px]"
        >
          <option value="">전체 티어</option>
          <option value="manager">매니저</option>
          <option value="specialist">전문가</option>
          <option value="worker">워커</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">로딩 중...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-400">
            {search || categoryFilter || tierFilter
              ? '검색 결과가 없습니다'
              : '공개된 에이전트 템플릿이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <MarketCard key={t.id} template={t} onClick={() => setPreview(t)} />
          ))}
        </div>
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
