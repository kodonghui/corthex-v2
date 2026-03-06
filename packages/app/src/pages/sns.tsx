import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Select, Textarea } from '@corthex/ui'

type SnsContent = {
  id: string
  platform: string
  title: string
  body?: string
  hashtags?: string
  imageUrl?: string
  status: string
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
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // 생성 폼 상태
  const [form, setForm] = useState({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '' })
  const [aiForm, setAiForm] = useState({ platform: 'instagram', agentId: '', topic: '', imagePrompt: '' })
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual')

  const { data: listData } = useQuery({
    queryKey: ['sns'],
    queryFn: () => api.get<{ data: SnsContent[] }>('/workspace/sns'),
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

  const createManual = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = { ...data, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined }
      return api.post<{ data: SnsContent }>('/workspace/sns', payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
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
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const submitForApproval = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
    },
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/workspace/sns/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
      setRejectReason('')
    },
  })

  const publish = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
    },
  })

  const cancelSchedule = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/sns/${id}/cancel-schedule`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      queryClient.invalidateQueries({ queryKey: ['sns', selectedId] })
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
      setShowImagePrompt(false)
      setImagePromptInput('')
    },
  })

  const deleteSns = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      setView('list')
    },
  })

  const list = listData?.data || []
  const detail = detailData?.data
  const agents = agentsData?.data || []

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">SNS 콘텐츠</h2>
        {view === 'list' && (
          <button
            onClick={() => { setView('create'); setForm({ platform: 'instagram', title: '', body: '', hashtags: '', scheduledAt: '' }) }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            + 새 콘텐츠
          </button>
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
          {list.length === 0 && <p className="text-sm text-zinc-500">아직 SNS 콘텐츠가 없습니다.</p>}
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => { setSelectedId(item.id); setView('detail') }}
              className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
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
        </div>
      )}
    </div>
  )
}
