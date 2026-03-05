import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, EmptyState } from '@corthex/ui'

type WatchlistItem = {
  id: string
  stockCode: string
  stockName: string
  market: string
}

export function ChartPanel() {
  const [searchParams] = useSearchParams()
  const stockCode = searchParams.get('stock')

  const { data } = useQuery({
    queryKey: ['strategy-watchlist'],
    queryFn: () => api.get<{ data: WatchlistItem[] }>('/workspace/strategy/watchlist'),
  })

  const stock = data?.data?.find((s) => s.stockCode === stockCode)

  if (!stockCode || !stock) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          title="종목을 선택해주세요"
          description="왼쪽 목록에서 관심 종목을 선택하면 차트가 표시됩니다"
        />
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <Card variant="bordered" className="flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {stock.stockName}
            </h2>
            <span className="text-sm text-zinc-400">{stock.stockCode}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {stock.market}
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="text-center text-zinc-400">
            <div className="text-4xl mb-3">📈</div>
            <p className="text-sm">차트 준비 중</p>
            <p className="text-xs mt-1 text-zinc-400/70">실시간 차트는 다음 업데이트에서 제공됩니다</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
