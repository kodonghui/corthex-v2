/**
 * Classified Documents Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET  /api/workspace/archive?page=&limit=&search=&classification=&startDate=&endDate=&sortBy=&folderId=
 *   GET  /api/workspace/archive/stats
 *   GET  /api/workspace/archive/folders
 *   GET  /api/workspace/archive/:id
 *   POST /api/workspace/archive/folders
 *   PATCH /api/workspace/archive/folders/:id
 *   DELETE /api/workspace/archive/folders/:id
 *   PATCH /api/workspace/archive/:id
 *   DELETE /api/workspace/archive/:id
 *
 * Stitch HTML: classified/code.html (Natural Organic theme)
 * Existing React: packages/app/src/pages/classified.tsx
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import { MarkdownRenderer } from '../components/markdown-renderer'

// === Types ===

type Classification = 'public' | 'internal' | 'confidential' | 'secret'

type ArchiveItem = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  tags: string[]
  folderId: string | null
  folderName: string | null
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null
  commandType: string
  createdAt: string
}

type ArchiveDetail = ArchiveItem & {
  content: string | null
  commandId: string
  commandText: string
  delegationChain: { agentName: string; role: string; status: string }[]
  qualityReview: { score: number; conclusion: string; feedback: string } | null
  costRecords: { model: string; inputTokens: number; outputTokens: number; costMicro: number }[]
  similarDocuments: SimilarDocument[]
}

type SimilarDocument = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  agentName: string | null
  qualityScore: number | null
  similarityScore: number
  createdAt: string
}

type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

type ArchiveStats = {
  totalDocuments: number
  byClassification: Record<Classification, number>
  byDepartment: { departmentId: string; departmentName: string; count: number }[]
  recentWeekCount: number
}

type PaginatedResponse = {
  data: { items: ArchiveItem[]; page: number; limit: number; total: number }
}

// === Constants ===

const PAGE_SIZE = 20

const CLASSIFICATION_CONFIG: Record<Classification, { label: string }> = {
  public: { label: '공개' },
  internal: { label: '내부' },
  confidential: { label: '기밀' },
  secret: { label: '극비' },
}

const CLASSIFICATION_DOT_COLORS: Record<Classification, string> = {
  public: '#4d7c0f',
  internal: '#2563eb',
  confidential: '#b45309',
  secret: '#dc2626',
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'date', label: '날짜순' },
  { value: 'classification', label: '등급순' },
  { value: 'qualityScore', label: '품질순' },
]

// === Helpers ===

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCost(micro: number | null | undefined) {
  if (micro == null) return '-'
  return `$${(micro / 1_000_000).toFixed(4)}`
}

function scoreColor(score: number): string {
  if (score >= 4) return 'bg-corthex-accent'
  if (score >= 3) return 'bg-amber-700'
  return 'bg-red-600'
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function findFolderName(folders: ArchiveFolder[], id: string): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name
    const found = findFolderName(f.children, id)
    if (found) return found
  }
  return null
}

function flattenFolders(folders: ArchiveFolder[], depth = 0): { id: string; name: string; indent: string }[] {
  const result: { id: string; name: string; indent: string }[] = []
  for (const f of folders) {
    result.push({ id: f.id, name: f.name, indent: '  '.repeat(depth) })
    result.push(...flattenFolders(f.children, depth + 1))
  }
  return result
}

// === Main Page ===

export function ClassifiedPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // View state
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeClassification, setActiveClassification] = useState<Classification | null>(null)

  // Filter state
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [classificationFilter, setClassificationFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  // Build query params
  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (classificationFilter) params.set('classification', classificationFilter)
    if (activeClassification) params.set('classification', activeClassification)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (sortBy !== 'date') params.set('sortBy', sortBy)
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    return params.toString()
  }, [page, debouncedSearch, classificationFilter, activeClassification, startDate, endDate, sortBy, selectedFolderId])

  // Queries
  const listQuery = useQuery({
    queryKey: ['archive', page, debouncedSearch, classificationFilter, activeClassification, startDate, endDate, sortBy, selectedFolderId],
    queryFn: () => api.get<PaginatedResponse>(`/workspace/archive?${buildParams()}`),
  })

  const statsQuery = useQuery({
    queryKey: ['archive-stats'],
    queryFn: () => api.get<{ data: ArchiveStats }>('/workspace/archive/stats'),
  })

  const foldersQuery = useQuery({
    queryKey: ['archive-folders'],
    queryFn: () => api.get<{ data: ArchiveFolder[] }>('/workspace/archive/folders'),
  })

  const detailQuery = useQuery({
    queryKey: ['archive-detail', detailId],
    queryFn: () => api.get<{ data: ArchiveDetail }>(`/workspace/archive/${detailId}`),
    enabled: !!detailId,
  })

  const items = listQuery.data?.data?.items ?? []
  const total = listQuery.data?.data?.total ?? 0
  const stats = statsQuery.data?.data ?? null
  const folders = foldersQuery.data?.data ?? []
  const detail = detailQuery.data?.data ?? null

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/archive/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive'] })
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] })
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      setDetailId(null)
      toast.success('문서가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const classificationButtons: { key: Classification; label: string }[] = [
    { key: 'public', label: 'Public' },
    { key: 'internal', label: 'Internal' },
    { key: 'confidential', label: 'Confidential' },
    { key: 'secret', label: 'Secret' },
  ]

  return (
    <div data-testid="classified-page" className="font-sans min-h-screen" style={{ backgroundColor: 'var(--color-corthex-bg)', color: 'var(--color-corthex-text-primary)' }}>
      {/* BEGIN: MainHeader */}
      <header className="h-16 border-b bg-corthex-surface sticky top-0 z-50 flex items-center justify-between px-8" style={{ borderColor: 'var(--color-corthex-border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--color-corthex-accent)' }}>C</div>
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-corthex-text-primary)' }}>CORTHEX <span style={{ color: 'var(--color-corthex-text-secondary)' }} className="font-normal">v2.0</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-widest leading-none" style={{ color: 'var(--color-corthex-text-secondary)' }}>Access Level</p>
            <p className="text-sm font-bold" style={{ color: '#dc2626' }}>CLEARANCE: SECRET</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-corthex-elevated)' }}>
            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--color-corthex-text-secondary)' }}>U</div>
          </div>
        </div>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: InterfaceContainer */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8 h-[calc(100vh-64px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* BEGIN: LeftSidebar (Security Classifications) */}
          <aside className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
            <div className="bg-corthex-elevated rounded-2xl p-5 border border-corthex-border h-full">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--color-corthex-text-secondary)' }}>Security Clearance</h2>
              <nav className="space-y-2">
                {classificationButtons.map((btn) => {
                  const isActive = activeClassification === btn.key
                  const count = stats?.byClassification[btn.key] ?? 0
                  return (
                    <button
                      key={btn.key}
                      onClick={() => {
                        setActiveClassification(isActive ? null : btn.key)
                        setPage(1)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'shadow-lg'
                          : 'hover:bg-corthex-elevated group'
                      }`}
                      style={isActive ? { backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-surface)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${isActive && btn.key === 'secret' ? 'animate-pulse' : ''}`}
                          style={{ backgroundColor: CLASSIFICATION_DOT_COLORS[btn.key] }}
                        />
                        <span className="text-sm font-medium" style={isActive ? { color: 'var(--color-corthex-surface)' } : { color: 'var(--color-corthex-text-primary)' }}>{btn.label}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded" style={
                        isActive ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' } : { backgroundColor: '#f0ebe0', color: 'var(--color-corthex-text-secondary)' }
                      }>{count}</span>
                    </button>
                  )
                })}
              </nav>
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e5e1d3' }}>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-corthex-text-secondary)' }}>API Archive Context</h2>
                <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--color-corthex-bg)', borderColor: 'var(--color-corthex-border)' }}>
                  <code className="text-[10px] break-all font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>GET /api/workspace/archive</code>
                </div>
              </div>
            </div>
          </aside>
          {/* END: LeftSidebar */}

          {/* BEGIN: CenterContent (Document List) */}
          <section className="col-span-12 lg:col-span-5 xl:col-span-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-corthex-text-primary)' }}>Classified Archive</h2>
              <div className="flex gap-2">
                <input
                  className="text-sm rounded-full px-4 py-1.5 w-48 transition-all border focus:ring-1 focus:ring-corthex-accent"
                  style={{ borderColor: '#908a78', color: 'var(--color-corthex-text-primary)' }}
                  placeholder="Filter documents..."
                  type="text"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                />
              </div>
            </div>
            <div className="overflow-y-auto pr-2 space-y-4">
              {listQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl h-28 animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)', border: '1px solid #e5e1d3' }} />
                ))
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-corthex-text-secondary)' }}>아카이브된 문서가 없습니다</p>
                  <button
                    onClick={() => navigate('/hub')}
                    className="mt-3 px-4 py-2 text-xs text-white rounded-md hover:opacity-90 transition-colors"
                    style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                  >
                    허브로 이동
                  </button>
                </div>
              ) : (
                items.map((item, idx) => {
                  const isActive = detailId === item.id
                  const borderColor = CLASSIFICATION_DOT_COLORS[item.classification]
                  const isCleared = item.qualityScore != null && item.qualityScore >= 3
                  return (
                    <article
                      key={item.id}
                      onClick={() => setDetailId(item.id)}
                      className={`bg-corthex-elevated p-5 rounded-2xl border border-corthex-border border-l-4 transition-all cursor-pointer ${
                        isActive ? 'border-l-8' : 'hover:border-l-8'
                      } ${idx > 0 && !isActive ? 'opacity-80 hover:opacity-100' : ''}`}
                      style={{
                        borderLeftColor: borderColor,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {item.commandType || item.classification.toUpperCase()}
                          </span>
                          <h3 className="font-bold text-corthex-text-primary">{item.title}</h3>
                        </div>
                        <span className="text-xs text-corthex-text-secondary">{formatDate(item.createdAt)}</span>
                      </div>
                      {item.summary && (
                        <p className="text-sm text-corthex-text-secondary line-clamp-2 mb-4">{item.summary}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.agentName && (
                            <span className="text-xs text-corthex-text-secondary">{item.agentName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCleared ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                              </svg>
                              Cleared
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
                              Pending Clear
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>
          {/* END: CenterContent */}

          {/* BEGIN: RightSidebar (Document Detail View) */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-4 h-full hidden lg:block">
            <div className="bg-corthex-elevated rounded-2xl border border-corthex-border h-full flex flex-col overflow-hidden">
              {!detailId ? (
                <div className="flex-1 flex items-center justify-center text-corthex-text-secondary text-sm">
                  문서를 선택하세요
                </div>
              ) : detailQuery.isLoading || !detail ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-corthex-border border-t-slate-600 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Detail Header */}
                  <div className="p-6 border-b border-corthex-border">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CLASSIFICATION_DOT_COLORS[detail.classification] }} />
                      <span className="text-xs font-bold text-corthex-text-secondary tracking-tighter">REF: GET /api/workspace/archive/{detail.id.slice(0, 8)}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-corthex-text-primary leading-tight">{detail.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {detail.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-corthex-elevated text-corthex-text-secondary rounded-full text-xs font-medium">{tag}</span>
                      ))}
                      {detail.departmentName && (
                        <span className="px-3 py-1 bg-corthex-elevated text-corthex-text-secondary rounded-full text-xs font-medium">{detail.departmentName}</span>
                      )}
                    </div>
                  </div>

                  {/* Delegation Chain */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {detail.delegationChain.length > 0 && (
                      <>
                        <h3 className="text-xs font-bold text-corthex-text-secondary uppercase tracking-wider mb-6">Delegation Chain</h3>
                        <div className="space-y-6 relative">
                          {/* Connector Line */}
                          <div className="absolute left-5 top-2 bottom-8 w-px bg-corthex-elevated" />
                          {detail.delegationChain.map((step, i) => {
                            const initials = step.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            const bgColor = i === 0 ? 'bg-corthex-surface text-white' : i === 1 ? 'bg-corthex-elevated text-corthex-text-secondary' : 'bg-corthex-elevated text-corthex-text-secondary'
                            return (
                              <div key={i} className="flex items-start gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-xs border-4 border-white shadow-sm`}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-corthex-text-primary">{step.agentName}</p>
                                  <p className="text-xs text-corthex-text-secondary">{step.role} - {step.status}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {/* Quality Review Scores */}
                    {detail.qualityReview && (
                      <div className="mt-10">
                        <h3 className="text-xs font-bold text-corthex-text-secondary uppercase tracking-wider mb-4">Quality Review Scores</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-corthex-text-secondary">Overall Score</span>
                              <span className="text-corthex-text-primary">{(detail.qualityReview.score * 20)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-corthex-elevated rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${detail.qualityReview.score * 20}%` }} />
                            </div>
                          </div>
                          {detail.qualityReview.feedback && (
                            <p className="text-xs text-corthex-text-secondary italic">{detail.qualityReview.feedback}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content preview */}
                    {detail.content && (
                      <div className="mt-8">
                        <h3 className="text-xs font-bold text-corthex-text-secondary uppercase tracking-wider mb-4">Document Content</h3>
                        <div className="prose prose-sm max-w-none text-corthex-text-secondary">
                          <MarkdownRenderer content={detail.content} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="p-6 border-t flex gap-3" style={{ backgroundColor: '#f0ebe0', borderColor: 'var(--color-corthex-border)' }}>
                    <button
                      onClick={() => navigate(`/classified/${detail.id}`)}
                      className="flex-1 text-white text-sm font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      View Document
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(detail.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border bg-corthex-surface transition-all hover:opacity-70"
                      style={{ borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
          {/* END: RightSidebar */}
        </div>
      </main>
      {/* END: InterfaceContainer */}

      {/* Delete confirm dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-corthex-surface border rounded-2xl p-6 w-80 shadow-2xl" style={{ borderColor: 'var(--color-corthex-border)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-corthex-text-primary)' }}>문서 삭제</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-corthex-text-secondary)' }}>이 기밀문서를 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs rounded-lg border hover:opacity-70 transition-colors"
                style={{ color: 'var(--color-corthex-text-secondary)', borderColor: 'var(--color-corthex-border)' }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId)
                  setDeleteConfirmId(null)
                }}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
