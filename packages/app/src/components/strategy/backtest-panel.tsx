import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, ConfirmDialog, toast } from '@corthex/ui'
import { runMaCrossover, type BacktestResult, type Signal } from './backtest-engine'
import type { MarkerData } from './stock-chart'

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type SavedBacktest = {
  id: string
  stockCode: string
  strategyType: string
  strategyParams: { shortPeriod: number; longPeriod: number }
  signals: Signal[]
  metrics: { totalReturn: number; tradeCount: number; winRate: number; maxDrawdown: number }
  dataRange: string | null
  createdAt: string
}

interface BacktestPanelProps {
  stockCode: string
  candles: Candle[]
  onMarkers: (markers: MarkerData[]) => void
  onParamsChange?: (params: { shortPeriod: number; longPeriod: number } | null) => void
  initialShort?: number
  initialLong?: number
  autoRun?: boolean
}

export function BacktestPanel({ stockCode, candles, onMarkers, onParamsChange, initialShort, initialLong, autoRun }: BacktestPanelProps) {
  const queryClient = useQueryClient()
  const [shortPeriod, setShortPeriod] = useState(initialShort ?? 5)
  const [longPeriod, setLongPeriod] = useState(initialLong ?? 20)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Auto-run backtest when opened from shared URL (once only)
  const autoRanRef = useRef(false)
  useEffect(() => {
    if (autoRun && initialShort && initialLong && candles.length > 0 && !autoRanRef.current) {
      autoRanRef.current = true
      const res = runMaCrossover(candles, initialShort, initialLong)
      setResult(res)
      onMarkers(res.signals.map((s) => ({ time: s.date, type: s.type })))
      onParamsChange?.({ shortPeriod: initialShort, longPeriod: initialLong })
    }
  }, [autoRun, initialShort, initialLong, candles, onMarkers, onParamsChange])

  const { data: savedRes } = useQuery({
    queryKey: ['strategy-backtest', stockCode],
    queryFn: () => api.get<{ data: SavedBacktest[] }>(`/workspace/strategy/backtest-results?stockCode=${encodeURIComponent(stockCode)}`),
    enabled: !!stockCode,
  })
  const savedList = savedRes?.data ?? []

  const saveMutation = useMutation({
    mutationFn: (body: unknown) => api.post('/workspace/strategy/backtest-results', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-backtest', stockCode] })
      toast.success('백테스트 결과가 저장되었습니다')
    },
    onError: () => toast.error('저장에 실패했습니다'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/strategy/backtest-results/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-backtest', stockCode] })
      toast.success('백테스트가 삭제되었습니다')
      setDeleteTarget(null)
    },
    onError: () => toast.error('삭제에 실패했습니다'),
  })

  const runBacktest = () => {
    if (shortPeriod < 2 || longPeriod < 3 || shortPeriod >= longPeriod) {
      toast.error('단기 MA(2 이상)는 장기 MA(3 이상)보다 작아야 합니다')
      return
    }
    const res = runMaCrossover(candles, shortPeriod, longPeriod)
    setResult(res)
    onMarkers(res.signals.map((s) => ({ time: s.date, type: s.type })))
    onParamsChange?.({ shortPeriod, longPeriod })
  }

  const saveResult = () => {
    if (!result) return
    const dataRange = candles.length > 0
      ? `${candles[0].time}~${candles[candles.length - 1].time}`
      : undefined
    saveMutation.mutate({
      stockCode,
      strategyType: 'ma_crossover',
      strategyParams: { shortPeriod, longPeriod },
      signals: result.signals,
      metrics: result.metrics,
      dataRange,
    })
  }

  const loadSaved = (item: SavedBacktest) => {
    setResult({ signals: item.signals, metrics: item.metrics })
    setShortPeriod(item.strategyParams.shortPeriod)
    setLongPeriod(item.strategyParams.longPeriod)
    onMarkers(item.signals.map((s) => ({ time: s.date, type: s.type })))
    onParamsChange?.({ shortPeriod: item.strategyParams.shortPeriod, longPeriod: item.strategyParams.longPeriod })
  }

  const clearResult = () => {
    setResult(null)
    onMarkers([])
    onParamsChange?.(null)
  }

  const returnColor = (v: number) => v > 0 ? 'text-emerald-500' : v < 0 ? 'text-red-500' : 'text-zinc-400'
  const returnSign = (v: number) => v > 0 ? '+' : ''

  return (
    <Card variant="bordered" className="shrink-0">
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">백테스트</h3>
          {result && (
            <button
              onClick={clearResult}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              초기화
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="flex items-end gap-3 flex-wrap">
          <label className="space-y-1">
            <span className="text-xs text-zinc-500">단기 MA</span>
            <input
              type="number"
              min={2}
              max={50}
              value={shortPeriod}
              onChange={(e) => setShortPeriod(Number(e.target.value))}
              className="block w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-zinc-500">장기 MA</span>
            <input
              type="number"
              min={5}
              max={200}
              value={longPeriod}
              onChange={(e) => setLongPeriod(Number(e.target.value))}
              className="block w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
            />
          </label>
          <Button size="sm" onClick={runBacktest} disabled={candles.length === 0}>
            실행
          </Button>
        </div>

        {/* Result Summary */}
        {result && (
          <div className="border border-zinc-200 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-zinc-500">총 수익률</span>
                <div className={`font-semibold ${returnColor(result.metrics.totalReturn)}`}>
                  {returnSign(result.metrics.totalReturn)}{result.metrics.totalReturn}%
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500">거래 횟수</span>
                <div className="font-semibold text-zinc-900">{result.metrics.tradeCount}회</div>
              </div>
              <div>
                <span className="text-xs text-zinc-500">승률</span>
                <div className="font-semibold text-zinc-900">{result.metrics.winRate}%</div>
              </div>
              <div>
                <span className="text-xs text-zinc-500">최대 손실</span>
                <div className="font-semibold text-red-500">-{result.metrics.maxDrawdown}%</div>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={saveResult} disabled={saveMutation.isPending}>
              저장
            </Button>
          </div>
        )}

        {/* Saved List */}
        {savedList.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">저장된 백테스트 ({savedList.length})</span>
            {savedList.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => loadSaved(item)}
                onKeyDown={(e) => e.key === 'Enter' && loadSaved(item)}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-50 cursor-pointer text-sm min-h-[36px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 text-xs">
                    MA({item.strategyParams.shortPeriod}/{item.strategyParams.longPeriod})
                  </span>
                  <span className={`font-medium ${returnColor(item.metrics.totalReturn)}`}>
                    {returnSign(item.metrics.totalReturn)}{item.metrics.totalReturn}%
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(item.id)
                  }}
                  className="ml-2 shrink-0 text-zinc-400 hover:text-red-500 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                  title="삭제"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="백테스트 삭제"
        description="이 백테스트 결과를 삭제하시겠습니까?"
        confirmText="삭제"
        variant="danger"
      />
    </Card>
  )
}
