import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth-store'
import { StatusStepper } from './status-stepper'
import type { SnsContent, CardNewsCard } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS } from './sns-types'

interface CardNewsDetailProps {
  seriesId: string
  onBack: () => void
}

export function CardNewsDetail({ seriesId, onBack }: CardNewsDetailProps) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [editingCard, setEditingCard] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ imageUrl: '', caption: '', layout: 'content' as string })
  const [rejectReason, setRejectReason] = useState('')

  const { data: seriesData } = useQuery({
    queryKey: ['sns-card-series', seriesId],
    queryFn: () => api.get<{ data: SnsContent }>(`/workspace/sns/card-series/${seriesId}`),
  })

  const updateCard = useMutation({
    mutationFn: ({ index, ...data }: { index: number; imageUrl?: string; caption?: string; layout?: string }) =>
      api.put(`/workspace/sns/card-series/${seriesId}/cards/${index}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns-card-series', seriesId] })
      setEditingCard(null)
    },
  })

  const reorderCards = useMutation({
    mutationFn: (newOrder: number[]) => api.post(`/workspace/sns/card-series/${seriesId}/reorder`, { newOrder }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sns-card-series', seriesId] }),
  })

  const submitSeries = useMutation({
    mutationFn: () => api.post(`/workspace/sns/card-series/${seriesId}/submit`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sns-card-series', seriesId] }),
  })

  const approveSeries = useMutation({
    mutationFn: () => api.post(`/workspace/sns/card-series/${seriesId}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sns-card-series', seriesId] }),
  })

  const rejectSeries = useMutation({
    mutationFn: (reason: string) => api.post(`/workspace/sns/card-series/${seriesId}/reject`, { reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns-card-series', seriesId] }); setRejectReason('') },
  })

  const deleteSeries = useMutation({
    mutationFn: () => api.delete(`/workspace/sns/card-series/${seriesId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns'] }); onBack() },
  })

  const series = seriesData?.data
  if (!series) return <div className="text-sm text-zinc-500 py-4">로딩 중...</div>

  const meta = series.metadata as Record<string, unknown> | null
  const cards: CardNewsCard[] = (meta?.cards as CardNewsCard[]) || []
  const seriesTitle = (meta?.seriesTitle as string) || series.title

  const startEdit = (idx: number) => {
    const card = cards[idx]
    if (card) {
      setEditForm({ imageUrl: card.imageUrl, caption: card.caption, layout: card.layout })
      setEditingCard(idx)
    }
  }

  const moveSlide = (idx: number, dir: 1 | -1) => {
    const target = idx + dir
    if (target < 0 || target >= cards.length) return
    const newOrder = cards.map((_, i) => i)
    ;[newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]]
    reorderCards.mutate(newOrder)
  }

  return (
    <div className="max-w-3xl space-y-4">
      <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← 카드뉴스 목록</button>

      <StatusStepper status={series.status} createdAt={series.createdAt} reviewedAt={series.reviewedAt} scheduledAt={series.scheduledAt} publishedAt={series.publishedAt} />

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{seriesTitle}</h3>
        <span className="text-xs text-zinc-500">{PLATFORM_LABELS[series.platform] || series.platform}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[series.status]}`}>{STATUS_LABELS[series.status]}</span>
        <span className="text-xs text-zinc-400">{cards.length}장</span>
      </div>

      {series.rejectReason && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">반려 사유: {series.rejectReason}</p>
        </div>
      )}

      {/* Card Carousel Preview */}
      {cards.length > 0 && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
            {cards[currentSlide]?.imageUrl ? (
              <img src={cards[currentSlide].imageUrl} alt={`카드 ${currentSlide + 1}`} className="w-full h-72 object-contain" />
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-zinc-400">이미지 없음</div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-sm">{cards[currentSlide]?.caption}</p>
              <span className="text-xs text-white/70">
                {cards[currentSlide]?.layout === 'cover' ? '커버' : cards[currentSlide]?.layout === 'closing' ? '마무리' : '내용'}
              </span>
            </div>
            {/* Nav arrows */}
            {currentSlide > 0 && (
              <button onClick={() => setCurrentSlide(currentSlide - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">
                ‹
              </button>
            )}
            {currentSlide < cards.length - 1 && (
              <button onClick={() => setCurrentSlide(currentSlide + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">
                ›
              </button>
            )}
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-1.5">
            {cards.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-orange-500 w-4' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Card List for editing */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-zinc-500">카드 목록</h4>
        {cards.map((card, idx) => (
          <div key={idx}
            className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
              idx === currentSlide ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setCurrentSlide(idx)}>
            {card.imageUrl ? (
              <img src={card.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center text-xs text-zinc-400">{idx + 1}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  card.layout === 'cover' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : card.layout === 'closing' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {card.layout === 'cover' ? '커버' : card.layout === 'closing' ? '마무리' : '내용'}
                </span>
                <span className="text-xs text-zinc-400">#{idx + 1}</span>
              </div>
              <p className="text-sm truncate">{card.caption || '(캡션 없음)'}</p>
            </div>
            {series.status === 'draft' && (
              <div className="flex gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); startEdit(idx) }}
                  className="px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">수정</button>
                {idx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1) }}
                    className="px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">↑</button>
                )}
                {idx < cards.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1) }}
                    className="px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">↓</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Card Modal */}
      {editingCard !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingCard(null)}>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-base font-semibold">카드 {editingCard + 1} 수정</h4>
            <input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} placeholder="이미지 URL"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <input value={editForm.caption} onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })} placeholder="캡션"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <select value={editForm.layout} onChange={(e) => setEditForm({ ...editForm, layout: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm">
              <option value="cover">커버</option>
              <option value="content">내용</option>
              <option value="closing">마무리</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingCard(null)} className="px-3 py-1.5 text-sm text-zinc-500">취소</button>
              <button onClick={() => updateCard.mutate({ index: editingCard, ...editForm })}
                disabled={updateCard.isPending}
                className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50">
                {updateCard.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 flex-wrap border-t border-zinc-200 dark:border-zinc-700">
        {(series.status === 'draft' || series.status === 'rejected') && (
          <button onClick={() => submitSeries.mutate()} disabled={submitSeries.isPending}
            className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50">
            {submitSeries.isPending ? '요청 중...' : '승인 요청'}
          </button>
        )}
        {series.status === 'pending' && user?.role === 'admin' && (
          <>
            <button onClick={() => approveSeries.mutate()} disabled={approveSeries.isPending}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
              {approveSeries.isPending ? '승인 중...' : '승인'}
            </button>
            <div className="flex gap-1">
              <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="반려 사유"
                className="px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
              <button onClick={() => rejectSeries.mutate(rejectReason)} disabled={!rejectReason || rejectSeries.isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50">
                {rejectSeries.isPending ? '반려 중...' : '반려'}
              </button>
            </div>
          </>
        )}
        {series.status === 'draft' && (
          <button onClick={() => { if (confirm('이 시리즈를 삭제하시겠습니까?')) deleteSeries.mutate() }}
            className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">삭제</button>
        )}
      </div>
    </div>
  )
}
