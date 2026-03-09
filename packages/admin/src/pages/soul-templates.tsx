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
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-testid="soul-templates-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">소울 템플릿</h1>
          <p className="text-sm text-slate-400 mt-1">{templates.length}개 템플릿</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          + 새 템플릿
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5" data-testid="soul-create-form">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">새 소울 템플릿</h3>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">템플릿 이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  placeholder="예: 친절한 상담원"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">카테고리</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  placeholder="예: 고객 응대"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">설명</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
                placeholder="이 템플릿의 용도"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">소울 내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none font-mono"
                placeholder="에이전트의 성격과 행동 방식을 마크다운으로 정의..."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              data-testid={`soul-card-${t.id}`}
              className={`bg-slate-800/50 rounded-xl p-5 ${editTemplate?.id === t.id ? 'border border-blue-500/30' : 'border border-slate-700'}`}
            >
              {editTemplate?.id === t.id ? (
                <div className="space-y-3">
                  <input
                    value={editTemplate.name}
                    onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    value={editTemplate.description || ''}
                    onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                    placeholder="설명"
                  />
                  <textarea
                    value={editTemplate.content}
                    onChange={(e) => setEditTemplate({ ...editTemplate, content: e.target.value })}
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none font-mono"
                  />
                  <div className="flex gap-3 pt-3 border-t border-slate-700/50">
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
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      저장
                    </button>
                    <button onClick={() => setEditTemplate(null)} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-50">{t.name}</h3>
                        {t.isBuiltin && (
                          <span className="text-slate-500" title="Built-in template">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        )}
                        {t.isPublished && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            공개
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-sm text-slate-400 mt-0.5">{t.description}</p>
                      )}
                    </div>
                    {t.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                        {t.category}
                      </span>
                    )}
                  </div>
                  <pre className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-3 mb-3 font-mono leading-relaxed">{preview(t.content)}</pre>
                  <div className="flex gap-3 pt-3 border-t border-slate-700/50">
                    <button
                      onClick={() => setViewContent(t)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      내용 보기
                    </button>
                    {!t.isBuiltin && (
                      <>
                        <button
                          onClick={() => setEditTemplate(t)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Marketplace publish management section */}
      {companyTemplates.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-50 mb-2">마켓 공개 관리</h3>
          <p className="text-sm text-slate-400 mb-4">회사 소울 템플릿을 에이전트 마켓에 공개하거나 비공개 처리할 수 있습니다.</p>
          <div className="space-y-2">
            {companyTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-50">{t.name}</span>
                  {t.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
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
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
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

      {/* View content modal */}
      {viewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewContent(null)}>
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-50">
                {viewContent.name}
                {viewContent.isBuiltin && (
                  <svg className="w-4 h-4 inline-block ml-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </h3>
              <button onClick={() => setViewContent(null)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {viewContent.description && (
              <p className="text-sm text-slate-400 mb-3">{viewContent.description}</p>
            )}
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900 rounded-lg p-4 border border-slate-700">
              {viewContent.content}
            </pre>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div
            data-testid="soul-delete-modal"
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-50 mb-2">템플릿 삭제</h3>
            <p className="text-sm text-slate-400 mb-4">
              "{deleteTarget.name}" 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
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
            data-testid="soul-publish-modal"
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-50 mb-2">마켓 공개 확인</h3>
            <p className="text-sm text-slate-400 mb-4">
              이 소울 템플릿을 에이전트 마켓에 공개하시겠습니까? 공개 후 다른 회사에서 이 템플릿을 검색하고 가져갈 수 있습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPublishConfirmId(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
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
