import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Select } from '@corthex/ui'
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
      <div className="max-w-2xl space-y-4">
        <button onClick={() => setView('list')} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← 목록으로</button>
        <h3 className="text-base font-semibold">카드뉴스 시리즈 만들기</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setCreateMode('manual')}
            className={`px-3 py-1 text-sm rounded ${createMode === 'manual' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'text-zinc-500'}`}>
            직접 작성
          </button>
          <button onClick={() => setCreateMode('ai')}
            className={`px-3 py-1 text-sm rounded ${createMode === 'ai' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'text-zinc-500'}`}>
            AI 자동 생성
          </button>
        </div>

        {createMode === 'manual' && (
          <>
            <input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} placeholder="시리즈 제목"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <input value={seriesDesc} onChange={(e) => setSeriesDesc(e.target.value)} placeholder="시리즈 설명 (선택)"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <Select value={seriesPlatform} onChange={(e) => setSeriesPlatform(e.target.value)} options={PLATFORM_OPTIONS} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">카드 목록 ({cards.length}/10)</h4>
                <button onClick={addCard} disabled={cards.length >= 10}
                  className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
                  + 카드 추가
                </button>
              </div>

              {cards.map((card, idx) => (
                <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">카드 {idx + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveCard(idx, -1)} disabled={idx === 0}
                        className="px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded disabled:opacity-30">↑</button>
                      <button onClick={() => moveCard(idx, 1)} disabled={idx === cards.length - 1}
                        className="px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded disabled:opacity-30">↓</button>
                      <button onClick={() => removeCard(idx)} disabled={cards.length <= 1}
                        className="px-1.5 py-0.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-30">삭제</button>
                    </div>
                  </div>
                  <input value={card.imageUrl} onChange={(e) => updateCard(idx, 'imageUrl', e.target.value)} placeholder="이미지 URL"
                    className="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
                  <input value={card.caption} onChange={(e) => updateCard(idx, 'caption', e.target.value)} placeholder="캡션"
                    className="w-full px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
                  <select value={card.layout} onChange={(e) => updateCard(idx, 'layout', e.target.value)}
                    className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800">
                    <option value="cover">커버</option>
                    <option value="content">내용</option>
                    <option value="closing">마무리</option>
                  </select>
                </div>
              ))}
            </div>

            <button onClick={() => createSeries.mutate({ title: seriesTitle, description: seriesDesc, platform: seriesPlatform, cards })}
              disabled={!seriesTitle || cards.length === 0 || createSeries.isPending}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50">
              {createSeries.isPending ? '생성 중...' : '시리즈 저장'}
            </button>
          </>
        )}

        {createMode === 'ai' && (
          <>
            <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="주제 (예: 2026 AI 마케팅 트렌드 5가지)"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <Select value={aiPlatform} onChange={(e) => setAiPlatform(e.target.value)} options={PLATFORM_OPTIONS} />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">카드 수 ({aiCardCount}장)</label>
              <input type="range" min={3} max={10} value={aiCardCount} onChange={(e) => setAiCardCount(Number(e.target.value))} className="w-full" />
            </div>
            <Select value={aiAgentId} onChange={(e) => setAiAgentId(e.target.value)}
              placeholder="에이전트 선택" options={agents.map((a) => ({ value: a.id, label: a.name }))} />
            <button onClick={() => generateSeries.mutate({ topic: aiTopic, platform: aiPlatform, cardCount: aiCardCount, agentId: aiAgentId })}
              disabled={!aiTopic || !aiAgentId || generateSeries.isPending}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50">
              {generateSeries.isPending ? 'AI 생성 중...' : 'AI로 카드뉴스 생성'}
            </button>
          </>
        )}
      </div>
    )
  }

  // --- LIST ---
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500">카드뉴스 시리즈 {seriesList.length}개</h3>
        <button onClick={() => setView('create')} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">
          + 새 시리즈
        </button>
      </div>

      {seriesList.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-sm">카드뉴스 시리즈가 없습니다.</p>
          <p className="text-xs mt-1">새 시리즈를 만들어 멀티 이미지 콘텐츠를 관리해보세요.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {seriesList.map((item) => {
          const meta = item.metadata as Record<string, unknown> | null
          const cardsData = (meta?.cards as CardNewsCard[]) || []
          const totalCards = (meta?.totalCards as number) || cardsData.length
          const coverCard = cardsData.find((c) => c.layout === 'cover') || cardsData[0]

          return (
            <div key={item.id}
              onClick={() => { setSelectedId(item.id); setView('detail') }}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all">
              {coverCard?.imageUrl ? (
                <img src={coverCard.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm">이미지 없음</div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  <span className="text-[10px] text-zinc-400">{totalCards}장</span>
                </div>
                <h4 className="text-sm font-medium truncate">{item.title}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString('ko')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
