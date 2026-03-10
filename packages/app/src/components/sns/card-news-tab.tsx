import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { CardNewsDetail } from './card-news-detail'
import type { SnsContent, Agent, CardNewsCard } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS, PLATFORM_OPTIONS } from './sns-types'

interface CardNewsTabProps {
  agents: Agent[]
}

export function CardNewsTab({ agents }: CardNewsTabProps) {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual')

  // Manual create state
  const [seriesTitle, setSeriesTitle] = useState('')
  const [seriesDesc, setSeriesDesc] = useState('')
  const [seriesPlatform, setSeriesPlatform] = useState('instagram')
  const [cards, setCards] = useState<Array<{ imageUrl: string; caption: string; layout: CardNewsCard['layout'] }>>([
    { imageUrl: '', caption: '', layout: 'cover' },
    { imageUrl: '', caption: '', layout: 'content' },
    { imageUrl: '', caption: '', layout: 'closing' },
  ])

  // AI create state
  const [aiTopic, setAiTopic] = useState('')
  const [aiPlatform, setAiPlatform] = useState('instagram')
  const [aiCardCount, setAiCardCount] = useState(5)
  const [aiAgentId, setAiAgentId] = useState('')

  const { data: listData } = useQuery({
    queryKey: ['sns', 'cardnews'],
    queryFn: () => api.get<{ data: SnsContent[] }>('/workspace/sns?isCardNews=true'),
  })

  const createSeries = useMutation({
    mutationFn: (data: { title: string; description: string; platform: string; cards: typeof cards }) =>
      api.post<{ data: SnsContent }>('/workspace/sns/card-series', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const generateSeries = useMutation({
    mutationFn: (data: { topic: string; platform: string; cardCount: number; agentId: string }) =>
      api.post<{ data: SnsContent }>('/workspace/sns/card-series/generate', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['sns'] })
      setSelectedId(res.data.id)
      setView('detail')
    },
  })

  const seriesList = (listData?.data || []).filter((c) => c.isCardNews && c.cardIndex == null)

  const addCard = () => {
    if (cards.length >= 10) return
    setCards([...cards, { imageUrl: '', caption: '', layout: 'content' }])
  }

  const removeCard = (idx: number) => {
    if (cards.length <= 1) return
    setCards(cards.filter((_, i) => i !== idx))
  }

  const updateCard = (idx: number, field: string, value: string) => {
    setCards(cards.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const moveCard = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= cards.length) return
    const next = [...cards]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    setCards(next)
  }

  // --- DETAIL ---
  if (view === 'detail' && selectedId) {
    return <CardNewsDetail seriesId={selectedId} onBack={() => { setView('list'); setSelectedId(null) }} />
  }

  // --- CREATE ---
  if (view === 'create') {
    return (
      <div data-testid="sns-cardnews-create" className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-slate-400 hover:text-slate-200">← 목록으로</button>
        <h3 className="text-base font-semibold text-slate-50">카드뉴스 시리즈 만들기</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setCreateMode('manual')}
            className={`px-3 py-1.5 text-sm rounded-lg ${createMode === 'manual' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
            직접 작성
          </button>
          <button onClick={() => setCreateMode('ai')}
            className={`px-3 py-1.5 text-sm rounded-lg ${createMode === 'ai' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
            AI 자동 생성
          </button>
        </div>

        {createMode === 'manual' && (
          <>
            <input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} placeholder="시리즈 제목"
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-slate-300" />
            <input value={seriesDesc} onChange={(e) => setSeriesDesc(e.target.value)} placeholder="시리즈 설명 (선택)"
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-slate-300" />
            <select value={seriesPlatform} onChange={(e) => setSeriesPlatform(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-300">
              {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">카드 목록 ({cards.length}/10)</h4>
                <button onClick={addCard} disabled={cards.length >= 10}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
                  + 카드 추가
                </button>
              </div>

              {cards.map((card, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">카드 {idx + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveCard(idx, -1)} disabled={idx === 0}
                        className="border border-slate-600 text-slate-400 text-xs px-1.5 py-0.5 rounded disabled:opacity-30">↑</button>
                      <button onClick={() => moveCard(idx, 1)} disabled={idx === cards.length - 1}
                        className="border border-slate-600 text-slate-400 text-xs px-1.5 py-0.5 rounded disabled:opacity-30">↓</button>
                      <button onClick={() => removeCard(idx)} disabled={cards.length <= 1}
                        className="border border-red-500/50 text-red-400 text-xs px-1.5 py-0.5 rounded disabled:opacity-30">삭제</button>
                    </div>
                  </div>
                  <input value={card.imageUrl} onChange={(e) => updateCard(idx, 'imageUrl', e.target.value)} placeholder="이미지 URL"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-300" />
                  <input value={card.caption} onChange={(e) => updateCard(idx, 'caption', e.target.value)} placeholder="캡션"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-300" />
                  <select value={card.layout} onChange={(e) => updateCard(idx, 'layout', e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-300">
                    <option value="cover">커버</option>
                    <option value="content">내용</option>
                    <option value="closing">마무리</option>
                  </select>
                </div>
              ))}
            </div>

            <button onClick={() => createSeries.mutate({ title: seriesTitle, description: seriesDesc, platform: seriesPlatform, cards })}
              disabled={!seriesTitle || cards.length === 0 || createSeries.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50">
              {createSeries.isPending ? '생성 중...' : '시리즈 저장'}
            </button>
          </>
        )}

        {createMode === 'ai' && (
          <>
            <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="주제 (예: 2026 AI 마케팅 트렌드 5가지)"
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-slate-300" />
            <select value={aiPlatform} onChange={(e) => setAiPlatform(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-300">
              {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div>
              <label className="block text-xs text-slate-400 mb-1">카드 수 ({aiCardCount}장)</label>
              <input type="range" min={3} max={10} value={aiCardCount} onChange={(e) => setAiCardCount(Number(e.target.value))} className="w-full" />
            </div>
            <select value={aiAgentId} onChange={(e) => setAiAgentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-300">
              <option value="">에이전트 선택</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button onClick={() => generateSeries.mutate({ topic: aiTopic, platform: aiPlatform, cardCount: aiCardCount, agentId: aiAgentId })}
              disabled={!aiTopic || !aiAgentId || generateSeries.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50">
              {generateSeries.isPending ? 'AI 생성 중...' : 'AI로 카드뉴스 생성'}
            </button>
          </>
        )}
      </div>
    )
  }

  // --- LIST ---
  return (
    <div data-testid="sns-cardnews-tab" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">카드뉴스 시리즈 {seriesList.length}개</h3>
        <button onClick={() => setView('create')}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">
          + 새 시리즈
        </button>
      </div>

      {seriesList.length === 0 && (
        <div data-testid="sns-cardnews-empty" className="text-center py-16">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-sm text-slate-400">카드뉴스 시리즈가 없습니다</p>
          <p className="text-xs text-slate-500">새 시리즈를 만들어 멀티 이미지 콘텐츠를 관리해보세요.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesList.map((item) => {
          const meta = item.metadata as Record<string, unknown> | null
          const cardsData = (meta?.cards as CardNewsCard[]) || []
          const totalCards = (meta?.totalCards as number) || cardsData.length
          const coverCard = cardsData.find((c) => c.layout === 'cover') || cardsData[0]

          return (
            <div key={item.id}
              data-testid={`sns-cardnews-item-${item.id}`}
              onClick={() => { setSelectedId(item.id); setView('detail') }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-orange-500 transition-all">
              {coverCard?.imageUrl ? (
                <img src={coverCard.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">이미지 없음</div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  <span className="text-[10px] text-slate-400">{totalCards}장</span>
                </div>
                <h4 className="text-sm font-medium text-slate-100 truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString('ko')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
