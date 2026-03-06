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
  const [form, setForm] = useState({ name: '', description: '', content: '', category: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['soul-templates', selectedCompanyId],
    queryFn: () => api.get<{ data: SoulTemplate[] }>(`/admin/soul-templates?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const templates = data?.data || []

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

  const preview = (content: string) => {
    const lines = content.split('\n').slice(0, 3).join('\n')
    return lines.length < content.length ? lines + '...' : lines
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">소울 템플릿</h1>
          <p className="text-sm text-zinc-500 mt-1">{templates.length}개 템플릿</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 새 템플릿
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 소울 템플릿</h3>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">템플릿 이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="예: 친절한 상담원"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">카테고리</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="예: 고객 응대"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">설명</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="이 템플릿의 용도"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">소울 내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
                placeholder="에이전트의 성격과 행동 방식을 마크다운으로 정의..."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-zinc-600">
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              {editTemplate?.id === t.id ? (
                <div className="space-y-3">
                  <input
                    value={editTemplate.name}
                    onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    value={editTemplate.description || ''}
                    onChange={(e) => setEditTemplate({ ...editTemplate, description: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                    placeholder="설명"
                  />
                  <textarea
                    value={editTemplate.content}
                    onChange={(e) => setEditTemplate({ ...editTemplate, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 resize-none font-mono"
                  />
                  <div className="flex gap-2">
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
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      저장
                    </button>
                    <button onClick={() => setEditTemplate(null)} className="text-xs text-zinc-500">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</h3>
                        {t.isBuiltin && (
                          <span className="text-xs text-zinc-400" title="Built-in template">
                            🔒
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-sm text-zinc-500 mt-0.5">{t.description}</p>
                      )}
                    </div>
                    {t.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {t.category}
                      </span>
                    )}
                  </div>
                  <pre className="text-xs text-zinc-500 whitespace-pre-wrap line-clamp-3 mb-3 font-mono">{preview(t.content)}</pre>
                  <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => setViewContent(t)}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      내용 보기
                    </button>
                    {!t.isBuiltin && (
                      <>
                        <button
                          onClick={() => setEditTemplate(t)}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="text-xs text-red-600 hover:text-red-700"
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

      {/* View content modal */}
      {viewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewContent(null)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {viewContent.name} {viewContent.isBuiltin && '🔒'}
              </h3>
              <button onClick={() => setViewContent(null)} className="text-zinc-500 hover:text-zinc-700 text-lg">
                ✕
              </button>
            </div>
            {viewContent.description && (
              <p className="text-sm text-zinc-500 mb-3">{viewContent.description}</p>
            )}
            <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
              {viewContent.content}
            </pre>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">템플릿 삭제</h3>
            <p className="text-sm text-zinc-500 mb-4">
              "{deleteTarget.name}" 템플릿을 삭제하시겠습니까? 이미 적용된 에이전트 소울에는 영향이 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-zinc-600"
              >
                취소
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
