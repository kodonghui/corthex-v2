/**
 * Soul Templates Page
 *
 * API Endpoints:
 *   GET    /api/admin/soul-templates?companyId=...
 *   POST   /api/admin/soul-templates
 *   PATCH  /api/admin/soul-templates/:id
 *   DELETE /api/admin/soul-templates/:id
 *   POST   /api/admin/soul-templates/:id/publish
 *   POST   /api/admin/soul-templates/:id/unpublish
 */
import { useState } from 'react'
import { Search, PlusCircle, Filter, Layers, Brain, Pencil, Wrench, Download, ArrowRight, Plus, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type SoulTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  content: string
  category: string | null
  isBuiltin: boolean
  isActive: boolean
  isPublished?: boolean
  publishedAt?: string | null
  downloadCount?: number
  createdAt: string
  updatedAt: string
}

export function SoulTemplatesPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [showCreate, setShowCreate] = useState(false)
  const [editTemplate, setEditTemplate] = useState<SoulTemplate | null>(null)
  const [viewContent, setViewContent] = useState<SoulTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SoulTemplate | null>(null)
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', content: '', category: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['soul-templates', selectedCompanyId],
    queryFn: () => api.get<{ data: SoulTemplate[] }>(`/admin/soul-templates?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const templates = data?.data || []
  const companyTemplates = templates.filter((t) => t.companyId === selectedCompanyId)

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/soul-templates', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      setShowCreate(false)
      setForm({ name: '', description: '', content: '', category: '' })
      addToast({ type: 'success', message: '소울 템플릿이 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      api.patch(`/admin/soul-templates/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      setEditTemplate(null)
      addToast({ type: 'success', message: '소울 템플릿이 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/soul-templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      setDeleteTarget(null)
      addToast({ type: 'success', message: '소울 템플릿이 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/soul-templates/${id}/publish`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      setPublishConfirmId(null)
      addToast({ type: 'success', message: '에이전트 마켓에 공개되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/soul-templates/${id}/unpublish`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soul-templates'] })
      addToast({ type: 'success', message: '마켓에서 비공개 처리되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const preview = (content: string) => {
    const lines = content.split('\n').slice(0, 3).join('\n')
    return lines.length < content.length ? lines + '...' : lines
  }

  if (!selectedCompanyId) return <div className="p-8 text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">회사를 선택하세요</div>

  return (
    <div className="flex-1 flex flex-col">
      {/* Topbar */}
      <div className="bg-corthex-surface border-b border-corthex-border px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
          <h1 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">
            Soul Templates Library
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
            <input
              className="pl-9 pr-4 py-2 bg-corthex-elevated border border-corthex-border text-corthex-text-primary font-mono text-base sm:text-xs w-full sm:w-56 focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none placeholder:text-corthex-text-disabled min-h-[44px]"
              placeholder="SEARCH TEMPLATES..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover flex items-center gap-1.5 transition-colors min-h-[44px] whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Template
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Filter Sidebar — hidden on mobile */}
        <aside className="hidden lg:block w-56 shrink-0 bg-corthex-surface border-r border-corthex-border p-5 space-y-6 overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-3 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-corthex-accent" />
              Category
            </h4>
            <div className="space-y-2">
              {['Finance', 'Marketing', 'Technical', 'HR & Ops'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                  <input className="border-corthex-border accent-corthex-accent" type="checkbox" />
                  <span className="text-xs font-mono text-corthex-text-secondary">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-corthex-accent" />
              Tier
            </h4>
            <div className="space-y-2">
              {['Manager', 'Specialist', 'Worker'].map((tier) => (
                <label key={tier} className="flex items-center gap-2.5 cursor-pointer">
                  <input className="border-corthex-border accent-corthex-accent" name="tier" type="radio" />
                  <span className="text-xs font-mono text-corthex-text-secondary">{tier}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-corthex-accent" />
              Tool Complexity
            </h4>
            <input
              className="w-full h-1.5 appearance-none cursor-pointer bg-corthex-elevated accent-corthex-accent"
              type="range"
            />
            <div className="flex justify-between mt-2 text-[10px] font-mono text-corthex-text-disabled uppercase tracking-widest">
              <span>Basic</span>
              <span>Advanced</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Section header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-corthex-accent">All Templates</span>
            <span className="text-xs font-mono text-corthex-text-disabled">({templates.length})</span>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="bg-corthex-surface border border-corthex-border p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">새 소울 템플릿</h3>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  createMutation.mutate({
                    companyId: selectedCompanyId,
                    name: form.name,
                    description: form.description || null,
                    content: form.content,
                    category: form.category || null,
                  })
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">템플릿 이름</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-base sm:text-xs font-mono text-corthex-text-primary placeholder:text-corthex-text-disabled focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none min-h-[44px]"
                      placeholder="예: 친절한 상담원"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">카테고리</label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-base sm:text-xs font-mono text-corthex-text-primary placeholder:text-corthex-text-disabled focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none min-h-[44px]"
                      placeholder="예: 고객 응대"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">설명</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-base sm:text-xs font-mono text-corthex-text-primary placeholder:text-corthex-text-disabled focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none min-h-[44px]"
                    placeholder="이 템플릿의 용도"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">소울 내용</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={6}
                    className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-base sm:text-xs font-mono text-corthex-text-primary placeholder:text-corthex-text-disabled focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none resize-none"
                    placeholder="에이전트의 성격과 행동 방식을 마크다운으로 정의..."
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-corthex-border">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors min-h-[44px]">
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-40 transition-colors min-h-[44px]"
                  >
                    {createMutation.isPending ? '생성 중...' : '생성'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cards Grid */}
          {isLoading ? (
            <div className="text-center text-xs font-mono text-corthex-text-disabled uppercase tracking-widest py-12 animate-pulse">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates
                .filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((t) => (
                  <div
                    key={t.id}
                    className="bg-corthex-surface border border-corthex-border p-5 hover:border-corthex-border-strong transition-colors group relative overflow-hidden"
                  >
                    {editTemplate?.id === t.id ? (
                      <div className="space-y-3">
                        <input
                          value={editTemplate.name}
                          onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                          className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
                        />
                        <input
                          value={editTemplate.description || ''}
                          onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                          className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
                          placeholder="설명"
                        />
                        <textarea
                          value={editTemplate.content}
                          onChange={(e) => setEditTemplate({ ...editTemplate, content: e.target.value })}
                          rows={6}
                          className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none resize-none"
                        />
                        <div className="flex gap-3 pt-3 border-t border-corthex-border">
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: t.id,
                                name: editTemplate.name,
                                description: editTemplate.description,
                                content: editTemplate.content,
                                category: editTemplate.category,
                              })
                            }
                            className="text-xs font-bold uppercase tracking-widest text-corthex-accent hover:text-corthex-accent-hover transition-colors"
                          >
                            저장
                          </button>
                          <button onClick={() => setEditTemplate(null)} className="text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!t.isBuiltin && (
                            <button
                              className="p-1.5 bg-corthex-accent-muted border border-corthex-border text-corthex-accent hover:bg-corthex-accent hover:text-corthex-text-on-accent transition-colors"
                              onClick={() => setEditTemplate(t)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {t.category && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-corthex-accent-muted text-corthex-accent border border-corthex-border leading-none">
                              {t.category}
                            </span>
                          )}
                          {t.isBuiltin && (
                            <span className="px-1.5 py-0.5 bg-corthex-elevated text-corthex-text-secondary text-[10px] font-bold uppercase tracking-widest border border-corthex-border leading-none">
                              Built-in
                            </span>
                          )}
                          {t.isPublished && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 leading-none">
                              공개
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary mb-1.5">
                          {t.name}
                        </h3>
                        {t.description && (
                          <p className="text-xs font-mono text-corthex-text-secondary mb-4 line-clamp-2">{t.description}</p>
                        )}
                        <pre className="text-xs text-corthex-text-disabled whitespace-pre-wrap line-clamp-3 mb-4 font-mono leading-relaxed">
                          {preview(t.content)}
                        </pre>
                        <div className="flex items-center justify-between pt-4 border-t border-corthex-border">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-corthex-text-disabled">
                              <Wrench className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold font-mono">{t.content.split('\n').length}</span>
                            </div>
                            {t.downloadCount !== undefined && (
                              <div className="flex items-center gap-1.5 text-corthex-text-disabled">
                                <Download className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold font-mono">{t.downloadCount}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 items-center">
                            <button
                              onClick={() => setViewContent(t)}
                              className="text-xs font-bold uppercase tracking-widest text-corthex-accent hover:text-corthex-accent-hover flex items-center gap-1 transition-colors"
                            >
                              Details <ArrowRight className="w-3.5 h-3.5 inline" />
                            </button>
                            {!t.isBuiltin && (
                              <button
                                onClick={() => setDeleteTarget(t)}
                                className="text-xs font-mono text-corthex-error hover:text-red-400 transition-colors"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

              {/* Add Custom Template card */}
              <button
                className="bg-corthex-elevated border-2 border-dashed border-corthex-border p-6 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:border-corthex-border-strong transition-colors"
                onClick={() => setShowCreate(true)}
              >
                <div className="w-10 h-10 bg-corthex-surface border border-corthex-border flex items-center justify-center">
                  <Plus className="w-4 h-4 text-corthex-text-disabled" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Add Custom Template</p>
                  <p className="text-xs font-mono text-corthex-text-disabled mt-0.5">Click to create a new soul profile</p>
                </div>
              </button>
            </div>
          )}

          {/* Marketplace publish management */}
          {companyTemplates.length > 0 && (
            <section className="bg-corthex-surface border border-corthex-border p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">마켓 공개 관리</h3>
              </div>
              <p className="text-xs font-mono text-corthex-text-disabled">
                회사 소울 템플릿을 에이전트 마켓에 공개하거나 비공개 처리할 수 있습니다.
              </p>
              <div className="space-y-2">
                {companyTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 bg-corthex-elevated border border-corthex-border"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{t.name}</span>
                      {t.category && (
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-corthex-surface border border-corthex-border text-corthex-text-secondary">
                          {t.category}
                        </span>
                      )}
                      {t.isPublished && (
                        <span className="text-xs font-mono text-corthex-text-disabled">
                          다운로드 {t.downloadCount || 0}회
                        </span>
                      )}
                    </div>
                    {t.isPublished ? (
                      <button
                        onClick={() => unpublishMutation.mutate(t.id)}
                        disabled={unpublishMutation.isPending}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated disabled:opacity-50 transition-colors min-h-[44px]"
                      >
                        비공개
                      </button>
                    ) : (
                      <button
                        onClick={() => setPublishConfirmId(t.id)}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors min-h-[44px]"
                      >
                        마켓 공개
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-corthex-surface border-t border-corthex-border px-4 lg:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-corthex-success"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-disabled">API Online</span>
          </div>
          <span className="text-xs font-mono text-corthex-text-disabled">GET /api/admin/soul-templates</span>
        </div>
        <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
          DISPLAYING {templates.length} RECORDS
        </p>
      </div>

      {/* View content modal */}
      {viewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setViewContent(null)}>
          <div
            className="bg-corthex-surface border border-corthex-border shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary">
                  {viewContent.name}
                </h3>
                {viewContent.isBuiltin && (
                  <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">Built-in</span>
                )}
              </div>
              <button onClick={() => setViewContent(null)} className="text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {viewContent.description && (
              <p className="text-xs font-mono text-corthex-text-secondary mb-3">{viewContent.description}</p>
            )}
            <pre className="text-xs text-corthex-text-secondary whitespace-pre-wrap font-mono leading-relaxed p-4 bg-corthex-bg border border-corthex-border">
              {viewContent.content}
            </pre>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-corthex-surface border border-corthex-border shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary mb-2">템플릿 삭제</h3>
            <p className="text-xs font-mono text-corthex-text-secondary mb-4">
              &quot;{deleteTarget.name}&quot; 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.
            </p>
            <div className="flex gap-2 justify-end pt-4 border-t border-corthex-border">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-error text-corthex-text-on-accent hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish confirmation modal */}
      {publishConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPublishConfirmId(null)}>
          <div
            className="bg-corthex-surface border border-corthex-border shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary mb-2">마켓 공개 확인</h3>
            <p className="text-xs font-mono text-corthex-text-secondary mb-4">
              이 소울 템플릿을 에이전트 마켓에 공개하시겠습니까? 공개 후 다른 회사에서 이 템플릿을 검색하고 가져갈 수 있습니다.
            </p>
            <div className="flex gap-2 justify-end pt-4 border-t border-corthex-border">
              <button
                onClick={() => setPublishConfirmId(null)}
                className="px-4 py-2 text-xs font-mono text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => publishMutation.mutate(publishConfirmId)}
                disabled={publishMutation.isPending}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                {publishMutation.isPending ? '공개 중...' : '공개'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
