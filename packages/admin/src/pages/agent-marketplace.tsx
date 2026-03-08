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
  if (!tier) return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
  const map: Record<string, string> = {
    manager: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    specialist: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    worker: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  }
  return map[tier] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {template.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {template.category}
                </span>
              )}
              {template.tier && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${tierColor(template.tier)}`}>
                  {tierLabel(template.tier)}
                </span>
              )}
              {template.isBuiltin && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                  내장
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 text-lg">✕</button>
        </div>

        {template.description && (
          <p className="text-sm text-zinc-500 mb-4">{template.description}</p>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Soul 내용</h4>
          <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 max-h-60 overflow-y-auto">
            {template.content}
          </pre>
        </div>

        {template.allowedTools && (template.allowedTools as string[]).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              추천 도구 ({(template.allowedTools as string[]).length}개)
            </h4>
            <div className="flex flex-wrap gap-1">
              {(template.allowedTools as string[]).map((tool) => (
                <span
                  key={tool}
                  className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-400">다운로드 {template.downloadCount}회</span>
          <button
            onClick={onImport}
            disabled={importing}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
          {template.name}
        </h3>
        <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
          ↓ {template.downloadCount}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {template.category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {template.category}
          </span>
        )}
        {template.tier && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${tierColor(template.tier)}`}>
            {tierLabel(template.tier)}
          </span>
        )}
        {template.isBuiltin && <span className="text-xs text-amber-500">내장</span>}
      </div>
      {template.description && (
        <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{template.description}</p>
      )}
      <pre className="text-xs text-zinc-400 whitespace-pre-wrap line-clamp-3 font-mono">{truncated}</pre>
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
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">에이전트 마켓</h1>
        <p className="text-sm text-zinc-500 mt-1">다른 회사가 공유한 에이전트 Soul 템플릿을 찾아 가져올 수 있습니다</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="템플릿 검색..."
          className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">전체 티어</option>
          <option value="manager">매니저</option>
          <option value="specialist">전문가</option>
          <option value="worker">워커</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : templates.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">
          {search || categoryFilter || tierFilter
            ? '검색 결과가 없습니다'
            : '공개된 에이전트 템플릿이 없습니다'}
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
