import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { EmptyState } from '@corthex/ui'
import { ChatArea } from '../chat/chat-area'
import type { Agent } from '../chat/types'

const QUICK_ACTIONS = [
  'Analyze Trend',
  'Risk/Reward',
] as const

type StrategySession = {
  id: string
  agentId: string
  agentName: string
  title: string
  metadata: { stockCode?: string; stockName?: string } | null
}

export function ChatPanel() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const stockCode = searchParams.get('stock')

  const { data: watchlist } = useQuery({
    queryKey: ['strategy-watchlist'],
    queryFn: () => api.get<{ data: { stockCode: string; stockName: string }[] }>('/workspace/strategy/watchlist'),
  })
  const stockName = watchlist?.data?.find((s) => s.stockCode === stockCode)?.stockName

  // 전략 채팅 세션 조회
  const { data: sessionRes, isLoading } = useQuery({
    queryKey: ['strategy-chat-session'],
    queryFn: () => api.get<{ data: StrategySession | null }>('/workspace/strategy/chat/session'),
  })
  const session = sessionRes?.data

  const createSession = useMutation({
    mutationFn: (body: { stockCode?: string; stockName?: string }) =>
      api.post<{ data: StrategySession }>('/workspace/strategy/chat/sessions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-chat-session'] })
    },
  })

  const updateContext = useMutation({
    mutationFn: ({ sessionId, stockCode, stockName }: { sessionId: string; stockCode: string; stockName?: string }) =>
      api.patch(`/workspace/strategy/chat/sessions/${sessionId}/context`, { stockCode, stockName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-chat-session'] })
    },
  })

  // 세션 없으면 자동 생성
  useEffect(() => {
    if (!isLoading && !session && !createSession.isPending) {
      createSession.mutate({ stockCode: stockCode || undefined, stockName: stockName || undefined })
    }
  }, [isLoading, session, createSession.isPending, stockCode, stockName])

  // 종목 변경 시 세션 컨텍스트 업데이트
  useEffect(() => {
    if (session?.id && stockCode && session.metadata?.stockCode !== stockCode) {
      updateContext.mutate({ sessionId: session.id, stockCode, stockName })
    }
  }, [stockCode, stockName, session?.id, session?.metadata?.stockCode])

  if (isLoading || createSession.isPending) {
    return (
      <div className="flex items-center justify-center h-full border-l border-zinc-200">
        <p className="text-sm text-zinc-400">채팅 준비 중...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full border-l border-zinc-200">
        <EmptyState
          title="전략 에이전트와 대화하세요"
          description="투자 전략, 종목 분석, 시장 동향에 대해 질문해보세요"
        />
      </div>
    )
  }

  const agent: Agent = {
    id: session.agentId,
    name: session.agentName || '전략 에이전트',
    role: '재무 에이전트',
    status: 'online',
    isSecretary: false,
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ChatArea agent={agent} sessionId={session.id} />
      </div>
      {/* Quick Action Buttons — Stitch layout */}
      <div className="flex-none px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="whitespace-nowrap px-3 py-1 bg-stone-200/50 hover:bg-stone-200 text-xs text-stone-500 rounded-full transition-colors border border-stone-200"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
