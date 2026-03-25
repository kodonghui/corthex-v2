import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, Button, EmptyState, Input, Modal, toast, Badge, Select } from '@corthex/ui'

type Holding = {
  ticker: string
  name: string
  market: string
  quantity: number
  avgPrice: number
  currentPrice?: number
}

type Portfolio = {
  id: string
  name: string
  tradingMode: 'real' | 'paper'
  initialCash: number
  cashBalance: number
  holdings: Holding[]
  totalValue: number
  memo: string | null
  createdAt: string
  updatedAt: string
}

type TradingStatus = {
  tradingMode: 'real' | 'paper'
  kisAvailable: boolean
  account: string | null
  activeMode: string
}

type PriceData = {
  price: number
  change: number
  changeRate: number
}

function formatKRW(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`
  return n.toLocaleString('ko-KR')
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

export function PortfolioDashboard() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createCash, setCreateCash] = useState('50000000')
  const [createMode, setCreateMode] = useState<'paper' | 'real'>('paper')

  const { data: statusRes } = useQuery({
    queryKey: ['strategy-trading-status'],
    queryFn: () => api.get<{ data: TradingStatus }>('/workspace/strategy/trading-status'),
    staleTime: 30_000,
  })

  const currentMode = statusRes?.data?.tradingMode ?? 'paper'

  const { data: portfoliosRes, isLoading } = useQuery({
    queryKey: ['strategy-portfolios'],
    queryFn: () => api.get<{ data: Portfolio[] }>('/workspace/strategy/portfolios'),
  })

  const portfolios = portfoliosRes?.data ?? []
  const modePortfolios = useMemo(() =>
    portfolios.filter((p) => p.tradingMode === currentMode),
    [portfolios, currentMode],
  )

  // Collect all tickers from holdings for price fetching
  const allTickers = useMemo(() => {
    const tickers = new Set<string>()
    modePortfolios.forEach((p) => p.holdings.forEach((h) => tickers.add(h.ticker)))
    return Array.from(tickers)
  }, [modePortfolios])

  const { data: pricesRes } = useQuery({
    queryKey: ['strategy-prices', allTickers.join(',')],
    queryFn: () => api.get<{ data: Record<string, PriceData> }>(`/workspace/strategy/prices?codes=${encodeURIComponent(allTickers.join(','))}`),
    enabled: allTickers.length > 0,
    refetchInterval: 60_000,
  })

  const prices = pricesRes?.data ?? {}

  const createPortfolio = useMutation({
    mutationFn: (body: { name: string; initialCash: number; tradingMode: string }) =>
      api.post('/workspace/strategy/portfolios', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
      setShowCreate(false)
      setCreateName('')
      setCreateCash('50000000')
      setCreateMode('paper')
      toast.success('포트폴리오가 생성되었습니다')
    },
    onError: () => toast.error('포트폴리오 생성에 실패했습니다'),
  })

  const handleCreate = () => {
    const cash = parseInt(createCash, 10)
    if (!createName.trim() || isNaN(cash) || cash <= 0) {
      toast.error('이름과 초기자금을 올바르게 입력해주세요')
      return
    }
    createPortfolio.mutate({ name: createName.trim(), initialCash: cash, tradingMode: createMode })
  }

  if (isLoading) {
    return (
      <Card variant="bordered" className="p-4">
        <p className="text-sm text-corthex-text-disabled">포트폴리오 로딩 중...</p>
      </Card>
    )
  }

  if (modePortfolios.length === 0) {
    return (
      <>
        <Card variant="bordered">
          <EmptyState
            title="포트폴리오를 생성하세요"
            description={`${currentMode === 'real' ? '실거래' : '모의거래'} 포트폴리오가 없습니다. 새 포트폴리오를 만들어보세요.`}
            action={<Button onClick={() => setShowCreate(true)}>포트폴리오 생성</Button>}
          />
        </Card>
        <CreateModal
          show={showCreate}
          onClose={() => setShowCreate(false)}
          name={createName}
          setName={setCreateName}
          cash={createCash}
          setCash={setCreateCash}
          mode={createMode}
          setMode={setCreateMode}
          onSubmit={handleCreate}
          isPending={createPortfolio.isPending}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {modePortfolios.map((portfolio) => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} prices={prices} />
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
          + 포트폴리오 추가
        </Button>
      </div>
      <CreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        name={createName}
        setName={setCreateName}
        cash={createCash}
        setCash={setCreateCash}
        mode={createMode}
        setMode={setCreateMode}
        onSubmit={handleCreate}
        isPending={createPortfolio.isPending}
      />
    </>
  )
}

function PortfolioCard({ portfolio, prices }: { portfolio: Portfolio; prices: Record<string, PriceData> }) {
  const [expanded, setExpanded] = useState(false)

  // Calculate live total value from holdings + current prices
  const { liveTotal, holdingsValue } = useMemo(() => {
    let holdingsVal = 0
    for (const h of portfolio.holdings) {
      const p = prices[h.ticker]
      const currentPrice = p?.price ?? h.currentPrice ?? h.avgPrice
      holdingsVal += currentPrice * h.quantity
    }
    return { liveTotal: portfolio.cashBalance + holdingsVal, holdingsValue: holdingsVal }
  }, [portfolio, prices])

  const totalReturn = portfolio.initialCash > 0
    ? ((liveTotal - portfolio.initialCash) / portfolio.initialCash * 100)
    : 0

  const returnColor = totalReturn > 0 ? 'text-emerald-500' : totalReturn < 0 ? 'text-red-500' : 'text-corthex-text-disabled'
  const returnSign = totalReturn > 0 ? '+' : ''

  return (
    <Card variant="bordered">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-corthex-text-primary">{portfolio.name}</h3>
            <Badge variant={portfolio.tradingMode === 'real' ? 'error' : 'info'}>
              {portfolio.tradingMode === 'real' ? '실거래' : '모의거래'}
            </Badge>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-corthex-text-disabled hover:text-corthex-text-secondary"
          >
            {expanded ? '접기' : '펼치기'}
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] text-corthex-text-disabled mb-0.5">현금</p>
            <p className="text-sm font-mono font-medium text-corthex-text-primary">{formatKRW(portfolio.cashBalance)}</p>
          </div>
          <div>
            <p className="text-[10px] text-corthex-text-disabled mb-0.5">보유종목</p>
            <p className="text-sm font-mono font-medium text-corthex-text-primary">{portfolio.holdings.length}종목</p>
          </div>
          <div>
            <p className="text-[10px] text-corthex-text-disabled mb-0.5">총 평가</p>
            <p className="text-sm font-mono font-medium text-corthex-text-primary">{formatKRW(liveTotal)}</p>
          </div>
          <div>
            <p className="text-[10px] text-corthex-text-disabled mb-0.5">수익률</p>
            <p className={`text-sm font-mono font-medium ${returnColor}`}>{returnSign}{totalReturn.toFixed(2)}%</p>
          </div>
        </div>

        {/* Holdings table */}
        {expanded && portfolio.holdings.length > 0 && (
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-corthex-text-disabled">
                  <th className="text-left font-normal pb-1">종목</th>
                  <th className="text-right font-normal pb-1">수량</th>
                  <th className="text-right font-normal pb-1">매입가</th>
                  <th className="text-right font-normal pb-1">현재가</th>
                  <th className="text-right font-normal pb-1">수익률</th>
                  <th className="text-right font-normal pb-1">비중</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => {
                  const p = prices[h.ticker]
                  const currentPrice = p?.price ?? h.currentPrice ?? h.avgPrice
                  const holdingReturn = h.avgPrice > 0 ? ((currentPrice - h.avgPrice) / h.avgPrice * 100) : 0
                  const holdingValue = currentPrice * h.quantity
                  const weight = liveTotal > 0 ? (holdingValue / liveTotal * 100) : 0
                  const hReturnColor = holdingReturn > 0 ? 'text-emerald-500' : holdingReturn < 0 ? 'text-red-500' : 'text-corthex-text-disabled'

                  return (
                    <tr key={h.ticker} className="border-t border-zinc-50">
                      <td className="py-1.5 text-corthex-text-primary">
                        <div>{h.name}</div>
                        <div className="text-corthex-text-disabled text-[10px]">{h.ticker}</div>
                      </td>
                      <td className="py-1.5 text-right font-mono text-corthex-text-primary">{h.quantity}</td>
                      <td className="py-1.5 text-right font-mono text-corthex-text-primary">{formatPrice(h.avgPrice)}</td>
                      <td className="py-1.5 text-right font-mono text-corthex-text-primary">{formatPrice(currentPrice)}</td>
                      <td className={`py-1.5 text-right font-mono ${hReturnColor}`}>
                        {holdingReturn > 0 ? '+' : ''}{holdingReturn.toFixed(2)}%
                      </td>
                      <td className="py-1.5 text-right font-mono text-corthex-text-disabled">{weight.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {expanded && portfolio.holdings.length === 0 && (
          <p className="mt-3 text-xs text-corthex-text-disabled text-center py-2 border-t border-zinc-100">
            보유 종목이 없습니다
          </p>
        )}
      </div>
    </Card>
  )
}

function CreateModal({
  show, onClose, name, setName, cash, setCash, mode, setMode, onSubmit, isPending,
}: {
  show: boolean
  onClose: () => void
  name: string
  setName: (v: string) => void
  cash: string
  setCash: (v: string) => void
  mode: 'paper' | 'real'
  setMode: (v: 'paper' | 'real') => void
  onSubmit: () => void
  isPending: boolean
}) {
  if (!show) return null

  return (
    <Modal isOpen={show} onClose={onClose} title="포트폴리오 생성">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-corthex-text-secondary mb-1 block">포트폴리오 이름</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 한국 주식 포트폴리오" />
        </div>
        <div>
          <label className="text-xs font-medium text-corthex-text-secondary mb-1 block">초기 자금 (KRW)</label>
          <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="50000000" />
          <p className="text-[10px] text-corthex-text-disabled mt-1">
            {!isNaN(parseInt(cash, 10)) && parseInt(cash, 10) > 0 ? formatKRW(parseInt(cash, 10)) + '원' : ''}
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-corthex-text-secondary mb-1 block">거래 모드</label>
          <Select
            value={mode}
            onChange={(e) => setMode((e as React.ChangeEvent<HTMLSelectElement>).target.value as 'paper' | 'real')}
            options={[
              { value: 'paper', label: '모의거래' },
              { value: 'real', label: '실거래' },
            ]}
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button onClick={onSubmit} disabled={isPending}>{isPending ? '생성 중...' : '생성'}</Button>
        </div>
      </div>
    </Modal>
  )
}
