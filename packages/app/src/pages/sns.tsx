import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Select, Textarea } from '@corthex/ui'

type SnsAccount = {
  id: string
  platform: string
  accountName: string
  accountId: string
  isActive: boolean
  createdAt: string
}

type SnsContent = {
  id: string
  platform: string
  title: string
  body?: string
  hashtags?: string
  imageUrl?: string
  status: string
  snsAccountId?: string | null
  accountName?: string | null
  variantOf?: string | null
  variants?: { id: string; title: string; status: string; metadata?: unknown; createdAt: string }[]
  metadata?: Record<string, unknown> | null
  createdBy: string
  creatorName: string
  agentId?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string
  publishedUrl?: string
  publishedAt?: string
  publishError?: string
  scheduledAt?: string | null
  createdAt: string
  updatedAt: string
}

type SnsMetrics = { views: number; likes: number; shares: number; clicks: number; updatedAt?: string }
type SnsAbScore = { id: string; title: string; metrics: SnsMetrics | null; score: number; status: string }
type SnsAbResult = {
  original: SnsContent
  variants: SnsContent[]
  winner: { id: string; score: number } | null
  scores: SnsAbScore[]
}

type SnsStats = {
  total: number
  byStatus: { status: string; count: number }[]
  byPlatform: { platform: string; total: number; published: number }[]
  dailyTrend: { date: string; count: number }[]
  days: number
}

type Agent = { id: string; name: string }

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  pending: '승인 대기',
  approved: '승인됨',
  scheduled: '예약됨',
  rejected: '반려됨',
  published: '발행 완료',
  failed: '발행 실패',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  published: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: '인스타그램',
  tistory: '티스토리',
  daum_cafe: '다음 카페',
}

export function SnsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [view, setView] = useState<'list' | 'create' | 'detail' | 'stats' | 'accounts'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [accountFilter, setAccountFilter] = useState('')

  // 생성 폼 상태
  const [form, setForm] = useState({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '', snsAccountId: '' })
  const [aiForm, setAiForm] = useState({ platform: 'instagram', agentId: '', topic: '', imagePrompt: '' })

  // 계정 관리 상태
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SnsAccount | null>(null)
  const [accountForm, setAccountForm] = useState({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual')
  const [statsDays, setStatsDays] = useState(30)
  const [showOnlyOriginals, setShowOnlyOriginals] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [variantStrategy, setVariantStrategy] = useState<string>('mixed')
  const [variantCount, setVariantCount] = useState(3)
  const [metricsForm, setMetricsForm] = useState({ views: 0, likes: 0, shares: 0, clicks: 0 })
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [showAbResults, setShowAbResults] = useState(false)

  const { data: listData } = useQuery({
    queryKey: ['sns', showOnlyOriginals ? 'root' : 'all'],
    queryFn: () => api.get<{ data: SnsContent[] }>(`/workspace/sns${showOnlyOriginals ? '?variantOf=root' : ''}`),
  })

  const { data: detailData } = useQuery({
    queryKey: ['sns', selectedId],
    queryFn: () => api.get<{ data: SnsContent }>(`/workspace/sns/${selectedId}`),
    enabled: !!selectedId,
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', statsDays],
    queryFn: () => api.get<{ data: SnsStats }>(`/workspace/sns/stats?days=${statsDays}`),
    enabled: view === 'stats',
  })

  const { data: accountsData } = useQuery({
    queryKey: ['sns-accounts'],
    queryFn: () => api.get<{ data: SnsAccount[] }>('/workspace/sns-accounts'),
  })

  const createManual = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
        snsAccountId: data.snsAccountId || undefined,
      }
      return api.post<{ data: SnsContent }>('/workspace/sns', payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const generateAi = useMutation({
    mutationFn: (data: typeof aiForm) => {
      const payload = { ...data, imagePrompt: data.imagePrompt || undefined }
      return api.post<{ data: SnsContent; imageGenerationError?: string }>('/workspace/sns/generate-with-image', payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const submitForApproval = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
    },
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/workspace/sns/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
      setRejectReason('')
    },
  })

  const publish = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
    },
  })

  const cancelSchedule = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/cancel-schedule`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
    },
  })

  const [imagePromptInput, setImagePromptInput] = useState('')
  const [showImagePrompt, setShowImagePrompt] = useState(false)

  const generateImage = useMutation({
    mutationFn: ({ id, imagePrompt }: { id: string; imagePrompt: string }) =>
      api.post<{ data: SnsContent }>(`/workspace/sns/${id}/generate-image`, { imagePrompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
      setShowImagePrompt(false)
      setImagePromptInput('')
    },
  })

  const deleteSns = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns-stats'] })
      setView('list')
    },
  })

  const createVariant = useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; body?: string; hashtags?: string }) =>
      api.post<{ data: SnsContent }>(`/workspace/sns/${id}/create-variant`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      setSelectedId(res.data.id)
    },
  })

  const generateVariants = useMutation({
    mutationFn: ({ id, ...data }: { id: string; count: number; strategy: string; agentId: string }) =>
      api.post(`/workspace/sns/${id}/generate-variants`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      setShowVariantModal(false)
    },
  })

  const updateMetrics = useMutation({
    mutationFn: ({ id, ...data }: { id: string; views: number; likes: number; shares: number; clicks: number }) =>
      api.put(`/workspace/sns/${id}/metrics`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['ab-results', selectedId] })
      setShowMetricsForm(false)
    },
  })

  const { data: abResultsData } = useQuery({
    queryKey: ['ab-results', selectedId],
    queryFn: () => api.get<{ data: SnsAbResult }>(`/workspace/sns/${selectedId}/ab-results`),
    enabled: !!selectedId && showAbResults,
  })

  const createAccount = useMutation({
    mutationFn: (data: { platform: string; accountName: string; accountId: string; credentials?: Record<string, string> }) =>
      api.post('/workspace/sns-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns-accounts'] })
      setShowAccountModal(false)
      setAccountForm({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })
    },
  })

  const updateAccount = useMutation({
    mutationFn: ({ id, ...data }: { id: string; accountName?: string; accountId?: string; credentials?: Record<string, string> }) =>
      api.put(`/workspace/sns-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns-accounts'] })
      setShowAccountModal(false)
      setEditingAccount(null)
      setAccountForm({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })
    },
  })

  const deleteAccount = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sns-accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sns-accounts'] }),
  })

  const list = listData?.data || []
  const detail = detailData?.data
  const agents = agentsData?.data || []
  const accounts = accountsData?.data || []
  const filteredList = accountFilter ? list.filter((i) => i.snsAccountId === accountFilter) : list

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">SNS 콘텐츠</h2>
        {view === 'list' && (
          <div className="flex gap-2">
            <button onClick={() => setView('accounts')}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 text-sm rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800">
              계정 관리
            </button>
            <button onClick={() => setView('stats')}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 text-sm rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800">
              통계
            </button>
            <button
              onClick={() => { setView('create'); setForm({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '', snsAccountId: '' }) }}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              + 새 콘텐츠
            </button>
          </div>
        )}
        {view !== 'list' && (
          <button onClick={() => setView('list')} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            목록으로
          </button>
        )}
      </div>

      {/* 리스트 */}
      {view === 'list' && (
        <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
          <div className="flex gap-3 items-center mb-2 flex-wrap">
            {accounts.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500">계정:</span>
                <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800">
                  <option value="">전체</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountName} ({PLATFORM_LABELS[a.platform]})</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer">
              <input type="checkbox" checked={showOnlyOriginals} onChange={(e) => setShowOnlyOriginals(e.target.checked)}
                className="rounded border-zinc-300" />
              원본만 보기
            </label>
          </div>
          {filteredList.length === 0 && <p className="text-sm text-zinc-500">아직 SNS 콘텐츠가 없습니다.</p>}
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => { setSelectedId(item.id); setView('detail') }}
              className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  {item.accountName && <span className="text-xs text-indigo-500">@{item.accountName}</span>}
                  {item.variantOf && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">변형</span>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>
              <h3 className="font-medium text-sm">{item.title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{item.creatorName} · {new Date(item.createdAt).toLocaleDateString('ko')}</p>
            </div>
          ))}
        </div>
      )}

      {/* 생성 */}
      {view === 'create' && (
        <div className="px-6 py-4 max-w-2xl space-y-4 overflow-y-auto flex-1">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCreateMode('manual')}
              className={`px-3 py-1 text-sm rounded ${createMode === 'manual' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}
            >
              직접 작성
            </button>
            <button
              onClick={() => setCreateMode('ai')}
              className={`px-3 py-1 text-sm rounded ${createMode === 'ai' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500'}`}
            >
              AI 생성
            </button>
          </div>

          {createMode === 'manual' && (
            <>
              <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                options={[{ value: 'instagram', label: '인스타그램' }, { value: 'tistory', label: '티스토리' }, { value: 'daum_cafe', label: '다음 카페' }]} />
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="본문 내용" rows={6} />
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
                options={[{ value: 'instagram', label: '인스타그램' }, { value: 'tistory', label: '티스토리' }, { value: 'daum_cafe', label: '다음 카페' }]} />
              <Select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
                placeholder="에이전트 선택"
                options={agents.map((a) => ({ value: a.id, label: a.name }))} />
              <input value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                placeholder="주제 (예: AI 자동화 마케팅 트렌드)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
              <div>
                <label className="block text-xs text-zinc-500 mb-1">이미지 설명 (선택)</label>
                <input value={aiForm.imagePrompt} onChange={(e) => setAiForm({ ...aiForm, imagePrompt: e.target.value })}
                  placeholder="AI가 생성할 이미지 설명 (예: 미래적인 AI 로봇이 마케팅 회의하는 장면)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
              </div>
              <button onClick={() => generateAi.mutate(aiForm)} disabled={!aiForm.agentId || !aiForm.topic || generateAi.isPending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {generateAi.isPending ? 'AI 생성 중...' : 'AI로 콘텐츠 생성'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 상세 */}
      {view === 'detail' && detail && (
        <div className="px-6 py-4 max-w-2xl space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-500">{PLATFORM_LABELS[detail.platform]}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[detail.status]}`}>
              {STATUS_LABELS[detail.status]}
            </span>
          </div>

          <h3 className="text-lg font-semibold">{detail.title}</h3>
          <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
            {detail.body}
          </div>

          {detail.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <img src={detail.imageUrl} alt={detail.title} className="w-full max-h-96 object-cover" />
            </div>
          )}

          {detail.hashtags && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{detail.hashtags}</p>
          )}

          {detail.rejectReason && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">반려 사유: {detail.rejectReason}</p>
            </div>
          )}

          {detail.publishedUrl && (
            <a href={detail.publishedUrl} target="_blank" rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline">
              발행된 URL: {detail.publishedUrl}
            </a>
          )}

          {detail.publishError && (
            <p className="text-sm text-red-600">발행 오류: {detail.publishError}</p>
          )}

          {detail.scheduledAt && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              예약 시간: {new Date(detail.scheduledAt).toLocaleString('ko')}
            </p>
          )}

          <p className="text-xs text-zinc-500">
            작성: {detail.creatorName} · {new Date(detail.createdAt).toLocaleString('ko')}
            {detail.accountName && <> · 계정: <span className="text-indigo-500">@{detail.accountName}</span></>}
          </p>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-2">
            {(detail.status === 'draft' || detail.status === 'rejected') && (
              <button onClick={() => submitForApproval.mutate(detail.id)}
                className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
                승인 요청
              </button>
            )}

            {detail.status === 'pending' && user?.role === 'admin' && (
              <>
                <button onClick={() => approve.mutate(detail.id)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                  승인
                </button>
                <div className="flex gap-1">
                  <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유" className="px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
                  <button onClick={() => reject.mutate({ id: detail.id, reason: rejectReason })}
                    disabled={!rejectReason}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50">
                    반려
                  </button>
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
              <button onClick={() => setShowImagePrompt(true)}
                className="px-3 py-1.5 border border-purple-300 text-purple-600 text-sm rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30">
                이미지 생성
              </button>
            )}

            {detail.status === 'draft' && (
              <button onClick={() => deleteSns.mutate(detail.id)}
                className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">
                삭제
              </button>
            )}
          </div>

          {showImagePrompt && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1">이미지 설명</label>
                <input value={imagePromptInput} onChange={(e) => setImagePromptInput(e.target.value)}
                  placeholder="AI가 생성할 이미지를 설명하세요"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
              </div>
              <button
                onClick={() => generateImage.mutate({ id: detail.id, imagePrompt: imagePromptInput })}
                disabled={!imagePromptInput || generateImage.isPending}
                className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50">
                {generateImage.isPending ? '생성 중...' : '생성'}
              </button>
              <button onClick={() => { setShowImagePrompt(false); setImagePromptInput('') }}
                className="px-3 py-2 text-zinc-500 text-sm hover:text-zinc-700">
                취소
              </button>
            </div>
          )}

          {/* A/B 테스트 섹션 */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">A/B 테스트</h4>
              <div className="flex gap-2">
                <button onClick={() => createVariant.mutate({ id: detail.id })}
                  disabled={createVariant.isPending}
                  className="px-2 py-1 text-xs border border-purple-300 text-purple-600 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-50">
                  {createVariant.isPending ? '생성 중...' : '변형 복제'}
                </button>
                <button onClick={() => setShowVariantModal(true)}
                  className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                  AI 변형 생성
                </button>
                <button onClick={() => { setShowMetricsForm(!showMetricsForm); const m = (detail.metadata as Record<string, unknown>)?.metrics as SnsMetrics | undefined; if (m) setMetricsForm({ views: m.views, likes: m.likes, shares: m.shares, clicks: m.clicks }) }}
                  className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  성과 입력
                </button>
                {(detail.variants?.length ?? 0) > 0 && (
                  <button onClick={() => setShowAbResults(!showAbResults)}
                    className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/30">
                    {showAbResults ? '결과 닫기' : '결과 비교'}
                  </button>
                )}
              </div>
            </div>

            {/* 성과 입력 폼 */}
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
                  <button onClick={() => updateMetrics.mutate({ id: detail.id, ...metricsForm })}
                    disabled={updateMetrics.isPending}
                    className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                    {updateMetrics.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}

            {/* 변형 목록 */}
            {detail.variants && detail.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">변형 {detail.variants.length}개</p>
                {detail.variants.map((v) => (
                  <div key={v.id}
                    onClick={() => { setSelectedId(v.id); setShowAbResults(false); setShowMetricsForm(false) }}
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

            {/* A/B 결과 비교 */}
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
                              <span>조회 {s.metrics.views}</span>
                              <span>좋아요 {s.metrics.likes}</span>
                              <span>공유 {s.metrics.shares}</span>
                              <span>클릭 {s.metrics.clicks}</span>
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

          {/* AI 변형 생성 모달 */}
          {showVariantModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVariantModal(false)}>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-base font-semibold">AI A/B 변형 생성</h4>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">변형 수 ({variantCount}개)</label>
                  <input type="range" min={2} max={5} value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value))}
                    className="w-full" />
                </div>
                <Select value={variantStrategy} onChange={(e) => setVariantStrategy(e.target.value)}
                  options={[
                    { value: 'tone', label: '어조 변경' },
                    { value: 'length', label: '길이 변경' },
                    { value: 'hashtag', label: '해시태그 최적화' },
                    { value: 'headline', label: '제목 변경' },
                    { value: 'mixed', label: '전체 변경' },
                  ]} />
                <Select value={aiForm.agentId} onChange={(e) => setAiForm({ ...aiForm, agentId: e.target.value })}
                  placeholder="에이전트 선택"
                  options={agents.map((a) => ({ value: a.id, label: a.name }))} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowVariantModal(false)} className="px-3 py-1.5 text-sm text-zinc-500">취소</button>
                  <button
                    onClick={() => generateVariants.mutate({ id: detail.id, count: variantCount, strategy: variantStrategy, agentId: aiForm.agentId })}
                    disabled={!aiForm.agentId || generateVariants.isPending}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50">
                    {generateVariants.isPending ? `생성 중...` : `${variantCount}개 변형 생성`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 계정 관리 */}
      {view === 'accounts' && (
        <div className="px-6 py-4 max-w-2xl space-y-4 overflow-y-auto flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold">SNS 계정 관리</h3>
            <button onClick={() => { setShowAccountModal(true); setEditingAccount(null); setAccountForm({ platform: 'instagram', accountName: '', accountId: '', credentials: '' }) }}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
              + 계정 추가
            </button>
          </div>

          {accounts.length === 0 && <p className="text-sm text-zinc-500">등록된 SNS 계정이 없습니다.</p>}
          {accounts.map((acct) => (
            <div key={acct.id} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{PLATFORM_LABELS[acct.platform]}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${acct.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-zinc-100 text-zinc-500'}`}>
                    {acct.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <p className="font-medium text-sm mt-1">{acct.accountName}</p>
                <p className="text-xs text-zinc-500">{acct.accountId}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditingAccount(acct)
                  setAccountForm({ platform: acct.platform, accountName: acct.accountName, accountId: acct.accountId, credentials: '' })
                  setShowAccountModal(true)
                }} className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  수정
                </button>
                <button onClick={() => { if (confirm('이 계정을 삭제하시겠습니까?')) deleteAccount.mutate(acct.id) }}
                  className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                  삭제
                </button>
              </div>
            </div>
          ))}

          {/* 계정 추가/수정 모달 */}
          {showAccountModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAccountModal(false)}>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-base font-semibold">{editingAccount ? '계정 수정' : '계정 추가'}</h4>
                {!editingAccount && (
                  <Select value={accountForm.platform} onChange={(e) => setAccountForm({ ...accountForm, platform: e.target.value })}
                    options={[{ value: 'instagram', label: '인스타그램' }, { value: 'tistory', label: '티스토리' }, { value: 'daum_cafe', label: '다음 카페' }]} />
                )}
                <input value={accountForm.accountName} onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  placeholder="계정 이름 (예: 회사 공식)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
                <input value={accountForm.accountId} onChange={(e) => setAccountForm({ ...accountForm, accountId: e.target.value })}
                  placeholder="계정 ID (예: @company_official)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">인증 정보 (JSON, 선택)</label>
                  <input type="password" value={accountForm.credentials}
                    onChange={(e) => setAccountForm({ ...accountForm, credentials: e.target.value })}
                    placeholder='{"apiKey": "...", "accessToken": "..."}'
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm font-mono" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAccountModal(false)}
                    className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700">취소</button>
                  <button
                    onClick={() => {
                      let creds: Record<string, string> | undefined
                      if (accountForm.credentials) {
                        try { creds = JSON.parse(accountForm.credentials) } catch { alert('인증 정보 JSON 형식이 올바르지 않습니다'); return }
                      }
                      if (editingAccount) {
                        updateAccount.mutate({ id: editingAccount.id, accountName: accountForm.accountName, accountId: accountForm.accountId, ...(creds ? { credentials: creds } : {}) })
                      } else {
                        createAccount.mutate({ platform: accountForm.platform, accountName: accountForm.accountName, accountId: accountForm.accountId, ...(creds ? { credentials: creds } : {}) })
                      }
                    }}
                    disabled={!accountForm.accountName || !accountForm.accountId || createAccount.isPending || updateAccount.isPending}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {createAccount.isPending || updateAccount.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 통계 */}
      {view === 'stats' && (() => {
        const stats = statsData?.data
        if (!stats) return <div className="px-6 py-4 text-sm text-zinc-500">로딩 중...</div>
        if (stats.total === 0) return <div className="px-6 py-4 text-sm text-zinc-500">아직 SNS 콘텐츠가 없습니다.</div>

        const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0
        const failedCount = stats.byStatus.find((s) => s.status === 'failed')?.count ?? 0
        const pendingCount = stats.byStatus
          .filter((s) => ['pending', 'approved', 'scheduled'].includes(s.status))
          .reduce((sum, s) => sum + s.count, 0)
        const successRate = publishedCount + failedCount > 0
          ? Math.round((publishedCount / (publishedCount + failedCount)) * 100)
          : 0

        const maxDaily = Math.max(...stats.dailyTrend.map((d) => d.count), 1)

        return (
          <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1 max-w-4xl">
            {/* 기간 선택 */}
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button key={d} onClick={() => setStatsDays(d)}
                  className={`px-3 py-1 text-sm rounded ${statsDays === d ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  {d}일
                </button>
              ))}
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '총 콘텐츠', value: stats.total },
                { label: '발행 완료', value: publishedCount },
                { label: '성공률', value: `${successRate}%` },
                { label: '대기 중', value: pendingCount },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>

            {/* 상태별 분포 */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">상태별 분포</h3>
              <div className="space-y-2">
                {stats.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full w-20 text-center ${STATUS_COLORS[s.status] || ''}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-4">
                      <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${(s.count / stats.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 플랫폼별 분포 */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">플랫폼별 분포</h3>
              <div className="grid grid-cols-3 gap-3">
                {stats.byPlatform.map((p) => (
                  <div key={p.platform} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
                    <p className="text-xs text-zinc-500">{PLATFORM_LABELS[p.platform] || p.platform}</p>
                    <p className="text-xl font-bold mt-1">{p.total}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">발행 {p.published}건</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 일별 추이 */}
            {stats.dailyTrend.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">일별 생성 추이</h3>
                <div className="space-y-1">
                  {stats.dailyTrend.map((d) => (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 w-24">{d.date}</span>
                      <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded h-3">
                        <div className="bg-indigo-500 h-3 rounded" style={{ width: `${(d.count / maxDaily) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      })()}
    </div>
  )
}
