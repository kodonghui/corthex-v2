import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, Briefcase, MessageSquare, Play, FileText } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth-store'
import { StatusStepper } from './status-stepper'
import type { SnsContent, SnsAccount, Agent, SnsMetrics, SnsAbResult } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, PLATFORM_OPTIONS } from './sns-types'

const PLATFORM_BADGE_STYLES: Record<string, { bg: string; text: string; icon: typeof Camera }> = {
  instagram: { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: Camera },
  facebook: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: MessageSquare },
  twitter: { bg: 'bg-sky-500/20', text: 'text-sky-400', icon: MessageSquare },
  youtube: { bg: 'bg-red-500/20', text: 'text-red-400', icon: Play },
  tistory: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: FileText },
  naver_blog: { bg: 'bg-green-500/20', text: 'text-green-400', icon: FileText },
  linkedin: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Briefcase },
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  draft: 'bg-corthex-surface/20 text-stone-500',
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  scheduled: 'bg-amber-500/20 text-amber-400',
  rejected: 'bg-red-500/20 text-red-400',
  published: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  publishing: 'bg-purple-500/20 text-purple-400',
}

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
      <div data-testid="sns-content-list" className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-3 items-center flex-wrap">
            {accounts.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-stone-500">계정:</span>
                <select
                  data-testid="sns-account-filter"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="bg-stone-100 border border-stone-300 rounded-lg text-sm px-3 py-1.5 text-stone-600"
                >
                  <option value="">전체</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountName} ({PLATFORM_LABELS[a.platform] || a.platform})</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-1.5 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" checked={showOnlyOriginals} onChange={(e) => setShowOnlyOriginals(e.target.checked)} className="rounded border-stone-300" />
              원본만
            </label>
            <div className="flex border border-stone-300 rounded-lg overflow-hidden">
              <button
                data-testid="sns-view-list"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-blue-600/20 text-blue-400' : 'text-stone-500 hover:bg-stone-200'}`}
              >
                목록
              </button>
              <button
                data-testid="sns-view-gallery"
                onClick={() => setViewMode('gallery')}
                className={`px-3 py-1.5 text-xs ${viewMode === 'gallery' ? 'bg-blue-600/20 text-blue-400' : 'text-stone-500 hover:bg-stone-200'}`}
              >
                갤러리
              </button>
            </div>
          </div>
          <button
            data-testid="sns-create-btn"
            onClick={() => { setView('create'); setForm({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '', snsAccountId: '' }) }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            + 새 콘텐츠
          </button>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div data-testid="sns-empty" className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm text-stone-500">아직 SNS 콘텐츠가 없습니다</p>
            <p className="text-xs text-stone-400">새 콘텐츠를 만들어보세요!</p>
          </div>
        )}

        {/* Gallery view */}
        {viewMode === 'gallery' && filteredList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredList.map((item) => (
              <div key={item.id}
                data-testid={`sns-gallery-item-${item.id}`}
                onClick={() => { setSelectedId(item.id); setView('detail') }}
                className="relative group bg-stone-100/50 border border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">이미지 없음</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  <span className="text-[10px] text-white/70">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card grid view — matching Stitch 2-column design */}
        {viewMode === 'list' && filteredList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {filteredList.map((item) => {
              const platStyle = PLATFORM_BADGE_STYLES[item.platform] || { bg: 'bg-corthex-surface/20', text: 'text-stone-500', icon: FileText }
              const PlatIcon = platStyle.icon
              const statusBadge = STATUS_BADGE_STYLES[item.status] || 'bg-corthex-surface/20 text-stone-500'
              const metrics = (item.metadata as Record<string, unknown>)?.metrics as SnsMetrics | undefined
              const isScheduled = item.status === 'scheduled' || item.status === 'pending'
              return (
                <article
                  key={item.id}
                  data-testid={`sns-content-item-${item.id}`}
                  onClick={() => { setSelectedId(item.id); setView('detail') }}
                  className="flex flex-col rounded-xl bg-corthex-surface border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-5 flex flex-col gap-4 h-full">
                    {/* Top row: platform badge + date + status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`${platStyle.bg} ${platStyle.text} rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1`}>
                          <PlatIcon className="w-3.5 h-3.5" />
                          {item.platform === 'instagram' ? 'Instagram' : item.platform === 'facebook' ? 'Facebook' : item.platform === 'twitter' ? 'Twitter' : item.platform === 'youtube' ? 'YouTube' : item.platform === 'linkedin' ? 'LinkedIn' : PLATFORM_LABELS[item.platform] || item.platform}
                        </div>
                        <span className="text-stone-500 text-xs font-medium font-mono">
                          {new Date(item.createdAt).toLocaleString('ko', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`${statusBadge} rounded-md px-2 py-1 text-xs font-bold`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </div>
                    </div>

                    {/* Variant/CardNews badges */}
                    {(item.variantOf || item.isCardNews) && (
                      <div className="flex items-center gap-2">
                        {item.variantOf && <span className="bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded font-medium">변형</span>}
                        {item.isCardNews && <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded font-medium">카드뉴스</span>}
                      </div>
                    )}

                    {/* Content body text */}
                    <p className="text-corthex-text-disabled text-sm leading-relaxed line-clamp-3">
                      {item.body || item.title}
                    </p>

                    {/* Image preview */}
                    {item.imageUrl ? (
                      <div className="bg-stone-100 rounded-lg h-40 w-full overflow-hidden mt-auto">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className="bg-stone-100 rounded-lg h-40 w-full flex items-center justify-center text-corthex-text-secondary text-sm mt-auto">
                        이미지 없음
                      </div>
                    )}

                    {/* Engagement stats bar */}
                    <div className={`flex items-center gap-6 mt-2 pt-4 border-t border-stone-200 ${isScheduled ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Heart className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{metrics?.likes?.toLocaleString() ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <MessageCircle className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{metrics?.clicks?.toLocaleString() ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Share2 className="w-[18px] h-[18px]" />
                        <span className="text-xs font-mono font-medium">{metrics?.shares?.toLocaleString() ?? '-'}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        className="ml-auto text-stone-500 hover:text-stone-600"
                        aria-label="더보기"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // --- CREATE VIEW ---
  if (view === 'create') {
    return (
      <div data-testid="sns-create-view" className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-stone-500 hover:text-corthex-text-disabled mb-4">← 목록으로</button>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setCreateMode('manual')}
            className={`px-3 py-1.5 text-sm rounded-lg ${createMode === 'manual' ? 'bg-blue-600/20 text-blue-400' : 'text-stone-500 hover:text-stone-600'}`}>
            직접 작성
          </button>
          <button onClick={() => setCreateMode('ai')}
            className={`px-3 py-1.5 text-sm rounded-lg ${createMode === 'ai' ? 'bg-blue-600/20 text-blue-400' : 'text-stone-500 hover:text-stone-600'}`}>
            AI 생성
          </button>
        </div>

        {createMode === 'manual' && (
          <>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
              {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-stone-600" />
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="본문 내용" rows={6}
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-stone-600" />
            <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              placeholder="해시태그 (#태그1 #태그2)" className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-stone-600" />
            <div>
              <label className="block text-xs text-stone-500 mb-1">예약 발행 (선택)</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600" />
            </div>
            {accounts.length > 0 && (
              <div>
                <label className="block text-xs text-stone-500 mb-1">발행 계정 (선택)</label>
                <select value={form.snsAccountId} onChange={(e) => setForm({ ...form, snsAccountId: e.target.value })}
                  className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
                  <option value="">계정 미선택</option>
                  {accounts.filter((a) => a.platform === form.platform).map((a) => (
                    <option key={a.id} value={a.id}>{a.accountName} ({a.accountId})</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={() => createManual.mutate(form)} disabled={!form.title || !form.body || createManual.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50">
              {createManual.isPending ? '생성 중...' : '콘텐츠 저장'}
            </button>
          </>
        )}

        {createMode === 'ai' && (
          <>
            <select value={aiForm.platform} onChange={(e) => setAiForm({ ...aiForm, platform: e.target.value })}
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
              {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
              <option value="">에이전트 선택</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
              placeholder="주제 (예: AI 자동화 마케팅 트렌드)" className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-stone-600" />
            <div>
              <label className="block text-xs text-stone-500 mb-1">이미지 설명 (선택)</label>
              <input value={aiForm.imagePrompt} onChange={(e) => setAiForm({ ...aiForm, imagePrompt: e.target.value })}
                placeholder="AI가 생성할 이미지 설명" className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-stone-600" />
            </div>
            <button onClick={() => generateAi.mutate(aiForm)} disabled={!aiForm.agentId || !aiForm.topic || generateAi.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50">
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
      <div data-testid="sns-detail-view" className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-stone-500 hover:text-corthex-text-disabled mb-4">← 목록으로</button>

        <StatusStepper status={detail.status} createdAt={detail.createdAt} reviewedAt={detail.reviewedAt} scheduledAt={detail.scheduledAt} publishedAt={detail.publishedAt} />

        {/* Platform + Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-stone-500">{PLATFORM_LABELS[detail.platform] || detail.platform}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[detail.status]}`}>{STATUS_LABELS[detail.status]}</span>
        </div>

        <h3 className="text-lg font-semibold text-corthex-text-secondary">{detail.title}</h3>

        {detail.body && (
          <div className="bg-stone-100/70 rounded-xl p-4 text-sm text-stone-600 whitespace-pre-wrap">{detail.body}</div>
        )}

        {detail.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-stone-200">
            <img src={detail.imageUrl} alt={detail.title} className="w-full max-h-96 object-cover" />
          </div>
        )}

        {detail.hashtags && <p className="text-sm text-corthex-accent">{detail.hashtags}</p>}

        {detail.rejectReason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-sm text-red-400">반려 사유: {detail.rejectReason}</p>
          </div>
        )}

        {detail.publishedUrl && (
          <a href={detail.publishedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline block">
            발행된 URL: {detail.publishedUrl}
          </a>
        )}

        {detail.publishError && <p className="text-sm text-red-400">발행 오류: {detail.publishError}</p>}
        {detail.scheduledAt && <p className="text-sm text-blue-400">예약 시간: {new Date(detail.scheduledAt).toLocaleString('ko')}</p>}

        <p className="text-xs text-stone-400">
          작성: {detail.creatorName} · {new Date(detail.createdAt).toLocaleString('ko')}
          {detail.accountName && <> · 계정: <span className="text-corthex-accent">@{detail.accountName}</span></>}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2 flex-wrap">
          {(detail.status === 'draft' || detail.status === 'rejected') && (
            <button data-testid="sns-submit-btn" onClick={() => submitForApproval.mutate(detail.id)}
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-sm">승인 요청</button>
          )}
          {detail.status === 'pending' && user?.role === 'admin' && (
            <>
              <button data-testid="sns-approve-btn" onClick={() => approve.mutate(detail.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm">승인</button>
              <div className="flex gap-1">
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="반려 사유"
                  className="bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 text-sm text-stone-600" />
                <button data-testid="sns-reject-btn" onClick={() => reject.mutate({ id: detail.id, reason: rejectReason })} disabled={!rejectReason}
                  className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">반려</button>
              </div>
            </>
          )}
          {detail.status === 'approved' && (
            <button data-testid="sns-publish-btn" onClick={() => publish.mutate(detail.id)} disabled={publish.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
              {publish.isPending ? '발행 중...' : '발행하기'}
            </button>
          )}
          {detail.status === 'scheduled' && (
            <button onClick={() => cancelSchedule.mutate(detail.id)} disabled={cancelSchedule.isPending}
              className="border border-blue-500/50 text-blue-400 rounded-lg px-4 py-2 text-sm disabled:opacity-50">
              {cancelSchedule.isPending ? '취소 중...' : '예약 취소'}
            </button>
          )}
          {(detail.status === 'draft' || detail.status === 'rejected') && !showImagePrompt && (
            <button onClick={() => setShowImagePrompt(true)}
              className="border border-purple-500/50 text-purple-400 rounded-lg px-4 py-2 text-sm">이미지 생성</button>
          )}
          {detail.status === 'draft' && (
            <button data-testid="sns-delete-btn" onClick={() => deleteSns.mutate(detail.id)}
              className="border border-red-500/50 text-red-400 rounded-lg px-4 py-2 text-sm">삭제</button>
          )}
        </div>

        {showImagePrompt && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">이미지 설명</label>
              <input value={imagePromptInput} onChange={(e) => setImagePromptInput(e.target.value)} placeholder="AI가 생성할 이미지를 설명하세요"
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600" />
            </div>
            <button onClick={() => generateImage.mutate({ id: detail.id, imagePrompt: imagePromptInput })} disabled={!imagePromptInput || generateImage.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
              {generateImage.isPending ? '생성 중...' : '생성'}
            </button>
            <button onClick={() => { setShowImagePrompt(false); setImagePromptInput('') }} className="text-stone-500 text-sm px-3 py-2 hover:text-corthex-text-disabled">취소</button>
          </div>
        )}

        {/* A/B Test Section */}
        <div className="border-t border-stone-200 pt-4 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-corthex-text-disabled">A/B 테스트</h4>
            <div className="flex gap-2">
              <button onClick={() => createVariant.mutate({ id: detail.id })} disabled={createVariant.isPending}
                className="border border-purple-500/50 text-purple-400 rounded-lg px-3 py-1.5 text-xs disabled:opacity-50">
                {createVariant.isPending ? '생성 중...' : '변형 복제'}
              </button>
              <button onClick={() => setShowVariantModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 py-1.5 text-xs">AI 변형 생성</button>
              <button onClick={() => { setShowMetricsForm(!showMetricsForm); const m = (detail.metadata as Record<string, unknown>)?.metrics as SnsMetrics | undefined; if (m) setMetricsForm({ views: m.views, likes: m.likes, shares: m.shares, clicks: m.clicks }) }}
                className="border border-stone-300 text-stone-500 rounded-lg px-3 py-1.5 text-xs">성과 입력</button>
              {(detail.variants?.length ?? 0) > 0 && (
                <button onClick={() => setShowAbResults(!showAbResults)}
                  className="border border-emerald-500/50 text-emerald-400 rounded-lg px-3 py-1.5 text-xs">
                  {showAbResults ? '결과 닫기' : '결과 비교'}
                </button>
              )}
            </div>
          </div>

          {showMetricsForm && (
            <div className="bg-stone-100/70 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {(['views', 'likes', 'shares', 'clicks'] as const).map((key) => (
                  <div key={key}>
                    <label className="block text-xs text-stone-500 mb-1">{{ views: '조회', likes: '좋아요', shares: '공유', clicks: '클릭' }[key]}</label>
                    <input type="number" min={0} value={metricsForm[key]}
                      onChange={(e) => setMetricsForm({ ...metricsForm, [key]: Number(e.target.value) || 0 })}
                      className="w-full bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-sm text-stone-600" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowMetricsForm(false)} className="px-2 py-1 text-xs text-stone-500">취소</button>
                <button onClick={() => updateMetrics.mutate({ id: detail.id, ...metricsForm })} disabled={updateMetrics.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs disabled:opacity-50">
                  {updateMetrics.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}

          {detail.variants && detail.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-stone-400">변형 {detail.variants.length}개</p>
              {detail.variants.map((v) => (
                <div key={v.id} onClick={() => { setSelectedId(v.id); setShowAbResults(false); setShowMetricsForm(false) }}
                  className="bg-stone-100/50 border border-stone-200 rounded-lg p-3 cursor-pointer hover:border-stone-300 flex justify-between items-center">
                  <div>
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded mr-2">변형</span>
                    <span className="text-sm text-corthex-text-disabled">{v.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
                </div>
              ))}
            </div>
          )}

          {showAbResults && abResultsData?.data && (() => {
            const ab = abResultsData.data
            return (
              <div className="bg-stone-100/70 rounded-xl p-4 space-y-2">
                <h5 className="text-xs font-semibold text-stone-500">A/B 테스트 결과</h5>
                <div className="space-y-1">
                  {ab.scores.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg text-sm ${ab.winner?.id === s.id ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}`}>
                      <div className="flex items-center gap-2">
                        {ab.winner?.id === s.id && <span className="text-xs text-emerald-400 font-bold">WINNER</span>}
                        <span className="truncate max-w-[200px] text-corthex-text-disabled">{s.title}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-stone-500">
                        {s.metrics ? (
                          <>
                            <span>조회 {s.metrics.views}</span><span>좋아요 {s.metrics.likes}</span>
                            <span>공유 {s.metrics.shares}</span><span>클릭 {s.metrics.clicks}</span>
                            <span className="font-bold text-blue-400">점수 {s.score}</span>
                          </>
                        ) : <span className="text-stone-400">성과 미입력</span>}
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
            <div className="bg-stone-100 border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-semibold text-corthex-text-secondary">AI A/B 변형 생성</h4>
              <div>
                <label className="block text-xs text-stone-500 mb-1">변형 수 ({variantCount}개)</label>
                <input type="range" min={2} max={5} value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value))} className="w-full" />
              </div>
              <select value={variantStrategy} onChange={(e) => setVariantStrategy(e.target.value)}
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
                <option value="tone">어조 변경</option>
                <option value="length">길이 변경</option>
                <option value="hashtag">해시태그 최적화</option>
                <option value="headline">제목 변경</option>
                <option value="mixed">전체 변경</option>
              </select>
              <select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
                <option value="">에이전트 선택</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowVariantModal(false)} className="text-stone-500 text-sm px-3 py-1.5">취소</button>
                <button onClick={() => generateVariants.mutate({ id: detail.id, count: variantCount, strategy: variantStrategy, agentId: aiForm.agentId })}
                  disabled={!aiForm.agentId || generateVariants.isPending}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
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
