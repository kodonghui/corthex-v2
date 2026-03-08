import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth-store'
import { Select, Textarea } from '@corthex/ui'
import { StatusStepper } from './status-stepper'
import type { SnsContent, SnsAccount, Agent, SnsMetrics, SnsAbResult } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, PLATFORM_OPTIONS } from './sns-types'

interface ContentTabProps {
  accounts: SnsAccount[]
  agents: Agent[]
}

export function ContentTab({ accounts, agents }: ContentTabProps) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [form, setForm] = useState({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '', snsAccountId: '' })
  const [aiForm, setAiForm] = useState({ platform: 'instagram', agentId: '', topic: '', imagePrompt: '' })
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual')
  const [showOnlyOriginals, setShowOnlyOriginals] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [variantStrategy, setVariantStrategy] = useState('mixed')
  const [variantCount, setVariantCount] = useState(3)
  const [metricsForm, setMetricsForm] = useState({ views: 0, likes: 0, shares: 0, clicks: 0 })
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [showAbResults, setShowAbResults] = useState(false)
  const [showImagePrompt, setShowImagePrompt] = useState(false)
  const [imagePromptInput, setImagePromptInput] = useState('')

  const { data: listData } = useQuery({
    queryKey: ['sns', showOnlyOriginals ? 'root' : 'all'],
    queryFn: () => api.get<{ data: SnsContent[] }>(`/workspace/sns${showOnlyOriginals ? '?variantOf=root' : ''}`),
  })

  const { data: detailData } = useQuery({
    queryKey: ['sns', selectedId],
    queryFn: () => api.get<{ data: SnsContent }>(`/workspace/sns/${selectedId}`),
    enabled: !!selectedId,
  })

  const { data: abResultsData } = useQuery({
    queryKey: ['sns-ab', selectedId],
    queryFn: () => api.get<{ data: SnsAbResult }>(`/workspace/sns/${selectedId}/ab-results`),
    enabled: showAbResults && !!selectedId,
  })

  const createManual = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = { ...data, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined, snsAccountId: data.snsAccountId || undefined }
      return api.post<{ data: SnsContent }>('/workspace/sns', payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const generateAi = useMutation({
    mutationFn: (data: typeof aiForm) => api.post<{ data: SnsContent }>('/workspace/sns/generate-with-image', { ...data, imagePrompt: data.imagePrompt || undefined }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const submitForApproval = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/submit`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }) },
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/approve`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }) },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/workspace/sns/${id}/reject`, { reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); setRejectReason('') },
  })

  const publish = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/engine-publish`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }) },
  })

  const cancelSchedule = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/cancel-schedule`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }) },
  })

  const deleteSns = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sns/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); setView('list') },
  })

  const generateImage = useMutation({
    mutationFn: ({ id, imagePrompt }: { id: string; imagePrompt: string }) => api.post(`/workspace/sns/${id}/generate-image`, { imagePrompt }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); setShowImagePrompt(false); setImagePromptInput('') },
  })

  const createVariant = useMutation({
    mutationFn: ({ id }: { id: string }) => api.post(`/workspace/sns/${id}/create-variant`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }) },
  })

  const generateVariants = useMutation({
    mutationFn: ({ id, count, strategy, agentId }: { id: string; count: number; strategy: string; agentId: string }) =>
      api.post(`/workspace/sns/${id}/generate-variants`, { count, strategy, agentId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); setShowVariantModal(false) },
  })

  const updateMetrics = useMutation({
    mutationFn: ({ id, ...metrics }: { id: string; views: number; likes: number; shares: number; clicks: number }) =>
      api.put(`/workspace/sns/${id}/metrics`, metrics),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); setShowMetricsForm(false) },
  })

  const list = listData?.data || []
  const detail = detailData?.data
  const filteredList = accountFilter ? list.filter((i) => i.snsAccountId === accountFilter) : list

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-3 items-center flex-wrap">
            {accounts.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500">계정:</span>
                <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800">
                  <option value="">전체</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountName} ({PLATFORM_LABELS[a.platform] || a.platform})</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer">
              <input type="checkbox" checked={showOnlyOriginals} onChange={(e) => setShowOnlyOriginals(e.target.checked)} className="rounded border-zinc-300" />
              원본만 보기
            </label>
            <div className="flex gap-1 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
              <button onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}>
                목록
              </button>
              <button onClick={() => setViewMode('gallery')}
                className={`px-2 py-1 text-xs ${viewMode === 'gallery' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}>
                갤러리
              </button>
            </div>
          </div>
          <button
            onClick={() => { setView('create'); setForm({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '', snsAccountId: '' }) }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
            + 새 콘텐츠
          </button>
        </div>

        {filteredList.length === 0 && <p className="text-sm text-zinc-500 py-8 text-center">아직 SNS 콘텐츠가 없습니다. 새 콘텐츠를 만들어보세요!</p>}

        {/* Gallery view */}
        {viewMode === 'gallery' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredList.filter((i) => i.imageUrl).map((item) => (
              <div key={item.id}
                onClick={() => { setSelectedId(item.id); setView('detail') }}
                className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-indigo-400">
                <img src={item.imageUrl!} alt={item.title} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-white/70">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  </div>
                </div>
                <div className="absolute top-1.5 right-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && filteredList.map((item) => (
          <div key={item.id}
            onClick={() => { setSelectedId(item.id); setView('detail') }}
            className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                {item.accountName && <span className="text-xs text-indigo-500">@{item.accountName}</span>}
                {item.variantOf && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">변형</span>}
                {item.isCardNews && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">카드뉴스</span>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
            </div>
            <h3 className="font-medium text-sm">{item.title}</h3>
            <p className="text-xs text-zinc-500 mt-1">{item.creatorName} · {new Date(item.createdAt).toLocaleDateString('ko')}</p>
          </div>
        ))}
      </div>
    )
  }

  // --- CREATE VIEW ---
  if (view === 'create') {
    return (
      <div className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← 목록으로</button>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setCreateMode('manual')}
            className={`px-3 py-1 text-sm rounded ${createMode === 'manual' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}>
            직접 작성
          </button>
          <button onClick={() => setCreateMode('ai')}
            className={`px-3 py-1 text-sm rounded ${createMode === 'ai' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}>
            AI 생성
          </button>
        </div>

        {createMode === 'manual' && (
          <>
            <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
              options={PLATFORM_OPTIONS} />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="본문 내용" rows={6} />
            <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              placeholder="해시태그 (#태그1 #태그2)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">예약 발행 (선택)</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            </div>
            {accounts.length > 0 && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">발행 계정 (선택)</label>
                <select value={form.snsAccountId} onChange={(e) => setForm({ ...form, snsAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm">
                  <option value="">계정 미선택</option>
                  {accounts.filter((a) => a.platform === form.platform).map((a) => (
                    <option key={a.id} value={a.id}>{a.accountName} ({a.accountId})</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={() => createManual.mutate(form)} disabled={!form.title || !form.body || createManual.isPending}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {createManual.isPending ? '생성 중...' : '콘텐츠 저장'}
            </button>
          </>
        )}

        {createMode === 'ai' && (
          <>
            <Select value={aiForm.platform} onChange={(e) => setAiForm({ ...aiForm, platform: e.target.value })}
              options={PLATFORM_OPTIONS} />
            <Select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
              placeholder="에이전트 선택" options={agents.map((a) => ({ value: a.id, label: a.name }))} />
            <input value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
              placeholder="주제 (예: AI 자동화 마케팅 트렌드)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">이미지 설명 (선택)</label>
              <input value={aiForm.imagePrompt} onChange={(e) => setAiForm({ ...aiForm, imagePrompt: e.target.value })}
                placeholder="AI가 생성할 이미지 설명" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            </div>
            <button onClick={() => generateAi.mutate(aiForm)} disabled={!aiForm.agentId || !aiForm.topic || generateAi.isPending}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {generateAi.isPending ? 'AI 생성 중...' : 'AI로 콘텐츠 생성'}
            </button>
          </>
        )}
      </div>
    )
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && detail) {
    return (
      <div className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← 목록으로</button>

        <StatusStepper status={detail.status} createdAt={detail.createdAt} reviewedAt={detail.reviewedAt} scheduledAt={detail.scheduledAt} publishedAt={detail.publishedAt} />

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-zinc-500">{PLATFORM_LABELS[detail.platform] || detail.platform}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[detail.status]}`}>{STATUS_LABELS[detail.status]}</span>
        </div>

        <h3 className="text-lg font-semibold">{detail.title}</h3>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">{detail.body}</div>

        {detail.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <img src={detail.imageUrl} alt={detail.title} className="w-full max-h-96 object-cover" />
          </div>
        )}

        {detail.hashtags && <p className="text-sm text-indigo-600 dark:text-indigo-400">{detail.hashtags}</p>}
        {detail.rejectReason && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">반려 사유: {detail.rejectReason}</p>
          </div>
        )}
        {detail.publishedUrl && <a href={detail.publishedUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline block">발행된 URL: {detail.publishedUrl}</a>}
        {detail.publishError && <p className="text-sm text-red-600">발행 오류: {detail.publishError}</p>}
        {detail.scheduledAt && <p className="text-sm text-blue-600 dark:text-blue-400">예약 시간: {new Date(detail.scheduledAt).toLocaleString('ko')}</p>}

        <p className="text-xs text-zinc-500">
          작성: {detail.creatorName} · {new Date(detail.createdAt).toLocaleString('ko')}
          {detail.accountName && <> · 계정: <span className="text-indigo-500">@{detail.accountName}</span></>}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2 flex-wrap">
          {(detail.status === 'draft' || detail.status === 'rejected') && (
            <button onClick={() => submitForApproval.mutate(detail.id)} className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">승인 요청</button>
          )}
          {detail.status === 'pending' && user?.role === 'admin' && (
            <>
              <button onClick={() => approve.mutate(detail.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">승인</button>
              <div className="flex gap-1">
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="반려 사유"
                  className="px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
                <button onClick={() => reject.mutate({ id: detail.id, reason: rejectReason })} disabled={!rejectReason}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50">반려</button>
              </div>
            </>
          )}
          {detail.status === 'approved' && (
            <button onClick={() => publish.mutate(detail.id)} disabled={publish.isPending}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {publish.isPending ? '발행 중...' : '발행하기'}
            </button>
          )}
          {detail.status === 'scheduled' && (
            <button onClick={() => cancelSchedule.mutate(detail.id)} disabled={cancelSchedule.isPending}
              className="px-3 py-1.5 border border-blue-300 text-blue-600 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50">
              {cancelSchedule.isPending ? '취소 중...' : '예약 취소'}
            </button>
          )}
          {(detail.status === 'draft' || detail.status === 'rejected') && !showImagePrompt && (
            <button onClick={() => setShowImagePrompt(true)} className="px-3 py-1.5 border border-purple-300 text-purple-600 text-sm rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30">이미지 생성</button>
          )}
          {detail.status === 'draft' && (
            <button onClick={() => deleteSns.mutate(detail.id)} className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">삭제</button>
          )}
        </div>

        {showImagePrompt && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">이미지 설명</label>
              <input value={imagePromptInput} onChange={(e) => setImagePromptInput(e.target.value)} placeholder="AI가 생성할 이미지를 설명하세요"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            </div>
            <button onClick={() => generateImage.mutate({ id: detail.id, imagePrompt: imagePromptInput })} disabled={!imagePromptInput || generateImage.isPending}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50">
              {generateImage.isPending ? '생성 중...' : '생성'}
            </button>
            <button onClick={() => { setShowImagePrompt(false); setImagePromptInput('') }} className="px-3 py-2 text-zinc-500 text-sm hover:text-zinc-700">취소</button>
          </div>
        )}

        {/* A/B Test Section */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">A/B 테스트</h4>
            <div className="flex gap-2">
              <button onClick={() => createVariant.mutate({ id: detail.id })} disabled={createVariant.isPending}
                className="px-2 py-1 text-xs border border-purple-300 text-purple-600 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-50">
                {createVariant.isPending ? '생성 중...' : '변형 복제'}
              </button>
              <button onClick={() => setShowVariantModal(true)} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">AI 변형 생성</button>
              <button onClick={() => { setShowMetricsForm(!showMetricsForm); const m = (detail.metadata as Record<string, unknown>)?.metrics as SnsMetrics | undefined; if (m) setMetricsForm({ views: m.views, likes: m.likes, shares: m.shares, clicks: m.clicks }) }}
                className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">성과 입력</button>
              {(detail.variants?.length ?? 0) > 0 && (
                <button onClick={() => setShowAbResults(!showAbResults)}
                  className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/30">
                  {showAbResults ? '결과 닫기' : '결과 비교'}
                </button>
              )}
            </div>
          </div>

          {showMetricsForm && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {(['views', 'likes', 'shares', 'clicks'] as const).map((key) => (
                  <div key={key}>
                    <label className="block text-xs text-zinc-500 mb-1">{{ views: '조회', likes: '좋아요', shares: '공유', clicks: '클릭' }[key]}</label>
                    <input type="number" min={0} value={metricsForm[key]}
                      onChange={(e) => setMetricsForm({ ...metricsForm, [key]: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-900" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowMetricsForm(false)} className="px-2 py-1 text-xs text-zinc-500">취소</button>
                <button onClick={() => updateMetrics.mutate({ id: detail.id, ...metricsForm })} disabled={updateMetrics.isPending}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {updateMetrics.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}

          {detail.variants && detail.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">변형 {detail.variants.length}개</p>
              {detail.variants.map((v) => (
                <div key={v.id} onClick={() => { setSelectedId(v.id); setShowAbResults(false); setShowMetricsForm(false) }}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mr-2">변형</span>
                    <span className="text-sm">{v.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
                </div>
              ))}
            </div>
          )}

          {showAbResults && abResultsData?.data && (() => {
            const ab = abResultsData.data
            return (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2">
                <h5 className="text-xs font-semibold text-zinc-500">A/B 테스트 결과</h5>
                <div className="space-y-1">
                  {ab.scores.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-2 rounded text-sm ${ab.winner?.id === s.id ? 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : ''}`}>
                      <div className="flex items-center gap-2">
                        {ab.winner?.id === s.id && <span className="text-xs text-green-600 font-bold">WINNER</span>}
                        <span className="truncate max-w-[200px]">{s.title}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-zinc-500">
                        {s.metrics ? (
                          <>
                            <span>조회 {s.metrics.views}</span><span>좋아요 {s.metrics.likes}</span>
                            <span>공유 {s.metrics.shares}</span><span>클릭 {s.metrics.clicks}</span>
                            <span className="font-bold text-indigo-600">점수 {s.score}</span>
                          </>
                        ) : <span className="text-zinc-400">성과 미입력</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Variant Modal */}
        {showVariantModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVariantModal(false)}>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-semibold">AI A/B 변형 생성</h4>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">변형 수 ({variantCount}개)</label>
                <input type="range" min={2} max={5} value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value))} className="w-full" />
              </div>
              <Select value={variantStrategy} onChange={(e) => setVariantStrategy(e.target.value)}
                options={[{ value: 'tone', label: '어조 변경' }, { value: 'length', label: '길이 변경' }, { value: 'hashtag', label: '해시태그 최적화' }, { value: 'headline', label: '제목 변경' }, { value: 'mixed', label: '전체 변경' }]} />
              <Select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
                placeholder="에이전트 선택" options={agents.map((a) => ({ value: a.id, label: a.name }))} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowVariantModal(false)} className="px-3 py-1.5 text-sm text-zinc-500">취소</button>
                <button onClick={() => generateVariants.mutate({ id: detail.id, count: variantCount, strategy: variantStrategy, agentId: aiForm.agentId })}
                  disabled={!aiForm.agentId || generateVariants.isPending}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50">
                  {generateVariants.isPending ? '생성 중...' : `${variantCount}개 변형 생성`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
