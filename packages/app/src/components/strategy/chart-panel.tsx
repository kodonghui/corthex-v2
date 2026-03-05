import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, EmptyState, toast } from '@corthex/ui'
import { StockChart, type MarkerData } from './stock-chart'
import { NotesPanel } from './notes-panel'
import { ExportDialog } from './export-dialog'
import { BacktestPanel } from './backtest-panel'
import type { WatchlistItem } from './types'

type PriceData = {
  name: string
  price: number
  change: number
  changeRate: number
  open: number
  high: number
  low: number
  volume: number
  error?: boolean
}

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function isMarketOpen(): boolean {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const day = kst.getDay()
  if (day === 0 || day === 6) return false
  const minutes = kst.getHours() * 60 + kst.getMinutes()
  return minutes >= 540 && minutes <= 930
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function ChartPanel() {
  const [searchParams] = useSearchParams()
  const stockCode = searchParams.get('stock')
  const [failCount, setFailCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [marketOpen, setMarketOpen] = useState(isMarketOpen)
  const [exportOpen, setExportOpen] = useState(false)
  const [backtestOpen, setBacktestOpen] = useState(false)
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [backtestParams, setBacktestParams] = useState<{ shortPeriod: number; longPeriod: number } | null>(null)

  // Parse backtest URL params for auto-run
  const btType = searchParams.get('bt')
  const spRaw = Number(searchParams.get('sp'))
  const lpRaw = Number(searchParams.get('lp'))
  const autoBacktest = btType === 'ma' && !isNaN(spRaw) && !isNaN(lpRaw) && spRaw > 0 && lpRaw > 0 && spRaw < lpRaw

  useEffect(() => {
    const id = setInterval(() => setMarketOpen(isMarketOpen()), 60_000)
    return () => clearInterval(id)
  }, [])

  const { data: watchlist } = useQuery({
    queryKey: ['strategy-watchlist'],
    queryFn: () => api.get<{ data: WatchlistItem[] }>('/workspace/strategy/watchlist'),
  })
  const stock = watchlist?.data?.find((s) => s.stockCode === stockCode)

  const { data: priceRes, error: priceError } = useQuery({
    queryKey: ['strategy-prices', stockCode],
    queryFn: () => api.get<{ data: Record<string, PriceData> }>(`/workspace/strategy/prices?codes=${encodeURIComponent(stockCode!)}`),
    enabled: !!stockCode,
    refetchInterval: marketOpen ? 30_000 : false,
    refetchOnWindowFocus: true,
    retry: false,
  })

  const { data: chartRes, isLoading: chartLoading } = useQuery({
    queryKey: ['strategy-chart-data', stockCode],
    queryFn: () => api.get<{ data: { candles: Candle[] } }>(`/workspace/strategy/chart-data?code=${encodeURIComponent(stockCode!)}&count=60`),
    enabled: !!stockCode,
    staleTime: 5 * 60 * 1000,
  })

  const handleFocusRetry = useCallback(() => {
    if (failCount >= 3) setFailCount(0)
  }, [failCount])

  useEffect(() => {
    window.addEventListener('focus', handleFocusRetry)
    return () => window.removeEventListener('focus', handleFocusRetry)
  }, [handleFocusRetry])

  useEffect(() => {
    if (priceError) setFailCount((c) => c + 1)
    else if (priceRes) {
      setFailCount(0)
      setLastUpdated(new Date())
    }
  }, [priceRes, priceError])

  useEffect(() => {
    setFailCount(0)
    setLastUpdated(null)
    setMarkers([])
    setBacktestOpen(false)
    setBacktestParams(null)
  }, [stockCode])

  // Auto-open backtest panel when URL has backtest params
  useEffect(() => {
    if (autoBacktest && stockCode) {
      setBacktestOpen(true)
    }
  }, [autoBacktest, stockCode])

  const shareUrl = () => {
    const url = new URL(window.location.href)
    if (backtestOpen && backtestParams) {
      url.searchParams.set('bt', 'ma')
      url.searchParams.set('sp', String(backtestParams.shortPeriod))
      url.searchParams.set('lp', String(backtestParams.longPeriod))
    } else {
      url.searchParams.delete('bt')
      url.searchParams.delete('sp')
      url.searchParams.delete('lp')
    }
    navigator.clipboard.writeText(url.toString()).then(
      () => toast.success('공유 링크가 복사되었습니다'),
      () => toast.error('클립보드 복사에 실패했습니다'),
    )
  }

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

  const price = stockCode ? priceRes?.data?.[stockCode] : null
  const candles = chartRes?.data?.candles || []
  const hasError = price?.error || failCount >= 3

  const changeColor = price && !price.error
    ? price.changeRate > 0 ? 'text-emerald-500' : price.changeRate < 0 ? 'text-red-500' : 'text-zinc-400'
    : 'text-zinc-400'

  const changeSign = price && !price.error && price.changeRate > 0 ? '+' : ''

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-y-auto">
      <Card variant="bordered" className="shrink-0">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {stock.stockName}
              </h2>
              <span className="text-sm text-zinc-400">{stock.stockCode}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {stock.market}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setBacktestOpen(!backtestOpen)}>
                {backtestOpen ? '백테스트 닫기' : '백테스트'}
              </Button>
              <Button size="sm" variant="ghost" onClick={shareUrl}>공유</Button>
              <Button size="sm" variant="ghost" onClick={() => setExportOpen(true)}>내보내기</Button>
            </div>
          </div>

          {price && !price.error && (
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {formatPrice(price.price)}
              </span>
              <span className={`text-sm font-medium ${changeColor}`}>
                {changeSign}{formatPrice(price.change)} ({changeSign}{price.changeRate.toFixed(2)}%)
              </span>
            </div>
          )}

          {price && !price.error && (
            <div className="mt-2 flex gap-4 text-xs text-zinc-400">
              <span>시가 {formatPrice(price.open)}</span>
              <span>고가 <span className="text-emerald-500">{formatPrice(price.high)}</span></span>
              <span>저가 <span className="text-red-500">{formatPrice(price.low)}</span></span>
              <span>거래량 {formatVolume(price.volume)}</span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            {hasError && (
              <span className="text-amber-500">가격 정보를 불러올 수 없습니다</span>
            )}
            {!hasError && lastUpdated && (
              <span>마지막 갱신: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            )}
            {!marketOpen && <span className="text-zinc-500">장 마감</span>}
          </div>
        </div>
      </Card>

      <Card variant="bordered" className="min-h-[240px] h-[40vh]">
        {chartLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">차트 로딩 중...</p>
          </div>
        )}
        {!chartLoading && candles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">차트 데이터가 없습니다</p>
          </div>
        )}
        {!chartLoading && candles.length > 0 && (
          <StockChart candles={candles} markers={markers} className="w-full h-full" />
        )}
      </Card>

      {backtestOpen && (
        <BacktestPanel
          stockCode={stockCode}
          candles={candles}
          onMarkers={setMarkers}
          onParamsChange={setBacktestParams}
          initialShort={autoBacktest ? spRaw : undefined}
          initialLong={autoBacktest ? lpRaw : undefined}
          autoRun={autoBacktest}
        />
      )}

      <NotesPanel />

      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        stockCode={stockCode}
      />
    </div>
  )
}
