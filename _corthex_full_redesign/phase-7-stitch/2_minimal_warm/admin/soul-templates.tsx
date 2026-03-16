/**
 * Soul Templates Page — Minimal Warm Theme
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
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular'>('all')
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

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 text-white flex flex-col fixed h-full z-20" style={{ backgroundColor: '#2c2c2c' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-full p-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(229,115,115,0.2)' }}>
              <span className="material-symbols-outlined" style={{ color: '#e57373' }}>eco</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>CORTHEX v2</h1>
              <p className="text-xs font-medium" style={{ color: 'rgba(229,115,115,0.7)' }}>Minimal Warm Admin</p>
            </div>
          </div>
          <nav className="space-y-1">
            <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-white shadow-lg" href="#" style={{ backgroundColor: '#e57373', boxShadow: '0 10px 15px -3px rgba(229,115,115,0.2)' }}>
              <span className="material-symbols-outlined">library_books</span>
              <span className="text-sm font-medium">Templates Library</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-medium">User Management</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">terminal</span>
              <span className="text-sm font-medium">API Logs</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <div className="mt-4 flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden"></div>
            <div className="text-xs">
              <p className="font-bold">Admin Soul</p>
              <p className="text-slate-500">Super User</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen" style={{ backgroundColor: '#fcfbf9' }}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Admin Soul Templates Library</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors">search</span>
              <input
                className="pl-10 pr-4 py-2 border-none rounded-xl text-sm w-64 transition-all"
                style={{ backgroundColor: '#fcfbf9' }}
                placeholder="Search templates..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95"
              style={{ backgroundColor: '#e57373' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(229,115,115,0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e57373')}
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              New Template
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="p-8 space-y-8">
          {/* Page Title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>Admin</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span style={{ color: '#e57373' }}>Soul Templates</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Soul Templates Library</h1>
            <p className="text-slate-500 max-w-2xl">Manage and deploy organic soul templates for cross-departmental automation. Connect your AI core with natural workflow structures.</p>
          </div>

          <div className="flex gap-8">
            {/* Left Filter Sidebar (within content area) */}
            <aside className="w-64 shrink-0 space-y-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ color: '#e57373' }}>filter_list</span>
                  Category
                </h4>
                <div className="space-y-2">
                  {['Finance', 'Marketing', 'Technical', 'HR & Ops'].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input className="rounded border-slate-300" type="checkbox" style={{ accentColor: '#e57373' }} />
                      <span className="text-sm text-slate-600 group-hover:transition-colors" style={{ ['--tw-group-hover-color' as string]: '#e57373' }}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ color: '#e57373' }}>layers</span>
                  Tier
                </h4>
                <div className="space-y-2">
                  {['Manager', 'Specialist', 'Worker'].map((tier) => (
                    <label key={tier} className="flex items-center gap-3 cursor-pointer group">
                      <input className="border-slate-300" name="tier" type="radio" style={{ accentColor: '#e57373' }} />
                      <span className="text-sm text-slate-600">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ color: '#e57373' }}>psychology</span>
                  Tool Complexity
                </h4>
                <input className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200" type="range" style={{ accentColor: '#e57373' }} />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Basic</span>
                  <span>Advanced</span>
                </div>
              </div>
              <button
                className="w-full py-2 font-bold rounded-xl text-sm transition-colors border"
                style={{ borderColor: '#e57373', color: '#e57373' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(229,115,115,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Reset Filters
              </button>
            </aside>

            {/* Content Grid */}
            <div className="flex-1">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-8">
                {[
                  { key: 'all' as const, label: 'All Templates' },
                  { key: 'recent' as const, label: 'Recently Added' },
                  { key: 'popular' as const, label: 'Most Downloaded' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="px-6 py-3 border-b-2 text-sm font-bold"
                    style={{
                      borderColor: activeTab === tab.key ? '#e57373' : 'transparent',
                      color: activeTab === tab.key ? '#e57373' : '#94a3b8',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Create form */}
              {showCreate && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>새 소울 템플릿</h3>
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
                        <label className="block text-sm font-medium text-slate-600 mb-1">템플릿 이름</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                          style={{ backgroundColor: '#fcfbf9' }}
                          placeholder="예: 친절한 상담원"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">카테고리</label>
                        <input
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                          style={{ backgroundColor: '#fcfbf9' }}
                          placeholder="예: 고객 응대"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">설명</label>
                      <input
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                        style={{ backgroundColor: '#fcfbf9' }}
                        placeholder="이 템플릿의 용도"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">소울 내용</label>
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        rows={6}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none font-mono"
                        style={{ backgroundColor: '#fcfbf9' }}
                        placeholder="에이전트의 성격과 행동 방식을 마크다운으로 정의..."
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#e57373' }}
                      >
                        {createMutation.isPending ? '생성 중...' : '생성'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Cards Grid */}
              {isLoading ? (
                <div className="text-center text-slate-500 py-12">로딩 중...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      {editTemplate?.id === t.id ? (
                        <div className="space-y-3">
                          <input
                            value={editTemplate.name}
                            onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                            style={{ backgroundColor: '#fcfbf9' }}
                          />
                          <input
                            value={editTemplate.description || ''}
                            onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                            style={{ backgroundColor: '#fcfbf9' }}
                            placeholder="설명"
                          />
                          <textarea
                            value={editTemplate.content}
                            onChange={(e) => setEditTemplate({ ...editTemplate, content: e.target.value })}
                            rows={6}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none resize-none font-mono"
                            style={{ backgroundColor: '#fcfbf9' }}
                          />
                          <div className="flex gap-3 pt-3 border-t border-slate-100">
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
                              className="text-xs font-medium transition-colors"
                              style={{ color: '#e57373' }}
                            >
                              저장
                            </button>
                            <button onClick={() => setEditTemplate(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!t.isBuiltin && (
                              <button
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: 'rgba(229,115,115,0.1)', color: '#e57373' }}
                                onClick={() => setEditTemplate(t)}
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {t.category && (
                              <span
                                className="px-2 py-1 text-[10px] font-bold uppercase rounded leading-none"
                                style={{ backgroundColor: 'rgba(229,115,115,0.1)', color: '#e57373' }}
                              >
                                {t.category}
                              </span>
                            )}
                            {t.isBuiltin && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded leading-none">
                                Built-in
                              </span>
                            )}
                            {t.isPublished && (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded leading-none">
                                공개
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2 transition-colors" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
                            {t.name}
                          </h3>
                          {t.description && (
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{t.description}</p>
                          )}
                          <pre className="text-xs text-slate-400 whitespace-pre-wrap line-clamp-3 mb-4 font-mono leading-relaxed">
                            {preview(t.content)}
                          </pre>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">construction</span>
                                <span className="text-xs font-bold">{t.content.split('\n').length}</span>
                              </div>
                              {t.downloadCount !== undefined && (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                                  <span className="text-xs font-bold">{t.downloadCount}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setViewContent(t)}
                                className="font-bold text-sm flex items-center gap-1"
                                style={{ color: '#e57373' }}
                              >
                                Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </button>
                              {!t.isBuiltin && (
                                <button
                                  onClick={() => setDeleteTarget(t)}
                                  className="text-xs text-red-400 hover:text-red-500 transition-colors font-medium"
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

                  {/* Empty Card Placeholder */}
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer transition-colors"
                    onClick={() => setShowCreate(true)}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(229,115,115,0.5)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-opacity-80 transition-colors" style={{ ['--group-hover-bg' as string]: 'rgba(229,115,115,0.1)' }}>
                      <span className="material-symbols-outlined text-slate-400">add</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">Add Custom Template</p>
                      <p className="text-xs text-slate-400">Click to create a new soul profile</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-12 flex items-center justify-center gap-4">
                <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl text-white font-bold" style={{ backgroundColor: '#e57373' }}>1</button>
                  <button className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold">2</button>
                  <button className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold">3</button>
                  <span className="px-2 py-2 text-slate-400">...</span>
                  <button className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 font-bold">12</button>
                </div>
                <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Marketplace publish management section */}
        {companyTemplates.length > 0 && (
          <div className="mx-8 mb-8 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>마켓 공개 관리</h3>
            <p className="text-sm text-slate-500 mb-4">회사 소울 템플릿을 에이전트 마켓에 공개하거나 비공개 처리할 수 있습니다.</p>
            <div className="space-y-2">
              {companyTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-100"
                  style={{ backgroundColor: '#fcfbf9' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-800">{t.name}</span>
                    {t.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {t.category}
                      </span>
                    )}
                    {t.isPublished && (
                      <span className="text-xs text-slate-500">
                        다운로드 {t.downloadCount || 0}회
                      </span>
                    )}
                  </div>
                  {t.isPublished ? (
                    <button
                      onClick={() => unpublishMutation.mutate(t.id)}
                      disabled={unpublishMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      비공개
                    </button>
                  ) : (
                    <button
                      onClick={() => setPublishConfirmId(t.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      마켓 공개
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Stats Bar */}
        <footer className="mt-auto bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Online</span>
            </div>
            <div className="text-xs text-slate-400">
              GET /api/admin/soul-templates <span className="text-slate-300 ml-2">200 OK</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            &copy; 2024 CORTHEX v2. All Rights Reserved.
          </div>
        </footer>
      </div>

      {/* View content modal */}
      {viewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewContent(null)}>
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
                {viewContent.name}
                {viewContent.isBuiltin && (
                  <svg className="w-4 h-4 inline-block ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </h3>
              <button onClick={() => setViewContent(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {viewContent.description && (
              <p className="text-sm text-slate-500 mb-3">{viewContent.description}</p>
            )}
            <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono rounded-lg p-4 border border-slate-200" style={{ backgroundColor: '#fcfbf9' }}>
              {viewContent.content}
            </pre>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>템플릿 삭제</h3>
            <p className="text-sm text-slate-500 mb-4">
              &quot;{deleteTarget.name}&quot; 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish confirmation modal */}
      {publishConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPublishConfirmId(null)}>
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>마켓 공개 확인</h3>
            <p className="text-sm text-slate-500 mb-4">
              이 소울 템플릿을 에이전트 마켓에 공개하시겠습니까? 공개 후 다른 회사에서 이 템플릿을 검색하고 가져갈 수 있습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPublishConfirmId(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => publishMutation.mutate(publishConfirmId)}
                disabled={publishMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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
